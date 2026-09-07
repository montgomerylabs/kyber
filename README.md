# KYBER — The lightsaber atelier

A premium, interactive lightsaber configurator built with **TanStack Start, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui**. Three.js and React Three Fiber render a modular 3D lightsaber with procedural studio lighting.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Requires Node.js 22.13 or newer.

## Verify

```sh
npm run typecheck
npm test
npm run build
```

TanStack Start prerenders the landing page and `/build` route into `dist/client` for static hosting. The 3D module loads after hydration. No database, accounts, API keys, or external model assets are required.

## Features

- Cinematic galactic landing page with animated atmosphere and an entrance transition.
- Dark charcoal and brass atelier theme.
- 1,215 combinations of hilt, emitter, grip, finish, accent, and crystal.
- Rotate, zoom, and inspect the exploded assembly.
- Crystal chamber reveal and cinematic blade ignition.
- Original synthesized ignition and hum; explicit audio interaction and mute.
- Named builds encoded in validated URL parameters.
- Portrait PNG cards captured from the actual configured WebGL model.
- Keyboard controls, modal focus management, reduced motion, and responsive layout.

Design decisions and acceptance criteria are in [docs/design.md](docs/design.md).

The downloadable card captures the current studio view. The configurations are digital concepts, not manufacturing specifications. Shared links require the recipient to have access to the deployed site; Sites initially publishes privately.

## Validation scope

Automated tests exercise all configuration combinations, invalid URL values, and name normalization. TypeScript and the production build are checked. Browser interaction and visual QA have not been run.

Unofficial fan project; not affiliated with Lucasfilm, Disney, or Apple.
