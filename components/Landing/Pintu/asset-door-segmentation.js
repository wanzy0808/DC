/* Partition an AI-exported fused door mesh WITHOUT replacing its carvings.
 * The 40k/20k GLBs in public/ currently each have exactly ONE named mesh.
 * We clip triangles in XY against a conservative central leaf region and
 * hinge the resulting actual geometry; the remaining crown/jamb stays still.
 * Seams at the artificial cut are experimental pending screenshot validation.
 */

import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function buildHingedAssetDoor({ THREE, model, height = 7.6 }) {
  const originalGeometries = new Set();
  const originalMaterials = new Set();
  const originalTextures = new Set();
  const sourceMeshes = [];
  model.updateMatrixWorld(true);
  model.traverse(child => {
    if (!child.isMesh) return;
    sourceMeshes.push(child);
    if (child.geometry) originalGeometries.add(child.geometry);
    for (const m of (Array.isArray(child.material) ? child.material : [child.material])) {
      if (!m) continue;
      originalMaterials.add(m);
      for (const value of Object.values(m)) if (value?.isTexture) originalTextures.add(value);
    }
  });
  if (!sourceMeshes.length) throw new Error("GLB tidak berisi mesh.");

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0.0001 || size.x <= 0.0001)
    throw new Error("Geometri GLB tidak valid.");

  // Bounding-box proportions are derived from the uploaded model, not hand-
  // drawn decorative geometry. The outer ~15% remains fixed as pilasters.
  // The upper ~19% remains fixed as lintel + crown.
  const leftEdge = bounds.min.x + size.x * 0.155;
  const rightEdge = bounds.max.x - size.x * 0.155;
  const seamX = center.x;
  const bottomEdge = bounds.min.y + size.y * 0.035;
  const topEdge = bounds.max.y - size.y * 0.205;
  const depth = Math.max(size.z, 0.001);
  const output = [[], [], []]; // stationary, left, right
  const outputNormals = [[], [], []];
  const outputColors = [[], [], []];
  // Reference Pintu 1: warm ivory-blush ARCHITECTURE, muted Rose LEAVES.
  // Previous build tinted the entire crown/pilaster mauve and painted every
  // forward-facing vertex of the leaves a different color, causing the
  // artificial two-tone / clay-sticker look regardless of actual carving.
  const paint = [
    new THREE.Color(0xe7d7d0), // cornice, crown, jamb / pilaster
    new THREE.Color(0xbf8794), // left slab: dusty rose satin
    new THREE.Color(0xbf8794), // right slab: the SAME paint
  ];
  const crownIvory = new THREE.Color(0xf1e5dc);
  const leafMolding = new THREE.Color(0xd1a5ab);
  let clippedTriangles = 0;

  function interpolate(a, b, axis, boundary) {
    const t = Math.min(1, Math.max(0, (boundary - a.p[axis]) /
      (b.p[axis] - a.p[axis])));
    return {
      p: a.p.map((v, i) => v + (b.p[i] - v) * t),
      n: a.n.map((v, i) => v + (b.n[i] - v) * t),
    };
  }

  // Split a convex polygon against an axis-aligned halfspace. Any fragment
  // outside the leaf region is retained in the stationary jamb/crown, not
  // simply dropped (which previously caused clipping holes).
  function split(polygon, axis, value, keepGreater) {
    if (!polygon.length) return [[], []];
    const inside = [], outside = [];
    for (let i = 0; i < polygon.length; i += 1) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length];
      const ai = keepGreater ? a.p[axis] >= value : a.p[axis] <= value;
      const bi = keepGreater ? b.p[axis] >= value : b.p[axis] <= value;
      if (ai) inside.push(a); else outside.push(a);
      if (ai !== bi) {
        const cross = interpolate(a, b, axis, value);
        inside.push(cross);
        outside.push(cross);
      }
    }
    return [inside, outside];
  }

  function emit(role, polygon) {
    if (polygon.length < 3) return;
    for (let i = 1; i < polygon.length - 1; i += 1) {
      const tri = [polygon[0], polygon[i], polygon[i + 1]];
      const u = tri[1].p.map((v, k) => v - tri[0].p[k]);
      const v = tri[2].p.map((x, k) => x - tri[0].p[k]);
      const cross = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      if (Math.hypot(...cross) < 1e-10) continue;
      for (const vertex of tri) {
        output[role].push(...vertex.p);
        const normal = new THREE.Vector3(...vertex.n).normalize();
        outputNormals[role].push(normal.x, normal.y, normal.z);
        const z = THREE.MathUtils.clamp((vertex.p[2] - bounds.min.z) / depth, 0, 1);
        const x = Math.abs(vertex.p[0] - seamX);
        // Same-color leaf body. Only a very small highlight on physically
        // protruding front mouldings, never a z-driven recolor of whole panels
        // or giant gold patches. Color follows actual GLB relief; we invent
        // no substitute SVG/extruded ornament geometry.
        const isMolding = role !== 0 && z > 0.90 &&
          x > size.x * 0.045 && x < size.x * 0.31;
        const tint = role === 0
          ? (vertex.p[1] > topEdge ? crownIvory : paint[0])
          : (isMolding ? leafMolding : paint[role]);
        const variation = 0.975 + 0.025 * z;
        outputColors[role].push(tint.r * variation, tint.g * variation, tint.b * variation);
      }
    }
  }

  for (const mesh of sourceMeshes) {
    // Convert to source-world coordinates before cutting; no material-name
    // guessing or assumptions about exporter node transforms.
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const index = geometry.index;
    const count = index ? index.count : position.count;
    for (let t = 0; t < count; t += 3) {
      const triangle = [0,1,2].map(k => {
        const i = index ? index.getX(t+k) : t+k;
        return {
          p: [position.getX(i), position.getY(i), position.getZ(i)],
          n: [normal.getX(i), normal.getY(i), normal.getZ(i)],
        };
      });
      let leaf = triangle;
      for (const [axis, value, keepGreater] of [
        [1, bottomEdge, true], [1, topEdge, false],
        [0, leftEdge, true], [0, rightEdge, false],
      ]) {
        const [inside, outside] = split(leaf, axis, value, keepGreater);
        emit(0, outside);
        leaf = inside;
        if (!leaf.length) break;
      }
      if (leaf.length) {
        const [left, right] = split(leaf, 0, seamX, false);
        emit(1, left);
        emit(2, right);
        clippedTriangles += 1;
      }
    }
    geometry.dispose();
  }

  const root = new THREE.Group();
  const scaled = new THREE.Group();
  const leftPivot = new THREE.Group();
  const rightPivot = new THREE.Group();
  const createdGeometries = [];
  const createdMaterials = [];
  scaled.add(leftPivot, rightPivot);
  root.add(scaled);
  const pivotZ = center.z;
  // Outer edges are hinges. Two pivots stay at their jambs while the door's
  // original surface and carving rotate as part of each physical leaf.
  leftPivot.position.set(leftEdge, 0, pivotZ);
  rightPivot.position.set(rightEdge, 0, pivotZ);
  let faceCount = 0;

  for (let role = 0; role < 3; role += 1) {
    if (!output[role].length) continue;
    const rawGeometry = new THREE.BufferGeometry();
    rawGeometry.setAttribute("position", new THREE.Float32BufferAttribute(output[role], 3));
    rawGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(outputNormals[role], 3));
    rawGeometry.setAttribute("color", new THREE.Float32BufferAttribute(outputColors[role], 3));
    // gltfjsx / higher polygon budgets do not add detail to a mesh. This
    // existing Three.js utility reconciles normals across split triangles
    // while retaining pronounced moulding edges (>~52°) instead of letting
    // the exporter average carved corners into a melted clay surface.
    const geometry = toCreasedNormals(rawGeometry, THREE.MathUtils.degToRad(52));
    rawGeometry.dispose();
    geometry.computeBoundingSphere();
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: role === 0 ? 0.70 : 0.65,
      metalness: 0,
      clearcoat: role === 0 ? 0.045 : 0.09,
      clearcoatRoughness: 0.66,
      envMapIntensity: role === 0 ? 0.38 : 0.48,
      side: THREE.DoubleSide,
    });
    createdGeometries.push(geometry);
    createdMaterials.push(material);
    const part = new THREE.Mesh(geometry, material);
    part.name = role === 0 ? "FixedCrownAndJamb" : role === 1 ? "LeftLeaf" : "RightLeaf";
    part.castShadow = true;
    part.receiveShadow = true;
    faceCount += output[role].length / 9;
    if (role === 0) scaled.add(part);
    else {
      const pivot = role === 1 ? leftPivot : rightPivot;
      part.position.set(-pivot.position.x, 0, -pivot.position.z);
      pivot.add(part);
    }
  }

  // After building everything in source coordinates, scale the complete
  // group so both feet rest exactly at the floor and the crown stays in view.
  const scale = height / size.y;
  scaled.scale.setScalar(scale);
  scaled.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  const canOpen = Boolean(output[1].length && output[2].length && clippedTriangles > 120);

  return {
    root, leftPivot, rightPivot, canOpen, faceCount,
    meshCount: sourceMeshes.length, height,
    bounds: new THREE.Box3().setFromObject(root),
    dispose() {
      createdGeometries.forEach(g => g.dispose());
      createdMaterials.forEach(m => m.dispose());
      originalGeometries.forEach(g => g.dispose());
      originalMaterials.forEach(m => m.dispose());
      originalTextures.forEach(t => t.dispose());
    },
  };
}
