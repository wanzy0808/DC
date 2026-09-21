/* One WebGL scene, one camera, three real reference-door mesh assemblies.
 * This route is an isolated pre-approval orbital laboratory. The canonical
 * landing remains unchanged until its visual fidelity is accepted.
 */
import { createReferenceDoorModel } from "./reference-door-model.js";

const IDS = [1, 2, 3];
const INITIAL_PHASE = -Math.PI / 6;
const STEP = Math.PI * 2 / 3;
const FRONT = Math.PI / 2;
const ORBIT_X = 4.9;
const ORBIT_Z = 2.5;
const ENTER_Z = -2.8;
const CAMERA_Z = 24;
const clamp = (x, low, high) => Math.min(high, Math.max(low, x));
const wrap = (x) => Math.atan2(Math.sin(x), Math.cos(x));
const smooth = (x) => x * x * (3 - 2 * x);

export async function mountOrbitalDoors(container, options = {}) {
  const THREE = await import("three");
  let disposed = false;
  let contextLost = false;
  let visible = true;
  let frameId = 0;
  let previousTime = 0;
  let previousPaint = 0;
  // Three ornate assemblies: limit costly canvas paints, not user input.
  const frameInterval = window.matchMedia("(max-width: 640px)").matches ? 1000 / 24 : 1000 / 30;
  let renderer;
  let resizeObserver;
  let intersectionObserver;
  let selected = 2;
  let lastReported = 2;
  let phase = INITIAL_PHASE;
  let targetPhase = null;
  let hoverPaused = false;
  let manuallySelected = false;
  let paused = Boolean(options.reducedMotion);
  let entering = false;
  let entered = false;
  let opening = 0;
  let approach = 0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 85);
  const models = [];
  const hemisphere = new THREE.HemisphereLight(0xfff7f0, 0xb5a3a4, 1.7);
  const key = new THREE.DirectionalLight(0xffefe7, 2.4);
  key.position.set(-7, 11, 13);
  scene.add(hemisphere, key);
  const fill = new THREE.DirectionalLight(0xffe9e0, 0.55);
  fill.position.set(8, 5, -9);
  scene.add(fill);

  function alignModels() {
    models.forEach((model, index) => {
      const theta = phase + index * STEP;
      model.root.position.set(Math.cos(theta) * ORBIT_X, 0, Math.sin(theta) * ORBIT_Z);
      model.root.rotation.y = -Math.cos(theta) * 0.20;
      model.root.scale.setScalar(1);
    });
  }

  function updateCamera() {
    const t = smooth(approach);
    camera.position.set(0, 0.72, THREE.MathUtils.lerp(CAMERA_Z, ENTER_Z, t));
    camera.lookAt(0, 0.72, -23);
  }

  function updateSelected() {
    if (targetPhase !== null || entering || paused) return;
    let frontIndex = 0;
    let frontDistance = Infinity;
    IDS.forEach((id, index) => {
      const distance = Math.abs(wrap(phase + index * STEP - FRONT));
      if (distance < frontDistance) { frontDistance = distance; frontIndex = index; }
    });
    const next = IDS[frontIndex];
    if (next !== lastReported) {
      lastReported = next;
      selected = next;
      options.onActiveDoor?.(next);
    }
  }

  function render() {
    frameId = 0;
    if (disposed || contextLost || !renderer || !visible || document.hidden) {
      previousTime = 0;
      previousPaint = 0;
      return;
    }
    const now = performance.now();
    if (previousPaint && now - previousPaint < frameInterval) {
      invalidate();
      return;
    }
    previousPaint = now;
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0.016;
    previousTime = now;
    const ease = options.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.8);

    if (targetPhase !== null) {
      phase += (targetPhase - phase) * ease;
      if (Math.abs(targetPhase - phase) < 0.001) {
        phase = targetPhase;
        targetPhase = null;
      }
    } else if (!paused && !entering && !options.reducedMotion) {
      phase += dt * 0.39;
    }
    alignModels();
    updateSelected();

    if (entering && targetPhase === null) {
      opening += (110 - opening) * ease;
      if (Math.abs(110 - opening) < 0.15) opening = 110;
      if (opening >= 109.5) {
        approach += (1 - approach) * (options.reducedMotion ? 1 : 1 - Math.exp(-dt * 2.8));
        if (Math.abs(1 - approach) < 0.001) approach = 1;
      }
    }
    for (const model of models) {
      const angle = model.id === selected ? opening : 0;
      model.leaves[0].pivot.rotation.y = THREE.MathUtils.degToRad(-angle);
      model.leaves[1].pivot.rotation.y = THREE.MathUtils.degToRad(angle);
    }
    updateCamera();
    renderer.render(scene, camera);
    if (entering && !entered && approach >= 0.84) {
      entered = true;
      options.onEntered?.(selected);
    }
    // A pinned/hover-paused scene is static: do not keep redrawing 24–30 fps.
    // Re-enter the loop on a real interaction, unpause, or a pending transition.
    if ((!paused && !options.reducedMotion) ||
      (entering && (opening < 110 || approach < 1)) || targetPhase !== null) invalidate();
  }

  function invalidate() {
    if (!disposed && !contextLost && visible && !document.hidden && !frameId) {
      frameId = window.requestAnimationFrame(render);
    }
  }

  function resize() {
    if (disposed || !renderer) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.fov = width < 600 ? 45 : 35;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }
  function onVisibility() {
    previousTime = 0;
    previousPaint = 0;
    invalidate();
  }
  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
    previousPaint = 0;
    options.onContextChange?.("lost");
  }
  function onContextRestored() {
    contextLost = false;
    previousTime = 0;
    previousPaint = 0;
    options.onContextChange?.("restored");
    resize();
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
    renderer?.domElement.remove();
    models.forEach((model) => model.dispose());
    renderer?.dispose();
  }

  try {
    IDS.forEach((id) => {
      const variant = id === 1 ? "planner" : id === 2 ? "invitation" : "guestbook";
      const model = createReferenceDoorModel({ THREE, scene, options: { variant, orbital: true } });
      model.id = id;
      models.push(model);
    });
    alignModels();
    updateCamera();
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia("(max-width: 640px)").matches ? 1 : 1.25));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    intersectionObserver = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      if (visible) { previousTime = 0; invalidate(); }
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", onVisibility);
    resize();
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    pause(value) {
      if (entering || disposed) return;
      hoverPaused = Boolean(value);
      paused = hoverPaused || manuallySelected || Boolean(options.reducedMotion);
      invalidate();
    },
    resume() {
      if (entering || disposed) return;
      manuallySelected = false;
      paused = hoverPaused || Boolean(options.reducedMotion);
      invalidate();
    },
    select(id) {
      if (!IDS.includes(id) || entering || disposed) return;
      selected = id;
      lastReported = id;
      manuallySelected = true;
      paused = true;
      const desired = FRONT - (id - 1) * STEP;
      targetPhase = phase + wrap(desired - phase);
      opening = 0;
      options.onActiveDoor?.(id);
      invalidate();
    },
    enter(id) {
      if (!IDS.includes(id) || entering || disposed) return false;
      selected = id;
      lastReported = id;
      manuallySelected = true;
      paused = true;
      const desired = FRONT - (id - 1) * STEP;
      targetPhase = phase + wrap(desired - phase);
      entering = true;
      options.onActiveDoor?.(id);
      invalidate();
      return true;
    },
    cancel() {
      if (entered || disposed) return;
      entering = false;
      opening = 0;
      approach = 0;
      targetPhase = null;
      paused = hoverPaused || manuallySelected || Boolean(options.reducedMotion);
      previousPaint = 0;
      updateCamera();
      invalidate();
    },
    dispose,
  };
}
