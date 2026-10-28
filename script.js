const scene = document.getElementById("scene");
const particleLayer = document.getElementById("particles");
const petalLayer = document.getElementById("petals");
const loveLayer = document.getElementById("loveLayer");
const apology = document.getElementById("apology");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  particleLayer.replaceChildren();
  if (reducedMotion) return;

  for (let i = 0; i < 65; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = random(0, 100) + "%";
    spark.style.setProperty("--size", random(2, 6) + "px");
    spark.style.setProperty("--duration", random(6, 13) + "s");
    spark.style.setProperty("--delay", random(-13, 0) + "s");
    spark.style.setProperty("--drift", random(-100, 100) + "px");
    particleLayer.appendChild(spark);
  }
}

function createPetals() {
  petalLayer.replaceChildren();
  if (reducedMotion) return;

  for (let i = 0; i < 18; i++) {
    const petal = document.createElement("span");
    petal.className = "falling-petal";
    petal.style.setProperty("--left", random(0, 100) + "%");
    petal.style.setProperty("--size", random(8, 17) + "px");
    petal.style.setProperty("--duration", random(8, 15) + "s");
    petal.style.setProperty("--delay", random(-15, 0) + "s");
    petal.style.setProperty("--sway", random(-100, 100) + "px");
    petalLayer.appendChild(petal);
  }
}

/* ---------- Message pages (one short part at a time) ---------- */
const pageEls = Array.from(document.querySelectorAll("#pages .page"));
const dotsEl = document.getElementById("dots");
const nextButton = document.getElementById("next");
const navEl = document.getElementById("nav");
const choicesEl = document.getElementById("choices");
let currentPage = 0;

pageEls.forEach(() => {
  const dot = document.createElement("span");
  dot.className = "dot";
  dotsEl.appendChild(dot);
});

function showPage(n) {
  currentPage = n;
  pageEls.forEach((p, i) => p.classList.toggle("active", i === n));
  Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle("on", i === n));

  if (n === pageEls.length - 1) {
    navEl.classList.add("hidden");
    choicesEl.classList.remove("hidden");
  }
}

nextButton.addEventListener("click", () => {
  if (currentPage < pageEls.length - 1) showPage(currentPage + 1);
});

showPage(0);

/* ---------- The "No" button keeps running away ---------- */
let noRunning = false;

function overlaps(a, b) {
  return !(
    a.right < b.left - 10 ||
    a.left > b.right + 10 ||
    a.bottom < b.top - 10 ||
    a.top > b.bottom + 10
  );
}

function moveNoButton() {
  const w = noButton.offsetWidth;
  const h = noButton.offsetHeight;
  const maxX = window.innerWidth - w - 10;
  const maxY = window.innerHeight - h - 10;
  const yesRect = yesButton.getBoundingClientRect();

  let x = 10;
  let y = 10;

  for (let i = 0; i < 25; i++) {
    x = random(10, Math.max(10, maxX));
    y = random(10, Math.max(10, maxY));
    const box = { left: x, top: y, right: x + w, bottom: y + h };
    if (!overlaps(box, yesRect)) break;
  }

  noButton.style.left = x + "px";
  noButton.style.top = y + "px";
}

function startRunning() {
  if (noRunning) return;
  noRunning = true;

  // Keep a placeholder so the layout doesn't jump
  const rect = noButton.getBoundingClientRect();
  const spacer = document.createElement("span");
  spacer.style.width = rect.width + "px";
  spacer.style.height = rect.height + "px";
  spacer.style.display = "inline-block";
  noButton.parentNode.insertBefore(spacer, noButton);

  noButton.style.left = rect.left + "px";
  noButton.style.top = rect.top + "px";
  noButton.classList.add("running");

  // force a reflow so the transition starts from the current spot
  void noButton.offsetWidth;

  moveNoButton();
}

noButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (!noRunning) startRunning();
  else moveNoButton();
});

window.addEventListener("resize", () => {
  if (noRunning) moveNoButton();
});

/* ---------- Floating I LOVE YOU words ---------- */
const loveWords = [];
let loveStarted = false;

