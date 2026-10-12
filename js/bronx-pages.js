/* Royal Roofing Bronx: page scripts for bronx-blog.html and bronx-faqs.html.
   Loads after js/bronx.js; each block only runs when its markup is present. */
(function () {
  'use strict';
  function toArray(list) { return Array.prototype.slice.call(list); }

  /* ---------- Blog: topic chips ----------
     "All": newest post in the featured block, two more in "Also new", the
     rest in the grid. A topic: the featured block hides and the grid shows
     that topic's posts plus the "Have a question?" card, so rows stay full. */
  var chips = toArray(document.querySelectorAll('.bxb-chip[data-filter]'));
  var grid = document.querySelector('[data-blog-grid]');
  if (chips.length && grid) {
    var cards = toArray(grid.querySelectorAll('.bxb-card'));
    var featured = document.querySelector('[data-featured-section]');
    var count = document.querySelector('[data-blog-count]');
    var gridTitle = document.querySelector('[data-grid-title]');
    var gridKicker = document.querySelector('[data-grid-kicker]');
    var defaults = { title: gridTitle ? gridTitle.textContent : '', kicker: gridKicker ? gridKicker.textContent : '' };
    var total = cards.filter(function (c) { return !c.hasAttribute('data-ask'); }).length;

    function applyFilter(topic, label) {
      var all = topic === 'all', shown = 0;
      chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === topic)); });
      if (featured) featured.hidden = !all;
      cards.forEach(function (card) {
        var visible;
        if (card.hasAttribute('data-ask')) visible = !all;
        else if (card.hasAttribute('data-in-featured')) visible = !all && card.getAttribute('data-topic') === topic;
        else visible = all || card.getAttribute('data-topic') === topic;
        card.hidden = !visible;
        if (visible && !card.hasAttribute('data-ask')) shown++;
      });
      if (gridTitle) gridTitle.textContent = all ? defaults.title : label;
      if (gridKicker) gridKicker.textContent = all ? defaults.kicker : 'Topic';
      if (count) count.textContent = all ? 'Showing all ' + total + ' articles' : 'Showing ' + shown + (shown === 1 ? ' article' : ' articles') + ' in ' + label;
      grid.scrollLeft = 0;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter'), chip.getAttribute('data-label') || ''); });
    });
  }

  /* ---------- FAQ: live search ---------- */
  var search = document.getElementById('faq-search');
  var groups = toArray(document.querySelectorAll('.bxq-group'));
  var indexLinks = toArray(document.querySelectorAll('.bxq-index a[href^="#"]'));
  function linkFor(group) { return indexLinks.filter(function (a) { return a.getAttribute('href') === '#' + group.id; })[0]; }

  if (search && groups.length) {
    var status = document.querySelector('[data-faq-status]');
    var empty = document.querySelector('[data-faq-empty]');
    var quick = toArray(document.querySelectorAll('[data-faq-term]'));
    var defaultStatus = status ? status.textContent : '';
    var timer;
    function norm(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
    // Highlight matches in the question and answer text (links stay intact).
    function unmark(root) {
      root.querySelectorAll('mark').forEach(function (m) { m.replaceWith(document.createTextNode(m.textContent)); });
      root.normalize();
    }
    function mark(root, q) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var i = node.nodeValue.toLowerCase().indexOf(q);
        while (i !== -1) {
          var hit = node.splitText(i), rest = hit.splitText(q.length), m = document.createElement('mark');
          hit.parentNode.replaceChild(m, hit); m.appendChild(hit);
          node = rest; i = node.nodeValue.toLowerCase().indexOf(q);
        }
      });
    }
    function runSearch() {
      var raw = search.value.trim(), q = norm(raw), matches = 0, firstOpened = false;
      groups.forEach(function (group) {
        var inGroup = 0;
        group.querySelectorAll('details').forEach(function (d) {
          var hit = !q || norm(d.textContent).indexOf(q) !== -1;
          d.hidden = !hit;
          // Open the first match on the page so the answer is visible at once.
          d.open = !!q && hit && !firstOpened;
          if (q && hit) firstOpened = true;
          unmark(d);
          if (q && hit) mark(d, q);
          if (hit) inGroup++;
        });
        group.hidden = inGroup === 0;
        matches += inGroup;
        var label = inGroup + (inGroup === 1 ? ' question' : ' questions');
        var c = group.querySelector('[data-group-count]');
        if (c) c.textContent = label;
        var link = linkFor(group);
        if (link) {
          link.parentNode.classList.toggle('is-empty', inGroup === 0);
          var lc = link.querySelector('[data-index-count]');
          if (lc) lc.textContent = label;
        }
      });
      if (empty) empty.hidden = matches !== 0;
      quick.forEach(function (b) { b.setAttribute('aria-pressed', String(!!q && norm(b.getAttribute('data-faq-term')) === q)); });
      if (status) {
        status.textContent = !q ? defaultStatus
          : matches === 0 ? 'No questions match “' + raw + '”'
          : matches + (matches === 1 ? ' question matches' : ' questions match') + ' “' + raw + '”';
      }
      if (typeof updateActive === 'function') updateActive();
    }
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(runSearch, 120); });
    search.addEventListener('search', runSearch);
    quick.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var term = b.getAttribute('data-faq-term');
        search.value = b.getAttribute('aria-pressed') === 'true' ? '' : term;
        runSearch();
        var first = document.querySelector('.bxq-group:not([hidden])');
        if (search.value && first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    var clear = document.querySelector('[data-faq-clear]');
    if (clear) clear.addEventListener('click', function () { search.value = ''; runSearch(); search.focus(); });
  }

  /* ---------- FAQ: the numbered index follows the reader ---------- */
  var index = document.querySelector('.bxq-index');
  var updateActive;
  if (index && groups.length) {
    var activeId = null;
    var setActive = function (id) {
      if (id === activeId) return;
      activeId = id;
      indexLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          // Small screens: keep the active tab in view inside the scroller.
          var list = a.closest('.bxq-index__list');
          if (list && list.scrollWidth > list.clientWidth) list.scrollTo({ left: a.parentNode.offsetLeft - 20, behavior: 'smooth' });
        } else {
          a.removeAttribute('aria-current');
        }
      });
    };
    // Active topic = the last visible group whose top has passed just below the index bar.
    var ticking = false;
    updateActive = function () {
      ticking = false;
      var line = index.getBoundingClientRect().bottom + 40, current = null;
      var visible = groups.filter(function (g) { return !g.hidden; });
      visible.forEach(function (g) { if (g.getBoundingClientRect().top <= line) current = g.id; });
      if (!current && visible[0]) current = visible[0].id;
      if (current) setActive(current);
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } }, { passive: true });
    window.addEventListener('resize', updateActive);
    indexLinks.forEach(function (a) { a.addEventListener('click', function () { setActive(a.getAttribute('href').slice(1)); }); });
    updateActive();
  }
})();
