/* Maui Water Damage Pros — interactions
   Lightweight, dependency-free. Progressive enhancement only. */
(function () {
  "use strict";

  /* Header shadow on scroll */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile navigation drawer */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".mobile-nav");
  var scrim = document.querySelector(".scrim");
  var closeBtn = document.querySelector(".mobile-nav__close");

  function openNav() {
    if (!drawer) return;
    drawer.classList.add("open");
    if (scrim) scrim.classList.add("open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
  }
  function closeNav() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (scrim) scrim.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (window.__lenis) window.__lenis.start();
  }
  if (toggle) toggle.addEventListener("click", openNav);
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  if (scrim) scrim.addEventListener("click", closeNav);
  document.querySelectorAll(".mobile-nav a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* Accordion (FAQ) */
  document.querySelectorAll(".acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = btn.nextElementSibling;
      var expanded = btn.getAttribute("aria-expanded") === "true";
      // Close siblings within the same accordion
      var accordion = btn.closest(".accordion");
      if (accordion) {
        accordion.querySelectorAll(".acc-trigger").forEach(function (other) {
          if (other !== btn) {
            other.setAttribute("aria-expanded", "false");
            var op = other.nextElementSibling;
            if (op) op.style.height = "0px";
          }
        });
      }
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) {
        panel.style.height = expanded ? "0px" : panel.scrollHeight + "px";
      }
    });
  });

  /* Reveal on scroll */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = (el.getAttribute("data-decimals")) ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
        var dur = 1400, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* Contact form (mockup only) */
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form__status");
      if (note) {
        note.textContent = "✓ Thank you! This is a demo form. In the live site, your request would be sent to our 24/7 dispatch team and we'd call you back within minutes.";
        note.style.color = "var(--teal-600)";
      }
      form.reset();
    });
  });

  /* Water bubble effects + 3D (skipped when user prefers reduced motion) */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function makeBubbles(container, count, opts) {
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = "bubbles";
    wrap.setAttribute("aria-hidden", "true");
    for (var i = 0; i < count; i++) {
      var b = document.createElement("b");
      var size = (opts.min || 10) + Math.random() * ((opts.max || 46) - (opts.min || 10));
      var dur = (opts.durMin || 9) + Math.random() * ((opts.durMax || 18) - (opts.durMin || 9));
      b.style.width = b.style.height = size.toFixed(0) + "px";
      b.style.left = (Math.random() * 100).toFixed(2) + "%";
      b.style.animationDuration = dur.toFixed(1) + "s";
      b.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
      b.style.setProperty("--drift", (Math.random() * 90 - 45).toFixed(0) + "px");
      wrap.appendChild(b);
    }
    container.insertBefore(wrap, container.firstChild);
  }

  if (!reduceMotion) {
    document.querySelectorAll(".cta-band").forEach(function (el) { makeBubbles(el, 16, { min: 10, max: 52, durMin: 8, durMax: 16 }); });
    document.querySelectorAll(".hero").forEach(function (el) { makeBubbles(el, 12, { min: 16, max: 80, durMin: 16, durMax: 30 }); });
    document.querySelectorAll(".footer").forEach(function (el) { makeBubbles(el, 10, { min: 12, max: 46, durMin: 16, durMax: 30 }); });

    /* Interactive 3D tilt on hero image (desktop pointers only) */
    var heroMedia = document.querySelector(".hero__media");
    if (heroMedia && window.matchMedia("(pointer:fine)").matches) {
      var rect = null;
      heroMedia.addEventListener("mouseenter", function () { rect = heroMedia.getBoundingClientRect(); });
      heroMedia.addEventListener("mousemove", function (e) {
        if (!rect) rect = heroMedia.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        heroMedia.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
        heroMedia.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
      });
      heroMedia.addEventListener("mouseleave", function () {
        heroMedia.style.setProperty("--ry", "0deg");
        heroMedia.style.setProperty("--rx", "0deg");
      });
    }
  }

  /* ---- Scroll progress bar ---- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);
  function updateProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = p.toFixed(2) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  /* ---- Lenis smooth scrolling (loaded from CDN; graceful fallback) ---- */
  if (!reduceMotion) {
    var ls = document.createElement("script");
    ls.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js";
    ls.onload = function () {
      try {
        var lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
        window.__lenis = lenis;
        function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        /* smooth anchor jumps */
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
          var id = a.getAttribute("href");
          if (id && id.length > 1) {
            a.addEventListener("click", function (e) {
              var target = document.querySelector(id);
              if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -84, duration: 1.1 }); }
            });
          }
        });
      } catch (err) { /* native scroll remains */ }
    };
    document.head.appendChild(ls);

    /* ---- Interactive 3D tilt on cards (fine pointers only) ---- */
    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".cardm, .quote-card").forEach(function (card) {
        var r = null;
        card.addEventListener("mouseenter", function () { r = card.getBoundingClientRect(); });
        card.addEventListener("mousemove", function (e) {
          if (!r) r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
            (px * 6).toFixed(2) + "deg) translateY(-6px)";
        });
        card.addEventListener("mouseleave", function () { card.style.transform = ""; });
      });
    }
  }

  /* ---- Before / After comparison slider ---- */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var range = ba.querySelector(".ba__range");
    if (!range) return;
    function apply() { ba.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", apply);
    apply();
  });

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
