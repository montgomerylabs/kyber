import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { preloadSaberScene } from '../lib/preload-atelier';
import { parseConfig } from '../lib/config';
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from 'lucide-react';

export function Landing() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const [navigationError, setNavigationError] = useState('');
  const navigationActive = useRef(false);
  const alive = useRef(true);
  const primeAtelier = useCallback(
    () =>
      Promise.all([
        router.preloadRoute({
          to: '/build',
          search: parseConfig(window.location.search),
        }),
        preloadSaberScene(),
      ]),
    [router],
  );
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [buildHref, setBuildHref] = useState('/build');
  const [reducedMotion, setReducedMotion] = useState(false);
  const worldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    alive.current = true;
    const preloadTimer = setTimeout(() => {
      void primeAtelier().catch(() => {});
    }, 1800);
    setBuildHref(`/build${window.location.search}`);
    if (imageRef.current?.complete) setSceneLoaded(true);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    change();
    media.addEventListener('change', change);
    return () => {
      media.removeEventListener('change', change);
      alive.current = false;
      clearTimeout(preloadTimer);
    };
  }, [primeAtelier]);
  const enter = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (navigationActive.current) return;
    navigationActive.current = true;
    setNavigationError('');
    setEntering(true);
    try {
      // Keep the scene visible while the route and renderer warm up.
      await Promise.all([
        primeAtelier().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : 280)),
      ]);
      if (!alive.current) return;
      await router.navigate({
        to: '/build',
        search: parseConfig(window.location.search),
        viewTransition: !reducedMotion,
      });
    } catch {
      if (alive.current) {
        navigationActive.current = false;
        setEntering(false);
        setNavigationError('The atelier couldn’t open. Please try again.');
      }
    }
  };
  return (
    <main
      className={`galaxy-landing cinematic-arrival ${sceneLoaded ? 'scene-loaded' : ''} ${entering ? 'entering' : ''}`}
      onPointerMove={(e) => {
        if (reducedMotion || e.pointerType === 'touch') return;
        const x = (e.clientX / window.innerWidth - 0.5) * 12,
          y = (e.clientY / window.innerHeight - 0.5) * 8;
        worldRef.current?.style.setProperty('--look-x', `${x}px`);
        worldRef.current?.style.setProperty('--look-y', `${y}px`);
      }}
    >
      <div className="galaxy-world" ref={worldRef} aria-hidden="true">
        <div className="galaxy-camera">
          <div className="galaxy-drift">
            <img
              ref={imageRef}
              className="galaxy-art"
              src="/images/galaxy-hangar.webp"
              alt=""
              fetchPriority="high"
              onLoad={() => setSceneLoaded(true)}
              onError={() => setSceneLoaded(true)}
            />
            <img
              className="galaxy-art death-star-light-pass"
              src="/images/galaxy-hangar.webp"
              alt=""
            />
          </div>
        </div>
        <div className="galaxy-haze haze-one" />
        <div className="galaxy-haze haze-two" />
      </div>
      <div className="galaxy-vignette" aria-hidden="true" />
      <div className="hyperspace-flash" aria-hidden="true" />
      <header className="galaxy-header">
        <a className="galaxy-wordmark" href="/" aria-label="KYBER home">
          KYBER<span>THE LIGHTSABER ATELIER</span>
        </a>
        <span className="galaxy-header-note">A CODING CAVE EXPERIMENT</span>
        <a
          className="galaxy-nav-link"
          href={buildHref}
          onClick={enter}
          onPointerEnter={() => {
            void primeAtelier().catch(() => {});
          }}
          onFocus={() => {
            void primeAtelier().catch(() => {});
          }}
        >
          Enter the atelier <ArrowUpRight size={16} />
        </a>
      </header>
      <div className="galaxy-side-label" aria-hidden="true">
        A LONG TIME AGO, IN A GALAXY FAR, FAR AWAY…
      </div>
      <section className="galaxy-hero" aria-labelledby="galaxy-title">
        <div className="galaxy-kicker">
          <span /> AN UNOFFICIAL STAR WARS EXPERIENCE
        </div>
        <h1 id="galaxy-title">
          The Force.
          <br />
          <span>Made personal.</span>
        </h1>
        <p>
          Some stories are written.
          <br />
          Yours is forged.
        </p>
        <a
          className="journey-button"
          href={buildHref}
          onClick={enter}
          onPointerEnter={() => {
            void primeAtelier().catch(() => {});
          }}
          onFocus={() => {
            void primeAtelier().catch(() => {});
          }}
          aria-busy={entering}
        >
          <span>{entering ? 'Your story begins…' : 'Begin your journey'}</span>
          <ArrowUpRight size={20} />
        </a>
        <span className="journey-note">YOUR LIGHTSABER IS WAITING.</span>
      </section>
      <aside className="galaxy-coordinate" aria-label="Scene location">
        <span className="coordinate-line" />
        <span>THE OUTER RIM</span>
        <small>UNKNOWN SECTOR / 00.00.01</small>
      </aside>
      <div className="galaxy-bottom">
        <div className="galaxy-path">
          <div>
            <span className="path-number">01</span>
            <span>Choose your form.</span>
          </div>
          <span className="path-line" />
          <div>
            <span className="path-number">02</span>
            <span>Find your crystal.</span>
          </div>
          <span className="path-line" />
          <div>
            <span className="path-number">03</span>
            <span>Awaken your saber.</span>
          </div>
          <ArrowDownRight size={19} />
        </div>
        <footer className="galaxy-footer">
          <span>AN ELEGANT WEAPON. AN ENTIRELY PERSONAL ONE.</span>
          <span>
            CRAFTED IN THE CODING CAVE <MoveUpRight size={12} />
          </span>
        </footer>
      </div>
      {navigationError && (
        <p className="navigation-error" role="alert">
          {navigationError}
        </p>
      )}
      <span className="sr-only" role="status">
        {entering ? 'Entering the lightsaber atelier.' : ''}
      </span>
    </main>
  );
}
