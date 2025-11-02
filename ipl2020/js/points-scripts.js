// Initial Teams Data (before any matches)
const initialTeamsData = [
    { 
        rank: 1, 
        name: "Mumbai Indians", 
        short: "MI", 
        logo: "mi_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 2, 
        name: "Chennai Super Kings", 
        short: "CSK", 
        logo: "csk_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 3, 
        name: "Royal Challengers Bangalore", 
        short: "RCB", 
        logo: "rcb_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 4, 
        name: "Gujarat Titans", 
        short: "GT", 
        logo: "gt_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 5, 
        name: "Kolkata Knight Riders", 
        short: "KKR", 
        logo: "kkr_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 6, 
        name: "Rajasthan Royals", 
        short: "RR", 
        logo: "rr_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 7, 
        name: "Delhi Capitals", 
        short: "DC", 
        logo: "dc_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 8, 
        name: "Lucknow Super Giants", 
        short: "LSG", 
        logo: "lsg_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 9, 
        name: "Punjab Kings", 
        short: "PBSK", 
        logo: "kxip_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    },
    { 
        rank: 10, 
        name: "Sunrisers Hyderabad", 
        short: "SRH", 
        logo: "srh_logo_new.svg", 
        matches: 0, 
        won: 0, 
        lost: 0, 
        nr: 0, 
        points: 0, 
        nrr: 0.00, 
        form: [],
        qualified: false
    }
];

// Load data from localStorage (uploaded via admin panel)
function loadPointsDataFromStorage() {
    const storedData = localStorage.getItem('ipl_points_table');
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error('Error parsing points data:', e);
            return initialTeamsData;
        }
    }
    return initialTeamsData;
}

// Get current teams data
let teamsData = loadPointsDataFromStorage();

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

// Create Table Row
function createTableRow(team) {
    const tr = document.createElement('tr');
    tr.className = `rank-${team.rank} ${team.qualified ? 'qualified' : ''}`;
    
    const nrrClass = team.nrr >= 0 ? 'nrr-positive' : 'nrr-negative';
    const nrrSign = team.nrr >= 0 ? '+' : '';
    
    const formBadges = team.form && team.form.length > 0 
        ? team.form.map(result => 
            `<span class="form-badge ${result === 'W' ? 'win' : 'loss'}">${result}</span>`
          ).join('')
        : '<span style="color: var(--text-muted); font-size: 0.875rem;">No matches yet</span>';
    
    tr.innerHTML = `
        <td class="rank-col">
            <div class="rank-indicator">${team.rank}</div>
        </td>
        <td class="team-col">
            <div class="team-cell">
                <div class="team-logo">
                    <img src="${team.logo}" alt="${team.name}" onerror="this.src='ipl_logo_new.svg'">
                </div>
                <div class="team-info">
                    <h3>${team.name}</h3>
                    <div class="team-short">${team.short}</div>
                </div>
            </div>
        </td>
        <td class="stat-col">${team.matches}</td>
        <td class="stat-col"><span class="stat-highlight">${team.won}</span></td>
        <td class="stat-col">${team.lost}</td>
        <td class="stat-col">${team.nr}</td>
        <td class="stat-col"><span class="stat-highlight">${team.points}</span></td>
        <td class="stat-col ${nrrClass}"><strong>${nrrSign}${team.nrr.toFixed(2)}</strong></td>
        <td class="form-col">
            <div class="form-badges">${formBadges}</div>
        </td>
    `;
    
    return tr;
}

// Load Points Table
function loadPointsTable(sortBy = 'points') {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // Sort teams
    let sortedTeams = [...teamsData];
    if (sortBy === 'nrr') {
        sortedTeams.sort((a, b) => b.nrr - a.nrr);
    } else {
        sortedTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.nrr - a.nrr;
        });
    }
    
    // Update ranks
    sortedTeams.forEach((team, index) => {
        team.rank = index + 1;
    });
    
    // Create and append rows
    sortedTeams.forEach((team, index) => {
        const row = createTableRow(team);
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('reveal');
        tableBody.appendChild(row);
        revealObserver.observe(row);
    });
    
    // Calculate total matches played and qualified teams
    const totalMatchesPlayed = sortedTeams.reduce((sum, team) => sum + team.matches, 0);
    const qualifiedCount = sortedTeams.filter(team => team.qualified).length;
    
    // Update stats based on whether matches have been played
    if (totalMatchesPlayed === 0) {
        // No matches played yet
        document.getElementById('topTeam').textContent = 'TBD';
        document.getElementById('topNRR').textContent = '-';
        document.getElementById('matchesPlayed').textContent = '0';
        document.getElementById('qualified').textContent = '0';
    } else {
        // Matches have been played
        document.getElementById('topTeam').textContent = sortedTeams[0].short;
        
        const topNRR = Math.max(...sortedTeams.map(t => t.nrr));
        const topNRRSign = topNRR >= 0 ? '+' : '';
        document.getElementById('topNRR').textContent = `${topNRRSign}${topNRR.toFixed(2)}`;
        
        document.getElementById('matchesPlayed').textContent = totalMatchesPlayed;
        document.getElementById('qualified').textContent = qualifiedCount;
    }
}

// Sort Table
function sortTable(sortBy) {
    loadPointsTable(sortBy);
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadPointsTable('points');
});

// Console Easter Egg
console.log('%cIPL Cricket Hub Points Table', 'color: #FFD700; font-size: 32px; font-weight: bold;');
console.log('%cWho will lift the trophy? 🏆', 'color: #FF4655; font-size: 16px;');
