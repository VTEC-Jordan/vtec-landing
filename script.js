document.addEventListener('DOMContentLoaded', () => {
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
            
            // Prevent background scrolling when mobile menu is open
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
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.classList.add('hide');
        } else {
            // Scrolling up
            header.classList.remove('hide');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

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
    
    themeToggle.addEventListener('click', () => {
        let newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // -------------------------------------------------------
    // Form Submission Handlers
    // Integrates with Google Apps Script Web App for data persistence
    // -------------------------------------------------------
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyQx0BEll1ANb0y5q4h7MmMRoJWOqkLCjImOSinWhWIgkPUTwJ3JlVSAIAWnz6qJwS/exec';

    /**
     * Contact Form Handler (index.html)
     * Uses 'no-cors' mode as it doesn't require a response body
     */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const payload = JSON.stringify({ name, email, message });
            
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: payload
            })
            .then(() => {
                formStatus.textContent = "Message received! We'll be in touch soon.";
                formStatus.style.color = 'var(--color-success, green)';
                contactForm.reset();
            })
            .catch(err => {
                console.error('Form submission error:', err);
                formStatus.textContent = 'Something went wrong. Please email us directly.';
                formStatus.style.color = 'var(--color-error, red)';
            });
        });
    }

    /**
     * Partner Inquiry Form Handler (partner.html)
     * Expects a JSON response from the Apps Script
     */
    const partnerForm = document.getElementById('partner-form');
    if (partnerForm) {
        partnerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('partner-form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';

            const companyName     = document.getElementById('company-name').value.trim();
            const contactName     = document.getElementById('contact-name').value.trim();
            const email           = document.getElementById('email').value.trim();
            const phone           = document.getElementById('phone').value.trim();
            const partnershipType = document.getElementById('partnership-type').value;
            const message         = document.getElementById('message').value.trim();
            const inquiryType     = 'partner';

            const payload = JSON.stringify({ companyName, contactName, email, phone, partnershipType, message, inquiryType });

            fetch(APPS_SCRIPT_URL, {
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
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(err => {
                console.error('Partner form submission error:', err);
                formStatus.textContent = 'Something went wrong. Please email us directly at hello@vtec.example';
                formStatus.style.color = 'var(--color-error, red)';
            });
        });
    }

    /**
     * Workshop Registration Form Handler (workshops.html)
     * Expects a JSON response from the Apps Script
     */
    const workshopForm = document.getElementById('workshop-form');
    if (workshopForm) {
        workshopForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formStatus = document.getElementById('workshop-form-status');
            formStatus.textContent = 'Sending...';
            formStatus.style.color = '';

            const name              = document.getElementById('workshop-name').value.trim();
            const email             = document.getElementById('workshop-email').value.trim();
            const phone             = document.getElementById('workshop-phone').value.trim();
            const organization      = document.getElementById('workshop-organization').value.trim();
            const workshopInterest  = document.getElementById('workshop-interest').value;
            const preferredTiming   = document.getElementById('workshop-timing').value.trim();
            const participants      = document.getElementById('workshop-participants').value.trim();
            const message           = document.getElementById('workshop-message').value.trim();
            const inquiryType       = 'workshop';

            const payload = JSON.stringify({ name, email, phone, organization, workshopInterest, preferredTiming, participants, message, inquiryType });

            fetch(APPS_SCRIPT_URL, {
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
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(err => {
                console.error('Workshop form submission error:', err);
                formStatus.textContent = 'Something went wrong. Please email us directly at hello@vtec.example';
                formStatus.style.color = 'var(--color-error, red)';
            });
        });
    }
});
