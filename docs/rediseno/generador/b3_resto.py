from views_lib import *
import b1_vistas as B1
from b2_contenido import overlay, sec

# ═══ V3 · Alcance y estructura (después) ═══════════════════════════
DEPS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá, D. C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar']
depchips = ''.join(badge(d, 'neutral', None, 'md') for d in DEPS) + badge('+ 21 más', 'teal', None, 'md')
alc = (f'<section style="flex: 1 1 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 16px;">'
       f'<div style="display: flex; align-items: center; justify-content: space-between;">{h("Alcance", 17)}{btn("Editar alcance", "secondary", "edit", "sm")}</div>'
       + p('Dónde y para quién rige este catálogo. Cada departamento tiene su propio árbol de precios.', 12.5)
       + f'<div style="display: flex; flex-direction: column; gap: 8px;"><div style="font-size: 12.5px; font-weight: 800;">Departamentos · 33 de 33</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">{depchips}</div></div>'
       f'<div style="display: flex; flex-direction: column; gap: 8px;"><div style="font-size: 12.5px; font-weight: 800;">Roles</div><div style="display: flex; gap: 6px;">{badge("Gestor", "neutral", "user", "md")}{badge("Contratista", "neutral", "user", "md")}</div></div>'
       f'<div style="display: flex; flex-direction: column; gap: 4px;"><div style="font-size: 12.5px; font-weight: 800;">Otra condición</div><div style="font-size: 13px; color: {T["text2"]};">Ninguna</div></div>'
       + msg('Cambiar el alcance (agregar un departamento o un rol) abre una versión nueva, como cualquier otro cambio.', 'info') + '</section>')
def nivel(n, name, cont, valor):
    return (f'<div style="display: flex; gap: 12px; padding: 14px; border: 1px solid {T["line"]}; border-radius: 14px;"><span style="width: 30px; height: 30px; border-radius: 9px; background: {T["panel"]}; color: {T["text2"]}; font-size: 13.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>'
            f'<div style="display: flex; flex-direction: column; gap: 4px;"><div style="font-size: 14.5px; font-weight: 800;">{name}</div><div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">{cont}</div>'
            f'<div style="font-size: 12.5px; font-weight: 700; color: {T["text"]};">{valor}</div></div></div>')
est = (f'<section style="flex: 1 1 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">'
       f'<div style="display: flex; align-items: center; justify-content: space-between;">{h("Estructura", 17)}{badge("Fija en esta fase", "neutral", "lock", "md")}</div>'
       + p('La misma para los 33 departamentos. Es la que entiende la carga de la matriz.', 12.5)
       + nivel(1, 'Capítulo', 'Agrupa APU. Su nombre es compartido por todos los departamentos.', 'Valor: referencia (suma de sus APU)')
       + f'<div style="display: flex; justify-content: center;">{svg("arrowd", 20, T["text2"])}</div>'
       + nivel(2, 'APU', 'Tarea con precio propio en cada departamento y versión.', 'Valor: el de la matriz, controlado contra sus insumos')
       + f'<div style="display: flex; justify-content: center;">{svg("arrowd", 20, T["text2"])}</div>'
       + nivel(3, 'Insumo', 'Material, mano de obra, equipo o transporte. Su nombre es compartido por todos los APU que lo usan.', 'Valor: cantidad × valor unitario')
       + '</section>')
