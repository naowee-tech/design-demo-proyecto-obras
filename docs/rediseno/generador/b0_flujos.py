from lib import *

# ═══ 00 · Redefinición ═════════════════════════════════════════════════
def col(title, kicker, inner, tint=None):
    return (f'<div style="display: flex; flex-direction: column; gap: 14px; padding: 24px; background: #ffffff; border: 1px solid {T["line"]}; border-radius: 20px;">'
            f'<div style="font-size: 12px; font-weight: 800; letter-spacing: .08em; color: {tint or T["teal8"]};">{kicker}</div>'
            f'{h(title, 22)}{inner}</div>')
def li(n, t, d):
    return (f'<div style="display: flex; gap: 12px; align-items: flex-start;"><span style="flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: {T["teal1"]}; color: {T["teal9"]}; font-size: 12.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">{n}</span>'
            f'<div style="display: flex; flex-direction: column; gap: 3px;"><div style="font-size: 14px; font-weight: 800; color: {T["text"]};">{t}</div>{p(d, 12.5)}</div></div>')
def lineitem(t, d, icon, color):
    return (f'<div style="display: flex; gap: 12px; align-items: flex-start;"><span style="flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px; background: {T["panel"]}; color: {color}; display: inline-flex; align-items: center; justify-content: center;">{svg(icon, 16)}</span>'
            f'<div style="display: flex; flex-direction: column; gap: 2px;"><div style="font-size: 13.5px; font-weight: 800;">{t}</div>{p(d, 12.5)}</div></div>')

que = col('La experiencia de construir, mantener y publicar un catálogo de precios', 'QUÉ REDISEÑAMOS',
    p('No la piel: el <b>orden de las cosas</b>. Qué vista existe para cada momento, qué contenedor le toca a cada objeto y qué acción lleva a la siguiente.', 14, T['text']) +
    f'<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">' +
    lineitem('Admin Naowee', 'Arma catálogos nuevos, ajusta precios del periodo, importa archivos, publica versiones y responde auditorías.', 'user', T['teal8']) +
    lineitem('Usuario autorizado (gestor, revisor)', 'Busca un APU y su precio unitario para armar un presupuesto. Solo lee.', 'users', T['teal8']) +
    '</div>' +
    f'<div style="margin-top: 6px; padding: 14px; border-radius: 12px; background: {T["panel"]}; display: flex; flex-direction: column; gap: 6px;">'
    f'<div style="font-size: 12px; font-weight: 800; color: {T["text"]};">Restricciones</div>'
    + p('Cubre las 21 HU de Fase I sin recortar alcance · Design System Naowee (tema Territorio) · Precios sintéticos. <b>Backend actual:</b> un catálogo es una base de precios por versión; cualquier cambio genera versión; el departamento es una dimensión del catálogo; la carga de la matriz va de a un departamento (~1 h cada uno).', 12.5) + '</div>')

porque = col('La interfaz está ordenada por historia de usuario, no por el momento de quien la usa', 'POR QUÉ',
    '<div style="display: flex; flex-direction: column; gap: 14px;">' +
    li('1', 'Nadie sabe qué sigue', 'Cinco pestañas planas, un aviso de 6 s como único camino después de crear, y ningún estado que diga “te falta esto”.') +
    li('2', 'Cosas metidas a la fuerza dentro de otras', 'El modal de nivel configura cuatro objetos; la carga masiva es una pestaña; activar el catálogo es un campo del formulario.') +
    li('3', 'Una jerarquía, tres representaciones', 'Árbol en Estructura, tabla plana en Ítems, acordeones con 46 tablas en Consulta. El insumo vive lejos de su APU.') +
    li('4', 'Publicar es invisible', 'Los cambios “se acumulan sin versionar” sin decir qué, ni a quién afecta publicar, ni que Consulta ya muestra lo no publicado.') +
    li('5', 'El recorrido guiado sostiene la comprensión', 'Sin él no se entiende que el esquema va antes que los capítulos ni que la fórmula vive dentro de “Editar nivel”.') +
    '</div>', T['neg'])

