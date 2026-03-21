# ECO\_L\_R\_T\_B\_SYSTEM

**Eco Left Right Top Bottom Document Formatting System**
Version 1.0.0

Copyright (C) 2026 Tyler Blankenship
Copyright (C) 2026 Rae
Copyright (C) 2026 Lucas
Copyright (C) 2026 Daloze Benoit (Eregon)
MIT License

---

## Core Values

| Token   | Meaning                          |
|---------|----------------------------------|
| ECO\_L  | Left   margin / padding / border |
| ECO\_R  | Right  margin / padding / border |
| ECO\_T  | Top    margin / padding / border |
| ECO\_B  | Bottom margin / padding / border |

---

## 1. Base Unit

**1 ECO\_UNIT = 1 pixel at 96 dpi**

| Unit | 1 ECO\_UNIT = | Notes                     |
|------|--------------|---------------------------|
| px   | 1.000000     | CSS pixel (96dpi)         |
| pt   | 0.750000     | Desktop point             |
| mm   | 0.264583     | Millimetre                |
| in   | 0.010417     | Inch (1/96)               |
| DXA  | 15.000000    | Word twip (1/1440 in)     |
| EMU  | 9525.000000  | OOXML English Metric Unit |
| rem  | 0.062500     | CSS rem (base 16px)       |

---

## 2. Presets

All values in ECO\_UNIT (px at 96dpi).

| Name     |  L  |  R  |  T  |  B  | Description                  |
|----------|-----|-----|-----|-----|------------------------------|
| compact  |  48 |  48 |  48 |  48 | 0.50 in all sides            |
| standard |  72 |  72 |  96 |  96 | 0.75 in L/R, 1.00 in T/B    |
| wide     |  96 |  96 | 144 | 144 | 1.00 in L/R, 1.50 in T/B    |
| document | 138 | 138 | 138 | 138 | 1.4375 in all (Word default) |
| web      |   0 |   0 |   0 |   0 | Zero -- CSS handles layout   |

---

## 3. File Registry

| File                            | Format | Description                           |
|---------------------------------|--------|---------------------------------------|
| ECO\_LRTB.FILE                  | FILE   | Master container format               |
| core/eco\_lrtb.h                | C      | Header -- types and API declarations  |
| core/eco\_lrtb.c                | C      | Implementation -- pure C99, zero deps |
| core/eco\_lrtb.cs               | C#     | .NET 6+, immutable struct             |
| core/eco\_lrtb.py               | Python | Python 3.9+, frozen dataclass         |
| core/eco\_lrtb.js               | JS     | V8 / Nitro / Turbine optimized ESM    |
| core/eco\_lrtb.html             | HTML   | Live demo + embedded JS engine        |
| core/eco\_lrtb.php              | PHP    | PHP 8.1+, readonly class              |
| core/eco\_lrtb\_w3c.css         | CSS    | W3C @layer, custom properties         |
| core/eco\_lrtb.nix              | Nix    | Reproducible build derivation         |
| polyfill/eco\_lrtb\_polyfill.js | JS     | Browser polyfill, ES5, IE11+          |
| nitro/eco\_lrtb\_nitro.js       | JS     | JavaScriptCore optimized              |
| nitro/eco\_lrtb\_v8.js          | JS     | V8 hidden class optimized             |
| nitro/eco\_lrtb\_turbine.js     | JS     | Bun/Deno Turbine, pure ESM            |
| apache/eco\_lrtb.conf           | Apache | MIME, CORS, cache, rewrite            |
| maven/pom.xml                   | XML    | Maven build, Java 17                  |
| xml/eco\_lrtb.xml               | XML    | XML data with XSD schema reference    |
| ftp/eco\_ftp\_library.js        | JS     | FTP protocol library + index          |

---

## 4. Serialization Formats

**CSS**
```css
margin: 96px 72px 96px 72px;
XML
<eco:lrtb L="72" R="72" T="96" B="96"/>
JSON
{"L":72,"R":72,"T":96,"B":96}
OOXML (Word pgMar -- values in DXA twips)
<w:pgMar w:left="1080" w:right="1080" w:top="1440" w:bottom="1440"/>
PHP
['L'=>72,'R'=>72,'T'=>96,'B'=>96]
Python
{'L':72,'R':72,'T':96,'B':96}
5. Document Target Defaults
Target
Default
Notes
.txt / .md
standard
Visual frame only
.html
web
CSS handles margins
.docx
document
pgMar in DXA twips
.pdf
document
Points or mm
.xml
standard
Attribute-based
.php
web
CSS output via toCss()
6. FTP Repository
Property
Value
Protocol
FTP (passive mode)
Host
ftp.eco-lrtb.dev
Port
21
Base path
/pub/eco_lrtb/v1.0/
Index
eco_ftp_index.json
Auth
TOKEN
7. Unit Conversion Reference
Multiply the source value by the ratio to convert.
From
To px
To pt
To mm
To in
To DXA
px
1.0
0.75
0.26458
0.010417
15.0
pt
1.33333
1.0
0.35278
0.013889
20.0
mm
3.77953
2.83465
1.0
0.039370
56.6929
in
96.0
72.0
25.4
1.0
1440.0
DXA
0.06667
0.05
0.01764
0.000694
1.0
rem
16.0
12.0
4.23333
0.16667
240.0
---
