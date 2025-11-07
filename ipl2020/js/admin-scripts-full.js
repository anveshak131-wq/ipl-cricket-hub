// Complete Admin Panel - Players, Fixtures, Points Table

// Global variables
let playerCount = 0;
let fixtureCount = 0;
let pointsCount = 0;

const TEAM_OPTIONS = ['RCB', 'MI', 'CSK', 'SRH', 'PBSK', 'KKR', 'DC', 'RR', 'GT', 'LSG'];
const TEAM_NAMES = {
    'MI': 'Mumbai Indians', 'CSK': 'Chennai Super Kings', 'RCB': 'Royal Challengers Bangalore',
    'KKR': 'Kolkata Knight Riders', 'DC': 'Delhi Capitals', 'SRH': 'Sunrisers Hyderabad',
    'RR': 'Rajasthan Royals', 'PBSK': 'Punjab Kings', 'GT': 'Gujarat Titans', 'LSG': 'Lucknow Super Giants'
};

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'fixtures') showFixturesPreview();
    if (tabName === 'points') showPointsPreview();
}

// Update stats
function updateStats() {
    let totalPlayers = 0;
    TEAM_OPTIONS.forEach(team => {
        const key = `uploaded_${team.toLowerCase()}_players`;
        try {
            const players = JSON.parse(localStorage.getItem(key) || '[]');
            totalPlayers += players.length;
        } catch(e) {}
    });
    document.getElementById('totalPlayers').textContent = totalPlayers;
    
    try {
        const fixtures = JSON.parse(localStorage.getItem('uploaded_fixtures') || '[]');
        document.getElementById('totalFixtures').textContent = fixtures.length;
    } catch(e) {}
}

