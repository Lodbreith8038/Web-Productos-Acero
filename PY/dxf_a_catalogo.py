#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
============================================================
dxf_a_catalogo.py  ·  CONVERSIÓN 1: DXF → miniatura del catálogo
Productos de Acero E.I.R.L.

Convierte uno o varios archivos .dxf en una miniatura vectorial
liviana y la registra en el catálogo. Se ejecuta en tu PC (no en
la página), porque un DXF puede pesar decenas de MB.

USO (desde la carpeta donde están disenos-dxf.js y catalogo-datos.js):

    python dxf_a_catalogo.py mi_diseno.dxf
    python dxf_a_catalogo.py *.dxf

Requiere:  Python 3  y  numpy   (pip install numpy)

QUÉ HACE POR CADA DXF
  1. Guarda su dibujo en  disenos-dxf.js   (archivo AUTOMÁTICO, no se edita a mano).
  2. Agrega una ficha nueva en  catalogo-datos.js  (sección TALLER), justo
     encima de la marca  >>> NUEVOS DISEÑOS <<<, con nombre y descripción
     provisionales. Luego tú cambias esos textos en catalogo-datos.js.
  Si el DXF ya estaba registrado, solo se actualiza su dibujo y
  no se duplica la ficha.

Entidades DXF soportadas: LINE, ARC, CIRCLE, LWPOLYLINE, SPLINE,
ELLIPSE e INSERT (bloques). HATCH, TEXT y cotas se ignoran.
============================================================
"""
import math, re, sys, json
import numpy as np

# ==========================================================
# MOTOR DE LECTURA DXF (no hace falta tocarlo)
# Lee el archivo, calcula las curvas y las reduce a una sola
# ruta SVG que cabe en el recuadro de 240 x 160 de cada tarjeta.
# ==========================================================
def read_pairs(path):
    with open(path, encoding='latin-1') as f:
        L = f.read().replace('\r', '').split('\n')
    return [(L[i].strip(), L[i+1].strip()) for i in range(0, len(L)-1, 2)]

def parse(path):
    P = read_pairs(path)
    sections = {}; i = 0; cur = None
    ents = []; blocks = {}
    # split sections
    idx = 0
    while idx < len(P):
        if P[idx] == ('0', 'SECTION'):
            name = P[idx+1][1]; j = idx+2; body = []
            while P[j] != ('0', 'ENDSEC'): body.append(P[j]); j += 1
            sections[name] = body; idx = j
        idx += 1
    def split_entities(body):
        out = []; cur = None
        for c, v in body:
            if c == '0':
                if cur: out.append(cur)
                cur = {'t': v, 'd': []}
            elif cur is not None: cur['d'].append((c, v))
        if cur: out.append(cur)
        return out
    allb = split_entities(sections.get('BLOCKS', []))
    name = None; cur = []
    for e in allb:
        if e['t'] == 'BLOCK':
            name = next((v for c, v in e['d'] if c == '2'), None); cur = []
        elif e['t'] == 'ENDBLK':
            if name is not None: blocks[name] = cur
            name = None
        elif name is not None: cur.append(e)
    ents = split_entities(sections.get('ENTITIES', []))
    return ents, blocks

def g(e, code, default=None, all=False):
    vs = [v for c, v in e['d'] if c == code]
    if all: return [float(v) for v in vs]
    return float(vs[0]) if vs else default

def arc_pts(cx, cy, r, a0, a1, ccw=True):
    if ccw:
        while a1 <= a0: a1 += 2*math.pi
    else:
        while a1 >= a0: a1 -= 2*math.pi
    n = max(6, int(abs(a1-a0)/(math.pi/24))+1)
    t = np.linspace(a0, a1, n)
    return np.c_[cx + r*np.cos(t), cy + r*np.sin(t)]

def bulge_seg(p, q, b):
    if abs(b) < 1e-9: return np.array([p, q])
    th = 4*math.atan(b); d = math.dist(p, q)
    if d == 0: return np.array([p])
    r = d/(2*math.sin(th/2)); mx, my = (p[0]+q[0])/2, (p[1]+q[1])/2
    h = math.sqrt(max(r*r-(d/2)**2, 0)) * (1 if b > 0 else -1) * (1 if abs(th) < math.pi else -1)
    h = r*math.cos(th/2)
    dx, dy = (q[0]-p[0])/d, (q[1]-p[1])/d
    cx, cy = mx - dy*h, my + dx*h
    a0 = math.atan2(p[1]-cy, p[0]-cx); a1 = a0 + th
    n = max(4, int(abs(th)/(math.pi/24))+1); t = np.linspace(a0, a1, n)
    return np.c_[cx+abs(r)*np.cos(t), cy+abs(r)*np.sin(t)]

def bspline(ctrl, knots, deg, n=None):
    ctrl = np.array(ctrl); m = len(ctrl)
    n = n or max(16, m*6)
    t0, t1 = knots[deg], knots[m]
    ts = np.linspace(t0, t1-1e-9, n)
    out = []
    for t in ts:
        k = deg
        while k < m-1 and t >= knots[k+1]: k += 1
        d = [ctrl[j+k-deg].copy() for j in range(deg+1)]
        for r in range(1, deg+1):
            for j in range(deg, r-1, -1):
                den = knots[j+1+k-r]-knots[j+k-deg]
                a = (t-knots[j+k-deg])/den if den else 0
                d[j] = (1-a)*d[j-1]+a*d[j]
        out.append(d[deg])
    return np.array(out)

def entity_polys(e, T):
    t = e['t']; polys = []
    if t == 'LINE':
        polys.append(np.array([[g(e,'10'),g(e,'20')],[g(e,'11'),g(e,'21')]]))
    elif t == 'CIRCLE':
        polys.append(arc_pts(g(e,'10'),g(e,'20'),g(e,'40'),0,2*math.pi))
    elif t == 'ARC':
        polys.append(arc_pts(g(e,'10'),g(e,'20'),g(e,'40'),math.radians(g(e,'50')),math.radians(g(e,'51'))))
    elif t == 'LWPOLYLINE':
        xs = [float(v) for c,v in e['d'] if c=='10']; ys = [float(v) for c,v in e['d'] if c=='20']
        bs = []; 
        # bulges follow vertex; rebuild order
        verts = []; cur = None
        for c, v in e['d']:
            if c == '10': cur = [float(v), None, 0.0]; verts.append(cur)
            elif c == '20' and cur: cur[1] = float(v)
            elif c == '42' and cur: cur[2] = float(v)
        closed = int(g(e,'70',0)) & 1
        pts = []
        n = len(verts); rng = n if closed else n-1
        for i in range(rng):
            a = verts[i]; b = verts[(i+1) % n]
            seg = bulge_seg((a[0],a[1]),(b[0],b[1]),a[2])
            pts.extend(seg.tolist() if not pts else seg[1:].tolist())
        if pts: polys.append(np.array(pts))
    elif t == 'SPLINE':
        deg = int(g(e,'71',3)); knots = g(e,'40',all=True)
        cx = g(e,'10',all=True); cy = g(e,'20',all=True)
        fx = g(e,'11',all=True); fy = g(e,'21',all=True)
        if cx and len(knots) == len(cx)+deg+1:
            polys.append(bspline(list(zip(cx,cy)), knots, deg))
        elif fx: polys.append(np.c_[fx, fy])
        elif cx: polys.append(np.c_[cx, cy])
    elif t == 'ELLIPSE':
        cx,cy = g(e,'10'),g(e,'20'); mx,my = g(e,'11'),g(e,'21'); ratio = g(e,'40',1)
        a0,a1 = g(e,'41',0), g(e,'42',2*math.pi)
        if a1 <= a0: a1 += 2*math.pi
        tt = np.linspace(a0,a1,64); ux,uy = mx,my; vx,vy = -my*ratio, mx*ratio
        polys.append(np.c_[cx+ux*np.cos(tt)+vx*np.sin(tt), cy+uy*np.cos(tt)+vy*np.sin(tt)])
    return [apply(T, p) for p in polys]

def apply(T, p):
    return p @ T[:, :2].T + T[:, 2]

def mat(sx, sy, rot, tx, ty):
    c, s = math.cos(rot), math.sin(rot)
    return np.array([[sx*c, -sy*s, tx],[sx*s, sy*c, ty]])

def compose(A, B):  # A applied after B
    A3 = np.vstack([A,[0,0,1]]); B3 = np.vstack([B,[0,0,1]])
    return (A3@B3)[:2]

def collect(ents, blocks, T=None, depth=0):
    T = np.array([[1,0,0],[0,1,0]], float) if T is None else T
    polys = []
    for e in ents:
        if e['t'] == 'INSERT' and depth < 4:
            b = blocks.get(next((v for c,v in e['d'] if c=='2'),None))
            if not b: continue
            M = mat(g(e,'41',1),g(e,'42',1),math.radians(g(e,'50',0)),g(e,'10',0),g(e,'20',0))
            polys += collect(b, blocks, compose(T, M), depth+1)
        else:
            try: polys += entity_polys(e, T)
            except Exception as ex: pass
    return polys

def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; ab = b-a; L = np.hypot(*ab)
    d = (np.abs(ab[0]*(pts[:,1]-a[1])-ab[1]*(pts[:,0]-a[0]))/L) if L else np.hypot(*(pts-a).T)
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[:i+1], eps)[:-1], rdp(pts[i:], eps)])
    return np.array([a, b])

def to_path(polys, vw=240, vh=160, margin=10, eps_px=0.35, drop_px=0.6):
    allp = np.vstack([p for p in polys if len(p)])
    mn, mx = allp.min(0), allp.max(0); w, h = mx-mn
    sc = min((vw-2*margin)/w, (vh-2*margin)/h)
    ox = (vw - w*sc)/2; oy = (vh - h*sc)/2
    out = []; total = 0
    for p in polys:
        if len(p) < 2: continue
        q = np.c_[(p[:,0]-mn[0])*sc+ox, vh-((p[:,1]-mn[1])*sc+oy)]
        ext = np.ptp(q, axis=0).max()
        if ext < drop_px: continue
        q = rdp(q, eps_px)
        out.append('M'+' '.join(f'{x:.1f} {y:.1f}'.replace('.0 ',' ').rstrip('0').rstrip('.') if False else f'{x:.1f},{y:.1f}' for x,y in q[:1]) + 'L' + ' '.join(f'{x:.1f},{y:.1f}' for x,y in q[1:]))
        total += len(q)
    return ''.join(out), (w, h), len(out), total


# ==========================================================
# PROGRAMA PRINCIPAL
# ==========================================================
import os, json, argparse, re as _re

MARCA = '>>> NUEVOS DISEÑOS <<<'
CABECERA_GEOMETRIA = """/* ==========================================================
   DIBUJOS DE LOS DXF  —  ARCHIVO AUTOMÁTICO, NO EDITAR A MANO
   Lo genera dxf_a_catalogo.py (miniatura vectorial 240x160 de cada DXF).
   Los nombres y descripciones se escriben en catalogo-datos.js.
   medidas = tamaño del dibujo en unidades de AutoCAD (se asumen mm)
   ========================================================== */
