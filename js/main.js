/**
 * ============================================================
 * E-Portfolio PPL Mandiri - Main JavaScript
 * ============================================================
 * Vanilla JS (ES6+) — No jQuery dependency
 * Handles: Navigation, Animations, Gallery, Accordion,
 *          Dark Mode, Form Validation, Typing Effect, etc.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────────
  // 0. LOADING SCREEN
  // ──────────────────────────────────────────────
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    window.addEventListener('load', () => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 600);
    });
    // Fallback: hide after 4 seconds even if load event already fired
    setTimeout(() => {
      if (loadingScreen && loadingScreen.style.display !== 'none') {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
      }
    }, 4000);
  }

  // ──────────────────────────────────────────────
  // 1. NAVIGATION
  // ──────────────────────────────────────────────

  /** 1a. Fixed navbar — transparent → solid on scroll */
  const navbar = document.getElementById('navbar');
  const SCROLL_THRESHOLD = 80; // px before navbar becomes solid

  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  };
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // run once on load

  /** 1b. Mobile hamburger menu toggle */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      // Prevent body scroll when menu is open
      document.body.classList.toggle('menu-open');
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  /** 1c. Active page / section highlighting */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const highlightActiveSection = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}` ||
              link.dataset.section === id) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightActiveSection);

  /** 1d. Smooth scroll to sections (anchor links) */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });


  // ──────────────────────────────────────────────
  // 2. SCROLL ANIMATIONS (Intersection Observer)
  // ──────────────────────────────────────────────

  /** 2a. Fade-in on scroll */
  const fadeElements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right');

  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target); // animate only once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  }

  /** 2b. Parallax effect on hero section */
  const heroSection = document.querySelector('.hero, .hero-section');
  const heroBackground = document.querySelector('.hero-bg, .hero-background');

  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.4; // parallax speed factor
      if (heroBackground) {
        heroBackground.style.transform = `translateY(${rate}px)`;
      } else {
        heroSection.style.backgroundPositionY = `${rate}px`;
      }
    });
  }

  /** 2c. Counter animation for statistics */
  const counters = document.querySelectorAll('.counter, [data-count]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count || el.textContent, 10);
    const duration = parseInt(el.dataset.duration, 10) || 2000;
    const suffix = el.dataset.suffix || '';
    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * (target - start) + start);
      el.textContent = current.toLocaleString('id-ID') + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString('id-ID') + suffix;
      }
    };
    requestAnimationFrame(updateCounter);
  };

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }


  // ──────────────────────────────────────────────
  // 3. ARTIFACT GALLERY
  // ──────────────────────────────────────────────

  /** 3a. Filter / Category Tabs */
  const filterBtns = document.querySelectorAll('.filter-btn, [data-filter]');
  const galleryItems = document.querySelectorAll('.gallery-item, .artifact-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter || btn.dataset.category || 'all';

      galleryItems.forEach(item => {
        const itemCategory = item.dataset.category || item.dataset.filter || '';
        if (category === 'all' || itemCategory === category) {
          item.style.display = '';
          // Add a stagger animation
          setTimeout(() => item.classList.add('show'), 50);
          item.classList.remove('hide');
        } else {
          item.classList.remove('show');
          item.classList.add('hide');
          // Delay hiding so CSS transition can play
          setTimeout(() => {
            if (item.classList.contains('hide')) {
              item.style.display = 'none';
            }
          }, 350);
        }
      });
    });
  });

  /** 3b. Modal popup for artifact details */
  const modal = document.getElementById('artifact-modal');
  const modalBody = modal ? modal.querySelector('.modal-body, .modal-content-inner') : null;
  const modalClose = modal ? modal.querySelector('.modal-close, .close-modal') : null;

  // Open modal
  document.querySelectorAll('[data-modal], .artifact-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (!modal) return;

      // Populate modal content
      const title = trigger.dataset.title || '';
      const description = trigger.dataset.description || '';
      const image = trigger.dataset.image || '';
      const content = trigger.dataset.content || '';

      if (modalBody) {
        let html = '';
        if (image) html += `<img src="${image}" alt="${title}" class="modal-image" loading="lazy">`;
        if (title) html += `<h3 class="modal-title">${title}</h3>`;
        if (description) html += `<p class="modal-description">${description}</p>`;
        if (content) html += `<div class="modal-extra">${content}</div>`;
        modalBody.innerHTML = html;
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /** 3c. Image Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-image, img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;

  document.querySelectorAll('[data-lightbox], .lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (!lightbox) return;
      const src = trigger.dataset.lightbox || trigger.getAttribute('href') || trigger.querySelector('img')?.src;
      const caption = trigger.dataset.caption || trigger.getAttribute('alt') || '';

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = caption;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });
  }


  // ──────────────────────────────────────────────
  // 4. ACCORDION / EXPANDABLE SECTIONS
  // ──────────────────────────────────────────────

  const accordionHeaders = document.querySelectorAll('.accordion-header, .accordion-toggle');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item') || header.parentElement;
      const content = item.querySelector('.accordion-content, .accordion-body');
      const isActive = item.classList.contains('active');

      // Option: close other accordion items (single-open mode)
      const accordion = header.closest('.accordion');
      if (accordion && accordion.dataset.singleOpen !== 'false') {
        accordion.querySelectorAll('.accordion-item, .accordion-toggle').forEach(other => {
          const otherItem = other.closest('.accordion-item') || other.parentElement;
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.accordion-content, .accordion-body');
            if (otherContent) {
              otherContent.style.maxHeight = null;
              otherContent.style.opacity = '0';
            }
          }
        });
      }

      // Toggle current item
      item.classList.toggle('active');
      if (content) {
        if (!isActive) {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.opacity = '1';
        } else {
          content.style.maxHeight = null;
          content.style.opacity = '0';
        }
      }
    });
  });


  // ──────────────────────────────────────────────
  // 5. BACK TO TOP BUTTON
  // ──────────────────────────────────────────────

  const backToTop = document.getElementById('back-to-top');
  const BACK_TO_TOP_THRESHOLD = 400;

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > BACK_TO_TOP_THRESHOLD) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ──────────────────────────────────────────────
  // 6. DARK MODE TOGGLE
  // ──────────────────────────────────────────────

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const STORAGE_KEY_THEME = 'eportfolio-theme';

  /** Apply saved theme on load */
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
  }

  if (darkModeToggle) {
    // Sync toggle state with current theme
    if (savedTheme === 'dark') {
      darkModeToggle.classList.add('active');
      if (darkModeToggle.querySelector('.toggle-icon')) {
        darkModeToggle.querySelector('.toggle-icon').textContent = '🌙';
      }
    }

    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-mode');
      document.body.classList.toggle('dark-mode');
      darkModeToggle.classList.toggle('active');

      // Update icon
      const icon = darkModeToggle.querySelector('.toggle-icon');
      if (icon) icon.textContent = isDark ? '🌙' : '☀️';

      // Persist preference
      localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
    });
  }


  // ──────────────────────────────────────────────
  // 7. FORM VALIDATION
  // ──────────────────────────────────────────────

  const contactForm = document.getElementById('contact-form');

  /**
   * Validate an email address format
   * @param {string} email
   * @returns {boolean}
   */
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Show inline error message for a field
   */
  const showFieldError = (field, message) => {
    clearFieldError(field);
    field.classList.add('error');
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  };

  /**
   * Clear error state from a field
   */
  const clearFieldError = (field) => {
    field.classList.remove('error');
    const existing = field.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
  };

  if (contactForm) {
    // Real-time validation on blur
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        validateField(field);
      });
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    const validateField = (field) => {
      clearFieldError(field);
      const value = field.value.trim();

      // Required check
      if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Kolom ini wajib diisi');
        return false;
      }

      // Email format check
      if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Format email tidak valid');
        return false;
      }

      // Min-length check
      if (field.minLength > 0 && value.length < field.minLength) {
        showFieldError(field, `Minimal ${field.minLength} karakter`);
        return false;
      }

      return true;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      contactForm.querySelectorAll('input, textarea').forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (isValid) {
        // Show success feedback
        const submitBtn = contactForm.querySelector('button[type="submit"], .submit-btn');
        if (submitBtn) {
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Terkirim! ✓';
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            contactForm.reset();
          }, 3000);
        }
      }
    });
  }


  // ──────────────────────────────────────────────
  // 8. TYPING EFFECT (Hero Subtitle)
  // ──────────────────────────────────────────────

  const typingElement = document.querySelector('.typing-text, [data-typing]');

  if (typingElement) {
    const phrases = typingElement.dataset.phrases
      ? JSON.parse(typingElement.dataset.phrases)
      : [
          'Praktik Pengalaman Lapangan Mandiri',
          'Membangun Kompetensi Mengajar',
          'Portofolio Pembelajaran Profesional',
          'Refleksi & Pengembangan Diri'
        ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const TYPING_SPEED = 80;
    const DELETING_SPEED = 40;
    const PAUSE_AFTER_WORD = 2000;
    const PAUSE_BEFORE_TYPE = 500;

    const typeEffect = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        typingElement.textContent = currentPhrase.substring(0, charIndex);
      } else {
        charIndex++;
        typingElement.textContent = currentPhrase.substring(0, charIndex);
      }

      let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      // Finished typing current phrase
      if (!isDeleting && charIndex === currentPhrase.length) {
        delay = PAUSE_AFTER_WORD;
        isDeleting = true;
      }
      // Finished deleting
      else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = PAUSE_BEFORE_TYPE;
      }

      setTimeout(typeEffect, delay);
    };

    // Start the typing animation
    typeEffect();
  }


  // ──────────────────────────────────────────────
  // 9. SMOOTH PAGE TRANSITIONS
  // ──────────────────────────────────────────────

  const pageTransition = document.getElementById('page-transition');

  // Fade in on page load
  if (pageTransition) {
    pageTransition.classList.add('loaded');
  }

  // Intercept internal navigation links for smooth transition
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only handle internal HTML links, skip anchors / external / javascript
    if (
      href &&
      href.endsWith('.html') &&
      !href.startsWith('http') &&
      !href.startsWith('#') &&
      !href.startsWith('mailto') &&
      !link.hasAttribute('target')
    ) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (pageTransition) {
          pageTransition.classList.remove('loaded');
          pageTransition.classList.add('leaving');
        }
        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });
    }
  });


  // ──────────────────────────────────────────────
  // 10. TOOLTIP FUNCTIONALITY
  // ──────────────────────────────────────────────

  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

  tooltipTriggers.forEach(trigger => {
    // Create tooltip element
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    tooltipEl.textContent = trigger.dataset.tooltip;
    document.body.appendChild(tooltipEl);

    const positionTooltip = (e) => {
      const rect = trigger.getBoundingClientRect();
      const position = trigger.dataset.tooltipPosition || 'top';
      let top, left;

      switch (position) {
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          tooltipEl.style.transform = 'translateX(-100%) translateY(-50%)';
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          tooltipEl.style.transform = 'translateY(-50%)';
          break;
        default: // top
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          tooltipEl.style.transform = 'translateX(-50%) translateY(-100%)';
      }

      tooltipEl.style.top = `${top + window.scrollY}px`;
      tooltipEl.style.left = `${left}px`;
    };

    trigger.addEventListener('mouseenter', (e) => {
      positionTooltip(e);
      tooltipEl.classList.add('visible');
    });

    trigger.addEventListener('mouseleave', () => {
      tooltipEl.classList.remove('visible');
    });

    // For touch devices
    trigger.addEventListener('touchstart', (e) => {
      positionTooltip(e);
      tooltipEl.classList.add('visible');
      setTimeout(() => tooltipEl.classList.remove('visible'), 2500);
    });
  });


  // ──────────────────────────────────────────────
  // 11. PRINT-FRIENDLY PORTFOLIO
  // ──────────────────────────────────────────────

  const printBtn = document.getElementById('print-portfolio');

  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Prepare page for printing
      document.body.classList.add('print-mode');

      // Expand all accordion items so content is visible
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.add('active');
        const content = item.querySelector('.accordion-content, .accordion-body');
        if (content) {
          content.style.maxHeight = 'none';
          content.style.opacity = '1';
        }
      });

      // Show all gallery items
      galleryItems.forEach(item => {
        item.style.display = '';
        item.classList.add('show');
        item.classList.remove('hide');
      });

      // Trigger print dialog
      setTimeout(() => {
        window.print();
        // Restore state after printing
        document.body.classList.remove('print-mode');
      }, 300);
    });
  }


  // ──────────────────────────────────────────────
  // 12. UTILITY: Stagger animation children
  // ──────────────────────────────────────────────

  /**
   * Adds staggered entrance animation to children of a container.
   * Usage: <div class="stagger-children" data-stagger-delay="100"> ... </div>
   */
  const staggerContainers = document.querySelectorAll('.stagger-children');

  if (staggerContainers.length > 0) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.staggerDelay, 10) || 100;
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('visible');
            }, delay * index);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    staggerContainers.forEach(el => staggerObserver.observe(el));
  }


  // ──────────────────────────────────────────────
  // 13. UTILITY: Tab component
  // ──────────────────────────────────────────────

  const tabGroups = document.querySelectorAll('.tab-group, .tabs');

  tabGroups.forEach(group => {
    const tabButtons = group.querySelectorAll('.tab-btn, [data-tab]');
    const tabPanels = group.querySelectorAll('.tab-panel, .tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Deactivate all
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => {
          p.classList.remove('active');
          p.style.display = 'none';
        });

        // Activate selected
        btn.classList.add('active');
        const targetPanel = group.querySelector(`#${targetTab}`) ||
                            group.querySelector(`[data-tab-panel="${targetTab}"]`);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.style.display = '';
        }
      });
    });
  });


  // ──────────────────────────────────────────────
  // 14. UTILITY: Progress bar / skill bars animation
  // ──────────────────────────────────────────────

  const progressBars = document.querySelectorAll('.progress-bar, [data-progress]');

  if (progressBars.length > 0) {
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const value = bar.dataset.progress || bar.dataset.value || '0';
          const fill = bar.querySelector('.progress-fill') || bar;
          fill.style.width = `${value}%`;
          fill.classList.add('animated');
          progressObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    progressBars.forEach(bar => progressObserver.observe(bar));
  }


  // ──────────────────────────────────────────────
  // 15. UTILITY: Scroll-triggered CSS class adder
  // ──────────────────────────────────────────────

  /**
   * Generic observer: any element with [data-animate] gets
   * the class specified in that attribute when it scrolls into view.
   * Example: <div data-animate="bounce-in">
   */
  const animateOnScroll = document.querySelectorAll('[data-animate]');

  if (animateOnScroll.length > 0) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animClass = entry.target.dataset.animate;
          entry.target.classList.add(animClass);
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animateOnScroll.forEach(el => animObserver.observe(el));
  }


  // ──────────────────────────────────────────────
  // 16. UTILITY: Lazy-load images
  // ──────────────────────────────────────────────

  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    lazyImages.forEach(img => imgObserver.observe(img));
  }


  // ──────────────────────────────────────────────
  // 17. UTILITY: Year auto-update in footer
  // ──────────────────────────────────────────────

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();


  // ──────────────────────────────────────────────
  // 18. UTILITY: Ripple effect on buttons
  // ──────────────────────────────────────────────

  document.querySelectorAll('.btn-ripple, .ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;
      circle.classList.add('ripple-effect');
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  });


  // ──────────────────────────────────────────────
  // CONSOLE LOG — Dev info
  // ──────────────────────────────────────────────
  console.log(
    '%c📚 E-Portfolio PPL Mandiri %c Loaded Successfully ',
    'background: #2563eb; color: #fff; padding: 4px 12px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #1e40af; color: #93c5fd; padding: 4px 12px; border-radius: 0 4px 4px 0;'
  );

}); // END DOMContentLoaded

