'use strict';

function V8Rect(L, R, T, B) {
  this.L = L|0;
  this.R = R|0;
  this.T = T|0;
  this.B = B|0;
}

V8Rect.prototype.toCss = function() {
  return 'margin:' + this.T + 'px ' + this.R + 'px ' + this.B + 'px ' + this.L + 'px;';
};

V8Rect.prototype.toJson = function() {
  return '{"L":' + this.L + ',"R":' + this.R + ',"T":' + this.T + ',"B":' + this.B + '}';
};

V8Rect.prototype.toXml = function() {
  return '<eco:lrtb L="' + this.L + '" R="' + this.R + '" T="' + this.T + '" B="' + this.B + '"/>';
};

V8Rect.prototype.add = function(b) {
  return new V8Rect(this.L+b.L, this.R+b.R, this.T+b.T, this.B+b.B);
};

V8Rect.prototype.scale = function(f) {
  return new V8Rect(
    Math.round(this.L*f), Math.round(this.R*f),
    Math.round(this.T*f), Math.round(this.B*f)
  );
};

const V8_COMPACT  = Object.freeze(new V8Rect( 48,  48,  48,  48));
const V8_STANDARD = Object.freeze(new V8Rect( 72,  72,  96,  96));
const V8_WIDE     = Object.freeze(new V8Rect( 96,  96, 144, 144));
const V8_DOCUMENT = Object.freeze(new V8Rect(138, 138, 138, 138));
const V8_WEB      = Object.freeze(new V8Rect(  0,   0,   0,   0));

const _R = new Float64Array([
  1, 0.75, 0.26458, 0.010417, 15, 9525, 0.0625,
  1.33333, 1, 0.35278, 0.013889, 20, 12700, 0.08333,
  3.77953, 2.83465, 1, 0.03937, 56.6929, 360000, 0.23622,
  96, 72, 25.4, 1, 1440, 914400, 6,
  0.06667, 0.05, 0.01764, 0.000694, 1, 635, 0.004167,
  0.000105, 7.87e-5, 2.778e-6, 1.09e-6, 0.001575, 1, 6.55e-6,
  16, 12, 4.23333, 0.16667, 240, 152400, 1,
]);

function v8Convert(v, f, t) {
  if (f === t) return v|0;
  return Math.round(v * _R[f*7+t])|0;
}

function v8ConvertRect(r, f, t) {
  return new V8Rect(
    v8Convert(r.L, f, t), v8Convert(r.R, f, t),
    v8Convert(r.T, f, t), v8Convert(r.B, f, t)
  );
}

module.exports = {
  V8Rect,
  v8Convert,
  v8ConvertRect,
  V8_COMPACT,
  V8_STANDARD,
  V8_WIDE,
  V8_DOCUMENT,
  V8_WEB,
};
