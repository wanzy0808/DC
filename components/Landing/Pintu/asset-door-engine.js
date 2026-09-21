/* Pintu 1 asset-first: the actual public/40k.glb is the primary sculpt.
 * public/20k.glb is backup; both were checked in GitHub and are a single
 * unrigged mesh. asset-door-segmentation.js clips their original triangles
 * into two hinged leaves + a stationary frame, keeping the actual relief.
 * The split seam is provisional and must be inspected at 0–110 degrees.
 */
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildHingedAssetDoor } from "./asset-door-segmentation.js";

const HEIGHT = 7.6;
const OPEN_MAX = 110;
const ASSET_URLS = ["/40k.glb", "/mesh-40k.glb", "/mesh_40k.glb", "/mesh.glb", "/20k.glb"];
export async function mountAssetDoor(container, options = {}) {
  const THREE = await import("three");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  let renderer;
  let model;
  let room;
  let environmentTarget;
  let pmrem;
  let disposed = false;
  let contextLost = false;
  let frameId = 0;
  let visible = true;
  let resizeObserver;
  let intersectionObserver;
  let view = 0;
  let targetView = 0;
  let angle = 0;
  let targetAngle = 0;
  let lastFrame = 0;
  const createdGeometry = [];
  const createdMaterials = [];
  const createdTextures = [];

  const ambient = new THREE.HemisphereLight(0xfff3e9, 0x66535d, 0.82);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffe9df, 1.45);
  key.position.set(-4.6, 7.8, 5.3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 35;
  key.shadow.bias = -0.00022;
  key.shadow.normalBias = 0.011;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe5de, 0.34);
  fill.position.set(5, 4, -5);
  scene.add(fill);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.ShadowMaterial({ color: 0x564044, opacity: 0.28 }),
  );
  createdGeometry.push(floor.geometry);
  createdMaterials.push(floor.material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.022;
  floor.receiveShadow = true;
  scene.add(floor);

  // Light only at the threshold; the ground receives the real door shadow.
  const threshold = new THREE.SpotLight(0xffddca, 2.4, 4.8, Math.PI / 3.5, 0.92, 2);
  threshold.position.set(0, 0.75, 1);
  threshold.target.position.set(0, 0, 0.15);
  scene.add(threshold, threshold.target);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, "rgba(247,206,195,0.34)");
    gradient.addColorStop(0.45, "rgba(236,171,171,0.13)");
    gradient.addColorStop(1, "rgba(236,171,171,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    createdTextures.push(texture);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 1.4),
      new THREE.MeshBasicMaterial({
        map: texture, transparent: true, depthWrite: false,
        toneMapped: false, opacity: 0.8, side: THREE.DoubleSide,
      }),
    );
    createdGeometry.push(glow.geometry);
    createdMaterials.push(glow.material);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.008, 0.22);
    glow.renderOrder = 1;
    scene.add(glow);
  }

  function invalidate() {
    if (!disposed && !contextLost && !frameId && visible && !document.hidden)
      frameId = window.requestAnimationFrame(render);
  }

  function render(now) {
    frameId = 0;
    if (disposed || contextLost || !renderer || !visible || document.hidden) {
      lastFrame = 0;
      return;
    }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.055) : 0.016;
    lastFrame = now;
    const ease = options.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.7);
    view += (targetView - view) * ease;
    angle += (targetAngle - angle) * ease;
    if (Math.abs(view - targetView) < 0.01) view = targetView;
    if (Math.abs(angle - targetAngle) < 0.02) angle = targetAngle;
    if (model) {
      model.root.rotation.y = THREE.MathUtils.degToRad(view);
      if (model.canOpen) {
        const radians = THREE.MathUtils.degToRad(angle);
        model.leftPivot.rotation.y = -radians;
        model.rightPivot.rotation.y = radians;
      }
    }
    renderer.render(scene, camera);
    if (view !== targetView || angle !== targetAngle) invalidate();
  }

  function resize() {
    if (!renderer || disposed) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    // Keep the frame AND both open leaves in view in a narrow viewport.
    const distanceHeight = HEIGHT * 1.13 / (2 * Math.tan(halfFov));
    const distanceWidth = HEIGHT * 0.90 / (2 * Math.tan(halfFov) * aspect);
    camera.position.set(0, HEIGHT * 0.49, Math.max(distanceHeight, distanceWidth));
    camera.lookAt(0, HEIGHT * 0.49, 0);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }
  function onVisibility() {
    lastFrame = 0;
    invalidate();
  }
  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    options.onContextChange?.("lost");
  }
  function onContextRestored() {
    contextLost = false;
    lastFrame = 0;
    options.onContextChange?.("restored");
    resize();
  }

  function disposeSource(sceneRoot) {
    const geos = new Set(), mats = new Set(), tex = new Set();
    sceneRoot.traverse(node => {
      if (!node.isMesh) return;
      geos.add(node.geometry);
      for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
        if (!material) continue;
        mats.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) tex.add(value);
      }
    });
    geos.forEach(g => g?.dispose());
    mats.forEach(m => m?.dispose());
    tex.forEach(t => t?.dispose());
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    renderer?.domElement.removeEventListener("webglcontextlost", onContextLost);
    renderer?.domElement.removeEventListener("webglcontextrestored", onContextRestored);
    if (renderer?.domElement.parentNode === container) container.removeChild(renderer.domElement);
    model?.dispose();
    room?.dispose?.();
    environmentTarget?.dispose();
    pmrem?.dispose();
    createdGeometry.forEach(g => g.dispose());
    createdMaterials.forEach(m => m.dispose());
    createdTextures.forEach(t => t.dispose());
    renderer?.dispose();
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.91;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      window.matchMedia("(max-width: 640px)").matches ? 1.2 : 1.5));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    // Soft studio environment brings back subtle highlights on the carved
    // surfaces without the plastic sheen caused by excessive direct lighting.
    pmrem = new THREE.PMREMGenerator(renderer);
    room = new RoomEnvironment();
    environmentTarget = pmrem.fromScene(room, 0.025);
    scene.environment = environmentTarget.texture;

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    intersectionObserver = new IntersectionObserver(entries => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible) { lastFrame = 0; invalidate(); }
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    const loader = new GLTFLoader();
    let source, url;
    let lastError;
    for (const candidate of ASSET_URLS) {
      try {
        const gltf = await loader.loadAsync(candidate);
        if (disposed) {
          disposeSource(gltf.scene);
          return null;
        }
        source = gltf.scene;
        url = candidate;
        break;
      } catch (error) { lastError = error; }
    }
    if (!source) throw lastError || new Error("Asset GLB tidak ditemukan.");
    model = buildHingedAssetDoor({ THREE, model: source, height: HEIGHT });
    if (disposed) { model.dispose(); model = null; return null; }
    scene.add(model.root);
    resize();
    options.onLoaded?.({
      url, meshCount: model.meshCount, canOpen: model.canOpen, faceCount: model.faceCount,
    });
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    setView(degrees) {
      targetView = THREE.MathUtils.clamp(degrees, -35, 35);
      invalidate();
    },
    setAngle(degrees) {
      if (!model?.canOpen) return;
      targetAngle = THREE.MathUtils.clamp(degrees, 0, OPEN_MAX);
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
