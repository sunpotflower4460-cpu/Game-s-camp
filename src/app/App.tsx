import PreviewShell from './PreviewShell'

function App() {
  return (
    <div className="forge-app">
      <header className="forge-header">
        <h1>Game's Camp / AI Game Forge</h1>
        <p className="forge-phase">Phase 6.1: Forge-to-Runtime Generation</p>
      </header>

      <main className="forge-main">
        <p className="forge-notice">
          This is not a playable game yet.
          <br />
          This phase boots the Phaser runtime with a real, generated game definition produced
          from the Recipe, Assembler Plan, and Template — not a hand-authored placeholder.
          <br />
          Playable Puni Sumo gameplay (Phase 6.2) is not included yet.
        </p>

        <PreviewShell />
      </main>
    </div>
  )
}

export default App
