// Team names mapping for conversion
const TEAM_NAMES = {
    'MI': 'Mumbai Indians',
    'CSK': 'Chennai Super Kings',
    'RCB': 'Royal Challengers Bangalore',
    'KKR': 'Kolkata Knight Riders',
    'DC': 'Delhi Capitals',
    'SRH': 'Sunrisers Hyderabad',
    'RR': 'Rajasthan Royals',
    'PBSK': 'Punjab Kings',
    'GT': 'Gujarat Titans',
    'LSG': 'Lucknow Super Giants'
};

const LOGO_MAP = {
    'MI': 'mi_logo_new.svg',
    'CSK': 'csk_logo_new.svg',
    'RCB': 'rcb_logo_new.svg',
    'KKR': 'kkr_logo_new.svg',
    'DC': 'dc_logo_new.svg',
    'SRH': 'srh_logo_new.svg',
    'RR': 'rr_logo_new.svg',
    'PBSK': 'kxip_logo_new.svg',
    'GT': 'gt_logo_new.svg',
    'LSG': 'lsg_logo_new.svg'
};

// Load fixtures from localStorage (uploaded via admin panel)
function loadFixturesFromStorage() {
    const storedData = localStorage.getItem('uploaded_fixtures');
    if (!storedData) {
        return [];
    }
    
    try {
        const rawFixtures = JSON.parse(storedData);
        // Convert admin format to display format
        return rawFixtures.map((fixture, index) => ({
            matchNumber: index + 1,
            team1: {
                short: fixture.team1,
                full: TEAM_NAMES[fixture.team1] || fixture.team1,
                logo: LOGO_MAP[fixture.team1] || 'ipl_logo_new.svg'
            },
            team2: {
                short: fixture.team2,
                full: TEAM_NAMES[fixture.team2] || fixture.team2,
                logo: LOGO_MAP[fixture.team2] || 'ipl_logo_new.svg'
            },
            date: fixture.date,
            time: fixture.time,
            venue: fixture.venue,
            status: fixture.status || 'upcoming'
        }));
    } catch (e) {
        console.error('Error parsing fixtures data:', e);
        return [];
    }
}

// Get fixtures data
let fixturesData = loadFixturesFromStorage();

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Scroll Effect on Navbar
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll Reveal Animation
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

// Create Match Card
function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = `match-card reveal ${match.status}`;
    card.setAttribute('data-status', match.status);
    
    const statusClass = `status-${match.status}`;
    const statusText = match.status.charAt(0).toUpperCase() + match.status.slice(1);
    
    card.innerHTML = `
        <div class="match-header">
            <div class="match-number">Match ${match.matchNumber}</div>
            <div class="match-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="match-teams">
            <div class="team">
                <div class="team-logo-container">
                    <img src="${match.team1.logo}" alt="${match.team1.full}" onerror="this.src='ipl_logo_new.svg'">
                </div>
                <div class="team-info">
                    <h3>${match.team1.short}</h3>
                    <div class="team-name-full">${match.team1.full}</div>
                </div>
            </div>
            
            <div class="vs-divider">VS</div>
            
            <div class="team team-right">
                <div class="team-logo-container">
                    <img src="${match.team2.logo}" alt="${match.team2.full}" onerror="this.src='ipl_logo_new.svg'">
                </div>
                <div class="team-info">
                    <h3>${match.team2.short}</h3>
                    <div class="team-name-full">${match.team2.full}</div>
                </div>
            </div>
        </div>
        
        <div class="match-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span><strong>${match.date}</strong></span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span><strong>${match.time}</strong></span>
            </div>
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>${match.venue}</strong></span>
            </div>
        </div>
    `;
    
    return card;
}

// Load Fixtures
function loadFixtures(filter = 'all') {
    const fixturesContainer = document.getElementById('fixturesContainer');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    // Show loading
    loadingState.style.display = 'block';
    fixturesContainer.innerHTML = '';
    emptyState.style.display = 'none';
    
    setTimeout(() => {
        loadingState.style.display = 'none';
        
        // Reload data from storage in case it was updated
        fixturesData = loadFixturesFromStorage();
        
        // Update stats
        updateStats();
        
        // Check if no fixtures uploaded yet
        if (fixturesData.length === 0) {
            emptyState.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <h3>Fixtures Coming Soon</h3>
                <p>The IPL match schedule will be announced shortly.<br>
                Stay tuned for updates!</p>
            `;
            emptyState.style.display = 'block';
            return;
        }
        
        // Filter matches
        let filteredMatches = fixturesData;
        if (filter !== 'all') {
            filteredMatches = fixturesData.filter(match => match.status === filter);
        }
        
        // Show empty state if no matches in filter
        if (filteredMatches.length === 0) {
            emptyState.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <h3>No Matches Found</h3>
                <p>Try selecting a different filter</p>
            `;
            emptyState.style.display = 'block';
            return;
        }
        
        // Create and append match cards
        filteredMatches.forEach((match, index) => {
            const matchCard = createMatchCard(match);
            matchCard.style.animationDelay = `${index * 0.1}s`;
            fixturesContainer.appendChild(matchCard);
            revealObserver.observe(matchCard);
        });
    }, 800);
}

// Update stats based on fixtures data
function updateStats() {
    const totalMatches = fixturesData.length;
    const uniqueVenues = [...new Set(fixturesData.map(f => f.venue))].length;
    const liveMatches = fixturesData.filter(f => f.status === 'live').length;
    
    document.getElementById('totalMatches').textContent = totalMatches;
    document.getElementById('venues').textContent = uniqueVenues || 'TBD';
    document.getElementById('liveNow').textContent = liveMatches;
    
    // Calculate days of cricket if fixtures exist
    if (totalMatches > 0) {
        const dates = fixturesData.map(f => new Date(f.date)).filter(d => !isNaN(d));
        if (dates.length > 0) {
            const firstDate = new Date(Math.min(...dates));
            const lastDate = new Date(Math.max(...dates));
            const days = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
            document.getElementById('daysLeft').textContent = days;
        } else {
            document.getElementById('daysLeft').textContent = 'TBD';
        }
    } else {
        document.getElementById('daysLeft').textContent = 'TBD';
    }
}

// Filter Buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Load filtered fixtures
        const filter = btn.getAttribute('data-filter');
        loadFixtures(filter);
    });
});

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadFixtures('all');
});

// Console Easter Egg
console.log('%cIPL Cricket Hub Fixtures', 'color: #FF4655; font-size: 32px; font-weight: bold;');
console.log('%cNever miss a match! 🏏', 'color: #00D9FF; font-size: 16px;');
