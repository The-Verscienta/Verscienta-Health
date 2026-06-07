/**
 * Test stub for the `@payload-config` alias.
 *
 * The real config (`./payload.config.ts`) wires up the DB adapter and every
 * collection, which is far too heavy — and requires a live environment — for
 * unit tests. Modules under test obtain Payload via `getPayload({ config })`,
 * which is mocked in tests, so the config value itself is never dereferenced.
 */
export default {}
