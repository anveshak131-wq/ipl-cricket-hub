// Admin Panel Scripts - Player Management

// Player management
let playerCount = 0;

// Update stats on load
function updateStats() {
    let totalPlayers = 0;
    const teams = ['RCB', 'MI', 'CSK', 'SRH', 'PBSK', 'KKR', 'DC', 'RR', 'GT', 'LSG'];
    
    teams.forEach(team => {
        const key = `uploaded_${team.toLowerCase()}_players`;
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const players = JSON.parse(data);
                totalPlayers += players.length;
            } catch (e) {}
        }
    });
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
}

// Add player row
function addPlayerRow() {
    const team = document.getElementById('teamSelectManual').value;
    if (!team) {
        showError('playersManualError', 'Please select a team first');
        return;
    }
    
    playerCount++;
    const playersList = document.getElementById('playersList');
    const row = document.createElement('div');
    row.className = 'player-row';
    row.id = `player-${playerCount}`;
    
    row.innerHTML = `
        <div class="player-row-header">
            <div class="player-row-title">👤 Player ${playerCount}</div>
            <button class="btn-remove" onclick="removePlayerRow(${playerCount})">
                🗑️ Remove
            </button>
        </div>
        <div class="player-fields">
            <div class="form-group">
                <label>Name</label>
                <input type="text" class="form-control player-name" placeholder="Virat Kohli">
            </div>
            <div class="form-group">
                <label>Role</label>
                <select class="form-control player-role" onchange="toggleAllRounderType(this)">
                    <option value="">Select role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
            </div>
            <div class="form-group allrounder-type-container" style="display: none;">
                <label>All-rounder Type</label>
                <select class="form-control player-allrounder-type">
                    <option value="">Select type</option>
                    <option value="Batting All-rounder">Batting All-rounder</option>
                    <option value="Bowling All-rounder">Bowling All-rounder</option>
                </select>
            </div>
            <div class="form-group">
                <label>Age</label>
                <input type="number" class="form-control player-age" placeholder="25">
            </div>
            <div class="form-group">
                <label>Nationality</label>
                <select class="form-control player-nationality">
                    <option value="">Select nationality</option>
                    <option value="Indian">Indian</option>
                    <option value="Australian">Australian</option>
                    <option value="English">English</option>
                    <option value="South African">South African</option>
                    <option value="New Zealander">New Zealander</option>
                    <option value="Sri Lankan">Sri Lankan</option>
                    <option value="Afghan">Afghan</option>
                    <option value="Bangladeshi">Bangladeshi</option>
                    <option value="West Indian">West Indian</option>
                    <option value="Pakistani">Pakistani</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Batting Style</label>
                <select class="form-control player-batting">
                    <option value="">Select style</option>
                    <option value="Right-handed">Right-handed</option>
                    <option value="Left-handed">Left-handed</option>
                </select>
            </div>
            <div class="form-group">
                <label>Bowling Style</label>
                <select class="form-control player-bowling">
                    <option value="">Select style</option>
                    <option value="Right-arm fast">Right-arm fast</option>
                    <option value="Right-arm medium">Right-arm medium</option>
                    <option value="Right-arm offbreak">Right-arm offbreak</option>
                    <option value="Right-arm legbreak">Right-arm legbreak</option>
                    <option value="Left-arm fast">Left-arm fast</option>
                    <option value="Left-arm medium">Left-arm medium</option>
                    <option value="Left-arm orthodox">Left-arm orthodox</option>
                    <option value="Left-arm chinaman">Left-arm chinaman</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="player-captain"> Captain
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" class="player-vice-captain"> Vice-Captain
                </label>
            </div>
        </div>
    `;
    playersList.appendChild(row);
}

// Remove player row
function removePlayerRow(id) {
    const row = document.getElementById(`player-${id}`);
    if (row) {
        row.remove();
    }
}

// Toggle all-rounder type field
function toggleAllRounderType(selectEl) {
    const playerRow = selectEl.closest('.player-row');
    const allrounderTypeContainer = playerRow.querySelector('.allrounder-type-container');
    
    if (selectEl.value === 'All-rounder') {
        allrounderTypeContainer.style.display = 'block';
    } else {
        allrounderTypeContainer.style.display = 'none';
        allrounderTypeContainer.querySelector('.player-allrounder-type').value = '';
    }
}

