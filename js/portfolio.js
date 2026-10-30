// portfolio.js - category filter and project detail dialog.
export function initPortfolio() {
  const filters = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('#portfolio-grid .project');
  const empty = document.getElementById('portfolio-empty');
  const dialog = document.getElementById('project-dialog');

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const wanted = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      items.forEach((item) => {
        const match = wanted === 'all' || item.dataset.category === wanted;
        item.hidden = !match;
        if (match) shown += 1;
      });
      empty.hidden = shown > 0;
    });
  });

  const set = (id, text) => {
    document.getElementById(id).textContent = text;
  };
  document.querySelectorAll('.project-open').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      const dialogImg = document.getElementById('pd-img');
      dialogImg.src = img.src;
      dialogImg.alt = img.alt;
      set('pd-cat', btn.dataset.categoryLabel);
      set('pd-title', btn.dataset.title);
      set('pd-intent', btn.dataset.intent);
      set('pd-materials', btn.dataset.materials);
      dialog.showModal();
    });
  });

  document.getElementById('pd-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // click on the backdrop
  });
}