"""

def cargar_geometria(ruta):
    if not os.path.exists(ruta): return {}
    txt = open(ruta, encoding='utf-8').read()
    i = txt.index('window.DXF_GEOMETRIA')
    cuerpo = txt[txt.index('=', i) + 1:].strip().rstrip(';')
    return json.loads(cuerpo)

def guardar_geometria(ruta, datos):
    filas = ',\n'.join(f'  {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in datos.items())
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(CABECERA_GEOMETRIA + 'window.DXF_GEOMETRIA = {\n' + filas + '\n};\n')

def nombre_bonito(archivo):
    base = os.path.splitext(archivo)[0].replace('_', ' ').replace('-', ' ').strip()
    return base[:1].upper() + base[1:]

def main():
    ap = argparse.ArgumentParser(description='Registra archivos DXF en el catálogo de diseños.')
    ap.add_argument('archivos', nargs='+', help='uno o varios .dxf')
    carpeta = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument('--geometria', default=os.path.join(carpeta, 'disenos-dxf.js'))
    ap.add_argument('--datos', default=os.path.join(carpeta, 'catalogo-datos.js'))
    a = ap.parse_args()

    geo = cargar_geometria(a.geometria)
    datos = open(a.datos, encoding='utf-8').read() if os.path.exists(a.datos) else ''
    nuevos = []
    for ruta in a.archivos:
        nombre = os.path.basename(ruta)
        try:
            ents, blocks = parse(ruta)
            polys = collect(ents, blocks)
            if not polys: raise ValueError('no se encontró geometría compatible')
            d, (w, h), n, _ = to_path(polys)
        except Exception as e:
            print(f'  ✗ {nombre}: {e}'); continue
        geo[nombre] = {'medidas': f'{round(w)} × {round(h)} mm', 'd': d}
        ya = bool(_re.search(r"^\s*\{[^\n]*archivo: '" + _re.escape(nombre) + "'", datos, _re.M))
        if not ya and MARCA in datos:
            existentes = len(_re.findall(r"^\s*\{ cod: 'DXF-", datos, _re.M))
            cod = 'DXF-%02d' % (existentes + 1)
            ficha = f"        {{ cod: '{cod}', archivo: '{nombre}', nombre: '{nombre_bonito(nombre)}', desc: 'Descripción pendiente: edítala aquí.' }},\n"
            nuevos.append(ficha)
            datos = datos.replace('        /* ' + MARCA, ficha + '        /* ' + MARCA, 1)
        estado = 'actualizado' if ya else ('agregado' if MARCA in datos else 'dibujo guardado (falta la ficha en catalogo-datos.js)')
        print(f'  ✓ {nombre}: {n} trazos, {len(d)/1024:.1f} KB, {round(w)} × {round(h)} mm · {estado}')

    guardar_geometria(a.geometria, geo)
    if os.path.exists(a.datos): open(a.datos, 'w', encoding='utf-8').write(datos)
    if nuevos: print('\nSiguiente paso: abre catalogo-datos.js y cambia el nombre y la descripción de las fichas nuevas.')

if __name__ == '__main__':
    main()
