# Generador de artboards (.dc.html) del rediseño de experiencia — Catálogo de Precios.
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'project')

T = dict(teal='#0B7E96', teal8='#0A6275', teal9='#084B5A', teal1='#E2F7FB', teal05='#F2FAFC',
         canvas='#EAEEF3', panel='#F6F8FA', line='#E4E8EE', line2='#D3DAE3', text='#1B2330', text2='#566170',
         neg='#B42318', negbg='#FEF3F2', negln='#FECDCA', cau='#9A4A04', caubg='#FFFAEB', cauln='#FEDF89',
         pos='#067647', posbg='#ECFDF3', posln='#ABEFC6', info='#175CD3', infobg='#EFF8FF', infoln='#B2DDFF', pin='#D92D20')

IC = {
 'home':'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
 'book':'<path d="M4 4h11a2 2 0 0 1 2 2v13H6a2 2 0 0 0-2 2V4z"/><path d="M17 19H6a2 2 0 0 0-2 2"/>',
 'eye':'<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>',
 'calc':'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2"/>',
 'search':'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'chr':'<path d="M9 6l6 6-6 6"/>', 'chd':'<path d="M6 9l6 6 6-6"/>', 'chl':'<path d="M15 6l-6 6 6 6"/>',
 'dots':'<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
 'edit':'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
 'upload':'<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 21h14"/>',
 'download':'<path d="M12 3v12M8 11l4 4 4-4M4 21h16"/>',
 'check':'<path d="M20 6L9 17l-5-5"/>',
 'alert':'<path d="M12 3l9 17H3z"/><path d="M12 9v4M12 17h.01"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
 'lock':'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'layers':'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
 'cube':'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 'wrench':'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
 'truck':'<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
 'arrow':'<path d="M5 12h14M13 6l6 6-6 6"/>', 'arrowd':'<path d="M12 5v14M6 13l6 6 6-6"/>',
 'back':'<path d="M9 14l-5-5 5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
 'x':'<path d="M6 6l12 12M18 6L6 18"/>',
 'history':'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
 'send':'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
 'sliders':'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 'fx':'<path d="M10 20c2 0 2-3 3-8s1-8 3-8"/><path d="M8.5 11h7"/>',
 'file':'<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
 'move':'<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
 'power':'<path d="M18.36 6.64A9 9 0 1 1 5.64 6.64M12 2v10"/>',
 'users':'<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4.5-6.5"/>',
 'grid':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 'panel':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
 'drawer':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/>',
 'modal':'<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="7" y="8" width="10" height="8" rx="1.5"/>',
 'full':'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
 'dot':'<circle cx="12" cy="12" r="4"/>',
 'filter':'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
}
def svg(name, size=16, color='currentColor', sw=1.8):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;">{IC[name]}</svg>')

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

# ── Piezas ─────────────────────────────────────────────────────────────
def pin(n):
    return (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 12px; '
            f'background: {T["pin"]}; color: #ffffff; font-size: 12px; font-weight: 800; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(217,45,32,.18);">{n}</span>')

def badge(txt, tone='neutral', icon=None, size='sm'):
    c = {'neutral': (T['text2'], '#EEF1F5', '#E1E6EC'), 'teal': (T['teal8'], T['teal1'], '#BCEDF4'), 'pos': (T['pos'], T['posbg'], T['posln']),
         'cau': (T['cau'], T['caubg'], T['cauln']), 'neg': (T['neg'], T['negbg'], T['negln']), 'info': (T['info'], T['infobg'], T['infoln'])}[tone]
    fs = '11.5px' if size == 'sm' else '12.5px'; pad = '2px 8px' if size == 'sm' else '4px 10px'
    ic = svg(icon, 12, c[0], 2.2) if icon else ''
    return (f'<span style="display: inline-flex; align-items: center; gap: 5px; padding: {pad}; border-radius: 999px; background: {c[1]}; '
            f'border: 1px solid {c[2]}; color: {c[0]}; font-size: {fs}; font-weight: 700; white-space: nowrap;">{ic}{txt}</span>')

