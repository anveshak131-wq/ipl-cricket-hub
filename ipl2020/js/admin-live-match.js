/**
 * Admin Live Match Control
 * Manage live match stats, players, AI insights, and key moments
 */

// Current selected players
let selectedPlayers = {
    batsman1: null,
    batsman2: null,
    bowler: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏏 Live Match Control Loading...');
    
    // Load current live status
    loadLiveStatus();
    
    // Load fixtures
    loadFixtures();
    
    // Load saved data
    loadSavedData();
    
    // Load key moments
    loadKeyMoments();
    
    console.log('✅ Live Match Control Loaded');
});

// ===== LIVE STATUS =====

function toggleLiveStatus() {
    const toggle = document.getElementById('liveToggle');
    const label = document.getElementById('liveStatusLabel');
    
    const isLive = toggle.checked;
    
    // Save live status
    const liveStatus = {
        isLive: isLive,
        timestamp: Date.now()
    };
    
    localStorage.setItem('live_match_status', JSON.stringify(liveStatus));
    
    // Update label
    if (isLive) {
        label.textContent = 'Match LIVE';
        label.classList.add('active');
        showToast('✅ Match is now LIVE!');
    } else {
        label.textContent = 'Match Inactive';
        label.classList.remove('active');
        showToast('⚠️ Match set to Inactive');
    }
}

function loadLiveStatus() {
    const liveStatus = JSON.parse(localStorage.getItem('live_match_status') || '{"isLive":false}');
    const toggle = document.getElementById('liveToggle');
    const label = document.getElementById('liveStatusLabel');
    
    toggle.checked = liveStatus.isLive;
    
    if (liveStatus.isLive) {
        label.textContent = 'Match LIVE';
        label.classList.add('active');
    } else {
        label.textContent = 'Match Inactive';
        label.classList.remove('active');
    }
}

// ===== FIXTURES =====

function loadFixtures() {
    const fixtures = JSON.parse(localStorage.getItem('fixtures') || '[]');
    const fixtureSelect = document.getElementById('fixtureSelect');
    
    if (fixtures.length === 0) {
        fixtureSelect.innerHTML = '<option value="">-- No fixtures available --</option>';
        return;
    }
    
    const options = fixtures.map((fixture, index) => {
        return `<option value="${index}">${fixture.team1} vs ${fixture.team2} - ${fixture.date} ${fixture.time}</option>`;
    }).join('');
    
    fixtureSelect.innerHTML = '<option value="">-- Select from Fixtures --</option>' + options;
}

function selectFixture() {
    const fixtureSelect = document.getElementById('fixtureSelect');
    const index = fixtureSelect.value;
    
    if (!index) {
        document.getElementById('selectedMatch').style.display = 'none';
        return;
    }
    
    const fixtures = JSON.parse(localStorage.getItem('fixtures') || '[]');
    const fixture = fixtures[index];
    
    if (!fixture) return;
    
    // Display selected match
    document.getElementById('matchTitle').textContent = `${fixture.team1} vs ${fixture.team2}`;
    document.getElementById('matchInfo').textContent = `${fixture.date} • ${fixture.time} • ${fixture.venue}`;
    document.getElementById('selectedMatch').style.display = 'block';
    
    // Auto-select teams
    document.getElementById('teamASelect').value = fixture.team1;
    document.getElementById('teamBSelect').value = fixture.team2;
    
    // Load players from both teams
    loadBothTeamsPlayers();
}

// ===== TEAM PLAYERS (BOTH TEAMS) =====

