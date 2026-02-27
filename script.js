(function () {
  function initScrollSections(mainSelector = '#main-content', options = {}) {
    const main = document.querySelector(mainSelector) || document.querySelector('.main-content');
    if (!main) return;

    const hero = main.querySelector('[data-section="hero"]') || main.querySelector('.hero') || main.children[0];
    const products = main.querySelector('[data-section="products"]') || main.querySelector('.products') || main.children[1];
    if (!hero || !products) return;

    const duration = options.duration || 550;
    let active = false; // main-content currently mostly in viewport
    let view = 'hero';
    let animating = false;
    let touchStartY = null;

    // Inject necessary CSS so the sections are positioned and animate
    const styleId = 'scroll-sections-injected-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
${mainSelector}, .main-content { position: relative; overflow: hidden; }
${mainSelector} > * { box-sizing: border-box; }
${mainSelector} > [data-section], ${mainSelector} > .hero, ${mainSelector} > .products, ${mainSelector} > .hero-section, ${mainSelector} > .products-section { position: absolute; top: 0; left: 0; width: 100%; height: 100vh; }
${mainSelector} > .products, ${mainSelector} > .products-section, ${mainSelector} > [data-section="products"] { top: 100%; transform: translateY(0); }
${mainSelector}.show-products > .products, ${mainSelector}.show-products > .products-section, ${mainSelector}.show-products > [data-section="products"] { transform: translateY(-100%); }
${mainSelector} > .hero, ${mainSelector} > .hero-section, ${mainSelector} > [data-section="hero"] { transform: translateY(0); }
`;
      document.head.appendChild(style);
    }

    // Apply transition styles inline (helps when elements already have transitions)
    [hero, products].forEach((el) => {
      el.style.transition = `transform ${duration}ms cubic-bezier(.2,.9,.2,1)`;
      el.style.willChange = 'transform';
      el.style.backfaceVisibility = 'hidden';
    });

    // Intersection observer to detect when main-content is mostly in viewport
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          active = entry.intersectionRatio > 0.9;
        });
      },
      { threshold: [0, 0.5, 0.9, 1] }
    );
    io.observe(main);

    // observe "why-us" section and toggle visibility class when it enters viewport
    const whyEl = document.querySelector('.why-us');
    const purchaseEl = document.querySelector('.purchase');
    const contactEl = document.querySelector('.contact');
    const navBar = document.querySelector('.navbar');

    // observe the main section itself to toggle transparency on the navbar
    if (navBar && main) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            // when main-content is mostly out of view (scrolled past)
            if (e.intersectionRatio < 0.1) {
              navBar.classList.add('add-trans');
            } else {
              navBar.classList.remove('add-trans');
            }
          });
        },
        { threshold: [0, 0.1, 0.9, 1] }
      );
      navObserver.observe(main);
    }

    if (whyEl) {
      const whyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.intersectionRatio > 0.4) {
              whyEl.classList.add('is-visible');
            }
          });
        },
        { threshold: [0, 0.5] }
      );
      whyObserver.observe(whyEl);
    }

    if (purchaseEl) {
      const purchaseObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.intersectionRatio > 0.4) {
              purchaseEl.classList.add('is-visible');
            }
          });
        },
        { threshold: [0, 0.5] }
      );
      purchaseObserver.observe(purchaseEl);
    }

    if (contactEl) {
      const contactObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.intersectionRatio > 0.4) {
              contactEl.classList.add('is-visible');
            }
          });
        },
        { threshold: [0, 0.5] }
      );
      contactObserver.observe(contactEl);
    }

    function showProducts() {
      if (animating || view === 'products') return;
      animating = true;
      main.classList.add('show-products');
      products.classList.add('chickenpop')
      setTimeout(() => {
        view = 'products';
        animating = false;
      }, duration + 20);
      
      setTimeout(() => {
        products.classList.add('products-scattered')
        setTimeout(() => {
            products.classList.add('lines-drawn')
        }, duration + 5)
      }, duration + 5);
    //   products.classList.add('products-scattered')
    }

    function hideProducts() {
      if (animating || view === 'hero') return;
      animating = true;
      main.classList.remove('show-products');
      products.classList.remove('chickenpop', 'products-scattered', 'lines-drawn')
      setTimeout(() => {
        view = 'hero';
        animating = false;
      }, duration + 20);
    }

    function onWheel(e) {
      if (!active) return; // only intercept when main-content is on screen
      if (animating) {
        e.preventDefault();
        return;
      }

      // Disable scrolling completely when in hero section
      if (view === 'hero') {
        e.preventDefault();
        
        const delta = e.deltaY;
        // Small threshold to avoid accidental triggers from small trackpad jitter
        if (Math.abs(delta) < 15) return;
        
        if (delta > 0) {
          showProducts();
        }
      } else if (view === 'products') {
        const delta = e.deltaY;
        // Small threshold to avoid accidental triggers from small trackpad jitter
        if (Math.abs(delta) < 15) return;
        
        if (delta < 0) {
          // backward scroll inside products -> hide products
          e.preventDefault();
          hideProducts();
        }
      }
    }

    // Touch handling for mobile/touch devices
    function onTouchStart(e) {
      if (!active) return;
      touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
    }

    function onTouchEnd(e) {
      if (!active || touchStartY === null) return;
      const endY = (e.changedTouches && e.changedTouches[0].clientY) || (e.clientY || touchStartY);
      const delta = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(delta) < 30) return;

      // Disable scrolling completely when in hero section
      if (view === 'hero') {
        e.preventDefault();
        if (delta > 0) {
          showProducts();
        }
      } else if (view === 'products') {
        e.preventDefault();
        if (delta < 0) {
          hideProducts();
        }
      }
    }

    // prevent wheel default only when we decide to intercept
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });

    // Optional: expose controls for external usage
    return {
      showProducts,
      hideProducts,
      isActive: () => active,
      getView: () => view,
      destroy() {
        io.disconnect();
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchend', onTouchEnd);
      },
    };
  }

  // add mobile navigation toggle behavior
  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }

  // Auto-init on DOMContentLoaded using default selector
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollSections('#main-content');
      initMobileNav();
    });
  } else {
    initScrollSections('#main-content');
    initMobileNav();
  }
})();