paraque = col('Que cada persona sepa dónde está, qué puede hacer y qué pasa si lo hace', 'PARA QUÉ',
    '<div style="display: flex; flex-direction: column; gap: 12px;">' +
    ''.join(f'<div style="display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border: 1px solid {T["line"]}; border-radius: 12px;">'
            f'<div style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800;">{svg("check", 16, T["pos"], 2.4)}{o}</div>'
            f'<div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;"><b style="color: {T["text"]};">Se cumple si:</b> {k}</div></div>'
            for o, k in [
                ('Estado y siguiente paso siempre visibles', 'un admin nuevo arma y publica su primer catálogo sin abrir el recorrido guiado.'),
                ('Un lugar por cosa', 'cada objeto se crea y edita en un solo contenedor, del tipo que le corresponde.'),
                ('Trabajar sin perder el contexto', 'editar un insumo no saca al admin del APU ni del árbol.'),
                ('Publicar a sabiendas', 'antes de publicar se ve cada cambio y qué presupuestos quedan en qué versión.'),
                ('Consultar lo que rige', 'el usuario solo ve la versión publicada y lee precios por unidad.')]) +
    '</div>', T['pos'])

principios = ''.join(
    f'<div style="flex: 1 1 0; display: flex; flex-direction: column; gap: 6px; padding: 16px; background: #ffffff; border: 1px solid {T["line"]}; border-radius: 16px;">'
    f'<div style="display: flex; align-items: center; gap: 8px; color: {T["teal8"]};">{svg(ic, 18)}<span style="font-size: 13.5px; font-weight: 800; color: {T["text"]};">{t}</span></div>{p(d, 12.5)}</div>'
    for ic, t, d in [
        ('layers', 'Un momento, una vista', 'Configurar, construir, publicar y consultar son lugares distintos.'),
        ('modal', 'Un objeto, un contenedor', 'Página, detalle, drawer, modal o flujo según lo que el objeto necesita.'),
        ('panel', 'El contexto primero', 'El árbol queda a la vista mientras se lee o edita un elemento.'),
        ('arrow', 'Siempre un siguiente paso', 'La acción principal cambia según el estado del catálogo.'),
        ('fx', 'Lo calculado se ve calculado', 'Precios con su unidad, su origen y su regla, sin campos que finjan ser editables.')])

fuera = (f'<div style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; border: 1px dashed {T["line2"]}; background: rgba(255,255,255,.6);">'
         + svg("info", 18, T["text2"]) + p('<b style="color: ' + T["text"] + ';">Fuera de este rediseño (anotado en el backlog):</b> accesibilidad detallada (34 hallazgos WCAG), formato fino de datos y deuda de componentes del DS. Se retoman sobre la estructura nueva.', 13) + '</div>')

body0 = (f'<div style="display: flex; flex-direction: column; gap: 22px; padding: 56px 64px; height: 100%;">'
         f'<div style="display: flex; flex-direction: column; gap: 10px;"><div style="font-size: 13px; font-weight: 800; letter-spacing: .1em; color: {T["teal8"]};">CATÁLOGO DE PRECIOS · FASE I · REDISEÑO DE EXPERIENCIA</div>'
         f'<h1 style="margin: 0; font-size: 44px; line-height: 1.1; font-weight: 800; letter-spacing: -.03em; max-width: 1100px;">Antes de dibujar: qué rediseñamos, por qué y para qué</h1></div>'
         f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px;">{que}{porque}{paraque}</div>'
         f'<div style="display: flex; flex-direction: column; gap: 10px;"><div style="font-size: 12px; font-weight: 800; letter-spacing: .08em; color: {T["text2"]};">PRINCIPIOS QUE ORDENAN EL REDISEÑO</div>'
         f'<div style="display: flex; gap: 14px;">{principios}</div></div>{fuera}</div>')
page('Main.dc.html', 'Qué rediseñamos, por qué y para qué', body0, 1440, 1180)

# ═══ 01 · Flujo actual ═════════════════════════════════════════════════
def box(title, sub, inner='', w='auto', tone='neutral', extra=''):
    bd = {'neutral': T['line2'], 'neg': T['negln'], 'teal': '#9FDCEA'}[tone]
    bg = {'neutral': '#ffffff', 'neg': '#ffffff', 'teal': '#ffffff'}[tone]
    return (f'<div style="display: flex; flex-direction: column; gap: 10px; width: {w}; padding: 16px; background: {bg}; border: 1.5px solid {bd}; border-radius: 16px; {extra}">'
            f'<div style="display: flex; flex-direction: column; gap: 2px;"><div style="font-size: 14.5px; font-weight: 800;">{title}</div>'
            f'<div style="font-size: 12px; color: {T["text2"]};">{sub}</div></div>{inner}</div>')
