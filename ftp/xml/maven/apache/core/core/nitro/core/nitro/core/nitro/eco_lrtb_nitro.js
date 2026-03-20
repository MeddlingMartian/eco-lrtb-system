'use strict';

export function nitroRect(L, R, T, B) {
  const a = new Int32Array(4);
  a[0] = L; a[1] = R; a[2] = T; a[3] = B;
  return a;
}

export const NITRO_L = 0, NITRO_R = 1, NITRO_T = 2, NITRO_B = 3;

export const NITRO_COMPACT  = Object.freeze(nitroRect( 48,  48,  48,  48));
export const NITRO_STANDARD = Object.freeze(nitroRect( 72,  72,  96,  96));
export const NITRO_WIDE     = Object.freeze(nitroRect( 96,  96, 144, 144));
export const NITRO_DOCUMENT = Object.freeze(nitroRect(138, 138, 138, 138));
export const NITRO_WEB      = Object.freeze(nitroRect(  0,   0,   0,   0));

const R = new Float64Array([
  1, 0.75, 0.26458, 0.010417, 15, 9525, 0.0625,
  1.33333, 1, 0.35278, 0.013889, 20, 12700, 0.08333,
  3.77953, 2.83465, 1, 0.03937, 56.6929, 360000, 0.23622,
  96, 72, 25.4, 1, 1440, 914400, 6,
  0.06667, 0.05, 0.01764, 0.000694, 1, 635, 0.004167,
  0.000105, 7.87e-5, 2.778e-6, 1.09e-6, 0.001575, 1, 6.55e-6,
  16, 12, 4.23333, 0.16667, 240, 152400, 1,
]);

export function nitroCvt(v, f, t) {
  return f === t ? v : Math.round(v * R[f*7+t]);
}

export const nitroCss  = a =>
  `margin:${a[2]}px ${a[1]}px ${a[3]}px ${a[0]}px;`;

export const nitroXml  = a =>
  `<eco:lrtb L="${a[0]}" R="${a[1]}" T="${a[2]}" B="${a[3]}"/>`;

export const nitroJson = a =>
  `{"L":${a[0]},"R":${a[1]},"T":${a[2]},"B":${a[3]}}`;

if (typeof module !== 'undefined') {
  module.exports = {
    nitroRect,
    nitroCvt,
    nitroCss,
    nitroXml,
    nitroJson,
    NITRO_COMPACT,
    NITRO_STANDARD,
    NITRO_WIDE,
    NITRO_DOCUMENT,
    NITRO_WEB,
  };
}
