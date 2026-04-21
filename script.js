document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------
    // Services Slider
    // Shows 4 cards at a time, slides through all 7 services
    // -------------------------------------------------------
    const slider = document.getElementById('services-slider');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    if (slider && prevBtn && nextBtn) {
        const items = Array.from(slider.querySelectorAll('.service-item'));
        const total = items.length;

        // Determine visible count based on screen width
        function getVisible() {
            if (window.innerWidth <= 540) return 1;
            if (window.innerWidth <= 900) return 2;
            return 4;
        }

        let current = 0;

        function totalPages() {
            return Math.ceil(total / getVisible());
        }

        // Build dots
        function buildDots() {
            dotsContainer.innerHTML = '';
            const pages = totalPages();
            for (let i = 0; i < pages; i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goTo(page) {
            const vis = getVisible();
            const pages = totalPages();
            current = Math.max(0, Math.min(page, pages - 1));

            // Hide/show items
            items.forEach((item, idx) => {
                const start = current * vis;
                const end = start + vis;
                item.style.display = (idx >= start && idx < end) ? '' : 'none';
            });

            prevBtn.disabled = current === 0;
            nextBtn.disabled = current >= pages - 1;

            // Update dots
            Array.from(dotsContainer.querySelectorAll('.slider-dot')).forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
            });
        }

        prevBtn.addEventListener('click', () => goTo(current - 1));
        nextBtn.addEventListener('click', () => goTo(current + 1));

        // Rebuild on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                current = 0;
                // Reset heights before re-measuring
                items.forEach(item => { item.style.height = ''; item.style.display = ''; });
                equaliseHeights();
                buildDots();
                goTo(0);
            }, 150);
        });

        // Measure tallest card (all visible) then lock all to that height
        function equaliseHeights() {
            items.forEach(item => { item.style.height = ''; item.style.display = ''; });
            const maxH = Math.max(...items.map(item => item.offsetHeight));
            items.forEach(item => { item.style.height = maxH + 'px'; });
        }

        equaliseHeights();
        buildDots();
        goTo(0);
    }

    // -------------------------------------------------------
    // Workshop Slider
    // Shows 3 cards at a time, navigates to the 4th
    // -------------------------------------------------------
    const wSlider = document.getElementById('workshop-slider');
    const wPrevBtn = document.getElementById('workshop-slider-prev');
    const wNextBtn = document.getElementById('workshop-slider-next');
    const wDotsContainer = document.getElementById('workshop-slider-dots');

    if (wSlider && wPrevBtn && wNextBtn) {
        const wItems = Array.from(wSlider.querySelectorAll('.workshop-card'));
        const wTotal = wItems.length;
        let wCurrent = 0;

        function wGetVisible() {
            if (window.innerWidth <= 540) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        }

        function wTotalPages() {
            return Math.ceil(wTotal / wGetVisible());
        }

        function wBuildDots() {
            wDotsContainer.innerHTML = '';
            for (let i = 0; i < wTotalPages(); i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === wCurrent ? ' active' : '');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.addEventListener('click', () => wGoTo(i));
                wDotsContainer.appendChild(dot);
            }
        }

        function wGoTo(page) {
            const vis = wGetVisible();
            wCurrent = Math.max(0, Math.min(page, wTotalPages() - 1));
            wItems.forEach((item, idx) => {
                const start = wCurrent * vis;
                item.style.display = (idx >= start && idx < start + vis) ? '' : 'none';
            });
            wPrevBtn.disabled = wCurrent === 0;
            wNextBtn.disabled = wCurrent >= wTotalPages() - 1;
            Array.from(wDotsContainer.querySelectorAll('.slider-dot')).forEach((dot, i) => {
                dot.classList.toggle('active', i === wCurrent);
            });
        }

        wPrevBtn.addEventListener('click', () => wGoTo(wCurrent - 1));
        wNextBtn.addEventListener('click', () => wGoTo(wCurrent + 1));

        function wEqualiseHeights() {
            wItems.forEach(item => { item.style.height = ''; item.style.display = ''; });
            const maxH = Math.max(...wItems.map(item => item.offsetHeight));
            wItems.forEach(item => { item.style.height = maxH + 'px'; });
        }

        let wResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(wResizeTimer);
            wResizeTimer = setTimeout(() => {
                wCurrent = 0;
                wItems.forEach(item => { item.style.height = ''; item.style.display = ''; });
                wEqualiseHeights();
                wBuildDots();
                wGoTo(0);
            }, 150);
        });

        wEqualiseHeights();
        wBuildDots();
        wGoTo(0);
    }

    // -------------------------------------------------------
    // Mobile Navigation Toggle
    // Toggles 'active' class on nav menu and manages body scroll lock
    // -------------------------------------------------------
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
            if (isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Close mobile menu when a navigation link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });

    // -------------------------------------------------------
    // Header Scroll Behavior
    // Hides header on scroll down, shows on scroll up
    // -------------------------------------------------------
    let lastScrollTop = 0;
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        if (header) {
            if (scrollTop > lastScrollTop) {
                header.classList.add('hide');
            } else {
                header.classList.remove('hide');
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });

    // -------------------------------------------------------
    // Theme Toggle (Dark/Light Mode)
    // Persists user preference using localStorage
    // -------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = localStorage.getItem('theme');
    
    // Default to system preference if no stored theme
    if (!currentTheme) {
        currentTheme = userPrefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', currentTheme === 'dark');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
        });
    }

    // -------------------------------------------------------
    // Form Submission Handlers
    // Integrates with Google Apps Script Web App for data persistence
    // -------------------------------------------------------
    const CONTACT_SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbxyQx0BEll1ANb0y5q4h7MmMRoJWOqkLCjImOSinWhWIgkPUTwJ3JlVSAIAWnz6qJwS/exec';
    const WORKSHOP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRgBYh-cQKFqSiyp2l9BUxB5HSMnOivuVb-_KoKgSs37p2rHic4pWuqcH8L0yePQbD/exec';
    const PARTNER_SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbzOjRzvJwkH19gIHoc9BmAtarj8akd21C7OOk0rMErWif1ULISMoi4GEHEbNjRTw4DV/exec';

    /**
     * Contact Form Handler (index.html)
     * Uses CONTACT_SCRIPT_URL with 'no-cors' mode as it doesn't require a response body
     */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const payload = JSON.stringify({ name, email, message });

            fetch(CONTACT_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: payload
            })
            .then(() => {
                formStatus.textContent = "Message received! We'll be in touch soon.";
                formStatus.style.color = 'var(--color-success, green)';
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            })
            .catch(() => {
                formStatus.textContent = 'Form submission failed. Please check your internet connection or email us directly at info@vtec-jo.com';
                formStatus.style.color = 'var(--color-error, red)';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    /**
     * Partner Inquiry Form Handler (partner.html)
     * Uses PARTNER_SCRIPT_URL and expects a JSON response from the Apps Script
     */
    const partnerForm = document.getElementById('partner-form');
    if (partnerForm) {
        partnerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('partner-form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';

            const submitBtn = partnerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const companyName     = document.getElementById('company-name').value.trim();
            const contactName     = document.getElementById('contact-name').value.trim();
            const email           = document.getElementById('email').value.trim();
            const phone           = document.getElementById('phone').value.trim();
            const partnershipType = document.getElementById('partnership-type').value;
            const message         = document.getElementById('message').value.trim();

            const payload = JSON.stringify({ companyName, contactName, email, phone, partnershipType, message });

            fetch(PARTNER_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: payload
            })
            .then(res => res.json())
            .then(data => {
                if (data.result === 'success') {
                    formStatus.textContent = 'Inquiry received! We\'ll be in touch within 2 business days.';
                    formStatus.style.color = 'var(--color-success, green)';
                    partnerForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(() => {
                formStatus.textContent = 'Form submission failed. Please check your internet connection or email us directly at info@vtec-jo.com';
                formStatus.style.color = 'var(--color-error, red)';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    /**
     * Workshop Registration Form Handler (workshops.html)
     * Uses WORKSHOP_SCRIPT_URL and expects a JSON response from the Apps Script
     */
    const workshopForm = document.getElementById('workshop-form');
    if (workshopForm) {
        workshopForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('workshop-form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';

            const submitBtn = workshopForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const name              = document.getElementById('workshop-name').value.trim();
            const email             = document.getElementById('workshop-email').value.trim();
            const phone             = document.getElementById('workshop-phone').value.trim();
            const organization      = document.getElementById('workshop-organization').value.trim();
            const workshopInterest  = document.getElementById('workshop-interest').value;
            const preferredTiming   = document.getElementById('workshop-timing').value.trim();
            const participants      = document.getElementById('workshop-participants').value.trim();
            const message           = document.getElementById('workshop-message').value.trim();

            const payload = JSON.stringify({ name, email, phone, organization, workshopInterest, preferredTiming, participants, message });

            fetch(WORKSHOP_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: payload
            })
            .then(res => res.json())
            .then(data => {
                if (data.result === 'success') {
                    formStatus.textContent = 'Registration received! We\'ll be in touch with workshop details soon.';
                    formStatus.style.color = 'var(--color-success, green)';
                    workshopForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(() => {
                formStatus.textContent = 'Form submission failed. Please check your internet connection or email us directly at info@vtec-jo.com';
                formStatus.style.color = 'var(--color-error, red)';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    // -------------------------------------------------------
    // GSAP Animations
    // Hero: SplitText char-by-char fade-in (on load)
    // Sections below services: ScrollFloat scroll-scrub char animation
    // Excludes service card content (.service-item)
    // -------------------------------------------------------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Split an element's plain text into individual .anim-char <span>s,
        // wrapped in word containers so line breaks only occur between words.
        // Sets aria-label on the element so screen readers still read the full text.
        function splitChars(el) {
            const text = el.textContent;
            el.setAttribute('aria-label', text);
            el.textContent = '';
            const words = text.split(' ');
            words.forEach((word, wi) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';
                [...word].forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'anim-char';
                    span.textContent = char;
                    wordSpan.appendChild(span);
                });
                el.appendChild(wordSpan);
                if (wi < words.length - 1) {
                    const space = document.createElement('span');
                    space.className = 'anim-char';
                    space.style.display = 'inline-block';
                    space.textContent = '\u00A0';
                    el.appendChild(space);
                }
            });
            return el.querySelectorAll('.anim-char');
        }

        // ---- Hero: SplitText fade-in (power3.out, staggered chars) ----
        const heroTitle = document.querySelector('.hero-title');
        const heroDesc  = document.querySelector('.hero-description');

        if (heroTitle) {
            const chars = splitChars(heroTitle);
            gsap.fromTo(chars,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.025, delay: 0.2, force3D: true }
            );
        }

        if (heroDesc) {
            const chars = splitChars(heroDesc);
            gsap.fromTo(chars,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.012, delay: 0.7, force3D: true }
            );
        }

        // ---- ScrollFloat: same style as hero, triggered on scroll ----
        function applyScrollFloat(el) {
            const chars = splitChars(el);
            gsap.fromTo(chars,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power3.out',
                    stagger: 0.012,
                    force3D: true,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        once: true
                    }
                }
            );
        }

        // Simple fade-up for elements that contain child markup (strong, em, etc.)
        function applyFadeIn(el) {
            gsap.fromTo(el,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
                }
            );
        }

        // Selectors for ScrollFloat — about section and everything from services down,
        // deliberately excluding .service-item content (the cards shown in the slider).
        const scrollFloatTargets = [];

        scrollFloatTargets.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // Only split elements that contain plain text (no child elements)
                if (el.childElementCount === 0) {
                    applyScrollFloat(el);
                } else {
                    applyFadeIn(el);
                }
            });
        });
    } // end gsap if block


    // -------------------------------------------------------
    // StarBorder: animated radial-gradient streak on card borders
    // Applies to all card/bordered elements
    // -------------------------------------------------------
    function applyStarBorder(el) {
        el.classList.add('star-border-container');

        // Wrap existing children in .star-inner so they sit above the gradients
        const inner = document.createElement('div');
        inner.className = 'star-inner';
        while (el.firstChild) inner.appendChild(el.firstChild);

        const color = 'var(--accent)';
        const speed = '6s';

        const gradBottom = document.createElement('div');
        gradBottom.className = 'border-gradient-bottom';
        gradBottom.style.background = `radial-gradient(circle, ${color}, transparent 10%)`;
        gradBottom.style.animationDuration = speed;

        const gradTop = document.createElement('div');
        gradTop.className = 'border-gradient-top';
        gradTop.style.background = `radial-gradient(circle, ${color}, transparent 10%)`;
        gradTop.style.animationDuration = speed;

        el.appendChild(gradBottom);
        el.appendChild(gradTop);
        el.appendChild(inner);
    }

    ['.logo-item-placeholder'].forEach(selector => {
        document.querySelectorAll(selector).forEach(applyStarBorder);
    });

    // Non-destructive variant: only prepends the gradient overlays without
    // restructuring DOM (safe for forms and complex layouts)
    function applyStarBorderSafe(el) {
        el.classList.add('star-border-container');
        const color = 'var(--accent)';
        const speed = '6s';

        const gradBottom = document.createElement('div');
        gradBottom.className = 'border-gradient-bottom';
        gradBottom.style.cssText = `background:radial-gradient(circle,${color},transparent 10%);animation-duration:${speed};pointer-events:none;`;

        const gradTop = document.createElement('div');
        gradTop.className = 'border-gradient-top';
        gradTop.style.cssText = `background:radial-gradient(circle,${color},transparent 10%);animation-duration:${speed};pointer-events:none;`;

        el.insertBefore(gradBottom, el.firstChild);
        el.insertBefore(gradTop, el.firstChild);
    }

    ['.partner-form-wrapper', '.cta-card'].forEach(selector => {
        document.querySelectorAll(selector).forEach(applyStarBorderSafe);
    });
});
