import * as migration_20260607_021411_initial from './20260607_021411_initial';

export const migrations = [
  {
    up: migration_20260607_021411_initial.up,
    down: migration_20260607_021411_initial.down,
    name: '20260607_021411_initial'
  },
];