cols = ''.join(f'<code style="font-size: 12px; padding: 4px 8px; border-radius: 7px; background: {T["panel"]}; color: {T["text"]};">{c}</code>' for c in ['APU', 'Código', 'Nombre', 'unidad', 'Cantidad', 'Valor unitario', 'Valor total'])
pla = (f'<section style="flex: 1 1 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 14px;">'
       f'{h("Plantilla de la matriz", 17)}' + p('Un libro de Excel con una hoja por departamento. La carga exige estos nombres exactos.', 12.5)
       + f'<div style="display: flex; flex-direction: column; gap: 8px;"><div style="font-size: 12.5px; font-weight: 800;">Hojas</div>'
       f'<div style="font-size: 13px; line-height: 1.6;"><code style="font-size: 12px; padding: 2px 6px; border-radius: 6px; background: {T["panel"]};">APU Bogotá, D. C.</code> · <code style="font-size: 12px; padding: 2px 6px; border-radius: 6px; background: {T["panel"]};">APU Antioquia</code> · … 33 hojas, con el nombre del departamento tal como está en el sistema</div></div>'
       f'<div style="display: flex; flex-direction: column; gap: 8px;"><div style="font-size: 12.5px; font-weight: 800;">Columnas, en este orden</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">{cols}</div></div>'
       f'<div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;"><div><b style="color: {T["text"]};">Capítulo:</b> APU = Código, solo números (1, 2…)</div><div><b style="color: {T["text"]};">APU:</b> APU = Código, con punto (1.1)</div><div><b style="color: {T["text"]};">Insumo:</b> la fila siguiente, con el APU al que pertenece</div></div>'
       f'<div style="display: flex; gap: 8px;">{btn("Descargar plantilla (33 hojas)", "primary", "download", "sm")}{btn("Ver ejemplo", "secondary", "file", "sm")}</div>'
       + msg('Niveles y campos propios por proyecto (PPTO-04, 09, 12) quedan para cuando la carga los soporte.', 'cau', 'info') + '</section>')
main = ws_header('vigente', 'Alcance y estructura', 5) + f'<div style="flex-grow: 1; padding: 24px 32px; display: flex; gap: 18px; min-height: 0;">{alc}{est}{pla}</div>'
board('V3-despues.dc.html', 'Alcance y estructura · después', screen(sidebar('catalogo'), main), aside('despues', 'Lo que define el catálogo, en su propio lugar y dicho como es', [
    ('El alcance primero', 'Departamentos y roles definen dónde y para quién rige: son la dimensión de todo el contenido.'),
    ('La estructura, dicha como es', 'Hoy son tres niveles fijos; se muestran con lo que contiene y cómo vale cada uno, sin fingir que se configuran.'),
    ('Qué es compartido y qué no', 'Capítulos e insumos comparten nombre entre departamentos; el APU y su precio son de cada departamento.'),
    ('La plantilla evita el error más común', 'Sale de aquí con los 33 nombres de hoja exactos y las columnas en orden.'),
    ('Lo pendiente se dice', 'Niveles y campos configurables quedan marcados como pendientes de backend.')]))

# ═══ V4 · Antes: Versiones + modal "Crear versión" ═════════════════
vers = [('v1.3', 'Actualización de precios Bogota 2026', 'Carla Méndez', '16/09/2026', badge('Activa', 'pos'), 'en vivo'),
        ('v1.2', 'Se agregan instalaciones hidrosanitarias y pinturas', 'Jesús Díaz', '04/09/2026', badge('Histórica'), 'Ver contenido'),
        ('v1.1', 'Se agregan estructuras en concreto y mampostería', 'Carla Méndez', '23/08/2026', badge('Histórica'), 'Ver contenido'),
        ('v1.0', 'Versión inicial del catálogo', 'Jesús Díaz', '11/08/2026', badge('Histórica'), 'Ver contenido')]
vt = ''.join('<tr>' + td('<b>' + a + '</b>') + td(b) + td(c) + td(d, color=T['text2']) + td(e) + td(f, color=T['teal8'] if f != 'en vivo' else T['text2']) + '</tr>' for a, b, c, d, e, f in vers)
inner = (f'{B1.old_tabs("Versiones")}'
         f'<div style="display: flex; align-items: center; justify-content: space-between;"><span style="font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["text2"]};">VERSIONES DEL CATÁLOGO</span>{btn("Crear versión", "primary", "plus", "sm")}</div>'
         f'<div style="display: flex; align-items: center; gap: 8px;">{msg("<b>5 cambios sin versionar</b> desde v1.3. Están activos en el catálogo, pero no quedan congelados hasta que publiques una nueva versión.", "cau", "alert")}{pin(1)}</div>'
         f'<div style="display: flex; align-items: flex-start; gap: 8px;"><div style="flex-grow: 1; border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;"><table>{th([("Versión", "left"), ("Motivo del cambio", "left"), ("Autor", "left"), ("Fecha", "left"), ("Estado", "left"), ("Contenido", "left")], "#ffffff")}<tbody>{vt}</tbody></table></div>{pin(4)}</div>')
