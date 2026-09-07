# KYBER — The lightsaber atelier

A [Montgomery Labs](https://github.com/montgomerylabs) / Coding Cave project.

Repository: [montgomerylabs/kyber](https://github.com/montgomerylabs/kyber).

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

## Docker / Dokploy

```sh
docker build -t kyber .
docker run --rm -p 8080:8080 kyber
```

Open http://localhost:8080. The multi-stage image builds with Node.js 22 and serves only `dist/client` using unprivileged Nginx on port **8080**. It supports direct builder links, compression, long-lived caching for hashed assets, and a `/healthz` health check. No environment variables or persistent volumes are required.

In Dokploy, create an application connected to `montgomerylabs/kyber`, branch `main`, then set:

- **Build Type:** Dockerfile
- **Dockerfile Path:** `Dockerfile`
- **Docker Context Path:** `.`
- **Docker Build Stage:** leave blank (uses the final `runtime` stage)
- **Domain Container Port:** `8080`

Add your domain and enable HTTPS in Dokploy, then deploy. Domain routing does not require publishing a separate host port under Advanced → Ports. See the [Dokploy Dockerfile settings](https://docs.dokploy.com/docs/core/applications/build-type) and [domain port guidance](https://docs.dokploy.com/docs/core/troubleshooting/domains).

This image serves the current static application. If server functions or other backend features are added later, update the runtime to serve those features.

## Features

- Cinematic galactic landing page with animated atmosphere and an entrance transition.
- Dark charcoal and brass atelier theme, with a full-viewport stage and a persistent step dock.
- Preloaded client navigation and progressive crossfades between the galaxy and atelier.
- A floating assembly and light-sweep entrance for the 3D saber.
- 1,215 combinations of hilt, emitter, grip, finish, accent, and crystal.
- Rotate, zoom, and inspect the exploded assembly.
- Crystal chamber reveal and cinematic blade ignition.
- Original synthesized ignition and hum; explicit audio interaction and mute.
- Named builds encoded in validated URL parameters.
- Portrait PNG cards captured from the actual configured WebGL model.
- Keyboard controls, modal focus management, reduced motion, and responsive layout.
- A mobile layout with native scrolling, pinned preview, large touch controls, an Explore gesture mode, and safe-area-aware bottom actions.

Design decisions and acceptance criteria are in [docs/design.md](docs/design.md).

The downloadable card captures the current studio view. The configurations are digital concepts, not manufacturing specifications. Shared links require the recipient to have access to the deployed site; Sites initially publishes privately.

## Validation scope

Automated tests exercise all configuration combinations, invalid URL values, and name normalization. TypeScript and the production build are checked. Browser interaction and visual QA have not been run.

Unofficial fan project; not affiliated with Lucasfilm, Disney, or Apple.
