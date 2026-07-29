# Baseline Audit

Date: 2026-07-29
Branch: `claude/game-completion-phase-6-xhq458` (created from `main`)
Baseline commit: `2f8cd0782992230e358614d6057f3abe28616ef6` (Merge pull request #24, Phase 5.5 custom layer + safety guard)
Node: v22.22.2 / npm: 10.9.7
Open PRs at audit time: none
Latest `main` CI run (`.github/workflows/ci.yml`, run #29 on `2f8cd07`): `completed` / `success`

This audit captures the state of the repository **before** any Phase 6.0 work, per
`Game-s-camp_Claude_Code_Completion_Master.md` section 11 ("baseline失敗は作業前からの失敗か、
今回の変更による失敗か分ける").

## Commands executed and results

| Command | Result | Notes |
|---|---|---|
| `npm ci` | OK | 33 packages installed; `npm audit` reports 3 vulnerabilities (1 low, 2 high) in existing devDependencies — pre-existing, not addressed by this phase (unrelated dependency upgrades are out of scope for Phase 6.0). |
| `npm run typecheck` | OK | `tsc -b --noEmit` clean. |
| `npm run validate:recipes` | OK | `[ok] GameRecipe: recipes/games/puni-sumo.recipe.json` |
| `npm run validate:kits` | OK | All 6 Kit manifests valid. |
| `npm run validate:kit-registry` | OK | No duplicate IDs, entry/testFixture paths resolve. |
| `npm run validate:template-registry` | OK | Template IDs + file references resolve. |
| `npm run validate:compatibility` | OK (with pre-existing warnings) | `[warn] RECIPE_OPTIONAL_KIT_NOT_FOUND: audio.softImpact.v1` and `visual.miniatureDiorama.v1` — expected; these optional Kits are not implemented until Phase 6.3. |
| `npm run plan:assembler` | OK (same warnings as above) | Regenerated `plans/puni-sumo.assembler-plan.{json,md}` with no diff against committed files. |
| `npm run render:dry-run` | OK | Regenerated `generated/games/puni-sumo/*` (GameScene.ts, TitleScene.ts, ResultScene.ts, gameConfig.ts, render-report.md placeholders) with no diff against committed files. |
| `npm run check:generated-custom-safety` | OK | `Result: OK — No issues found.` |
| `npm run generate:schemas` | OK | Regenerated `schemas/*.schema.json` with no diff against committed files. |
| `git status --porcelain` after regeneration | clean | Confirms `generated/` (via `render:dry-run`), `plans/` (via `plan:assembler`), `schemas/` (via `generate:schemas`), and `reports/generated-custom-safety.md` (via `check:generated-custom-safety`, which writes that file as a side effect) are all reproducible from source — no drift at baseline. This does not cover any other file under `reports/`, since no command regenerates them. |
| `npm run build` | OK | `tsc -b && vite build` → `dist/` produced, 143.18 kB JS bundle (46.27 kB gzip), build time ~223ms. |

No `npm run lint`, `npm run test`, or `npm run test:e2e` scripts exist yet at baseline
(confirmed absent from `package.json` and explicitly listed as "future commands, not runnable
yet" in `.github/copilot-instructions.md`).

## Known pre-existing documentation/code inconsistencies (from master instruction doc section 1)

Confirmed present at baseline, to be resolved starting Phase 6.0:

1. `AGENTS.md` and `.github/copilot-instructions.md` still declare Phase 5.5 and explicitly forbid Phaser/runtime/playable game work.
2. `src/app/App.tsx` still shows `Phase 5: Safe Template Renderer Dry Run` text, inconsistent with README's Phase 5.5.
3. `generated/games/puni-sumo/*.ts` are placeholder objects with string content only, not executable Phaser code.
4. `src/kits/**` Kit lifecycle hooks (`onCreate`/`onMount`/`onUpdate`/`onDispose`) are all no-ops; `KitDefinition.phase` is hardcoded to `"skeleton"`.
5. `src/runtime/**` (`GameRuntime.ts`, `SceneHost.ts`, `InputManager.ts`, `AssetManager.ts`, `RuntimeEvents.ts`) are state-type-only skeletons with no behavior.
6. `tsconfig.app.json` only includes `src`; `generated/` and `custom/` are not part of the TypeScript project graph yet.
7. No unit test runner, no e2e runner, no lint script configured.
8. `audio.softImpact.v1` and `visual.miniatureDiorama.v1` optional Kits referenced by the recipe do not exist in the Kit Registry (confirmed by the `validate:compatibility` warnings above).
9. No opponent-AI Kit/slot exists yet (`controller.puniOpponentAI.v1` is not present in `kits/` or the template's slot list).
10. `scripts/checkGeneratedCustomSafety.ts` performs safety checks against the currently known script set; it has not yet been hardened against arbitrary future generators (path traversal, symlink escape, absolute-path rejection are not yet unit tested).

## Conclusion

Baseline is green across all currently defined validation, generation, and build commands, and
generation is confirmed deterministic/reproducible (no working-tree diff after re-running
`plan:assembler`, `render:dry-run`, and `generate:schemas`). There are no pre-existing baseline
failures to separate from Phase 6.0 changes — any failure introduced from this point forward is
attributable to Phase 6.0 work.
