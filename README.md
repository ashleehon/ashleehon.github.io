# ashleehon.github.io

Personal site, published with GitHub Pages from `main`.

Plain HTML and CSS on purpose — no build step, no dependencies, nothing to break later. Edit the
files and push; the site updates in a minute or two.

```
index.html   the whole site, one scrolling page
style.css    styles: light, dark, and print
wobble.js    decoration: bends the grid's rules under the cursor
fonts/       self-hosted woff2 (Fraunces, Karla, IBM Plex Mono)
```

## How the page is built

It reads as a positioning page rather than a transcribed résumé: a claim up top, the numbers behind
it, then work as named case studies that expand. Sections are numbered `00`–`07` in a label column
down the left, and each block draws its own two columns at matching widths rather than inheriting a
CSS subgrid, so the rules stay aligned without depending on subgrid support.

Case studies are `<details>` elements, with no JavaScript involved, which is why they still expand
with scripting off and still open when printed.

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

They are served from `fonts/`, not a CDN. A third-party font host sees every visitor's IP and
referrer and adds a connection before any text can paint. If you add a weight, download the woff2
and add an `@font-face`; don't reach for a `<link>` to Google.

## This repository is public

GitHub Pages on a free plan can only publish from a public repo, so everything here — including git
history — is world-readable and permanent. A phone number or street address committed once stays in
history after being deleted. Keep them out. Contact is LinkedIn only, deliberately.

## Printing

Cmd-P gives a two-page CV: black on white regardless of dark mode, every case study forced open
(collapsed `<details>` would otherwise print empty), and no entry split across a page break.

Two things to know if you edit the print rules. A letter page is about 51rem wide, so the narrow
screen breakpoint matches when printing and collapses every grid to one column unless the print
block puts the columns back — that alone is the difference between two pages and five. And the
Method and Contact sections are hidden on paper: convictions are for a browsing reader, and a button
is useless in print.

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
