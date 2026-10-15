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

	// Ancho real de la ventana (sin barra de scroll) para las fotos a sangre.
	var setVw = function () {
		document.documentElement.style.setProperty( '--kv2-vw', document.documentElement.clientWidth + 'px' );
	};
	setVw();
	window.addEventListener( 'resize', setVw );

	// Capítulos: numera los H2 del relato y monta el índice fijo de la izquierda.
	document.querySelectorAll( '.kv2-article' ).forEach( function ( article ) {
		var content = article.querySelector( '.kv2-article__content' );
		var aside = article.querySelector( '.kv2-article__aside' );
		if ( ! content ) {
			return;
		}
		var chapters = [];

		content.querySelectorAll( ':scope > h2' ).forEach( function ( h2 ) {
			var n = pad( chapters.length + 1 );
			var kicker = h2.previousElementSibling;
			var label = h2.textContent.trim();
			if ( kicker && kicker.classList.contains( 'is-style-kv2-kicker' ) ) {
				label = kicker.textContent.trim();
				kicker.textContent = n + ' — ' + label;
			} else {
				kicker = document.createElement( 'p' );
				kicker.className = 'kv2-chapter-kicker';
				kicker.setAttribute( 'aria-hidden', 'true' );
				kicker.textContent = n;
				h2.parentNode.insertBefore( kicker, h2 );
			}
			h2.id = h2.id || 'cap-' + ( chapters.length + 1 );
			chapters.push( { el: h2, label: label } );
		} );

		// «Si vas» cuenta como último capítulo.
		var guide = content.querySelector( ':scope > .kv2-guide' );
		if ( guide ) {
			var gk = guide.querySelector( '.kv2-guide__kicker' );
			var gt = guide.querySelector( '.kv2-guide__title' );
			var gn = pad( chapters.length + 1 );
			if ( gk ) {
				gk.textContent = gn + ' — ' + gk.textContent.trim();
			}
			guide.id = guide.id || 'cap-' + ( chapters.length + 1 );
			chapters.push( { el: guide, label: gt ? gt.textContent.trim() : 'Si vas' } );
		}

		if ( ! aside || chapters.length < 2 ) {
			return;
		}

		var nav = document.createElement( 'nav' );
		nav.className = 'kv2-toc';
		nav.setAttribute( 'aria-label', 'Capítulos' );
		nav.innerHTML = '<span class="kv2-label kv2-toc__title">Capítulos</span>';
		var links = chapters.map( function ( c, i ) {
			var a = document.createElement( 'a' );
			a.href = '#' + c.el.id;
			a.setAttribute( 'data-n', pad( i + 1 ) );
			var span = document.createElement( 'span' );
			span.textContent = c.label;
			a.appendChild( span );
			nav.appendChild( a );
			return a;
		} );
		aside.appendChild( nav );

		// Activo: el último capítulo cuyo encabezado ha cruzado el 40 % de la ventana.
		var current = -1;
		var update = function () {
			var a = 0;
			chapters.forEach( function ( c, i ) {
				if ( c.el.getBoundingClientRect().top < window.innerHeight * 0.4 ) {
					a = i;
				}
			} );
			if ( a !== current ) {
				current = a;
				links.forEach( function ( l, i ) {
					l.setAttribute( 'aria-current', i === a ? 'true' : 'false' );
				} );
			}
		};
		window.addEventListener( 'scroll', update, { passive: true } );
		window.addEventListener( 'resize', update );
		update();
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
