from views_lib import *

STEPS = ['Archivo', 'Ajustes', 'Diagnóstico', 'Carga', 'Resultado']
def stepper(cur):
    out = ''
    for i, t in enumerate(STEPS, 1):
        s = 'done' if i < cur else ('now' if i == cur else 'next')
        col = {'done': (T['pos'], T['posbg']), 'now': (T['teal'], T['teal']), 'next': (T['text2'], T['panel'])}[s]
        mark = svg('check', 14, T['pos'], 2.6) if s == 'done' else f'<b style="font-size: 13px; color: {"#fff" if s == "now" else T["text2"]};">{i}</b>'
        line = f'<span style="flex-grow: 1; height: 2px; background: {T["pos"] if s == "done" else T["line"]};"></span>' if i < len(STEPS) else ''
        cur_attr = ' aria-current="step"' if s == 'now' else ''
        out += (f'<div{cur_attr} style="flex: {"1 1 0" if i < len(STEPS) else "0 0 auto"}; display: flex; align-items: center; gap: 10px;"><span style="width: 30px; height: 30px; border-radius: 15px; background: {col[1]}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">{mark}</span>'
                f'<span style="font-size: 14px; font-weight: {"800" if s == "now" else "700"}; color: {T["text"] if s != "next" else T["text2"]}; white-space: nowrap;">{t}</span>{line}</div>')
    return f'<nav aria-label="Pasos de la importación" style="display: flex; gap: 12px; align-items: center;">{out}</nav>'

def flow(cur, body, footer):
    return (f'<div style="width: {W}px; height: {H}px; flex-shrink: 0; display: flex; flex-direction: column; background: {T["canvas"]};">'
            f'<header style="height: 72px; flex-shrink: 0; background: #fff; border-bottom: 1px solid {T["line"]}; display: flex; align-items: center; gap: 16px; padding: 0 32px;">'
            f'{btn("", "ghost", "x", "md", "Salir de Importar")}<div><div style="font-size: 12.5px; color: {T["text2"]}; font-weight: 700;">Base de precios general 2026 · destino: v1.4 en preparación</div><div style="font-size: 18px; font-weight: 800;">Importar matriz de precios</div></div>'
            f'<span style="margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: {T["text2"]};">{svg("file", 16)}<b style="color: {T["text"]};">Base_Matriz_2026-agosto-26.xlsx</b> · 34 hojas</span></header>'
            f'<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 20px; padding: 26px 64px; min-height: 0;">{stepper(cur)}{body}</div>'
            f'<footer style="height: 76px; flex-shrink: 0; background: #fff; border-top: 1px solid {T["line"]}; display: flex; align-items: center; gap: 12px; padding: 0 64px;">{footer}</footer></div>')

# ═══ V5a · Ajustes + modo ═══════════════════════════════════════════
def modo(t, d, on):
    bd = f'border: 1.5px solid {T["teal"]}; background: {T["teal05"]};' if on else f'border: 1px solid {T["line"]}; background: #fff;'
    dot = (f'<span style="width: 20px; height: 20px; border-radius: 10px; border: 2px solid {T["teal"] if on else T["line2"]}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">'
           + (f'<span style="width: 10px; height: 10px; border-radius: 5px; background: {T["teal"]};"></span>' if on else '') + '</span>')
    return (f'<button type="button" role="radio" aria-checked="{"true" if on else "false"}" style="flex: 1 1 0; display: flex; gap: 12px; align-items: flex-start; padding: 16px; border-radius: 16px; {bd} font-family: inherit; text-align: left; cursor: pointer;">'
            f'{dot}<span style="display: flex; flex-direction: column; gap: 4px;"><span style="font-size: 14.5px; font-weight: 800; color: {T["text"]};">{t}</span><span style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">{d}</span></span></button>')
def ajuste(t, d, n, tone='pos'):
    return (f'<div style="display: flex; gap: 12px; align-items: flex-start; padding: 14px 0; border-top: 1px solid {T["line"]};">'
            f'<span style="width: 22px; height: 22px; border-radius: 6px; background: {T["teal"]}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">{svg("check", 14, "#ffffff", 3)}</span>'
            f'<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px;"><div style="font-size: 13.5px; font-weight: 800;">{t}</div><div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">{d}</div></div>'
            f'{badge(n, tone)}</div>')
