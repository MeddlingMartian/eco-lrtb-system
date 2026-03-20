(function (root) {
  'use strict';

  var PRESETS = {
    compact:  { L:  48, R:  48, T:  48, B:  48 },
    standard: { L:  72, R:  72, T:  96, B:  96 },
    wide:     { L:  96, R:  96, T: 144, B: 144 },
    document: { L: 138, R: 138, T: 138, B: 138 },
    web:      { L:   0, R:   0, T:   0, B:   0 },
  };

  var RATIO = [
    [1.0,      0.75,     0.26458,  0.010417, 15.0,     9525.0,   0.0625   ],
    [1.33333,  1.0,      0.35278,  0.013889, 20.0,     12700.0,  0.08333  ],
    [3.77953,  2.83465,  1.0,      0.039370, 56.6929,  360000.0, 0.23622  ],
    [96.0,     72.0,     25.4,     1.0,      1440.0,   914400.0, 6.0      ],
    [0.06667,  0.05,     0.01764,  0.000694, 1.0,      635.0,    0.004167 ],
    [0.000105, 7.87e-5,  2.778e-6, 1.09e-6,  0.001575, 1.0,      6.55e-6  ],
    [16.0,     12.0,     4.23333,  0.16667,  240.0,    152400.0, 1.0      ],
  ];

  function convertUnit(value, from, to) {
    if (from === to) return value;
    return Math.round(value * RATIO[from][to]);
  }

  var CSS_VARS_SUPPORTED = (function () {
    try {
      return root.CSS && root.CSS.supports &&
             root.CSS.supports('--eco-test', '0');
    } catch (e) {
      return false;
    }
  })();

  function applyRect(el, rect) {
    var s = el.style;
    s.marginLeft   = rect.L + 'px';
    s.marginRight  = rect.R + 'px';
    s.marginTop    = rect.T + 'px';
    s.marginBottom = rect.B + 'px';
  }

  function applyPaddingRect(el, rect) {
    var s = el.style;
    s.paddingLeft   = rect.L + 'px';
    s.paddingRight  = rect.R + 'px';
    s.paddingTop    = rect.T + 'px';
    s.paddingBottom = rect.B + 'px';
  }

  function polyfillElement(el) {
    var presetName = el.getAttribute('data-eco-preset') || 'standard';
    var rect = PRESETS[presetName] || PRESETS.standard;
    var cls  = el.className || '';

    if (cls.indexOf('eco-box') !== -1 || cls.indexOf('eco-page') !== -1) {
      applyRect(el, rect);
    }
    if (cls.indexOf('eco-p') !== -1) {
      applyPaddingRect(el, rect);
    }
  }

  function runPolyfill() {
    if (CSS_VARS_SUPPORTED) return;
    var els = document.querySelectorAll(
      '.eco-box,.eco-page,.eco-compact,.eco-standard,.eco-wide,.eco-document,[data-eco-preset]'
    );
    for (var i = 0; i < els.length; i++) {
      polyfillElement(els[i]);
    }
  }

  var EcoLRTB = {
    version: '1.0.0',
    presets: PRESETS,
    cssVars: CSS_VARS_SUPPORTED,

    rect: function (L, R, T, B) {
      return { L: L|0, R: R|0, T: T|0, B: B|0 };
    },

    preset: function (name) {
      return PRESETS[name]
        ? JSON.parse(JSON.stringify(PRESETS[name]))
        : PRESETS.standard;
    },

    convert: convertUnit,

    toCss: function (r, prop) {
      prop = prop || 'margin';
      return prop + ': ' + r.T + 'px ' + r.R + 'px ' + r.B + 'px ' + r.L + 'px;';
    },

    toDxaPgMar: function (r) {
      var d = {
        L: convertUnit(r.L, 0, 4),
        R: convertUnit(r.R, 0, 4),
        T: convertUnit(r.T, 0, 4),
        B: convertUnit(r.B, 0, 4),
      };
      return '<w:pgMar w:left="' + d.L + '" w:right="' + d.R +
             '" w:top="' + d.T + '" w:bottom="' + d.B +
             '" w:header="720" w:footer="720"/>';
    },

    injectCssVars: function (rect) {
      var r  = rect || PRESETS.standard;
      var el = document.getElementById('eco-polyfill-vars');
      if (!el) {
        el    = document.createElement('style');
        el.id = 'eco-polyfill-vars';
        document.head.appendChild(el);
      }
      el.textContent = ':root{' +
        '--eco-margin-left:'   + r.L + 'px;' +
        '--eco-margin-right:'  + r.R + 'px;' +
        '--eco-margin-top:'    + r.T + 'px;' +
        '--eco-margin-bottom:' + r.B + 'px;}';
    },

    polyfill: runPolyfill,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPolyfill);
  } else {
    runPolyfill();
  }

  root.EcoLRTB = EcoLRTB;

  if (typeof define === 'function' && define.amd) {
    define(function () { return EcoLRTB; });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcoLRTB;
  }

}(typeof globalThis !== 'undefined' ? globalThis
  : typeof window   !== 'undefined' ? window
  : typeof global   !== 'undefined' ? global : this));