def chip(t, tone='neutral', icon=None):
    c = {'neutral': (T['text'], T['panel'], T['line']), 'neg': (T['neg'], T['negbg'], T['negln']), 'teal': (T['teal9'], T['teal1'], '#BCEDF4'), 'pos': (T['pos'], T['posbg'], T['posln'])}[tone]
    ic = svg(icon, 14, c[0], 2) if icon else ''
    return (f'<div style="display: flex; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 9px; background: {c[1]}; border: 1px solid {c[2]}; color: {c[0]}; font-size: 12.5px; font-weight: 600; line-height: 1.35;">{ic}<span>{t}</span></div>')
def arrow(label='', color=None, vertical=False):
    color = color or T['text2']
    lab = f'<div style="font-size: 11px; font-weight: 700; color: {color}; text-align: center; max-width: 96px; line-height: 1.3;">{label}</div>' if label else ''
    return (f'<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0; width: 96px;">{lab}'
            f'<div style="color: {color};">{svg("arrowd" if vertical else "arrow", 26, color, 2)}</div></div>')

tabs_actual = ''.join(box(t, s, inner, extra='flex: 1 1 0;') for t, s, inner in [
    ('Estructura', 'pestaña 1',
        chip('Esquema de niveles (chips)') + chip('Árbol de niveles') +
        f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 10px; border-radius: 12px; border: 1.5px dashed {T["neg"]}; background: {T["negbg"]};">'
        f'<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: {T["neg"]};">{pin(3)} Modal “Editar nivel”</div>'
        + chip('Nodo: padre, nombre, orden') + chip('Valor / fórmula') + chip('Admite ítems') + chip('Campos del ítem (×45)') + '</div>'),
    ('Ítems', 'pestaña 2', chip('Tabla plana de 159 insumos') + chip('“Crear ítem”: elegir 1 de 45 APU', 'neg') + chip('⋮ con una sola acción')),
    ('Carga masiva', 'pestaña 3', chip('Asistente de 3 pasos dentro de la pestaña', 'neg') + chip('Un solo APU destino por archivo') + chip('Historial de cargas debajo')),
    ('Versiones', 'pestaña 4', chip('“5 sin versionar”: ¿qué cambios?', 'neg') + chip('Crear versión: solo motivo') + chip('Presupuestos: solo en avisos')),
    ('Auditoría', 'pestaña 5', chip('Filtros y exportación') + chip('Detalle desplegable')),
])

flujo_actual = f'''
<div style="display: flex; flex-direction: column; gap: 26px; padding: 48px 56px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-size: 12.5px; font-weight: 800; letter-spacing: .1em; color: {T["neg"]};">CÓMO ESTÁ HOY</div>
    <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -.02em;">Un árbol de pestañas: cada historia de usuario tiene su lugar, pero el catálogo no tiene recorrido</h1>
  </div>
  <div style="display: flex; align-items: stretch; gap: 0;">
    {box("Lista de catálogos", "catalogos.html",
        chip("Buscar y filtrar") + chip("Clic en la fila: no pasa nada", "neg") + chip("⋮ Abrir catálogo") + chip("⋮ Editar catálogo → modal"), "250px")}
    {arrow("+ Crear catálogo")}
    {box("Modal crear / editar", "sobre la lista",
        chip("Datos generales") + f'<div style="display: flex; align-items: center; gap: 6px;">{pin(1)}{chip("Estado: Activo · Borrador · Inactivo", "neg")}</div>' +
        chip("Punto de partida") + f'<div style="display: flex; align-items: center; gap: 6px;">{pin(2)}{chip("Nace Activo y vacío: ya sale en Consulta", "neg")}</div>', "280px", "neg")}
    {arrow("aviso de 6 s “Configurar estructura →”", T["neg"])}
    {box("Detalle del catálogo", "catalogo-detalle.html · 5 pestañas al mismo nivel",
        f'<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">{chip("Cabecera: KPIs, chips de versión y estado")}'
        f'<div style="display: flex; align-items: center; gap: 6px;">{pin(4)}{chip("“Editar datos generales” te devuelve a la Lista", "neg", "back")}</div></div>'
        f'<div style="display: flex; gap: 10px;">{tabs_actual}</div>', "auto", extra="flex-grow: 1;")}
  </div>
  <div style="display: flex; gap: 20px; align-items: stretch;">
    {box("Consulta (usuario autorizado)", "consulta.html · otra página, otro patrón",
        f'<div style="display: flex; align-items: center; gap: 6px;">{pin(5)}{chip("Lee el contenido en vivo con la etiqueta “v1.3”", "neg")}</div>' +
        chip("Acordeones de 3 niveles con una tabla por APU") + chip("Selector de catálogo al final de los filtros"), "420px")}
    <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 12px; padding: 20px 22px; background: {T["negbg"]}; border: 1px solid {T["negln"]}; border-radius: 16px;">
      <div style="font-size: 13px; font-weight: 800; color: {T["neg"]}; letter-spacing: .04em;">LO QUE ENREDA EL FLUJO</div>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 28px;">
        {"".join(f'<div style="display: flex; gap: 10px; align-items: flex-start;">{pin(n)}<div style="font-size: 13px; line-height: 1.5; color: {T["text"]};"><b>{t}.</b> {d}</div></div>' for n, t, d in [
            (1, "Activar es un campo, no un momento", "El paso que publica el catálogo se esconde en un formulario de datos."),
            (2, "Nace publicado", "Un catálogo vacío ya aparece en Consulta; no hay Borrador ni condiciones para activar."),
            (3, "Un modal para cuatro objetos", "Posición, cálculo, “admite ítems” y los campos del insumo, repetidos en cada APU."),
            (4, "Idas y vueltas entre páginas", "Editar los datos del catálogo te saca del detalle y no te regresa."),
            (5, "Consulta no sabe qué es lo publicado", "Muestra los cambios sin versionar como si fueran la versión vigente."),
            (6, "Sin siguiente paso", "Las pestañas no tienen orden ni requisitos; el recorrido guiado es el único mapa.")])}
      </div>
    </div>
  </div>
</div>'''
page('Flujo-actual.dc.html', 'Flujo actual', flujo_actual, 1860, 1040)

