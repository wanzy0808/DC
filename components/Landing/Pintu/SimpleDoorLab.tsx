"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

function archShape(width: number, height: number) {
  const s = new THREE.Shape();
  const radius = width / 2;
  const shoulder = height - radius;
  s.moveTo(-radius, 0);
  s.lineTo(radius, 0);
  s.lineTo(radius, shoulder);
  s.absarc(0, shoulder, radius, 0, Math.PI, false);
  s.lineTo(-radius, 0);
  return s;
}

function Arch({ width, height, depth, color, z = 0, gradient = false }: { width: number; height: number; depth: number; color: string; z?: number; gradient?: boolean }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(archShape(width, height), {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.009, bevelThickness: 0.009, curveSegments: 48,
  }), [width, height, depth]);
  useMemo(() => {
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const bottom = new THREE.Color("#9e5868");
    const middle = new THREE.Color("#c07a84");
    const top = new THREE.Color("#c07a84");
    for (let i = 0; i < position.count; i++) {
      const t = THREE.MathUtils.smoothstep(position.getY(i) / height, 0, 0.44);
      const colorAt = t < 0.8 ? bottom.clone().lerp(middle, t / 0.8) : middle.clone().lerp(top, (t - 0.8) / 0.2);
      colors[i * 3] = colorAt.r;
      colors[i * 3 + 1] = colorAt.g;
      colors[i * 3 + 2] = colorAt.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [geometry, height]);
  return <mesh geometry={geometry} position={[0, 0, z]} castShadow receiveShadow>
    {gradient ? <meshStandardMaterial vertexColors roughness={0.75} metalness={0.03} /> : <meshStandardMaterial color={color} roughness={0.82} metalness={0} />}
  </mesh>;
}

function DoorFrame() {
  const geometry = useMemo(() => {
    const outer = archShape(2.02, 4.18);
    const inner = archShape(1.88, 4.06);
    // Shape holes must wind opposite the outer contour.
    const hole = new THREE.Path(inner.getPoints(64).reverse());
    outer.holes.push(hole);
    return new THREE.ExtrudeGeometry(outer, { depth: 0.09, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 48 });
  }, []);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#c07a84" roughness={0.7} metalness={0.05} side={THREE.DoubleSide} /></mesh>;
}

function PortalWorld({ image, opening }: { image: string; opening: boolean }) {
  const source = useLoader(THREE.TextureLoader, image);
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.wrapS = THREE.ClampToEdgeWrapping;
    copy.wrapT = THREE.ClampToEdgeWrapping;
    copy.anisotropy = 8;
    copy.needsUpdate = true;
    return copy;
  }, [source]);
  const geometry = useMemo(() => {
    const shape = new THREE.ShapeGeometry(archShape(1.88, 4.06), 64);
    const position = shape.getAttribute("position");
    const uv = shape.getAttribute("uv");
    for (let i = 0; i < position.count; i++) {
      uv.setXY(i, (position.getX(i) + 0.94) / 1.88, position.getY(i) / 4.06);
    }
    uv.needsUpdate = true;
    return shape;
  }, []);
  return <group position={[0, 0, -0.19]}>
    <mesh geometry={geometry}><meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} /></mesh>

  </group>;
}

function GroundShadow() {
  return <mesh position={[0, -2.145, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[2.55, 1.45]} />
    <shadowMaterial transparent opacity={0.26} depthWrite={false} />
  </mesh>;
}

function Fireflies({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const particles = Array.from({ length: 54 }, (_, i) => {
      const seed = (n: number) => {
        const v = Math.sin((i + 1) * n * 127.1) * 43758.5453;
        return v - Math.floor(v);
      };
      return {
        x: (seed(1.1) - 0.5) * 9.5,
        y: (seed(2.3) - 0.5) * 4.6,
        z: -0.35 + seed(3.7) * 3.1,
        speed: 0.12 + seed(4.9) * 0.27,
        phase: seed(5.3) * Math.PI * 2,
        radius: 0.08 + seed(6.7) * 0.28,
      };
    });
    return particles;
  }, []);
  const positions = useMemo(() => new Float32Array(base.length * 3), [base]);
  useFrame(({ clock }) => {
    if (!points.current) return;
    const time = reducedMotion ? 0 : clock.elapsedTime;
    for (let i = 0; i < base.length; i++) {
      const p = base[i];
      positions[i * 3] = p.x + Math.sin(time * p.speed + p.phase) * p.radius;
      positions[i * 3 + 1] = p.y + Math.sin(time * p.speed * 0.73 + p.phase * 1.7) * 0.2;
      positions[i * 3 + 2] = p.z + Math.cos(time * p.speed * 0.64 + p.phase) * 0.19;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    (points.current.material as THREE.PointsMaterial).opacity = reducedMotion ? 0.28 : 0.3 + Math.sin(time * 0.37) * 0.06;
  });
  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#ffdc73" size={0.037} transparent opacity={0.32} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
  </points>;
}

function PortalCamera({ entering, reducedMotion, selected, onArrive }: { entering: boolean; reducedMotion: boolean; selected: number; onArrive: () => void }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const arrived = useRef(false);
  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, entering ? 1 : 0, reducedMotion ? 18 : 2.4, delta);
    const t = progress.current;
    const eased = t * t * (3 - 2 * t);
    camera.position.set(0, 0.05 - eased * 0.12, 11.7 - eased * 11.1);
    camera.lookAt(0, -0.05, -2);
    if (entering && t > 0.96 && !arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });
  return null;
}