body = (f'<div style="display: flex; gap: 20px; min-height: 0;">'
        f'<section style="flex-grow: 1; min-width: 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column;">'
        f'<div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 6px;">{h("Ajustes que haremos al archivo antes de cargarlo", 16)}<span style="font-size: 12.5px; color: {T["text2"]}; font-weight: 700;">Nada se guarda todavía</span></div>'
        + ajuste('Encabezados', '“Item” se usará como <b>APU</b> y “Valor Total 2026” como <b>Valor total</b> en todas las hojas: la carga los necesita con ese nombre exacto.', '33 hojas')
        + ajuste('Nombres de hoja contra los departamentos del sistema', '“APU Bogota” → <b>APU Bogotá, D. C.</b>; “APU Guajira” → <b>APU La Guajira</b>. Solo donde hay un único candidato.', '9 hojas')
        + ajuste('Números con punto de miles', '“1.200” se convierte en 1200. Sin este ajuste la carga lo leería como 1,2 sin avisar.', '3.412 celdas', 'cau')
        + ajuste('Hojas que no son de precios', '“LINEAMIENTOS” no empieza por “APU” y se deja por fuera.', '1 hoja', 'neutral')
        + '</section>'
        f'<section style="width: 520px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px;">'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">{h("¿Cómo entra este archivo?", 16)}'
        f'<div role="radiogroup" aria-label="Modo de importación" style="display: flex; flex-direction: column; gap: 10px;">'
        + modo('Actualizar la v1.4 en preparación', 'Agrega o actualiza capítulos, APU e insumos que vengan en el archivo. Lo que no venga, se queda como está: el archivo nunca borra.', True)
        + modo('Crear una versión nueva solo con este archivo', 'Para una matriz renumerada o que reemplaza la anterior. Se crea otra base de precios (v1.5) desde cero.', False)
        + '</div></div>'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 18px; display: flex; gap: 12px; align-items: flex-start;">{svg("clock", 18, T["teal8"])}'
        f'<div style="display: flex; flex-direction: column; gap: 4px;"><div style="font-size: 13.5px; font-weight: 800;">La carga va de a un departamento</div><div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">Cada uno tarda cerca de una hora. En el siguiente paso eliges cuáles cargar y en qué orden.</div></div></div></section></div>')
foot = f'{btn("Volver", "secondary", "chl", "lg")}<span style="margin-left: auto;"></span>{btn("Aplicar ajustes y diagnosticar", "primary", "arrow", "lg")}'
board('V5-despues-ajustes.dc.html', 'Importar · después · ajustes', flow(2, body, foot), aside('despues', 'El archivo se prepara antes de que el servidor lo toque', [
    ('Ajustes que el endpoint no perdona', 'Encabezados literales, nombres de hoja exactos y números sin puntos de miles: se corrigen aquí, a la vista.'),
    ('Los errores silenciosos, atajados', '“1.200” se leería como 1,2 sin avisar: el ajuste lo evita y dice cuántas celdas tocó.'),
    ('Actualizar o reemplazar', 'El archivo nunca borra. Si la matriz se renumeró, se crea una versión nueva en vez de mezclarla.'),
    ('Siempre sobre una versión', 'Actualizar o reemplazar, el destino es una versión en preparación: la vigente no se toca.'),
    ('La expectativa de tiempo, desde antes', 'Se anuncia que va de a un departamento y cuánto tarda cada uno.')]))

# ═══ V5b · Diagnóstico por departamento ═════════════════════════════
filas = [('La Guajira', '1.981', '18 · 278 · 423', 'ok', True), ('Antioquia', '2.014', '18 · 281 · 425', 'ok', True), ('Bogotá, D. C.', '1.981', '18 · 278 · 423', 'ok', True),
         ('Norte de Santander', '1.981', '18 · 278 · 423', 'ok', True), ('Tolima', '1.960', '18 · 276 · 421', 'ok', True), ('Santander', '1.988', '18 · 278 · 424', 'warn', True),
         ('Córdoba', '1.975', '18 · 277 · 422', 'ok', True), ('Bolívar', '1.940', '18 · 272 · 419', 'ok', False), ('Sucre', '1.984', '—', 'block', False), ('“APU Costa Caribe”', '—', '—', 'nodep', False)]
