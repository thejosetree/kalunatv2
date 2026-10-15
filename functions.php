<?php
/**
 * Kalunat v2 — funciones del tema.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Adobe Fonts: Guyot Headline y Guyot Text (kit tbz5hqk); Futura PT (kit sai6zlp).
define( 'KALUNATV2_ADOBE_FONTS', 'https://use.typekit.net/tbz5hqk.css' );
define( 'KALUNATV2_UI_FONT', 'https://use.typekit.net/sai6zlp.css' );
// Gloock solo para el logotipo «kalunat°».
define( 'KALUNATV2_LOGO_FONT', 'https://fonts.googleapis.com/css2?family=Gloock&display=swap' );

add_action( 'after_setup_theme', function () {
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'post-thumbnails' );
	add_editor_style( array( KALUNATV2_ADOBE_FONTS, KALUNATV2_UI_FONT, KALUNATV2_LOGO_FONT, 'style.css' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$version = wp_get_theme()->get( 'Version' );
	wp_enqueue_style( 'kalunatv2-adobe-fonts', KALUNATV2_ADOBE_FONTS, array(), null );
	wp_enqueue_style( 'kalunatv2-ui-font', KALUNATV2_UI_FONT, array(), null );
	wp_enqueue_style( 'kalunatv2-logo-font', KALUNATV2_LOGO_FONT, array(), null );
	wp_enqueue_style( 'kalunatv2', get_stylesheet_uri(), array(), $version );
	wp_enqueue_script( 'kalunatv2', get_theme_file_uri( 'assets/js/kalunatv2.js' ), array(), $version, array( 'strategy' => 'defer', 'in_footer' => true ) );
} );

add_filter( 'wp_resource_hints', function ( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = array( 'href' => 'https://use.typekit.net', 'crossorigin' );
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $urls;
}, 10, 2 );

// Favicon por defecto si no se ha subido un icono del sitio en Ajustes › Generales.
add_action( 'wp_head', function () {
	if ( has_site_icon() ) {
		return;
	}
	$base = get_theme_file_uri( 'assets/img/' );
	echo '<link rel="icon" type="image/png" sizes="32x32" href="' . esc_url( $base . 'favicon-32.png' ) . '">' . "\n";
	echo '<link rel="icon" type="image/png" sizes="16x16" href="' . esc_url( $base . 'favicon-16.png' ) . '">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( $base . 'favicon-180.png' ) . '">' . "\n";
} );

add_action( 'init', function () {
	register_block_pattern_category( 'kalunatv2', array( 'label' => 'Kalunat' ) );

	// Antetítulo de capítulo: párrafo corto sobre un H2 («La orilla sur»).
	register_block_style( 'core/paragraph', array(
		'name'  => 'kv2-kicker',
		'label' => 'Antetítulo de capítulo',
	) );

	// Datos de la foto y ficha del viaje: se editan en el panel «Campos personalizados»
	// de la entrada y se muestran mediante block bindings. Si están vacíos, no salen.
	$keys = array(
		'kalunat_coords', 'kalunat_exif',
		'kalunat_lugar', 'kalunat_actividad', 'kalunat_duracion', 'kalunat_dificultad', 'kalunat_epoca',
	);
	foreach ( $keys as $key ) {
		register_post_meta( 'post', $key, array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'sanitize_text_field',
		) );
	}

	// Tiempo de lectura («14 min de lectura»), a 200 palabras por minuto.
	register_block_bindings_source( 'kalunatv2/reading-time', array(
		'label'              => 'Tiempo de lectura',
		'uses_context'       => array( 'postId' ),
		'get_value_callback' => function ( $args, $block ) {
			$post_id = $block->context['postId'] ?? get_the_ID();
			$text    = wp_strip_all_tags( strip_shortcodes( (string) get_post_field( 'post_content', $post_id ) ) );
			$words   = count( preg_split( '/\s+/u', trim( $text ), -1, PREG_SPLIT_NO_EMPTY ) );
			return sprintf( '%d min de lectura', max( 1, (int) round( $words / 200 ) ) );
		},
	) );
} );

/**
 * Huecos de la portada.
 *
 * Los bloques Query de las plantillas llevan una clave propia, `kalunatSlot`,
 * dentro de su atributo `query`. Aquí se resuelve qué entradas van en cada hueco
 * y se evita que una misma entrada se repita en la página. En el editor, esos
 * bloques muestran simplemente las últimas entradas.
 *
 * - carousel: entradas fijadas (máx. 4); si no hay, las 4 últimas.
 * - featured: la última con la etiqueta «destacado»; si no hay, la última.
 * - recent:   las 3 últimas no mostradas.
 * - gear:     la última de la categoría «equipo».
 * - photo:    la última de la categoría «fotografia».
 * - latest:   las 5 siguientes no mostradas.
 * - related:  3 de la misma categoría que la entrada actual.
 */
