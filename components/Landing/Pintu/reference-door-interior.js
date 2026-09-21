/* Stage 9 — physically volumetric foyer beyond the fixed jamb.
 * Mesh walls, floor, coffered ceiling and distant architectural detailing:
 * no SVG interior, flat dark backing rectangle or portal card.
 */
export function buildReferenceDoorInterior({ THREE, root, box, materials, FLOOR_Y }) {
  const wall = new THREE.MeshStandardMaterial({
    color: 0xe8d7cf, roughness: 0.94, metalness: 0,
  });
  const innerWall = new THREE.MeshStandardMaterial({
    color: 0xd7bdb6, roughness: 0.95, metalness: 0,
  });
  const floor = new THREE.MeshStandardMaterial({
    color: 0xe9dcd3, roughness: 0.86, metalness: 0,
  });
  const stoneDetail = new THREE.MeshStandardMaterial({
    color: 0xf2e7df, roughness: 0.88, metalness: 0,
  });
  const shadowLine = new THREE.MeshStandardMaterial({
    color: 0xc1a9a3, roughness: 0.92, metalness: 0,
  });
  [wall, innerWall, floor, stoneDetail, shadowLine].forEach(material => materials.add(material));

  // Corridor begins behind the leaf's rear face; its 12-unit physical depth
  // gives parallax at ±25° and leaves room for future camera fly-through.
  // There are no blocks across the front opening.
  box(root, [0.23, 7.18, 13.1], [-2.44, -0.05, -6.75], wall);
  box(root, [0.23, 7.18, 13.1], [ 2.44, -0.05, -6.75], wall);
  box(root, [5.06, 0.17, 13.1], [0, 3.61, -6.75], stoneDetail, false);
  box(root, [5.06, 0.12, 13.1], [0, FLOOR_Y - 0.09, -6.75], floor, false);
  box(root, [5.06, 7.18, 0.25], [0, -0.05, -13.39], innerWall);
  // Distant doorway silhouette is created from solid pilasters and a lintel,
  // against a visible warm wall, not a black quad or hole with no room.
  for (const hand of [-1, 1]) {
    box(root, [0.19, 6.4, 0.24], [hand * 1.62, -0.40, -13.12], stoneDetail);
    box(root, [0.08, 6.2, 0.27], [hand * 1.78, -0.4, -13.08], shadowLine);
  }
  box(root, [3.52, 0.26, 0.28], [0, 2.83, -13.12], stoneDetail);
  box(root, [2.90, 0.11, 0.30], [0, 2.62, -13.1], shadowLine);
  box(root, [1.20, 2.9, 0.09], [0, -1.02, -13.18], wall, false);

  // Articulated perspective: wall bays, recessed-looking panel frames,
  // ceiling coffers and floor joints narrow naturally by distance.
  for (const z of [-1.6, -4.4, -7.2, -10.0, -12.6]) {
    for (const hand of [-1, 1]) {
      box(root, [0.11, 6.55, 0.18], [hand * 2.27, -0.17, z], stoneDetail);
      box(root, [0.09, 0.12, 2.55], [hand * 2.26, 2.90, z - 1.35], stoneDetail);
      box(root, [0.09, 0.11, 2.55], [hand * 2.26, -3.17, z - 1.35], stoneDetail);
    }
    box(root, [4.79, 0.11, 0.14], [0, 3.43, z], stoneDetail, false);
    box(root, [4.72, 0.018, 0.025], [0, FLOOR_Y - 0.025, z], shadowLine, false);
  }
  for (const hand of [-1, 1]) {
    box(root, [0.12, 0.12, 12.2], [hand * 1.84, 3.42, -6.65], shadowLine, false);
    box(root, [0.095, 0.11, 12.2], [hand * 1.18, 3.42, -6.65], stoneDetail, false);
    box(root, [0.10, 0.025, 12.2], [hand * 1.45, FLOOR_Y - 0.025, -6.65], stoneDetail, false);
  }

  // The foyer remains visible when the leaves open, without relying on a
  // billboard or an oversized pink glow projected over its architecture.
  const interiorFill = new THREE.PointLight(0xffebdc, 2.4, 15, 2);
  interiorFill.position.set(0, 2.35, -5.2);
  root.add(interiorFill);
}
