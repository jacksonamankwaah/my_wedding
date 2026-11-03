/* ===== EDIT YOUR LINKS HERE =====
   Any value starting with "PLACEHOLDER" shows as "link not added" on the site.
   Replace it with the real link when you have it. */
const CONFIG = {
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=5.600188,-0.264484", // plus code JP2P+36C, Kwashieman
  receptionMapUrl: "https://www.google.com/maps/search/?api=1&query=5.5597354,-0.2954547",
  rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdOwFBxK3J8CEqlDv4UHORa1QZUyW-gLuFAevpFF8nmzAVqKA/viewform?usp=publish-editor",
  orderUrl: "documents/order-of-service.pdf", // replace the PDF in the documents folder
  gallery: [
    { src: "images/IMG_1.JPEG", alt: "Jackson and Deborah dressed in white" },
    { src: "images/IMG_2.jpg", alt: "Jackson and Deborah, studio portrait" },
    { src: "images/IMG_3.jpg", alt: "Jackson and Deborah, close portrait" }
  ],
  weddingDate: "2026-11-07T11:00:00Z" // Ghana is on GMT (UTC+0)
};

const $ = (s) => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const toast = $("#toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* Confirm before opening an outside link */
const cf = $("#confirm");
let pendingUrl = "";
function askOpen(url) {
  pendingUrl = url;
  $("#cf-url").textContent = url;
  cf.hidden = false;
  $("#cf-yes").focus();
}
$("#cf-no").addEventListener("click", () => (cf.hidden = true));
$("#cf-yes").addEventListener("click", () => {
  cf.hidden = true;
  window.open(pendingUrl, "_blank", "noopener");
});

/* Wire buttons to links */
document.querySelectorAll("[data-link]").forEach((a) => {
  const url = CONFIG[a.dataset.link] || "";
  if (url && !/^PLACEHOLDER/i.test(url)) {
    a.href = url;
    if (/^https?:\/\//.test(url)) {
      a.addEventListener("click", (e) => { e.preventDefault(); askOpen(url); });
    }
  } else {
    a.href = "#";
    a.classList.add("is-placeholder");
    a.removeAttribute("target");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("This link has not been added yet.");
    });
  }
});

/* Copy buttons (MoMo and bank numbers) */
document.querySelectorAll("[data-copy]").forEach((b) => {
  b.addEventListener("click", async () => {
    const v = b.dataset.copy;
    try {
      await navigator.clipboard.writeText(v);
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = v; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    showToast("Copied: " + v);
  });
});

/* Countdown */
const target = new Date(CONFIG.weddingDate).getTime();
const pad = (n) => String(n).padStart(2, "0");
const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
function setVal(el, v) {
  if (el.textContent === v) return;
  el.textContent = v;
  el.classList.remove("tick");
  void el.offsetWidth;
  el.classList.add("tick");
}
function tick() {
  const diff = target - Date.now();
  if (diff <= 0) {
    Object.values(cd).forEach((el) => (el.textContent = "00"));
    $("#cd-note").textContent = "Today we celebrate. Jackson and Deborah are married.";
    return;
  }
  setVal(cd.d, pad(Math.floor(diff / 864e5)));
  setVal(cd.h, pad(Math.floor(diff / 36e5) % 24));
  setVal(cd.m, pad(Math.floor(diff / 6e4) % 60));
  setVal(cd.s, pad(Math.floor(diff / 1e3) % 60));
}
tick();
setInterval(tick, 1000);

/* Mobile menu */
const btn = document.querySelector(".menu-btn");
const menu = $("#menu");
btn.addEventListener("click", () => {
  btn.setAttribute("aria-expanded", menu.classList.toggle("open"));
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", false);
  }
});

/* Gallery and lightbox */
const grid = $("#gallery-grid");
const lb = $("#lightbox");
const lbContent = $("#lb-content");
CONFIG.gallery.forEach((p) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("aria-label", "Open photo: " + p.alt);
  b.innerHTML = '<img loading="lazy" alt="' + p.alt + '" src="' + p.src + '">';
  b.addEventListener("click", () => {
    lbContent.innerHTML = '<img alt="' + p.alt + '" src="' + p.src + '">';
    lb.hidden = false;
    lb.querySelector("button").focus();
  });
  grid.appendChild(b);
});
const closeLb = () => (lb.hidden = true);
lb.addEventListener("click", (e) => {
  if (e.target === lb || e.target.tagName === "BUTTON") closeLb();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeLb(); cf.hidden = true; }
});

/* Scroll reveal with stagger */
const items = document.querySelectorAll(
  ".sec > *:not(.fl), .hero-text > *, footer > *:not(.fl), .gallery button, .gift, .partners img"
);
items.forEach((el) => {
  el.classList.add("reveal");
  const i = Array.prototype.indexOf.call(el.parentNode.children, el);
  el.style.setProperty("--d", Math.min(i * 0.09, 0.45) + "s");
});
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("in"));
}

/* Scroll progress bar and gentle hero parallax */
const bar = $("#progress");
const heroImg = document.querySelector(".hero-img");
let ticking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
  if (!reduce && heroImg && scrollY < innerHeight) heroImg.style.translate = "0 " + scrollY * 0.12 + "px";
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();