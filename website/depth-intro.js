(() => {
  const experience = document.getElementById('hero');
  const root = document.documentElement;
  const video = document.getElementById('introFilm');
  const soundGate = document.getElementById('introSoundGate');
  const enterWithSound = document.getElementById('introEnterSound');
  const enterSilently = document.getElementById('introEnterSilent');
  const soundToggle = document.getElementById('introSoundToggle');
  const soundToggleLabel = soundToggle.querySelector('b');
  const currentScene = document.querySelector('.integrated-current');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let soundEnabled = false;
  let fadeRequest = 0;
  let target = 0;
  let progress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let renderedMouseX = 0;
  let renderedMouseY = 0;
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));

  function fadeVolume(targetVolume, duration = 900, muteWhenDone = false) {
    const request = ++fadeRequest;
    const startVolume = video.volume;
    const startedAt = Date.now();

    function fade() {
      if (request !== fadeRequest) return;
      const elapsed = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      video.volume = startVolume + (targetVolume - startVolume) * eased;
      if (elapsed < 1) requestAnimationFrame(fade);
      else if (muteWhenDone) video.muted = true;
    }

    requestAnimationFrame(fade);
  }

  function syncSoundToggle() {
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
    soundToggleLabel.textContent = soundEnabled ? 'Sound on' : 'Sound off';
  }

  function dismissGate() {
    document.body.classList.remove('intro-locked');
    document.body.classList.add('experience-entered');
    soundGate.classList.add('dismissed');
    soundGate.setAttribute('aria-hidden', 'true');
  }

  function startWithSound() {
    soundEnabled = true;
    video.muted = false;
    video.volume = 0;
    video.play()
      .then(() => fadeVolume(0.72, 1400))
      .catch(() => {
        soundEnabled = false;
        video.muted = true;
      })
      .finally(syncSoundToggle);
    dismissGate();
  }

  function startSilently() {
    soundEnabled = false;
    video.muted = true;
    video.play().catch(() => {});
    syncSoundToggle();
    dismissGate();
  }

  enterWithSound.addEventListener('click', startWithSound);
  enterSilently.addEventListener('click', startSilently);
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      video.muted = false;
      video.volume = 0;
      video.play()
        .then(() => fadeVolume(0.72, 900))
        .catch(() => {
          soundEnabled = false;
          video.muted = true;
          syncSoundToggle();
        });
    } else {
      fadeVolume(0, 500, true);
    }
    syncSoundToggle();
  });

  function readScroll() {
    const max = experience.offsetHeight - window.innerHeight;
    target = reduceMotion.matches ? 0 : clamp((window.scrollY - experience.offsetTop) / max);
    const introEnd = experience.offsetTop + max + 20;
    document.body.classList.toggle('depth-active', window.scrollY < introEnd);
    if (!frame) frame = requestAnimationFrame(render);
  }

  function render() {
    progress += (target - progress) * 0.085;
    renderedMouseX += (mouseX - renderedMouseX) * 0.08;
    renderedMouseY += (mouseY - renderedMouseY) * 0.08;

    const intro = 1 - range(progress, 0.12, 0.32);
    const story = range(progress, 0.22, 0.42) * (1 - range(progress, 0.58, 0.74));
    const handoff = range(progress, 0.84, 0.98);
    const final = range(progress, 0.64, 0.82) * (1 - range(progress, 0.87, 0.96));
    const paperY = `${(1 - range(progress, 0.91, 1)) * 100}%`;

    root.style.setProperty('--dp', progress.toFixed(4));
    root.style.setProperty('--d-intro', intro.toFixed(4));
    root.style.setProperty('--d-story', story.toFixed(4));
    root.style.setProperty('--d-final', final.toFixed(4));
    root.style.setProperty('--d-hand', handoff.toFixed(4));
    root.style.setProperty('--d-paper-y', paperY);
    root.style.setProperty('--d-mx', renderedMouseX.toFixed(3));
    root.style.setProperty('--d-my', renderedMouseY.toFixed(3));

    if (soundEnabled && progress > 0.76) {
      video.volume = 0.72 * (1 - range(progress, 0.76, 0.98));
    }

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
    if (reduceMotion.matches) return;
    mouseX = ((event.clientX / window.innerWidth) - 0.5) * 2;
    mouseY = ((event.clientY / window.innerHeight) - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });

  if (window.location.hash && window.location.hash !== '#hero') startSilently();
  readScroll();
})();
