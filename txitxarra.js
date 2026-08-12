/*! ==========================================================================
 *  txitxarra.js — imágenes, accesibilidad, datos estructurados y cookies
 *  Carga:  <script src=".../txitxarra.js?v=1"></script>   (SIN defer)
 *  No fija cookies. No depende de jQuery.
 *  v1.0 — agosto 2026
 * ========================================================================== */

(function () {
  'use strict';

  var ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  /* ------------------------------------------------------------------
     1. IMÁGENES
     14 imágenes en la home, ninguna con lazy ni dimensiones.
     ------------------------------------------------------------------ */
  function images() {
    var first = true;
    document.querySelectorAll('.venta img, .alquiler img, .promocion img').forEach(function (img) {
      if (first) { first = false; return; }          // la 1.ª entra en el LCP
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });

    // Los thumbs de Inmoweb son 585×335. Fijarlo elimina el salto de layout.
    document.querySelectorAll('img[src*="/thumb/585_335/"]').forEach(function (img) {
      if (!img.getAttribute('width')) { img.setAttribute('width', 585); img.setAttribute('height', 335); }
    });

    // alt = código de referencia ("PIS0422"). Lo reescribimos con algo legible.
    document.querySelectorAll('.venta, .alquiler').forEach(function (card) {
      var zona = card.querySelector('h3');
      var tipo = card.querySelector('.descripcionCaracteristicas h4 a');
      if (!zona && !tipo) return;
      var txt = [tipo && tipo.textContent.trim(), zona && zona.textContent.trim()]
        .filter(Boolean).join(', ');
      card.querySelectorAll('figure img').forEach(function (img) {
        if (txt) img.setAttribute('alt', txt);
      });
    });
  }

  /* ------------------------------------------------------------------
     2. ACCESIBILIDAD
     El documento no tiene ni un atributo ARIA y los 60+ disparadores
     de menú son <a> sin href: no reciben foco ni responden al teclado.
     ------------------------------------------------------------------ */
  function a11y() {
    // Landmark principal + salto de navegación
    var content = document.getElementById('content');
    if (content && !content.hasAttribute('role')) {
      content.setAttribute('role', 'main');
      content.id = content.id || 'content';
      var skip = document.createElement('a');
      skip.className = 'txx-skip';
      skip.href = '#content';
      skip.textContent = 'Ir al contenido';
      document.body.insertBefore(skip, document.body.firstChild);
    }

    var nav = document.querySelector('#navegacion nav');
    if (nav) nav.setAttribute('aria-label', 'Navegación principal');

    // Botones solo-icono
    var names = [
      ['#navToggle button', 'Abrir el menú'],
      ['#searchToggle button', 'Abrir el buscador'],
      ['#whatsapp_chat a', 'Escribir por WhatsApp al 607 742 247'],
      ['#toTop', 'Volver arriba'],
      ['.swiper-button-prev', 'Foto anterior'],
      ['.swiper-button-next', 'Foto siguiente']
    ];
    names.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) {
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', pair[1]);
      });
    });

    // Disparadores de desplegable: focusables y operables por teclado
    document.querySelectorAll('.dropDownMenu > a:not([href])').forEach(function (a) {
      a.setAttribute('tabindex', '0');
      a.setAttribute('role', 'button');
      a.setAttribute('aria-expanded', 'false');
      var sub = a.parentNode.querySelector('ul');
      if (sub) a.setAttribute('aria-haspopup', 'true');

      a.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var open = a.getAttribute('aria-expanded') === 'true';
          a.setAttribute('aria-expanded', String(!open));
          a.parentNode.classList.toggle('txx-open', !open);
        }
        if (e.key === 'Escape') {
          a.setAttribute('aria-expanded', 'false');
          a.parentNode.classList.remove('txx-open');
          a.blur();
        }
      });
    });

    // Newsletter: <input type="text"> sin label, sin nombre accesible
    var mail = document.getElementById('email_newsletter');
    if (mail) {
      mail.type = 'email';
      mail.setAttribute('autocomplete', 'email');
      mail.setAttribute('inputmode', 'email');
      mail.setAttribute('placeholder', 'nombre@correo.com');
      mail.id = 'email_newsletter';
      if (!document.querySelector('label[for="email_newsletter"]')) {
        var lab = document.createElement('label');
        lab.className = 'txx-label';
        lab.setAttribute('for', 'email_newsletter');
        lab.textContent = 'Tu correo electrónico';
        mail.parentNode.insertBefore(lab, mail);
      }
    }

    // Enlace de contacto rotulado con la frase de bienvenida entera
    document.querySelectorAll('a.masInfoContact').forEach(function (a) {
      if (a.textContent.trim().length > 30) {
        var icon = a.querySelector('i');
        a.textContent = '';
        if (icon) a.appendChild(icon);
        a.appendChild(document.createTextNode(' Contactar'));
      }
    });

    // Buscador: avisar de por qué el botón nace deshabilitado
    document.querySelectorAll('#buscador button[disabled]').forEach(function (b) {
      b.setAttribute('aria-describedby', 'txx-busq-ayuda');
    });
    var help = document.getElementById('openProperty');
    if (help && !document.getElementById('txx-busq-ayuda')) {
      var s = document.createElement('span');
      s.id = 'txx-busq-ayuda';
      s.className = 'txx-sr';
      s.textContent = 'Elige al menos un criterio para activar la búsqueda.';
      help.appendChild(s);
    }
  }

  /* ------------------------------------------------------------------
     3. CONTENEDORES VACÍOS
     Sin redes sociales configuradas, Inmoweb pinta igualmente el bloque:
     un icono de globo terráqueo seguido de nada.
     ------------------------------------------------------------------ */
  function vacios() {
    var vacio = function (el) { return !el || el.textContent.trim() === '' && !el.querySelector('li,a,img'); };

    document.querySelectorAll('ul.socialLinks').forEach(function (ul) {
      if (vacio(ul)) {
        ul.classList.add('txx-vacio');
        var wrap = ul.closest('div.socialLinks');           // arrastra el icono suelto
        if (wrap && !wrap.querySelector('li')) wrap.classList.add('txx-vacio');
      }
    });

    ['#accesosDirectos', '.home_section_parent'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (vacio(el)) el.classList.add('txx-vacio');
      });
    });
  }

  /* ------------------------------------------------------------------
     4. DATOS ESTRUCTURADOS
     Cero JSON-LD en todo el sitio. Se genera desde el DOM visible.
     ------------------------------------------------------------------ */
  function jsonld() {
    function add(obj) {
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }

    add({
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: 'Inmobiliaria Txitxarra',
      url: 'https://www.txitxarra.com/',
      image: 'https://storage.googleapis.com/static.inmoweb.es/clients/2658/logo/logo.png',
      telephone: ['+34944838066', '+34607742247'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Genaro Oraá, 6',
        postalCode: '48980',
        addressLocality: 'Santurtzi',
        addressRegion: 'Bizkaia',
        addressCountry: 'ES'
      },
      areaServed: {
        '@type': 'City',
        name: 'Santurtzi',
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Bizkaia' }
      },
      knowsLanguage: ['es', 'eu', 'en']
    });

    // Ficha de propiedad
    var h1 = document.querySelector('#detalle #ficha .headerLeft h1');
    if (!h1) return;
    var precio = document.querySelector('#detalle #ficha .headerRight .precio');
    var num = precio && precio.textContent.replace(/[^\d]/g, '');
    var foto = document.querySelector('#detalle #ficha img');

    var offer = { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'EUR' };
    if (num) offer.price = num;

    add({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: h1.textContent.trim(),
      image: foto ? foto.src : undefined,
      description: (document.querySelector('meta[name="description"]') || {}).content,
      offers: offer,
      seller: { '@type': 'RealEstateAgent', name: 'Inmobiliaria Txitxarra' }
    });
  }

  /* ------------------------------------------------------------------
     5. CANONICAL
     No hay ninguna en el sitio.
     ------------------------------------------------------------------ */
  function canonical() {
    if (document.querySelector('link[rel="canonical"]')) return;
    var l = document.createElement('link');
    l.rel = 'canonical';
    l.href = location.origin + location.pathname;
    document.head.appendChild(l);
  }

  /* ------------------------------------------------------------------
     6. AVISO DE COOKIES — botón "Rechazar todo"
     $.gdprcookie lee las etiquetas de los <li> de
     #wxp_cookie_warning_data div.content ul (el último ul).
     El texto del backoffice solo trae 2 <li>, por eso no sale el rechazo.
     Debe registrarse ANTES de que corra main.min.js: por eso va fuera
     de ready() y este fichero se carga sin defer.
     ------------------------------------------------------------------ */
  var stopCookies = new MutationObserver(function () {
    var box = document.getElementById('wxp_cookie_warning_data');
    if (!box) return;
    var uls = box.querySelectorAll('div.content ul');
    var btns = uls[uls.length - 1];
    if (btns && btns.querySelectorAll('li').length === 2) {
      var li = document.createElement('li');
      li.textContent = 'Rechazar todo';
      btns.appendChild(li);
    }
    stopCookies.disconnect();
  });
  stopCookies.observe(document.documentElement, { childList: true, subtree: true });

  ready(function () {
    try { images(); }     catch (e) { console.warn('[txx] images', e); }
    try { a11y(); }       catch (e) { console.warn('[txx] a11y', e); }
    try { vacios(); }     catch (e) { console.warn('[txx] vacios', e); }
    try { jsonld(); }     catch (e) { console.warn('[txx] jsonld', e); }
    try { canonical(); }  catch (e) { console.warn('[txx] canonical', e); }
  });
})();
