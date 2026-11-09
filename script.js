/* ═══════════════════════════════════════════════════════════
   DECORTEP · script.js (JavaScript puro, sin librerías externas)
   Cargador · revelados · scroll con inercia · sección fija de la
   persiana · imagen que se abre · partículas · WhatsApp
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ───────────────────────────────────────────────────────────
     ÚNICO lugar donde vive el número de WhatsApp.
     10 dígitos con lada (el código de país 52 se agrega solo).
     Si se deja vacío: los botones y el envío de WhatsApp se ocultan.
     ─────────────────────────────────────────────────────────── */
  const WHATSAPP = '3781101292';
  const MSG_DEFAULT = 'Hola DECORTEP, quiero cotizar persianas a la medida.';

  document.documentElement.classList.add('js');
  window.__dtp = true; // avisa al seguro del <head> que este script sí arrancó

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ───────── WhatsApp ───────── */
  const waDigits = (() => {
    const d = String(WHATSAPP || '').replace(/\D/g, '');
    if (d.length === 10) return '52' + d;
    if (d.length >= 12) return d;
    return '';
  })();
  const WA_OK = waDigits !== '';
  const waUrl = (text) => `https://wa.me/${waDigits}?text=${encodeURIComponent(text || MSG_DEFAULT)}`;

  function setupWA() {
    const links = $$('[data-wa]');
    if (!WA_OK) {
      links.forEach((a) => { a.hidden = true; });
      const submit = $('[data-submit]');
      if (submit) submit.hidden = true;
      const note = $('[data-form-note]');
      if (note) note.textContent = 'Por ahora visítanos en Calle 2 de Abril 507, Tepatitlán, o llámanos al 378 110 1292.';
      return;
    }
    links.forEach((a) => {
      a.href = waUrl(a.dataset.waMsg);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ───────── Índices para escalonar animaciones CSS ───────── */
  function setupIndexes() {
    $$('.slats, .vanes').forEach((g) => Array.from(g.children).forEach((el, i) => el.style.setProperty('--i', i)));
    $$('[data-stagger]').forEach((p) => Array.from(p.children).forEach((c, i) => { c.classList.add('rv'); c.style.setProperty('--i', i); }));
  }

  /* ───────── Texto del manifiesto: palabra por palabra ───────── */
  let words = [];
  function setupWords() {
    const el = $('[data-words]');
    if (!el) return;
    const parts = el.textContent.trim().split(/\s+/);
    el.innerHTML = parts.map((w) => `<span class="w">${w}</span>`).join(' ');
    words = $$('.w', el);
  }

  /* ───────── Cargador: una persiana que se abre (≤ 2.1 s) ───────── */
  let readyDone = false;
  function ready() {
    if (readyDone) return;
    readyDone = true;
    root.classList.add('is-ready');
    startReveals();
    try { initParticles(); } catch (e) { /* decorativo */ }
    measure();
  }
  function setupLoader() {
    const L = $('#loader');
    if (!L) { ready(); return; }
    const cnt = $('[data-count]', L);
    const t0 = performance.now();
    const DUR = 1050;
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      if (cnt) cnt.textContent = '100';
      L.classList.add('is-open');
      setTimeout(ready, 260);
      setTimeout(() => { L.classList.add('is-gone'); }, 900);
    };
    const step = (now) => {
      const p = clamp((now - t0) / DUR);
      if (cnt) cnt.textContent = String(Math.round(smooth(0, 1, p) * 100));
      if (p < 1 && !opened) requestAnimationFrame(step); else open();
    };
    requestAnimationFrame(step);
    setTimeout(open, 1500); // seguro por si el navegador pausa requestAnimationFrame
  }

  /* ───────── Revelados al entrar en pantalla ───────── */
  function startReveals() {
    const items = $$('.rv, .rv-lines');
    if (reduce || !('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    items.forEach((i) => io.observe(i));
  }

  /* ───────── Encabezado, menú móvil y sección activa ───────── */
  function setupMenu() {
    const btn = $('.burger');
    const menu = $('#menu');
    if (!btn || !menu) return;
    const set = (open) => {
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', () => { if (innerWidth >= 1080) set(false); });
  }
  function setupSpy() {
    if (!('IntersectionObserver' in window)) return;
    const links = $$('.nav a');
    const map = new Map();
    links.forEach((a) => { const t = $(a.getAttribute('href')); if (t) map.set(t, a); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-active'));
        const a = map.get(e.target);
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => io.observe(sec));
  }

  /* ───────── Medidas de las secciones (para el scroll) ───────── */
  const M = {};
  let vh = innerHeight;
  let docH = 1;
  function abs(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function measure() {
    vh = innerHeight;
    docH = root.scrollHeight;
    [['story', '.story'], ['expand', '.expand'], ['tl', '[data-tl]'], ['manif', '[data-words]']].forEach(([k, sel]) => {
      const el = $(sel);
      if (el) M[k] = { el, top: abs(el), h: el.offsetHeight };
    });
  }

  /* ───────── Motor de scroll con inercia ("slow motion") ───────── */
  const trackers = [];
  function track(getTarget, apply, ease) {
    trackers.push({ get: getTarget, apply, ease: ease || 0.1, cur: null, last: null });
  }
  let lastY = window.scrollY;
  function loop() {
    const y = window.scrollY;
    for (const t of trackers) {
      const target = t.get(y);
      if (t.cur === null) t.cur = target;
      t.cur += (target - t.cur) * (reduce ? 1 : t.ease);
      if (Math.abs(target - t.cur) < 0.0004) t.cur = target;
      if (t.cur !== t.last) { t.apply(t.cur); t.last = t.cur; }
    }
    requestAnimationFrame(loop);
  }

  function setupScroll() {
    const hdr = $('.hdr');
    const hero = $('.hero');

    /* barra de progreso + encabezado */
    track((y) => clamp(y / Math.max(1, docH - vh)), (v) => root.style.setProperty('--sp', v.toFixed(4)), 0.2);
    track((y) => (y > 30 ? 1 : 0), (v) => { if (hdr) hdr.classList.toggle('is-stuck', v > 0.5); }, 1);

    /* hero: parallax suave */
    if (hero) track((y) => clamp(y / (vh * 0.9)), (v) => hero.style.setProperty('--hs', v.toFixed(4)), 0.12);

    /* marquesina: se inclina con la velocidad del scroll */
    const rows = $$('.marquee__row');
    if (rows.length && !reduce) {
      track(() => { const v = window.scrollY - lastY; lastY = window.scrollY; return clamp(v * 0.12, -6, 6); },
        (v) => rows.forEach((r) => r.style.setProperty('--sk', v.toFixed(2))), 0.08);
    }

    /* manifiesto: las palabras se encienden */
    if (words.length) {
      let on = 0;
      track((y) => { const m = M.manif; return m ? clamp((y + vh * 0.78 - m.top) / (m.h + vh * 0.3)) : 1; }, (p) => {
        const n = Math.round(p * words.length);
        if (n === on) return;
        for (let i = Math.min(n, on); i < Math.max(n, on); i++) words[i].classList.toggle('is-on', i < n);
        on = n;
      }, 0.14);
    }

    /* sección fija: la persiana responde al scroll */
    const story = $('.story');
    if (story) {
      const steps = $$('.step', story);
      const tag = $('[data-tag]', story);
      let cur = -1;
      track((y) => { const m = M.story; return m ? clamp((y - m.top) / Math.max(1, m.h - vh)) : 0; }, (p) => {
        story.style.setProperty('--r', (82 * Math.pow(1 - p, 1.15)).toFixed(2));
        story.style.setProperty('--night', smooth(0.58, 0.95, p).toFixed(3));
        story.style.setProperty('--sp', p.toFixed(4));
        const idx = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        if (idx !== cur && steps[idx]) {
          cur = idx;
          steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
          if (tag) tag.textContent = steps[idx].dataset.label || '';
        }
      }, 0.1);
    }

    /* imagen que se abre a pantalla completa */
    const expand = $('.expand');
    if (expand) {
      track((y) => { const m = M.expand; return m ? clamp((y - m.top) / Math.max(1, m.h - vh)) : 0; }, (p) => {
        const ex = smooth(0, 0.62, p);
        const ec = smooth(0.5, 0.82, p);
        expand.style.setProperty('--ex', ex.toFixed(4));
        expand.style.setProperty('--ec', ec.toFixed(4));
        expand.classList.toggle('is-copy', ec > 0.6);
      }, 0.1);
    }

    /* línea de tiempo del proceso */
    const tl = $('[data-tl]');
    if (tl) {
      track((y) => { const m = M.tl; return m ? clamp((y + vh * 0.62 - m.top) / m.h) : 1; }, (p) => tl.style.setProperty('--tp', p.toFixed(4)), 0.12);
      const items = $$('.tl__item', tl);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-on'); }),
          { rootMargin: '0px 0px -38% 0px' });
        items.forEach((i) => io.observe(i));
      } else items.forEach((i) => i.classList.add('is-on'));
    }

    measure();
    window.addEventListener('resize', () => requestAnimationFrame(measure));
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(measure)).observe(document.body);
    requestAnimationFrame(loop);
  }

  /* ───────── Partículas doradas con constelación (hero) ───────── */
  function initParticles() {
    const cv = $('.hero__fx');
    const hero = $('.hero');
    if (!cv || !hero || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, raf = 0, run = false;
    const ps = [];
    const mouse = { x: -9999, y: -9999 };
    const mk = () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.7 + 0.5, vx: (Math.random() - 0.5) * 0.18, vy: -(Math.random() * 0.28 + 0.06), t: Math.random() * 6.28, s: Math.random() * 0.02 + 0.006 });
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = innerWidth < 700 ? 26 : 58;
      while (ps.length < n) ps.push(mk());
      ps.length = n;
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.t += p.s; p.x += p.vx + Math.sin(p.t) * 0.12; p.y += p.vy;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (1 - d2 / 14000) * 1.6, d = Math.sqrt(d2) || 1; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const a = 0.35 + 0.35 * Math.sin(p.t * 2);
        ctx.fillStyle = `rgba(246,221,147,${(a * 0.12).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
        ctx.fillStyle = `rgba(255,238,185,${(a + 0.2).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.strokeStyle = `rgba(231,190,98,${((1 - d / 12000) * 0.22).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    }
    function frame() { if (!run) return; draw(); raf = requestAnimationFrame(frame); }
    size();
    draw();
    if (reduce) return;
    window.addEventListener('resize', () => { size(); if (!run) draw(); });
    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        hero.style.setProperty('--mx', mouse.x + 'px');
        hero.style.setProperty('--my', mouse.y + 'px');
        const win = $('[data-tilt-win]', hero);
        if (win) {
          win.style.setProperty('--ry', ((e.clientX / innerWidth - 0.5) * 12).toFixed(2) + 'deg');
          win.style.setProperty('--rx', (-(e.clientY / innerHeight - 0.5) * 9).toFixed(2) + 'deg');
        }
      });
      hero.addEventListener('pointerleave', () => {
        mouse.x = mouse.y = -9999;
        const win = $('[data-tilt-win]', hero);
        if (win) { win.style.setProperty('--ry', '0deg'); win.style.setProperty('--rx', '0deg'); }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        run = es[0].isIntersecting;
        if (run) { cancelAnimationFrame(raf); frame(); }
      }).observe(hero);
    } else { run = true; frame(); }
  }

  /* ───────── Inclinación 3D de tarjetas y botones magnéticos ───────── */
  function setupTilt() {
    if (!finePointer || reduce) return;
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-(py - 0.5) * 9).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
    });
    $$('.btn--mag').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--bx', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'px');
        el.style.setProperty('--by', ((e.clientY - r.top) / r.height - 0.5) * 12 + 'px');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--bx', '0px'); el.style.setProperty('--by', '0px'); });
    });
  }

  /* ───────── Pausa lo que no se ve ───────── */
  function setupLive() {
    const els = $$('.card__viz, .win, .finder__prev');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-live')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)), { rootMargin: '80px' });
    els.forEach((e) => io.observe(e));
  }

  /* ───────── "Encuentra tu persiana ideal" ───────── */
  function setupFinder() {
    const box = $('.finder');
    if (!box) return;
    const prev = $('[data-prev]', box), title = $('[data-out-title]', box), text = $('[data-out-text]', box), cta = $('[data-finder-cta]', box);
    const ESTILOS = {
      screen: { viz: 'roller', n: 'Enrollable Screen', t: 'Suaviza el sol sin renunciar a la luz natural ni a la vista. Líneas limpias que suben y bajan con un solo gesto.' },
      blackout: { viz: 'roller', tone: 'dark', n: 'Enrollable Blackout', t: 'Bloquea la luz para dormir, ver una película o trabajar sin reflejos. Sencilla, limpia y práctica.' },
      zebra: { viz: 'zebra', n: 'Día y Noche', t: 'Alterna bandas translúcidas y opacas: luz suave de día y privacidad total cuando la necesitas, con un solo ajuste.' },
      vertical: { viz: 'vertical', n: 'Persiana Vertical', t: 'Pensada para ventanales y puertas amplias. Sus lamas giran para dirigir la luz justo donde la quieres.' },
      veneciana: { viz: 'veneciana', n: 'Persiana Veneciana', t: 'Lamas inclinables que dosifican la luz con un acabado clásico y elegante que nunca pasa de moda.' }
    };
    const ROOM = {
      Sala: 'Ideal para tu sala: el espacio donde más vive tu casa.',
      'Recámara': 'Pensada para tu recámara: descanso y calma a tu manera.',
      Cocina: 'Una opción práctica para el uso diario de tu cocina.',
      Oficina: 'Una buena aliada en tu oficina: luz agradable para trabajar a gusto.'
    };
    const PRI = { luz: 'dejar entrar la luz', privacidad: 'tener privacidad sin perder luz', oscuridad: 'lograr oscuridad total', lujo: 'un acabado de lujo' };
    const pick = (esp, pri) => (pri === 'luz' ? (esp === 'Sala' ? 'vertical' : 'screen') : pri === 'privacidad' ? 'zebra' : pri === 'oscuridad' ? 'blackout' : 'veneciana');
    const val = (name) => { const i = $(`input[name="${name}"]:checked`, box); return i ? i.value : ''; };
    function render() {
      const esp = val('espacio'), pri = val('prioridad');
      const f = ESTILOS[pick(esp, pri)];
      const src = $(`.card__viz[data-viz="${f.viz}"]`);
      if (src && prev) prev.innerHTML = src.innerHTML;
      if (prev) prev.dataset.tone = f.tone || '';
      if (title) title.textContent = f.n;
      if (text) text.textContent = f.t + ' ' + (ROOM[esp] || '');
      if (cta) {
        const msg = `Hola DECORTEP, quiero cotizar una persiana ${f.n} para mi ${esp.toLowerCase()}. Lo más importante para mí: ${PRI[pri]}.`;
        cta.dataset.waMsg = msg;
        if (WA_OK) cta.href = waUrl(msg);
      }
    }
    box.addEventListener('change', render);
    render();
  }

  /* ───────── Formulario → WhatsApp ───────── */
  function setupForm() {
    const form = $('#form');
    if (!form) return;
    const note = $('[data-form-note]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!WA_OK) return;
      const nombre = form.nombre.value.trim();
      const mensaje = form.mensaje.value.trim();
      let ok = true;
      [['nombre', nombre], ['mensaje', mensaje]].forEach(([n, v]) => {
        const f = form[n].closest('.field');
        if (f) f.classList.toggle('is-bad', !v);
        if (!v) ok = false;
      });
      if (!ok) { if (note) note.textContent = 'Cuéntanos tu nombre y qué necesitas para armar tu mensaje.'; return; }
      const medidas = form.medidas.value.trim();
      const msg = `Hola DECORTEP, soy ${nombre}. Me interesa: ${form.tipo.value}.` +
        (medidas ? ` Medidas aproximadas: ${medidas}.` : '') + ` ${mensaje}`;
      const a = document.createElement('a');
      a.href = waUrl(msg); a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      if (note) note.textContent = '¡Listo! Se abrió WhatsApp con tu mensaje. Solo falta enviarlo.';
    });
    form.addEventListener('input', (e) => { const f = e.target.closest('.field'); if (f) f.classList.remove('is-bad'); });
  }

  /* ───────── Arranque ───────── */
  function boot() {
    [setupIndexes, setupWA, setupWords, setupMenu, setupSpy, setupScroll, setupTilt, setupLive, setupFinder, setupForm, setupLoader]
      .forEach((fn) => { try { fn(); } catch (err) { console.error(fn.name, err); } });
  }
  try {
    boot();
  } catch (err) {
    console.error(err);
    root.classList.add('reveal-all');
    const L = $('#loader');
    if (L) L.classList.add('is-gone');
  }
})();
