// script.js

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const heroSection = document.querySelector('#hero-section');
    const productsSection = document.querySelector('#products-section');
    const whyUsSection = document.querySelector('#why-us-section');
    const purchaseSection = document.querySelector('#purchase-section');
    
    if (!mainContent || !heroSection || !productsSection || !whyUsSection || !purchaseSection) {
        console.error("One or more main sections not found.");
        return;
    }

    // ===== Auto-scroll snap between hero and products =====
    let isAutoScrolling = false;

    const heroStart = heroSection.offsetTop;
    const productsStart = productsSection.offsetTop;
    const whyUsStart = whyUsSection.offsetTop;
    const mainContainerEnd = mainContent.offsetTop + mainContent.offsetHeight;

    const triggerSnap = (targetScroll) => {
        if (isAutoScrolling) return;
        isAutoScrolling = true;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
        setTimeout(() => { isAutoScrolling = false; }, 900);
    };

    // Handle wheel events (mouse wheel and trackpad)
    // Prevent default scrolling in main container and auto-snap instead
    window.addEventListener('wheel', (e) => {
        if (isAutoScrolling) return;

        const currentScroll = window.scrollY;
        const scrollDir = e.deltaY > 0 ? 'down' : 'up';

        // Only prevent default and auto-snap within main container
        if (currentScroll >= heroStart && currentScroll < mainContainerEnd) {
            e.preventDefault();

            if (scrollDir === 'down') {
                // Scroll down: snap to next section
                if (currentScroll < productsStart) {
                    // In hero -> snap to products
                    triggerSnap(productsStart);
                } else if (currentScroll >= productsStart && currentScroll < mainContainerEnd) {
                    // In products -> snap to why-us (outside main container)
                    triggerSnap(whyUsStart);
                }
            } else if (scrollDir === 'up') {
                // Scroll up: snap to previous section
                if (currentScroll >= productsStart && currentScroll < whyUsStart) {
                    // In products -> snap to hero
                    triggerSnap(heroStart);
                } else if (currentScroll >= mainContainerEnd) {
                    // Below main container or in why-us -> snap to products
                    triggerSnap(productsStart);
                }
            }
        }
    }, { passive: false });

    // Handle touch scrolling for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (isAutoScrolling) return;

        touchEndY = e.changedTouches[0].screenY;
        const scrollDir = touchStartY > touchEndY ? 'down' : 'up';
        const currentScroll = window.scrollY;

        // Only auto-snap within main container
        if (currentScroll >= heroStart && currentScroll < mainContainerEnd) {
            if (scrollDir === 'down') {
                // Swipe down: snap to next section
                if (currentScroll < productsStart) {
                    // In hero -> snap to products
                    triggerSnap(productsStart);
                } else if (currentScroll >= productsStart && currentScroll < mainContainerEnd) {
                    // In products -> snap to why-us (outside main container)
                    triggerSnap(whyUsStart);
                }
            } else if (scrollDir === 'up') {
                // Swipe up: snap to previous section
                if (currentScroll >= productsStart && currentScroll < whyUsStart) {
                    // In products -> snap to hero
                    triggerSnap(heroStart);
                } else if (currentScroll >= mainContainerEnd) {
                    // Below main container -> snap to products
                    triggerSnap(productsStart);
                }
            }
        }
    }, { passive: true });

    // IntersectionObserver for class-based animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0.3, 0.5, 0.7]
    };

    const handleIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.target === productsSection) {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    mainContent.classList.add('scrolled-1');
                    mainContent.classList.remove('scrolled-2');
                    productsSection.classList.add('chickenpop');
                    
                    setTimeout(() => {
                        productsSection.classList.add('products-scattered');
                        setTimeout(() => {
                            productsSection.classList.add('lines-drawn');
                        }, 700);
                    }, 500);

                } else if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
                    if (!mainContent.classList.contains('scrolled-2')) {
                        mainContent.classList.remove('scrolled-1');
                        productsSection.classList.remove('products-scattered', 'lines-drawn', 'chickenpop');
                    }
                }
            } else if (entry.target === whyUsSection) {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    mainContent.classList.add('scrolled-2');
                    mainContent.classList.remove('scrolled-1');
                    whyUsSection.classList.add('is-visible');
                } else if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
                    whyUsSection.classList.remove('is-visible');
                    
                    if (productsSection.getBoundingClientRect().top < window.innerHeight * 0.5) {
                        mainContent.classList.add('scrolled-1');
                        mainContent.classList.remove('scrolled-2');
                    } else {
                        mainContent.classList.remove('scrolled-2');
                    }
                }
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    observer.observe(productsSection);
    observer.observe(whyUsSection);

    // Hamburger menu functionality with improved touch support
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navToggle = document.querySelector('#nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (hamburgerMenu && mobileMenu && body) {
        const toggleMenu = () => {
            hamburgerMenu.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            body.classList.toggle('no-scroll');
            
            if (navToggle) {
                navToggle.checked = !navToggle.checked;
            }
        };

        hamburgerMenu.addEventListener('click', toggleMenu);
        hamburgerMenu.addEventListener('touchend', (e) => {
            e.preventDefault();
            toggleMenu();
        });

        const navLinks = mobileMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                body.classList.remove('no-scroll');
                if (navToggle) {
                    navToggle.checked = false;
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                hamburgerMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
                body.classList.remove('no-scroll');
                if (navToggle) {
                    navToggle.checked = false;
                }
            }
        });
    }
});
