/**
 * Player Statistics Manager
 * Admin interface for managing player cricket statistics
 */

let playersData = [];
let currentEditingPlayer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    updateStats();
});

// Load players from localStorage
function loadPlayers() {
    const stored = localStorage.getItem('player_stats_data');
    playersData = stored ? JSON.parse(stored) : [];
    displayPlayers(playersData);
    updateStats();
}

// Display players in grid
function displayPlayers(players) {
    const grid = document.getElementById('playersGrid');
    
    if (players.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users-slash"></i>
                <h3>No Players Found</h3>
                <p>Click "Import Players" to get started!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = players.map(player => `
        <div class="player-card" onclick="openEditPanel('${player.id}')">
            <div class="player-header">
                <div class="player-avatar">${player.name.charAt(0)}</div>
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

// Import players from curated database
async function importPlayers() {
    if (!confirm('Import IPL player data? This will add players from all 10 teams.')) {
        return;
    }

    showToast('Importing players...', true);

    // Curated IPL players database
    const iplPlayers = [
        // Mumbai Indians
        { name: 'Rohit Sharma', team: 'MI', role: 'Batsman', jersey: 45, stats: { matches: 243, innings: 242, runs: 6628, battingAvg: 30.42, strikeRate: 130.82, highestScore: 109, centuries: 1, fifties: 42, sixes: 264, fours: 505, wickets: 15, bowlingAvg: 33.93, economy: 8.48, bestBowling: '2/27', catches: 80 } },
        { name: 'Suryakumar Yadav', team: 'MI', role: 'Batsman', jersey: 63, stats: { matches: 135, innings: 126, runs: 3493, battingAvg: 30.11, strikeRate: 135.34, highestScore: 103, centuries: 1, fifties: 20, sixes: 188, fours: 280, wickets: 0, catches: 65 } },
        { name: 'Jasprit Bumrah', team: 'MI', role: 'Bowler', jersey: 93, stats: { matches: 133, innings: 133, runs: 56, battingAvg: 7.00, wickets: 165, bowlingAvg: 23.37, economy: 7.30, bestBowling: '5/10', fiveWickets: 1, fourWickets: 5, catches: 22 } },
        { name: 'Hardik Pandya', team: 'MI', role: 'All-Rounder', jersey: 33, stats: { matches: 107, innings: 84, runs: 2119, battingAvg: 29.01, strikeRate: 146.94, highestScore: 91, fifties: 12, sixes: 127, fours: 144, wickets: 50, bowlingAvg: 33.16, economy: 9.12, bestBowling: '3/17', catches: 50 } },
        { name: 'Ishan Kishan', team: 'MI', role: 'Wicket-Keeper', jersey: 32, stats: { matches: 82, innings: 81, runs: 2325, battingAvg: 30.92, strikeRate: 136.03, highestScore: 99, fifties: 14, sixes: 137, fours: 188, catches: 71, stumpings: 9 } },

        // Chennai Super Kings
        { name: 'MS Dhoni', team: 'CSK', role: 'Wicket-Keeper', jersey: 7, stats: { matches: 264, innings: 230, runs: 5243, battingAvg: 38.09, strikeRate: 135.92, highestScore: 84, fifties: 24, sixes: 251, fours: 368, wickets: 0, catches: 126, stumpings: 46, runOuts: 38 } },
        { name: 'Ruturaj Gaikwad', team: 'CSK', role: 'Batsman', jersey: 31, stats: { matches: 55, innings: 55, runs: 2380, battingAvg: 44.15, strikeRate: 136.36, highestScore: 101, centuries: 1, fifties: 16, sixes: 103, fours: 238, catches: 27 } },
        { name: 'Ravindra Jadeja', team: 'CSK', role: 'All-Rounder', jersey: 8, stats: { matches: 240, innings: 179, runs: 2859, battingAvg: 26.29, strikeRate: 126.77, highestScore: 62, fifties: 11, sixes: 98, fours: 212, wickets: 145, bowlingAvg: 30.65, economy: 7.69, bestBowling: '5/16', fiveWickets: 1, catches: 91, runOuts: 32 } },
        { name: 'Deepak Chahar', team: 'CSK', role: 'Bowler', jersey: 90, stats: { matches: 73, innings: 73, runs: 92, battingAvg: 9.20, wickets: 82, bowlingAvg: 27.82, economy: 8.03, bestBowling: '6/7', fiveWickets: 2, fourWickets: 2, catches: 23 } },

        // Royal Challengers Bangalore
        { name: 'Virat Kohli', team: 'RCB', role: 'Batsman', jersey: 18, stats: { matches: 251, innings: 242, runs: 8004, battingAvg: 37.25, strikeRate: 130.02, highestScore: 113, centuries: 8, fifties: 55, sixes: 251, fours: 762, wickets: 4, catches: 122 } },
        { name: 'Faf du Plessis', team: 'RCB', role: 'Batsman', jersey: 19, stats: { matches: 125, innings: 125, runs: 3646, battingAvg: 32.35, strikeRate: 128.90, highestScore: 96, fifties: 23, sixes: 118, fours: 365, catches: 70 } },
        { name: 'Glenn Maxwell', team: 'RCB', role: 'All-Rounder', jersey: 32, stats: { matches: 128, innings: 118, runs: 2858, battingAvg: 26.52, strikeRate: 152.61, highestScore: 95, fifties: 15, sixes: 174, fours: 189, wickets: 34, bowlingAvg: 30.29, economy: 7.62, catches: 68 } },
        { name: 'Mohammed Siraj', team: 'RCB', role: 'Bowler', jersey: 13, stats: { matches: 93, innings: 93, runs: 37, battingAvg: 6.16, wickets: 93, bowlingAvg: 30.16, economy: 8.54, bestBowling: '4/21', fourWickets: 3, catches: 22 } },

        // Kolkata Knight Riders
        { name: 'Shreyas Iyer', team: 'KKR', role: 'Batsman', jersey: 41, stats: { matches: 115, innings: 112, runs: 3570, battingAvg: 33.14, strikeRate: 127.32, highestScore: 96, fifties: 26, sixes: 124, fours: 332, catches: 62 } },
        { name: 'Andre Russell', team: 'KKR', role: 'All-Rounder', jersey: 12, stats: { matches: 115, innings: 101, runs: 2458, battingAvg: 27.33, strikeRate: 177.88, highestScore: 88, fifties: 13, sixes: 213, fours: 133, wickets: 79, bowlingAvg: 32.81, economy: 9.42, bestBowling: '5/15', fiveWickets: 1, catches: 67 } },
        { name: 'Sunil Narine', team: 'KKR', role: 'All-Rounder', jersey: 74, stats: { matches: 162, innings: 115, runs: 1144, battingAvg: 14.67, strikeRate: 163.84, highestScore: 75, sixes: 116, fours: 79, wickets: 167, bowlingAvg: 26.74, economy: 6.79, bestBowling: '4/20', fourWickets: 3, catches: 48 } },

        // Delhi Capitals
        { name: 'David Warner', team: 'DC', role: 'Batsman', jersey: 31, stats: { matches: 176, innings: 176, runs: 6565, battingAvg: 40.52, strikeRate: 139.96, highestScore: 126, centuries: 4, fifties: 62, sixes: 257, fours: 647, catches: 96 } },
        { name: 'Rishabh Pant', team: 'DC', role: 'Wicket-Keeper', jersey: 17, stats: { matches: 110, innings: 103, runs: 3284, battingAvg: 34.66, strikeRate: 147.97, highestScore: 128, centuries: 1, fifties: 16, sixes: 171, fours: 267, catches: 92, stumpings: 24 } },
        { name: 'Axar Patel', team: 'DC', role: 'All-Rounder', jersey: 20, stats: { matches: 125, innings: 78, runs: 971, battingAvg: 20.23, strikeRate: 132.60, highestScore: 64, fifties: 1, sixes: 46, fours: 74, wickets: 124, bowlingAvg: 26.85, economy: 7.32, bestBowling: '4/22', fourWickets: 2, catches: 56 } },

        // Sunrisers Hyderabad
        { name: 'Aiden Markram', team: 'SRH', role: 'Batsman', jersey: 4, stats: { matches: 28, innings: 27, runs: 726, battingAvg: 29.04, strikeRate: 140.85, highestScore: 68, fifties: 5, sixes: 41, fours: 70, wickets: 6, catches: 16 } },
        { name: 'Bhuvneshwar Kumar', team: 'SRH', role: 'Bowler', jersey: 15, stats: { matches: 155, innings: 155, runs: 150, battingAvg: 9.37, wickets: 181, bowlingAvg: 24.96, economy: 7.23, bestBowling: '5/19', fiveWickets: 1, fourWickets: 6, catches: 42 } },

        // Rajasthan Royals
        { name: 'Sanju Samson', team: 'RR', role: 'Wicket-Keeper', jersey: 9, stats: { matches: 166, innings: 159, runs: 4430, battingAvg: 30.68, strikeRate: 136.24, highestScore: 119, centuries: 3, fifties: 25, sixes: 194, fours: 405, catches: 133, stumpings: 19 } },
        { name: 'Jos Buttler', team: 'RR', role: 'Wicket-Keeper', jersey: 63, stats: { matches: 98, innings: 97, runs: 3469, battingAvg: 37.07, strikeRate: 147.47, highestScore: 124, centuries: 2, fifties: 22, sixes: 169, fours: 333, catches: 80, stumpings: 22 } },
        { name: 'Yuzvendra Chahal', team: 'RR', role: 'Bowler', jersey: 3, stats: { matches: 153, innings: 153, runs: 67, battingAvg: 6.70, wickets: 205, bowlingAvg: 22.22, economy: 7.76, bestBowling: '5/40', fiveWickets: 1, fourWickets: 9, catches: 48 } },

        // Punjab Kings
        { name: 'Shikhar Dhawan', team: 'PBKS', role: 'Batsman', jersey: 25, stats: { matches: 222, innings: 221, runs: 6769, battingAvg: 35.41, strikeRate: 127.04, highestScore: 106, centuries: 2, fifties: 51, sixes: 125, fours: 803, catches: 88 } },
        { name: 'Arshdeep Singh', team: 'PBKS', role: 'Bowler', jersey: 36, stats: { matches: 75, innings: 75, runs: 23, battingAvg: 5.75, wickets: 96, bowlingAvg: 21.54, economy: 8.23, bestBowling: '5/32', fiveWickets: 1, fourWickets: 3, catches: 20 } },

        // Gujarat Titans
        { name: 'Shubman Gill', team: 'GT', role: 'Batsman', jersey: 77, stats: { matches: 99, innings: 97, runs: 3254, battingAvg: 34.21, strikeRate: 130.01, highestScore: 129, centuries: 1, fifties: 25, sixes: 87, fours: 351, catches: 50 } },
        { name: 'Rashid Khan', team: 'GT', role: 'All-Rounder', jersey: 19, stats: { matches: 119, innings: 67, runs: 423, battingAvg: 13.64, strikeRate: 156.87, sixes: 41, fours: 29, wickets: 159, bowlingAvg: 20.51, economy: 6.61, bestBowling: '4/24', fourWickets: 5, catches: 44 } },

        // Lucknow Super Giants
        { name: 'KL Rahul', team: 'LSG', role: 'Wicket-Keeper', jersey: 1, stats: { matches: 132, innings: 131, runs: 4683, battingAvg: 45.47, strikeRate: 134.62, highestScore: 132, centuries: 4, fifties: 32, sixes: 187, fours: 444, catches: 83, stumpings: 16 } },
        { name: 'Marcus Stoinis', team: 'LSG', role: 'All-Rounder', jersey: 32, stats: { matches: 79, innings: 68, runs: 1321, battingAvg: 24.09, strikeRate: 135.68, highestScore: 95, fifties: 7, sixes: 65, fours: 99, wickets: 37, bowlingAvg: 35.89, economy: 9.27, catches: 25 } },
    ];

    try {
        let addedCount = 0;

        for (let i = 0; i < iplPlayers.length; i++) {
            const player = iplPlayers[i];
            
            // Check if player already exists
            const exists = playersData.some(p => 
                p.name.toLowerCase() === player.name.toLowerCase() && p.team === player.team
            );
            
            if (!exists) {
                player.id = Date.now() + i + Math.random().toString(36).substr(2, 9);
                player.createdAt = new Date().toISOString();
                playersData.push(player);
                addedCount++;
            }
            
            // Show progress
            if ((i + 1) % 5 === 0) {
                showToast(`Imported ${i + 1}/${iplPlayers.length} players...`, true);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Save to localStorage
        localStorage.setItem('player_stats_data', JSON.stringify(playersData));
        
        // Reload display
        loadPlayers();
        
        showToast(`✅ Successfully imported ${addedCount} players! Total: ${playersData.length} players`, true);
        
    } catch (error) {
        console.error('Import error:', error);
        showToast('Failed to import players. Please try again.', false);
    }
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
    document.getElementById('editCatches').value = stats.catches || 0;
    document.getElementById('editStumpings').value = stats.stumpings || 0;
    document.getElementById('editRunOuts').value = stats.runOuts || 0;

    // Open panel
    document.getElementById('editPanel').classList.add('open');
}

// Close edit panel
function closePanel() {
    document.getElementById('editPanel').classList.remove('open');
    currentEditingPlayer = null;
}

// Save player stats
function savePlayerStats(event) {
    event.preventDefault();

    const playerId = document.getElementById('editPlayerId').value;
    const playerIndex = playersData.findIndex(p => p.id === playerId);

    if (playerIndex === -1) return;

    // Update player data
    playersData[playerIndex] = {
        ...playersData[playerIndex],
        name: document.getElementById('editName').value,
        team: document.getElementById('editTeam').value,
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
            fourWickets: parseInt(document.getElementById('editFourWickets').value) || 0,
            catches: parseInt(document.getElementById('editCatches').value) || 0,
            stumpings: parseInt(document.getElementById('editStumpings').value) || 0,
            runOuts: parseInt(document.getElementById('editRunOuts').value) || 0
        },
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('player_stats_data', JSON.stringify(playersData));

    // Reload display
    loadPlayers();

    // Close panel
    closePanel();

    showToast('✅ Player stats updated successfully!', true);
}

// Delete player
function deletePlayer() {
    if (!currentEditingPlayer) return;

    if (!confirm(`Delete ${currentEditingPlayer.name}? This action cannot be undone.`)) {
        return;
    }

    const playerId = currentEditingPlayer.id;
    playersData = playersData.filter(p => p.id !== playerId);

    // Save to localStorage
    localStorage.setItem('player_stats_data', JSON.stringify(playersData));

    // Reload display
    loadPlayers();

    // Close panel
    closePanel();

    showToast('✅ Player deleted successfully!', true);
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
    const dataStr = JSON.stringify(playersData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ipl_players_${new Date().toISOString().split('T')[0]}.json`;
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
window.importPlayers = importPlayers;
window.openEditPanel = openEditPanel;
window.closePanel = closePanel;
window.savePlayerStats = savePlayerStats;
window.deletePlayer = deletePlayer;
window.filterPlayers = filterPlayers;
window.exportPlayers = exportPlayers;