# ═══ 02 · Flujo propuesto ══════════════════════════════════════════════
def stage(n, title, who, where, pattern, trig, hus, tone='teal'):
    return (f'<div style="flex: 1 1 0; display: flex; flex-direction: column; gap: 12px; padding: 18px; background: #ffffff; border: 1.5px solid {"#9FDCEA" if tone=="teal" else T["line2"]}; border-radius: 18px;">'
            f'<div style="display: flex; align-items: center; gap: 10px;"><span style="width: 32px; height: 32px; border-radius: 10px; background: {T["teal"]}; color: #fff; font-size: 15px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">{n}</span>'
            f'<div style="font-size: 16px; font-weight: 800;">{title}</div></div>'
            f'<div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; line-height: 1.45;">'
            f'<div><span style="color: {T["text2"]}; font-weight: 700;">Quién · </span>{who}</div>'
            f'<div><span style="color: {T["text2"]}; font-weight: 700;">Dónde · </span><b>{where}</b></div>'
            f'<div style="display: flex; flex-wrap: wrap; gap: 6px;">{pattern}</div>'
            f'<div style="padding: 10px; border-radius: 10px; background: {T["panel"]};"><span style="color: {T["text2"]}; font-weight: 700;">Detona · </span>{trig}</div>'
            f'<div style="color: {T["text2"]}; font-size: 11.5px; font-weight: 700;">{hus}</div></div></div>')
pat = lambda t, icon: badge(t, 'teal', icon, 'md')

