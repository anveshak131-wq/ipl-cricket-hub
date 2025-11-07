/**
 * Admin API Client for IPL Cricket Hub
 * Replaces localStorage with Vercel KV API calls
 * 
 * Usage: Replace localStorage calls with these API functions
 */

const API_BASE = window.location.origin;

class AdminAPI {
    constructor() {
        this.baseUrl = API_BASE;
    }

    // Generic API call handler
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================
    // PLAYERS API
    // ==================

    async getPlayers(team) {
        const data = await this.request(`/api/admin/players?team=${team}`);
        return data.data;
    }

    async savePlayers(team, players) {
        return await this.request('/api/admin/players', {
            method: 'POST',
            body: JSON.stringify({ team, players })
        });
    }

    async deletePlayers(team) {
        return await this.request(`/api/admin/players?team=${team}`, {
            method: 'DELETE'
        });
    }

    // ==================
    // FIXTURES API
    // ==================

    async getFixtures() {
        const data = await this.request('/api/admin/fixtures');
        return data.data;
    }

    async saveFixtures(fixtures) {
        return await this.request('/api/admin/fixtures', {
            method: 'POST',
            body: JSON.stringify({ fixtures })
        });
    }

    async deleteFixtures() {
        return await this.request('/api/admin/fixtures', {
            method: 'DELETE'
        });
    }

    // ==================
    // POINTS TABLE API
    // ==================

    async getPoints() {
        const data = await this.request('/api/admin/points');
        return data.data;
    }

    async savePoints(points) {
        return await this.request('/api/admin/points', {
            method: 'POST',
            body: JSON.stringify({ points })
        });
    }

    async deletePoints() {
        return await this.request('/api/admin/points', {
            method: 'DELETE'
        });
    }

    // ==================
    // LIVE MATCH API
    // ==================

    async getLiveMatch() {
        const data = await this.request('/api/admin/live-match');
        return data.data;
    }

    async saveLiveMatch(matchData) {
        return await this.request('/api/admin/live-match', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    }

    async deleteLiveMatch() {
        return await this.request('/api/admin/live-match', {
            method: 'DELETE'
        });
    }

    // ==================
    // HELPER METHODS
    // ==================

    // Show success message
    showSuccess(message) {
        const toast = document.getElementById('toast') || this.createToast();
        toast.textContent = message;
        toast.className = 'toast show success';
        setTimeout(() => toast.className = 'toast', 3000);
    }

    // Show error message
    showError(message) {
        const toast = document.getElementById('toast') || this.createToast();
        toast.textContent = message;
        toast.className = 'toast show error';
        setTimeout(() => toast.className = 'toast', 3000);
    }

    // Create toast element if it doesn't exist
    createToast() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
        return toast;
    }

    // Show loading state
    showLoading(element, message = 'Loading...') {
        if (element) {
            element.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Create global instance
window.adminAPI = new AdminAPI();

// ==================
// MIGRATION HELPERS
// ==================

/**
 * Migrate data from localStorage to API
 * Run this once to move all your existing data
 */
async function migrateFromLocalStorage() {
    try {
        console.log('🔄 Starting migration from localStorage to API...');
        
        const teams = ['RCB', 'MI', 'CSK', 'KKR', 'DC', 'SRH', 'RR', 'PBSK', 'GT', 'LSG'];
        
        // Migrate players
        for (const team of teams) {
            const players = localStorage.getItem(`players_${team}`);
            if (players) {
                await adminAPI.savePlayers(team, JSON.parse(players));
                console.log(`✅ Migrated ${team} players`);
            }
        }
        
        // Migrate fixtures
        const fixtures = localStorage.getItem('fixtures');
        if (fixtures) {
            await adminAPI.saveFixtures(JSON.parse(fixtures));
            console.log('✅ Migrated fixtures');
        }
        
        // Migrate points table
        const points = localStorage.getItem('pointsTable');
        if (points) {
            await adminAPI.savePoints(JSON.parse(points));
            console.log('✅ Migrated points table');
        }
        
        // Migrate live match
        const liveMatch = localStorage.getItem('liveMatch');
        if (liveMatch) {
            await adminAPI.saveLiveMatch(JSON.parse(liveMatch));
            console.log('✅ Migrated live match');
        }
        
        console.log('🎉 Migration completed successfully!');
        alert('Migration completed! You can now clear localStorage.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        alert('Migration failed: ' + error.message);
    }
}

// ==================
// USAGE EXAMPLES
// ==================

/**
 * Example 1: Save Players (replaces localStorage)
 * 
 * OLD WAY:
 * localStorage.setItem('players_RCB', JSON.stringify(players));
 * 
 * NEW WAY:
 */
async function exampleSavePlayers() {
    const players = [
        { name: 'Virat Kohli', role: 'Batsman', jersey: 18 },
        { name: 'Faf du Plessis', role: 'Batsman', jersey: 19 }
    ];
    
    try {
        await adminAPI.savePlayers('RCB', players);
        adminAPI.showSuccess('Players saved successfully!');
    } catch (error) {
        adminAPI.showError('Failed to save players');
    }
}

/**
 * Example 2: Load Players (replaces localStorage)
 * 
 * OLD WAY:
 * const players = JSON.parse(localStorage.getItem('players_RCB')) || [];
 * 
 * NEW WAY:
 */
async function exampleLoadPlayers() {
    try {
        const players = await adminAPI.getPlayers('RCB');
        console.log('Players:', players);
        // Display players...
    } catch (error) {
        adminAPI.showError('Failed to load players');
    }
}

/**
 * Example 3: Save Fixtures
 */
async function exampleSaveFixtures() {
    const fixtures = [
        { date: '2026-03-25', team1: 'CSK', team2: 'MI', venue: 'Wankhede' },
        { date: '2026-03-26', team1: 'RCB', team2: 'KKR', venue: 'Chinnaswamy' }
    ];
    
    try {
        await adminAPI.saveFixtures(fixtures);
        adminAPI.showSuccess('Fixtures saved!');
    } catch (error) {
        adminAPI.showError('Failed to save fixtures');
    }
}

/**
 * Example 4: Update Live Match
 */
async function exampleUpdateLiveMatch() {
    const liveData = {
        team1: 'CSK',
        team2: 'MI',
        score1: '195/6',
        score2: '142/8',
        overs1: '20.0',
        overs2: '15.3',
        status: 'CSK winning by 53 runs',
        live: true
    };
    
    try {
        await adminAPI.saveLiveMatch(liveData);
        adminAPI.showSuccess('Live match updated!');
    } catch (error) {
        adminAPI.showError('Failed to update live match');
    }
}

// ==================
// AUTO-INIT
// ==================

// Log when API client is ready
console.log('✅ Admin API Client loaded');
console.log('📡 API Base URL:', API_BASE);
console.log('💡 Use adminAPI.* methods to interact with the backend');
console.log('🔄 To migrate from localStorage, run: migrateFromLocalStorage()');

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAPI;
}
