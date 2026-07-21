# QR Menu Guide

*by [dumbuk12](https://github.com/dumbuk12) · [MIT licensed](./LICENSE)*

A minimal, fast, no-database QR code restaurant menu — one JS file for your
menu content, one HTML file for the page, deployed as a single Cloudflare
Worker. No CMS, no build step, no monthly hosting bill.

This started as a real project (a restaurant's live QR menu) and was
generalized into a template + step-by-step guide after the fact, so every
step below has actually been run, not just described.

**What you get:**
- A single-page menu site with categories, sticky nav, prices, descriptions, optional photos
- Accessible by default (44px tap targets, proper contrast, keyboard-navigable) — see [Accessibility](#accessibility)
- One command to publish: commits to GitHub *and* deploys to Cloudflare
- Free hosting on Cloudflare Workers (generous free tier, no cold starts)
- Optional swipeable photo slider — see [Optional: photo slider](#optional-photo-slider)

## Quick start

**Prerequisites:** a [Cloudflare account](https://dash.cloudflare.com/sign-up) (free), [Node.js](https://nodejs.org/), and `git`.

```bash
git clone https://github.com/<your-username>/qr-menu-guide.git my-menu
cd my-menu
npm install
npx wrangler login       # opens a browser to connect your Cloudflare account
```

Edit `menu-data.js` with your own restaurant name and items (see below), then:

```bash
npm run deploy
```

You'll get a URL like `https://qr-menu-guide.<your-subdomain>.workers.dev` —
open it, and that's your live menu. Generate a QR code pointing at that URL
(any QR generator works) and you're done.

## Project structure

```
menu-data.js       ← THE MENU. Edit this to change items, prices, categories.
public/
  index.html       ← the page: layout, styling, and the JS that renders menu-data.js
  images/          ← your logo + item photos go here
src/worker.js       ← tiny Cloudflare Worker: serves /api/menu as JSON, everything else as static files
wrangler.jsonc      ← Cloudflare config
scripts/
  publish.mjs        ← one-command commit + push + deploy
  prepare-photo.py    ← auto-crop/center a product photo into a square thumbnail
```

You will almost never touch `src/worker.js` or `wrangler.jsonc` — day to day,
you're only editing `menu-data.js` and dropping images into `public/images/`.

## Customizing the menu

Everything lives in `menu-data.js`:

```js
export const menu = {
  "restaurant": "Your Restaurant Name",
  "tagline": "A short tagline goes here",
  "logo": "/images/logo.png",
  "currency": "$",
  "categories": [
    {
      "name": "Starters",
      "note": "Optional subtitle shown under the category title",
      "items": [
        {
          "name": "Bruschetta",
          "price": 8,
          "image": "/images/bruschetta.jpg",   // optional
          "desc": "Grilled bread, tomato, garlic, basil"  // optional
        }
      ]
    }
  ]
};
```

- Category order in the array = category order on the page and in the sticky nav.
- `image` and `desc` are both optional per item — plenty of real menus mix items
  with and without photos, and the layout handles both cleanly.
- Want a "Favorites" or "Chef's Picks" section? Just add it as a category —
  it's fine for the same item to appear in two categories (e.g. once in
  Favorites, once in its normal section); there's nothing special about it,
  the renderer treats every category identically.

## Photos

Item photos are square thumbnails, `object-fit: cover`. **Bad crops are the
#1 thing that makes a menu look unpolished** — the most common failure mode
is a product shot with a lot of dead background around it, which then reads
as "tiny" once you crop it to a square.

`scripts/prepare-photo.py` automates centering: it detects the subject
against a roughly flat/plain background and crops a padded square around it,
instead of a blind center-crop.

```bash
pip install pillow numpy
python scripts/prepare-photo.py ~/Downloads/my-photo.jpg public/images/bruschetta.jpg
```

For photos with a busy/non-flat background (e.g. a plated dish on a wood
table), the script falls back to a plain center-crop — check the result and
adjust framing by hand if needed, or pass `--padding` to tune how tight the
crop is.

## Theming

Every color is a CSS variable at the top of `public/index.html`:

```css
:root {
  --olive-deep: #343c17;   /* page background */
  --olive: #4b5626;        /* item photo placeholder background */
  --cream: #f2eedd;        /* primary text */
  --cream-soft: #c9c8ad;   /* secondary text */
  --gold: #cfa75e;         /* accent: prices, active states, focus rings */
  --line: #64703a;         /* hairlines / dividers */
}
```

Change these 6 values (plus the two `--display`/`--body` font stacks a few
lines below) to reskin the entire page. If you change colors, re-check
contrast — [WebAIM's contrast checker](https://webaim.org/resources/contrastchecker/)
is a fast way to confirm text still reads at 4.5:1 against your new background.

## Publishing

```bash
npm run publish
```

This one command:
1. Regenerates the fallback data embedded in `index.html` (see note below)
2. Commits every changed file and pushes to GitHub
3. Deploys to Cloudflare (`wrangler deploy`)

Give it a commit message if you want: `npm run publish -- "added dessert menu"`.

To redeploy without committing (e.g. retry a failed deploy): `npm run deploy`.

**Why "regenerate the fallback data" matters:** `index.html` embeds a copy of
your menu as a JS object (`window.__FALLBACK__`), shown only if the page's
`fetch("/api/menu")` call fails for some reason. It's easy to edit
`menu-data.js`, deploy, and forget this copy exists — it'll go stale
silently, and you won't notice until the one time the live fetch fails and a
customer sees last month's menu. `npm run publish` regenerates it
automatically every time so this can't happen. (This is a real bug we hit
building the original version of this project — worth avoiding.)

## Accessibility

A few things that are easy to get wrong on a mobile-first single page like
this, all already fixed in the template:

- **Tap targets ≥44×44px.** The category nav pills are sized with
  `min-height: 44px`, not just padding around small text — a common mistake
  that looks fine on desktop but is hard to tap accurately on a phone.
- **Contrast.** The default palette is checked against WCAG AA (body text
  ~10:1, secondary text ~6.8:1, gold accent ~5.2:1 against the background —
  all comfortably above the 4.5:1 minimum for normal text).
- **`alt` text.** Item thumbnails use the item name; if you add other images
  (like the optional slider below), give each one distinct, descriptive alt
  text — not the same generic string repeated on every image.
- **`loading="lazy"` only below the fold.** Anything visible on first paint
  (your logo, a hero image) should load eagerly; lazy-loading it delays what
  the visitor sees first.
- **No gesture-only interactions.** If you add anything swipeable (see the
  slider below), give it a visible clickable control too — not everyone
  previewing your menu is on a touchscreen.

## Optional: photo slider

A single-photo-at-a-time swipeable slider (like a mini hero carousel) is a
nice touch for a handful of standout dishes. It's left out of the base
template because it needs real photos to not look broken — add it once you
have images ready.

**1. Add this CSS** inside the `<style>` block in `public/index.html`, right before `</style>`:

```css
.featured { margin-top: 1.5rem; padding: 0 1.25rem; }
.featured-viewport { position: relative; max-width: 640px; margin: 0 auto; }
.featured-track {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  scrollbar-width: none; border-radius: 18px;
}
.featured-track::-webkit-scrollbar { display: none; }
.featured-slide {
  position: relative; flex: 0 0 100%; width: 100%; aspect-ratio: 4 / 3;
  overflow: hidden; border-radius: 18px;
  scroll-snap-align: start; scroll-snap-stop: always;
}
.featured-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
.featured-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.45); color: var(--cream); font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.featured-arrow:hover { background: rgba(0,0,0,0.65); }
.featured-arrow:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.featured-arrow-prev { left: 0.6rem; }
.featured-arrow-next { right: 0.6rem; }
.featured-dots { display: flex; justify-content: center; gap: 0.2rem; margin-top: 0.5rem; }
.featured-dots button {
  width: 32px; height: 32px; padding: 0; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.featured-dots button::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: var(--line); transition: background 0.15s, transform 0.15s;
}
.featured-dots button.active::before { background: var(--gold); transform: scale(1.3); }
.featured-dots button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 50%; }
```

**2. Add this markup** right after `<div class="rule"></div>` and before `<nav ...>`:

```html
<section class="featured" aria-label="Photo highlights">
  <div class="featured-viewport">
    <div class="featured-track" id="featured-track">
      <!-- First image: no loading="lazy" — it's above the fold -->
      <div class="featured-slide"><img src="/images/slide-1.jpg" alt="Describe this photo specifically" /></div>
      <div class="featured-slide"><img src="/images/slide-2.jpg" alt="Describe this photo specifically" loading="lazy" /></div>
      <div class="featured-slide"><img src="/images/slide-3.jpg" alt="Describe this photo specifically" loading="lazy" /></div>
    </div>
    <button class="featured-arrow featured-arrow-prev" id="featured-prev" aria-label="Previous photo">‹</button>
    <button class="featured-arrow featured-arrow-next" id="featured-next" aria-label="Next photo">›</button>
  </div>
  <div class="featured-dots" id="featured-dots">
    <button class="active" aria-label="Photo 1"></button>
    <button aria-label="Photo 2"></button>
    <button aria-label="Photo 3"></button>
  </div>
</section>
```

Add/remove `.featured-slide` blocks and matching dot `<button>`s together — the counts must match.

**3. Add this JS** right before `load();` at the end of the `<script>` block:

```js
const featuredTrack = document.getElementById("featured-track");
const featuredDots = document.getElementById("featured-dots");
const featuredPrev = document.getElementById("featured-prev");
const featuredNext = document.getElementById("featured-next");
if (featuredTrack && featuredDots) {
  const dots = [...featuredDots.children];
  const slides = [...featuredTrack.children];
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const i = slides.indexOf(entry.target);
          dots.forEach((d, di) => d.classList.toggle("active", di === i));
        }
      }
    },
    { root: featuredTrack, threshold: 0.6 }
  );
  slides.forEach((s) => io.observe(s));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () =>
      slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })
    );
  });
  const currentIndex = () => Math.round(featuredTrack.scrollLeft / featuredTrack.clientWidth);
  featuredPrev?.addEventListener("click", () => {
    const i = Math.max(0, currentIndex() - 1);
    slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  });
  featuredNext?.addEventListener("click", () => {
    const i = Math.min(slides.length - 1, currentIndex() + 1);
    slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  });
}
```

Note the two things this avoids that are easy to get wrong on a first pass:
the **first** slide has no `loading="lazy"` (it's the hero image, above the
fold), and there are **clickable arrows and dots**, not just swipe/scroll —
a gesture-only carousel is unusable for anyone without a touchscreen or
trackpad.

## Custom domain

By default you get `<name>.<subdomain>.workers.dev`. To use your own domain,
add it in the Cloudflare dashboard under your Worker's *Settings → Domains &
Routes*, then point your QR code at the custom domain instead — that way
printed QR codes never go stale even if you change hosting later.

## License

Copyright (c) 2026 [dumbuk12](https://github.com/dumbuk12) — [MIT](./LICENSE).
Use this for your own menu, fork it, strip the guide out and keep just the
code, whatever's useful — just keep the copyright notice per the MIT terms.
