"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTheme } from "@/components/Theme/ThemeProvider";

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

function Arch({ width, height, depth, color, z = 0, gradient = false, gradientBottom }: { width: number; height: number; depth: number; color: string; z?: number; gradient?: boolean; gradientBottom?: string }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(archShape(width, height), {
    depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.009, bevelThickness: 0.009, curveSegments: 48,
  }), [width, height, depth]);
  useMemo(() => {
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const bottom = new THREE.Color(gradientBottom ?? color);
    const middle = new THREE.Color(color);
    const top = new THREE.Color(color);
    for (let i = 0; i < position.count; i++) {
      const t = THREE.MathUtils.smoothstep(position.getY(i) / height, 0, 0.44);
      const colorAt = t < 0.8 ? bottom.clone().lerp(middle, t / 0.8) : middle.clone().lerp(top, (t - 0.8) / 0.2);
      colors[i * 3] = colorAt.r;
      colors[i * 3 + 1] = colorAt.g;
      colors[i * 3 + 2] = colorAt.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [geometry, height, color, gradientBottom]);
  return <mesh geometry={geometry} position={[0, 0, z]} castShadow receiveShadow>
    {gradient
      ? <meshStandardMaterial vertexColors roughness={0.75} metalness={0.03} emissive={color} emissiveIntensity={0.16} />
      : <meshStandardMaterial color={color} roughness={0.82} metalness={0} emissive={color} emissiveIntensity={0.14} />}
  </mesh>;
}

function DoorFrame({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const outer = archShape(2.02, 4.18);
    const inner = archShape(1.88, 4.06);
    // Shape holes must wind opposite the outer contour.
    const hole = new THREE.Path(inner.getPoints(64).reverse());
    outer.holes.push(hole);
    return new THREE.ExtrudeGeometry(outer, { depth: 0.09, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 48 });
  }, []);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.7} metalness={0.05} emissive={color} emissiveIntensity={0.13} side={THREE.DoubleSide} /></mesh>;
}

function PortalWorld({ image, entering }: { image: string; entering: boolean }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const imageMaterial = useRef<THREE.MeshBasicMaterial>(null);
  useEffect(() => {
    let cancelled = false;
    let loaded: THREE.Texture | null = null;
    // A missing or still-syncing local image should not crash the whole 3D
    // landing. Keep a warm woodland portal surface while its image loads.
    const loader = new THREE.TextureLoader();
    loader.load(
      image,
      (nextTexture) => {
        loaded = nextTexture;
        if (cancelled) {
          nextTexture.dispose();
          return;
        }
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        nextTexture.wrapS = THREE.ClampToEdgeWrapping;
        nextTexture.wrapT = THREE.ClampToEdgeWrapping;
        nextTexture.anisotropy = 8;
        nextTexture.needsUpdate = true;
        setTexture(nextTexture);
      },
      undefined,
      (error) => {
        if (!cancelled) console.warn(`[Undara] Portal image unavailable: ${image}. Confirm that the file exists in local public/ and responds with HTTP 200.`, error);
      },
    );
    return () => {
      cancelled = true;
      if (loaded) loaded.dispose();
    };
  }, [image]);
  useFrame((_, delta) => {
    if (imageMaterial.current) {
      imageMaterial.current.opacity = THREE.MathUtils.damp(imageMaterial.current.opacity, entering ? 0 : 1, 4.5, delta);
    }
  });
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
    {/* The service image is visible while choosing a door, then fades into a warm woodland passage as the camera enters. */}
    <mesh geometry={geometry} position={[0, 0, -0.008]}>
      <meshBasicMaterial color="#4F463A" toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
    {texture && <mesh geometry={geometry}>
      <meshBasicMaterial ref={imageMaterial} map={texture} transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>}
  </group>;
}


