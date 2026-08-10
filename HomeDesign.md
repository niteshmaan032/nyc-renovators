# Home Page Design Log

Record of the homepage build for **Royal Renovators Inc.** (nycrenovators.com rebuild).
Hand-written static site — `index.html`, `css/style.css`, `js/main.js`.

This is a structured summary of the work and the reasoning behind it, not a verbatim
transcript. Sessions: 2026-08-08 → 2026-08-09.

---

## 1. Header

| Change | Detail |
|---|---|
| Menu centred | `.primary-nav { margin-inline: auto }` — auto margins split the leftover row space evenly, giving **equal whitespace to the logo and to the call button**. Chosen deliberately over true page-centre, which looked right-heavy because the logo is narrow and the CTA is wide. |
| Divider removed | Was a `border-left` on `.primary-nav + .nav-bar__actions`, plus its `@media (max-width: 84rem)` override. Both deleted. |
| Social icon underline | `.socials a` was the **only** link in the file without `text-decoration: none`, so the browser default underline showed under each icon. Added. |
| Nav link colour | Navy → `var(--ink)` (black). Hover stays red. |

---

## 2. Hero

### Layout
- Two columns: copy left, capture form right.
  `grid-template-columns: minmax(0, 1fr) minmax(0, 26rem)`.
- **Stacks at ≤80rem (1280px)**, raised from 72rem. The higher breakpoint is what
  keeps "Queens Roofing Contractor" on a single line while the form sits beside it.
- Field grid collapses to one column at ≤36rem.

### Heading
Two-line lockup, both lines bold:

```
Queens Roofing Contractor          ← clamp(2.25rem, -1.125rem + 5vw, 4.25rem), max-width 28ch
Trusted Roofing Company Since 1988 ← clamp(1.0625rem, .82rem + .55vw, 1.4375rem), ~40% of line 1
```

Hierarchy comes from **scale, not weight**. The `28ch` measure is deliberately generous —
the line break is controlled by the type size here, not by `max-width`.

### Copy
- Eyebrow chip ("Forest Hills, Queens · Est. 1988") removed, markup and CSS.
- Lede replaced with the Royal Renovators paragraph; **20px flat** (`1.25rem`), measure `62ch`.

### CTAs
- `Get a free estimate` — red primary.
- `Call (718) 414-6067` — **inverted ghost**: rests solid white with navy text (its old
  hover state) and the fill *retracts* on hover. Done by flipping the `::before` wipe to
  `right: 0` by default and `right: 100%` on hover — one moving part, running backwards.

### Scrim (the readability fix)
The original gradient ran dark at the top and faded to `.3` at the bottom, leaving the
lede, CTAs and proof line sitting on bright roof tiles. Replaced with **two layers**:

```css
linear-gradient(to right,  rgba(1,27,68,.84) 0%, .62 32%, .2 62%, .06 100%)  /* carries the text */
linear-gradient(to top,    rgba(1,27,68,.5) 0%, rgba(1,44,109,.26) 50%, .44 100%)  /* anchors edges */
```

Text sits over ~.75 alpha; the right edge drops to almost nothing so the footage runs
clean behind the form. **Below 80rem the copy runs full width**, so that breakpoint
overrides it with an even vertical wash — a left-weighted one would expose the line ends.

---

## 3. Estimate form (`#estimate`)

Fields: name, email, phone, address, message + submit. Native constraint validation.

### Final panel treatment — neutral charcoal glass

```css
background-color: rgba(0, 0, 0, .42);
background-image: linear-gradient(155deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.06) 62%);
border: 1px solid rgba(255,255,255,.36);
backdrop-filter: blur(22px);   /* no saturate() */
color: var(--white);
```

**This went through many rounds. Two things resolved it:**

1. **The tint is black, not navy.** A navy tint over navy-scrimmed footage compounds —
   two blues stacking is what read as "blueish" at every opacity.