function createLoveWords() {
  const count = window.innerWidth < 600 ? 9 : 14;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "love-word";
    el.textContent = "I LOVE YOU";
    el.style.fontSize = random(14, 30) + "px";
    el.style.animationDelay = random(0, 1.5) + "s";
    loveLayer.appendChild(el);

    const word = {
      el,
      x: random(0, window.innerWidth - 120),
      y: random(0, window.innerHeight - 40),
      vx: random(0.4, 1.3) * (Math.random() < 0.5 ? -1 : 1),
      vy: random(0.3, 1.1) * (Math.random() < 0.5 ? -1 : 1),
    };
    loveWords.push(word);
  }
}

function animateLove() {
  for (const w of loveWords) {
    const width = w.el.offsetWidth;
    const height = w.el.offsetHeight;

    w.x += w.vx;
    w.y += w.vy;

    if (w.x <= 0) { w.x = 0; w.vx = Math.abs(w.vx); }
    if (w.x >= window.innerWidth - width) { w.x = window.innerWidth - width; w.vx = -Math.abs(w.vx); }
    if (w.y <= 0) { w.y = 0; w.vy = Math.abs(w.vy); }
    if (w.y >= window.innerHeight - height) { w.y = window.innerHeight - height; w.vy = -Math.abs(w.vy); }

    w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
  }
  requestAnimationFrame(animateLove);
}

function startLove() {
  if (loveStarted) return;
  loveStarted = true;
  createLoveWords();
  if (reducedMotion) {
    for (const w of loveWords) {
      w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
    }
    return;
  }
  animateLove();
}

/* ---------- Music ---------- */
// Put your song in the same folder as index.html and name it music.mp3.
// If the file isn't found, a soft music-box melody plays instead.
const MUSIC_FILE = "music.mp3";

// Where the song starts, in SECONDS: 3:57 = 3 * 60 + 57 = 237
const CHORUS_START = 3 * 60 + 57;
const CHORUS_END = null; // null = play to the end, then jump back to CHORUS_START
let musicStarted = false;

function startSynthMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();

  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);

  const chords = [
    { bass: 130.81, arp: [261.63, 329.63, 392.0, 523.25] },
    { bass: 110.0,  arp: [220.0, 261.63, 329.63, 440.0] },
    { bass: 87.31,  arp: [174.61, 261.63, 349.23, 440.0] },
    { bass: 98.0,   arp: [196.0, 246.94, 293.66, 392.0] },
  ];
  const order = [0, 1, 2, 3, 2, 1, 2, 3];
  let step = 0;

  function note(freq, time, dur, vol) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc2.type = "triangle";
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur + 0.05);
    osc2.stop(time + dur + 0.05);
  }

  function playStep() {
    const t = ctx.currentTime + 0.05;
    const chord = chords[Math.floor(step / 8) % chords.length];
    const i = step % 8;
    if (i === 0) note(chord.bass, t, 2.6, 0.22);
    note(chord.arp[order[i]], t, 1.4, 0.16);
    step++;
  }

  playStep();
  setInterval(playStep, 420);
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;

  const audio = new Audio(MUSIC_FILE);
  audio.volume = 0.8;

  const jumpToStart = () => { audio.currentTime = CHORUS_START; };
  audio.addEventListener("loadedmetadata", jumpToStart, { once: true });
  audio.addEventListener("ended", () => { jumpToStart(); audio.play(); });
  if (CHORUS_END !== null) {
    audio.addEventListener("timeupdate", () => {
      if (audio.currentTime >= CHORUS_END) jumpToStart();
    });
  }

  const p = audio.play();
  if (p && p.catch) p.catch(startSynthMusic);
}

/* ---------- Forgive -> reveal the bouquet ---------- */
yesButton.addEventListener("click", () => {
  noButton.style.display = "none";
  apology.classList.add("hide");
  scene.classList.add("revealed"); // bouquet animations start now
  startLove();
  startMusic(); // the click lets the browser allow sound
});

createParticles();
createPetals();