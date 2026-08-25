/* Tribune: /milestone development-roadmap page.
   Sticky month scroll-spy rail (desktop) + horizontal sticky bar (mobile).
   Vanilla JS, zero dependencies, client-side only. Does not touch the
   term-tooltip/glossary mechanism, which lives inline in milestone/index.html
   (same pattern as /techstack). */
(function () {
  'use strict';

  var rail = document.getElementById('month-rail');
  var bar = document.getElementById('month-bar');
  if (!rail && !bar) return;

  // Month → section ids. Month 1 spans perception + execution + brain/hands +
  // its milestone box; Month 2 spans training problem through risk controller;
  // Month 3 spans validation through its milestone box. Everything after that
  // (funding alignment, nine gates, deep-dive, glossary) is treated as "past"
  // Month 3, so Month 3 stays marked active/done rather than snapping back.
  var MONTH_SECTIONS = {
    1: ['overview', 'tracks', 'm1-see', 'm1-act', 'm1-brainhands', 'm1-milestone'],
    2: ['m2-intro', 'm2-training', 'm2-notrade', 'm2-method', 'm2-loop', 'm2-example', 'm2-risk', 'm2-milestone'],
    3: ['m3-intro', 'm3-questions', 'm3-ladder', 'm3-milestone']
  };
  var TAIL_SECTIONS = ['funding', 'gates', 'deepdive', 'glossary'];

  var allSections = [];
  Object.keys(MONTH_SECTIONS).forEach(function (m) {
    MONTH_SECTIONS[m].forEach(function (id) { allSections.push({ id: id, month: Number(m) }); });
  });
  TAIL_SECTIONS.forEach(function (id) { allSections.push({ id: id, month: 3 }); });

  var railItems = rail ? Array.prototype.slice.call(rail.querySelectorAll('li')) : [];
  var barItems = bar ? Array.prototype.slice.call(bar.querySelectorAll('li')) : [];

  function setState(month) {
    [1, 2, 3].forEach(function (m) {
      var state = m < month ? 'done' : (m === month ? 'active' : 'future');
      railItems.forEach(function (li) {
        if (Number(li.getAttribute('data-month')) === m) li.setAttribute('data-state', state);
      });
      barItems.forEach(function (li) {
        if (Number(li.getAttribute('data-month')) === m) {
          li.setAttribute('data-state', state);
          var ic = li.querySelector('.ic');
          if (ic) ic.textContent = state === 'done' ? '\u2713' : (state === 'active' ? '\u25CF' : '\u25CB');
        }
      });
    });
  }

  setState(1);

  var observedEls = allSections
    .map(function (s) { return { el: document.getElementById(s.id), month: s.month }; })
    .filter(function (s) { return !!s.el; });

  function showRail() {
    if (!rail) return;
    rail.classList.add('show');
  }

  if ('IntersectionObserver' in window && observedEls.length) {
    var io = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var match = observedEls.find(function (s) { return s.el === e.target; });
          if (match) best = match;
        }
      });
      if (best) {
        setState(best.month);
        showRail();
      }
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    observedEls.forEach(function (s) { io.observe(s.el); });
  } else {
    showRail();
  }

  // Reveal the desktop rail once the hero has scrolled past, and hide again
  // near the very top so it never competes with the hero for attention.
  var hero = document.querySelector('.doc-hero');
  window.addEventListener('scroll', function () {
    if (!rail) return;
    var past = !hero || window.scrollY > hero.offsetHeight * 0.6;
    if (past) rail.classList.add('show');
    else rail.classList.remove('show');
  }, { passive: true });

  // Click-to-scroll on both rail and mobile bar.
  function wireClicks(container) {
    if (!container) return;
    container.querySelectorAll('button[data-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
  wireClicks(rail);
  wireClicks(bar);
})();