2. **`saturate(140%)` was dropped.** It re-saturated the exact blue the tint removed.

**The governing constraint, for future reference:** the panel's brightness decides the
text colour. Dark enough for white text ⇒ it cannot be pale. Pale enough to read as white
⇒ the ink must go navy. White text needs the background below ~0.18 relative luminance to
clear 4.5:1. "Whitish + transparent + white text" is not achievable.

### Details worth keeping
- **Placeholders 13px, labels 13px** — the size is set on `::placeholder` alone so the
  *typed value* stays 16px and iOS doesn't zoom the page on focus.
- Submit is **unskewed and full width** — a skewed slab beside rectangular inputs reads as
  a mistake, and its corners would hang past the card.
- `:-webkit-autofill` pinned to a neutral dark inset, or Chrome paints a solid yellow-white
  block through the glass.
- `:user-invalid`, not `:invalid` — errors appear after the field is left, not while typing.
- Privacy line: inline flow (not flex) so the lock icon and copy centre as one block and
  stay centred when the line wraps. Green `--green-on-dark`.

### ⚠️ Not wired
`initEstimateForm()` in `js/main.js` intercepts submit so the page doesn't reload and lose
input. **Set the `ENDPOINT` constant** to a form service and the fetch, success and error
states go live as written.

---

## 4. Service marquee (`#services-strip`)

Navy strip below the hero. Uppercase service list, red diamond separators.

- **Three identical groups** in the track; `translateX(-33.3333%)` lands the second group
  where the first began — seamless on any width.
- 45s linear, pauses on hover/focus.

---

## 5. About section (`#about`)

### Shared primitives (reusable by every band below the hero)
`.section` · `.section-eyebrow` · `.section-title` (26ch) · `.section-lede` · `.accent`

Built as primitives so the page keeps one vertical rhythm and one heading scale —
changing the type scale later is one edit, not six.

### Composition
- **Two overlapping skeleton frames** — wide lead shot, smaller one crossing it at the
  bottom right. The lower frame carries a **7px white border**, which is the only thing
  separating the two images where they cross (shadows were removed at request).
- Placeholders hold an `aspect-ratio`, so dropping in real photos **won't shift the page**.
  Hatched at −21°, the same angle as the buttons. Deliberately static, no shimmer.
  *To swap in:* replace `.media-frame__note` with an `<img>` and drop the `background-image`.
- **Spinning circular seal** at the join. `textLength="282.74"` = the arc's exact
  circumference, with `lengthAdjust="spacing"` — that closes the ring instead of leaving a
  gap before "ROYAL". 26s, pauses on hover.
- Two-column tick list, red discs (1.25rem). `line-height: 1` on the icon collapses the
  icon font's own leading so flex centring actually lands.
- CTAs: navy `Request a quote` + outlined `More about us`.

---

## 6. Navigation dropdowns

Rebuilt after evaluating alternatives. **Chose full-bleed mega panels** over the
hover-flyout pattern for two reasons:

- **Hover flyouts are fragile** — reaching the sub-pane means travelling diagonally, and
  crossing a neighbouring entry swaps the pane underneath you. Fixing it properly needs
  hover-intent timers or triangle tracking. On touch there's no hover at all.
- **The flyout implied 49 area×service pages** (7 × 7) — a thin-content pattern, and 49
  pages to write.

| Menu | Structure |
|---|---|
| **Services** | Single 15.5rem column straight under its button. Six items, one per line. |
| **Roofing** | Full-bleed. Popular / By roof type / Repairs & checks / Roofing areas + footer strip with a navy `Request a quote`. |
| **Areas We Serve** | Full-bleed. Boroughs / Beyond the city / Queens neighbourhoods + a navy "Not sure we reach you?" card in the fourth column. |

**Area links are one page per area** — `#queens-roofing`, `#brooklyn-roofing`, … Seven
substantial local pages instead of forty-nine near-identical ones.

