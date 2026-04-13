# Autoresearch v2.2.0 Design Spec

**Date:** 2026-04-13  
**Author:** Maleick  
**Status:** Approved  
**Version target:** `2.1.0 → 2.2.0`  
**Approach:** Big bang — single branch, single PR, single release

---

## Summary

v2.2.0 closes the gap between autoresearch and AutoShip in terms of project polish, discoverability, and install UX. The changes are purely additive — no plugin behavior changes, no breaking changes to commands or parameters. The release adds: a one-liner install, auto-update support, a hero SVG graphic, a GitHub Pages landing page, GitHub Actions workflows, wiki docs, an architecture doc refresh, a `VERSION` file, and GitHub repo metadata (topics + homepage).

---

## 1. One-Liner Install

**Current:** 3-step process (marketplace add → plugin install → reload-plugins)  
**New:**

```bash
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch
```

**Changes:**

- Update `README.md` Quick Start → Install section to lead with the one-liner
- Keep the 3-step breakdown below it as "Manual steps" for users who need individual control
- Update `docs/index.html` (GitHub Pages) to feature the one-liner prominently

---

## 2. Auto-Update from Git

**Current:** Manual — user must run `/plugin marketplace update Maleick/claude-autoresearch`  
**New:** Enable the marketplace auto-update flag so Claude Code's built-in poller picks up new versions automatically. Document the `--update` alias in README.

**Changes:**

- `plugins/autoresearch/.claude-plugin/plugin.json` — add `"autoUpdate": true`
- `.claude-plugin/marketplace.json` — add `"autoUpdate": true` to the autoresearch entry
- `README.md` Update section — rewrite to explain auto-update is now on by default, with manual override instructions

---

## 3. Hero Graphic — `assets/autoresearch-loop.svg`

**Design concept:** Researcher at a desk, circular arrow looping around a terminal showing a git branch icon and metric graph. Night-mode palette: `#0d1117` background, `#30a14e` green (GitHub contribution green), `#58a6ff` blue accents, `#e6edf3` text. Clean, minimal, no SMIL animation (GitHub strips it).

**Dimensions:** 1200×400px (wide banner format for README header)

**Changes:**

- Create `assets/` directory
- Create `assets/autoresearch-loop.svg`
- Update `README.md` to reference the graphic below the badges and above the tagline
- Update `docs/index.html` hero section to use the same SVG

---

## 4. GitHub Pages — `docs/index.html`

**Approach:** Static HTML/CSS at `docs/index.html`, pointed at `main/docs` in GitHub Pages settings.

**Page structure:**

1. Header — logo/title, tagline, one-liner install (copy button), GitHub link
2. Hero graphic (the SVG from §3)
3. Command table (same as README)
4. "How it works" — 3-step visual: Set Goal → Run Loop → Review Morning Report
5. Footer — MIT license, GitHub link, version badge

**Design:** Dark theme matching the SVG palette. Pure HTML + inline CSS + minimal vanilla JS (copy-to-clipboard only). No frameworks, no build step.

**Changes:**

- Create `docs/index.html`
- Enable GitHub Pages in repo settings: source = `main`, folder = `/docs`
- Set repo homepage URL to the Pages URL
- Update README badges to include a "Website" badge pointing to the Pages URL

---

## 5. GitHub Actions Workflows — `.github/workflows/`

### 5a. `release.yml`

**Trigger:** Push of tag matching `v*.*.*`  
**Steps:**

1. Extract CHANGELOG section for the tagged version
2. Create GitHub Release with that section as the release body
3. Upload no artifacts (pure-markdown plugin — nothing to build)

### 5b. `validate.yml`

**Trigger:** Pull requests to `main`  
**Steps:**

1. Check all plugin `.md` files have required frontmatter fields (`name`, `description`, `argument-hint` for commands)
2. Check cross-references: each `commands/autoresearch/*.md` references an existing file in `references/`
3. Check `plugin.json` version matches `README.md` version badge and `VERSION` file
4. Fail PR if any check fails, with a clear error message

