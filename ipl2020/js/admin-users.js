/**
 * Admin Users Management Page
 * Displays all user emails and account creation details
 */

// Admin credentials (In production, use server-side authentication)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let allUsers = [];
let filteredUsers = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Admin Users Management Loading...');
    
    // Check if admin is already logged in
    if (isAdminLoggedIn()) {
        showDashboard();
        loadUsersData();
    }
});

// Check if admin is logged in
function isAdminLoggedIn() {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            // Check if session is less than 24 hours old
            const sessionAge = Date.now() - session.timestamp;
            if (sessionAge < 24 * 60 * 60 * 1000) {
                document.getElementById('adminDisplayName').textContent = session.username;
                return true;
            }
        } catch (e) {
            console.error('Invalid session:', e);
        }
    }
    return false;
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errorEl = document.getElementById('loginError');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store session
        const session = {
            username: username,
            timestamp: Date.now()
        };
        localStorage.setItem('admin_session', JSON.stringify(session));
        
        // Show dashboard
        showDashboard();
        loadUsersData();
    } else {
        errorEl.textContent = '❌ Invalid username or password';
        errorEl.classList.add('show');
        
        // Clear error after 3 seconds
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 3000);
    }
}

// Show dashboard (hide login modal)
function showDashboard() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Logout admin
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_session');
        location.reload();
    }
}

// Get all users from comments
function getAllUsers() {
    const comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
    const blockedUsers = JSON.parse(localStorage.getItem('blocked_users') || '[]');
    
    // Create a map to store unique users
    const usersMap = new Map();
    
    comments.forEach(comment => {
        if (!usersMap.has(comment.email)) {
            usersMap.set(comment.email, {
                name: comment.author,
                email: comment.email,
                commentCount: 0,
                firstSeen: comment.timestamp,
                lastActive: comment.timestamp,
                isBlocked: blockedUsers.includes(comment.email)
            });
        }
        
        const user = usersMap.get(comment.email);
        user.commentCount++;
        
        // Update first seen (earliest timestamp)
        if (comment.timestamp < user.firstSeen) {
            user.firstSeen = comment.timestamp;
        }
        
        // Update last active (latest timestamp)
        if (comment.timestamp > user.lastActive) {
            user.lastActive = comment.timestamp;
        }
    });
    
    return Array.from(usersMap.values()).sort((a, b) => b.firstSeen - a.firstSeen);
}

// Load and display users data
function loadUsersData() {
    console.log('📊 Loading users data...');
    
    allUsers = getAllUsers();
    filteredUsers = [...allUsers];
    
    updateStatistics();
    displayUsers();
}

// Update statistics cards
function updateStatistics() {
    const totalUsers = allUsers.length;
    const blockedUsers = allUsers.filter(u => u.isBlocked).length;
    const activeUsers = totalUsers - blockedUsers;
    const totalComments = allUsers.reduce((sum, user) => sum + user.commentCount, 0);
    
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('activeUsersCount').textContent = activeUsers;
    document.getElementById('blockedUsersCount').textContent = blockedUsers;
    document.getElementById('totalCommentsCount').textContent = totalComments;
}