flujo_prop = f'''
<div style="display: flex; flex-direction: column; gap: 26px; padding: 48px 56px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-size: 12.5px; font-weight: 800; letter-spacing: .1em; color: {T["pos"]};">CÓMO DEBIÓ SER</div>
    <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -.02em;">Un ciclo de vida: cada momento tiene su vista, su dueño y un siguiente paso</h1>
  </div>
  <div style="display: flex; align-items: stretch;">
    {stage(1, "Crear", "Admin", "Lista → modal “Nuevo catálogo”", pat("Modal", "modal"),
        "Nombre, <b>departamentos, roles</b> y vigencia. Nace la <b>v1.0 en preparación</b>, no visible en Consulta.", "HU 01 · 03")}
    {arrow()}
    {stage(2, "Alcance y estructura", "Admin · una vez", "Espacio de trabajo › Alcance y estructura", pat("Página de tarjetas", "layers"),
        "Departamentos y roles donde rige. Estructura fija Capítulo › APU › Insumo y la <b>plantilla</b> con sus 33 hojas.", "HU 01 · 04 · 09 · 12")}
    {arrow()}
    {stage(3, "Cargar y ajustar precios", "Admin · día a día", "Espacio de trabajo › Contenido", pat("Árbol por departamento", "panel") + pat("Drawer para editar", "drawer") + pat("Importar: flujo a pantalla completa", "full"),
        "Todo cambio trabaja sobre una <b>versión en preparación</b> (una base nueva). La matriz se carga de a un departamento.", "HU 04–08 · 10–14 · 18")}
    {arrow()}
    {stage(4, "Revisar y activar", "Admin", "Espacio de trabajo › Versiones", pat("Página de revisión", "send"),
        "Cada cambio con su departamento y a qué presupuestos toca. <b>Activar vN</b> la deja vigente; la anterior queda histórica.", "HU 02 · 11 · 15 · 16")}
    {arrow()}
    {stage(5, "Consultar", "Usuario autorizado", "Consulta de precios", pat("Buscador + árbol + detalle", "search"),
        "Lee <b>solo la versión vigente</b> de su rol, por departamento. Valor del APU por unidad.", "HU 17 · 18")}
  </div>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px;">
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 22px; background: #ffffff; border: 1px solid {T["line"]}; border-radius: 18px;">
      {h("Estados del catálogo: qué los cambia", 17)}
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        {badge("v1.0 en preparación", "cau", "edit", "md")}{svg("arrow", 20, T["text2"])}<span style="font-size: 12px; font-weight: 700; color: {T["text2"]};">Activar</span>{svg("arrow", 20, T["text2"])}
        {badge("Vigente · v1.0", "pos", "check", "md")}{svg("arrow", 20, T["text2"])}<span style="font-size: 12px; font-weight: 700; color: {T["text2"]};">editar o importar</span>{svg("arrow", 20, T["text2"])}
        {badge("v1.1 en preparación", "info", "clock", "md")}{svg("arrow", 20, T["text2"])}<span style="font-size: 12px; font-weight: 700; color: {T["text2"]};">Activar v1.1</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
        {badge("Vigente", "pos", None, "md")}{svg("arrow", 20, T["text2"])}<span style="font-size: 12px; font-weight: 700; color: {T["text2"]};">Inactivar (con motivo)</span>{svg("arrow", 20, T["text2"])}{badge("Inactivo", "neutral", "power", "md")}{svg("arrow", 20, T["text2"])}<span style="font-size: 12px; font-weight: 700; color: {T["text2"]};">Reactivar</span>
      </div>
      {p("Cada versión es una <b>base de precios</b> propia: todo cambio (reemplazar o actualizar) abre la siguiente. La Consulta y los presupuestos leen solo la vigente, y las anteriores quedan intactas como traza.", 13)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 22px; background: #ffffff; border: 1px solid {T["line"]}; border-radius: 18px;">
      {h("La acción principal cambia según el estado", 17)}
      <table>{th([("Estado del catálogo", "left"), ("Botón principal del encabezado", "left")], "#ffffff")}<tbody>
        {"".join(f'<tr>{td(a)}{td(b, strong=True, color=T["teal8"])}</tr>' for a, b in [
            ("v1.0 en preparación, sin precios", "Continuar: cargar precios"),
            ("v1.0 lista (APU que cuadran)", "Activar v1.0"),
            ("Vigente con una versión en preparación", "Revisar y activar v1.4"),
            ("Vigente sin versión en preparación", "Actualizar precios (abre la v1.4)"),
            ("Inactivo", "Reactivar")])}
      </tbody></table>
      {p("<b>Transversal:</b> Historial (auditoría y cargas) en su pestaña. La carga de la matriz se hace dentro del flujo de Importar, departamento por departamento, y se retoma si se interrumpe.", 12.5)}
    </div>
  </div>
</div>'''
page('Flujo-propuesto.dc.html', 'Flujo propuesto', flujo_prop, 1860, 1040)

