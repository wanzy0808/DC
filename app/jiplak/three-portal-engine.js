/* Dedicated /jiplak experiment. Three.js is loaded only when this route mounts.
 * A typed declaration lives alongside this JS engine; the rest of DC uses TS.
 */
const ROSE = 0xc07a84;
const SOFT_ROSE = 0xe7acbd;
const IVORY = 0xffe8ed;
const DEEP_ROSE = 0x733e52;

const WORLDS = [
  { id: 1, image: "/wo.png", color: 0xffc4cd },
  { id: 2, image: "/hp-digital.png", color: 0xffdce5 },
  { id: 3, image: "/bukutamu.png", color: 0xe9acc4 },
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

function makeGlowTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,241,246,0.95)");
  gradient.addColorStop(0.18, "rgba(243,182,203,0.76)");
  gradient.addColorStop(0.42, "rgba(207,118,158,0.38)");
  gradient.addColorStop(1, "rgba(193,100,153,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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

function makeLightPathTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const across = ctx.createLinearGradient(0, 0, 128, 0);
  across.addColorStop(0, "rgba(255,205,228,0)");
  across.addColorStop(0.5, "rgba(255,211,227,0.8)");
  across.addColorStop(1, "rgba(255,205,228,0)");
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, 128, 256);
  ctx.globalCompositeOperation = "destination-in";
  const outward = ctx.createLinearGradient(0, 0, 0, 256);
  outward.addColorStop(0, "rgba(255,255,255,0.7)");
  outward.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = outward;
  ctx.fillRect(0, 0, 128, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLeaf(THREE, side) {
  const shape = new THREE.Shape();
  const inner = side === -1 ? -0.925 : 0.925;
  const outer = side === -1 ? -1.13 : 1.13;
  const edge = side === -1 ? 0 : 0;
  shape.moveTo(inner, -2.045);
  shape.lineTo(inner, 0.83);
  if (side === -1) {
    shape.bezierCurveTo(-0.925, 1.4, -0.49, 1.945, edge, 1.96);
  } else {
    shape.bezierCurveTo(0.925, 1.4, 0.49, 1.945, edge, 1.96);
  }
  shape.lineTo(edge, -2.045);
  shape.closePath();
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.105,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelThickness: 0.024,
    bevelSize: 0.018,
    curveSegments: 20,
  });
  const panel = new THREE.Mesh(geom, new THREE.MeshPhysicalMaterial({
    color: ROSE,
    metalness: 0.24,
    roughness: 0.35,
    clearcoat: 0.78,
    clearcoatRoughness: 0.23,
    side: THREE.DoubleSide,
  }));
  panel.castShadow = true;
  const hinge = new THREE.Group();
  hinge.position.set(outer, 0, 0.33);
  panel.position.x = -outer;
  hinge.add(panel);

  // Grooves, slim brass-like ivory piping, and physical handles live on the
  // leaf itself, so all details rotate naturally around the same hinge.
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: SOFT_ROSE,
    metalness: 0.64,
    roughness: 0.24,
  });
  const grooveMaterial = new THREE.MeshStandardMaterial({
    color: 0x9d5365,
    metalness: 0.3,
    roughness: 0.39,
  });
  const insetCenter = side === -1 ? -0.46 : 0.46;
  for (const y of [-0.75, 0.58]) {
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(0.61, 0.012, 0.014), grooveMaterial,
    );
    groove.position.set(insetCenter - outer, y, 0.135);
    hinge.add(groove);
  }
  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 2.3, 0.015), trimMaterial,
  );
  inset.position.set((side === -1 ? -0.82 : 0.82) - outer, -0.58, 0.135);
  hinge.add(inset);

  const handle = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.022, 0.2, 4, 8),
    new THREE.MeshPhysicalMaterial({
      color: IVORY, metalness: 0.7, roughness: 0.18, clearcoat: 1,
    }),
  );
  handle.position.set((side === -1 ? -0.105 : 0.105) - outer, -0.32, 0.18);
  hinge.add(handle);
  return hinge;
}

