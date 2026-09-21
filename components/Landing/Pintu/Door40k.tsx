"use client";

/**
 * Reusable React Three Fiber view of the ORIGINAL /40k.glb.
 *
 * The exporter produced one mesh without a frame/left/right rig. This
 * component is an intact, static preview only; the isolated /pintu-lab
 * continues to use asset-door-segmentation.js for experimental opening.
 * Avoid gltfjsx's generated @react-three/drei/three-stdlib imports: neither
 * is needed for loading a GLB with the already-installed Fiber and Three.
 */
import { useMemo } from "react";
import { useLoader, type ThreeElements } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function Door40k(props: ThreeElements["group"]) {
  const gltf = useLoader(GLTFLoader, "/40k.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  return <primitive object={scene} {...props} />;
}

useLoader.preload(GLTFLoader, "/40k.glb");
