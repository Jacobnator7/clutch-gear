/**
 * Clutch Gear — static affiliate storefront
 *
 * Amazon Associates: set AFFILIATE_TAG to your tag (e.g. 'clutchgear-20').
 * When empty, outbound links use the clean retailer_url (/dp/ASIN) with no tag.
 */
const AFFILIATE_TAG = 'clutchgear-20';

/**
 * Optional privacy-friendly click endpoint.
 * Example: 'https://clutch-gear.goatcounter.com/count' or leave empty.
 * Payload is only { id: productId } — no cookies, no personal data.
 */
const CLICK_ENDPOINT = '';

const CATEGORY_LABELS = {
  mice: 'Mice',
  keyboards: 'Keyboards',
  headsets: 'Headsets',
  controllers: 'Controllers',
  mousepads: 'Mousepads',
  streaming: 'Streaming'
};

function buildOutboundUrl(product) {
  const asin = product.asin;
  if (asin) {
    const base = `https://www.amazon.com/dp/${asin}`;
    if (AFFILIATE_TAG && AFFILIATE_TAG.trim()) {
      return `${base}?tag=${encodeURIComponent(AFFILIATE_TAG.trim())}`;
    }
    return base;
  }
  return product.retailer_url;
}

function formatPrice(product) {
  if (product.price == null || Number.isNaN(Number(product.price))) {
    return { text: 'See price on Amazon', pending: true };
  }
  const currency = product.currency || 'USD';
  try {
    return {
      text: new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(product.price),
      pending: false
    };
  } catch {
    return { text: `$${Number(product.price).toFixed(2)}`, pending: false };
  }
}

function formatPriceAsOf(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
    return `Price as of ${d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/New_York'
    })}`;
  } catch {
    return `Price as of ${iso}`;
  }
}

function trackClick(productId) {
  if (!CLICK_ENDPOINT) return;
  const body = JSON.stringify({ id: productId });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(CLICK_ENDPOINT, blob);
      return;
    }
  } catch (_) {
    /* fall through */
  }
  fetch(CLICK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    mode: 'no-cors'
  }).catch(() => {});
}

function createCard(product) {
  const price = formatPrice(product);
  const asOf = formatPriceAsOf(product.price_as_of);
  const href = buildOutboundUrl(product);
  const retailer = product.retailer || 'Amazon';
  const cat = CATEGORY_LABELS[product.category] || product.category;

  const article = document.createElement('article');
  article.className = 'card';
  article.dataset.category = product.category;
  article.dataset.id = product.id;

  article.innerHTML = `
    <div class="card-media">
      <img src="${product.image}" alt="${escapeAttr(product.name)}" loading="eager" width="400" height="400" />
    </div>
    <div class="card-body">
      <p class="card-cat">${escapeHtml(cat)}</p>
      <h3>${escapeHtml(product.name)}</h3>
      <p class="card-brand">${escapeHtml(product.brand || '')}</p>
      <p class="card-blurb">${escapeHtml(product.short_blurb || '')}</p>
      <p class="card-price${price.pending ? ' is-pending' : ''}">${escapeHtml(price.text)}</p>
      ${asOf ? `<p class="price-as-of">${escapeHtml(asOf)}</p>` : ''}
      <a class="cta" href="${escapeAttr(href)}" target="_blank" rel="sponsored noopener noreferrer" data-product-id="${escapeAttr(product.id)}">
        Check price at ${escapeHtml(retailer)}
      </a>
    </div>
  `;

  const link = article.querySelector('.cta');
  link.addEventListener('click', () => trackClick(product.id));

  return article;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function setActiveFilter(category) {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const active = btn.dataset.category === category;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  let visible = 0;
  document.querySelectorAll('.card').forEach((card) => {
    const show = category === 'all' || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible += 1;
  });

  const status = document.getElementById('status');
  status.textContent = visible ? `${visible} product${visible === 1 ? '' : 's'}` : 'No products in this category.';
}

async function init() {
  const grid = document.getElementById('product-grid');
  const status = document.getElementById('status');

  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();
    if (!Array.isArray(products)) throw new Error('products.json must be an array');

    grid.innerHTML = '';
    products.forEach((p) => grid.appendChild(createCard(p)));
    status.textContent = `${products.length} products`;

    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => setActiveFilter(btn.dataset.category));
    });
  } catch (err) {
    console.error(err);
    status.textContent = 'Could not load products.json.';
  }
}

document.addEventListener('DOMContentLoaded', init);