def btn(txt, kind='secondary', icon=None, size='md', aria=None):
    h = {'sm': '32px', 'md': '40px', 'lg': '44px'}[size]; fs = '13px' if size == 'sm' else '14px'
    st = {'primary': f'background: {T["teal"]}; color: #ffffff; border: 1px solid {T["teal"]};',
          'secondary': f'background: #ffffff; color: {T["text"]}; border: 1px solid {T["line2"]};',
          'ghost': f'background: transparent; color: {T["teal8"]}; border: 1px solid transparent;',
          'danger': f'background: #ffffff; color: {T["neg"]}; border: 1px solid {T["negln"]};'}[kind]
    ic = svg(icon, 16) if icon else ''
    pad = '0 14px' if txt else '0'
    wd = '' if txt else f'width: {h};'
    lab = f' aria-label="{aria}"' if aria else ''
    return (f'<button type="button"{lab} style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: {h}; {wd} padding: {pad}; '
            f'border-radius: 10px; font-family: inherit; font-size: {fs}; font-weight: 700; white-space: nowrap; cursor: pointer; {st}">{ic}{txt}</button>')

def field(label, value, hint=None, w='100%', req=False, kind='input', icon=None):
    star = f'<span style="color: {T["neg"]};"> *</span>' if req else ''
    chev = svg('chd', 16, T['text2']) if kind == 'select' else ''
    ico = svg(icon, 16, T['text2']) if icon else ''
    hint_html = f'<div style="font-size: 12px; color: {T["text2"]}; line-height: 1.45;">{hint}</div>' if hint else ''
    return (f'<label style="display: flex; flex-direction: column; gap: 6px; width: {w};">'
            f'<span style="font-size: 12.5px; font-weight: 700; color: {T["text"]};">{label}{star}</span>'
            f'<span style="display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid {T["line2"]}; border-radius: 10px; background: #ffffff; font-size: 14px; color: {T["text"]};">'
            f'{ico}<span style="flex-grow: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">{value}</span>{chev}</span>{hint_html}</label>')

def tipo(t):
    m = {'MO': ('user', 'MO'), 'Material': ('cube', 'Material'), 'Transporte': ('truck', 'Transporte'), 'Equipo': ('wrench', 'Equipo')}[t]
    return (f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: {T["text"]};">'
            f'<span style="display: inline-flex; width: 24px; height: 24px; border-radius: 7px; background: #EEF1F5; align-items: center; justify-content: center; color: {T["text2"]};">{svg(m[0], 14)}</span>{m[1]}</span>')

def th(cols, bg=None):
    bg = bg or T['panel']
    cells = ''.join(f'<th scope="col" style="text-align: {a}; padding: 10px 12px; font-size: 11.5px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; color: {T["text2"]}; background: {bg}; border-bottom: 1px solid {T["line"]}; white-space: nowrap;">{c}</th>' for c, a in cols)
    return f'<thead><tr>{cells}</tr></thead>'

def td(v, align='left', strong=False, mono=False, color=None, extra=''):
    fw = '700' if strong else '500'
    ff = 'font-variant-numeric: tabular-nums;' if mono else ''
    col = color or T['text']
    return f'<td style="text-align: {align}; padding: 11px 12px; font-size: 13.5px; font-weight: {fw}; color: {col}; border-bottom: 1px solid {T["line"]}; {ff} {extra}">{v}</td>'

def card(inner, pad='20px', extra=''):
    return f'<section style="background: #ffffff; border: 1px solid {T["line"]}; border-radius: 16px; padding: {pad}; {extra}">{inner}</section>'

def h(txt, size=16, weight=800, color=None, extra=''):
    return f'<h2 style="margin: 0; font-size: {size}px; font-weight: {weight}; color: {color or T["text"]}; letter-spacing: -.01em; {extra}">{txt}</h2>'

def p(txt, size=13, color=None, extra=''):
    return f'<p style="margin: 0; font-size: {size}px; line-height: 1.55; color: {color or T["text2"]}; {extra}">{txt}</p>'

