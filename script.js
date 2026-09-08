/*
 * HOMEPAGE SCRIPT - PRODUCTION V4
 * Features:
 * - Mobile Menu Navigation
 * - Product Tour Tabs (Crossfade)
 * - Optimized 3D Tilt (Event scoped + throttled)
 * - Scroll/Live Data Interactions (Intersection Observers)
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // UTILITIES
  // ==========================================
  function onScrollProgress(callback) {
    if (prefersReducedMotion) { callback(1); return; }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPx = document.documentElement.scrollTop;
          const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = winHeightPx > 0 ? scrollPx / winHeightPx : 0;
          callback(scrolled);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function cycleContent(el, states, intervalMs) {
    if (!el || prefersReducedMotion) return () => {};
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      const state = states[idx];
      if (state.text) el.textContent = state.text;
      if (state.classAdd) el.className = state.classAdd;
    }, intervalMs);
    return () => clearInterval(interval);
  }

  const activePlayHooks = [];
  function autoPlayWhenVisible(el, startFn, stopFn) {
    if (!el || prefersReducedMotion) return;
    const state = { el, isVisible: false, isPlaying: false, cleanupData: null, startFn, stopFn };
    activePlayHooks.push(state);

    const togglePlay = () => {
      const shouldPlay = state.isVisible && !document.hidden;
      if (shouldPlay && !state.isPlaying) {
        state.cleanupData = state.startFn();
        state.isPlaying = true;
      } else if (!shouldPlay && state.isPlaying) {
        if (state.stopFn) state.stopFn(state.cleanupData);
        state.isPlaying = false;
      }
    };

    const io = new IntersectionObserver((entries) => {
      state.isVisible = entries[0].isIntersecting;
      togglePlay();
    }, { threshold: 0.5 });
    io.observe(el);
  }

  // Global pause on tab background
  document.addEventListener('visibilitychange', () => {
    activePlayHooks.forEach(hook => {
      const shouldPlay = hook.isVisible && !document.hidden;
      if (shouldPlay && !hook.isPlaying) {
        hook.cleanupData = hook.startFn();
        hook.isPlaying = true;
      } else if (!shouldPlay && hook.isPlaying) {
        if (hook.stopFn) hook.stopFn(hook.cleanupData);
        hook.isPlaying = false;
      }
    });
  });

  // ==========================================
  // BASE UI & NAVIGATION
  // ==========================================

  // Announcement Bar
  const announcementBar = document.getElementById('announcementBar');
  const closeAnnouncement = document.getElementById('closeAnnouncement');
  if (closeAnnouncement && announcementBar) {
    if (localStorage.getItem('medicus_announcement_dismissed') === 'true') {
      announcementBar.style.display = 'none';
    }
    closeAnnouncement.addEventListener('click', () => {
      announcementBar.style.display = 'none';
      localStorage.setItem('medicus_announcement_dismissed', 'true');
    });
  }

  // Sticky Nav & Scroll Progress
  const siteNav = document.getElementById('siteNav');
  const navProgressBar = document.getElementById('scroll-progress-bar');
  if (siteNav) {
    window.addEventListener('scroll', () => {
      siteNav.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }
  if (navProgressBar) {
    onScrollProgress((prog) => navProgressBar.style.transform = `scaleX(${prog})`);
  }

  // Mobile Menu
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuPanel = document.getElementById('mobileMenuPanel');
  if (mobileMenuToggle && mobileMenuPanel) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      mobileMenuPanel.classList.toggle('is-open');
      mobileMenuPanel.setAttribute('aria-hidden', isExpanded);
    });
    
    // Close on link click
    mobileMenuPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuPanel.classList.remove('is-open');
        mobileMenuPanel.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  if (sections.length > 0 && navLinks.length > 0) {
    const scrollSpyIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(sec => scrollSpyIO.observe(sec));
  }

  // Product Tour Tabs
  const tourTabs = document.querySelectorAll('.tour-tab');
  const tourPanels = document.querySelectorAll('.tour-panel');
  if (tourTabs.length > 0) {
    tourTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        
        // Update Tabs
        tourTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        // Update Panels (Crossfade via CSS opacity)
        tourPanels.forEach(panel => {
          panel.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
      });
    });
  }

  // Fade up Elements
  const fadeElements = document.querySelectorAll('.fade-slide-up');
  if (!prefersReducedMotion && fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('is-visible'));
  }

  // ==========================================
  // SCROLL & LIVE INTERACTIONS
  // ==========================================

  // Hero Parallax & Stagger
  const heroVisual = document.querySelector('.hero-visual');
  const heroRows = document.querySelectorAll('.hero-row');
  if (!prefersReducedMotion) {
    if (heroVisual) {
      window.addEventListener('scroll', () => {
        heroVisual.style.transform = `translateY(${Math.max(0, Math.min(window.scrollY * 0.08, 24))}px)`;
      }, { passive: true });
    }
    if (heroRows.length > 0) {
      setTimeout(() => {
        heroRows.forEach((row, i) => setTimeout(() => row.classList.add('is-revealed'), i * 80));
      }, 300);
    }
  } else {
    heroRows.forEach(row => row.classList.add('is-revealed'));
  }

  // Hero Queue Simulation
  const heroChip = document.getElementById('hero-queue-chip');
  const heroSection = document.querySelector('.hero');
  if (heroSection && heroChip) {
    autoPlayWhenVisible(heroSection, 
      () => cycleContent(heroChip, [
        { text: 'Booked', classAdd: 'chip booked' },
        { text: 'Arrived', classAdd: 'chip arrived' },
        { text: 'Ongoing', classAdd: 'chip ongoing' }
      ], 3000),
      (cleanup) => { if (cleanup) cleanup(); }
    );
  }

  // Problem Framing Stagger
  const staggerLists = document.querySelectorAll('.stagger-list');
  if (staggerLists.length > 0) {
    const problemObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-animating');
          problemObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    if (!prefersReducedMotion) {
      staggerLists.forEach(list => problemObserver.observe(list));
    } else {
      staggerLists.forEach(list => list.classList.add('is-animating'));
    }
  }

  // Clinical Chains Scroll-scrubbing
  const chainsSec = document.querySelector('.clinical-chains');
  const travelingDot = document.querySelector('.traveling-dot');
  const accentNode = document.querySelector('.node.accent');
  
  if (chainsSec && travelingDot && accentNode && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Calculate only vertical progress, regardless of layout wrapping (mobile friendly)
          const rect = chainsSec.getBoundingClientRect();
          const vh = window.innerHeight;
          let prog = (vh - rect.top) / (vh + rect.height);
          prog = Math.max(0, Math.min(1, prog));
          
          travelingDot.style.transform = `translateY(${Math.max(0, prog * 150)}px)`; 
          // Note: for responsive dot, a more complex path logic might be needed. 
          // Fallback to simple opacity reveal if mobile wraps heavily.
          if(window.innerWidth > 640) {
             travelingDot.style.transform = `translateX(${prog * 100}%)`;
          }
          
          accentNode.classList.toggle('is-active', prog > 0.45 && prog < 0.6);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  } else if (travelingDot) {
    travelingDot.style.display = 'none';
    if (accentNode) accentNode.classList.add('is-active');
  }

  // Solutions Scrollytelling & Rail
  const solutionBlocks = document.querySelectorAll('.solution-block');
  const railDots = document.querySelectorAll('.rail-dot');
  if (solutionBlocks.length > 0) {
    solutionBlocks.forEach((block, index) => {
      autoPlayWhenVisible(block, 
        () => {
          if (railDots.length > 0) {
            railDots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
          }
          const innerChip = block.querySelector('.chip');
          if (innerChip) {
            return cycleContent(innerChip, [
              { text: 'Booked', classAdd: 'chip booked' }, 
              { text: 'Arrived', classAdd: 'chip arrived' }
            ], 2000);
          }
          return () => {}; 
        }, 
        (cleanup) => { if (cleanup) cleanup(); }
      );
    });
  }

  // Security Strip Draw-in
  const securityStrips = document.querySelectorAll('.security-strip');
  if (securityStrips.length > 0) {
    const secObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          secObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.8 });
    
    if (!prefersReducedMotion) {
      securityStrips.forEach(strip => secObserver.observe(strip));
    } else {
      securityStrips.forEach(strip => strip.classList.add('is-drawn'));
    }
  }

  // FAQ Accordion
  const faqDetails = document.querySelectorAll('.faq-details');
  if (faqDetails.length > 0) {
    faqDetails.forEach(targetDetail => {
      targetDetail.addEventListener('click', (e) => {
        if (e.target.tagName !== 'SUMMARY') return;
        faqDetails.forEach(detail => {
          if (detail !== targetDetail && detail.hasAttribute('open')) {
            detail.removeAttribute('open');
          }
        });
      });
    });
  }

  // Optimized 3D Tilt Interaction (Scoped)
  const cards3d = document.querySelectorAll('.card-3d');
  if (!prefersReducedMotion && cards3d.length > 0) {
    cards3d.forEach(card => {
      let isHovered = false;
      let reqId = null;

      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mouseleave', () => {
        isHovered = false;
        if (reqId) cancelAnimationFrame(reqId);
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        if (reqId) cancelAnimationFrame(reqId);
        
        reqId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5; // Softened tilt
          const rotateY = ((x - centerX) / centerX) * 5;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
      });
    });
  }
});