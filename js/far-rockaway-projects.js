/* Royal Roofing & Siding Far Rockaway: far-rockaway-projects.html.
   Carried over from js/brooklyn-projects.js. Loads after js/far-rockaway.js: service filter
   for the project grid and the project lightbox (a native <dialog>, so Esc closes it and focus stays inside). */
(function () {
  'use strict';

  var grid = document.querySelector('[data-project-grid]');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.frp-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.frp-chip[data-filter]'));
  var count = document.querySelector('[data-project-count]');

  function visibleCards() { return cards.filter(function (c) { return !c.hidden; }); }

  /* ---------- Service filter ---------- */
  function applyFilter(service) {
    var shown = 0;
    chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === service)); });
    cards.forEach(function (card) {
      var on = service === 'all' || card.getAttribute('data-service') === service;
      card.hidden = !on;
      if (on) shown++;
    });
    if (count) count.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
    grid.scrollLeft = 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('project-lightbox');
  if (!lb) return;
  var q = function (sel) { return lb.querySelector(sel); };
  var el = {
    img: q('[data-lb-img]'), service: q('[data-lb-service]'), serviceText: q('[data-lb-service-text]'),
    title: q('[data-lb-title]'), loc: q('[data-lb-loc]'), building: q('[data-lb-building]'),
    system: q('[data-lb-system]'), scope: q('[data-lb-scope]'), count: q('[data-lb-count]'),
    prev: q('[data-lb-prev]'), next: q('[data-lb-next]'), close: q('[data-lb-close]')
  };
  var list = [], index = 0, opener = null;
  var text = function (card, sel) { var n = card.querySelector(sel); return n ? n.textContent.trim() : ''; };

  function render() {
    var card = list[index];
    var img = card.querySelector('.frp-card__media img');
    el.img.src = img.currentSrc || img.src;
    el.img.alt = img.alt;
    el.service.textContent = el.serviceText.textContent = text(card, '.frp-tag');
    el.title.textContent = text(card, '.frp-card__title');
    el.loc.textContent = text(card, '.frp-card__loc span');
    el.building.textContent = text(card, '[data-building]');
    el.system.textContent = text(card, '[data-system]');
    el.scope.textContent = text(card, '.frp-card__scope');
    el.count.textContent = 'Project ' + (index + 1) + ' of ' + list.length;
    el.prev.hidden = el.next.hidden = list.length < 2;
  }

  function open(card) {
    list = visibleCards();
    index = Math.max(0, list.indexOf(card));
    opener = card.querySelector('.frp-card__open');
    render();
    document.documentElement.classList.add('frp-lock');
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    el.close.focus();
  }
  function close() {
    if (typeof lb.close === 'function' && lb.open) lb.close(); else { lb.removeAttribute('open'); onClosed(); }
  }
  function onClosed() {
    document.documentElement.classList.remove('frp-lock');
    // Return focus to the card that is now showing (the reader may have paged through).
    var target = list[index] && !list[index].hidden ? list[index].querySelector('.frp-card__open') : opener;
    if (target) {
      target.focus({ preventScroll: true });
      var r = list[index].getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) list[index].scrollIntoView({ block: 'center' });
      if (grid.scrollWidth > grid.clientWidth) grid.scrollTo({ left: list[index].offsetLeft - grid.offsetLeft - parseFloat(getComputedStyle(grid).paddingLeft || 0) });
    }
  }
  function step(d) {
    if (list.length < 2) return;
    index = (index + d + list.length) % list.length;
    render();
  }

  cards.forEach(function (card) {
    var btn = card.querySelector('.frp-card__open');
    if (btn) btn.addEventListener('click', function () { open(card); });
  });
  el.prev.addEventListener('click', function () { step(-1); });
  el.next.addEventListener('click', function () { step(1); });
  el.close.addEventListener('click', close);
  lb.addEventListener('close', onClosed);
  // Click on the dimmed backdrop (the dialog box itself, outside its content) closes.
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Escape' && typeof lb.showModal !== 'function') close();
  });

  // Swipe between projects inside the lightbox on touch screens.
  var sx = null;
  q('.frp-lb__stage').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  q('.frp-lb__stage').addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });
})();