/** Warm woodland light that sits behind the whole doorway and leaks around the frame. */
function DoorBacklight({ opening, entering, isDarkMode }: { opening: boolean; entering: boolean; isDarkMode: boolean }) {
  const material = useRef<THREE.SpriteMaterial>(null);
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(128, 250, 8, 128, 250, 190);
      gradient.addColorStop(0, "rgba(255,250,238,0.98)");
      gradient.addColorStop(0.24, "rgba(244,218,177,0.66)");
      gradient.addColorStop(0.58, "rgba(214,179,140,0.24)");
      gradient.addColorStop(1, "rgba(214,179,140,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 512);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => map.dispose(), [map]);

  useFrame((_, delta) => {
    if (!material.current) return;
    const target = opening ? (entering ? 0.92 : 0.72) : 0.08;
    material.current.opacity = THREE.MathUtils.damp(material.current.opacity, target, 2.8, delta);
  });

  return (
    <sprite position={[0, 1.52, -0.58]} scale={[3.35, 5.8, 1]}>
      <spriteMaterial
        ref={material}
        map={map}
        color={isDarkMode ? "#D6B38C" : "#E7C89F"}
        transparent
        opacity={0.08}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

/** A soft pool of light revealed by the opening panel, without a rectangular overlay. */
function DoorOpeningGlow({ opening, entering }: { opening: boolean; entering: boolean }) {
  const material = useRef<THREE.SpriteMaterial>(null);
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, "rgba(255,250,238,0.86)");
      gradient.addColorStop(0.27, "rgba(244,218,177,0.46)");
      gradient.addColorStop(0.65, "rgba(214,179,140,0.13)");
      gradient.addColorStop(1, "rgba(214,179,140,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  useFrame((_, delta) => {
    if (material.current) {
      material.current.opacity = THREE.MathUtils.damp(
        material.current.opacity, opening ? (entering ? 0.55 : 0.34) : 0, 2.6, delta,
      );
    }
  });
  return <sprite position={[0, 1.64, -0.38]} scale={[1.78, 3.55, 1]}>
    <spriteMaterial ref={material} map={map} color="#F0D2A8" transparent opacity={0}
      depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
  </sprite>;
}

function GroundShadow({ isDarkMode }: { isDarkMode: boolean }) {
  // Only a soft contact patch follows each orbiting door. The actual cast
  // shadow is received by one scene-wide floor so its arch silhouette is not
  // clipped into a rectangle.
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 192;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(96, 96, 5, 96, 96, 92);
      gradient.addColorStop(0, "rgba(57,25,31,0.34)");
      gradient.addColorStop(0.34, "rgba(57,25,31,0.18)");
      gradient.addColorStop(0.72, "rgba(57,25,31,0.05)");
      gradient.addColorStop(1, "rgba(57,25,31,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 192, 192);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return <mesh position={[0, -2.142, 0.12]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
    <planeGeometry args={[2.45, 1.18]} />
    <meshBasicMaterial
      map={texture}
      transparent
      depthWrite={false}
      toneMapped={false}
      opacity={isDarkMode ? 0.72 : 0.58}
    />
  </mesh>;
}

function ForestShadowFloor({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <mesh position={[0, -2.147, 2.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-5}>
      <planeGeometry args={[17, 13]} />
      <shadowMaterial
        transparent
        opacity={isDarkMode ? 0.30 : 0.18}
        color={isDarkMode ? "#130d0f" : "#4B3A2E"}
        depthWrite={false}
      />
    </mesh>
  );
}

function ForestMist({ isDarkMode }: { isDarkMode: boolean }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(192, 142, 8, 192, 142, 180);
      gradient.addColorStop(0, "rgba(255,250,240,0.78)");
      gradient.addColorStop(0.3, "rgba(241,220,192,0.34)");
      gradient.addColorStop(0.68, "rgba(214,179,140,0.09)");
      gradient.addColorStop(1, "rgba(214,179,140,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 384, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);

  return (
    <sprite position={[0, 0.15, -2.65]} scale={[8.4, 5.1, 1]} renderOrder={-6}>
      <spriteMaterial
        map={map}
        color={isDarkMode ? "#D6B38C" : "#F3E3CF"}
        transparent
        opacity={isDarkMode ? 0.12 : 0.18}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

function Fireflies({ reducedMotion, isDarkMode }: { reducedMotion: boolean; isDarkMode: boolean }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const particles = Array.from({ length: 110 }, (_, i) => {
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
  const glowMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,0.95)");
      gradient.addColorStop(0.16, "rgba(255,255,255,0.72)");
      gradient.addColorStop(0.42, "rgba(255,255,255,0.24)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => glowMap.dispose(), [glowMap]);
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
    (points.current.material as THREE.PointsMaterial).opacity = reducedMotion ? 0.38 : 0.42 + Math.sin(time * 0.37) * 0.09;
  });
  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial map={glowMap} color={isDarkMode ? "#D6B38C" : "#B28B5E"} size={0.19} transparent opacity={0.42} alphaTest={0.005} depthWrite={false} sizeAttenuation blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending} />
  </points>;
}

function PortalCamera({ entering, reducedMotion, onCover, onArrive }: { entering: boolean; reducedMotion: boolean; onCover: () => void; onArrive: () => void }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const arrived = useRef(false);
  const coverStarted = useRef(false);
  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, entering ? 1 : 0, reducedMotion ? 18 : 2.4, delta);
    const t = progress.current;
    const eased = t * t * (3 - 2 * t);
    // Stop just in front of the selected portal surface; passing behind it would expose other orbiting doors.
    camera.position.set(0, 0.05 - eased * 0.12, 11.7 - eased * 9.8);
    camera.lookAt(0, -0.05, -2);
    if (entering && t > 0.7 && !coverStarted.current) {
      coverStarted.current = true;
      onCover();
    }
    if (entering && t > 0.96 && !arrived.current) {
      arrived.current = true;
      onArrive();
    }
  });
  return null;
}


type DoorCrestKind = "event-planner" | "digital-invitation" | "guestbook" | "physical-invitation";

function DoorCrest({ kind, color }: { kind: DoorCrestKind; color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return new THREE.CanvasTexture(canvas);

    context.clearRect(0, 0, 256, 256);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 17;
    context.lineCap = "round";
    context.lineJoin = "round";

    const line = (points: Array<[number, number]>) => {
      context.beginPath();
      points.forEach(([x, y], index) => index === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
      context.stroke();
    };

    if (kind === "event-planner") {
      // Clipboard + checklist: planning/coordination, not a decorative calendar.
      context.strokeRect(55, 66, 146, 138);
      context.strokeRect(94, 48, 68, 35);
      [[91, 112], [91, 151], [91, 187]].forEach(([x, y]) => {
        context.strokeRect(x - 15, y - 15, 30, 30);
      });
      line([[82, 112], [90, 120], [104, 101]]);
      line([[82, 151], [90, 159], [104, 140]]);
      line([[118, 111], [174, 111]]);
      line([[118, 150], [174, 150]]);
      line([[118, 187], [174, 187]]);
    } else if (kind === "digital-invitation") {
      // Smartphone-first glyph; the small card on-screen keeps the invitation cue secondary.
      context.beginPath();
      context.moveTo(84, 43);
      context.lineTo(172, 43);
      context.quadraticCurveTo(190, 43, 190, 61);
      context.lineTo(190, 202);
      context.quadraticCurveTo(190, 220, 172, 220);
      context.lineTo(84, 220);
      context.quadraticCurveTo(66, 220, 66, 202);
      context.lineTo(66, 61);
      context.quadraticCurveTo(66, 43, 84, 43);
      context.closePath();
      context.stroke();
      line([[111, 61], [145, 61]]);
      context.beginPath();
      context.arc(128, 200, 5, 0, Math.PI * 2);
      context.fill();
      context.strokeRect(91, 96, 74, 54);
      line([[91, 101], [128, 128], [165, 101]]);
    } else if (kind === "guestbook") {
      context.beginPath();
      context.moveTo(128, 83);
      context.bezierCurveTo(104, 65, 72, 64, 48, 76);
      context.lineTo(48, 182);
      context.bezierCurveTo(75, 169, 105, 171, 128, 190);
      context.bezierCurveTo(151, 171, 181, 169, 208, 182);
      context.lineTo(208, 76);
      context.bezierCurveTo(184, 64, 152, 65, 128, 83);
      context.closePath();
      context.stroke();
      line([[128, 84], [128, 190]]);
    } else {
      context.strokeRect(46, 76, 164, 112);
      line([[46, 82], [128, 143], [210, 82]]);
      context.beginPath();
      context.arc(128, 153, 27, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#000000";
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.arc(128, 153, 10, 0, Math.PI * 2);
      context.fill();
      context.globalCompositeOperation = "source-over";
    }

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [kind, color]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[0, 3.11, 0.119]}>
      <mesh>
        <ringGeometry args={[0.185, 0.205, 40]} />
        <meshStandardMaterial color={color} metalness={0.16} roughness={0.48} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.006]} renderOrder={4}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
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

function Door({ opening, image, title, crest, entering, isDarkMode }: { opening: boolean; image: string; title: string; crest: DoorCrestKind; entering: boolean; isDarkMode: boolean }) {
  const pivot = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (pivot.current) pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, opening ? -1.55 : 0, 2.2, delta);
  });
  const palette = {
    frame: "#703B3B",
    panel: "#703B3B",
    panelBottom: "#5E3030",
    trim: isDarkMode ? "#D6B38C" : "#EDE3D8",
    metal: "#B89168",
  };
  return <group position={[0, -2.12, 0]}>
    <DoorBacklight opening={opening} entering={entering} isDarkMode={isDarkMode} />
    <PortalWorld image={image} entering={entering} />
    <DoorOpeningGlow opening={opening} entering={entering} />
    <group position={[0, 0, -0.16]}>
      <DoorFrame color={palette.frame} />
    </group>
    <group ref={pivot} position={[-0.94, 0, -0.065]}>
      <group position={[0.94, 0, 0]}>
        <Arch width={1.88} height={4.06} depth={0.075} color={palette.panel} gradient gradientBottom={palette.panelBottom} />
        <Arch width={1.67} height={3.78} depth={0.012} z={0.079} color={palette.trim} />
        <Arch width={1.61} height={3.72} depth={0.013} z={0.095} color={palette.panel} gradient gradientBottom={palette.panelBottom} />
        <DoorTitle title={title} opening={opening} />
        {[-0.62, 0.62].map((x) => <mesh key={x} position={[x, 1.55, 0.113]} castShadow><boxGeometry args={[0.009, 2.5, 0.005]} /><meshStandardMaterial color={palette.trim} roughness={0.58} metalness={0.12} emissive={palette.trim} emissiveIntensity={0.1} /></mesh>)}
        <DoorCrest kind={crest} color={palette.trim} />

        <mesh position={[0.67, 1.85, 0.115]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={palette.metal} metalness={0.65} roughness={0.25} emissive={palette.metal} emissiveIntensity={0.05} />
        </mesh>
        <mesh position={[0.57, 1.85, 0.165]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.022, 0.18, 4, 12]} />
          <meshStandardMaterial color={palette.metal} metalness={0.65} roughness={0.25} emissive={palette.metal} emissiveIntensity={0.05} />
        </mesh>
      </group>
    </group>
  </group>;
}