rows = ''
for i, (d, n, c, st, sel) in enumerate(filas, 1):
    est = {'ok': badge('Listo', 'pos', 'check'), 'warn': badge('Listo · 2 avisos', 'cau', 'alert'), 'block': badge('Bloqueado · 3 filas', 'neg', 'x'), 'nodep': badge('No es un departamento', 'neg', 'x')}[st]
    box = (f'<span role="checkbox" aria-checked="{"true" if sel else "false"}" style="width: 20px; height: 20px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; '
           + (f'background: {T["teal"]};">{svg("check", 13, "#fff", 3)}' if sel else f'border: 1.5px solid {T["line2"]};">') + '</span>') if st in ('ok', 'warn') else '<span style="width: 20px;"></span>'
    orden = f'<b style="color: {T["teal8"]};">{[1,2,3,4,5,6,7][i-1] if sel else ""}</b>' if sel else ''
    link = f'<a href="#" style="font-size: 12.5px; font-weight: 800;">{"Ver avisos" if st == "warn" else "Ver por qué" if st in ("block", "nodep") else ""}</a>'
    rows += '<tr>' + td(box) + td(orden, 'center') + td(d, strong=True) + td(n, 'right', mono=True, color=T['text2']) + td(c, mono=True, color=T['text2']) + td(est) + td(link) + '</tr>'
body = (f'<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px;">'
        + ''.join(f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; padding: 14px 16px;"><div style="font-size: 12.5px; font-weight: 700; color: {T["text2"]};">{l}</div><div style="font-size: 26px; font-weight: 800; color: {c};">{v}</div><div style="font-size: 12px; color: {T["text2"]};">{d}</div></div>'
                  for l, v, d, c in [('Hojas de departamentos', '33', '1 hoja omitida (LINEAMIENTOS)', T['text']), ('Listos', '31', '1 con avisos para revisar', T['pos']),
                                     ('Bloqueados', '2', 'no se pueden cargar así', T['neg']), ('Seleccionados para esta carga', '7', '≈ 7 h, uno después del otro', T['teal8'])])
        + f'</div><div style="display: flex; gap: 20px; min-height: 0;">'
        f'<section style="flex-grow: 1; min-width: 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; overflow: hidden;">'
        f'<div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px;"><span style="font-size: 13.5px; font-weight: 800;">Departamentos</span>{badge("Todos · 33", "teal", None, "md")}{badge("Con avisos · 1", "neutral", None, "md")}{badge("Bloqueados · 2", "neutral", None, "md")}'
        f'<span style="margin-left: auto; font-size: 12.5px; color: {T["text2"]};">Arrastra para cambiar el orden de carga</span></div>'
        f'<table>{th([("", "left"), ("Orden", "center"), ("Departamento", "left"), ("Filas", "right"), ("Capítulos · APU · insumos", "left"), ("Estado", "left"), ("", "left")])}<tbody>{rows}</tbody></table></section>'
        f'<section style="width: 400px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px;">'
        f'<div style="background: #fff; border: 1px solid {T["cauln"]}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px;">{h("Santander · 2 avisos", 14.5, color=T["cau"])}'
        f'<div style="font-size: 12.5px; line-height: 1.55;"><b>APU 4.5</b> vale $1.450.740 en el archivo, pero sus insumos suman $1.448.910.</div>'
        f'<div style="font-size: 12.5px; line-height: 1.55;"><b>APU 8.3</b>: 1 insumo sin valor unitario (quedaría vacío).</div>'
        f'<div style="font-size: 12px; color: {T["text2"]};">Se puede cargar así; los avisos quedan en el resultado.</div></div>'
        f'<div style="background: #fff; border: 1px solid {T["negln"]}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px;">{h("Sucre · bloqueado", 14.5, color=T["neg"])}'
        f'<div style="font-size: 12.5px; line-height: 1.55;">3 filas sin código de APU (640, 655, 702): no se sabe si son un capítulo, un APU o un insumo.</div>{btn("Resolver fila por fila", "secondary", None, "sm")}</div>'
        f'<div style="background: #fff; border: 1px solid {T["negln"]}; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 6px;">{h("“APU Costa Caribe”", 14.5, color=T["neg"])}'
        f'<div style="font-size: 12.5px; line-height: 1.55;">No corresponde a un departamento del sistema. Hay que separarla por departamento en el archivo.</div></div></section></div>')