function kalunatv2_slot_ids( $slot, $count ) {
	static $shown = array();

	$base = array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'fields'              => 'ids',
		'posts_per_page'      => $count,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	);

	// Prueba cada consulta en orden: primero sin repetir entradas, luego permitiéndolo.
	$attempts = array();
	switch ( $slot ) {
		case 'carousel':
			$sticky = array_slice( array_map( 'intval', (array) get_option( 'sticky_posts', array() ) ), 0, $count );
			if ( $sticky ) {
				$attempts[] = array( 'post__in' => $sticky, 'orderby' => 'post__in' );
			}
			$attempts[] = array();
			break;
		case 'featured':
			$attempts[] = array( 'tag' => 'destacado' );
			$attempts[] = array( 'exclude_shown' => true );
			$attempts[] = array();
			break;
		case 'gear':
			$attempts[] = array( 'category_name' => 'equipo', 'exclude_shown' => true );
			$attempts[] = array( 'category_name' => 'equipo' );
			$attempts[] = array( 'exclude_shown' => true );
			$attempts[] = array();
			break;
		case 'photo':
			$attempts[] = array( 'category_name' => 'fotografia', 'exclude_shown' => true );
			$attempts[] = array( 'category_name' => 'fotografia' );
			$attempts[] = array( 'exclude_shown' => true );
			$attempts[] = array();
			break;
		case 'related':
			$current = get_the_ID();
			$cats    = $current ? wp_get_post_categories( $current ) : array();
			$exclude = $current ? array( $current ) : array();
			$ids     = $cats ? get_posts( array_merge( $base, array( 'category__in' => $cats, 'post__not_in' => $exclude ) ) ) : array();
			// Completa con las últimas entradas si la categoría no da para tantas.
			if ( count( $ids ) < $count ) {
				$more = get_posts( array_merge( $base, array( 'posts_per_page' => $count - count( $ids ), 'post__not_in' => array_merge( $exclude, $ids ) ) ) );
				$ids  = array_merge( $ids, $more );
			}
			return $ids ? $ids : array( 0 );
		default: // recent, latest
			$attempts[] = array( 'exclude_shown' => true );
			$attempts[] = array();
	}

	foreach ( $attempts as $args ) {
		if ( ! empty( $args['exclude_shown'] ) ) {
			unset( $args['exclude_shown'] );
			if ( $shown ) {
				$args['post__not_in'] = $shown;
			}
		}
		$ids = get_posts( array_merge( $base, $args ) );
		if ( $ids ) {
			$shown = array_values( array_unique( array_merge( $shown, $ids ) ) );
			return $ids;
		}
	}
	return array( 0 );
}

add_filter( 'query_loop_block_query_vars', function ( $query, $block ) {
	$slot = $block->context['query']['kalunatSlot'] ?? '';
	if ( ! $slot ) {
		return $query;
	}
	$count = (int) ( $block->context['query']['perPage'] ?? 4 );
	$ids   = kalunatv2_slot_ids( $slot, max( 1, $count ) );

	unset( $query['offset'], $query['tax_query'], $query['post__not_in'] );
	$query['post__in']            = $ids;
	$query['orderby']             = 'post__in';
	$query['posts_per_page']      = count( $ids );
	$query['ignore_sticky_posts'] = true;
	return $query;
}, 10, 2 );
