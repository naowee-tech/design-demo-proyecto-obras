from views_lib import *

def sel_mini(v, w=150):
    return ('<span style="display: inline-flex; align-items: center; justify-content: space-between; gap: 8px; width: ' + str(w) + 'px; height: 36px; padding: 0 12px; border: 1px solid ' + T['line2'] + '; border-radius: 10px; font-size: 13px;">' + v + svg('chd', 16, T['text2']) + '</span>')

# Python 3.9: sin barras en expresiones de f-string → armamos las filas sin anidar comillas.
def oldtree_rows():
    data = [('1', 'Preliminares', 'Capítulo', '$950.744', 1, False), ('2', 'Excavaciones y rellenos', 'Capítulo', '$509.828', 1, False),
            ('3', 'Cimentación', 'Capítulo', '$2.849.368', 1, True), ('3.1', 'Base agregado pétreo (material de…', 'APU', '$171.287', 2, False),
            ('3.2', 'Base arena cemento 1:20 (hecho en…', 'APU', '$295.643', 2, False), ('3.3', 'Base en concreto pobre (hecho en…', 'APU', '$556.198', 2, False),
            ('3.4', 'Concreto ciclópeo (60% concreto…', 'APU', '$672.479', 2, False)]
    out = ''
    for code, name, tn, tot, lvl, op in data:
        ch = svg('chd' if op else 'chr', 14, T['text2']) if lvl == 1 else '<span style="width: 14px;"></span>'
        cell = '<span style="display: inline-flex; align-items: center; gap: 6px; padding-left: ' + str((lvl - 1) * 22) + 'px;">' + ch + '<b>' + code + '</b> ' + name + '</span>'
        out += ('<tr>' + td(cell) + td(badge(tn, 'teal')) + td('Σ Suma automática', color=T['text2']) + td('—' if lvl == 1 else '4 · 6 campos', color=T['text2']) +
                td(badge('Activo', 'pos')) + td('11/08/2026', color=T['text2']) + td(tot, 'right', mono=True) + td(svg('dots', 18, T['text2']), 'center') + '</tr>')
    return out

OLD_TREE_HEAD = th([('Código · Nivel', 'left'), ('Tipo', 'left'), ('Valor', 'left'), ('Ítems', 'left'), ('Estado', 'left'), ('Creado', 'left'), ('Total', 'right'), ('Acciones', 'center')], '#ffffff')

def oldficha(pin_name=None, pin_chip=None):
    return (f'<div style="border: 1px solid {T["line"]}; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;">'
            f'<div style="display: flex; align-items: center; gap: 10px;"><span style="width: 32px; height: 32px; border-radius: 9px; background: {T["teal1"]};"></span>'
            f'<div><div style="font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 8px;">Vivienda Rural — Bogotá 2026 {pin(pin_name) if pin_name else ""}</div>'
            f'<div style="font-size: 12.5px; color: {T["text2"]};">Condición de aplicación: Bogota · Vigencia 01/01/2026 → 31/12/2026 · Creado por Jesús Díaz el 11/08/2026</div></div></div>'
            f'<div style="display: flex; gap: 6px; align-items: center;">{badge("v1.3", "info")}{badge("Activo", "pos")}{badge("Capítulo: 7")}{badge("APU: 45")}{badge("5 sin versionar", "cau")}{pin(pin_chip) if pin_chip else ""}</div></div>')

def oldesquema():
    return (f'<div style="border: 1px solid {T["line"]}; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 10px;">'
            f'<b style="font-size: 13px;">Esquema de niveles</b><span style="font-size: 12px; color: {T["text2"]};">· del nivel más alto al más bajo</span>'
            f'{badge("1 · Capítulo (7)")}{svg("chr", 14, T["text2"])}{badge("2 · APU (45)")}<span style="margin-left: auto; font-size: 13px; font-weight: 700; color: {T["teal8"]};">+ Agregar nivel al esquema</span></div>')

# ═══ V1 · Espacio de trabajo ═════════════════════════════════════════
inner = (f'<div style="display: flex; align-items: center; justify-content: space-between;">{old_kpis()}'
         f'<div style="display: flex; align-items: center; gap: 8px;">{pin(2)}{btn("Editar datos generales", "secondary", "edit")}{btn("Volver a catálogos", "secondary", "chl")}</div></div>'
         f'{oldficha(1, 3)}'
         f'<div style="display: flex; align-items: center; gap: 8px;">{old_tabs("Estructura")}{pin(5)}</div>{oldesquema()}'
         f'<div style="display: flex; align-items: center; gap: 10px;"><span style="font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["text2"]};">NIVELES DE AGRUPACIÓN</span>'
         + sel_mini('Todo estado') +
         f'<span style="margin-left: auto; display: flex; align-items: center; gap: 8px;">{pin(4)}{btn("Crear nivel", "primary", "plus", "sm")}</span></div>'
         f'<div style="border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;"><table>{OLD_TREE_HEAD}<tbody>{oldtree_rows()}</tbody></table></div>')