base = screen(sidebar('catalogo'), old_main('Proyecto de Obras / Catálogos / Detalle', 'Vivienda Rural — Bogotá 2026', inner))
modal = (f'<div role="dialog" aria-label="Crear versión" style="width: 520px; background: #fff; border-radius: 20px; box-shadow: 0 30px 80px -20px rgba(0,0,0,.4); display: flex; flex-direction: column;">'
         f'<div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid {T["line"]};"><div style="display: flex; align-items: center; gap: 10px;">{h("Crear nueva versión", 19)}{pin(2)}</div>{btn("", "ghost", "x", "md", "Cerrar")}</div>'
         f'<div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;">{msg("La nueva versión nace de la actual. La anterior queda como Histórica y los presupuestos creados con ella no cambian.", "info")}'
         f'<label style="display: flex; flex-direction: column; gap: 6px;"><span style="font-size: 12.5px; font-weight: 700;">Motivo del cambio <span style="color: {T["neg"]};">*</span></span>'
         f'<span style="height: 90px; border: 1px solid {T["line2"]}; border-radius: 10px; padding: 10px 12px; font-size: 14px; color: {T["text2"]};">Ej. Actualización de precios 2026-II</span></label>'
         f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T["text2"]};">{pin(3)}No dice qué se publica ni qué presupuestos quedan en cada versión.</div></div>'
         f'<div style="display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid {T["line"]};">{btn("Cancelar", "secondary")}{btn("Crear versión", "primary")}{pin(5)}</div></div>')
scr = base.replace('</main></div>', '</main>' + overlay(modal) + '</div>')
board('V4-antes.dc.html', 'Versiones · antes', scr, aside('antes', 'Publicar es un botón más: no se ve qué sale ni a quién toca', [
    ('“5 cambios” sin decir cuáles', 'El aviso cuenta operaciones, no cambios, y no enlaza a ninguna revisión.'),
    ('Se publica solo con un motivo', 'El modal pide texto y nada más: la decisión más importante del catálogo se toma a ciegas.'),
    ('Los presupuestos no aparecen', 'No se ve cuáles quedan en la v1.3 ni cuáles usarán la nueva.'),
    ('“Activa” y “Activo”, dos cosas', 'La versión Activa y el catálogo Activo comparten nombre; la Consulta muestra lo no publicado como si fuera la v1.3.'),
    ('Se puede publicar sin cambios', 'El botón está habilitado aunque el borrador esté vacío.')]))

# ═══ V4 · Después: pestaña Publicación ══════════════════════════════
def cgroup(title, n, rows):
    rr = ''.join(f'<div style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid {T["line"]};"><span style="color: {T["info"]}; padding-top: 2px;">{svg(ic, 16)}</span>'
                 f'<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px;"><div style="font-size: 13.5px; font-weight: 800;">{t}</div><div style="font-size: 12.5px; color: {T["text2"]};">{d}</div></div>'
                 f'<span style="font-size: 12px; color: {T["text2"]}; white-space: nowrap;">{w}</span></div>' for ic, t, d, w in rows)
    return (f'<div style="display: flex; flex-direction: column;"><div style="display: flex; align-items: center; gap: 8px; padding-bottom: 8px;">'
            f'<span style="font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["text2"]};">{title}</span>{badge(str(n), "info")}</div>{rr}</div>')
