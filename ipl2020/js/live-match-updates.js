// Live Match Updates - JavaScript with AI Commentary Enhancement

// Check for new commentary every 10 seconds
let lastCommentaryCount = 0;
let autoRefreshInterval;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Live Match Updates Loading...');
    
    // Load initial commentary
    loadCommentary();
    
    // Start auto-refresh
    startAutoRefresh();
    
    console.log('✅ Live Match Center Loaded');
});

// Start auto-refresh for new commentary
function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        checkForNewCommentary();
    }, 10000); // Check every 10 seconds
}

// Check if there's new commentary
function checkForNewCommentary() {
    const commentary = getCommentaryFromStorage();
    if (commentary.length > lastCommentaryCount) {
        showNewCommentaryNotification();
        loadCommentary();
        lastCommentaryCount = commentary.length;
    }
}

// Show notification for new commentary
function showNewCommentaryNotification() {
    const notification = document.getElementById('newCommentaryNotification');
    if (notification) {
        notification.classList.add('show');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
}

// Dismiss notification
function dismissNotification() {
    const notification = document.getElementById('newCommentaryNotification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// Get commentary from localStorage
function getCommentaryFromStorage() {
    try {
        const stored = localStorage.getItem('live_match_commentary');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error loading commentary:', e);
        return [];
    }
}

// AI Enhancement - Refine and format commentary text
function enhanceCommentaryWithAI(rawText, over) {
    // This simulates AI enhancement
    // In production, this would call an LLM API (OpenAI, Claude, etc.)
    
    let enhanced = rawText.trim();
    
    // Add cricket terminology enhancements
    enhanced = enhanced.replace(/\bfour\b/gi, 'FOUR!');
    enhanced = enhanced.replace(/\bsix\b/gi, 'SIX!');
    enhanced = enhanced.replace(/\bwicket\b/gi, 'WICKET!');
    enhanced = enhanced.replace(/\bout\b/gi, 'OUT!');
    enhanced = enhanced.replace(/\bfifty\b/gi, 'FIFTY!');
    enhanced = enhanced.replace(/\bcentury\b/gi, 'CENTURY!');
    enhanced = enhanced.replace(/\bhundred\b/gi, 'CENTURY!');
    
    // Add contextual phrases based on over number
    const overNum = parseFloat(over);
    let context = '';
    
    if (overNum <= 6) {
        context = '⚡ Powerplay action! ';
    } else if (overNum >= 16) {
        context = '🔥 Death overs drama! ';
    } else if (overNum === 10) {
        context = '📊 Halfway mark! ';
    }
    
    // Add excitement based on keywords
    if (enhanced.includes('SIX!') || enhanced.includes('FOUR!')) {
        enhanced = context + enhanced + ' What a shot! The crowd is on their feet!';
    } else if (enhanced.includes('WICKET!') || enhanced.includes('OUT!')) {
        enhanced = context + enhanced + ' Crucial breakthrough for the bowling side!';
    } else if (enhanced.includes('FIFTY!') || enhanced.includes('CENTURY!')) {
        enhanced = context + enhanced + ' Magnificent innings! The player raises the bat to acknowledge the crowd!';
    } else {
        enhanced = context + enhanced;
    }
    
    return enhanced;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 minute ago
    if (diff < 60000) {
        return 'Just now';
    }
    // If less than 1 hour ago
    else if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins} min${mins > 1 ? 's' : ''} ago`;
    }
    // Otherwise show time
    else {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
}

// Load and display commentary
function loadCommentary() {
    const container = document.getElementById('commentaryContainer');
    if (!container) return;
    
    const commentary = getCommentaryFromStorage();
    lastCommentaryCount = commentary.length;
    
    if (commentary.length === 0) {
        container.innerHTML = `
            <div class="no-commentary">
                <i class="fas fa-comment-slash"></i>
                <p>Waiting for live commentary...</p>
                <small>Admins can post updates every 5 overs or during breaks</small>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    commentary.sort((a, b) => b.timestamp - a.timestamp);
    
    // Generate HTML for each commentary item
    const html = commentary.map(item => {
        const enhancedText = enhanceCommentaryWithAI(item.text, item.over);
        const timeAgo = formatTime(item.timestamp);
        
        return `
            <div class="commentary-item">
                <div class="commentary-header">
                    <span class="commentary-over">Over ${item.over}</span>
                    <span class="commentary-time">
                        <i class="fas fa-clock"></i> ${timeAgo}
                    </span>
                </div>
                <div class="commentary-text">
                    ${enhancedText}
                </div>
                <div class="ai-enhanced-badge">
                    <i class="fas fa-brain"></i>
                    AI Enhanced
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Scroll to top to show latest
    container.scrollTop = 0;
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 14, 39, 1)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
    }
});

// Simulate live score updates (for demo purposes)
function simulateLiveUpdates() {
    // This would be replaced with real-time data from API
    const scoreElements = document.querySelectorAll('.runs');
    if (scoreElements.length > 0) {
        // Update score occasionally for live feel
        setInterval(() => {
            const currentScore = parseInt(scoreElements[0].textContent);
            // Randomly add 0-6 runs
            const newScore = currentScore + Math.floor(Math.random() * 7);
            scoreElements[0].textContent = newScore;
        }, 30000); // Every 30 seconds
    }
}

// Initialize live updates simulation
simulateLiveUpdates();

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// Console log for debugging
console.log('🚀 Live Match Updates Scripts Loaded');

// Export functions for admin panel integration
window.LiveMatchUpdates = {
    loadCommentary: loadCommentary,
    getCommentaryFromStorage: getCommentaryFromStorage,
    enhanceCommentaryWithAI: enhanceCommentaryWithAI
};

// ===== UPCOMING MATCH & USER COMMENTS FUNCTIONALITY =====

// Check if user is signed in
function checkUserSignIn() {
    const user = JSON.parse(localStorage.getItem('live_match_user') || 'null');
    if (user) {
        document.getElementById('signInPrompt').style.display = 'none';
        document.getElementById('signInForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('postCommentBox').style.display = 'block';
        
        document.getElementById('userNameDisplay').textContent = user.name;
        document.getElementById('userEmailDisplay').textContent = user.email;
    } else {
        document.getElementById('signInPrompt').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('postCommentBox').style.display = 'none';
    }
}

// Show sign-in form
function showSignInForm() {
    document.getElementById('signInPrompt').style.display = 'none';
    document.getElementById('signInForm').style.display = 'block';
}

// Hide sign-in form
function hideSignInForm() {
    document.getElementById('signInPrompt').style.display = 'block';
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
}

// Sign in user
function signInUser() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!name || !email) {
        alert('Please enter both name and email');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Save user to localStorage
    const user = { name, email, signedInAt: Date.now() };
    localStorage.setItem('live_match_user', JSON.stringify(user));
    
    // Update UI
    checkUserSignIn();
}

// Sign out user
function signOutUser() {
    if (!confirm('Are you sure you want to sign out?')) return;
    
    localStorage.removeItem('live_match_user');
    checkUserSignIn();
}

// Character counter for comment textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('userCommentText');
    if (textarea) {
        textarea.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('charCount').textContent = count;
        });
    }
    
    // Check user sign-in status
    checkUserSignIn();
    
    // Load user comments
    loadUserComments();
    
    // Load upcoming match if no live match
    loadMatchInfo();
});

// Match-related keywords to validate comments
const matchKeywords = [
    'match', 'cricket', 'ipl', 'player', 'team', 'run', 'wicket', 'ball', 'over', 
    'bat', 'bowl', 'catch', 'six', 'four', 'out', 'score', 'win', 'lose',
    'rohit', 'virat', 'dhoni', 'bumrah', 'kohli', 'sharma', 'yadav',
    'MI', 'CSK', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBSK', 'GT', 'LSG',
    'mumbai', 'chennai', 'bangalore', 'kolkata', 'delhi', 'hyderabad', 'rajasthan', 'punjab', 'gujarat', 'lucknow',
    'powerplay', 'death', 'innings', 'toss', 'chase', 'target', 'captain', 'fielding'
];

// Check if comment is match-related
function isMatchRelated(text) {
    const lowerText = text.toLowerCase();
    return matchKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Post user comment
function postUserComment() {
    const text = document.getElementById('userCommentText').value.trim();
    const messageEl = document.getElementById('commentMessage');
    const user = JSON.parse(localStorage.getItem('live_match_user') || 'null');
    
    // Clear previous message
    messageEl.className = 'comment-message';
    messageEl.textContent = '';
    
    if (!user) {
        messageEl.className = 'comment-message error';
        messageEl.textContent = '❌ Please sign in to post a comment';
        return;
    }
    
    if (!text || text.length < 10) {
        messageEl.className = 'comment-message error';
        messageEl.textContent = '❌ Comment must be at least 10 characters long';
        return;
    }
    
    // Check if comment is match-related
    if (!isMatchRelated(text)) {
        messageEl.className = 'comment-message error';
        messageEl.textContent = '❌ Please post only match-related comments. Your comment should mention teams, players, or match events.';
        return;
    }
    
    try {
        // Get existing comments
        let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
        
        // Add new comment
        comments.push({
            text: text,
            author: user.name,
            email: user.email,
            timestamp: Date.now()
        });
        
        // Save to localStorage
        localStorage.setItem('live_match_user_comments', JSON.stringify(comments));
        
        // Show success message
        messageEl.className = 'comment-message success';
        messageEl.textContent = '✅ Your comment has been posted successfully!';
        
        // Clear textarea
        document.getElementById('userCommentText').value = '';
        document.getElementById('charCount').textContent = '0';
        
        // Reload comments
        loadUserComments();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            messageEl.className = 'comment-message';
            messageEl.textContent = '';
        }, 3000);
        
    } catch (e) {
        messageEl.className = 'comment-message error';
        messageEl.textContent = '❌ Error posting comment: ' + e.message;
    }
}

// Load and display user comments
function loadUserComments() {
    const container = document.getElementById('userCommentsContainer');
    const countEl = document.getElementById('commentsCount');
    
    if (!container) return;
    
    try {
        let comments = JSON.parse(localStorage.getItem('live_match_user_comments') || '[]');
        
        // Update count
        if (countEl) {
            countEl.textContent = comments.length;
        }
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment-slash"></i>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        // Sort comments
        const sortOrder = document.getElementById('commentsSort').value;
        if (sortOrder === 'newest') {
            comments.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            comments.sort((a, b) => a.timestamp - b.timestamp);
        }
        
        // Generate HTML
        const html = comments.map(comment => {
            const date = new Date(comment.timestamp);
            const timeAgo = formatTime(comment.timestamp);
            const initial = comment.author.charAt(0).toUpperCase();
            
            return `
                <div class="user-comment-item">
                    <div class="comment-author">
                        <div class="comment-avatar">${initial}</div>
                        <div class="comment-author-info">
                            <div class="comment-author-name">${comment.author}</div>
                            <div class="comment-time">
                                <i class="fas fa-clock"></i> ${timeAgo}
                            </div>
                        </div>
                    </div>
                    <div class="comment-text-user">${comment.text}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
    } catch (e) {
        container.innerHTML = '<div class="no-comments"><p>Error loading comments</p></div>';
    }
}

// Load match info - check if live match or upcoming match
function loadMatchInfo() {
    const liveMatch = JSON.parse(localStorage.getItem('live_match_info') || 'null');
    
    if (liveMatch && liveMatch.isLive) {
        // Display live match data
        updateScoreboard(liveMatch);
    } else {
        // Show upcoming match from fixtures
        showUpcomingMatch();
    }
}

// Show upcoming match info
function showUpcomingMatch() {
    const scoreboard = document.getElementById('scoreboard');
    if (!scoreboard) return;
    
    // Get fixtures from localStorage
    const fixtures = JSON.parse(localStorage.getItem('fixtures') || '[]');
    
    if (fixtures.length === 0) {
        // Show message that fixtures are not confirmed yet
        scoreboard.classList.add('centered-content');
        scoreboard.innerHTML = `
            <div class="upcoming-match-container">
                <div class="upcoming-badge" style="background: linear-gradient(135deg, var(--warning), #FBBF24);">
                    <i class="fas fa-calendar-times"></i>
                    SCHEDULE TO BE ANNOUNCED
                </div>
                <div class="no-match-info">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>IPL Schedule Coming Soon</h3>
                    <p>Match fixtures will be announced soon. Stay tuned for the official schedule!</p>
                </div>
                <div class="match-preview-note" style="background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">
                    <i class="fas fa-bell"></i>
                    You will be notified once the match schedule is confirmed
                </div>
            </div>
        `;
    } else {
        // Show first fixture from the list
        scoreboard.classList.remove('centered-content');
        const nextMatch = fixtures[0];
        scoreboard.innerHTML = `
            <div class="upcoming-match-container">
                <div class="upcoming-badge">
                    <i class="fas fa-calendar-alt"></i>
                    UPCOMING MATCH
                </div>
                <div class="upcoming-teams">
                    <div class="upcoming-team">
                        <img src="assets/${nextMatch.team1.toLowerCase()}_logo_new.svg" alt="${nextMatch.team1}" class="team-logo-score">
                        <h3>${getTeamName(nextMatch.team1)}</h3>
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="upcoming-team">
                        <img src="assets/${nextMatch.team2.toLowerCase()}_logo_new.svg" alt="${nextMatch.team2}" class="team-logo-score">
                        <h3>${getTeamName(nextMatch.team2)}</h3>
                    </div>
                </div>
                <div class="upcoming-info">
                    <div class="upcoming-date">
                        <i class="fas fa-calendar"></i>
                        ${nextMatch.date}
                    </div>
                    <div class="upcoming-time">
                        <i class="fas fa-clock"></i>
                        ${nextMatch.time}
                    </div>
                    <div class="upcoming-venue">
                        <i class="fas fa-map-marker-alt"></i>
                        ${nextMatch.venue}
                    </div>
                </div>
                <div class="match-preview-note">
                    <i class="fas fa-info-circle"></i>
                    Live scores and commentary will appear here when the match starts
                </div>
            </div>
        `;
    }
    
    // Hide live indicator when no live match
    const liveIndicator = document.querySelector('.live-indicator');
    if (liveIndicator) {
        liveIndicator.style.display = 'none';
    }
}

// Get full team name
function getTeamName(code) {
    const teamNames = {
        'MI': 'Mumbai Indians',
        'CSK': 'Chennai Super Kings',
        'RCB': 'Royal Challengers Bangalore',
        'KKR': 'Kolkata Knight Riders',
        'DC': 'Delhi Capitals',
        'SRH': 'Sunrisers Hyderabad',
        'RR': 'Rajasthan Royals',
        'PBSK': 'Punjab Kings',
        'GT': 'Gujarat Titans',
        'LSG': 'Lucknow Super Giants'
    };
    return teamNames[code] || code;
}

// Update scoreboard with live match data
function updateScoreboard(matchData) {
    // This function would update the scoreboard with actual live data
    // For now, it keeps the default display
    console.log('Live match detected:', matchData);
}


// Check if user is blocked
function checkIfUserBlocked(email) {
    const blockedUsers = JSON.parse(localStorage.getItem('blocked_users') || '[]');
    return blockedUsers.includes(email);
}

// Override the postUserComment function to check for blocked users
const originalPostUserComment = postUserComment;
postUserComment = function() {
    const user = JSON.parse(localStorage.getItem('live_match_user') || 'null');
    
    if (user && checkIfUserBlocked(user.email)) {
        const messageEl = document.getElementById('commentMessage');
        messageEl.className = 'comment-message error';
        messageEl.textContent = '❌ You have been blocked from posting comments. Please contact support if you believe this is a mistake.';
        return;
    }
    
    // Call original function
    originalPostUserComment();
};


// ===== LOAD ADMIN-CONTROLLED LIVE DATA =====

function loadLiveMatchData() {
    // Check if match is live
    const liveStatus = JSON.parse(localStorage.getItem('live_match_status') || '{"isLive":false}');
    
    if (!liveStatus.isLive) {
        // Show placeholder content
        showPlaceholderContent();
        return;
    }
    
    // Load and display live data
    loadLiveStats();
    loadLivePartnership();
    loadLiveBowler();
    loadLiveAIInsight();
    loadLiveKeyMoments();
    
    // Show live indicator
    const liveIndicator = document.querySelector('.live-indicator');
    if (liveIndicator) {
        liveIndicator.style.display = 'flex';
    }
}

function loadLiveStats() {
    const stats = JSON.parse(localStorage.getItem('live_match_stats') || '{}');
    const statsSidebar = document.getElementById('statsSidebar');
    
    if (!statsSidebar) return;
    
    if (!stats.powerplayScore && !stats.boundaries) {
        return; // Keep placeholder
    }
    
    statsSidebar.innerHTML = `
        <div class="sidebar-section">
            <h3><i class="fas fa-chart-bar"></i> Match Stats</h3>
            <div class="stat-item">
                <span class="stat-label">Powerplay Score</span>
                <span class="stat-value">${stats.powerplayScore || 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Boundaries</span>
                <span class="stat-value">${stats.boundaries || 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Partnerships</span>
                <span class="stat-value">${stats.partnership || 'N/A'}</span>
            </div>
            ${stats.winProbability ? `
            <div class="stat-item">
                <span class="stat-label">Win Probability</span>
                <div class="win-prob-bar">
                    <div class="win-prob-fill" style="width: ${stats.winProbability}%">${stats.winProbability}%</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function loadLivePartnership() {
    const partnership = JSON.parse(localStorage.getItem('live_match_partnership') || '{}');
    const statsSidebar = document.getElementById('statsSidebar');
    
    if (!statsSidebar || (!partnership.batsman1 && !partnership.batsman2)) return;
    
    const partnershipHTML = `
        <div class="sidebar-section">
            <h3><i class="fas fa-users"></i> Current Partnership</h3>
            <div class="partnership-info">
                ${partnership.batsman1 ? `
                <div class="batsman-info">
                    <div class="batsman-name">${partnership.batsman1.name}*</div>
                    <div class="batsman-stats">${partnership.batsman1.stats || '0 (0)'} • ${partnership.batsman1.boundaries || '0x4, 0x6'}</div>
                </div>
                ` : ''}
                ${partnership.batsman2 ? `
                <div class="batsman-info">
                    <div class="batsman-name">${partnership.batsman2.name}</div>
                    <div class="batsman-stats">${partnership.batsman2.stats || '0 (0)'} • ${partnership.batsman2.boundaries || '0x4, 0x6'}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    statsSidebar.insertAdjacentHTML('beforeend', partnershipHTML);
}

function loadLiveBowler() {
    const bowler = JSON.parse(localStorage.getItem('live_match_bowler') || '{}');
    const statsSidebar = document.getElementById('statsSidebar');
    
    if (!statsSidebar || !bowler.name) return;
    
    const bowlerHTML = `
        <div class="sidebar-section">
            <h3><i class="fas fa-bowling-ball"></i> Current Bowler</h3>
            <div class="bowler-info">
                <div class="bowler-name">${bowler.name}</div>
                <div class="bowler-stats">${bowler.stats || 'N/A'}</div>
            </div>
        </div>
    `;
    
    statsSidebar.insertAdjacentHTML('beforeend', bowlerHTML);
}

function loadLiveAIInsight() {
    const aiInsight = JSON.parse(localStorage.getItem('live_match_ai_insight') || '{}');
    const momentsSidebar = document.getElementById('momentsSidebar');
    
    if (!momentsSidebar || !aiInsight.text) return;
    
    // Remove placeholder first
    const placeholder = momentsSidebar.querySelector('.no-live-content');
    if (placeholder && placeholder.parentElement) {
        placeholder.parentElement.remove();
    }
    
    const insightHTML = `
        <div class="sidebar-section">
            <h3><i class="fas fa-lightbulb"></i> AI Insights</h3>
            <div class="ai-insight-box">
                <div class="insight-badge">
                    <i class="fas fa-brain"></i>
                    ML Analysis
                </div>
                <p>${aiInsight.text}</p>
            </div>
        </div>
    `;
    
    momentsSidebar.insertAdjacentHTML('beforeend', insightHTML);
}

function loadLiveKeyMoments() {
    const moments = JSON.parse(localStorage.getItem('live_match_key_moments') || '[]');
    const momentsSidebar = document.getElementById('momentsSidebar');
    
    if (!momentsSidebar || moments.length === 0) return;
    
    // Sort by timestamp (newest first)
    moments.sort((a, b) => b.timestamp - a.timestamp);
    
    const momentsHTML = moments.slice(0, 5).map(moment => {
        let iconClass = 'fas fa-times-circle';
        let momentClass = 'wicket';
        
        if (moment.type === 'six') {
            iconClass = 'fas fa-rocket';
            momentClass = 'six';
        } else if (moment.type === 'four') {
            iconClass = 'fas fa-arrow-right';
            momentClass = 'four';
        } else if (moment.type === 'milestone') {
            iconClass = 'fas fa-trophy';
            momentClass = 'milestone';
        }
        
        return `
            <div class="moment-item ${momentClass}">
                <div class="moment-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="moment-details">
                    <div class="moment-title">${moment.type.toUpperCase()}!</div>
                    <div class="moment-desc">${moment.description}</div>
                    <div class="moment-over">${moment.over} overs</div>
                </div>
            </div>
        `;
    }).join('');
    
    const keyMomentsSection = `
        <div class="sidebar-section">
            <h3><i class="fas fa-star"></i> Key Moments</h3>
            <div class="moment-timeline">
                ${momentsHTML}
            </div>
        </div>
    `;
    
    // Insert at the beginning
    momentsSidebar.insertAdjacentHTML('afterbegin', keyMomentsSection);
}

function showPlaceholderContent() {
    // Already shown by default in HTML
    // This function can be used to reset to placeholders if needed
}

// Update the loadMatchInfo function to also load live data
const originalLoadMatchInfo = loadMatchInfo;
loadMatchInfo = function() {
    originalLoadMatchInfo();
    
    // After loading match info, check if we should load live data
    const liveStatus = JSON.parse(localStorage.getItem('live_match_status') || '{"isLive":false}');
    if (liveStatus.isLive) {
        setTimeout(() => {
            loadLiveMatchData();
        }, 500);
    }
};

// Call loadLiveMatchData on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadLiveMatchData();
    }, 1000);
});