function DoorTitle({ title, opening }: { title: string; opening: boolean }) {
  const label = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#fffaf3";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "700 88px Georgia, serif";
      context.shadowColor = "rgba(76,38,48,0.65)";
      context.shadowBlur = 14;
      context.fillText(title, 512, 128, 980);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [title]);
  useFrame((_, delta) => {
    if (label.current) label.current.opacity = THREE.MathUtils.damp(label.current.opacity, opening ? 0 : 1, 5, delta);
  });
  return <mesh position={[0, 0.66, 0.132]} renderOrder={3}>
    <planeGeometry args={[1.72, 0.48]} />
    <meshBasicMaterial ref={label} map={texture} transparent depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
  </mesh>;
}

function Door({ opening, image, title }: { opening: boolean; image: string; title: string }) {
  const pivot = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, opening ? -1.55 : 0, 2.2, delta);
  });
  const palette = { frame: "#c07a84", panel: "#c07a84", trim: "#e9e5df", metal: "#d1a9a0" };
  return <group position={[0, -2.12, 0]}>
    <PortalWorld image={image} opening={opening} />
    <group position={[0, 0, -0.16]}>
      <DoorFrame />
    </group>
    <group ref={pivot} position={[-0.94, 0, -0.065]}>
      <group position={[0.94, 0, 0]}>
        <Arch width={1.88} height={4.06} depth={0.075} color={palette.panel} gradient />
        <Arch width={1.67} height={3.78} depth={0.012} z={0.079} color={palette.trim} />
        <Arch width={1.61} height={3.72} depth={0.013} z={0.095} color={palette.panel} gradient />
        <DoorTitle title={title} opening={opening} />
        {[-0.62, 0.62].map((x) => <mesh key={x} position={[x, 1.55, 0.113]} castShadow><boxGeometry args={[0.009, 2.5, 0.005]} /><meshStandardMaterial color="#e9e5df" roughness={0.58} metalness={0.12} /></mesh>)}
        <mesh position={[0, 3.12, 0.115]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.16, 0.16, 0.008]} /><meshStandardMaterial color="#e9e5df" metalness={0.28} roughness={0.48} /></mesh>

        <mesh position={[0.67, 1.85, 0.115]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={palette.metal} metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh position={[0.57, 1.85, 0.165]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.022, 0.18, 4, 12]} />
          <meshStandardMaterial color={palette.metal} metalness={0.65} roughness={0.25} />
        </mesh>
      </group>
    </group>
    <mesh position={[0, 0.018, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.95, 0.24]} />
      <meshBasicMaterial color="#ffe4c7" transparent opacity={opening ? 0.75 : 0.28} depthWrite={false} />
    </mesh>
  </group>;
}

const PORTALS = [
  { title: "Event Planner", image: "/eventplanner.png", href: "/event-planner" },
  { title: "Undangan Digital", image: "/Idigi.png", href: "/d-invitation" },
  { title: "Guestbook", image: "/guestbook.png", href: "/guestbook" },
  { title: "Undangan Fisik", image: "/Ufisik.png", href: "/undangan-fisik" },
];