foot = (f'{btn("Volver", "secondary", "chl", "lg")}<span style="margin-left: auto; font-size: 13px; color: {T["text2"]};">Los 7 se cargan <b style="color: {T["text"]};">uno por uno, en esta pantalla</b> (≈ 7 h).</span>'
        f'{btn("Iniciar carga de 7 departamentos", "primary", "upload", "lg")}')
board('V5-despues-diagnostico.dc.html', 'Importar · después · diagnóstico', flow(3, body, foot), aside('despues', 'Diagnóstico por departamento, y el admin decide qué cargar y en qué orden', [
    ('Una fila por departamento', 'Filas, capítulos, APU e insumos detectados, y su estado: listo, con avisos o bloqueado.'),
    ('Elegir y ordenar la cola', 'Como cada departamento tarda cerca de una hora, se eligen los urgentes primero y se ordenan arrastrando.'),
    ('Controles que la carga no hace', 'Valor del APU contra la suma de sus insumos y valores que quedarían vacíos, antes de enviar nada.'),
    ('Los bloqueados explican por qué', 'Fila sin APU o hoja que no es un departamento: se resuelve aquí o se corrige el archivo.'),
    ('El tiempo, antes de empezar', '“7 departamentos ≈ 7 h”: se sabe cuánto va a durar antes de iniciar.')]))

# ═══ V5c · Carga dentro del flujo ═════════════════════════════════
cola = [('La Guajira', 'Completo', '52 creados · 1.929 actualizados · 58 min', 'pos'), ('Antioquia', 'Completo', '18 creados · 1.996 actualizados · 1 h 03 min', 'pos'),
        ('Bogotá, D. C.', 'Completo', '14 creados · 1.967 actualizados · 56 min', 'pos'), ('Norte de Santander', 'Cargando', 'fila 1.212 de 1.981', 'info'),
        ('Tolima', 'En cola', '', 'neutral'), ('Santander', 'En cola', '2 avisos del diagnóstico', 'neutral'), ('Córdoba', 'En cola', '', 'neutral')]
items = ''
for d, e, info, tone in cola:
    ic = {'pos': 'check', 'info': 'clock', 'neutral': 'dot'}[tone]
    bg = T['infobg'] if e == 'Cargando' else '#fff'
    items += (f'<div style="display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; background: {bg}; border: 1px solid {T["infoln"] if e == "Cargando" else T["line"]};">'
              f'{svg(ic, 16, {"pos": T["pos"], "info": T["info"], "neutral": T["text2"]}[tone], 2.2)}<span style="flex-grow: 1; display: flex; flex-direction: column;"><span style="font-size: 13.5px; font-weight: 800;">{d}</span>'
              f'<span style="font-size: 12px; color: {T["text2"]};">{info}</span></span>{badge(e, tone)}</div>')
