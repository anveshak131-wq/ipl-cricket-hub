"""
IPL 2026 - Secure Backend API using Flask
Provides secure user management, comment moderation, and admin authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import datetime
import re
import os
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Security configurations
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_EXPIRATION_HOURS'] = 24

# Database setup
DB_PATH = 'ipl_data.db'

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            is_blocked BOOLEAN DEFAULT 0,
            comment_count INTEGER DEFAULT 0,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Comments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            is_deleted BOOLEAN DEFAULT 0,
            is_flagged BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Admin commentary table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_commentary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            over_number TEXT NOT NULL,
            text TEXT NOT NULL,
            admin_id INTEGER NOT NULL,
            is_deleted BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Admin users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create default admin if not exists
    cursor.execute('SELECT COUNT(*) FROM admins')
    if cursor.fetchone()[0] == 0:
        admin_hash = generate_password_hash('admin123')
        cursor.execute(
            'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
            ('admin', admin_hash, 'sportsup99.info@gmail.com')
        )
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Helper functions
def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_match_related(text):
    """Check if comment is match-related"""
    keywords = [
        'match', 'cricket', 'ipl', 'player', 'team', 'run', 'wicket', 'ball', 'over',
        'bat', 'bowl', 'catch', 'six', 'four', 'out', 'score', 'win', 'lose',
        'rohit', 'virat', 'dhoni', 'bumrah', 'kohli', 'sharma',
        'MI', 'CSK', 'RCB', 'KKR', 'DC', 'SRH', 'RR', 'PBSK', 'GT', 'LSG',
        'powerplay', 'innings', 'toss', 'chase', 'target', 'captain'
    ]
    text_lower = text.lower()
    return any(keyword.lower() in text_lower for keyword in keywords)

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator for admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            
            if not data.get('is_admin'):
                return jsonify({'error': 'Admin access required'}), 403
            
            admin_id = data['admin_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(admin_id, *args, **kwargs)
    
    return decorated

# ===== USER ENDPOINTS =====

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """Register a new user"""
    data = request.get_json()
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    
    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400
    
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            (name, email)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {'id': user_id, 'name': name, 'email': email}
        }), 201
        
    except sqlite3.IntegrityError:
        # User already exists, return token
        cursor.execute('SELECT id, name, email, is_blocked FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user[3]:  # is_blocked
            return jsonify({'error': 'Your account has been blocked'}), 403
        
        token = jwt.encode({
            'user_id': user[0],
            'email': user[2],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {'id': user[0], 'name': user[1], 'email': user[2]}
        }), 200
    
    finally:
        conn.close()

@app.route('/api/comments', methods=['POST'])
@token_required
def post_comment(current_user_id):
    """Post a new comment"""
    data = request.get_json()
    text = data.get('text', '').strip()
    
    if not text or len(text) < 10:
        return jsonify({'error': 'Comment must be at least 10 characters'}), 400
    
    if len(text) > 500:
        return jsonify({'error': 'Comment cannot exceed 500 characters'}), 400
    
    if not is_match_related(text):
        return jsonify({'error': 'Please post only match-related comments'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if user is blocked
    cursor.execute('SELECT is_blocked FROM users WHERE id = ?', (current_user_id,))
    user = cursor.fetchone()
    
    if user and user[0]:
        conn.close()
        return jsonify({'error': 'You have been blocked from posting comments'}), 403
    
    # Insert comment
    cursor.execute(
        'INSERT INTO comments (user_id, text) VALUES (?, ?)',
        (current_user_id, text)
    )
    
    # Update user stats
    cursor.execute(
        'UPDATE users SET comment_count = comment_count + 1, last_active = CURRENT_TIMESTAMP WHERE id = ?',
        (current_user_id,)
    )
    
    conn.commit()
    comment_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'success': True,
        'comment_id': comment_id,
        'message': 'Comment posted successfully'
    }), 201

@app.route('/api/comments', methods=['GET'])
def get_comments():
    """Get all comments (not deleted)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT c.id, c.text, c.created_at, u.name, u.email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.is_deleted = 0
        ORDER BY c.created_at DESC
    ''')
    
    comments = []
    for row in cursor.fetchall():
        comments.append({
            'id': row[0],
            'text': row[1],
            'timestamp': row[2],
            'author': row[3],
            'email': row[4]
        })
    
    conn.close()
    return jsonify({'comments': comments}), 200

# ===== ADMIN ENDPOINTS =====

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, password_hash, email FROM admins WHERE username = ?', (username,))
    admin = cursor.fetchone()
    conn.close()
    
    if not admin or not check_password_hash(admin[1], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate admin JWT token
    token = jwt.encode({
        'admin_id': admin[0],
        'username': username,
        'is_admin': True,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'success': True,
        'token': token,
        'admin': {'id': admin[0], 'username': username, 'email': admin[2]}
    }), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users(admin_id):
    """Get all registered users"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name, email, is_blocked, comment_count, last_active, created_at
        FROM users
        ORDER BY created_at DESC
    ''')
    
    users = []
    for row in cursor.fetchall():
        users.append({
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'is_blocked': bool(row[3]),
            'comment_count': row[4],
            'last_active': row[5],
            'created_at': row[6]
        })
    
    conn.close()
    return jsonify({'users': users}), 200

