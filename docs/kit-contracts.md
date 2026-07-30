# Kit Contracts

- Kit is a reusable game part.
- Kit must have a manifest in future phases.
- Kit should define id, name, category, engine, version, description, provides, requires, compatibleWith, tunables, invariants, entry, and optional testFixture.
- Kit must not secretly control unrelated systems.
- Controller Kit must not create win conditions.
- UI Kit must not alter physics.
- Rule Kit must not directly own rendering.
- New game-specific behavior should not become a Kit unless reusable.

## Phase 4 note

Phase 4 keeps the Phase 3 Kit contract and registry validation behavior, while introducing separate Template Registry validation for template manifests/placeholders.
The schema source of truth is:
`src/forge/kit-registry/kitManifest.zod.ts`
The registry logic is:
`src/forge/kit-registry/loadKitRegistry.ts` and `src/forge/kit-registry/validateKitRegistry.ts`
The generated JSON Schema is:
`schemas/kitManifest.schema.json`
Runtime-neutral skeleton Kit files now live under `src/kits/`.

## Manifest rules

- `id` must follow `^[a-z]+(?:\\.[a-zA-Z]+)*\\.v[0-9]+$` (example: `controller.puniPush.v1`).
- `version` must follow semver-like format `x.y.z` with optional prerelease suffix.
- `tunables` are validated by `type`:
  - `number`: may define `default`, `min`, and `max`.
  - `string`: may define `default` (string only).
  - `boolean`: may define `default` (boolean only).
- `min` / `max` are not allowed for `string` and `boolean` tunables.

## Kit slot assignment

In Phase 4.5, Kits can be assigned to Template slots by category.
This is still a planning step.
The Kit is not executed and is not rendered into gameplay.

## Semantic slot assignment

Template slots may define `requiresProvides`.
When a slot defines `requiresProvides`, the Assembler must select a Kit whose manifest `provides` includes all required capabilities.
This prevents category-only mismatches such as assigning a timer UI kit to a result UI slot.

## Phase 6.1 KitProposal: controller.puniOpponentAI.v1

Puni Sumo needs a rival actor, so `template.miniAction.v1` gained a required `opponentController`
slot (`requiresProvides: ["opponentAI"]`). Following the Missing Kit Flow
(`docs/missing-kit-flow.md`), a new reusable Kit was proposed and added:

- id: `controller.puniOpponentAI.v1`
- category: `controller`
- provides: `["opponentAI"]`
- reusable: yes — any mini-action game with a rival/opponent actor can reuse it
- Phase 6.1 added only the manifest, registry entry, and a runtime-neutral skeleton
  (`src/kits/controllers/puniOpponentAI/`, `phase: "skeleton"`); Phase 6.2 promoted it to
  `phase: "runtime-ready"` with real chase-toward-player + edge-avoidance-near-ring-boundary
  steering, a periodic wobble, reaction-delay resampling, and a deterministic seed under the
  `VITE_E2E` debug hook.

`playerController` was tightened at the same time to `requiresProvides: ["playerMovement", "pushForce"]`,
which `controller.puniPush.v1` already satisfies.
