import PreviewShell from './PreviewShell'

function App() {
  return (
    <div className="forge-app">
      <header className="forge-header">
        <h1>Game's Camp / AI Game Forge</h1>
        <p className="forge-phase">Phase 6.0: Runtime Foundation</p>
      </header>

      <main className="forge-main">
        <p className="forge-notice">
          This is not a playable game yet.
          <br />
          This phase boots a Phaser runtime inside React with generic placeholder scenes and
          proves the mount / boot / destroy lifecycle.
          <br />
          Real generated content wiring (Phase 6.1) and playable Puni Sumo gameplay (Phase 6.2)
          are not included yet.
        </p>

        <PreviewShell />
      </main>
    </div>
  )
}

export default App
