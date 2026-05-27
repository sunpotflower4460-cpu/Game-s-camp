# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Phase 0 focus

The first MVP validation target is **「ぷに相撲」 (Puni Sumo)**.

However, this PR is **Phase 0 foundation only**:

- No game runtime/app implementation yet.
- No Vite / React / Phaser setup yet.
- No package.json yet.

This phase only establishes shared rules and documents so AI can work consistently in later phases.

## Local development

```bash
npm install
npm run dev
```

Other available commands:

```bash
npm run build       # type-check and build for production
npm run preview     # preview the production build locally
npm run typecheck   # type-check without emitting files
```

## Current implementation phase

Phase 1 adds the minimal Vite + React + TypeScript forge shell.

This is not a game implementation yet.
Phaser, GameRecipe validation, Kit Registry, Assembler, and Puni Sumo are intentionally not included in this phase.
