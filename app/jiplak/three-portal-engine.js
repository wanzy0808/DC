/* Dedicated /jiplak experiment. Three.js is loaded only when this route mounts.
 * A typed declaration lives alongside this JS engine; the rest of DC uses TS.
 */
const ROSE = 0xc07a84;
const SOFT_ROSE = 0xb87882;
const IVORY = 0xe6c3c9;
const DEEP_ROSE = 0x784b55;

const WORLDS = [
  { id: 1, image: "/wo.png" },
  { id: 2, image: "/hp-digital.png" },
  { id: 3, image: "/bukutamu.png" },
];

function createArchShape(THREE, halfWidth, bottom, shoulder, crown) {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, bottom);
  shape.lineTo(-halfWidth, shoulder);
  shape.bezierCurveTo(
    -halfWidth, shoulder + (crown - shoulder) * 0.65,
    -halfWidth * 0.47, crown,
    0, crown,
  );
  shape.bezierCurveTo(
    halfWidth * 0.47, crown,
    halfWidth, shoulder + (crown - shoulder) * 0.65,
    halfWidth, shoulder,
  );
  shape.lineTo(halfWidth, bottom);
  shape.closePath();
  return shape;
}

function createFrameShape(THREE) {
  const shape = createArchShape(THREE, 1.15, -2.24, 0.88, 2.22);
  const hole = new THREE.Path();
  hole.moveTo(-0.925, -2.045);
  hole.lineTo(0.925, -2.045);
  hole.lineTo(0.925, 0.83);
  hole.bezierCurveTo(0.925, 1.4, 0.49, 1.945, 0, 1.96);
  hole.bezierCurveTo(-0.49, 1.945, -0.925, 1.4, -0.925, 0.83);
  hole.lineTo(-0.925, -2.045);
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}

function makeGroundTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  gradient.addColorStop(0, "rgba(44,13,32,0.46)");
  gradient.addColorStop(0.42, "rgba(67,20,38,0.25)");
  gradient.addColorStop(1, "rgba(67,20,38,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function makeDoorLightTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const width = ctx.createLinearGradient(0, 0, 128, 0);
  width.addColorStop(0, "rgba(255,248,239,0)");
  width.addColorStop(0.5, "rgba(255,248,239,0.75)");
  width.addColorStop(1, "rgba(255,248,239,0)");
  ctx.fillStyle = width;
  ctx.fillRect(0, 0, 128, 256);
  ctx.globalCompositeOperation = "destination-in";
  const length = ctx.createLinearGradient(0, 0, 0, 256);
  length.addColorStop(0, "rgba(255,255,255,0.72)");
  length.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = length;
  ctx.fillRect(0, 0, 128, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLeaf(THREE, side) {
  // Each half is carved in the same arched silhouette as the inner opening.
  // Pivot coincides with the jamb, so neither leaf detaches on opening.
  const jamb = side === -1 ? -0.925 : 0.925;
  const shape = new THREE.Shape();
  shape.moveTo(jamb, -2.045);
  shape.lineTo(jamb, 0.83);
  if (side === -1) {
    shape.bezierCurveTo(-0.925, 1.4, -0.49, 1.945, 0, 1.96);
  } else {
    shape.bezierCurveTo(0.925, 1.4, 0.49, 1.945, 0, 1.96);
  }
  shape.lineTo(0, -2.045);
  shape.closePath();

  const doorMaterial = new THREE.MeshStandardMaterial({
    color: ROSE, metalness: 0.025, roughness: 0.77,
    side: THREE.DoubleSide,
  });
  const panel = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.085, steps: 1, curveSegments: 26,
      bevelEnabled: true, bevelSegments: 2,
      bevelThickness: 0.012, bevelSize: 0.009,
    }),
    doorMaterial,
  );
  panel.castShadow = true;
  panel.receiveShadow = true;
  const hinge = new THREE.Group();
  hinge.position.set(jamb, 0, 0.32);
  panel.position.x = -jamb;
  hinge.add(panel);

  const insetMaterial = new THREE.MeshStandardMaterial({
    color: 0xa86974, metalness: 0.01, roughness: 0.86,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd29aa3, metalness: 0.03, roughness: 0.64,
  });
  const centerX = side * 0.46 - jamb;

  // Shallow real inset surfaces and raised millwork replace the shiny
  // toy-like stripes from the previous version.
  for (const [y, height] of [[-1.25, 1.03], [0.03, 0.92]]) {
    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(0.63, height, 0.011), insetMaterial,
    );
    inset.position.set(centerX, y, 0.104);
    hinge.add(inset);
    const insetEdges = [
      [centerX - 0.324, y, 0.018, height + 0.04],
      [centerX + 0.324, y, 0.018, height + 0.04],
      [centerX, y + height / 2 + 0.014, 0.67, 0.016],
      [centerX, y - height / 2 - 0.014, 0.67, 0.016],
    ];
    for (const [x, lineY, width, lineHeight] of insetEdges) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(width, lineHeight, 0.025), edgeMaterial,
      );
      rail.position.set(x, lineY, 0.117);
      hinge.add(rail);
    }
  }

  const hardware = new THREE.MeshStandardMaterial({
    color: 0xd0b1b6, metalness: 0.55, roughness: 0.39,
  });
  for (const y of [-1.36, 0.36]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.19, 9), hardware);
    pin.position.set(-0.013 * side, y, 0.045);
    hinge.add(pin);
  }
  const handle = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.027, 0.16, 3, 8), hardware,
  );
  handle.position.set((side * 0.115) - jamb, -0.38, 0.15);
  hinge.add(handle);
  return hinge;
}