actual = (f'<section style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px;">'
          f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">'
          f'<div style="display: flex; align-items: center; justify-content: space-between;"><div><div style="font-size: 12.5px; font-weight: 700; color: {T["text2"]};">Cargando ahora · 4 de 7</div>{h("Norte de Santander", 24)}</div>{badge("Cargando", "info", "clock", "md")}</div>'
          f'<div style="height: 12px; border-radius: 6px; background: {T["line"]}; overflow: hidden;"><div style="width: 61%; height: 12px; background: {T["info"]};"></div></div>'
          f'<div style="display: flex; justify-content: space-between; font-size: 13px; color: {T["text2"]};"><span><b style="color: {T["text"]};">1.212 de 1.981 filas</b> · 61 %</span><span>Lleva 36 min · faltan ~22 min</span></div>'
          f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;">'
          + ''.join(f'<div style="padding: 12px; border-radius: 12px; background: {T["panel"]};"><div style="font-size: 12px; color: {T["text2"]}; font-weight: 700;">{l}</div><div style="font-size: 20px; font-weight: 800;">{v}</div></div>' for l, v in [('Capítulos', '18 de 18'), ('APU', '171 de 278'), ('Insumos', '1.023 de 1.685')])
          + '</div></div>'
          f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 10px;">'
          f'<div style="display: flex; align-items: center; justify-content: space-between;">{h("Avance total", 16)}<span style="font-size: 13px; color: {T["text2"]};">empezó hoy 06:10 · termina ~13:05</span></div>'
          f'<div style="display: flex; gap: 4px;">'
          + ''.join(f'<span title="{d}" style="flex: 1 1 0; height: 10px; border-radius: 5px; background: {c};"></span>' for d, c in [('La Guajira', T['pos']), ('Antioquia', T['pos']), ('Bogotá', T['pos']), ('Norte de Santander', T['info']), ('Tolima', T['line']), ('Santander', T['line']), ('Córdoba', T['line'])])
          + f'</div><div style="font-size: 13px; color: {T["text2"]};"><b style="color: {T["text"]};">3 de 7 departamentos completos.</b> Lo ya cargado queda guardado en la v1.4 aunque la carga se detenga.</div></div>'
          f'<div role="note" style="display: flex; gap: 12px; align-items: flex-start; padding: 16px; border-radius: 16px; background: #fff; border: 1px dashed {T["negln"]};">{svg("alert", 18, T["neg"], 2)}'
          f'<div style="display: flex; flex-direction: column; gap: 6px;"><div style="font-size: 13.5px; font-weight: 800;">Así se ve si el servidor falla</div>'
          f'<div style="font-size: 12.5px; color: {T["text2"]}; line-height: 1.5;">“La carga se detuvo en Norte de Santander (error 500). La Guajira, Antioquia y Bogotá ya quedaron guardados.”</div>'
          f'<div style="display: flex; gap: 8px;">{btn("Reintentar desde Norte de Santander", "primary", None, "sm")}{btn("Terminar aquí", "secondary", None, "sm")}</div></div></div></section>')
lado = (f'<section style="width: 440px; flex-shrink: 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 8px;">'
        f'<div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 4px;">{h("Cola de carga", 16)}<span style="font-size: 12.5px; color: {T["text2"]};">uno a la vez</span></div>{items}</section>')
body = f'<div style="display: flex; gap: 20px; min-height: 0;">{actual}{lado}</div>'
foot = (f'{svg("info", 18, T["text2"])}<span style="font-size: 13px; color: {T["text2"]}; line-height: 1.45; max-width: 700px;">Mantén esta ventana abierta mientras carga. Si se cierra o se corta la sesión, al volver <b style="color: {T["text"]};">retomas desde el departamento pendiente</b>; lo cargado no se pierde.</span>'
        f'<span style="margin-left: auto;"></span>{btn("Detener después del actual", "secondary", None, "lg")}')
board('V5-despues-carga.dc.html', 'Importar · después · 3 carga', flow(4, body, foot), aside('despues', 'La carga se vive dentro del flujo, con todo lo que hace falta para esperar horas', [
    ('Un paso más del flujo', 'La carga es el paso 4 de Importar, en la misma pantalla completa: no se va a otro lado.'),
    ('Qué pasa ahora, en grande', 'El departamento en curso con su avance real: filas, capítulos, APU e insumos, tiempo transcurrido y restante.'),
    ('La cola a la vista', 'Uno a la vez, con lo que devolvió la carga de cada uno y el tiempo que tomó.'),
    ('Detener sin perder nada', 'Se puede parar después del departamento actual; lo cargado queda en la v1.4.'),
    ('Fallar o cerrar no es empezar de cero', 'Si el servidor falla o se cierra la ventana, se retoma desde el departamento pendiente.')]))