// Save players
function savePlayers() {
    const team = document.getElementById('teamSelectManual').value;
    if (!team) {
        showError('playersManualError', 'Please select a team');
        return;
    }

    const playerRows = document.querySelectorAll('.player-row');
    if (playerRows.length === 0) {
        showError('playersManualError', 'Please add at least one player');
        return;
    }

    // Get existing players
    const key = `uploaded_${team.toLowerCase()}_players`;
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
    
    const nameMap = {};
    existing.forEach(p => {
        const n = (p.name || '').trim().toLowerCase();
        if (n) nameMap[n] = p;
    });

    let foundCaptain = false, foundViceCaptain = false;
    playerRows.forEach(row => {
        const playerRole = row.querySelector('.player-role')?.value || '';
        const allrounderType = row.querySelector('.player-allrounder-type')?.value || '';
        
        const player = {
            name: row.querySelector('.player-name')?.value.trim() || '',
            role: playerRole,
            'allrounder type': allrounderType,
            age: row.querySelector('.player-age')?.value || '',
            nationality: row.querySelector('.player-nationality')?.value || '',
            'batting style': row.querySelector('.player-batting')?.value || '',
            'bowling style': row.querySelector('.player-bowling')?.value || '',
            image: '',
            isCaptain: row.querySelector('.player-captain')?.checked || false,
            isViceCaptain: row.querySelector('.player-vice-captain')?.checked || false
        };
        
        if (player.isCaptain) foundCaptain = true;
        if (player.isViceCaptain) foundViceCaptain = true;
        
        if (player.name) {
            // Mark foreign players
            if (player.nationality && player.nationality.toLowerCase() !== 'indian') {
                player.isForeign = true;
            }
            const n = player.name.trim().toLowerCase();
            nameMap[n] = player;
        }
    });
    
    const mergedPlayers = Object.values(nameMap).sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem(key, JSON.stringify(mergedPlayers));

    // Show success
    let msg = `${mergedPlayers.length} player(s) saved for ${team}!`;
    if (foundCaptain) msg += ' (Captain set)';
    if (foundViceCaptain) msg += ' (Vice-Captain set)';
    showSuccess('playersManualSuccess', msg);
    hideError('playersManualError');

    // Clear form
    document.getElementById('playersList').innerHTML = '';
    playerCount = 0;

    // Update stats and show players
    updateStats();
    showUploadedPlayers(team);
}

// Show uploaded players
function showUploadedPlayers(team) {
    const container = document.getElementById('uploadedPlayersContainer');
    if (!team) {
        container.innerHTML = '<p class="placeholder-text">Select a team to view players.</p>';
        return;
    }
    
    const key = `uploaded_${team.toLowerCase()}_players`;
    const data = localStorage.getItem(key);
    if (!data) {
        container.innerHTML = '<p class="placeholder-text">No players uploaded for this team.</p>';
        return;
    }
    
    let players;
    try {
        players = JSON.parse(data);
    } catch (e) {
        container.innerHTML = '<p style="color: var(--error);">Error parsing player data.</p>';
        return;
    }
    
    if (!players.length) {
        container.innerHTML = '<p class="placeholder-text">No players uploaded for this team.</p>';
        return;
    }
    
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
        return (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
    });
    
    let html = '';
    players.forEach((player, index) => {
        const badges = [];
        if (player.isCaptain) badges.push('<span class="badge badge-captain">👑 Captain</span>');
        if (player.isViceCaptain) badges.push('<span class="badge badge-captain">⭐ VC</span>');
        if (player.isForeign) badges.push('<span class="badge badge-foreign">🌏 Foreign</span>');
        
        html += `
            <div class="player-card">
                <div class="player-info">
                    <h4>${player.name}</h4>
                    <p>${player.role}${player['allrounder type'] ? ' - ' + player['allrounder type'] : ''} | Age: ${player.age} | ${player.nationality}</p>
                </div>
                <div class="player-badges">
                    ${badges.join('')}
                    <button class="btn-remove" onclick="deletePlayer('${player.name}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Delete player
function deletePlayer(playerName) {
    const team = document.getElementById('teamSelectManual').value;
    if (!team) return;
    
    if (!confirm(`Are you sure you want to delete ${playerName}?`)) {
        return;
    }
    
    const key = `uploaded_${team.toLowerCase()}_players`;
    let players = JSON.parse(localStorage.getItem(key) || '[]');
    players = players.filter(p => p.name !== playerName);
    localStorage.setItem(key, JSON.stringify(players));
    
    updateStats();
    showUploadedPlayers(team);
    showSuccess('playersManualSuccess', `${playerName} deleted successfully!`);
}

// Helper functions
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

// Team selection change
document.addEventListener('DOMContentLoaded', () => {
    const teamSelect = document.getElementById('teamSelectManual');
    if (teamSelect) {
        teamSelect.addEventListener('change', (e) => {
            showUploadedPlayers(e.target.value);
        });
    }
    
    // Update stats on load
    updateStats();
});

// Console message
console.log('%cIPL Cricket Hub Admin Panel', 'color: #00D9FF; font-size: 24px; font-weight: bold;');
console.log('%cPlayer Management System Ready', 'color: #FFD700; font-size: 14px;');
