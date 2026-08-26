document.addEventListener("DOMContentLoaded", () => {
  // --- 0. Fixed Navbar Scroll & Active Link Handler ---
  const navDock = document.querySelector(".nav-dock");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  if (navDock) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navDock.classList.add("scrolled");
      } else {
        navDock.classList.remove("scrolled");
      }

      // Scroll Spy for Active Link Highlight
      let currentSec = "";
      sections.forEach((sec) => {
        const secTop = sec.offsetTop - 120;
        const secHeight = sec.offsetHeight;
        if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
          currentSec = sec.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        if ((currentSec && href === `#${currentSec}`) || (!currentSec && href === "#")) {
          link.classList.add("active");
        }
      });
    }, { passive: true });
  }

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

  // --- 5. Interactive Liquid Burn Reveal Effect ---
  const host = document.getElementById("liquid-burn-container");
  const canvas = document.getElementById("liquid-burn-canvas");

  if (host && canvas && typeof THREE !== "undefined") {
    const FOV = 45;
    const CAM_Z = 2;
    const PLANE_H = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
    const OVERSCAN = 1.08;
    const TILT = 0.1;
    const REF_RATE = 3.1;
    const REF_BURN_VEL = 0.8;
    const MOUSE_RATE = 9;
    const RAGGED_CAP = 0.3;

    const IDLE = 0;
    const BURNING = 1;
    const BURNED = 2;
    const UNBURNING = 3;

    const VERTEX_SRC = `
uniform vec2 uResolution;
uniform vec2 uSize1;
uniform vec2 uSize2;
uniform vec2 uMouse;
uniform float uTilt;

varying vec2 vUv;
varying vec2 vUv1;
varying vec2 vUv2;

vec2 coverUv(vec2 p, vec2 res, vec2 img) {
    float ra = res.x / max(res.y, 1.0);
    float ia = img.x / max(img.y, 1.0);
    vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
    return (p - 0.5) * s + 0.5;
}

void main() {
    vUv = uv;
    vUv1 = coverUv(uv, uResolution, uSize1);
    vUv2 = coverUv(uv, uResolution, uSize2);

    vec3 pos = position;
    vec2 m = uMouse * 2.0 - 1.0;
    vec2 c = uv - 0.5;
    pos.z += (c.x * m.x + c.y * m.y) * uTilt;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

    const FRAGMENT_SRC = `
precision highp float;

#define OVERSCAN 1.0800
#define RAGGED_CAP 0.3000

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uCenter;
uniform float uFront;
uniform float uRevealRadius;
uniform float uTime;
uniform vec2 uResolution;
uniform float uDistortionStrength;
uniform float uEmberWidth;
uniform vec3 uEmberColor;

varying vec2 vUv;
varying vec2 vUv1;
varying vec2 vUv2;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 4; i++) {
        s += a * snoise(p);
        p *= 2.02;
        a *= 0.5;
    }
    return s;
}

