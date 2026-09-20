(function(){
  function getParam(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  async function callApi(body) {
    const res = await fetch('/api/confirm-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'API error');
    return data;
  }

  function renderStatus(name, status) {
    const overlay = document.getElementById('statusOverlay');
    const buttons = document.querySelector('.buttons');
    if (!overlay) return;
    let text = '';
    if (status.confirmed === true) text = `${name} se viene`;
    else if (status.confirmed === false) text = `${name} no se viene`;
    else if (status.pending === true) text = `${name} no sabe`;
    else text = '';
    if (text) {
      overlay.textContent = text;
      overlay.style.display = 'flex';
      if (buttons) buttons.style.display = 'none';
    } else {
      overlay.style.display = 'none';
      if (buttons) buttons.style.display = 'flex';
    }
  }

  // Expose functions for other scripts to reuse
  window.confirmNameApi = { renderStatus, confirmName };

  async function confirmName(name, payload, label){
    try {
      const data = await callApi({ name, ...payload });
      if (data.exists === false) {
        window.location = "https://youtu.be/pc0mxOXbWIU?si=yoy0WqI5nB9-cmhx";
        return data;
      }
      // updated might be array or row
      const row = data?.updated?.[0] || data?.row || (Array.isArray(data?.updated) ? data.updated[0] : undefined);
      const status = row ? { confirmed: row.confirmed, pending: row.pending } : (data.row ? { confirmed: data.row.confirmed, pending: data.row.pending } : {});
      if (status) renderStatus(name, status);
      if (label && row) {
        // show brief toast
        console.log(label + ': ' + name);
      }
      return data;
    } catch (err) {
      console.error(err);
      alert('Error confirming name');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const btnYes = document.getElementById('btnYes');
    const btnSorry = document.getElementById('btnSorry');
    const btnNo = document.getElementById('btnNo');
    function guardAndRun(button, name, payload, label) {
      if(!button) return;
      button.addEventListener('click', function(){
        if(!name){
          alert('No name parameter found in URL');
          return;
        }
        button.disabled = true;
        const prev = button.textContent;
        button.textContent = 'Sending...';
        confirmName(name, payload, label).finally(()=>{ button.disabled=false; button.textContent=prev; });
      });
    }

    const name = getParam('name');

    guardAndRun(btnYes, name, { confirmed: true }, 'YES!');
    guardAndRun(btnSorry, name, { pending: true }, 'SORRY');
    guardAndRun(btnNo, name, { confirmed: false }, 'NOP');
  });
})();
