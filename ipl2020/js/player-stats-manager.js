/**
 * Player Statistics Manager
 * Admin interface for managing player cricket statistics
 * Fetches ONLY YOUR UPLOADED players from Vercel KV API
 */

let playersData = [];
let currentEditingPlayer = null;

// API Configuration
const API_BASE = window.location.origin;

// Team logo mapping
const TEAM_LOGOS = {
    'MI': 'assets/mi_logo_new.svg',
    'CSK': 'assets/csk_logo_new.svg',
    'RCB': 'assets/rcb_logo_new.svg',
    'KKR': 'assets/kkr_logo_new.svg',
    'DC': 'assets/dc_logo_new.svg',
    'SRH': 'assets/srh_logo_new.svg',
    'RR': 'assets/rr_logo_new.svg',
    'PBKS': 'assets/kxip_logo_new.svg',
    'GT': 'assets/gt_logo_new.svg',
    'LSG': 'assets/lsg_logo_new.svg'
};

// All IPL teams
const IPL_TEAMS = ['MI', 'CSK', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'GT', 'LSG'];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Clear any old localStorage cache
    localStorage.removeItem('player_stats_data');
    loadPlayers();
});

// Load players from Vercel KV API
async function loadPlayers() {
    const grid = document.getElementById('playersGrid');
    grid.innerHTML = `
        <div class="loading" style="grid-column: 1 / -1;">
            <div class="spinner"></div>
            <p>Loading your uploaded players...</p>
        </div>
    `;

    try {
        playersData = [];
        
        // Load players from Vercel KV API for all teams
        for (const team of IPL_TEAMS) {
            try {
                console.log(`Fetching ${team} players from API...`);
                const response = await fetch(`${API_BASE}/api/admin/players?team=${team}`);
                
                console.log(`${team} response status:`, response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`${team} API result:`, result);
                    
                    const teamPlayers = result.data || result || [];
                    
                    if (Array.isArray(teamPlayers) && teamPlayers.length > 0) {
                        console.log(`${team} players found:`, teamPlayers.length);
                        
                        // Add each player with team info
                        teamPlayers.forEach(player => {
                            if (player.name) {
                                playersData.push({
                                    id: `${team}_${player.name}`,
                                    name: player.name,
                                    team: team,
                                    role: player.role || player.position || 'Player',
                                    jersey: player.number || player.jersey,
                                    photo: player.photo || player.image,
                                    age: player.age,
                                    nationality: player.nationality,
                                    battingStyle: player['batting style'] || player.battingStyle,
                                    bowlingStyle: player['bowling style'] || player.bowlingStyle,
                                    allrounderType: player['allrounder type'] || player.allrounderType,
                                    isCaptain: player.isCaptain,
                                    isViceCaptain: player.isViceCaptain,
                                    isForeign: player.isForeign,
                                    stats: {
                                        matches: player.stats?.matches || 0,
                                        innings: player.stats?.innings || 0,
                                        runs: player.stats?.runs || 0,
                                        battingAvg: player.stats?.battingAvg || 0,
                                        strikeRate: player.stats?.strikeRate || 0,
                                        highestScore: player.stats?.highestScore || 0,
                                        centuries: player.stats?.centuries || 0,
                                        fifties: player.stats?.fifties || 0,
                                        sixes: player.stats?.sixes || 0,
                                        fours: player.stats?.fours || 0,
                                        wickets: player.stats?.wickets || 0,
                                        bowlingAvg: player.stats?.bowlingAvg || 0,
                                        economy: player.stats?.economy || 0,
                                        bestBowling: player.stats?.bestBowling || '',
                                        fiveWickets: player.stats?.fiveWickets || 0,
                                        fourWickets: player.stats?.fourWickets || 0,
                                        catches: player.stats?.catches || 0,
                                        stumpings: player.stats?.stumpings || 0,
                                        runOuts: player.stats?.runOuts || 0
                                    }
                                });
                            }
                        });
                    } else {
                        console.log(`${team} has no players`);
                    }
                } else {
                    console.warn(`${team} request failed:`, response.status);
                }
            } catch (err) {
                console.error(`Failed to load ${team} players:`, err);
            }
        }
        
        console.log('Total players loaded:', playersData.length);
        console.log('All players:', playersData);

        displayPlayers(playersData);
        updateStats();

    } catch (error) {
        console.error('Failed to load players:', error);
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Players</h3>
                <p>Please check your connection and try refreshing the page.</p>
            </div>
        `;
    }
}

// Display players in grid
function displayPlayers(players) {
    const grid = document.getElementById('playersGrid');
    
    if (players.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users-slash"></i>
                <h3>No Players Found</h3>
                <p>Upload players in the <a href="admin-upload.html" style="color: var(--secondary);">Admin Dashboard</a> first!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = players.map(player => `
        <div class="player-card" onclick="openEditPanel('${player.id}')">
            <div class="player-header">
                <div class="player-avatar" style="background: transparent; padding: 5px;">
                    <img src="${TEAM_LOGOS[player.team] || 'assets/ipl_logo_new.svg'}" 
                         alt="${player.team}" 
                         style="width: 100%; height: 100%; object-fit: contain;"
                         onerror="this.src='assets/ipl_logo_new.svg'">
                </div>
                <div class="player-info">
                    <h3>${player.name}</h3>
                    <div class="player-role">${player.role} • ${player.team}</div>
                </div>
            </div>
            <div class="player-stats">
                <div class="stat-item">
                    <div class="stat-value">${player.stats.runs || 0}</div>
                    <div class="stat-label-small">Runs</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${player.stats.battingAvg || 0}</div>
                    <div class="stat-label-small">Avg</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${player.stats.wickets || 0}</div>
                    <div class="stat-label-small">Wickets</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${player.stats.economy || 0}</div>
                    <div class="stat-label-small">Economy</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Open edit panel for a player
function openEditPanel(playerId) {
    const player = playersData.find(p => p.id === playerId);
    if (!player) return;

    currentEditingPlayer = player;

    // Update panel header
    document.getElementById('panelPlayerName').textContent = player.name;
    document.getElementById('panelPlayerRole').textContent = `${player.role} • ${player.team}`;

    // Fill form fields
    document.getElementById('editName').value = player.name;
    document.getElementById('editTeam').value = player.team;
    document.getElementById('editRole').value = player.role;
    document.getElementById('editJersey').value = player.jersey || '';
    document.getElementById('editPlayerId').value = player.id;

    // Fill stats
    const stats = player.stats || {};
    document.getElementById('editMatches').value = stats.matches || 0;
    document.getElementById('editInnings').value = stats.innings || 0;
    document.getElementById('editRuns').value = stats.runs || 0;
    document.getElementById('editBattingAvg').value = stats.battingAvg || 0;
    document.getElementById('editStrikeRate').value = stats.strikeRate || 0;
    document.getElementById('editHighestScore').value = stats.highestScore || 0;
    document.getElementById('editCenturies').value = stats.centuries || 0;
    document.getElementById('editFifties').value = stats.fifties || 0;
    document.getElementById('editSixes').value = stats.sixes || 0;
    document.getElementById('editFours').value = stats.fours || 0;
    document.getElementById('editWickets').value = stats.wickets || 0;
    document.getElementById('editBowlingAvg').value = stats.bowlingAvg || 0;
    document.getElementById('editEconomy').value = stats.economy || 0;
    document.getElementById('editBestBowling').value = stats.bestBowling || '';
    document.getElementById('editFiveWickets').value = stats.fiveWickets || 0;
    document.getElementById('editFourWickets').value = stats.fourWickets || 0;

    // Open panel
    document.getElementById('editPanel').classList.add('open');
}

// Close edit panel
function closePanel() {
    document.getElementById('editPanel').classList.remove('open');
    currentEditingPlayer = null;
}

// Save player stats back to localStorage
async function savePlayerStats(event) {
    event.preventDefault();

    const playerId = document.getElementById('editPlayerId').value;
    const playerIndex = playersData.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
        showToast('Player not found!', false);
        return;
    }

    const player = playersData[playerIndex];
    const team = document.getElementById('editTeam').value;

    // Update player data
    const updatedPlayer = {
        ...player,
        name: document.getElementById('editName').value,
        team: team,
        role: document.getElementById('editRole').value,
        jersey: parseInt(document.getElementById('editJersey').value) || null,
        stats: {
            matches: parseInt(document.getElementById('editMatches').value) || 0,
            innings: parseInt(document.getElementById('editInnings').value) || 0,
            runs: parseInt(document.getElementById('editRuns').value) || 0,
            battingAvg: parseFloat(document.getElementById('editBattingAvg').value) || 0,
            strikeRate: parseFloat(document.getElementById('editStrikeRate').value) || 0,
            highestScore: parseInt(document.getElementById('editHighestScore').value) || 0,
            centuries: parseInt(document.getElementById('editCenturies').value) || 0,
            fifties: parseInt(document.getElementById('editFifties').value) || 0,
            sixes: parseInt(document.getElementById('editSixes').value) || 0,
            fours: parseInt(document.getElementById('editFours').value) || 0,
            wickets: parseInt(document.getElementById('editWickets').value) || 0,
            bowlingAvg: parseFloat(document.getElementById('editBowlingAvg').value) || 0,
            economy: parseFloat(document.getElementById('editEconomy').value) || 0,
            bestBowling: document.getElementById('editBestBowling').value,
            fiveWickets: parseInt(document.getElementById('editFiveWickets').value) || 0,
            fourWickets: parseInt(document.getElementById('editFourWickets').value) || 0
        }
    };

    try {
        // Get all players for this team from Vercel KV API
        const response = await fetch(`${API_BASE}/api/admin/players?team=${team}`);
        let teamPlayers = [];
        
        if (response.ok) {
            const result = await response.json();
            teamPlayers = result.data || result || [];
        }

        // Update the player in the team array
        const index = teamPlayers.findIndex(p => p.name === player.name);
        if (index !== -1) {
            teamPlayers[index] = {
                ...teamPlayers[index],
                role: updatedPlayer.role,
                stats: updatedPlayer.stats
            };
        }

        // Save back to Vercel KV API
        const saveResponse = await fetch(`${API_BASE}/api/admin/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team, players: teamPlayers })
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save to API');
        }

        // Update local data
        playersData[playerIndex] = updatedPlayer;
        
        // Reload display
        displayPlayers(playersData);
        updateStats();
        
        // Close panel
        closePanel();
        
        showToast('✅ Player stats updated successfully!', true);

    } catch (error) {
        console.error('Save error:', error);
        showToast('❌ Failed to save player stats. Please try again.', false);
    }
}

// Delete player from localStorage
async function deletePlayer() {
    if (!currentEditingPlayer) return;

    if (!confirm(`Delete ${currentEditingPlayer.name}? This action cannot be undone.`)) {
        return;
    }

    const player = currentEditingPlayer;
    const team = player.team;

    try {
        // Get all players for this team from Vercel KV API
        const response = await fetch(`${API_BASE}/api/admin/players?team=${team}`);
        let teamPlayers = [];
        
        if (response.ok) {
            const result = await response.json();
            teamPlayers = result.data || result || [];
        }

        // Remove the player from the team array
        teamPlayers = teamPlayers.filter(p => p.name !== player.name);

        // Save back to Vercel KV API
        const saveResponse = await fetch(`${API_BASE}/api/admin/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team, players: teamPlayers })
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to delete from API');
        }

        // Remove from local data
        playersData = playersData.filter(p => p.id !== player.id);
        
        // Reload display
        displayPlayers(playersData);
        updateStats();
        
        // Close panel
        closePanel();
        
        showToast('✅ Player deleted successfully!', true);

    } catch (error) {
        console.error('Delete error:', error);
        showToast('❌ Failed to delete player. Please try again.', false);
    }
}