### How full-bleed works here
`.nav-bar { position: relative }` + `.primary-nav__item--full { position: static }` lets
the panel escape its list item and span the nav bar; a `.container` inside aligns the
columns to the logo and nav above.

⚠️ The `--full` modifier is carried **only** by Roofing and Areas. Applying
`position: static` to every `--menu` item is what once threw the Services dropdown to the
far left edge of the viewport.

---

## 7. Tokens added

```css
--radius-lg: 8px;      --radius-xl: 14px;
--red-on-dark: #FF7A88;    /* brand red drops below 3:1 on the hero */
--green-on-dark: #43E88A;  /* reassurance green */
```

Plus a `.btn--navy` modifier: navy resting, wipes to red on hover — the inverse of
`--primary`, for sections that already carry red elsewhere.

---

## 8. Animation policy

The standing rule for this site is **no animations**. Two sanctioned exceptions, both
explicitly requested:

1. `.marquee__track` — `@keyframes marquee-scroll`
2. `.seal__ring` — `@keyframes seal-spin`

Both pause on hover and both are switched off with `animation: none !important` inside the
`prefers-reduced-motion` block. **This is required for any new looping animation** — the
file's global `animation-duration: .01ms` override makes an infinite loop *flicker* rather
than stop.

---

## 9. Services (`#roofing`)

Six cards: flat roof, roof repair, roof replacement, roof installation, commercial,
exterior. Icons were the first pass and were replaced with **image skeletons**, then the
skeletons were pulled *inside* the card with their own radius rather than bleeding to the
card edge — an image that touches three sides reads as a header band, not as part of the
card.

- Card is one click target via the stretched-link pattern (`.card__link::after { inset: 0 }`).
  The visible `Learn more` stays for scanning; the whole card is the hit area.
- Section lede sits **bottom-right of the heading block**, so the eye finishes the heading
  and lands on the first card rather than reading back across.
- Body copy is black here rather than `--ink-muted`. Muted grey on white was the original
  and it lost too much on a phone.

---

## 10. Flat roofing specialists (`#flatroof`)

Four bullet points became **two stats** (`100%` customer service satisfaction, `25-Yr`
warranty protection) with icons. Four short claims read as filler; two with numbers read as
a promise.

- The rule above each stat moved to the **start** of the row in brand red — a full-width
  divider separated the stats from the copy; a short leading rule ties them to it.
- Uses the closing banner's gradient, so the two navy bands on the page are visibly the
  same object rather than two slightly different blues.

---

## 11. Process (`#process`)

Rebuilt four times — stepper, editorial columns, then back to a **timeline**, which is what
was wanted from the start. Final form:

- **Icons in circles, not numerals.** Numerals had to be large to read as steps, and large
  numerals dominated the copy beside them.
- No animation (see §8).
- Heading breaks to two words on the second line; `text-wrap: pretty` plus a widened
  measure, never `balance` (see §25).

---

## 12. Estimate banner (`#cta-band`)

Contained-card version was rejected outright. Final is **full-bleed** using the technique in
§6 — the band spans the viewport, the content inside stays on the container grid. Y-padding
is deliberately tight; a full-bleed band with generous padding becomes a page of its own.

---

## 13. Recent Work — bento, lightbox, hover (`#projects`)

Six tiles on an explicit six-track `grid-area` layout. The auto-placed version left a hole
at bottom-right whenever a tile changed span; naming the areas makes that impossible.
Captions were removed — the images carry it.

**Lightbox.** Swiper 11 with the `zoom` module.

- Slides are **cloned at runtime** from `.bento__trigger img`. The gallery and the viewer
  cannot fall out of sync because there is only one source of truth for the image list.
- Each slide is wrapped in `.swiper-zoom-container` — that class is what the zoom module
  binds to; without it double-tap and pinch do nothing.
