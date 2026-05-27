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