// Filter players
function filterPlayers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const teamFilter = document.getElementById('filterTeam').value;
    const roleFilter = document.getElementById('filterRole').value;

    let filtered = playersData;

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm)
        );
    }

    // Team filter
    if (teamFilter) {
        filtered = filtered.filter(p => p.team === teamFilter);
    }

    // Role filter
    if (roleFilter) {
        filtered = filtered.filter(p => p.role === roleFilter);
    }

    displayPlayers(filtered);
}

// Update statistics
function updateStats() {
    document.getElementById('totalPlayers').textContent = playersData.length;
    
    const batsmen = playersData.filter(p => p.role === 'Batsman' || p.role === 'Wicket-Keeper').length;
    const bowlers = playersData.filter(p => p.role === 'Bowler').length;
    const allrounders = playersData.filter(p => p.role === 'All-Rounder').length;
    
    document.getElementById('totalBatsmen').textContent = batsmen;
    document.getElementById('totalBowlers').textContent = bowlers;
    document.getElementById('totalAllrounders').textContent = allrounders;
}

// Export players data
function exportPlayers() {
    if (playersData.length === 0) {
        showToast('No players to export!', false);
        return;
    }

    const dataStr = JSON.stringify(playersData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ipl_player_stats_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('✅ Data exported successfully!', true);
}

// Show toast notification
function showToast(message, success = true) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = success ? 'toast show' : 'toast show error';
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Export functions for HTML
window.openEditPanel = openEditPanel;
window.closePanel = closePanel;
window.savePlayerStats = savePlayerStats;
window.deletePlayer = deletePlayer;
window.filterPlayers = filterPlayers;
window.exportPlayers = exportPlayers;