# ═══ V5d · Resultado ═══════════════════════════════════════════════
res = [('La Guajira', 'Completo', '0 · 52', '1.929', '0'), ('Antioquia', 'Completo', '0 · 18', '1.996', '0'), ('Bogotá, D. C.', 'Completo', '0 · 14', '1.967', '0'),
       ('Norte de Santander', 'Completo', '0 · 21', '1.960', '0'), ('Tolima', 'Completo', '0 · 16', '1.944', '0'), ('Santander', 'Con avisos', '0 · 19', '1.969', '2'), ('Córdoba', 'Completo', '0 · 15', '1.960', '0')]
rows = ''.join('<tr>' + td(d, strong=True) + td(badge(e, 'cau' if e == 'Con avisos' else 'pos', 'alert' if e == 'Con avisos' else 'check')) + td(c, 'right', mono=True) + td(u, 'right', mono=True) + td(x, 'right', mono=True, color=T['cau'] if x != '0' else T['text2'])
               + td('<a href="#" style="font-size: 12.5px; font-weight: 800;">Ver en el árbol</a>') + '</tr>' for d, e, c, u, x in res)
body = (f'<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px;">'
        + ''.join(f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; padding: 14px 16px;"><div style="font-size: 12.5px; font-weight: 700; color: {T["text2"]};">{l}</div><div style="font-size: 26px; font-weight: 800; color: {c};">{v}</div><div style="font-size: 12px; color: {T["text2"]};">{d}</div></div>'
                  for l, v, d, c in [('Departamentos cargados', '7 de 7', '6 completos · 1 con avisos', T['pos']), ('Registros creados', '155', 'APU e insumos nuevos', T['text']),
                                     ('Registros actualizados', '13.725', 'precios que cambiaron', T['text']), ('Sin cargar', '26', '24 no elegidos · 2 bloqueados', T['cau'])])
        + f'</div><div style="display: flex; gap: 20px; min-height: 0;"><section style="flex-grow: 1; min-width: 0; background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; overflow: hidden;">'
        f'<div style="padding: 12px 16px; font-size: 13.5px; font-weight: 800;">Resultado por departamento</div>'
        f'<table>{th([("Departamento", "left"), ("Estado", "left"), ("Capítulos · APU creados", "right"), ("Actualizados", "right"), ("Avisos", "right"), ("", "left")])}<tbody>{rows}</tbody></table></section>'
        f'<section style="width: 420px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px;">'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 10px;">{h("¿Y ahora?", 15)}'
        f'<div style="font-size: 13px; line-height: 1.5;">Todo quedó en la <b>v1.4 en preparación</b>. La Consulta sigue mostrando la v1.3 hasta que la actives.</div>'
        f'{btn("Revisar la v1.4 y activarla", "primary", "send")}{btn("Cargar los 24 departamentos pendientes", "secondary", "upload")}{btn("Descargar reporte de la carga", "secondary", "download")}</div>'
        f'<div style="background: #fff; border: 1px solid {T["line"]}; border-radius: 16px; padding: 16px; font-size: 12.5px; color: {T["text2"]}; line-height: 1.55;">La carga queda en <b style="color: {T["text"]};">Historial</b> con quién la hizo, el archivo, los departamentos y su resultado.</div></section></div>')
foot = f'{btn("Cerrar", "secondary", None, "lg")}<span style="margin-left: auto;"></span>{btn("Revisar la v1.4 y activarla", "primary", "send", "lg")}'
board('V5-despues-resultado.dc.html', 'Importar · después · 4 resultado', flow(5, body, foot), aside('despues', 'El resultado cierra el ciclo y dice cuál es el siguiente paso', [
    ('Resultado por departamento', 'Lo que devolvió la carga (creados, actualizados, avisos), departamento por departamento.'),
    ('Lo que falta, contado', '26 sin cargar: cuáles no se eligieron y cuáles estaban bloqueados, con un botón para seguir.'),
    ('El siguiente paso es activar', 'La carga no publica nada: el botón principal lleva a revisar y activar la v1.4.'),
    ('Queda en la traza', 'Quién cargó, qué archivo, qué departamentos y qué pasó, en Historial.')]))
print('V5 ok')
