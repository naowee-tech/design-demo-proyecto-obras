from lib import *

W, H, AS = 1440, 960, 380

def aside(kind, title, items):
    """Columna de lectura: 'antes' (qué falla) o 'despues' (qué cambia y por qué)."""
    tone = T['neg'] if kind == 'antes' else T['pos']
    kick = 'CÓMO ESTÁ · QUÉ FALLA' if kind == 'antes' else 'CÓMO DEBIÓ SER · QUÉ CAMBIA'
    rows = ''
    for i, it in enumerate(items, 1):
        t, d = it
        mark = pin(i) if kind == 'antes' else (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 12px; background: {T["teal"]}; color: #fff; font-size: 12px; font-weight: 800; flex-shrink: 0;">{i}</span>')
        rows += (f'<div style="display: flex; gap: 12px; align-items: flex-start;">{mark}<div style="display: flex; flex-direction: column; gap: 3px;">'
                 f'<div style="font-size: 14px; font-weight: 800; color: {T["text"]}; line-height: 1.35;">{t}</div>'
                 f'<div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.55;">{d}</div></div></div>')
    return (f'<aside style="width: {AS}px; flex-shrink: 0; height: 100%; padding: 40px 28px; background: #ffffff; border-left: 1px solid {T["line"]}; display: flex; flex-direction: column; gap: 20px;">'
            f'<div style="display: flex; flex-direction: column; gap: 8px;"><div style="font-size: 12px; font-weight: 800; letter-spacing: .1em; color: {tone};">{kick}</div>'
            f'<div style="font-size: 21px; font-weight: 800; letter-spacing: -.01em; line-height: 1.25;">{title}</div></div>'
            f'<div style="display: flex; flex-direction: column; gap: 18px;">{rows}</div></aside>')

def screen(sidebar_html, main_html, dim=False):
    return (f'<div style="width: {W}px; height: {H}px; display: flex; flex-shrink: 0; overflow: hidden; background: {T["canvas"]}; position: relative;">'
            f'{sidebar_html}<main style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden;">{main_html}</main></div>')

def board(file, title, scr, asd):
    body = f'<div style="display: flex; width: {W + AS}px; height: {H}px;">{scr}{asd}</div>'
    return page(file, title, body, W + AS, H)

# ── Réplica del shell actual (topbar + board blanco) ────────────────────
def old_main(bc, title, inner, right=''):
    return (f'<header style="display: flex; align-items: center; justify-content: space-between; padding: 22px 32px 14px;">'
            f'<div><div style="font-size: 12.5px; color: {T["text2"]};">{bc}</div><div style="font-size: 22px; font-weight: 800; margin-top: 4px;">{title}</div></div>'
            f'<div style="display: flex; align-items: center; gap: 10px;">{btn("", "secondary", "bell", "md", "Notificaciones")}'
            f'<span style="display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 5px; background: #fff; border: 1px solid {T["line"]}; border-radius: 14px; font-size: 13px; font-weight: 700;">'
            f'<span style="width: 30px; height: 30px; border-radius: 15px; background: {T["teal"]}; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px;">JD</span>Jesús Díaz</span>{right}</div></header>'
            f'<div style="flex-grow: 1; margin: 0 24px 24px; background: #ffffff; border-radius: 20px; border: 1px solid {T["line"]}; padding: 24px; overflow: hidden; display: flex; flex-direction: column; gap: 16px;">{inner}</div>')

def old_tabs(active, pins=None):
    pins = pins or {}
    out = ''
    for t in ['Estructura', 'Ítems', 'Carga masiva', 'Versiones', 'Auditoría']:
        on = t == active
        st = f'color: {T["teal8"]}; border-bottom: 3px solid {T["teal"]}; font-weight: 800;' if on else f'color: {T["text"]}; border-bottom: 3px solid transparent; font-weight: 600;'
        out += f'<span style="padding: 10px 16px; font-size: 14px; {st} display: inline-flex; align-items: center; gap: 6px;">{t}{pins.get(t, "")}</span>'
    return f'<div role="tablist" style="display: flex; border-bottom: 1px solid {T["line"]};">{out}</div>'

def old_kpis(pinn=None):
    k = lambda l, v: (f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid {T["line"]}; border-radius: 14px; box-shadow: 0 4px 14px -8px rgba(16,40,60,.25);">'
                      f'<span style="width: 34px; height: 34px; border-radius: 10px; background: {T["teal1"]};"></span><div><div style="font-size: 12px; font-weight: 700; color: {T["teal8"]};">{l}</div><div style="font-size: 22px; font-weight: 800; color: {T["teal9"]};">{v}</div></div></div>')
    return f'<div style="display: flex; gap: 12px; align-items: center;">{k("Valor total del catálogo", "$11.951.550")}{k("Ítems", "159")}{pin(pinn) if pinn else ""}</div>'

# ── Propuesta: encabezado del espacio de trabajo ────────────────────────
def ws_header(state='vigente', active='Contenido', draft=5):
    if state == 'borrador':
        name, status = 'Base de precios gestores 2027', badge('v1.0 en preparación · aún no vigente', 'cau', 'edit', 'md')
        meta = '12 departamentos · Rol: Gestor · Vigencia 01/01/2027 – 31/12/2027 · Creado hoy por Jesús Díaz'
        cta = btn('Continuar: cargar precios', 'primary', 'arrow', 'lg')
        draftbar = ''
    else:
        name, status = 'Base de precios general 2026', badge('Vigente · v1.3', 'pos', 'check', 'md')
        meta = '33 departamentos · Roles: Gestor, Contratista · Vigencia 01/01/2026 – 31/12/2026 · v1.3 activa desde el 16/09/2026'
        cta = btn(f'Revisar y activar v1.4', 'primary', 'send', 'lg') if draft else btn('Actualizar precios', 'primary', 'edit', 'lg')
        draftbar = (f'<div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; background: {T["infobg"]}; border: 1px solid {T["infoln"]}; color: {T["info"]}; font-size: 13px; font-weight: 700;">'
                    f'{svg("clock", 16, T["info"], 2)}<span>Trabajas sobre la <b>v1.4 en preparación</b> ({draft} cambios). La Consulta y los presupuestos siguen usando la v1.3 hasta que la actives.</span>'
                    f'<a href="#" style="margin-left: auto; font-weight: 800; color: {T["info"]};">Ver cambios</a></div>') if draft else ''
    tabs = ''
    for t, ic, count in [('Alcance y estructura', 'sliders', None), ('Contenido', 'layers', None), ('Versiones', 'send', draft if state != 'borrador' and draft else None), ('Historial', 'history', None)]:
        on = t == active
        st = f'color: {T["teal9"]}; border-bottom: 3px solid {T["teal"]}; font-weight: 800;' if on else f'color: {T["text2"]}; border-bottom: 3px solid transparent; font-weight: 700;'
        cnt = (f'<span style="min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: {T["info"]}; color: #fff; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">{count}</span>') if count else ''
        sel = ' aria-selected="true"' if on else ' aria-selected="false"'
        tabs += f'<button type="button" role="tab"{sel} style="display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 4px; margin-right: 26px; background: none; border: 0; border-bottom: 3px solid transparent; font-family: inherit; font-size: 14px; cursor: pointer; {st}">{svg(ic, 17)}{t}{cnt}</button>'
    return (f'<header style="background: #ffffff; border-bottom: 1px solid {T["line"]}; padding: 20px 32px 0; display: flex; flex-direction: column; gap: 14px;">'
            f'<nav aria-label="Ruta" style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: {T["text2"]};"><a href="#" style="color: {T["text2"]}; text-decoration: none; font-weight: 600;">Catálogos de precios</a>{svg("chr", 14)}<span style="color: {T["text"]}; font-weight: 700;">{name}</span></nav>'
            f'<div style="display: flex; align-items: flex-start; gap: 20px;">'
            f'<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px;"><div style="display: flex; align-items: center; gap: 12px;"><h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -.02em;">{name}</h1>{status}</div>'
            f'<div style="font-size: 13px; color: {T["text2"]};">{meta}</div></div>'
            f'<div style="display: flex; align-items: center; gap: 8px;">{btn("Editar datos", "secondary", "edit", "lg")}{btn("", "secondary", "eye", "lg", "Ver como consulta")}{btn("", "secondary", "dots", "lg", "Más acciones")}{cta}</div></div>'
            f'{draftbar}<div role="tablist" aria-label="Momentos del catálogo" style="display: flex;">{tabs}</div></header>')

CAPS = [('1', 'Preliminares', 7), ('2', 'Excavaciones y rellenos', 6), ('3', 'Cimentación', 6), ('4', 'Estructuras en concreto', 6), ('5', 'Mampostería', 6), ('8', 'Instalaciones hidrosanitarias', 7), ('16', 'Pinturas', 7)]
APU3 = [('3.1', 'Base agregado pétreo (material de afirmado)', 'm³', '$171.287'), ('3.2', 'Base arena cemento 1:20 (hecho en obra)', 'm³', '$295.643'),
        ('3.3', 'Base en concreto pobre (hecho en obra)', 'm³', '$556.198'), ('3.4', 'Concreto ciclópeo (60 % concreto 2500 PSI + 40 % piedra)', 'm³', '$672.479'),
        ('3.5', 'Dados en concreto 3500 PSI', 'm³', '$993.635'), ('3.6', 'Placa de concreto 2500 PSI e=10 cm', 'm²', '$160.126')]

def tree(selected='3.4', mode='edit', changed=('3.4',), w=380):
    rows = ''
    for c, n, cnt in CAPS:
        open_ = c == '3'
        sel = selected == c
        st = f'background: {T["teal1"]};' if sel else ''
        rows += (f'<button type="button" aria-expanded="{str(open_).lower()}" style="display: flex; align-items: center; gap: 8px; width: 100%; height: 40px; padding: 0 10px; border: 0; border-radius: 10px; font-family: inherit; text-align: left; cursor: pointer; {st} background-color: {T["teal1"] if sel else "transparent"};">'
                 f'<span style="color: {T["text2"]};">{svg("chd" if open_ else "chr", 16)}</span><span style="font-size: 13px; font-weight: 800; color: {T["text2"]}; width: 22px;">{c}</span>'
                 f'<span style="flex-grow: 1; font-size: 13.5px; font-weight: 800; color: {T["text"]}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{n}</span>'
                 f'<span style="font-size: 12px; color: {T["text2"]}; font-weight: 600;">{cnt} APU</span></button>')
        if open_:
            for code, name, uni, price in APU3:
                s = code == selected
                bg = T['teal1'] if s else 'transparent'
                bd = f'box-shadow: inset 3px 0 0 {T["teal"]};' if s else ''
                dot = (f'<span title="Cambiado en el borrador" style="width: 7px; height: 7px; border-radius: 4px; background: {T["info"]}; flex-shrink: 0;"></span>') if (code in changed and mode == 'edit') else '<span style="width: 7px;"></span>'
                rows += (f'<button type="button" aria-current="{"true" if s else "false"}" style="display: flex; align-items: center; gap: 8px; width: 100%; min-height: 44px; padding: 6px 10px 6px 34px; border: 0; border-radius: 10px; background: {bg}; {bd} font-family: inherit; text-align: left; cursor: pointer;">'
                         f'<span style="font-size: 12.5px; font-weight: 800; color: {T["text2"]}; width: 26px;">{code}</span>'
                         f'<span style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;"><span style="font-size: 13px; font-weight: {"800" if s else "600"}; color: {T["text"]}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</span></span>'
                         f'{dot}<span style="font-size: 12.5px; font-weight: 700; color: {T["text"]}; font-variant-numeric: tabular-nums; white-space: nowrap;">{price}<span style="color: {T["text2"]}; font-weight: 600;"> /{uni}</span></span></button>')
    add = '' if mode == 'read' else f'<div style="display: flex; gap: 8px;">{btn("Capítulo", "secondary", "plus", "sm")}{btn("Importar", "secondary", "upload", "sm")}</div>'
    return (f'<section aria-label="Estructura del catálogo" style="width: {w}px; flex-shrink: 0; background: #ffffff; border-right: 1px solid {T["line"]}; display: flex; flex-direction: column; min-height: 0;">'
            f'<div style="padding: 16px; display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid {T["line"]};">'
            f'<button type="button" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: 1px solid {T["line2"]}; border-radius: 12px; background: {T["teal05"]}; font-family: inherit; text-align: left; cursor: pointer;">'
            f'<span style="color: {T["teal8"]};">{svg("home", 18)}</span><span style="flex-grow: 1; display: flex; flex-direction: column;"><span style="font-size: 11.5px; font-weight: 700; color: {T["text2"]};">Departamento</span>'
            f'<span style="font-size: 14px; font-weight: 800; color: {T["text"]};">Bogotá, D. C.</span></span><span style="font-size: 12px; color: {T["text2"]}; font-weight: 600;">1 de 33</span>{svg("chd", 16, T["text2"])}</button>'
            f'<div style="display: flex; align-items: center; justify-content: space-between;"><span style="font-size: 13px; font-weight: 800;">7 capítulos · 45 APU</span>{add}</div>'
            f'<label style="display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid {T["line2"]}; border-radius: 10px; color: {T["text2"]}; font-size: 13.5px;">{svg("search", 16)}<span>Buscar APU o insumo…</span></label>'
            f'<div style="display: flex; gap: 6px;">{badge("Todos", "teal", None, "md")}{badge("Con cambios · 3", "neutral", None, "md") if mode == "edit" else ""}{badge("Inactivos", "neutral", None, "md") if mode == "edit" else ""}</div></div>'
            f'<div style="padding: 8px; display: flex; flex-direction: column; gap: 2px; overflow: hidden;">{rows}</div></section>')

def apu_detail(mode='edit'):
    ins = [('MO-01', 'Cuadrilla (oficial + ayudante)', 'jr', '1,1632', '$185.000', '$215.192', '45 APU'),
           ('MA-3', 'Concreto de obra 2500 PSI', 'm³', '1,05', '$386.836', '$406.178', '6 APU'),
           ('TR-01', 'Transporte de materiales', 'viaje', '0,10', '$403.490', '$40.349', '24 APU'),
           ('0767', 'Herramienta menor', 'glb', '1', '$10.760', '$10.760', '45 APU')]
    rows = ''
    for cod, nom, uni, cant, vu, sub, uso in ins:
        glob = (f'<div style="font-size: 11.5px; color: {T["text2"]}; font-weight: 600; margin-top: 2px;">Insumo compartido · en {uso}</div>')
        act = '' if mode == 'read' else f'<td style="padding: 8px 12px; border-bottom: 1px solid {T["line"]}; text-align: right;">{btn("", "ghost", "edit", "sm", "Editar insumo")}</td>'
        rows += (f'<tr>{td(cod, mono=True, color=T["text2"])}{td(nom + glob, strong=True)}{td(uni, color=T["text2"])}{td(cant, "right", mono=True)}'
                 f'{td(vu, "right", mono=True)}{td(sub, "right", strong=True, mono=True)}{act}</tr>')
    actcol = [] if mode == 'read' else [('', 'right')]
    tabla = (f'<table>{th([("Código", "left"), ("Insumo", "left"), ("Unidad", "left"), ("Cantidad por m³", "right"), ("V. unitario", "right"), ("V. total", "right")] + actcol)}'
             f'<tbody>{rows}<tr><td colspan="5" style="padding: 12px; text-align: right; font-size: 13px; font-weight: 800; color: {T["text2"]};">Suma de insumos</td>'
             f'<td style="padding: 12px; text-align: right; font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums;">$672.479</td>{"<td></td>" if mode != "read" else ""}</tr></tbody></table>')
    acts = (f'<div style="display: flex; gap: 8px;">{btn("Insumo", "secondary", "plus", "md")}{btn("Editar APU", "secondary", "edit", "md")}{btn("", "secondary", "dots", "md", "Más acciones del APU")}</div>') if mode == 'edit' else (f'<div style="display: flex; gap: 8px;">{btn("Copiar código", "secondary", None, "md")}</div>')
    change = (f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T["info"]}; font-weight: 700;">{svg("dot", 12, T["info"], 3)}Cambiado en la v1.4 en preparación · Concreto de obra: $386.836 → $400.000</div>') if mode == 'edit' else ''
    usado = (f'<a href="#" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;">{svg("file", 15)}Usado en 3 presupuestos (v1.3)</a>') if mode == 'edit' else ''
    ver = 'v1.4 en preparación' if mode == 'edit' else 'v1.3 vigente'
    return (f'<section aria-label="Detalle del APU" style="flex-grow: 1; min-width: 0; padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; overflow: hidden;">'
            f'<div style="display: flex; align-items: flex-start; gap: 16px;"><div style="flex-grow: 1; display: flex; flex-direction: column; gap: 6px;">'
            f'<div style="font-size: 12.5px; color: {T["text2"]}; font-weight: 700;">Bogotá, D. C. › Capítulo 3 · Cimentación › APU 3.4</div>'
            f'<h2 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -.01em; line-height: 1.3;">Concreto ciclópeo (60 % concreto 2500 PSI + 40 % piedra media zonga)</h2>'
            f'<div style="display: flex; gap: 8px; align-items: center;">{badge("APU", "neutral")}{badge("Unidad: m³", "neutral")}{badge(ver, "info" if mode == "edit" else "pos")}{usado}</div></div>{acts}</div>'
            f'<div style="display: flex; gap: 16px;">'
            f'<div style="flex: 0 0 320px; padding: 18px; border-radius: 16px; background: {T["teal05"]}; border: 1px solid #CFEFF6; display: flex; flex-direction: column; gap: 6px;">'
            f'<div style="font-size: 12.5px; font-weight: 800; color: {T["teal8"]};">Valor del APU en Bogotá, D. C.</div><div style="font-size: 32px; font-weight: 800; letter-spacing: -.02em; color: {T["teal9"]}; font-variant-numeric: tabular-nums;">$672.479 <span style="font-size: 16px; color: {T["teal8"]};">por m³</span></div>'
            f'<div style="font-size: 12.5px; color: {T["text2"]};">Valor cargado desde la matriz</div></div>'
            f'<div style="flex-grow: 1; padding: 18px; border-radius: 16px; border: 1px solid {T["line"]}; display: flex; flex-direction: column; gap: 10px;">'
            f'<div style="font-size: 12.5px; font-weight: 800;">Control del valor</div>'
            f'<div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; color: {T["pos"]};">{svg("check", 16, T["pos"], 2.4)}Coincide con la suma de sus 4 insumos</div>'
            f'<div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">El valor del APU se toma del archivo y no se recalcula solo; si no coincide con sus insumos, se marca aquí y en el diagnóstico de la carga.</div></div></div>'
            f'{change}<div style="border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;">{tabla}</div></section>')
