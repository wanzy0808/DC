/* Asset-first Pintu 1 lab. Uses the actual GLB, never a procedural door facade.
 * A local public/mesh.glb is preferred; the repository's public/white_mesh.glb
 * is the fallback. This viewer does not pretend a fused AI mesh can open.
 */
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const HEIGHT = 7.6;
const VIEWS = [-27, 0, 27];
const COLORS = {
  rose: 0xc78e9b,
  inset: 0xd8adb2,
  ivory: 0xe4d2ca,
  shadow: 0xb99393,
  metal: 0xae8278,
};

export async function mountAssetDoor(container, options = {}) {
  const THREE = await import("three");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
  const root = new THREE.Group();
  scene.add(root);

  let disposed = false;
  let contextLost = false;
  let renderer = null;
  let resizeObserver = null;
  let intersectionObserver = null;
  let visible = true;
  let frameId = 0;
  let view = 0;
  let targetView = 0;
  let baseDistance = 16;
  let model = null;
  let modelUrl = "";
  let loadedHeight = HEIGHT;
  const createdGeometry = [];
  const createdMaterial = [];
  const createdTextures = [];

  const hemi = new THREE.HemisphereLight(0xfff8f2, 0x8a7074, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff3e9, 1.65);
  key.position.set(-4.2, 8, 6.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -7;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffdbd5, 0.42);
  fill.position.set(5, 3, -4);
  scene.add(fill);

  // A genuinely lit threshold, plus a small soft visible pool directly under
  // the feet. The pool lies on the floor; it is not a glowing rectangle behind
  // the door and never replaces the model's real shadow.
  const underLight = new THREE.SpotLight(0xffd8d0, 3.4, 4.5, Math.PI / 3.4, 0.95, 2);
  underLight.position.set(0, 0.84, 0.95);
  underLight.target.position.set(0, 0, 0.3);
  scene.add(underLight, underLight.target);
  const floorGeo = new THREE.PlaneGeometry(25, 25);
  const floorMat = new THREE.ShadowMaterial({ color: 0x665050, opacity: 0.24 });
  createdGeometry.push(floorGeo);
  createdMaterial.push(floorMat);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.018;
  floor.receiveShadow = true;
  scene.add(floor);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 63);
    gradient.addColorStop(0, "rgba(255,213,198,0.47)");
    gradient.addColorStop(0.4, "rgba(238,167,160,0.22)");
    gradient.addColorStop(1, "rgba(238,167,160,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    createdTextures.push(texture);
    const glowGeo = new THREE.PlaneGeometry(3.7, 1.65);
    const glowMat = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, depthWrite: false,
      toneMapped: false, opacity: 0.72, side: THREE.DoubleSide,
    });
    createdGeometry.push(glowGeo);
    createdMaterial.push(glowMat);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.009, 0.30);
    glow.renderOrder = 1;
    scene.add(glow);
  }

  function render() {
    frameId = 0;
    if (disposed || contextLost || !renderer || !visible || document.hidden) return;
    const delta = targetView - view;
    view = options.reducedMotion || Math.abs(delta) < 0.002 ? targetView : view + delta * 0.22;
    root.rotation.y = THREE.MathUtils.degToRad(view);
    renderer.render(scene, camera);
    if (view !== targetView) invalidate();
  }

  function invalidate() {
    if (!disposed && !contextLost && visible && !document.hidden && !frameId)
      frameId = window.requestAnimationFrame(render);
  }

  function resize() {
    if (disposed || !renderer) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const radians = THREE.MathUtils.degToRad(camera.fov / 2);
    const distanceForHeight = loadedHeight * 1.15 / (2 * Math.tan(radians));
    const distanceForWidth = loadedHeight * 0.85 / (2 * Math.tan(radians) * (width / height));
    baseDistance = Math.max(distanceForHeight, distanceForWidth);
    camera.position.set(0, loadedHeight * 0.48, baseDistance);
    camera.lookAt(0, loadedHeight * 0.48, 0);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }

  function onVisibility() { invalidate(); }
  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    options.onContextChange?.("lost");
  }
  function onContextRestored() {
    contextLost = false;
    options.onContextChange?.("restored");
    resize();
  }

  function paint(mesh, name, overall, meshCount) {
    // Names exported by modeling tools may identify the materials. Prefer
    // source object/material semantics; do not paint a fused mesh's entire
    // frame as if its parts were separate editable meshes.
    const label = name.toLowerCase();
    const hardware = /handle|knob|hinge|latch|metal|brass|gold|lock|grip|pegangan|engsel/.test(label);
    const frame = /frame|jamb|crown|capital|cornice|pillar|pilaster|kusen|arch|lintel/.test(label);
    const inset = /inset|panel|leaf|door|slab|daun|pintu/.test(label);
    const color = hardware ? COLORS.metal : frame ? COLORS.ivory :
      inset ? COLORS.rose : meshCount === 1 ? COLORS.inset : COLORS.ivory;
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const recolored = originals.map((source) => {
      // Clone retains baked GLB maps, normal maps, transparency and geometry
      // detail. Replacing every original with an untextured flat material
      // would discard the actual 3D asset's finish.
      const material = source.clone();
      if (material.color) material.color.setHex(color);
      if ("roughness" in material) material.roughness = hardware ? 0.46 : 0.79;
      if ("metalness" in material) material.metalness = hardware ? 0.55 : 0.035;
      material.needsUpdate = true;
      createdMaterial.push(material);
      return material;
    });
    mesh.material = Array.isArray(mesh.material) ? recolored : recolored[0];
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frameId) cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    renderer?.domElement.removeEventListener("webglcontextlost", onContextLost);
    renderer?.domElement.removeEventListener("webglcontextrestored", onContextRestored);
    if (renderer?.domElement.parentNode === container) container.removeChild(renderer.domElement);
    // The loader's original materials/maps are owned by this model and are
    // distinct from recolored clones, which are tracked in createdMaterial.
    if (model) {
      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      model.traverse((child) => {
        if (!child.isMesh) return;
        geometries.add(child.geometry);
        for (const material of (Array.isArray(child.userData.originalMaterials) ?
          child.userData.originalMaterials : [child.userData.originalMaterials])) {
          if (material) materials.add(material);
        }
      });
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
        material.dispose();
      }
      for (const texture of textures) texture.dispose();
      for (const geometry of geometries) geometry.dispose();
      root.remove(model);
    }
    createdGeometry.forEach(item => item.dispose());
    createdMaterial.forEach(item => item.dispose());
    createdTextures.forEach(item => item.dispose());
    renderer?.dispose();
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
    renderer.setClearColor(0xffffff, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      window.matchMedia("(max-width: 640px)").matches ? 1.15 : 1.5));
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    intersectionObserver = new IntersectionObserver(entries => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible) invalidate();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    const loader = new GLTFLoader();
    let lastError;
    // The user's local mesh.glb may not yet have been pushed to GitHub.
    // white_mesh.glb is confirmed in public/ on main and works as a fallback.
    for (const candidate of ["/mesh.glb", "/white_mesh.glb"]) {
      try {
        const gltf = await loader.loadAsync(candidate);
        if (disposed) {
          // Avoid mounting after React unmounts during an in-flight load.
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.geometry?.dispose();
              for (const mat of (Array.isArray(child.material) ? child.material : [child.material])) mat?.dispose();
            }
          });
          return null;
        }
        model = gltf.scene;
        modelUrl = candidate;
        break;
      } catch (error) { lastError = error; }
    }
    if (!model) throw lastError || new Error("GLB tidak ditemukan");
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y < 1e-6)
      throw new Error("Geometri GLB tidak valid");
    const meshes = [];
    model.traverse((child) => { if (child.isMesh) meshes.push(child); });
    for (const mesh of meshes) {
      mesh.userData.originalMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      paint(mesh, mesh.name + " " + mesh.userData.originalMaterials.map(m => m?.name || "").join(" "), bounds, meshes.length);
    }
    // Normalize the asset without changing the geometry or giving the
    // frame a fictitious pivot: center horizontally, feet exactly on ground.
    const scale = HEIGHT / size.y;
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    root.add(model);
    loadedHeight = HEIGHT;
    resize();
    options.onLoaded?.({ url: modelUrl, meshCount: meshes.length });
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    setView(degrees) {
      targetView = THREE.MathUtils.clamp(degrees, -40, 40);
      invalidate();
    },
    capturePng() {
      if (disposed || contextLost || !renderer || document.hidden) return null;
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/png");
    },
    dispose,
  };
}
