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

As of Phase 2, GameRecipe and KitManifest schema validation is executable via CLI.
The full AI workflow pipeline (Assembler, Kit Registry compatibility, runtime wiring)
is not yet implemented.
