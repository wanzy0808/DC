/* Pintu 1 crown: compact classical acanthus crest, tied to the cornice.
 * The reference has a carved center finial and paired foliage, NOT three
 * free-standing loops, a large oval sign, or a giant triangular pediment.
 * Each leaf is a beveled 3D solid permanently fixed to the frame.
 */
export function addReferenceDoorCrown({
  THREE, root, geometries, frameMaterial, leafMaterial, trimMaterial, FRAME_TOP,
}) {
  const baseY = FRAME_TOP + 0.66;
  function sculpt(shape, depth, x, y, z, material, bevel = 0.012) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, steps: 1, curveSegments: 16, bevelEnabled: true,
      bevelSize: bevel, bevelThickness: bevel * 0.6, bevelSegments: 3,
    });
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }
  function foldedLeaf(x, y, length, width, rotation, material = leafMaterial) {
    // Serrated, tapered acanthus silhouette, with an asymmetric curved tip.
    // The shallow relief is seated into the crown plate; no free-floating ring.
    const shape = new THREE.Shape();
    shape.moveTo(0, -length * 0.5);
    shape.bezierCurveTo(width * 0.48, -length * 0.36, width * 0.62, -length * 0.18,
      width * 0.43, -length * 0.06);
    shape.lineTo(width * 0.62, length * 0.06);
    shape.quadraticCurveTo(width * 0.48, length * 0.18, width * 0.30, length * 0.20);
    shape.lineTo(width * 0.42, length * 0.33);
    shape.quadraticCurveTo(width * 0.24, length * 0.44, 0, length * 0.5);
    shape.quadraticCurveTo(-width * 0.23, length * 0.43, -width * 0.34, length * 0.33);
    shape.lineTo(-width * 0.25, length * 0.20);
    shape.quadraticCurveTo(-width * 0.45, length * 0.11, -width * 0.57, length * 0.02);
    shape.bezierCurveTo(-width * 0.32, -length * 0.08, -width * 0.47, -length * 0.33,
      0, -length * 0.5);
    shape.closePath();
    const mesh = sculpt(shape, 0.035, x, y, 0.342, material, 0.008);
    mesh.rotation.z = rotation;
    return mesh;
  }

  // Crown rises only over the center of the lintel and sits directly on the
  // continuous top cornice. Thin wings do not replace the original frame.
  const plate = new THREE.Shape();
  plate.moveTo(-1.18, 0);
  plate.bezierCurveTo(-0.86, 0.045, -0.60, 0.10, -0.41, 0.22);
  plate.bezierCurveTo(-0.18, 0.39, -0.13, 0.59, 0, 0.63);
  plate.bezierCurveTo(0.13, 0.59, 0.18, 0.39, 0.41, 0.22);
  plate.bezierCurveTo(0.60, 0.10, 0.86, 0.045, 1.18, 0);
  plate.closePath();
  sculpt(plate, 0.12, 0, baseY - 0.02, 0.235, frameMaterial, 0.015);

  // Paired low classical scrolls remain embedded in the silhouette, not tall
  // donut/torus shapes. Curved stems give the cluster a carved rather than
  // symbolic outline.
  for (const hand of [-1, 1]) {
    const stem = new THREE.CatmullRomCurve3([
      [hand * 0.07, baseY + 0.07, 0.371],
      [hand * 0.28, baseY + 0.17, 0.371],
      [hand * 0.50, baseY + 0.15, 0.371],
      [hand * 0.82, baseY + 0.035, 0.371],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const geometry = new THREE.TubeGeometry(stem, 24, 0.018, 7, false);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, trimMaterial);
    mesh.castShadow = true;
    root.add(mesh);
    foldedLeaf(hand * 0.25, baseY + 0.26, 0.34, 0.17, -hand * 0.53);
    foldedLeaf(hand * 0.50, baseY + 0.18, 0.28, 0.145, -hand * 0.94);
    foldedLeaf(hand * 0.73, baseY + 0.10, 0.20, 0.11, -hand * 1.13);
    foldedLeaf(hand * 0.14, baseY + 0.43, 0.35, 0.14, -hand * 0.18);
  }
  // Small central acanthus rises above the paired leaves like the photograph.
  foldedLeaf(0, baseY + 0.42, 0.53, 0.19, 0);
  foldedLeaf(-0.10, baseY + 0.31, 0.30, 0.11, -0.25);
  foldedLeaf(0.10, baseY + 0.31, 0.30, 0.11, 0.25);

  // Subtle carved center bead: not a large oval crest.
  const beadGeometry = new THREE.SphereGeometry(0.09, 18, 12);
  geometries.add(beadGeometry);
  const bead = new THREE.Mesh(beadGeometry, trimMaterial);
  bead.scale.set(0.75, 1, 0.25);
  bead.position.set(0, baseY + 0.14, 0.389);
  bead.castShadow = true;
  root.add(bead);
}