void main() {
    vec2 cu = (vUv - 0.5) * OVERSCAN + 0.5;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(cu.x * aspect, cu.y);
    vec2 c = vec2(uCenter.x * aspect, uCenter.y);

    float dist = clamp(uDistortionStrength, 0.0, 1.0);
    float R = max(uRevealRadius, 0.01);
    float aa = clamp(2.0 / max(uResolution.y, 1.0), 0.0005, 0.05);
    float open = clamp(uFront / R, 0.0, 1.0);
    float d = distance(p, c);

    float n = clamp(fbm(p * 3.0 + vec2(0.0, uTime * 0.05)) * 0.5 + 0.5, 0.0, 1.0);
    float ragged = d + (n * 2.0 - 1.0) * 0.35 * min(R, RAGGED_CAP) * open;
    float w = R * max(uEmberWidth * open, 0.004);
    float burn = ragged - uFront;

    float shimmer = (1.0 - smoothstep(0.0, w * 3.0, abs(burn))) * dist * 0.05;
    vec2 q = vec2(snoise(p * 6.0 + uTime * 0.6),
                  snoise(p * 6.0 + 31.7 - uTime * 0.5)) * shimmer;

    vec3 c1 = texture2D(uTexture1, vUv1 + q).rgb;
    vec3 c2 = texture2D(uTexture2, vUv2).rgb;

    float charAmt = 1.0 - smoothstep(0.0, w * 2.0, burn);
    c1 = mix(c1, c1 * vec3(0.12, 0.09, 0.08), charAmt * 0.9);

    float reveal = 1.0 - smoothstep(-aa, aa, burn);
    vec3 col = mix(c1, c2, reveal);

    float ember = clamp(smoothstep(w, 0.0, burn)
                      * smoothstep(-4.0 * aa, aa, burn), 0.0, 1.0);
    vec3 hot = mix(uEmberColor, vec3(1.0, 0.92, 0.62), pow(ember, 5.0));
    col = mix(col, hot, ember);
    col += uEmberColor * pow(ember, 2.0) * 0.7;

    gl_FragColor = vec4(col, 1.0);
}
`;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.warn("WebGL renderer init failed:", err);
    }

    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.z = CAM_Z;

      const placeholder = new THREE.DataTexture(new Uint8Array([17, 17, 17, 255]), 1, 1, THREE.RGBAFormat);
      placeholder.needsUpdate = true;

      const uniforms = {
        uTexture1: { value: placeholder },
        uTexture2: { value: placeholder },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uFront: { value: -1 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uDistortionStrength: { value: 0.25 },
        uEmberWidth: { value: 0.08 },
        uRevealRadius: { value: 0.25 },
        uEmberColor: { value: new THREE.Vector3(1, 0.27, 0) },
        uSize1: { value: new THREE.Vector2(1, 1) },
        uSize2: { value: new THREE.Vector2(1, 1) },
        uTilt: { value: TILT },
      };

      const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SRC,
        fragmentShader: FRAGMENT_SRC,
        uniforms,
        transparent: false,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let cw = 0;
      let ch = 0;
      const resize = () => {
        const w = host.clientWidth || 900;
        const h = host.clientHeight || 500;
        if (w === cw && h === ch) return;
        cw = w;
        ch = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mesh.scale.set(PLANE_H * camera.aspect * OVERSCAN, PLANE_H * OVERSCAN, 1);
        uniforms.uResolution.value.set(w, h);
      };
      resize();
      window.addEventListener("resize", resize, { passive: true });

      // Texture Loading
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      const loadTex = (url, slot, sizeKey) => {
        loader.load(url, (tex) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          uniforms[slot].value = tex;
          const img = tex.image;
          if (img) uniforms[sizeKey].value.set(img.width || 1, img.height || 1);
        });
      };

      loadTex("assets/images/roof_inspection_nm.png", "uTexture1", "uSize1");
      loadTex("assets/images/hero_roofing_nm.png", "uTexture2", "uSize2");

      let mode = IDLE;
      let front = -0.1;
      let mx = 0.5;
      let my = 0.5;
      let cx = 0.5;
      let cy = 0.5;
      let targetState = 0;

      const aaOf = () => Math.min(Math.max(2 / (ch || 500), 0.0005), 0.05);
      const closedOf = (R) => -(aaOf() + 0.014 * R);
      const fullOf = (R) => {
        const A = (cw || 900) / (ch || 500);
        const ov = (OVERSCAN - 1) / 2;
        const x0 = -ov * A;
        const x1 = (1 + ov) * A;
        const y0 = -ov;
        const y1 = 1 + ov;
        const ox = cx * A;
        const oy = cy;
        const d = Math.max(
          Math.hypot(x0 - ox, y0 - oy),
          Math.hypot(x1 - ox, y0 - oy),
          Math.hypot(x0 - ox, y1 - oy),
          Math.hypot(x1 - ox, y1 - oy)
        );
        const amp = 0.35 * Math.min(R, RAGGED_CAP);
        const w = R * Math.max(0.08, 0.004);
        return d + amp + 2 * w + 4 * aaOf();
      };

      const updateMouse = (e) => {
        const r = host.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        mx = (e.clientX - r.left) / r.width;
        my = 1 - (e.clientY - r.top) / r.height;
      };

      host.addEventListener("pointerenter", () => { targetState = 1; });
      host.addEventListener("pointerleave", () => { targetState = 0; });
      host.addEventListener("pointermove", (e) => { updateMouse(e); }, { passive: true });
      host.addEventListener("pointerdown", (e) => {
        updateMouse(e);
        if (mode === IDLE) {
          cx = mx;
          cy = my;
          mode = BURNING;
        } else if (mode === BURNING || mode === BURNED) {
          mode = UNBURNING;
        } else {
          mode = BURNING;
        }
      });

      let prevTime = performance.now();
      let elapsed = 0;

      const animate = (now) => {
        requestAnimationFrame(animate);
        const dt = Math.min((now - prevTime) / 1000, 0.05);
        prevTime = now;
        elapsed += dt;

        const R = Math.max(0.25, 0.01);
        const speed = 1.0;

        const km = 1 - Math.exp(-MOUSE_RATE * dt);

        if (mode === IDLE) {
          cx = mx;
          cy = my;
          const closed = closedOf(R);
          const tgt = targetState > 0.5 ? R : closed;
          const rate = speed * REF_RATE;
          const k = rate > 0 ? 1 - Math.exp(-rate * dt) : 0;
          front += (tgt - front) * k;
        } else {
          const vel = speed * REF_BURN_VEL;
          if (mode === BURNING) {
            const full = fullOf(R);
            front = Math.min(front + vel * dt, full);
            if (front >= full) mode = BURNED;
          } else if (mode === BURNED) {
            front = fullOf(R);
          } else {
            cx += (mx - cx) * km;
            cy += (my - cy) * km;
            const floor = targetState > 0.5 ? R : closedOf(R);
            if (front > floor) front = Math.max(front - vel * dt, floor);
            if (front <= floor) mode = IDLE;
          }
        }

        uniforms.uTime.value = elapsed;
        uniforms.uFront.value = front;
        uniforms.uCenter.value.set(cx, cy);
        uniforms.uMouse.value.set(mx, my);

        renderer.render(scene, camera);
      };
      requestAnimationFrame(animate);
    }
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

  // --- 8. Coverage Territory Location Slider ---
  const covTrack = document.getElementById("cov-slider-track");
  const covPrevBtn = document.getElementById("cov-slide-prev");
  const covNextBtn = document.getElementById("cov-slide-next");

  if (covTrack) {
    if (covPrevBtn) {
      covPrevBtn.addEventListener("click", () => {
        covTrack.scrollBy({ left: -280, behavior: "smooth" });
      });
    }
    if (covNextBtn) {
      covNextBtn.addEventListener("click", () => {
        covTrack.scrollBy({ left: 280, behavior: "smooth" });
      });
    }

    // Auto-scroll ticker loop (pauses on mouseenter/touchstart)
    let autoScrollTimer = setInterval(() => {
      if (covTrack.scrollLeft + covTrack.clientWidth >= covTrack.scrollWidth - 10) {
        covTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        covTrack.scrollBy({ left: 260, behavior: "smooth" });
      }
    }, 3200);

    covTrack.addEventListener("mouseenter", () => clearInterval(autoScrollTimer));
    covTrack.addEventListener("touchstart", () => clearInterval(autoScrollTimer), { passive: true });
  }

  // --- 9. Coverflow Carousel (Our Capabilities) ---
  const cfStage = document.getElementById("coverflow-stage");
  const cfPrevBtn = document.getElementById("coverflow-prev");
  const cfNextBtn = document.getElementById("coverflow-next");
  const cfCards = Array.from(document.querySelectorAll(".coverflow-card"));

  if (cfStage && cfCards.length > 0) {
    const count = cfCards.length;
    let targetPos = 0;
    let currentPos = 0;
    let animFrame = null;

    const relOf = (index, pos, count) => {
      let rel = (((index - pos) % count) + count) % count;
      if (rel > count / 2) rel -= count;
      return rel;
    };

    const blendForRel = (rel) => Math.min(Math.abs(rel), 1);

    const render = () => {
      const isMobile = window.innerWidth < 768;
      const activeW = isMobile ? 270 : 374;
      const activeH = isMobile ? 360 : 466;
      const restW = isMobile ? 110 : 159;
      const restH = isMobile ? 200 : 247;
      const gap = isMobile ? 12 : 26;

      const c1 = activeW / 2 + gap + restW / 2;
      const pitch = restW + gap;

      cfCards.forEach((card, i) => {
        const rel = relOf(i, currentPos, count);
        const absRel = Math.abs(rel);

        let x = 0;
        if (absRel <= 1) {
          x = absRel * c1;
        } else {
          x = c1 + (absRel - 1) * pitch;
        }
        if (rel < 0) x = -x;

        const blend = blendForRel(rel);
        const w = activeW + (restW - activeW) * blend;
        const h = activeH + (restH - activeH) * blend;
        const zIndex = Math.round(1000 - absRel * 100);

        let opacity = 1;
        if (absRel > 2.5) {
          opacity = 0;
        } else if (absRel > 1.5) {
          opacity = 0.3;
        } else if (absRel > 0.5) {
          opacity = 0.7;
        }

        card.style.transform = `translate(calc(-50% + ${x}px), -50%)`;
        card.style.width = `${w}px`;
        card.style.height = `${h}px`;
        card.style.zIndex = zIndex;
        card.style.opacity = opacity;

        if (absRel < 0.5) {
          card.classList.add("active");
          card.style.pointerEvents = "auto";
        } else {
          card.classList.remove("active");
          card.style.pointerEvents = "auto";
        }
      });
    };

    const updateLoop = () => {
      const diff = targetPos - currentPos;
      if (Math.abs(diff) < 0.002) {
        currentPos = targetPos;
        render();
        animFrame = null;
        return;
      }

      currentPos += diff * 0.16;
      render();
      animFrame = requestAnimationFrame(updateLoop);
    };

    const goToIndex = (newTarget) => {
      targetPos = newTarget;
      if (!animFrame) {
        animFrame = requestAnimationFrame(updateLoop);
      }
    };

    if (cfPrevBtn) {
      cfPrevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToIndex(Math.round(targetPos) - 1);
      });
    }

    if (cfNextBtn) {
      cfNextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToIndex(Math.round(targetPos) + 1);
      });
    }

    cfCards.forEach((card, index) => {
      card.addEventListener("click", (e) => {
        if (wasDragged) return; // ignore click if user was dragging
        const roundTarget = Math.round(targetPos);
        let d = index - roundTarget;
        d = ((d % count) + count) % count;
        if (d > count / 2) d -= count;
        goToIndex(roundTarget + d);
      });
    });

    // Touch Swipe / Drag Interaction
    let isDragging = false;
    let wasDragged = false;
    let startX = 0;
    let dragPosStart = 0;

    const getX = (e) => (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX);

    const onPointerDown = (e) => {
      if (e.target.closest(".coverflow-arrow")) return;
      isDragging = true;
      wasDragged = false;
      startX = getX(e);
      dragPosStart = currentPos;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const x = getX(e);
      const deltaX = x - startX;
      if (Math.abs(deltaX) > 6) wasDragged = true;
      const stepWidth = window.innerWidth < 768 ? 140 : 220;
      targetPos = dragPosStart - deltaX / stepWidth;
      currentPos = targetPos;
      render();
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      targetPos = Math.round(targetPos);
      if (!animFrame) animFrame = requestAnimationFrame(updateLoop);
    };

    cfStage.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    cfStage.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Keyboard navigation when hovered
    let isHovered = false;
    cfStage.addEventListener("mouseenter", () => { isHovered = true; });
    cfStage.addEventListener("mouseleave", () => { isHovered = false; });
    window.addEventListener("keydown", (e) => {
      if (!isHovered) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToIndex(Math.round(targetPos) - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToIndex(Math.round(targetPos) + 1);
      }
    });

    window.addEventListener("resize", () => render(), { passive: true });

    // Initial render
    render();
  }
});
