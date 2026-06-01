#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI del motor de cuadernos Egoera.

    python3 render.py <descriptor.json> <salida.pdf>

Ejemplo:
    python3 render.py data/c06-tu-mejor-yo.json \
        ../../public/cuadernos/egoera-cuaderno-06-tu-mejor-yo.pdf

Requiere: reportlab (pip install reportlab). Fuentes en ./fonts (incluidas).
"""
import sys, json, os
from engine import render_cuaderno

def main():
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(1)
    desc_path, out_path = sys.argv[1], sys.argv[2]
    with open(desc_path, encoding='utf-8') as f:
        descriptor = json.load(f)
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    pages = render_cuaderno(descriptor, out_path)
    print(f'✓ {pages} páginas → {out_path}')

if __name__ == '__main__':
    main()
