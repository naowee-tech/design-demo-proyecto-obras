from views_lib import *
import b1_vistas as B1

def overlay(inner, align='center'):
    j = {'center': 'center', 'right': 'flex-end'}[align]
    return (f'<div style="position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; background: rgba(16,28,40,.42); display: flex; align-items: {"center" if align=="center" else "stretch"}; justify-content: {j};">{inner}</div>')

def sec(title, inner, pinn=None):
    return (f'<div style="display: flex; flex-direction: column; gap: 10px; padding: 14px 0; border-top: 1px solid {T["line"]};">'
            f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["text2"]};">{title}{pin(pinn) if pinn else ""}</div>{inner}</div>')

# ═══ V2 · Antes: Estructura + modal "Editar nivel" ═══════════════════
inner = (f'{B1.old_tabs("Estructura")}{B1.oldesquema()}'
         f'<div style="border: 1px solid {T["line"]}; border-radius: 14px; overflow: hidden;"><table>{B1.OLD_TREE_HEAD}<tbody>{B1.oldtree_rows()}</tbody></table></div>')
base = screen(sidebar('catalogo'), old_main('Proyecto de Obras / Catálogos / Detalle', 'Vivienda Rural — Bogotá 2026', inner))
chips = ''.join(badge(t, 'neutral', None, 'md') for t in ['Código *', 'Ítem *', 'Tipo *', 'Unidad ×', 'Cantidad ×', 'V. unitario *'])
modal = (f'<div role="dialog" aria-label="Editar APU" style="width: 700px; max-height: 880px; background: #fff; border-radius: 20px; box-shadow: 0 30px 80px -20px rgba(0,0,0,.4); display: flex; flex-direction: column; overflow: hidden;">'
         f'<div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid {T["line"]};">'
         f'<div style="display: flex; align-items: center; gap: 10px;">{h("Editar APU", 19)}{pin(1)}</div>{btn("", "ghost", "x", "md", "Cerrar")}</div>'
         f'<div style="padding: 4px 24px 8px; display: flex; flex-direction: column; overflow: hidden;">'
         + sec('UBICACIÓN', f'<div style="display: flex; gap: 12px;">{field("Nivel superior", "3 · Cimentación", kind="select", w="60%")}{field("Posición (orden)", "4", w="40%")}</div>')
         + sec('IDENTIDAD', f'{field("Nombre del nivel", "Concreto ciclópeo (60% concreto 2500 PSI…", req=True)}')
         + sec('VALOR DEL NIVEL', f'<div style="display: flex; gap: 12px;">{field("Valor del nivel", "Suma automática", kind="select", w="50%")}<div style="width: 50%; font-size: 12.5px; color: {T["text2"]}; line-height: 1.5; padding-top: 22px;">El total del nivel es la suma de sus ítems y subniveles (hoy $672.479).</div></div>', 3)
         + sec('ÍTEMS', f'<div style="display: flex; align-items: center; gap: 10px;"><span style="width: 40px; height: 22px; border-radius: 11px; background: {T["teal"]};"></span><span style="font-size: 13.5px; font-weight: 600;">Este nivel admite ítems</span></div>')
         + sec('CAMPOS DEL ÍTEM', f'<p style="margin: 0; font-size: 12.5px; color: {T["text2"]};">Define las columnas que tendrá cada ítem de este nivel.</p><div style="display: flex; flex-wrap: wrap; gap: 6px;">{chips}</div>'
               f'<div style="font-size: 13px; font-weight: 800; color: {T["teal8"]};">+ Agregar campo</div>', 2)
         + '</div>'
         f'<div style="display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid {T["line"]};">{btn("Cancelar", "secondary")}{btn("Guardar nivel", "primary")}</div></div>')
scr = base.replace('</main></div>', '</main>' + overlay(modal) + '</div>')
board('V2-antes.dc.html', 'Contenido · antes', scr, aside('antes', 'Un modal para cuatro objetos, y los insumos en otra pestaña', [
    ('Un solo modal configura cuatro cosas', 'Ubicación en el árbol, regla de precio, “admite ítems” y los campos de los insumos. El título dice “APU” y el botón “Guardar nivel”.'),
    ('Los campos del insumo, 45 veces', 'Son una definición del tipo de nivel, pero se editan dentro de cada APU.'),
    ('La regla no muestra lo que produce', 'Se elige “Suma automática” sin ver el precio ni su composición.'),
    ('La fila promete detalle y abre edición', 'No existe un modo de lectura: mirar un APU es abrir su formulario.'),
    ('Los insumos viven lejos', 'Están en la pestaña Ítems, en una tabla plana de 159 filas con el nivel repetido en cada una.')]))

# ═══ V2 · Después: árbol + detalle del APU ══════════════════════════
main = ws_header('vigente', 'Contenido', 5) + f'<div style="flex-grow: 1; display: flex; min-height: 0;">{tree("3.4")}{apu_detail("edit")}</div>'
board('V2-despues.dc.html', 'Contenido · después · APU', screen(sidebar('catalogo'), main), aside('despues', 'El APU y sus insumos en la misma vista, con el árbol como mapa', [
    ('Árbol + detalle, por departamento', 'Elegir un APU muestra su detalle a la derecha, con el departamento como contexto; los insumos ya no están en otra pestaña.'),
    ('El valor con su unidad y su control', '“$672.479 por m³” y si coincide con la suma de sus insumos: el valor viene de la matriz y no se recalcula solo.'),
    ('El insumo es compartido', 'Cada insumo dice en cuántos APU se usa: su nombre es global, así que editarlo avisa que cambia en todos.'),
    ('Acciones del APU en su lugar', '“+ Insumo”, “Editar APU” y “Más” (mover, desactivar) viven en el encabezado del detalle.'),
    ('La versión en preparación se nota', 'Un punto en el árbol y una línea en el APU marcan lo que cambió frente a la v1.3 vigente.')]))

