/**
 * [COMPANY NAME] — Megamenu
 * Handles desktop hover/click and mobile nav toggle
 */

document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------------------------------------------------
  // Megamenu — desktop
  // -----------------------------------------------------------------------
  const navItems = document.querySelectorAll('.nav-item[data-mega]');

  navItems.forEach(item => {
    const btn = item.querySelector('button, a');
    const dropdown = item.querySelector('.mega-dropdown');
    if (!dropdown) return;

    let closeTimer;

    const open = () => {
      clearTimeout(closeTimer);
      // Close all others
      navItems.forEach(i => i !== item && i.classList.remove('open'));
      item.classList.add('open');
    };

    const close = () => {
      closeTimer = setTimeout(() => item.classList.remove('open'), 120);
    };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    dropdown.addEventListener('mouseleave', close);

    // Also toggle on click (touch devices)
    btn && btn.addEventListener('click', (e) => {
      e.preventDefault();
      item.classList.contains('open') ? item.classList.remove('open') : open();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item[data-mega]')) {
      navItems.forEach(i => i.classList.remove('open'));
    }
  });

  // -----------------------------------------------------------------------
  // Header "About Us" / "Plans & Pricing" dropdowns
  // Hover with 150ms close delay (same pattern as mega-menu) + click for touch
  // -----------------------------------------------------------------------
  const headerDropdownItems = document.querySelectorAll('.header-nav-item');
  headerDropdownItems.forEach(item => {
    const trigger  = item.querySelector('.header-nav-trigger');
    const dropdown = item.querySelector('.header-nav-dropdown');
    if (!trigger) return;

    let closeTimer;

    const openItem = () => {
      clearTimeout(closeTimer);
      headerDropdownItems.forEach(i => i !== item && i.classList.remove('open'));
      item.classList.add('open');
    };

    const scheduleClose = () => {
      closeTimer = setTimeout(() => item.classList.remove('open'), 150);
    };

    // Hover — open on enter, delayed close on leave
    item.addEventListener('mouseenter', openItem);
    item.addEventListener('mouseleave', scheduleClose);

    // Keep open when hovering the dropdown panel itself
    dropdown && dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    dropdown && dropdown.addEventListener('mouseleave', scheduleClose);

    // Click toggle for touch / keyboard users
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      item.classList.contains('open') ? item.classList.remove('open') : openItem();
    });
  });

  // Close header dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-nav-item')) {
      headerDropdownItems.forEach(i => i.classList.remove('open'));
    }
  });

  // -----------------------------------------------------------------------
  // Mobile nav
  // -----------------------------------------------------------------------
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  hamburger && hamburger.addEventListener('click', () => {
    mobileNav && mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('nav-open');
  });

  const closeMobile = () => {
    mobileNav && mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    document.body.classList.remove('nav-open');
  };

  mobileClose && mobileClose.addEventListener('click', closeMobile);

  // Close on nav link click
  mobileNav && mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobile);
  });

  // Mobile accordion sub-menus
  document.querySelectorAll('.mnav-parent').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.mnav-has-sub');
      const wasOpen = li && li.classList.contains('open');
      // Collapse all others
      document.querySelectorAll('.mnav-has-sub').forEach(el => el.classList.remove('open'));
      // Toggle clicked
      if (li && !wasOpen) li.classList.add('open');
    });
  });

  // -----------------------------------------------------------------------
  // Promo bar close
  // -----------------------------------------------------------------------
  const promoClose = document.querySelector('.promo-close');
  const promoBar = document.querySelector('.promo-bar');
  promoClose && promoClose.addEventListener('click', () => {
    promoBar && (promoBar.style.display = 'none');
    sessionStorage.setItem('bch_promo_closed', '1');
  });
  if (sessionStorage.getItem('bch_promo_closed') === '1') {
    promoBar && (promoBar.style.display = 'none');
  }

  // -----------------------------------------------------------------------
  // FAQ accordion (non-Alpine pages)
  // -----------------------------------------------------------------------
  const faqTabs = document.querySelectorAll('.faq-tab');
  const faqPanels = document.querySelectorAll('.faq-panel[data-tab]');

  faqTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      faqTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      faqPanels.forEach(p => {
        p.style.display = p.dataset.tab === target ? 'block' : 'none';
      });
    });
  });

  // Init first tab
  if (faqTabs.length > 0) faqTabs[0].click();

  // -----------------------------------------------------------------------
  // FAQ question accordion
  // -----------------------------------------------------------------------
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const answer = q.nextElementSibling;
      const isOpen = answer && answer.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
      document.querySelectorAll('.faq-question').forEach(qq => qq.classList.remove('open'));

      // Open clicked (if was closed)
      if (!isOpen && answer) {
        answer.classList.add('open');
        q.classList.add('open');
      }
    });
  });

  // -----------------------------------------------------------------------
  // Smooth scroll for anchor links
  // -----------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
