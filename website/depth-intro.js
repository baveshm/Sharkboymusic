(() => {
  const experience = document.getElementById('hero');
  const root = document.documentElement;
  const video = document.getElementById('introFilm');
  const soundGate = document.getElementById('introSoundGate');
  const enterWithSound = document.getElementById('introEnterSound');
  const enterSilently = document.getElementById('introEnterSilent');
  const soundToggle = document.getElementById('introSoundToggle');
  const soundToggleLabel = soundToggle.querySelector('b');
  const replayButtons = document.querySelectorAll('[data-replay-experience]');
  const currentScene = document.querySelector('.integrated-current');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const embeddedBrowser = /Telegram|WhatsApp|FBAN|FBAV|FB_IAB|Instagram|Line\/|; wv\)|WebView/i.test(navigator.userAgent || '') ||
    new URLSearchParams(window.location.search).get('embedded') === '1';

  document.body.classList.toggle('embedded-browser', embeddedBrowser);
  video.setAttribute('webkit-playsinline', '');

  document.querySelector('.integrated-story > span')?.remove();

  let soundEnabled = false;
  let fadeRequest = 0;
  let target = 0;
  let progress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let renderedMouseX = 0;
  let renderedMouseY = 0;
  let frame = 0;
  let launchTimer = 0;
  let embeddedPlaying = false;
  let embeddedStartedAt = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));

  function jumpToElement(element) {
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    element.scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = previousScrollBehavior;
  }

  function jumpToExperienceStart() {
    jumpToElement(experience);
  }

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

  function dismissGate(launch = true) {
    if (launch) jumpToExperienceStart();
    document.body.classList.remove('experience-launching');
    document.body.classList.remove('intro-locked');
    document.body.classList.add('experience-entered');
    soundGate.classList.add('dismissed');
    soundGate.setAttribute('aria-hidden', 'true');
    if (!launch) return;
    if (embeddedBrowser) startEmbeddedSequence();
    requestAnimationFrame(() => {
      document.body.classList.add('experience-launching');
      clearTimeout(launchTimer);
      launchTimer = window.setTimeout(() => {
        document.body.classList.remove('experience-launching');
      }, 1800);
    });
  }

  function startEmbeddedSequence() {
    embeddedPlaying = true;
    embeddedStartedAt = performance.now();
    target = 0;
    progress = 0;
    document.body.classList.remove('embedded-complete');
    if (!frame) frame = requestAnimationFrame(render);
  }

  function recoverMutedPlayback() {
    soundEnabled = false;
    video.muted = true;
    video.volume = 0.72;
    return video.play().catch(() => {
      document.body.classList.add('video-fallback');
    });
  }

  function startWithSound() {
    soundEnabled = true;
    video.muted = false;
    video.volume = 0;
    video.play()
      .then(() => fadeVolume(0.72, 1400))
      .catch(() => {
        recoverMutedPlayback();
      })
      .finally(syncSoundToggle);
    dismissGate();
  }

  function startSilently(launch = true) {
    soundEnabled = false;
    video.muted = true;
    video.play().catch(() => {
      document.body.classList.add('video-fallback');
    });
    syncSoundToggle();
    dismissGate(launch !== false);
  }

  function replayExperience() {
    ++fadeRequest;
    soundEnabled = false;
    video.muted = true;
    video.volume = 0.72;
    video.currentTime = 0;
    jumpToExperienceStart();
    target = 0;
    progress = 0;
    embeddedPlaying = false;
    document.body.classList.remove('experience-entered');
    document.body.classList.remove('experience-launching');
    document.body.classList.add('intro-locked', 'depth-active');
    soundGate.classList.remove('dismissed');
    soundGate.setAttribute('aria-hidden', 'false');
    syncSoundToggle();
    render();
    requestAnimationFrame(() => enterWithSound.focus());
  }

  enterWithSound.addEventListener('click', startWithSound);
  enterSilently.addEventListener('click', startSilently);
  replayButtons.forEach(button => button.addEventListener('click', replayExperience));
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
    if (embeddedBrowser) {
      const introEnd = experience.offsetTop + experience.offsetHeight - 82;
      document.body.classList.toggle('depth-active', window.scrollY < introEnd);
      if (!frame) frame = requestAnimationFrame(render);
      return;
    }
    const max = experience.offsetHeight - window.innerHeight;
    target = reduceMotion.matches ? 0 : clamp((window.scrollY - experience.offsetTop) / max);
    const introEnd = experience.offsetTop + experience.offsetHeight - 82;
    document.body.classList.toggle('depth-active', window.scrollY < introEnd);
    if (!frame) frame = requestAnimationFrame(render);
  }

  function render(now = performance.now()) {
    if (embeddedPlaying) {
      progress = clamp((now - embeddedStartedAt) / 8200);
      target = progress;
    } else if (!embeddedBrowser) {
      progress += (target - progress) * 0.085;
    }
    renderedMouseX += (mouseX - renderedMouseX) * 0.08;
    renderedMouseY += (mouseY - renderedMouseY) * 0.08;

    const intro = 1 - range(progress, 0.08, 0.2);
    const story = range(progress, 0.18, 0.38) * (1 - range(progress, 0.54, 0.64));
    const final = range(progress, 0.62, 0.8);

    root.style.setProperty('--dp', progress.toFixed(4));
    root.style.setProperty('--d-intro', intro.toFixed(4));
    root.style.setProperty('--d-story', story.toFixed(4));
    root.style.setProperty('--d-final', final.toFixed(4));
    root.style.setProperty('--d-mx', renderedMouseX.toFixed(3));
    root.style.setProperty('--d-my', renderedMouseY.toFixed(3));

    if (soundEnabled && progress > 0.76) {
      video.volume = 0.72 * (1 - range(progress, 0.76, 0.98));
    }

    const scene = progress < 0.33 ? '01' : progress < 0.7 ? '02' : '03';
    if (currentScene.textContent !== scene) currentScene.textContent = scene;

    if (embeddedPlaying && progress >= 1) {
      embeddedPlaying = false;
      document.body.classList.add('embedded-complete');
    }

    if (
      embeddedPlaying ||
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
    if (reduceMotion.matches || embeddedBrowser) return;
    mouseX = ((event.clientX / window.innerWidth) - 0.5) * 2;
    mouseY = ((event.clientY / window.innerHeight) - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(render);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else video.play().catch(() => document.body.classList.add('video-fallback'));
  });

  video.addEventListener('playing', () => document.body.classList.remove('video-fallback'));
  video.addEventListener('error', () => document.body.classList.add('video-fallback'));

  if (window.location.hash && window.location.hash !== '#hero') {
    const deepLinkTarget = document.getElementById(window.location.hash.slice(1));
    startSilently(false);
    if (deepLinkTarget) {
      const landOnDeepLink = () => jumpToElement(deepLinkTarget);
      requestAnimationFrame(landOnDeepLink);
      if (document.readyState !== 'complete') {
        window.addEventListener('load', landOnDeepLink, { once: true });
      }
    }
  } else {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    jumpToExperienceStart();
  }
  readScroll();
})();
