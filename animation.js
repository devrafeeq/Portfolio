/* Modern motion layer. Include at the end of <body> (or with `defer`). */
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    if (!reduce) document.documentElement.classList.add('anim');

    /* ---------- 1. Scroll progress + header + parallax var ---------- */
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    const nativeTimeline = CSS.supports('animation-timeline: scroll()');
    const header = document.querySelector('header');
    let lastY = scrollY;
    let ticking = false;

    function onScroll() {
        const y = scrollY;
        const max = document.documentElement.scrollHeight - innerHeight;

        if (!nativeTimeline) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        if (!reduce) document.documentElement.style.setProperty('--scroll-y', y);

        if (header) {
            header.classList.toggle('is-scrolled', y > 20);
            header.classList.toggle('is-hidden', y > lastY && y > 200);
        }
        lastY = y;
        ticking = false;
    }
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- 2. Active nav link ---------- */
    const navLinks = $('.nav-links a[href^="#"]');
    const sections = navLinks
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    if (sections.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                navLinks.forEach(a =>
                    a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`)
                );
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    if (reduce) return; // everything below is motion-only

    /* ---------- 3. Hero headline: split into words ---------- */
    const h1 = document.querySelector('.hero-content h1');
    if (h1) {
        const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        let n = 0;
        textNodes.forEach(node => {
            const frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(part => {
                if (!part.trim()) { frag.append(part); return; }
                const outer = document.createElement('span');
                outer.className = 'word';
                const inner = document.createElement('span');
                inner.className = 'word-inner';
                inner.style.setProperty('--w', n++);
                inner.textContent = part;
                outer.append(inner);
                frag.append(outer);
            });
            node.replaceWith(frag);
        });
    }

    /* ---------- 4. Scroll reveals (Web Animations API, blur + rise) ----------
       Uses element.animate() so it never collides with your hover transforms
       or transitions. Elements already using .reveal-on-scroll are skipped. */
    const targets = $(
        '.section-title, .projects-grid > *, .contact > *, .hero-actions, .hero-content > p, .code-window'
    ).filter(el => !el.classList.contains('reveal-on-scroll'));

    const groupCount = new Map();
    targets.forEach(el => {
        const parent = el.parentElement;
        const i = groupCount.get(parent) || 0;
        groupCount.set(parent, i + 1);
        el.dataset.delay = Math.min(i, 6) * 90;
        el.style.opacity = '0';
    });

    const revealer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            revealer.unobserve(el);

            el.animate(
                [
                    { opacity: 0, transform: 'translateY(36px) scale(0.98)', filter: 'blur(6px)' },
                    { opacity: 1, transform: 'none', filter: 'blur(0)' }
                ],
                {
                    duration: 900,
                    delay: Number(el.dataset.delay) || 0,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    fill: 'backwards'
                }
            );
            el.style.opacity = '';
            el.classList.add('is-in');
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(el => revealer.observe(el));

    /* ---------- 5. Pointer effects (desktop only) ---------- */
    if (!finePointer) return;

    // Cursor spotlight
    $('.project-card, .card-front, .contact-form').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    // 3D tilt on the hero code window
    const win = document.querySelector('.code-window');
    if (win) {
        win.addEventListener('pointermove', e => {
            const r = win.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            win.style.setProperty('--ry', `${x * 10}deg`);
            win.style.setProperty('--rx', `${-y * 10}deg`);
        });
        win.addEventListener('pointerleave', () => {
            win.style.setProperty('--rx', '0deg');
            win.style.setProperty('--ry', '0deg');
        });
    }

    // Magnetic buttons
    $('.btn-primary, .btn-outline').forEach(btn => {
        btn.addEventListener('pointermove', e => {
            const r = btn.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width / 2) * 0.25;
            const dy = (e.clientY - r.top - r.height / 2) * 0.35;
            btn.style.translate = `${dx}px ${dy}px`;
        });
        btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");

    // 1. Collect all target section IDs safely from navigation links
    const targets = Array.from(navLinks)
        .map(link => link.getAttribute("href"))
        .filter(href => href && href.startsWith("#") && href.length > 1)
        .map(href => href.substring(1));

    // 2. Select only sections that actually exist on the page
    const sections = targets
        .map(id => document.getElementById(id))
        .filter(section => section !== null);

    // 3. Set up Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px", // Activates when section enters the upper viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");

                // Clear 'active' class from all nav links
                navLinks.forEach((link) => link.classList.remove("active"));

                // Safely find and highlight the matching nav link
                const activeLink = Array.from(navLinks).find(
                    (link) => link.getAttribute("href") === `#${id}`
                );

                if (activeLink) {
                    activeLink.classList.add("active");
                }
            }
        });
    }, observerOptions);

    // Observe all valid sections
    sections.forEach((section) => observer.observe(section));
});