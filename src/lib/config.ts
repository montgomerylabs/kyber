export const hilts = [
  {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'Balanced. Timeless. Unmistakable.',
    detail:
      'A considered balance of clean lines and precision-machined details.',
    length: '28.4',
    weight: '1.2',
  },
  {
    id: 'duelist',
    name: 'Duelist',
    description: 'Precision in every movement.',
    detail: 'A slender profile with a tapered neck. Made for a lighter touch.',
    length: '26.8',
    weight: '0.9',
  },
  {
    id: 'relic',
    name: 'Relic',
    description: 'A story in every detail.',
    detail:
      'A substantial silhouette, stepped collars, and the character of another era.',
    length: '30.2',
    weight: '1.5',
  },
] as const;
export const emitters = ['Crown', 'Shroud', 'Flared'] as const;
export const grips = ['Machined', 'Ribbed', 'Wrapped'] as const;
export const finishes = [
  { id: 'silver', name: 'Brushed silver', color: '#bfc2c5', roughness: 0.29 },
  { id: 'obsidian', name: 'Obsidian', color: '#303238', roughness: 0.26 },
  { id: 'bronze', name: 'Aged bronze', color: '#98774d', roughness: 0.46 },
] as const;
export const accents = [
  { id: 'brass', name: 'Brass', color: '#b69a65' },
  { id: 'crimson', name: 'Crimson', color: '#9a303c' },
  { id: 'graphite', name: 'Graphite', color: '#44464d' },
] as const;
export const crystals = [
  {
    id: 'blue',
    name: 'Blue',
    color: '#479eff',
    description: 'Clarity of purpose. Strength in action.',
  },
  {
    id: 'green',
    name: 'Green',
    color: '#68db9a',
    description: 'A quiet mind. A deeper connection.',
  },
  {
    id: 'violet',
    name: 'Violet',
    color: '#a78bfa',
    description: 'A presence all its own.',
  },
  {
    id: 'amber',
    name: 'Amber',
    color: '#ffbb50',
    description: 'A light beyond the familiar.',
  },
  {
    id: 'red',
    name: 'Red',
    color: '#ff5368',
    description: 'Uncompromising. Unforgettable.',
  },
] as const;
export type Config = {
  hilt: (typeof hilts)[number]['id'];
  emitter: (typeof emitters)[number];
  grip: (typeof grips)[number];
  finish: (typeof finishes)[number]['id'];
  accent: (typeof accents)[number]['id'];
  crystal: (typeof crystals)[number]['id'];
  name: string;
};
export const defaultConfig: Config = {
  hilt: 'sentinel',
  emitter: 'Crown',
  grip: 'Machined',
  finish: 'silver',
  accent: 'brass',
  crystal: 'violet',
  name: 'Afterglow',
};
export function parseConfig(search: string): Config {
  const p = new URLSearchParams(search);
  const c = { ...defaultConfig };
  const catalogs = {
    hilt: hilts.map((x) => x.id),
    emitter: emitters,
    grip: grips,
    finish: finishes.map((x) => x.id),
    accent: accents.map((x) => x.id),
    crystal: crystals.map((x) => x.id),
  };
  for (const [key, values] of Object.entries(catalogs)) {
    const v = p.get(key);
    if (v && (values as readonly string[]).includes(v))
      Object.assign(c, { [key]: v });
  }
  c.name =
    (p.get('name') || defaultConfig.name)
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, 32) || defaultConfig.name;
  return c;
}
export function serializeConfig(config: Config) {
  return new URLSearchParams({ v: '1', ...config }).toString();
}
export function buildDescription(c: Config) {
  return `${hilts.find((x) => x.id === c.hilt)!.name} / ${finishes.find((x) => x.id === c.finish)!.name} / ${crystals.find((x) => x.id === c.crystal)!.name}`;
}
