/* Stage 10 — shadow-aware ivory lighting with a short opening spill.
 * No glowing portal plane, no pink fog and no animated light attached to a leaf.
 */
export function buildReferenceDoorLighting({ THREE, scene, root }) {
  const ambient = new THREE.HemisphereLight(0xfff7f1, 0xb7a5a2, 1.3);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2e9, 2.15);
  key.position.set(-5.0, 8.2, 8.8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffe5df, 0.68);
  fill.position.set(5, 4, -5);
  scene.add(fill);

  // Spotlight originates BEHIND the threshold and points softly at the
  // foreground floor. At 0° it has zero intensity; opening the leaves reveals
  // the short spill without painting a conspicuous opaque light volume.
  const spill = new THREE.SpotLight(0xffebd8, 0, 8.5, Math.PI / 5, 0.82, 2);
  spill.position.set(0, 2.1, -1.8);
  spill.target.position.set(0, -3.68, 1.9);
  root.add(spill);
  root.add(spill.target);

  return {
    key,
    setOpening(degrees) {
      const t = Math.min(1, Math.max(0, degrees / 105));
      // smoothstep: no abrupt flash between the closed and open positions.
      spill.intensity = 12 * t * t * (3 - 2 * t);
    },
  };
}
