#!/usr/bin/env python3
"""
IPL Cricket Hub - Flask API Backend
Provides REST API endpoints for live scores, points table, and match data
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Mock data storage (replace with database in production)
class IPLDataStore:
    def __init__(self):
        self.teams = [
            {"id": "csk", "name": "Chennai Super Kings", "short": "CSK", "color": "#FDB913"},
            {"id": "mi", "name": "Mumbai Indians", "short": "MI", "color": "#004BA0"},
            {"id": "rcb", "name": "Royal Challengers Bangalore", "short": "RCB", "color": "#EC1C24"},
            {"id": "kkr", "name": "Kolkata Knight Riders", "short": "KKR", "color": "#3A225D"},
            {"id": "dc", "name": "Delhi Capitals", "short": "DC", "color": "#004C93"},
            {"id": "srh", "name": "Sunrisers Hyderabad", "short": "SRH", "color": "#FF822A"},
            {"id": "rr", "name": "Rajasthan Royals", "short": "RR", "color": "#254AA5"},
            {"id": "pbks", "name": "Punjab Kings", "short": "PBKS", "color": "#DD1F2D"},
            {"id": "gt", "name": "Gujarat Titans", "short": "GT", "color": "#1C2F52"},
            {"id": "lsg", "name": "Lucknow Super Giants", "short": "LSG", "color": "#0093D2"}
        ]
        
        self.live_matches = []
        self.points_table = []
        self.upcoming_matches = []
        self.generate_mock_data()
    
    def generate_mock_data(self):
        # Generate mock live matches
        self.live_matches = [
            {
                "id": 1,
                "team1": "CSK",
                "team2": "MI",
                "team1_score": "195/6",
                "team2_score": "188/8",
                "overs1": "20.0",
                "overs2": "20.0",
                "status": "CSK won by 7 runs",
                "venue": "MA Chidambaram Stadium, Chennai",
                "live": False,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "time": "7:30 PM"
            },
            {
                "id": 2,
                "team1": "RCB",
                "team2": "KKR",
                "team1_score": "165/8",
                "team2_score": "142/5",
                "overs1": "20.0",
                "overs2": "17.3",
                "status": "Live - KKR need 24 runs from 15 balls",
                "venue": "M Chinnaswamy Stadium, Bangalore",
                "live": True,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "time": "3:30 PM"
            }
        ]
        
        # Generate mock points table
        self.points_table = [
            {"position": 1, "team": "GT", "played": 14, "won": 10, "lost": 4, "nrr": "+0.809", "points": 20},
            {"position": 2, "team": "RR", "played": 14, "won": 9, "lost": 5, "nrr": "+0.298", "points": 18},
            {"position": 3, "team": "LSG", "played": 14, "won": 9, "lost": 5, "nrr": "+0.251", "points": 18},
            {"position": 4, "team": "RCB", "played": 14, "won": 8, "lost": 6, "nrr": "-0.253", "points": 16},
            {"position": 5, "team": "DC", "played": 14, "won": 7, "lost": 7, "nrr": "+0.204", "points": 14},
            {"position": 6, "team": "PBKS", "played": 14, "won": 7, "lost": 7, "nrr": "+0.126", "points": 14},
            {"position": 7, "team": "KKR", "played": 14, "won": 6, "lost": 8, "nrr": "+0.146", "points": 12},
            {"position": 8, "team": "SRH", "played": 14, "won": 6, "lost": 8, "nrr": "-0.379", "points": 12},
            {"position": 9, "team": "CSK", "played": 14, "won": 4, "lost": 10, "nrr": "-0.203", "points": 8},
            {"position": 10, "team": "MI", "played": 14, "won": 4, "lost": 10, "nrr": "-0.506", "points": 8}
        ]
        
        # Generate mock upcoming matches
        base_date = datetime.now()
        self.upcoming_matches = [
            {
                "id": 3,
                "date": (base_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                "team1": "CSK",
                "team2": "MI",
                "venue": "Wankhede Stadium, Mumbai",
                "time": "7:30 PM"
            },
            {
                "id": 4,
                "date": (base_date + timedelta(days=2)).strftime("%Y-%m-%d"),
                "team1": "RCB",
                "team2": "KKR",
                "venue": "M Chinnaswamy Stadium, Bangalore",
                "time": "3:30 PM"
            },
            {
                "id": 5,
                "date": (base_date + timedelta(days=2)).strftime("%Y-%m-%d"),
                "team1": "GT",
                "team2": "LSG",
                "venue": "Narendra Modi Stadium, Ahmedabad",
                "time": "7:30 PM"
            }
        ]

# Initialize data store
data_store = IPLDataStore()

# API Routes
@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        "message": "IPL Cricket Hub API",
        "version": "1.0.0",
        "endpoints": {
            "live_scores": "/api/live-scores",
            "points_table": "/api/points-table",
            "upcoming_matches": "/api/upcoming-matches",
            "teams": "/api/teams",
            "team_details": "/api/teams/<team_id>",
            "match_details": "/api/matches/<match_id>"
        }
    })

@app.route('/api/live-scores', methods=['GET'])
def get_live_scores():
    """Get current live scores"""
    try:
        return jsonify({
            "success": True,
            "data": data_store.live_matches,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/points-table', methods=['GET'])
def get_points_table():
    """Get current IPL points table"""
    try:
        return jsonify({
            "success": True,
            "data": data_store.points_table,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/upcoming-matches', methods=['GET'])
def get_upcoming_matches():
    """Get upcoming IPL matches"""
    try:
        return jsonify({
            "success": True,
            "data": data_store.upcoming_matches,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get all IPL teams"""
    try:
        return jsonify({
            "success": True,
            "data": data_store.teams,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/teams/<team_id>', methods=['GET'])
def get_team_details(team_id):
    """Get details for a specific team"""
    try:
        team = next((t for t in data_store.teams if t["id"] == team_id), None)
        if team:
            return jsonify({
                "success": True,
                "data": team,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "Team not found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/matches/<int:match_id>', methods=['GET'])
def get_match_details(match_id):
    """Get details for a specific match"""
    try:
        match = next((m for m in data_store.live_matches if m["id"] == match_id), None)
        if match:
            return jsonify({
                "success": True,
                "data": match,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "success": False,
                "error": "Match not found"
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get IPL statistics"""
    try:
        return jsonify({
            "success": True,
            "data": {
                "total_matches": 74,
                "completed_matches": len([m for m in data_store.live_matches if not m["live"]]),
                "live_matches": len([m for m in data_store.live_matches if m["live"]]),
                "total_teams": len(data_store.teams),
                "highest_score": "263/5",
                "lowest_score": "49/10"
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    print("🏏 IPL Cricket Hub API Server Starting...")
    print("📡 Server running on http://localhost:5000")
    print("📖 API Documentation: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
