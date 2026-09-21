"use client";

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import * as THREE from "three";

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
    const top = new THREE.Color("#edbdc4");
    for (let i = 0; i < position.count; i++) {
      const t = THREE.MathUtils.smoothstep(position.getY(i) / height, 0, 1);
      const colorAt = t < 0.55 ? bottom.clone().lerp(middle, t / 0.55) : middle.clone().lerp(top, (t - 0.55) / 0.45);
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

function PortalWorld({ image }: { image: string }) {
  const source = useLoader(THREE.TextureLoader, image);
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.wrapS = THREE.ClampToEdgeWrapping;
    copy.wrapT = THREE.ClampToEdgeWrapping;
    copy.repeat.set(1 / 1.68, 1 / 4.06);
    copy.offset.set(0.5, 0);
    copy.needsUpdate = true;
    return copy;
  }, [source]);
  const geometry = useMemo(() => new THREE.ShapeGeometry(archShape(1.68, 4.06), 48), []);
  return <mesh geometry={geometry} position={[0, 0, -0.19]}>
    <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>;
}

function GroundShadow() {
  return <mesh position={[0, -2.145, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[2.25, 1.45]} />
    <shadowMaterial transparent opacity={0.26} depthWrite={false} />
  </mesh>;
}

function Fireflies({ offset, reducedMotion }: { offset: number; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) {
      const t = i * 2.399963;
      const radius = 0.6 + ((i * 17) % 23) / 20;
      array[i * 3] = Math.cos(t) * radius;
      array[i * 3 + 1] = -1.65 + ((i * 13) % 23) / 23 * 4.5;
      array[i * 3 + 2] = 0.35 + ((i * 7) % 13) / 13 * 1.1;
    }
    return array;
  }, []);
  useFrame(({ clock }) => {
    if (!points.current || reducedMotion) return;
    const t = clock.elapsedTime;
    points.current.position.y = Math.sin(t * 0.43 + offset) * 0.14;
    points.current.rotation.y = Math.sin(t * 0.2 + offset) * 0.08;
    (points.current.material as THREE.PointsMaterial).opacity = 0.43 + Math.sin(t * 1.5 + offset) * 0.17;
  });
  return <points ref={points} position={[0, 0, 0]}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#fff0d8" size={0.052} transparent opacity={0.55} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
  </points>;
}

function PortalCamera({ entering, reducedMotion, selected, onArrive }: { entering: boolean; reducedMotion: boolean; selected: number; onArrive: () => void }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const arrived = useRef(false);
  const focusX = useRef(0);
  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, entering ? 1 : 0, reducedMotion ? 18 : 2.4, delta);
    const t = progress.current;
    const eased = t * t * (3 - 2 * t);
    focusX.current = THREE.MathUtils.damp(focusX.current, (selected - 1) * 2.55, 3.2, delta);
    camera.position.set(focusX.current, 0.05 - eased * 0.12, 11.7 - eased * 12.65);
    camera.lookAt(focusX.current, -0.05, -2);
    if (entering && t > 0.96 && !arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });
  return null;
}

function Door({ opening, image }: { opening: boolean; image: string }) {
  const pivot = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, opening ? -1.55 : 0, 2.2, delta);
  });
  const palette = { frame: "#b16b78", panel: "#c07a84", trim: "#aeb0b7", metal: "#d1a9a0" };
  return <group position={[0, -2.12, 0]}>
    <PortalWorld image={image} />
    <group position={[0, 0, -0.16]}>
      <Arch width={1.82} height={4.18} depth={0.09} color={palette.frame} />
    </group>
    <group ref={pivot} position={[-0.84, 0, -0.065]}>
      <group position={[0.84, 0, 0]}>
        <Arch width={1.68} height={4.06} depth={0.075} color={palette.panel} gradient />
        <Arch width={1.47} height={3.78} depth={0.012} z={0.079} color={palette.trim} />
        <Arch width={1.41} height={3.72} depth={0.013} z={0.095} color={palette.panel} gradient />
        {[-0.52, 0.52].map((x) => <mesh key={x} position={[x, 1.55, 0.113]} castShadow><boxGeometry args={[0.009, 2.5, 0.005]} /><meshStandardMaterial color="#aeb0b7" roughness={0.58} metalness={0.12} /></mesh>)}
        <mesh position={[0, 3.12, 0.115]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.16, 0.16, 0.008]} /><meshStandardMaterial color="#aeb0b7" metalness={0.28} roughness={0.48} /></mesh>

        <mesh position={[0.57, 1.85, 0.115]} castShadow>
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
      <planeGeometry args={[1.75, 0.24]} />
      <meshBasicMaterial color="#ffe4c7" transparent opacity={opening ? 0.75 : 0.28} depthWrite={false} />
    </mesh>
  </group>;
}

