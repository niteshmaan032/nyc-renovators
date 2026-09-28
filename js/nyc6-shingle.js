/* Shingle page: on phones the Queens neighborhoods list shows five rows and
   a "Click to see more" button reveals the rest (call 23 Sep). The full list
   is always in the page; the stylesheet does the hiding. */
(function hoodsSeeMore() {
  var btn = document.querySelector('.sr-hoods__more');
  var list = document.getElementById('sr-hoods');
  if (!btn || !list) return;
  btn.addEventListener('click', function () {
    list.classList.remove('is-collapsed');
    btn.setAttribute('aria-expanded', 'true');
  });
}());