scr = screen(sidebar('catalogo'), old_main('Proyecto de Obras / Catálogos / Detalle', 'Vivienda Rural — Bogotá 2026', inner))
board('V1-antes.dc.html', 'Espacio de trabajo · antes', scr, aside('antes', 'Un detalle sin jerarquía: todo pesa igual y nada dice qué sigue', [
    ('El nombre aparece dos veces', 'En la barra superior y otra vez en la ficha: tres bandas (indicadores, ficha, esquema) antes de llegar al contenido.'),
    ('“Editar datos generales” te saca de aquí', 'Navega a la lista de catálogos para abrir el formulario y no te regresa.'),
    ('Estado y versión son etiquetas mudas', '“5 sin versionar” no dice qué cambió ni lleva a publicar. “v1.3 · Activo” no dice qué ve la Consulta.'),
    ('No hay acción principal del catálogo', 'Cada pestaña trae su propio botón “Crear…”; ninguno responde a “¿qué hago ahora con este catálogo?”.'),
    ('Cinco pestañas al mismo nivel', 'Mezclan contenido (Estructura, Ítems), una operación (Carga masiva) e historia (Versiones, Auditoría).')]))

# ═══ V1 · Después A: Borrador con lista de preparación ═══════════════
def step(n, t, d, st, action=''):
    ic = {'done': (T['pos'], T['posbg'], 'check'), 'now': (T['teal'], T['teal1'], None), 'lock': (T['text2'], T['panel'], 'lock')}[st]
    mark = svg(ic[2], 16, ic[0], 2.4) if ic[2] else f'<b style="color: {ic[0]}; font-size: 14px;">{n}</b>'
    bd = f'border: 1.5px solid {T["teal"]};' if st == 'now' else f'border: 1px solid {T["line"]};'
    op = 'opacity: .75;' if st == 'lock' else ''
    return (f'<div style="flex: 1 1 0; display: flex; flex-direction: column; gap: 10px; padding: 16px; border-radius: 14px; background: #fff; {bd} {op}">'
            f'<div style="display: flex; align-items: center; gap: 10px;"><span style="width: 30px; height: 30px; border-radius: 15px; background: {ic[1]}; display: inline-flex; align-items: center; justify-content: center;">{mark}</span>'
            f'<span style="font-size: 14px; font-weight: 800;">{t}</span></div>{p(d, 12.5)}{action}</div>')
checklist = (f'<section style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">'
             f'<div style="display: flex; align-items: center; justify-content: space-between;">{h("Prepara la v1.0 para activarla", 17)}<span style="font-size: 12.5px; font-weight: 700; color: {T["text2"]};">1 de 4 listo</span></div>'
             f'<div style="display: flex; gap: 12px;">'
             + step(1, 'Alcance', '12 departamentos · Rol: Gestor. Estructura Capítulo › APU › Insumo.', 'done', f'<a href="#" style="font-size: 13px; font-weight: 800;">Revisar alcance</a>')
             + step(2, 'Precios por departamento', 'Importa la matriz (una hoja por departamento) o crea capítulos y APU a mano.', 'now', f'<div style="display: flex; gap: 8px;">{btn("Importar matriz", "primary", "upload", "sm")}{btn("Crear capítulo", "secondary", "plus", "sm")}</div>')
             + step(3, 'Revisar', 'Departamentos sin precios y APU cuyo valor no cuadra con sus insumos.', 'lock')
             + step(4, 'Activar v1.0', 'Requiere al menos un departamento con precios cargados.', 'lock')
             + '</div></section>')
empty = (f'<section style="flex-grow: 1; display: flex; gap: 20px;">'
         f'<div style="flex-grow: 1; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px;">'
         f'<span style="width: 56px; height: 56px; border-radius: 16px; background: {T["teal1"]}; color: {T["teal8"]}; display: inline-flex; align-items: center; justify-content: center;">{svg("layers", 28)}</span>'
         f'{h("Aún no hay precios cargados", 18)}{p("Cada departamento tiene su propio árbol de capítulos, APU e insumos. Lo usual es importar la matriz: se carga un departamento a la vez.", 13.5, extra="text-align: center; max-width: 460px;")}'
         f'<div style="display: flex; gap: 8px;">{btn("Importar matriz", "primary", "upload")}{btn("Crear capítulo a mano", "secondary", "plus")}</div></div>'
         f'<div style="width: 340px; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">'
         f'{h("¿Qué pasa al activar?", 15)}'
         + ''.join(f'<div style="display: flex; gap: 10px; align-items: flex-start; font-size: 13px; line-height: 1.5;">{svg(i, 16, T["teal8"])}<span>{t}</span></div>' for i, t in [
             ('check', 'La <b>v1.0</b> pasa a <b>Vigente</b> para sus 12 departamentos.'), ('eye', 'Aparece en <b>Consulta de precios</b> para el rol Gestor.'),
             ('file', 'Los presupuestos nuevos usarán esta versión.'), ('history', 'Cada cambio posterior abre una versión nueva: así queda la traza.')]) + '</div></section>')
