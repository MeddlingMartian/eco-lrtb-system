================================================================================
  ATKMA LANGUAGE SPECIFICATION v1.0.0
  Adhere To Konwisdom Make Agreement
  Supplemental Exhaust Current Block Exchange Current Block With Supplemental Code
================================================================================
  Licensed under the Toadstool Open Source Software License v1.0.0
  Copyright (C) 2026 Tyler Blankenship
================================================================================

SECTION 1 -- PURPOSE

  ATKMA is a universal supplemental code language.

  Its single purpose is this:

    When a programming process uses a keyword, pattern, or construct that is
    incompatible with a target runtime or environment, ATKMA intercepts that
    block, exhausts (terminates) it cleanly, and exchanges it with a
    functionally equivalent block written in a language that IS compatible
    with the target runtime.

  ATKMA does not replace languages. It agrees between them.

  The word AGREEMENT in ATKMA means:
    Two code blocks from two different languages have been examined, a
    functional equivalence has been established, and one may substitute
    for the other without breaking the program.


SECTION 2 -- CORE VOCABULARY

  ATKMA uses a minimal keyword set. No word in ATKMA has more than one meaning.

  KEYWORD         MEANING
  ------------    ---------------------------------------------------------
  DETECT          scan a file or block for a disallowed pattern
  EXHAUST         cleanly terminate the lines affected by the disallowed pattern
  EXCHANGE        replace exhausted lines with supplemental equivalent lines
  AGREE           confirm that the exchange produces functional equivalence
  SUPPLEMENT      the replacement block from an external language
  BLOCK           a contiguous range of lines affected by a single pattern
  PATTERN         a keyword or construct that triggers an ATKMA exchange
  TARGET          the runtime or environment the file must be compatible with
  SOURCE_LANG     the original language of the block being exhausted
  SUPP_LANG       the language providing the supplemental replacement block
  REGISTRY        the file listing all known PATTERN to SUPP_LANG mappings
  TOADSTOOL       the license governing this language


SECTION 3 -- EXCHANGE FILE FORMAT (.atkma)

  An ATKMA exchange file describes one exchange operation.

  SYNTAX:

    ATKMA v1.0
    TARGET      : [runtime name]
    SOURCE_FILE : [path to file being processed]
    PATTERN     : [disallowed keyword or construct]
    SOURCE_LANG : [language of original block]
    SUPP_LANG   : [language of supplemental block]
    BLOCK_START : [line number where block begins]
    BLOCK_END   : [line number where block ends]
    AGREE       : [yes | pending | failed]

    -- ORIGINAL BLOCK --
    [original lines of code]

    -- SUPPLEMENT BLOCK --
    [replacement lines of code in SUPP_LANG]

    -- END EXCHANGE --

  RULES:
    - Every exchange file covers exactly one PATTERN in one SOURCE_FILE.
    - AGREE must be set to yes before the exchange is applied.
    - If AGREE is pending the exchange is staged but not applied.
    - If AGREE is failed the exchange is logged and the block is left unchanged.


SECTION 4 -- PATTERN REGISTRY FORMAT (.atkma.registry.json)

  The registry maps disallowed patterns to their supplemental language targets.

  {
    "registry_version": "1.0.0",
    "license": "Toadstool Open Source Software License v1.0.0",
    "patterns": [
      {
        "pattern":      "var ",
        "targets":      ["deno", "deno-strict"],
        "source_lang":  "javascript",
        "supp_lang":    "typescript",
        "exchange":     "replace_var_with_const_or_let",
        "description":  "var is not allowed in Deno strict mode. Exchange with const or let."
      },
      {
        "pattern":      " e ",
        "targets":      ["deno", "deno-strict"],
        "source_lang":  "javascript",
        "supp_lang":    "typescript",
        "exchange":     "replace_bare_e_catch_param",
        "description":  "Bare catch(e) is flagged. Exchange with typed catch parameter."
      }
    ]
  }


SECTION 5 -- THE AGREEMENT PROCESS

  Step 1  DETECT
          The ATKMA engine scans SOURCE_FILE for all occurrences of PATTERN.
          Each occurrence and its affected BLOCK is recorded.

  Step 2  EXHAUST
          The affected BLOCK is marked for replacement.
          The original lines are preserved in the exchange file under
          -- ORIGINAL BLOCK -- for audit and rollback.

  Step 3  SUPPLEMENT
          The ATKMA engine generates a replacement BLOCK in SUPP_LANG that
          produces the same functional result as the original BLOCK.

  Step 4  AGREE
          The engine confirms the supplement is functionally equivalent.
          AGREE is set to yes.

  Step 5  EXCHANGE
          The original BLOCK is replaced by the SUPPLEMENT BLOCK in a new
          file. The original file is never deleted -- only a new file is
          written with the suffix .atkma.out.[ext]

  Step 6  LOG
          All exchanges are logged to atkma/exchanges/[timestamp].atkma
          for audit, rollback, and registry improvement.


SECTION 6 -- SUPPLEMENT RULES FOR var AND e

  PATTERN: var
  TARGET:  Deno / Deno strict

    var x = value;
    EXHAUSTED. SUPPLEMENT:
    const x = value;          -- if x is never reassigned
    let x = value;            -- if x is reassigned later in the block

  PATTERN: catch(e)
  TARGET:  Deno / Deno strict

    catch(e) { ... e.message ... }
    EXHAUSTED. SUPPLEMENT:
    catch(error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      ... message ...
    }

  PATTERN: catch(e) where e is unused
  TARGET:  Deno / Deno strict

    catch(e) { }
    EXHAUSTED. SUPPLEMENT:
    catch { }                  -- Deno supports empty catch without parameter


SECTION 7 -- SLOWDOWN ACKNOWLEDGEMENT

  ATKMA exchanges may introduce a temporary slowdown in processing speed
  during the transpilation step. This is not considered an error condition.

  The design priority of ATKMA is:
    1. Functional correctness across language boundaries
    2. Readability of the supplemental output
    3. Processing speed

  Speed is third. Correctness and readability are first and second.


SECTION 8 -- FILE NAMING CONVENTION

  Source file:        filename.js
  ATKMA output file:  filename.atkma.out.ts
  Exchange log:       atkma/exchanges/YYYY-MM-DD-HHMMSS-filename.atkma

  The output file is always a NEW file. The source file is never modified.


SECTION 9 -- LICENSE

  ATKMA is licensed under the Toadstool Open Source Software License v1.0.0.
  See LICENSE_TOADSTOOL.md for full terms.

================================================================================
  END OF ATKMA SPECIFICATION v1.0.0
================================================================================