function OrbitalDoors({ selected, opening, entering, reducedMotion, onSelect, enterButton }: { selected: number | null; opening: boolean[]; entering: boolean; reducedMotion: boolean; onSelect: (index: number) => void; enterButton: React.RefObject<HTMLDivElement | null> }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const phase = useRef(0);
  const buttonAnchor = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }, delta) => {
    if (selected === null && !reducedMotion && !entering) phase.current += delta * 0.18;
    else if (selected !== null) {
      const target = -selected * Math.PI * 2 / PORTALS.length;
      const diff = Math.atan2(Math.sin(target - phase.current), Math.cos(target - phase.current));
      phase.current += diff * (1 - Math.exp(-3.4 * delta));
    }
    groups.current.forEach((group, index) => {
      if (!group) return;
      const theta = phase.current + index * Math.PI * 2 / PORTALS.length;
      const x = Math.sin(theta) * 2.85;
      const z = Math.cos(theta) * 1.25;
      group.position.set(x, 0, z);
      group.rotation.y = -Math.sin(theta) * 0.17;
      const orbitScale = 0.69 + (z + 1.25) / 2.5 * 0.12;
      const selectedScale = selected === index ? 1.12 : 0.70;
      const targetScale = selected === null ? orbitScale : selectedScale;
      const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, 3.8, delta);
      group.scale.setScalar(nextScale);
    });
    const button = enterButton.current;
    const active = selected === null ? null : groups.current[selected];
    if (button && active) {
      buttonAnchor.set(0, -2.45, 0.14);
      active.localToWorld(buttonAnchor);
      buttonAnchor.project(camera);
      const x = (buttonAnchor.x + 1) * size.width / 2;
      const y = (1 - buttonAnchor.y) * size.height / 2;
      button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${active.scale.x.toFixed(3)})`;
      const centered = Math.abs(active.position.x) < 0.32;
      button.style.opacity = centered && opening[selected!] && !entering ? "1" : "0";
      button.style.pointerEvents = centered && opening[selected!] && !entering ? "auto" : "none";
    } else if (button) {
      button.style.opacity = "0";
      button.style.pointerEvents = "none";
    }
  });
  return <>{PORTALS.map((portal, index) => <group key={index} ref={(node) => { groups.current[index] = node; }} onClick={(event) => { event.stopPropagation(); if (!entering) onSelect(index); }}>
    <Door opening={opening[index]} image={portal.image} title={portal.title} />
    <GroundShadow />
    <pointLight position={[0, -1.2, -0.4]} intensity={opening[index] ? 3 : 0.15} color="#ffe1d5" distance={2.8} />
  </group>)}</>;
}

export default function SimpleDoorLab({ fullFrame = false }: { fullFrame?: boolean }) {
  const [opening, setOpening] = useState(PORTALS.map(() => false));
  const [selected, setSelected] = useState<number | null>(null);
  const [entering, setEntering] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const enterButton = useRef<HTMLDivElement>(null);
  function enterPortal() {
    if (selected === null || !opening[selected] || entering) return;
    setEntering(true);
  }
  return <section className={fullFrame ? "absolute inset-0 h-full w-full" : "w-full max-w-5xl space-y-4"}>
    <div className={fullFrame ? "absolute inset-0 h-full w-full overflow-hidden bg-transparent" : "relative h-[min(82dvh,790px)] min-h-[480px] overflow-hidden bg-transparent"}>
      <Canvas shadows camera={{ position: [0, 0.05, 11.7], fov: 39 }} gl={{ alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.setClearColor(0x000000, 0); }}>
        <PortalCamera entering={entering} reducedMotion={Boolean(reducedMotion)} selected={selected ?? 0} onArrive={() => {  if (selected === 1) { sessionStorage.setItem("dc-portal-entry", "1"); document.body.classList.add("dc-portal-arriving"); } router.push(PORTALS[selected ?? 0].href); }} />
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#fff1e6", "#ad7180", 0.85]} />
        <directionalLight position={[-3, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} shadow-radius={5} />
        <pointLight position={[0, -1.35, -0.1]} intensity={selected !== null && opening[selected] ? 7 : 0.7} color="#ffe5bc" distance={3.5} />
        <Fireflies reducedMotion={Boolean(reducedMotion)} />
        <OrbitalDoors selected={selected} opening={opening} entering={entering} reducedMotion={Boolean(reducedMotion)} onSelect={(index) => { setSelected(index); setOpening(PORTALS.map((_, i) => i === index)); }} enterButton={enterButton} />
      </Canvas>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(255,234,206,0.95),rgba(245,171,187,0.55)_45%,rgba(255,245,241,0.98)_85%)]" initial={false} animate={{ opacity: entering ? 1 : 0 }} transition={{ delay: reducedMotion ? 0 : 0.65, duration: reducedMotion ? 0 : 0.55 }} />
      <span className={fullFrame ? "pointer-events-none absolute bottom-20 left-5 text-xs text-[#865c65] sm:bottom-16" : "pointer-events-none absolute bottom-4 left-4 text-xs text-[#865c65]"}>Empat pintu · pilih tujuan untuk mendekat</span>
      <div ref={enterButton} className="pointer-events-none absolute left-0 top-0 z-10 opacity-0 transition-opacity duration-300" style={{ willChange: "transform, opacity" }}><Button size="sm" onClick={enterPortal} disabled={selected === null || entering}>Masuk</Button></div>
    </div>
    <p className={fullFrame ? "pointer-events-none absolute inset-x-0 bottom-14 text-center text-sm text-foreground/70 sm:bottom-10" : "text-center text-sm text-foreground/70"}>{selected === null ? "Klik pintu untuk memilih tujuan" : entering ? "Memasuki portal…" : "Klik Masuk untuk melanjutkan"}</p>
  </section>;
}
