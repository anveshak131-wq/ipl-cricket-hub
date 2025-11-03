/**
 * Team Page Player Loader
 * Loads player data from backend API or localStorage fallback
 */

const BACKEND_API_URL = 'https://ipl-backend-api.vercel.app'; // Update with your deployed backend URL

/**
 * Load players for a team page
 * @param {string} teamCode - Team code (e.g., 'rcb', 'mi', 'csk')
 */
async function loadTeamPlayers(teamCode) {
    const storageKey = `uploaded_${teamCode.toLowerCase()}_players`;
    const playersContainer = document.getElementById('playersContainer');
    
    if (!playersContainer) {
        console.error('Players container not found');
        return;
    }
    
    // Show loading state
    playersContainer.innerHTML = '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">Loading players...</div>';
    
    let players = [];
    
    // Try to fetch from backend API first
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/players/${teamCode}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.players && data.players.length > 0) {
                players = data.players;
                console.log(`✅ Loaded ${players.length} players from backend API`);
                
                // Save to localStorage for offline access
                localStorage.setItem(storageKey, JSON.stringify(players));
            }
        }
    } catch (error) {
        console.warn('Backend API not available, falling back to localStorage:', error.message);
    }
    
    // Fallback to localStorage if backend failed
    if (players.length === 0) {
        const localData = localStorage.getItem(storageKey);
        if (localData) {
            try {
                players = JSON.parse(localData);
                console.log(`📦 Loaded ${players.length} players from localStorage`);
            } catch (e) {
                console.error('Error parsing localStorage data:', e);
            }
        }
    }
    
    // Display players or show message
    if (players.length > 0) {
        displayPlayers(players, teamCode);
    } else {
        showNoPlayersMessage(playersContainer, teamCode);
    }
}

/**
 * Display players on the page
 */
function displayPlayers(players, teamCode) {
    const playersContainer = document.getElementById('playersContainer');
    
    // Sort players by role
    const roleOrder = {
        'batsman': 1,
        'wicket-keeper': 2,
        'all-rounder': 3,
        'bowler': 4
    };
    
    players.sort((a, b) => {
        const roleA = (a.role || '').toLowerCase();
        const roleB = (b.role || '').toLowerCase();
        const orderA = roleOrder[roleA] || 99;
        const orderB = roleOrder[roleB] || 99;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        const ageA = parseInt(a.age || 0);
        const ageB = parseInt(b.age || 0);
        return ageB - ageA;
    });
    
    // Update stats
    const playerCount = document.getElementById('playerCount');
    const foreignCount = document.getElementById('foreignCount');
    const indianCount = document.getElementById('indianCount');
    
    if (playerCount) playerCount.textContent = players.length;
    if (foreignCount) foreignCount.textContent = players.filter(p => p.isForeign).length;
    if (indianCount) indianCount.textContent = players.filter(p => !p.isForeign).length;
    
    // Create player cards
    playersContainer.innerHTML = '';
    players.forEach(player => {
        const card = createPlayerCard(player, teamCode);
        playersContainer.appendChild(card);
    });
}

/**
 * Create a player card element
 */
function createPlayerCard(player, teamCode) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    let badges = '';
    if (player.isCaptain) badges += '<span class="badge badge-captain">👑 Captain</span>';
    if (player.isViceCaptain) badges += '<span class="badge badge-captain">⭐ Vice Captain</span>';
    if (player.isForeign) badges += '<span class="badge badge-foreign">🌏 Overseas</span>';
    if ((player.role || '').toLowerCase() === 'wicket-keeper') badges += '<span class="badge badge-wk">🧤 WK</span>';
    
    const teamLogo = `assets/${teamCode.toLowerCase()}_logo_new.svg`;
    
    card.innerHTML = `
        <div class="player-image">
            <img src="${teamLogo}" alt="${player.name || 'Player'}" onerror="this.src='assets/ipl_logo_new.svg'">
        </div>
        <h3 class="player-name">${player.name || 'Unknown'}</h3>
        <p class="player-role">${player.role || 'Player'}</p>
        <div class="player-badges">
            ${badges}
        </div>
    `;
    
    // Add click event to show modal
    card.addEventListener('click', () => {
        if (typeof showPlayerModal === 'function') {
            showPlayerModal(player);
        }
    });
    card.style.cursor = 'pointer';
    
    return card;
}

/**
 * Show message when no players found
 */
function showNoPlayersMessage(container, teamCode) {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.7);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">🏏 No players found for ${teamCode.toUpperCase()}</p>
            <p style="font-size: 0.9rem;">Players will be available once uploaded by the admin.</p>
        </div>
    `;
    
    // Reset stats to 0
    const playerCount = document.getElementById('playerCount');
    const foreignCount = document.getElementById('foreignCount');
    const indianCount = document.getElementById('indianCount');
    
    if (playerCount) playerCount.textContent = '0';
    if (foreignCount) foreignCount.textContent = '0';
    if (indianCount) indianCount.textContent = '0';
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamPage);
} else {
    initTeamPage();
}

function initTeamPage() {
    // Try to detect team code from page URL or title
    const path = window.location.pathname;
    const teamMatch = path.match(/\/([a-z]{2,5})\.html/i);
    
    if (teamMatch) {
        const teamCode = teamMatch[1].toLowerCase();
        loadTeamPlayers(teamCode);
    } else {
        console.warn('Could not detect team code from URL');
    }
}
