'use strict';

export const EcoUnit = Object.freeze({
  PX: 0, PT: 1, MM: 2, IN: 3, DXA: 4, EMU: 5, REM: 6,
});

export const EcoPreset = Object.freeze({
  COMPACT: 0, STANDARD: 1, WIDE: 2, DOCUMENT: 3, WEB: 4,
});

export const EcoTarget = Object.freeze({
  GENERIC: 0, TXT: 1, MD: 2, HTML: 3, DOCX: 4, PDF: 5, XML: 6, PHP: 7,
});

const _RATIO = new Float64Array([
  1.0,      0.75,     0.26458,  0.010417,  15.0,     9525.0,    0.0625,
  1.33333,  1.0,      0.35278,  0.013889,  20.0,     12700.0,   0.08333,
  3.77953,  2.83465,  1.0,      0.039370,  56.6929,  360000.0,  0.23622,
  96.0,     72.0,     25.4,     1.0,       1440.0,   914400.0,  6.0,
  0.06667,  0.05,     0.01764,  0.000694,  1.0,      635.0,     0.004167,
  0.000105, 7.87e-5,  2.778e-6, 1.09e-6,   0.001575, 1.0,       6.55e-6,
  16.0,     12.0,     4.23333,  0.16667,   240.0,    152400.0,  1.0,
]);

export function convertUnit(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value | 0;
  return Math.round(value * _RATIO[fromUnit * 7 + toUnit]);
}

const _PRESETS = Object.freeze([
  Object.freeze({ L:  48, R:  48, T:  48, B:  48 }),
  Object.freeze({ L:  72, R:  72, T:  96, B:  96 }),
  Object.freeze({ L:  96, R:  96, T: 144, B: 144 }),
  Object.freeze({ L: 138, R: 138, T: 138, B: 138 }),
  Object.freeze({ L:   0, R:   0, T:   0, B:   0 }),
]);

export function ecoRect(L, R, T, B) {
  return Object.freeze({ L: L|0, R: R|0, T: T|0, B: B|0 });
}

export function ecoUniform(all) { return ecoRect(all, all, all, all); }

export function ecoPreset(preset) { return _PRESETS[preset] ?? _PRESETS[1]; }

export const ECO_COMPACT  = _PRESETS[0];
export const ECO_STANDARD = _PRESETS[1];
export const ECO_WIDE     = _PRESETS[2];
export const ECO_DOCUMENT = _PRESETS[3];
export const ECO_WEB      = _PRESETS[4];

export const ecoAdd = (a, b) =>
  ecoRect(a.L+b.L, a.R+b.R, a.T+b.T, a.B+b.B);

export const ecoScale = (a, f) =>
  ecoRect(Math.round(a.L*f), Math.round(a.R*f),
          Math.round(a.T*f), Math.round(a.B*f));

export const ecoClamp = (a, min, max) =>
  ecoRect(Math.max(min, Math.min(a.L, max)), Math.max(min, Math.min(a.R, max)),
          Math.max(min, Math.min(a.T, max)), Math.max(min, Math.min(a.B, max)));

export const ecoEqual = (a, b) =>
  a.L===b.L && a.R===b.R && a.T===b.T && a.B===b.B;

export function ecoConvert(rect, fromUnit, toUnit) {
  if (fromUnit === toUnit) return rect;
  return ecoRect(
    convertUnit(rect.L, fromUnit, toUnit),
    convertUnit(rect.R, fromUnit, toUnit),
    convertUnit(rect.T, fromUnit, toUnit),
    convertUnit(rect.B, fromUnit, toUnit),
  );
}

export const toCss = (r, prop = 'margin') =>
  `${prop}: ${r.T}px ${r.R}px ${r.B}px ${r.L}px;`;

export const toCssVars = (r, pfx = 'eco') => [
  `--${pfx}-left:${r.L}px`,
  `--${pfx}-right:${r.R}px`,
  `--${pfx}-top:${r.T}px`,
  `--${pfx}-bottom:${r.B}px`,
].join(';') + ';';

export function toCssRoot(ctx) {
  const m = ctx.margin;
  const p = ctx.padding;
  return `:root {\n` +
    `  --eco-margin-left:${m.L}px;\n  --eco-margin-right:${m.R}px;\n` +
    `  --eco-margin-top:${m.T}px;\n  --eco-margin-bottom:${m.B}px;\n` +
    `  --eco-pad-left:${p.L}px;\n  --eco-pad-right:${p.R}px;\n` +
    `  --eco-pad-top:${p.T}px;\n  --eco-pad-bottom:${p.B}px;\n}\n`;
}

export function toOoxmlPgMar(r) {
  const d = ecoConvert(r, EcoUnit.PX, EcoUnit.DXA);
  return `<w:pgMar w:left="${d.L}" w:right="${d.R}" ` +
         `w:top="${d.T}" w:bottom="${d.B}" w:header="720" w:footer="720"/>`;
}

export const toXml  = (r, tag = 'eco:lrtb') =>
  `<${tag} L="${r.L}" R="${r.R}" T="${r.T}" B="${r.B}"/>`;

export const toJson = (r) =>
  JSON.stringify({ L: r.L, R: r.R, T: r.T, B: r.B });

export const toPhp  = (r) =>
  `['L'=>${r.L},'R'=>${r.R},'T'=>${r.T},'B'=>${r.B}]`;

export function ecoContext(target = EcoTarget.GENERIC) {
  const margin = (target === EcoTarget.DOCX || target === EcoTarget.PDF)
    ? ECO_DOCUMENT
    : (target === EcoTarget.HTML || target === EcoTarget.PHP)
    ? ECO_WEB
    : ECO_STANDARD;

  return {
    margin,
    padding:    ECO_WEB,
    border:     ECO_WEB,
    target,
    unit:       EcoUnit.PX,
    pageWidth:  816,
    pageHeight: 1056,
  };
}

export function toTextFrame(rect, width = 80) {
  const inner  = Math.max(10, width - rect.L - rect.R);
  const bar    = '-'.repeat(inner);
  const indent = ' '.repeat(rect.L);
  const label  = `ECO_L=${rect.L}  ECO_R=${rect.R}  ECO_T=${rect.T}  ECO_B=${rect.B}`;
  return ['', `${indent}${bar}`, `${indent}  ${label}`, `${indent}${bar}`, ''].join('\n');
}

export const /* @__PURE__ */ ecoRectPure    = ecoRect;
export const /* @__PURE__ */ convertUnitPure = convertUnit;

if (typeof module !== 'undefined') {
  module.exports = {
    EcoUnit, EcoPreset, EcoTarget,
    ecoRect, ecoUniform, ecoPreset, ecoContext,
    ecoAdd, ecoScale, ecoClamp, ecoEqual, ecoConvert, convertUnit,
    toCss, toCssVars, toCssRoot, toOoxmlPgMar, toXml, toJson, toPhp,
    toTextFrame,
    ECO_COMPACT, ECO_STANDARD, ECO_WIDE, ECO_DOCUMENT, ECO_WEB,
  };
}