export default function SimpleDoorLab() {
  const [opening, setOpening] = useState([false, false, false]);
  const [selected, setSelected] = useState(1);
  const [angle, setAngle] = useState(0);
  const [entering, setEntering] = useState(false);
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  function enterPortal() {
    if (!opening[selected] || entering) return;
    setEntering(true);
  }
  return <section className="w-full max-w-5xl space-y-4">
    <div className="relative h-[min(82dvh,790px)] min-h-[480px] overflow-hidden bg-transparent">
      <Canvas shadows camera={{ position: [0, 0.05, 11.7], fov: 39 }} gl={{ alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.setClearColor(0x000000, 0); }}>
        <PortalCamera entering={entering} reducedMotion={Boolean(reducedMotion)} selected={selected} onArrive={() => { const destinations = ["/event-planner", "/d-invitation", "/guestbook"]; if (selected === 1) { sessionStorage.setItem("dc-portal-entry", "1"); document.body.classList.add("dc-portal-arriving"); } router.push(destinations[selected]); }} />
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#fff1e6", "#ad7180", 0.85]} />
        <directionalLight position={[-3, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} shadow-radius={5} />
        <pointLight position={[0, -1.35, -0.1]} intensity={opening[selected] ? 7 : 0.7} color="#ffe5bc" distance={3.5} />
        {[-1, 0, 1].map((offset, index) => (
          <group key={index} position={[offset * 2.55, 0, 0]} rotation={[0, angle, 0]}>
            <Door opening={opening[index]} image={["/wo.png", "/hp-digital.png", "/bukutamu.png"][index]} />
            <GroundShadow />
            <Fireflies offset={index * 2.1} reducedMotion={Boolean(reducedMotion)} />
            <pointLight position={[0, -1.2, -0.4]} intensity={opening[index] ? 3 : 0.15} color="#ffe1d5" distance={2.8} />
          </group>
        ))}
      </Canvas>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(255,234,206,0.95),rgba(245,171,187,0.55)_45%,rgba(255,245,241,0.98)_85%)]" initial={false} animate={{ opacity: entering ? 1 : 0 }} transition={{ delay: reducedMotion ? 0 : 0.65, duration: reducedMotion ? 0 : 0.55 }} />
      <div className="pointer-events-none absolute inset-x-0 top-5 flex justify-center gap-3 font-[family-name:var(--font-dc-heading)] text-xs text-[#865c65] sm:gap-8">{["Event Planner", "Digital Invitation", "Guestbook"].map((title, index) => <span key={title} className={`min-w-0 flex-1 text-center transition-opacity ${selected === index ? "opacity-100" : "opacity-60"}`}>{title}</span>)}</div>
      <span className="pointer-events-none absolute bottom-4 left-4 text-xs text-[#865c65]">Tiga pintu · pilih tujuan untuk mendekat</span>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-2">
      {["Event Planner", "Undangan Digital", "Guestbook"].map((label, index) => <button key={label} type="button" disabled={entering} onClick={() => { setSelected(index); setAngle(0); }} className={`rounded-full px-4 py-2 text-sm transition-colors ${selected === index ? "bg-[#a65e69] text-white" : "border border-[#c07a84]/50 text-foreground hover:bg-[#c07a84]/10"}`}>{label}</button>)}
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button type="button" disabled={entering} onClick={() => setOpening(v => v.map((open, index) => index === selected ? !open : open))} className="rounded-full bg-[#c07a84] px-5 py-2 text-white">{opening[selected] ? "Tutup pintu" : "Buka pintu"}</button>
      <button type="button" disabled={entering} onClick={() => setAngle(v => v === 0 ? -0.35 : 0)} className="rounded-full border border-[#c07a84] px-5 py-2 text-foreground"> {angle === 0 ? "Lihat ketebalan" : "Tampak depan"} </button>
      <button type="button" disabled={!opening[selected] || entering} onClick={enterPortal} className="rounded-full bg-[#a65e69] px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40">{entering ? "Memasuki portal…" : "Masuk portal"}</button>
    </div>
  </section>;
}