const PORTALS: Array<{ title: string; image: string; href: string; crest: DoorCrestKind }> = [
  { title: "Event Planner", image: "/assets/landing/doors/event-planner.webp", href: "/event-planner", crest: "event-planner" },
  { title: "Undangan Digital", image: "/assets/landing/doors/digital-invitation.webp", href: "/d-invitation", crest: "digital-invitation" },
  { title: "Guestbook", image: "/assets/landing/doors/guestbook.webp", href: "/guestbook", crest: "guestbook" },
  { title: "Undangan Fisik", image: "/assets/landing/doors/physical-invitation.webp", href: "/undangan-fisik", crest: "physical-invitation" },
];

function OrbitalDoors({ selected, opening, entering, reducedMotion, onSelect, enterButton, closeButton, isDarkMode }: { selected: number | null; opening: boolean[]; entering: boolean; reducedMotion: boolean; onSelect: (index: number) => void; enterButton: React.RefObject<HTMLDivElement | null>; closeButton: React.RefObject<HTMLButtonElement | null>; isDarkMode: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const phase = useRef(0);
  const hovered = useRef<number | null>(null);
  const buttonAnchor = useMemo(() => new THREE.Vector3(), []);
  const closeAnchor = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }, delta) => {
    if (selected !== null || entering) hovered.current = null;
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
      // Preserve the existing orbit and scale easing; only strengthen perspective:
      // rear doors recede a little more, front doors read a little larger.
      const orbitScale = (0.62 + (z + 1.25) / 2.5 * 0.23) * (size.width < 640 ? Math.min(1, size.width / 500) : 1);
      const mobileScale = size.width < 640 ? Math.min(1, size.width / 500) : 1;
      const selectedScale = (selected === index ? 1.12 : 0.70) * mobileScale;
      const targetScale = selected === null
        ? orbitScale * (hovered.current === index && !reducedMotion ? 1.10 : 1)
        : selectedScale;
      const nextScale = THREE.MathUtils.damp(group.scale.x, targetScale, 3.8, delta);
      group.scale.setScalar(nextScale);
    });
    const close = closeButton.current;
    const button = enterButton.current;
    const active = selected === null ? null : groups.current[selected];
    if (close && active && !entering) {
      closeAnchor.set(0.88, 2.18, 0.16);
      active.localToWorld(closeAnchor);
      closeAnchor.project(camera);
      close.style.left = `${(closeAnchor.x + 1) * size.width / 2}px`;
      close.style.top = `${(1 - closeAnchor.y) * size.height / 2}px`;
      close.style.opacity = "1";
      close.style.pointerEvents = "auto";
    } else if (close) {
      close.style.opacity = "0";
      close.style.pointerEvents = "none";
    }
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
  return <>{PORTALS.map((portal, index) => <group key={index} ref={(node) => { groups.current[index] = node; }}
    onPointerOver={(event) => { event.stopPropagation(); if (selected === null && !entering && !reducedMotion) hovered.current = index; }}
    onPointerOut={(event) => { event.stopPropagation(); if (hovered.current === index) hovered.current = null; }}
    onClick={(event) => { event.stopPropagation(); if (!entering) onSelect(index); }}>
    <Door opening={opening[index]} image={portal.image} title={portal.title} crest={portal.crest} entering={entering && selected === index} isDarkMode={isDarkMode} />
    <GroundShadow isDarkMode={isDarkMode} />
    <pointLight position={[0, 1.65, -1.8]} intensity={opening[index] ? 2.35 : 0.12} color="#F2D4AA" distance={5.2} decay={2} />
  </group>)}</>;
}

