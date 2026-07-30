import { useState } from "react"
import PhaserGameHost from "../runtime/phaser/PhaserGameHost"
import type { SceneClass } from "../runtime/phaser/createPhaserConfig"
import type { RuntimeSnapshot } from "../runtime/phaser/runtimeGameDefinition.types"
import { createIdleRuntimeSnapshot } from "../runtime/phaser/runtimeGameDefinition.types"
import { GameScene } from "../../generated/games/puni-sumo/GameScene"
import { generatedGameDefinition } from "../../generated/games/puni-sumo/gameDefinition"
import { ResultScene } from "../../generated/games/puni-sumo/ResultScene"
import { TitleScene } from "../../generated/games/puni-sumo/TitleScene"

// Scene *classes*, not instances: Phaser instantiates each one fresh per `Phaser.Game`, which is
// required for React StrictMode's mount -> cleanup -> mount to work (a Scene instance carries
// internal state tied to the specific Game it was added to and cannot be reused across two).
// A module-level array is referentially stable across renders without needing useMemo.
const PUNI_SUMO_SCENES: SceneClass[] = [TitleScene, GameScene, ResultScene]

function PreviewShell() {
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<RuntimeSnapshot>(createIdleRuntimeSnapshot())

  return (
    <section className="preview-shell">
      <h2>Preview Shell</h2>
      <p className="runtime-status">
        Runtime status: <span className="status-badge">{runtimeSnapshot.status}</span>
      </p>

      <div className="phaser-game-host-frame">
        <PhaserGameHost
          definition={generatedGameDefinition}
          scenes={PUNI_SUMO_SCENES}
          width={390}
          height={640}
          onStatusChange={setRuntimeSnapshot}
        />
      </div>

      <div className="future-slots">
        <h3>Forge status</h3>
        <ul>
          <li>
            <span className="slot-label">GameRecipe</span>
            <span className="slot-status">— validated</span>
          </li>
          <li>
            <span className="slot-label">Kit Registry</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Template Registry</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Assembler Plan</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Generator (Recipe + Plan + Template → GeneratedGameDefinition)</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Phaser runtime foundation</span>
            <span className="slot-status">— available (Phase 6.0)</span>
          </li>
          <li>
            <span className="slot-label">Runtime wiring to generated output</span>
            <span className="slot-status">— available (Phase 6.1)</span>
          </li>
          <li>
            <span className="slot-label">Playable Puni Sumo gameplay</span>
            <span className="slot-status">— available (Phase 6.2)</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default PreviewShell
