/* ═══════════════════════════════════════════════
   ROSAIREE — script.js
═══════════════════════════════════════════════ */
"use strict";

const PRICES = { rose: 100, sunflower: 200, tulip: 120, daisy: 120, plumeria: 80, lily: 250 };
const ACC_PRICES = { butterfly: 30, leaf: 10 };
const CHOC_PRICES = { kitkat: 50, dairymilksilk: 220, dairymilk: 100, kinderjoy: 100, snickers: 150 };
const CHOC_EMOJIS = { kitkat: "🍫 KitKat", dairymilksilk: "🍬 Dairy Milk Silk", dairymilk: "🍫 Dairy Milk", kinderjoy: "🥚 Kinder Joy", snickers: "🍪 Snickers" };
const WRAP_PRICE_PER_SHEET = 25;
const FLOWER_EMOJIS = { rose: "🌹", sunflower: "🌻", tulip: "🌷", daisy: "🌼", plumeria: "🌸", lily: "🌺" };

let snowSelected = null;
let selectedColors = [];
let selectedPayment = "cod";

/* ── Navbar scroll ── */
(function () {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
})();

/* ── Active nav link ── */
(function () {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    let cur = "";
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
    links.forEach(l => { l.classList.toggle("active", l.getAttribute("href") === "#" + cur); });
  }, { passive: true });
})();

