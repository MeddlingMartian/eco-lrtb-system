<?php
declare(strict_types=1);

namespace EcoLRTB;

enum EcoUnit: int {
    case PX  = 0;
    case PT  = 1;
    case MM  = 2;
    case IN  = 3;
    case DXA = 4;
    case EMU = 5;
    case REM = 6;
}

enum EcoPreset: int {
    case COMPACT  = 0;
    case STANDARD = 1;
    case WIDE     = 2;
    case DOCUMENT = 3;
    case WEB      = 4;
}

enum EcoTarget: string {
    case GENERIC = 'generic';
    case TXT     = 'txt';
    case MD      = 'md';
    case HTML    = 'html';
    case DOCX    = 'docx';
    case PDF     = 'pdf';
    case XML     = 'xml';
    case PHP     = 'php';
}

final class EcoConverter
{
    private static array $ratio = [
        [1.0,      0.75,     0.26458,   0.010417,  15.0,     9525.0,    0.0625   ],
        [1.33333,  1.0,      0.35278,   0.013889,  20.0,     12700.0,   0.08333  ],
        [3.77953,  2.83465,  1.0,       0.039370,  56.6929,  360000.0,  0.23622  ],
        [96.0,     72.0,     25.4,      1.0,       1440.0,   914400.0,  6.0      ],
        [0.06667,  0.05,     0.01764,   0.000694,  1.0,      635.0,     0.004167 ],
        [0.000105, 7.87e-5,  2.778e-6,  1.09e-6,   0.001575, 1.0,       6.55e-6  ],
        [16.0,     12.0,     4.23333,   0.16667,   240.0,    152400.0,  1.0      ],
    ];

    public static function convert(int $value, EcoUnit $from, EcoUnit $to): int
    {
        if ($from === $to) return $value;
        return (int) round($value * self::$ratio[$from->value][$to->value]);
    }
}

final readonly class EcoRect
{
    public function __construct(
        public int $L = 0,
        public int $R = 0,
        public int $T = 0,
        public int $B = 0,
    ) {}

    public static function uniform(int $all): self
    {
        return new self($all, $all, $all, $all);
    }

    public static function fromPreset(EcoPreset $preset): self
    {
        return match($preset) {
            EcoPreset::COMPACT  => new self( 48,  48,  48,  48),
            EcoPreset::STANDARD => new self( 72,  72,  96,  96),
            EcoPreset::WIDE     => new self( 96,  96, 144, 144),
            EcoPreset::DOCUMENT => new self(138, 138, 138, 138),
            EcoPreset::WEB      => new self(  0,   0,   0,   0),
        };
    }

    public static function fromArray(array $arr): self
    {
        return new self(
            (int)($arr['L'] ?? $arr['left']   ?? 0),
            (int)($arr['R'] ?? $arr['right']  ?? 0),
            (int)($arr['T'] ?? $arr['top']    ?? 0),
            (int)($arr['B'] ?? $arr['bottom'] ?? 0),
        );
    }

    public static function fromJson(string $json): self
    {
        return self::fromArray(json_decode($json, true));
    }

    public function toUnit(EcoUnit $from, EcoUnit $to): self
    {
        if ($from === $to) return $this;
        return new self(
            EcoConverter::convert($this->L, $from, $to),
            EcoConverter::convert($this->R, $from, $to),
            EcoConverter::convert($this->T, $from, $to),
            EcoConverter::convert($this->B, $from, $to),
        );
    }

    public function toDxa(): self { return $this->toUnit(EcoUnit::PX, EcoUnit::DXA); }
    public function toPt(): self  { return $this->toUnit(EcoUnit::PX, EcoUnit::PT);  }
    public function toMm(): self  { return $this->toUnit(EcoUnit::PX, EcoUnit::MM);  }

    public function add(self $other): self
    {
        return new self(
            $this->L + $other->L, $this->R + $other->R,
            $this->T + $other->T, $this->B + $other->B,
        );
    }

    public function scale(float $factor): self
    {
        return new self(
            (int) round($this->L * $factor),
            (int) round($this->R * $factor),
            (int) round($this->T * $factor),
            (int) round($this->B * $factor),
        );
    }

    public function clamp(int $min, int $max): self
    {
        return new self(
            max($min, min($this->L, $max)),
            max($min, min($this->R, $max)),
            max($min, min($this->T, $max)),
            max($min, min($this->B, $max)),
        );
    }

    public function toCss(string $prop = 'margin'): string
    {
        return "{$prop}: {$this->T}px {$this->R}px {$this->B}px {$this->L}px;";
    }

    public function toCssVars(string $prefix = 'eco'): string
    {
        return "--{$prefix}-left:{$this->L}px;" .
               "--{$prefix}-right:{$this->R}px;" .
               "--{$prefix}-top:{$this->T}px;" .
               "--{$prefix}-bottom:{$this->B}px;";
    }

    public function toOoxmlPgMar(): string
    {
        $d = $this->toDxa();
        return "<w:pgMar w:left=\"{$d->L}\" w:right=\"{$d->R}\" " .
               "w:top=\"{$d->T}\" w:bottom=\"{$d->B}\" " .
               "w:header=\"720\" w:footer=\"720\"/>";
    }

    public function toXml(string $tag = 'eco:lrtb'): string
    {
        return "<{$tag} L=\"{$this->L}\" R=\"{$this->R}\" " .
               "T=\"{$this->T}\" B=\"{$this->B}\"/>";
    }

    public function toJson(): string
    {
        return json_encode([
            'L' => $this->L,
            'R' => $this->R,
            'T' => $this->T,
            'B' => $this->B,
        ]);
    }

    public function toPhpLiteral(): string
    {
        return "['L'=>{$this->L},'R'=>{$this->R},'T'=>{$this->T},'B'=>{$this->B}]";
    }

    public function toArray(): array
    {
        return ['L' => $this->L, 'R' => $this->R, 'T' => $this->T, 'B' => $this->B];
    }

    public function __toString(): string
    {
        return "EcoRect(L={$this->L},R={$this->R},T={$this->T},B={$this->B})";
    }
}

