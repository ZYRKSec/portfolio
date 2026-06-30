/* =========================================================
   Motion enhancements (motion.dev — the Framer Motion family,
   framework-agnostic vanilla build, loaded from CDN).
   Progressive enhancement: if this module fails to load,
   the site still works — hero elements are visible by default
   and section reveals fall back to the CSS/IntersectionObserver
   system in script.js.
   ========================================================= */

import { animate, stagger, scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const spring = [0.16, 1, 0.3, 1];

try {
  /* ---------- Hero entrance choreography (on load) ---------- */
  const heroText = document.querySelector(".hero-text");
  if (!reduce && heroText) {
    const items = heroText.querySelectorAll(":scope > *");
    animate(
      items,
      { opacity: [0, 1], transform: ["translateY(26px)", "translateY(0px)"] },
      { delay: stagger(0.08, { startDelay: 0.15 }), duration: 0.7, ease: spring }
    );
  }

  const heroVisual = document.querySelector(".hero-visual");
  if (!reduce && heroVisual) {
    animate(
      heroVisual,
      { opacity: [0, 1], transform: ["scale(0.88)", "scale(1)"] },
      { duration: 0.9, ease: spring, delay: 0.25 }
    );
    // Floating badges pop in after the avatar
    const badges = heroVisual.querySelectorAll(".float-badge");
    if (badges.length) {
      animate(
        badges,
        { opacity: [0, 1], transform: ["scale(0.6)", "scale(1)"] },
        { delay: stagger(0.12, { startDelay: 0.7 }), duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
      );
    }
  }

  /* ---------- Scroll parallax depth (subtle, transform-only) ---------- */
  if (!reduce) {
    // Background aurora blob drifts down as you scroll its section
    document.querySelectorAll(".blob-bg").forEach((el) => {
      scroll(animate(el, { transform: ["translateY(0px)", "translateY(160px)"] }, { ease: "linear" }), {
        target: el.closest("section, header") || document.body,
        offset: ["start start", "end start"],
      });
    });

    // Hero avatar lifts gently on scroll → parallax depth
    const av = document.querySelector(".hero-visual");
    if (av) {
      scroll(animate(av, { transform: ["translateY(0px)", "translateY(-70px)"] }, { ease: "linear" }), {
        target: document.querySelector(".hero") || document.body,
        offset: ["start start", "end start"],
      });
    }
  }

  /* ---------- Living avatar: head follows cursor + idle breathing/sway ---------- */
  const inner = document.querySelector(".avatar-inner");
  const ring = document.querySelector(".avatar-ring");
  if (!reduce && inner && ring) {
    inner.style.transformStyle = "preserve-3d";
    inner.style.willChange = "transform";
    const MAX = 11;              // limited, natural head rotation (deg)
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0, lastMove = performance.now();

    window.addEventListener("mousemove", (e) => {
      const r = ring.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      tRY = Math.max(-MAX, Math.min(MAX, dx * MAX * 2.4));   // look left/right
      tRX = Math.max(-MAX, Math.min(MAX, -dy * MAX * 2.4));  // look up/down
      lastMove = performance.now();
    }, { passive: true });

    const tick = () => {
      // If the Three.js 3D avatar is active, let it own the head — stop tilting the container.
      if (window.__avatar3D) { inner.style.transform = ""; requestAnimationFrame(tick); return; }
      const now = performance.now();
      const t = now / 1000;
      const idle = now - lastMove > 2500;
      // When idle: ease back to a gentle forward sway instead of cursor target
      let aimRX = tRX, aimRY = tRY;
      if (idle) {
        aimRY = Math.sin(t * 0.6) * 4;   // slow head sway
        aimRX = Math.sin(t * 0.45) * 2;
      }
      // Smooth easing with slight delay (lerp) → lifelike, never jerky
      cRX += (aimRX - cRX) * 0.06;
      cRY += (aimRY - cRY) * 0.06;
      // Subtle breathing
      const breathe = Math.sin(t * 1.1);
      const ty = breathe * 1.3;
      const sc = 1 + breathe * 0.006;
      inner.style.transform =
        `rotateX(${cRX.toFixed(2)}deg) rotateY(${cRY.toFixed(2)}deg) translateY(${ty.toFixed(2)}px) scale(${sc.toFixed(4)})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
} catch (e) {
  /* If the Motion API ever changes, make sure nothing stays hidden */
  document.querySelectorAll(".hero-text, .hero-visual").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}
