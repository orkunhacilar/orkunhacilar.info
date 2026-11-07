// Site motion layer. Content stays visible if GSAP fails to load or the
// visitor prefers reduced motion; every effect here is an enhancement.
(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    initScrollProgress();
    initMarquee();

    if (reducedMotion) return;

    document.documentElement.classList.add('motion');
    initHeroNetwork();

    if (finePointer) initSpotlight();

    if (typeof gsap === 'undefined') return;

    initHeroMotion();
    initScrollReveals();
    initTimelineProgress();

    if (finePointer) {
        initMagneticButtons();
        initCardTilt();
        initPortraitParallax();
    }

    function initHeroMotion() {
        gsap.fromTo('.hero-name',
            { clipPath: 'inset(-10% 100% -10% 0)' },
            { clipPath: 'inset(-10% -5% -10% 0)', duration: 1.2, ease: 'power3.inOut', delay: 0.2, clearProps: 'clipPath' }
        );

        const wrapper = document.querySelector('.hero-image-wrapper');
        const hero = document.querySelector('.hero');
        if (!wrapper || !hero) return;

        onScrollFrame(() => {
            const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
            gsap.set(wrapper, { yPercent: progress * 14 });
        });
    }

    function initScrollReveals() {
        const reveal = (selector, from, stagger = 0.08) => {
            const observer = new IntersectionObserver((entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
                if (visible.length === 0) return;

                visible.forEach((element) => observer.unobserve(element));
                gsap.to(visible, {
                    opacity: 1, x: 0, y: 0, scale: 1,
                    duration: 0.8, ease: 'power3.out', stagger, overwrite: 'auto'
                });
            }, { rootMargin: '0px 0px -10% 0px' });

            gsap.set(selector, { opacity: 0, ...from });
            document.querySelectorAll(selector).forEach((element) => observer.observe(element));
        };

        reveal('.section-title', { y: 40 });
        reveal('.about-text p', { y: 30 });
        reveal('.skill-category', { y: 30 });
        reveal('.skill-tags span', { y: 14, scale: 0.9 }, 0.03);
        reveal('.timeline-item', { x: -40 });
        reveal('.project-card', { y: 60 }, 0.14);
        reveal('.contact-description', { y: 30 });
        reveal('.contact-item', { y: 30 });
    }

    function initTimelineProgress() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        const progress = document.createElement('div');
        progress.className = 'timeline-progress';
        timeline.prepend(progress);

        const dots = [...timeline.querySelectorAll('.timeline-dot')];

        onScrollFrame(() => {
            const line = window.innerHeight * 0.65;
            const rect = timeline.getBoundingClientRect();
            const ratio = Math.max(0, Math.min((line - rect.top) / rect.height, 1));
            progress.style.transform = `scaleY(${ratio})`;
            dots.forEach((dot) => dot.classList.toggle('is-active', dot.getBoundingClientRect().top < line));
        });
    }

    function initMagneticButtons() {
        document.querySelectorAll('.btn').forEach((button) => {
            const moveX = gsap.quickTo(button, 'x', { duration: 0.4, ease: 'power3.out' });
            const moveY = gsap.quickTo(button, 'y', { duration: 0.4, ease: 'power3.out' });

            button.addEventListener('mousemove', (event) => {
                const rect = button.getBoundingClientRect();
                moveX((event.clientX - rect.left - rect.width / 2) * 0.25);
                moveY((event.clientY - rect.top - rect.height / 2) * 0.35);
            });
            button.addEventListener('mouseleave', () => {
                moveX(0);
                moveY(0);
            });
        });
    }

    function initCardTilt() {
        document.querySelectorAll('.project-card').forEach((card) => {
            gsap.set(card, { transformPerspective: 900 });
            const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
            const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });

            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                rotateX(((event.clientY - rect.top) / rect.height - 0.5) * -8);
                rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 8);
            });
            card.addEventListener('mouseleave', () => {
                rotateX(0);
                rotateY(0);
            });
        });
    }

    function initPortraitParallax() {
        const hero = document.querySelector('.hero');
        const wrapper = document.querySelector('.hero-image-wrapper');
        if (!hero || !wrapper) return;

        const moveX = gsap.quickTo(wrapper, 'x', { duration: 0.9, ease: 'power3.out' });
        const moveY = gsap.quickTo(wrapper, 'y', { duration: 0.9, ease: 'power3.out' });

        hero.addEventListener('mousemove', (event) => {
            moveX((event.clientX / window.innerWidth - 0.5) * 28);
            moveY((event.clientY / window.innerHeight - 0.5) * 28);
        });
    }

    function onScrollFrame(callback) {
        let queued = false;
        const run = () => {
            callback();
            queued = false;
        };
        const request = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(run);
        };

        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        run();
    }

    function initScrollProgress() {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);

        onScrollFrame(() => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
        });
    }

    function initMarquee() {
        const track = document.querySelector('.tech-track');
        if (track && !reducedMotion) track.append(...[...track.children].map((item) => item.cloneNode(true)));
    }

    function initSpotlight() {
        document.querySelectorAll('.timeline-content, .project-card, .contact-item').forEach((card) => {
            card.classList.add('spotlight');
            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
                card.style.setProperty('--my', `${event.clientY - rect.top}px`);
            });
        });
    }

    function initHeroNetwork() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'hero-network';
        canvas.setAttribute('aria-hidden', 'true');
        hero.prepend(canvas);

        const context = canvas.getContext('2d');
        const linkDistance = 130;
        const pointerDistance = 180;
        const pointer = { x: -9999, y: -9999 };
        let width = 0;
        let height = 0;
        let nodes = [];
        let frame = null;

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            width = hero.offsetWidth;
            height = hero.offsetHeight;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            const count = Math.min(90, Math.round((width * height) / 16000));
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35
            }));
        };

        const drawLink = (x1, y1, x2, y2, alpha) => {
            context.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);
            context.lineWidth = 1;

            nodes.forEach((node, index) => {
                node.x += node.vx;
                node.y += node.vy;
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                for (let next = index + 1; next < nodes.length; next += 1) {
                    const other = nodes[next];
                    const distance = Math.hypot(node.x - other.x, node.y - other.y);
                    if (distance < linkDistance) {
                        drawLink(node.x, node.y, other.x, other.y, (1 - distance / linkDistance) * 0.22);
                    }
                }

                const toPointer = Math.hypot(node.x - pointer.x, node.y - pointer.y);
                if (toPointer < pointerDistance) {
                    drawLink(node.x, node.y, pointer.x, pointer.y, (1 - toPointer / pointerDistance) * 0.55);
                }

                context.fillStyle = 'rgba(167, 139, 250, 0.55)';
                context.beginPath();
                context.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
                context.fill();
            });

            frame = requestAnimationFrame(draw);
        };

        hero.addEventListener('mousemove', (event) => {
            const rect = hero.getBoundingClientRect();
            pointer.x = event.clientX - rect.left;
            pointer.y = event.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => {
            pointer.x = -9999;
            pointer.y = -9999;
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && frame === null) {
                frame = requestAnimationFrame(draw);
            } else if (!entry.isIntersecting && frame !== null) {
                cancelAnimationFrame(frame);
                frame = null;
            }
        }).observe(hero);

        resize();
    }
})();