export default function LandingDoorScene({ fullFrame = false, onDoorOpenChange }: { fullFrame?: boolean; onDoorOpenChange?: (open: boolean) => void }) {
  const [opening, setOpening] = useState(PORTALS.map(() => false));
  const [selected, setSelected] = useState<number | null>(null);
  const [entering, setEntering] = useState(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionStarted = useRef(false);
  useEffect(() => () => { if (navigationTimer.current) clearTimeout(navigationTimer.current); }, []);
  function startWoodlandCover() {
    if (transitionStarted.current || selected === null) return;
    transitionStarted.current = true;
    // Start the foliage passage during the existing camera zoom, before its view can reach the portal plane.
    window.dispatchEvent(new CustomEvent("undara-portal-start", { detail: { href: PORTALS[selected].href } }));
  }
  function finishZoom() {
    if (selected === null) return;
    startWoodlandCover(); // Fallback if the mid-zoom callback was missed (including reduced motion).
    // Route change happens only after foliage has covered the original door; no second door scene is rendered.
    navigationTimer.current = setTimeout(() => router.push(PORTALS[selected].href), reducedMotion ? 40 : 220);
  }
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { isDarkMode } = useTheme();
  const enterButton = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  function enterPortal() {
    if (selected === null || !opening[selected] || entering) return;
    window.dispatchEvent(new Event("undara-portal-prime"));
    setEntering(true);
  }
  return <section className={fullFrame ? "absolute inset-0 h-full w-full" : "w-full max-w-5xl space-y-4"}>
    <div className={fullFrame ? "absolute inset-0 h-full w-full overflow-hidden bg-transparent" : "relative h-[min(82dvh,790px)] min-h-[480px] overflow-hidden bg-transparent"}>
      <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0.05, 11.7], fov: 39 }} gl={{ alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.setClearColor(0x000000, 0); }}>
        <PortalCamera entering={entering} reducedMotion={Boolean(reducedMotion)} onCover={startWoodlandCover} onArrive={finishZoom} />
        {/* All directional/point illumination originates behind the doors. Neutral ambient only keeps the PBR base color readable. */}
        <ambientLight intensity={0.40} />
        <directionalLight
          position={[0, 6.1, -7.8]}
          intensity={3.05}
          color="#F2D8B5"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={6}
          shadow-camera-bottom={-4}
          shadow-bias={-0.00015}
          shadow-radius={6}
        />
        <pointLight position={[0, 1.35, -2.9]} intensity={selected !== null && opening[selected] ? 4.6 : 0.30} color="#F3D8B1" distance={6.8} decay={2} />
        <ForestMist isDarkMode={isDarkMode} />
        <ForestShadowFloor isDarkMode={isDarkMode} />
        <Fireflies reducedMotion={Boolean(reducedMotion)} isDarkMode={isDarkMode} />
        <OrbitalDoors selected={selected} opening={opening} entering={entering} reducedMotion={Boolean(reducedMotion)} onSelect={(index) => { setSelected(index); setOpening(PORTALS.map((_, i) => i === index)); onDoorOpenChange?.(true); }} enterButton={enterButton} closeButton={closeButton} isDarkMode={isDarkMode} />
      </Canvas>
      <button ref={closeButton} type="button" aria-label="Tutup pintu dan putar kembali" title="Kembali melihat semua pintu" onClick={() => { setSelected(null); setOpening(PORTALS.map(() => false)); onDoorOpenChange?.(false); }} className="pointer-events-none absolute z-20 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-background/90 text-primary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><X className="size-3.5" /></button>
      <div ref={enterButton} className="pointer-events-none absolute left-0 top-0 z-10 opacity-0 transition-opacity duration-300" style={{ willChange: "transform, opacity" }}><Button size="sm" onClick={enterPortal} disabled={selected === null || entering}>Masuk</Button></div>
    </div>
    
  </section>;
}
