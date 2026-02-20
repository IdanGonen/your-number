// ==========================================
// "Your Number" - Interactive Dating Website
// ==========================================

// EMAILJS_CONFIG is loaded from config.js

// App State
const state = {
  currentStep: "name", // 'name' | 'question' | 'form' | 'success'
  userName: "",
  escapeAttempts: 0,
  formData: {
    instagram: "",
    phone: "",
  },
};

// DOM Elements
const app = document.getElementById("app");

// ==========================================
// Initialization
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize EmailJS
  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }

  // Check for name in URL parameter (e.g., ?name=Sarah)
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get("name");

  if (nameFromUrl && nameFromUrl.trim().length >= 2) {
    state.userName = nameFromUrl.trim();
    state.currentStep = "question";
  }

  // Render initial step
  renderStep();
});

// ==========================================
// Render Functions
// ==========================================

function renderStep() {
  switch (state.currentStep) {
    case "name":
      renderNameStep();
      break;
    case "question":
      renderQuestionStep();
      break;
    case "form":
      renderFormStep();
      break;
    case "success":
      renderSuccessStep();
      break;
  }
}

function renderNameStep() {
  app.innerHTML = `
        <div class="card">
            <h1 class="heading">Hey there!</h1>
            <p class="subheading">Before we begin, I'd love to know your name...</p>

            <div class="input-group">
                <input
                    type="text"
                    id="nameInput"
                    class="input-field"
                    placeholder="What's your first name?"
                    autocomplete="off"
                    autofocus
                >
                <p id="nameError" class="error-text" style="display: none;"></p>
            </div>

            <button id="continueBtn" class="btn btn-primary">
                Continue
            </button>
        </div>
    `;

  // Event listeners
  const nameInput = document.getElementById("nameInput");
  const continueBtn = document.getElementById("continueBtn");
  const nameError = document.getElementById("nameError");

  continueBtn.addEventListener("click", () => validateAndContinue());
  nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") validateAndContinue();
  });

  nameInput.addEventListener("input", () => {
    nameInput.classList.remove("error");
    nameError.style.display = "none";
  });

  function validateAndContinue() {
    const name = nameInput.value.trim();

    if (name.length < 2) {
      nameInput.classList.add("error");
      nameError.textContent = "Please enter at least 2 characters";
      nameError.style.display = "block";
      return;
    }

    state.userName = name;
    state.currentStep = "question";
    renderStep();
  }
}

function renderQuestionStep() {
  app.innerHTML = `
        <div class="card">
            <button id="backBtn" class="btn-back">&larr; Back</button>
            <div class="question-container">
                <p class="message">
                    <span class="highlight">${escapeHtml(state.userName)}</span>, I think you're pretty cool.
                    Let's exchange contacts?
                </p>

                <div class="buttons-area" id="buttonsArea">
                    <div class="btn-yes-wrapper">
                        <button id="yesBtn" class="btn btn-yes">Yes</button>
                    </div>
                    <button id="noBtn" class="btn btn-no">No</button>
                </div>

                <p id="escapeHint" class="escape-hint">Come on, just say yes!</p>
            </div>
        </div>
    `;

  const backBtn = document.getElementById("backBtn");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const buttonsArea = document.getElementById("buttonsArea");
  const escapeHint = document.getElementById("escapeHint");

  // Position No button initially
  positionNoButton(noBtn, buttonsArea);

  // Back button click
  backBtn.addEventListener("click", () => {
    state.currentStep = "name";
    state.escapeAttempts = 0;
    renderStep();
  });

  // Yes button click
  yesBtn.addEventListener("click", () => {
    state.currentStep = "form";
    renderStep();
  });

  // No button escape logic
  setupNoButtonEscape(noBtn, yesBtn, buttonsArea, escapeHint);
}

