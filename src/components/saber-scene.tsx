import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { accents, crystals, finishes, type Config } from '../lib/config';

function Metal({
  color,
  roughness = 0.28,
}: {
  color: string;
  roughness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.94}
      roughness={roughness}
    />
  );
}
function Cylinder({
  y,
  r = 0.32,
  h = 0.1,
  color = '#bfc2c5',
  roughness = 0.25,
  rTop,
  segments = 80,
}: {
  y: number;
  r?: number;
  h?: number;
  color?: string;
  roughness?: number;
  rTop?: number;
  segments?: number;
}) {
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments]} />
      <Metal color={color} roughness={roughness} />
    </mesh>
  );
}
function Ring({
  y,
  r = 0.335,
  color = '#191a1d',
  thickness = 0.014,
}: {
  y: number;
  r?: number;
  color?: string;
  thickness?: number;
}) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[r, thickness, 10, 80]} />
      <Metal color={color} />
    </mesh>
  );
}
function Saber({
  config,
  exploded,
  ignited,
  cinematic,
  reducedMotion,
  arrival,
}: {
  config: Config;
  exploded: boolean;
  ignited: boolean;
  cinematic: boolean;
  reducedMotion: boolean;
  arrival: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const entranceTime = useRef(0);
  const entranceLight = useRef<THREE.PointLight>(null);
  const upper = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Group>(null);
  const blade = useRef<THREE.Group>(null);
  const finish = finishes.find((x) => x.id === config.finish)!;
  const accent = accents.find((x) => x.id === config.accent)!.color;
  const light = crystals.find((x) => x.id === config.crystal)!.color;
  const slim = config.hilt === 'duelist';
  const relic = config.hilt === 'relic';
  const radius = slim ? 0.275 : relic ? 0.355 : 0.32;
  const swap = useRef(0);
  const lastEmitter = useRef(config.emitter);
  useEffect(() => {
    if (lastEmitter.current !== config.emitter) {
      swap.current = 0.9;
      lastEmitter.current = config.emitter;
    }
  }, [config.emitter]);
  useFrame(({ clock }, dt) => {
    entranceTime.current += Math.min(dt, 0.05);
    const opening =
      cinematic || reducedMotion || !arrival
        ? 1
        : THREE.MathUtils.smootherstep(entranceTime.current, 0.35, 3.15);
    const gathering =
      cinematic || reducedMotion || !arrival
        ? 1
        : THREE.MathUtils.smootherstep(entranceTime.current, 0.65, 2.6);
    const speed = reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
    if (entranceLight.current) {
      entranceLight.current.intensity = 9 * Math.sin(Math.PI * opening);
      entranceLight.current.position.x = -3 + opening * 7;
    }
    if (root.current) {
      root.current.rotation.z = THREE.MathUtils.lerp(
        root.current.rotation.z,
        cinematic ? -0.24 : -0.53 - (1 - opening) * 0.22,
        speed,
      );
      root.current.position.y = THREE.MathUtils.lerp(
        root.current.position.y,
        cinematic ? -2.4 : -(1 - opening) * 0.3,
        speed,
      );
      root.current.scale.setScalar(0.9 + opening * 0.1);
      root.current.rotation.y = reducedMotion
        ? 0
        : Math.sin(clock.elapsedTime * 0.25) * 0.11 - (1 - opening) * 1.25;
    }
    swap.current = THREE.MathUtils.lerp(swap.current, 0, speed);
    if (upper.current)
      upper.current.position.y = THREE.MathUtils.lerp(
        upper.current.position.y,
        (exploded ? 0.75 : (1 - gathering) * 0.95) + swap.current,
        speed,
      );
    if (lower.current)
      lower.current.position.y = THREE.MathUtils.lerp(
        lower.current.position.y,
        exploded ? -0.8 : -(1 - gathering) * 0.7,
        speed,
      );
    if (blade.current) {
      blade.current.scale.y = THREE.MathUtils.lerp(
        blade.current.scale.y,
        ignited ? 1 : 0.001,
        reducedMotion ? 1 : 1 - Math.exp(-dt * 12),
      );
      blade.current.visible = blade.current.scale.y > 0.005;
    }
  });
  const wrap = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      const a = t * Math.PI * 2 * 10;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * (radius + 0.006),
          -1.75 + t * 1.86,
          Math.sin(a) * (radius + 0.006),
        ),
      );
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [radius]);
  return (
    <group
      ref={root}
      rotation={[
        0,
        arrival && !reducedMotion && !cinematic ? -1.25 : 0.25,
        -0.53,
      ]}
    >
      <pointLight
        ref={entranceLight}
        position={[-3, 1, 3]}
        color="#c1ddff"
        intensity={0}
        distance={8}
      />
      <group
        ref={lower}
        position={[0, arrival && !reducedMotion && !cinematic ? -0.7 : 0, 0]}
      >
        <Cylinder
          y={-0.8}
          h={2.15}
          r={radius}
          color={config.grip === 'Wrapped' ? '#39302b' : finish.color}
          roughness={config.grip === 'Wrapped' ? 0.95 : finish.roughness}
        />
        {config.grip === 'Ribbed' ? (
          Array.from({ length: 19 }, (_, i) => (
            <Ring
              key={i}
              y={-1.79 + i * 0.106}
              r={radius + 0.008}
              thickness={0.026}
              color={i % 2 ? '#242427' : finish.color}
            />
          ))
        ) : config.grip === 'Wrapped' ? (
          <mesh>
            <tubeGeometry args={[wrap, 400, 0.033, 8, false]} />
            <meshStandardMaterial color="#493d33" roughness={0.98} />
          </mesh>
        ) : (
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
                <mesh position={[0, -0.83, radius - 0.006]}>
                  <boxGeometry args={[0.065, 1.64, 0.035]} />
                  <meshStandardMaterial
                    color="#26262a"
                    roughness={0.65}
                    metalness={0.35}
                  />
                </mesh>
              </mesh>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <Ring
                key={i}
                y={-1.57 + i * 0.23}
                r={radius + 0.002}
                thickness={0.005}
                color={finish.color}
              />
            ))}
          </>
        )}
        <Cylinder y={-1.99} r={radius + 0.025} h={0.22} color={finish.color} />
        <Cylinder
          y={-2.12}
          r={radius - 0.025}
          rTop={radius + 0.025}
          h={0.07}
          color={finish.color}
        />
        {[0, 1, 2].map((i) => (
          <Ring
            key={i}
            y={-1.93 - i * 0.065}
            r={radius + 0.028}
            thickness={0.014}
            color={i === 1 ? accent : '#343438'}
          />
        ))}
        <Cylinder y={0.24} h={0.11} r={radius + 0.035} color={accent} />
        <Ring y={0.13} r={radius + 0.009} />
      </group>
      <Cylinder
        y={0.68}
        h={0.78}
        r={radius - 0.023}
        color={finish.color}
        roughness={finish.roughness}
      />
      {[0.41, 0.93, 1.02].map((y) => (
        <Ring key={y} y={y} r={radius - 0.019} thickness={0.009} />
      ))}
      <group
        position={[0, 0.68, radius - 0.005]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <Cylinder y={0} h={0.08} r={0.105} color={accent} />
        <Cylinder y={-0.047} h={0.022} r={0.07} color="#212126" />
        <mesh position={[0, -0.063, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.036, 32]} />
          <meshStandardMaterial
            color={light}
            emissive={light}
            emissiveIntensity={ignited ? 3 : 0.6}
          />
        </mesh>
      </group>
      <group
        ref={upper}
        position={[0, arrival && !reducedMotion && !cinematic ? 0.95 : 0, 0]}
      >
        <Cylinder y={1.15} h={0.15} r={radius + 0.018} color={finish.color} />
        <Cylinder y={1.4} h={0.38} r={slim ? 0.14 : 0.2} color={accent} />
        {[1.25, 1.33, 1.41, 1.49, 1.57].map((y) => (
          <Ring
            key={y}
            y={y}
            r={slim ? 0.145 : 0.205}
            thickness={0.011}
            color="#48423b"
          />
        ))}
        <Cylinder
          y={1.68}
          h={0.16}
          r={radius + 0.02}
          rTop={radius + 0.07}
          color={finish.color}
        />
        <Cylinder
          y={1.93}
          h={0.37}
          r={radius + 0.07}
          rTop={config.emitter === 'Flared' ? radius + 0.2 : radius + 0.07}
          color={finish.color}
        />
        <Ring y={1.76} r={radius + 0.078} thickness={0.018} color={accent} />
        <Cylinder
          y={2.12}
          h={0.035}
          r={config.emitter === 'Flared' ? radius + 0.2 : radius + 0.072}
          color="#252529"
        />
        <Cylinder y={2.14} h={0.032} r={0.17} color={accent} />
        <Cylinder y={2.16} h={0.028} r={0.125} color="#15151a" />
        {config.emitter === 'Crown' &&
          Array.from({ length: 6 }, (_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
              <mesh position={[0, 2.17, radius + 0.035]} castShadow>
                <boxGeometry args={[0.09, 0.15, 0.065]} />
                <Metal color={finish.color} />
              </mesh>
            </group>
          ))}
        {config.emitter === 'Shroud' && (
          <mesh position={[0, 2.11, 0]} rotation={[0, 0.6, 0]} castShadow>
            <cylinderGeometry
              args={[
                radius + 0.075,
                radius + 0.075,
                0.52,
                64,
                1,
                true,
                0,
                Math.PI * 1.2,
              ]}
            />
            <Metal color={finish.color} />
          </mesh>
        )}
      </group>
      {relic && (
        <>
          {[-1.6, -1.45, 0.31, 1.12].map((y) => (
            <Cylinder
              key={y}
              y={y}
              r={radius + 0.04}
              h={0.055}
              color={accent}
            />
          ))}
          <Ring y={-0.38} r={radius + 0.014} thickness={0.027} color={accent} />
        </>
      )}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.4, 16]} />
        <Metal color={accent} />
      </mesh>
      <mesh position={[0, 0.24, 0]} rotation={[0, 0, 0.12]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshPhysicalMaterial
          color={light}
          emissive={light}
          emissiveIntensity={1.5}
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {exploded && (
        <pointLight
          position={[0, 0.22, 0.3]}
          color={light}
          intensity={2}
          distance={2}
        />
      )}
      <group position={[0, 2.19, 0]} ref={blade} scale={[1, 0.001, 1]}>
        <mesh position={[0, 2.5, 0]}>
          <capsuleGeometry args={[0.095, 4.8, 8, 24]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        {[0.13, 0.18, 0.27].map((r, i) => (
          <mesh key={r} position={[0, 2.5, 0]}>
            <capsuleGeometry args={[r, 4.8, 8, 24]} />
            <meshBasicMaterial
              color={light}
              transparent
              opacity={[0.65, 0.18, 0.06][i]}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
        <pointLight
          position={[0, 0.25, 0.3]}
          intensity={8}
          color={light}
          distance={5}
        />
        <pointLight
          position={[0, 3, 0]}
          intensity={12}
          color={light}
          distance={7}
        />
      </group>
    </group>
  );
}
function SceneReady({ onReady }: { onReady: () => void }) {
  const { gl } = useThree();
  const renderedFrames = useRef(0);
  useFrame(() => {
    if (++renderedFrames.current === 3) onReady();
  });
  useEffect(() => {
    const el = gl.domElement;
    const listener = (e: Event) => {
      e.preventDefault();
    };
    el.addEventListener('webglcontextlost', listener);
    return () => el.removeEventListener('webglcontextlost', listener);
  }, [gl, onReady]);
  return null;
}
export default function SaberScene({
  config,
  exploded = false,
  ignited = false,
  cinematic = false,
  reducedMotion = false,
  rotation = 0,
  zoom = 1,
  onReady,
  onUnavailable,
  arrival = false,
  interactive = true,
  mobile = false,
}: {
  config: Config;
  exploded?: boolean;
  ignited?: boolean;
  cinematic?: boolean;
  reducedMotion?: boolean;
  rotation?: number;
  zoom?: number;
  onReady: () => void;
  onUnavailable: () => void;
  arrival?: boolean;
  interactive?: boolean;
  mobile?: boolean;
}) {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const c = document.createElement('canvas');
    const context = c.getContext('webgl2');
    if (!context) {
      setSupported(false);
      onUnavailable();
    } else context.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);
  if (!supported)
    return (
      <div className="scene-fallback">
        <p>3D needs WebGL to shine.</p>
        <span>
          Enable hardware acceleration or open KYBER in another browser. Your
          build choices are still available.
        </span>
      </div>
    );
  return (
    <Canvas
      key={cinematic ? 'cinema' : 'studio'}
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{
        position: [0, 0, cinematic ? 13 : 10],
        fov: cinematic ? 47 : 37,
      }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ touchAction: interactive ? 'none' : 'pan-y' }}
    >
      <ambientLight intensity={cinematic ? 0.25 : 0.38} />
      <directionalLight
        position={[3, 5, 5]}
        intensity={cinematic ? 1.3 : 2.6}
        castShadow
      />
      <directionalLight position={[-4, 1, 2]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={4}
          position={[-4, 1, 4]}
          scale={[3, 8, 1]}
          rotation={[0, Math.PI / 5, 0]}
        />
        <Lightformer
          intensity={3}
          position={[4, 2, 2]}
          scale={[1, 7, 1]}
          rotation={[0, -Math.PI / 4, 0]}
        />
        <Lightformer
          intensity={2}
          position={[0, 5, -2]}
          scale={[7, 3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer intensity={1.5} position={[0, -4, 3]} scale={[5, 2, 1]} />
      </Environment>
      <group rotation={[0, rotation, 0]} scale={cinematic ? 1 : zoom}>
        <Saber
          config={config}
          exploded={exploded && !cinematic}
          ignited={ignited}
          cinematic={cinematic}
          reducedMotion={reducedMotion}
          arrival={arrival}
        />
      </group>
      {!cinematic && (
        <ContactShadows
          position={[0, -2.95, 0]}
          opacity={0.27}
          scale={12}
          blur={3}
          far={6}
          resolution={256}
          color="#000000"
        />
      )}
      <OrbitControls
        enabled={interactive}
        enablePan={false}
        enableZoom={true}
        minDistance={cinematic ? 11 : 6.5}
        maxDistance={cinematic ? 16 : 13}
        enableDamping={!reducedMotion}
        dampingFactor={0.06}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
      <SceneReady onReady={onReady} />
    </Canvas>
  );
}