// ===== PLAYERS MANAGEMENT =====
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
            <button class="btn-remove" onclick="removePlayerRow(${playerCount})">🗑️ Remove</button>
        </div>
        <div class="player-fields">
            <div class="form-group"><label>Name</label><input type="text" class="form-control player-name" placeholder="Virat Kohli"></div>
            <div class="form-group"><label>Role</label><select class="form-control player-role" onchange="toggleAllRounderType(this)">
                <option value="">Select role</option><option value="Batsman">Batsman</option><option value="Bowler">Bowler</option>
                <option value="All-rounder">All-rounder</option><option value="Wicket-keeper">Wicket-keeper</option></select></div>
            <div class="form-group allrounder-type-container" style="display:none;"><label>All-rounder Type</label>
                <select class="form-control player-allrounder-type"><option value="">Select type</option>
                <option value="Batting All-rounder">Batting All-rounder</option><option value="Bowling All-rounder">Bowling All-rounder</option></select></div>
            <div class="form-group"><label>Age</label><input type="number" class="form-control player-age" placeholder="25"></div>
            <div class="form-group"><label>Nationality</label><select class="form-control player-nationality">
                <option value="">Select nationality</option><option value="Indian">Indian</option><option value="Australian">Australian</option>
                <option value="English">English</option><option value="South African">South African</option><option value="New Zealander">New Zealander</option>
                <option value="Sri Lankan">Sri Lankan</option><option value="Afghan">Afghan</option><option value="West Indian">West Indian</option></select></div>
            <div class="form-group"><label>Batting Style</label><select class="form-control player-batting">
                <option value="">Select style</option><option value="Right-handed">Right-handed</option><option value="Left-handed">Left-handed</option></select></div>
            <div class="form-group"><label>Bowling Style</label><select class="form-control player-bowling">
                <option value="">Select style</option><option value="Right-arm fast">Right-arm fast</option><option value="Right-arm medium">Right-arm medium</option>
                <option value="Right-arm offbreak">Right-arm offbreak</option><option value="Left-arm fast">Left-arm fast</option><option value="Left-arm orthodox">Left-arm orthodox</option></select></div>
            <div class="form-group"><label><input type="checkbox" class="player-captain"> Captain</label></div>
            <div class="form-group"><label><input type="checkbox" class="player-vice-captain"> Vice-Captain</label></div>
        </div>
    `;
    playersList.appendChild(row);
}

function removePlayerRow(id) { document.getElementById(`player-${id}`)?.remove(); }

function toggleAllRounderType(selectEl) {
    const container = selectEl.closest('.player-row').querySelector('.allrounder-type-container');
    container.style.display = selectEl.value === 'All-rounder' ? 'block' : 'none';
}

function savePlayers() {
    const team = document.getElementById('teamSelectManual').value;
    if (!team) return showError('playersManualError', 'Please select a team');
    
    const playerRows = document.querySelectorAll('.player-row');
    if (!playerRows.length) return showError('playersManualError', 'Please add at least one player');
    
    const key = `uploaded_${team.toLowerCase()}_players`;
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    
    // If editing, remove the old player first to avoid duplicates
    if (currentEditingPlayerName) {
        existing = existing.filter(p => p.name !== currentEditingPlayerName);
    }
    
    const nameMap = {};
    existing.forEach(p => { if(p.name) nameMap[p.name.toLowerCase()] = p; });
    
    playerRows.forEach(row => {
        const playerName = row.querySelector('.player-name')?.value.trim() || '';
        const existingPlayer = existing.find(p => p.name === playerName);
        
        const player = {
            name: playerName,
            role: row.querySelector('.player-role')?.value || '',
            'allrounder type': row.querySelector('.player-allrounder-type')?.value || '',
            age: row.querySelector('.player-age')?.value || '',
            nationality: row.querySelector('.player-nationality')?.value || '',
            'batting style': row.querySelector('.player-batting')?.value || '',
            'bowling style': row.querySelector('.player-bowling')?.value || '',
            image: existingPlayer?.image || '',
            isCaptain: row.querySelector('.player-captain')?.checked || false,
            isViceCaptain: row.querySelector('.player-vice-captain')?.checked || false,
            stats: existingPlayer?.stats || {} // Preserve existing stats if any
        };
        if (player.nationality && player.nationality.toLowerCase() !== 'indian') player.isForeign = true;
        if (player.name) nameMap[player.name.toLowerCase()] = player;
    });
    
    // Save to localStorage
    localStorage.setItem(key, JSON.stringify(Object.values(nameMap)));
    
    // Also save to Vercel KV API
    saveToVercelKV(team, Object.values(nameMap));
    
    const message = currentEditingPlayerName ? `Player updated successfully!` : `${Object.keys(nameMap).length} player(s) saved for ${team}!`;
    showSuccess('playersManualSuccess', message);
    
    // Clear editing state
    currentEditingPlayerName = null;
    
    document.getElementById('playersList').innerHTML = '';
    playerCount = 0;
    updateStats();
    showUploadedPlayers(team);
}

// Save to Vercel KV API
async function saveToVercelKV(team, players) {
    try {
        const response = await fetch('/api/admin/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team, players })
        });
        
        if (response.ok) {
            console.log(`✅ Saved to Vercel KV for team ${team}`);
        } else {
            console.warn('Failed to save to Vercel KV:', response.status);
        }
    } catch (error) {
        console.error('Error saving to Vercel KV:', error);
    }
}

function showUploadedPlayers(team) {
    const container = document.getElementById('uploadedPlayersContainer');
    if (!team) return container.innerHTML = '<p class="placeholder-text">Select a team to view players.</p>';
    
    const key = `uploaded_${team.toLowerCase()}_players`;
    let players;
    try { players = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { return; }
    if (!players.length) return container.innerHTML = '<p class="placeholder-text">No players uploaded for this team.</p>';
    
    let html = '';
    players.forEach((p, index) => {
        const badges = [];
        if (p.isCaptain) badges.push('<span class="badge badge-captain">👑 C</span>');
        if (p.isViceCaptain) badges.push('<span class="badge badge-captain">⭐ VC</span>');
        if (p.isForeign) badges.push('<span class="badge badge-foreign">🌏</span>');
        html += `<div class="player-card"><div class="player-info"><h4>${p.name}</h4><p>${p.role} | Age: ${p.age} | ${p.nationality}</p></div>
            <div class="player-badges">${badges.join('')}
            <button class="btn-edit" onclick="editPlayer(${index})" style="background: linear-gradient(135deg, #00D9FF, #34D9FF); margin-right: 0.5rem;">✏️ Edit</button>
            <button class="btn-remove" onclick="deletePlayer('${p.name}')">🗑️</button></div></div>`;
    });
    container.innerHTML = html;
}

// Edit player - populate form with existing data
let currentEditingPlayerName = null;

function editPlayer(index) {
    const team = document.getElementById('teamSelectManual').value;
    const key = `uploaded_${team.toLowerCase()}_players`;
    let players = JSON.parse(localStorage.getItem(key) || '[]');
    const player = players[index];
    
    if (!player) return;
    
    // Store the original name for replacement
    currentEditingPlayerName = player.name;
    
    // Clear existing player rows
    document.getElementById('playersList').innerHTML = '';
    playerCount = 0;
    
    // Add one row with player data
    addPlayerRow();
    
    // Populate the row with player data
    const row = document.querySelector('.player-row');
    if (row) {
        row.querySelector('.player-name').value = player.name || '';
        row.querySelector('.player-role').value = player.role || '';
        row.querySelector('.player-age').value = player.age || '';
        row.querySelector('.player-nationality').value = player.nationality || '';
        row.querySelector('.player-batting').value = player['batting style'] || '';
        row.querySelector('.player-bowling').value = player['bowling style'] || '';
        row.querySelector('.player-captain').checked = player.isCaptain || false;
        row.querySelector('.player-vice-captain').checked = player.isViceCaptain || false;
        
        const allrounderType = row.querySelector('.player-allrounder-type');
        if (allrounderType) {
            allrounderType.value = player['allrounder type'] || '';
        }
        
        // Show/hide allrounder type based on role
        const allrounderContainer = row.querySelector('.allrounder-type-container');
        if (allrounderContainer) {
            allrounderContainer.style.display = player.role === 'All-rounder' ? 'block' : 'none';
        }
    }
    
    // Scroll to form
    document.getElementById('playersList').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Show message
    showSuccess('playersManualSuccess', `Editing ${player.name}. Update the details and click Save.`);
}

function deletePlayer(name) {
    const team = document.getElementById('teamSelectManual').value;
    if (!team || !confirm(`Delete ${name}?`)) return;
    const key = `uploaded_${team.toLowerCase()}_players`;
    let players = JSON.parse(localStorage.getItem(key) || '[]').filter(p => p.name !== name);
    localStorage.setItem(key, JSON.stringify(players));
    updateStats();
    showUploadedPlayers(team);
}

// ===== FIXTURES MANAGEMENT =====
const IPL_STADIUMS = [
    "Wankhede Stadium, Mumbai",
    "Eden Gardens, Kolkata",
    "M. Chinnaswamy Stadium, Bengaluru",
    "Arun Jaitley Stadium, Delhi",
    "MA Chidambaram Stadium, Chennai",
    "Rajiv Gandhi International Stadium, Hyderabad",
    "Punjab Cricket Association Stadium, Mohali",
    "Sawai Mansingh Stadium, Jaipur",
    "Narendra Modi Stadium, Ahmedabad",
    "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow",
    "Dr DY Patil Sports Academy, Mumbai",
    "Brabourne Stadium, Mumbai",
    "Himachal Pradesh Cricket Association Stadium, Dharamsala",
    "Holkar Cricket Stadium, Indore",
    "Shaheed Veer Narayan Singh International Stadium, Raipur",
    "JSCA International Stadium Complex, Ranchi",
    "IS Bindra Stadium, Mohali",
    "Barabati Stadium, Cuttack",
    "Vidarbha Cricket Association Stadium, Nagpur",
    "Maharashtra Cricket Association Stadium, Pune",
    "Green Park Stadium, Kanpur",
    "Sardar Patel Stadium, Ahmedabad",
    "Dubai International Cricket Stadium, Dubai",
    "Sheikh Zayed Stadium, Abu Dhabi",
    "Sharjah Cricket Stadium, Sharjah",
    "Other"
];

function addFixtureRow() {
    fixtureCount++;
    const list = document.getElementById('fixturesList');
    const row = document.createElement('div');
    row.className = 'player-row';
    row.id = `fixture-${fixtureCount}`;
    row.innerHTML = `<div class="player-row-header"><div class="player-row-title">📅 Fixture ${fixtureCount}</div>
        <button class="btn-remove" onclick="removeFixtureRow(${fixtureCount})">🗑️</button></div>
        <div class="player-fields">
            <div class="form-group"><label>Date</label><input type="date" class="form-control fixture-date"></div>
            <div class="form-group"><label>Team 1</label><select class="form-control fixture-team1">${TEAM_OPTIONS.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>
            <div class="form-group"><label>Team 2</label><select class="form-control fixture-team2">${TEAM_OPTIONS.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>
            <div class="form-group">
                <label>Venue</label>
                <select class="form-control fixture-venue-select" onchange="handleVenueChange(this, ${fixtureCount})">
                    <option value="">Select Stadium</option>
                    ${IPL_STADIUMS.map(s=>`<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group" id="custom-venue-${fixtureCount}" style="display:none;">
                <label>Custom Venue Name</label>
                <input type="text" class="form-control fixture-venue-custom" placeholder="Enter stadium name">
            </div>
            <div class="form-group"><label>Time (IST)</label><input type="time" class="form-control fixture-time" value="19:30"></div>
            <div class="form-group"><label>Status</label><select class="form-control fixture-status">
                <option value="upcoming">Upcoming</option><option value="live">Live</option><option value="completed">Completed</option></select></div>
        </div>`;
    list.appendChild(row);
}

function handleVenueChange(select, fixtureId) {
    const customVenueDiv = document.getElementById(`custom-venue-${fixtureId}`);
    if (select.value === 'Other') {
        customVenueDiv.style.display = 'block';
    } else {
        customVenueDiv.style.display = 'none';
    }
}

function removeFixtureRow(id) { document.getElementById(`fixture-${id}`)?.remove(); }

function saveFixtures() {
    const rows = document.querySelectorAll('#fixturesList .player-row');
    if (!rows.length) return showError('fixturesError', 'Please add at least one fixture');
    
    const fixtures = [];
    rows.forEach(row => {
        const venueSelect = row.querySelector('.fixture-venue-select')?.value || '';
        const customVenue = row.querySelector('.fixture-venue-custom')?.value || '';
        const finalVenue = venueSelect === 'Other' ? customVenue : venueSelect;
        
        fixtures.push({
            date: row.querySelector('.fixture-date')?.value || '',
            team1: row.querySelector('.fixture-team1')?.value || '',
            team2: row.querySelector('.fixture-team2')?.value || '',
            venue: finalVenue,
            time: row.querySelector('.fixture-time')?.value || '',
            status: row.querySelector('.fixture-status')?.value || 'upcoming'
        });
    });
    
    localStorage.setItem('uploaded_fixtures', JSON.stringify(fixtures));
    showSuccess('fixturesSuccess', `${fixtures.length} fixture(s) saved!`);
    document.getElementById('fixturesList').innerHTML = '';
    fixtureCount = 0;
    updateStats();
    showFixturesPreview();
}

function getAutoFixtureStatus(date, time) {
    if (!date || !time) return 'upcoming';
    
    try {
        const fixtureDateTime = new Date(`${date}T${time}:00+05:30`);
        const now = new Date();
        const matchDuration = 4 * 60 * 60 * 1000;
        const matchEndTime = new Date(fixtureDateTime.getTime() + matchDuration);
        
        if (now < fixtureDateTime) return 'upcoming';
        else if (now >= fixtureDateTime && now <= matchEndTime) return 'live';
        else return 'completed';
    } catch (e) {
        return 'upcoming';
    }
}

function showFixturesPreview() {
    const container = document.getElementById('fixturesPreview');
    let fixtures;
    try { fixtures = JSON.parse(localStorage.getItem('uploaded_fixtures') || '[]'); } catch(e) { return; }
    if (!fixtures.length) return container.innerHTML = '<p class="placeholder-text">No fixtures added yet.</p>';
    
    let html = '';
    fixtures.forEach((f, i) => {
        const autoStatus = getAutoFixtureStatus(f.date, f.time);
        const statusColor = autoStatus === 'live' ? 'captain' : (autoStatus === 'completed' ? 'wicketkeeper' : 'foreign');
        html += `<div class="player-card"><div class="player-info"><h4>${f.team1} vs ${f.team2}</h4>
            <p>📅 ${f.date} | ⏰ ${f.time} IST | 📍 ${f.venue}</p></div>
            <div class="player-badges"><span class="badge badge-${statusColor}">${autoStatus.toUpperCase()}</span>
            <button class="btn-remove" onclick="deleteFixture(${i})">🗑️</button></div></div>`;
    });
    container.innerHTML = html;
}

function deleteFixture(idx) {
    if (!confirm('Delete this fixture?')) return;
    let fixtures = JSON.parse(localStorage.getItem('uploaded_fixtures') || '[]');
    fixtures.splice(idx, 1);
    localStorage.setItem('uploaded_fixtures', JSON.stringify(fixtures));
    updateStats();
    showFixturesPreview();
}

// ===== POINTS TABLE MANAGEMENT =====
function addPointsRow() {
    pointsCount++;
    const list = document.getElementById('pointsList');
    const row = document.createElement('div');
    row.className = 'player-row';
    row.id = `points-${pointsCount}`;
    row.innerHTML = `<div class="player-row-header"><div class="player-row-title">🏆 Team ${pointsCount}</div>
        <button class="btn-remove" onclick="removePointsRow(${pointsCount})">🗑️</button></div>
        <div class="player-fields">
            <div class="form-group"><label>Team</label><select class="form-control points-team">${TEAM_OPTIONS.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>
            <div class="form-group"><label>Matches</label><input type="number" class="form-control points-matches" value="0" min="0"></div>
            <div class="form-group"><label>Won</label><input type="number" class="form-control points-won" value="0" min="0"></div>
            <div class="form-group"><label>Lost</label><input type="number" class="form-control points-lost" value="0" min="0"></div>
            <div class="form-group"><label>Points</label><input type="number" class="form-control points-points" value="0" min="0"></div>
            <div class="form-group"><label>NRR</label><input type="number" class="form-control points-nrr" value="0.00" step="0.01"></div>
        </div>`;
    list.appendChild(row);
}

function removePointsRow(id) { document.getElementById(`points-${id}`)?.remove(); }

function savePoints() {
    const rows = document.querySelectorAll('#pointsList .player-row');
    if (!rows.length) return showError('pointsError', 'Please add at least one team');
    
    const pointsData = [];
    rows.forEach((row, i) => {
        const team = row.querySelector('.points-team')?.value || '';
        pointsData.push({
            rank: i + 1,
            name: TEAM_NAMES[team] || team,
            short: team,
            logo: `${team.toLowerCase()}_logo_new.svg`,
            matches: parseInt(row.querySelector('.points-matches')?.value || 0),
            won: parseInt(row.querySelector('.points-won')?.value || 0),
            lost: parseInt(row.querySelector('.points-lost')?.value || 0),
            points: parseInt(row.querySelector('.points-points')?.value || 0),
            nrr: parseFloat(row.querySelector('.points-nrr')?.value || 0),
            form: [],
            qualified: i < 4
        });
    });
    
    localStorage.setItem('ipl_points_table', JSON.stringify(pointsData));
    showSuccess('pointsSuccess', `Points table saved for ${pointsData.length} teams!`);
    document.getElementById('pointsList').innerHTML = '';
    pointsCount = 0;
    showPointsPreview();
}

function showPointsPreview() {
    const container = document.getElementById('pointsPreview');
    let points;
    try { points = JSON.parse(localStorage.getItem('ipl_points_table') || '[]'); } catch(e) { return; }
    if (!points.length) return container.innerHTML = '<p class="placeholder-text">No points table added yet.</p>';
    
    let html = '';
    points.forEach(p => {
        html += `<div class="player-card"><div class="player-info"><h4>${p.rank}. ${p.name}</h4>
            <p>Matches: ${p.matches} | Won: ${p.won} | Lost: ${p.lost} | Points: ${p.points} | NRR: ${p.nrr.toFixed(2)}</p></div>
            <div class="player-badges">${p.qualified ? '<span class="badge badge-captain">✓ Qualified</span>' : ''}</div></div>`;
    });
    container.innerHTML = html;
}

// Helper functions
function showSuccess(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 5000);
}

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
}

// Display all players sorted by role and age
function displayAllPlayersByAge() {
    const allPlayers = [];
    
    // Collect players from all teams
    TEAM_OPTIONS.forEach(team => {
        const key = `uploaded_${team.toLowerCase()}_players`;
        try {
            const players = JSON.parse(localStorage.getItem(key) || '[]');
            players.forEach(player => {
                allPlayers.push({
                    ...player,
                    team: team
                });
            });
        } catch(e) {}
    });
    
    if (allPlayers.length === 0) {
        console.log('%cNo players found in localStorage', 'color: #EF4444; font-size: 16px; font-weight: bold;');
        return;
    }
    
    // Sort by role (Batsman -> Wicket-keeper -> All-rounder -> Bowler) then by age (high to low)
    const roleOrder = {
        'batsman': 1,
        'wicket-keeper': 2,
        'all-rounder': 3,
        'bowler': 4
    };
    
    allPlayers.sort((a, b) => {
        const roleA = (a.role || '').toLowerCase();
        const roleB = (b.role || '').toLowerCase();
        const orderA = roleOrder[roleA] || 99;
        const orderB = roleOrder[roleB] || 99;
        
        // First sort by role
        if (orderA !== orderB) return orderA - orderB;
        
        // Then by age (descending - highest to lowest)
        const ageA = parseInt(a.age || 0);
        const ageB = parseInt(b.age || 0);
        return ageB - ageA;
    });
    
    // Display in console with beautiful formatting
    console.log('%c═══════════════════════════════════════════════════', 'color: #FFD700; font-weight: bold;');
    console.log('%c🏏 ALL IPL PLAYERS - SORTED BY ROLE & AGE', 'color: #00D9FF; font-size: 20px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════', 'color: #FFD700; font-weight: bold;');
    console.log(`%cTotal Players: ${allPlayers.length}`, 'color: #10B981; font-size: 14px; font-weight: bold;');
    console.log('');
    
    let currentRole = '';
    let roleCount = 0;
    
    allPlayers.forEach((player, index) => {
        const role = (player.role || 'Unknown').toUpperCase();
        
        // Print role header when role changes
        if (role !== currentRole) {
            if (roleCount > 0) {
                console.log(`%c   └─ Total: ${roleCount} players`, 'color: #A1A1AA; font-style: italic;');
                console.log('');
            }
            currentRole = role;
            roleCount = 0;
            
            const roleEmoji = {
                'BATSMAN': '🏏',
                'WICKET-KEEPER': '🧤',
                'ALL-ROUNDER': '⚡',
                'BOWLER': '🎯'
            };
            
            console.log(`%c${roleEmoji[role] || '👤'} ${role}S`, 'color: #FF4655; font-size: 16px; font-weight: bold; text-decoration: underline;');
            console.log('%c───────────────────────────────────────────────────', 'color: #4B5563;');
        }
        
        roleCount++;
        
        // Format player info
        const name = player.name || 'Unknown';
        const age = player.age || 'N/A';
        const team = player.team || 'N/A';
        const nationality = player.nationality || 'Unknown';
        const badges = [];
        
        if (player.isCaptain) badges.push('👑 Captain');
        if (player.isViceCaptain) badges.push('⭐ Vice-Captain');
        if (player.isForeign) badges.push('🌏 Foreign');
        
        const badgeText = badges.length > 0 ? ` [${badges.join(', ')}]` : '';
        
        // Display player
        console.log(
            `%c   ${roleCount}. ${name}%c | Age: %c${age}%c | Team: %c${team}%c | ${nationality}${badgeText}`,
            'color: #E4E4E7; font-weight: bold;',
            'color: #A1A1AA;',
            'color: #FFD700; font-weight: bold;',
            'color: #A1A1AA;',
            'color: #00D9FF; font-weight: bold;',
            'color: #A1A1AA;'
        );
        
        // Show additional details
        if (player['batting style'] || player['bowling style']) {
            const batting = player['batting style'] || 'N/A';
            const bowling = player['bowling style'] || 'N/A';
            console.log(`%c      ↳ Batting: ${batting} | Bowling: ${bowling}`, 'color: #6B7280; font-size: 11px;');
        }
        
        if (player['allrounder type']) {
            console.log(`%c      ↳ Type: ${player['allrounder type']}`, 'color: #10B981; font-size: 11px;');
        }
    });
    
    // Final role count
    if (roleCount > 0) {
        console.log(`%c   └─ Total: ${roleCount} players`, 'color: #A1A1AA; font-style: italic;');
    }
    
    console.log('');
    console.log('%c═══════════════════════════════════════════════════', 'color: #FFD700; font-weight: bold;');
    console.log('%c✅ Complete player list displayed above', 'color: #10B981; font-size: 14px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════', 'color: #FFD700; font-weight: bold;');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('teamSelectManual')?.addEventListener('change', (e) => showUploadedPlayers(e.target.value));
    updateStats();
    
    // Display all players on load
    setTimeout(() => {
        displayAllPlayersByAge();
    }, 1000);
});

