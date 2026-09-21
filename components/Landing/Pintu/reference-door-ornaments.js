/* Reference-door shallow carving: narrow architectural flourishes, not
 * oversized stickers or floating generic flowers. All leaf coordinates stay
 * inside one moving panel; the pilaster decoration remains fixed to the jamb.
 */
function sculptTools({ THREE, geometries, material }) {
  function leaf(parent, x, y, z, length, width, rotation = 0) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -length * 0.5);
    shape.bezierCurveTo(width * 0.55, -length * 0.25, width * 0.57, length * 0.05, 0, length * 0.5);
    shape.bezierCurveTo(-width * 0.57, length * 0.05, -width * 0.55, -length * 0.25, 0, -length * 0.5);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.015, steps: 1, bevelEnabled: true, bevelSegments: 2,
      bevelSize: 0.005, bevelThickness: 0.005, curveSegments: 12,
    });
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
  }
  function stem(parent, points, z, radius = 0.007) {
    const path = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
    const geometry = new THREE.TubeGeometry(path, 20, radius, 5, false);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
  }
  return { leaf, stem };
}

export function addReferenceDoorLeafRelief({ THREE, pivot, localX, geometries, material }) {
  const { leaf, stem } = sculptTools({ THREE, geometries, material });
  // Inset fill is centered at z=.122 with depth=.024; carving bases at .140
  // interpenetrate the fill without projecting into the inner panel moldings.
  const z = 0.140;
  const stemZ = 0.151;
  // In the reference the tall fields are largely empty: fine acanthus trails
  // descend only from the TWO upper corners, rather than four bold corner icons.
  for (const hand of [-1, 1]) {
    const x = localX + hand * 0.51;
    stem(pivot, [[x + hand * 0.07, 2.59], [x - hand * 0.03, 2.49],
      [x - hand * 0.01, 2.28], [x - hand * 0.09, 2.08]], stemZ);
    stem(pivot, [[x + hand * 0.05, 2.48], [x + hand * 0.14, 2.35],
      [x + hand * 0.12, 2.22]], stemZ, 0.006);
    leaf(pivot, x + hand * 0.025, 2.53, z, 0.15, 0.067, hand * 0.42);
    leaf(pivot, x - hand * 0.055, 2.39, z, 0.13, 0.060, -hand * 0.55);
    leaf(pivot, x + hand * 0.11, 2.33, z, 0.10, 0.052, -hand * 0.80);
    leaf(pivot, x - hand * 0.075, 2.13, z, 0.10, 0.046, hand * 0.34);
  }

  // Thin, almost engraved waist flourish at the short horizontal panel.
  for (const hand of [-1, 1]) {
    stem(pivot, [[localX, -1.43], [localX + hand * 0.14, -1.42],
      [localX + hand * 0.29, -1.46]], stemZ, 0.006);
    leaf(pivot, localX + hand * 0.17, -1.40, z, 0.10, 0.047, hand * 0.75);
  }

  // Lower field repeats a small restrained V-shaped acanthus flourish close
  // to its top-center, keeping most of the recessed surface unadorned.
  for (const hand of [-1, 1]) {
    stem(pivot, [[localX, -2.53], [localX + hand * 0.17, -2.45],
      [localX + hand * 0.27, -2.34]], stemZ, 0.008);
    leaf(pivot, localX + hand * 0.14, -2.44, z, 0.17, 0.075, -hand * 0.52);
    leaf(pivot, localX + hand * 0.26, -2.32, z, 0.10, 0.050, -hand * 0.84);
  }
}

export function addReferenceDoorFrameRelief({ THREE, root, geometries, material }) {
  const { leaf, stem } = sculptTools({ THREE, geometries, material });
  // The center crown is modeled by reference-door-crown.js. Do not overlay a
  // second array of vines/ovals that changes its reference silhouette.
  for (const hand of [-1, 1]) {
    const x = hand * 2.63;
    // Three narrow vertical flutes follow the existing pilaster shaft.
    for (const offset of [-0.077, 0, 0.077]) {
      stem(root, [[x + offset, -2.67], [x + offset, -0.3],
        [x + offset, 2.33]], 0.373, 0.007);
    }
    // Capital and plinth keep their own small fixed carved detail.
    for (const y of [3.37, -3.42]) {
      const z = y > 0 ? 0.304 : 0.329;
      for (const direction of [-1, 1]) {
        leaf(root, x + direction * 0.12, y, z, 0.15, 0.075,
          direction * 0.46);
      }
    }
  }
}