old = lambda a: f'<span style="text-decoration: line-through;">{a}</span>'
review = (f'<section style="flex-grow: 1; min-width: 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 22px; display: flex; flex-direction: column; gap: 16px; overflow: hidden;">'
          f'<div style="display: flex; align-items: center; justify-content: space-between;">{h("v1.4 en preparación · 5 cambios desde v1.3", 17)}<a href="#" style="font-size: 13px; font-weight: 800;">Ver en el árbol</a></div>'
          + cgroup('IMPORTACIÓN', 1, [('upload', 'Matriz de septiembre en 10 departamentos', '184 registros creados y 14.512 actualizados · Sucre y Cauca no se incluyeron', 'Jesús Díaz · hoy 06:10')])
          + cgroup('PRECIOS', 2, [('edit', 'Concreto de obra 2500 PSI · en 3.4 Concreto ciclópeo · Bogotá, D. C.', 'V. unitario ' + old('$386.836') + ' → $400.000 · valor del APU $672.479 → $686.301 por m³', 'Jesús Díaz · hoy 10:45'),
                                  ('edit', 'Cuadrilla (oficial + ayudante) · insumo compartido', 'Nombre ' + old('Cuadrilla') + ' → Cuadrilla (oficial + ayudante) · cambia en 45 APU de los 33 departamentos', 'Carla Méndez · ayer')])
          + cgroup('ESTRUCTURA', 1, [('move', 'APU “Concreto ciclópeo” pasa de Cimentación a Mampostería · Bogotá, D. C.', 'Código 3.4 → 5.7 · solo en Bogotá; los otros 32 departamentos no cambian', 'Jesús Díaz · hoy 10:42')])
          + cgroup('DATOS GENERALES', 1, [('edit', 'Vigencia', 'Hasta ' + old('31/12/2026') + ' → 30/06/2027', 'Jesús Díaz · 18/09')])
          + '</section>')
side = (f'<section style="width: 440px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px;">'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">{h("Antes de activar", 16)}'
        f'<div style="display: flex; gap: 10px; font-size: 13px; line-height: 1.5;">{svg("check", 16, T["pos"], 2.4)}<span>Todos los APU cuadran con sus insumos</span></div>'
        f'<div style="display: flex; gap: 10px; font-size: 13px; line-height: 1.5; color: {T["cau"]};">{svg("alert", 16, T["cau"], 2)}<span><b>Sucre y Cauca</b> siguen con los precios de la v1.3 (no se incluyeron en la importación).</span></div>'
        f'<div style="display: flex; gap: 10px; font-size: 13px; line-height: 1.5;">{svg("file", 16, T["teal8"])}<span><b>4 presupuestos siguen en su versión</b> (3 en v1.3, 1 en v1.2). Los que se creen desde ahora usarán la v1.4.</span></div>'
        f'<div style="display: flex; gap: 10px; font-size: 13px; line-height: 1.5;">{svg("eye", 16, T["teal8"])}<span>La Consulta mostrará la v1.4 al activarla.</span></div>'
        f'<label style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;"><span style="font-size: 12.5px; font-weight: 700;">Motivo de la versión <span style="color: {T["neg"]};">*</span></span>'
        f'<span style="height: 72px; border: 1px solid {T["line2"]}; border-radius: 10px; padding: 10px 12px; font-size: 13.5px;">Ajuste de precios de concreto y mano de obra, septiembre 2026</span></label>'
        f'<div style="display: flex; gap: 8px; justify-content: space-between;">{btn("Descartar v1.4", "danger")}{btn("Activar v1.4", "primary", "send", "lg")}</div></div>'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 4px;">{h("Versiones (bases de precios)", 16, extra="margin-bottom: 8px;")}'
        + ''.join(f'<div style="display: flex; gap: 12px; padding: 10px 0; border-top: 1px solid {T["line"]};"><span style="width: 10px; height: 10px; margin-top: 5px; border-radius: 5px; background: {c};"></span>'
                  f'<div style="flex-grow: 1;"><div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800;">{v}{b}</div><div style="font-size: 12.5px; color: {T["text2"]};">{d}</div></div>'
                  f'<a href="#" style="font-size: 12.5px; font-weight: 800; white-space: nowrap;">Ver</a></div>'
                  for v, b, d, c in [('v1.3', badge('Vigente', 'pos'), '16/09/2026 · Carla Méndez · 3 presupuestos', T['pos']), ('v1.2', '', '04/09/2026 · Jesús Díaz · 1 presupuesto', T['line2']),
                                     ('v1.1', '', '23/08/2026 · Carla Méndez', T['line2']), ('v1.0', '', '11/08/2026 · Jesús Díaz', T['line2'])]) + '</div></section>')
