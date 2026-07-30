import PreviewShell from './PreviewShell'

function App() {
  return (
    <div className="forge-app">
      <header className="forge-header">
        <h1>Game's Camp / AI Game Forge</h1>
        <p className="forge-phase">Phase 6.2: Playable Puni Sumo</p>
      </header>

      <main className="forge-main">
        <p className="forge-notice">
          Puni Sumo is playable: drag to push, avoid the ring edge, and win the 60-second round.
          <br />
          Movement, opponent AI, push physics, ring-out/timeout judging, and the result screen are
          reusable Kit adapters and shared runtime scenes wired through the Recipe → Assembler
          Plan → generated definition → Phaser runtime pipeline, not hand-authored per-game
          gameplay code.
          <br />
          Visual/audio polish and custom overrides are not included yet (Phase 6.3).
        </p>

        <PreviewShell />
      </main>
    </div>
  )
}

export default App