@app.route('/api/admin/users/<int:user_id>/block', methods=['POST'])
@admin_required
def block_user(admin_id, user_id):
    """Block a user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE users SET is_blocked = 1 WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'User blocked successfully'}), 200

@app.route('/api/admin/users/<int:user_id>/unblock', methods=['POST'])
@admin_required
def unblock_user(admin_id, user_id):
    """Unblock a user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE users SET is_blocked = 0 WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'User unblocked successfully'}), 200

@app.route('/api/admin/comments/<int:comment_id>', methods=['DELETE'])
@admin_required
def delete_comment(admin_id, comment_id):
    """Delete a comment"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE comments SET is_deleted = 1 WHERE id = ?', (comment_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Comment deleted successfully'}), 200

@app.route('/api/admin/commentary', methods=['POST'])
@admin_required
def post_admin_commentary(admin_id):
    """Post admin commentary"""
    data = request.get_json()
    over_number = data.get('over', '').strip()
    text = data.get('text', '').strip()
    
    if not over_number or not text:
        return jsonify({'error': 'Over number and text required'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO admin_commentary (over_number, text, admin_id) VALUES (?, ?, ?)',
        (over_number, text, admin_id)
    )
    
    conn.commit()
    commentary_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'success': True,
        'commentary_id': commentary_id,
        'message': 'Commentary posted successfully'
    }), 201

@app.route('/api/admin/commentary', methods=['GET'])
def get_admin_commentary():
    """Get all admin commentary"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, over_number, text, created_at
        FROM admin_commentary
        WHERE is_deleted = 0
        ORDER BY created_at DESC
    ''')
    
    commentary = []
    for row in cursor.fetchall():
        commentary.append({
            'id': row[0],
            'over': row[1],
            'text': row[2],
            'timestamp': row[3]
        })
    
    conn.close()
    return jsonify({'commentary': commentary}), 200

@app.route('/api/admin/commentary/<int:commentary_id>', methods=['DELETE'])
@admin_required
def delete_admin_commentary(admin_id, commentary_id):
    """Delete admin commentary"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('UPDATE admin_commentary SET is_deleted = 1 WHERE id = ?', (commentary_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Commentary deleted successfully'}), 200

@app.route('/api/admin/export/emails', methods=['GET'])
@admin_required
def export_emails(admin_id):
    """Export user emails"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT name, email, comment_count, created_at FROM users ORDER BY created_at DESC')
    users = cursor.fetchall()
    conn.close()
    
    return jsonify({'users': [
        {
            'name': row[0],
            'email': row[1],
            'comments': row[2],
            'joined': row[3]
        } for row in users
    ]}), 200

# ===== HEALTH CHECK =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'IPL 2026 API is running'}), 200

# ============================================================================
# PLAYER DATA ENDPOINTS
# ============================================================================

@app.route('/api/players/<team_code>', methods=['GET'])
def get_team_players(team_code):
    """Get all players for a specific team"""
    team_code = team_code.lower()
    
    valid_teams = ['rcb', 'mi', 'csk', 'srh', 'kxip', 'kkr', 'dc', 'rr', 'gt', 'lsg']
    
    if team_code not in valid_teams:
        return jsonify({'error': 'Invalid team code'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create players table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_code TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT,
            age INTEGER,
            nationality TEXT,
            is_foreign BOOLEAN DEFAULT 0,
            is_captain BOOLEAN DEFAULT 0,
            is_vice_captain BOOLEAN DEFAULT 0,
            batting_style TEXT,
            bowling_style TEXT,
            allrounder_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(team_code, name)
        )
    ''')
    
    cursor.execute('''
        SELECT name, role, age, nationality, is_foreign, is_captain, is_vice_captain,
               batting_style, bowling_style, allrounder_type
        FROM players
        WHERE team_code = ?
        ORDER BY
            CASE role
                WHEN 'Batsman' THEN 1
                WHEN 'Wicket-Keeper' THEN 2
                WHEN 'All-Rounder' THEN 3
                WHEN 'Bowler' THEN 4
                ELSE 5
            END,
            name
    ''', (team_code,))
    
    players = []
    for row in cursor.fetchall():
        player = {
            'name': row[0],
            'role': row[1],
            'age': row[2],
            'nationality': row[3],
            'isForeign': bool(row[4]),
            'isCaptain': bool(row[5]),
            'isViceCaptain': bool(row[6]),
            'batting style': row[7],
            'bowling style': row[8],
            'allrounder type': row[9]
        }
        players.append({k: v for k, v in player.items() if v is not None})
    
    conn.close()
    
    return jsonify({
        'success': True,
        'team': team_code.upper(),
        'count': len(players),
        'players': players
    }), 200