// Display users in table
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    const noDataEl = document.getElementById('noDataMessage');
    const displayCountEl = document.getElementById('displayCount');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '';
        noDataEl.style.display = 'block';
        displayCountEl.textContent = '0';
        return;
    }
    
    noDataEl.style.display = 'none';
    displayCountEl.textContent = filteredUsers.length;
    
    const html = filteredUsers.map((user, index) => {
        const joinedDate = new Date(user.firstSeen);
        const lastActiveDate = new Date(user.lastActive);
        
        const joinedStr = joinedDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const lastActiveStr = lastActiveDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <tr class="${user.isBlocked ? 'blocked' : ''}">
                <td>${index + 1}</td>
                <td class="user-name">${user.name}</td>
                <td class="user-email">${user.email}</td>
                <td>${user.commentCount}</td>
                <td>${joinedStr}</td>
                <td>${lastActiveStr}</td>
                <td>
                    <span class="status-badge ${user.isBlocked ? 'blocked' : 'active'}">
                        ${user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </td>
                <td>
                    ${user.isBlocked ? 
                        `<button class="action-btn btn-unblock" onclick="unblockUser('${user.email}', '${user.name}')">
                            <i class="fas fa-unlock"></i> Unblock
                        </button>` :
                        `<button class="action-btn btn-block" onclick="blockUser('${user.email}', '${user.name}')">
                            <i class="fas fa-ban"></i> Block
                        </button>`
                    }
                    <button class="action-btn btn-delete" onclick="deleteUserComments('${user.email}', '${user.name}')">
                        <i class="fas fa-trash"></i> Delete Comments
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
}

// Filter users based on search and status
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredUsers = allUsers.filter(user => {
        // Search filter
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                            user.email.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        // Status filter
        if (statusFilter === 'active' && user.isBlocked) return false;
        if (statusFilter === 'blocked' && !user.isBlocked) return false;
        
        return true;
    });
    
    displayUsers();
}

// Block user
function blockUser(email, name) {
    if (!confirm(`Are you sure you want to block ${name}?\n\nThey will not be able to post comments anymore.`)) {
        return;
    }
    
    try {
        let blockedUsers = JSON.parse(localStorage.getItem('blocked_users') || '[]');
        
        if (!blockedUsers.includes(email)) {
            blockedUsers.push(email);
            localStorage.setItem('blocked_users', JSON.stringify(blockedUsers));
        }
        
        showNotification(`✅ ${name} has been blocked successfully`);
        loadUsersData();
        
    } catch (e) {
        alert('❌ Error blocking user: ' + e.message);
    }
}

// Unblock user
function unblockUser(email, name) {
    if (!confirm(`Are you sure you want to unblock ${name}?`)) {
        return;
    }
    
    try {
        let blockedUsers = JSON.parse(localStorage.getItem('blocked_users') || '[]');
        blockedUsers = blockedUsers.filter(e => e !== email);
        localStorage.setItem('blocked_users', JSON.stringify(blockedUsers));
        
        showNotification(`✅ ${name} has been unblocked successfully`);
        loadUsersData();
        
    } catch (e) {
        alert('❌ Error unblocking user: ' + e.message);
    }
}

// Delete all comments from a user
function deleteUserComments(email, name) {
    if (!confirm(`Are you sure you want to delete ALL comments from ${name}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
        const beforeCount = comments.length;
        
        comments = comments.filter(c => c.email !== email);
        const deletedCount = beforeCount - comments.length;
        
        localStorage.setItem('live_match_user_comments', JSON.stringify(comments));
        
        showNotification(`✅ Deleted ${deletedCount} comment(s) from ${name}`);
        loadUsersData();
        
    } catch (e) {
        alert('❌ Error deleting comments: ' + e.message);
    }
}

// Export users to CSV
function exportToCSV() {
    if (filteredUsers.length === 0) {
        alert('No users to export');
        return;
    }
    
    // Create CSV header
    let csv = 'Name,Email,Comments,Status,Joined Date,Last Active\n';
    
    // Add data rows
    filteredUsers.forEach(user => {
        const joinedDate = new Date(user.firstSeen).toLocaleString();
        const lastActive = new Date(user.lastActive).toLocaleString();
        const status = user.isBlocked ? 'Blocked' : 'Active';
        
        csv += `"${user.name}","${user.email}",${user.commentCount},"${status}","${joinedDate}","${lastActive}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ipl_users_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`✅ Exported ${filteredUsers.length} users to CSV`);
}

// Refresh data
function refreshData() {
    showNotification('🔄 Refreshing data...');
    loadUsersData();
    
    // Reset filters
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
}

// Show notification toast
function showNotification(message) {
    const toast = document.getElementById('notificationToast');
    const messageEl = document.getElementById('notificationMessage');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Console log
console.log('✅ Admin Users Management Scripts Loaded');
