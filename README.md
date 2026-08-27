# sd-forge-fluid-ui

A modern, fluid, and mobile-responsive UI extension for **Stable Diffusion WebUI Forge / Forge Neo**.

Features a refined **Codex Studio Theme**, **Codex v1 Compact Bento Cockpit Layout**, accordion docking drawer, quick-select aspect ratio & resolution chips, and touch-optimized mobile bottom sheets.

---

## Features

- **Aesthetic Themes**:
  - **Codex**: 1:1 sleek studio dark theme with refined typography and contrast.
  - **Dark Tech**: High-tech cyber dark palette with glowing accents.
  - **Gradio Base**: Clean native Gradio palette.
- **UI Bone Architectures**:
  - **Codex v1 Cockpit**: Compact, ergonomic bento-grid layout grouping Sampling, Resolution, and Seed/Batching into dedicated cockpit cards with docked extension accordions.
  - **Legacy Fluid Forge**: Traditional sequential stack layout.
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

## Settings & Configuration

Under **Settings** -> **Fluid Forge**:
- **UI Theme**: Choose between `Codex`, `Dark Tech`, or `Gradio Base`.
- **UI Bone**: Choose between `Codex v1` (Bento cockpit) or `Legacy Fluid Forge`.
- **Fluid Forge: UI Hide** -> **Hide Seed & Batching Panel**: Toggle off the seed/batch card for an even more compact view.

---

## Structure

```text
sd-forge-fluid-ui/
├── scripts/
│   └── fluid_ui.py      # Extension options & Gradio backend hooks
├── javascript/
│   └── fluid.js         # Frontend controller, layout bone builder & mobile interactions
├── style.css            # Theme tokens, Bento grid styling, and responsive layout
└── README.md
```
