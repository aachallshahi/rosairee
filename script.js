/* ═══════════════════════════════════════════════
   ROSAIREE — script.js
═══════════════════════════════════════════════ */
"use strict";

const PRICES = { rose: 100, sunflower: 200, tulip: 120, daisy: 120, plumeria: 80, lily: 250 };
const ACC_PRICES = { butterfly: 30, leaf: 10 };
const CHOC_PRICES = { kitkat: 50, dairymilksilk: 220, dairymilk: 100, kinderjoy: 100, snickers: 150 };
const CHOC_EMOJIS = { kitkat: "🍫 KitKat", dairymilksilk: "🍬 Dairy Milk Silk", dairymilk: "🍫 Dairy Milk", kinderjoy: "🥚 Kinder Joy", snickers: "🍪 Snickers" };
const SNOW_PRICE_PER_METER = 100;
const WRAP_PRICE_PER_SHEET = 25;
const FLOWER_EMOJIS = { rose: "🌹", sunflower: "🌻", tulip: "🌷", daisy: "🌼", plumeria: "🌸", lily: "🌺" };

// Snow paper state
let snowSelected = false;

// Selected color swatches
let selectedColors = [];

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
  inp.value = Math.max(0, parseInt(inp.value || "0", 10) + delta);
  updateTotal();
}

/* ── Quick add from flower card ── */
let _hasScrolled = false;
function quickAdd(flower, price) {
  const inp = document.getElementById("inp-" + flower);
  if (!inp) return;
  inp.value = parseInt(inp.value || "0", 10) + 1;
  updateTotal();
  // Toast
  const msg = document.getElementById("toastMsg");
  if (msg) msg.innerHTML = `<i class="bi bi-check-circle-fill me-2" style="color:#c9566a"></i> ${FLOWER_EMOJIS[flower]} 1 ${cap(flower)} added!`;
  const el = document.getElementById("addToast");
  if (el) bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
  // Scroll to builder once
  if (!_hasScrolled) {
    _hasScrolled = true;
    setTimeout(() => document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    setTimeout(() => { _hasScrolled = false; }, 8000);
  }
}

/* ── Snow paper toggle ── */
function setSnow(val) {
  snowSelected = val;
  document.getElementById("snow-yes").classList.toggle("active", val);
  document.getElementById("snow-no").classList.toggle("active", !val);
  // Show/hide note in summary
  const note = document.getElementById("snowPricingNote");
  if (note) note.style.display = val ? "block" : "none";
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
  // Deselect swatch
  document.querySelectorAll(".swatch").forEach(s => { if (s.title === name) s.classList.remove("selected"); });
  renderColorTags();
  updateTotal();
}

/* ── Update total ── */
function updateTotal() {
  const lines = [];
  let total = 0;

  // ── Flowers ──
  Object.keys(PRICES).forEach(f => {
    const qty = parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
    if (qty > 0) {
      const sub = qty * PRICES[f];
      total += sub;
      lines.push({ label: `${FLOWER_EMOJIS[f]} ${cap(f)} × ${qty}`, value: sub });
    }
  });

  // ── Count total flowers for wrapping paper estimate ──
  const totalFlowers = Object.keys(PRICES).reduce((sum, f) => {
    return sum + parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
  }, 0);

  // ── Basic accessories ──
  const bf = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (bf > 0) { const s = bf * 30; total += s; lines.push({ label: `🦋 Butterfly Pins × ${bf}`, value: s }); }

  const lf = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (lf > 0) { const s = lf * 10; total += s; lines.push({ label: `🍃 Leaves × ${lf}`, value: s }); }

  const pol = parseInt(document.getElementById("inp-polaroid")?.value || "0", 10);
  if (pol > 0) { const s = pol * 30; total += s; lines.push({ label: `📸 Polaroid Photo × ${pol}`, value: s }); }

  const plu = parseInt(document.getElementById("inp-plushie")?.value || "0", 10);
  if (plu > 0) { const s = plu * 500; total += s; lines.push({ label: `🧸 Plushie × ${plu}`, value: s }); }

  // ── Snow paper ──
  if (snowSelected) {
    lines.push({ label: `❄️ Snow Paper (Rs 100/meter — team confirms meters)`, value: null });
  }

  // ── Chocolates ──
  Object.keys(CHOC_PRICES).forEach(c => {
    const qty = parseInt(document.getElementById("inp-" + c)?.value || "0", 10);
    if (qty > 0) {
      const sub = qty * CHOC_PRICES[c];
      total += sub;
      lines.push({ label: `${CHOC_EMOJIS[c]} × ${qty}`, value: sub });
    }
  });

  // ── Wrapping paper (auto-estimated by flower count) ──
  if (totalFlowers > 0) {
    const sheets = totalFlowers <= 10 ? 3 : totalFlowers <= 14 ? 4 : totalFlowers <= 18 ? 5 : 6;
    const wrapCost = sheets * WRAP_PRICE_PER_SHEET;
    total += wrapCost;
    const size = totalFlowers <= 10 ? "small bouquet" : totalFlowers <= 14 ? "medium bouquet" : "large bouquet";
    lines.push({ label: `📦 Wrapping Paper × ${sheets} sheets (${size})`, value: wrapCost });
    // Show/hide wrapping note in summary
    const wn = document.getElementById("wrappingNote");
    if (wn) wn.style.display = "block";
  } else {
    const wn = document.getElementById("wrappingNote");
    if (wn) wn.style.display = "none";
  }

  // ── Render ──
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
  setSnow(false);
  selectedColors = [];
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("selected"));
  renderColorTags();
  const ci = document.getElementById("inp-color-note"); if (ci) ci.value = "";
  updateTotal();
}