- `.lightbox__nav { z-index: 2 }`. Swiper ships `.swiper { z-index: 1 }`, which painted over
  the arrows — they were visible and completely dead. This is the fix for the reported
  "arrows don't change the image" bug.
- Focus trap + `aria-modal`, sharing the `FOCUSABLE` constant with the drawer and videobox.

**Hover.** Tile image scales to `1.06`, and `.bento__overlay` fades in at
`rgba(1, 27, 68, .62)` — brand navy at the opacity where white text clears 4.5:1. Both are
dropped under `prefers-reduced-motion`; the overlay still fades because opacity alone
doesn't trigger vestibular problems, but the transform is removed.

---

## 14. Awards (`#awards`)

Real Angi / BBB / GAF artwork. Went left-aligned-with-CTA, then reverted to the original
**centred** arrangement. `mix-blend-mode: multiply` was used to kill the white boxes and
then removed once a true alpha PNG arrived — blend modes tint anything they sit on and stop
being predictable the moment the background is not pure white.

---

## 15. Blog (`#blog`)

Responsive **Swiper** carousel from swiperjs.com, matching the supplied reference:
`slidesPerView` steps at the same breakpoints as the rest of the page, navigation arrows
outside the track, author and date in grey and bold beneath a slightly shortened card image.

---

## 16. Areas we serve (`#areas`)

Location list plus `images/map-Photoroom.png`. The map's container background was removed
entirely and the image scaled up instead — a white plate behind a transparent PNG only works
until the section behind it is not white.

The note under the list broke into columns because `display: flex` made every text fragment a
flex item. It is inline flow now.

---

## 17–19. Reviews, FAQs, Contact

**Reviews** — Swiper. `4.9 average` removed from beside the arrows (it competed with the
cards). User icon sits **in front of** the name and location, not above it.

**FAQs** — native `<details name="faq">`, so the browser enforces one-open-at-a-time with no
JavaScript. Opening and closing are height-animated with the Web Animations API. Spacing
between items increased; the summary row is padded rather than height-set so the whole row is
the tap target.

**Contact** — details left, form right. The heading and lede were removed: the heading left a
band of white space in front of the form and the section reads fine without it. Map is
height-matched to the form under a `Get in touch` heading, with the contact details in a
single row underneath both. Address links out to
`118-35 Queens Blvd, Forest Hills, NY 11375`.

---

## 20. Closing banner + 21. Footer

**Banner** — full-bleed, brand gradient, heading on two lines with `From First Call to Final
Sweep` kept on one. Floating boxes tightened and moved to true brand red rather than the
dimmed variant.

**Footer** — restructured several times. Final: brand column with an enlarged logo (container
size unchanged, image scaled inside it), the three link columns pulled closer together so the
gap reads as *logo | links* rather than four even columns, and contact details in a single
linked row along the bottom. No CTA — the banner directly above is the CTA.

---

## 22. `services.html`

Generated by a script that lifts the header, mobile drawer, closing banner and footer
**verbatim** from `index.html`. They cannot drift, and any future change to those four
regions should be made the same way rather than hand-edited twice.

Sections: page hero (centred) → roofing (6) → exterior (4 across) + emergency strip →
`What Comes With the Price` as a banner-type panel with the points inside it → FAQs →
contact → banner → footer.

---

## 23. Hero video (`#videobox`)

`Free estimates, no obligation` was replaced with a **play control**: red disc, `Watch now`,
opening `images/video-2.mp4` on a black layer.

```js
video.muted = false;
var attempt = video.play();
if (attempt && typeof attempt.catch === 'function') {
  attempt.catch(function () { video.muted = true; video.play().catch(function () {}); });
}
```

Sound is the point, so it opens unmuted — but an unmuted `play()` is rejected outright by
autoplay policy in some contexts, and a rejected promise means a black screen. The fallback
retries muted so there is always a picture.

