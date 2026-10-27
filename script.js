/* ==========================================================================
   Ajitha Dental Clinic — scripts
   1. Hero: responsive JPG frame sequence (hero section only)
   2. Header and mobile navigation
   3. Illustrative case-study dialog and sample feedback cards
   4. Clinic details from config.js
   ========================================================================== */

(function () {
  "use strict";

  const cfg = window.CLINIC_CONFIG || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. HERO FRAME ANIMATION
     ------------------------------------------------------------------ */
  const FRAME_COUNT = 300;
  const MOBILE_PLAYBACK_DURATION = 10000;
  const mobileViewport = window.matchMedia("(max-width: 767px)");
  const framePath = (i) => `frames/frame_${String(i + 1).padStart(3, "0")}.jpg`;

  const hero = document.getElementById("home");
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const loader = document.getElementById("heroLoader");
  const loaderFill = document.getElementById("heroLoaderFill");
  const heroContent = document.getElementById("heroContent");

  const frames = new Array(FRAME_COUNT);   // loaded HTMLImageElements
  let settledCount = 0;
  let stageW = 0, stageH = 0;
  let drawnIndex = -1;
  let currentPos = 0;                      // smoothed frame position
  let targetIndex = 0;
  let mobilePlaybackStartedAt = null;
  let mobilePlaybackComplete = false;
  let animationFrameId = null;

  function scheduleAnimation() {
    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  function resizeCanvas() {
    const stage = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Size the backing canvas from the responsive stage and cap high-DPI memory use.
    stageW = canvas.clientWidth || stage.clientWidth;
    stageH = canvas.clientHeight || stage.clientHeight;
    canvas.width = Math.round(stageW * dpr);
    canvas.height = Math.round(stageH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawnIndex = -1;                       // force redraw
    drawnFrame = null;
    draw(Math.round(currentPos));
  }


  // Keep the full frame visible on smaller screens and cover the desktop viewport.
  function draw(index) {
    let img = frames[index];
    if (!img) {                            // never show blank: fall back to nearest loaded frame
      for (let d = 1; d < FRAME_COUNT && !img; d++) {
        img = frames[index - d] || frames[index + d];
      }
    }
    if (!img || stageW === 0) return;
    if (img === drawnFrame) return;
    drawnFrame = img;
    drawnIndex = index;

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = window.matchMedia("(max-width: 1023px)").matches
      ? Math.min(stageW / iw, stageH / ih)
      : Math.max(stageW / iw, stageH / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (stageW - dw) / 2;
    const dy = (stageH - dh) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, stageW, stageH);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  let drawnFrame = null;

  function onFrameLoaded(i, img) {
    frames[i] = img;
    settledCount++;
    updateFrameLoading();
    // If this is the frame the user is currently looking at, show it immediately
    if (i === Math.round(currentPos) || settledCount === 1) {
      draw(Math.round(currentPos));
    }
  }

  function onFrameFailed(i, error) {
    settledCount++;
    console.error(`Unable to load hero frame ${framePath(i)}.`, error);
    updateFrameLoading();
  }

  function updateFrameLoading() {
    loaderFill.style.width = Math.round((settledCount / FRAME_COUNT) * 100) + "%";
    if (settledCount === FRAME_COUNT) {
      loader.classList.add("is-done");
      startMobilePlayback();
    }
  }

  function startMobilePlayback() {
    if (!mobileViewport.matches || settledCount !== FRAME_COUNT || mobilePlaybackComplete) return;
    if (reduceMotion) {
      currentPos = FRAME_COUNT - 1;
      mobilePlaybackComplete = true;
      draw(FRAME_COUNT - 1);
      return;
    }
    if (mobilePlaybackStartedAt === null) {
      mobilePlaybackStartedAt = performance.now();
      scheduleAnimation();
    }
  }

  // Load first frame immediately, then the rest with limited concurrency
  function preloadFrames() {
    const queue = [];
    for (let i = 0; i < FRAME_COUNT; i++) queue.push(i);

    const first = queue.shift();
    loadImage(first)
      .then((img) => onFrameLoaded(first, img))
      .catch((error) => onFrameFailed(first, error));

    const CONCURRENCY = 6;
    let active = 0;
    const next = () => {
      while (active < CONCURRENCY && queue.length) {
        const i = queue.shift();
        active++;
        loadImage(i)
          .then((img) => onFrameLoaded(i, img))
          .catch((error) => onFrameFailed(i, error))
          .finally(() => { active--; next(); });
      }
    };
    next();
  }

  function loadImage(i) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = framePath(i);
    });
  }

  // Map desktop scroll position through the tall hero to a 0..1 progress value.
  function heroProgress() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(Math.max(-rect.top / total, 0), 1);
  }

  function animate(timestamp) {
    animationFrameId = null;
    if (mobileViewport.matches) {
      if (reduceMotion) {
        currentPos = FRAME_COUNT - 1;
        mobilePlaybackComplete = true;
        draw(FRAME_COUNT - 1);
        return;
      }
      if (mobilePlaybackStartedAt === null) return;

      const progress = Math.min((timestamp - mobilePlaybackStartedAt) / MOBILE_PLAYBACK_DURATION, 1);
      currentPos = progress * (FRAME_COUNT - 1);
      const idx = Math.round(currentPos);
      if (idx !== drawnIndex) draw(idx);
      if (progress === 1) {
        currentPos = FRAME_COUNT - 1;
        draw(FRAME_COUNT - 1);
        mobilePlaybackComplete = true;
        return;
      }
    } else {
      targetIndex = heroProgress() * (FRAME_COUNT - 1);
      // Ease toward the target for a smooth, buttery feel (instant with reduced motion)
      currentPos = reduceMotion ? targetIndex : currentPos + (targetIndex - currentPos) * 0.18;
      const idx = Math.round(currentPos);
      if (idx !== drawnIndex) draw(idx);
    }
    scheduleAnimation();
  }

  if (canvas && ctx) {
    resizeCanvas();
    const onViewportChange = () => {
      resizeCanvas();
      if (mobileViewport.matches) startMobilePlayback();
      else scheduleAnimation();
    };
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    preloadFrames();
    if (!mobileViewport.matches) scheduleAnimation();
  }
  if (heroContent) {
    const updateHeroContent = () => {
      heroContent.classList.toggle("is-scrolled", window.scrollY > 0);
    };
    window.addEventListener("scroll", updateHeroContent, { passive: true });
    updateHeroContent();
  }

  /* ------------------------------------------------------------------
     2. HEADER + MOBILE NAV
     ------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  // The navbar stays fully transparent while the hero plays over it.
  // It only gets a solid background once the hero has scrolled away.
  function onScrollHeader() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    header.classList.toggle("is-solid", heroBottom <= header.offsetHeight);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  function setNav(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    primaryNav.classList.toggle("is-open", open);
  }
  navToggle.addEventListener("click", () => {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });
  primaryNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setNav(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });

  /* ------------------------------------------------------------------
     3. CASE STUDIES: data-driven accessible detail dialog
     ------------------------------------------------------------------ */
  const CASE_STUDIES = {
    "smile-restoration": {
      title: "Smile Restoration",
      category: "Cosmetic Dentistry",
      image: "images/case-01.jpg",
      imageAlt: "Illustrative image of a dental consultation",
      introduction: "An illustrative scenario describing how a cosmetic consultation may explore concerns about tooth appearance and smile aesthetics.",
      details: [
        ["Patient Concern", "Uneven tooth appearance and concerns about smile aesthetics."],
        ["Assessment", "An individualized cosmetic assessment would discuss the person's goals, dental history, and oral health before considering suitable options."],
        ["Treatment Approach", "A clinician may propose a personalized smile-restoration plan after assessment. The approach and any procedures would depend on the individual's needs and preferences."],
        ["Expected Outcome", "Possible outcomes and limitations would be discussed during consultation. No specific result is guaranteed."],
        ["Aftercare", "Aftercare guidance would be tailored to the care provided and the individual's oral-health needs."]
      ]
    },
    "restoring-tooth-function": {
      title: "Restoring Tooth Function",
      category: "Restorative Dentistry",
      image: "images/case-02.jpg",
      imageAlt: "Illustrative image of a dental examination",
      introduction: "An illustrative scenario about assessment and planning when damaged teeth make chewing difficult.",
      details: [
        ["Patient Concern", "Difficulty chewing due to damaged teeth."],
        ["Assessment", "A dental assessment would review symptoms, examine the teeth and surrounding tissues, and determine whether further diagnostic steps are appropriate."],
        ["Treatment Approach", "Following assessment, a suitable restorative treatment plan would be discussed based on clinical findings, available options, and patient preferences."],
        ["Recovery Considerations", "Recovery expectations vary with the type of care provided. The clinician would explain expected sensitivity, eating guidance, and when to seek follow-up."],
        ["Aftercare", "Personalized oral-hygiene instructions and any recommended review appointments would be provided by the treating clinician."]
      ]
    },
    "gum-health-improvement": {
      title: "Gum Health Improvement",
      category: "Preventive and Periodontal Care",
      image: "images/case-03.jpg",
      imageAlt: "Illustrative image related to dental care",
      introduction: "An illustrative scenario showing how gum discomfort and bleeding during brushing may be discussed and assessed.",
      details: [
        ["Patient Concern", "Gum discomfort and bleeding during brushing."],
        ["Assessment", "A professional examination would review gum health, symptoms, and oral-hygiene routines to guide appropriate care."],
        ["Treatment Approach", "Periodontal care would be selected according to examination findings, alongside personalized oral-hygiene guidance."],
        ["Maintenance Plan", "A maintenance plan may include practical daily-care guidance and professional cleaning or review intervals recommended for the individual."],
        ["Follow-up", "Follow-up would be arranged as clinically appropriate to review gum health and adapt the care plan if needed."]
      ]
    }
  };
  const caseDialog = document.getElementById("caseStudyDialog");
  const caseDialogTitle = document.getElementById("caseDialogTitle");
  const caseDialogCategory = document.getElementById("caseDialogCategory");
  const caseDialogImage = document.getElementById("caseDialogImage");
  const caseDialogIntro = document.getElementById("caseDialogIntro");
  const caseDialogDetails = document.getElementById("caseDialogDetails");
  let caseDialogOpener = null;

  function closeCaseDialog() {
    if (caseDialog.open) caseDialog.close();
  }

  document.querySelectorAll("[data-case-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const study = CASE_STUDIES[button.dataset.caseId];
      if (!study) {
        throw new Error(`Unknown case study: ${button.dataset.caseId}`);
      }

      caseDialogOpener = button;
      caseDialogTitle.textContent = study.title;
      caseDialogCategory.textContent = study.category;
      caseDialogImage.src = study.image;
      caseDialogImage.alt = study.imageAlt;
      caseDialogIntro.textContent = study.introduction;
      caseDialogDetails.replaceChildren();

      study.details.forEach(([heading, text]) => {
        const section = document.createElement("section");
        const title = document.createElement("h3");
        const description = document.createElement("p");
        title.textContent = heading;
        description.textContent = text;
        section.append(title, description);
        caseDialogDetails.appendChild(section);
      });

      caseDialog.showModal();
    });
  });

  caseDialog.querySelectorAll(".case-dialog-close, .case-dialog-back").forEach((button) => {
    button.addEventListener("click", closeCaseDialog);
  });
  caseDialog.addEventListener("click", (event) => {
    if (event.target === caseDialog) closeCaseDialog();
  });
  caseDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCaseDialog();
  });
  caseDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCaseDialog();
    }
  });
  caseDialog.addEventListener("close", () => {
    if (caseDialogOpener && caseDialogOpener.isConnected) caseDialogOpener.focus();
  });

  /* ------------------------------------------------------------------
     4. TESTIMONIALS: display approved data or clearly marked samples
     ------------------------------------------------------------------ */
  const TESTIMONIALS = window.CLINIC_TESTIMONIALS;
  const track = document.getElementById("sliderTrack");
  const testimonialGroup = document.createElement("div");
  testimonialGroup.className = "testimonial-group";

  if (!Array.isArray(TESTIMONIALS) || !TESTIMONIALS.length) {
    throw new Error("Testimonials data is missing from testimonials.js.");
  }

  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement("article");
    card.className = "testimonial";
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", `Testimonial ${i + 1}`);

    if (t.placeholder) {
      const badge = document.createElement("span");
      badge.className = "placeholder-badge";
      badge.textContent = "Placeholder · Not a patient review";
      card.appendChild(badge);
    }

    const header = document.createElement("header");
    header.className = "testimonial-header";
    const cite = document.createElement("cite");
    cite.textContent = t.displayName;
    header.appendChild(cite);
    if (t.placeholder) {
      const status = document.createElement("span");
      status.className = "testimonial-status";
      status.textContent = "Sample feedback";
      header.appendChild(status);
    }
    card.appendChild(header);

    const feedback = document.createElement(t.placeholder ? "p" : "blockquote");
    feedback.className = t.placeholder ? "testimonial-placeholder-message" : "";
    feedback.textContent = t.quote;
    card.appendChild(feedback);

    if (Number.isInteger(t.rating) && t.rating >= 1 && t.rating <= 5) {
      const rating = document.createElement("div");
      rating.className = "testimonial-stars";
      rating.setAttribute("aria-label", `${t.rating} out of 5 stars`);
      rating.textContent = "\u2605".repeat(t.rating);
      card.appendChild(rating);
    }
    testimonialGroup.appendChild(card);
  });

  track.appendChild(testimonialGroup);

  /* ------------------------------------------------------------------
     4. CLINIC DETAILS FROM CONFIG
     ------------------------------------------------------------------ */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    el.textContent = value;
    el.classList.remove("placeholder-text");
  }
  setText("addressText", cfg.address);
  setText("phoneText", cfg.phone);
  setText("emailText", cfg.email);
  setText("hoursText", cfg.hours);
  setText("footerPhone", cfg.phone);
  setText("footerEmail", cfg.email);

  const directions = document.getElementById("directionsBtn");
  if (cfg.mapsUrl) {
    directions.href = cfg.mapsUrl;
    directions.target = "_blank";
    directions.rel = "noopener";
    directions.removeAttribute("aria-disabled");
  } else {
    directions.setAttribute("title", "Available once the clinic's location is added");
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();

/* ==========================================================================
   7. ABOUT IMAGE
   Hides the photo box if the file is missing, and fades the photo in once
   it scrolls into view. Skipped for reduced motion.
   ========================================================================== */
(function () {
  const figure = document.querySelector(".about-figure");
  if (!figure) return;
  const img = figure.querySelector(".about-img");

  const markMissing = () => figure.classList.add("img-missing");
  img.addEventListener("error", markMissing);
  if (img.complete && img.naturalWidth === 0) markMissing();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  figure.classList.add("reveal-ready");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  io.observe(figure);
})();

/* ==========================================================================
   7. CONTACT LINKS: WhatsApp, call, directions and map
   All values come from config.js (no numbers or addresses are invented here).
   Links stay disabled until the value is filled in.
   ========================================================================== */
(function () {
  const cfg = window.CLINIC_CONFIG || {};
  const waDigits = (cfg.whatsappNumber || "").replace(/\D/g, "");
  const telNumber = (cfg.phone || "").replace(/[^\d+]/g, "");
  const address = (cfg.address || "").trim();

  function disable(el, reason) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("href", "#");
    el.title = reason;
  }
  function enable(el, href, newTab) {
    el.href = href;
    el.removeAttribute("aria-disabled");
    el.title = el.getAttribute("aria-label") || "";
    if (newTab) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
  }

  // Stop clicks on disabled links from jumping to the top of the page
  document.querySelectorAll('[aria-disabled="true"]').forEach((el) =>
    el.addEventListener("click", (e) => e.preventDefault())
  );

  // WhatsApp: navbar icons (desktop + mobile) and the WhatsApp button
  document.querySelectorAll("[data-wa-link]").forEach((el) => {
    if (waDigits) {
      const msg = el.dataset.waMessage || "Hello, I would like to enquire about a dental consultation.";
      enable(el, `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`, true);
    } else {
      disable(el, "WhatsApp number not added yet (config.js: whatsappNumber)");
    }
  });

  // Call: opens the phone dialer on phones
  document.querySelectorAll("[data-tel-link]").forEach((el) => {
    if (telNumber) enable(el, `tel:${telNumber}`, false);
    else disable(el, "Phone number not added yet (config.js: phone)");
  });

  // Get Directions: use the saved Maps link, or build one from the address
  const dir = document.getElementById("directionsBtn");
  if (dir && !cfg.mapsUrl && address) {
    enable(dir, `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, true);
  }

  // Map: embedded only when an address is configured (loads lazily)
  const frame = document.getElementById("mapFrame");
  const note = document.getElementById("mapNote");
  if (frame && address) {
    const iframe = document.createElement("iframe");
    iframe.title = "Map showing the location of Ajitha Dental Clinic";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  }
})();

/* ==========================================================================
   8. SCROLL REVEAL: cards fade up as they enter the view, with staggered timing.
   Without JavaScript, or with reduced motion, everything is shown immediately.
   ========================================================================== */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    ".service-card, .case-card, .gallery-item, .why-item, .book-main, .about .split-content, .about-feature"
  );
  if (!targets.length) return;

  // Stagger siblings so a row of cards does not animate identically
  const counts = new Map();
  targets.forEach((el) => {
    const key = el.parentElement;
    const i = counts.get(key) || 0;
    counts.set(key, i + 1);
    el.style.setProperty("--d", Math.min(i, 4) * 120 + "ms");
    el.classList.add("reveal");
  });
  document.documentElement.classList.add("js");

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  targets.forEach((el) => io.observe(el));
})();
