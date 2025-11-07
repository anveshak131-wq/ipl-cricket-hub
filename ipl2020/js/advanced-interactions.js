// ===================================
// ADVANCED INTERACTIONS & AJAX
// ===================================

class IPLCricketHub {
    constructor() {
        this.init();
        this.setupAJAX();
        this.setupAnimations();
        this.setupInteractions();
    }

    init() {
        console.log('🏏 IPL Cricket Hub Advanced Features Loaded');
        this.showLoadingScreen();
        setTimeout(() => this.hideLoadingScreen(), 1000);
    }

    // Loading Screen
    showLoadingScreen() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: #0A0E27; z-index: 99999; display: flex; 
                        align-items: center; justify-content: center; flex-direction: column;">
                <div class="spinner"></div>
                <p style="margin-top: 20px; color: #fff; font-size: 18px;">Loading IPL Cricket Hub...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoadingScreen() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loader.remove(), 500);
        }
    }

    // AJAX Data Loading
    setupAJAX() {
        this.loadLiveScores();
        this.loadPointsTable();
        this.loadUpcomingMatches();
        
        // Refresh live data every 30 seconds
        setInterval(() => this.loadLiveScores(), 30000);
    }

    async loadLiveScores() {
        try {
            // Simulate API call - replace with your actual API endpoint
            const response = await this.mockAPICall({
                matches: [
                    {
                        id: 1,
                        team1: 'CSK',
                        team2: 'MI',
                        score1: '195/6',
                        score2: '188/8',
                        overs1: '20',
                        overs2: '20',
                        status: 'CSK won by 7 runs',
                        live: false
                    },
                    {
                        id: 2,
                        team1: 'RCB',
                        team2: 'KKR',
                        score1: '165/8',
                        score2: '142/5',
                        overs1: '20',
                        overs2: '17.3',
                        status: 'Live - KKR need 24 runs from 15 balls',
                        live: true
                    }
                ]
            });
            
            this.displayLiveScores(response.matches);
        } catch (error) {
            console.error('Error loading live scores:', error);
        }
    }

    async loadPointsTable() {
        try {
            const response = await this.mockAPICall({
                standings: [
                    { position: 1, team: 'GT', played: 14, won: 10, lost: 4, nrr: '+0.809', points: 20 },
                    { position: 2, team: 'RR', played: 14, won: 9, lost: 5, nrr: '+0.298', points: 18 },
                    { position: 3, team: 'LSG', played: 14, won: 9, lost: 5, nrr: '+0.251', points: 18 },
                    { position: 4, team: 'RCB', played: 14, won: 8, lost: 6, nrr: '-0.253', points: 16 },
                    { position: 5, team: 'DC', played: 14, won: 7, lost: 7, nrr: '+0.204', points: 14 },
                ]
            });
            
            this.displayPointsTable(response.standings);
        } catch (error) {
            console.error('Error loading points table:', error);
        }
    }

    async loadUpcomingMatches() {
        try {
            const response = await this.mockAPICall({
                matches: [
                    { date: '2026-03-25', team1: 'CSK', team2: 'MI', venue: 'Wankhede Stadium', time: '7:30 PM' },
                    { date: '2026-03-26', team1: 'RCB', team2: 'KKR', venue: 'M Chinnaswamy Stadium', time: '3:30 PM' },
                    { date: '2026-03-26', team1: 'GT', team2: 'LSG', venue: 'Narendra Modi Stadium', time: '7:30 PM' },
                ]
            });
            
            this.displayUpcomingMatches(response.matches);
        } catch (error) {
            console.error('Error loading upcoming matches:', error);
        }
    }

    // Mock API Call (replace with real API)
    mockAPICall(data) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(data), 500);
        });
    }

    displayLiveScores(matches) {
        const container = document.getElementById('live-scores-container');
        if (!container) return;

        container.innerHTML = matches.map(match => `
            <div class="glass-card hover-lift" style="padding: 1.5rem; margin-bottom: 1.5rem; animation: slideUp 0.6s ease;">
                ${match.live ? '<div class="live-badge pulse" style="background: #ff0000; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; display: inline-block; margin-bottom: 1rem; font-size: 0.8rem; font-weight: 700;">🔴 LIVE</div>' : ''}
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center;">
                    <div style="text-align: center;">
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${match.team1}</h3>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">${match.score1}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${match.overs1} overs</p>
                    </div>
                    <div style="font-size: 2rem; color: var(--text-muted);">vs</div>
                    <div style="text-align: center;">
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${match.team2}</h3>
                        <p style="font-size: 2rem; font-weight: 700; color: var(--secondary);">${match.score2}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${match.overs2} overs</p>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <p style="color: var(--text-muted);">${match.status}</p>
                </div>
            </div>
        `).join('');
    }

    displayPointsTable(standings) {
        const container = document.getElementById('points-table-container');
        if (!container) return;

        container.innerHTML = `
            <div class="glass-card" style="padding: 2rem; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--primary);">
                            <th style="padding: 1rem; text-align: left;">#</th>
                            <th style="padding: 1rem; text-align: left;">Team</th>
                            <th style="padding: 1rem; text-align: center;">P</th>
                            <th style="padding: 1rem; text-align: center;">W</th>
                            <th style="padding: 1rem; text-align: center;">L</th>
                            <th style="padding: 1rem; text-align: center;">NRR</th>
                            <th style="padding: 1rem; text-align: center;">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standings.map((team, index) => `
                            <tr class="stagger-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); transition: all 0.3s;">
                                <td style="padding: 1rem; font-weight: 700; color: var(--primary);">${team.position}</td>
                                <td style="padding: 1rem; font-weight: 700;">${team.team}</td>
                                <td style="padding: 1rem; text-align: center;">${team.played}</td>
                                <td style="padding: 1rem; text-align: center;">${team.won}</td>
                                <td style="padding: 1rem; text-align: center;">${team.lost}</td>
                                <td style="padding: 1rem; text-align: center;">${team.nrr}</td>
                                <td style="padding: 1rem; text-align: center; font-weight: 700; color: var(--accent);">${team.points}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    displayUpcomingMatches(matches) {
        const container = document.getElementById('upcoming-matches-container');
        if (!container) return;

        container.innerHTML = matches.map((match, index) => `
            <div class="glass-card hover-lift stagger-item" style="padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">${match.date} • ${match.time}</p>
                        <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">${match.team1} vs ${match.team2}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${match.venue}</p>
                    </div>
                    <button class="ripple" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                        Set Reminder
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Advanced Animations
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });

        // Parallax Effect
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            document.querySelectorAll('.parallax-layer').forEach((layer, index) => {
                const speed = (index + 1) * 0.1;
                layer.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Interactive Features
    setupInteractions() {
        // Magnetic Button Effect
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        // Smooth Scroll
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

        // Add ripple effect to buttons
        document.querySelectorAll('.ripple').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Custom Cursor Trail (Desktop only)
        if (!this.isMobile()) {
            this.setupCursorTrail();
        }

        // Typing Effect for Hero Text
        this.typeWriterEffect();
    }

    setupCursorTrail() {
        const trail = [];
        const trailLength = 10;

        document.addEventListener('mousemove', (e) => {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail';
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
            document.body.appendChild(dot);

            trail.push(dot);

            if (trail.length > trailLength) {
                trail.shift().remove();
            }

            setTimeout(() => {
                dot.style.opacity = '0';
                setTimeout(() => dot.remove(), 300);
            }, 100);
        });
    }

    typeWriterEffect() {
        const element = document.querySelector('.typewriter-text');
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';
        element.style.display = 'inline-block';

        let i = 0;
        const speed = 100;

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    // Count Up Animation for Statistics
    animateCountUp(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Initialize count-up for visible elements
    initCountUps() {
        document.querySelectorAll('.count-up').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'));
            this.animateCountUp(el, target);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.iplHub = new IPLCricketHub();
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
