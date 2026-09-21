"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

function Arch({ width, height, depth, color, z = 0 }: { width: number; height: number; depth: number; color: string; z?: number }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(archShape(width, height), {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.009, bevelThickness: 0.009, curveSegments: 48,
  }), [width, height, depth]);
  return <mesh geometry={geometry} position={[0, 0, z]} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.82} metalness={0} />
  </mesh>;
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
    focusX.current = THREE.MathUtils.damp(focusX.current, (selected - 1) * 2.8, 3.2, delta);
    camera.position.set(focusX.current, 0.05 - eased * 0.12, 9.8 - eased * 10.75);
    camera.lookAt(focusX.current, -0.05, -2);
    if (entering && t > 0.96 && !arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });
  return null;
}

function Door({ opening, index }: { opening: boolean; index: number }) {
  const pivot = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, opening ? -1.55 : 0, 2.2, delta);
  });
  const palette = [
    { frame: "#b97883", panel: "#dca5ae", trim: "#f1cbd0", metal: "#c99579" },
    { frame: "#a8788c", panel: "#d4aab8", trim: "#f2d6de", metal: "#d7b6a1" },
    { frame: "#9e7887", panel: "#c9a1b1", trim: "#e8cad5", metal: "#c5a9a3" },
  ][index];
  return <group position={[0, -1.55, 0]}>
    <mesh position={[0, 1.55, -4.5]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#f7d5d7" side={THREE.DoubleSide} />
    </mesh>
    <group position={[0, 0, -0.16]}>
      <Arch width={2.12} height={3.05} depth={0.09} color={palette.frame} />
    </group>
    <group ref={pivot} position={[-0.99, 0, -0.065]}>
      <group position={[0.99, 0, 0]}>
        <Arch width={1.96} height={2.94} depth={0.075} color={palette.panel} />
        <Arch width={1.72} height={2.68} depth={0.012} z={0.079} color={palette.trim} />
        <Arch width={1.66} height={2.62} depth={0.013} z={0.095} color={palette.panel} />
        <mesh position={[0.67, 1.26, 0.115]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={palette.metal} metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh position={[0.67, 1.26, 0.165]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.022, 0.18, 4, 12]} />
          <meshStandardMaterial color="#c99579" metalness={0.65} roughness={0.25} />
        </mesh>
      </group>
    </group>
    <mesh position={[0, 0.018, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.0, 0.24]} />
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
    <div className="relative h-[min(75dvh,690px)] min-h-[420px] overflow-hidden rounded-2xl bg-[#f8e6e6]">
      <Canvas shadows camera={{ position: [0, 0.05, 9.8], fov: 39 }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
        <PortalCamera entering={entering} reducedMotion={Boolean(reducedMotion)} selected={selected} onArrive={() => { const destinations = ["/event-planner", "/d-invitation", "/guestbook"]; if (selected === 1) { sessionStorage.setItem("dc-portal-entry", "1"); document.body.classList.add("dc-portal-arriving"); } router.push(destinations[selected]); }} />
        <color attach="background" args={["#f8e6e6"]} />
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#fff1e6", "#ad7180", 0.85]} />
        <directionalLight position={[-3, 6, 5]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002} />
        <pointLight position={[0, -1.35, -0.1]} intensity={opening[selected] ? 7 : 0.7} color="#ffe5bc" distance={3.5} />
        {[-1, 0, 1].map((offset, index) => (
          <group key={index} position={[offset * 2.8, 0, 0]} rotation={[0, angle, 0]}>
            <Door opening={opening[index]} index={index} />
            <pointLight position={[0, -1.2, -0.4]} intensity={opening[index] ? 3 : 0.15} color="#ffe1d5" distance={2.8} />
          </group>
        ))}
        <mesh position={[0, -1.57, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#f5d8d9" roughness={0.83} />
        </mesh>
      </Canvas>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(255,234,206,0.95),rgba(245,171,187,0.55)_45%,rgba(255,245,241,0.98)_85%)]" initial={false} animate={{ opacity: entering ? 1 : 0 }} transition={{ delay: reducedMotion ? 0 : 0.65, duration: reducedMotion ? 0 : 0.55 }} />
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
