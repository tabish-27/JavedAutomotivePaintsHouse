/* ============================================================
   JAVED AUTO PAINT HOUSE — Premium JavaScript
   Features: Custom Cursor, Hero Canvas, Preloader,
             Scroll Animations, Counter, Color Palette,
             Form Handling, Navbar, Paint Drops
   ============================================================ */

'use strict';

// ===== PRELOADER =====
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
let loadProgress = 0;

const fillInterval = setInterval(() => {
    loadProgress += Math.random() * 18;
    if (loadProgress >= 100) { loadProgress = 100; clearInterval(fillInterval); }
    preloaderFill.style.width = loadProgress + '%';
}, 80);

window.addEventListener('load', () => {
    setTimeout(() => {
        preloaderFill.style.width = '100%';
        setTimeout(() => {
            preloader.classList.add('done');
            initHero();
            startCounters();
        }, 400);
    }, 600);
});

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// ===== HERO CANVAS ANIMATION =====
function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animFrame;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const GOLD = '#C9A84C';
    const GOLD_DIM = 'rgba(201,168,76,';

    // Particle class
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.05;
            this.pulse = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += 0.015;
            this.opacity = 0.05 + Math.abs(Math.sin(this.pulse)) * 0.3;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = GOLD_DIM + this.opacity + ')';
            ctx.fill();
        }
    }

    // Paint splat class
    class PaintSplat {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.radius = Math.random() * 80 + 30;
            this.opacity = Math.random() * 0.06 + 0.01;
            this.growing = true;
            this.maxRadius = this.radius;
            this.currentRadius = 0;
            this.speed = Math.random() * 0.3 + 0.1;
        }
        update() {
            if (this.currentRadius < this.maxRadius) {
                this.currentRadius += this.speed;
            }
        }
        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentRadius);
            grad.addColorStop(0, GOLD_DIM + (this.opacity * 2) + ')');
            grad.addColorStop(0.5, GOLD_DIM + this.opacity + ')');
            grad.addColorStop(1, 'rgba(201,168,76,0)');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    // Connection lines between close particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = GOLD_DIM + (0.06 * (1 - dist / 100)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Init
    for (let i = 0; i < 80; i++) particles.push(new Particle());
    const splats = [];
    for (let i = 0; i < 6; i++) splats.push(new PaintSplat());

    function animate() {
        ctx.clearRect(0, 0, W, H);
        splats.forEach(s => { s.update(); s.draw(); });
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        animFrame = requestAnimationFrame(animate);
    }
    animate();

    // Mouse influence on particles
    let heroMX = 0, heroMY = 0;
    document.getElementById('home').addEventListener('mousemove', (e) => {
        heroMX = e.clientX;
        heroMY = e.clientY;
        particles.forEach(p => {
            const dx = p.x - heroMX;
            const dy = p.y - heroMY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x += dx * force * 0.02;
                p.y += dy * force * 0.02;
            }
        });
    });
}

// ===== PAINT DROPS in hero =====
(function spawnPaintDrops() {
    const container = document.getElementById('paintDrops');
    if (!container) return;
    const colors = ['#C9A84C', '#E8C56D', '#9A7930', 'rgba(201,168,76,0.5)'];
    setInterval(() => {
        const drop = document.createElement('div');
        drop.className = 'paint-drop';
        const size = Math.random() * 12 + 4;
        drop.style.cssText = `
            width: ${size}px;
            height: ${size * 1.4}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 60}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration: ${Math.random() * 3 + 2}s;
            animation-delay: 0s;
        `;
        container.appendChild(drop);
        setTimeout(() => drop.remove(), 5000);
    }, 600);
})();

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        }
    });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
function startCounters() {
    const counters = document.querySelectorAll('.stat-num');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                const target = parseInt(entry.target.dataset.target);
                const duration = 2000;
                const steps = 60;
                const increment = target / steps;
                let current = 0;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.floor(current).toLocaleString();
                }, duration / steps);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
}

// ===== COLOR PALETTE SECTION =====
(function buildColorPalette() {
    const palette = document.getElementById('colorPalette');
    if (!palette) return;

    const carColors = [
        '#FFFFFF','#F5F5F5','#E8E8E8','#D4D4D4','#C0B8B0','#B8B0A8',
        '#A8A0A0','#989090','#808080','#686868','#505050','#383838',
        '#202020','#101010','#1A1A2E','#16213E',
        // Reds
        '#8B0000','#A00020','#C0001A','#CC0000','#DD1111','#E02020',
        '#E83030','#E84040','#C83020','#B03020','#D06020','#E07030',
        // Blues  
        '#0A1045','#1A2060','#1E3A8A','#1D4ED8','#2563EB','#3B82F6',
        '#0D6EFD','#0284C7','#0EA5E9','#38BDF8','#0F4C75','#1B6CA8',
        // Greens / Naturals
        '#1A3A1A','#2D5A1B','#3D7A2B','#4A9040','#228B22','#2E8B57',
        '#006400','#355E3B','#4CAF50','#66BB6A','#8BC34A','#A5D6A7',
        // Golds / Yellows
        '#8B6914','#B8860B','#C9A84C','#D4AF37','#DAA520','#F0C040',
        '#FFD700','#FFDF00','#F5E642','#FFF176','#FFC107','#FFB300',
        // Browns / Earth
        '#3E1F00','#5C2E00','#7B3F00','#8B4513','#A0522D','#CD853F',
        '#DEB887','#D2691E','#8B6914','#A67C52','#936A3A','#7A5230',
        // Silvers / Metallics
        '#708090','#778899','#8899AA','#9AABB8','#AAB8C5','#B8C5D0',
        '#C5D0DA','#CFD8DC','#B0BEC5','#90A4AE','#78909C','#607D8B',
        // Pearlescents / Special
        '#E8D5C4','#F0E2D0','#F5ECD8','#EDE0D0','#E0D4C8','#D8CCC0',
        '#CFBFB0','#C4B5A8','#C9A084','#D4AA8C','#DEAD8E','#E8B89A',
    ];

    carColors.forEach((color, i) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        swatch.title = color.toUpperCase();
        swatch.addEventListener('mouseenter', () => {
            swatch.style.boxShadow = `0 8px 24px ${color}80`;
        });
        swatch.addEventListener('mouseleave', () => {
            swatch.style.boxShadow = '';
        });
        palette.appendChild(swatch);
    });
})();

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showNotification('✓ Message sent! We will contact you soon.', 'success');
                contactForm.reset();
            } else {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (err) {
            showNotification('✕ Failed to send. Please call us directly.', 'error');
        } finally {
            btnText.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'info') {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = `notification ${type}`;
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
    }, 4000);
}

// ===== PRODUCT CARD 3D TILT =====
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -6;
        const rotateY = (x - centerX) / centerX * 6;
        card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== KEYBOARD NAV =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== SMOOTH ANCHOR FOR logo =====
document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('%cJaved Auto Paint House', 'font-size:20px;color:#C9A84C;font-weight:bold;');
console.log('%cKunda\'s Premium Automotive Paint Store · Est. 1995', 'font-size:12px;color:#888;');
