/* Stage 4 hardware for Pintu 1. Every part is a real Three.js mesh.
 * Static jamb knuckles stay on root; the center knuckle and straps belong to
 * the hinged leaf. Fine carved handle ornament and PBR finish are later stages.
 */
export function addReferenceDoorHardware({
  THREE, root, pivot, side, W, leafWidth, geometries,
  understatedMetal, frameShadow, beveledPanel, box,
}) {
  function cylinder(parent, radius, height, position, material, segments = 24) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function sphere(parent, radius, position, material, segments = 20) {
    const geometry = new THREE.SphereGeometry(radius, segments, 12);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  for (const y of [-2.69, -0.02, 2.72]) {
    // Fixed pin and the two outer knuckles: never parent these to pivot.
    const hingeX = side * W;
    const axisZ = 0.34;
    cylinder(root, 0.015, 0.354, [hingeX, y, axisZ], understatedMetal);
    for (const offset of [-0.117, 0.117]) {
      cylinder(root, 0.057, 0.085, [hingeX, y + offset, axisZ], understatedMetal);
    }
    sphere(root, 0.040, [hingeX, y + 0.185, axisZ], understatedMetal);
    sphere(root, 0.040, [hingeX, y - 0.185, axisZ], understatedMetal);
    beveledPanel(root, [0.22, 0.25, 0.052], [hingeX + side * 0.143, y, axisZ + 0.004], understatedMetal, 0.025, 0.008);
    box(root, [0.15, 0.12, 0.05], [hingeX + side * 0.062, y, axisZ + 0.004], understatedMetal);

    // The middle knuckle is centered precisely on the leaf pivot axis.
    // Its mounting strap and bridge rotate as one piece with the leaf.
    cylinder(pivot, 0.057, 0.138, [0, y, 0], understatedMetal);
    beveledPanel(pivot, [0.22, 0.25, 0.052], [-side * 0.148, y, 0.159], understatedMetal, 0.025, 0.008);
    box(pivot, [0.14, 0.12, 0.054], [-side * 0.064, y, 0.052], understatedMetal);
    box(pivot, [0.095, 0.12, 0.112], [-side * 0.112, y, 0.105], understatedMetal);
    for (const x of [-side * 0.207, -side * 0.090]) {
      sphere(pivot, 0.016, [x, y, 0.194], frameShadow, 12);
    }
  }

  // Paired reference-style elongated turned pulls, one for each meeting stile.
  // Their backplates, fasteners, spacers and grips all move with their leaf.
  const handleX = -side * (leafWidth - 0.16);
  const handleY = 0.55;
  beveledPanel(pivot, [0.155, 1.70, 0.050], [handleX, handleY, 0.205], understatedMetal, 0.060, 0.015);
  beveledPanel(pivot, [0.105, 1.55, 0.024], [handleX, handleY, 0.244], frameShadow, 0.035, 0.008);
  for (const offset of [-0.57, 0.57]) {
    box(pivot, [0.092, 0.10, 0.195], [handleX, handleY + offset, 0.310], understatedMetal);
    sphere(pivot, 0.074, [handleX, handleY + offset, 0.403], understatedMetal);
  }

  // LatheGeometry makes a continuous solid grip with turned end collars and
  // subtle finials. No flat SVG or 2D facade is used for the hardware.
  const profile = [
    [0.016, -0.790], [0.038, -0.766], [0.068, -0.706],
    [0.068, -0.666], [0.044, -0.613], [0.046, -0.548],
    [0.039, -0.484], [0.036, -0.410], [0.036, 0.410],
    [0.039, 0.484], [0.046, 0.548], [0.044, 0.613],
    [0.068, 0.666], [0.068, 0.706], [0.038, 0.766],
    [0.016, 0.790],
  ];
  const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 32);
  geometries.add(geometry);
  const grip = new THREE.Mesh(geometry, understatedMetal);
  grip.position.set(handleX, handleY, 0.416);
  grip.castShadow = true;
  grip.receiveShadow = true;
  pivot.add(grip);
  for (const offset of [-0.812, 0.812]) {
    sphere(pivot, 0.045, [handleX, handleY + offset, 0.416], understatedMetal);
  }
}
