# Kit Contracts

- Kit is a reusable game part.
- Kit must have a manifest in future phases.
- Kit should define id, name, category, engine, version, description, provides, requires, compatibleWith, tunables, invariants, entry, and optional testFixture.
- Kit must not secretly control unrelated systems.
- Controller Kit must not create win conditions.
- UI Kit must not alter physics.
- Rule Kit must not directly own rendering.
- New game-specific behavior should not become a Kit unless reusable.

## Phase 2 note

Phase 2 adds the first executable KitManifest schema and validator.
The schema source of truth is:
`src/forge/kit-registry/kitManifest.zod.ts`
The generated JSON Schema is:
`schemas/kitManifest.schema.json`
Entry file existence and compatibility checks are deferred to later phases.
