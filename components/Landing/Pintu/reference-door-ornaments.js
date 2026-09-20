/* Pintu 1 V2 — sculpted relief, never a flattened photograph.
 * Stage 6 adds shallow bevelled acanthus/volutes on moving leaves.
 * Stage 7 adds a matching fixed crown and restrained pilaster accents.
 * The details are procedural approximations; owner review against pintu1.png
 * is still required before claiming exact ornamental fidelity.
 */
function makeSculpt({ THREE, geometries, material }) {
  function leaf(parent, x, y, z, length, width, tilt = 0) {
    const s = new THREE.Shape();
    s.moveTo(0, -length * 0.5);
    s.bezierCurveTo(width * 0.64, -length * 0.39, width * 0.66, -length * 0.05, width * 0.18, length * 0.32);
    s.quadraticCurveTo(width * 0.08, length * 0.47, 0, length * 0.5);
    s.quadraticCurveTo(-width * 0.08, length * 0.47, -width * 0.18, length * 0.32);
    s.bezierCurveTo(-width * 0.66, -length * 0.05, -width * 0.64, -length * 0.39, 0, -length * 0.5);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.025, bevelEnabled: true, bevelSegments: 2, steps: 1,
      bevelThickness: 0.009, bevelSize: 0.009, curveSegments: 10,
    });
    geometries.add(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = tilt;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function vine(parent, points, z, radius = 0.014) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
    const g = new THREE.TubeGeometry(curve, 24, radius, 5, false);
    geometries.add(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function oval(parent, x, y, z, rx, ry) {
    const g = new THREE.SphereGeometry(1, 20, 12);
    geometries.add(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.scale.set(rx, ry, 0.035);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
  }
  return { leaf, vine, oval };
}

export function addReferenceDoorLeafRelief({ THREE, pivot, side, localX, geometries, material }) {
  const { leaf, vine, oval } = makeSculpt({ THREE, geometries, material });
  // Upper panel: four small mirrored corner arrangements, inside the inner
  // moldings (panel range x ±0.84, y -0.84..2.80). Nothing crosses a seam.
  for (const vertical of [-1, 1]) {
    const cy = vertical > 0 ? 2.40 : -0.46;
    for (const horizontal of [-1, 1]) {
      const cx = localX + horizontal * 0.54;
      vine(pivot, [[cx - horizontal * 0.14, cy - vertical * 0.14],
        [cx, cy], [cx + horizontal * 0.16, cy + vertical * 0.12]], 0.218, 0.012);
      leaf(pivot, cx + horizontal * 0.045, cy + vertical * 0.085, 0.211,
        0.22, 0.115, -horizontal * vertical * 0.57);
      leaf(pivot, cx - horizontal * 0.115, cy - vertical * 0.025, 0.211,
        0.16, 0.082, horizontal * vertical * 0.72);
    }
  }
  // Reference-like restrained upward acanthus around the upper-panel crest,
  // not a rose emblem or a large motif obscuring the recessed field.
  for (const hand of [-1, 1]) {
    const cx = localX + hand * 0.20;
    vine(pivot, [[localX, 2.40], [cx * 0.3 + localX * 0.7, 2.44],
      [cx, 2.52]], 0.221, 0.014);
    leaf(pivot, localX + hand * 0.18, 2.48, 0.216, 0.28, 0.105, -hand * 0.54);
  }
  oval(pivot, localX, 2.48, 0.224, 0.075, 0.082);

  // The narrow center panel holds a slim paired flourish, not a separate badge.
  vine(pivot, [[localX - 0.41, -1.43], [localX - 0.12, -1.39],
    [localX, -1.43], [localX + 0.12, -1.39], [localX + 0.41, -1.43]], 0.222, 0.012);
  for (const hand of [-1, 1]) {
    leaf(pivot, localX + hand * 0.22, -1.40, 0.217, 0.16, 0.068, hand * 0.9);
  }

  // Lower panel: small symmetric rising vines. All pieces are attached to
  // their owning pivot and stay inside the low recessed panel at 110 degrees.
  for (const hand of [-1, 1]) {
    vine(pivot, [[localX, -2.80], [localX + hand * 0.19, -2.62],
      [localX + hand * 0.34, -2.36]], 0.218, 0.013);
    leaf(pivot, localX + hand * 0.18, -2.55, 0.213, 0.25, 0.11, -hand * 0.64);
    leaf(pivot, localX + hand * 0.34, -2.36, 0.213, 0.18, 0.085, -hand * 0.31);
  }
  oval(pivot, localX, -2.76, 0.221, 0.056, 0.064);
  // side is retained to make ownership explicit (never draw across two leaves).
  void side;
}

export function addReferenceDoorFrameRelief({ THREE, root, geometries, material }) {
  const { leaf, vine, oval } = makeSculpt({ THREE, geometries, material });
  // Crown sculpt sits on the fixed beveled crown silhouette below the central
  // medallion and extends outward symmetrically. It never follows a leaf.
  for (const hand of [-1, 1]) {
    vine(root, [[hand * 0.49, 4.39], [hand * 0.82, 4.47],
      [hand * 1.21, 4.52], [hand * 1.62, 4.38]], 0.480, 0.025);
    for (let i = 0; i < 4; i += 1) {
      const x = hand * (0.71 + i * 0.235);
      const y = 4.51 - i * 0.037;
      leaf(root, x, y, 0.475, 0.30 - i * 0.028, 0.145 - i * 0.01,
        hand * (0.64 + i * 0.1));
    }
    vine(root, [[hand * 0.45, 4.56], [hand * 0.82, 4.70],
      [hand * 1.16, 4.57]], 0.478, 0.016);
  }
  // Raised detailing on the fixed pilaster capitals/plinths, not on the
  // moving doors. Centered within each block's front surface.
  for (const hand of [-1, 1]) {
    const x = hand * 2.63;
    for (const y of [3.39, -3.41]) {
      oval(root, x, y, 0.355, 0.063, 0.072);
      for (const direction of [-1, 1]) {
        leaf(root, x + direction * 0.15, y, 0.354, 0.19, 0.09,
          direction * 0.68);
      }
    }
  }
}
