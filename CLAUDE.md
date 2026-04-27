# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for **Olivo di Sant'Emiliano**, an artisan olive oil brand from Umbria, Italy. No build step — files are served directly. Hosted on GitHub Pages at `https://francescopalmadev.github.io/olivo-di-sant-emiliano-website/` from the `master` branch.

## No Build Step

There is no package.json, bundler, or build tool. To "deploy", commit and push to `master` — GitHub Pages serves the files directly. To preview locally, use a local HTTP server (e.g. `npx serve .` or VS Code Live Server) — `fetch('products.json')` fails on `file://` protocol.

## Architecture

### Data layer — `products.json`
Single source of truth for all product data. Each product object contains:
- `id` — used as URL param (`product.html?id=classico`)
- `variants` — array of `{size, price}` for the volume selector on the product page
- `featured: true/false` — controls homepage appearance
- `specs`, `highlights` — rendered on the product detail page

### JS — two files, clear separation
- **`js/main.js`** — UI interactions only: nav scroll/shrink, mobile menu, cart sidebar, add-to-cart event delegation, qty controls, toast, shop sort, Buy Now redirect
- **`js/app.js`** — data layer: fetches `products.json`, routes by page filename, renders product cards (`renderFeatured`, `renderShop`, `renderProductDetail`, `renderRecommended`)

Both scripts are loaded at the bottom of every page's `<body>`.

### Routing
No router — page identity is detected in `app.js` via `location.pathname.split('/').pop()`. Product detail pages are a single template (`product.html`) populated via `?id=` query param.

### Cart
Client-side only (`cartData` array in `main.js`). Not persisted across page loads. Checkout redirects to a PayPal.me URL — the placeholder `YOUR_PAYPAL_ME` in `main.js` must be replaced with the real username before launch.

### CSS
Single file `css/style.css`. No preprocessor. Uses CSS custom properties defined at `:root`. Key variables: `--green`, `--gold`, `--cream`, `--font-serif`, `--font-sans`, `--max-w`, `--shadow`.

## Key Conventions

- **HTML escaping**: always use the `esc()` helper in `app.js` before inserting user/JSON data into `innerHTML`
- **Event delegation**: all dynamic buttons (`.add-to-cart`, `.buy-now`, `.variant-btn`, `.qty-minus/.qty-plus`) use `document.addEventListener('click', ...)` — never inline `onclick`
- **Adding a product**: add an object to `products.json` following the existing schema; the shop, homepage, and recommended section update automatically
- **`featured: true`** makes a product appear in the homepage "Our Products" section
- **Recommended section** on `product.html` shows all products except the currently viewed one; hidden automatically when only one product exists
