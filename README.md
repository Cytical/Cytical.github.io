# cytical.github.io

My portfolio, built as an IDE workspace. Live at **[cytical.github.io](https://cytical.github.io)**.

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies,
and no third-party requests at runtime. Everything is served straight from this repo by
GitHub Pages.

## What's in it

| Path | What it is |
| --- | --- |
| `index.html` | The whole site. Every section is real HTML, so it reads fine without JavaScript. |
| `assets/css/style.css` | `@font-face`, design tokens, IDE chrome, light/dark themes, print stylesheet. |
| `assets/js/app.js` | Tabs, explorer, command palette, terminal, lightbox, node field, recruiter mode. |
| `assets/fonts/` | Inter and JetBrains Mono, variable, subset, self-hosted. SIL OFL, licences included. |
| `images/opt/` | The WebP and JPEG pairs the project write-ups use. |
| `images/pseye/` | Screenshots and the video poster for the PSEye page. |
| `media/` | The PSEye screen recording. The MKV source is gitignored; the MP4 is what ships. |
| `404.html` | Terminal-styled not-found page. |
| `IMPROVEMENTS.md` | Audit backlog, with the judgment calls behind each decision. |

## Things worth knowing

- **Recruiter mode is the default.** The explorer, tabs and title bar read in plain English
  until you switch it off, which brings back the file names, the language column and the
  terminal. The choice persists.
- **Progressive enhancement.** JavaScript only switches which pane is visible. With it
  disabled every section renders stacked and readable, so crawlers get the full content.
- **Accessibility.** All text meets WCAG AA contrast in both themes. The tab strip implements
  the ARIA tabs pattern with arrow-key navigation, both dialogs trap focus and make the page
  behind them inert, every target clears the WCAG 2.2 24px minimum, and
  `prefers-reduced-motion` is respected: the node field holds still and the PSEye recording
  gives its controls back rather than looping silently.
- **Weight.** About 95 KB on a first visit, most of it the two fonts. Images are WebP with
  JPEG fallbacks and load lazily. The PSEye poster and the 6.7 MB recording are attached only
  when that pane is opened, so nobody pays for a page they did not click on.
- **Try the terminal.** `help`, `find power bi`, `git log`, `open pseye`. Press <kbd>⌘K</kbd>
  (or <kbd>Ctrl</kbd>+<kbd>K</kbd>) to jump to anything.

## Running it locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. There is nothing to install or compile.

Editing `assets/css/style.css` or `assets/js/app.js` means bumping the `?v=` on both `<link>`
and `<script>` in `index.html`, or the browser will keep serving the old one.

## Contact

**Mikhail Ezra Guiao**, [guiaomikhail@gmail.com](mailto:guiaomikhail@gmail.com)
· [LinkedIn](https://www.linkedin.com/in/ezra-guiao/)
