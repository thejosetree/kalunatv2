# Kalunat v2 — tema WordPress

Tema de bloques (FSE) basado en los diseños **Kalunat Magazine v3** (home) y **Kalunat Artículo v2** (entrada): portada partida con carrusel, banda de destacado, mosaico, «Última entrada» con índice 01–05, suscripción y pie; y un relato con ficha del viaje, índice de capítulos, mosaico, fotos a sangre, «Si vas», autor y «Sigue leyendo».

## Tipografía (Adobe Fonts)
| Uso | Fuente | Kit | Preset en theme.json |
|---|---|---|---|
| Encabezados (H1–H6, titulares, títulos de tarjeta, citas, capitular) | Guyot Headline (`guyot-headline`) | `tbz5hqk` | `headline` |
| Párrafos (cuerpo, entradillas, extractos) | Guyot Text (`guyot-text`) | `tbz5hqk` | `text` |
| Interfaz (menú, etiquetas, fechas, botones, contadores, pies de foto) | Futura PT (`futura-pt`) | `sai6zlp` | `ui` |
| Logotipo «kalunat°» | Gloock (Google Fonts) | — | `logo` |

Los dos kits se cargan en la web y en el editor. En Adobe Fonts, cada kit debe tener añadido el dominio del sitio (y `localhost` si pruebas en local). Si los nombres CSS de tu kit son otros, cámbialos en `theme.json › settings.typography.fontFamilies`. Si añades Futura PT al kit `tbz5hqk`, puedes quitar el segundo kit de `functions.php`.

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

## El relato (single)
De arriba abajo: barra de lectura, portada partida (categorías, título, extracto, autor, fecha y tiempo de lectura, foto con ES/EN y datos de cámara), ficha del viaje, cuerpo con índice de capítulos fijo, autor + «Sigue leyendo» y pie.

**Capítulos.** Cada H2 del contenido abre un capítulo: se numera solo (01, 02…) y aparece en el índice de la izquierda, que marca en ámbar el capítulo que estás leyendo. Para el antetítulo corto («La orilla sur»), pon un párrafo justo encima del H2 con el estilo **Antetítulo de capítulo** o inserta el patrón *Capítulo*. Ese texto es el que sale en el índice; si no lo hay, sale el propio H2.

**Patrones** (Insertar › Patrones › Kalunat), para meter dentro del contenido:
- *Mosaico: foto + cita + foto* — banda a sangre con la cita en panel hueso.
- *Foto a sangre* — foto a todo el ancho y casi toda la altura.
- *Si vas (guía práctica)* — banda hueso con 4 consejos numerados. Ponla al final del relato: cuenta como último capítulo del índice. Si no la quieres, no la insertes.

Los pies de foto se numeran solos («Fig. 02 — …»; la 01 es la portada). El último párrafo termina con «k°» en ámbar. El primer párrafo lleva capitular.

## Por entrada
- **Imagen destacada** grande y horizontal: es la foto a sangre en todas las secciones.
- **Extracto**: entradilla en la home y en la portada del relato.
- **Categoría**: aparece como etiqueta ámbar.
- **Campos personalizados** (panel «Campos personalizados» del editor; actívalo en Preferencias › Paneles):
  - `kalunat_coords`, por ejemplo `50°29′S 73°03′W`: se muestra en el carrusel y en la foto del relato.
  - `kalunat_exif`, por ejemplo `24 mm · f/8 · 1/800`: se muestra en la foto del relato.
  - Ficha del viaje: `kalunat_lugar`, `kalunat_actividad`, `kalunat_duracion`, `kalunat_dificultad`, `kalunat_epoca`.
  Si están vacíos, no se muestran (si toda la ficha está vacía, la banda desaparece).
- **Autor**: nombre y biografía salen del perfil del usuario (Usuarios › Perfil › Información biográfica).
- El tiempo de lectura se calcula solo (200 palabras por minuto).

## Opciones (equivalentes a los Tweaks del prototipo)
En el editor del sitio, en la clase CSS adicional del bloque:
- Foto de «Última entrada» en color: quita `kv2-latest--mono` de la sección.
- Ocultar coordenadas en el carrusel: añade `kv2-hide-exif` a la portada.

## Pendiente
- **Suscripción**: el formulario es HTML estático (`action="#"`). Conéctalo a tu servicio de newsletter (MailPoet, Kit…) o cambia el bloque HTML por el del plugin.
- **ES/EN**: enlaces estáticos hasta instalar Polylang/WPML.
- El enlace «Instagram →» del bloque del autor y los del pie apuntan a direcciones genéricas: cámbialos en el editor del sitio.
- De la plantilla de categoría quedan fuera «Lo último en la categoría», la barra de filtros y «Otras latitudes».

## Estructura
```
kalunatv2/
├─ style.css        cabecera del tema + maquetación (portada partida, carrusel, mosaico…)
├─ theme.json       colores, fuentes, tamaños y estilos de bloque
├─ functions.php    fuentes, favicon, campos personalizados, tiempo de lectura y huecos de la portada
├─ assets/js/       carrusel, «Última entrada», índice de capítulos y barra de lectura
├─ assets/img/      logos y favicons
├─ parts/           header (páginas interiores) · footer
├─ patterns/        capítulo · mosaico · foto a sangre · si vas
└─ templates/       front-page · single · archive · index · search · page · page-no-title · 404
```
