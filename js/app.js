import { illuminationAt, observeMoons, drawMoon } from "./moon.js";
import { startStarfield } from "./stars.js";

const phaseNames = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];
const phaseDescriptions = [
  "The Moon rests in shadow, hidden between Earth and the Sun.",
  "A sliver of light grows in the western sky, promising a brighter night to come.",
  "Half of the Moon is illuminated as it reaches the first quarter of its orbit.",
  "More than half lit, the Moon is growing fuller with each passing night.",
  "The Moon's near side is fully illuminated, brightening the whole night sky.",
  "The light begins to recede, though the Moon still rises round and bright.",
  "Half-lit once more, the Moon is on the homeward stretch of its cycle.",
  "A final crescent fades in the eastern morning sky before the cycle begins anew.",
];

function setActiveNavigation() {
  const page = document.body.dataset.page;
  const pageToHref = { home: "index.html", phases: "phases.html", constellations: "constellations.html", lore: "lore.html" };
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === pageToHref[page]) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function startClock() {
  const update = () => {
    const now = new Date();
    const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
    document.querySelectorAll("[data-clock]").forEach((element) => {
      element.textContent = element.classList.contains("footer-time") ? `LOCAL TIME — ${time}` : time;
    });
  };
  update();
  window.setInterval(update, 1000);
}

function startCoordinates() {
  const output = document.querySelector("[data-coordinates]");
  if (!output) return;
  let pointer = { x: 0.5, y: 0.5 };
  let frame = 0;
  document.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const azimuth = Math.round(pointer.x * 360).toString().padStart(3, "0");
      const elevation = Math.round(75 - pointer.y * 150);
      const sign = elevation >= 0 ? "+" : "−";
      output.textContent = `SKY POSITION  ${azimuth}° 00′ / ${sign}${Math.abs(elevation).toString().padStart(2, "0")}° 00′`;
      frame = 0;
    });
  }, { passive: true });
}

function startStargazeMode() {
  const button = document.querySelector(".stargaze-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("stargaze-mode");
    button.setAttribute("aria-pressed", String(enabled));
    const label = button.querySelector(".stargaze-label");
    if (label) label.textContent = enabled ? "Exit stargaze" : "Stargaze mode";
  });
}

function phaseIndex(phase) {
  return Math.round(phase * 8) % 8;
}

function updatePhase(value) {
  const normalized = ((Number(value) % 100) + 100) % 100 / 100;
  const illumination = illuminationAt(normalized);
  const day = Math.max(1, Math.round(normalized * 29.53) + 1);
  const index = phaseIndex(normalized);
  document.querySelectorAll("[data-moon]").forEach((canvas) => {
    if (!canvas.classList.contains("moon-canvas--hero")) {
      canvas.dataset.phase = String(normalized);
      canvas.setAttribute("aria-label", `${phaseNames[index]} phase of the Moon`);
      drawMoon(canvas, normalized);
    }
  });
  const name = document.querySelector("[data-phase-name]");
  if (name) name.textContent = phaseNames[index];
  const copy = document.querySelector("[data-phase-copy]");
  if (copy) copy.textContent = phaseDescriptions[index];
  const illuminationText = document.querySelector("[data-illumination]");
  if (illuminationText) illuminationText.textContent = `${Math.round(illumination * 100)}%`;
  const illuminationBar = document.querySelector("[data-illumination-bar]");
  if (illuminationBar) illuminationBar.style.width = `${illumination * 100}%`;
  const dayShort = document.querySelector("[data-phase-day]");
  if (dayShort) dayShort.textContent = `DAY ${String(day).padStart(2, "0")} / 29.53`;
  const dayLong = document.querySelector("[data-phase-day-long]");
  if (dayLong) dayLong.textContent = `DAY ${String(day).padStart(2, "0")} OF THE LUNAR MONTH`;
}

function initPhaseControls() {
  const range = document.querySelector("[data-phase-range]");
  if (!range) return;
  range.addEventListener("input", () => updatePhase(range.value));
  document.querySelectorAll("[data-phase-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      range.value = button.dataset.phasePreset;
      updatePhase(range.value);
    });
  });
  document.querySelectorAll("[data-phase-step]").forEach((button) => {
    button.addEventListener("click", () => {
      range.value = String((Number(range.value) + Number(button.dataset.phaseStep) + 100) % 100);
      updatePhase(range.value);
    });
  });
  updatePhase(range.value);
}