function renderFormStep() {
  app.innerHTML = `
        <div class="card">
            <button id="backBtn" class="btn-back">&larr; Back</button>
            <div class="form-section">
                <h2 class="heading">Nice!</h2>
                <p class="subheading">How can I reach you, ${escapeHtml(state.userName)}?</p>

                <div class="input-group">
                    <label class="input-label" for="instagramInput">Instagram</label>
                    <input
                        type="text"
                        id="instagramInput"
                        class="input-field"
                        placeholder="@yourusername"
                        autocomplete="off"
                    >
                    <p class="input-hint">So I can slide into your DMs</p>
                </div>

                <div class="form-divider"><span>and / or</span></div>

                <div class="input-group">
                    <label class="input-label" for="phoneInput">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneInput"
                        class="input-field"
                        placeholder="Your phone number"
                        autocomplete="tel"
                    >
                    <p class="input-hint">For a quick text</p>
                </div>

                <p id="formError" class="error-text" style="display: none; text-align: center; margin-bottom: 16px;"></p>

                <button id="sendBtn" class="btn btn-primary" style="width: 100%;">
                    Send
                </button>
            </div>
        </div>
    `;

  const backBtn = document.getElementById("backBtn");
  const instagramInput = document.getElementById("instagramInput");
  const phoneInput = document.getElementById("phoneInput");
  const sendBtn = document.getElementById("sendBtn");
  const formError = document.getElementById("formError");

  // Back button click
  backBtn.addEventListener("click", () => {
    state.currentStep = "question";
    renderStep();
  });

  sendBtn.addEventListener("click", () => submitForm());

  [instagramInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      formError.style.display = "none";
      input.classList.remove("error");
    });
  });

  async function submitForm() {
    const instagram = formatInstagram(instagramInput.value);
    const phone = formatPhone(phoneInput.value);

    // Validation
    if (!instagram && !phone) {
      formError.textContent = "Give me something to work with here";
      formError.style.display = "block";
      return;
    }

    if (phone && !isValidPhone(phone)) {
      phoneInput.classList.add("error");
      formError.textContent = "Please enter a valid phone number (7-15 digits)";
      formError.style.display = "block";
      return;
    }

    // Update state
    state.formData.instagram = instagram;
    state.formData.phone = phone;

    // Send email
    sendBtn.classList.add("loading");
    sendBtn.textContent = "Sending";

    try {
      await sendEmail();
      state.currentStep = "success";
      renderStep();
    } catch (error) {
      console.error("Email send failed:", error);
      formError.textContent = "Something went wrong. Please try again!";
      formError.style.display = "block";
      sendBtn.classList.remove("loading");
      sendBtn.textContent = "Send";
    }
  }
}

function renderSuccessStep() {
  // Trigger confetti
  createConfetti();

  app.innerHTML = `
        <div class="card success-screen">
            <img
                src="assets/success.gif"
                alt="Celebration!"
                class="success-gif"
                onerror="this.src='assets/success.svg'; this.onerror=null;"
            >
            <h2 class="success-heading">Amazing!</h2>
            <p class="success-message">
                You'll be hearing from me. Stay tuned.
            </p>
        </div>
    `;
}

// ==========================================
// No Button Escape Logic
// ==========================================

function positionNoButton(btn, container) {
  const containerRect = container.getBoundingClientRect();
  const btnWidth = btn.offsetWidth;
  const btnHeight = btn.offsetHeight;

  // Position to the right of center initially
  const initialX = containerRect.width / 2 + 20;
  const initialY = (containerRect.height - btnHeight) / 2;

  btn.style.left = `${initialX}px`;
  btn.style.top = `${initialY}px`;
}

