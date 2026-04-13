# Autoresearch v2.2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship autoresearch v2.2.0 — adding GitHub Pages, hero SVG, one-liner install, auto-update, Mermaid charts, GitHub Actions, wiki, architecture doc, sponsor support, and repo metadata.

**Architecture:** Pure-markdown Claude Code plugin — no build step, no compilation, no npm. All new files are static assets (SVG, HTML, YAML, Markdown). The `validate.yml` workflow becomes the permanent CI test suite for frontmatter and cross-reference correctness.

**Tech Stack:** SVG, HTML/CSS/vanilla JS, GitHub Actions YAML, Markdown, `gh` CLI for repo metadata

---

## File Map

### New Files

| Path                             | Purpose                                                      |
| -------------------------------- | ------------------------------------------------------------ |
| `VERSION`                        | Single-line version string for cross-file consistency checks |
| `assets/autoresearch-loop.svg`   | 1200×400 night-mode hero banner for README + landing page    |
| `docs/index.html`                | GitHub Pages dark-theme landing page                         |
| `.github/workflows/release.yml`  | Auto-create GitHub Release from CHANGELOG on version tag     |
| `.github/workflows/validate.yml` | PR checks: frontmatter, cross-refs, version consistency      |
| `.github/FUNDING.yml`            | GitHub Sponsors config                                       |
| `docs/ARCHITECTURE.md`           | Current architecture reference (replaces historical spec)    |
| `wiki/Home.md`                   | Wiki overview and navigation                                 |
| `wiki/Installation.md`           | Install, update, auto-update guide                           |
| `wiki/Commands.md`               | All 9 commands with examples                                 |
| `wiki/Configuration.md`          | All parameters, flags, stop conditions                       |
| `wiki/Safety.md`                 | Invariants, side effects, what autoresearch can/can't touch  |
| `wiki/Contributing.md`           | Dev setup, version-bump procedure (5 files), PR checklist    |

### Modified Files

| Path                                              | Change                                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `plugins/autoresearch/.claude-plugin/plugin.json` | Bump to `2.2.0`, add `"autoUpdate": true`                                                           |
| `.claude-plugin/marketplace.json`                 | Bump to `2.2.0`, add `"autoUpdate": true` to plugin entry                                           |
| `README.md`                                       | Reorder sections, add Mermaid charts, one-liner, Sponsor badge + footer, hero graphic, version bump |
| `CONTRIBUTING.md`                                 | Add `VERSION` to version-bump checklist (4 files → 5)                                               |
| `CLAUDE.md`                                       | Add `VERSION` to version-bump checklist                                                             |
| `CHANGELOG.md`                                    | Add `## [2.2.0]` entry at top                                                                       |

---

## Task 1: VERSION File + Directory Scaffold

**Files:**

- Create: `VERSION`
- Create dirs: `assets/`, `.github/workflows/`, `wiki/`

- [ ] **Step 1: Create VERSION file**

```
2.2.0
```

Run:

```bash
printf '2.2.0' > VERSION
cat VERSION
```

Expected output: `2.2.0`

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p assets .github/workflows wiki
```

- [ ] **Step 3: Verify directories exist**

```bash
ls -d assets .github/workflows wiki
```

Expected: all three paths listed with no errors.

- [ ] **Step 4: Commit**

```bash
git add VERSION assets/.gitkeep wiki/.gitkeep
git commit -m "chore: scaffold v2.2.0 directory structure and VERSION file"
```

---

## Task 2: Hero SVG Graphic

**Files:**

- Create: `assets/autoresearch-loop.svg`

- [ ] **Step 1: Create the SVG**

Write `assets/autoresearch-loop.svg` with this exact content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <defs>
    <marker id="arr-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#58a6ff"/>
    </marker>
    <marker id="arr-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#30a14e"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="1200" height="400" fill="#0d1117"/>

  <!-- Section dividers -->
  <line x1="390" y1="30" x2="390" y2="370" stroke="#21262d" stroke-width="1"/>
  <line x1="830" y1="30" x2="830" y2="370" stroke="#21262d" stroke-width="1"/>

  <!-- ===== LEFT: Title block ===== -->
  <text x="56" y="138" font-family="'Segoe UI',system-ui,sans-serif" font-size="46" font-weight="700" fill="#e6edf3">autoresearch</text>
  <text x="56" y="170" font-family="'Segoe UI',system-ui,sans-serif" font-size="14" fill="#8b949e">Autonomous iteration engine for Claude Code</text>

  <!-- v2.2.0 pill -->
  <rect x="56" y="183" width="76" height="22" rx="11" fill="#1a2f1a"/>
  <text x="94" y="198" font-family="'Segoe UI',system-ui,sans-serif" font-size="11" font-weight="600" fill="#30a14e" text-anchor="middle">v2.2.0</text>

  <!-- Tagline -->
  <text x="56" y="258" font-family="'Segoe UI',system-ui,sans-serif" font-size="15" fill="#c9d1d9">Fire it before bed.</text>
  <text x="56" y="280" font-family="'Segoe UI',system-ui,sans-serif" font-size="15" fill="#c9d1d9">Review improvements in the morning.</text>

  <!-- Core loop label -->
  <text x="56" y="336" font-family="'Segoe UI',system-ui,sans-serif" font-size="11" fill="#58a6ff" letter-spacing="2">CORE LOOP</text>
  <line x1="56" y1="342" x2="200" y2="342" stroke="#58a6ff" stroke-width="1" opacity="0.4"/>

  <!-- ===== CENTER: Diamond loop diagram ===== -->
  <!-- Node centers: MODIFY(610,100) VERIFY(730,200) KEEP(610,300) REPEAT(490,200) -->

  <!-- Arrow: MODIFY → VERIFY -->
  <path d="M 658 108 Q 726 130 726 178" fill="none" stroke="#58a6ff" stroke-width="2" marker-end="url(#arr-blue)"/>
  <!-- Arrow: VERIFY → KEEP/DISCARD -->
  <path d="M 726 222 Q 726 268 672 290" fill="none" stroke="#58a6ff" stroke-width="2" marker-end="url(#arr-blue)"/>
  <!-- Arrow: KEEP/DISCARD → REPEAT -->
  <path d="M 548 300 Q 488 282 488 222" fill="none" stroke="#30a14e" stroke-width="2" marker-end="url(#arr-green)"/>
  <!-- Arrow: REPEAT → MODIFY -->
  <path d="M 488 178 Q 488 118 558 104" fill="none" stroke="#30a14e" stroke-width="2" marker-end="url(#arr-green)"/>

  <!-- Node: MODIFY -->
  <rect x="558" y="82" width="104" height="36" rx="8" fill="#161b22" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="610" y="105" font-family="'Segoe UI',system-ui,sans-serif" font-size="13" font-weight="700" fill="#58a6ff" text-anchor="middle">MODIFY</text>

  <!-- Node: VERIFY -->
  <rect x="674" y="182" width="104" height="36" rx="8" fill="#161b22" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="726" y="205" font-family="'Segoe UI',system-ui,sans-serif" font-size="13" font-weight="700" fill="#58a6ff" text-anchor="middle">VERIFY</text>

  <!-- Node: KEEP / DISCARD -->
  <rect x="524" y="282" width="172" height="36" rx="8" fill="#161b22" stroke="#30a14e" stroke-width="1.5"/>
  <text x="610" y="300" font-family="'Segoe UI',system-ui,sans-serif" font-size="12" font-weight="700" fill="#30a14e" text-anchor="middle">KEEP</text>
  <text x="610" y="313" font-family="'Segoe UI',system-ui,sans-serif" font-size="10" fill="#6e7681" text-anchor="middle">or discard + reset</text>

  <!-- Node: REPEAT -->
  <rect x="438" y="182" width="104" height="36" rx="8" fill="#161b22" stroke="#30a14e" stroke-width="1.5"/>
  <text x="490" y="205" font-family="'Segoe UI',system-ui,sans-serif" font-size="13" font-weight="700" fill="#30a14e" text-anchor="middle">REPEAT</text>

  <!-- Center label -->
  <text x="610" y="194" font-family="'Segoe UI',system-ui,sans-serif" font-size="11" fill="#6e7681" text-anchor="middle">autonomous</text>
  <text x="610" y="210" font-family="'Segoe UI',system-ui,sans-serif" font-size="11" fill="#6e7681" text-anchor="middle">loop</text>

  <!-- ===== RIGHT: Terminal window ===== -->
  <!-- Window chrome -->
  <rect x="858" y="56" width="306" height="288" rx="10" fill="#161b22" stroke="#30363d" stroke-width="1"/>
  <!-- Title bar -->
  <rect x="858" y="56" width="306" height="34" rx="10" fill="#21262d"/>
  <rect x="858" y="72" width="306" height="18" fill="#21262d"/>
  <!-- Traffic lights -->
  <circle cx="882" cy="73" r="5.5" fill="#ff5f57"/>
  <circle cx="902" cy="73" r="5.5" fill="#ffbd2e"/>
  <circle cx="922" cy="73" r="5.5" fill="#28c840"/>
  <!-- Window title -->
  <text x="1011" y="77" font-family="'Segoe UI',system-ui,sans-serif" font-size="11" fill="#6e7681" text-anchor="middle">autoresearch</text>

  <!-- Column headers -->
  <text x="874" y="116" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#6e7681">iter   metric   result</text>
  <line x1="874" y1="122" x2="1148" y2="122" stroke="#30363d" stroke-width="1"/>

  <!-- Iteration rows -->
  <text x="874" y="142" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#30a14e">001    94.2     ✓ keep</text>
  <text x="874" y="160" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#f85149">002    93.8     ✗ discard</text>
  <text x="874" y="178" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#30a14e">003    96.1     ✓ keep</text>
  <text x="874" y="196" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#30a14e">004    97.4     ✓ keep</text>
  <text x="874" y="214" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#f85149">005    97.1     ✗ discard</text>
  <text x="874" y="232" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#30a14e">006    99.0     ✓ keep</text>
  <text x="874" y="250" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#6e7681">007    ...</text>

  <!-- Best metric footer bar -->
  <rect x="858" y="292" width="306" height="52" rx="0" fill="#0d2818"/>
  <rect x="858" y="292" width="306" height="52" rx="0" fill="none" stroke="#30363d" stroke-width="0"/>
  <rect x="867" y="300" width="3" height="28" rx="1.5" fill="#30a14e"/>
  <text x="880" y="314" font-family="'Cascadia Code','Fira Code',monospace" font-size="11" fill="#30a14e">best: 99.0  (+5.1%)  4 kept</text>
  <text x="880" y="330" font-family="'Cascadia Code','Fira Code',monospace" font-size="10" fill="#6e7681">→ autoresearch-report.md</text>
</svg>
```