main = ws_header('vigente', 'Versiones', 5) + f'<div style="flex-grow: 1; padding: 24px 32px; display: flex; gap: 20px; min-height: 0;">{review}{side}</div>'
board('V4-despues.dc.html', 'Versiones · después · activar', screen(sidebar('catalogo'), main), aside('despues', 'Activar a sabiendas: qué cambia, dónde y a quién toca', [
    ('Cada cambio abre una versión', 'Importar o editar trabaja sobre la v1.4 en preparación (una base de precios nueva); así queda la traza.'),
    ('Cada cambio con su alcance', 'Antes y después, y en qué departamento. Lo compartido (un insumo) avisa que toca a los 33.'),
    ('Impacto sin contradicciones', 'Qué presupuestos quedan en qué versión, qué departamentos no se actualizaron y qué verá la Consulta.'),
    ('Requisitos antes del botón', 'Controles de valor y motivo obligatorio a la vista; activar es una decisión explícita.'),
    ('La historia al lado', 'Las versiones con sus presupuestos, para comparar sin cambiar de pestaña.')]))

# ═══ V5 · Antes: Carga masiva como pestaña ══════════════════════════
hist = ''.join('<tr>' + td(a, color=T['text2']) + td(b) + td(c) + td(d, 'right', mono=True) + td(e, 'right', mono=True) + '</tr>' for a, b, c, d, e in [
    ('20/09/2026 15:02', 'Jesús Díaz', 'ejemplo-items-…-nivel-3-4-P2.csv', '12', '10'), ('18/09/2026 09:40', 'Carla Méndez', 'insumos-cimentacion.csv', '24', '24')])
steps_old = ''.join(f'<span style="display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: {"800" if i == 1 else "600"}; color: {T["text"] if i == 1 else T["text2"]};">'
                    f'<span style="width: 26px; height: 26px; border-radius: 13px; background: {T["teal"] if i == 1 else T["panel"]}; color: {"#fff" if i == 1 else T["text2"]}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">{i}</span>{t}</span>'
                    + ('<span style="flex-grow: 1; height: 2px; background: ' + T['line'] + ';"></span>' if i < 3 else '') for i, t in [(1, 'Plantilla y archivo'), (2, 'Revisar'), (3, 'Resultado')])
inner = (f'<div style="display: flex; align-items: center; gap: 8px;">{B1.old_tabs("Carga masiva")}{pin(1)}</div>'
         f'<div style="display: flex; align-items: center; gap: 12px;">{steps_old}</div>'
         f'<div style="display: flex; align-items: center; gap: 10px;"><span style="font-size: 13px; font-weight: 700;">¿Qué vas a cargar?</span>{B1.sel_mini("Ítems del catálogo", 200)}{pin(2)}'
         f'<span style="font-size: 13px; font-weight: 700; margin-left: 8px;">Nivel destino</span>{B1.sel_mini("3.4 · Concreto ciclópeo…", 240)}{pin(3)}<span style="margin-left: auto;">{btn("Descargar plantilla", "secondary", "download", "sm")}</span></div>'
         f'<div style="height: 150px; border: 2px dashed {T["line2"]}; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: {T["text2"]}; font-size: 13.5px;">{svg("upload", 24)}<b style="color: {T["text"]};">Arrastra el archivo aquí o haz clic para seleccionar</b>Formatos aceptados: .csv · .xlsx</div>'
         f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T["text2"]};">¿No tienes un archivo a mano?{btn("Ejemplo con la plantilla vigente", "secondary", "download", "sm")}{btn("Ejemplo con una versión anterior", "secondary", "download", "sm")}</div>'
         f'<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["text2"]};">HISTORIAL DE CARGAS</span>{pin(4)}</div>'
         f'<div style="border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;"><table>{th([("Fecha", "left"), ("Usuario", "left"), ("Archivo", "left"), ("Detectados", "right"), ("Procesados", "right")], "#ffffff")}<tbody>{hist}</tbody></table></div>')
