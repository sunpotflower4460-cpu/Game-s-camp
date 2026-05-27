import PreviewShell from './PreviewShell'

function App() {
  return (
    <div className="forge-app">
      <header className="forge-header">
        <h1>Game's Camp / AI Game Forge</h1>
        <p className="forge-phase">Phase 2: Schema Foundations</p>
      </header>

      <main className="forge-main">
        <p className="forge-notice">
          This is not a game yet. This is the shell for the AI game forge.
        </p>

        <PreviewShell />
      </main>
    </div>
  )
}

export default App
