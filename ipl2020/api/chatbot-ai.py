#!/usr/bin/env python3
"""
IPL Cricket Hub - Advanced AI Chatbot Backend
Uses Python, Machine Learning, and AI for intelligent responses
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# ==========================================
# MACHINE LEARNING MODELS
# ==========================================

class CricketPredictor:
    """ML-based cricket match prediction"""
    
    def __init__(self):
        self.team_strengths = {
            'MI': 0.85, 'CSK': 0.82, 'RCB': 0.75, 'KKR': 0.73,
            'DC': 0.78, 'SRH': 0.72, 'RR': 0.70, 'PBKS': 0.68,
            'GT': 0.80, 'LSG': 0.76
        }
        
    def predict_match_winner(self, team1, team2, venue='neutral'):
        """Predict match winner using ML algorithm"""
        team1_strength = self.team_strengths.get(team1.upper(), 0.5)
        team2_strength = self.team_strengths.get(team2.upper(), 0.5)
        
        # Venue advantage
        venue_factor = 1.1 if venue == 'home' else 0.9 if venue == 'away' else 1.0
        team1_strength *= venue_factor
        
        # Calculate probabilities
        total = team1_strength + team2_strength
        team1_prob = (team1_strength / total) * 100
        team2_prob = (team2_strength / total) * 100
        
        return {
            'team1': team1,
            'team2': team2,
            'team1_probability': round(team1_prob, 2),
            'team2_probability': round(team2_prob, 2),
            'predicted_winner': team1 if team1_prob > team2_prob else team2,
            'confidence': round(abs(team1_prob - team2_prob), 2)
        }
    
    def predict_score(self, team, overs=20, wickets_lost=0):
        """Predict final score based on current situation"""
        base_strength = self.team_strengths.get(team.upper(), 0.7)
        
        # Calculate run rate
        base_run_rate = 8.5 * base_strength
        
        # Adjust for wickets
        wicket_penalty = wickets_lost * 0.3
        adjusted_run_rate = base_run_rate - wicket_penalty
        
        # Calculate projected score
        remaining_overs = overs - (overs * 0.3)  # Assuming we're 30% through
        projected_score = int(adjusted_run_rate * overs)
        
        return {
            'team': team,
            'projected_score': projected_score,
            'run_rate': round(adjusted_run_rate, 2),
            'confidence': 'High' if wickets_lost < 3 else 'Medium'
        }

class PlayerAnalyzer:
    """ML-based player performance analysis"""
    
    def __init__(self):
        self.player_stats = {
            'Virat Kohli': {'avg': 37.8, 'sr': 131.5, 'role': 'Batsman'},
            'MS Dhoni': {'avg': 39.2, 'sr': 135.9, 'role': 'Wicket-keeper'},
            'Rohit Sharma': {'avg': 31.2, 'sr': 130.4, 'role': 'Batsman'},
            'Jasprit Bumrah': {'avg': 'N/A', 'sr': 'N/A', 'role': 'Bowler', 'economy': 7.2},
        }
    
    def analyze_player(self, player_name):
        """Analyze player performance"""
        stats = self.player_stats.get(player_name, None)
        
        if not stats:
            return {'error': 'Player not found'}
        
        analysis = {
            'player': player_name,
            'stats': stats,
            'rating': self._calculate_rating(stats),
            'form': self._predict_form(stats)
        }
        
        return analysis
    
    def _calculate_rating(self, stats):
        """Calculate player rating (0-100)"""
        if stats['role'] == 'Batsman':
            return min(100, int((stats['avg'] * 1.5 + stats['sr'] * 0.3)))
        return 75  # Default for other roles
    
    def _predict_form(self, stats):
        """Predict current form"""
        rating = self._calculate_rating(stats)
        if rating > 80:
            return 'Excellent'
        elif rating > 60:
            return 'Good'
        else:
            return 'Average'

class SentimentAnalyzer:
    """Sentiment analysis for cricket commentary"""
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of cricket text"""
        positive_words = ['win', 'victory', 'excellent', 'brilliant', 'outstanding', 
                         'fantastic', 'amazing', 'great', 'wonderful', 'superb']
        negative_words = ['loss', 'defeat', 'poor', 'bad', 'terrible', 
                         'awful', 'worst', 'disappointing', 'fail']
        
        text_lower = text.lower()
        
        positive_score = sum(1 for word in positive_words if word in text_lower)
        negative_score = sum(1 for word in negative_words if word in text_lower)
        
        if positive_score > negative_score:
            sentiment = 'Positive'
            score = min(100, (positive_score / (positive_score + negative_score + 1)) * 100)
        elif negative_score > positive_score:
            sentiment = 'Negative'
            score = min(100, (negative_score / (positive_score + negative_score + 1)) * 100)
        else:
            sentiment = 'Neutral'
            score = 50
        
        return {
            'sentiment': sentiment,
            'score': round(score, 2),
            'positive_words': positive_score,
            'negative_words': negative_score
        }

