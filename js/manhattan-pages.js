/* Royal Roofing & Siding NYC (Manhattan): page scripts for manhattan-blog.html
   and manhattan-faqs.html. Loads after js/manhattan.js; each block only runs
   when its markup is present. */
(function () {
  'use strict';
  function toArray(list) { return Array.prototype.slice.call(list); }

  /* ---------- Blog: topic chips ----------
     "All": the lead story and "More stories" show on the front page, the
     other three posts fill the grid. A topic: the front page hides and the
     grid shows that topic's posts plus the "Have a question?" card, so the
     three-column row stays full. */
  var chips = toArray(document.querySelectorAll('.mb-chip[data-filter]'));
  var grid = document.querySelector('[data-blog-grid]');
  if (chips.length && grid) {
    var posts = toArray(grid.querySelectorAll('.mb-post'));
    var front = document.querySelector('[data-featured-section]');
    var count = document.querySelector('[data-blog-count]');
    var gridTitle = document.querySelector('[data-grid-title]');
    var gridKicker = document.querySelector('[data-grid-kicker]');
    var defaults = { title: gridTitle ? gridTitle.textContent : '', kicker: gridKicker ? gridKicker.textContent : '' };
    var total = posts.filter(function (p) { return !p.hasAttribute('data-ask'); }).length;

    var applyFilter = function (topic, label) {
      var all = topic === 'all', shown = 0;
      chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === topic)); });
      if (front) front.hidden = !all;
      posts.forEach(function (post) {
        var visible;
        if (post.hasAttribute('data-ask')) visible = !all;
        else if (post.hasAttribute('data-in-featured')) visible = !all && post.getAttribute('data-topic') === topic;
        else visible = all || post.getAttribute('data-topic') === topic;
        post.hidden = !visible;
        if (visible && !post.hasAttribute('data-ask')) shown++;
      });
      if (gridTitle) gridTitle.textContent = all ? defaults.title : label;
      if (gridKicker) gridKicker.textContent = all ? defaults.kicker : 'Topic';
      if (count) count.textContent = all ? 'Showing all ' + total + ' articles' : 'Showing ' + shown + (shown === 1 ? ' article' : ' articles') + ' in ' + label;
      grid.scrollLeft = 0;
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { applyFilter(chip.getAttribute('data-filter'), chip.getAttribute('data-label') || ''); });
    });
  }

  /* ---------- FAQ: live search ---------- */
  var search = document.getElementById('faq-search');
  var groups = toArray(document.querySelectorAll('.mq-group'));
  var tocLinks = toArray(document.querySelectorAll('.mq-toc__link[href^="#"]'));
  function linkFor(group) { return tocLinks.filter(function (a) { return a.getAttribute('href') === '#' + group.id; })[0]; }

  if (search && groups.length) {
    var status = document.querySelector('[data-faq-status]');
    var empty = document.querySelector('[data-faq-empty]');
    var quick = toArray(document.querySelectorAll('[data-faq-term]'));
    var defaultStatus = status ? status.textContent : '';
    var timer;
    var norm = function (s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); };
    // Highlight matches in the question and answer text (links stay intact).
    var unmark = function (root) {
      root.querySelectorAll('mark').forEach(function (m) { m.replaceWith(document.createTextNode(m.textContent)); });
      root.normalize();
    };
    var mark = function (root, q) {
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
    };
    var runSearch = function () {
      var raw = search.value.trim(), q = norm(raw), matches = 0, firstOpened = false;
      groups.forEach(function (group) {
        var inGroup = 0;
        group.querySelectorAll('details').forEach(function (d) {
          var hit = !q || norm(d.textContent).indexOf(q) !== -1;
          d.hidden = !hit;
          // While searching, open the first match so its answer shows at once.
          if (q) d.open = hit && !firstOpened;
          if (q && hit) firstOpened = true;
          unmark(d);
          if (q && hit) mark(d, q);
          if (hit) inGroup++;
        });
        // Hide a question column that has no matches, so the other one moves left.
        group.querySelectorAll('.mh-faq').forEach(function (col) { col.hidden = !col.querySelector('details:not([hidden])'); });
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
    };
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(runSearch, 120); });
    search.addEventListener('search', runSearch);
    search.addEventListener('keydown', function (e) {
      // Enter jumps to the first matching topic.
      if (e.key !== 'Enter') return;
      e.preventDefault(); runSearch();
      var first = document.querySelector('.mq-group:not([hidden])');
      if (search.value && first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    quick.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var term = b.getAttribute('data-faq-term');
        search.value = b.getAttribute('aria-pressed') === 'true' ? '' : term;
        runSearch();
        var first = document.querySelector('.mq-group:not([hidden])');
        if (search.value && first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    var clear = document.querySelector('[data-faq-clear]');
    if (clear) clear.addEventListener('click', function () { search.value = ''; runSearch(); search.focus(); });
  }
})();
