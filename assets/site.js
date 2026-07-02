/* Tribune site JS: reveals + the Finder. No dependencies. */
(function () {
  'use strict';

  /* One orchestrated reveal per section */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* The Finder */
  var root = document.getElementById('finder');
  if (!root) return;

  var builds = {
    recovery: { name: 'The Recovery Agent', slug: 'the-recovery-agent',
      line: 'Money you earned, recovered before lunch.' },
    intake:   { name: 'The Intake Agent', slug: 'the-intake-agent',
      line: 'Everything that arrives, handled at the door.' },
    signal:   { name: 'The Signal Agent', slug: 'the-signal-agent',
      line: 'Your team walks in knowing more.' },
    ledger:   { name: 'The Ledger Agent', slug: 'the-ledger-agent',
      line: 'Books that close clean, on schedule.' },
    sentinel: { name: 'The Sentinel', slug: 'the-sentinel',
      line: 'The deadline that never surprises you again.' },
    producer: { name: 'The Producer', slug: 'the-producer',
      line: 'Client work out the door, on time, every time.' }
  };

  var q1 = [
    ['Money owed that never gets chased', 'recovery'],
    ['Paperwork that arrives all day', 'intake'],
    ['Accounts you should be watching', 'signal'],
    ['Books that never quite reconcile', 'ledger'],
    ['Deadlines that must not slip', 'sentinel'],
    ['Reports your team assembles by hand', 'producer']
  ];
  var q2 = [
    ['A medical or care practice', 'medical'],
    ['A legal or professional firm', 'legal'],
    ['A sales, research, or intelligence business', 'sales'],
    ['Services, trades, or something else', 'services']
  ];
  var q3 = [
    ['Patient records', 'regulated'],
    ['Privileged or confidential client matter', 'regulated'],
    ['Standard business data', 'standard']
  ];
  var worldLabel = { medical: 'a medical practice', legal: 'a professional firm',
    sales: 'an intelligence-driven business', services: 'a service business' };

  var state = { fn: null, world: null, edition: null };

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function options(list, onPick) {
    var div = document.createElement('div'); div.className = 'options';
    list.forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = item[0];
      b.addEventListener('click', function () { onPick(item[1]); });
      div.appendChild(b);
    });
    return div;
  }

  function step(label, title, list, onPick, backTo) {
    root.innerHTML = '';
    var l = document.createElement('div'); l.className = 'step-label'; l.textContent = label;
    var h = document.createElement('h3'); h.textContent = title;
    root.appendChild(l); root.appendChild(h);
    root.appendChild(options(list, onPick));
    if (backTo) {
      var back = document.createElement('button');
      back.type = 'button'; back.className = 'back'; back.textContent = 'Back';
      back.addEventListener('click', backTo);
      root.appendChild(back);
    }
  }

  function stepOne() {
    step('Question 1 of 3', 'What should your agent carry?', q1, function (v) {
      state.fn = v; stepTwo();
    }, null);
  }
  function stepTwo() {
    step('Question 2 of 3', 'What is your world?', q2, function (v) {
      state.world = v; stepThree();
    }, stepOne);
  }
  function stepThree() {
    step('Question 3 of 3', 'How sensitive is the data?', q3, function (v) {
      state.edition = v; result();
    }, stepTwo);
  }

  function result() {
    var b = builds[state.fn];
    var reg = state.edition === 'regulated';
    var badge = reg
      ? '<span class="badge badge-regulated">Regulated edition</span>'
      : '<span class="badge badge-standard">Standard edition</span>';
    var regLine = reg ? '<p class="muted">Your records never leave your building.</p>' : '';
    var params = '?fn=' + state.fn + '&world=' + state.world + '&edition=' + state.edition;
    root.innerHTML =
      '<div class="result">' +
      '<div class="step-label">Your build</div>' +
      '<h3>' + esc(b.name) + '</h3>' +
      '<p>' + esc(b.line) + ' Built for ' + esc(worldLabel[state.world]) + '.</p>' +
      badge + regLine +
      '<div class="btn-row">' +
      '<a class="btn btn-primary" href="/builds/' + b.slug + '/">See this build</a>' +
      '<a class="btn btn-ghost" href="/reach-out/' + params + '">Map your constraint &rarr;</a>' +
      '</div>' +
      '<button type="button" class="back" id="finder-restart">Start over</button>' +
      '</div>';
    document.getElementById('finder-restart').addEventListener('click', stepOne);
  }

  stepOne();
})();
