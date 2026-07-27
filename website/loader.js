// Site Loader Logic
document.body.classList.add('loading');
const loaderEl = document.getElementById('site-loader');

function hideLoader() {
  if (loaderEl) {
    loaderEl.style.opacity = '0';
    setTimeout(() => {
      loaderEl.style.display = 'none';
      document.body.classList.remove('loading');
    }, 500);
  }
}

// Fallback to hide loader after 6 seconds max
setTimeout(hideLoader, 6000);
