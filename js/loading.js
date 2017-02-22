
let isLoading = false;
let loadingEl;

export default function setLoading (loading) {
  if (isLoading === loading) return;

  isLoading = loading;

  if (loading) {
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.className = 'loading-notification';
    }

    loadingEl.textContent = 'Loading...';
    document.body.appendChild(loadingEl);
    loadingEl.style.opacity = 1;
  } else {
    loadingEl.style.opacity = 0;
    setTimeout(() => {
      if (!isLoading) {
        document.body.removeChild(loadingEl);
      }
    }, 400);
  }
}
