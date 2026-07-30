/* =====================================================================
   Tyan Construction — UI interactions
   Header state, mobile nav, scroll reveal, animated counters,
   3D tilt on image cards, and the (client-side demo) contact form.
   ===================================================================== */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- sticky header state -------------------------------------------
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- mobile nav -----------------------------------------------------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // ---- reveal on scroll ----------------------------------------------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add("in"));
  }

  // ---- animated counters ---------------------------------------------
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.firstChild ? (el.childNodes[0].nodeValue = val.toLocaleString()) : (el.textContent = val);
      if (p < 1) requestAnimationFrame(step);
      else el.childNodes[0].nodeValue = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduce) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCount(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.childNodes[0].nodeValue = parseFloat(c.dataset.count).toLocaleString()));
  }

  // ---- 3D tilt on image cards ----------------------------------------
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      const MAX = 9;
      let raf = null;
      const move = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateY(-4px)`;
        });
      };
      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
    });
  }

  // ---- contact form (demo — no backend on the preview) ---------------
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const name = (form.querySelector("#f-name") || {}).value || "";
      if (status) {
        status.textContent = `Thanks${name ? ", " + name.split(" ")[0] : ""} — this preview form isn't wired to email yet. Call 011 493 3442 and we'll get straight onto it.`;
      }
      form.reset();
    });
  }

  // ---- footer year ----------------------------------------------------
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