def msg(txt, tone='info', icon='info'):
    c = {'info': (T['info'], T['infobg'], T['infoln']), 'cau': (T['cau'], T['caubg'], T['cauln']), 'neg': (T['neg'], T['negbg'], T['negln']), 'pos': (T['pos'], T['posbg'], T['posln'])}[tone]
    return (f'<div role="note" style="display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; background: {c[1]}; border: 1px solid {c[2]}; color: {c[0]}; font-size: 13px; line-height: 1.5; font-weight: 600;">'
            f'{svg(icon, 18, c[0], 2)}<div>{txt}</div></div>')

# ── Shell (sidebar del producto) ────────────────────────────────────────
def sidebar(active='catalogo', role='ADMIN'):
    def item(key, label, icon, extra=''):
        on = key == active
        st = f'background: {T["teal1"]}; color: {T["teal9"]}; font-weight: 800;' if on else f'color: {T["text2"]}; font-weight: 600;'
        cur = ' aria-current="page"' if on else ''
        return (f'<a href="#"{cur} style="display: flex; align-items: center; gap: 10px; height: 40px; padding: 0 12px; border-radius: 10px; text-decoration: none; font-size: 13.5px; {st}">'
                f'{svg(icon, 18)}<span style="flex-grow: 1;">{label}</span>{extra}</a>')
    sec = lambda t: f'<div style="padding: 14px 12px 6px; font-size: 11px; font-weight: 800; letter-spacing: .06em; color: #7A8391;">{t}</div>'
    items = sec('GENERAL') + item('inicio', 'Inicio', 'home') + sec('PRESUPUESTO')
    if role == 'ADMIN': items += item('catalogo', 'Catálogo de precios', 'book')
    items += item('consulta', 'Consulta de precios', 'eye')
    if role == 'ADMIN':
        items += sec('COSTOS') + item('costos', 'Parámetros de costos', 'calc', badge('Fase 2'))
    who = ('Jesús Díaz', 'Admin Naowee', 'JD') if role == 'ADMIN' else ('Marta Ríos', 'Usuario autorizado', 'MR')
    return (f'<nav aria-label="Principal" style="width: 248px; flex-shrink: 0; background: #ffffff; border-right: 1px solid {T["line"]}; display: flex; flex-direction: column; padding: 20px 14px;">'
            f'<div style="padding: 4px 12px 16px;"><div style="font-size: 17px; font-weight: 800; color: {T["teal8"]}; letter-spacing: -.02em;">ENTerritorio</div>'
            f'<div style="font-size: 12px; color: {T["text2"]}; margin-top: 2px;">Proyecto de Obras · Presupuesto</div></div>'
            f'<div style="display: flex; flex-direction: column; gap: 2px;">{items}</div>'
            f'<div style="margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 12px; border-top: 1px solid {T["line"]};">'
            f'<span style="width: 34px; height: 34px; border-radius: 17px; background: {T["teal"]}; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800;">{who[2]}</span>'
            f'<span style="display: flex; flex-direction: column;"><span style="font-size: 13px; font-weight: 800; color: {T["text"]};">{who[0]}</span><span style="font-size: 11.5px; color: {T["text2"]};">{who[1]}</span></span></div></nav>')

def page(file, title, body, w=1440, h=960, bg=None, lang='es'):
    bg = bg or T['canvas']
    html = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<style>
body{{margin:0;font-family:'Manrope',system-ui,sans-serif;color:{T['text']};background:{bg}}}
a{{color:{T['teal8']}}}a:hover{{color:{T['teal9']}}}
table{{border-collapse:collapse;width:100%}}
*{{box-sizing:border-box}}
</style>
</helmet>
<div style="width: {w}px; height: {h}px; overflow: hidden; background: {bg}; font-family: 'Manrope', system-ui, sans-serif; color: {T['text']}; position: relative;">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
    with open(os.path.join(OUT, file), 'w', encoding='utf-8') as f: f.write(html)
    return file
