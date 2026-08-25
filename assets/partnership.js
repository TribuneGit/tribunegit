/* Tribune Trading Partnership: Market Territory Board.
   Vanilla JS, zero dependencies. Client-side only, no persistence, no backend.
   Supports mouse drag-and-drop (HTML5 DnD) and touch/pointer fallback so it
   works live in a meeting on a laptop or a tablet. */
(function () {
  'use strict';

  var board = document.getElementById('territory-board');
  if (!board) return;

  var MARKETS = [
    { id: 'nasdaq', label: 'NASDAQ / NQ Futures', zone: 'neutral' },
    { id: 'sp', label: 'S&P / ES Futures', zone: 'neutral' },
    { id: 'dow', label: 'Dow / YM Futures', zone: 'neutral' },
    { id: 'russell', label: 'Russell / RTY Futures', zone: 'neutral' },
    { id: 'gold', label: 'Gold', zone: 'neutral' },
    { id: 'silver', label: 'Silver', zone: 'neutral' },
    { id: 'crude', label: 'Crude Oil', zone: 'neutral' },
    { id: 'othercommod', label: 'Other Commodities', zone: 'neutral' },
    { id: 'bitcoin', label: 'Bitcoin', zone: 'neutral' },
    { id: 'crypto', label: 'Crypto Markets', zone: 'neutral' },
    { id: 'forex', label: 'Forex', zone: 'neutral' },
    { id: 'equities', label: 'Individual Equities', zone: 'neutral' },
    { id: 'eqoptions', label: 'Equity Options', zone: 'neutral' },
    { id: 'idxoptions', label: 'Index Options', zone: 'neutral' },
    { id: 'intl', label: 'International Equity Indices', zone: 'neutral' },
    { id: 'vol', label: 'Volatility Products', zone: 'neutral' },
    { id: 'rates', label: 'Treasury / Rate Futures', zone: 'neutral' },
    { id: 'otherfutures', label: 'Other Futures Markets', zone: 'neutral' },
    { id: 'nontrading', label: 'Non-Trading Applications', zone: 'tribune' },
    { id: 'futureai', label: 'Future AI Verticals', zone: 'tribune' }
  ];
  // Sensible starting proposal: NASDAQ/NQ (Stan's demonstrated methodology
  // market) begins inside Tribune Trading since it is the market discussed
  // in discovery so far. Non-trading / future AI verticals default to
  // Tribune Inc. since they sit outside the trading product by definition.
  // Everything else starts "to decide together" per the brief.
  MARKETS[0].zone = 'trading'; // NASDAQ/NQ

  var state = {};
  MARKETS.forEach(function (m) { state[m.id] = m.zone; });

  var zoneTrading = board.querySelector('[data-zone-cards="trading"]');
  var zoneTribune = board.querySelector('[data-zone-cards="tribune"]');
  var zoneNeutral = board.querySelector('[data-zone-cards="neutral"]');
  var zoneEls = {
    trading: board.querySelector('.tz.zone-trading'),
    tribune: board.querySelector('.tz.zone-tribune'),
    neutral: board.querySelector('.tz-neutral')
  };
  var containers = { trading: zoneTrading, tribune: zoneTribune, neutral: zoneNeutral };

  var dragged = null;

  function render() {
    Object.keys(containers).forEach(function (z) { containers[z].innerHTML = ''; });
    MARKETS.forEach(function (m) {
      var el = document.createElement('div');
      el.className = 'mkt-card';
      el.textContent = m.label;
      el.setAttribute('draggable', 'true');
      el.dataset.id = m.id;
      el.dataset.zone = state[m.id];
      el.addEventListener('dragstart', function (e) {
        dragged = m.id;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', m.id); } catch (err) {}
      });
      el.addEventListener('dragend', function () {
        el.classList.remove('dragging');
        dragged = null;
      });
      // Touch / click fallback: tap a card, then tap a zone to move it.
      el.addEventListener('click', function () {
        var picked = board.querySelector('.mkt-card.picked');
        if (picked && picked === el) { el.classList.remove('picked'); return; }
        if (picked) picked.classList.remove('picked');
        el.classList.add('picked');
      });
      containers[state[m.id]].appendChild(el);
    });
  }

  function moveTo(id, zone) {
    if (!state.hasOwnProperty(id)) return;
    state[id] = zone;
    render();
  }

  ['trading', 'tribune', 'neutral'].forEach(function (zoneKey) {
    var dropTarget = zoneEls[zoneKey];
    if (!dropTarget) return;
    dropTarget.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropTarget.classList.add('drag-over');
    });
    dropTarget.addEventListener('dragleave', function () {
      dropTarget.classList.remove('drag-over');
    });
    dropTarget.addEventListener('drop', function (e) {
      e.preventDefault();
      dropTarget.classList.remove('drag-over');
      var id = dragged || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
      if (id) moveTo(id, zoneKey);
    });
    // Tap-to-place fallback for touch devices without native DnD support.
    dropTarget.addEventListener('click', function () {
      var picked = board.querySelector('.mkt-card.picked');
      if (picked) { moveTo(picked.dataset.id, zoneKey); }
    });
  });

  var resetBtn = board.querySelector('.territory-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      MARKETS.forEach(function (m) { state[m.id] = m.zone; });
      render();
    });
  }

  render();
})();
