// Mobile Optimization Detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Optimize performance for mobile devices
if (isMobile) {
    document.documentElement.style.setProperty('--animation-speed', '0.5s');
    // Disable heavy animations on mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .mesh-gradient, .floating-shapes {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Team Data
const teams = [
    {
        name: "Royal Challengers Bangalore",
        shortName: "RCB",
        logo: "rcb_logo_new.svg",
        page: "rcb.html"
    },
    {
        name: "Mumbai Indians",
        shortName: "MI",
        logo: "mi_logo_new.svg",
        page: "mi.html"
    },
    {
        name: "Chennai Super Kings",
        shortName: "CSK",
        logo: "csk_logo_new.svg",
        page: "csk.html"
    },
    {
        name: "Delhi Capitals",
        shortName: "DC",
        logo: "dc_logo_new.svg",
        page: "dc.html"
    },
    {
        name: "Kolkata Knight Riders",
        shortName: "KKR",
        logo: "kkr_logo_new.svg",
        page: "kkr.html"
    },
    {
        name: "Punjab Kings",
        shortName: "PBSK",
        logo: "kxip_logo_new.svg",
        page: "kxip.html"
    },
    {
        name: "Sunrisers Hyderabad",
        shortName: "SRH",
        logo: "srh_logo_new.svg",
        page: "srh.html"
    },
    {
        name: "Rajasthan Royals",
        shortName: "RR",
        logo: "rr_logo_new.svg",
        page: "rr.html"
    },
    {
        name: "Gujarat Titans",
        shortName: "GT",
        logo: "gt_logo_new.svg",
        page: "gt.html"
    },
    {
        name: "Lucknow Super Giants",
        shortName: "LSG",
        logo: "lsg_logo_new.svg",
        page: "lsg.html"
    }
];

// Mobile Menu Toggle with Animation
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
}

// Enhanced Scroll Effect on Navbar
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (currentScroll > 100) {
        if (currentScroll > lastScroll && currentScroll > 300) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
    }
    
    lastScroll = currentScroll;
});

// Advanced Number Animation with Easing
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;
    
    // Easing function for smooth animation
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const current = Math.floor(start + (range * easedProgress));
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// Enhanced Intersection Observer for Stats
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number-modern');
            const target = statNumber.getAttribute('data-target');
            
            if (target && !isNaN(target)) {
                animateNumber(statNumber, 0, parseInt(target), 2000);
            }
            statObserver.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
});

// Observe all stat cards
document.querySelectorAll('.stat-card-modern').forEach(stat => {
    statObserver.observe(stat);
});

// Enhanced Scroll Reveal Animation
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger animation for multiple elements
            setTimeout(() => {
            entry.target.classList.add('active');
            }, index * 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Observe all reveal elements
document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

// Load Teams Dynamically with Enhanced Animation
function loadTeams() {
    const teamsGrid = document.getElementById('teamsGrid');
    
    teams.forEach((team, index) => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card reveal';
        teamCard.style.animationDelay = `${index * 0.1}s`;
        
        teamCard.innerHTML = `
            <div class="team-logo-wrapper">
                <img src="assets/${team.logo}" alt="${team.name}" loading="lazy" onerror="this.src='assets/ipl_logo_new.svg'">
            </div>
            <h3 class="team-name">${team.shortName}</h3>
            <p class="team-subtitle">${team.name}</p>
            <a href="${team.page}" class="team-button">
                View Team →
            </a>
        `;
        
        // Enhanced click interaction with ripple effect
        teamCard.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                createRipple(e, teamCard);
                setTimeout(() => {
                window.location.href = team.page;
                }, 300);
            }
        });
        
        // Add hover sound effect (visual feedback)
        teamCard.addEventListener('mouseenter', () => {
            teamCard.style.transform = 'translateY(-20px) scale(1.05)';
        });
        
        teamCard.addEventListener('mouseleave', () => {
            teamCard.style.transform = 'translateY(0) scale(1)';
        });
        
        teamsGrid.appendChild(teamCard);
        
        // Observe for reveal animation
        revealObserver.observe(teamCard);
    });
}

// Ripple Effect on Click
function createRipple(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 215, 0, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1000';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple keyframes if not exists
if (!document.querySelector('#ripple-keyframes')) {
    const style = document.createElement('style');
    style.id = 'ripple-keyframes';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Smooth Scrolling for Anchor Links with Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        }
    });
});

// Advanced Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual-modern');
    
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Parallax for floating shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const speed = 0.2 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
    
    // Parallax for particles
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const speed = 0.3 + (index * 0.05);
        particle.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Cursor Trail Effect (Optional)
let cursorTrail = [];
const maxTrailLength = 15;

document.addEventListener('mousemove', (e) => {
    const trailDot = document.createElement('div');
    trailDot.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--secondary), transparent);
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        opacity: 0.6;
        animation: fadeTrail 1s ease-out forwards;
    `;
    
    document.body.appendChild(trailDot);
    cursorTrail.push(trailDot);
    
    if (cursorTrail.length > maxTrailLength) {
        const oldDot = cursorTrail.shift();
        oldDot.remove();
    }
    
    setTimeout(() => {
        trailDot.remove();
        cursorTrail = cursorTrail.filter(dot => dot !== trailDot);
    }, 1000);
});

// Add fadeTrail keyframes
if (!document.querySelector('#trail-keyframes')) {
    const style = document.createElement('style');
    style.id = 'trail-keyframes';
    style.textContent = `
        @keyframes fadeTrail {
            0% {
                opacity: 0.6;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Button Magnetic Effect
document.querySelectorAll('.btn-modern').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) scale(1)';
    });
});

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    
    // Add loading animation completion
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Animate hero elements sequentially
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-description, .hero-stats-preview, .hero-buttons');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 50);
        }, index * 150);
    });
});

// Performance Optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
    }
});
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Console Easter Egg
console.log('%cIPL Cricket Hub', 'color: #FF4655; font-size: 48px; font-weight: bold; font-family: Bebas Neue;');
console.log('%cWelcome to the Ultimate Cricket Experience! 🏏', 'color: #00D9FF; font-size: 16px;');
console.log('%c🏆 Crafted with passion for cricket fans worldwide', 'color: #FFD700; font-size: 14px;');
console.log('%c✨ Powered by Modern Web Technologies', 'color: #A1A1AA; font-size: 12px;');

// Easter Egg: Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.classList.add('konami-mode');
        setTimeout(() => {
            document.body.classList.remove('konami-mode');
        }, 10000);
    }
});
