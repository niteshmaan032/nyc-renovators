/* FAQs page — nyc5-faqs.html
   Two small behaviours on top of js/nyc5.js (which already animates the
   <details> accordions): a live search over the questions, and a scroll-spy
   that marks the topic in the side rail as the reader moves down the page. */
(function () {
  'use strict';

  var input = document.getElementById('faq-search');
  var status = document.getElementById('faq-status');
  var empty = document.getElementById('faq-empty');
  var groups = [].slice.call(document.querySelectorAll('.fq-group'));
  var links = [].slice.call(document.querySelectorAll('.fq-nav__link'));
  if (!input || !groups.length) return;

  /* Search ---------------------------------------------------------------- */

  var items = [].slice.call(document.querySelectorAll('.fq-group .faq')).map(function (el) {
    var q = el.querySelector('.faq__q');
    var chevron = q.querySelector('.faq__chevron');
    // The question text lives beside the chevron icon; keep the icon and
    // wrap the words in a span so highlighting never touches the markup.
    var label = document.createElement('span');
    label.className = 'faq__q-text';
    var nodes = [].slice.call(q.childNodes).filter(function (n) { return n !== chevron; });
    nodes.forEach(function (n) { label.appendChild(n); });
    q.insertBefore(label, chevron);
    return {
      el: el,
      group: el.closest('.fq-group'),
      label: label,
      original: label.textContent.trim(),
      text: (label.textContent + ' ' + el.querySelector('.faq__a').textContent).toLowerCase()
    };
  });

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(item, term) {
    if (!term) { item.label.textContent = item.original; return; }
    var re = new RegExp('(' + escapeRegExp(term) + ')', 'ig');
    var parts = item.original.split(re);
    item.label.textContent = '';
    parts.forEach(function (part) {
      if (!part) return;
      if (part.toLowerCase() === term.toLowerCase()) {
        var mark = document.createElement('mark');
        mark.className = 'fq-mark';
        mark.textContent = part;
        item.label.appendChild(mark);
      } else {
        item.label.appendChild(document.createTextNode(part));
      }
    });
  }

  function filter() {
    var term = input.value.trim().toLowerCase();
    var shown = 0;

    items.forEach(function (item) {
      var hit = !term || item.text.indexOf(term) !== -1;
      item.el.hidden = !hit;
      highlight(item, term);
      if (hit) shown += 1;
    });

    groups.forEach(function (g) {
      var visible = g.querySelector('.faq:not([hidden])');
      g.hidden = !visible;
    });

    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      a.parentNode.hidden = !!(target && target.hidden);
    });

    empty.hidden = shown !== 0;
    status.hidden = !term;
    status.textContent = term
      ? (shown === 1 ? '1 question matches' : shown + ' questions match') + ' “' + input.value.trim() + '”'
      : '';

    if (!term) setActive(null);
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(filter, 80);
  });
  input.addEventListener('search', filter);

  /* Scroll-spy ------------------------------------------------------------ */

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', !!id && a.getAttribute('href') === '#' + id);
    });
  }

  // The active topic is the last group whose top has passed a line 40% down
  // the viewport. Measured on scroll rather than observed, so a jump from
  // the rail lands on the right topic even when several groups move at once.
  var ticking = false;
  function spy() {
    ticking = false;
    if (input.value.trim()) return;
    var line = window.innerHeight * 0.4;
    var active = null;
    groups.forEach(function (g) {
      if (g.hidden) return;
      if (g.getBoundingClientRect().top <= line) active = g.id;
    });
    setActive(active);
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(spy);
  }, { passive: true });
  spy();

  // A tap on a chip marks it straight away, before the scroll settles.
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      setActive(a.getAttribute('href').slice(1));
    });
  });
}());
