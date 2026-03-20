export const /* @__PURE__ */ turbineRect = (L, R, T, B) =>
  Object.freeze({ L: L|0, R: R|0, T: T|0, B: B|0 });

export const /* @__PURE__ */ turbineUniform = (all) =>
  turbineRect(all, all, all, all);

export const /* @__PURE__ */ T_COMPACT  = turbineRect( 48,  48,  48,  48);
export const /* @__PURE__ */ T_STANDARD = turbineRect( 72,  72,  96,  96);
export const /* @__PURE__ */ T_WIDE     = turbineRect( 96,  96, 144, 144);
export const /* @__PURE__ */ T_DOCUMENT = turbineRect(138, 138, 138, 138);
export const /* @__PURE__ */ T_WEB      = turbineRect(  0,   0,   0,   0);

const _R = new Float64Array([
  1, 0.75, 0.26458, 0.010417, 15, 9525, 0.0625,
  1.33333, 1, 0.35278, 0.013889, 20, 12700, 0.08333,
  3.77953, 2.83465, 1, 0.03937, 56.6929, 360000, 0.23622,
  96, 72, 25.4, 1, 1440, 914400, 6,
  0.06667, 0.05, 0.01764, 0.000694, 1, 635, 0.004167,
  0.000105, 7.87e-5, 2.778e-6, 1.09e-6, 0.001575, 1, 6.55e-6,
  16, 12, 4.23333, 0.16667, 240, 152400, 1,
]);

export const /* @__PURE__ */ turbineConvert = (v, f, t) =>
  f === t ? v|0 : Math.round(v * _R[f*7+t])|0;

export const /* @__PURE__ */ tCss  = r =>
  `margin:${r.T}px ${r.R}px ${r.B}px ${r.L}px;`;

export const /* @__PURE__ */ tJson = r =>
  JSON.stringify(r);

export const /* @__PURE__ */ tXml  = r =>
  `<eco:lrtb L="${r.L}" R="${r.R}" T="${r.T}" B="${r.B}"/>`;

export async function writeToBun(rect, filePath, format = 'json') {
  let content;
  if (format === 'json')      content = tJson(rect);
  else if (format === 'css')  content = `:root{${tJson(rect)}}`;
  else if (format === 'xml')  content = tXml(rect);
  else                        content = JSON.stringify(rect, null, 2);

  if (typeof Bun !== 'undefined') {
    await Bun.write(filePath, content);
  } else if (typeof Deno !== 'undefined') {
    await Deno.writeTextFile(filePath, content);
  } else {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, content, 'utf8');
  }
}