The disc pulses via `hero-play-pulse` (2.4s, expanding `box-shadow` ring). It pauses on hover
and is `animation: none !important` under reduced motion — required, see §8.

---

## 24. Responsive audit (tablet + mobile)

Audited `index.html` and `services.html` at **390px** and **768px** through an iframe harness
(Chrome clamps real window width — see §26).

**Fixed**

| Finding | Fix |
|---|---|
| Both pages scrolled sideways ~37px on a phone | The footer contact row never collapsed. `.footer__contactbar-list` now steps 4 → 2 → 1 across the same breakpoints as the rest of the footer. |
| `index.html` still scrolled 10px at 375px | The flat-roof CTA. `.btn` is `white-space: nowrap`, so `GET A FREE FLAT ROOF INSPECTION` forced the button to 375px wide, and `transform: skew()` threw its corners `--skew-overhang` past that. At ≤40rem `.btn` now allows wrapping and uses tighter inline padding. |
| Uppercase labels bottomed out at 11px | `--fs-utility` floor raised `.6875rem` → `.75rem` (12px). |
| Footer links 21px tall, socials 36px, FAQ summary 24px, breadcrumbs 12px, play button unpadded | All lifted to the 44px minimum with `padding-block` rather than fixed heights, so the text position doesn't move. Gaps reduced to keep the original vertical rhythm. |

**`html { overflow-x: clip }`** guards the skewed faces generally. On `html`, not `body` —
on `body` it does not propagate to the viewport. And `clip`, not `hidden`, because `hidden`
creates a scroll container and a scroll container ancestor silently breaks the sticky header.

**Verified after the fixes** — all four page × width combinations report
`scrollsSideways: false`, `overflowPx: 0`, and the header still sticks
(`headerTop: 0` at 390px where the utility bar is `display: none`, `-44` at 768px as the
utility bar scrolls away).

**Not a bug:** the audit flags service-card titles as small targets. The stretched `::after`
makes the entire card the hit area, so the measured link box is not the tappable region.

---

## 25. Client copy pass — 2026-08-10

The client supplied an H1/H2 outline by email. The page was restructured to match it. Every
heading below is now the client's exact wording.

**Section order after the pass:**

hero → marquee → about → **gaf** → services → **buildings** (was flatroof) → **whyus** →
**exterior** → process → cta-band → **projects** (was gallery) → awards → blog → areas →
reviews → faqs → contact → banner → footer.

| # | Section | Change |
|---|---|---|
| 1 | `hero` | H1 `NYC Roofing Contractor`, sub `Trusted Roofing Since 1988`, paragraph replaced verbatim from the email. Queens-specific wording dropped for NYC-wide. |
| 2 | `about` | Heading → `Roof Repair, Installation, and Replacement Across NYC`. |
| 3 | `services` | Heading → `Flat Roofing Specialists Serving Queens & New York City`. Roof Replacement and Roof Installation cards retired; **Shingle Roofing** and **Gutter System** added. Card titles up from `1.1875rem` to `clamp(1.3125rem, 1.19rem + .38vw, 1.5rem)`. |
| 4 | `gaf` **new** | `GAF Master Elite Roofing Trusted Throughout New York City`. Copy panel + credentials aside (three marks, four-row fact list) and three explainer cards beneath. |
| 5 | `buildings` | Was `flatroof`. Heading → `Flat and Shingle Roofing for Every NYC Building Type`. Rebuilt light: head, two-shot feature with three paragraphs and the two stats, **six building-type cards**, closing CTA strip. |
| 6 | `whyus` **new** | `Why NYC Property Owners Choose Royal Renovators Inc.` Takes over the dark gradient the old flatroof band used. |
| 7 | `exterior` **new** | `Siding, Masonry, and Gutter Work for Your Property's Exterior`. Three trade cards with edge-to-edge photographs, plus an extras strip. |
| 8 | `projects` | Was the bento gallery. Heading → `Recent Roofing Projects`, now **tabbed**: Flat / Shingle / Commercial / Exterior, four photographs each. |

