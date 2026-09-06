# Improvements

A working backlog for cytical.github.io, ordered by impact. Audited 7 September 2026
against the live source at commit `59b6269`.

Positioning target for every judgment call below: **technically credible data /
analytics engineer, moving toward data science and AI engineering, targeting the
Hong Kong and Singapore markets.** Anything that reads as a portfolio template is
working against that.

## Calls made without asking

These are matters of taste or of fact I cannot verify, decided so the work could
continue. Each is easy to reverse.

- **Job title stays "Data Analyst."** The brief for this backlog says "Data Quality
  Analyst," but the previous session changed the site to "Data Analyst" on explicit
  instruction. Treating the more recent instruction as the live one. The résumé PDF
  still says "Data Quality Analyst, Citibank" (see the blocked item at the bottom).
- **HK/SG is stated as a target, not as a current location.** The site says Manila,
  which is true; claiming otherwise would be a lie a recruiter can check on LinkedIn
  in one click. The wording added is availability, not relocation-as-fact.
- **Experience bullets are sharpened, never invented.** The Citibank bullets read as
  process work. I reordered so the quantified items lead, and tightened wording. I
  did not add numbers that are not already on the site or the résumé.
- **The IDE framing stays.** It is the site's whole differentiator, and the PSEye
  page is doing the credibility work underneath it.

---

## P0 , broken or wrong

- [x] **1. The PSEye poster image loads on every visit (134 KB, 54% of first-load
  weight).** `<video poster>` is fetched by Chrome even though `#pane-pseye` is
  `display:none`, so every visitor to about.md pays for an image on a page they have
  not opened. Move the poster to JS on first open of the pane, and re-encode it.
- [x] **2. Broken list item in README.md's "How to explore."** `projects.ipynb` is a
  second `<span>` inside the `live-project.tsx` `<li>`, so it renders with no icon
  and hangs off the previous entry.
- [x] **3. `site.webmanifest` is stale.** Still "Data Quality Analyst at Citibank,"
  and the `name` field carries an em dash the rest of the codebase does not use.
- [x] **4. The skip link is broken on any deep link.** It targets `#pane-about`,
  which is `display:none` whenever the visitor lands on `#projects`, `#pseye` or any
  other hash. Skip-to-content then does nothing.
- [x] **5. Meta description contradicts the page.** It says "starting an MS in
  Analytics at Georgia Tech in 2026"; the page says it started August 2026.
- [x] **6. Experience bullets render as commas.** `.tl-bullets li::before` uses
  `content:","`, which reads as dirt on the page rather than as a bullet.

## P1 , positioning

- [x] **7. Nothing on the site signals the HK/SG target.** Availability, the
  "Based in" row, the structured data and the meta description all stop at Manila.
  A Hong Kong recruiter filtering by market has no reason to keep reading.
- [x] **8. README tells the visitor to click file names recruiter mode has hidden.**
  Recruiter mode is now the default, so the explorer says "About" while the README
  says to open `about.md`.
- [x] **9. `readme-foot` describes recruiter mode as opt-in.** It is now on by
  default, so the sentence points the wrong way.

## P2 , accessibility

- [x] **10. Neither modal traps focus.** The lightbox and the command palette are
  both `aria-modal="true"`, and Tab walks straight out of them into the page behind
  the scrim. Nothing marks the background inert either.
- [x] **11. Tab close buttons are `<span role="button">` inside a `<button>`.**
  Interactive content nested in interactive content: invalid, and not reachable by
  keyboard except through the undiscoverable Delete shortcut.
- [x] **12. Sub-minimum tap targets (WCAG 2.2 SC 2.5.8, AA).** At 390px the mode
  toggle is 18x24 and the drawer close is 19x18, both under the 24x24 floor.
- [x] **13. The recruiter toggle is an empty box on mobile.** `font-size:0` hides
  the label and collapses the status dot to 0x0, leaving an unlabelled rectangle in
  the title bar of the most-used breakpoint.
- [x] **14. The command palette is unreachable on mobile.** The rail is
  `display:none` and `.tb-btn--palette` is too, so ⌘K has no trigger and no keyboard
  to reach it from.

## P3 , performance

- [x] **15. Self-host the two webfonts.** 79.7 KB over two files from a third-party
  origin, plus a render-path CSS request, plus DNS and TLS to `fonts.gstatic.com`.
  Latin-only subsets served same-origin remove all of it.
- [x] **16. 2.93 MB of unreferenced images are tracked in git.** The pre-optimisation
  originals (filenames with spaces) and four unused Acoustify crops. No effect on
  page weight, but every clone pays for them.

## P4 , polish

- [ ] **17. The node field teleports on window resize.** `resize()` reseeds the whole
  field on every resize event, so dragging a window edge scatters the nodes and
  fires a full reseed per frame.
- [ ] **18. Section comments in `index.html` are shifted by one.** The comment above
  `#pane-about` says README, the one above `#pane-readme` says RESUME, and so on
  down the file.

## P5 , SEO and metadata

- [x] **19. `sitemap.xml` lastmod is stale** and there is no `og:locale`.
- [x] **20. `Person` structured data has no `image`,** so nothing ties the schema
  entity to the link-preview card.

---

## Blocked, needs Ezra

- **`Ezra_Guiao_Resume.pdf` contradicts the site.** It still reads "Data Quality
  Analyst, Citibank" and "Master of Science in Analytics (Data Science)". The site
  now says "Data Analyst" and dropped the Data Science track on instruction. A
  recruiter who opens the PDF from the hero button gets a different person. I cannot
  regenerate the PDF from here: it needs to come from whatever produced it.
- **LinkedIn presumably still says "Data Quality Analyst"** for the same reason, and
  is the first thing a recruiter cross-checks.
