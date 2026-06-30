/* =========================================================
   Living 3D avatar — Ready Player Me + Three.js
   True eye-tracking + blink + head-follow, all in code.

   HOW TO ACTIVATE:
   1. Go to https://readyplayer.me → create your avatar
      (pick brown wavy hair, hoodie, glasses to match your style).
   2. Copy your avatar's .glb link, e.g.
      https://models.readyplayer.me/XXXXXXXX.glb
   3. Paste it into AVATAR_URL below (keep the ?morphTargets=ARKit part).

   Until a URL is set, nothing loads (no perf cost) and the static
   3D avatar image keeps showing — so the site never breaks.
   ========================================================= */

const AVATAR_URL = ""; // ← paste your Ready Player Me .glb URL here (append ?morphTargets=ARKit)

// Tuning knobs (flip signs / tweak ranges in the browser if needed)
const CFG = {
  eyeYaw: 0.32, eyePitch: 0.22,   // how far the eyes move (radians)
  headYaw: 0.26, headPitch: 0.16, // how far the head turns (radians)
  eyeEase: 0.18,                  // eyes react fast (lead)
  headEase: 0.06,                 // head lags behind (follows)
  signX: 1, signY: 1,             // flip if it looks at the wrong side
  idleMs: 2500,                   // idle timeout before relaxing
  camDist: 0.66, camFov: 30,      // face framing
};

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mount = document.querySelector(".avatar-inner");

if (AVATAR_URL && mount && !reduce) {
  Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
  ])
    .then(([THREE, { GLTFLoader }]) => init(THREE, GLTFLoader))
    .catch(() => {/* keep static avatar image */});
}

function init(THREE, GLTFLoader) {
  const size = () => Math.min(mount.clientWidth, mount.clientHeight) || 320;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(size(), size());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", transition: "opacity .6s ease" });
  mount.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CFG.camFov, 1, 0.1, 100);

  // Soft studio lighting + subtle purple rim (brand)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a55, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(0.6, 1.2, 1.4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c5cff, 0.9); rim.position.set(-1, 0.4, -1); scene.add(rim);

  let head, neck, lEye, rEye, blinkMesh, blinkIdx = [], spine;
  const rest = new Map();
  let curEX = 0, curEY = 0, curHX = 0, curHY = 0;
  let tx = 0, ty = 0, lastMove = performance.now();
  let nextBlink = performance.now() + 2500, blinking = 0;

  new GLTFLoader().load(
    AVATAR_URL,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      head = model.getObjectByName("Head");
      neck = model.getObjectByName("Neck");
      lEye = model.getObjectByName("LeftEye");
      rEye = model.getObjectByName("RightEye");
      spine = model.getObjectByName("Spine2") || model.getObjectByName("Spine1") || model.getObjectByName("Spine");
      [head, neck, lEye, rEye, spine].forEach((b) => b && rest.set(b, b.rotation.clone()));

      model.traverse((o) => {
        if (o.isSkinnedMesh && o.morphTargetDictionary) {
          const d = o.morphTargetDictionary;
          if (d.eyeBlinkLeft !== undefined || d.eyeBlinkRight !== undefined) {
            blinkMesh = o;
            blinkIdx = [d.eyeBlinkLeft, d.eyeBlinkRight].filter((i) => i !== undefined);
          }
        }
      });

      // Frame the face
      const hp = new THREE.Vector3();
      (head || model).getWorldPosition(hp);
      camera.position.set(hp.x, hp.y + 0.01, hp.z + CFG.camDist);
      camera.lookAt(hp.x, hp.y - 0.02, hp.z);

      canvas.style.opacity = "1";
      const img = mount.querySelector("img");
      if (img) img.style.opacity = "0";
      window.__avatar3D = true; // tell anim.js to stop tilting the container
      animate();
    },
    undefined,
    () => {/* load failed — static image stays */}
  );

  addEventListener("mousemove", (e) => {
    tx = CFG.signX * (e.clientX / innerWidth * 2 - 1);
    ty = CFG.signY * (e.clientY / innerHeight * 2 - 1);
    lastMove = performance.now();
  }, { passive: true });

  addEventListener("resize", () => { renderer.setSize(size(), size()); });

  function applyBlink(v) {
    if (blinkMesh) blinkIdx.forEach((i) => (blinkMesh.morphTargetInfluences[i] = v));
  }

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const t = now / 1000;
    const idle = now - lastMove > CFG.idleMs;

    // Idle → relax gaze forward + gentle sway
    let aimX = tx, aimY = ty;
    if (idle) { aimX = Math.sin(t * 0.5) * 0.18; aimY = Math.sin(t * 0.4) * 0.1; }

    // Eyes lead (fast ease), head follows (slow ease)
    curEX += (aimX - curEX) * CFG.eyeEase;
    curEY += (aimY - curEY) * CFG.eyeEase;
    curHX += (aimX - curHX) * CFG.headEase;
    curHY += (aimY - curHY) * CFG.headEase;

    [lEye, rEye].forEach((eye) => {
      if (!eye) return; const r = rest.get(eye);
      eye.rotation.y = r.y + curEX * CFG.eyeYaw;
      eye.rotation.x = r.x - curEY * CFG.eyePitch;
    });
    if (head) { const r = rest.get(head); head.rotation.y = r.y + curHX * CFG.headYaw; head.rotation.x = r.x - curHY * CFG.headPitch; }
    if (neck) { const r = rest.get(neck); neck.rotation.y = r.y + curHX * CFG.headYaw * 0.5; }

    // Breathing (subtle)
    if (spine) { const r = rest.get(spine); spine.rotation.x = r.x + Math.sin(t * 1.1) * 0.012; }

    // Gentle blink every few seconds (idle or not)
    if (now > nextBlink && !blinking) { blinking = 1; }
    if (blinking) {
      const phase = (now - nextBlink);
      if (phase < 80) applyBlink(phase / 80);
      else if (phase < 200) applyBlink(1 - (phase - 80) / 120);
      else { applyBlink(0); blinking = 0; nextBlink = now + 2600 + Math.random() * 2600; }
    }

    renderer.render(scene, camera);
  }
}
