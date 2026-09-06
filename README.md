# cytical.github.io

My portfolio, built as an IDE workspace. Live at **[cytical.github.io](https://cytical.github.io)**.

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies.
Everything is served straight from this repo by GitHub Pages.

## What's in it

| File | What it is |
| --- | --- |
| `index.html` | The whole site. Every section is real HTML, so it reads fine without JavaScript. |
| `assets/css/style.css` | Design tokens, IDE chrome, light/dark themes, print stylesheet. |
| `assets/js/app.js` | Tabs, explorer, command palette, terminal, lightbox, recruiter mode. |
| `images/` | Original project screenshots. `images/opt/` holds the WebP/JPEG versions the site serves. |
| `404.html` | Terminal-styled not-found page. |

## Things worth knowing

- **Progressive enhancement.** JavaScript only switches which pane is visible. With it disabled
  every section renders stacked and readable, so crawlers get the full content.
- **Accessibility.** All text meets WCAG AA contrast in both themes. The tab strip implements the
  ARIA tabs pattern with arrow-key navigation, and `prefers-reduced-motion` is respected.
- **Weight.** Images are served as WebP with JPEG fallbacks, about 300 KB total, down from 2.7 MB
  of source PNGs.
- **Try the terminal.** `help`, `find power bi`, `git log`, `open projects`. Press <kbd>⌘K</kbd>
  (or <kbd>Ctrl</kbd>+<kbd>K</kbd>) to jump to anything.

## Running it locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. There is nothing to install or compile.

## Contact

**Mikhail Ezra Guiao**, [guiaomikhail@gmail.com](mailto:guiaomikhail@gmail.com)
· [LinkedIn](https://www.linkedin.com/in/ezra-guiao/)
