/* Shingle page: on phones the Queens neighborhoods list shows five rows and
   a "Click to see more" button reveals the rest (call 23 Sep). The same
   button then collapses it again (4 Oct). The full list is always in the
   page; the stylesheet does the hiding. */
(function hoodsSeeMore() {
  var btn = document.querySelector('.sr-hoods__more');
  var list = document.getElementById('sr-hoods');
  if (!btn || !list) return;
  var label = btn.querySelector('.sr-hoods__more-label');
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    list.classList.toggle('is-collapsed', expanded);
    btn.setAttribute('aria-expanded', String(!expanded));
    if (label) label.textContent = expanded ? 'Click to see more' : 'Click to see less';
    /* Collapsing pulls the button up the page; keep it under the thumb. */
    if (expanded) btn.scrollIntoView({ block: 'nearest' });
  });
}());
