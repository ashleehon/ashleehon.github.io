# ashleehon.github.io

Personal site, published with GitHub Pages from `main`.

Plain HTML and CSS on purpose — no build step, no dependencies, nothing to break later. Edit the
files and push; the site updates in a minute or two.

```
index.html   the whole site, one scrolling page
style.css    styles: light, dark, and print
wobble.js    decoration: bends the grid's rules under the cursor
favicon.svg  the label column and a section rule, which is the page in miniature
og.png       the share card, rendered from the page's own hero (see below)
fonts/       self-hosted woff2 (Fraunces, IBM Plex Sans, IBM Plex Mono)
```

## How the page is built

It reads as a positioning page rather than a transcribed résumé: a claim up top, the numbers behind
it, then work as named case studies that expand. A fourth block covers what shipped
when engineering wasn't scheduled — built with AI tooling. Sections are numbered
`00`–`08` in a label column down the left, and each block draws its own two columns at matching widths rather than inheriting a
CSS subgrid, so the rules stay aligned without depending on subgrid support.

The label sticks to the top of the window for as long as its section lasts, so the numbering says
where you are rather than just counting. That is why the rule between the two columns is the
content's left border and not the label's right one: a sticky element shrinks to its own height and
would drag a full-height border up the page with it.

Case studies are `<details>` elements, so they expand with scripting off. What a closed one shows is
the outcome, not the employer — five of the six are shut on arrival, so that line is all most
readers will see.

## The wobbling rules

The one script on the page is decoration. The grid's lines are ordinary CSS borders, and stay that
way for anyone printing, reading with scripting off, on a touch device, or asking for reduced
motion. Where there is a cursor to follow, `wobble.js` hides those borders — their colour only, so
the 1px they occupy still holds the layout together — and redraws the same geometry as SVG paths it
can bend, so a line struck by the cursor is pushed aside and rings back to rest.

It measures the borders rather than being told where they are, so moving a rule in the CSS moves the
wobble with it. Two things it cannot see: a border that changes position without changing the grid's
height, and a `<path>` needs its tier declared in the `specs` list because by the time it measures,
every border colour it might have read is already transparent.

## Fonts are self-hosted

Fraunces for display, IBM Plex Sans for text, IBM Plex Mono for the labels — two families rather
than three, since the last two are one superfamily. They are served from `fonts/`, not a CDN: a
third-party font host sees every visitor's IP and referrer and adds a connection before any text can
paint. If you add a weight, download the woff2 and add an `@font-face`; don't reach for a `<link>`
to Google. Both Plex files are variable, so one file covers each family's whole weight range.

## The share card

`og.png` is 1200×630, rendered from this page's own hero so it cannot drift from the design. To
regenerate after an edit, screenshot the top of the page at 1200×630 and, rather than letting the
crop fall mid-row, cut at an empty row and repeat that row down to the full height:

```bash
chrome --headless=new --force-device-scale-factor=2 --window-size=1200,630 \
  --screenshot=/tmp/og-raw.png file://$PWD/index.html
```

## This repository is public

GitHub Pages on a free plan can only publish from a public repo, so everything here — including git
history — is world-readable and permanent. A phone number or street address committed once stays in
history after being deleted. Keep them out. Contact is LinkedIn only, deliberately.

## Printing

The CV is this page printed, not a PDF sitting in the repo that goes stale the first time the page
is edited. Cmd-P gives two pages, and the `CV` row in the opening spec sheet is a button that calls
`window.print()` — hidden until the script that wires it runs, so nobody is offered a control that
cannot work.

Four things to know if you edit the print rules, each of which fails quietly rather than loudly.

- A letter page is about 51rem wide, so the narrow-screen breakpoint matches when printing and
  collapses every grid to one column unless the print block puts the columns back. That alone is the
  difference between two pages and five.
- Chrome now hides a closed `<details>` with `content-visibility` on a pseudo-element rather than
  `display`, so overriding `display` prints five of the six cases as bare titles and looks fine at a
  glance. The inline script opens them all on `beforeprint` and shuts them again after; the CSS is
  only the fallback for scripting off.
- Profile, AI builds, Method, and Contact are dropped on paper. All four are positioning
  written for someone browsing, and losing them is what fits six full case studies into
  two pages.
- Fitting is tight enough that a body font change moves the page count. Check it: the fit is
  currently about a third of a page of slack.

## Local preview

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```

`mocks/` holds the rejected design directions and reference screenshots. It is gitignored, so it
stays local and never publishes.

## Pottery page

A pottery page with a gallery layout was built and then removed at commit `411ecf7`. The pottery app
now appears as a case study on the main page instead. To bring the gallery back:

```bash
git checkout 411ecf7 -- pottery/index.html
```

Its styles are gone — `style.css` has been rewritten twice since — so expect to restyle it.
