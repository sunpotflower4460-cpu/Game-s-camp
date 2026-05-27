# Kit Contracts

- Kit is a reusable game part.
- Kit must have a manifest in future phases.
- Kit should define id, name, category, engine, version, description, provides, requires, compatibleWith, tunables, invariants, entry, and optional testFixture.
- Kit must not secretly control unrelated systems.
- Controller Kit must not create win conditions.
- UI Kit must not alter physics.
- Rule Kit must not directly own rendering.
- New game-specific behavior should not become a Kit unless reusable.
