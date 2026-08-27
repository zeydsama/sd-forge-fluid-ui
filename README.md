# sd-forge-fluid-ui

A modern, fluid, and mobile-responsive UI extension for **Stable Diffusion WebUI Forge / Forge Neo**.

Features a refined **Codex Studio Theme**, **Codex v1 Compact Bento Cockpit Layout**, accordion docking drawer, quick-select aspect ratio & resolution chips, and touch-optimized mobile bottom sheets.

---

## Features

- **Codex Studio Theme**:
  - Refined 1:1 studio dark theme with clean typography, minimalist borders, and high contrast.
- **Codex Bento Cockpit Bone**:
  - Compact, ergonomic 3-card bento-grid grouping Sampling & Guidance, Framing & Resolution, and Seed controls.
- **Accordion Docking**:
  - Automatically consolidates secondary extension accordions into a clean vertical drawer/dock to eliminate endless vertical scrolling.
- **Resolution & Aspect Ratio Quick Select**:
  - Ergonomic 1:1, 16:9, 9:16, 4:3, 3:4, and 21:9 quick chips with instant dimension adjustment.
- **Mobile First**:
  - Responsive bottom-sheet drawer interactions for seamless mobile generation.

---

## Installation

1. Open your Stable Diffusion WebUI Forge instance.
2. Go to the **Extensions** tab -> **Install from URL**.
3. Paste the URL:
   ```text
   https://github.com/zeydsama/sd-forge-fluid-ui.git
   ```
4. Click **Install**.
5. Restart your WebUI or reload the UI.

---

## Structure

```text
sd-forge-fluid-ui/
├── scripts/
│   └── fluid_ui.py      # Extension lifecycle script
├── javascript/
│   └── fluid.js         # Frontend controller, bento cockpit builder & mobile interactions
├── style.css            # Theme tokens, Bento grid styling, and responsive layout
└── README.md
```