function loadBothTeamsPlayers() {
    const teamACode = document.getElementById('teamASelect').value;
    const teamBCode = document.getElementById('teamBSelect').value;
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    
    console.log('🔍 Loading players for:', { teamA: teamACode, teamB: teamBCode });
    
    if (!teamACode && !teamBCode) {
        playersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>Select teams to view players</p>
            </div>
        `;
        playerCount.textContent = '0 players';
        populatePlayerDropdowns([]);
        return;
    }
    
    let allPlayers = [];
    
    // Load Team A players (use lowercase for localStorage key)
    if (teamACode) {
        const keyA = `uploaded_${teamACode.toLowerCase()}_players`;
        console.log('📦 Loading from localStorage key:', keyA);
        const teamAData = localStorage.getItem(keyA);
        console.log('📊 Team A raw data:', teamAData);
        
        try {
            const teamAPlayers = JSON.parse(teamAData || '[]');
            console.log('✅ Team A players loaded:', teamAPlayers.length);
            teamAPlayers.forEach(player => {
                allPlayers.push({ ...player, team: teamACode, teamType: 'Team A (Batting)' });
            });
        } catch (e) {
            console.error('❌ Error parsing Team A players:', e);
        }
    }
    
    // Load Team B players (use lowercase for localStorage key)
    if (teamBCode) {
        const keyB = `uploaded_${teamBCode.toLowerCase()}_players`;
        console.log('📦 Loading from localStorage key:', keyB);
        const teamBData = localStorage.getItem(keyB);
        console.log('📊 Team B raw data:', teamBData);
        
        try {
            const teamBPlayers = JSON.parse(teamBData || '[]');
            console.log('✅ Team B players loaded:', teamBPlayers.length);
            teamBPlayers.forEach(player => {
                allPlayers.push({ ...player, team: teamBCode, teamType: 'Team B (Bowling)' });
            });
        } catch (e) {
            console.error('❌ Error parsing Team B players:', e);
        }
    }
    
    console.log('📋 Total players loaded:', allPlayers.length, allPlayers);
    
    if (allPlayers.length === 0) {
        playersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No players found for selected teams</p>
                <small>Upload players from admin panel first</small>
            </div>
        `;
        playerCount.textContent = '0 players';
        populatePlayerDropdowns([]);
        return;
    }
    
    // Display players grouped by team
    let html = '';
    
    if (teamACode) {
        const teamAPlayers = allPlayers.filter(p => p.team === teamACode);
        if (teamAPlayers.length > 0) {
            html += `
                <div style="background: rgba(255, 70, 85, 0.1); padding: 8px 12px; margin: 10px 0; border-radius: 8px; font-weight: 700;">
                    <i class="fas fa-shield-alt"></i> Team A - ${teamACode} (${teamAPlayers.length} players)
                </div>
            `;
            html += teamAPlayers.map(player => {
                const initial = player.name.charAt(0).toUpperCase();
                return `
                    <div class="player-item" draggable="true" 
                         ondragstart="dragStart(event)" 
                         data-player='${JSON.stringify(player)}'>
                        <div class="player-avatar" style="background: linear-gradient(135deg, #FF4655, #FF6B7A);">${initial}</div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-role">${player.role || 'Player'} • ${teamACode}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    if (teamBCode) {
        const teamBPlayers = allPlayers.filter(p => p.team === teamBCode);
        if (teamBPlayers.length > 0) {
            html += `
                <div style="background: rgba(0, 217, 255, 0.1); padding: 8px 12px; margin: 10px 0; border-radius: 8px; font-weight: 700;">
                    <i class="fas fa-shield-alt"></i> Team B - ${teamBCode} (${teamBPlayers.length} players)
                </div>
            `;
            html += teamBPlayers.map(player => {
                const initial = player.name.charAt(0).toUpperCase();
                return `
                    <div class="player-item" draggable="true" 
                         ondragstart="dragStart(event)" 
                         data-player='${JSON.stringify(player)}'>
                        <div class="player-avatar" style="background: linear-gradient(135deg, #00D9FF, #0AA8FF);">${initial}</div>
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-role">${player.role || 'Player'} • ${teamBCode}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    playersList.innerHTML = html;
    playerCount.textContent = `${allPlayers.length} players`;
    
    // Populate dropdowns with all players
    populatePlayerDropdowns(allPlayers);
}

function populatePlayerDropdowns(players) {
    const batsman1Select = document.getElementById('batsman1Select');
    const batsman2Select = document.getElementById('batsman2Select');
    const bowlerSelect = document.getElementById('bowlerSelect');
    
    const options = players.map(player => {
        const teamLabel = player.team ? ` (${player.team})` : '';
        return `<option value='${JSON.stringify(player)}'>${player.name} - ${player.role || 'Player'}${teamLabel}</option>`;
    }).join('');
    
    const defaultOption = '<option value="">-- Select Player --</option>';
    
    batsman1Select.innerHTML = defaultOption + options;
    batsman2Select.innerHTML = defaultOption + options;
    bowlerSelect.innerHTML = defaultOption + options;
}

// ===== DRAG AND DROP =====

function dragStart(event) {
    const playerData = event.target.getAttribute('data-player');
    event.dataTransfer.setData('player', playerData);
    event.target.style.opacity = '0.5';
}

function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function dropPlayer(event, position) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const playerData = event.dataTransfer.getData('player');
    if (!playerData) return;
    
    const player = JSON.parse(playerData);
    selectedPlayers[position] = player;
    
    updateDropZone(position, player);
}

function selectPlayer(position) {
    const selectId = `${position}Select`;
    const select = document.getElementById(selectId);
    const playerData = select.value;
    
    if (!playerData) {
        removePlayer(position);
        return;
    }
    
    const player = JSON.parse(playerData);
    selectedPlayers[position] = player;
    
    updateDropZone(position, player);
}

function updateDropZone(position, player) {
    const dropZone = document.getElementById(`${position}Drop`);
    const initial = player.name.charAt(0).toUpperCase();
    
    dropZone.innerHTML = `
        <div class="dropped-player">
            <div class="dropped-player-info">
                <div class="dropped-player-avatar">${initial}</div>
                <div>
                    <div style="font-weight: 700;">${player.name}</div>
                    <div style="font-size: 0.85rem; opacity: 0.8;">${player.role || 'Player'}</div>
                </div>
            </div>
            <button class="dropped-player-remove" onclick="removePlayer('${position}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    dropZone.classList.add('has-player');
}

function removePlayer(position) {
    selectedPlayers[position] = null;
    const dropZone = document.getElementById(`${position}Drop`);
    
    dropZone.innerHTML = `
        <i class="fas fa-hand-pointer"></i>
        <p>Drag player here or select below</p>
    `;
    
    dropZone.classList.remove('has-player');
    
    // Clear select dropdown
    document.getElementById(`${position}Select`).value = '';
}

// ===== UPDATE FUNCTIONS =====

function updateMatchStats() {
    const stats = {
        powerplayScore: document.getElementById('powerplayScore').value,
        boundaries: document.getElementById('boundaries').value,
        partnership: document.getElementById('partnership').value,
        winProbability: document.getElementById('winProbability').value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('live_match_stats', JSON.stringify(stats));
    showToast('✅ Match statistics updated!');
}

function updatePartnership() {
    if (!selectedPlayers.batsman1 && !selectedPlayers.batsman2) {
        alert('❌ Please select at least one batsman');
        return;
    }
    
    const partnership = {
        batsman1: selectedPlayers.batsman1 ? {
            ...selectedPlayers.batsman1,
            stats: document.getElementById('batsman1Runs').value,
            boundaries: document.getElementById('batsman1Boundaries').value
        } : null,
        batsman2: selectedPlayers.batsman2 ? {
            ...selectedPlayers.batsman2,
            stats: document.getElementById('batsman2Runs').value,
            boundaries: document.getElementById('batsman2Boundaries').value
        } : null,
        timestamp: Date.now()
    };
    
    localStorage.setItem('live_match_partnership', JSON.stringify(partnership));
    showToast('✅ Partnership updated!');
}

function updateBowler() {
    if (!selectedPlayers.bowler) {
        alert('❌ Please select a bowler');
        return;
    }
    
    const bowler = {
        ...selectedPlayers.bowler,
        stats: document.getElementById('bowlerStats').value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('live_match_bowler', JSON.stringify(bowler));
    showToast('✅ Current bowler updated!');
}

function updateAIInsight() {
    const insight = document.getElementById('aiInsight').value.trim();
    
    if (!insight) {
        alert('❌ Please enter AI insight text');
        return;
    }
    
    const aiInsight = {
        text: insight,
        timestamp: Date.now()
    };
    
    localStorage.setItem('live_match_ai_insight', JSON.stringify(aiInsight));
    showToast('✅ AI Insight updated!');
}

function addKeyMoment() {
    const type = document.getElementById('momentType').value;
    const desc = document.getElementById('momentDesc').value.trim();
    const over = document.getElementById('momentOver').value.trim();
    
    if (!desc || !over) {
        alert('❌ Please fill in all fields');
        return;
    }
    
    // Get existing moments
    let moments = JSON.parse(localStorage.getItem('live_match_key_moments') || '[]');
    
    // Add new moment
    moments.push({
        id: Date.now(),
        type: type,
        description: desc,
        over: over,
        timestamp: Date.now()
    });
    
    // Save to localStorage
    localStorage.setItem('live_match_key_moments', JSON.stringify(moments));
    
    // Clear form
    document.getElementById('momentDesc').value = '';
    document.getElementById('momentOver').value = '';
    
    // Reload moments
    loadKeyMoments();
    
    showToast('✅ Key moment added!');
}

// ===== AI GENERATION =====

function generateAIInsight() {
    const insights = [
        "Based on current run rate and wickets in hand, Team A has a 65% win probability. Historical data shows teams batting first at this venue average 175 runs.",
        "The partnership is building momentum. If this continues for 3 more overs, the predicted final score could exceed 190 runs.",
        "Machine learning analysis suggests the bowling team should introduce a spinner in the next over. Success rate increases by 23% in similar match situations.",
        "Current run rate of 8.5 is above the required rate. Team has 8 wickets in hand, putting them in a strong position to win this match.",
        "AI prediction: Team batting second needs 45 runs from 30 balls. Win probability stands at 72% based on historical chase patterns at this venue.",
        "Deep learning model indicates this is a crucial phase. Teams losing a wicket in the next 2 overs have a 40% reduced win probability.",
        "Neural network analysis shows the pitch is slowing down. Expected run rate for remaining overs: 7.2 runs per over.",
        "Random forest model predicts Team A will score between 165-180 runs based on current trajectory and player form analysis."
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    document.getElementById('aiInsight').value = randomInsight;
    
    showToast('🤖 AI insight generated!');
}

// ===== KEY MOMENTS =====

function loadKeyMoments() {
    const moments = JSON.parse(localStorage.getItem('live_match_key_moments') || '[]');
    const preview = document.getElementById('momentsPreview');
    
    if (moments.length === 0) {
        preview.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star-half-alt"></i>
                <p>No key moments posted yet</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    moments.sort((a, b) => b.timestamp - a.timestamp);
    
    const html = moments.map(moment => `
        <div class="moment-preview-item ${moment.type}">
            <div class="moment-preview-content">
                <div class="moment-preview-type">${moment.type}</div>
                <div class="moment-preview-desc">${moment.description}</div>
                <div class="moment-preview-over">Over ${moment.over}</div>
            </div>
            <button class="btn-delete-moment" onclick="deleteKeyMoment(${moment.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    preview.innerHTML = html;
}

function deleteKeyMoment(id) {
    if (!confirm('Delete this key moment?')) return;
    
    let moments = JSON.parse(localStorage.getItem('live_match_key_moments') || '[]');
    moments = moments.filter(m => m.id !== id);
    localStorage.setItem('live_match_key_moments', JSON.stringify(moments));
    
    loadKeyMoments();
    showToast('✅ Key moment deleted');
}

function clearAllMoments() {
    if (!confirm('Clear all key moments? This cannot be undone!')) return;
    
    localStorage.removeItem('live_match_key_moments');
    loadKeyMoments();
    showToast('✅ All key moments cleared');
}

// ===== CLEAR FUNCTIONS =====

function clearPartnership() {
    if (!confirm('Clear current partnership?')) return;
    
    selectedPlayers.batsman1 = null;
    selectedPlayers.batsman2 = null;
    
    removePlayer('batsman1');
    removePlayer('batsman2');
    
    document.getElementById('batsman1Runs').value = '';
    document.getElementById('batsman1Boundaries').value = '';
    document.getElementById('batsman2Runs').value = '';
    document.getElementById('batsman2Boundaries').value = '';
    
    localStorage.removeItem('live_match_partnership');
    showToast('✅ Partnership cleared');
}

function clearBowler() {
    if (!confirm('Clear current bowler?')) return;
    
    selectedPlayers.bowler = null;
    removePlayer('bowler');
    document.getElementById('bowlerStats').value = '';
    
    localStorage.removeItem('live_match_bowler');
    showToast('✅ Bowler cleared');
}

// ===== LOAD SAVED DATA =====

function loadSavedData() {
    // Load match stats
    const stats = JSON.parse(localStorage.getItem('live_match_stats') || '{}');
    if (stats.powerplayScore) document.getElementById('powerplayScore').value = stats.powerplayScore;
    if (stats.boundaries) document.getElementById('boundaries').value = stats.boundaries;
    if (stats.partnership) document.getElementById('partnership').value = stats.partnership;
    if (stats.winProbability) document.getElementById('winProbability').value = stats.winProbability;
    
    // Load partnership
    const partnership = JSON.parse(localStorage.getItem('live_match_partnership') || '{}');
    if (partnership.batsman1) {
        selectedPlayers.batsman1 = partnership.batsman1;
        updateDropZone('batsman1', partnership.batsman1);
        if (partnership.batsman1.stats) document.getElementById('batsman1Runs').value = partnership.batsman1.stats;
        if (partnership.batsman1.boundaries) document.getElementById('batsman1Boundaries').value = partnership.batsman1.boundaries;
    }
    if (partnership.batsman2) {
        selectedPlayers.batsman2 = partnership.batsman2;
        updateDropZone('batsman2', partnership.batsman2);
        if (partnership.batsman2.stats) document.getElementById('batsman2Runs').value = partnership.batsman2.stats;
        if (partnership.batsman2.boundaries) document.getElementById('batsman2Boundaries').value = partnership.batsman2.boundaries;
    }
    
    // Load bowler
    const bowler = JSON.parse(localStorage.getItem('live_match_bowler') || '{}');
    if (bowler.name) {
        selectedPlayers.bowler = bowler;
        updateDropZone('bowler', bowler);
        if (bowler.stats) document.getElementById('bowlerStats').value = bowler.stats;
    }
    
    // Load AI insight
    const aiInsight = JSON.parse(localStorage.getItem('live_match_ai_insight') || '{}');
    if (aiInsight.text) document.getElementById('aiInsight').value = aiInsight.text;
}

// ===== TOAST NOTIFICATION =====

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Prevent default drag behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Remove drag opacity when drag ends
document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('player-item')) {
        e.target.style.opacity = '1';
    }
});

