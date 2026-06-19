/**
 * Motion Animation Toolkit
 * Built from motion.dev — drop this into any project.
 * CDN: https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js
 *
 * Usage: import via <script type="module"> or call init() after DOM load.
 */

import {
  animate,
  scroll,
  inView,
  stagger,
  spring,
} from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

// ─────────────────────────────────────────────
// 1. FADE IN ON SCROLL (inView)
// ─────────────────────────────────────────────
export function initFadeInOnScroll(selector = "[data-animate='fade']") {
  inView(selector, (element) => {
    animate(
      element,
      { opacity: [0, 1], y: [40, 0] },
      { duration: 0.6, easing: "ease-out" }
    );
  });
}

// ─────────────────────────────────────────────
// 2. STAGGER LIST ITEMS ON SCROLL
// ─────────────────────────────────────────────
export function initStaggerList(selector = "[data-animate='stagger'] > *") {
  inView(selector, () => {
    animate(
      selector,
      { opacity: [0, 1], y: [30, 0] },
      { delay: stagger(0.08), duration: 0.5, easing: "ease-out" }
    );
  });
}

// ─────────────────────────────────────────────
// 3. SCROLL-LINKED PARALLAX
// ─────────────────────────────────────────────
export function initParallax(selector = "[data-parallax]", strength = 0.3) {
  document.querySelectorAll(selector).forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || strength;
    scroll(
      animate(el, { y: [0, -200 * speed] }, { ease: "linear" }),
      { target: el, offset: ["start end", "end start"] }
    );
  });
}

// ─────────────────────────────────────────────
// 4. SCROLL PROGRESS BAR
// ─────────────────────────────────────────────
export function initScrollProgressBar(selector = "#progress-bar") {
  const bar = document.querySelector(selector);
  if (!bar) return;
  scroll(
    animate(bar, { scaleX: [0, 1] }, { ease: "linear" }),
    { offset: ["start start", "end end"] }
  );
}

// ─────────────────────────────────────────────
// 5. SPRING HOVER CARD
// ─────────────────────────────────────────────
export function initSpringCards(selector = "[data-spring-card]") {
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("mouseenter", () => {
      animate(card, { scale: 1.04, y: -6 }, { type: spring, stiffness: 300, damping: 20 });
    });
    card.addEventListener("mouseleave", () => {
      animate(card, { scale: 1, y: 0 }, { type: spring, stiffness: 300, damping: 25 });
    });
  });
}

// ─────────────────────────────────────────────
// 6. BUTTON PRESS ANIMATION
// ─────────────────────────────────────────────
export function initButtonPress(selector = "[data-press]") {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener("mousedown", () => {
      animate(btn, { scale: 0.94 }, { type: spring, stiffness: 500, damping: 30 });
    });
    btn.addEventListener("mouseup", () => {
      animate(btn, { scale: 1 }, { type: spring, stiffness: 400, damping: 20, bounce: 0.4 });
    });
    btn.addEventListener("mouseleave", () => {
      animate(btn, { scale: 1 }, { duration: 0.2 });
    });
  });
}

// ─────────────────────────────────────────────
// 7. TYPEWRITER EFFECT
// ─────────────────────────────────────────────
export function initTypewriter(selector = "[data-typewriter]", speed = 40) {
  document.querySelectorAll(selector).forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
  });
}

// ─────────────────────────────────────────────
// 8. INFINITE MARQUEE / TICKER
// ─────────────────────────────────────────────
export function initMarquee(selector = "[data-marquee]", duration = 20) {
  document.querySelectorAll(selector).forEach((track) => {
    const clone = track.innerHTML;
    track.innerHTML += clone;
    animate(track, { x: [0, "-50%"] }, { duration, repeat: Infinity, ease: "linear" });
  });
}

// ─────────────────────────────────────────────
// 9. SKELETON SHIMMER
// ─────────────────────────────────────────────
export function initSkeletonShimmer(selector = "[data-skeleton]") {
  document.querySelectorAll(selector).forEach((el) => {
    animate(
      el,
      { backgroundPosition: ["-200% 0", "200% 0"] },
      { duration: 1.4, repeat: Infinity, ease: "linear" }
    );
    el.style.background =
      "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)";
    el.style.backgroundSize = "400% 100%";
  });
}

// ─────────────────────────────────────────────
// 10. COUNTER / NUMBER ANIMATION
// ─────────────────────────────────────────────
export function initCounters(selector = "[data-counter]") {
  inView(selector, (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        el.textContent = value.toFixed(decimals) + suffix;
      },
    });
  });
}

// ─────────────────────────────────────────────
// 11. HERO ENTRANCE SEQUENCE
// ─────────────────────────────────────────────
export function initHeroEntrance(config = {}) {
  const {
    headline = "[data-hero-headline]",
    subtext = "[data-hero-subtext]",
    cta = "[data-hero-cta]",
    image = "[data-hero-image]",
  } = config;

  animate([
    [headline, { opacity: [0, 1], y: [60, 0] }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] }],
    [subtext, { opacity: [0, 1], y: [40, 0] }, { duration: 0.6, ease: "ease-out", at: "-0.4" }],
    [cta,     { opacity: [0, 1], y: [20, 0] }, { duration: 0.5, ease: "ease-out", at: "-0.3" }],
    [image,   { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1], at: "-0.5" }],
  ]);
}

