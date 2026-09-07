# KYBER / The lightsaber atelier

## Visual thesis

A cinematic Star Wars arrival leads into a precision instrument atelier. A vast Imperial hangar frames the Death Star and a cold blue planet. Charcoal and midnight-blue surfaces, warm ivory typography, and restrained brass accents carry the atmosphere into the builder. Slow background drift, pointer parallax, haze, staggered text reveals, and a brief approach transition set the pace. All motion respects reduced-motion preferences.

## Composition

The root route is a full-screen cinematic landing page with a single primary invitation: Begin your journey. It leads to /build, preserving any configuration query parameters. The builder has a quiet masthead, a concise two-line headline, then a large split working surface. Left: photorealistically shaded procedural 3D hilt with orbit/zoom and an exploded assembly view. Right: numbered Hilt, Finish, Crystal steps using accessible shadcn tabs and radio choices. A quiet bottom bar summarizes the build and holds the ignition action.

## Product flow

0. Arrival: explore the galactic landing scene, then enter the atelier.
1. Hilt: Sentinel, Duelist, Relic. Interchangeable Crown, Shroud, Flared emitters and Machined, Ribbed, Wrapped grips.
2. Finish: brushed silver, obsidian, aged bronze. Brass, crimson, graphite accents.
3. Crystal: blue, green, violet, amber, red. Open crystal chamber on this step.
4. Ignite: dark full-screen studio, animated blade, color spill, original synthesized ignition and hum. Explicit interaction enables sound; mute control always available.
5. Name and share: a portrait PNG build card from the actual WebGL rendering and a versioned URL configuration that reopens every choice.

## Engineering

TanStack Start, React, TypeScript, Tailwind CSS, existing shadcn/Base UI primitives. React Three Fiber and Three.js render modular geometry and a locally generated studio environment. No remote image/model dependency. TanStack Start prerenders the page for static delivery; interactive 3D loads on the client. Query parameters are validated against option catalogs. Names are length-limited. No account needed.

## Accessibility and performance

Keyboard-operable tabs/radio groups/dialogs, readable contrast, visible focus, mobile layout, reduced motion, bounded device pixel ratio, lazy 3D module, explicit WebGL failure message, audio cleanup and pause when hidden. Export and clipboard errors have actionable feedback.

## Acceptance

Every option changes the model without resetting other choices. Component dimensions align across all combinations. Share links round-trip every field. Ignition toggles blade and audio together. PNG contains the configured saber and readable build details. Type checking, production build, and focused configuration tests pass.

## Death Star arrival

On a fresh landing-page load, the loaded artwork triggers a 5.6-second establishing shot: a close, dim view pulls back into the hangar, the station emerges from shadow, and a cool reflected-light pass sweeps over the artwork. The headline and invitation follow in a staggered reveal; the scene settles into the existing ambient drift. Pointer parallax stays independent of the camera animation. Navigation remains available throughout, keyboard focus reveals the main button immediately, and reduced-motion mode shows the settled composition directly. Cached and failed image loads both release the content reveal.