**Why the dark band moved.** The client asked for the flat-roof section to be redesigned *and*
for the new why-choose-us section to look like it. Those two asks conflict, so the dark
gradient moved to `whyus` and `buildings` went light. One dark feature band on the page, and
the light/dark alternation survives.

**Tabs.** `initProjectTabs()` — roving tabindex, arrow/Home/End keys, `aria-selected` plus an
`is-active` class because `aria-selected` alone is invisible. Panels use the `hidden`
attribute rather than a CSS class so the script and the markup share one source of truth.

**Lightbox rescoped.** It used to build its slide list once from every `.bento__trigger` on
the page. With tabs that is the wrong set, so `build()` now runs per open against
`trigger.closest('.projects__panel')` — the viewer holds the panel being browsed and nothing
else. It falls back to `document` when there is no panel, so an untabbed gallery still works.
`swiper.update()` after the rebuild; `sync()` guards on `shots[activeIndex]` existing.

**Verified:** four tabs switch and hide correctly, roving tabindex flips 0/-1, the Commercial
panel opens the lightbox at `total=4` with `project-commercial-tpo.jpg` first and the clicked
tile at index 2, the next arrow advances, close restores. No sideways scroll on either page at
390 / 768 / 1024.

**Left alone deliberately:** the areas section stays where it is. The email lists
`Serving Brooklyn, Queens, Manhattan, the Bronx, and Long Island` second, but the brief was
that the remaining sections stay as they are.

---

## 26. Revision pass — 2026-08-10

| Ask | Change |
|---|---|
| Gap between About and Factory Certified | `.about + .gaf` joined the existing half-padding rule for same-tone neighbours. |
| GAF aside: Master Elite mark only | BBB and Angi plates removed; the aside now carries the mark, then **What the certification means for you** (warranties / vetted, not self-declared / one accountable contractor), then the fact list. |
| Services heading cramped | `.services .section-title` released to `34ch` and the head's first column widened `1.1fr → 1.45fr`. |
| Why-us: bigger images, CTA under the copy, spaced bordered reason cards | Split `1.5fr/1fr → 1.12fr/1fr`; `.whyus__actions` moved back inside `.whyus__body`; reasons became translucent bordered cards (`rgba(255,255,255,.06)` + `.18` border) with `--space-6` gaps. Title clamp dropped to `2.625rem` — at the old size the narrower column stranded "Inc." on a third line. |
| Exterior heading wider, right copy shorter | `34ch` measure, head split `1.55fr/1fr`, lede cut roughly in half. |
| Extras bar redesign | Was one inline row of six checks, which read as a footnote. Now a panel: heading + supporting line + CTA on top, six bordered tiles with red icon discs in a 3×2 grid below. |
| Recent Work layout | Head centred to match the Awards band (eyebrow with a rule on **both** sides), lede removed entirely, tabs centred, `View full gallery` moved under the tiles. |
| Feature block redesign | See below. |

**The feature block (`.buildings`).** The staggered photograph pair left a hole under the
heading and forced the copy column far taller than the images — that mismatch was the
"layout is not perfect". Photographs dropped entirely and replaced with **two equal system
panels**, Flat and Shingle, each with an icon head, two paragraphs, five specs and a service
life figure, followed by a shared note bar carrying the tear-off/overlay line and the two
stats. A comparison has to start on the same line and hold the same shape, which a staggered
image composition cannot do.

`.buildings__system` and `.exterior__card-body` are **flex columns** purely so the closing
row (`margin-top: auto`) sits on the panel floor — the panels hold different amounts of copy
and the figures have to line up across them.

**Type pass.**
- Section heading `line-height` `1.14 → 1.22`.
- Body weight `--fw-light` (300) → `--fw-medium` (500). The family ships **300/500/700
  only**, so there is no 400 face to land between them — a `font-weight: 400` declaration
  would resolve up to 500 anyway.

