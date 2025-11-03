/**
 * Team Data Loader - Fetches player data from backend API and stores in localStorage
 */

const BACKEND_URL = 'https://your-backend-url.vercel.app'; // Update with your backend URL

const TEAMS = ['rcb', 'mi', 'csk', 'srh', 'kxip', 'kkr', 'dc', 'rr', 'gt', 'lsg'];

/**
 * Fetch player data from backend for a specific team
 */
async function fetchTeamPlayers(teamCode) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/players/${teamCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.players || [];
    } catch (error) {
        console.error(`Error fetching ${teamCode} players:`, error);
        return null;
    }
}

/**
 * Save team players to localStorage
 */
function saveTeamPlayers(teamCode, players) {
    const storageKey = `uploaded_${teamCode.toLowerCase()}_players`;
    localStorage.setItem(storageKey, JSON.stringify(players));
    console.log(`✅ Saved ${players.length} players for ${teamCode.toUpperCase()}`);
}

/**
 * Load all team data from backend
 */
async function loadAllTeamsData() {
    console.log('🔄 Loading team data from backend...');
    
    const results = {
        success: [],
        failed: []
    };

    for (const team of TEAMS) {
        const players = await fetchTeamPlayers(team);
        
        if (players && players.length > 0) {
            saveTeamPlayers(team, players);
            results.success.push(team);
        } else {
            results.failed.push(team);
        }
        
        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Successfully loaded: ${results.success.join(', ')}`);
    if (results.failed.length > 0) {
        console.log(`❌ Failed to load: ${results.failed.join(', ')}`);
    }

    return results;
}

/**
 * Check if team data exists in localStorage
 */
function checkTeamData(teamCode) {
    const storageKey = `uploaded_${teamCode.toLowerCase()}_players`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data).length : 0;
}

/**
 * Display team data status
 */
function displayDataStatus() {
    console.log('\n📊 Team Data Status:');
    TEAMS.forEach(team => {
        const count = checkTeamData(team);
        console.log(`${team.toUpperCase()}: ${count} players`);
    });
}

// Auto-load on page load if needed
document.addEventListener('DOMContentLoaded', function() {
    // Check if any team data is missing
    const missingData = TEAMS.filter(team => checkTeamData(team) === 0);
    
    if (missingData.length > 0) {
        console.log(`⚠️ Missing data for: ${missingData.join(', ')}`);
        console.log('💡 Run loadAllTeamsData() to fetch from backend');
    }
});

// Expose functions globally for manual use
window.TeamDataLoader = {
    loadAllTeamsData,
    fetchTeamPlayers,
    saveTeamPlayers,
    checkTeamData,
    displayDataStatus,
    TEAMS
};
