/* Pintu 1 V2 — actual WebGL meshes. Not the prior CSS 3D or a sliced facade.
 * Reference: /public/pintu1.png. This stage is STRUCTURAL ONLY: deliberately
 * do not fake the reference's acanthus crown and engravings with generic icons.
 * Each leaf's whole geometry is a child of one hinge pivot; the frame stays fixed.
 */
const W = 2.30;
const H = 7.12;
const FRAME_TOP = 3.77;
const FLOOR_Y = -3.68;
const OPEN_MAX = 110;

export async function mountReferenceDoor(container, options = {}) {
  const THREE = await import("three");
  if (!document.createElement("canvas").getContext("webgl2")) {
    throw new Error("Browser ini tidak mendukung WebGL2.");
  }

  let disposed = false;
  let frameId = 0;
  let renderer;
  let resizeObserver;
  let intersectionObserver;
  let visible = true;
  let previousTime = 0;
  const geometries = new Set();
  const materials = new Set();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 90);
  const root = new THREE.Group();
  const leaves = [];
  scene.add(root);

  const paintedRose = new THREE.MeshStandardMaterial({ color: 0xb77f81, roughness: 0.76, metalness: 0.035 });
  const insetRose = new THREE.MeshStandardMaterial({ color: 0xaa7778, roughness: 0.83, metalness: 0.012 });
  const doorEdges = new THREE.MeshStandardMaterial({ color: 0xca9594, roughness: 0.7, metalness: 0.04 });
  const pearledFrame = new THREE.MeshStandardMaterial({ color: 0xdac0b2, roughness: 0.68, metalness: 0.035 });
  const frameShadow = new THREE.MeshStandardMaterial({ color: 0xa57c78, roughness: 0.82 });
  const understatedMetal = new THREE.MeshStandardMaterial({ color: 0xc9977d, metalness: 0.65, roughness: 0.38 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xf3eeeb, roughness: 0.9 });
  [paintedRose, insetRose, doorEdges, pearledFrame, frameShadow, understatedMetal, floorMat].forEach(m => materials.add(m));

  function box(parent, dims, position, material, cast = true) {
    const geometry = new THREE.BoxGeometry(...dims);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Stationary frame: actual depth on all four sides, and inner rebates.
  const postHeight = 7.65;
  for (const side of [-1, 1]) {
    box(root, [0.46, postHeight, 0.54], [side * 2.55, -0.01, -0.045], pearledFrame);
    box(root, [0.085, 7.26, 0.08], [side * 2.322, -0.03, 0.27], frameShadow);
    box(root, [0.082, postHeight - 0.18, 0.055], [side * 2.75, -0.01, 0.24], doorEdges);
  }
  box(root, [5.64, 0.43, 0.54], [0, FRAME_TOP, -0.045], pearledFrame);
  box(root, [5.72, 0.10, 0.60], [0, FRAME_TOP + 0.26, -0.045], pearledFrame);
  box(root, [5.60, 0.075, 0.07], [0, FRAME_TOP - 0.23, 0.27], frameShadow);
  box(root, [5.67, 0.12, 0.65], [0, FLOOR_Y, 0], pearledFrame);
  box(root, [5.73, 0.045, 0.72], [0, FLOOR_Y - 0.08, 0], doorEdges);

  // Stage 1 deliberately leaves the aperture EMPTY behind the leaves.
  // Do not fake the future interior with a flat dark/grey backing rectangle.
  // A real room will be built as depth geometry in V2 stage 9.

  // Each group pivot is at the OUTER jamb, z=0.34. The material/side/back/panels
  // all belong to the same group, including when the door swings beyond 90°.
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * W, 0, 0.34);
    root.add(pivot);
    const localX = -side * (W / 2 - 0.012);
    const leafWidth = W - 0.055;
    box(pivot, [leafWidth, H, 0.20], [localX, -0.035, 0], paintedRose);
    box(pivot, [leafWidth - 0.065, H - 0.07, 0.018], [localX, -0.035, -0.104], doorEdges);

    // Initial classical three-panel volumes are simple proportions, not fake
    // hand-sculpted engraving. Detailed moulding and acanthus come later.
    for (const [y, panelH] of [[1.05, 3.65], [-1.49, 0.62], [-2.56, 1.09]]) {
      box(pivot, [1.70, panelH, 0.026], [localX, y, 0.112], insetRose);
      const hx = 0.85;
      const hy = panelH / 2;
      for (const x of [-hx, hx]) {
        box(pivot, [0.045, panelH + 0.08, 0.042], [localX + x, y, 0.14], doorEdges);
      }
      for (const yy of [-hy, hy]) {
        box(pivot, [1.77, 0.045, 0.042], [localX, y + yy, 0.14], doorEdges);
      }
    }

    // Real 3D barrel along the pivot, while leaf-mount plates stay on the leaf.
    for (const y of [-2.69, -0.02, 2.72]) {
      const geometry = new THREE.CylinderGeometry(0.046, 0.046, 0.31, 18);
      geometries.add(geometry);
      const barrel = new THREE.Mesh(geometry, understatedMetal);
      barrel.position.set(0, y, 0.02);
      barrel.castShadow = true;
      pivot.add(barrel);
      box(pivot, [0.19, 0.23, 0.035], [-side * 0.10, y, 0.11], understatedMetal);
    }
    // Stage-one handle is deliberately plain; precise ornate reference hardware
    // will be its own milestone, not a CSS glyph attached to a photo.
    const handleX = -side * (leafWidth - 0.16);
    box(pivot, [0.08, 0.64, 0.09], [handleX, -0.42, 0.20], understatedMetal);
    leaves.push({ pivot, side });
  }

  const ground = box(scene, [80, 0.04, 80], [0, FLOOR_Y - 0.17, 0], floorMat, false);
  ground.castShadow = false;

  const ambient = new THREE.HemisphereLight(0xfff9f3, 0x8e7373, 2.0);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffeee4, 2.6);
  key.position.set(-5, 8, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xf4e1e1, 0.9);
  fill.position.set(5, 4, -4);
  scene.add(fill);

  let targetAngle = 0;
  let currentAngle = 0;
  let targetView = 0;
  let currentView = 0;

  function render() {
    if (disposed || !renderer || !visible || document.hidden) return;
    frameId = 0;
    const now = performance.now();
    const dt = previousTime ? Math.min((now - previousTime) / 1000, 0.06) : 0.016;
    previousTime = now;
    const easing = options.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.7);
    currentAngle += (targetAngle - currentAngle) * easing;
    currentView += (targetView - currentView) * easing;
    if (Math.abs(currentAngle - targetAngle) < 0.012) currentAngle = targetAngle;
    if (Math.abs(currentView - targetView) < 0.001) currentView = targetView;
    const radians = THREE.MathUtils.degToRad(currentAngle);
    leaves[0].pivot.rotation.y = -radians;
    leaves[1].pivot.rotation.y = radians;
    root.rotation.y = THREE.MathUtils.degToRad(currentView);
    renderer.render(scene, camera);
    if (currentAngle !== targetAngle || currentView !== targetView) invalidate();
  }
  function invalidate() {
    if (!disposed && visible && !document.hidden && !frameId) {
      frameId = window.requestAnimationFrame(render);
    }
  }
  function resize() {
    if (disposed || !renderer) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    if (!width || !height) return;
    const aspect = width / height;
    // Keep BOTH swung leaves in frame; mobile Stage 12 will refine framing.
    const halfV = THREE.MathUtils.degToRad(35 / 2);
    const distForWidth = 8.5 / (2 * Math.tan(halfV) * aspect);
    camera.position.set(0, 0.30, Math.max(13.5, distForWidth));
    camera.lookAt(0, 0.02, 0);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    invalidate();
  }
  function onVisibility() {
    previousTime = 0;
    invalidate();
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);
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
    renderer?.domElement.remove();
    renderer?.dispose();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
  }

  return {
    setAngle(value) { targetAngle = Math.max(0, Math.min(OPEN_MAX, value)); invalidate(); },
    setView(value) { targetView = Math.max(-32, Math.min(32, value)); invalidate(); },
    dispose,
  };
}
