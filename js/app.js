/* ============================================
   Olivo di Sant'Emiliano — Product Engine
   Fetches products.json and renders all product UI
   ============================================ */

const ICONS = {
  shield:   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  drop:     '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  star:     '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  code:     '<path d="M7 17l-4-4 4-4M17 7l4 4-4 4M14 3l-4 18"/>',
  clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  home:     '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  arrow:    '<path d="M5 12h14M12 5l7 7-7 7"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
};

/* Escape HTML special chars before inserting into innerHTML */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconSVG(name) {
  return `<svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:var(--green);fill:none;stroke-width:1.6;flex-shrink:0">${ICONS[name] || ''}</svg>`;
}

/* ---- Build a product card HTML string ---- */
function cardHTML(p) {
  const badge = p.badge
    ? `<span class="product-card__badge${p.badgeType === 'gold' ? ' product-card__badge--gold' : ''}">${esc(p.badge)}</span>`
    : '';
  return `
    <div class="product-card" data-price="${p.price}" data-index="${p.sortIndex}">
      <div class="product-card__img-wrap">
        <a href="product.html?id=${p.id}">
          <img class="product-card__img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
        </a>
        ${badge}
      </div>
      <div class="product-card__body">
        <div class="product-card__category">${esc(p.category)}</div>
        <a href="product.html?id=${p.id}" class="product-card__name">${esc(p.name)}</a>
        <p class="product-card__desc">${esc(p.descShort)}</p>
        <div class="product-card__footer">
          <div class="product-card__price">$${p.price} <span>/ ${esc(p.size)}</span></div>
          <button class="btn btn--primary add-to-cart"
            data-name="${esc(p.name)}"
            data-price="${p.price}"
            data-size="${esc(p.size)}"
            data-img="${esc(p.imageThumb)}">${esc(p.buttonText || 'Add to Cart')}</button>
        </div>
      </div>
    </div>`;
}

/* ---- Shop page ---- */
function renderShop(products) {
  const grid  = document.querySelector('.shop-grid');
  const count = document.querySelector('.shop-count');
  if (!grid) return;
  grid.innerHTML = products.map(cardHTML).join('');
  if (count) count.textContent = `Showing ${products.length} products`;
}

/* ---- Homepage featured products ---- */
function renderFeatured(products) {
  const grid = document.querySelector('.products__grid');
  if (!grid) return;
  grid.innerHTML = products.filter(p => p.featured).map(cardHTML).join('');
}

/* ---- Single product detail page ---- */
function renderProductDetail(products) {
  const id = new URLSearchParams(location.search).get('id');
  const p  = products.find(p => p.id === id);

  if (!p) {
    const section = document.querySelector('.product-detail');
    if (section) section.innerHTML = `
      <div class="container" style="padding:80px 0;text-align:center">
        <p style="color:var(--text-muted);font-size:1.1rem;margin-bottom:24px">Product not found.</p>
        <a href="shop.html" class="btn btn--primary">Back to Shop</a>
      </div>`;
    document.querySelector('.product-highlights')?.remove();
    return;
  }

  document.title = `${p.name} — Olivo di Sant'Emiliano`;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  /* Core info */
  set('pd-category', p.category);
  set('pd-name', p.name);

  /* Variants */
  const firstVariant = (p.variants && p.variants[0]) || { size: p.size, price: p.price };
  setHTML('pd-price', `$${firstVariant.price} <span>/ ${esc(firstVariant.size)}</span>`);
  if (p.variants && p.variants.length) {
    setHTML('pd-variants', `
      <div class="product-variants__label">Size</div>
      <div class="product-variants__options">
        ${p.variants.map((v, i) => `
          <button class="variant-btn${i === 0 ? ' active' : ''}"
            data-size="${esc(v.size)}" data-price="${v.price}">
            ${esc(v.size)}<span>$${v.price}</span>
          </button>`).join('')}
      </div>`);
  }

  set('pd-desc', p.descLong);

  /* Image */
  const img = document.getElementById('pd-image');
  if (img) { img.src = p.imageLg; img.alt = p.name; }

  /* Add to Cart button */
  const addBtn = document.getElementById('pd-add-cart');
  if (addBtn) {
    addBtn.textContent   = p.buttonText || 'Add to Cart';
    addBtn.dataset.name  = p.name;
    addBtn.dataset.price = firstVariant.price;
    addBtn.dataset.size  = firstVariant.size;
    addBtn.dataset.img   = p.imageThumb;
  }

  /* Buy Now button */
  const buyBtn = document.getElementById('pd-buy-now');
  if (buyBtn) buyBtn.dataset.price = firstVariant.price;

  /* Specs */
  setHTML('pd-specs', p.specs.map(s => `
    <div class="product-specs__item">
      <span class="product-specs__label">${esc(s.label)}</span>
      <span class="product-specs__value">${esc(s.value)}</span>
    </div>`).join(''));

  /* Highlights */
  set('pd-hl-label', p.highlightsLabel);
  set('pd-hl-title', p.highlightsTitle);
  setHTML('pd-hl-grid', p.highlights.map(h => `
    <div class="highlight-card">
      <div class="highlight-card__icon">${iconSVG(h.icon)}</div>
      <div class="highlight-card__label">${esc(h.label)}</div>
      <div class="highlight-card__title">${esc(h.title)}</div>
      <p class="highlight-card__text">${esc(h.text)}</p>
    </div>`).join(''));
}

/* ---- Variant selection on product detail page ---- */
document.addEventListener('click', e => {
  const btn = e.target.closest('.variant-btn');
  if (!btn) return;
  btn.closest('.product-variants__options').querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const price = btn.dataset.price;
  const size  = btn.dataset.size;
  const priceEl = document.getElementById('pd-price');
  if (priceEl) priceEl.innerHTML = `$${price} <span>/ ${esc(size)}</span>`;
  const addBtn = document.getElementById('pd-add-cart');
  if (addBtn) { addBtn.dataset.price = price; addBtn.dataset.size = size; }
  const buyBtn = document.getElementById('pd-buy-now');
  if (buyBtn) buyBtn.dataset.price = price;
});

/* ---- Bootstrap ---- */
(async () => {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    const page = location.pathname.split('/').pop() || 'index.html';
    if (page === '' || page === 'index.html') renderFeatured(products);
    else if (page === 'shop.html')            renderShop(products);
    else if (page === 'product.html')         renderProductDetail(products);
  } catch (e) {
    console.error('app.js: could not load products.json —', e.message);
  }
})();
