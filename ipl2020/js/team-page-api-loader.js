/**
 * Team Page API Loader
 * Loads players from Vercel KV API instead of localStorage
 */

const API_BASE = window.location.origin;
const TEAM_CODE = document.body.dataset.team || 'RCB'; // Get team from body data attribute

// Load players from Vercel KV API
async function loadPlayersFromAPI() {
    try {
        console.log(`Loading ${TEAM_CODE} players from Vercel KV...`);
        const response = await fetch(`${API_BASE}/api/admin/players?team=${TEAM_CODE}`);
        
        if (!response.ok) {
            console.error('Failed to fetch players:', response.status);
            return [];
        }
        
        const result = await response.json();
        const players = result.data || result || [];
        
        console.log(`Loaded ${players.length} ${TEAM_CODE} players from Vercel KV`);
        return players;
        
    } catch (error) {
        console.error('Error loading players:', error);
        return [];
    }
}

// Display players on the page
async function displayTeamPlayers() {
    const container = document.getElementById('playersContainer');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #A1A1AA;">Loading players...</div>';
    
    const players = await loadPlayersFromAPI();
    
    if (players.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #A1A1AA;">No players uploaded yet.</div>';
        return;
    }
    
    // Sort players by role
    const roleOrder = { 'batsman': 1, 'wicket-keeper': 2, 'all-rounder': 3, 'bowler': 4 };
    players.sort((a, b) => {
        const orderA = roleOrder[(a.role || '').toLowerCase()] || 99;
        const orderB = roleOrder[(b.role || '').toLowerCase()] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return parseInt(b.age || 0) - parseInt(a.age || 0);
    });
    
    // Generate HTML for each player
    const playersHTML = players.map(player => {
        const badges = [];
        if (player.isCaptain) badges.push('<span class="player-badge badge-captain">👑 Captain</span>');
        if (player.isViceCaptain) badges.push('<span class="player-badge badge-vc">⭐ VC</span>');
        if (player.isForeign) badges.push('<span class="player-badge badge-overseas">🌏</span>');
        
        return `
            <div class="player-card" onclick='showPlayerModal(${JSON.stringify(player).replace(/'/g, "&#39;")})'>
                <div class="player-image">
                    ${player.photo ? 
                        `<img src="${player.photo}" alt="${player.name}" onerror="this.src='assets/default-player.png'">` :
                        `<div class="player-placeholder">${(player.name || 'P').charAt(0)}</div>`
                    }
                </div>
                <div class="player-info">
                    <h3 class="player-name">${player.name || 'Unknown'}</h3>
                    <p class="player-role">${player.role || 'Player'}</p>
                    ${badges.length > 0 ? `<div class="player-badges">${badges.join('')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = playersHTML;
}

// Modal functions
function showPlayerModal(player) {
    const modal = document.getElementById('playerModal');
    const modalName = document.getElementById('modalPlayerName');
    const modalRole = document.getElementById('modalPlayerRole');
    const modalBadges = document.getElementById('modalPlayerBadges');
    const modalDetails = document.getElementById('modalPlayerDetails');

    // Set basic info
    modalName.textContent = player.name || 'Unknown Player';
    modalRole.textContent = player.role || 'Player';

    // Set badges
    let badgesHTML = '';
    if (player.isCaptain) badgesHTML += '<span class="modal-badge badge-captain">👑 Captain</span>';
    if (player.isViceCaptain) badgesHTML += '<span class="modal-badge badge-captain">⭐ Vice Captain</span>';
    if (player.isForeign) badgesHTML += '<span class="modal-badge badge-foreign">🌏 Overseas</span>';
    if ((player.role || '').toLowerCase() === 'wicket-keeper') badgesHTML += '<span class="modal-badge badge-wk">🧤 Wicket-Keeper</span>';
    modalBadges.innerHTML = badgesHTML;

    // Set detailed information including STATS
    const allrounderType = player['allrounder type'] || player['Allrounder Type'] || '';
    const stats = player.stats || {};
    
    let detailsHTML = `
        ${player.age ? `<div class="detail-item"><div class="detail-label">AGE</div><div class="detail-value">${player.age}</div></div>` : ''}
        ${player.nationality ? `<div class="detail-item"><div class="detail-label">NATIONALITY</div><div class="detail-value">${player.nationality}</div></div>` : ''}
        ${player['batting style'] || player.Batting ? `<div class="detail-item"><div class="detail-label">BATTING STYLE</div><div class="detail-value">${player['batting style'] || player.Batting}</div></div>` : ''}
        ${player['bowling style'] || player.Bowling ? `<div class="detail-item"><div class="detail-label">BOWLING STYLE</div><div class="detail-value">${player['bowling style'] || player.Bowling}</div></div>` : ''}
        ${allrounderType ? `<div class="detail-item"><div class="detail-label">ALL-ROUNDER TYPE</div><div class="detail-value">${allrounderType}</div></div>` : ''}
    `;
    
    // Add batting stats if available
    if (stats.runs || stats.battingAvg || stats.strikeRate) {
        detailsHTML += '<div class="stats-section"><h4>⚡ Batting Stats</h4>';
        if (stats.matches) detailsHTML += `<div class="stat-item"><span>Matches:</span> <strong>${stats.matches}</strong></div>`;
        if (stats.runs) detailsHTML += `<div class="stat-item"><span>Runs:</span> <strong>${stats.runs}</strong></div>`;
        if (stats.battingAvg) detailsHTML += `<div class="stat-item"><span>Average:</span> <strong>${stats.battingAvg}</strong></div>`;
        if (stats.strikeRate) detailsHTML += `<div class="stat-item"><span>Strike Rate:</span> <strong>${stats.strikeRate}</strong></div>`;
        if (stats.highestScore) detailsHTML += `<div class="stat-item"><span>Highest:</span> <strong>${stats.highestScore}</strong></div>`;
        if (stats.centuries) detailsHTML += `<div class="stat-item"><span>100s:</span> <strong>${stats.centuries}</strong></div>`;
        if (stats.fifties) detailsHTML += `<div class="stat-item"><span>50s:</span> <strong>${stats.fifties}</strong></div>`;
        if (stats.sixes) detailsHTML += `<div class="stat-item"><span>6s:</span> <strong>${stats.sixes}</strong></div>`;
        if (stats.fours) detailsHTML += `<div class="stat-item"><span>4s:</span> <strong>${stats.fours}</strong></div>`;
        detailsHTML += '</div>';
    }
    
    // Add bowling stats if available
    if (stats.wickets || stats.economy || stats.bowlingAvg) {
        detailsHTML += '<div class="stats-section"><h4>🎯 Bowling Stats</h4>';
        if (stats.wickets) detailsHTML += `<div class="stat-item"><span>Wickets:</span> <strong>${stats.wickets}</strong></div>`;
        if (stats.bowlingAvg) detailsHTML += `<div class="stat-item"><span>Average:</span> <strong>${stats.bowlingAvg}</strong></div>`;
        if (stats.economy) detailsHTML += `<div class="stat-item"><span>Economy:</span> <strong>${stats.economy}</strong></div>`;
        if (stats.bestBowling) detailsHTML += `<div class="stat-item"><span>Best:</span> <strong>${stats.bestBowling}</strong></div>`;
        if (stats.fiveWickets) detailsHTML += `<div class="stat-item"><span>5W:</span> <strong>${stats.fiveWickets}</strong></div>`;
        if (stats.fourWickets) detailsHTML += `<div class="stat-item"><span>4W:</span> <strong>${stats.fourWickets}</strong></div>`;
        detailsHTML += '</div>';
    }
    
    modalDetails.innerHTML = detailsHTML;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePlayerModal() {
    const modal = document.getElementById('playerModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', displayTeamPlayers);

// Close modal on background click
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('playerModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closePlayerModal();
            }
        });
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlayerModal();
});
