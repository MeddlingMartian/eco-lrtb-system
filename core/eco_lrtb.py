from __future__ import annotations
from dataclasses import dataclass, field
from enum import IntEnum, auto
from typing import ClassVar, Dict, Tuple
import json


class EcoUnit(IntEnum):
    PX  = 0
    PT  = 1
    MM  = 2
    IN  = 3
    DXA = 4
    EMU = 5
    REM = 6

class EcoPreset(IntEnum):
    COMPACT  = 0
    STANDARD = 1
    WIDE     = 2
    DOCUMENT = 3
    WEB      = 4

class EcoTarget(IntEnum):
    GENERIC = 0
    TXT     = auto()
    MD      = auto()
    HTML    = auto()
    DOCX    = auto()
    PDF     = auto()
    XML     = auto()
    PHP     = auto()


_RATIO: Tuple[Tuple[float, ...], ...] = (
    (   1.0,      0.75,     0.26458,   0.010417,   15.0,     9525.0,    0.0625   ),
    (   1.33333,  1.0,      0.35278,   0.013889,   20.0,     12700.0,   0.08333  ),
    (   3.77953,  2.83465,  1.0,       0.039370,   56.6929,  360000.0,  0.23622  ),
    (  96.0,     72.0,     25.4,       1.0,       1440.0,   914400.0,   6.0      ),
    (   0.06667,  0.05,     0.01764,   0.000694,    1.0,     635.0,     0.004167 ),
    (   0.000105, 0.0000787,2.778e-6,  1.09e-6,    0.001575, 1.0,      6.55e-6  ),
    (  16.0,     12.0,      4.23333,   0.16667,   240.0,   152400.0,   1.0      ),
)


def convert_unit(value: float, from_unit: EcoUnit, to_unit: EcoUnit) -> int:
    if from_unit == to_unit:
        return int(value)
    return round(value * _RATIO[from_unit][to_unit])