// Remove drag-over class when leaving
document.addEventListener('dragleave', (e) => {
    if (e.target.classList.contains('drag-drop-area')) {
        e.target.classList.remove('drag-over');
    }
});

console.log('✅ Admin Live Match Scripts Loaded');

// ===== DEBUG UTILITY =====

// Call this in browser console to check localStorage
function debugLocalStorage() {
    console.log('🔍 ===== DEBUGGING LOCALSTORAGE =====');
    
    // Check all team players
    const teams = ['RCB', 'MI', 'CSK', 'KKR', 'DC', 'SRH', 'RR', 'PBSK', 'GT', 'LSG'];
    
    teams.forEach(team => {
        const keyLower = `uploaded_${team.toLowerCase()}_players`;
        const keyUpper = `uploaded_${team}_players`;
        
        const dataLower = localStorage.getItem(keyLower);
        const dataUpper = localStorage.getItem(keyUpper);
        
        console.log(`\n📦 Team: ${team}`);
        console.log(`   Key (lowercase): ${keyLower}`);
        console.log(`   Data found: ${dataLower ? 'YES' : 'NO'}`);
        if (dataLower) {
            try {
                const players = JSON.parse(dataLower);
                console.log(`   ✅ ${players.length} players:`, players.map(p => p.name).join(', '));
            } catch (e) {
                console.log(`   ❌ Error parsing:`, e);
            }
        }
        
        console.log(`   Key (uppercase): ${keyUpper}`);
        console.log(`   Data found: ${dataUpper ? 'YES' : 'NO'}`);
        if (dataUpper) {
            try {
                const players = JSON.parse(dataUpper);
                console.log(`   ✅ ${players.length} players:`, players.map(p => p.name).join(', '));
            } catch (e) {
                console.log(`   ❌ Error parsing:`, e);
            }
        }
    });
    
    // Check fixtures
    console.log('\n📅 ===== FIXTURES =====');
    const fixtures = localStorage.getItem('fixtures');
    if (fixtures) {
        try {
            const fixturesData = JSON.parse(fixtures);
            console.log(`✅ ${fixturesData.length} fixtures found:`, fixturesData);
        } catch (e) {
            console.log('❌ Error parsing fixtures:', e);
        }
    } else {
        console.log('❌ No fixtures found');
    }
    
    console.log('\n📊 ===== ALL LOCALSTORAGE KEYS =====');
    console.log('Total keys:', localStorage.length);
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('uploaded') || key.includes('player') || key.includes('fixture')) {
            allKeys.push(key);
        }
    }
    console.log('Related keys:', allKeys);
}

// Make it accessible globally
window.debugLocalStorage = debugLocalStorage;

console.log('💡 TIP: Open browser console and run debugLocalStorage() to see all data');

