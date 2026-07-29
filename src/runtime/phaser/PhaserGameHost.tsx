import Phaser from "phaser"
import { useEffect, useRef, useState } from "react"
import { createPhaserConfig } from "./createPhaserConfig"
import { createPhaserGame } from "./createPhaserGame"
import { destroyPhaserGame } from "./destroyPhaserGame"
import {
  RUNTIME_ERROR_EVENT,
  RUNTIME_STATUS_EVENT,
  createIdleRuntimeSnapshot,
  type GeneratedGameDefinition,
  type RuntimeErrorInfo,
  type RuntimeSnapshot,
  type RuntimeStatus,
} from "./runtimeGameDefinition.types"

export type PhaserGameHostProps = {
  definition: GeneratedGameDefinition
  width?: number
  height?: number
  onStatusChange?: (snapshot: RuntimeSnapshot) => void
}

function statusMessage(status: RuntimeStatus, definition: GeneratedGameDefinition): string {
  switch (status) {
    case "idle":
      return "Runtime is not initialized yet."
    case "loading":
      return `Booting ${definition.title}...`
    case "ready":
      return "Title screen ready."
    case "playing":
      return "Round in progress."
    case "result":
      return "Round finished."
    case "error":
      return "Runtime failed to start."
  }
}

const DEFAULT_WIDTH = 720
const DEFAULT_HEIGHT = 1280

function PhaserGameHost({ definition, width, height, onStatusChange }: PhaserGameHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(createIdleRuntimeSnapshot())
  const [retryToken, setRetryToken] = useState(0)

  // Keeping the latest callback in a ref (instead of the effect's dependency array) means an
  // inline `onStatusChange={(s) => ...}` prop can't change identity on every emitted status and
  // retrigger the effect below, which would otherwise destroy and recreate the Phaser game in a
  // loading/ready reboot loop.
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let cancelled = false
    const updateSnapshot = (next: RuntimeSnapshot) => {
      if (cancelled) {
        return
      }
      setSnapshot(next)
      onStatusChangeRef.current?.(next)
    }

    // Defensive cleanup: guards against a stray canvas surviving a prior instance's
    // deferred `game.destroy()` (Phaser destroys on the *next* frame), so React
    // StrictMode's mount -> cleanup -> mount cycle never shows two canvases.
    container.replaceChildren()

    updateSnapshot({
      status: "loading",
      gameId: definition.gameId,
      message: statusMessage("loading", definition),
    })

    let game: Phaser.Game | null = null
    const handleStatus = (status: RuntimeStatus) => {
      updateSnapshot({ status, gameId: definition.gameId, message: statusMessage(status, definition) })
    }
    // Scene lifecycle callbacks (e.g. `create()`) run inside Phaser's own render loop, outside
    // the synchronous `try` block below. Scenes (via MiniActionBaseScene) catch their own errors
    // and re-emit them on `this.game.events`, which keeps a failure scoped to this exact Phaser
    // instance — unlike a page-wide `window` error listener, which would also catch unrelated
    // errors from React or any other mounted host.
    const handleSceneError = (error: RuntimeErrorInfo) => {
      updateSnapshot({
        status: "error",
        gameId: definition.gameId,
        message: statusMessage("error", definition),
        error,
      })
    }

    try {
      const config = createPhaserConfig({ parent: container, definition, width, height })
      game = createPhaserGame(config)
      gameRef.current = game
      game.events.on(RUNTIME_STATUS_EVENT, handleStatus)
      game.events.on(RUNTIME_ERROR_EVENT, handleSceneError)
    } catch (caught) {
      updateSnapshot({
        status: "error",
        gameId: definition.gameId,
        message: statusMessage("error", definition),
        error: { message: caught instanceof Error ? caught.message : String(caught), cause: caught },
      })
    }

    return () => {
      cancelled = true
      if (game) {
        game.events.off(RUNTIME_STATUS_EVENT, handleStatus)
        game.events.off(RUNTIME_ERROR_EVENT, handleSceneError)
      }
      destroyPhaserGame(gameRef.current)
      gameRef.current = null
    }
  }, [definition, width, height, retryToken])

  const aspectRatio = `${width ?? DEFAULT_WIDTH} / ${height ?? DEFAULT_HEIGHT}`

  return (
    <div className="phaser-game-host">
      <div
        ref={containerRef}
        className="phaser-game-host__canvas"
        data-runtime-status={snapshot.status}
        style={{ aspectRatio }}
      />
      {snapshot.status === "error" ? (
        <div className="phaser-game-host__error" role="alert">
          <p className="phaser-game-host__error-title">The game runtime failed to start.</p>
          <p className="phaser-game-host__error-detail">{snapshot.error?.message ?? snapshot.message}</p>
          <button type="button" onClick={() => setRetryToken((token) => token + 1)}>
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default PhaserGameHost