/* ── Scroll reveal ── */
(function () {
  const sel = [".flower-card", ".bouquet-card", ".acc-info-card", ".gallery-item", ".section-header", ".stat-block", ".rosairee-accordion .accordion-item", ".color-note-banner"];
  sel.forEach(s => document.querySelectorAll(s).forEach(el => el.classList.add("reveal")));
  const io = new IntersectionObserver(e => {
    e.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
})();

/* ── Counters ── */
(function () {
  const io = new IntersectionObserver(e => {
    e.forEach(en => { if (en.isIntersecting) { animateCounter(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(el => io.observe(el));
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const step = target / (1400 / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(t); }
      el.textContent = Math.floor(current);
    }, 16);
  }
})();

/* ── Change qty ── */
function changeQty(key, delta) {
  const inp = document.getElementById("inp-" + key);
  if (!inp) return;
  const current = parseInt(inp.value || "0", 10);
  const totalFlowers = Object.keys(PRICES).reduce((sum, f) => {
    return sum + parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
  }, 0);
  if (delta > 0 && totalFlowers >= 100) {
    alert("🌸 Maximum 100 flowers total per bouquet.");
    return;
  }
  inp.value = Math.max(0, current + delta);
  updateTotal();
}

/* ── Quick add from flower card ── */
let _hasScrolled = false;
function quickAdd(flower, price) {
  const inp = document.getElementById("inp-" + flower);
  if (!inp) return;
  inp.value = parseInt(inp.value || "0", 10) + 1;
  updateTotal();
  const msg = document.getElementById("toastMsg");
  if (msg) msg.innerHTML = `<i class="bi bi-check-circle-fill me-2" style="color:#c9566a"></i> ${FLOWER_EMOJIS[flower]} 1 ${cap(flower)} added!`;
  const el = document.getElementById("addToast");
  if (el) bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
  if (!_hasScrolled) {
    _hasScrolled = true;
    setTimeout(() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    setTimeout(() => { _hasScrolled = false; }, 8000);
  }
}

/* ── Snow paper toggle ── */
function setSnow(val) {
  snowSelected = val;
  document.getElementById("snow-yes").classList.toggle("active", val === true);
  document.getElementById("snow-no").classList.toggle("active", val === false);
  const note = document.getElementById("snowPricingNote");
  if (note) note.style.display = val === true ? "block" : "none";
  updateTotal();
}

/* ── Color swatch selection ── */
function selectSwatch(btn, colorName) {
  btn.classList.toggle("selected");
  if (btn.classList.contains("selected")) {
    if (!selectedColors.includes(colorName)) selectedColors.push(colorName);
  } else {
    selectedColors = selectedColors.filter(c => c !== colorName);
  }
  renderColorTags();
  updateTotal();
}

function renderColorTags() {
  const div = document.getElementById("selectedColors");
  if (!div) return;
  if (selectedColors.length === 0) {
    div.innerHTML = `<span class="no-color-yet">No colors selected yet — tap swatches above or type below</span>`;
  } else {
    div.innerHTML = selectedColors.map(c => `<span class="color-tag" onclick="removeColor('${c}')">${c} ×</span>`).join("");
  }
}

function removeColor(name) {
  selectedColors = selectedColors.filter(c => c !== name);
  document.querySelectorAll(".swatch").forEach(s => { if (s.title === name) s.classList.remove("selected"); });
  renderColorTags();
  updateTotal();
}

/* ── Payment method selection ── */
function selectPayment(method) {
  selectedPayment = method;
  document.getElementById("pay-cod").classList.toggle("selected", method === "cod");
  document.getElementById("pay-online").classList.toggle("selected", method === "online");
  const uploadSection = document.getElementById("payment-upload-section");
  if (uploadSection) uploadSection.style.display = method === "online" ? "block" : "none";
}

function handlePaymentFile(input) {
  const preview = document.getElementById("payment-file-preview");
  const fileName = document.getElementById("payment-file-name");
  if (input.files && input.files[0]) {
    preview.style.display = "flex";
    fileName.textContent = input.files[0].name;
  }
}

function clearPaymentFile() {
  const inp = document.getElementById("inp-payment-ss");
  if (inp) inp.value = "";
  const preview = document.getElementById("payment-file-preview");
  if (preview) preview.style.display = "none";
  const fileName = document.getElementById("payment-file-name");
  if (fileName) fileName.textContent = "";
}

/* ── Update total ── */
function updateTotal() {
  const lines = [];
  let total = 0;

  Object.keys(PRICES).forEach(f => {
    const qty = parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
    if (qty > 0) {
      const sub = qty * PRICES[f];
      total += sub;
      lines.push({ label: `${FLOWER_EMOJIS[f]} ${cap(f)} × ${qty}`, value: sub });
    }
  });

  const totalFlowers = Object.keys(PRICES).reduce((sum, f) => {
    return sum + parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
  }, 0);

  const bf = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (bf > 0) { const s = bf * 30; total += s; lines.push({ label: `🦋 Butterfly Pins × ${bf}`, value: s }); }

  const lf = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (lf > 0) { const s = lf * 10; total += s; lines.push({ label: `🍃 Leaves × ${lf}`, value: s }); }

  const pol = parseInt(document.getElementById("inp-polaroid")?.value || "0", 10);
  if (pol > 0) { const s = pol * 30; total += s; lines.push({ label: `📸 Polaroid Photo × ${pol}`, value: s }); }

  const plu = parseInt(document.getElementById("inp-plushie")?.value || "0", 10);
  if (plu > 0) { const s = plu * 500; total += s; lines.push({ label: `🧸 Plushie × ${plu}`, value: s }); }

  if (snowSelected === true) {
    const snowCost = totalFlowers <= 7 ? 50 : 100;
    const snowLabel = totalFlowers <= 7 ? "Snow Paper (small bouquet)" : "Snow Paper (large bouquet)";
    total += snowCost;
    lines.push({ label: `❄️ ${snowLabel}`, value: snowCost });
  }

  Object.keys(CHOC_PRICES).forEach(c => {
    const qty = parseInt(document.getElementById("inp-" + c)?.value || "0", 10);
    if (qty > 0) {
      const sub = qty * CHOC_PRICES[c];
      total += sub;
      lines.push({ label: `${CHOC_EMOJIS[c]} × ${qty}`, value: sub });
    }
  });

  if (totalFlowers > 0) {
    let sheets, size;
    if (totalFlowers <= 3) { sheets = 1; size = "extra small bouquet"; }
    else if (totalFlowers <= 7) { sheets = 3; size = "small bouquet"; }
    else if (totalFlowers <= 12) { sheets = 4; size = "medium bouquet"; }
    else if (totalFlowers <= 18) { sheets = 6; size = "large bouquet"; }
    else if (totalFlowers <= 30) { sheets = 8; size = "extra large bouquet"; }
    else if (totalFlowers <= 50) { sheets = 10; size = "grand bouquet"; }
    else if (totalFlowers <= 75) { sheets = 12; size = "luxury bouquet"; }
    else { sheets = 15; size = "mega bouquet"; }
    const wrapCost = sheets * WRAP_PRICE_PER_SHEET;
    total += wrapCost;
    lines.push({ label: `📦 Wrapping Paper × ${sheets} sheets (${size})`, value: wrapCost });
    const wn = document.getElementById("wrappingNote");
    if (wn) wn.style.display = "block";
  } else {
    const wn = document.getElementById("wrappingNote");
    if (wn) wn.style.display = "none";
  }

  const sl = document.getElementById("summary-lines");
  const gt = document.getElementById("grand-total");
  if (!sl || !gt) return;

  if (lines.length === 0) {
    sl.innerHTML = `<p class="summary-empty">Add flowers to see your total.</p>`;
  } else {
    sl.innerHTML = lines.map(l => `
      <div class="summary-line">
        <span class="sline-name">${l.label}</span>
        <span class="sline-val">${l.value !== null ? "Rs " + l.value : "—"}</span>
      </div>`).join("");
  }

  animateValue(gt, parseGT(gt), total);
}

function parseGT(el) { return parseInt(el.textContent.replace(/[^0-9]/g, "") || "0", 10); }
function animateValue(el, from, to) {
  const steps = Math.max(1, 350 / 16); const diff = to - from; let count = 0, cur = from;
  clearInterval(el._t);
  el._t = setInterval(() => {
    count++; cur = from + diff * count / steps;
    if (count >= steps) { cur = to; clearInterval(el._t); }
    el.textContent = "Rs " + Math.round(cur);
  }, 16);
}

/* ── Reset ── */
function resetBuilder() {
  ["rose", "sunflower", "tulip", "daisy", "plumeria", "lily", "butterfly", "leaf",
    "polaroid", "plushie", "kitkat", "dairymilksilk", "dairymilk", "kinderjoy", "snickers"].forEach(k => {
      const i = document.getElementById("inp-" + k); if (i) i.value = 0;
    });
  snowSelected = null;
  document.getElementById("snow-yes").classList.remove("active");
  document.getElementById("snow-no").classList.remove("active");
  const snowNote = document.getElementById("snowPricingNote");
  if (snowNote) snowNote.style.display = "none";
  selectedColors = [];
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
  renderColorTags();
  const ci = document.getElementById("inp-color-note"); if (ci) ci.value = "";
  const ni = document.getElementById("inp-name"); if (ni) ni.value = "";
  const pi = document.getElementById("inp-phone"); if (pi) pi.value = "";
  const ai = document.getElementById("inp-address"); if (ai) ai.value = "";
  const nti = document.getElementById("inp-notes"); if (nti) nti.value = "";
  selectPayment("cod");
  clearPaymentFile();
  const btn = document.querySelector(".btn-place-order");
  if (btn) { btn.style.display = ""; btn.disabled = false; btn.innerHTML = `<i class="bi bi-bag-heart"></i> Place Order`; }
  const success = document.getElementById("order-success");
  if (success) success.style.display = "none";
  updateTotal();
}

/* ── Place Order via Formspree ── */
function placeOrder() {
  const lines = []; let total = 0;

  Object.keys(PRICES).forEach(f => {
    const qty = parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
    if (qty > 0) { const s = qty * PRICES[f]; total += s; lines.push(`${FLOWER_EMOJIS[f]} ${cap(f)} × ${qty} = Rs ${s}`); }
  });

  const totalFlowers2 = Object.keys(PRICES).reduce((sum, f) => sum + parseInt(document.getElementById("inp-" + f)?.value || "0", 10), 0);

  const bf = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (bf > 0) { const s = bf * 30; total += s; lines.push(`🦋 Butterfly Pins × ${bf} = Rs ${s}`); }
  const lf = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (lf > 0) { const s = lf * 10; total += s; lines.push(`🍃 Leaves × ${lf} = Rs ${s}`); }
  const pol = parseInt(document.getElementById("inp-polaroid")?.value || "0", 10);
  if (pol > 0) { const s = pol * 30; total += s; lines.push(`📸 Polaroid Photo × ${pol} = Rs ${s}`); }
  const plu = parseInt(document.getElementById("inp-plushie")?.value || "0", 10);
  if (plu > 0) { const s = plu * 500; total += s; lines.push(`🧸 Plushie × ${plu} = Rs ${s}`); }

  if (snowSelected === true) {
    const snowCost2 = totalFlowers2 <= 7 ? 50 : 100;
    const snowLabel2 = totalFlowers2 <= 7 ? "Snow Paper (small bouquet)" : "Snow Paper (large bouquet)";
    total += snowCost2;
    lines.push(`❄️ ${snowLabel2} = Rs ${snowCost2}`);
  }

  Object.keys(CHOC_PRICES).forEach(c => {
    const qty = parseInt(document.getElementById("inp-" + c)?.value || "0", 10);
    if (qty > 0) { const s = qty * CHOC_PRICES[c]; total += s; lines.push(`${CHOC_EMOJIS[c]} × ${qty} = Rs ${s}`); }
  });

  if (totalFlowers2 > 0) {
    let sheets2, size2;
    if (totalFlowers2 <= 3) { sheets2 = 1; size2 = "extra small"; }
    else if (totalFlowers2 <= 7) { sheets2 = 3; size2 = "small"; }
    else if (totalFlowers2 <= 12) { sheets2 = 4; size2 = "medium"; }
    else if (totalFlowers2 <= 18) { sheets2 = 6; size2 = "large"; }
    else if (totalFlowers2 <= 30) { sheets2 = 8; size2 = "extra large"; }
    else if (totalFlowers2 <= 50) { sheets2 = 10; size2 = "grand"; }
    else if (totalFlowers2 <= 75) { sheets2 = 12; size2 = "luxury"; }
    else { sheets2 = 15; size2 = "mega"; }
    const wc = sheets2 * 25; total += wc;
    lines.push(`📦 Wrapping Paper × ${sheets2} sheets (${size2}) = Rs ${wc}`);
  }

  // ── Validation ──
  if (lines.length === 0) { alert("🌹 Please add at least one flower."); return; }
  if (snowSelected === null) { alert("❄️ Please choose Yes or No for Snow Paper Wrapping."); return; }

  const colorNote = document.getElementById("inp-color-note")?.value?.trim() || "";
  if (selectedColors.length === 0 && !colorNote) { alert("🎨 Please choose or describe your ribbon color preference."); return; }

  const swatchColors = selectedColors.join(", ");
  const typedColor = document.getElementById("inp-color-note")?.value?.trim() || "";
  const colorInfo = [swatchColors, typedColor].filter(Boolean).join(" / ") || "Not specified";

  const name = document.getElementById("inp-name")?.value?.trim() || "";
  const phone = document.getElementById("inp-phone")?.value?.trim() || "";
  const address = document.getElementById("inp-address")?.value?.trim() || "";
  const notes = document.getElementById("inp-notes")?.value?.trim() || "";

  if (!name) { alert("👤 Please enter your name."); return; }
  if (!phone) { alert("📞 Please enter your phone number."); return; }
  if (!address) { alert("📍 Please enter your delivery address."); return; }
  if (!notes) { alert("📝 Please enter special instructions — occasion, delivery date, or any message."); return; }
  if (!selectedPayment) { alert("💳 Please select a payment method."); return; }
  if (selectedPayment === "online") {
    const paymentFile = document.getElementById("inp-payment-ss")?.files[0];
    if (!paymentFile) { alert("📸 Please upload your payment screenshot."); return; }
  }

  // ── Build order summary ──
  const orderSummary = lines.join("\n") +
    `\n\nTotal: Rs ${total}` +
    `\nColor Preference: ${colorInfo}`;

  const paymentFile = document.getElementById("inp-payment-ss")?.files[0];

  const formData = new FormData();
  formData.append("_subject", `🌸 New Order from ${name} — Rosairee`);
  formData.append("Customer Name", name);
  formData.append("Phone Number", phone);
  formData.append("Delivery Address", address);
  formData.append("Payment Method", selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment");
  formData.append("Order Details", orderSummary);
  formData.append("Special Notes", notes);
  formData.append("Order Total", `Rs ${total}`);
  if (paymentFile) formData.append("Payment Screenshot", paymentFile);

  const btn = document.querySelector(".btn-place-order");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Placing Order...`;

  fetch("https://formspree.io/f/xqejygjp", {
    method: "POST",
    body: formData,
    headers: { "Accept": "application/json" }
  })
    .then(res => {
      if (res.ok) {
        document.getElementById("order-success").style.display = "block";
        btn.style.display = "none";
        document.getElementById("order-success").scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        alert("Something went wrong. Please try again or DM us on Instagram.");
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-bag-heart"></i> Place Order`;
      }
    })
    .catch(() => {
      alert("Network error. Please check your connection and try again.");
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-bag-heart"></i> Place Order`;
    });
}

/* ── Tab reveal animation ── */
(function () {
  document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
    tab.addEventListener("shown.bs.tab", () => {
      const pane = document.querySelector(tab.getAttribute("data-bs-target"));
      if (!pane) return;
      pane.querySelectorAll(".bouquet-card").forEach((card, i) => {
        card.style.opacity = "0"; card.style.transform = "translateY(20px)";
        setTimeout(() => { card.style.transition = "opacity 0.5s ease, transform 0.5s ease"; card.style.opacity = "1"; card.style.transform = "translateY(0)"; }, i * 80);
      });
    });
  });
})();

/* ── Gallery click ── */
(function () {
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", function () {
      this.style.transform = "scale(0.97)";
      setTimeout(() => { this.style.transform = ""; }, 200);
    });
  });
})();

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

document.addEventListener("DOMContentLoaded", () => {
  updateTotal();
});