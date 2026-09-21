/* Shared reference-faithful Pintu 1 mesh builder.
 * Builds real door leaves, relief, fixed frame and foyer as reusable Three.js
 * scene groups. Rendering/camera/navigation are owned by each environment.
 */
import { addReferenceDoorHardware } from "./reference-door-hardware.js";
import { addReferenceDoorLeafRelief, addReferenceDoorFrameRelief } from "./reference-door-ornaments.js";
import { addReferenceDoorCrown } from "./reference-door-crown.js";
import { buildReferenceDoorInterior } from "./reference-door-interior.js";
import { buildReferenceDoorLighting } from "./reference-door-lighting.js";

const W = 2.30;
const H = 7.12;
const FRAME_TOP = 3.77;
const FLOOR_Y = -3.68;

export function createReferenceDoorModel({ THREE, scene, options = {} }) {
  const geometries = new Set();
  const materials = new Set();
  // One reusable geometry core for all services. Only material variants
  // change; planner preserves the locked Pintu 1 reference palette.
  const palette = options.variant === "invitation"
    ? { paint: 0xc58f9a, inset: 0xb7808e, edge: 0xd8a7ac }
    : options.variant === "guestbook"
      ? { paint: 0x9e7d8c, inset: 0x8d6f7f, edge: 0xb69aa4 }
      : { paint: 0xb67b85, inset: 0xa86d77, edge: 0xc48d98 };
  const root = new THREE.Group();
  const leaves = [];
  scene.add(root);

  // Stage 5: restrained satin paint and warmer ivory-blush architecture.
  // Roughness is deliberately high on paint; metal is confined to hardware
  // and thin relief, not the whole slab or large frame surfaces.
  const paintedRose = new THREE.MeshStandardMaterial({
    color: palette.paint, roughness: 0.88, metalness: 0, flatShading: false,
  });
  const insetRose = new THREE.MeshStandardMaterial({
    color: palette.inset, roughness: 0.92, metalness: 0,
  });
  const doorEdges = new THREE.MeshStandardMaterial({
    color: palette.edge, roughness: 0.83, metalness: 0,
  });
  const pearledFrame = new THREE.MeshStandardMaterial({
    color: 0xd6bcb1, roughness: 0.86, metalness: 0,
  });
  const frameShadow = new THREE.MeshStandardMaterial({
    color: 0x9b7777, roughness: 0.9, metalness: 0,
  });
  const understatedMetal = new THREE.MeshStandardMaterial({
    color: 0x98706b, roughness: 0.57, metalness: 0.38,
  });
  const roseRelief = new THREE.MeshStandardMaterial({
    color: 0x8f5f6a, roughness: 0.87, metalness: 0.035,
  });
  const frameRelief = new THREE.MeshStandardMaterial({
    color: 0xb78e83, roughness: 0.81, metalness: 0.05,
  });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xf3eeeb, roughness: 0.94 });
  [paintedRose, insetRose, doorEdges, pearledFrame, frameShadow, understatedMetal, roseRelief, frameRelief, floorMat]
    .forEach(m => materials.add(m));

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

  // The screenshot exposes an oversized stack of shelf-like bars. The
  // reference has one restrained classical lintel with a fine projecting lip.
  // Three thin physically beveled layers replace five tall horizontal slabs.
  beveledPanel(root, [5.56, 0.27, 0.54], [0, FRAME_TOP - 0.07, -0.045], pearledFrame, 0.045, 0.020);
  beveledPanel(root, [5.89, 0.12, 0.62], [0, FRAME_TOP + 0.14, -0.02], frameShadow, 0.035, 0.018);
  beveledPanel(root, [6.14, 0.15, 0.72], [0, FRAME_TOP + 0.285, 0.015], pearledFrame, 0.040, 0.018);
  box(root, [5.53, 0.05, 0.075], [0, FRAME_TOP - 0.29, 0.27], frameShadow);

  // Screenshot audit: the reference's center crest is compact carved
  // acanthus, not an oversized oval ring with floating torus curls.
  addReferenceDoorCrown({
    THREE, root, geometries, frameMaterial: pearledFrame,
    leafMaterial: frameRelief, trimMaterial: understatedMetal, FRAME_TOP,
  });

  addReferenceDoorFrameRelief({ THREE, root, geometries, material: frameRelief });

  beveledPanel(root, [5.92, 0.14, 0.67], [0, FLOOR_Y, 0], pearledFrame, 0.045, 0.026);
  beveledPanel(root, [6.02, 0.065, 0.74], [0, FLOOR_Y - 0.10, 0], doorEdges, 0.035, 0.018);

  // Fixed volume behind the threshold, not a dark photo/portal card.
  buildReferenceDoorInterior({ THREE, root, box, materials, FLOOR_Y });

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

    addReferenceDoorLeafRelief({ THREE, pivot, side, localX, geometries, material: roseRelief });
    addReferenceDoorHardware({
      THREE, root, pivot, side, W, leafWidth, geometries,
      understatedMetal, frameShadow, beveledPanel, box,
    });
    leaves.push({ pivot, side });
  }

  const ground = box(options.orbital ? root : scene,
    [options.orbital ? 7.8 : 80, 0.04, options.orbital ? 12.9 : 80],
    [0, FLOOR_Y - 0.17, options.orbital ? -5.8 : 0], floorMat, false);
  ground.castShadow = false;

  // Orbital uses one shared scene key/fill; standalone uses the full rig.
  const lighting = options.orbital ? { setOpening() {} }
    : buildReferenceDoorLighting({ THREE, scene, root });
  return {
    root, leaves, lighting,
    dispose() {
      scene.remove(root);
      if (ground.parent === scene) scene.remove(ground);
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
}
