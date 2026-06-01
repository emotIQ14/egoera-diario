#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Egoera · Motor de cuadernos-revista (reutilizable).

Renderiza un PDF A4 imprimible a partir de un "descriptor" JSON con la
identidad de marca Egoera: Fraunces (display), JetBrains Mono (kickers),
Helvetica (cuerpo), paleta cobalto/crema/coral/mostaza. Incluye líneas para
escribir a mano. Tipos de página soportados:

  cover · editorial · sumario · section · exercise · quote_break · map_table · closing

Uso:
    python3 render.py data/c06-tu-mejor-yo.json ../../public/cuadernos/egoera-cuaderno-06-tu-mejor-yo.pdf

El descriptor tiene la forma:
    {
      "footer_label": "TU MEJOR YO",
      "stamp_num": "06",
      "theme": {"cover_bg":"#d97757","cover_fg":"#f1ead8","cover_accent":"#f4c842",
                "stamp_bg":"#1d2bdb","stamp_fg":"#f1ead8","cover_dots":"#e89a80"},
      "pages": [ {…}, … ]
    }
Las páginas interiores usan siempre la paleta de marca fija (papel crema +
tinta) para legibilidad e impresión; solo la portada usa los colores del theme.

Fuentes: en ./fonts (Fraunces OFL + JetBrains Mono OFL). Ver FONTS-LICENSE.md.
"""
import os, sys, json
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, 'fonts')

def _register():
    pdfmetrics.registerFont(TTFont('Fraunces',          os.path.join(F, 'fraunces-black.ttf')))
    pdfmetrics.registerFont(TTFont('Fraunces-It',       os.path.join(F, 'fraunces-blackitalic.ttf')))
    pdfmetrics.registerFont(TTFont('Fraunces-Semi',     os.path.join(F, 'fraunces-semibold.ttf')))
    pdfmetrics.registerFont(TTFont('Fraunces-LightIt',  os.path.join(F, 'fraunces-italic.ttf')))
    pdfmetrics.registerFont(TTFont('Mono',  os.path.join(F, 'JetBrainsMono-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('MonoB', os.path.join(F, 'JetBrainsMono-Bold.ttf')))

SANS, SANSB = 'Helvetica', 'Helvetica-Bold'

# ── Paleta de marca (interiores) ─────────────────────────────────────────
BLUE, INK   = HexColor('#1d2bdb'), HexColor('#0d0f3d')
CREAM, PAPER= HexColor('#f1ead8'), HexColor('#f6f0e1')
CORAL, AMBER= HexColor('#d97757'), HexColor('#f4c842')
RULE, INKSOFT = HexColor('#cfc7b2'), HexColor('#54506e')
W, H = A4
M = 52

# ── Helpers ──────────────────────────────────────────────────────────────
def wrap(text, font, size, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def para(c, text, x, y, font, size, maxw, leading, color=INK):
    c.setFont(font, size); c.setFillColor(color)
    for ln in wrap(text, font, size, maxw):
        c.drawString(x, y, ln); y -= leading
    return y

def eyebrow(c, text, x, y, color=BLUE, size=8.2):
    c.setFont('Mono', size); c.setFillColor(color); c.drawString(x, y, text.upper())

def writelines(c, x, y, w, n, gap=22):
    c.setStrokeColor(RULE); c.setLineWidth(0.8)
    for i in range(n): c.line(x, y - i*gap, x+w, y - i*gap)
    return y - n*gap

def page_bg(c, color=PAPER): c.setFillColor(color); c.rect(0,0,W,H,fill=1,stroke=0)

def footer(c, n, label):
    c.setFont('Mono', 7.5); c.setFillColor(INKSOFT)
    c.drawString(M, 30, f'EGOERA · {label}'); c.drawRightString(W-M, 30, f'{n:02d}')

def dots(c, cx, cy, cols, rows, color, step=11, r=1.1):
    c.setFillColor(color)
    for i in range(cols):
        for j in range(rows): c.circle(cx+i*step, cy-j*step, r, fill=1, stroke=0)

# ── Renderers ──────────────────────────────────────────────────────────────
def cover(c, p, n, T):
    cb, cf, ca = HexColor(T['cover_bg']), HexColor(T['cover_fg']), HexColor(T['cover_accent'])
    sb, sf = HexColor(T['stamp_bg']), HexColor(T['stamp_fg'])
    c.setFillColor(cb); c.rect(0,0,W,H,fill=1,stroke=0)
    dots(c, W-150, H-90, 12, 9, HexColor(T.get('cover_dots', T['cover_fg'])))
    c.setFillColor(sb); c.circle(W-M-20, H-M-20, 22, fill=1, stroke=0)
    c.setFont('Fraunces', 18); c.setFillColor(sf); c.drawCentredString(W-M-20, H-M-27, T['stamp_num'])
    eyebrow(c, p['eyebrow'], M, H-70, color=cf, size=8.5)
    y = H-150; c.setFont('Fraunces', 62); c.setFillColor(cf)
    for ln in wrap(p['title'], 'Fraunces', 62, W-2*M): c.drawString(M, y, ln); y -= 60
    c.setFont('Fraunces-It', 60); c.setFillColor(ca); c.drawString(M, y, p['accent']); y -= 54
    y -= 16; y = para(c, p['lede'], M, y, SANS, 12.5, W-2*M-60, 18, color=cf)
    y -= 28; colw = (W-2*M-32)/3
    for i, col in enumerate(p['columns']):
        cx = M + i*(colw+16)
        c.setStrokeColor(cf); c.setLineWidth(1.4); c.line(cx, y+10, cx+colw-8, y+10)
        c.setFont('MonoB', 9); c.setFillColor(ca); c.drawString(cx, y-6, col['h'])
        para(c, col['body'], cx, y-22, SANS, 9.3, colw-8, 12.5, color=cf)

def editorial(c, p, n, T, label):
    page_bg(c); eyebrow(c, '— EGOERA · ANTES DE EMPEZAR —', M, H-64)
    y = H-100; c.setFont('Fraunces', 30); c.setFillColor(INK); c.drawString(M, y, p['h']); y -= 40
    for b in p['body']: y = para(c, b, M, y, SANS, 11.5, W-2*M, 17); y -= 10
    y -= 16; c.setFillColor(CREAM); c.roundRect(M, y-78, W-2*M, 82, 12, fill=1, stroke=0)
    c.setStrokeColor(CORAL); c.setLineWidth(3); c.line(M+14, y-8, M+14, y-70)
    c.setFont('Fraunces-LightIt', 16); c.setFillColor(INK); qy = y-26
    for ln in wrap(p['quote'], 'Fraunces-LightIt', 16, W-2*M-60): c.drawString(M+28, qy, ln); qy -= 22
    c.setFont('Mono', 8); c.setFillColor(CORAL); c.drawString(M+28, y-72, p['quote_src'])
    footer(c, n, label)

def sumario(c, p, n, T, label):
    page_bg(c); eyebrow(c, '— ÍNDICE —', M, H-64)
    c.setFont('Fraunces', 32); c.setFillColor(INK); c.drawString(M, H-104, p.get('title', 'El índice.'))
    y = H-150
    for e in p['entries']:
        c.setFont('Fraunces-It', 26); c.setFillColor(CORAL); c.drawString(M, y, e['n'])
        c.setFont('Fraunces-Semi', 14); c.setFillColor(INK); c.drawString(M+54, y+6, e['h'])
        c.setFont(SANS, 10); c.setFillColor(INKSOFT); c.drawString(M+54, y-9, e['sub'])
        c.setStrokeColor(RULE); c.setLineWidth(0.6); c.line(M, y-20, W-M, y-20); y -= 42
    footer(c, n, label)

def section(c, p, n, T, label):
    page_bg(c)
    accent = {'mostaza':AMBER,'coral':CORAL,'azul':BLUE}.get(p.get('color_accent'), AMBER)
    fg = INK if accent == AMBER else CREAM
    c.setFillColor(accent); c.rect(0, H-70, W, 70, fill=1, stroke=0)
    c.setFont('Mono', 8.5); c.setFillColor(fg); c.drawString(M, H-44, p['kicker'].upper())
    c.setFont('Fraunces', 17); c.setFillColor(fg); c.drawRightString(W-M, H-46, f"· {n:02d}")
    y = H-118; c.setFont('Fraunces', 27); c.setFillColor(INK)
    for ln in wrap(p['h'], 'Fraunces', 27, W-2*M): c.drawString(M, y, ln); y -= 32
    y -= 8
    for b in p['body']: y = para(c, b, M, y, SANS, 11, W-2*M, 16.5); y -= 9
    if p.get('bullets'):
        y -= 6
        for b in p['bullets']:
            c.setFillColor(accent); c.circle(M+4, y+3, 3, fill=1, stroke=0)
            y = para(c, b, M+16, y, SANS, 10.5, W-2*M-16, 15); y -= 6
    footer(c, n, label)

def exercise(c, p, n, T, label):
    page_bg(c)
    kw = pdfmetrics.stringWidth(p['kicker'].upper(),'MonoB',8.5)+18
    c.setFillColor(CORAL); c.roundRect(M, H-66, kw, 18, 9, fill=1, stroke=0)
    c.setFont('MonoB', 8.5); c.setFillColor(CREAM); c.drawString(M+9, H-60, p['kicker'].upper())
    y = H-98; c.setFont('Fraunces', 25); c.setFillColor(INK)
    for ln in wrap(p['h'], 'Fraunces', 25, W-2*M): c.drawString(M, y, ln); y -= 30
    y -= 4; y = para(c, p['intro'], M, y, SANS, 10.8, W-2*M, 16, color=INKSOFT); y -= 14
    for pr in p['prompts']:
        y = para(c, pr, M, y, SANSB, 10.5, W-2*M, 14); y -= 6
        y = writelines(c, M, y-4, W-2*M, 2, gap=20); y -= 16
    if p.get('reflection') and y > 150:
        c.setFillColor(AMBER); c.roundRect(M, y-58, W-2*M, 58, 10, fill=1, stroke=0)
        c.setFont('MonoB',7.5); c.setFillColor(INK); c.drawString(M+16, y-16, 'NOTA')
        c.setFont('Fraunces-LightIt', 11.5); c.setFillColor(INK); ry = y-22
        for ln in wrap(p['reflection'], 'Fraunces-LightIt', 11.5, W-2*M-32): c.drawString(M+16, ry-12, ln); ry -= 15
    footer(c, n, label)

def quote_break(c, p, n, T, label):
    c.setFillColor(BLUE); c.rect(0,0,W,H,fill=1,stroke=0)
    dots(c, 60, 140, 14, 6, HexColor('#3a47e0'))
    c.setFont('Fraunces', 30); c.setFillColor(CREAM)
    lines = wrap(p['quote'], 'Fraunces', 30, W-2*M-40); yy = H/2 + 30 + (len(lines)-1)*18
    for ln in lines: c.drawCentredString(W/2, yy, ln); yy -= 38
    c.setFont('Mono', 9); c.setFillColor(AMBER); c.drawCentredString(W/2, yy-6, p['src'].upper())

def map_table(c, p, n, T, label):
    page_bg(c); eyebrow(c, '— CIERRE —', M, H-64)
    c.setFont('Fraunces', 28); c.setFillColor(INK); c.drawString(M, H-104, p['h'])
    y = H-140; y = para(c, p['intro'], M, y, SANS, 11, W-2*M, 16, color=INKSOFT); y -= 16
    cols, rows = p['columns'], p['rows']; tx, tw = M, W-2*M
    cw = [tw*0.16, tw*0.40, tw*0.14, tw*0.30]; rh = 40
    c.setFillColor(INK); c.rect(tx, y-22, tw, 22, fill=1, stroke=0)
    c.setFont('MonoB', 8); c.setFillColor(CREAM); cx = tx
    for i, col in enumerate(cols): c.drawString(cx+6, y-15, col); cx += cw[i] if i < len(cw) else 0
    yy = y-22; c.setStrokeColor(RULE); c.setLineWidth(0.7)
    for r in rows:
        c.line(tx, yy, tx+tw, yy)
        c.setFont('Fraunces-Semi', 11); c.setFillColor(INK); c.drawString(tx+6, yy-24, r); yy -= rh
    c.line(tx, yy, tx+tw, yy); cx = tx
    for i in range(len(cw)+1):
        c.line(cx, y-22, cx, yy)
        if i < len(cw): cx += cw[i]
    footer(c, n, label)

def closing(c, p, n, T, label):
    c.setFillColor(INK); c.rect(0,0,W,H,fill=1,stroke=0)
    dots(c, W-140, H-80, 11, 8, HexColor('#2a2c5a'))
    eyebrow(c, '— PARA LLEVARTE —', M, H-80, color=AMBER)
    y = H-130; c.setFont('Fraunces', 34); c.setFillColor(CREAM)
    for ln in wrap(p['h'], 'Fraunces', 34, W-2*M): c.drawString(M, y, ln); y -= 38
    y -= 14
    for b in p['body']: y = para(c, b, M, y, SANS, 11.5, W-2*M-30, 17, color=CREAM); y -= 12
    y -= 20; c.setFillColor(AMBER); c.roundRect(M, y-46, 300, 46, 23, fill=1, stroke=0)
    c.setFont('MonoB', 10); c.setFillColor(INK); c.drawString(M+22, y-22, p['cta_text'].upper()+'  →')
    c.setFont('Mono', 8.5); c.setFillColor(HexColor('#9a9ec9')); c.drawString(M, y-72, p['cta_url'])
    c.setFont('Fraunces-LightIt', 13); c.setFillColor(CORAL); c.drawRightString(W-M, 70, 'psicología, despacio.')

def render_cuaderno(descriptor, out_path):
    """descriptor: dict con footer_label, stamp_num, theme, pages. Devuelve nº de páginas."""
    _register()
    T = dict(descriptor['theme']); T['stamp_num'] = descriptor.get('stamp_num', '00')
    label = descriptor.get('footer_label', 'CUADERNO')
    c = canvas.Canvas(out_path, pagesize=A4)
    c.setTitle(descriptor.get('title', 'Egoera · Cuaderno'))
    c.setAuthor('Ander Bilbao Castejón · Egoera Psikologia')
    simple = {'cover': lambda c,p,n: cover(c,p,n,T)}
    n = 1
    for pg in descriptor['pages']:
        t = pg['type']
        if t == 'cover':       cover(c, pg, n, T)
        elif t == 'editorial': editorial(c, pg, n, T, label)
        elif t == 'sumario':   sumario(c, pg, n, T, label)
        elif t == 'section':   section(c, pg, n, T, label)
        elif t == 'exercise':  exercise(c, pg, n, T, label)
        elif t == 'quote_break': quote_break(c, pg, n, T, label)
        elif t == 'map_table': map_table(c, pg, n, T, label)
        elif t == 'closing':   closing(c, pg, n, T, label)
        else: raise ValueError(f'Tipo de página desconocido: {t}')
        c.showPage(); n += 1
    c.save()
    return n - 1
