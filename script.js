(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navBackdrop = document.getElementById('navBackdrop');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav__link');
  const desktopQuery = window.matchMedia('(min-width: 1025px)');
  let scrollPosition = 0;

  function syncNavAccessibility() {
    if (desktopQuery.matches) {
      navOverlay.setAttribute('aria-hidden', 'false');
    } else if (!navOverlay.classList.contains('open')) {
      navOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  syncNavAccessibility();
  desktopQuery.addEventListener('change', syncNavAccessibility);

  /* ---- Sticky header ---- */
  function handleScroll() {
    if (document.body.classList.contains('nav-open')) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile navigation ---- */
  function openNav() {
    scrollPosition = window.scrollY;
    navOverlay.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Κλείσιμο μενού');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
    document.body.style.top = '-' + scrollPosition + 'px';
  }

  function closeNav(restoreScroll) {
    const shouldRestore = restoreScroll !== false;

    navOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Άνοιγμα μενού');
    document.body.classList.remove('nav-open');
    document.body.style.top = '';

    if (shouldRestore) {
      navOverlay.setAttribute('aria-hidden', 'true');
      window.scrollTo(0, scrollPosition);
    } else {
      syncNavAccessibility();
    }
  }

  function scrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerHeight = header.offsetHeight;
    const currentScroll = window.scrollY;
    const top = target.getBoundingClientRect().top + currentScroll - headerHeight;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });

    history.replaceState(null, '', '#' + targetId);
    setActiveNavLink(targetId);
  }

  function toggleNav() {
    if (navOverlay.classList.contains('open')) {
      closeNav(true);
    } else {
      openNav();
    }
  }

  navToggle.addEventListener('click', toggleNav);

  if (navClose) {
    navClose.addEventListener('click', function () {
      closeNav(true);
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', function () {
      closeNav(true);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;

      e.preventDefault();
      const targetId = href.slice(1);
      const menuWasOpen = navOverlay.classList.contains('open');

      if (menuWasOpen) {
        closeNav(false);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            scrollToSection(targetId);
          });
        });
      } else {
        scrollToSection(targetId);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) {
      closeNav(true);
    }
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');

  function setActiveNavLink(activeId) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
    });
  }

  function setActiveLink() {
    if (document.body.classList.contains('nav-open')) return;

    const scrollPos = window.scrollY + header.offsetHeight + 1;
    let currentId = sections.length ? sections[0].getAttribute('id') : '';

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentId = section.getAttribute('id');
      }
    });

    setActiveNavLink(currentId);
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---- Reveal on scroll ---- */
  const revealElements = document.querySelectorAll('.reveal');
  const heroReveals = document.querySelectorAll('.hero .reveal');

  heroReveals.forEach(function (el) {
    el.classList.add('visible');
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---- Counter animation ---- */
  function animateCounter(el, target, duration) {
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        const suffix = el.getAttribute('data-suffix');
        el.textContent = target + (suffix !== null ? suffix : '+');
      }
    }

    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat__number[data-count]');

  if ('IntersectionObserver' in window && statNumbers.length) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target, 1800);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }
})();
