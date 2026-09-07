import { useEffect, useRef } from 'react';
export function useSaberAudio(muted: boolean) {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const hum = useRef<OscillatorNode[]>([]);
  const mutedRef = useRef(muted);
  const unlock = () => {
    try {
      if (!context.current) {
        context.current = new AudioContext();
        master.current = context.current.createGain();
        master.current.gain.value = mutedRef.current ? 0 : 0.16;
        master.current.connect(context.current.destination);
      }
      if (context.current.state === 'suspended') void context.current.resume();
    } catch {
      /* Visual interaction remains available without audio. */
    }
  };
  const stopHum = () => {
    hum.current.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {}
    });
    hum.current = [];
  };
  const sweep = (
    start: number,
    end: number,
    duration: number,
    type: OscillatorType = 'sawtooth',
  ) => {
    const ctx = context.current;
    if (!ctx || !master.current) return;
    const o = ctx.createOscillator(),
      g = ctx.createGain(),
      f = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(start, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + duration);
    f.type = 'lowpass';
    f.frequency.value = 1600;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    o.connect(f);
    f.connect(g);
    g.connect(master.current);
    o.start();
    o.stop(ctx.currentTime + duration);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
      f.disconnect();
    };
  };
  useEffect(() => {
    mutedRef.current = muted;
    if (context.current && master.current)
      master.current.gain.setTargetAtTime(
        muted ? 0 : 0.16,
        context.current.currentTime,
        0.05,
      );
  }, [muted]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) void context.current?.suspend();
      else if (context.current?.state === 'suspended')
        void context.current.resume();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      stopHum();
      void context.current?.close();
    };
  }, []);
  return {
    unlock,
    click: () => {
      unlock();
      sweep(500, 110, 0.06, 'triangle');
    },
    ignite: () => {
      unlock();
      stopHum();
      sweep(65, 520, 0.65);
      const ctx = context.current;
      if (!ctx || !master.current) return;
      [56, 112, 113.5].forEach((hz, i) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.type = i ? 'sine' : 'triangle';
        o.frequency.value = hz;
        g.gain.value = i ? 0.13 : 0.22;
        o.connect(g);
        g.connect(master.current!);
        o.start();
        o.onended = () => g.disconnect();
        hum.current.push(o);
      });
    },
    extinguish: () => {
      stopHum();
      sweep(480, 45, 0.42);
    },
  };
}