const constellations = {
  orion: {
    name: "ORION", coords: "RA 05h 35m · DEC −05° 23′",
    fact: "Orion's belt points southeast to Sirius, the brightest star in Earth's night sky.",
    stars: [[290, 92, "Betelgeuse", 1.5], [468, 78, "Bellatrix", 1.1], [355, 205, "Alnitak", 1.2], [379, 213, "Alnilam", 1.3], [404, 221, "Mintaka", 1.2], [326, 350, "Saiph", 1.1], [450, 335, "Rigel", 1.6], [376, 250, "Orion Nebula", 0.9]],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 7], [3, 7], [4, 7], [2, 5], [4, 6]],
  },
  cassiopeia: {
    name: "CASSIOPEIA", coords: "RA 01h 19m · DEC +63° 40′",
    fact: "Its five bright stars make a distinctive W, visible year-round from much of the Northern Hemisphere.",
    stars: [[206, 242, "Schedar", 1.4], [298, 122, "Caph", 1.1], [391, 281, "Gamma Cas", 1.2], [488, 135, "Ruchbah", 1.2], [574, 229, "Segin", 1.1]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  ursa: {
    name: "URSA MAJOR", coords: "RA 11h 03m · DEC +56° 22′",
    fact: "The two stars at the edge of the Big Dipper's bowl point almost directly toward Polaris.",
    stars: [[162, 146, "Dubhe", 1.3], [268, 112, "Merak", 1.3], [354, 188, "Phecda", 1.1], [250, 234, "Megrez", 1.1], [437, 202, "Alioth", 1.4], [517, 282, "Mizar", 1.2], [622, 325, "Alkaid", 1.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  cygnus: {
    name: "CYGNUS", coords: "RA 20h 41m · DEC +45° 17′",
    fact: "Deneb, the swan's tail, is one of the most distant stars visible to the naked eye.",
    stars: [[385, 205, "Deneb", 1.5], [211, 109, "Sadr", 1.2], [553, 294, "Albireo", 1.3], [382, 352, "Gienah", 1.1], [383, 74, "Fawaris", 1.1], [247, 264, "Delta Cygni", 1.0]],
    lines: [[0, 1], [1, 4], [0, 2], [0, 3], [1, 5]],
  },
};

function renderConstellation(key) {
  const data = constellations[key];
  const svg = document.querySelector(".constellation-svg");
  if (!data || !svg) return;
  svg.replaceChildren();
  const ns = "http://www.w3.org/2000/svg";
  const backgroundStars = Array.from({ length: 60 }, (_, i) => {
    const star = document.createElementNS(ns, "circle");
    star.setAttribute("cx", String((i * 137 + 43) % 750 + 5));
    star.setAttribute("cy", String((i * 83 + 29) % 440 + 8));
    star.setAttribute("r", String((i % 5) * 0.18 + 0.45));
    star.setAttribute("class", "map-background-star");
    return star;
  });
  svg.append(...backgroundStars);
  for (const [from, to] of data.lines) {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", data.stars[from][0]);
    line.setAttribute("y1", data.stars[from][1]);
    line.setAttribute("x2", data.stars[to][0]);
    line.setAttribute("y2", data.stars[to][1]);
    line.setAttribute("class", "constellation-line");
    svg.append(line);
  }
  data.stars.forEach(([x, y, name, size]) => {
    const group = document.createElementNS(ns, "g");
    group.setAttribute("class", "map-star");
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "img");
    group.setAttribute("aria-label", name);
    const glow = document.createElementNS(ns, "circle");
    glow.setAttribute("cx", x); glow.setAttribute("cy", y); glow.setAttribute("r", size * 7);
    glow.setAttribute("class", "map-star-glow");
    const star = document.createElementNS(ns, "circle");
    star.setAttribute("cx", x); star.setAttribute("cy", y); star.setAttribute("r", size * 2);
    star.setAttribute("class", "map-star-core");
    const title = document.createElementNS(ns, "title");
    title.textContent = name;
    group.append(glow, star, title);
    svg.append(group);
  });
  const title = document.createElementNS(ns, "text");
  title.setAttribute("x", "26"); title.setAttribute("y", "40"); title.setAttribute("class", "map-constellation-name");
  title.textContent = data.name;
  svg.append(title);
  document.querySelectorAll("[data-constellation]").forEach((button) => {
    const selected = button.dataset.constellation === key;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const fact = document.querySelector("[data-constellation-fact]");
  const coordinates = document.querySelector("[data-constellation-coords]");
  if (fact) fact.textContent = data.fact;
  if (coordinates) coordinates.textContent = data.coords;
}

function initConstellations() {
  if (!document.querySelector(".constellation-svg")) return;
  document.querySelectorAll("[data-constellation]").forEach((button) => {
    button.addEventListener("click", () => renderConstellation(button.dataset.constellation));
  });
  document.querySelector("[data-shooting-star]")?.addEventListener("click", () => {
    window.dispatchEvent(new Event("selene:shooting-star"));
  });
  renderConstellation("orion");
}

function initEclipse() {
  const canvas = document.querySelector("[data-eclipse-canvas]");
  const range = document.querySelector("#alignment-range");
  if (!canvas || !range) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  let type = "solar";
  let alignment = Number(range.value);
  let animationFrame = 0;

  const render = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
    const pixelHeight = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const w = rect.width;
    const h = rect.height;
    context.clearRect(0, 0, w, h);
    const centerY = h * 0.53;
    const sunX = w * 0.17;
    const earthX = w * 0.51;
    const moonX = type === "solar"
      ? w * (0.83 - alignment / 100 * 0.47)
      : w * (0.83 - alignment / 100 * 0.14);
    const sunRadius = Math.min(h * 0.28, 62);
    const earthRadius = Math.min(h * 0.15, 32);
    const moonRadius = Math.min(h * 0.105, 22);
    const glow = context.createRadialGradient(sunX, centerY, sunRadius * 0.7, sunX, centerY, sunRadius * 2.4);
    glow.addColorStop(0, "rgba(255, 190, 115, .2)");
    glow.addColorStop(1, "rgba(255, 190, 115, 0)");
    context.fillStyle = glow;
    context.beginPath(); context.arc(sunX, centerY, sunRadius * 2.4, 0, Math.PI * 2); context.fill();

    context.setLineDash([3, 8]);
    context.strokeStyle = "rgba(194, 205, 235, .22)";
    context.lineWidth = 1;
    context.beginPath(); context.moveTo(sunX, centerY); context.lineTo(w * 0.9, centerY); context.stroke();
    context.setLineDash([]);

    if (type === "solar") {
      context.fillStyle = "rgba(103, 116, 159, .12)";
      context.beginPath();
      context.moveTo(moonX, centerY - moonRadius * 0.5);
      context.lineTo(earthX, centerY - earthRadius * 0.4);
      context.lineTo(earthX, centerY + earthRadius * 0.4);
      context.lineTo(moonX, centerY + moonRadius * 0.5);
      context.closePath(); context.fill();
    } else {
      context.fillStyle = "rgba(240, 147, 127, .14)";
      context.beginPath();
      context.moveTo(earthX + earthRadius, centerY - earthRadius * 0.5);
      context.lineTo(moonX + moonRadius, centerY - moonRadius * 0.45);
      context.lineTo(moonX + moonRadius, centerY + moonRadius * 0.45);
      context.lineTo(earthX + earthRadius, centerY + earthRadius * 0.5);
      context.closePath(); context.fill();
    }

    const sunGradient = context.createRadialGradient(sunX - sunRadius * 0.28, centerY - sunRadius * 0.25, 0, sunX, centerY, sunRadius);
    sunGradient.addColorStop(0, "#fff5d5"); sunGradient.addColorStop(0.55, "#f5c27b"); sunGradient.addColorStop(1, "#c77e58");
    context.fillStyle = sunGradient; context.beginPath(); context.arc(sunX, centerY, sunRadius, 0, Math.PI * 2); context.fill();
    const earthGradient = context.createRadialGradient(earthX - earthRadius * 0.35, centerY - earthRadius * 0.35, 0, earthX, centerY, earthRadius);
    earthGradient.addColorStop(0, "#83bed6"); earthGradient.addColorStop(0.7, "#315878"); earthGradient.addColorStop(1, "#182741");
    context.fillStyle = earthGradient; context.beginPath(); context.arc(earthX, centerY, earthRadius, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "rgba(157, 202, 241, .48)"; context.lineWidth = 1;
    context.beginPath(); context.arc(earthX, centerY, earthRadius + 2, -Math.PI / 2, Math.PI / 2); context.stroke();

    const moonGlow = context.createRadialGradient(moonX, centerY, moonRadius * 0.6, moonX, centerY, moonRadius * 2.2);
    moonGlow.addColorStop(0, "rgba(205, 213, 239, .2)"); moonGlow.addColorStop(1, "rgba(205, 213, 239, 0)");
    context.fillStyle = moonGlow; context.beginPath(); context.arc(moonX, centerY, moonRadius * 2.2, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#d8dced"; context.beginPath(); context.arc(moonX, centerY, moonRadius, 0, Math.PI * 2); context.fill();
    if (type === "solar" && alignment > 78) {
      context.globalCompositeOperation = "source-atop";
      context.fillStyle = "rgba(23, 24, 35, .9)"; context.fillRect(moonX - moonRadius, centerY - moonRadius, moonRadius * 2, moonRadius * 2);
      context.globalCompositeOperation = "source-over";
    }
  };

  const update = () => {
    document.querySelector("[data-alignment]").textContent = `${Math.round(alignment)}%`;
    document.querySelector("[data-alignment-value]").textContent = `${Math.round(alignment)}%`;
    document.querySelector("[data-eclipse-status]").textContent = alignment > 85 ? "TOTAL ALIGNMENT" : alignment > 55 ? "PARTIAL ALIGNMENT" : "OUT OF ALIGNMENT";
    render();
  };
  const setType = (nextType) => {
    type = nextType;
    const solar = type === "solar";
    document.querySelectorAll("[data-eclipse-type]").forEach((button) => {
      const selected = button.dataset.eclipseType === type;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("[data-eclipse-symbol]").textContent = solar ? "☼" : "◕";
    document.querySelector("[data-eclipse-title]").textContent = solar ? "A shadow across the Sun." : "Earth's shadow on the Moon.";
    document.querySelector("[data-eclipse-copy]").textContent = solar
      ? "A solar eclipse happens when the Moon passes between Earth and the Sun, briefly turning day into twilight."
      : "A lunar eclipse occurs when Earth moves between the Sun and Moon, casting its shadow across the lunar surface.";
    render();
  };
  range.addEventListener("input", () => { alignment = Number(range.value); update(); });
  document.querySelectorAll("[data-eclipse-type]").forEach((button) => button.addEventListener("click", () => setType(button.dataset.eclipseType)));
  const playButton = document.querySelector("[data-eclipse-play]");
  playButton.addEventListener("click", () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      playButton.querySelector("[data-play-label]").textContent = "Animate alignment";
      return;
    }
    const start = alignment;
    const started = performance.now();
    playButton.querySelector("[data-play-label]").textContent = "Pause animation";
    const animate = (now) => {
      const progress = Math.min(1, (now - started) / 2200);
      alignment = start + (100 - start) * (progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2);
      range.value = String(Math.round(alignment));
      update();
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else {
        animationFrame = 0;
        playButton.querySelector("[data-play-label]").textContent = "Animate alignment";
      }
    };
    animationFrame = requestAnimationFrame(animate);
  });
  if ("ResizeObserver" in window) new ResizeObserver(render).observe(canvas);
  else window.addEventListener("resize", render, { passive: true });
  update();
}

document.addEventListener("DOMContentLoaded", () => {
  startStarfield();
  observeMoons();
  setActiveNavigation();
  startClock();
  startCoordinates();
  startStargazeMode();
  initPhaseControls();
  initConstellations();
  initEclipse();
});
