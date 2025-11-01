import * as migration_20251101_140356 from './20251101_140356';

export const migrations = [
  {
    up: migration_20251101_140356.up,
    down: migration_20251101_140356.down,
    name: '20251101_140356'
  },
];
