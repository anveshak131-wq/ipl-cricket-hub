/**
 * IPL Cricket Hub - AI Chatbot with ML Backend Integration
 * Connects to Python AI backend for advanced features
 */

class IPLChatbotML extends IPLChatbot {
    constructor() {
        super();
        this.mlBackendURL = 'http://localhost:5001'; // Python backend
        this.useMachineLearning = this.checkMLBackend();
    }

    // Check if ML backend is available
    async checkMLBackend() {
        try {
            const response = await fetch(`${this.mlBackendURL}/health`, {
                method: 'GET',
                timeout: 2000
            });
            const data = await response.json();
            if (data.status === 'healthy') {
                console.log('🤖 ML Backend Connected');
                return true;
            }
        } catch (error) {
            console.log('📡 ML Backend not available, using built-in responses');
            return false;
        }
        return false;
    }

    // Override getAIResponse to use ML backend
    async getAIResponse(userMessage) {
        try {
            // Try ML backend first
            if (await this.useMachineLearning) {
                const mlResponse = await this.getMLResponse(userMessage);
                if (mlResponse) {
                    this.addMessage(mlResponse, 'bot');
                    return;
                }
            }

            // Fallback to parent class method
            await super.getAIResponse(userMessage);
            
        } catch (error) {
            console.error('AI Error:', error);
            await super.getAIResponse(userMessage);
        }
    }

    // Get response from ML backend
    async getMLResponse(message) {
        try {
            const response = await fetch(`${this.mlBackendURL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        page: window.location.pathname,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                throw new Error('ML Backend error');
            }

            const data = await response.json();
            
            if (data.success && data.response) {
                // Add ML badge to indicate AI response
                return `🤖 ${data.response}\n\n<small style="color: #00D9FF;">Powered by AI & Machine Learning</small>`;
            }

            return null;
            
        } catch (error) {
            console.error('ML Backend Error:', error);
            return null;
        }
    }

    // Match prediction feature
    async predictMatch(team1, team2) {
        try {
            const response = await fetch(`${this.mlBackendURL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    team1: team1,
                    team2: team2,
                    venue: 'neutral'
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const pred = data.prediction;
                return `🔮 **Match Prediction**\n\n${pred.team1} vs ${pred.team2}\n\n📊 Win Probability:\n• ${pred.team1}: ${pred.team1_probability}%\n• ${pred.team2}: ${pred.team2_probability}%\n\n🏆 Predicted Winner: **${pred.predicted_winner}**\n💪 Confidence: ${pred.confidence}%`;
            }
            
        } catch (error) {
            console.error('Prediction Error:', error);
            return 'Prediction feature is currently unavailable.';
        }
    }

    // Player analysis feature
    async analyzePlayer(playerName) {
        try {
            const response = await fetch(`${this.mlBackendURL}/api/analyze-player`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player: playerName
                })
            });

            const data = await response.json();
            
            if (data.success && !data.analysis.error) {
                const analysis = data.analysis;
                return `👤 **Player Analysis**\n\n${analysis.player}\n\n⭐ Rating: ${analysis.rating}/100\n📈 Form: ${analysis.form}\n\nRole: ${analysis.stats.role}`;
            }
            
        } catch (error) {
            console.error('Analysis Error:', error);
            return 'Player analysis is currently unavailable.';
        }
    }

    // Sentiment analysis feature
    async analyzeSentiment(text) {
        try {
            const response = await fetch(`${this.mlBackendURL}/api/sentiment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            });

            const data = await response.json();
            
            if (data.success) {
                const sentiment = data.sentiment;
                const emoji = sentiment.sentiment === 'Positive' ? '😊' : 
                             sentiment.sentiment === 'Negative' ? '😞' : '😐';
                return `${emoji} Sentiment: ${sentiment.sentiment} (${sentiment.score}% confidence)`;
            }
            
        } catch (error) {
            console.error('Sentiment Error:', error);
            return null;
        }
    }

    // Enhanced quick actions with ML features
    createMLQuickActions() {
        const quickActionsHTML = `
            <div class="chatbot-quick-actions" id="quickActions">
                <button class="quick-btn" onclick="iplChatbotML.sendQuickMessage('Predict MI vs CSK')">
                    <i class="fas fa-crystal-ball"></i> Predict Match
                </button>
                <button class="quick-btn" onclick="iplChatbotML.sendQuickMessage('Analyze Virat Kohli')">
                    <i class="fas fa-user-chart"></i> Player Analysis
                </button>
                <button class="quick-btn" onclick="iplChatbotML.sendQuickMessage('Show points table')">
                    <i class="fas fa-trophy"></i> Points Table
                </button>
                <button class="quick-btn" onclick="iplChatbotML.sendQuickMessage('Live match updates')">
                    <i class="fas fa-broadcast-tower"></i> Live Updates
                </button>
            </div>
        `;
        
        return quickActionsHTML;
    }

    // Load welcome message with ML info
    loadWelcomeMessage() {
        const welcomeMsg = `
            👋 Welcome to IPL Cricket Hub! I'm your AI assistant powered by Machine Learning.
            
            🤖 **Advanced Features:**
            • 🔮 Match predictions using ML algorithms
            • 📊 Score forecasting with AI
            • 👤 Player performance analysis
            • 📈 Sentiment analysis
            • 💡 Intelligent cricket insights
            
            ⚡ **Quick Commands:**
            • "Predict [Team1] vs [Team2]"
            • "Analyze [Player Name]"
            • "Show points table"
            • "Live match updates"
            
            Ask me anything about IPL!
        `;
        this.addMessage(welcomeMsg, 'bot');
    }
}

// Initialize ML-powered chatbot when page loads
let iplChatbotML;
document.addEventListener('DOMContentLoaded', () => {
    // Check if ML version should be used
    if (typeof IPLChatbot !== 'undefined') {
        iplChatbotML = new IPLChatbotML();
        
        // Make it globally accessible
        window.iplChatbot = iplChatbotML;
        
        console.log('🤖 IPL AI Chatbot with ML initialized');
    }
});
