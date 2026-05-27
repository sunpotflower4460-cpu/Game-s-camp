# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 1.
- Runtime placeholder files exist under `src/runtime/`.
- Vite + React + TypeScript app is available.
- Do not add Phaser yet.
- Do not implement Puni Sumo yet.
- Do not add GameRecipe validator, Kit Registry, or Assembler yet.

## Currently available commands

```txt
npm run dev
npm run build
npm run preview
npm run typecheck
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run test
npm run validate:recipes
npm run validate:kits
npm run test:e2e
```
