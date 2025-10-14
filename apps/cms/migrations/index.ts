import * as migration_20251014_033400 from './20251014_033400';

export const migrations = [
  {
    up: migration_20251014_033400.up,
    down: migration_20251014_033400.down,
    name: '20251014_033400'
  },
];
