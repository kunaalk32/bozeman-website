/* Bozeman Capital Partners — interactions */
(function () {
  "use strict";

  /* dev/testing: ?capture renders everything immediately (no animations) */
  var captureMode = window.location.search.indexOf("capture") !== -1;
  if (captureMode) {
    document.documentElement.style.scrollBehavior = "auto";
    var st = document.createElement("style");
    st.textContent = ".hero{min-height:800px !important}.hero-media img{animation:none !important;transform:none !important}";
    document.head.appendChild(st);
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.transition = "none";
      el.classList.add("is-visible");
    });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute("data-count")).toLocaleString("en-US");
    });
    var heroP = window.location.search.match(/heroP=([\d.]+)/);
    if (heroP) {
      var h = document.querySelector(".hero");
      if (h) h.style.setProperty("--hero-progress", heroP[1]);
    }
    if (window.location.search.indexOf("menu") !== -1) {
      document.body.classList.add("menu-open");
      st.textContent += ".menu-nav a,.menu-aside{transition:none !important}";
    }
  }

  /* ---------- overlay menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var overlay = document.querySelector(".menu-overlay");

  if (toggle && overlay) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
    });

    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        overlay.setAttribute("aria-hidden", "true");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        overlay.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ---------- header solid state on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header && !document.body.classList.contains("header-solid")) {
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- stat count-up ---------- */
  var stats = document.querySelectorAll("[data-count]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (stats.length && !captureMode) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      stats.forEach(function (el) {
        el.textContent = parseFloat(el.getAttribute("data-count")).toLocaleString("en-US");
      });
    } else {
      var statObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      stats.forEach(function (el) {
        statObserver.observe(el);
      });
    }
  }

  /* ---------- hero shrink on scroll ---------- */
  var heroEl = document.querySelector(".hero");
  if (heroEl && !reducedMotion && !captureMode) {
    var heroTicking = false;
    var updateHero = function () {
      var p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.7), 0), 1);
      heroEl.style.setProperty("--hero-progress", p.toFixed(4));
      heroTicking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!heroTicking) {
          heroTicking = true;
          requestAnimationFrame(updateHero);
        }
      },
      { passive: true }
    );
    updateHero();
  }

  /* ---------- gentle parallax on banded images ---------- */
  var bands = document.querySelectorAll(".image-band img");
  if (bands.length && !reducedMotion) {
    var ticking = false;
    var updateParallax = function () {
      bands.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        img.style.transform = "translateY(" + progress * -8 + "%)";
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ---------- contact form (placeholder — ActiveCampaign wiring TBD) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-submit-note");
      if (note) {
        note.textContent =
          "Thank you — this form isn't wired up yet. Please email info@bozemanpartners.com and we'll be in touch.";
        note.style.color = "var(--gold-deep)";
      }
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
