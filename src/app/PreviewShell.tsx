import { useState } from "react"
import PhaserGameHost from "../runtime/phaser/PhaserGameHost"
import type { RuntimeSnapshot } from "../runtime/phaser/runtimeGameDefinition.types"
import { createIdleRuntimeSnapshot } from "../runtime/phaser/runtimeGameDefinition.types"
import { runtimeFoundationDefinition } from "./runtimeFoundationDefinition"

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
          definition={runtimeFoundationDefinition}
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
            <span className="slot-label">Dry-run Renderer</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Generated placeholder output</span>
            <span className="slot-status">— available</span>
          </li>
          <li>
            <span className="slot-label">Phaser runtime foundation</span>
            <span className="slot-status">— available (Phase 6.0)</span>
          </li>
          <li>
            <span className="slot-label">Runtime wiring to generated output</span>
            <span className="slot-status">— not yet (Phase 6.1)</span>
          </li>
          <li>
            <span className="slot-label">Playable Puni Sumo gameplay</span>
            <span className="slot-status">— not yet (Phase 6.2)</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default PreviewShell
