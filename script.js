/* ═══════════════════════════════════════════════
   ROSAIREE — script.js
   Handles: Bouquet Builder, Navbar scroll,
            Scroll reveal, Counter animation,
            Quick Add, Toast, WhatsApp order
═══════════════════════════════════════════════ */

"use strict";

// ─── Flower Price Map ───────────────────────────
const PRICES = {
  rose:      100,
  sunflower: 200,
  tulip:     120,
  daisy:     120,
  plumeria:   80,
  lily:      250,
};

const ACC_PRICES = {
  butterfly:  30,
  leaf:       10,
};

const FLOWER_EMOJIS = {
  rose:      "🌹",
  sunflower: "🌻",
  tulip:     "🌷",
  daisy:     "🌼",
  plumeria:  "🌸",
  lily:      "🌺",
};

// ─── Navbar Scroll Effect ────────────────────────
(function initNavbar() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  function handleScroll() {
    if (window.scrollY > 60) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
})();

// ─── Smooth Active Nav Link Highlight ───────────
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id], div[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function updateActive() {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActive, { passive: true });
})();

// ─── Scroll Reveal ───────────────────────────────
(function initReveal() {
  // Add reveal class to key elements
  const targets = [
    ".flower-card",
    ".bouquet-card",
    ".acc-info-card",
    ".gallery-item",
    ".section-header",
    ".about-strip .col-lg-6",
    ".stat-block",
    ".faq-section .accordion-item",
  ];

  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add("reveal");
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

// ─── Animated Counters ──────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => io.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const step = 16;
    const steps = duration / step;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, step);
  }
})();

// ─── Bouquet Builder ─────────────────────────────

/**
 * Change quantity of a flower or accessory
 * @param {string} key  - flower/acc key
 * @param {number} delta - +1 or -1
 */
function changeQty(key, delta) {
  const input = document.getElementById("inp-" + key);
  if (!input) return;
  const val = Math.max(0, parseInt(input.value || "0", 10) + delta);
  input.value = val;
  updateTotal();
}

/**
 * Quick-add from flower cards — increments qty by 1
 */
function quickAdd(flower, price) {
  const input = document.getElementById("inp-" + flower);
  if (!input) return;
  input.value = parseInt(input.value || "0", 10) + 1;
  updateTotal();

  // Show toast
  const toastMsg = document.getElementById("toastMsg");
  if (toastMsg) {
    toastMsg.innerHTML =
      `<i class="bi bi-check-circle-fill me-2" style="color:#c9566a"></i> ` +
      `${FLOWER_EMOJIS[flower]} 1 ${capitalize(flower)} added to bouquet!`;
  }
  const toastEl = document.getElementById("addToast");
  if (toastEl) {
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 });
    toast.show();
  }

  // Scroll to builder on first add
  scrollToBuilderOnce();
}