function createPortal(THREE, world, texture, glowTexture, groundTexture, pathTexture) {
  const root = new THREE.Group();

  // Backlit world is an actual plane inside the opening; the carved frame
  // and two solid leaves are independent 3D objects in front of it.
  const chamber = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 4.04, 0.62),
    new THREE.MeshStandardMaterial({
      color: DEEP_ROSE, roughness: 0.81, metalness: 0.12,
    }),
  );
  chamber.position.set(0, -0.045, -0.42);
  root.add(chamber);

  const photoShape = createArchShape(THREE, 0.92, -2.03, 0.8, 1.945);
  const photoGeom = new THREE.ShapeGeometry(photoShape, 22);
  const position = photoGeom.getAttribute("position");
  const uv = photoGeom.getAttribute("uv");
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    uv.setXY(i, (x + 0.92) / 1.84, (y + 2.03) / 3.975);
  }
  uv.needsUpdate = true;
  const worldImage = new THREE.Mesh(photoGeom, new THREE.MeshBasicMaterial({
    map: texture, color: 0xffffff, side: THREE.DoubleSide, toneMapped: false,
  }));
  worldImage.position.z = -0.045;
  root.add(worldImage);

  const atmosphere = new THREE.Mesh(photoGeom.clone(), new THREE.MeshBasicMaterial({
    color: world.color, transparent: true, opacity: 0.08,
    depthWrite: false, side: THREE.DoubleSide,
  }));
  atmosphere.position.z = -0.035;
  root.add(atmosphere);

  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createFrameShape(THREE), {
      depth: 0.24,
      steps: 1,
      curveSegments: 28,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelThickness: 0.055,
      bevelSize: 0.035,
    }),
    new THREE.MeshPhysicalMaterial({
      color: ROSE,
      metalness: 0.38,
      roughness: 0.27,
      clearcoat: 0.98,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    }),
  );
  frame.position.z = 0.04;
  frame.castShadow = true;
  frame.receiveShadow = true;
  root.add(frame);

  // Continuous arched highlight: unlike the old decorative lines it is a
  // real architectural trim attached to the door frame, with no open horns.
  const archPoints = [];
  const curve = photoShape.getPoints(44);
  for (const p of curve) archPoints.push(new THREE.Vector3(p.x, p.y, 0.35));
  const archTrim = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(archPoints, true, "centripetal"), 96, 0.014, 5, true),
    new THREE.MeshStandardMaterial({
      color: IVORY, metalness: 0.51, roughness: 0.2,
      emissive: SOFT_ROSE, emissiveIntensity: 0.2,
    }),
  );
  root.add(archTrim);

  const left = createLeaf(THREE, -1);
  const right = createLeaf(THREE, 1);
  root.add(left, right);

  // Real stepped threshold creates physical grounding instead of a card
  // shadow pasted beneath a flat image.
  const stone = new THREE.MeshPhysicalMaterial({
    color: SOFT_ROSE, metalness: 0.25, roughness: 0.38, clearcoat: 0.58,
  });
  const threshold = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.15, 0.86), stone);
  threshold.position.set(0, -2.29, 0.24);
  threshold.castShadow = true;
  threshold.receiveShadow = true;
  root.add(threshold);

  const thresholdFront = new THREE.Mesh(
    new THREE.BoxGeometry(2.26, 0.07, 0.66),
    new THREE.MeshPhysicalMaterial({
      color: IVORY, roughness: 0.35, metalness: 0.25,
      transparent: true, opacity: 0.7,
    }),
  );
  thresholdFront.position.set(0, -2.38, 0.86);
  root.add(thresholdFront);

  const groundShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 2.1),
    new THREE.MeshBasicMaterial({
      map: groundTexture, transparent: true, opacity: 0.65,
      depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.set(0, -2.43, 0.3);
  root.add(groundShadow);

  const spill = new THREE.Mesh(
    new THREE.PlaneGeometry(2.45, 4.6),
    new THREE.MeshBasicMaterial({
      map: pathTexture, color: world.color,
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  spill.rotation.x = -Math.PI / 2;
  spill.position.set(0, -2.407, 2.28);
  root.add(spill);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color: world.color,
    transparent: true, opacity: 0.62,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  halo.scale.set(4.85, 6.4, 1);
  halo.position.set(0, 0.07, -1.35);
  root.add(halo);

  const backLight = new THREE.PointLight(world.color, 0, 4.8, 1.3);
  backLight.position.set(0, 0.75, -0.32);
  root.add(backLight);

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2.36, 4.9, 0.66),
    new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0, colorWrite: false,
      depthWrite: false, side: THREE.DoubleSide,
    }),
  );
  hitbox.position.z = 0.42;
  hitbox.userData.portalId = world.id;
  root.add(hitbox);

  return {
    id: world.id, root, left, right, halo, spill, backLight, atmosphere,
    hitbox, openness: 0, floor: 0, photo: worldImage,
  };
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
  const clock = new THREE.Clock();

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
    renderer.toneMappingExposure = 1.22;
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

    const hemisphere = new THREE.HemisphereLight(0xffedf1, 0x613449, 2.05);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xffe5ee, 3.4);
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
    const fillLight = new THREE.PointLight(0xf4a8c3, 15, 13, 1.6);
    fillLight.position.set(4.7, 1.9, 4.7);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(25, 19),
      new THREE.MeshPhysicalMaterial({
        color: options.getDarkMode() ? 0x25141e : 0xf9e8ee,
        transparent: true, opacity: options.getDarkMode() ? 0.24 : 0.31,
        metalness: 0.22, roughness: 0.32, clearcoat: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.455;
    ground.receiveShadow = true;
    scene.add(ground);

    const glowTexture = makeGlowTexture(THREE);
    const groundTexture = makeGroundTexture(THREE);
    const pathTexture = makeLightPathTexture(THREE);
    textures.push(glowTexture, groundTexture, pathTexture);

    const loader = new THREE.TextureLoader();
    const loaded = await Promise.all(WORLDS.map(async (world) => {
      try {
        const texture = await loader.loadAsync(world.image);
        textures.push(texture);
        return setWorldTexture(THREE, texture, renderer);
      } catch {
        const backup = makeGlowTexture(THREE);
        textures.push(backup);
        return backup;
      }
    }));
    if (disposed) return dispose;

    portals = WORLDS.map((world, index) => {
      const portal = createPortal(
        THREE, world, loaded[index], glowTexture, groundTexture, pathTexture,
      );
      scene.add(portal.root);
      return portal;
    });

    // A sparse constellation of real instanced 3D motes floats around the
    // portals. The original landing's CSS rose-petal component stays intact.
    const moteCount = reduced ? 24 : 80;
    const moteGeometry = new THREE.IcosahedronGeometry(0.022, 0);
    const moteMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc7dc, transparent: true, opacity: 0.73,
      blending: THREE.AdditiveBlending, depthWrite: false,
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
      hoveredId = getHit(event) || 0;
      renderer.domElement.style.cursor = hoveredId ? "pointer" : "default";
    };
    onPointerLeave = () => {
      targetPointer.set(0, 0);
      hoveredId = 0;
      renderer.domElement.style.cursor = "default";
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
    const timeOffset = clock.getElapsedTime();
    let lastTime = performance.now();
    function frame(now) {
      if (disposed) return;
      frameId = window.requestAnimationFrame(frame);
      if (!visible) { lastTime = now; return; }
      const dt = Math.min((now - lastTime) / 1000, 0.06);
      lastTime = now;
      const t = (now / 1000) - timeOffset;
      const smooth = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
      const active = options.getActiveDoor();
      const dark = options.getDarkMode();
      if (dark !== currentDark) {
        currentDark = dark;
        ground.material.color.setHex(dark ? 0x25141e : 0xf9e8ee);
        ground.material.opacity = dark ? 0.24 : 0.31;
      }

      if (!reduced) cameraPointer.lerp(targetPointer, Math.min(1, dt * 2.8));
      camera.position.x = cameraPointer.x * 0.32;
      camera.position.y = 0.15 + cameraPointer.y * 0.19;
      camera.lookAt(cameraPointer.x * -0.13, -0.13 + cameraPointer.y * -0.08, 0);
      camera.updateMatrixWorld();

      const mobile = camera.aspect < 0.9;
      for (const portal of portals) {
        const selected = portal.id === active;
        const goesRight = (portal.id - active + 3) % 3 === 1;
        const side = goesRight ? 1 : -1;
        const targetX = selected ? 0 : side * (mobile ? 2.44 : 3.08);
        const targetY = selected ? 0.04 : -0.13;
        const targetZ = selected ? 0.36 : -1.65;
        target.set(targetX, targetY + (reduced ? 0 : Math.sin(t * 0.7 + portal.id * 1.2) * 0.03), targetZ);
        portal.root.position.lerp(target, smooth);
        const desiredScale = selected ? 1 : mobile ? 0.72 : 0.78;
        const nextScale = THREE.MathUtils.lerp(portal.root.scale.x, desiredScale, smooth);
        portal.root.scale.setScalar(nextScale);
        portal.root.rotation.y = THREE.MathUtils.lerp(
          portal.root.rotation.y, selected ? 0 : -side * 0.15, smooth,
        );
        portal.root.rotation.z = THREE.MathUtils.lerp(
          portal.root.rotation.z, selected ? 0 : side * 0.018, smooth,
        );

        portal.openness = THREE.MathUtils.lerp(
          portal.openness, selected ? 1 : 0, reduced ? 1 : 1 - Math.exp(-dt * 2.35),
        );
        portal.left.rotation.y = -1.31 * portal.openness;
        portal.right.rotation.y = 1.31 * portal.openness;
        portal.halo.material.opacity = THREE.MathUtils.lerp(
          portal.halo.material.opacity, selected ? 0.7 : 0.27, smooth,
        );
        portal.halo.scale.set(
          4.8 + portal.openness * 0.65, 6.35 + portal.openness * 0.5, 1,
        );
        portal.spill.material.opacity = THREE.MathUtils.lerp(
          portal.spill.material.opacity, selected ? 0.78 : 0.04, smooth,
        );
        portal.backLight.intensity = THREE.MathUtils.lerp(
          portal.backLight.intensity, selected ? 10 : 2.4, smooth,
        );
        portal.atmosphere.material.opacity = selected ? 0.055 : 0.18;
        if (!reduced) {
          const hoverLift = hoveredId === portal.id ? 0.055 : 0;
          portal.root.position.y += hoverLift;
        }
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
