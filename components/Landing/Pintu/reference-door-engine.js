/* Pintu 1 V2 — actual WebGL meshes, not CSS 3D or a sliced facade.
 * Reference: /public/pintu1.png. Stage 4 adds articulated 3D hinges and paired
 * long handles to the three-panel thick leaves from Stage 3. Sculpt and final
 * material remain separate milestones; the frame and leaf pivots stay unchanged.
 */
import { createReferenceDoorModel } from "./reference-door-model.js";
const OPEN_MAX = 110;

export async function mountReferenceDoor(container, options = {}) {
  const THREE = await import("three");
  // WebGLRenderer creates one context below; probing an extra canvas here
  // can exhaust context limits on low-memory mobile browsers.
  let disposed = false;
  let contextLost = false;
  let frameId = 0;
  let renderer;
  let resizeObserver;
  let intersectionObserver;
  let visible = true;
  let previousTime = 0;
    const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 90);
  const { root, leaves, lighting, dispose: disposeModel } =
    createReferenceDoorModel({ THREE, scene, options });

  let targetAngle = 0;
  let currentAngle = 0;
  let targetView = 0;
  let currentView = 0;
  let targetApproach = 0;
  let currentApproach = 0;
  let approachPending = false;
  let baseCameraDistance = 16;

  function positionCamera() {
    const t = currentApproach * currentApproach * (3 - 2 * currentApproach);
    // A genuine camera move across the threshold in the V2 foyer, not a
    // CSS zoom or a shrinking picture of the whole front elevation.
    camera.position.set(0, 0.72, THREE.MathUtils.lerp(baseCameraDistance, -4.2, t));
    camera.lookAt(0, 0.72, -20);
  }

  function render() {
    frameId = 0;
    if (disposed || contextLost || !renderer || !visible || document.hidden) {
      previousTime = 0;
      return;
    }
    const now = performance.now();
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.06) : 0.016;
    previousTime = now;
    const easing = options.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.7);
    currentAngle += (targetAngle - currentAngle) * easing;
    currentView += (targetView - currentView) * easing;
    if (Math.abs(currentAngle - targetAngle) < 0.012) currentAngle = targetAngle;
    if (Math.abs(currentView - targetView) < 0.001) currentView = targetView;
    if (targetApproach === 0 || (currentAngle >= 109 && Math.abs(currentView) < 0.01)) {
      currentApproach += (targetApproach - currentApproach) * easing;
    }
    if (Math.abs(currentApproach - targetApproach) < 0.001) currentApproach = targetApproach;
    positionCamera();
    const radians = THREE.MathUtils.degToRad(currentAngle);
    leaves[0].pivot.rotation.y = -radians;
    leaves[1].pivot.rotation.y = radians;
    root.rotation.y = THREE.MathUtils.degToRad(currentView);
    lighting.setOpening(currentAngle);
    renderer.render(scene, camera);
    if (approachPending && currentApproach === targetApproach) {
      approachPending = false;
      options.onApproachSettled?.(targetApproach > 0);
    }
    if (currentAngle !== targetAngle || currentView !== targetView || currentApproach !== targetApproach) invalidate();
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
    if (!width || !height) return;
    const aspect = width / height;
    // Keep the taller Stage 2 crown and BOTH swung leaves in frame. Mobile
    // composition still receives its dedicated pass in Stage 12.
    const halfV = THREE.MathUtils.degToRad(35 / 2);
    const distForWidth = 8.5 / (2 * Math.tan(halfV) * aspect);
    const distForHeight = 10.2 / (2 * Math.tan(halfV));
    baseCameraDistance = Math.max(distForHeight, distForWidth);
    positionCamera();
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }
  function onVisibility() {
    previousTime = 0;
    invalidate();
  }
  function onContextLost(event) {
    // The renderer also listens for restoration. Prevent the browser from
    // treating the loss as permanent, then pause animation without losing
    // the current angle, camera position or pending travel intent.
    event.preventDefault();
    contextLost = true;
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
    options.onContextChange?.("lost");
  }
  function onContextRestored() {
    // Three.js recreates internal GPU state in its own restore listener.
    contextLost = false;
    previousTime = 0;
    options.onContextChange?.("restored");
    resize();
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !options.thumbnail;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const mobileViewport = window.matchMedia("(max-width: 640px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,
      options.thumbnail ? 1 : mobileViewport ? 1.25 : 1.5));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored, false);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    intersectionObserver = new IntersectionObserver(entries => {
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
    renderer?.dispose();
    disposeModel();
  }

  return {
    setAngle(value) {
      if (targetApproach > 0 || currentApproach > 0.001) return;
      targetAngle = Math.max(0, Math.min(OPEN_MAX, value));
      invalidate();
    },
    setView(value) {
      if (targetApproach > 0 || currentApproach > 0.001) return;
      targetView = Math.max(-32, Math.min(32, value));
      invalidate();
    },
    setApproach(value) {
      targetApproach = Math.max(0, Math.min(1, value));
      if (targetApproach > 0) { targetAngle = OPEN_MAX; targetView = 0; }
      approachPending = true;
      invalidate();
    },
    capturePng() {
      if (disposed || contextLost || !renderer || !visible || document.hidden) return null;
      // Capture synchronously after rendering while the WebGL drawing buffer
      // still contains the latest frame (no always-on preserveDrawingBuffer).
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/png");
    },
    dispose,
  };
}
