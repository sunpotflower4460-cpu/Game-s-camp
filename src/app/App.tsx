import PreviewShell from './PreviewShell'

function App() {
  return (
    <div className="forge-app">
      <header className="forge-header">
        <h1>Game's Camp / AI Game Forge</h1>
        <p className="forge-phase">Phase 5: Safe Template Renderer Dry Run</p>
      </header>

      <main className="forge-main">
        <p className="forge-notice">
          This is not a playable game yet.
          <br />
          This phase validates recipes, kits, templates, assembler plans, and dry-run generated files.
          <br />
          Phaser runtime wiring is not included yet.
        </p>

        <PreviewShell />
      </main>
    </div>
  )
}

export default App
