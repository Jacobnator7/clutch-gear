# Clutch Gear

A static storefront for popular gaming accessories — mice, keyboards, headsets, controllers, mouse pads, and streaming gear.

**Live site:** [https://jacobnator7.github.io/clutch-gear/](https://jacobnator7.github.io/clutch-gear/)

The catalog is a plain HTML, CSS, and JavaScript site. There is no checkout, no carts, and no payments on this site. Every product links out to Amazon.

Prices are refreshed daily and shown with a published **price as of** date. Amazon sets the price and the stock, and both can change, so confirm the current price on the Amazon page before you buy.

## Affiliate disclosure

As an Amazon Associate, Clutch Gear earns from qualifying purchases.

## Catalog

The live catalog is in [`products.json`](products.json). Categories:

- **Mice** — wireless and wired gaming mice
- **Keyboards** — mechanical and rapid-trigger gaming keyboards
- **Headsets** — wired and wireless gaming headsets
- **Controllers** — Xbox, PlayStation, and PC controllers
- **Mouse pads** — cloth gaming pads
- **Streaming** — Stream Deck controllers, webcams, and microphones

Outbound Amazon links use the Associates tag `clutchgear-20`. When a live price cannot be read, the card shows **See price on Amazon** instead of a guessed number. The site does not invent discounts, fake scarcity, or fake reviews.

## How prices are kept current

A daily refresh reads each product's listed Amazon price and stock, then writes them into `products.json` with a `price_as_of` timestamp. Pushing that file to `main` deploys through GitHub Pages.

If a real price cannot be confirmed, `price` and `price_as_of` are set to `null`. Prices are never guessed.

## Local preview

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`.

## Site structure

```
clutch-gear/
  index.html      # page shell, disclosure, filter tabs, grid mount
  styles.css      # dark gamer theme
  app.js          # load products, filters, Amazon link builder, click hook
  products.json   # catalog
  img/            # local product images (referenced by products.json)
  README.md
  preview.png     # optional local screenshot
  .nojekyll       # disable Jekyll on GitHub Pages
  .github/workflows/pages.yml
```

## Config (`app.js`)

- `AFFILIATE_TAG` — Amazon Associates tag. Currently `clutchgear-20`.
  - Empty → outbound URL is `https://www.amazon.com/dp/<ASIN>`
  - Set → `https://www.amazon.com/dp/<ASIN>?tag=<AFFILIATE_TAG>`
- `CLICK_ENDPOINT` — optional privacy-friendly click counter URL. Empty = no network call.
  - Hook POSTs JSON `{ "id": "<product-id>" }` only (no cookies, no personal data).
  - Options for static hosts: [GoatCounter](https://www.goatcounter.com/) (free, privacy-first), [Plausible](https://plausible.io/) custom events, or a tiny Cloudflare Worker / Netlify function that increments a counter.

## `products.json` schema

| Field | Notes |
| --- | --- |
| `id` | slug |
| `name`, `category`, `brand` | category one of mice / keyboards / headsets / controllers / mousepads / streaming |
| `asin` | Amazon ASIN |
| `image` | local path under `img/` |
| `image_source` | original remote URL used to download the local copy |
| `retailer` | `Amazon` for this catalog |
| `retailer_url` | clean `https://www.amazon.com/dp/<ASIN>` |
| `affiliate_url` | always `null` here; links are built in `app.js` |
| `price` | number or `null` if Amazon blocked the price read |
| `currency` | e.g. `USD` |
| `price_as_of` | ISO timestamp when the price was read, or `null` with `price` |
| `short_blurb` | factual, from retailer / manufacturer copy |
| `in_stock` | bool |

## Adding or updating a product

1. Pick a popular in-stock model and get the ASIN from the Amazon product URL (`/dp/ASIN`).
2. Open `https://www.amazon.com/dp/<ASIN>` in a normal browser (Amazon often blocks bots).
3. Record the listed price and stock. If you cannot read a real price, set `"price": null` and `"price_as_of": null` — never guess.
4. Download a product image from Amazon or the manufacturer CDN into `img/`, set `image` to the local path and `image_source` to the remote URL.
5. Write a short factual blurb from the page (no hype, fake reviews, or invented discounts).
6. Append or edit the object in `products.json`. Keep `affiliate_url` null.
7. Serve locally and confirm the card renders.

## GitHub Pages

Pushing to `main` deploys the repo root via `.github/workflows/pages.yml`.

Site URL: [https://jacobnator7.github.io/clutch-gear/](https://jacobnator7.github.io/clutch-gear/)

Asset paths are relative (`styles.css`, `app.js`, `products.json`, `img/...`) so the site works under that project base path. `.nojekyll` disables Jekyll processing.