console.log('%cIPL Cricket Hub Admin Panel', 'color: #00D9FF; font-size: 24px; font-weight: bold;');
console.log('%cType displayAllPlayersByAge() to view all players sorted by role & age', 'color: #FFD700; font-size: 12px;');

// ===== LIVE COMMENTARY FUNCTIONS =====

// Post new commentary
function postCommentary() {
    const over = document.getElementById('commentaryOver').value.trim();
    const text = document.getElementById('commentaryText').value.trim();
    const successMsg = document.getElementById('commentarySuccess');
    const errorMsg = document.getElementById('commentaryError');
    
    // Clear previous messages
    successMsg.textContent = '';
    errorMsg.textContent = '';
    
    // Validation
    if (!over || !text) {
        errorMsg.textContent = '❌ Please fill in both over number and commentary text';
        return;
    }
    
    if (parseFloat(over) < 0 || parseFloat(over) > 20) {
        errorMsg.textContent = '❌ Over number must be between 0 and 20';
        return;
    }
    
    try {
        // Get existing commentary
        let commentary = JSON.parse(localStorage.getItem('live_match_commentary') || '[]');
        
        // Add new commentary
        commentary.push({
            over: over,
            text: text,
            timestamp: Date.now()
        });
        
        // Save to localStorage
        localStorage.setItem('live_match_commentary', JSON.stringify(commentary));
        
        // Show success message
        successMsg.textContent = '✅ Commentary posted successfully! It will appear on the Live Match Updates page with AI enhancements.';
        
        // Clear form
        clearCommentaryForm();
        
        // Refresh preview
        showCommentaryPreview();
        
    } catch (e) {
        errorMsg.textContent = '❌ Error posting commentary: ' + e.message;
    }
}

