export function startStarfield() {
  const canvas = document.querySelector(".starfield");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let stars = [];
  let shootingStar = null;
  let lastFrame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(210, Math.max(70, Math.floor((width * height) / 6500)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.15 + 0.25,
      alpha: Math.random() * 0.55 + 0.15,
      speed: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time = 0) => {
    if (time - lastFrame < 32 && !reducedMotion) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = time;
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const flicker = reducedMotion ? 0 : Math.sin(time * 0.0007 * star.speed + star.phase) * 0.17;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(213, 225, 255, ${Math.max(0.08, star.alpha + flicker)})`;
      context.fill();
    }

    if (shootingStar) {
      const progress = Math.min(1, (time - shootingStar.started) / 900);
      const x = shootingStar.x + progress * shootingStar.distance;
      const y = shootingStar.y + progress * shootingStar.distance * 0.38;
      const trail = context.createLinearGradient(x, y, x - 115, y - 43);
      trail.addColorStop(0, `rgba(240, 235, 255, ${1 - progress})`);
      trail.addColorStop(1, "rgba(145, 161, 218, 0)");
      context.strokeStyle = trail;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - 115, y - 43);
      context.stroke();
      if (progress === 1) shootingStar = null;
    }
    if (!reducedMotion) requestAnimationFrame(draw);
  };

  const launch = () => {
    shootingStar = {
      x: width * (0.42 + Math.random() * 0.52),
      y: height * Math.random() * 0.55,
      distance: Math.min(width, 420),
      started: performance.now(),
    };
    if (reducedMotion) draw(performance.now());
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("selene:shooting-star", launch);
}
