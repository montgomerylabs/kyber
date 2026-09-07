import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from 'lucide-react';

export function Landing() {
  const [entering, setEntering] = useState(false);
  const [buildHref, setBuildHref] = useState('/build');
  const [reducedMotion, setReducedMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setBuildHref(`/build${window.location.search}`);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    change();
    media.addEventListener('change', change);
    return () => {
      media.removeEventListener('change', change);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const enter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (entering) return;
    setEntering(true);
    timer.current = setTimeout(
      () => {
        window.location.assign(buildHref);
      },
      reducedMotion ? 0 : 850,
    );
  };
  return (
    <main
      className={`galaxy-landing ${entering ? 'entering' : ''}`}
      onPointerMove={(e) => {
        if (reducedMotion || e.pointerType === 'touch') return;
        const x = (e.clientX / window.innerWidth - 0.5) * 12,
          y = (e.clientY / window.innerHeight - 0.5) * 8;
        worldRef.current?.style.setProperty('--look-x', `${x}px`);
        worldRef.current?.style.setProperty('--look-y', `${y}px`);
      }}
    >
      <div className="galaxy-world" ref={worldRef} aria-hidden="true">
        <img
          className="galaxy-art"
          src="/images/galaxy-hangar.webp"
          alt=""
          fetchPriority="high"
        />
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
        <a className="galaxy-nav-link" href={buildHref} onClick={enter}>
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
      <span className="sr-only" role="status">
        {entering ? 'Entering the lightsaber atelier.' : ''}
      </span>
    </main>
  );
}