- [ ] **Step 2: Verify SVG renders in browser**

Open `assets/autoresearch-loop.svg` directly in a browser (drag and drop). Confirm:

- Dark background (#0d1117) fills the canvas
- Three sections visible: left title, center diamond loop, right terminal
- All four loop nodes labeled and connected with arrows
- Terminal shows green/red iteration rows

- [ ] **Step 3: Remove temp .gitkeep from assets/**

```bash
rm -f assets/.gitkeep
git add assets/autoresearch-loop.svg
git commit -m "feat: add hero SVG banner — night-mode loop diagram"
```

---

## Task 3: GitHub Pages Landing Page

**Files:**

- Create: `docs/index.html`

- [ ] **Step 1: Create docs/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>autoresearch — Autonomous Iteration Engine for Claude Code</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      :root {
        --bg: #0d1117;
        --bg2: #161b22;
        --bg3: #21262d;
        --border: #30363d;
        --text: #e6edf3;
        --muted: #8b949e;
        --green: #30a14e;
        --blue: #58a6ff;
        --pink: #ea4aaa;
      }
      body {
        background: var(--bg);
        color: var(--text);
        font-family:
          "Segoe UI",
          system-ui,
          -apple-system,
          sans-serif;
        line-height: 1.6;
      }
      a {
        color: var(--blue);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 24px;
      }

      header {
        padding: 56px 0 40px;
        text-align: center;
        border-bottom: 1px solid var(--border);
      }
      header h1 {
        font-size: 2.8rem;
        font-weight: 700;
        letter-spacing: -1px;
      }
      header .tagline {
        color: var(--muted);
        margin-top: 10px;
        font-size: 1.05rem;
        max-width: 520px;
        margin-left: auto;
        margin-right: auto;
      }
      .badges {
        margin-top: 18px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .hero-img {
        margin: 40px 0 0;
        border-radius: 10px;
        border: 1px solid var(--border);
        overflow: hidden;
      }
      .hero-img img {
        width: 100%;
        display: block;
      }

      .install {
        margin: 48px 0;
      }
      .install h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 14px;
      }
      .install-box {
        background: var(--bg2);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .install-box code {
        font-family: "Cascadia Code", "Fira Code", "Courier New", monospace;
        font-size: 0.88rem;
        color: var(--green);
        flex: 1;
        word-break: break-all;
      }
      .copy-btn {
        flex-shrink: 0;
        background: var(--bg3);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 6px;
        padding: 6px 14px;
        cursor: pointer;
        font-size: 0.82rem;
        transition: all 0.15s;
      }
      .copy-btn:hover {
        background: var(--border);
      }
      .copy-btn.copied {
        color: var(--green);
        border-color: var(--green);
      }

      section {
        margin: 52px 0;
      }
      section h2 {
        font-size: 1.35rem;
        font-weight: 600;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
      }
      th,
      td {
        padding: 10px 14px;
        text-align: left;
        border: 1px solid var(--border);
      }
      th {
        background: var(--bg2);
        color: var(--muted);
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      tr:hover td {
        background: var(--bg2);
      }
      td code {
        font-family: "Cascadia Code", "Fira Code", monospace;
        font-size: 0.82rem;
        color: var(--blue);
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }
      .step {
        background: var(--bg2);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 22px;
      }
      .step .num {
        font-size: 2.2rem;
        font-weight: 700;
        color: var(--blue);
        line-height: 1;
        margin-bottom: 10px;
      }
      .step h3 {
        font-size: 1rem;
        margin-bottom: 6px;
      }
      .step p {
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.5;
      }

      footer {
        margin-top: 72px;
        padding: 36px 0;
        border-top: 1px solid var(--border);
        text-align: center;
        color: var(--muted);
        font-size: 0.88rem;
      }
      footer .links {
        margin-bottom: 14px;
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .sponsor {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--pink);
        font-size: 1rem;
        font-weight: 500;
      }
      .sponsor:hover {
        color: var(--pink);
        opacity: 0.85;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>autoresearch</h1>
        <p class="tagline">
          Autonomous iteration engine for Claude Code. Fire it before bed.
          Review improvements in the morning.
        </p>
        <div class="badges">
          <img
            src="https://img.shields.io/github/v/release/Maleick/claude-autoresearch?style=flat-square&label=release"
            alt="release"
          />
          <img
            src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"
            alt="license"
          />
          <img
            src="https://img.shields.io/badge/status-Active-green?style=flat-square"
            alt="status"
          />
          <img
            src="https://img.shields.io/badge/compatible-Claude%20Code-blueviolet?style=flat-square"
            alt="claude code"
          />
          <img
            src="https://img.shields.io/github/sponsors/Maleick?label=Sponsor&logo=GitHub&color=EA4AAA&style=flat-square"
            alt="sponsor"
          />
        </div>
      </header>

      <div class="hero-img">
        <img
          src="../assets/autoresearch-loop.svg"
          alt="Autoresearch — Modify, Verify, Keep or Discard, Repeat"
        />
      </div>

      <div class="install">
        <h2>Install</h2>
        <div class="install-box">
          <code id="install-cmd"
            >claude plugin marketplace add Maleick/claude-autoresearch
            &amp;&amp; claude plugin install
            autoresearch@Maleick-claude-autoresearch</code
          >
          <button class="copy-btn" id="copy-btn" onclick="copyInstall()">
            Copy
          </button>
        </div>
      </div>

      <section id="commands">
        <h2>Commands</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/autoresearch</code></td>
              <td>Core autonomous loop — runs unattended</td>
            </tr>
            <tr>
              <td><code>/autoresearch:plan</code></td>
              <td>Interactive setup wizard — builds your config</td>
            </tr>
            <tr>
              <td><code>/autoresearch:debug</code></td>
              <td>Scientific-method bug hunting</td>
            </tr>
            <tr>
              <td><code>/autoresearch:fix</code></td>
              <td>Iterative error repair until zero remain</td>
            </tr>
            <tr>
              <td><code>/autoresearch:security</code></td>
              <td>STRIDE + OWASP Top 10 + red-team audit</td>
            </tr>
            <tr>
              <td><code>/autoresearch:learn</code></td>
              <td>Autonomous codebase documentation engine</td>
            </tr>
            <tr>
              <td><code>/autoresearch:predict</code></td>
              <td>Multi-persona expert swarm analysis</td>
            </tr>
            <tr>
              <td><code>/autoresearch:scenario</code></td>
              <td>Edge case and use-case generator</td>
            </tr>
            <tr>
              <td><code>/autoresearch:ship</code></td>
              <td>8-phase shipping workflow</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="how-it-works">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step">
            <div class="num">1</div>
            <h3>Set a Goal</h3>
            <p>
              Tell autoresearch what to optimize — bundle size, test speed,
              coverage — and supply a verification command that outputs a
              number.
            </p>
          </div>
          <div class="step">
            <div class="num">2</div>
            <h3>Run the Loop</h3>
            <p>
              autoresearch makes one atomic change, measures it, keeps
              improvements, discards regressions, and repeats — all on an
              isolated branch, fully unattended.
            </p>
          </div>
          <div class="step">
            <div class="num">3</div>
            <h3>Review in the Morning</h3>
            <p>
              Every kept change is a git commit. You wake up to a structured
              report and a branch ready to merge or discard.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <div class="links">
          <a href="https://github.com/Maleick/claude-autoresearch">GitHub</a>
          <a
            href="https://github.com/Maleick/claude-autoresearch/blob/main/README.md"
            >Docs</a
          >
          <a
            href="https://github.com/Maleick/claude-autoresearch/blob/main/CHANGELOG.md"
            >Changelog</a
          >
          <a href="https://github.com/Maleick/claude-autoresearch/issues"
            >Issues</a
          >
          <a
            href="https://github.com/Maleick/claude-autoresearch/blob/main/LICENSE"
            >MIT License</a
          >
        </div>
        <a href="https://github.com/sponsors/Maleick" class="sponsor"
          >☕ Keep the loop running</a
        >
        <p style="margin-top: 14px; font-size: 0.8rem;">
          Made for <a href="https://claude.ai/claude-code">Claude Code</a> ·
          Team Operator Red
        </p>
      </footer>
    </div>

    <script>
      function copyInstall() {
        const raw =
          "claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch";
        navigator.clipboard
          .writeText(raw)
          .then(() => {
            const btn = document.getElementById("copy-btn");
            btn.textContent = "Copied!";
            btn.classList.add("copied");
            setTimeout(() => {
              btn.textContent = "Copy";
              btn.classList.remove("copied");
            }, 2000);
          })
          .catch(() => {
            const btn = document.getElementById("copy-btn");
            btn.textContent = "Failed";
            setTimeout(() => {
              btn.textContent = "Copy";
            }, 2000);
          });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verify HTML opens correctly**

Open `docs/index.html` in a browser. Confirm:

- Dark background, title renders, badges load
- Hero SVG image visible (path `../assets/autoresearch-loop.svg` resolves from `docs/`)
- Copy button visible next to install command
- All 3 "How It Works" step cards render
- Sponsor link at footer shows pink

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat: add GitHub Pages landing page — dark theme, install one-liner, commands, sponsor"
```

---

## Task 4: GitHub Actions — release.yml

**Files:**

- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create release workflow**

```yaml
name: Release

on:
  push:
    tags:
      - "v*.*.*"

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract CHANGELOG section
        id: changelog
        run: |
          VERSION="${GITHUB_REF_NAME#v}"
          # Extract the block between ## [VERSION] and the next ## [
          BODY=$(awk "/^## \[${VERSION}\]/{found=1; next} found && /^## \[/{exit} found{print}" CHANGELOG.md)
          if [ -z "$BODY" ]; then
            BODY="See CHANGELOG.md for details."
          fi
          {
            echo 'body<<RELEASE_EOF'
            echo "$BODY"
            echo 'RELEASE_EOF'
          } >> "$GITHUB_OUTPUT"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          name: "Autoresearch ${{ github.ref_name }}"
          body: ${{ steps.changelog.outputs.body }}
          draft: false
          prerelease: false
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))" && echo "YAML valid"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow — auto-create GitHub Release from CHANGELOG on version tag"
```

---

## Task 5: GitHub Actions — validate.yml + FUNDING.yml

**Files:**

- Create: `.github/workflows/validate.yml`
- Create: `.github/FUNDING.yml`

- [ ] **Step 1: Create FUNDING.yml**

```yaml
github: Maleick
```

- [ ] **Step 2: Create validate.yml**

```yaml
name: Validate Plugin

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check version consistency
        run: |
          PLUGIN_VER=$(python3 -c "import json; print(json.load(open('plugins/autoresearch/.claude-plugin/plugin.json'))['version'])")
          FILE_VER=$(cat VERSION)
          README_MATCH=$(grep -oP '(?<=\*\*v)\d+\.\d+\.\d+(?=\*\*)' README.md | head -1 || echo "")

          ERRORS=0
          if [ "$PLUGIN_VER" != "$FILE_VER" ]; then
            echo "ERROR: plugin.json ($PLUGIN_VER) != VERSION file ($FILE_VER)"
            ERRORS=$((ERRORS+1))
          fi
          if [ -n "$README_MATCH" ] && [ "$PLUGIN_VER" != "$README_MATCH" ]; then
            echo "ERROR: plugin.json ($PLUGIN_VER) != README.md version badge ($README_MATCH)"
            ERRORS=$((ERRORS+1))
          fi
          if [ "$ERRORS" -eq 0 ]; then
            echo "Version consistency OK: $PLUGIN_VER"
          else
            exit 1
          fi

      - name: Check command frontmatter
        run: |
          ERRORS=0
          for f in plugins/autoresearch/commands/autoresearch/*.md plugins/autoresearch/commands/autoresearch.md; do
            [ -f "$f" ] || continue
            if ! grep -qP '^name:' "$f"; then
              echo "ERROR: $f missing 'name:'"
              ERRORS=$((ERRORS+1))
            fi
            if ! grep -qP '^description:' "$f"; then
              echo "ERROR: $f missing 'description:'"
              ERRORS=$((ERRORS+1))
            fi
          done
          # Sub-commands also need argument-hint
          for f in plugins/autoresearch/commands/autoresearch/*.md; do
            [ -f "$f" ] || continue
            if ! grep -qP '^argument-hint:' "$f"; then
              echo "ERROR: $f missing 'argument-hint:'"
              ERRORS=$((ERRORS+1))
            fi
          done
          if [ "$ERRORS" -gt 0 ]; then
            echo "$ERRORS frontmatter error(s) found"
            exit 1
          fi
          echo "Frontmatter OK"

      - name: Check workflow cross-references
        run: |
          ERRORS=0
          for f in plugins/autoresearch/commands/autoresearch/*.md; do
            [ -f "$f" ] || continue
            CMD=$(basename "$f" .md)
            REF="plugins/autoresearch/skills/autoresearch/references/${CMD}-workflow.md"
            if [ ! -f "$REF" ]; then
              echo "ERROR: command $CMD has no matching $REF"
              ERRORS=$((ERRORS+1))
            fi
          done
          if [ "$ERRORS" -gt 0 ]; then
            echo "$ERRORS cross-reference error(s) found"
            exit 1
          fi
          echo "Cross-references OK"
```

- [ ] **Step 3: Verify both YAMLs are valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/validate.yml'))" && echo "validate.yml valid"
python3 -c "import yaml; yaml.safe_load(open('.github/FUNDING.yml'))" && echo "FUNDING.yml valid"
```

Expected: both print "valid"

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/validate.yml .github/FUNDING.yml
git commit -m "ci: add validate workflow + GitHub Sponsors FUNDING.yml"
```

---

## Task 6: Architecture Doc

**Files:**

- Create: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Create docs/ARCHITECTURE.md**

```markdown
# Autoresearch Architecture

> Current reference for v2.2.0. The historical design spec is at `docs/specs/2026-03-30-autoresearch-design.md`.

## Plugin Structure

Autoresearch is a pure-markdown Claude Code plugin. There is no build step, no compilation, and no runtime binary. Claude Code reads the markdown files directly as commands and skills.
```

.claude-plugin/marketplace.json ← marketplace registry
plugins/autoresearch/
.claude-plugin/plugin.json ← plugin manifest (name, version, autoUpdate)
commands/
autoresearch.md ← main command — wizard + direct execution
autoresearch/ ← sub-commands
debug.md, fix.md, learn.md,
plan.md, predict.md, scenario.md,
security.md, ship.md
skills/autoresearch/
SKILL.md ← shared invariants, stop conditions, artifact list
references/
autonomous-loop-protocol.md ← core phase loop (Phases 0–8)
state-management.md ← checkpoint/resume protocol
results-logging.md ← TSV log format and schema
debug-workflow.md ← 7-phase debug investigation
fix-workflow.md ← error repair loop
learn-workflow.md ← documentation generation
plan-workflow.md ← setup wizard
predict-workflow.md ← multi-persona analysis
scenario-workflow.md ← edge case generation
security-workflow.md ← STRIDE + OWASP audit
ship-workflow.md ← 8-phase shipping checklist

```

## Execution Flow

When a user runs `/autoresearch`, Claude Code:

1. Reads `commands/autoresearch.md` — parses arguments, decides wizard vs. direct
2. Reads `skills/autoresearch/SKILL.md` — loads shared invariants (these apply to all commands)
3. Reads `references/autonomous-loop-protocol.md` — executes phases 0–8

Sub-commands follow the same pattern: `commands/autoresearch/fix.md` → `SKILL.md` → `references/fix-workflow.md`.

## Core Loop Phases

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Pre-flight | Validate params, check git status, create isolated branch |
| 1 | Baseline | Run Verify command on current state, record baseline metric |
| 2 | Pre-flight check | Detect duplicate changes, check disk space, verify Guard passes |
| 2.5 | Generate | Make one atomic change in Scope files |
| 3 | Commit | `git add -A && git commit` |
| 4 | Verify | Run Verify command, extract metric |
| 4.5 | Reproduce | Re-run Verify to confirm metric is stable (guards against flaky commands) |
| 5 | Guard | Run Guard command if set, check exit 0 |
| 6 | Evaluate | Compare metric to best. Keep if improved; discard (`git reset --hard HEAD~1`) if not |
| 7 | Log | Append row to `autoresearch-results.tsv` |
| 8 | Loop | Increment iteration counter, check all stop conditions, goto Phase 2 or stop |

## State Machine

State is checkpointed to `autoresearch-state.json` after every phase. This enables `--resume` after crashes.

Schema fields: `run_id`, `schema_version`, `branch`, `iteration`, `max_iterations`, `best_metric`, `direction`, `goal`, `scope`, `verify_cmd`, `guard_cmd`, `start_time`, `duration_limit`, `discarded_descriptions`.

## Safety Invariants

All 10 invariants are authoritative in `SKILL.md`. Summary:

1. Branch isolation — work only on `autoresearch/<timestamp>`
2. Clean discard — `git reset --hard HEAD~1` + `git clean -fd`, never revert commits
3. Fail-fast — missing required params → error and stop immediately
4. One atomic change per iteration
5. Mechanical verification only — metrics from commands, never LLM self-assessment
6. Guard enforcement — Guard must pass or change is discarded
7. Command timeouts — 300s default, timeout = crash
8. State persistence — checkpoint after every phase
9. Git hygiene — `git status --porcelain` checked before every iteration
10. Duplicate detection — skip changes matching previously discarded descriptions

## Runtime Artifacts

All gitignored — never committed to the repo by the loop.

| File | Created by | Purpose |
|------|-----------|---------|
| `autoresearch-state.json` | Every command | Checkpoint state for `--resume` |
| `autoresearch-results.tsv` | Every command | Iteration log, TSV format, scoped by `run_id` |
| `autoresearch-report.md` | End of run | Human-readable report |
| `autoresearch-debug-findings.md` | `:debug` | Bug findings |
| `autoresearch-security/` | `:security` | Audit artifacts and PoC directory |
| `.autoresearch-predict/` | `:predict` | Temporary persona files |
```

- [ ] **Step 2: Verify file exists and is valid Markdown**

```bash
wc -l docs/ARCHITECTURE.md
```

Expected: 80+ lines.

- [ ] **Step 3: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: add ARCHITECTURE.md — current phase flow, state machine, invariants"
```

---

## Task 7: Wiki Pages

**Files:**

- Create: `wiki/Home.md`, `wiki/Installation.md`, `wiki/Commands.md`, `wiki/Configuration.md`, `wiki/Safety.md`, `wiki/Contributing.md`

- [ ] **Step 1: Create wiki/Home.md**

````markdown
# Autoresearch Wiki

Autonomous iteration engine for Claude Code. **v2.2.0**

## Navigation

| Page                              | Contents                                                  |
| --------------------------------- | --------------------------------------------------------- |
| [Installation](Installation.md)   | Install, update, auto-update, requirements                |
| [Commands](Commands.md)           | All 9 commands with flags and examples                    |
| [Configuration](Configuration.md) | Parameters, flags, stop conditions, metric patterns       |
| [Safety](Safety.md)               | Invariants, branch isolation, side effects, what to avoid |
| [Contributing](Contributing.md)   | Dev setup, version-bump procedure, PR checklist           |

## Quick Start

```bash
# Install
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch

# Run the wizard
/autoresearch:plan

# Or run directly
/autoresearch Goal: "Reduce bundle size" Scope: "src/**/*.ts" Metric: "bundle size KB" Verify: "npm run build 2>&1 | grep size | awk '{print \$3}'" Direction: minimize
```
````

## Core Loop

**Modify → Verify → Keep/Discard → Repeat**

autoresearch makes one small, atomic change, runs your verification command, keeps the change if the metric improved (strict improvement only), resets if it didn't, and repeats. Every kept change is a git commit on an isolated branch.

````

- [ ] **Step 2: Create wiki/Installation.md**

```markdown
# Installation

## Requirements

- [Claude Code](https://claude.ai/claude-code) with marketplace plugin support
- A git-backed codebase with a clean working tree
- A deterministic verification command that outputs a number

## One-Liner Install

```bash
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch
````

## Manual Steps

If the one-liner fails, run each step individually:

```bash
# 1. Add the marketplace source
/plugin marketplace add Maleick/claude-autoresearch

# 2. Install the plugin
/plugin install autoresearch@Maleick-claude-autoresearch

# 3. Reload to activate
/reload-plugins
```

## Updating

Auto-update is enabled by default in v2.2.0. Claude Code's marketplace poller will detect new versions automatically.

To update manually:

```bash
/plugin marketplace update Maleick/claude-autoresearch
```

To verify your installed version: **Customize > Autoresearch** — version shown at the top of the plugin panel.

## Uninstalling

```bash
/plugin uninstall autoresearch
/plugin marketplace remove Maleick/claude-autoresearch
```

````

- [ ] **Step 3: Create wiki/Commands.md**

```markdown
# Commands

## `/autoresearch` — Core Optimization Loop

Run with no arguments to launch the guided wizard, or provide parameters directly:

```bash
/autoresearch Goal: "Reduce bundle size" Scope: "src/**/*.ts" Metric: "bundle size KB" \
  Verify: "npm run build 2>&1 | grep size | awk '{print \$3}'" Direction: minimize --iterations 50
````

**Flags:** `--iterations N`, `--resume`, `--force-branch`, `--no-limit`, `--dry-run`, `--notify`

---

## `/autoresearch:plan` — Setup Wizard

Interactively builds Goal, Scope, Metric, and Verify from a description.

```bash
/autoresearch:plan "I want to speed up my test suite"
```

---

## `/autoresearch:debug` — Bug Hunter

Scientific-method investigation surfacing multiple bugs.

```bash
/autoresearch:debug --scope "src/**/*" --symptom "intermittent timeout in auth module" --iterations 10
```

**Flags:** `--fix`, `--scope`, `--symptom`, `--severity`, `--technique`, `--iterations`, `--output`

---

## `/autoresearch:fix` — Error Repair Loop

Fixes errors one at a time until zero remain.

```bash
/autoresearch:fix --target "npm test" --scope "src/**/*.ts" --iterations 20
```

**Flags:** `--target`, `--guard`, `--scope`, `--category`, `--skip-lint`, `--from-debug`, `--force-branch`, `--iterations`, `--max-attempts-per-error`

---

## `/autoresearch:security` — Security Audit

STRIDE threat model, OWASP Top 10, red-team personas.

```bash
/autoresearch:security --scope "src/**/*" --depth standard --fail-on high
```

**Flags:** `--diff`, `--fix`, `--fail-on`, `--scope`, `--depth`, `--iterations`, `--baseline`

---

## `/autoresearch:learn` — Documentation Generator

Analyzes your codebase and produces or updates docs.

```bash
/autoresearch:learn "API reference" --scope "src/api/**/*" --mode init --depth standard
```

**Flags:** `--mode`, `--scope`, `--depth`, `--file`, `--scan`, `--topics`, `--no-fix`, `--format`, `--iterations`, `--audience`

---

## `/autoresearch:predict` — Expert Analysis

Multi-persona debate across expert viewpoints.

```bash
/autoresearch:predict "error handling gaps" --scope "src/**/*" --depth standard
```

**Flags:** `--scope`, `--chain`, `--depth`, `--personas`, `--rounds`, `--adversarial`, `--budget`, `--fail-on`, `--iterations`, `--export`

---

## `/autoresearch:scenario` — Edge Case Explorer

Generates derivative scenarios from a seed.

```bash
/autoresearch:scenario "user uploads a 10GB file" --scope "src/upload/**/*" --depth deep
```

**Flags:** `--scope`, `--depth`, `--domain`, `--format`, `--focus`, `--iterations`, `--seed-from-tests`

---

## `/autoresearch:ship` — Shipping Workflow

8-phase checklist from readiness check to post-ship monitoring.

```bash
/autoresearch:ship --type code-pr --auto
```

**Flags:** `--dry-run`, `--auto`, `--force`, `--rollback`, `--monitor`, `--type`, `--target`, `--checklist-only`, `--iterations`, `--changelog`

````

- [ ] **Step 4: Create wiki/Configuration.md**

```markdown
# Configuration

## Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `Goal:` | What to improve | `"Reduce test execution time"` |
| `Scope:` | File globs to modify | `"src/**/*.ts"` |
| `Metric:` | What the verify command measures | `"test duration in seconds"` |
| `Verify:` | Command that outputs a number | `"npm test 2>&1 \| grep Time \| awk '{print \$2}'"` |

## Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `Guard:` | none | Command that must exit 0 after each change |
| `Iterations:` / `--iterations N` | 50 | Max iterations (soft cap 100, override with `--no-limit`) |
| `Duration:` | none | Max wall-clock time (`6h`, `90m`) |
| `Direction:` | maximize | `maximize` or `minimize` the metric |
| `Target:` | none | Stop when metric reaches this value |
| `MetricPattern:` | last number in stdout | Regex to extract metric (e.g. `"score: ([0-9.]+)"`) |
| `Timeout:` | 300 | Per-command timeout in seconds |
| `--no-limit` | off | Remove 100-iteration soft cap |
| `--resume` | off | Resume from `autoresearch-state.json` |

## Stop Conditions

| Condition | Trigger |
|-----------|---------|
| Iteration limit | `iteration >= max_iterations` |
| Duration limit | Wall-clock time exceeds `Duration:` |
| Metric goal | Metric reached `Target:` |
| Stuck | 10 consecutive discards |
| Plateau | Last 20 iterations had <1% cumulative improvement |
| Crash loop | 5 consecutive crashes |
| Goal satisfied | All Scope files pass verify + guard with no findings |

## MetricPattern Examples

```bash
# Default: last number in stdout
Verify: "npm test 2>&1 | tail -1"

# Named capture with regex
MetricPattern: "duration: ([0-9.]+)ms"

# Score from JSON output
Verify: "node score.js | jq '.score'"
MetricPattern: "([0-9.]+)"
````

````

- [ ] **Step 5: Create wiki/Safety.md**

```markdown
# Safety

## What autoresearch Protects

- **Your default branch** — all work happens on `autoresearch/<timestamp>`, never on main/master
- **Your commit history** — failed experiments are reset, not reverted. No commit spam
- **Your verification integrity** — metrics come from running commands, never from LLM self-assessment

## What autoresearch Does NOT Protect

- **Side effects of your Verify/Guard commands** — if your Verify command writes files, calls APIs, or modifies a database, those effects happen. autoresearch only controls git state
- **Untracked files** — `git clean -fd` runs during discard. Untracked files in the working directory may be removed
- **External resources** — if your code calls out to external services during verify, those calls happen

## The 10 Safety Invariants

Authoritative list in `SKILL.md`. These are enforced on every iteration and cannot be overridden:

1. Branch isolation — `autoresearch/<timestamp>` only, never main/master
2. Clean discard — `git reset --hard HEAD~1` + `git clean -fd`, no revert commits
3. Fail-fast — missing required params → immediate error, no interactive prompts
4. One atomic change per iteration — small, reviewable diffs only
5. Mechanical verification — metrics from commands, not LLM self-assessment
6. Guard enforcement — Guard must pass or change is discarded
7. Command timeouts — 300s default; timeout = crash; 5 consecutive crashes = stop
8. State persistence — checkpoint to `autoresearch-state.json` after every phase
9. Git hygiene — `git status --porcelain` checked at start of every iteration
10. Duplicate detection — skip changes matching previously discarded descriptions

## Before Running Overnight

```bash
# Confirm clean working tree
git status

# Test your Verify command manually first
<your verify command>  # should output a single number

# Test your Guard command manually
<your guard command>; echo "exit: $?"  # should exit 0

# Dry-run to validate config
/autoresearch Goal: "..." Scope: "..." Verify: "..." --dry-run
````

````

- [ ] **Step 6: Create wiki/Contributing.md**

```markdown
# Contributing

## Version Bump Procedure

When bumping the version (e.g. `2.1.0 → 2.2.0`), update **all 5 files**:

1. `plugins/autoresearch/.claude-plugin/plugin.json` — `"version"` field
2. `.claude-plugin/marketplace.json` — `"version"` field at root
3. `README.md` — version badge and `> **v2.2.0**` line
4. `CHANGELOG.md` — new `## [2.2.0] - YYYY-MM-DD` section at top
5. `VERSION` — single line, no trailing newline: `2.2.0`

Missing any one of these will cause the `validate.yml` CI check to fail.

## Adding a Sub-command

1. Create `plugins/autoresearch/commands/autoresearch/<name>.md` with required frontmatter:
   ```yaml
   ---
   name: autoresearch:<name>
   description: <one line>
   argument-hint: "<flags>"
   ---
````

2. Create `plugins/autoresearch/skills/autoresearch/references/<name>-workflow.md`
3. Reference the workflow file from the command (see existing sub-commands for the pattern)
4. Add the command to `README.md` command table and Command Reference section
5. Add it to `wiki/Commands.md`

## Modifying a Workflow Protocol

When editing a `references/*-workflow.md` file:

- Verify the corresponding command still reads it correctly (check the `## Execution` section of the command `.md`)
- Use decimal phase numbering when inserting new phases (e.g., `Phase 2.5`) to avoid renumbering
- Update `docs/ARCHITECTURE.md` phase table if phase numbering changes

## PR Checklist

- [ ] All 5 version files updated (or no version bump needed)
- [ ] No TBDs or incomplete sections in any modified markdown
- [ ] Frontmatter fields present: `name`, `description`, `argument-hint` (sub-commands)
- [ ] If new sub-command: corresponding `*-workflow.md` exists
- [ ] `CHANGELOG.md` has an entry for this change
- [ ] `wiki/` updated if commands or configuration changed

````

- [ ] **Step 7: Remove .gitkeep from wiki/, commit all wiki files**

```bash
rm -f wiki/.gitkeep
git add wiki/
git commit -m "docs: add wiki — Installation, Commands, Configuration, Safety, Contributing"
````

---

## Task 8: Plugin Manifests Update

**Files:**

- Modify: `plugins/autoresearch/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Update plugin.json — bump version, add autoUpdate**

Edit `plugins/autoresearch/.claude-plugin/plugin.json`:

```json
{
  "name": "autoresearch",
  "version": "2.2.0",
  "autoUpdate": true,
  "description": "Autonomous iteration engine for git-backed codebases. Set a goal and a verification command — autoresearch modifies code, measures results, keeps improvements, and discards regressions. Run it for 5 iterations or 500.",
  "author": {
    "name": "Maleick"
  },
  "repository": "https://github.com/Maleick/claude-autoresearch",
  "license": "MIT"
}
```

- [ ] **Step 2: Update marketplace.json — bump version, add autoUpdate to plugin entry**

Edit `.claude-plugin/marketplace.json`:

```json
{
  "name": "autoresearch",
  "version": "2.2.0",
  "owner": {
    "name": "Maleick",
    "email": ""
  },
  "plugins": [
    {
      "name": "autoresearch",
      "description": "Autonomous iteration engine for git-backed codebases. Set a goal and a verification command — autoresearch modifies code, measures results, keeps improvements, and discards regressions.",
      "source": "./plugins/autoresearch",
      "category": "development",
      "autoUpdate": true
    }
  ]
}
```

- [ ] **Step 3: Verify JSON is valid**

```bash
python3 -c "import json; json.load(open('plugins/autoresearch/.claude-plugin/plugin.json')); print('plugin.json OK')"
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('marketplace.json OK')"
```

Expected: both print OK.

- [ ] **Step 4: Commit**

```bash
git add plugins/autoresearch/.claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "feat: bump to v2.2.0, enable autoUpdate in plugin manifests"
```

---

## Task 9: README Overhaul

**Files:**

- Modify: `README.md`

This task rewrites the README structure to match AutoShip's section order and adds the Mermaid charts, Sponsor badge, hero graphic, and one-liner install. The existing content is preserved — only structure, additions, and the version badge change.

- [ ] **Step 1: Replace the badge block + header to add Sponsor badge and hero graphic**

Find the current badge block (lines 1–13 approximately). Replace the entire badges section and tagline with:

```markdown
# Autoresearch

[![GitHub Release](https://img.shields.io/github/v/release/Maleick/claude-autoresearch?style=flat-square&label=release)](https://github.com/Maleick/claude-autoresearch/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Language](https://img.shields.io/badge/language-Markdown-brightgreen?style=flat-square)](plugins/autoresearch/commands/autoresearch.md)
[![Last Commit](https://img.shields.io/github/last-commit/Maleick/claude-autoresearch?style=flat-square)](https://github.com/Maleick/claude-autoresearch/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/Maleick/claude-autoresearch?style=flat-square)](https://github.com/Maleick/claude-autoresearch/stargazers)
[![Status](https://img.shields.io/badge/status-Active-green?style=flat-square)](CHANGELOG.md)
[![Claude Code](https://img.shields.io/badge/compatible-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/download)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square)](.)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Sponsor](https://img.shields.io/github/sponsors/Maleick?label=Sponsor&logo=GitHub&color=EA4AAA&style=flat-square)](https://github.com/sponsors/Maleick)

![Autoresearch loop diagram](assets/autoresearch-loop.svg)

> **v2.2.0** — [Website](https://maleick.github.io/claude-autoresearch/) · [Issues](https://github.com/Maleick/claude-autoresearch/issues)

Autonomous overnight iteration engine for [Claude Code](https://claude.ai/claude-code). Fire it before bed, review improvements in the morning.

Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch). Applies constraint-driven autonomous iteration to any git-backed codebase with a deterministic verification command.

**Core loop:** Modify → Verify → Keep/Discard → Repeat.
```

- [ ] **Step 2: Replace the Install section with the one-liner**

Find the current `### Install` block and replace it:

````markdown
### Install

```bash
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch
```
````

<details>
<summary>Manual steps</summary>

```bash
# Add the marketplace source
/plugin marketplace add Maleick/claude-autoresearch

# Install the plugin
/plugin install autoresearch@Maleick-claude-autoresearch

# Reload to activate
/reload-plugins
```

</details>
```

- [ ] **Step 3: Replace the Update section**

````markdown
### Update

Auto-update is enabled by default in v2.2.0 — the marketplace poller detects new versions automatically.

To update manually:

```bash
/plugin marketplace update Maleick/claude-autoresearch
```
````

````

- [ ] **Step 4: Add "How It Works" section with Mermaid core loop chart**

Insert this section between the Commands table and the "Running Overnight" section:

```markdown
## How It Works

```mermaid
flowchart TD
    A([Start]) --> B[Phase 0: Pre-flight\ngit status · params · branch]
    B --> C[Phase 1: Baseline\nrun Verify — record metric]
    C --> D[Phase 2: Generate\none atomic change in Scope]
    D --> E[Phase 3: Commit]
    E --> F[Phase 4: Verify\nrun metric command]
    F --> G{Improved?}
    G -- yes --> H[Keep commit\nupdate best metric]
    G -- no --> I[Discard\ngit reset --hard HEAD~1]
    H --> J{Stop condition?}
    I --> J
    J -- iterations exhausted --> K([Write Report])
    J -- duration exceeded --> K
    J -- target reached --> K
    J -- 10 consecutive discards --> K
    J -- plateau detected --> K
    J -- 5 crash loop --> K
    J -- no --> D
````

````

- [ ] **Step 5: Add "Architecture" section with plugin structure Mermaid chart**

Insert after the "How It Works" section:

```markdown
## Architecture

```mermaid
flowchart LR
    subgraph Commands
        AR[/autoresearch]
        PL[/autoresearch:plan]
        DB[/autoresearch:debug]
        FX[/autoresearch:fix]
        SC[/autoresearch:security]
        LN[/autoresearch:learn]
        PR[/autoresearch:predict]
        SN[/autoresearch:scenario]
        SH[/autoresearch:ship]
    end

    subgraph Skill["SKILL.md — shared invariants"]
        SK[Safety rules\nStop conditions\nArtifact list]
    end

    subgraph References
        LP[autonomous-loop-protocol]
        SM[state-management]
        RL[results-logging]
        WF["*-workflow.md × 8"]
    end

    AR & PL & DB & FX & SC & LN & PR & SN & SH --> SK
    SK --> LP & SM & RL & WF
````

Each command reads `SKILL.md` for shared invariants, then reads its corresponding `*-workflow.md` reference for the specific execution protocol.

````

- [ ] **Step 6: Add sponsor footer before License section**

Insert before `## License`:

```markdown
---

☕ [Keep the loop running](https://github.com/sponsors/Maleick)
````

- [ ] **Step 7: Verify README renders correctly**

````bash
# Check Mermaid blocks are properly fenced
grep -c '```mermaid' README.md
````

Expected: `2` (one for each diagram)

```bash
# Check sponsor link present
grep -c "Keep the loop running" README.md
```

Expected: `1`

```bash
# Check version
grep "v2.2.0" README.md | head -3
```

Expected: at least 2 matches (badge line and `> **v2.2.0**` line)

- [ ] **Step 8: Commit**

```bash
git add README.md
git commit -m "docs: overhaul README — Mermaid charts, one-liner install, Sponsor badge, hero graphic, v2.2.0"
```

---

## Task 10: Supporting Docs + CHANGELOG

**Files:**

- Modify: `CONTRIBUTING.md`
- Modify: `CLAUDE.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update CONTRIBUTING.md — add VERSION to version-bump checklist**

Find the version-bump section in CONTRIBUTING.md and add `VERSION` to the file list. The exact text to find and replace will depend on the current content. The checklist should read:

```markdown
1. `plugins/autoresearch/.claude-plugin/plugin.json` — `"version"` field
2. `.claude-plugin/marketplace.json` — `"version"` field at root
3. `README.md` — version badge and `> **vX.Y.Z**` line
4. `CHANGELOG.md` — new `## [X.Y.Z] - YYYY-MM-DD` section at top
5. `VERSION` — single line at repo root, no trailing newline: `X.Y.Z`
```

- [ ] **Step 2: Update CLAUDE.md — add VERSION to version-bump checklist**

In the "Version Bump Procedure" section of `CLAUDE.md`, update the instruction to list 5 files (adding `VERSION`).

- [ ] **Step 3: Add CHANGELOG v2.2.0 entry**

Insert at the top of `CHANGELOG.md`, immediately after the `# Changelog` heading and intro paragraph:

```markdown
## [2.2.0] - 2026-04-13

### Added

- One-liner install command — `claude plugin marketplace add && claude plugin install` in one shot
- Auto-update enabled by default via `"autoUpdate": true` in plugin manifests
- Hero graphic (`assets/autoresearch-loop.svg`) — night-mode SVG banner for README and GitHub Pages
- GitHub Pages landing page (`docs/index.html`) — dark-theme project site with install one-liner, command table, and how-it-works section
- GitHub Actions `release.yml` — auto-creates GitHub Releases from CHANGELOG on version tags
- GitHub Actions `validate.yml` — PR checks for frontmatter, cross-references, and version consistency
- GitHub Sponsors support — `.github/FUNDING.yml`, Sponsor badge in badge row, `☕ Keep the loop running` footer link
- Architecture doc (`docs/ARCHITECTURE.md`) — current phase flow, state machine, invariants, artifact lifecycle
- Wiki (`wiki/`) — 6-page reference covering installation, commands, configuration, safety, and contributing
- `VERSION` file at repo root for cross-file version consistency checking
- Mermaid flowcharts in README — core loop diagram and plugin architecture diagram
- GitHub repo topics for discoverability
- README restructured to match AutoShip layout: one-liner above the fold, How It Works + Architecture sections added
```

- [ ] **Step 4: Commit**

```bash
git add CONTRIBUTING.md CLAUDE.md CHANGELOG.md
git commit -m "docs: update CONTRIBUTING + CLAUDE.md for VERSION file; add v2.2.0 CHANGELOG entry"
```

---

## Task 11: GitHub Metadata, Pages, Tag, Push

- [ ] **Step 1: Set GitHub repo topics**

```bash
gh repo edit Maleick/claude-autoresearch \
  --add-topic claude-code \
  --add-topic claude \
  --add-topic autonomous \
  --add-topic ai-agent \
  --add-topic plugin \
  --add-topic iteration-engine \
  --add-topic autoresearch
```

- [ ] **Step 2: Enable GitHub Pages pointed at main/docs**

```bash
gh api repos/Maleick/claude-autoresearch/pages \
  --method POST \
  --field source='{"branch":"main","path":"/docs"}' \
  2>/dev/null || echo "Pages may already exist — check settings"
```

If this errors (Pages already enabled with different config), update instead:

```bash
gh api repos/Maleick/claude-autoresearch/pages \
  --method PUT \
  --field source='{"branch":"main","path":"/docs"}'
```

- [ ] **Step 3: Get the Pages URL and set as repo homepage**

```bash
PAGES_URL=$(gh api repos/Maleick/claude-autoresearch/pages --jq '.html_url' 2>/dev/null || echo "https://maleick.github.io/claude-autoresearch/")
echo "Pages URL: $PAGES_URL"
gh repo edit Maleick/claude-autoresearch --homepage "$PAGES_URL"
```

- [ ] **Step 4: Update README Website badge with the confirmed Pages URL**

In `README.md`, find the line:

```
> **v2.2.0** — [Website](https://maleick.github.io/claude-autoresearch/) · [Issues]...
```

Confirm the URL matches the actual Pages URL from Step 3. If different, update it.

Commit if changed:

```bash
git add README.md
git commit -m "docs: update website URL to confirmed GitHub Pages URL"
```

- [ ] **Step 5: Push all commits to main**

```bash
git push origin main
```

Expected: no errors, all 10+ commits pushed.

- [ ] **Step 6: Tag v2.2.0 and push tag**

```bash
git tag v2.2.0
git push origin v2.2.0
```

Expected: tag pushed. The `release.yml` workflow will fire automatically and create the GitHub Release with the CHANGELOG v2.2.0 section as the body.

- [ ] **Step 7: Verify release was created**

Wait ~60 seconds for Actions to complete, then:

```bash
gh release view v2.2.0
```

Expected: Release shows title "Autoresearch v2.2.0" and body contains the CHANGELOG content.

- [ ] **Step 8: Update .wolf/anatomy.md and .wolf/memory.md**

Append new entries to `.wolf/anatomy.md` for all new files:

```
## assets/
- `autoresearch-loop.svg` — 1200×400 night-mode SVG hero banner (~3000 tok)

## docs/
- `index.html` — GitHub Pages dark-theme landing page (~2800 tok)
- `ARCHITECTURE.md` — Current architecture reference: phases, state machine, invariants (~1800 tok)

## .github/workflows/
- `release.yml` — Auto-creates GitHub Release from CHANGELOG on v* tags (~400 tok)
- `validate.yml` — PR CI: frontmatter, cross-refs, version consistency (~600 tok)

## .github/
- `FUNDING.yml` — GitHub Sponsors config: github: Maleick (~20 tok)

## wiki/
- `Home.md` — Overview and navigation (~300 tok)
- `Installation.md` — Install, update, auto-update guide (~500 tok)
- `Commands.md` — All 9 commands with flags and examples (~1200 tok)
- `Configuration.md` — Parameters, flags, stop conditions (~800 tok)
- `Safety.md` — Invariants, side effects, what autoresearch protects (~700 tok)
- `Contributing.md` — Dev setup, version-bump (5 files), PR checklist (~600 tok)

## ./
- `VERSION` — Single-line version string: 2.2.0 (~5 tok)
```

Append to `.wolf/memory.md`:

```
| <time> | v2.2.0 shipped — Pages, hero SVG, Mermaid charts, wiki, Actions, sponsor, one-liner install | 14 new files, 6 modified | success | ~8000 |
```

- [ ] **Step 9: Final verification**

```bash
# All 5 version files consistent
grep '"version"' plugins/autoresearch/.claude-plugin/plugin.json .claude-plugin/marketplace.json
cat VERSION
grep 'v2.2.0' README.md | head -2

# All new files present
ls assets/autoresearch-loop.svg docs/index.html docs/ARCHITECTURE.md VERSION
ls .github/workflows/release.yml .github/workflows/validate.yml .github/FUNDING.yml
ls wiki/Home.md wiki/Installation.md wiki/Commands.md wiki/Configuration.md wiki/Safety.md wiki/Contributing.md
```

Expected: all files listed, all versions show `2.2.0`.

---

## Self-Review Checklist

- [x] **§1 One-liner install** → Task 9 Step 2 (README Install section)
- [x] **§2 Auto-update** → Task 8 (plugin.json + marketplace.json `autoUpdate: true`) + Task 9 Step 3 (README Update section)
- [x] **§3 Hero SVG** → Task 2; referenced in Task 9 Step 1 (README badge block)
- [x] **§4 GitHub Pages** → Task 3 (index.html) + Task 11 Steps 2–4
- [x] **§5 GitHub Actions** → Task 4 (release.yml) + Task 5 (validate.yml)
- [x] **§6a Architecture doc** → Task 6
- [x] **§6b Wiki** → Task 7
- [x] **§6c CONTRIBUTING.md** → Task 10 Step 1
- [x] **§7 VERSION file** → Task 1
- [x] **§8 GitHub metadata** → Task 11 Step 1
- [x] **§9 Version bump 2.1.0→2.2.0** → Tasks 1, 8, 10
- [x] **§10 CHANGELOG entry** → Task 10 Step 3
- [x] **§11 Mermaid charts** → Task 9 Steps 4–5
- [x] **§12 Sponsor/FUNDING** → Task 5 (FUNDING.yml) + Task 9 Steps 1, 6
- [x] **§13 README section order** → Task 9 (all steps reorder + add sections)
- [x] **Wolf files** → Task 11 Step 8
