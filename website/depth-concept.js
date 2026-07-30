(() => {
  const experience = document.getElementById('depthExperience');
  const root = document.documentElement;
  const currentScene = document.querySelector('.scene-current');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!experience || reduceMotion.matches) return;

  let target = 0;
  let progress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let renderedMouseX = 0;
  let renderedMouseY = 0;
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));

  function readScroll() {
    const max = experience.offsetHeight - window.innerHeight;
    target = clamp((window.scrollY - experience.offsetTop) / max);
    if (!frame) frame = requestAnimationFrame(render);
  }

  function render() {
    progress += (target - progress) * 0.085;
    renderedMouseX += (mouseX - renderedMouseX) * 0.08;
    renderedMouseY += (mouseY - renderedMouseY) * 0.08;

    const intro = 1 - range(progress, 0.12, 0.32);
    const storyIn = range(progress, 0.22, 0.42);
    const storyOut = 1 - range(progress, 0.58, 0.74);
    const story = storyIn * storyOut;
    const final = range(progress, 0.68, 0.9);

    root.style.setProperty('--p', progress.toFixed(4));
    root.style.setProperty('--intro', intro.toFixed(4));
    root.style.setProperty('--story', story.toFixed(4));
    root.style.setProperty('--final', final.toFixed(4));
    root.style.setProperty('--mx', renderedMouseX.toFixed(3));
    root.style.setProperty('--my', renderedMouseY.toFixed(3));

    const scene = progress < 0.33 ? '01' : progress < 0.7 ? '02' : '03';
    if (currentScene.textContent !== scene) currentScene.textContent = scene;

    if (
      Math.abs(target - progress) > 0.0005 ||
      Math.abs(mouseX - renderedMouseX) > 0.01 ||
      Math.abs(mouseY - renderedMouseY) > 0.01
    ) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  window.addEventListener('pointermove', event => {
    mouseX = ((event.clientX / window.innerWidth) - 0.5) * 2;
    mouseY = ((event.clientY / window.innerHeight) - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    const video = document.querySelector('.film-layer video');
    if (!video) return;
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });

  readScroll();
})();