// ─────────────────────────────────────────────
// 12. REVEAL FROM CLIP (slide wipe)
// ─────────────────────────────────────────────
export function initClipReveal(selector = "[data-clip-reveal]") {
  inView(selector, (el) => {
    animate(
      el,
      { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
      { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    );
  });
}

// ─────────────────────────────────────────────
// 13. ROTATE-IN ON SCROLL
// ─────────────────────────────────────────────
export function initRotateIn(selector = "[data-rotate-in]") {
  inView(selector, (el) => {
    animate(
      el,
      { opacity: [0, 1], rotate: [-12, 0], scale: [0.9, 1] },
      { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
    );
  });
}

// ─────────────────────────────────────────────
// 14. SCROLL-DRIVEN ROTATION (e.g., logo spin)
// ─────────────────────────────────────────────
export function initScrollRotation(selector = "[data-scroll-rotate]") {
  document.querySelectorAll(selector).forEach((el) => {
    scroll(
      animate(el, { rotate: [0, 360] }, { ease: "linear" }),
      { target: el, offset: ["start end", "end start"] }
    );
  });
}

// ─────────────────────────────────────────────
// 15. SCROLL-DRIVEN SCALE (zoom on scroll)
// ─────────────────────────────────────────────
export function initScrollScale(selector = "[data-scroll-scale]") {
  document.querySelectorAll(selector).forEach((el) => {
    scroll(
      animate(el, { scale: [1, 1.15] }, { ease: "linear" }),
      { target: el, offset: ["start end", "center center"] }
    );
  });
}

// ─────────────────────────────────────────────
// 16. MAGNETIC BUTTON EFFECT
// ─────────────────────────────────────────────
export function initMagneticButtons(selector = "[data-magnetic]") {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      animate(btn, { x: dx, y: dy }, { type: spring, stiffness: 200, damping: 15 });
    });
    btn.addEventListener("mouseleave", () => {
      animate(btn, { x: 0, y: 0 }, { type: spring, stiffness: 300, damping: 20 });
    });
  });
}

// ─────────────────────────────────────────────
// 17. ACCORDION / EXPAND-COLLAPSE
// ─────────────────────────────────────────────
export function initAccordion(selector = "[data-accordion]") {
  document.querySelectorAll(selector).forEach((panel) => {
    const trigger = panel.querySelector("[data-accordion-trigger]");
    const content = panel.querySelector("[data-accordion-content]");
    if (!trigger || !content) return;

    let open = false;
    content.style.overflow = "hidden";
    content.style.height = "0px";
    content.style.opacity = "0";

    trigger.addEventListener("click", () => {
      if (!open) {
        content.style.height = "auto";
        const h = content.scrollHeight + "px";
        content.style.height = "0px";
        animate(content, { height: [0, content.scrollHeight], opacity: [0, 1] }, {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
          onComplete: () => { content.style.height = "auto"; },
        });
      } else {
        animate(content, { height: [content.scrollHeight, 0], opacity: [1, 0] }, {
          duration: 0.35,
          ease: "ease-in",
          onComplete: () => { content.style.height = "0px"; },
        });
      }
      open = !open;
    });
  });
}

// ─────────────────────────────────────────────
// 18. TEXT SPLIT WORD STAGGER
// ─────────────────────────────────────────────
export function initSplitText(selector = "[data-split-text]") {
  document.querySelectorAll(selector).forEach((el) => {
    const words = el.textContent.trim().split(" ");
    el.innerHTML = words
      .map((w) => `<span style="display:inline-block;overflow:hidden"><span class="word" style="display:inline-block">${w}</span></span>`)
      .join(" ");

    inView(el, () => {
      animate(
        el.querySelectorAll(".word"),
        { y: ["110%", "0%"], opacity: [0, 1] },
        { delay: stagger(0.07), duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      );
    });
  });
}

// ─────────────────────────────────────────────
// 19. IMAGE PARALLAX ON MOUSE MOVE
// ─────────────────────────────────────────────
export function initMouseParallax(selector = "[data-mouse-parallax]") {
  document.querySelectorAll(selector).forEach((scene) => {
    scene.addEventListener("mousemove", (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      scene.querySelectorAll("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 1;
        animate(
          layer,
          { x: x * 40 * depth, y: y * 30 * depth },
          { type: spring, stiffness: 80, damping: 18 }
        );
      });
    });

    scene.addEventListener("mouseleave", () => {
      scene.querySelectorAll("[data-depth]").forEach((layer) => {
        animate(layer, { x: 0, y: 0 }, { type: spring, stiffness: 100, damping: 25 });
      });
    });
  });
}

// ─────────────────────────────────────────────
// 20. INIT ALL — run everything at once
// ─────────────────────────────────────────────
export function initAll() {
  initFadeInOnScroll();
  initStaggerList();
  initParallax();
  initScrollProgressBar();
  initSpringCards();
  initButtonPress();
  initMarquee();
  initSkeletonShimmer();
  initCounters();
  initClipReveal();
  initRotateIn();
  initScrollRotation();
  initScrollScale();
  initMagneticButtons();
  initAccordion();
  initSplitText();
  initMouseParallax();
}
