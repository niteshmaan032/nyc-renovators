/* Royal Roofing & Siding Long Island: long-island-projects.html.
   Carried from js/bronx-projects.js. Loads after js/long-island.js: sidebar service filter (with per-service counts
   and a row-filler card so filtered rows stay complete) and the project
   lightbox (a native <dialog>, so Esc closes it and focus stays inside). */
(function () {
  'use strict';
  function toArray(list) { return Array.prototype.slice.call(list); }

  var grid = document.querySelector('[data-project-grid]');
  if (!grid) return;
  var cards = toArray(grid.querySelectorAll('.lip-card[data-service]'));
  var filler = grid.querySelector('[data-filler]');
  var chips = toArray(document.querySelectorAll('.lip-chip[data-filter]'));
  var count = document.querySelector('[data-project-count]');
  var featured = document.querySelector('[data-featured-project]');

  function visibleCards() { return cards.filter(function (c) { return !c.hidden; }); }

  /* ---------- Per-service counts on the chips ---------- */
  chips.forEach(function (chip) {
    var f = chip.getAttribute('data-filter');
    var n = f === 'all' ? cards.length : cards.filter(function (c) { return c.getAttribute('data-service') === f; }).length;
    var badge = chip.querySelector('.lip-chip__n');
    if (badge) badge.textContent = n;
  });

  /* ---------- Row filler: complete the last row when a filter leaves it short ---------- */
  function columns() {
    var cs = getComputedStyle(grid);
    if (cs.display !== 'grid') return 0;
    return cs.gridTemplateColumns.split(' ').filter(Boolean).length;
  }
  function fillRow() {
    if (!filler) return;
    var cols = columns(), shown = visibleCards().length, gap = cols ? (cols - (shown % cols)) % cols : 0;
    filler.hidden = gap === 0;
    filler.style.gridColumn = gap > 1 ? 'span ' + gap : '';
  }

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
    fillRow();
    grid.scrollLeft = 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); });
  });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(fillRow, 120); });
  fillRow();

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('project-lightbox');
  if (!lb) return;
  var q = function (sel) { return lb.querySelector(sel); };
  var el = {
    img: q('[data-lb-img]'), loc: q('[data-lb-loc]'), service: q('[data-lb-service]'),
    title: q('[data-lb-title]'), building: q('[data-lb-building]'), system: q('[data-lb-system]'),
    scope: q('[data-lb-scope]'), count: q('[data-lb-count]'),
    prev: q('[data-lb-prev]'), next: q('[data-lb-next]'), close: q('[data-lb-close]')
  };
  var list = [], index = 0, opener = null;
  var text = function (node, sel) { var n = node.querySelector(sel); return n ? n.textContent.trim() : ''; };

  function render() {
    var item = list[index];
    var img = item.querySelector('[data-p-img]');
    el.img.classList.toggle('is-top', img.classList.contains('lip-top'));
    el.img.src = img.currentSrc || img.src;
    el.img.alt = img.alt;
    el.loc.textContent = text(item, '[data-p-loc]');
    el.service.textContent = text(item, '[data-p-service]');
    el.title.textContent = text(item, '[data-p-title]');
    el.building.textContent = text(item, '[data-building]');
    el.system.textContent = text(item, '[data-system]');
    el.scope.textContent = text(item, '[data-p-scope]');
    el.count.textContent = 'Project ' + (index + 1) + ' of ' + list.length;
    el.prev.hidden = el.next.hidden = list.length < 2;
  }

  function open(item, trigger) {
    list = (featured ? [featured] : []).concat(visibleCards());
    index = Math.max(0, list.indexOf(item));
    opener = trigger;
    render();
    document.documentElement.classList.add('lip-lock');
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    el.close.focus();
  }
  function close() {
    if (typeof lb.close === 'function' && lb.open) lb.close(); else { lb.removeAttribute('open'); onClosed(); }
  }
  function onClosed() {
    document.documentElement.classList.remove('lip-lock');
    // Return focus to the project now showing (the reader may have paged through).
    var item = list[index];
    var target = item && item !== featured && !item.hidden ? item.querySelector('.lip-card__open') : opener;
    if (!target) return;
    target.focus({ preventScroll: true });
    var box = (item && item !== featured ? item : target).getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) (item !== featured ? item : target).scrollIntoView({ block: 'center' });
    if (item !== featured && grid.scrollWidth > grid.clientWidth) grid.scrollTo({ left: item.offsetLeft - grid.offsetLeft - parseFloat(getComputedStyle(grid).paddingLeft || 0) });
  }
  function step(d) {
    if (list.length < 2) return;
    index = (index + d + list.length) % list.length;
    render();
  }

  cards.forEach(function (card) {
    var btn = card.querySelector('.lip-card__open');
    if (btn) btn.addEventListener('click', function () { open(card, btn); });
  });
  if (featured) {
    toArray(document.querySelectorAll('[data-open-featured]')).forEach(function (btn) {
      btn.addEventListener('click', function () { open(featured, btn); });
    });
  }
  el.prev.addEventListener('click', function () { step(-1); });
  el.next.addEventListener('click', function () { step(1); });
  el.close.addEventListener('click', close);
  lb.addEventListener('close', onClosed);
  // A click on the dimmed backdrop (the dialog box itself, outside its content) closes.
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Escape' && typeof lb.showModal !== 'function') close();
  });

  // Swipe between projects inside the lightbox on touch screens.
  var stage = q('.lip-lb__stage'), sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });
})();