function setupNoButtonEscape(noBtn, yesBtn, container, hint) {
  let isEscaping = false;
  let swapCount = 0;

  // Very aggressive threshold
  const getEscapeThreshold = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 380) return 100;
    if (screenWidth <= 520) return 120;
    return 200;
  };

  // THE OL' SWITCHEROO - if they somehow tap No, swap with Yes!
  function doSwitcheroo() {
    swapCount++;

    // After 2 swaps, just give them the Yes result
    if (swapCount >= 2) {
      state.currentStep = "form";
      renderStep();
      return;
    }

    // Swap button texts and styles
    const noText = noBtn.textContent;
    const yesText = yesBtn.textContent;

    noBtn.textContent = yesText;
    noBtn.classList.remove("btn-no");
    noBtn.classList.add("btn-yes");

    yesBtn.textContent = noText;
    yesBtn.classList.remove("btn-yes");
    yesBtn.classList.add("btn-no");

    // Now clicking the "No" looking button (which is actually yesBtn) goes to form
    // And clicking the "Yes" looking button (which is actually noBtn) also goes to form!

    // Actually, let's be sneaky - make BOTH buttons go to Yes now
    setTimeout(() => {
      state.currentStep = "form";
      renderStep();
    }, 100);
  }

  // MOBILE: Direct touch on button = switcheroo
  noBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Try to escape first
      const touch = e.touches[0];
      if (!isEscaping) {
        escapeButton(touch.clientX, touch.clientY);
      }
    },
    { capture: true, passive: false },
  );

  // If touchend fires on button (they completed a tap), do switcheroo
  noBtn.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      doSwitcheroo();
    },
    { capture: true, passive: false },
  );

  // Block click - if it fires, do switcheroo
  noBtn.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      doSwitcheroo();
    },
    { capture: true },
  );

  // Block mousedown (desktop)
  noBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    escapeButton(e.clientX, e.clientY);
  });

  // Mouse movement handler (desktop)
  function handleMouseMove(e) {
    if (isEscaping) return;

    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    if (distance < getEscapeThreshold()) {
      escapeButton(e.clientX, e.clientY);
    }
  }

  // Touch handler for container - escape on any touch near button
  function handleTouchStart(e) {
    if (isEscaping) return;

    const touch = e.touches[0];
    const btnRect = noBtn.getBoundingClientRect();

    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const distance = Math.hypot(
      touch.clientX - btnCenterX,
      touch.clientY - btnCenterY,
    );

    if (distance < getEscapeThreshold() * 1.5) {
      e.preventDefault();
      escapeButton(touch.clientX, touch.clientY);
    }
  }

  // Touch move handler - continuous escape
  function handleTouchMove(e) {
    if (isEscaping) return;

    const touch = e.touches[0];
    const btnRect = noBtn.getBoundingClientRect();

    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const distance = Math.hypot(
      touch.clientX - btnCenterX,
      touch.clientY - btnCenterY,
    );

    if (distance < getEscapeThreshold() * 1.2) {
      e.preventDefault();
      escapeButton(touch.clientX, touch.clientY);
    }
  }

  function escapeButton(pointerX, pointerY) {
    isEscaping = true;
    state.escapeAttempts++;

    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const btnWidth = btnRect.width;
    const btnHeight = btnRect.height;

    const padding = 5;
    const maxX = containerRect.width - btnWidth - padding;
    const maxY = containerRect.height - btnHeight - padding;

    const currentX = btnRect.left - containerRect.left;
    const currentY = btnRect.top - containerRect.top;

    // All possible positions
    const positions = [
      { x: padding, y: padding },
      { x: maxX / 2, y: padding },
      { x: maxX, y: padding },
      { x: padding, y: maxY / 2 },
      { x: maxX, y: maxY / 2 },
      { x: padding, y: maxY },
      { x: maxX / 2, y: maxY },
      { x: maxX, y: maxY },
    ];

    // Filter out current position
    const validPositions = positions.filter((p) => {
      const dist = Math.hypot(p.x - currentX, p.y - currentY);
      return dist > 50;
    });

    // Find furthest from pointer
    let bestPosition = validPositions[0] || positions[0];
    let bestDistance = 0;

    for (const pos of validPositions) {
      const posCenterX = containerRect.left + pos.x + btnWidth / 2;
      const posCenterY = containerRect.top + pos.y + btnHeight / 2;
      const d = Math.hypot(pointerX - posCenterX, pointerY - posCenterY);
      if (d > bestDistance) {
        bestDistance = d;
        bestPosition = pos;
      }
    }

    const newX = bestPosition.x + (Math.random() - 0.5) * 20;
    const newY = bestPosition.y + (Math.random() - 0.5) * 20;

    noBtn.classList.add("escaping");
    noBtn.style.left = `${Math.max(padding, Math.min(maxX, newX))}px`;
    noBtn.style.top = `${Math.max(padding, Math.min(maxY, newY))}px`;

    if (state.escapeAttempts >= 2) {
      hint.classList.add("visible");
    }

    setTimeout(() => {
      noBtn.classList.remove("escaping");
      isEscaping = false;
    }, 100);
  }

  // Event listeners
  document.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  container.addEventListener("touchmove", handleTouchMove, { passive: false });

  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
  };
}

// ==========================================
// Form Helpers
// ==========================================

function formatInstagram(value) {
  let handle = value.trim();
  if (!handle) return "";

  // Remove any URL parts
  handle = handle.replace(/.*instagram\.com\//, "");
  handle = handle.replace(/\?.*$/, "");
  handle = handle.replace(/\/$/, "");

  // Ensure @ prefix
  if (!handle.startsWith("@")) {
    handle = "@" + handle;
  }

  // Remove spaces
  handle = handle.replace(/\s/g, "");

  return handle;
}

function formatPhone(value) {
  // Keep only digits and + at the start
  let phone = value.trim();
  const hasPlus = phone.startsWith("+");
  phone = phone.replace(/\D/g, "");
  if (hasPlus) phone = "+" + phone;
  return phone;
}

function isValidPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

// ==========================================
// EmailJS Integration
// ==========================================

async function sendEmail() {
  const templateParams = {
    name: state.userName,
    instagram: state.formData.instagram || "Not provided",
    phone: state.formData.phone || "Not provided",
    timestamp: new Date().toLocaleString(),
  };

  // If EmailJS is not configured, just simulate success
  if (!EMAILJS_CONFIG || !EMAILJS_CONFIG.publicKey) {
    console.log("EmailJS not configured. Form data:", templateParams);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  return emailjs.send(
    EMAILJS_CONFIG.serviceId,
    EMAILJS_CONFIG.templateId,
    templateParams,
  );
}

// ==========================================
// Confetti Animation
// ==========================================

function createConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  // Use consistent colors from theme
  const colors = ["#00b894", "#00cec9", "#0f3460", "#16213e"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + "s";
    confetti.style.animationDuration = 2 + Math.random() * 2 + "s";

    // Random shapes
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = "50%";
    } else {
      confetti.style.width = "8px";
      confetti.style.height = "14px";
    }

    container.appendChild(confetti);
  }

  // Remove after animation
  setTimeout(() => {
    container.remove();
  }, 5000);
}

// ==========================================
// Utility Functions
// ==========================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
