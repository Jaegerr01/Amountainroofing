document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Light / Dark Theme Toggle ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const storedTheme = localStorage.getItem("amr_theme");

  if (storedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("amr_theme", isLight ? "light" : "dark");
    });
  }

  // --- 2. Mobile Navigation Drawer ---
  const mobileNavBtn = document.getElementById("mobile-nav-btn");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");

  const toggleMobileDrawer = (open) => {
    if (!mobileDrawer) return;
    if (open) {
      mobileDrawer.classList.add("open");
      document.body.style.overflow = "hidden";
    } else {
      mobileDrawer.classList.remove("open");
      document.body.style.overflow = "auto";
    }
  };

  if (mobileNavBtn) mobileNavBtn.addEventListener("click", () => toggleMobileDrawer(true));
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", () => toggleMobileDrawer(false));

  document.querySelectorAll(".drawer-link").forEach((link) => {
    link.addEventListener("click", () => toggleMobileDrawer(false));
  });

  // --- 3. Hero Typewriter Animation ---
  const typewriterText = document.getElementById("hero-typewriter-text");
  if (typewriterText) {
    const phrases = [
      "Spanish & Concrete Tile Roofs",
      "Architectural Shingle Replacement",
      "Commercial TPO & Flat Roofs",
      "24/7 Emergency Storm Leak Tarping",
      "Standing Seam Metal Roofing",
      "Insurance Claim Damage Documentation"
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const typeLoop = () => {
      const current = phrases[phraseIdx];
      if (isDeleting) {
        typewriterText.textContent = current.substring(0, charIdx - 1);
        charIdx--;
      } else {
        typewriterText.textContent = current.substring(0, charIdx + 1);
        charIdx++;
      }

      let speed = isDeleting ? 30 : 60;
      if (!isDeleting && charIdx === current.length) {
        speed = 2200; // Pause on full phrase
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        speed = 300;
      }

      setTimeout(typeLoop, speed);
    };
    typeLoop();
  }

  // --- 4. Instant Roof Cost Estimator Logic ---
  const sqftSlider = document.getElementById("sqft-range-slider");
  const sqftDisplay = document.getElementById("sqft-val-display");
  const estPriceDisplay = document.getElementById("est-price-display");
  const estSummaryText = document.getElementById("est-summary-text");
  const matCards = document.querySelectorAll(".mat-card");
  const typePills = document.querySelectorAll(".type-pill");
  const lockInBtn = document.getElementById("lock-in-estimate-btn");

  let currentMatName = "Architectural Shingle";
  let rateMin = 4.50;
  let rateMax = 6.50;
  let currentMult = 1.0;
  let currentScopeLabel = "Full Tear-off & Replacement";

  const calculateEstimate = () => {
    if (!sqftSlider || !sqftDisplay || !estPriceDisplay) return;

    const sqft = parseInt(sqftSlider.value, 10);
    sqftDisplay.textContent = `${sqft.toLocaleString()} SQ FT`;

    const totalMin = Math.round(sqft * rateMin * currentMult);
    const totalMax = Math.round(sqft * rateMax * currentMult);

    estPriceDisplay.textContent = `$${totalMin.toLocaleString()} - $${totalMax.toLocaleString()}`;

    if (estSummaryText) {
      estSummaryText.textContent = `Based on ${sqft.toLocaleString()} sq ft ${currentMatName}, ${currentScopeLabel} in Las Cruces, NM.`;
    }
  };

  matCards.forEach((card) => {
    card.addEventListener("click", () => {
      matCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      currentMatName = card.getAttribute("data-name");
      rateMin = parseFloat(card.getAttribute("data-rate-min"));
      rateMax = parseFloat(card.getAttribute("data-rate-max"));
      calculateEstimate();
    });
  });

  typePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      typePills.forEach((p) => p.classList.remove("selected"));
      pill.classList.add("selected");
      currentMult = parseFloat(pill.getAttribute("data-mult"));
      currentScopeLabel = pill.getAttribute("data-label");
      calculateEstimate();
    });
  });

  if (sqftSlider) {
    sqftSlider.addEventListener("input", calculateEstimate);
    calculateEstimate();
  }

  // --- 5. Interactive Before / After Image Touch Slider ---
  const baWrapper = document.getElementById("ba-slider");
  const baOverlay = document.getElementById("ba-overlay");
  const baHandle = document.getElementById("ba-handle");

  if (baWrapper && baOverlay && baHandle) {
    let isDragging = false;

    const updateSliderPos = (clientX) => {
      const rect = baWrapper.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      const pct = (x / rect.width) * 100;
      baOverlay.style.width = `${pct}%`;
      baHandle.style.left = `${pct}%`;
    };

    baWrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateSliderPos(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      updateSliderPos(e.clientX);
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    // Touch Support for Mobile
    baWrapper.addEventListener("touchstart", (e) => {
      isDragging = true;
      if (e.touches[0]) updateSliderPos(e.touches[0].clientX);
    });

    window.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      if (e.touches[0]) updateSliderPos(e.touches[0].clientX);
    });

    window.addEventListener("touchend", () => { isDragging = false; });
  }

  // --- 6. Multi-Step 24/7 Intake Modal ---
  const modalOverlay = document.getElementById("intake-modal-overlay");
  const modalCloseX = document.getElementById("modal-close-x");
  const modalDoneBtn = document.getElementById("modal-done-btn");
  const stepBackBtn = document.getElementById("step-back-btn");

  const modalStep1 = document.getElementById("modal-step-1");
  const modalStep2 = document.getElementById("modal-step-2");
  const modalStep3 = document.getElementById("modal-step-3");
  const urgencyTagDisplay = document.getElementById("urgency-tag-display");
  const intakeForm = document.getElementById("intake-form");

  let selectedUrgency = "EMERGENCY";

  const openModal = (urgency = "ESTIMATE") => {
    selectedUrgency = urgency;
    applyUrgencyBadge(selectedUrgency);
    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "auto";
  };

  const goToModalStep = (stepNum) => {
    modalStep1.classList.remove("active");
    modalStep2.classList.remove("active");
    modalStep3.classList.remove("active");

    if (stepNum === 1) modalStep1.classList.add("active");
    if (stepNum === 2) modalStep2.classList.add("active");
    if (stepNum === 3) modalStep3.classList.add("active");
  };

  const applyUrgencyBadge = (urgency) => {
    if (!urgencyTagDisplay) return;
    if (urgency === "EMERGENCY") {
      urgencyTagDisplay.textContent = "⚡ PRIORITY: 24/7 EMERGENCY STORM LEAK DISPATCH";
      urgencyTagDisplay.style.color = "var(--primary)";
    } else if (urgency === "INSURANCE") {
      urgencyTagDisplay.textContent = "📋 PRIORITY: STORM CLAIM PHOTO DOCUMENTATION";
      urgencyTagDisplay.style.color = "var(--accent-cyan)";
    } else {
      urgencyTagDisplay.textContent = "🏠 PRIORITY: ROOF INSPECTION & ESTIMATE";
      urgencyTagDisplay.style.color = "var(--accent-gold)";
    }
  };

  document.querySelectorAll(".open-intake-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const urgency = btn.getAttribute("data-urgency") || "ESTIMATE";
      openModal(urgency);
      goToModalStep(2);
    });
  });

  document.querySelectorAll(".triage-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedUrgency = btn.getAttribute("data-urgency");
      applyUrgencyBadge(selectedUrgency);
      goToModalStep(2);
    });
  });

  if (modalCloseX) modalCloseX.addEventListener("click", closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener("click", closeModal);
  if (stepBackBtn) stepBackBtn.addEventListener("click", () => goToModalStep(1));

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("open")) {
      closeModal();
    }
  });

  // Pre-fill form when clicking "Lock In Estimate"
  if (lockInBtn) {
    lockInBtn.addEventListener("click", () => {
      const detailsBox = document.getElementById("issue-details");
      const sqft = sqftSlider ? sqftSlider.value : 2200;
      if (detailsBox) {
        detailsBox.value = `Estimated Roof Size: ${sqft} sq ft\nMaterial System: ${currentMatName}\nProject Scope: ${currentScopeLabel}`;
      }
      openModal("ESTIMATE");
      goToModalStep(2);
    });
  }

  // Phone auto-formatting: (575) 640-0794
  const phoneNumInput = document.getElementById("phone-num");
  if (phoneNumInput) {
    phoneNumInput.addEventListener("input", (e) => {
      let cleaned = e.target.value.replace(/\D/g, "");
      if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
      let formatted = cleaned;
      if (cleaned.length > 6) {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
      } else if (cleaned.length > 3) {
        formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
      } else if (cleaned.length > 0) {
        formatted = `(${cleaned}`;
      }
      e.target.value = formatted;
    });
  }

  // Dropzone File Upload Preview
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const filePreviewList = document.getElementById("file-preview-list");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      if (!filePreviewList) return;
      filePreviewList.innerHTML = "";
      Array.from(e.target.files).forEach((file) => {
        const item = document.createElement("div");
        item.style.cssText = "background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary);";
        item.textContent = `📷 ${file.name}`;
        filePreviewList.appendChild(item);
      });
    });
  }

  // Form Submit Handler
  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("form-submit-btn");
      if (submitBtn) submitBtn.innerHTML = "<span>Submitting...</span>";

      setTimeout(() => {
        goToModalStep(3);
        if (submitBtn) submitBtn.innerHTML = "<span>Submit Request</span>";
      }, 600);
    });
  }

  // --- 7. Video Showcase Modal ---
  const openVideoBtn = document.getElementById("open-video-btn");
  const videoModalOverlay = document.getElementById("video-modal-overlay");
  const closeVideoModal = document.getElementById("close-video-modal");
  const videoPlayer = document.getElementById("process-video-player");

  if (openVideoBtn && videoModalOverlay) {
    openVideoBtn.addEventListener("click", () => {
      videoModalOverlay.classList.add("open");
      if (videoPlayer) videoPlayer.play();
    });
  }

  if (closeVideoModal && videoModalOverlay) {
    closeVideoModal.addEventListener("click", () => {
      videoModalOverlay.classList.remove("open");
      if (videoPlayer) videoPlayer.pause();
    });
  }
});