board('V5-antes.dc.html', 'Importar · antes', screen(sidebar('catalogo'), old_main('Proyecto de Obras / Catálogos / Detalle', 'Vivienda Rural — Bogotá 2026', inner)), aside('antes', 'Una operación puesta como si fuera un lugar', [
    ('Una pestaña al nivel del contenido', 'Cargar es una forma de crear capítulos, APU e insumos, pero compite con Estructura como si fuera un sitio.'),
    ('Dos cargas distintas en una pantalla', 'Ítems y estructura comparten asistente y se distinguen con un selector.'),
    ('Un APU destino por archivo', 'Cargar insumos para 18 APU exige 18 archivos y 18 veces elegir 1 entre 45.'),
    ('Asistente e historial revueltos', 'Los pasos viven dentro de la pestaña, con el historial de cargas debajo del paso activo.')]))

# ═══ V6 · Antes: Consulta ═══════════════════════════════════════════
acc = ''.join(f'<div style="display: flex; align-items: center; gap: 12px; padding: 13px 4px; border-bottom: 1px solid {T["line"]};">{svg("chd" if c == "3" else "chr", 16, T["text2"])}'
              f'<span style="width: 30px; height: 30px; border-radius: 8px; background: {T["teal1"]}; color: {T["teal8"]}; display: inline-flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 800;">{c}</span>'
              f'<span style="flex-grow: 1; font-size: 15px; font-weight: 700;">{n} <span style="font-size: 12px; color: {T["text2"]}; font-weight: 500;">· {k} APU</span></span><b style="color: {T["teal8"]}; font-size: 15px;">{v}</b></div>'
              for c, n, k, v in [('1', 'Preliminares', 7, '$950.744'), ('2', 'Excavaciones y rellenos', 6, '$509.828'), ('3', 'Cimentación', 6, '$2.849.368')])
sub = ''.join(f'<div style="display: flex; align-items: center; gap: 12px; padding: 10px 4px 10px 26px; border-bottom: 1px solid {T["line"]};">{svg("chr", 14, T["text2"])}'
              f'<span style="font-size: 12.5px; font-weight: 800; color: {T["teal8"]};">{c}</span><span style="flex-grow: 1; font-size: 13px;">{n} <span style="font-size: 11px; background: {T["panel"]}; padding: 1px 6px; border-radius: 5px; color: {T["text2"]};">{u}</span></span><b style="color: {T["teal8"]}; font-size: 13.5px;">{v}</b></div>'
              for c, n, u, v in APU3[:4])
inner = (f'<div style="display: flex; align-items: center; gap: 12px;">{B1.old_kpis(4)}</div>'
         f'<div style="display: flex; align-items: center; gap: 10px;">{B1.sel_mini("Buscar ítem…", 220)}{B1.sel_mini("Todo tipo", 150)}{B1.sel_mini("Todo nivel", 170)}<span style="width: 1px; height: 24px; background: {T["line"]};"></span>{B1.sel_mini("Vivienda Rural — Bogotá 2026", 250)}{pin(1)}</div>'
         f'<div style="border: 1px solid {T["line"]}; border-radius: 16px; padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;"><b style="font-size: 15px;">Vivienda Rural — Bogotá 2026</b>'
         f'<div style="display: flex; gap: 6px; align-items: center;">{badge("v1.3", "info")}{badge("Vigente", "pos")}{badge("Bogota")}{badge("Vigencia 01/01/2026 → 31/12/2026")}{pin(3)}</div></div>'
         f'<div style="display: flex; align-items: flex-start; gap: 8px;"><div style="flex-grow: 1;">{acc}{sub}</div>{pin(2)}</div>')
