/* Royal Roofing Yonkers: yonkers-blog.html topic filter (v1).
   Carried from the Brooklyn blog script (js/brooklyn-pages.js). Loads after
   js/yonkers.js and only runs when the blog markup is on the page. */
(function () {
  'use strict';
  var chips = Array.prototype.slice.call(document.querySelectorAll('.ykbl-chip[data-filter]'));
  var grid = document.querySelector('[data-blog-grid]');
  if (!chips.length || !grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.ykbl-card'));
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
})();
