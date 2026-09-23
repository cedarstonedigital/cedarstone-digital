/* Equal Rights Center, concept build by CedarStone Digital
   Every effect degrades to nothing when the visitor asks for less motion. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- stored preferences (never fatal if storage is blocked) ---- */

  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  var savedContrast = read("erc-contrast");
  if (savedContrast === "high") root.setAttribute("data-contrast", "high");

  var savedSize = read("erc-textsize");
  if (savedSize === "large") root.setAttribute("data-textsize", "large");

  function bindToggle(id, attr, onValue, storageKey) {
    var btn = document.getElementById(id);
    if (!btn) return;
    var active = root.getAttribute(attr) === onValue;
    btn.setAttribute("aria-pressed", String(active));
    btn.addEventListener("click", function () {
      var nowOn = root.getAttribute(attr) !== onValue;
      if (nowOn) root.setAttribute(attr, onValue);
      else root.removeAttribute(attr);
      btn.setAttribute("aria-pressed", String(nowOn));
      write(storageKey, nowOn ? onValue : "off");
    });
  }

  bindToggle("toggle-contrast", "data-contrast", "high", "erc-contrast");
  bindToggle("toggle-textsize", "data-textsize", "large", "erc-textsize");

  /* ---- mobile navigation ---- */

  var navBtn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (navBtn && nav) {
    // The drawer hangs off the bottom of the header. The header moves when the
    // utility bar scrolls away, and it grows when that bar wraps on a narrow
    // phone, so measure it rather than assume a height.
    var masthead = document.querySelector(".masthead");

    var measureHeader = function () {
      if (!masthead) return;
      var bottom = Math.round(masthead.getBoundingClientRect().bottom);
      root.style.setProperty("--masthead-bottom", Math.max(bottom, 0) + "px");
    };

    measureHeader();
    window.addEventListener("resize", measureHeader);
    window.addEventListener("scroll", measureHeader, { passive: true });

    var setNav = function (open) {
      if (open) measureHeader();
      nav.setAttribute("data-open", String(open));
      navBtn.setAttribute("aria-expanded", String(open));
      navBtn.textContent = open ? "Close" : "Menu";
    };
    navBtn.addEventListener("click", function () {
      setNav(nav.getAttribute("data-open") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setNav(false);
        navBtn.focus();
      }
    });
  }

  /* ---- reveal on scroll, line level, never letter level ---- */

  var risers = Array.prototype.slice.call(document.querySelectorAll(".rise"));

  if (reduced.matches || !("IntersectionObserver" in window)) {
    risers.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    risers.forEach(function (el) { io.observe(el); });
  }

  /* ---- counters: real numbers, counted once ---- */

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function paint(el, value) {
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = value.toLocaleString("en-US") + suffix;
  }

  function run(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;

    if (reduced.matches) { paint(el, target); return; }

    var duration = 1100;
    var started = null;

    function frame(now) {
      if (started === null) started = now;
      var t = Math.min((now - started) / duration, 1);
      // ease-out cubic: fast entry, soft settle
      var eased = 1 - Math.pow(1 - t, 3);
      paint(el, Math.round(target * eased));
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    counters.forEach(function (el) { paint(el, 0); });
    if (reduced.matches || !("IntersectionObserver" in window)) {
      counters.forEach(run);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- intake form: validate inline, never only on submit ---- */

  var form = document.getElementById("intake");
  if (!form) return;

  var status = document.getElementById("intake-status");

  function fieldOf(input) { return input.closest(".field"); }

  function messageFor(input) {
    if (input.validity.valueMissing) {
      return input.getAttribute("data-msg-required") || "This answer is needed.";
    }
    if (input.validity.typeMismatch && input.type === "email") {
      return "Check the email address. It needs an @ sign.";
    }
    return "Check this answer.";
  }

  function validate(input) {
    var wrap = fieldOf(input);
    if (!wrap) return true;
    var err = wrap.querySelector(".err");
    var ok = input.checkValidity();

    wrap.classList.toggle("field--error", !ok);
    input.setAttribute("aria-invalid", String(!ok));

    if (err) {
      err.hidden = ok;
      if (!ok) err.textContent = messageFor(input);
    }
    return ok;
  }

  var inputs = Array.prototype.slice.call(
    form.querySelectorAll("input, select, textarea")
  );

  inputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value !== "") validate(input);
    });
    input.addEventListener("input", function () {
      var wrap = fieldOf(input);
      if (wrap && wrap.classList.contains("field--error")) validate(input);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var bad = inputs.filter(function (input) { return !validate(input); });

    if (bad.length) {
      if (status) {
        status.textContent =
          bad.length === 1
            ? "One answer still needs attention."
            : bad.length + " answers still need attention.";
      }
      bad[0].focus();
      return;
    }

    if (status) {
      status.textContent =
        "Concept only. In the built site this reaches the ERC intake team, " +
        "and you would get a reference number here.";
    }
  });
})();