board('V6-antes.dc.html', 'Consulta · antes', screen(sidebar('consulta', 'USUARIO'), old_main('Proyecto de Obras / Presupuesto / Consulta', 'Consulta de catálogo', inner)), aside('antes', 'Otra página, otro patrón, y no se sabe qué rige', [
    ('El contexto se elige al final', 'El catálogo, que define todo lo que se ve, es el último control de una fila de filtros.'),
    ('Tres niveles de acordeón', 'Capítulo › APU › tabla de insumos: 46 tablas, cada una con su encabezado; nada se parece al árbol del admin.'),
    ('No distingue lo publicado', 'Muestra el contenido en vivo con la etiqueta “v1.3 · Vigente”, aunque haya cambios sin publicar.'),
    ('Lo que importa no se destaca', 'El total del capítulo pesa igual que el precio del APU, que es lo que el gestor lleva al presupuesto.')]))

# ═══ V6 · Después: Consulta de precios ══════════════════════════════
head = (f'<header style="background: #fff; border-bottom: 1px solid {T["line"]}; padding: 20px 32px; display: flex; flex-direction: column; gap: 14px;">'
        f'<div style="display: flex; align-items: center; gap: 14px;"><h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -.02em;">Consulta de precios</h1>{badge("Solo lectura", "neutral", "lock", "md")}</div>'
        f'<div style="display: flex; gap: 12px; align-items: stretch;">'
        f'<button type="button" style="display: flex; align-items: center; gap: 12px; width: 460px; padding: 10px 14px; border: 1px solid {T["line2"]}; border-radius: 14px; background: #fff; font-family: inherit; text-align: left; cursor: pointer;">'
        f'<span style="width: 36px; height: 36px; border-radius: 10px; background: {T["teal1"]}; color: {T["teal8"]}; display: inline-flex; align-items: center; justify-content: center;">{svg("book", 18)}</span>'
        f'<span style="flex-grow: 1; display: flex; flex-direction: column;"><span style="font-size: 14px; font-weight: 800; color: {T["text"]};">Base de precios general 2026</span><span style="font-size: 12.5px; color: {T["text2"]};">v1.3 · vigente desde 16/09/2026 · para tu rol: Gestor</span></span>{svg("chd", 18, T["text2"])}</button>'
        f'<label style="flex-grow: 1; display: flex; align-items: center; gap: 10px; padding: 0 16px; border: 1.5px solid {T["teal"]}; border-radius: 14px; background: #fff; font-size: 15px; color: {T["text2"]};">{svg("search", 20, T["teal8"])}<span>Buscar un APU o insumo por código o nombre</span></label></div></header>')
main = head + f'<div style="flex-grow: 1; display: flex; min-height: 0;">{tree("3.4", "read")}{apu_detail("read")}</div>'
board('V6-despues.dc.html', 'Consulta · después', screen(sidebar('consulta', 'USUARIO'), main), aside('despues', 'Primero qué rige; después, encontrar un precio', [
    ('El contexto va primero', 'Qué catálogo rige para tu rol, qué versión y desde cuándo; el departamento, arriba del árbol.'),
    ('Buscar al centro', 'Un buscador grande para llegar a un APU sin recorrer el árbol.'),
    ('El mismo árbol + detalle del admin', 'Un solo modelo mental para toda la plataforma, aquí en solo lectura.'),
    ('Solo lo publicado', 'La Consulta lee la versión vigente; lo que se edita en el borrador no se filtra.'),
    ('Lo que el gestor necesita', 'Precio por unidad y su composición, listos para llevar al presupuesto.')]))
print('V3-V6 ok')
