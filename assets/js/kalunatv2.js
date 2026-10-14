/**
 * Kalunat v2 — carrusel de portada, índice de «Última entrada» y barra de lectura.
 */
( function () {
	'use strict';

	var pad = function ( n ) {
		return String( n ).padStart( 2, '0' );
	};

	var reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	// Carrusel: fundido .9s, avance automático cada 7s; las flechas lo paran.
	document.querySelectorAll( '.kv2-carousel' ).forEach( function ( root ) {
		var slides = Array.prototype.slice.call( root.querySelectorAll( '.wp-block-post-template > li' ) );
		if ( slides.length < 2 ) {
			return;
		}
		var media = root.parentElement;
		var i = 0;
		var timer = null;

		var controls = document.createElement( 'div' );
		controls.className = 'kv2-carousel__controls';
		controls.innerHTML =
			'<span class="kv2-carousel__counter" aria-live="polite"></span>' +
			'<button type="button" data-dir="-1" aria-label="Anterior">←</button>' +
			'<button type="button" data-dir="1" aria-label="Siguiente">→</button>';
		var counter = controls.querySelector( '.kv2-carousel__counter' );

		var show = function ( k ) {
			i = ( k + slides.length ) % slides.length;
			slides.forEach( function ( s, n ) {
				s.classList.toggle( 'is-active', n === i );
				s.setAttribute( 'aria-hidden', n === i ? 'false' : 'true' );
			} );
			counter.textContent = pad( i + 1 ) + ' / ' + pad( slides.length );
		};

		controls.addEventListener( 'click', function ( e ) {
			var btn = e.target.closest( 'button' );
			if ( ! btn ) {
				return;
			}
			clearInterval( timer );
			show( i + Number( btn.getAttribute( 'data-dir' ) ) );
		} );

		media.appendChild( controls );
		root.classList.add( 'is-ready' );
		show( 0 );
		if ( ! reduceMotion ) {
			timer = setInterval( function () {
				show( i + 1 );
			}, 7000 );
		}
	} );

	// Última entrada: índice 01–05 a la derecha.
	document.querySelectorAll( '.kv2-latest' ).forEach( function ( root ) {
		var items = Array.prototype.slice.call( root.querySelectorAll( '.wp-block-post-template > li' ) );
		if ( items.length < 2 ) {
			return;
		}
		var nav = document.createElement( 'nav' );
		nav.className = 'kv2-latest__nav';
		nav.setAttribute( 'aria-label', 'Últimas entradas' );

		var buttons = items.map( function ( item, n ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.textContent = pad( n + 1 );
			var title = item.querySelector( '.wp-block-post-title' );
			if ( title ) {
				b.setAttribute( 'aria-label', pad( n + 1 ) + ' — ' + title.textContent.trim() );
			}
			b.addEventListener( 'click', function () {
				pick( n );
			} );
			nav.appendChild( b );
			return b;
		} );

		var pick = function ( k ) {
			items.forEach( function ( it, n ) {
				it.classList.toggle( 'is-active', n === k );
				it.setAttribute( 'aria-hidden', n === k ? 'false' : 'true' );
				buttons[ n ].setAttribute( 'aria-current', n === k ? 'true' : 'false' );
			} );
		};

		root.appendChild( nav );
		root.classList.add( 'is-ready' );
		pick( 0 );
	} );

	// Barra de progreso de lectura en las entradas.
	if ( document.body.classList.contains( 'single-post' ) ) {
		var bar = document.createElement( 'div' );
		bar.className = 'kv2-progress';
		bar.setAttribute( 'aria-hidden', 'true' );
		document.body.appendChild( bar );
		var update = function () {
			var el = document.documentElement;
			var max = el.scrollHeight - el.clientHeight;
			bar.style.width = ( max > 0 ? ( el.scrollTop / max ) * 100 : 0 ) + '%';
		};
		window.addEventListener( 'scroll', update, { passive: true } );
		window.addEventListener( 'resize', update );
		update();
	}
}() );