**⚠ The centred tab strip.** `.projects__tabs` is `overflow-x: auto`. Plain
`justify-content: center` in a scroll container pushes the leading items past the scrollable
origin where they can **never be reached** — on a phone the first two tabs would be lost.
Fixed with `justify-content: safe center` (plain `center` kept above it as the fallback).
Verified: at 390px the strip is 335px holding 643px of tabs, and the first tab sits at
offset **0**, so `safe` correctly fell back to flex-start.

**Verified after the pass:** no sideways scroll at 390 / 768 / 1024; tab 4 selects and shows
the Exterior panel; the lightbox opens scoped to that panel at `total=4`, index 3, and the
next arrow advances; `body` computes to weight 500; `.section-title` computes to 53.68px on
44px = 1.22.

---

## 27. Live photography pulled from nycrenovators.com — 2026-08-10

Images are **hotlinked** from the client's own WordPress media library
(`nycrenovators.com/wp-content/uploads/...`), not copied into `images/`. Nothing was added
to the repo.

**Fetching note:** the Bash tool here is sandboxed without network — `curl` fails with
`libcurl function was given a bad argument`. **Use the PowerShell tool** (`Invoke-WebRequest`)
for anything that has to reach the internet.

**What is on the source page:** 21 unique images, of which
- **7 genuine job photographs** — drone crew shots, cap sheet install, tear-off with the
  Manhattan skyline, the full team in branded shirts, boom crane with the branded truck, and
  one shingle/slate tear-off;
- **2 usable AI-generated** — a gutter install and a siding/masonry three-panel;
- the rest unusable as tiles: a roof-layer infographic, a four-panel collage with the logo
  baked into the middle (uncroppable), three 300×200 stock blog thumbnails, and the
  badge/logo files already held locally.

**The shortfall.** The landing page has **36 photo slots** against 9 usable images. Rather
than repeat each three or four times, the real photographs went into the **20
highest-value slots** and the remaining **16 kept their stock images** — the Roof Repair
card, masonry and gutter exterior cards, three Shingle tiles, two Commercial tiles, two
Exterior tiles and the six blog cards.

Only **one** of the seven real photographs shows a pitched/shingle roof, which is why the
Shingle tab is still mostly stock. Worth asking the client for shingle work photos.

**Captions were rewritten where the photograph changed the claim** — a tile captioned
"Heat-welded TPO seams" over a cap-sheet photograph is simply wrong. Six captions realigned.

**Weight.** `Flat-tearoff-big-crew-Royal-pic-1.jpg` was the 1600×1200 original at 650 KB;
swapped to the `-1024x768` variant at 175 KB, still larger than any slot renders it. The two
AI images are **~1 MB PNGs** with no smaller variants generated — PNG is the wrong container
for photographic content, and they cannot be re-encoded while hotlinked. Worth re-saving
them as WebP in WordPress.

**Verified:** all 9 URLs return 200; with lazy loading forced eager, **20 of 20** remote
`<img>` elements report `complete` with a non-zero `naturalWidth`.

---

## 28. Bugs found and fixed

| Bug | Cause |
|---|---|
| Frames stacked instead of overlapping | `.media-frame { position: relative }` sat **after** `.media-frame--inset { position: absolute }` at equal specificity — the base won. Modifiers moved below the base rule. |
| 4-column services grid rendered as 3 | Same class of error: `.services__grid--four` was declared **before** `.services__grid`. Modifiers always go after the base rule. |
| Services dropdown pinned to viewport left | `position: static` applied to all `--menu` items, so its `left: 0` anchored to `.nav-bar` instead of its own button. Narrowed to a `--full` modifier on Roofing and Areas only. |
| Lightbox arrows dead | Swiper's `.swiper { z-index: 1 }` painted over them. `.lightbox__nav { z-index: 2 }`. |
| Address field landed in the hero form | Find-and-replace matched the hero form's email field first — the two forms have identical field markup. Always verify by listing each form's field ids **separately**. |
| Contact grid collapsed | The map made three grid children where the rule expected two. Rebuilt `contact__inner` rather than patching it further. |
| Headings breaking in the wrong place (repeatedly) | `text-wrap: balance` on `.section-title` evens the lines out, which is exactly wrong when a specific word must lead a line. Use `text-wrap: pretty` and widen the measure. |
| Areas note split into columns | `display: flex` promoted every text fragment to a flex item. |
| Social icons underlined | Missing `text-decoration: none`. |
| Ring text had a gap | Text didn't fill the circumference; fixed with `textLength`. |

