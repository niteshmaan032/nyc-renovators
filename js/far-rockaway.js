/* Royal Roofing & Siding Far Rockaway: shared behaviour for every far-rockaway*.html page.
   Carried over from js/brooklyn.js (header, dropdowns, mobile drawer, form validation). */
(function () {
  'use strict';
  var PHONE = '(718) 831-6489';
  var header = document.querySelector('.header');
  var menuButton = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  var desktop = window.matchMedia('(min-width: 88.01rem)');

  /* ---------- Header surface: solid white from the top (8 Oct client call) ---------- */
  if (header) header.classList.add('is-scrolled');

  /* Hero: one static background photo (Brooklyn hero). */

  /* ---------- Mobile drawer ---------- */
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    if (menuButton) { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); }
  }
  if (menuButton && drawer) {
    menuButton.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    drawer.querySelectorAll('.drawer__group').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  }

  /* ---------- Desktop dropdowns: hover + click + keyboard ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.nav__item.has-menu'));
  function setOpen(item, open) {
    var btn = item.querySelector('.nav__link'), panel = item.querySelector('.dropdown');
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }
  function closeAll(except) { items.forEach(function (it) { if (it !== except) setOpen(it, false); }); }
  items.forEach(function (item) {
    var btn = item.querySelector('.nav__link'), timer;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAll(item);
      setOpen(item, !open);
    });
    item.addEventListener('mouseenter', function () { clearTimeout(timer); closeAll(item); setOpen(item, true); });
    item.addEventListener('mouseleave', function () { timer = setTimeout(function () { setOpen(item, false); }, 140); });
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) setOpen(item, false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeDrawer(); } });
  document.addEventListener('click', function (e) { if (header && !header.contains(e.target)) { closeAll(); closeDrawer(); } });
  var onChange = function () { closeAll(); closeDrawer(); };
  if (desktop.addEventListener) desktop.addEventListener('change', onChange); else desktop.addListener(onChange);

  /* ---------- Placeholder links (pages not built yet) ---------- */
  document.querySelectorAll('a[href="#"][data-href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Read more toggles (text stays in the DOM for SEO) ---------- */
  document.querySelectorAll('[data-clamp-toggle]').forEach(function (btn) {
    var scope = btn.closest('.card__body, .editorial__inner > div, .section') || document;
    var box = scope.querySelector('[data-clamp]');
    if (!box) return;
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Read less' : 'Read more';
    });
  });

  /* ---------- Tabs (home building types): click, arrow keys, Home/End ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) {
        tab.focus();
        var list = tab.parentNode;
        if (list.scrollWidth > list.clientWidth) list.scrollLeft = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null, n = tabs.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % n];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + n) % n];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[n - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* ---------- Accordions: one item open at a time (fallback for <details name>) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('details'));
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d && o.open) o.open = false; });
      });
    });
  });

  /* ---------- Forms: inline validation + thank-you ---------- */
  function setError(field, msg) {
    var wrap = field.closest('.field'); if (!wrap) return;
    var err = wrap.querySelector('.field-error');
    if (!err) { err = document.createElement('span'); err.className = 'field-error'; err.setAttribute('role', 'alert'); wrap.appendChild(err); }
    err.textContent = msg; wrap.classList.add('has-error'); field.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    var wrap = field.closest('.field'); if (!wrap) return;
    var err = wrap.querySelector('.field-error'); if (err) err.remove();
    wrap.classList.remove('has-error'); field.removeAttribute('aria-invalid');
  }
  document.querySelectorAll('form.quote-card').forEach(function (form) {
    form.querySelectorAll('input,textarea').forEach(function (el) { el.addEventListener('input', function () { clearError(el); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      var name = form.querySelector('[name="name"]'), phone = form.querySelector('[name="phone"]'), email = form.querySelector('[name="email"]'), address = form.querySelector('[name="address"]');
      if (name && name.value.trim().length < 2) { setError(name, 'Enter your full name.'); ok = false; first = first || name; }
      if (phone) { var digits = phone.value.replace(/\D/g, ''); if (digits.length < 10 || digits.length > 11) { setError(phone, 'Enter a valid phone number.'); ok = false; first = first || phone; } }
      if (email && !email.checkValidity()) { setError(email, 'Enter a valid email address.'); ok = false; first = first || email; }
      if (address && address.value.trim().length < 4) { setError(address, 'Enter the property address.'); ok = false; first = first || address; }
      if (!ok) { if (first) first.focus(); return; }
      var notice = form.querySelector('.form-thanks');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'form-thanks'; notice.setAttribute('role', 'status'); notice.setAttribute('tabindex', '-1');
        form.appendChild(notice);
      }
      notice.innerHTML = '<strong>Online requests are not available yet.</strong><p>Your details have not been sent. Please call <a href="tel:+17188316489">' + PHONE + '</a> to discuss your project.</p>';
      notice.focus();
    });
  });

})();
