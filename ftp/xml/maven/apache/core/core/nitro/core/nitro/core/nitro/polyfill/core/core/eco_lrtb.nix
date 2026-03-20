# eco_lrtb.nix
# Copyright (C) 2026 Tyler Blankenship
# Copyright (C) 2026 Rae
# Copyright (C) 2026 Lucas
# Copyright (C) 2026 Daloze Benoit (Eregon)
# MIT License
#
# USAGE:
#   nix-build eco_lrtb.nix            # build all targets
#   nix-build eco_lrtb.nix -A c       # build C library only
#   nix-build eco_lrtb.nix -A python  # build Python package only
#   nix-shell eco_lrtb.nix            # drop into dev shell

{ pkgs ? import <nixpkgs> {} }:

let
  src = pkgs.lib.cleanSource ./.;

  version = "1.0.0";

  meta = with pkgs.lib; {
    description = "Eco Left Right Top Bottom document layout system";
    homepage    = "https://github.com/MeddlingMartian/eco-lrtb-system";
    license     = licenses.mit;
    maintainers = [ "Tyler Blankenship" "Rae" "Lucas" "Eregon" ];
    platforms   = platforms.all;
  };

in rec {

  c = pkgs.stdenv.mkDerivation {
    pname   = "eco-lrtb-c";
    inherit version src meta;

    nativeBuildInputs = [ pkgs.gcc pkgs.gnumake ];

    buildPhase = ''
      gcc -std=c99 -O2 -Wall -Wextra -fPIC \
        -c core/eco_lrtb.c -o eco_lrtb.o
      gcc -shared -o libeco_lrtb.so eco_lrtb.o -lm
      gcc -std=c99 -O2 -Wall -Wextra \
        -o eco_lrtb_demo core/eco_lrtb.c -lm -DECO_DEMO
    '';

    installPhase = ''
      mkdir -p $out/lib $out/include $out/bin
      cp libeco_lrtb.so   $out/lib/
      cp core/eco_lrtb.h  $out/include/
      cp eco_lrtb_demo    $out/bin/
    '';
  };

  python = pkgs.python311Packages.buildPythonPackage {
    pname   = "eco-lrtb";
    inherit version src;

    propagatedBuildInputs = [];

    installPhase = ''
      mkdir -p $out/${pkgs.python311.sitePackages}/eco_lrtb
      cp core/eco_lrtb.py \
        $out/${pkgs.python311.sitePackages}/eco_lrtb/__init__.py
    '';

    meta = meta // { description = "eco-lrtb Python package"; };
  };

  js = pkgs.stdenv.mkDerivation {
    pname   = "eco-lrtb-js";
    inherit version src meta;

    buildInputs = [ pkgs.nodejs ];

    buildPhase = ''
      node -e "
        const fs = require('fs');
        let src = fs.readFileSync('core/eco_lrtb.js','utf8');
        fs.writeFileSync('eco_lrtb.cjs', src);
        fs.writeFileSync('eco_lrtb.mjs', src);
      "
    '';

    installPhase = ''
      mkdir -p $out/lib
      cp eco_lrtb.cjs                      $out/lib/
      cp eco_lrtb.mjs                      $out/lib/
      cp polyfill/eco_lrtb_polyfill.js     $out/lib/
      cp nitro/eco_lrtb_nitro.js           $out/lib/
      cp nitro/eco_lrtb_v8.js              $out/lib/
      cp nitro/eco_lrtb_turbine.js         $out/lib/
    '';
  };

  all = pkgs.symlinkJoin {
    name  = "eco-lrtb-all-${version}";
    paths = [ c python js ];
    meta  = meta // { description = "eco-lrtb full bundle (all languages)"; };
  };

  devShell = pkgs.mkShell {
    buildInputs = with pkgs; [
      gcc
      gnumake
      python311
      nodejs
      php82
      dotnet-sdk_8
    ];

    shellHook = ''
      echo ""
      echo "  Eco_L_R_T_B_System dev shell"
      echo "  ----------------------------"
      echo "  C:      gcc core/eco_lrtb.c -lm -o eco_demo && ./eco_demo"
      echo "  Python: python3 core/eco_lrtb.py"
      echo "  Node:   node core/eco_lrtb.js"
      echo "  PHP:    php core/eco_lrtb.php"
      echo ""
    '';
  };

  default = all;
}
