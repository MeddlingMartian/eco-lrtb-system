#ifndef ECO_LRTB_H
#define ECO_LRTB_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdbool.h>

#define ECO_VERSION_MAJOR  1
#define ECO_VERSION_MINOR  0
#define ECO_VERSION_PATCH  0
#define ECO_VERSION_STRING "1.0.0"

typedef int32_t eco_unit_t;

typedef struct {
    eco_unit_t L;
    eco_unit_t R;
    eco_unit_t T;
    eco_unit_t B;
} EcoLRTB;

typedef enum {
    ECO_UNIT_PX  = 0,
    ECO_UNIT_PT  = 1,
    ECO_UNIT_MM  = 2,
    ECO_UNIT_IN  = 3,
    ECO_UNIT_DXA = 4,
    ECO_UNIT_EMU = 5,
    ECO_UNIT_REM = 6,
} EcoUnitType;

typedef enum {
    ECO_PRESET_COMPACT   = 0,
    ECO_PRESET_STANDARD  = 1,
    ECO_PRESET_WIDE      = 2,
    ECO_PRESET_DOCUMENT  = 3,
    ECO_PRESET_WEB       = 4,
} EcoPreset;

typedef enum {
    ECO_TARGET_GENERIC  = 0,
    ECO_TARGET_TXT      = 1,
    ECO_TARGET_MD       = 2,
    ECO_TARGET_HTML     = 3,
    ECO_TARGET_DOCX     = 4,
    ECO_TARGET_PDF      = 5,
    ECO_TARGET_XML      = 6,
    ECO_TARGET_PHP      = 7,
} EcoTarget;

typedef struct {
    EcoLRTB     margin;
    EcoLRTB     padding;
    EcoLRTB     border;
    EcoTarget   target;
    EcoUnitType unit;
    uint16_t    page_width;
    uint16_t    page_height;
    bool        symmetric;
} EcoContext;

EcoLRTB     eco_lrtb(eco_unit_t l, eco_unit_t r, eco_unit_t t, eco_unit_t b);
EcoLRTB     eco_lrtb_uniform(eco_unit_t all);
EcoLRTB     eco_lrtb_preset(EcoPreset preset);
EcoContext  eco_context_default(EcoTarget target);

EcoLRTB     eco_convert(EcoLRTB src, EcoUnitType from, EcoUnitType to);
eco_unit_t  eco_unit_convert(eco_unit_t value, EcoUnitType from, EcoUnitType to);

EcoLRTB     eco_add(EcoLRTB a, EcoLRTB b);
EcoLRTB     eco_scale(EcoLRTB a, float factor);
EcoLRTB     eco_clamp(EcoLRTB a, eco_unit_t min_val, eco_unit_t max_val);
bool        eco_equal(EcoLRTB a, EcoLRTB b);

int         eco_to_css(const EcoLRTB *lrtb, char *out, size_t out_len);
int         eco_to_xml(const EcoLRTB *lrtb, const char *tag, char *out, size_t out_len);
int         eco_to_dxa(const EcoLRTB *lrtb, char *out, size_t out_len);

bool        eco_valid(const EcoLRTB *lrtb);
bool        eco_context_valid(const EcoContext *ctx);

#define ECO_L(ctx)   ((ctx).margin.L)
#define ECO_R(ctx)   ((ctx).margin.R)
#define ECO_T(ctx)   ((ctx).margin.T)
#define ECO_B(ctx)   ((ctx).margin.B)

#define ECO_STANDARD  eco_lrtb_preset(ECO_PRESET_STANDARD)
#define ECO_COMPACT   eco_lrtb_preset(ECO_PRESET_COMPACT)
#define ECO_WIDE      eco_lrtb_preset(ECO_PRESET_WIDE)
#define ECO_DOCUMENT  eco_lrtb_preset(ECO_PRESET_DOCUMENT)
#define ECO_WEB       eco_lrtb_preset(ECO_PRESET_WEB)

#ifdef __cplusplus
}
#endif

#endif /* ECO_LRTB_H */
