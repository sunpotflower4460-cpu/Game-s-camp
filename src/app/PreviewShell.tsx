function PreviewShell() {
  return (
    <section className="preview-shell">
      <h2>Preview Shell</h2>
      <p className="runtime-status">Runtime status: <span className="status-badge">idle</span></p>

      <div className="game-runtime-placeholder">
        <p>Game runtime placeholder</p>
      </div>

      <div className="future-slots">
        <h3>Future slots</h3>
        <ul>
          <li>
            <span className="slot-label">GameRecipe</span>
            <span className="slot-status">— schema only (Phase 2)</span>
          </li>
          <li>
            <span className="slot-label">Kit Registry</span>
            <span className="slot-status">— not connected</span>
          </li>
          <li>
            <span className="slot-label">Template Assembler</span>
            <span className="slot-status">— not connected</span>
          </li>
          <li>
            <span className="slot-label">Validation Report</span>
            <span className="slot-status">— not connected</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default PreviewShell