/* ── Place order via WhatsApp ── */
function placeOrder() {
  const lines = []; let total = 0;
  Object.keys(PRICES).forEach(f => {
    const qty = parseInt(document.getElementById("inp-" + f)?.value || "0", 10);
    if (qty > 0) { const s = qty * PRICES[f]; total += s; lines.push(`  ${FLOWER_EMOJIS[f]} ${cap(f)} × ${qty} = Rs ${s}`); }
  });
  const bf = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (bf > 0) { const s = bf * 30; total += s; lines.push(`  🦋 Butterfly Pins × ${bf} = Rs ${s}`); }
  const lf = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (lf > 0) { const s = lf * 10; total += s; lines.push(`  🍃 Leaves × ${lf} = Rs ${s}`); }
  const pol = parseInt(document.getElementById("inp-polaroid")?.value || "0", 10);
  if (pol > 0) { const s = pol * 30; total += s; lines.push(`  📸 Polaroid Photo × ${pol} = Rs ${s}`); }
  const plu = parseInt(document.getElementById("inp-plushie")?.value || "0", 10);
  if (plu > 0) { const s = plu * 500; total += s; lines.push(`  🧸 Plushie × ${plu} = Rs ${s}`); }
  if (snowSelected) lines.push(`  ❄️ Snow Paper — Rs 100/meter (team confirms exact meters)`);
  Object.keys(CHOC_PRICES).forEach(c => {
    const qty = parseInt(document.getElementById("inp-" + c)?.value || "0", 10);
    if (qty > 0) { const s = qty * CHOC_PRICES[c]; total += s; lines.push(`  ${CHOC_EMOJIS[c]} × ${qty} = Rs ${s}`); }
  });
  // Wrapping paper
  const totalFlowers2 = Object.keys(PRICES).reduce((sum, f) => sum + parseInt(document.getElementById("inp-" + f)?.value || "0", 10), 0);
  if (totalFlowers2 > 0) {
    const sheets = totalFlowers2 <= 10 ? 3 : totalFlowers2 <= 14 ? 4 : totalFlowers2 <= 18 ? 5 : 6;
    const wc = sheets * 25; total += wc;
    lines.push(`  📦 Wrapping Paper × ${sheets} sheets = Rs ${wc}`);
  }

  if (lines.length === 0) { alert("Please add at least one flower before placing your order! 🌹"); return; }

  // Color info
  const swatchColors = selectedColors.join(", ");
  const typedColor = document.getElementById("inp-color-note")?.value?.trim() || "";
  const colorInfo = [swatchColors, typedColor].filter(Boolean).join(" / ") || "Not specified";

  const name = document.getElementById("inp-name")?.value || "";
  const phone = document.getElementById("inp-phone")?.value || "";
  const notes = document.getElementById("inp-notes")?.value || "";

  const msg =
    `🌸 *New Order — Rosairee*\n\n` +
    lines.join("\n") +
    `\n\n*💰 Flowers & Accessories Total: Rs ${total}*` +
    (snowSelected ? `\n❄️ *Snow paper price to be negotiated*` : "") +
    `\n\n🎨 *Ribbon Color Preference:* ${colorInfo}` +
    (name ? `\n👤 *Name:* ${name}` : "") +
    (phone ? `\n📞 *Phone:* ${phone}` : "") +
    (notes ? `\n📝 *Notes:* ${notes}` : "") +
    `\n\nPlease confirm my order. 🙏`;

  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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
  setSnow(false);
});