/**
 * DevRafeeq Portfolio Motion, Dynamic Cosmic Star Field & Nav Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==========================================================================
       1. ENHANCED STAR FIELD BACKGROUND CANVAS (SHOOTING STARS & GLOW)
       ========================================================================== */
    const canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '-1',
        opacity: '0.85'
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create randomized star field
    const starCount = Math.floor((width * height) / 2500);
    const stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.3,
        alpha: Math.random(),
        twinkleSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1)
    }));

    // Shooting stars array
    const shootingStars = [];

    function createShootingStar() {
        if (shootingStars.length < 3 && Math.random() < 0.03) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * (height / 2),
                length: Math.random() * 80 + 40,
                speed: Math.random() * 10 + 6,
                angle: 45,
                opacity: 1
            });
        }
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }, { passive: true });

    const renderStars = () => {
        ctx.clearRect(0, 0, width, height);

        // Twinkling Stars
        stars.forEach(s => {
            s.alpha += s.twinkleSpeed;
            if (s.alpha >= 1 || s.alpha <= 0.15) {
                s.twinkleSpeed = -s.twinkleSpeed;
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 193, 108, ${s.alpha})`;
            ctx.shadowBlur = s.radius > 1.2 ? 8 : 0;
            ctx.shadowColor = '#ffc16c';
            ctx.fill();
        });

        // Dynamic Shooting Stars
        createShootingStar();
        shootingStars.forEach((star, index) => {
            const rad = (star.angle * Math.PI) / 180;
            const endX = star.x + Math.cos(rad) * star.length;
            const endY = star.y + Math.sin(rad) * star.length;

            const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 193, 108, ${star.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 193, 108, 0)');

            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            star.x += Math.cos(rad) * star.speed;
            star.y += Math.sin(rad) * star.speed;
            star.opacity -= 0.015;

            if (star.opacity <= 0 || star.x > width || star.y > height) {
                shootingStars.splice(index, 1);
            }
        });

        requestAnimationFrame(renderStars);
    };
    renderStars();

    /* ==========================================================================
       2. SCROLL HIDE/SHOW HEADER ENGINE
       ========================================================================== */
    const header = document.getElementById('main-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            // Scrolling down -> hide header
            header.classList.add('header-hidden');
        } else {
            // Scrolling up -> show header
            header.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    /* ==========================================================================
       3. SCROLL REVEAL OBSERVER WITH STAGGER EFFECT
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${(index % 3) * 0.1}s`;
        revealObserver.observe(item);
    });

    /* ==========================================================================
       4. NAVIGATION SPY & ACTIVE SECTION DETECTOR
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.mobile-bottom-nav .nav-link, .footer-links .nav-link');
    const headerSectionLabel = document.getElementById('current-section-label');

    const activeNavObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');

                // Update active class on nav links
                navLinks.forEach(link => {
                    const targetSection = link.getAttribute('data-section') || link.getAttribute('href')?.replace('#', '');
                    if (targetSection === currentId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Update header title text dynamically
                if (headerSectionLabel) {
                    const formattedName = currentId.replace('-', ' ');
                    headerSectionLabel.textContent = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
                }
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(section => activeNavObserver.observe(section));

    /* ==========================================================================
       5. PROJECT FILTERING LOGIC
       ========================================================================== */
    const filterButtons = document.querySelectorAll('#project-filters .filter-btn');
    const projectItems = document.querySelectorAll('#projects-grid .project-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 200);
                }
            });
        });
    });

    /* ==========================================================================
       6. CONTACT FORM HANDLER
       ========================================================================== */
    const contactForm = document.getElementById('portfolio-contact-form');
    const feedbackMsg = document.getElementById('contact-feedback');

    if (contactForm && feedbackMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.reset();
            feedbackMsg.classList.remove('hidden');
        });
    }
});