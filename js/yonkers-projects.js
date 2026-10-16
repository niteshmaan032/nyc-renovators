/* Royal Roofing Yonkers: yonkers-projects.html.
   Loads after js/yonkers.js: service filter for the project grid and the
   project lightbox (a native <dialog>, so Esc closes it and focus stays inside).
   Every project (the lead spread and each card) is an .ykp-item holding
   [data-p-img] [data-p-service] [data-p-title] [data-p-loc] [data-p-building]
   [data-p-system] [data-p-scope] and an opener button [data-p-open]. */
(function () {
  'use strict';

  var grid = document.querySelector('[data-project-grid]');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.ykp-card'));
  var lead = document.querySelector('.ykp-lead .ykp-item');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.ykp-chip[data-filter]'));
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
  var text = function (item, key) { var n = item.querySelector('[data-p-' + key + ']'); return n ? n.textContent.trim() : ''; };

  function render() {
    var item = list[index];
    var img = item.querySelector('[data-p-img]');
    var crop = parseFloat(img.getAttribute('data-crop'));
    el.img.src = img.currentSrc || img.src;
    el.img.alt = img.alt;
    // Cropped photos keep the same crop here (top share of the height only).
    if (crop > 0 && crop < 1) {
      el.img.classList.add('is-cropped');
      el.img.style.aspectRatio = img.getAttribute('width') + ' / ' + (img.getAttribute('height') * crop).toFixed(1);
    } else {
      el.img.classList.remove('is-cropped');
      el.img.style.aspectRatio = '';
    }
    el.service.textContent = el.serviceText.textContent = text(item, 'service');
    el.title.textContent = text(item, 'title');
    el.loc.textContent = text(item, 'loc') + ', Yonkers';
    el.building.textContent = text(item, 'building');
    el.system.textContent = text(item, 'system');
    el.scope.textContent = text(item, 'scope');
    el.count.textContent = 'Project ' + (index + 1) + ' of ' + list.length;
    el.prev.hidden = el.next.hidden = list.length < 2;
  }

  function open(item, btn) {
    // The lead project leads the sequence; then the cards the filter shows.
    list = (lead ? [lead] : []).concat(visibleCards());
    index = Math.max(0, list.indexOf(item));
    opener = btn;
    render();
    document.documentElement.classList.add('ykp-lock');
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    el.close.focus();
  }
  function close() {
    if (typeof lb.close === 'function' && lb.open) lb.close(); else { lb.removeAttribute('open'); onClosed(); }
  }
  function onClosed() {
    document.documentElement.classList.remove('ykp-lock');
    // Return focus to the project now showing (the reader may have paged through).
    var item = list[index];
    var target = item && !item.hidden ? item.querySelector('[data-p-open]') : opener;
    if (!target) return;
    target.focus({ preventScroll: true });
    var r = item.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) item.scrollIntoView({ block: 'center' });
    if (item.parentNode === grid && grid.scrollWidth > grid.clientWidth) {
      grid.scrollTo({ left: item.offsetLeft - grid.offsetLeft - parseFloat(getComputedStyle(grid).paddingLeft || 0) });
    }
  }
  function step(d) {
    if (list.length < 2) return;
    index = (index + d + list.length) % list.length;
    render();
  }

  document.querySelectorAll('.ykp-item').forEach(function (item) {
    var btn = item.querySelector('[data-p-open]');
    if (btn) btn.addEventListener('click', function () { open(item, btn); });
  });
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
  var sx = null, stage = q('.ykp-lb__stage');
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });
})();
