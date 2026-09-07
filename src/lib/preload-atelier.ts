let scenePromise: Promise<unknown> | undefined;
/** Reuse the same download on idle, hover, focus, and navigation. */
export function preloadSaberScene() {
  scenePromise ??= import('../components/saber-scene').catch((error) => {
    scenePromise = undefined;
    throw error;
  });
  return scenePromise;
}
