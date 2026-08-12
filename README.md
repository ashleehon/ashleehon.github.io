# ashleehon.github.io

Personal site: CV at the root, pottery at `/pottery/`. Published with GitHub Pages from `main`.

Plain HTML and CSS on purpose — no build step, no dependencies, nothing to break later. Edit the
files and push; the site updates in a minute or two.

```
index.html          CV
pottery/index.html  pottery
style.css           shared styles, including print
```

## This repository is public

GitHub Pages on a free plan can only publish from a public repo, so everything here — including
git history — is world-readable and permanent. A phone number or street address committed once
stays in history after being deleted. Keep them out.

## Adding pottery photos

Put images in `pottery/images/` and swap the placeholder for a real one:

```html
<div class="frame"><img src="images/bowl-01.jpg" alt="Description of the piece"></div>
```

Resize to roughly 1200px on the long edge first. Full-size phone photos are several megabytes each
and will make the page slow.

## Printing the CV

The print stylesheet is a first-class output, not an afterthought: Cmd-P from the CV page gives a
clean PDF with proper margins, black text regardless of dark mode, and no entry split across a page
break. Prefer that over maintaining a separate PDF that drifts out of sync.

## Local preview

```bash
python3 -m http.server 8000    # then open http://localhost:8000
```
