/* ==========================================================================
   Royal Renovators Inc.
   Shared script — index.html, service.html
   ========================================================================== */

(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  /* Hold the hero video on a still frame when the visitor asks for less motion. */
  function respectMotionPreference() {
    var video = document.querySelector('.hero__video');
    if (!video) return;

    var query = window.matchMedia('(prefers-reduced-motion: reduce)');

    function apply() {
      if (query.matches) {
        video.removeAttribute('autoplay');
        video.pause();
      } else if (video.paused) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () { /* autoplay blocked — the still frame stands in */ });
        }
      }
    }

    apply();

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', apply);
    }
  }

  /* Shadow under the nav bar once the info bar has scrolled past it. */
  function watchScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var utility = header.querySelector('.utility-bar');
    var ticking = false;

    function update() {
      var threshold = utility ? utility.offsetHeight : 0;
      header.classList.toggle('is-scrolled', window.scrollY > threshold);
      ticking = false;
    }

    update();

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  /* Desktop mega menus: one open at a time, closable by Escape or outside click. */
  function initMegaMenus() {
    var triggers = Array.prototype.slice.call(
      document.querySelectorAll('.primary-nav__link[aria-controls]')
    );
    if (!triggers.length) return;

    var open = null;
    var hoverTimer = null;

    function close(trigger) {
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', 'false');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
      if (open === trigger) open = null;
    }

    function show(trigger) {
      if (open === trigger) return;
      close(open);
      trigger.setAttribute('aria-expanded', 'true');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
      open = trigger;
    }

    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var item = trigger.closest('.primary-nav__item');

      trigger.addEventListener('click', function () {
        if (trigger.getAttribute('aria-expanded') === 'true') close(trigger);
        else show(trigger);
      });

      /* Pointer users expect these to open on hover; keyboard and touch use click. */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        item.addEventListener('mouseenter', function () {
          window.clearTimeout(hoverTimer);
          show(trigger);
        });
        item.addEventListener('mouseleave', function () {
          hoverTimer = window.setTimeout(function () { close(trigger); }, 140);
        });
      }

      /* Tabbing out of the last link in a panel closes it. */
      panel.addEventListener('focusout', function (event) {
        if (!item.contains(event.relatedTarget)) close(trigger);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !open) return;
      var trigger = open;
      close(trigger);
      trigger.focus();
    });

    document.addEventListener('click', function (event) {
      if (open && !open.closest('.primary-nav__item').contains(event.target)) close(open);
    });
  }

  /* Mobile drawer with focus trap and scroll lock. */
  function initMobileNav() {
    var drawer = document.getElementById('mobile-nav');
    var toggle = document.querySelector('.nav-toggle');
    if (!drawer || !toggle) return;

    var panel = drawer.querySelector('.mobile-nav__panel');
    var closeBtn = drawer.querySelector('.mobile-nav__close');
    var lastFocused = null;
    /* Matches --dur-base; the drawer stays in the tree this long on the way out
       so the slide can finish before `hidden` removes it. */
    var DURATION = 280;
    var hideTimer = null;

    function open() {
      lastFocused = document.activeElement;
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      drawer.hidden = false;
      /* Force a reflow between unhiding and the class, or the browser has no
         start state to animate from and the panel simply appears. */
      void drawer.offsetWidth;
      drawer.classList.add('is-open');
      document.body.classList.add('is-locked');
      toggle.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }

    function close() {
      if (!drawer.classList.contains('is-open')) return;
      drawer.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      toggle.setAttribute('aria-expanded', 'false');
      if (lastFocused) lastFocused.focus();
      hideTimer = setTimeout(function () {
        drawer.hidden = true;
        hideTimer = null;
      }, DURATION);
    }

    toggle.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    /* Clicking the scrim closes; clicking inside the panel does not. */
    drawer.addEventListener('click', function (event) {
      if (!panel.contains(event.target)) close();
    });

    /* Following a link should take you there, not leave the drawer open. */
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) close();
    });

    drawer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;

      var items = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE))
        .filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /* Accordion groups inside the drawer. */
    drawer.querySelectorAll('.mobile-nav__group').forEach(function (group) {
      group.addEventListener('click', function () {
        var expanded = group.getAttribute('aria-expanded') === 'true';
        group.setAttribute('aria-expanded', String(!expanded));
        document.getElementById(group.getAttribute('aria-controls')).hidden = expanded;
      });
    });

    /* Leaving the mobile breakpoint with the drawer open would strand it. */
    var wide = window.matchMedia('(min-width: 84.01rem)');
    if (typeof wide.addEventListener === 'function') {
      wide.addEventListener('change', function (event) {
        if (event.matches) close();
      });
    }
  }

  /* Blog carousel (Swiper, loaded from CDN). If the library fails to arrive the
     slides simply stay in the flow as a row — the section still reads. */
  function initBlogSwiper() {
    var el = document.querySelector('.blog-swiper');
    if (!el || typeof window.Swiper !== 'function') return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    new window.Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 24,
      speed: reduced ? 0 : 450,
      navigation: {
        prevEl: '.blog__prev',
        nextEl: '.blog__next'
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  }

  /* Review carousel — same guard as the blog one. */
  function initReviewSwiper() {
    var el = document.querySelector('.reviews-swiper');
    if (!el || typeof window.Swiper !== 'function') return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    new window.Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 24,
      speed: reduced ? 0 : 450,
      navigation: {
        prevEl: '.reviews__prev',
        nextEl: '.reviews__next'
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  }

  /* FAQ accordion. The markup is native <details>, so the answers open without
     script; this layer adds the height animation and closes whichever other
     question was open. */
  function initFaqs() {
    var items = [].slice.call(document.querySelectorAll('.faq'));
    if (!items.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var DURATION = 280;
    var EASING = 'cubic-bezier(.22, .61, .36, 1)';

    function animate(panel, from, to, onDone) {
      if (reduced.matches || typeof panel.animate !== 'function') {
        if (onDone) onDone();
        return;
      }
      var run = panel.animate(
        [{ height: from, opacity: from === '0px' ? 0 : 1 },
         { height: to, opacity: to === '0px' ? 0 : 1 }],
        { duration: DURATION, easing: EASING }
      );
      run.onfinish = function () { if (onDone) onDone(); };
    }

    function collapse(item) {
      var panel = item.querySelector('.faq__a');
      animate(panel, panel.offsetHeight + 'px', '0px', function () {
        item.open = false;
      });
      if (reduced.matches) item.open = false;
    }

    function expand(item) {
      var panel = item.querySelector('.faq__a');
      item.open = true;
      animate(panel, '0px', panel.offsetHeight + 'px');
    }

    items.forEach(function (item) {
      item.querySelector('.faq__q').addEventListener('click', function (event) {
        /* Take over from the native toggle so the close can be animated. */
        event.preventDefault();

        if (item.open) { collapse(item); return; }

        items.forEach(function (other) {
          if (other !== item && other.open) collapse(other);
        });

        expand(item);
      });
    });
  }

  /* Hero video. Opens on click, plays with sound, and is paused and rewound on
     close so it never keeps running behind the page. */
  function initVideoBox() {
    var box = document.getElementById('videobox');
    var openers = [].slice.call(document.querySelectorAll('[data-video-open]'));
    if (!box || !openers.length) return;

    var video = box.querySelector('.videobox__video');
    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      box.hidden = false;
      document.body.classList.add('is-locked');

      video.muted = false;
      video.currentTime = 0;

      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        /* If the browser still refuses unmuted playback, fall back to muted
           rather than leaving a dead player on screen. */
        attempt.catch(function () {
          video.muted = true;
          video.play().catch(function () { /* controls are there either way */ });
        });
      }

      box.querySelector('.videobox__close').focus();
    }

    function close() {
      video.pause();
      video.currentTime = 0;
      box.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    }

    openers.forEach(function (button) {
      button.addEventListener('click', open);
    });

    box.querySelectorAll('[data-video-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    box.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;

      var items = [].slice.call(box.querySelectorAll(FOCUSABLE))
        .filter(function (el) { return el.offsetParent !== null; });
      if (items.length < 2) { event.preventDefault(); return; }

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* Gallery lightbox. Slides are built from the bento images at runtime, so the
     viewer always shows exactly what is on the page. Zoom comes from Swiper's
     own module — already loaded for the other carousels, so no extra library. */
  /* Tabbed project gallery.

     Roving tabindex: only the selected tab is reachable by Tab, and the arrow
     keys move between them — which is how the pattern is meant to behave and
     what stops four tabs from costing four Tab presses to get past. */
  function initProjectTabs() {
    var strip = document.querySelector('.projects__tabs');
    if (!strip) return;

    var tabs = [].slice.call(strip.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function panelOf(tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    }

    function select(tab, moveFocus) {
      tabs.forEach(function (other) {
        var isTarget = other === tab;
        var panel = panelOf(other);

        other.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        other.setAttribute('tabindex', isTarget ? '0' : '-1');
        other.classList.toggle('is-active', isTarget);
        if (panel) panel.hidden = !isTarget;
      });

      if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab); });
    });

    strip.addEventListener('keydown', function (event) {
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;

      var next = null;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;

      event.preventDefault();
      select(tabs[next], true);
    });
  }

  function initLightbox() {
    var box = document.getElementById('lightbox');
    var triggers = [].slice.call(document.querySelectorAll('.bento__trigger'));
    if (!box || !triggers.length || typeof window.Swiper !== 'function') return;

    var wrapper = box.querySelector('.swiper-wrapper');
    var caption = box.querySelector('[data-lightbox-caption]');
    var indexEl = box.querySelector('[data-lightbox-index]');
    var totalEl = box.querySelector('[data-lightbox-total]');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var lastFocused = null;
    var swiper = null;

    /* Rebuilt per open rather than once at start-up. The gallery is tabbed, so
       "all the triggers on the page" is the wrong set — the viewer should hold
       the panel the user is actually looking at, and nothing else. */
    var shots = [];

    function build(group) {
      shots = group.map(function (trigger) {
        var img = trigger.querySelector('img');
        return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
      });

      totalEl.textContent = shots.length;

      /* swiper-zoom-container is what the zoom module binds to. */
      wrapper.innerHTML = shots.map(function (shot) {
        return '<div class="swiper-slide">' +
                 '<div class="swiper-zoom-container">' +
                   '<img src="' + shot.src + '" alt="' + shot.alt + '">' +
                 '</div>' +
               '</div>';
      }).join('');

      if (swiper) swiper.update();
    }

    function sync() {
      if (!swiper || !shots[swiper.activeIndex]) return;
      indexEl.textContent = swiper.activeIndex + 1;
      caption.textContent = shots[swiper.activeIndex].alt;
    }

    /* Siblings of the clicked trigger — its panel if it is in one, the whole
       page if it is not, so this keeps working on any untabbed gallery. */
    function groupFor(trigger) {
      var scope = trigger.closest('.projects__panel') || document;
      return [].slice.call(scope.querySelectorAll('.bento__trigger'));
    }

    function open(trigger) {
      var group = groupFor(trigger);
      var index = group.indexOf(trigger);
      if (index < 0) index = 0;

      lastFocused = document.activeElement;
      build(group);

      box.hidden = false;
      document.body.classList.add('is-locked');

      if (!swiper) {
        swiper = new window.Swiper(box.querySelector('.lightbox__swiper'), {
          initialSlide: index,
          speed: reduced.matches ? 0 : 350,
          zoom: { maxRatio: 3 },
          keyboard: { enabled: true },
          navigation: {
            prevEl: '.lightbox__nav--prev',
            nextEl: '.lightbox__nav--next'
          },
          on: { slideChange: sync }
        });
      } else {
        swiper.slideTo(index, 0);
      }

      sync();
      box.querySelector('.lightbox__btn--close').focus();
    }

    function close() {
      if (swiper) swiper.zoom.out();
      box.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () { open(trigger); });
    });

    box.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    box.querySelector('[data-lightbox-zoom-in]').addEventListener('click', function () {
      if (swiper) swiper.zoom.in();
    });

    box.querySelector('[data-lightbox-zoom-out]').addEventListener('click', function () {
      if (swiper) swiper.zoom.out();
    });

    /* Escape closes; Tab is kept inside the panel while it is open. */
    box.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;

      var items = [].slice.call(box.querySelectorAll(FOCUSABLE))
        .filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* Both forms on the page — hero estimate and contact.
     Validation is left to the browser: the fields carry required/type, so an
     invalid submit never reaches this handler.

     TODO: no endpoint is wired yet. Point `ENDPOINT` at the form service (or a
     mail handler) and the fetch below goes live; until then the submit is
     intercepted so the page doesn't reload and lose what was typed. */
  function initForms() {
    [].slice.call(document.querySelectorAll('.js-form')).forEach(setUpForm);
  }

  function setUpForm(form) {
    var ENDPOINT = '';
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('button[type="submit"]');

    function say(message) {
      if (status) status.textContent = message;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!ENDPOINT) {
        say('Form not connected yet — please call (718) 414-6067 and we will take the details over the phone.');
        return;
      }

      if (submit) submit.disabled = true;
      say('Sending your request…');

      window.fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) throw new Error(response.status);
        form.reset();
        say('Thanks — your request is in. We will call you back within one business day.');
      }).catch(function () {
        say('That did not send. Please try again, or call (718) 414-6067.');
      }).then(function () {
        if (submit) submit.disabled = false;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    respectMotionPreference();
    watchScroll();
    initMegaMenus();
    initMobileNav();
    initBlogSwiper();
    initReviewSwiper();
    initFaqs();
    initProjectTabs();
    initLightbox();
    initVideoBox();
    initForms();
  });
})();