final class EcoContext
{
    public EcoRect   $margin;
    public EcoRect   $padding;
    public EcoRect   $border;
    public EcoTarget $target;
    public EcoUnit   $unit;
    public int       $pageWidth  = 816;
    public int       $pageHeight = 1056;

    public function __construct(EcoTarget $target = EcoTarget::GENERIC)
    {
        $this->target  = $target;
        $this->padding = EcoRect::uniform(0);
        $this->border  = EcoRect::uniform(0);
        $this->unit    = EcoUnit::PX;

        $this->margin = match($target) {
            EcoTarget::DOCX, EcoTarget::PDF => EcoRect::fromPreset(EcoPreset::DOCUMENT),
            EcoTarget::HTML, EcoTarget::PHP => EcoRect::fromPreset(EcoPreset::WEB),
            default                         => EcoRect::fromPreset(EcoPreset::STANDARD),
        };
    }

    public function cssRootBlock(): string
    {
        $m = $this->margin;
        $p = $this->padding;
        return ":root {\n" .
            "  --eco-margin-left:   {$m->L}px;\n" .
            "  --eco-margin-right:  {$m->R}px;\n" .
            "  --eco-margin-top:    {$m->T}px;\n" .
            "  --eco-margin-bottom: {$m->B}px;\n" .
            "  --eco-pad-left:      {$p->L}px;\n" .
            "  --eco-pad-right:     {$p->R}px;\n" .
            "  --eco-pad-top:       {$p->T}px;\n" .
            "  --eco-pad-bottom:    {$p->B}px;\n" .
            "}\n";
    }
}

function eco_compact():  EcoRect { return EcoRect::fromPreset(EcoPreset::COMPACT);  }
function eco_standard(): EcoRect { return EcoRect::fromPreset(EcoPreset::STANDARD); }
function eco_wide():     EcoRect { return EcoRect::fromPreset(EcoPreset::WIDE);     }
function eco_document(): EcoRect { return EcoRect::fromPreset(EcoPreset::DOCUMENT); }
function eco_web():      EcoRect { return EcoRect::fromPreset(EcoPreset::WEB);      }

if (php_sapi_name() === 'cli') {
    $ctx = new EcoContext(EcoTarget::DOCX);
    echo "=== Eco_L_R_T_B_System -- PHP ===\n";
    echo "Margin:       {$ctx->margin}\n";
    echo "CSS:          " . $ctx->margin->toCss() . "\n";
    echo "OOXML pgMar:  " . $ctx->margin->toOoxmlPgMar() . "\n";
    echo "JSON:         " . $ctx->margin->toJson() . "\n";
    echo "PHP literal:  " . $ctx->margin->toPhpLiteral() . "\n";
    echo "DXA (twips):  " . $ctx->margin->toDxa() . "\n\n";
    echo $ctx->cssRootBlock();
}