// Clear commentary form
function clearCommentaryForm() {
    document.getElementById('commentaryOver').value = '';
    document.getElementById('commentaryText').value = '';
}

// Show commentary preview
function showCommentaryPreview() {
    const preview = document.getElementById('commentaryPreview');
    if (!preview) return;
    
    try {
        const commentary = JSON.parse(localStorage.getItem('live_match_commentary') || '[]');
        
        if (commentary.length === 0) {
            preview.innerHTML = '<p class="placeholder-text">No commentary posted yet.</p>';
            return;
        }
        
        // Sort by timestamp (newest first)
        commentary.sort((a, b) => b.timestamp - a.timestamp);
        
        // Generate HTML
        const html = commentary.map((item, index) => {
            const date = new Date(item.timestamp);
            const timeStr = date.toLocaleString();
            
            return `
                <div class="commentary-item-preview">
                    <div class="commentary-header-preview">
                        <span class="commentary-over-preview">Over ${item.over}</span>
                        <span class="commentary-time-preview">${timeStr}</span>
                    </div>
                    <div class="commentary-text-preview">${item.text}</div>
                    <button class="btn-delete-commentary" onclick="deleteCommentary(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
        }).join('');
        
        preview.innerHTML = html;
        
    } catch (e) {
        preview.innerHTML = '<p class="placeholder-text error">Error loading commentary</p>';
    }
}

// Delete single commentary
function deleteCommentary(index) {
    if (!confirm('Are you sure you want to delete this commentary?')) return;
    
    try {
        let commentary = JSON.parse(localStorage.getItem('live_match_commentary') || '[]');
        commentary.sort((a, b) => b.timestamp - a.timestamp);
        commentary.splice(index, 1);
        localStorage.setItem('live_match_commentary', JSON.stringify(commentary));
        showCommentaryPreview();
        
        const successMsg = document.getElementById('commentarySuccess');
        if (successMsg) {
            successMsg.textContent = '✅ Commentary deleted successfully!';
            setTimeout(() => successMsg.textContent = '', 3000);
        }
    } catch (e) {
        const errorMsg = document.getElementById('commentaryError');
        if (errorMsg) {
            errorMsg.textContent = '❌ Error deleting commentary: ' + e.message;
        }
    }
}

// Clear all commentary
function clearAllCommentary() {
    if (!confirm('Are you sure you want to delete ALL commentary? This cannot be undone.')) return;
    
    try {
        localStorage.removeItem('live_match_commentary');
        showCommentaryPreview();
        
        const successMsg = document.getElementById('commentarySuccess');
        if (successMsg) {
            successMsg.textContent = '✅ All commentary cleared successfully!';
            setTimeout(() => successMsg.textContent = '', 3000);
        }
    } catch (e) {
        const errorMsg = document.getElementById('commentaryError');
        if (errorMsg) {
            errorMsg.textContent = '❌ Error clearing commentary: ' + e.message;
        }
    }
}

// Update tab switching to load commentary preview
const originalSwitchTab = switchTab;
switchTab = function(tabName) {
    originalSwitchTab(tabName);
    if (tabName === 'commentary') showCommentaryPreview();
};


// ===== USER MANAGEMENT FUNCTIONS =====

// Load user management data
function loadUserManagementData() {
    loadCollectedUsers();
    loadUserCommentsAdmin();
    updateUserStats();
}

// Get all unique users who signed in
function getCollectedUsers() {
    const comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
    const usersMap = new Map();
    
    comments.forEach(comment => {
        if (!usersMap.has(comment.email)) {
            usersMap.set(comment.email, {
                name: comment.author,
                email: comment.email,
                commentCount: 0,
                lastActive: comment.timestamp
            });
        }
        const user = usersMap.get(comment.email);
        user.commentCount++;
        if (comment.timestamp > user.lastActive) {
            user.lastActive = comment.timestamp;
        }
    });
    
    return Array.from(usersMap.values());
}

// Get blocked users list
function getBlockedUsers() {
    return JSON.parse(localStorage.getItem('blocked_users') || '[]');
}

// Check if user is blocked
function isUserBlocked(email) {
    const blockedUsers = getBlockedUsers();
    return blockedUsers.includes(email);
}

// Block user
function blockUser(email, userName) {
    if (!confirm(`Are you sure you want to block ${userName}? They won't be able to post comments anymore.`)) {
        return;
    }
    
    try {
        let blockedUsers = getBlockedUsers();
        if (!blockedUsers.includes(email)) {
            blockedUsers.push(email);
            localStorage.setItem('blocked_users', JSON.stringify(blockedUsers));
        }
        
        showUserMgmtMessage('success', `✅ User ${userName} has been blocked successfully`);
        loadCollectedUsers();
        updateUserStats();
    } catch (e) {
        showUserMgmtMessage('error', '❌ Error blocking user: ' + e.message);
    }
}

// Unblock user
function unblockUser(email, userName) {
    if (!confirm(`Are you sure you want to unblock ${userName}?`)) {
        return;
    }
    
    try {
        let blockedUsers = getBlockedUsers();
        blockedUsers = blockedUsers.filter(e => e !== email);
        localStorage.setItem('blocked_users', JSON.stringify(blockedUsers));
        
        showUserMgmtMessage('success', `✅ User ${userName} has been unblocked successfully`);
        loadCollectedUsers();
        updateUserStats();
    } catch (e) {
        showUserMgmtMessage('error', '❌ Error unblocking user: ' + e.message);
    }
}

// Load and display collected users
function loadCollectedUsers() {
    const container = document.getElementById('usersTableContainer');
    if (!container) return;
    
    const users = getCollectedUsers();
    const blockedUsers = getBlockedUsers();
    
    if (users.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No users have signed in yet.</p>';
        return;
    }
    
    const html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Comments</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map((user, index) => {
                    const isBlocked = blockedUsers.includes(user.email);
                    const date = new Date(user.lastActive);
                    const dateStr = date.toLocaleString();
                    
                    return `
                        <tr class="${isBlocked ? 'blocked-row' : ''}">
                            <td>${index + 1}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.commentCount}</td>
                            <td>${dateStr}</td>
                            <td>
                                ${isBlocked ? 
                                    '<span class="status-badge blocked">Blocked</span>' : 
                                    '<span class="status-badge active">Active</span>'
                                }
                            </td>
                            <td>
                                ${isBlocked ? 
                                    `<button class="btn-small btn-success" onclick="unblockUser('${user.email}', '${user.name}')">
                                        <i class="fas fa-unlock"></i> Unblock
                                    </button>` :
                                    `<button class="btn-small btn-danger" onclick="blockUser('${user.email}', '${user.name}')">
                                        <i class="fas fa-ban"></i> Block
                                    </button>`
                                }
                                <button class="btn-small btn-secondary" onclick="deleteUserComments('${user.email}', '${user.name}')">
                                    <i class="fas fa-trash"></i> Delete Comments
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Update user statistics
function updateUserStats() {
    const users = getCollectedUsers();
    const blockedUsers = getBlockedUsers();
    const comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
    
    const totalUsersEl = document.getElementById('totalUsers');
    const blockedUsersEl = document.getElementById('blockedUsers');
    const totalCommentsEl = document.getElementById('totalComments');
    
    if (totalUsersEl) totalUsersEl.textContent = users.length;
    if (blockedUsersEl) blockedUsersEl.textContent = blockedUsers.length;
    if (totalCommentsEl) totalCommentsEl.textContent = comments.length;
}

// Export emails to CSV
function exportEmails() {
    const users = getCollectedUsers();
    
    if (users.length === 0) {
        alert('No user emails to export');
        return;
    }
    
    // Create CSV content
    let csv = 'Name,Email,Comments,Last Active\n';
    users.forEach(user => {
        const date = new Date(user.lastActive).toLocaleString();
        csv += `"${user.name}","${user.email}",${user.commentCount},"${date}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipl_user_emails_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showUserMgmtMessage('success', '✅ Emails exported successfully!');
}

// Refresh user data
function refreshUserData() {
    loadUserManagementData();
    showUserMgmtMessage('success', '✅ Data refreshed successfully!');
}

// Load user comments for admin
function loadUserCommentsAdmin() {
    const container = document.getElementById('userCommentsAdmin');
    if (!container) return;
    
    let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
    const blockedUsers = getBlockedUsers();
    
    if (comments.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No user comments yet.</p>';
        return;
    }
    
    // Sort by newest first
    comments.sort((a, b) => b.timestamp - a.timestamp);
    
    const html = comments.map((comment, index) => {
        const date = new Date(comment.timestamp).toLocaleString();
        const isBlocked = blockedUsers.includes(comment.email);
        
        return `
            <div class="user-comment-admin ${isBlocked ? 'blocked-comment' : ''}">
                <div class="comment-admin-header">
                    <div class="comment-admin-author">
                        <strong>${comment.author}</strong>
                        <span class="comment-admin-email">${comment.email}</span>
                        ${isBlocked ? '<span class="blocked-badge">BLOCKED USER</span>' : ''}
                    </div>
                    <div class="comment-admin-time">${date}</div>
                </div>
                <div class="comment-admin-text">${comment.text}</div>
                <div class="comment-admin-actions">
                    <button class="btn-small btn-danger" onclick="deleteUserComment(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${!isBlocked ? 
                        `<button class="btn-small btn-warning" onclick="blockUser('${comment.email}', '${comment.author}')">
                            <i class="fas fa-ban"></i> Block User
                        </button>` : ''
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Delete single user comment
function deleteUserComment(index) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
        let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
        comments.sort((a, b) => b.timestamp - a.timestamp);
        comments.splice(index, 1);
        localStorage.setItem('live_match_user_comments', JSON.stringify(comments));
        
        showUserMgmtMessage('success', '✅ Comment deleted successfully');
        loadUserCommentsAdmin();
        updateUserStats();
    } catch (e) {
        showUserMgmtMessage('error', '❌ Error deleting comment: ' + e.message);
    }
}

// Delete all comments from a specific user
function deleteUserComments(email, userName) {
    if (!confirm(`Are you sure you want to delete ALL comments from ${userName}?`)) return;
    
    try {
        let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
        const beforeCount = comments.length;
        comments = comments.filter(c => c.email !== email);
        const deletedCount = beforeCount - comments.length;
        
        localStorage.setItem('live_match_user_comments', JSON.stringify(comments));
        
        showUserMgmtMessage('success', `✅ Deleted ${deletedCount} comment(s) from ${userName}`);
        loadCollectedUsers();
        loadUserCommentsAdmin();
        updateUserStats();
    } catch (e) {
        showUserMgmtMessage('error', '❌ Error deleting comments: ' + e.message);
    }
}

// Clear all user comments
function clearAllUserComments() {
    if (!confirm('Are you sure you want to delete ALL user comments? This cannot be undone!')) return;
    
    try {
        localStorage.removeItem('live_match_user_comments');
        showUserMgmtMessage('success', '✅ All user comments cleared successfully');
        loadUserCommentsAdmin();
        updateUserStats();
    } catch (e) {
        showUserMgmtMessage('error', '❌ Error clearing comments: ' + e.message);
    }
}

// Show user management message
function showUserMgmtMessage(type, message) {
    const successMsg = document.getElementById('userMgmtSuccess');
    const errorMsg = document.getElementById('userMgmtError');
    
    if (type === 'success' && successMsg) {
        successMsg.textContent = message;
        errorMsg.textContent = '';
        setTimeout(() => successMsg.textContent = '', 3000);
    } else if (type === 'error' && errorMsg) {
        errorMsg.textContent = message;
        successMsg.textContent = '';
    }
}

// ===== ADMIN COMMENTARY MANAGEMENT =====

// Admin password (In production, use proper authentication)
const ADMIN_PASSWORD = 'admin123';
let isAdminVerified = false;

// Verify admin
function verifyAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminVerified = true;
        document.getElementById('adminAuthBox').style.display = 'none';
        document.getElementById('adminCommentaryMgmt').style.display = 'block';
        loadAdminCommentaryList();
    } else {
        alert('❌ Incorrect password');
        document.getElementById('adminPassword').value = '';
    }
}

// Logout admin
function logoutAdmin() {
    isAdminVerified = false;
    document.getElementById('adminAuthBox').style.display = 'block';
    document.getElementById('adminCommentaryMgmt').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Load admin commentary list
function loadAdminCommentaryList() {
    const container = document.getElementById('adminCommentaryList');
    if (!container) return;
    
    let commentary = JSON.parse(localStorage.getItem('live_match_commentary') || '[]');
    
    if (commentary.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No admin commentary posted yet.</p>';
        return;
    }
    
    // Sort by newest first
    commentary.sort((a, b) => b.timestamp - a.timestamp);
    
    const html = commentary.map((item, index) => {
        const date = new Date(item.timestamp).toLocaleString();
        
        return `
            <div class="admin-commentary-item">
                <div class="commentary-admin-header">
                    <span class="commentary-over-admin">Over ${item.over}</span>
                    <span class="commentary-time-admin">${date}</span>
                </div>
                <div class="commentary-text-admin">${item.text}</div>
                <button class="btn-small btn-danger" onclick="deleteAdminCommentary(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Delete single admin commentary
function deleteAdminCommentary(index) {
    if (!isAdminVerified) {
        alert('❌ Admin verification required');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this commentary?')) return;
    
    try {
        let commentary = JSON.parse(localStorage.getItem('live_match_commentary') || '[]');
        commentary.sort((a, b) => b.timestamp - a.timestamp);
        commentary.splice(index, 1);
        localStorage.setItem('live_match_commentary', JSON.stringify(commentary));
        
        alert('✅ Commentary deleted successfully');
        loadAdminCommentaryList();
    } catch (e) {
        alert('❌ Error deleting commentary: ' + e.message);
    }
}

// Update switchTab to load user management data
const originalSwitchTabFunc = switchTab;
switchTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'fixtures') showFixturesPreview();
    if (tabName === 'points') showPointsPreview();
    if (tabName === 'commentary') showCommentaryPreview();
    if (tabName === 'users') loadUserManagementData();
};