let hasScrolled = false;
function scrollToBuilderOnce() {
  if (!hasScrolled) {
    const builder = document.getElementById("builder");
    if (builder) {
      setTimeout(() => builder.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    }
    hasScrolled = true;
    setTimeout(() => { hasScrolled = false; }, 8000);
  }
}

/**
 * Recalculate and render the summary
 */
function updateTotal() {
  const summaryLines = document.getElementById("summary-lines");
  const grandTotal   = document.getElementById("grand-total");
  if (!summaryLines || !grandTotal) return;

  let total = 0;
  const lines = [];

  // Flowers
  Object.keys(PRICES).forEach((flower) => {
    const input = document.getElementById("inp-" + flower);
    if (!input) return;
    const qty = parseInt(input.value || "0", 10);
    if (qty > 0) {
      const subtotal = qty * PRICES[flower];
      total += subtotal;
      lines.push({
        label: `${FLOWER_EMOJIS[flower]} ${capitalize(flower)} × ${qty}`,
        value: subtotal,
      });
    }
  });

  // Butterfly
  const butterfly = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (butterfly > 0) {
    const sub = butterfly * ACC_PRICES.butterfly;
    total += sub;
    lines.push({ label: `🦋 Butterfly Pins × ${butterfly}`, value: sub });
  }

  // Snow paper
  const snowPrice = parseFloat(document.getElementById("inp-snow-price")?.value || "0");
  const snowMeter = parseFloat(document.getElementById("inp-snow-meter")?.value || "0");
  if (snowPrice > 0 && snowMeter > 0) {
    const sub = snowPrice * snowMeter;
    total += sub;
    lines.push({ label: `❄️ Snow Paper (${snowMeter}m @ Rs${snowPrice}/m)`, value: sub });
  }

  // Leaves
  const leaves = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (leaves > 0) {
    const sub = leaves * ACC_PRICES.leaf;
    total += sub;
    lines.push({ label: `🍃 Leaves × ${leaves}`, value: sub });
  }

  // Render lines
  if (lines.length === 0) {
    summaryLines.innerHTML = `<p class="summary-empty">Add flowers to see your total.</p>`;
  } else {
    summaryLines.innerHTML = lines
      .map(
        (l) =>
          `<div class="summary-line">
            <span class="sline-name">${l.label}</span>
            <span class="sline-val">Rs ${l.value}</span>
          </div>`
      )
      .join("");
  }

  // Animate grand total
  animateValue(grandTotal, parseGrandTotal(grandTotal), total);
}

function parseGrandTotal(el) {
  return parseInt(el.textContent.replace(/[^0-9]/g, "") || "0", 10);
}

function animateValue(el, from, to) {
  const duration = 350;
  const step = 16;
  const steps = Math.max(1, duration / step);
  const diff = to - from;
  let current = from;
  let count = 0;

  clearInterval(el._animTimer);
  el._animTimer = setInterval(() => {
    count++;
    current = from + (diff * count) / steps;
    if (count >= steps) {
      current = to;
      clearInterval(el._animTimer);
    }
    el.textContent = "Rs " + Math.round(current);
  }, step);
}

/**
 * Reset all builder inputs
 */
function resetBuilder() {
  ["rose","sunflower","tulip","daisy","plumeria","lily","butterfly","leaf"].forEach((key) => {
    const inp = document.getElementById("inp-" + key);
    if (inp) inp.value = 0;
  });
  const snowP = document.getElementById("inp-snow-price");
  const snowM = document.getElementById("inp-snow-meter");
  if (snowP) snowP.value = "";
  if (snowM) snowM.value = "";
  updateTotal();
}

/**
 * Compose WhatsApp order message and open it
 */
function placeOrder() {
  const lines = [];
  let total = 0;

  Object.keys(PRICES).forEach((flower) => {
    const qty = parseInt(document.getElementById("inp-" + flower)?.value || "0", 10);
    if (qty > 0) {
      const sub = qty * PRICES[flower];
      total += sub;
      lines.push(`  ${FLOWER_EMOJIS[flower]} ${capitalize(flower)} × ${qty} = Rs ${sub}`);
    }
  });

  const butterfly = parseInt(document.getElementById("inp-butterfly")?.value || "0", 10);
  if (butterfly > 0) {
    const sub = butterfly * ACC_PRICES.butterfly;
    total += sub;
    lines.push(`  🦋 Butterfly Pins × ${butterfly} = Rs ${sub}`);
  }

  const snowPrice = parseFloat(document.getElementById("inp-snow-price")?.value || "0");
  const snowMeter = parseFloat(document.getElementById("inp-snow-meter")?.value || "0");
  if (snowPrice > 0 && snowMeter > 0) {
    const sub = snowPrice * snowMeter;
    total += sub;
    lines.push(`  ❄️ Snow Paper: ${snowMeter}m @ Rs${snowPrice}/m = Rs ${sub}`);
  }

  const leaves = parseInt(document.getElementById("inp-leaf")?.value || "0", 10);
  if (leaves > 0) {
    const sub = leaves * ACC_PRICES.leaf;
    total += sub;
    lines.push(`  🍃 Leaves × ${leaves} = Rs ${sub}`);
  }

  if (lines.length === 0) {
    alert("Please add at least one flower before placing your order! 🌹");
    return;
  }

  const msg =
    `🌸 *New Bouquet Order — Rosairee*\n\n` +
    lines.join("\n") +
    `\n\n*💰 Total: Rs ${total}*\n\n` +
    `Crafted to perfection! Please confirm my order. 🙏`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

// ─── Utilities ───────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Gallery Lightbox (simple) ───────────────────
(function initGallery() {
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", function () {
      const name = this.querySelector(".gallery-placeholder span")?.textContent || "Bouquet";
      // A real implementation would show a modal; here we pulse the item
      this.style.transform = "scale(0.97)";
      setTimeout(() => { this.style.transform = ""; }, 200);
      // Optionally open a lightbox modal — placeholder for real images
      console.log("Gallery item clicked:", name);
    });
  });
})();

// ─── Bouquet Card Tab Reveal ─────────────────────
(function initTabReveal() {
  const tabEls = document.querySelectorAll('[data-bs-toggle="pill"]');
  tabEls.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", () => {
      const pane = document.querySelector(tab.getAttribute("data-bs-target"));
      if (!pane) return;
      pane.querySelectorAll(".bouquet-card").forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        setTimeout(() => {
          card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
          card.style.opacity   = "1";
          card.style.transform = "translateY(0)";
        }, i * 80);
      });
    });
  });
})();

// ─── On DOM Ready ────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  updateTotal();

  // Stagger flower card entrance
  document.querySelectorAll(".flower-card").forEach((card, i) => {
    card.style.transitionDelay = `${i * 60}ms`;
  });
});