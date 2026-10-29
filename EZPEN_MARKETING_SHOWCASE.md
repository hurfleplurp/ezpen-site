# ezPen — Website Copy Package & Marketing Showcase
**Target:** Modern SaaS / Desktop App Product Page (Deployable to Vercel)  
**Tone:** Refined, punchy, hyper-responsive, developer & designer focused (Linear / Raycast aesthetic)

---

## 1. Hero Section

### Tagline & Subhead
> **Headline:** The Infinite Digital Whiteboard with the Soul of Physical Ink.  
> **Sub-headline:** Crafted from bare-metal C++20 and custom OpenGL shaders. No Electron. No frame drops. Seven handcrafted physical pen simulations with Deep Temporal Anti-Aliasing on an infinite, blazing-fast canvas.

### Call to Action (CTA) Group
* **Primary Button:** `Download for Windows (64-bit)` *(~8.5 MB Single Executable)*
* **Secondary Button:** `Explore the Science of DTLAA →`
* **Sub-badge:** `⚡ Native C++20 • 120 FPS Pacing • Zero Dependencies • Windows 10/11`

---

## 2. Screenshot & Visual Asset Production Guide

To make the landing page visually stunning, capture these recommended screenshots and animations from `ezPen`:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [HERO MOCKUP: 16:9 4K Windowed Screenshot]                             │
│ • Dark Blackboard mode with a vibrant Pastel Pink Paintbrush curve,   │
│   a sharp yellow Fineliner diagram, and a powdery Chalk equation.      │
│ • Floating bottom dome toolbar subtly hovered at the bottom center.    │
│ • Top Move Bar and minimal window controls visible.                    │
└────────────────────────────────────────────────────────────────────────┘
```

1. **The Hero Canvas Shot (`hero-canvas.png`):**
   * **Mode:** Blackboard Mode.
   * **Content:** An artistic blend of a fluid Paintbrush stroke, a dry Chalk equation, and a razor-sharp Fineliner schematic. Shows off high-contrast pigmentation on dark slate.
2. **The 7-Pen Lineup (`pen-materials-lineup.png`):**
   * A side-by-side comparison card showing single parallel strokes of all 7 pens at 18px width:
     1. *Fineliner* (needle precision)
     2. *Pencil* (graphite lead texture)
     3. *Paintbrush* (wet paint body with subtle bristle streaks)
     4. *Marker* (felt whiteboard ink)
     5. *Chisel* (angled highlighter glaze)
     6. *Chalk* (porous stone with micro-crumbs)
     7. *Chalk Marker* (rich liquid body with fractured saw-tooth tail)
3. **The Global Eyedropper in Action (`global-eyedropper.png`):**
   * Shows `ezPen` alongside a web browser or photo editor with the magnifying loupe ring hovering over an external window, demonstrating untrapped global color sampling.
4. **Radial Quick-Wheel GIF / Short Clip (`radial-wheel.mp4`):**
   * A 3-second looping clip showing a click on the floating dock, the radial petals blooming outwards with spring physics, and a fast scroll-wheel thickness adjustment.
5. **Macro Zoom Detail (`dtlaa-subpixel-clarity.png`):**
   * A split-screen 400% zoom crop comparing standard jagged/blurred canvas lines against `ezPen`'s crisp, edge-preserved DTLAA strokes.

---

## 3. Key Feature Narratives ("The Marketing Fluff")

### Feature 1: "Real Physics. Real Ink. Real Grit."
> *Most digital whiteboards draw sterile vector ribbons. `ezPen` simulates real-world pigment dispersion.*

* **Wet Acrylic Paintbrush:** High-viscosity paint body that stays thick and luscious through long curves, accented by subtle procedural bristle streaks and occasional liquid overspill droplets.
* **Slate-Biting Chalk:** Real porous mineral texture with cellular micro-voids that catch the grain of the board, accompanied by stray crumb flecks that break off as you write.
* **Liquid Chalk Marker with Fracture Tail:** The clean chisel-cut of a liquid marker, ending in an organic dual-layer saw-tooth fracture when lifted rapidly from the board.
* **Graphite Pencil:** Pure 4B graphite tooth with pressure-sensitive carbon deposition.

---

### Feature 2: "Deep Temporal-Luminance Anti-Aliasing (DTLAA)"
> *Razor sharp at 10% zoom. Crystal clean at 800% zoom. Never blurry.*

Traditional anti-aliasing either blurs vector lines into mud or leaves jagged pixel steps. Our custom **DTLAA** graphics pipeline merges spatial high-frequency edge filtering with historical luminance accumulation:
* **Zero Temporal Shimmer:** Strokes remain rock-solid during camera pans and fast zooms.
* **Hardware Self-Occlusion Fix:** Translucent inks blend naturally over background boards without messy dark overlapping seams within the same stroke.
* **Sub-Millisecond Resolve:** Rendered entirely on the GPU in a dedicated multi-pass framebuffer architecture.

---

### Feature 3: "Zero Bloatware. Just Raw Speed."
> *Why does a drawing app need 800 MB of Chromium? We thought the same.*

| Spec / Capability | `ezPen` (Native C++20) | Standard Web / Electron Whiteboards |
| :--- | :--- | :--- |
| **Startup Time** | **< 150 milliseconds** | 2.5 – 6.0 seconds |
| **Memory Footprint** | **~45 MB base** (~230 KB for 50 undo steps) | 650 MB – 1.4 GB |
| **Frame Pacing** | **Deterministic 120 FPS / Monitor Native** | 60 FPS capped with stutter |
| **Input Latency** | **Sub-5ms hardware response** | 25ms – 60ms browser DOM delay |
| **Installer / Executable** | **Single 8.5 MB `.exe` (Zero installs)** | 120 MB installer / 350 MB installed |

---

### Feature 4: "Frictionless Workflow & Muscle Memory"
> *Engineered for people who think with their hands.*

* **Global OS Eyedropper:** Sample any pixel from your desktop, secondary monitors, Photoshop, or web browser without mouse-trapping. Left-click anywhere to adopt the color across all pens instantly.
* **Continuous Transparency Sculptor (Eraser):** Push firmly for a 100% clean erase, or feather lightly to sculpt and fade existing lines with our non-linear cubic S-curve response.
* **Double-Tap `Ctrl` to Fit All:** Lost in the infinite canvas? Double-tap the `Ctrl` key to instantly animate the camera to frame every stroke on your board.
* **Hardware Mouse Navigation:** Mouse 4 for instant Undo, Mouse 5 for Redo, Middle-Click to pan, Scroll Wheel over sliders to fine-tune thickness down to a tenth of a millimeter.
* **Floating Dome & Radial Wheels:** UI that appears when you need it, and vanishes completely when you ink.

---

## 4. Website Section Structure (Ready for Vercel)

### Section 1: Hero Block
* Large animated video / interactive canvas preview.
* Direct download link with automatic Windows architecture detection.

### Section 2: "Meet the Pens" (Interactive Slider / Carousel)
* 7 interactive cards where users can click between *Fineliner, Pencil, Paintbrush, Marker, Chisel, Chalk, and Chalk Marker* with high-res macro photos of each ink texture.

### Section 3: "The Engine" (Technical Power Grid)
* 3 cards detailing:
  1. *DTLAA Anti-Aliasing*: Subpixel sharpness without ghosting.
  2. *Spatial Unit Partitioning*: Infinite canvas with instantaneous rendering.
  3. *LZMA2 Compression*: Hundreds of complex drawings packed into lightweight `.ezp` files.

### Section 4: "Speed Benchmark Comparison"
* Interactive comparison chart contrasting `ezPen` against sluggish web-based canvas apps.

### Section 5: Download & Community Footer
* Single `.exe` download badge.
* Portable USB mode note (settings and projects persist in local directory).
* Release notes and system requirements (Windows 10 / 11 64-bit, OpenGL 3.3+ capable GPU).
