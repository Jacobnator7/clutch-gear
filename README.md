# Clutch Gear — static affiliate storefront

Plain HTML / CSS / vanilla JS. No framework, no build step.

## Structure

```
clutch-gear/
  index.html      # page shell, disclosure, filter tabs, grid mount
  styles.css      # dark gamer theme
  app.js          # load products, filters, Amazon link builder, click hook
  products.json   # catalog seed
  img/            # local product images (referenced by products.json)
  README.md
  preview.png     # optional local screenshot
```

## Config (`app.js`)

- `AFFILIATE_TAG` — Amazon Associates tag (e.g. `yoursite-20`). Leave `''` until Jacob sets one.
  - Empty → outbound URL is `https://www.amazon.com/dp/<ASIN>`
  - Set → `https://www.amazon.com/dp/<ASIN>?tag=<AFFILIATE_TAG>`
- `CLICK_ENDPOINT` — optional privacy-friendly click counter URL. Empty = no network call.
  - Hook POSTs JSON `{ "id": "<product-id>" }` only (no cookies, no personal data).
  - Options for static hosts: [GoatCounter](https://www.goatcounter.com/) (free, privacy-first), [Plausible](https://plausible.io/) custom events, a tiny Cloudflare Worker / Netlify function that increments a counter.

## `products.json` schema

| Field | Notes |
| --- | --- |
| `id` | slug |
| `name`, `category`, `brand` | category one of mice / keyboards / headsets / controllers / mousepads / streaming |
| `asin` | Amazon ASIN |
| `image` | local path under `img/` |
| `image_source` | original remote URL used to download the local copy |
| `retailer` | always `Amazon` for this seed |
| `retailer_url` | clean `https://www.amazon.com/dp/<ASIN>` |
| `affiliate_url` | always `null` here; links are built in `app.js` |
| `price` | number or `null` if Amazon blocked the price read |
| `currency` | e.g. `USD` |
| `price_as_of` | ISO date when price was read, or `null` with `price` |
| `short_blurb` | factual, from retailer / manufacturer copy |
| `in_stock` | bool |

When `price` is `null`, the card shows **See price on Amazon** instead of a dollar amount.

## Refresh products

1. Pick popular in-stock models; get the ASIN from the Amazon product URL (`/dp/ASIN`).
2. Open `https://www.amazon.com/dp/<ASIN>` in a normal browser (Amazon often blocks bots).
3. Record the listed price and stock. If you cannot read a real price, set `"price": null` and `"price_as_of": null` — never guess.
4. Download a product image from Amazon or the manufacturer CDN into `img/`, set `image` to the local path and `image_source` to the remote URL.
5. Write a short factual blurb from the page (no hype, fake reviews, or invented discounts).
6. Append / edit the object in `products.json`. Keep `affiliate_url` null.
7. Serve locally and confirm cards render: `python3 -m http.server 8080` from this directory, then open `http://127.0.0.1:8080/`.

## Local preview

```bash
cd /workspace/clutch-gear
python3 -m http.server 8080
```

No deploy scripts are included on purpose.

## GitHub Pages

Pushing to `main` deploys the repo root via `.github/workflows/pages.yml`.
Site URL (project pages): `https://jacobnator7.github.io/clutch-gear/`

Asset paths are relative (`styles.css`, `app.js`, `products.json`, `img/...`) so the site works under that base path. `.nojekyll` disables Jekyll processing.
