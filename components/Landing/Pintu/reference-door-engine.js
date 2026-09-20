/* Pintu 1 V2 — actual WebGL meshes, not CSS 3D or a sliced facade.
 * Reference: /public/pintu1.png. Stage 4 adds articulated 3D hinges and paired
 * long handles to the three-panel thick leaves from Stage 3. Sculpt and final
 * material remain separate milestones; the frame and leaf pivots stay unchanged.
 */
import { addReferenceDoorHardware } from "./reference-door-hardware.js";
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

  function extrude(parent, shape, depth, position, material, bevel = 0.035) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: bevel,
      bevelThickness: Math.min(bevel, depth * 0.28),
      curveSegments: 20,
      steps: 1,
    });
    geometry.translate(0, 0, -depth / 2);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function roundedRect(width, height, radius) {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    shape.closePath();
    return shape;
  }

  function beveledPanel(parent, dims, position, material, radius = 0.055, bevel = 0.028) {
    return extrude(parent, roundedRect(dims[0], dims[1], radius), dims[2], position, material, bevel);
  }

  function crownSilhouette() {
    const shape = new THREE.Shape();
    shape.moveTo(-2.12, -0.40);
    shape.lineTo(2.12, -0.40);
    shape.bezierCurveTo(1.91, -0.08, 1.68, 0.04, 1.43, 0.15);
    shape.bezierCurveTo(1.18, 0.26, 1.12, 0.58, 0.88, 0.57);
    shape.bezierCurveTo(0.64, 0.56, 0.57, 0.93, 0.39, 1.05);
    shape.bezierCurveTo(0.22, 1.18, 0.16, 1.57, 0, 1.83);
    shape.bezierCurveTo(-0.16, 1.57, -0.22, 1.18, -0.39, 1.05);
    shape.bezierCurveTo(-0.57, 0.93, -0.64, 0.56, -0.88, 0.57);
    shape.bezierCurveTo(-1.12, 0.58, -1.18, 0.26, -1.43, 0.15);
    shape.bezierCurveTo(-1.68, 0.04, -1.91, -0.08, -2.12, -0.40);
    shape.closePath();
    return shape;
  }

  function addPanelProfile(parent, centerX, centerY, width, height, face = 1) {
    const direction = face < 0 ? -1 : 1;
    const fillZ = direction * 0.122;
    const outerZ = direction * 0.148;
    const innerZ = direction * 0.171;
    const outerRail = 0.065;
    const innerRail = 0.035;
    const innerGap = 0.115;

    // A shallow recessed field plus two raised molding steps. Every piece is
    // parented to the leaf pivot and remains visible on front/back at 110°.
    beveledPanel(parent, [width, height, 0.024], [centerX, centerY, fillZ], insetRose, 0.055, 0.012);
    for (const x of [-1, 1]) {
      beveledPanel(
        parent,
        [outerRail, height + outerRail, 0.048],
        [centerX + x * (width / 2 + outerRail / 2), centerY, outerZ],
        doorEdges,
        0.025,
        0.012,
      );
      beveledPanel(
        parent,
        [innerRail, height - innerGap, 0.038],
        [centerX + x * (width / 2 - innerGap), centerY, innerZ],
        frameShadow,
        0.016,
        0.009,
      );
    }
    for (const y of [-1, 1]) {
      beveledPanel(
        parent,
        [width + outerRail, outerRail, 0.048],
        [centerX, centerY + y * (height / 2 + outerRail / 2), outerZ],
        doorEdges,
        0.025,
        0.012,
      );
      beveledPanel(
        parent,
        [width - innerGap, innerRail, 0.038],
        [centerX, centerY + y * (height / 2 - innerGap), innerZ],
        frameShadow,
        0.016,
        0.009,
      );
    }
  }

  // Stationary frame, Stage 2: match the reference hierarchy instead of using
  // two plain posts and a flat top bar. Fine carved foliage comes in Stage 7.
  const postHeight = 7.52;
  for (const side of [-1, 1]) {
    const x = side * 2.63;
    beveledPanel(root, [0.62, postHeight, 0.52], [x, -0.02, -0.04], pearledFrame, 0.075, 0.035);

    // Recessed pilaster shaft and a slender raised inner reed give the jamb a
    // readable profile from oblique views without pretending to be final carving.
    beveledPanel(root, [0.34, 5.28, 0.085], [x, -0.30, 0.265], frameShadow, 0.15, 0.018);
    beveledPanel(root, [0.13, 4.98, 0.075], [x, -0.32, 0.325], doorEdges, 0.06, 0.014);
    box(root, [0.075, 7.18, 0.075], [side * 2.318, -0.03, 0.27], frameShadow);

    // Layered plinth and capital blocks reproduce the reference's changing
    // silhouette; they remain fixed when the leaves open.
    beveledPanel(root, [0.78, 0.52, 0.62], [x, -3.42, -0.015], pearledFrame, 0.055, 0.04);
    beveledPanel(root, [0.70, 0.17, 0.66], [x, -3.08, -0.005], doorEdges, 0.04, 0.025);
    beveledPanel(root, [0.77, 0.25, 0.64], [x, 2.77, -0.005], doorEdges, 0.055, 0.028);
    beveledPanel(root, [0.84, 0.20, 0.67], [x, 3.01, 0], pearledFrame, 0.055, 0.03);
    beveledPanel(root, [0.76, 0.88, 0.59], [x, 3.38, -0.02], pearledFrame, 0.07, 0.032);
  }

  // Five stepped cornice layers create real front/side depth and the slight
  // outward projection seen in the uploaded reference.
  beveledPanel(root, [5.62, 0.42, 0.54], [0, FRAME_TOP - 0.09, -0.045], pearledFrame, 0.05, 0.03);
  beveledPanel(root, [5.84, 0.18, 0.61], [0, FRAME_TOP + 0.17, -0.025], frameShadow, 0.045, 0.026);
  beveledPanel(root, [6.02, 0.22, 0.67], [0, FRAME_TOP + 0.34, 0], pearledFrame, 0.05, 0.03);
  beveledPanel(root, [6.24, 0.14, 0.72], [0, FRAME_TOP + 0.51, 0.015], doorEdges, 0.045, 0.026);
  beveledPanel(root, [6.38, 0.12, 0.76], [0, FRAME_TOP + 0.64, 0.025], pearledFrame, 0.04, 0.024);
  box(root, [5.58, 0.075, 0.075], [0, FRAME_TOP - 0.34, 0.27], frameShadow);

  // Crown is a beveled extruded silhouette, not a flat sprite. Its convex oval
  // and ring establish the reference's visual center; detailed acanthus is later.
  const crown = extrude(root, crownSilhouette(), 0.24, [0, FRAME_TOP + 0.65, 0.22], pearledFrame, 0.055);
  crown.scale.y = 0.62;
  const ovalGeometry = new THREE.SphereGeometry(0.50, 36, 24);
  geometries.add(ovalGeometry);
  const oval = new THREE.Mesh(ovalGeometry, pearledFrame);
  oval.scale.set(0.72, 1.08, 0.34);
  oval.position.set(0, FRAME_TOP + 1.10, 0.43);
  oval.castShadow = true;
  root.add(oval);
  const ovalRingGeometry = new THREE.TorusGeometry(0.50, 0.075, 16, 48);
  geometries.add(ovalRingGeometry);
  const ovalRing = new THREE.Mesh(ovalRingGeometry, understatedMetal);
  ovalRing.scale.set(0.74, 1.10, 0.82);
  ovalRing.position.set(0, FRAME_TOP + 1.10, 0.47);
  ovalRing.castShadow = true;
  root.add(ovalRing);
  for (const side of [-1, 1]) {
    const scrollGeometry = new THREE.TorusGeometry(0.30, 0.065, 14, 36, Math.PI * 1.55);
    geometries.add(scrollGeometry);
    const scroll = new THREE.Mesh(scrollGeometry, understatedMetal);
    scroll.scale.set(1.12, 0.78, 0.72);
    scroll.rotation.z = side * 0.70;
    scroll.position.set(side * 0.66, FRAME_TOP + 0.83, 0.47);
    scroll.castShadow = true;
    root.add(scroll);
  }
  const pendantGeometry = new THREE.ConeGeometry(0.16, 0.42, 24);
  geometries.add(pendantGeometry);
  const pendant = new THREE.Mesh(pendantGeometry, understatedMetal);
  pendant.rotation.z = Math.PI;
  pendant.position.set(0, FRAME_TOP + 0.49, 0.43);
  pendant.castShadow = true;
  root.add(pendant);

  beveledPanel(root, [5.92, 0.14, 0.67], [0, FLOOR_Y, 0], pearledFrame, 0.045, 0.026);
  beveledPanel(root, [6.02, 0.065, 0.74], [0, FLOOR_Y - 0.10, 0], doorEdges, 0.035, 0.018);

  // Stages 1–2 deliberately leave the aperture EMPTY behind the leaves.
  // Do not fake the future interior with a flat dark/grey backing rectangle.
  // A real room will be built as depth geometry in V2 stage 9.

  // Each group pivot is at the OUTER jamb, z=0.34. The slab, side profiles,
  // front/back panels and hardware all remain children of this one hinge pivot.
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * W, 0, 0.34);
    root.add(pivot);
    const leafWidth = W - 0.024;
    const localX = -side * (W / 2 - 0.004);
    beveledPanel(pivot, [leafWidth, H, 0.22], [localX, -0.035, 0], paintedRose, 0.045, 0.026);

    // The center gap is intentionally narrow like the reference, while each
    // meeting stile and hinge edge retains a physical profile from side views.
    const meetingX = localX - side * (leafWidth / 2 - 0.022);
    const hingeX = localX + side * (leafWidth / 2 - 0.018);
    beveledPanel(pivot, [0.055, H - 0.10, 0.075], [meetingX, -0.035, 0.145], doorEdges, 0.022, 0.012);
    beveledPanel(pivot, [0.040, H - 0.16, 0.055], [hingeX, -0.035, 0.132], frameShadow, 0.018, 0.010);

    // Reference hierarchy: one tall panel, one narrow horizontal panel, one
    // lower panel. Rear profiles are quieter but preserve believable volume.
    const panels = [[0.98, 3.64], [-1.43, 0.66], [-2.53, 1.20]];
    for (const [y, panelH] of panels) {
      addPanelProfile(pivot, localX, y, 1.68, panelH, 1);
      addPanelProfile(pivot, localX, y, 1.64, panelH - 0.08, -1);
    }

    addReferenceDoorHardware({
      THREE, root, pivot, side, W, leafWidth, geometries,
      understatedMetal, frameShadow, beveledPanel, box,
    });
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
    // Keep the taller Stage 2 crown and BOTH swung leaves in frame. Mobile
    // composition still receives its dedicated pass in Stage 12.
    const halfV = THREE.MathUtils.degToRad(35 / 2);
    const distForWidth = 8.5 / (2 * Math.tan(halfV) * aspect);
    const distForHeight = 10.2 / (2 * Math.tan(halfV));
    camera.position.set(0, 0.72, Math.max(distForHeight, distForWidth));
    camera.lookAt(0, 0.72, 0);
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
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