@app.route('/api/players/<team_code>', methods=['POST'])
@admin_required
def upload_team_players(team_code, current_admin_id):
    """Upload/update players for a team (Admin only)"""
    team_code = team_code.lower()
    
    valid_teams = ['rcb', 'mi', 'csk', 'srh', 'kxip', 'kkr', 'dc', 'rr', 'gt', 'lsg']
    
    if team_code not in valid_teams:
        return jsonify({'error': 'Invalid team code'}), 400
    
    data = request.get_json()
    players = data.get('players', [])
    
    if not isinstance(players, list):
        return jsonify({'error': 'Players must be an array'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM players WHERE team_code = ?', (team_code,))
    
    inserted = 0
    for player in players:
        try:
            cursor.execute('''
                INSERT INTO players (
                    team_code, name, role, age, nationality, is_foreign,
                    is_captain, is_vice_captain, batting_style, bowling_style, allrounder_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                team_code,
                player.get('name'),
                player.get('role'),
                player.get('age'),
                player.get('nationality'),
                player.get('isForeign', False),
                player.get('isCaptain', False),
                player.get('isViceCaptain', False),
                player.get('batting style') or player.get('Batting'),
                player.get('bowling style') or player.get('Bowling'),
                player.get('allrounder type') or player.get('Allrounder Type')
            ))
            inserted += 1
        except Exception as e:
            print(f"Error inserting player: {e}")
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f'Uploaded {inserted} players for {team_code.upper()}',
        'count': inserted
    }), 200

if __name__ == '__main__':
    print("🏏 IPL 2026 Secure Backend API Starting...")
    print("📊 Database initialized at:", DB_PATH)
    print("🔒 Default admin credentials: username=admin, password=admin123")
    print("⚠️  Remember to change SECRET_KEY in production!")
    app.run(debug=True, host='0.0.0.0', port=5000)
