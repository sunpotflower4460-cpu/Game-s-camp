function PreviewShell() {
  return (
    <section className="preview-shell">
      <h2>Preview Shell</h2>
      <p className="runtime-status">Runtime status: <span className="status-badge">idle</span></p>

      <div className="game-runtime-placeholder">
        <p>Game runtime placeholder</p>
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
            <span className="slot-label">Runtime wiring</span>
            <span className="slot-status">— not yet</span>
          </li>
          <li>
            <span className="slot-label">Playable Phaser game</span>
            <span className="slot-status">— not yet</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default PreviewShell