# ═══ 03 · Dónde vive cada cosa ═════════════════════════════════════════
patrones = ''.join(
    f'<div style="flex: 1 1 0; display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #ffffff; border: 1px solid {T["line"]}; border-radius: 16px;">'
    f'<div style="display: flex; align-items: center; gap: 8px; color: {T["teal8"]};">{svg(ic, 20)}<span style="font-size: 14px; font-weight: 800; color: {T["text"]};">{t}</span></div>'
    f'<div style="font-size: 12.5px; line-height: 1.5; color: {T["text2"]};"><b style="color: {T["text"]};">Cuándo:</b> {c}</div>'
    f'<div style="font-size: 12px; line-height: 1.5; color: {T["text2"]};"><b style="color: {T["text"]};">Aquí:</b> {e}</div></div>'
    for ic, t, c, e in [
        ('grid', 'Página / pestaña', 'un momento con vida propia al que se vuelve.', 'Configuración, Contenido, Publicación, Historial, Consulta.'),
        ('panel', 'Árbol + detalle', 'leer u operar un elemento de una colección grande sin perder dónde está.', 'Capítulos y APU en Contenido y en Consulta.'),
        ('drawer', 'Drawer lateral', 'editar un objeto en contexto; lo de atrás sigue siendo la referencia.', 'Editar APU, editar insumo.'),
        ('modal', 'Modal', 'una decisión corta que bloquea: pocos campos, una confirmación.', 'Nuevo catálogo, datos generales, desactivar con motivo.'),
        ('full', 'Flujo a pantalla completa', 'un proceso de varios pasos con archivo o revisión larga.', 'Importar.'),
        ('bell', 'Aviso (toast)', 'confirmar que algo pasó. Nunca el único camino a algo.', 'Guardado, publicado, importado.')])

rows = [
 ('Datos generales del catálogo', 'Modal en la Lista; desde el detalle salta de página', 'Modal sobre el espacio de trabajo', 'Editar no debe sacarte del contexto.'),
 ('Estado (activar / inactivar)', 'Campo “Estado” dentro del formulario', 'Acción del encabezado con requisitos', 'Publicar es un momento con consecuencias, no un dato.'),
 ('Departamentos y roles (alcance)', 'Un catálogo por región; el rol no aparece', 'Alcance y estructura · y selector de departamento sobre el árbol', 'El departamento es una dimensión del catálogo, no otro catálogo.'),
 ('Estructura y plantilla', 'Chips del esquema; campos dentro del modal de cada nivel (×45)', 'Alcance y estructura · fija y dicha como tal', 'Hoy son tres niveles y columnas fijas; no se finge que se configuran.'),
 ('Capítulo y APU', 'Mega-modal: nodo + valor + admite + campos', 'Contenido · detalle del nodo + drawer “Editar”', 'Identidad, ubicación y precio con su resultado a la vista.'),
 ('Regla de precio (suma, fórmula, fijo)', 'Sección escondida del mega-modal', 'Detalle del nodo: “Cómo se calcula”', 'La regla se ve junto al número que produce.'),
 ('Insumo', 'Pestaña Ítems (tabla plana) + modal', 'Dentro de su APU · drawer para editar', 'Un insumo solo tiene sentido en su APU.'),
 ('Carga masiva', 'Pestaña con asistente e historial', '“Importar” → flujo a pantalla completa: ajustes, diagnóstico, carga por departamento, resultado', 'Es una forma de crear, con principio y fin; la carga se vive en el mismo flujo y se retoma si se corta.'),
 ('Versión', 'Pestaña; “Crear versión” solo con motivo', 'Versiones: revisar la versión en preparación → activar', 'Cada cambio abre versión; activar es la decisión.'),
 ('Presupuestos vinculados', 'Solo dentro de avisos', 'Publicación y detalle del APU', 'El impacto se ve antes de decidir.'),
 ('Auditoría', 'Pestaña al mismo nivel que el contenido', 'Historial (con versiones)', 'Trazabilidad transversal y de solo lectura.'),
]
tabla = (f'<table>{th([("Objeto", "left"), ("Hoy", "left"), ("Debió ser", "left"), ("Por qué", "left")], "#ffffff")}<tbody>' +
         ''.join(f'<tr>{td(a, strong=True)}{td(b, color=T["neg"])}{td(c, strong=True, color=T["teal8"])}{td(d, color=T["text2"])}</tr>' for a, b, c, d in rows) + '</tbody></table>')

donde = f'''
<div style="display: flex; flex-direction: column; gap: 24px; padding: 48px 56px;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="font-size: 12.5px; font-weight: 800; letter-spacing: .1em; color: {T["teal8"]};">DÓNDE VIVE CADA COSA</div>
    <h1 style="margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -.02em;">Primero la regla de contenedores; después, cada objeto en el suyo</h1>
  </div>
  <div style="display: flex; gap: 14px;">{patrones}</div>
  <div style="background: #ffffff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 8px 12px;">{tabla}</div>
</div>'''
page('Donde-vive.dc.html', 'Dónde vive cada cosa', donde, 1860, 1040)
print('ok')
