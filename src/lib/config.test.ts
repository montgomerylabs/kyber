import test from 'node:test';
import assert from 'node:assert/strict';
import {
  accents,
  resolveCrystal,
  buildCardFilename,
  buildDescription,
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

test('custom crystal colors round trip and normalize safely', () => {
  for (const crystal of ['#00e5ff', '#000000', '#ffffff'] as const) {
    const c = { ...defaultConfig, crystal };
    assert.deepEqual(parseConfig(serializeConfig(c)), c);
  }
  assert.equal(parseConfig('crystal=%23ABCDEF').crystal, '#abcdef');
  for (const value of ['#fff', '#12345678', '#zzzzzz', 'url(x)', 'custom']) {
    assert.equal(
      parseConfig(new URLSearchParams({ crystal: value }).toString()).crystal,
      'violet',
    );
  }
});

test('build card filenames keep the saber name readable and safe', () => {
  assert.equal(buildCardFilename('Afterglow'), 'Afterglow — KYBER.png');
  assert.equal(
    buildCardFilename('Ahsoka’s Light ✨'),
    'Ahsoka’s Light ✨ — KYBER.png',
  );
  assert.equal(
    buildCardFilename('Étoile du Soir'),
    'Étoile du Soir — KYBER.png',
  );
  for (const blank of ['', '   ', '...', '\u0000/\\:*?"<>|'])
    assert.equal(buildCardFilename(blank), 'Untitled — KYBER.png');
  assert.equal(buildCardFilename('.hidden.'), 'hidden — KYBER.png');
  assert.equal(
    buildCardFilename('Dark:  Star/Rising'),
    'Dark Star Rising — KYBER.png',
  );
  assert.ok(
    !/[/\\:*?"<>|\u0000-\u001f]/.test(buildCardFilename('a'.repeat(70))),
  );
});

test('custom crystal color and description reach rendering and exports', () => {
  const c = { ...defaultConfig, crystal: '#00e5ff' as const };
  assert.equal(resolveCrystal(c.crystal).color, '#00e5ff');
  assert.match(buildDescription(c), /Custom #00E5FF/);
  for (const preset of crystals)
    assert.equal(resolveCrystal(preset.id), preset);
});