**Also worth recording:** a range-replace from `/* Process timeline ---` to `/* Footer ---`
deleted four unrelated CSS blocks (estimate banner, gallery, awards, blog). Caught by grep,
restored, each verified by screenshot. Range replacements across a 2,300-line stylesheet are
not safe — anchor on the exact block.

---

## 29. Preview workflow on this machine

No Python, no Chrome extension. What works:

```bash
node serve.js                      # tiny static server on :8123
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --hide-scrollbars \
  --virtual-time-budget=7000 --window-size=1600,950 \
  --screenshot=shot.png "http://localhost:8123/index.html"
```

**Gotchas:**
- Chrome clamps window width to ~500px, so mobile shots must be rendered through an
  **iframe of the exact width** inside a harness page.
- The hero is exactly `100svh − header`, so the marquee always sits at the fold —
  below-the-fold content needs a same-origin harness that scrolls the iframe.
- `--virtual-time-budget` does **not** advance the CSS animation clock reliably. Two
  screenshots at different budgets can come back byte-identical even when an animation is
  running. Verify motion by dumping `getComputedStyle().transform`, not by pixels.
- `decoding="async"` images come back blank or flat in headless shots. They render fine in a
  real browser — do not "fix" them.
- Sideways scroll must be tested by **scrolling**, not by comparing `scrollWidth`. Run
  `window.scrollTo(800, 0)` and read `scrollX`; a clipped overflow reports a wide
  `scrollWidth` that the user can never reach.
- The four running harnesses worth keeping: sideways-scroll + sticky header, tap-target and
  tiny-text audit, Swiper `activeIndex` before/after an arrow click, and
  `elementFromPoint` at a control's centre to prove nothing is painted over it.

---

## 30. Outstanding

**Blocking before launch**
- [ ] Form `ENDPOINT` not set — submissions go nowhere. **Both** forms (`#estimate`,
      `#contact-form`) carry `class="js-form"` and share `setUpForm`.
- [ ] Mobile drawer still carries **flat lists**, including area×service links that no
      longer exist in the desktop structure. Its accordion is single-level.
- [ ] `More about us` points at `#about` — its own section, so the click does nothing.
- [ ] Nav menus and service-card `Learn more` links point at bare fragments (`#roofing`,
      `#siding`, `#post-1`, `#projects-all`, `#blog-all`, `#terms`, `#privacy`). The roofing
      and exterior ones should target `services.html#roofing` etc.; the rest need pages.
- [ ] Real photographs for the two About skeletons.

**Content**
- [ ] About copy is **mine and unverified** — "licensed, bonded and insured", "own crews,
      never subcontracted", "seven-day leak response". Confirm each is true.
- [ ] `35+ years` (hero proof line) vs `38` (About seal) disagree. 1988 → now is 38.

**Assets**
- [ ] `images/BBB-A-Logo-2026.webp` is 296 KB of lossless WebP.
- [ ] `images/hero-vid.mp4` is ~10 MB and has no poster frame.

**Polish**
- [ ] Services dropdown looks different from its two full-width neighbours.
- [ ] Hero has two competing primary CTAs (`Get a free estimate` + the form's submit).