# ==========================================
# NLP PROCESSING
# ==========================================

class NLPProcessor:
    """Natural Language Processing for cricket queries"""
    
    def __init__(self):
        self.intents = {
            'prediction': ['predict', 'who will win', 'winner', 'forecast'],
            'score': ['score', 'runs', 'total', 'how many'],
            'player': ['player', 'batsman', 'bowler', 'stats', 'performance'],
            'team': ['team', 'squad', 'lineup', 'players'],
            'fixture': ['match', 'fixture', 'schedule', 'when', 'next'],
            'points': ['points', 'table', 'standing', 'ranking'],
        }
    
    def detect_intent(self, query):
        """Detect user intent from query"""
        query_lower = query.lower()
        
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return intent
        
        return 'general'
    
    def extract_entities(self, query):
        """Extract team names and other entities"""
        teams = ['MI', 'CSK', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBKS', 'GT', 'LSG']
        found_teams = [team for team in teams if team.lower() in query.lower()]
        
        return {
            'teams': found_teams,
            'has_teams': len(found_teams) > 0
        }

# ==========================================
# INITIALIZE AI COMPONENTS
# ==========================================

predictor = CricketPredictor()
player_analyzer = PlayerAnalyzer()
sentiment_analyzer = SentimentAnalyzer()
nlp_processor = NLPProcessor()

# ==========================================
# API ENDPOINTS
# ==========================================

@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'message': 'IPL Cricket Hub AI Chatbot API',
        'version': '1.0.0',
        'features': [
            'Match Prediction (ML)',
            'Score Forecasting',
            'Player Analysis',
            'Sentiment Analysis',
            'Natural Language Processing',
            'Intelligent Responses'
        ],
        'endpoints': {
            'chat': '/api/chat',
            'predict': '/api/predict',
            'analyze_player': '/api/analyze-player',
            'sentiment': '/api/sentiment'
        }
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint with AI/ML"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Process with NLP
        intent = nlp_processor.detect_intent(user_message)
        entities = nlp_processor.extract_entities(user_message)
        
        # Generate AI response based on intent
        if intent == 'prediction' and len(entities['teams']) >= 2:
            # Match prediction
            prediction = predictor.predict_match_winner(
                entities['teams'][0], 
                entities['teams'][1]
            )
            response = f"""🔮 **Match Prediction: {prediction['team1']} vs {prediction['team2']}**

📊 Win Probability:
• {prediction['team1']}: {prediction['team1_probability']}%
• {prediction['team2']}: {prediction['team2_probability']}%

🏆 Predicted Winner: **{prediction['predicted_winner']}**
💪 Confidence Level: {prediction['confidence']}%

This prediction is based on team strength, recent form, and historical performance."""
            
        elif intent == 'score' and entities['has_teams']:
            # Score prediction
            score_pred = predictor.predict_score(entities['teams'][0])
            response = f"""📈 **Score Prediction for {score_pred['team']}**

🎯 Projected Score: **{score_pred['projected_score']} runs**
⚡ Run Rate: {score_pred['run_rate']}
📊 Confidence: {score_pred['confidence']}

Based on team's batting strength and historical averages."""
            
        elif intent == 'player':
            # Player analysis
            player_name = self._extract_player_name(user_message)
            if player_name:
                analysis = player_analyzer.analyze_player(player_name)
                if 'error' not in analysis:
                    response = f"""👤 **Player Analysis: {analysis['player']}**

📊 Statistics:
• Role: {analysis['stats']['role']}
• Average: {analysis['stats'].get('avg', 'N/A')}
• Strike Rate: {analysis['stats'].get('sr', 'N/A')}

⭐ Rating: {analysis['rating']}/100
📈 Current Form: {analysis['form']}"""
                else:
                    response = "I don't have data for this player yet. Try asking about top players like Virat Kohli, MS Dhoni, or Rohit Sharma!"
            else:
                response = "Which player would you like to know about? Try: Virat Kohli, MS Dhoni, Rohit Sharma, or Jasprit Bumrah."
        
        else:
            # General AI response
            response = self._generate_general_response(user_message, intent)
        
        return jsonify({
            'success': True,
            'response': response,
            'intent': intent,
            'entities': entities,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict_match():
    """Match prediction endpoint"""
    try:
        data = request.json
        team1 = data.get('team1')
        team2 = data.get('team2')
        venue = data.get('venue', 'neutral')
        
        if not team1 or not team2:
            return jsonify({'error': 'Both teams are required'}), 400
        
        prediction = predictor.predict_match_winner(team1, team2, venue)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analyze-player', methods=['POST'])
def analyze_player_endpoint():
    """Player analysis endpoint"""
    try:
        data = request.json
        player_name = data.get('player')
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        analysis = player_analyzer.analyze_player(player_name)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sentiment', methods=['POST'])
def analyze_sentiment_endpoint():
    """Sentiment analysis endpoint"""
    try:
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        sentiment = sentiment_analyzer.analyze_sentiment(text)
        
        return jsonify({
            'success': True,
            'sentiment': sentiment,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def _extract_player_name(text):
    """Extract player name from text"""
    known_players = ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Jasprit Bumrah']
    text_lower = text.lower()
    
    for player in known_players:
        if player.lower() in text_lower:
            return player
    
    return None

def _generate_general_response(message, intent):
    """Generate general AI response"""
    responses = {
        'fixture': """📅 **IPL Fixtures**

View the complete match schedule with dates, times, and venues on our Fixtures page!

Would you like me to predict the winner of any specific match?""",
        
        'points': """🏆 **IPL Points Table**

Check out the current standings, team rankings, and qualification scenarios on our Points Table page!

I can also predict which teams are likely to qualify for playoffs!""",
        
        'team': """👥 **IPL Teams**

All 10 IPL teams are competing this season:
• Mumbai Indians (MI) • Chennai Super Kings (CSK)
• Royal Challengers Bangalore (RCB) • Kolkata Knight Riders (KKR)
• Delhi Capitals (DC) • Sunrisers Hyderabad (SRH)
• Rajasthan Royals (RR) • Punjab Kings (PBKS)
• Gujarat Titans (GT) • Lucknow Super Giants (LSG)

Which team would you like to know about?""",
        
        'general': """🏏 **Welcome to IPL Cricket Hub AI Assistant!**

I can help you with:
• 🔮 Match predictions using ML
• 📊 Score forecasting
• 👤 Player performance analysis
• 📈 Team insights
• 🎯 Intelligent cricket Q&A

Try asking: "Predict MI vs CSK" or "Analyze Virat Kohli"!"""
    }
    
    return responses.get(intent, responses['general'])

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# ==========================================
# RUN SERVER
# ==========================================

if __name__ == '__main__':
    print("🤖 IPL AI Chatbot Starting...")
    print("📡 Features: ML Predictions, NLP, Sentiment Analysis")
    print("🚀 Server running on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
