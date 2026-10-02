/* Royal Renovators Inc. — queens.html */
(function () {
  'use strict';
  var PHONE = '(718) 414-6067';
  var header = document.querySelector('.header');
  var menuButton = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  var desktop = window.matchMedia('(min-width: 88.01rem)');

  /* ---------- Header surface follows scroll ---------- */
  if (header) {
    var syncHeader = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- Hero photo carousel ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero__slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero__dot'));
    if (slides.length && slides.length === dots.length) {
      var currentSlide = 0, slideTimer = null, heroHovered = false;
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      var showSlide = function (index) {
        currentSlide = index;
        slides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === index); });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
          dot.setAttribute('aria-pressed', String(i === index));
        });
      };
      var stopSlides = function () { if (slideTimer) { window.clearInterval(slideTimer); slideTimer = null; } };
      var startSlides = function () {
        stopSlides();
        if (reducedMotion.matches || document.hidden || heroHovered || hero.contains(document.activeElement)) return;
        slideTimer = window.setInterval(function () { showSlide((currentSlide + 1) % slides.length); }, 6000);
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () { showSlide(index); startSlides(); });
      });
      hero.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'mouse') { heroHovered = true; stopSlides(); }
      });
      hero.addEventListener('pointerleave', function (event) {
        if (event.pointerType === 'mouse') { heroHovered = false; startSlides(); }
      });
      hero.addEventListener('focusin', stopSlides);
      hero.addEventListener('focusout', function (event) {
        if (!hero.contains(event.relatedTarget)) startSlides();
      });
      document.addEventListener('visibilitychange', startSlides);
      if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', startSlides);
      else reducedMotion.addListener(startSlides);
      startSlides();
    }
  }

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

  /* ---------- Projects slider ---------- */
  (function () {
    var track = document.querySelector('[data-projects-track]');
    var prev = document.querySelector('[data-projects-prev]');
    var next = document.querySelector('[data-projects-next]');
    if (!track || !prev || !next) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var anim = null, settle = null;

    function step() {
      var card = track.firstElementChild;
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      /* 1px of slack keeps the ends reliable on fractional layouts. */
      prev.disabled = x <= 1;
      next.disabled = x >= max - 1;
    }
    /* Native smooth scrolling is unreliable on nested scrollers in some
       browsers, so the tween is done here and the end state is always exact. */
    function glide(to) {
      var max = track.scrollWidth - track.clientWidth;
      var target = Math.max(0, Math.min(to, max));
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      if (reduce.matches) { track.scrollLeft = target; sync(); return; }
      var from = track.scrollLeft;
      var delta = target - from;
      if (!delta) { sync(); return; }
      var t0 = performance.now(), dur = 420;
      (function frame(now) {
        var p = Math.min((now - t0) / dur, 1);
        /* easeOutCubic */
        var e = 1 - Math.pow(1 - p, 3);
        track.scrollLeft = from + delta * e;
        sync();
        if (p < 1) anim = requestAnimationFrame(frame); else anim = null;
      })(t0);
      /* Animation frames are paused while a tab is hidden or unpainted, so the
         end position is committed on a timer too. */
      window.clearTimeout(settle);
      settle = window.setTimeout(function () {
        if (anim) { cancelAnimationFrame(anim); anim = null; }
        track.scrollLeft = target;
        sync();
      }, dur + 90);
    }
    prev.addEventListener('click', function () { glide(track.scrollLeft - step()); });
    next.addEventListener('click', function () { glide(track.scrollLeft + step()); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    /* Keyboard focus inside the track scrolls it, so keep the buttons honest. */
    track.addEventListener('focusin', function () { window.setTimeout(sync, 60); });
    sync();
  })();

  /* ---------- Placeholder links (pages not built yet) ---------- */
  document.querySelectorAll('a[href="#"][data-href]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
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
      var name = form.querySelector('[name="name"]'), phone = form.querySelector('[name="phone"]'), address = form.querySelector('[name="address"]');
      if (name && name.value.trim().length < 2) { setError(name, 'Enter your full name.'); ok = false; first = first || name; }
      if (phone) { var digits = phone.value.replace(/\D/g, ''); if (digits.length < 10 || digits.length > 11) { setError(phone, 'Enter a valid phone number.'); ok = false; first = first || phone; } }
      if (address && address.value.trim().length < 4) { setError(address, 'Enter the property address.'); ok = false; first = first || address; }
      if (!ok) { if (first) first.focus(); return; }
      var notice = form.querySelector('.form-thanks');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'form-thanks'; notice.setAttribute('role', 'status'); notice.setAttribute('tabindex', '-1');
        form.appendChild(notice);
      }
      notice.innerHTML = '<strong>Online requests are not available yet.</strong><p>Your details have not been sent. Please call <a href="tel:+17184146067">' + PHONE + '</a> to discuss your project.</p>';
      notice.focus();
    });
  });

})();
