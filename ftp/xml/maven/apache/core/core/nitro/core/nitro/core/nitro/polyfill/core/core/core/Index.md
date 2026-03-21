# Eco_L_R_T_B_System

Unified Left Right Top Bottom document formatting system v1.0.0

Copyright (C) 2026 Tyler Blankenship, Rae, Lucas, Eregon — MIT License

## Live Demo

[Open the interactive demo](core/eco_lrtb.html)

## Files

| File | Description |
|------|-------------|
| [core/eco_lrtb.html](core/eco_lrtb.html) | Live demo |
| [core/eco_lrtb_w3c.css](core/eco_lrtb_w3c.css) | W3C CSS stylesheet |
| [core/eco_lrtb.js](core/eco_lrtb.js) | JavaScript ESM |
| [polyfill/eco_lrtb_polyfill.js](polyfill/eco_lrtb_polyfill.js) | Browser polyfill |
| [xml/eco_lrtb.xml](xml/eco_lrtb.xml) | XML data |
| [ECO_LRTB.FILE](ECO_LRTB.FILE) | Master container |

## Import

### CSS
```css
@import url("https://meddlingmartian.github.io/eco-lrtb-system/core/eco_lrtb_w3c.css");
JavaScript
import { ecoRect, ECO_STANDARD }
  from 'https://meddlingmartian.github.io/eco-lrtb-system/core/eco_lrtb.js';
Polyfill
<script src="https://meddlingmartian.github.io/eco-lrtb-system/polyfill/eco_lrtb_polyfill.js"></script>
---

## Tagging releases

When you reach a stable point, tag it so you can link to a specific version:

```bash
git tag v1.0.0
git push origin v1.0.0
