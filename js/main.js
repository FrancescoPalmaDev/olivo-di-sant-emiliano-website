/* ============================================
   Olivo di Sant'Emiliano — Main JS
   ============================================ */

/* ---- Navbar scroll effect ---- */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- Mobile menu ---- */
const toggle = document.querySelector('.nav__toggle');
const mobileMenu = document.querySelector('.nav__mobile');
if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

/* ---- Cart ---- */
const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
function saveCart() { localStorage.setItem('cart', JSON.stringify(cartData)); }
const cartOverlay = document.querySelector('.cart-overlay');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartClose   = document.querySelector('.cart-close');
const cartCountEl = document.querySelector('.nav__cart-count');

function openCart() {
  cartOverlay && cartOverlay.classList.add('open');
  cartSidebar && cartSidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartOverlay && cartOverlay.classList.remove('open');
  cartSidebar && cartSidebar.classList.remove('open');
  document.body.style.overflow = '';
}

cartOverlay && cartOverlay.addEventListener('click', closeCart);
cartClose   && cartClose.addEventListener('click', closeCart);
document.querySelector('.nav__cart')?.addEventListener('click', openCart);

document.addEventListener('click', e => {
  if (e.target.closest('.cart-continue')) {
    closeCart();
    return;
  }
  if (e.target.closest('.cart-checkout')) {
    if (cartData.length === 0) return;
    const total = cartData.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);
    cartData.length = 0;
    saveCart();
    renderCart();
    updateCartCount();
    closeCart();
    window.location.href = `https://www.paypal.com/paypalme/YOUR_PAYPAL_ME/${total}USD`;
  }
});

function renderCart() {
  const body   = document.querySelector('.cart-sidebar__body');
  const footer = document.querySelector('.cart-sidebar__footer');
  if (!body) return;

  if (cartData.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:#ccc;fill:none;stroke-width:1.4;margin:0 auto 12px">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty.</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = '';
  body.innerHTML = cartData.map((item, i) => `
    <div class="cart-item">
      <img class="cart-item__img" src="${item.img}" alt="${item.name}">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__size">${item.size}</div>
        <div class="cart-item__controls">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>`).join('');

  const subtotalEl = document.querySelector('.cart-subtotal strong');
  if (subtotalEl) subtotalEl.textContent = `$${cartData.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}`;
}

window.changeQty = function(i, delta) {
  cartData[i].qty += delta;
  if (cartData[i].qty <= 0) cartData.splice(i, 1);
  saveCart();
  renderCart();
  updateCartCount();
};

function updateCartCount() {
  const total = cartData.reduce((s, i) => s + i.qty, 0);
  if (cartCountEl) {
    cartCountEl.textContent = total;
    cartCountEl.style.display = total > 0 ? 'flex' : 'none';
  }
}

function addToCart(name, price, size, img, qty = 1) {
  const existing = cartData.find(i => i.name === name && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cartData.push({ name, price, size, img, qty });
  }
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`${name} added to cart!`);
}

/* ---- Add to cart — event delegation ---- */
document.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  const qtyEl = document.getElementById('pd-qty-value');
  const qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;
  addToCart(
    btn.dataset.name,
    parseFloat(btn.dataset.price),
    btn.dataset.size,
    btn.dataset.img,
    qty
  );
});

/* ---- Toast ---- */
function showToast(msg) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- Shop sort ---- */
const sortSelect = document.getElementById('sort');
if (sortSelect) {
  const grid = document.querySelector('.shop-grid');
  sortSelect.addEventListener('change', () => {
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const val = sortSelect.value;
    cards.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price);
      const priceB = parseFloat(b.dataset.price);
      const idxA   = parseInt(a.dataset.index);
      const idxB   = parseInt(b.dataset.index);
      if (val === 'Price: Low to High') return priceA - priceB;
      if (val === 'Price: High to Low') return priceB - priceA;
      if (val === 'Newest')             return idxB - idxA;
      return idxA - idxB;
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

/* ---- Newsletter ---- */
document.querySelector('.newsletter__form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (!input.value.trim()) return;
  showToast('Thank you for subscribing!');
  input.value = '';
});

/* ---- Buy Now ---- */
document.addEventListener('click', e => {
  const btn = e.target.closest('.buy-now');
  if (!btn) return;
  const price = parseFloat(btn.dataset.price).toFixed(2);
  window.location.href = `https://www.paypal.com/paypalme/YOUR_PAYPAL_ME/${price}USD`;
});

/* ---- Init ---- */
updateCartCount();
renderCart();

/* ---- Active nav link ---- */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === page || (href === 'index.html' && page === 'index.html')) {
    a.classList.add('active');
  }
});