function createPortal(THREE, world, texture, groundTexture, doorLightTexture) {
  const root = new THREE.Group();
  // Keep the recessed backing entirely inside the arched aperture.
  // A rectangular box used to protrude above the crown and read as horns.
  const chamber = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      createArchShape(THREE, 0.91, -2.03, 0.8, 1.94),
      { depth: 0.36, steps: 1, bevelEnabled: false, curveSegments: 30 },
    ),
    new THREE.MeshStandardMaterial({
      color: DEEP_ROSE, roughness: 0.91, metalness: 0,
      side: THREE.DoubleSide,
    }),
  );
  chamber.position.set(0, 0, -0.43);
  chamber.receiveShadow = true;
  root.add(chamber);

  // Cover the arch as an <img style="object-fit: cover"> would: preserve
  // intrinsic photo proportions and crop surplus pixels, never stretch.
  const photoShape = createArchShape(THREE, 0.92, -2.03, 0.8, 1.945);
  const photoGeom = new THREE.ShapeGeometry(photoShape, 26);
  const position = photoGeom.getAttribute("position");
  const uv = photoGeom.getAttribute("uv");
  const imageWidth = texture.image?.naturalWidth || texture.image?.width || 1;
  const imageHeight = texture.image?.naturalHeight || texture.image?.height || 1;
  const imageAspect = imageWidth / imageHeight;
  const archAspect = 1.84 / 3.975;
  const visibleU = Math.min(1, archAspect / imageAspect);
  const visibleV = Math.min(1, imageAspect / archAspect);
  for (let i = 0; i < position.count; i += 1) {
    const normalizedU = (position.getX(i) + 0.92) / 1.84;
    const normalizedV = (position.getY(i) + 2.03) / 3.975;
    uv.setXY(
      i,
      (1 - visibleU) / 2 + normalizedU * visibleU,
      (1 - visibleV) / 2 + normalizedV * visibleV,
    );
  }
  uv.needsUpdate = true;
  const worldImage = new THREE.Mesh(
    photoGeom,
    new THREE.MeshBasicMaterial({
      map: texture, color: 0xffffff, toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  worldImage.position.z = -0.045;
  root.add(worldImage);

  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createFrameShape(THREE), {
      depth: 0.22, steps: 1, curveSegments: 30,
      bevelEnabled: true, bevelSegments: 3,
      bevelThickness: 0.025, bevelSize: 0.018,
    }),
    new THREE.MeshStandardMaterial({
      color: ROSE, metalness: 0.035, roughness: 0.7,
      side: THREE.DoubleSide,
    }),
  );
  frame.position.z = 0.035;
  frame.castShadow = true;
  frame.receiveShadow = true;
  root.add(frame);

  const left = createLeaf(THREE, -1);
  const right = createLeaf(THREE, 1);
  root.add(left, right);

  // The previous grey rectangular threshold floated in front of the arch.
  // The image and leaf now meet the existing ground/contact shadow directly.
  // Keep the existing soft contact shadow beneath each orbital door.
  const groundShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 2.1),
    new THREE.MeshBasicMaterial({
      map: groundTexture, transparent: true, opacity: 0.66,
      depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.set(0, -2.418, 0.31);
  root.add(groundShadow);

  // Ivory light lands on the floor only while this door is open.
  // It stays narrow, transparent and behind the front of the portal:
  // no persistent pink halo or rectangular stone block.
  const doorLight = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 3.1),
    new THREE.MeshBasicMaterial({
      map: doorLightTexture, color: 0xfff6ed, transparent: true,
      opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  doorLight.rotation.x = -Math.PI / 2;
  doorLight.position.set(0, -2.414, 1.56);
  root.add(doorLight);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2.36, 4.86, 0.65),
    new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0, colorWrite: false,
      depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  hitbox.position.z = 0.42;
  hitbox.userData.portalId = world.id;
  root.add(hitbox);
  return { id: world.id, root, left, right, hitbox, doorLight, openness: 0 };
}

function setWorldTexture(THREE, texture, renderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export async function mountThreePortals(container, options) {
  const THREE = await import("three");
  const reduced = options.reducedMotion;
  const supportsWebGL2 = document.createElement("canvas").getContext("webgl2");
  if (!supportsWebGL2) throw new Error("WebGL2 is unavailable");

  let renderer;
  let scene;
  let camera;
  let visible = true;
  let disposed = false;
  let frameId = 0;
  let resizeObserver;
  let intersectionObserver;
  let portals = [];
  const textures = [];
  const geometries = [];
  const materials = [];
  let onPointerMove;
  let onPointerLeave;
  let onPointerUp;
  let onVisibility;

  function dispose() {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
    if (renderer) {
      if (onPointerMove) renderer.domElement.removeEventListener("pointermove", onPointerMove);
      if (onPointerLeave) renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      if (onPointerUp) renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.remove();
      renderer.dispose();
    }
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) geometries.push(object.geometry);
        const material = object.material;
        if (material) materials.push(...(Array.isArray(material) ? material : [material]));
      });
    }
    for (const geometry of new Set(geometries)) geometry.dispose();
    for (const material of new Set(materials)) material.dispose();
    for (const texture of new Set(textures)) texture.dispose();
  }

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 70);
    camera.position.set(0, 0.15, 11.6);
    camera.lookAt(0, -0.12, 0);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x6e5661, 1.65);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xfff4f5, 2.35);
    key.position.set(-4.2, 6.3, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -10;
    key.shadow.bias = -0.0005;
    scene.add(key);
    const fillLight = new THREE.PointLight(0xffffff, 5, 13, 1.8);
    fillLight.position.set(4.7, 1.9, 4.7);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(25, 19),
      new THREE.MeshPhysicalMaterial({
        color: options.getDarkMode() ? 0x231b1f : 0xf6f2f3,
        transparent: true, opacity: options.getDarkMode() ? 0.26 : 0.34,
        metalness: 0.045, roughness: 0.8,
        side: THREE.DoubleSide,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.455;
    ground.receiveShadow = true;
    scene.add(ground);

    const groundTexture = makeGroundTexture(THREE);
    const doorLightTexture = makeDoorLightTexture(THREE);
    textures.push(groundTexture, doorLightTexture);

    const loader = new THREE.TextureLoader();
    const loaded = await Promise.all(WORLDS.map(async (world) => {
      try {
        const texture = await loader.loadAsync(world.image);
        textures.push(texture);
        return setWorldTexture(THREE, texture, renderer);
      } catch {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 8;
        const context = canvas.getContext("2d");
        context.fillStyle = "#c07a84";
        context.fillRect(0, 0, 8, 8);
        const backup = new THREE.CanvasTexture(canvas);
        backup.colorSpace = THREE.SRGBColorSpace;
        textures.push(backup);
        return backup;
      }
    }));
    if (disposed) {
      for (const texture of textures) texture.dispose();
      return dispose;
    }

    portals = WORLDS.map((world, index) => {
      const portal = createPortal(THREE, world, loaded[index], groundTexture, doorLightTexture);
      scene.add(portal.root);
      return portal;
    });

    // Quiet floating motes are matte/neutral; the existing protected
    // rose-petal component supplies the organic ambient motion separately.
    const moteCount = reduced ? 12 : 36;
    const moteGeometry = new THREE.IcosahedronGeometry(0.022, 0);
    const moteMaterial = new THREE.MeshBasicMaterial({
      color: 0xf6e6eb, transparent: true, opacity: 0.54,
      depthWrite: false,
    });
    const motes = new THREE.InstancedMesh(moteGeometry, moteMaterial, moteCount);
    const moteDummy = new THREE.Object3D();
    const motesData = Array.from({ length: moteCount }, (_, i) => ({
      x: Math.sin(i * 76.34) * (1.3 + (i % 7) * 0.5),
      y: -1.85 + ((i * 31) % 93) / 93 * 5.9,
      z: -2.0 + ((i * 17) % 47) / 47 * 3.8,
      phase: i * 1.7,
      size: 0.6 + (i % 5) * 0.19,
    }));
    scene.add(motes);

    const raycaster = new THREE.Raycaster();
    const normalizedPointer = new THREE.Vector2();
    const cameraPointer = new THREE.Vector2(0, 0);
    const targetPointer = new THREE.Vector2(0, 0);
    let hoveredId = 0;
    let currentDark = options.getDarkMode();

    function resize() {
      if (disposed || !renderer || !camera) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const aspect = rect.width / rect.height;
      camera.aspect = aspect;
      camera.position.z = aspect < 0.8 ? 15.2 : aspect < 1.05 ? 13.3 : 11.6;
      camera.fov = aspect < 0.8 ? 40 : 38;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, aspect < 0.9 ? 1.25 : 1.5));
      renderer.setSize(rect.width, rect.height, false);
    }

    function getHit(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      normalizedPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      normalizedPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(normalizedPointer, camera);
      const intersections = raycaster.intersectObjects(
        portals.map((portal) => portal.hitbox), false,
      );
      return intersections.length ? intersections[0].object.userData.portalId : null;
    }

    onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      targetPointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      targetPointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      const nextHover = getHit(event) || 0;
      if (nextHover && nextHover !== hoveredId) options.onHover(nextHover);
      hoveredId = nextHover;
      renderer.domElement.style.cursor = hoveredId ? "pointer" : "default";
    };
    onPointerLeave = () => {
      targetPointer.set(0, 0);
      hoveredId = 0;
      renderer.domElement.style.cursor = "default";
      options.onLeave();
    };
    onPointerUp = (event) => {
      if (event.button !== 0) return;
      const hit = getHit(event);
      if (!hit) return;
      if (hit === options.getActiveDoor()) options.onEnter(hit);
      else options.onChoose(hit);
    };
    onVisibility = () => { visible = !document.hidden; };
    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    document.addEventListener("visibilitychange", onVisibility);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
    }, { threshold: 0.01 });
    intersectionObserver.observe(container);
    resize();

    const target = new THREE.Vector3();
    let lastTime = performance.now();
    function frame(now) {
      if (disposed) return;
      frameId = window.requestAnimationFrame(frame);
      if (!visible) { lastTime = now; return; }
      const dt = Math.min((now - lastTime) / 1000, 0.06);
      lastTime = now;
      const t = now / 1000;
      const smooth = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
      const active = options.getActiveDoor();
      const dark = options.getDarkMode();
      if (dark !== currentDark) {
        currentDark = dark;
        ground.material.color.setHex(dark ? 0x231b1f : 0xf6f2f3);
        ground.material.opacity = dark ? 0.26 : 0.34;
      }

      if (!reduced) cameraPointer.lerp(targetPointer, Math.min(1, dt * 2.8));
      camera.position.x = cameraPointer.x * 0.32;
      camera.position.y = 0.15 + cameraPointer.y * 0.19;
      camera.lookAt(cameraPointer.x * -0.13, -0.13 + cameraPointer.y * -0.08, 0);
      camera.updateMatrixWorld();

      // Original PintuSectionJiplak orbital formula: 3 evenly spaced
      // doors rotating around the same ellipse with depth-driven scaling.
      // Motion's progress value (not this render clock) owns the timing.
      const mobile = camera.aspect < 0.9;
      const progress = options.getOrbit();
      for (const portal of portals) {
        const phase = ((portal.id - 1) / 3 + progress) * Math.PI * 2;
        const depth = Math.sin(phase);
        const selected = portal.id === active;
        const hoverLift = !reduced && hoveredId === portal.id ? 0.045 : 0;
        target.set(
          Math.cos(phase) * (mobile ? 1.9 : 2.5),
          depth * 0.46 + hoverLift,
          depth * 1.12,
        );
        portal.root.position.lerp(target, smooth);
        const desiredScale = 0.7 + ((depth + 1) / 2) * 0.29;
        const nextScale = THREE.MathUtils.lerp(portal.root.scale.x, desiredScale, smooth);
        portal.root.scale.setScalar(nextScale);
        portal.root.rotation.y = THREE.MathUtils.lerp(
          portal.root.rotation.y, -Math.cos(phase) * 0.155, smooth,
        );
        portal.root.rotation.z = 0;
        portal.openness = THREE.MathUtils.lerp(
          portal.openness, selected ? 1 : 0,
          reduced ? 1 : 1 - Math.exp(-dt * 2.8),
        );
        portal.left.rotation.y = -1.13 * portal.openness;
        portal.right.rotation.y = 1.13 * portal.openness;
        portal.doorLight.material.opacity = Math.min(0.42, portal.openness * 0.42);
        portal.doorLight.scale.x = 0.7 + portal.openness * 0.3;
      }
      for (let i = 0; i < moteCount; i += 1) {
        const data = motesData[i];
        moteDummy.position.set(
          data.x + (reduced ? 0 : Math.sin(t * 0.33 + data.phase) * 0.2),
          data.y + (reduced ? 0 : Math.sin(t * 0.4 + data.phase) * 0.15),
          data.z,
        );
        moteDummy.scale.setScalar(data.size * (reduced ? 1 : 0.82 + Math.sin(t * 1.2 + data.phase) * 0.18));
        moteDummy.updateMatrix();
        motes.setMatrixAt(i, moteDummy.matrix);
      }
      motes.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    }
    // First frame is rendered before mounting reports ready, so the fallback
    // does not fade out into an empty canvas while textures upload.
    frame(performance.now());
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
