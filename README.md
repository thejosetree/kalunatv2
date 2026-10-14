# Kalunat v2 — tema WordPress

Tema de bloques (FSE) basado en el diseño **Kalunat Magazine v3** (`project/Kalunat Magazine v3.dc.html`): portada partida con carrusel, banda de destacado, mosaico, «Última entrada» con índice 01–05, suscripción y pie. La entrada y el archivo siguen el mismo lenguaje (portada partida hueso + foto).

## Tipografía (Adobe Fonts, kit `sai6zlp`)
| Uso | Fuente | Preset en theme.json |
|---|---|---|
| Encabezados grandes (H1, H2, destacado, lemas, suscripción, capitular) | Freight Big (`freight-big-pro`) | `big` |
| Encabezados pequeños (H3–H6, títulos de tarjeta, capítulos, citas) | Freight Display (`freight-display-pro`) | `display` |
| Texto (cuerpo, entradillas, extractos) | Freight Text (`freight-text-pro`) | `text` |
| Interfaz (menú, etiquetas, fechas, botones, contadores, pies de foto) | Futura PT (`futura-pt`) | `ui` |
| Logotipo «kalunat°» | Gloock (Google Fonts) | `logo` |

El kit se carga desde `https://use.typekit.net/sai6zlp.css` en la web y en el editor. En Adobe Fonts, el kit debe incluir esas cuatro familias y tener añadido el dominio del sitio (y `localhost` si pruebas en local). Si los nombres CSS de tu kit son otros, cámbialos en `theme.json › settings.typography.fontFamilies`.

## Instalación
1. Comprime la carpeta `kalunatv2` en un .zip y súbela en Apariencia › Temas › Añadir nuevo › Subir tema. Actívalo.
2. Ajustes › Generales: título del sitio **kalunat** (el ° se añade solo).
3. Ajustes › Lectura: página de inicio estática («Inicio», vacía) y página de entradas («Diario»). La home usa `front-page.html`.
4. Apariencia › Editor › Navegación: crea el menú (Inicio, Diario, Viajes, Equipo, Fotografía, Sobre mí).
5. Ajustes › Enlaces permanentes: «Nombre de la entrada».

## Cómo se rellena la portada
Los bloques Query de la home llevan una clave propia (`kalunatSlot`) que resuelve `functions.php`. Una entrada no se repite en la página.

| Sección | Entradas |
|---|---|
| Carrusel (4) | Entradas **fijadas** («Fijar en la parte superior del blog»); si no hay, las 4 últimas |
| Destacado | La última con la etiqueta **destacado** |
| Recientes (3) | Las 3 últimas no mostradas |
| Mosaico, foto con tarjeta | La última de la categoría **equipo** |
| Mosaico, foto | La última de la categoría **fotografia** |
| Última entrada (5) | Las 5 siguientes |
| Sigue leyendo (single) | 3 de la misma categoría, completadas con las últimas |

En el editor estas consultas muestran simplemente las últimas entradas; la selección real se ve en la web.

## Por entrada
- **Imagen destacada** grande y horizontal: es la foto a sangre en todas las secciones.
- **Extracto**: entradilla en la home y en la portada del relato.
- **Categoría**: aparece como etiqueta ámbar.
- **Campos personalizados** (panel «Campos personalizados» del editor; actívalo en Preferencias › Paneles):
  - `kalunat_coords`, por ejemplo `50°29′S 73°03′W`: se muestra en el carrusel y en la foto del relato.
  - `kalunat_exif`, por ejemplo `24 mm · f/8 · 1/800`: se muestra en la foto del relato.
  Si están vacíos, no se muestran.
- El primer párrafo lleva capitular automática; los H2 del contenido se muestran como capítulos.

## Opciones (equivalentes a los Tweaks del prototipo)
En el editor del sitio, en la clase CSS adicional del bloque:
- Foto de «Última entrada» en color: quita `kv2-latest--mono` de la sección.
- Ocultar coordenadas en el carrusel: añade `kv2-hide-exif` a la portada.

## Pendiente
- **Suscripción**: el formulario es HTML estático (`action="#"`). Conéctalo a tu servicio de newsletter (MailPoet, Kit…) o cambia el bloque HTML por el del plugin.
- **ES/EN**: enlaces estáticos hasta instalar Polylang/WPML.
- Del artículo v2 y la categoría quedan fuera la ficha del viaje, el índice de capítulos fijo, el mosaico intermedio, «Si vas» y la barra de filtros del archivo. Sí están la portada partida, la capitular, la barra de lectura y «Sigue leyendo».

## Estructura
```
kalunatv2/
├─ style.css        cabecera del tema + maquetación (portada partida, carrusel, mosaico…)
├─ theme.json       colores, fuentes, tamaños y estilos de bloque
├─ functions.php    carga de fuentes, favicon, campos de la foto y huecos de la portada
├─ assets/js/       carrusel, índice de «Última entrada» y barra de lectura
├─ assets/img/      logos y favicons
├─ parts/           header (páginas interiores) · footer
└─ templates/       front-page · single · archive · index · search · page · page-no-title · 404
```
