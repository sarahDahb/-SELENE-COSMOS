const TAU = Math.PI * 2;

function hash(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function illuminationAt(phase) {
  return (1 - Math.cos(TAU * phase)) / 2;
}

export function drawMoon(canvas, phase = 0.13) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const bounds = canvas.getBoundingClientRect();
  const cssSize = Math.max(1, Math.min(bounds.width || 280, bounds.height || 280));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.round(cssSize * ratio);
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
  }
  context.clearRect(0, 0, size, size);

  const radius = size * 0.465;
  const center = size / 2;
  const pixels = context.createImageData(size, size);
  const data = pixels.data;
  const angle = phase * TAU;
  const lightX = Math.sin(angle);
  const lightZ = -Math.cos(angle);

  for (let py = 0; py < size; py++) {
    const ny = (py - center) / radius;
    for (let px = 0; px < size; px++) {
      const nx = (px - center) / radius;
      const distance = nx * nx + ny * ny;
      if (distance > 1) continue;

      const nz = Math.sqrt(1 - distance);
      const lambert = nx * lightX + nz * lightZ;
      const grain = (hash(Math.floor(px / (ratio * 2)), Math.floor(py / (ratio * 2))) - 0.5) * 7;
      const relief = Math.sin(nx * 17 + ny * 11) * Math.cos(ny * 23 - nx * 7) * 5;
      const edge = Math.max(0, 1 - distance * 0.24);
      const shade = Math.max(0.1, 0.2 + Math.max(0, lambert) * 0.8) * edge;
      const index = (py * size + px) * 4;
      const value = Math.max(0, Math.min(255, 205 * shade + grain + relief));
      data[index] = value * 0.94;
      data[index + 1] = value * 0.96;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);

  context.save();
  context.beginPath();
  context.arc(center, center, radius, 0, TAU);
  context.clip();

  for (let i = 0; i < 9; i++) {
    const x = (hash(i + 71, 23) * 1.4 - 0.7) * radius;
    const y = (hash(i + 37, 61) * 1.4 - 0.7) * radius;
    const mariaRadius = radius * (0.09 + hash(i + 13, 47) * 0.11);
    const mare = context.createRadialGradient(
      center + x - mariaRadius * 0.2,
      center + y - mariaRadius * 0.2,
      mariaRadius * 0.1,
      center + x,
      center + y,
      mariaRadius,
    );
    mare.addColorStop(0, "rgba(54, 61, 77, .12)");
    mare.addColorStop(0.78, "rgba(70, 77, 94, .08)");
    mare.addColorStop(1, "rgba(225, 231, 244, .035)");
    context.fillStyle = mare;
    context.beginPath();
    context.arc(center + x, center + y, mariaRadius, 0, TAU);
    context.fill();
  }

  const craterCount = 56;
  for (let i = 0; i < craterCount; i++) {
    const x = (hash(i + 11, 3) * 1.5 - 0.75) * radius;
    const y = (hash(i + 19, 9) * 1.5 - 0.75) * radius;
    if (x * x + y * y > radius * radius * 0.8) continue;
    const craterRadius = radius * (0.012 + hash(i + 4, 17) * 0.035);
    const crater = context.createRadialGradient(
      center + x - craterRadius * 0.28,
      center + y - craterRadius * 0.28,
      craterRadius * 0.08,
      center + x,
      center + y,
      craterRadius,
    );
    crater.addColorStop(0, "rgba(15, 20, 32, .3)");
    crater.addColorStop(0.66, "rgba(36, 43, 58, .17)");
    crater.addColorStop(0.86, "rgba(36, 43, 58, .08)");
    crater.addColorStop(1, "rgba(244, 241, 231, .23)");
    context.fillStyle = crater;
    context.beginPath();
    context.arc(center + x, center + y, craterRadius, 0, TAU);
    context.fill();
  }
  context.restore();

  const rim = context.createRadialGradient(center, center, radius * 0.86, center, center, radius);
  rim.addColorStop(0, "rgba(224, 232, 249, 0)");
  rim.addColorStop(0.78, "rgba(224, 232, 249, 0)");
  rim.addColorStop(1, "rgba(224, 232, 249, .17)");
  context.fillStyle = rim;
  context.beginPath();
  context.arc(center, center, radius, 0, TAU);
  context.fill();

  context.beginPath();
  context.arc(center, center, radius, 0, TAU);
  context.strokeStyle = "rgba(222, 231, 251, .18)";
  context.lineWidth = Math.max(1, size * 0.004);
  context.stroke();
}

export function observeMoons() {
  const canvases = [...document.querySelectorAll("[data-moon]")];
  if (!canvases.length) return;

  const paint = (canvas) => {
    const phase = Number(canvas.dataset.phase);
    drawMoon(canvas, Number.isFinite(phase) ? phase : 0.13);
  };
  canvases.forEach(paint);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver((entries) => entries.forEach(({ target }) => paint(target)));
    canvases.forEach((canvas) => observer.observe(canvas));
  } else {
    window.addEventListener("resize", () => canvases.forEach(paint), { passive: true });
  }

  const hero = document.querySelector(".moon-canvas--hero");
  if (hero && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const visual = hero.closest(".hero-visual");
    visual.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.transform = `rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`;
    });
    visual.addEventListener("pointerleave", () => {
      hero.style.transform = "";
    });
  }
}
