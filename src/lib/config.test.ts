import test from 'node:test';
import assert from 'node:assert/strict';
import {
  accents,
  crystals,
  defaultConfig,
  emitters,
  finishes,
  grips,
  hilts,
  parseConfig,
  serializeConfig,
} from './config.ts';
test('all 1,215 combinations survive a shared-link round trip', () => {
  let count = 0;
  for (const hilt of hilts)
    for (const emitter of emitters)
      for (const grip of grips)
        for (const finish of finishes)
          for (const accent of accents)
            for (const crystal of crystals) {
              const c = {
                hilt: hilt.id,
                emitter,
                grip,
                finish: finish.id,
                accent: accent.id,
                crystal: crystal.id,
                name: 'Ahsoka’s light & shadow ✨',
              };
              assert.deepEqual(parseConfig(serializeConfig(c)), c);
              count++;
            }
  assert.equal(count, 1215);
});
test('unknown URL options fall back without breaking valid selections', () => {
  assert.deepEqual(
    parseConfig('?hilt=missing&emitter=Nope&finish=obsidian&crystal=green'),
    { ...defaultConfig, finish: 'obsidian', crystal: 'green' },
  );
});
test('names are bounded and empty names use a safe default', () => {
  assert.equal(
    parseConfig('?name=' + encodeURIComponent('a'.repeat(70))).name.length,
    32,
  );
  assert.equal(parseConfig('?name=%00%20').name, defaultConfig.name);
  assert.equal(parseConfig('').name, 'Afterglow');
});
