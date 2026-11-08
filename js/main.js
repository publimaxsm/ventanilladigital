/* Ventanilla Digital — Falcón · interacción (vanilla JS) */
(() => {
  'use strict';
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Cuestionario (Anexo A) ---------- */
  const caja = $('#cuestionario');
  if (caja && window.CUESTIONARIO) {
    window.CUESTIONARIO.forEach((sec, i) => {
      const d = document.createElement('details');
      d.className = 'revelar';
      if (i === 0) d.open = true;
      const qs = sec.q;
      d.innerHTML = `<summary><span class="mono">Sección ${sec.n}</span><h3>${sec.t}</h3><span class="rango">P${qs[0].n}–${qs[qs.length - 1].n}</span></summary>
        <ol>${qs.map(q => `<li><b>${String(q.n).padStart(2, '0')}</b><div><p>${q.t}</p>${q.o.length ? `<div class="opciones">${q.o.map(o => `<span>${o}</span>`).join('')}</div>` : ''}</div></li>`).join('')}</ol>`;
      caja.appendChild(d);
    });
  }

  /* ---------- Palabras para revelado progresivo ---------- */
  $$('[data-palabras]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="p">${w}</span>`).join(' ');
  });

  /* ---------- Revelado al entrar en pantalla ---------- */
  const revelables = $$('.revelar');
  if (reducir || !('IntersectionObserver' in window)) {
    revelables.forEach(el => el.classList.add('visto'));
  } else {
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (e.isIntersecting) {
          const hermanos = [...e.target.parentElement.children].filter(n => n.classList.contains('revelar'));
          const idx = Math.max(0, hermanos.indexOf(e.target));
          e.target.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
          e.target.classList.add('visto');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelables.forEach(el => io.observe(el));
  }

  /* ---------- Contadores ---------- */
  const contar = el => {
    const fin = +el.dataset.contar; if (reducir) { el.textContent = fin; return; }
    const t0 = performance.now(), dur = 1400;
    const paso = t => { const k = limitar((t - t0) / dur); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };
  if ('IntersectionObserver' in window) {
    const ioc = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { contar(e.target); ioc.unobserve(e.target); } }), { threshold: .6 });
    $$('[data-contar]').forEach(el => { el.textContent = reducir ? el.dataset.contar : '0'; ioc.observe(el); });
  }

  /* ---------- Divisores de fase ---------- */
  if ('IntersectionObserver' in window) {
    const iod = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('en-vista', e.isIntersecting)), { threshold: .25 });
    $$('.divisor').forEach(d => iod.observe(d));
  } else $$('.divisor').forEach(d => d.classList.add('en-vista'));

  /* ---------- Trazos SVG: medir largo ---------- */
  $$('.trazo').forEach(p => { try { p.style.setProperty('--largo', Math.ceil(p.getTotalLength())); } catch (_) {} });

  /* ---------- Menú móvil ---------- */
  const btn = $('.barra__menu'), menu = $('#menu-movil');
  if (btn && menu) {
    const cerrar = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menú'; document.body.style.overflow = ''; };
    btn.addEventListener('click', () => {
      const abrir = menu.hidden; menu.hidden = !abrir; btn.setAttribute('aria-expanded', String(abrir));
      btn.textContent = abrir ? 'Cerrar' : 'Menú'; document.body.style.overflow = abrir ? 'hidden' : '';
    });
    $$('a', menu).forEach(a => a.addEventListener('click', cerrar));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) cerrar(); });
  }

  /* ---------- Bucle de scroll ---------- */
  const barra = $('#barra'), progreso = $('.progreso span'), codigo = $('.riel__codigo em');
  const navLinks = $$('.barra__nav a'), puntos = $$('.riel li');
  const paralaje = $$('[data-velocidad]');
  const secciones = $$('[data-codigo]');
  const oscuras = $$('.seccion--oscura, .horizontal, .cierre, .divisor--oliva, .banda');
  const bandas = $$('.banda'), divisores = $$('.divisor');
  const horizontal = $('.horizontal'), pista = $('.horizontal__pista');
  const declaraciones = $$('[data-palabras]');
  const pasos = $('.pasos');
  const arbol = $('.arbol__ramas'), pez = $('.pez');
  const tel = $$('.telefono__linea li'), funciones = $$('.funciones li'), proto = $('#prototipo');
  let ultimoY = 0, pendiente = false;

  const ajustarHorizontal = () => {
    if (!horizontal || !pista || reducir) return;
    const sobra = pista.scrollWidth - window.innerWidth;
    horizontal.style.setProperty('--alto', `${Math.max(window.innerHeight * 1.2, sobra + window.innerHeight * 1.1)}px`);
  };

  const avance = el => { const r = el.getBoundingClientRect(); const vh = window.innerHeight; return limitar((vh - r.top) / (vh + r.height)); };
  const avanceEntrada = (el, inicio = .9, fin = .35) => { const r = el.getBoundingClientRect(); const vh = window.innerHeight; return limitar((inicio * vh - r.top) / ((inicio - fin) * vh)); };

  const marco = () => {
    pendiente = false;
    const y = window.scrollY, vh = window.innerHeight, doc = document.documentElement.scrollHeight - vh;
    if (progreso) progreso.style.transform = `scaleX(${doc > 0 ? y / doc : 0})`;

    if (barra) {
      barra.classList.toggle('con-fondo', y > 40);
      barra.classList.toggle('oculta', y > ultimoY && y > vh * .8 && menu && menu.hidden);
      const bajoBarra = oscuras.some(s => { const r = s.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; });
      barra.classList.toggle('sobre-oscuro', bajoBarra);
    }
    ultimoY = y;

    // sección y fase actuales
    let actual = null;
    for (const s of secciones) { const r = s.getBoundingClientRect(); if (r.top <= vh * .45) actual = s; else break; }
    if (actual) {
      if (codigo) codigo.textContent = actual.dataset.codigo;
      const fase = actual.dataset.fase || (actual.closest('[data-fase]') || {}).dataset?.fase || '';
      navLinks.forEach(a => a.classList.toggle('activo', a.dataset.fase === fase));
      puntos.forEach(p => p.classList.toggle('activo', p.dataset.fase === fase));
    }

    if (reducir) return;

    // bandas a sangre: el recorte se abre y el texto aparece
    bandas.forEach(b => {
      const r = b.getBoundingClientRect(); const recorrido = Math.max(1, b.offsetHeight - vh);
      const k = limitar((vh - r.top) / (vh + recorrido * .55));
      const marco = b.querySelector('.banda__marco');
      marco.style.setProperty('--k', k.toFixed(3));
      b.style.setProperty('--t', limitar((k - .6) / .3).toFixed(3));
    });

    // divisores: progreso dentro del tramo fijo
    divisores.forEach(d => {
      const r = d.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      d.style.setProperty('--k', limitar((vh - r.top) / (d.offsetHeight + vh)).toFixed(3));
    });

    paralaje.forEach(el => {
      if (el.classList.contains('mosaico__p')) { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.velocidad) * 2.2).toFixed(1)}px, 0)`; return; }
      const r = el.parentElement.getBoundingClientRect();
      const centro = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-centro * parseFloat(el.dataset.velocidad)).toFixed(1)}px, 0)`;
    });

    if (horizontal && pista) {
      const r = horizontal.getBoundingClientRect();
      const recorrido = horizontal.offsetHeight - vh;
      const k = limitar(-r.top / recorrido);
      pista.style.transform = `translate3d(${-(pista.scrollWidth - window.innerWidth) * k}px,0,0)`;
    }

    declaraciones.forEach(el => {
      const ps = el.querySelectorAll('.p'); const k = avanceEntrada(el, .85, .3);
      const n = Math.round(k * ps.length); ps.forEach((p, i) => p.classList.toggle('on', i < n));
    });

    if (pasos) pasos.style.setProperty('--avance', avanceEntrada(pasos, .85, .45).toFixed(3));
    if (arbol) arbol.querySelectorAll('.trazo').forEach(p => p.style.setProperty('--trazo', avanceEntrada(arbol, .85, .5).toFixed(3)));
    if (pez) {
      const k = avanceEntrada(pez, .9, .35);
      pez.querySelectorAll('.trazo').forEach((p, i) => p.style.setProperty('--trazo', limitar(k * 1.6 - i * .08).toFixed(3)));
    }

    if (proto && tel.length) {
      const k = avanceEntrada(proto, .7, -.2);
      const n = Math.round(k * tel.length);
      tel.forEach((li, i) => li.classList.toggle('on', i < n));
      funciones.forEach((li, i) => li.classList.toggle('activa', i === n - 1));
    }
  };

  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(marco); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', () => { ajustarHorizontal(); pedir(); });
  window.addEventListener('load', () => { ajustarHorizontal(); pedir(); });
  ajustarHorizontal(); marco();

  if (reducir) {
    $$('.trazo').forEach(p => p.style.setProperty('--trazo', 1));
    tel.forEach(li => li.classList.add('on'));
  }
})();