# ═══ V2 · Después: drawer "Editar APU" con resumen dentro ═══════════
seg = lambda opts, on: (f'<div role="radiogroup" style="display: flex; padding: 4px; gap: 4px; border-radius: 12px; background: {T["panel"]}; border: 1px solid {T["line"]};">'
      + ''.join(f'<button type="button" role="radio" aria-checked="{"true" if o == on else "false"}" style="flex: 1 1 0; height: 38px; border-radius: 9px; border: {"1px solid " + T["line2"] if o == on else "1px solid transparent"}; background: {"#fff" if o == on else "transparent"}; font-family: inherit; font-size: 13px; font-weight: {"800" if o == on else "600"}; color: {T["text"] if o == on else T["text2"]}; cursor: pointer;">{o}</button>' for o in opts) + '</div>')
drawer = (f'<aside role="dialog" aria-label="Editar APU 3.4" style="width: 560px; height: 100%; background: #fff; box-shadow: -24px 0 60px -20px rgba(0,0,0,.35); display: flex; flex-direction: column;">'
          f'<div style="padding: 22px 24px; border-bottom: 1px solid {T["line"]}; display: flex; align-items: flex-start; gap: 12px;"><div style="flex-grow: 1;">'
          f'<div style="font-size: 12.5px; font-weight: 700; color: {T["text2"]};">Bogotá, D. C. · APU 3.4 · v1.4 en preparación</div>{h("Editar APU", 20, extra="margin-top: 4px;")}</div>{btn("", "ghost", "x", "md", "Cerrar")}</div>'
          f'<div style="flex-grow: 1; padding: 8px 24px; display: flex; flex-direction: column; overflow: hidden;">'
          + sec('IDENTIDAD', f'{field("Nombre", "Concreto ciclópeo (60 % concreto 2500 PSI + 40 % piedra)", req=True)}<div style="display: flex; gap: 12px;">{field("Unidad", "m³", kind="select", w="40%", req=True)}{field("Descripción", "Opcional", w="60%")}</div>')
          + sec('UBICACIÓN EN LA ESTRUCTURA', f'<div style="display: flex; gap: 12px;">{field("Capítulo", "5 · Mampostería", kind="select", w="65%")}{field("Posición", "7 de 7", kind="select", w="35%")}</div>'
                f'<div style="font-size: 12px; color: {T["text2"]};">Moverlo lleva su precio al capítulo destino y le asigna el código 5.7.</div>')
          + sec('VALOR DEL APU', seg(['Suma de sus insumos', 'Valor fijo'], 'Suma de sus insumos') + f'<div style="font-size: 13px; color: {T["text"]};">= <b>$672.479 por m³</b> en Bogotá, D. C.</div>')
          + f'<div style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: {T["panel"]}; font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">{svg("info", 16, T["text2"])}<span>Este APU es de <b style="color: {T["text"]};">Bogotá, D. C.</b>: moverlo o renombrarlo no cambia el mismo APU en los otros 32 departamentos.</span></div>'
          + '</div>'
          f'<div style="padding: 16px 24px; border-top: 1px solid {T["line"]}; display: flex; flex-direction: column; gap: 12px; background: {T["teal05"]};">'
          f'<div style="font-size: 12px; font-weight: 800; letter-spacing: .05em; color: {T["teal8"]};">VAS A CAMBIAR</div>'
          f'<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">'
          f'<div>Capítulo: <span style="text-decoration: line-through; color: {T["text2"]};">3 · Cimentación</span> → <b>5 · Mampostería</b></div>'
          f'<div>Código: <span style="text-decoration: line-through; color: {T["text2"]};">3.4</span> → <b>5.7</b></div></div>'
          f'<div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">Usado en 3 presupuestos de la v1.3: no cambian. El cambio queda en la v1.4 en preparación.</div>'
          f'<div style="display: flex; justify-content: flex-end; gap: 8px;">{btn("Cancelar", "secondary")}{btn("Guardar en la v1.4", "primary", "check")}</div></div></aside>')
base = screen(sidebar('catalogo'), ws_header('vigente', 'Contenido', 5) + f'<div style="flex-grow: 1; display: flex; min-height: 0;">{tree("3.4")}{apu_detail("edit")}</div>')
scr = base.replace('</main></div>', '</main>' + overlay(drawer, 'right') + '</div>')
board('V2-despues-drawer.dc.html', 'Contenido · después · editar APU', scr, aside('despues', 'Editar en contexto, solo lo que es del APU, y ver el cambio antes de guardarlo', [
    ('Un drawer, no un modal', 'El árbol y el APU siguen detrás como referencia: editar no te saca de donde estabas.'),
    ('Solo lo que pertenece al APU', 'Identidad, ubicación y valor. Los campos del insumo son fijos por la plantilla: ya no se configuran aquí.'),
    ('El alcance del cambio, explícito', 'El APU es de un departamento: el drawer lo dice para que nadie crea que cambia en los 33.'),
    ('El resumen vive en el mismo drawer', '“Vas a cambiar…” aparece al pie mientras editas, sin abrir un segundo modal encima.'),
    ('Guardar ≠ activar', 'Lo guardado queda en la v1.4 en preparación; activarla es otra decisión, en la pestaña Versiones.')]))
print('V2 ok')
