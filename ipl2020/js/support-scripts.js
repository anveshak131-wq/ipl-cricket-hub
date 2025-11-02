// Support Pages Scripts

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Console message
console.log('%cIPL Cricket Hub Support', 'color: #00D9FF; font-size: 24px; font-weight: bold;');
console.log('%cNeed help? Contact us at sportsup99.info@gmail.com', 'color: #FFD700; font-size: 14px;');
