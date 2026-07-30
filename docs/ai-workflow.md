# AI Workflow

This document defines the intended operating flow for future implementation phases.

Human Request
↓
AI Planner
↓
GameRecipe
↓
Recipe Validator
↓
Kit Registry
↓
Kit Selector
↓
Template Assembler
↓
Generated Game
↓
Build / Test / Playwright
↓
Validation Report
↓
AI Repair Loop
↓
Human Playtest

## Phase note

As of Phase 5.5, GameRecipe/KitManifest/TemplateManifest schema validation, Kit/Template
Registry loading, recipe compatibility checks, Assembler Plan generation, safe dry-run
rendering, and the protected `custom/` layer are executable via CLI.

Phase 6.0 added the first piece of "Build / Test" from the diagram above: a Phaser runtime
foundation (`src/runtime/phaser/`, `src/runtime/scenes/`) that can mount, run, and destroy a
Phaser `Game` inside React, plus a `RuntimeKitRegistry` that resolves Kit IDs to runtime
adapters. At that point it did not yet consume real `generated/` output or run actual Puni Sumo
gameplay — it proved the mount/boot/destroy pipeline with generic placeholder scenes and a
Vitest smoke test. Phase 6.1 wired in real generated output, and Phase 6.2 made the gameplay
itself real (see `docs/future-directory-layout.md`).
