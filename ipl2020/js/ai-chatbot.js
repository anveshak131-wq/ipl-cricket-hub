/**
 * IPL Cricket Hub - AI Chatbot
 * Intelligent assistant for cricket queries and website navigation
 */

class IPLChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.apiKey = this.getAPIKey();
        this.chatHistory = this.loadChatHistory();
        this.init();
    }

    init() {
        this.createChatWidget();
        this.setupEventListeners();
        this.loadWelcomeMessage();
    }

    // Get API key from localStorage or use free alternative
    getAPIKey() {
        return localStorage.getItem('chatbot_api_key') || null;
    }

    // Create chatbot HTML
    createChatWidget() {
        const chatHTML = `
            <!-- Chatbot Button -->
            <div id="chatbot-button" class="chatbot-button" title="Chat with IPL Assistant">
                <span style="font-size: 1.5rem;">💬</span>
                <span class="chat-badge" id="chatBadge">1</span>
            </div>

            <!-- Chatbot Widget -->
            <div id="chatbot-widget" class="chatbot-widget">
                <div class="chatbot-header">
                    <div class="chatbot-header-left">
                        <div class="chatbot-avatar">
                            <span style="font-size: 1.5rem;">🤖</span>
                        </div>
                        <div class="chatbot-info">
                            <h3>IPL Assistant</h3>
                            <span class="chatbot-status">
                                <span class="status-dot"></span> Online
                            </span>
                        </div>
                    </div>
                    <div class="chatbot-header-right">
                        <button class="chatbot-btn" onclick="iplChatbot.minimizeChat()" title="Minimize">
                            <span style="font-size: 1.1rem;">➖</span>
                        </button>
                        <button class="chatbot-btn" onclick="iplChatbot.clearChat()" title="Clear Chat">
                            <span style="font-size: 1.1rem;">🗑️</span>
                        </button>
                        <button class="chatbot-btn" onclick="iplChatbot.closeChat()" title="Close">
                            <span style="font-size: 1.1rem;">✖️</span>
                        </button>
                    </div>
                </div>

                <div class="chatbot-messages" id="chatMessages">
                    <!-- Messages will be added here -->
                </div>

                <div class="chatbot-quick-actions" id="quickActions">
                    <button class="quick-btn" onclick="iplChatbot.sendQuickMessage('Predict MI vs CSK')">
                        <span class="quick-emoji" style="font-size: 1.3rem; margin-right: 0.3rem;">🔮</span> Predict Match
                    </button>
                    <button class="quick-btn" onclick="iplChatbot.sendQuickMessage('Show points table')">
                        <span class="quick-emoji" style="font-size: 1.3rem; margin-right: 0.3rem;">🏆</span> Points Table
                    </button>
                    <button class="quick-btn" onclick="iplChatbot.sendQuickMessage('Show me fixtures')">
                        <span class="quick-emoji" style="font-size: 1.3rem; margin-right: 0.3rem;">📅</span> Fixtures
                    </button>
                    <button class="quick-btn" onclick="iplChatbot.sendQuickMessage('Tell me about IPL teams')">
                        <span class="quick-emoji" style="font-size: 1.3rem; margin-right: 0.3rem;">👥</span> Teams Info
                    </button>
                </div>

                <div class="chatbot-typing" id="typingIndicator" style="display: none;">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div class="chatbot-input">
                    <button class="chatbot-attach" onclick="iplChatbot.showOptions()" title="Options">
                        <span style="font-size: 1.1rem;">📎</span>
                    </button>
                    <input 
                        type="text" 
                        id="chatInput" 
                        placeholder="Ask me anything about IPL..."
                        onkeypress="if(event.key==='Enter') iplChatbot.sendMessage()"
                    />
                    <button class="chatbot-send" onclick="iplChatbot.sendMessage()">
                        <span style="font-size: 1.1rem;">📤</span>
                    </button>
                </div>

                <div class="chatbot-powered">
                    Powered by AI & Machine Learning
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    // Setup event listeners
    setupEventListeners() {
        const button = document.getElementById('chatbot-button');
        button.addEventListener('click', () => this.toggleChat());

        // Voice input support
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceInput();
        }
    }

    // Toggle chat window
    toggleChat() {
        this.isOpen = !this.isOpen;
        const widget = document.getElementById('chatbot-widget');
        const button = document.getElementById('chatbot-button');
        
        if (this.isOpen) {
            widget.style.display = 'flex';
            button.style.display = 'none';
            document.getElementById('chatInput').focus();
            this.hideBadge();
        } else {
            widget.style.display = 'none';
            button.style.display = 'flex';
        }
    }

    // Close chat
    closeChat() {
        this.isOpen = false;
        document.getElementById('chatbot-widget').style.display = 'none';
        document.getElementById('chatbot-button').style.display = 'flex';
    }

    // Minimize chat
    minimizeChat() {
        this.closeChat();
    }

    // Load welcome message
    loadWelcomeMessage() {
        const welcomeMsg = `
            👋 Welcome to IPL Cricket Hub! I'm your AI assistant.
            
            I can help you with:
            • 🔮 Match predictions (AI-powered!)
            • 📊 Live match scores and updates
            • 👥 Team information and statistics
            • 🏆 Points table and standings
            • 📅 Match fixtures and schedules
            • 🏏 Cricket rules and insights
            
            Try: "Predict MI vs CSK" or "Show points table"
        `;
        this.addMessage(welcomeMsg, 'bot');
    }

    // Send message
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Get AI response
        await this.getAIResponse(message);
        
        // Hide typing indicator
        this.hideTyping();

        // Save chat history
        this.saveChatHistory();
    }

    // Send quick message
    sendQuickMessage(message) {
        document.getElementById('chatInput').value = message;
        this.sendMessage();
    }

    // Get AI response
    async getAIResponse(userMessage) {
        try {
            // Check if we have context-specific responses
            const contextResponse = this.getContextResponse(userMessage);
            if (contextResponse) {
                this.addMessage(contextResponse, 'bot');
                return;
            }

            // Try to get AI API response
            if (this.apiKey) {
                const aiResponse = await this.callAIAPI(userMessage);
                this.addMessage(aiResponse, 'bot');
            } else {
                // Use built-in knowledge base
                const response = await this.getKnowledgeBaseResponse(userMessage);
                this.addMessage(response, 'bot');
            }
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage("I'm having trouble connecting right now. Please try again!", 'bot');
        }
    }

    // Get context-specific responses
    getContextResponse(message) {
        const msg = message.toLowerCase();

        // Match Predictions
        if (msg.includes('predict') && (msg.includes('vs') || msg.includes('v '))) {
            return this.getPredictionResponse(msg);
        }

        // Website navigation
        if (msg.includes('fixture') || msg.includes('schedule') || msg.includes('match')) {
            return `📅 View all IPL fixtures here: [View Fixtures](/fixtures_modern.html)\n\nYou can see upcoming matches, dates, venues, and times!`;
        }

        if (msg.includes('point') || msg.includes('standing') || msg.includes('table')) {
            return `🏆 Check the IPL Points Table: [View Points Table](/points_modern.html)\n\nSee team rankings, matches played, wins, losses, and net run rate!`;
        }

        if (msg.includes('live') || msg.includes('score')) {
            return `📊 Live Scores & Updates: [Live Match Updates](/live-match-updates.html)\n\nGet real-time match scores, commentary, and key moments!`;
        }

        if (msg.includes('team')) {
            return `👥 All IPL Teams: [View Teams](/)\n\n🏏 10 IPL Teams:\n• Mumbai Indians (MI)\n• Chennai Super Kings (CSK)\n• Royal Challengers Bangalore (RCB)\n• Kolkata Knight Riders (KKR)\n• Delhi Capitals (DC)\n• Sunrisers Hyderabad (SRH)\n• Rajasthan Royals (RR)\n• Punjab Kings (PBKS)\n• Gujarat Titans (GT)\n• Lucknow Super Giants (LSG)`;
        }

        return null;
    }

    // Get prediction response (built-in)
    getPredictionResponse(msg) {
        // Extract team names
        const teams = this.extractTeams(msg);
        
        if (teams.length >= 2) {
            const team1 = teams[0];
            const team2 = teams[1];
            
            // Calculate prediction
            const prediction = this.calculatePrediction(team1, team2);
            
            return `🔮 **Match Prediction: ${team1} vs ${team2}**\n\n📊 Win Probability:\n• ${team1}: ${prediction.team1Prob}%\n• ${team2}: ${prediction.team2Prob}%\n\n🏆 Predicted Winner: **${prediction.winner}**\n💪 Confidence: ${prediction.confidence}%\n\n✨ Based on team strength and historical performance!`;
        }
        
        return `Please specify teams like: "Predict MI vs CSK"`;
    }

    // Extract team names from message
    extractTeams(msg) {
        const teamMap = {
            'mumbai': 'MI', 'mi': 'MI',
            'chennai': 'CSK', 'csk': 'CSK',
            'bangalore': 'RCB', 'rcb': 'RCB',
            'kolkata': 'KKR', 'kkr': 'KKR',
            'delhi': 'DC', 'dc': 'DC',
            'hyderabad': 'SRH', 'srh': 'SRH',
            'rajasthan': 'RR', 'rr': 'RR',
            'punjab': 'PBKS', 'pbks': 'PBKS',
            'gujarat': 'GT', 'gt': 'GT',
            'lucknow': 'LSG', 'lsg': 'LSG'
        };
        
        const found = [];
        const msgLower = msg.toLowerCase();
        
        for (const [key, value] of Object.entries(teamMap)) {
            if (msgLower.includes(key) && !found.includes(value)) {
                found.push(value);
            }
        }
        
        return found;
    }

    // Calculate simple prediction
    calculatePrediction(team1, team2) {
        // Team strength ratings (based on historical performance)
        const teamStrength = {
            'MI': 85, 'CSK': 82, 'RCB': 75, 'KKR': 73,
            'DC': 78, 'SRH': 72, 'RR': 70, 'PBKS': 68,
            'GT': 80, 'LSG': 76
        };
        
        const str1 = teamStrength[team1] || 70;
        const str2 = teamStrength[team2] || 70;
        
        // Add small random factor for realism
        const factor1 = str1 + (Math.random() * 10 - 5);
        const factor2 = str2 + (Math.random() * 10 - 5);
        
        const total = factor1 + factor2;
        const prob1 = Math.round((factor1 / total) * 100);
        const prob2 = 100 - prob1;
        
        return {
            team1Prob: prob1,
            team2Prob: prob2,
            winner: prob1 > prob2 ? team1 : team2,
            confidence: Math.abs(prob1 - prob2)
        };
    }

    // Call AI API (OpenAI, Gemini, etc.)
    async callAIAPI(message) {
        // This is a placeholder - you'll need to add your actual API integration
        const systemPrompt = `You are an AI assistant for IPL Cricket Hub website. 
        Help users with cricket information, IPL teams, matches, scores, and website navigation.
        Be friendly, concise, and cricket-knowledgeable.`;

        // Example for OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 200
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Knowledge base response (fallback)
    async getKnowledgeBaseResponse(message) {
        const msg = message.toLowerCase();

        // Cricket rules
        if (msg.includes('rule') || msg.includes('how to play')) {
            return `🏏 Cricket Basics:\n\n• Two teams of 11 players each\n• One team bats, other bowls\n• IPL matches are 20 overs per side\n• Goal: Score more runs than opponent\n• 6 balls = 1 over\n• Wickets: 10 ways to get out\n\nWant to know more? Ask about specific rules!`;
        }

        // IPL information
        if (msg.includes('ipl') && msg.includes('what')) {
            return `🏆 Indian Premier League (IPL):\n\n• World's most popular T20 league\n• Started in 2008\n• 10 franchise teams\n• Played annually (March-May)\n• Features top international players\n• Entertainment + Cricket fusion\n\nCheck fixtures and live scores on our website!`;
        }

        // Player stats
        if (msg.includes('player') || msg.includes('virat') || msg.includes('dhoni')) {
            return `👤 Player Information:\n\nI can help you find player stats! Try asking:\n• "Tell me about [player name]"\n• "Who is the top scorer?"\n• "Best bowlers in IPL"\n\nOr visit our team pages for detailed player profiles!`;
        }

        // Ticket/Watch
        if (msg.includes('ticket') || msg.includes('watch') || msg.includes('how to see')) {
            return `📺 Watch IPL:\n\n• TV: Star Sports channels\n• Online: Disney+ Hotstar\n• Stadium: Check official IPL website for tickets\n• Live Updates: Right here on IPL Cricket Hub!\n\nOur website provides real-time scores and commentary!`;
        }

        // Default response
        return `I'm here to help with IPL and cricket! Try asking me about:
        
• 📅 Match fixtures and schedules
• 🏆 Points table and team standings
• 📊 Live scores and updates
• 👥 Team information
• 🏏 Cricket rules and insights
• 📺 How to watch matches

What would you like to know?`;
    }

    // Add message to chat
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Parse markdown-style links [text](url)
        const parsedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" style="color: #00D9FF; text-decoration: underline;">$1</a>');

        messageDiv.innerHTML = `
            <div class="message-content">
                ${sender === 'bot' ? '<span class="message-icon" style="font-size: 1.2rem;">🤖</span>' : ''}
                <div class="message-text">${parsedText.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="message-time">${time}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ text, sender, time });
    }

    // Show typing indicator
    showTyping() {
        document.getElementById('typingIndicator').style.display = 'flex';
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Hide typing indicator
    hideTyping() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    // Clear chat
    clearChat() {
        if (confirm('Clear all chat messages?')) {
            this.messages = [];
            document.getElementById('chatMessages').innerHTML = '';
            this.loadWelcomeMessage();
            this.saveChatHistory();
        }
    }

    // Show/hide badge
    showBadge(count = 1) {
        const badge = document.getElementById('chatBadge');
        badge.textContent = count;
        badge.style.display = 'flex';
    }

    hideBadge() {
        document.getElementById('chatBadge').style.display = 'none';
    }

    // Save chat history
    saveChatHistory() {
        localStorage.setItem('chatbot_history', JSON.stringify(this.messages));
    }

    // Load chat history
    loadChatHistory() {
        const saved = localStorage.getItem('chatbot_history');
        return saved ? JSON.parse(saved) : [];
    }

    // Show settings
    showSettings() {
        const apiKey = prompt('Enter your OpenAI API key (optional):\n\nLeave blank to use built-in responses.', this.apiKey || '');
        if (apiKey !== null) {
            this.apiKey = apiKey;
            localStorage.setItem('chatbot_api_key', apiKey);
            alert(apiKey ? 'API key saved!' : 'Using built-in responses.');
        }
    }

    // Show options
    showOptions() {
        alert('Options coming soon! You can:\n• Export chat\n• Change theme\n• Enable voice input');
    }

    // Setup voice input
    setupVoiceInput() {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatInput').value = transcript;
            this.sendMessage();
        };

        this.voiceRecognition = recognition;
    }
}

// Initialize chatbot when page loads
let iplChatbot;
document.addEventListener('DOMContentLoaded', () => {
    iplChatbot = new IPLChatbot();
    console.log('🤖 IPL AI Chatbot initialized');
});