**Changes:**

- Create `.github/` directory
- Create `.github/workflows/release.yml`
- Create `.github/workflows/validate.yml`

---

## 6. Documentation Updates

### 6a. Architecture doc

Replace the historical `docs/specs/2026-03-30-autoresearch-design.md` with a current `docs/ARCHITECTURE.md` describing:

- Plugin structure (commands → skills → references)
- Phase flow (0–8 from autonomous-loop-protocol)
- State machine (checkpoint/resume)
- Safety invariants and why each exists
- Artifact lifecycle

### 6b. Wiki directory — `wiki/`

Mirror AutoShip's wiki structure. Files:

- `wiki/Home.md` — overview and navigation
- `wiki/Installation.md` — full install guide, one-liner, manual steps, updating
- `wiki/Commands.md` — all 9 commands with examples
- `wiki/Configuration.md` — all parameters, flags, stop conditions
- `wiki/Safety.md` — invariants, what autoresearch can/can't touch, side effects
- `wiki/Contributing.md` — dev setup, version-bump procedure, PR checklist

### 6c. CONTRIBUTING.md update

Add the new `VERSION` file to the version-bump checklist (currently 4 files → now 5).

**Changes:**

- Create `docs/ARCHITECTURE.md`
- Create `wiki/` directory with 6 files
- Update `CONTRIBUTING.md` version-bump section
- Update `README.md` to link to the new docs

---

## 7. Standalone `VERSION` File

**Format:** Single line, no trailing newline: `2.2.0`

**Rationale:** Consistent with AutoShip. Enables the `validate.yml` workflow to cross-check version consistency across files.

**Changes:**

- Create `VERSION` file at repo root
- Add to version-bump checklist in `CONTRIBUTING.md` and `CLAUDE.md`

---

## 8. GitHub Repo Metadata

**Topics to set:**
`claude-code`, `claude`, `autonomous`, `ai-agent`, `plugin`, `iteration-engine`, `autoresearch`

**Homepage:** Set to GitHub Pages URL after Pages is enabled.

**Method:** `gh repo edit` commands in implementation plan.

---

## 9. Version Bump: `2.1.0 → 2.2.0`

**Files to update (5 total):**

| File                                              | Change                                |
| ------------------------------------------------- | ------------------------------------- |
| `plugins/autoresearch/.claude-plugin/plugin.json` | `"version": "2.2.0"`                  |
| `README.md`                                       | Version badge and `> **v2.2.0**` line |
| `CHANGELOG.md`                                    | New `## [2.2.0]` section at top       |
| `VERSION`                                         | New file: `2.2.0`                     |
| `.claude-plugin/marketplace.json`                 | Version reference if present          |

---

## 10. CHANGELOG Entry

```markdown
## [2.2.0] - 2026-04-13

### Added

- One-liner install command — `claude plugin marketplace add && claude plugin install` in one shot
- Auto-update enabled by default via `"autoUpdate": true` in plugin manifest
- Hero graphic (`assets/autoresearch-loop.svg`) — night-mode SVG banner for README and landing page
- GitHub Pages landing page (`docs/index.html`) — dark-theme project site with install one-liner, command table, and how-it-works section
- GitHub Actions `release.yml` — auto-creates GitHub Releases from CHANGELOG on version tags
- GitHub Actions `validate.yml` — PR checks for frontmatter, cross-references, and version consistency
- Architecture doc (`docs/ARCHITECTURE.md`) — current phase flow, state machine, invariants, artifact lifecycle
- Wiki (`wiki/`) — 6-page reference covering installation, commands, configuration, safety, and contributing
- `VERSION` file at repo root for cross-file version consistency checking
- Mermaid flowcharts in README — core loop diagram and plugin architecture diagram
- GitHub Sponsors support — `.github/FUNDING.yml`, Sponsor badge in badge row, `☕ Keep the loop running` footer link
- GitHub repo topics for discoverability
- README restructured to match AutoShip section order (tagline → install → commands → how it works → architecture → safety)
```

---

