/* Royal Roofing & Siding Far Rockaway: topic chips for far-rockaway-blog.html.
   Carried over from js/manhattan-pages.js (Manhattan blog block). Loads after
   js/far-rockaway.js and only runs when its markup is present. */
(function () {
  'use strict';
  function toArray(list) { return Array.prototype.slice.call(list); }

  /* ---------- Blog: topic chips ----------
     "All": the lead story and "More stories" show on the front page, the
     other three posts fill the grid. A topic: the front page hides and the
     grid shows that topic's posts plus the "Have a question?" card, so the
     three-column row stays full. */
  var chips = toArray(document.querySelectorAll('.frmb-chip[data-filter]'));
  var grid = document.querySelector('[data-blog-grid]');
  if (chips.length && grid) {
    var posts = toArray(grid.querySelectorAll('.frmb-post'));
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
})();
