/* Royal Roofing & Siding Brooklyn — page scripts for brooklyn-blog.html and
   brooklyn-faqs.html. Loads after js/brooklyn.js; each block only runs when
   its markup is on the page. */
(function () {
  'use strict';

  /* ---------- Blog: topic filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.bkb-chip[data-filter]'));
  var grid = document.querySelector('[data-blog-grid]');
  if (chips.length && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.bkb-card'));
    var featured = document.querySelector('[data-featured-section]');
    var count = document.querySelector('[data-blog-count]');
    function applyFilter(topic) {
      var shown = 0;
      chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === topic)); });
      var all = topic === 'all';
      // "All": the newest post sits in the featured slot and the "Ask the team"
      // card closes the grid. A topic: every matching post shows in the grid.
      if (featured) featured.hidden = !all;
      cards.forEach(function (card) {
        var visible;
        if (card.hasAttribute('data-ask')) visible = all;
        else if (card.hasAttribute('data-featured')) visible = !all && card.getAttribute('data-topic') === topic;
        else visible = all || card.getAttribute('data-topic') === topic;
        card.hidden = !visible;
        if (visible && !card.hasAttribute('data-ask')) shown++;
      });
      if (all && featured) shown++;
      if (count) count.textContent = 'Showing ' + shown + (shown === 1 ? ' article' : ' articles');
      grid.scrollLeft = 0;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter')); });
    });
  }

  /* ---------- FAQ: live search ---------- */
  var search = document.getElementById('faq-search');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.bkq-group'));
  if (search && groups.length) {
    var status = document.querySelector('[data-faq-status]');
    var empty = document.querySelector('[data-faq-empty]');
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.bkq-rail a[href^="#"]'));
    var total = document.querySelectorAll('.bkq-group details').length;
    var defaultStatus = status ? status.textContent : '';
    var timer;
    function norm(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
    function runSearch() {
      var q = norm(search.value), matches = 0, groupsShown = 0;
      groups.forEach(function (group) {
        var inGroup = 0;
        group.querySelectorAll('details').forEach(function (d) {
          var hit = !q || norm(d.textContent).indexOf(q) !== -1;
          d.hidden = !hit;
          if (q) d.open = hit && inGroup === 0;
          if (hit) inGroup++;
        });
        group.hidden = inGroup === 0;
        matches += inGroup;
        if (inGroup) groupsShown++;
        var link = railLinks.filter(function (a) { return a.getAttribute('href') === '#' + group.id; })[0];
        if (link) {
          link.parentNode.classList.toggle('is-empty', inGroup === 0);
          var c = link.querySelector('.bkq-rail__count');
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
  var rail = document.querySelector('.bkq-rail');
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
          var list = a.closest('.bkq-rail__list');
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
