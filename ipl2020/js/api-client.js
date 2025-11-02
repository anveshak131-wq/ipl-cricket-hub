/**
 * API Client for IPL Cricket Hub Python Backend
 * Replaces localStorage with secure server-side API calls
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('auth_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('auth_token');
}

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
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

// ===== USER AUTHENTICATION =====

/**
 * Register or login user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @returns {Promise} - User data and token
 */
async function registerUser(name, email) {
    const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
    });

    if (data.token) {
        setAuthToken(data.token);
        // Store user info locally for quick access
        localStorage.setItem('current_user', JSON.stringify(data.user));
    }

    return data;
}

/**
 * Get current user from localStorage
 * @returns {Object|null} - Current user or null
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Sign out current user
 */
function signOutUser() {
    removeAuthToken();
    localStorage.removeItem('current_user');
}

// ===== USER COMMENTS =====

/**
 * Post a new comment
 * @param {string} text - Comment text
 * @returns {Promise} - Comment data
 */
async function postComment(text) {
    return await apiCall('/comments', {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
}

/**
 * Get all comments
 * @returns {Promise} - Array of comments
 */
async function getAllComments() {
    const data = await apiCall('/comments');
    return data.comments || [];
}

// ===== ADMIN AUTHENTICATION =====

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise} - Admin data and token
 */
async function adminLogin(username, password) {
    const data = await apiCall('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
    }

    return data;
}

// ===== ADMIN USER MANAGEMENT =====

/**
 * Get all users (admin only)
 * @returns {Promise} - Array of users
 */
async function getAllUsers() {
    const data = await apiCall('/admin/users');
    return data.users || [];
}

/**
 * Block a user (admin only)
 * @param {number} userId - User ID
 * @returns {Promise} - Success response
 */
async function blockUser(userId) {
    return await apiCall(`/admin/users/${userId}/block`, {
        method: 'POST',
    });
}

/**
 * Unblock a user (admin only)
 * @param {number} userId - User ID
 * @returns {Promise} - Success response
 */
async function unblockUser(userId) {
    return await apiCall(`/admin/users/${userId}/unblock`, {
        method: 'POST',
    });
}

/**
 * Delete a comment (admin only)
 * @param {number} commentId - Comment ID
 * @returns {Promise} - Success response
 */
async function deleteComment(commentId) {
    return await apiCall(`/admin/comments/${commentId}`, {
        method: 'DELETE',
    });
}

// ===== ADMIN COMMENTARY =====

/**
 * Post admin commentary (admin only)
 * @param {string} over - Over number
 * @param {string} text - Commentary text
 * @returns {Promise} - Commentary data
 */
async function postAdminCommentary(over, text) {
    return await apiCall('/admin/commentary', {
        method: 'POST',
        body: JSON.stringify({ over, text }),
    });
}

/**
 * Get all admin commentary
 * @returns {Promise} - Array of commentary
 */
async function getAdminCommentary() {
    const data = await apiCall('/admin/commentary');
    return data.commentary || [];
}

/**
 * Delete admin commentary (admin only)
 * @param {number} commentaryId - Commentary ID
 * @returns {Promise} - Success response
 */
async function deleteAdminCommentary(commentaryId) {
    return await apiCall(`/admin/commentary/${commentaryId}`, {
        method: 'DELETE',
    });
}

/**
 * Export user emails (admin only)
 * @returns {Promise} - Array of users with emails
 */
async function exportUserEmails() {
    const data = await apiCall('/admin/export/emails');
    return data.users || [];
}

// ===== HEALTH CHECK =====

/**
 * Check if API is healthy
 * @returns {Promise} - Health status
 */
async function checkHealth() {
    return await apiCall('/health');
}

// Export all functions
window.APIClient = {
    // Auth
    registerUser,
    getCurrentUser,
    signOutUser,
    adminLogin,
    
    // Comments
    postComment,
    getAllComments,
    
    // Admin - Users
    getAllUsers,
    blockUser,
    unblockUser,
    deleteComment,
    
    // Admin - Commentary
    postAdminCommentary,
    getAdminCommentary,
    deleteAdminCommentary,
    exportUserEmails,
    
    // Health
    checkHealth,
};

console.log('✅ API Client loaded. Use window.APIClient to interact with backend.');