## 11. Mermaid Charts

Two diagrams added directly in `README.md` (GitHub renders Mermaid natively in markdown).

### 11a. Core Loop Flowchart — "How It Works"

Shows the Modify → Verify → Keep/Discard → Repeat cycle with all stop conditions branching off:

```mermaid
flowchart TD
    A([Start]) --> B[Phase 0: Pre-flight\ngit status, params, branch]
    B --> C[Phase 1: Baseline\nrun Verify command]
    C --> D[Phase 2: Generate change\none atomic edit in Scope]
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
```

### 11b. Architecture Flowchart — "Plugin Structure"

Shows the command → skill → reference protocol chain:

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

    subgraph Skill["SKILL.md (shared invariants)"]
        SK[Safety rules\nStop conditions\nArtifact list]
    end

    subgraph References
        LP[autonomous-loop-protocol]
        SM[state-management]
        RL[results-logging]
        WF[*-workflow.md × 8]
    end

    AR --> SK
    PL --> SK
    DB --> SK
    FX --> SK
    SC --> SK
    LN --> SK
    PR --> SK
    SN --> SK
    SH --> SK
    SK --> LP
    SK --> SM
    SK --> RL
    SK --> WF
```

**Placement in README:** §11a under a new "How It Works" section (between Commands table and Running Overnight). §11b under a new "Architecture" section (between Running Overnight and Safety).

---

## 12. Sponsor / Funding

Match AutoShip exactly.

**`.github/FUNDING.yml`:**

```yaml
github: Maleick
```

**Sponsor badge** added to badge row in README:

```markdown
[![Sponsor](https://img.shields.io/github/sponsors/Maleick?label=Sponsor&logo=GitHub&color=EA4AAA&style=flat-square)](https://github.com/sponsors/Maleick)
```

**Footer line** at bottom of README (above License), matching AutoShip's tone:

```markdown
---

☕ [Keep the loop running](https://github.com/sponsors/Maleick)
```

---

## 13. README Section Order (Matching AutoShip Layout)

Reorder README sections to mirror AutoShip's proven layout:

1. Title + badge row (with Sponsor badge)
2. Tagline: _"Fire it before bed. Review improvements in the morning."_
3. One-liner install (prominent, above the fold)
4. What It Does (existing)
5. Commands table (existing)
6. **How It Works** ← new section with core loop Mermaid chart
7. **Architecture** ← new section with plugin structure Mermaid chart
8. Running Overnight (existing, moved down)
9. Safety (existing, moved down)
10. Output Artifacts (existing)
11. Configuration Reference (existing)
12. Command Reference (existing)
13. Troubleshooting (existing)
14. Sponsor footer line
15. License

---

## Implementation Order

1. Create `VERSION` file and `assets/` directory structure
2. Create `assets/autoresearch-loop.svg` (hero graphic)
3. Create `docs/index.html` (GitHub Pages landing page)
4. Create `.github/workflows/release.yml` and `validate.yml`
5. Create `.github/FUNDING.yml` (GitHub Sponsors)
6. Create `docs/ARCHITECTURE.md`
7. Create `wiki/` with all 6 pages
8. Update `plugins/autoresearch/.claude-plugin/plugin.json` (version + autoUpdate)
9. Update `.claude-plugin/marketplace.json` (autoUpdate)
10. Update `README.md` — reorder sections per §13, add one-liner, graphic, Mermaid charts, Sponsor badge + footer, version bump, auto-update section
11. Update `CONTRIBUTING.md` (VERSION file in checklist)
12. Update `CLAUDE.md` (VERSION file in checklist)
13. Write `CHANGELOG.md` v2.2.0 entry
14. Set GitHub repo topics and homepage via `gh repo edit`
15. Enable GitHub Pages via `gh api`
16. Commit, tag `v2.2.0`, push — release workflow fires automatically

---

## Out of Scope

- No changes to plugin behavior, commands, or workflow protocols
- No npm/build tooling introduced
- No external dependencies added
- No changes to `.wolf/` or session management files
