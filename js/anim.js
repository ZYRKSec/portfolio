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
} catch (e) {
  /* If the Motion API ever changes, make sure nothing stays hidden */
  document.querySelectorAll(".hero-text, .hero-visual").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}
