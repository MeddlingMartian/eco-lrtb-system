#include "eco_lrtb.h"
#include <string.h>
#include <stdio.h>
#include <math.h>

static const double ECO_RATIO[7][7] = {
    {1.0,      0.75,      0.26458,    0.010417,  15.0,     9525.0,    0.0625   },
    {1.33333,  1.0,       0.35278,    0.013889,  20.0,     12700.0,   0.08333  },
    {3.77953,  2.83465,   1.0,        0.039370,  56.6929,  360000.0,  0.23622  },
    {96.0,     72.0,      25.4,       1.0,       1440.0,   914400.0,  6.0      },
    {0.06667,  0.05,      0.01764,    0.000694,  1.0,      635.0,     0.004167 },
    {0.000105, 0.0000787, 0.000002778,0.0000011, 0.001575, 1.0,       0.00000655},
    {16.0,     12.0,      4.23333,    0.16667,   240.0,    152400.0,  1.0      },
};

static const EcoLRTB ECO_PRESETS[5] = {
    { 48,  48,  48,  48},
    { 72,  72,  96,  96},
    { 96,  96, 144, 144},
    {138, 138, 138, 138},
    {  0,   0,   0,   0},
};

EcoLRTB eco_lrtb(eco_unit_t l, eco_unit_t r, eco_unit_t t, eco_unit_t b) {
    EcoLRTB v = {l, r, t, b};
    return v;
}

EcoLRTB eco_lrtb_uniform(eco_unit_t all) {
    EcoLRTB v = {all, all, all, all};
    return v;
}

EcoLRTB eco_lrtb_preset(EcoPreset preset) {
    if (preset < 0 || preset > ECO_PRESET_WEB) {
        return ECO_PRESETS[ECO_PRESET_STANDARD];
    }
    return ECO_PRESETS[preset];
}

EcoContext eco_context_default(EcoTarget target) {
    EcoContext ctx;
    memset(&ctx, 0, sizeof(EcoContext));
    ctx.margin    = eco_lrtb_preset(ECO_PRESET_STANDARD);
    ctx.padding   = eco_lrtb_uniform(0);
    ctx.border    = eco_lrtb_uniform(0);
    ctx.target    = target;
    ctx.unit      = ECO_UNIT_PX;
    ctx.symmetric = false;

    switch (target) {
        case ECO_TARGET_DOCX:
        case ECO_TARGET_PDF:
            ctx.page_width  = 816;
            ctx.page_height = 1056;
            ctx.margin      = eco_lrtb_preset(ECO_PRESET_DOCUMENT);
            break;
        case ECO_TARGET_HTML:
        case ECO_TARGET_PHP:
            ctx.margin = eco_lrtb_preset(ECO_PRESET_WEB);
            break;
        default:
            break;
    }
    return ctx;
}

eco_unit_t eco_unit_convert(eco_unit_t value, EcoUnitType from, EcoUnitType to) {
    if (from == to) return value;
    return (eco_unit_t)round((double)value * ECO_RATIO[from][to]);
}

EcoLRTB eco_convert(EcoLRTB src, EcoUnitType from, EcoUnitType to) {
    if (from == to) return src;
    EcoLRTB dst = {
        eco_unit_convert(src.L, from, to),
        eco_unit_convert(src.R, from, to),
        eco_unit_convert(src.T, from, to),
        eco_unit_convert(src.B, from, to),
    };
    return dst;
}

EcoLRTB eco_add(EcoLRTB a, EcoLRTB b) {
    EcoLRTB r = {a.L+b.L, a.R+b.R, a.T+b.T, a.B+b.B};
    return r;
}

EcoLRTB eco_scale(EcoLRTB a, float factor) {
    EcoLRTB r = {
        (eco_unit_t)roundf((float)a.L * factor),
        (eco_unit_t)roundf((float)a.R * factor),
        (eco_unit_t)roundf((float)a.T * factor),
        (eco_unit_t)roundf((float)a.B * factor),
    };
    return r;
}

EcoLRTB eco_clamp(EcoLRTB a, eco_unit_t min_val, eco_unit_t max_val) {
#define CLAMP(x) ((x) < min_val ? min_val : ((x) > max_val ? max_val : (x)))
    EcoLRTB r = {CLAMP(a.L), CLAMP(a.R), CLAMP(a.T), CLAMP(a.B)};
#undef CLAMP
    return r;
}

bool eco_equal(EcoLRTB a, EcoLRTB b) {
    return a.L==b.L && a.R==b.R && a.T==b.T && a.B==b.B;
}

bool eco_valid(const EcoLRTB *lrtb) {
    if (!lrtb) return false;
    return lrtb->L >= 0 && lrtb->R >= 0 && lrtb->T >= 0 && lrtb->B >= 0;
}

bool eco_context_valid(const EcoContext *ctx) {
    if (!ctx) return false;
    return eco_valid(&ctx->margin)
        && eco_valid(&ctx->padding)
        && eco_valid(&ctx->border)
        && ctx->unit >= ECO_UNIT_PX
        && ctx->unit <= ECO_UNIT_REM;
}

int eco_to_css(const EcoLRTB *lrtb, char *out, size_t out_len) {
    if (!lrtb || !out || out_len < 40) return -1;
    int n = snprintf(out, out_len, "%dpx %dpx %dpx %dpx",
                     lrtb->T, lrtb->R, lrtb->B, lrtb->L);
    return (n > 0 && (size_t)n < out_len) ? n : -1;
}

int eco_to_xml(const EcoLRTB *lrtb, const char *tag, char *out, size_t out_len) {
    if (!lrtb || !tag || !out || out_len < 80) return -1;
    int n = snprintf(out, out_len,
                     "<%s L=\"%d\" R=\"%d\" T=\"%d\" B=\"%d\"/>",
                     tag, lrtb->L, lrtb->R, lrtb->T, lrtb->B);
    return (n > 0 && (size_t)n < out_len) ? n : -1;
}

int eco_to_dxa(const EcoLRTB *lrtb, char *out, size_t out_len) {
    if (!lrtb || !out || out_len < 120) return -1;
    EcoLRTB dxa = eco_convert(*lrtb, ECO_UNIT_PX, ECO_UNIT_DXA);
    int n = snprintf(out, out_len,
        "<w:pgMar w:left=\"%d\" w:right=\"%d\" "
        "w:top=\"%d\" w:bottom=\"%d\" w:header=\"720\" w:footer=\"720\"/>",
        dxa.L, dxa.R, dxa.T, dxa.B);
    return (n > 0 && (size_t)n < out_len) ? n : -1;
}
