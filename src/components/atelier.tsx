import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Expand,
  Gem,
  Link2,
  Minus,
  Plus,
  Power,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  accents,
  buildDescription,
  crystals,
  defaultConfig,
  emitters,
  finishes,
  grips,
  hilts,
  parseConfig,
  serializeConfig,
  type Config,
} from '../lib/config';
import { useSaberAudio } from '../lib/audio';
const SaberScene = lazy(() => import('./saber-scene'));
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <Gem size={28} />
        <p>The 3D studio couldn’t open.</p>
        <span>
          Try reloading or enabling hardware acceleration in your browser.
        </span>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload studio
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Options({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="option-field">
      <legend>{label}</legend>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(String(v))}
        className="segment-options"
        aria-label={label}
      >
        {values.map((v) => (
          <label key={v} className={`segment ${v === value ? 'selected' : ''}`}>
            <RadioGroupItem value={v} className="sr-only" />
            <span>{v}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
export function Atelier() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [step, setStep] = useState('hilt');
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [cinematic, setCinematic] = useState(false);
  const [ignited, setIgnited] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [linkFallback, setLinkFallback] = useState('');
  const sceneRef = useRef<HTMLDivElement>(null);
  const igniteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sceneReady = useCallback(() => setReady(true), []);
  const audio = useSaberAudio(muted);
  useEffect(() => {
    setConfig(parseConfig(window.location.search));
    setMounted(true);
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const change = () => setReducedMotion(m.matches);
    m.addEventListener('change', change);
    const pop = () => setConfig(parseConfig(window.location.search));
    window.addEventListener('popstate', pop);
    return () => {
      m.removeEventListener('change', change);
      window.removeEventListener('popstate', pop);
    };
  }, []);
  useEffect(() => {
    if (mounted)
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${serializeConfig(config)}`,
      );
  }, [config, mounted]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (!cinematic) return;
    const old = document.body.style.overflow;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const first = sceneRef.current?.querySelector<HTMLButtonElement>('button');
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const buttons = Array.from(
        sceneRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        ) || [],
      );
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, [cinematic]);
  useEffect(
    () => () => {
      if (igniteTimer.current) clearTimeout(igniteTimer.current);
    },
    [],
  );
  const hilt = hilts.find((x) => x.id === config.hilt)!;
  const finish = finishes.find((x) => x.id === config.finish)!;
  const crystal = crystals.find((x) => x.id === config.crystal)!;
  const update = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
    audio.click();
  };
  const ignite = () => {
    audio.unlock();
    setCinematic(true);
    setIgnited(false);
    igniteTimer.current = setTimeout(
      () => {
        setIgnited(true);
        audio.ignite();
      },
      reducedMotion ? 0 : 650,
    );
  };
  const leaveCinema = () => {
    if (igniteTimer.current) clearTimeout(igniteTimer.current);
    setIgnited(false);
    setCinematic(false);
    audio.extinguish();
  };
  useEffect(() => {
    if (!cinematic) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveCinema();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [cinematic]);
  const share = async () => {
    const url = new URL(window.location.pathname, window.location.origin);
    url.search = serializeConfig(config);
    try {
      await navigator.clipboard.writeText(url.href);
      setNotice('Build link copied. Your story travels with it.');
    } catch {
      setLinkFallback(url.href);
    }
  };
  const download = async () => {
    const source = sceneRef.current?.querySelector('canvas');
    if (!source) {
      setNotice('The 3D studio is still loading. Try again in a moment.');
      return;
    }
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#10151e';
      ctx.fillRect(0, 0, 1080, 1350);
      ctx.fillStyle = '#e6dfd0';
      ctx.font = '500 34px Helvetica, Arial';
      ctx.fillText('K Y B E R', 70, 85);
      ctx.font = '16px Helvetica, Arial';
      ctx.fillStyle = '#929eaf';
      ctx.fillText('THE LIGHTSABER ATELIER', 70, 119);
      const scale = Math.min(1000 / source.width, 850 / source.height);
      const w = source.width * scale,
        h = source.height * scale;
      ctx.drawImage(source, (1080 - w) / 2, 165 + (850 - h) / 2, w, h);
      ctx.fillStyle = '#303845';
      ctx.fillRect(70, 1030, 940, 1);
      ctx.fillStyle = '#e6dfd0';
      ctx.font = '500 68px Helvetica, Arial';
      let name = config.name || 'Untitled';
      while (ctx.measureText(name).width > 935) {
        name = name.slice(0, -2) + '…';
      }
      ctx.fillText(name, 70, 1133);
      ctx.font = '24px Helvetica, Arial';
      ctx.fillStyle = '#929eaf';
      ctx.fillText(buildDescription(config), 70, 1185);
      ctx.font = '18px Helvetica, Arial';
      ctx.fillText(
        `${config.emitter} emitter · ${config.grip} grip · ${accents.find((x) => x.id === config.accent)!.name} accents`,
        70,
        1225,
      );
      ctx.font = '16px Helvetica, Arial';
      ctx.fillText(
        'DESIGNED BY YOU. BROUGHT TO LIFE BY THE CODING CAVE.',
        70,
        1290,
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Export failed'))),
          'image/png',
        ),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyber-${(config.name || 'saber').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Your build card is ready. May it travel far.');
    } catch {
      setNotice('The image couldn’t be saved. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  return (
    <div
      className="atelier"
      style={{ '--crystal': crystal.color } as CSSProperties}
    >
      <a className="skip-link" href="#configurator">
        Skip to configurator
      </a>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="KYBER home">
          KYBER<span>THE LIGHTSABER ATELIER</span>
        </a>
        <nav aria-label="Main navigation">
          <button
            className="nav-link active"
            onClick={() =>
              document.getElementById('configurator')?.scrollIntoView({
                behavior: reducedMotion ? 'instant' : 'smooth',
              })
            }
          >
            The atelier
          </button>
          <button className="nav-link" onClick={() => setStoryOpen(true)}>
            Our philosophy
          </button>
        </nav>
        <button className="cave-link" onClick={() => setStoryOpen(true)}>
          A Coding Cave experiment <span>↗</span>
        </button>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span className="tiny-star">✳</span> BUILT BY YOU. GUIDED BY THE
              FORCE.
            </div>
            <h1>
              Your saber. <span>Your story.</span>
            </h1>
            <p>An elegant weapon. An entirely personal one.</p>
          </div>
          <div className="intro-note">
            <span>
              ONE OF A KIND.
              <br />
              BY DESIGN.
            </span>
            <ArrowDown size={19} />
          </div>
        </section>
        <section
          id="configurator"
          className="configurator"
          aria-label="Lightsaber configurator"
        >
          <div
            role={cinematic ? 'dialog' : undefined}
            aria-modal={cinematic ? true : undefined}
            aria-label={cinematic ? 'Your lightsaber ignition' : undefined}
            className={`studio ${cinematic ? 'cinematic' : ''}`}
            ref={sceneRef}
          >
            <div className="studio-top">
              <span>
                <span className="status-dot" />
                {cinematic ? 'THE MOMENT IS YOURS' : 'LIVE ATELIER'}
              </span>
              <span className="edition">
                SERIES 01 / {hilt.name.toUpperCase()}
              </span>
            </div>
            {cinematic && (
              <div className="cinema-header">
                <Button
                  variant="ghost"
                  className="cinema-back"
                  onClick={leaveCinema}
                >
                  <ArrowLeft /> Back to your build
                </Button>
                <button
                  className="round-control"
                  aria-label={muted ? 'Enable sound' : 'Mute sound'}
                  onClick={() => {
                    audio.unlock();
                    setMuted(!muted);
                  }}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            )}
            <div
              className="scene"
              role="img"
              aria-label={`Interactive 3D ${hilt.name} lightsaber, ${finish.name}, ${crystal.name} crystal. Drag to rotate or use the rotation controls.`}
            >
              {mounted && (
                <SceneBoundary onError={() => setSceneFailed(true)}>
                  <Suspense fallback={null}>
                    <SaberScene
                      config={config}
                      exploded={exploded || step === 'crystal'}
                      ignited={ignited}
                      cinematic={cinematic}
                      reducedMotion={reducedMotion}
                      rotation={rotation}
                      zoom={zoom}
                      onReady={sceneReady}
                      onUnavailable={() => setSceneFailed(true)}
                    />
                  </Suspense>
                </SceneBoundary>
              )}
              {!ready && !sceneFailed && (
                <div className="studio-loading">
                  <span className="loading-ring" />
                  <span>Preparing your atelier</span>
                </div>
              )}
            </div>
            {!cinematic && (
              <>
                <div className="object-caption">
                  <span className="object-number">
                    01 —{' '}
                    {String(
                      hilts.findIndex((x) => x.id === config.hilt) + 1,
                    ).padStart(2, '0')}
                  </span>
                  <h2>The {hilt.name}.</h2>
                  <span>
                    {finish.name} /{' '}
                    {accents.find((x) => x.id === config.accent)!.name} accents
                  </span>
                </div>
                <div className="studio-bottom">
                  <span className="drag-hint">
                    <RotateCw size={15} /> Drag to explore
                  </span>
                  <div className="studio-tools">
                    <button
                      className="round-control"
                      aria-label="Rotate saber left"
                      onClick={() => setRotation((r) => r - 0.5)}
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      className="round-control"
                      aria-label="Rotate saber right"
                      onClick={() => setRotation((r) => r + 0.5)}
                    >
                      <RotateCw size={16} />
                    </button>
                    <span className="tool-divider" />
                    <button
                      className="round-control"
                      aria-label="Zoom out"
                      disabled={zoom <= 0.8}
                      onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      className="round-control"
                      aria-label="Zoom in"
                      disabled={zoom >= 1.4}
                      onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                    >
                      <Plus size={16} />
                    </button>
                    <span className="tool-divider" />
                    <button
                      className={`round-control ${exploded ? 'is-on' : ''}`}
                      aria-label="Exploded assembly view"
                      aria-pressed={exploded}
                      onClick={() => setExploded(!exploded)}
                    >
                      <Expand size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
            {cinematic && (
              <div className="cinema-footer">
                <div className="eyebrow">
                  {ignited ? 'A NEW STORY BEGINS.' : 'THE FORCE IS PATIENT.'}
                </div>
                <h2>{config.name || 'Your lightsaber'}.</h2>
                <div className="cinema-actions">
                  <Button
                    className="cinema-power"
                    onClick={() => {
                      audio.unlock();
                      if (igniteTimer.current)
                        clearTimeout(igniteTimer.current);
                      setIgnited(!ignited);
                      ignited ? audio.extinguish() : audio.ignite();
                    }}
                  >
                    <Power />
                    {ignited ? 'Extinguish' : 'Ignite'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      leaveCinema();
                      setShareOpen(true);
                    }}
                  >
                    Make it yours <ArrowRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="configuration-panel">
            <Tabs value={step} onValueChange={(v) => setStep(String(v))}>
              <TabsList
                variant="line"
                className="step-tabs"
                aria-label="Build steps"
              >
                {['hilt', 'finish', 'crystal'].map((v, i) => (
                  <TabsTrigger key={v} value={v}>
                    <span className="step-number">0{i + 1}</span>
                    {v[0].toUpperCase() + v.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="hilt">
                <div className="panel-heading">
                  <div className="eyebrow">THE FOUNDATION</div>
                  <h2>Find your balance.</h2>
                  <p>Every great story starts with a hilt.</p>
                </div>
                <RadioGroup
                  aria-label="Hilt silhouette"
                  value={config.hilt}
                  onValueChange={(v) => update('hilt', v as Config['hilt'])}
                  className="hilt-options"
                >
                  {hilts.map((h, i) => (
                    <label
                      key={h.id}
                      className={`hilt-option ${config.hilt === h.id ? 'selected' : ''}`}
                    >
                      <span className="option-index">0{i + 1}</span>
                      <span className="hilt-copy">
                        <strong>{h.name}</strong>
                        <span>{h.description}</span>
                      </span>
                      <RadioGroupItem value={h.id} />
                    </label>
                  ))}
                </RadioGroup>
                <Options
                  label="Emitter"
                  value={config.emitter}
                  values={emitters}
                  onChange={(v) => update('emitter', v as Config['emitter'])}
                />
                <Options
                  label="Grip"
                  value={config.grip}
                  values={grips}
                  onChange={(v) => update('grip', v as Config['grip'])}
                />
                <div className="panel-foot">
                  <span>Designed to feel like an extension of you.</span>
                  <button
                    onClick={() => setStep('finish')}
                    aria-label="Continue to finish"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="finish">
                <div className="panel-heading">
                  <div className="eyebrow">IN THE DETAILS</div>
                  <h2>A finer finish.</h2>
                  <p>Character you can see. Craft you can feel.</p>
                </div>
                <fieldset className="option-field finish-field">
                  <legend>
                    Hilt finish <span>{finish.name}</span>
                  </legend>
                  <RadioGroup
                    aria-label="Hilt finish"
                    value={config.finish}
                    onValueChange={(v) =>
                      update('finish', v as Config['finish'])
                    }
                    className="finish-options"
                  >
                    {finishes.map((f) => (
                      <label
                        key={f.id}
                        className={`finish-option ${config.finish === f.id ? 'selected' : ''}`}
                      >
                        <RadioGroupItem className="sr-only" value={f.id} />
                        <span className={`metal-swatch ${f.id}`} />
                        <span>{f.name}</span>
                        {config.finish === f.id && <Check size={14} />}
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <fieldset className="option-field accent-field">
                  <legend>
                    Accent{' '}
                    <span>
                      {accents.find((a) => a.id === config.accent)!.name}
                    </span>
                  </legend>
                  <RadioGroup
                    value={config.accent}
                    aria-label="Accent metal"
                    onValueChange={(v) =>
                      update('accent', v as Config['accent'])
                    }
                    className="accent-options"
                  >
                    {accents.map((a) => (
                      <label
                        key={a.id}
                        className={`accent-option ${config.accent === a.id ? 'selected' : ''}`}
                      >
                        <RadioGroupItem value={a.id} className="sr-only" />
                        <span
                          className="accent-swatch"
                          style={{ background: a.color }}
                        />
                        {a.name}
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <div className="material-note">
                  <span className="eyebrow">
                    CONSIDERED. DOWN TO THE MICRON.
                  </span>
                  <p>
                    {config.finish === 'silver'
                      ? 'Cool silver. Fine machining. A finish that lets the form speak.'
                      : config.finish === 'obsidian'
                        ? 'Deep charcoal with a satin sheen. Quietly commanding from every angle.'
                        : 'Warm bronze and softened reflections. The character of a well-traveled companion.'}
                  </p>
                </div>
                <div className="panel-foot">
                  <span>The smallest details make it yours.</span>
                  <button
                    onClick={() => setStep('crystal')}
                    aria-label="Continue to crystal"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="crystal">
                <div className="panel-heading">
                  <div className="eyebrow">THE HEART WITHIN</div>
                  <h2>Find your light.</h2>
                  <p>The crystal is where your story comes alive.</p>
                </div>
                <fieldset className="option-field">
                  <legend>
                    Kyber crystal <span>{crystal.name}</span>
                  </legend>
                  <RadioGroup
                    aria-label="Kyber crystal color"
                    value={config.crystal}
                    onValueChange={(v) =>
                      update('crystal', v as Config['crystal'])
                    }
                    className="crystal-options"
                  >
                    {crystals.map((c) => (
                      <label
                        key={c.id}
                        className={`crystal-option ${config.crystal === c.id ? 'selected' : ''}`}
                      >
                        <RadioGroupItem value={c.id} className="sr-only" />
                        <span
                          style={{ '--gem-color': c.color } as CSSProperties}
                          className="crystal-swatch"
                        >
                          <Gem size={23} strokeWidth={1.3} />
                        </span>
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <div className="crystal-story">
                  <Gem size={28} strokeWidth={1} />
                  <h3>{crystal.name}.</h3>
                  <p>{crystal.description}</p>
                  <span>A small crystal. An extraordinary possibility.</span>
                </div>
                <div className="panel-foot">
                  <span>Your saber is ready for its first light.</span>
                  <Check size={18} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        <section className="build-bar" aria-label="Build summary">
          <div className="build-summary">
            <span
              className="summary-gem"
              style={{ background: crystal.color }}
            />
            <div>
              <strong>Your {hilt.name}</strong>
              <span>
                {finish.name} <i>·</i> {crystal.name} crystal
              </span>
            </div>
          </div>
          <div className="build-actions">
            <button className="save-link" onClick={() => setShareOpen(true)}>
              Save your build <ChevronRight size={16} />
            </button>
            <Button
              className="ignite-button"
              disabled={!ready}
              onClick={ignite}
            >
              <Power size={17} /> Ignite your saber <ArrowRight size={18} />
            </Button>
          </div>
        </section>
        <section className="craft-strip">
          <div>
            <span className="eyebrow">AN EXTENSION OF YOU.</span>
            <p>
              Extraordinary by nature.
              <br />
              <span>Personal by design.</span>
            </p>
          </div>
          <div className="spec-detail">
            <span>HILT LENGTH</span>
            <strong>
              {hilt.length}
              <small> cm</small>
            </strong>
          </div>
          <div className="spec-detail">
            <span>DESIGN WEIGHT</span>
            <strong>
              {hilt.weight}
              <small> kg</small>
            </strong>
          </div>
          <div className="spec-detail">
            <span>POSSIBILITIES</span>
            <strong>
              1,215<small> combinations</small>
            </strong>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span className="footer-logo">KYBER</span>
        <p>A love letter to a galaxy far, far away.</p>
        <span>
          Crafted in the Coding Cave <span className="footer-star">✳</span>
        </span>
      </footer>
      <Dialog
        open={shareOpen}
        onOpenChange={(v) => {
          setShareOpen(v);
          setLinkFallback('');
        }}
      >
        <DialogContent className="share-dialog">
          <div className="eyebrow">YOURS, THROUGH AND THROUGH.</div>
          <DialogTitle className="dialog-title">
            Give your story a name.
          </DialogTitle>
          <DialogDescription>{buildDescription(config)}</DialogDescription>
          <label className="name-label" htmlFor="saber-name">
            Your saber’s name
          </label>
          <Input
            id="saber-name"
            maxLength={32}
            value={config.name}
            onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
            placeholder="Afterglow"
            className="name-input"
          />
          <div className="share-preview">
            <span className="share-dot" style={{ background: crystal.color }} />
            <div>
              <strong>{config.name || 'Untitled'}</strong>
              <span>
                {config.emitter} emitter · {config.grip} grip
              </span>
            </div>
            <Gem size={26} strokeWidth={1} />
          </div>
          <Button className="primary-button" onClick={share}>
            <Link2 size={16} /> Copy build link
          </Button>
          <Button
            variant="outline"
            className="download-button"
            disabled={exporting || !ready}
            onClick={download}
          >
            <Download size={16} />
            {exporting ? 'Creating your card…' : 'Download build card'}
          </Button>
          {linkFallback && (
            <label className="link-fallback">
              Copy this link to share your build
              <Input
                readOnly
                value={linkFallback}
                onFocus={(e) => e.target.select()}
              />
            </label>
          )}
          <p className="dialog-note">
            Every detail travels with your link. No account needed.
          </p>
        </DialogContent>
      </Dialog>
      <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
        <DialogContent className="philosophy-dialog">
          <div className="eyebrow">THE CODING CAVE / EXPERIMENT 001</div>
          <DialogTitle className="dialog-title">
            A more civilized
            <br />
            kind of craft.
          </DialogTitle>
          <DialogDescription className="philosophy-copy">
            Some objects are more than the sum of their parts. A lightsaber is
            one of them.
            <br />
            <br />
            KYBER is a place to make one your own. Choose the shape. Consider
            the finish. Find the light that feels like you.
            <br />
            <br />
            Built with Astra as a Coding Cave experiment in what happens when
            imagination meets code.
          </DialogDescription>
          <div className="fan-note">
            An unofficial fan project. Not affiliated with Lucasfilm, Disney, or
            Apple. Digital creations only.
          </div>
          <Button
            className="primary-button"
            onClick={() => setStoryOpen(false)}
          >
            Back to the atelier <ArrowRight />
          </Button>
        </DialogContent>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
