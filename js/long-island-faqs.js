/* Royal Roofing & Siding Long Island: long-island-faqs.html.
   Carried from js/brooklyn-pages.js (FAQ live search and the topic rail that
   follows the reader). Loads after js/long-island.js. */
(function () {
  'use strict';

  /* ---------- FAQ: live search ---------- */
  var search = document.getElementById('faq-search');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.liq-group'));
  if (search && groups.length) {
    var status = document.querySelector('[data-faq-status]');
    var empty = document.querySelector('[data-faq-empty]');
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.liq-rail a[href^="#"]'));
    var total = document.querySelectorAll('.liq-group details').length;
    var defaultStatus = status ? status.textContent : '';
    var timer;
    function norm(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
    function runSearch() {
      var q = norm(search.value), matches = 0, groupsShown = 0, firstOpened = false;
      groups.forEach(function (group) {
        var inGroup = 0;
        group.querySelectorAll('details').forEach(function (d) {
          var hit = !q || norm(d.textContent).indexOf(q) !== -1;
          d.hidden = !hit;
          // Exclusive accordion (Oct 19): only the first match on the page opens.
          if (q) { d.open = hit && !firstOpened; if (hit) firstOpened = true; }
          if (hit) inGroup++;
        });
        group.hidden = inGroup === 0;
        matches += inGroup;
        if (inGroup) groupsShown++;
        var link = railLinks.filter(function (a) { return a.getAttribute('href') === '#' + group.id; })[0];
        if (link) {
          link.parentNode.classList.toggle('is-empty', inGroup === 0);
          var c = link.querySelector('.liq-rail__count');
          if (c) c.textContent = inGroup;
        }
      });
      if (!q) groups.forEach(function (g) { g.querySelectorAll('details').forEach(function (d, i) { d.open = false; }); });
      if (empty) empty.hidden = matches !== 0;
      if (status) {
        status.textContent = !q ? defaultStatus
          : matches === 0 ? 'No questions match “' + search.value.trim() + '”'
          : matches + (matches === 1 ? ' question' : ' questions') + ' match “' + search.value.trim() + '”';
      }
    }
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(runSearch, 120); });
    search.addEventListener('search', runSearch);
    var clear = document.querySelector('[data-faq-clear]');
    if (clear) clear.addEventListener('click', function () { search.value = ''; runSearch(); search.focus(); });
    if (total && status && !defaultStatus) status.textContent = total + ' questions';
  }

  /* ---------- FAQ: topic rail follows the reader ---------- */
  var rail = document.querySelector('.liq-rail');
  if (rail && groups.length) {
    var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
    var activeId = null;
    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          // Mobile chips: keep the active topic in view inside the scroller.
          var list = a.closest('.liq-rail__list');
          if (list && list.scrollWidth > list.clientWidth) {
            list.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: 'smooth' });
          }
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }
    // Active topic = the last visible group whose heading has passed the line
    // just under the sticky header (and chip row on small screens).
    var ticking = false;
    function update() {
      ticking = false;
      var line = rail.getBoundingClientRect().bottom > 0 && window.matchMedia('(max-width: 60rem)').matches
        ? rail.getBoundingClientRect().bottom + 24 : window.innerHeight * 0.3;
      var current = null;
      groups.forEach(function (g) { if (!g.hidden && g.getBoundingClientRect().top <= line) current = g.id; });
      if (!current) { var first = groups.filter(function (g) { return !g.hidden; })[0]; current = first && first.id; }
      if (current) setActive(current);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    links.forEach(function (a) { a.addEventListener('click', function () { setActive(a.getAttribute('href').slice(1)); }); });
    update();
  }
})();
