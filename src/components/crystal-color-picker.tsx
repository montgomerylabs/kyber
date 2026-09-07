import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';

function fromHex(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  const h = !d
    ? 0
    : max === r
      ? ((g - b) / d + 6) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return [h * 60, max ? d / max : 0, max];
}
function toHex(h: number, s: number, v: number): `#${string}` {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * v * (1 - s * Math.max(0, Math.min(k, 4 - k, 1))))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}

export function CrystalColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: `#${string}`) => void;
}) {
  const [hsv, setHsv] = useState(() => fromHex(color));
  const [hex, setHex] = useState(color);
  const lastEmitted = useRef(color);
  useEffect(() => {
    setHex(color);
    if (color !== lastEmitted.current) setHsv(fromHex(color));
  }, [color]);
  const change = (next: [number, number, number]) => {
    setHsv(next);
    const value = toHex(...next);
    lastEmitted.current = value;
    setHex(value);
    onChange(value);
  };
  const point = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    change([
      ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360,
      Math.min(1, Math.hypot(x, y)),
      hsv[2],
    ]);
  };
  const [h, s, v] = hsv;
  return (
    <fieldset className="custom-crystal">
      <legend>Create your own color</legend>
      <div className="custom-crystal-layout">
        <div
          className="crystal-wheel"
          aria-hidden="true"
          style={{ '--wheel-brightness': v } as CSSProperties}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            point(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e);
          }}
        >
          <span
            className="crystal-wheel-thumb"
            style={{
              left: `${50 + Math.sin((h * Math.PI) / 180) * s * 50}%`,
              top: `${50 - Math.cos((h * Math.PI) / 180) * s * 50}%`,
            }}
          />
        </div>
        <div className="crystal-color-fields">
          {(['Hue', 'Saturation', 'Brightness'] as const).map((label, i) => (
            <label key={label}>
              <span>{label}</span>
              <input
                type="range"
                aria-label={`Crystal ${label.toLowerCase()}`}
                min={0}
                max={i === 0 ? 359 : 100}
                step={1}
                value={Math.round(hsv[i] * (i === 0 ? 1 : 100))}
                onChange={(e) => {
                  const next: [number, number, number] = [...hsv];
                  next[i] = Number(e.target.value) / (i === 0 ? 1 : 100);
                  change(next);
                }}
              />
            </label>
          ))}
          <label className="crystal-hex">
            <span>Hex</span>
            <input
              aria-label="Crystal hex color"
              value={hex}
              spellCheck={false}
              maxLength={7}
              pattern="#[0-9a-fA-F]{6}"
              onChange={(e) => {
                setHex(e.target.value);
                if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
                  change(fromHex(e.target.value));
                }
              }}
              onBlur={() => setHex(color)}
            />
          </label>
        </div>
      </div>
    </fieldset>
  );
}