@dataclass(frozen=True)
class EcoRect:
    L: int = 0
    R: int = 0
    T: int = 0
    B: int = 0

    PRESETS: ClassVar[Dict[EcoPreset, "EcoRect"]] = {}

    @classmethod
    def uniform(cls, all_sides: int) -> "EcoRect":
        return cls(all_sides, all_sides, all_sides, all_sides)

    @classmethod
    def from_preset(cls, preset: EcoPreset) -> "EcoRect":
        return cls.PRESETS[preset]

    @classmethod
    def from_css(cls, css: str) -> "EcoRect":
        parts = [int(p.replace("px", "").replace("rem", "").strip())
                 for p in css.split()]
        if len(parts) == 1:
            return cls.uniform(parts[0])
        if len(parts) == 2:
            return cls(parts[1], parts[1], parts[0], parts[0])
        if len(parts) == 4:
            return cls(parts[3], parts[1], parts[0], parts[2])
        raise ValueError(f"Cannot parse CSS shorthand: {css!r}")

    @classmethod
    def from_json(cls, data: str | dict) -> "EcoRect":
        d = json.loads(data) if isinstance(data, str) else data
        return cls(d["L"], d["R"], d["T"], d["B"])

    def to_unit(self, from_unit: EcoUnit, to_unit: EcoUnit) -> "EcoRect":
        if from_unit == to_unit:
            return self
        return EcoRect(
            convert_unit(self.L, from_unit, to_unit),
            convert_unit(self.R, from_unit, to_unit),
            convert_unit(self.T, from_unit, to_unit),
            convert_unit(self.B, from_unit, to_unit),
        )

    def to_dxa(self) -> "EcoRect":
        return self.to_unit(EcoUnit.PX, EcoUnit.DXA)

    def to_pt(self) -> "EcoRect":
        return self.to_unit(EcoUnit.PX, EcoUnit.PT)

    def to_mm(self) -> "EcoRect":
        return self.to_unit(EcoUnit.PX, EcoUnit.MM)

    def __add__(self, other: "EcoRect") -> "EcoRect":
        return EcoRect(self.L+other.L, self.R+other.R,
                       self.T+other.T, self.B+other.B)

    def __mul__(self, factor: float) -> "EcoRect":
        return EcoRect(round(self.L*factor), round(self.R*factor),
                       round(self.T*factor), round(self.B*factor))

    def clamp(self, min_val: int, max_val: int) -> "EcoRect":
        return EcoRect(
            max(min_val, min(self.L, max_val)),
            max(min_val, min(self.R, max_val)),
            max(min_val, min(self.T, max_val)),
            max(min_val, min(self.B, max_val)),
        )

    def to_css(self, prop: str = "margin") -> str:
        return f"{prop}: {self.T}px {self.R}px {self.B}px {self.L}px;"

    def to_css_vars(self, prefix: str = "eco") -> str:
        return (f"--{prefix}-left:{self.L}px;"
                f"--{prefix}-right:{self.R}px;"
                f"--{prefix}-top:{self.T}px;"
                f"--{prefix}-bottom:{self.B}px;")

    def to_ooxml_pg_mar(self) -> str:
        d = self.to_dxa()
        return (f'<w:pgMar w:left="{d.L}" w:right="{d.R}" '
                f'w:top="{d.T}" w:bottom="{d.B}" '
                f'w:header="720" w:footer="720"/>')

    def to_xml(self, tag: str = "eco:lrtb") -> str:
        return f'<{tag} L="{self.L}" R="{self.R}" T="{self.T}" B="{self.B}"/>'

    def to_json(self) -> str:
        return json.dumps({"L": self.L, "R": self.R,
                           "T": self.T, "B": self.B})

    def to_php(self) -> str:
        return f"['L'=>{self.L},'R'=>{self.R},'T'=>{self.T},'B'=>{self.B}]"

    def to_txt_frame(self, width: int = 80) -> str:
        inner    = width - self.L - self.R
        top_pad  = "\n" * (self.T // 16)
        bot_pad  = "\n" * (self.B // 16)
        left_pad = " " * self.L
        return (f"{top_pad}"
                f"{left_pad}{'-' * inner}\n"
                f"{left_pad}  ECO_L={self.L}  ECO_R={self.R}  "
                f"ECO_T={self.T}  ECO_B={self.B}\n"
                f"{left_pad}{'-' * inner}\n"
                f"{bot_pad}")

    def __repr__(self) -> str:
        return f"EcoRect(L={self.L}, R={self.R}, T={self.T}, B={self.B})"


EcoRect.PRESETS = {
    EcoPreset.COMPACT:  EcoRect( 48,  48,  48,  48),
    EcoPreset.STANDARD: EcoRect( 72,  72,  96,  96),
    EcoPreset.WIDE:     EcoRect( 96,  96, 144, 144),
    EcoPreset.DOCUMENT: EcoRect(138, 138, 138, 138),
    EcoPreset.WEB:      EcoRect(  0,   0,   0,   0),
}


@dataclass
class EcoContext:
    margin:      EcoRect   = field(default_factory=lambda: EcoRect.PRESETS[EcoPreset.STANDARD])
    padding:     EcoRect   = field(default_factory=lambda: EcoRect.uniform(0))
    border:      EcoRect   = field(default_factory=lambda: EcoRect.uniform(0))
    target:      EcoTarget = EcoTarget.GENERIC
    unit:        EcoUnit   = EcoUnit.PX
    page_width:  int       = 816
    page_height: int       = 1056
    symmetric:   bool      = False

    @classmethod
    def for_target(cls, target: EcoTarget) -> "EcoContext":
        margin = {
            EcoTarget.DOCX: EcoRect.PRESETS[EcoPreset.DOCUMENT],
            EcoTarget.PDF:  EcoRect.PRESETS[EcoPreset.DOCUMENT],
            EcoTarget.HTML: EcoRect.PRESETS[EcoPreset.WEB],
            EcoTarget.PHP:  EcoRect.PRESETS[EcoPreset.WEB],
        }.get(target, EcoRect.PRESETS[EcoPreset.STANDARD])
        return cls(margin=margin, target=target)

    def css_root_block(self) -> str:
        lines = [":root {"]
        for prop, rect in [("margin", self.margin), ("padding", self.padding)]:
            lines += [
                f"  --eco-{prop}-left:   {rect.L}px;",
                f"  --eco-{prop}-right:  {rect.R}px;",
                f"  --eco-{prop}-top:    {rect.T}px;",
                f"  --eco-{prop}-bottom: {rect.B}px;",
            ]
        lines.append("}")
        return "\n".join(lines)

    def to_json(self) -> str:
        return json.dumps({
            "margin":  json.loads(self.margin.to_json()),
            "padding": json.loads(self.padding.to_json()),
            "border":  json.loads(self.border.to_json()),
            "target":  self.target.name,
            "unit":    self.unit.name,
        }, indent=2)


COMPACT  = EcoRect.PRESETS[EcoPreset.COMPACT]
STANDARD = EcoRect.PRESETS[EcoPreset.STANDARD]
WIDE     = EcoRect.PRESETS[EcoPreset.WIDE]
DOCUMENT = EcoRect.PRESETS[EcoPreset.DOCUMENT]
WEB      = EcoRect.PRESETS[EcoPreset.WEB]


if __name__ == "__main__":
    ctx = EcoContext.for_target(EcoTarget.DOCX)
    print("=== Eco_L_R_T_B_System -- Python ===")
    print(f"Margin:       {ctx.margin}")
    print(f"CSS:          {ctx.margin.to_css()}")
    print(f"OOXML pgMar:  {ctx.margin.to_ooxml_pg_mar()}")
    print(f"JSON:         {ctx.margin.to_json()}")
    print(f"PHP array:    {ctx.margin.to_php()}")
    print(f"DXA twips:    {ctx.margin.to_dxa()}")
    print()
    print(ctx.css_root_block())
    print()
    print(STANDARD.to_txt_frame(width=72))
