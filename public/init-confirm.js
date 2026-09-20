// initializer: decides whether to show status overlay or the buttons
(function(){
  function getParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  async function fetchStatus(name){
    const res = await fetch('/api/get-confirm-name?name=' + encodeURIComponent(name));
    if (!res.ok) {
      console.error('GET /api/get-confirm-name failed', await res.text());
      return null;
    }
    return res.json();
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const name = getParam('name');
    const overlay = document.getElementById('statusOverlay');
    const buttons = document.querySelector('.buttons');
    if (!name) {
      if (buttons) buttons.style.display = 'flex';
      return;
    }

    try {
      const data = await fetchStatus(name);
      if (data && data.exists && data.row) {
        if (window.confirmNameApi && typeof window.confirmNameApi.renderStatus === 'function') {
          window.confirmNameApi.renderStatus(name, { confirmed: data.row.confirmed, pending: data.row.pending });
        } else {
          // fallback: render directly
          let text = '';
          if (data.row.confirmed === true) text = `${name} se viene`;
          else if (data.row.confirmed === false) text = `${name} no se viene`;
          else if (data.row.pending === true) text = `${name} no sabe`;
          if (text && overlay) {
            overlay.textContent = text;
              overlay.style.display = 'flex';
              if (buttons) buttons.style.display = 'none';
          }
        }
      } else {
        if (overlay) overlay.style.display = 'none';
        if (buttons) buttons.style.display = 'flex';
      }
    } catch (err) {
      console.error(err);
      if (buttons) buttons.style.display = 'flex';
    }
  });
})();