main = ws_header('borrador', 'Contenido') + f'<div style="flex-grow: 1; padding: 24px 32px; display: flex; flex-direction: column; gap: 20px;">{checklist}{empty}</div>'
board('V1-despues-borrador.dc.html', 'Espacio de trabajo · después · v1.0 en preparación', screen(sidebar('catalogo'), main), aside('despues', 'El catálogo dice en qué estado está y cuál es el siguiente paso', [
    ('Nace como versión en preparación', 'Crear no activa nada: la v1.0 existe como base de precios, pero no aparece en Consulta hasta activarla.'),
    ('Una sola acción principal', 'El botón del encabezado cambia con el estado: aquí “Continuar: cargar precios”.'),
    ('Lista de preparación', 'Alcance → precios por departamento → revisar → activar. Reemplaza al recorrido guiado como mapa.'),
    ('El alcance manda', 'Departamentos y roles se definen al crear: cada departamento tendrá su propio árbol de precios.'),
    ('Pestañas = momentos', 'Alcance y estructura · Contenido · Versiones · Historial, en el orden en que se trabaja.')]))

# ═══ V1 · Después B: Vigente con borrador, capítulo seleccionado ═════
aps = ''.join('<tr>' + td('<b>' + c + '</b>', mono=True) + td(n, strong=True) + td(u, color=T['text2']) + td(pz + ' <span style="color: ' + T['text2'] + '; font-weight: 600;">/' + u + '</span>', 'right', strong=True, mono=True)
              + td('4', 'right', mono=True, color=T['text2']) + td(pp, 'right', mono=True, color=T['text2']) + td(badge('Cambiado', 'info') if c == '3.4' else '', 'left') + '</tr>'
              for (c, n, u, pz), pp in zip(APU3, ['1', '—', '2', '3', '—', '1']))
chap = (f'<section aria-label="Detalle del capítulo" style="flex-grow: 1; min-width: 0; padding: 24px 28px; display: flex; flex-direction: column; gap: 16px;">'
        f'<div style="display: flex; align-items: flex-start; gap: 16px;"><div style="flex-grow: 1; display: flex; flex-direction: column; gap: 6px;">'
        f'<div style="font-size: 12.5px; color: {T["text2"]}; font-weight: 700;">Bogotá, D. C. › Capítulo 3</div>{h("Cimentación", 22)}'
        f'<div style="display: flex; gap: 8px;">{badge("Capítulo", "neutral")}{badge("6 APU", "neutral")}{badge("Activo", "pos")}</div></div>'
        f'<div style="display: flex; gap: 8px;">{btn("APU", "primary", "plus")}{btn("Editar capítulo", "secondary", "edit")}{btn("", "secondary", "dots", "md", "Más acciones del capítulo")}</div></div>'
        f'{msg("Un capítulo agrupa APU de distintas unidades (m³, m²): su valor es una <b>referencia</b> (Σ $2.849.368), no un costo de obra. El precio que usa un presupuesto es el de cada APU.", "info", "info")}'
        f'<div style="border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;"><table>{th([("Código", "left"), ("APU", "left"), ("Unidad", "left"), ("Valor en Bogotá", "right"), ("Insumos", "right"), ("Presupuestos", "right"), ("", "left")])}<tbody>{aps}</tbody></table></div></section>')
main = ws_header('vigente', 'Contenido', 5) + f'<div style="flex-grow: 1; display: flex; min-height: 0;">{tree("3")}{chap}</div>'
board('V1-despues-vigente.dc.html', 'Espacio de trabajo · después · vigente', screen(sidebar('catalogo'), main), aside('despues', 'Lo vigente y lo que se está preparando, separados y a la vista', [
    ('Vigente + versión en preparación', 'Todo cambio abre una versión nueva (v1.4, otra base de precios): el encabezado dice qué rige y qué se prepara.'),
    ('Activar tiene un camino', 'El botón principal y el contador de la pestaña Versiones llevan al mismo lugar: revisar y activar.'),
    ('El departamento es el contexto', 'El árbol se lee por departamento (Bogotá, 1 de 33): cada uno tiene sus propios precios.'),
    ('El detalle depende de lo que eliges', 'Un capítulo muestra sus APU con precio por unidad; un APU, sus insumos (siguiente fila).'),
    ('Crear en contexto', '“+ APU” vive dentro del capítulo; “+ Insumo”, dentro del APU. Nada de elegir 1 entre 45.')]))
print('V1 ok')
