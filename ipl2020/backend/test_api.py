"""
Simple test script to verify IPL 2026 Backend API
Run this after starting the server to test all endpoints
"""

import requests
import json
from time import sleep

BASE_URL = 'http://localhost:5000/api'

def print_test(name, status):
    """Print test result"""
    symbol = "✅" if status else "❌"
    print(f"{symbol} {name}")

def test_health():
    """Test health check endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/health')
        print_test("Health Check", response.status_code == 200)
        return response.status_code == 200
    except Exception as e:
        print_test("Health Check", False)
        print(f"   Error: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    try:
        data = {
            'name': 'Test User',
            'email': 'testuser@example.com'
        }
        response = requests.post(f'{BASE_URL}/auth/register', json=data)
        success = response.status_code in [200, 201]
        print_test("User Registration", success)
        if success:
            return response.json().get('token')
        return None
    except Exception as e:
        print_test("User Registration", False)
        print(f"   Error: {e}")
        return None

def test_post_comment(token):
    """Test posting a comment"""
    try:
        headers = {'Authorization': f'Bearer {token}'}
        data = {'text': 'Great match! MI vs CSK was amazing! Rohit Sharma played brilliantly.'}
        response = requests.post(f'{BASE_URL}/comments', json=data, headers=headers)
        success = response.status_code == 201
        print_test("Post Comment", success)
        return success
    except Exception as e:
        print_test("Post Comment", False)
        print(f"   Error: {e}")
        return False

def test_get_comments():
    """Test getting all comments"""
    try:
        response = requests.get(f'{BASE_URL}/comments')
        success = response.status_code == 200
        print_test("Get Comments", success)
        if success:
            comments = response.json().get('comments', [])
            print(f"   Found {len(comments)} comment(s)")
        return success
    except Exception as e:
        print_test("Get Comments", False)
        print(f"   Error: {e}")
        return False

def test_admin_login():
    """Test admin login"""
    try:
        data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = requests.post(f'{BASE_URL}/admin/login', json=data)
        success = response.status_code == 200
        print_test("Admin Login", success)
        if success:
            return response.json().get('token')
        return None
    except Exception as e:
        print_test("Admin Login", False)
        print(f"   Error: {e}")
        return None

def test_get_users(admin_token):
    """Test getting all users"""
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        response = requests.get(f'{BASE_URL}/admin/users', headers=headers)
        success = response.status_code == 200
        print_test("Get Users (Admin)", success)
        if success:
            users = response.json().get('users', [])
            print(f"   Found {len(users)} user(s)")
        return success
    except Exception as e:
        print_test("Get Users (Admin)", False)
        print(f"   Error: {e}")
        return False

def test_post_admin_commentary(admin_token):
    """Test posting admin commentary"""
    try:
        headers = {'Authorization': f'Bearer {admin_token}'}
        data = {
            'over': '5.3',
            'text': 'Rohit Sharma hits a massive six over long-on!'
        }
        response = requests.post(f'{BASE_URL}/admin/commentary', json=data, headers=headers)
        success = response.status_code == 201
        print_test("Post Admin Commentary", success)
        return success
    except Exception as e:
        print_test("Post Admin Commentary", False)
        print(f"   Error: {e}")
        return False

def test_get_admin_commentary():
    """Test getting admin commentary"""
    try:
        response = requests.get(f'{BASE_URL}/admin/commentary')
        success = response.status_code == 200
        print_test("Get Admin Commentary", success)
        if success:
            commentary = response.json().get('commentary', [])
            print(f"   Found {len(commentary)} commentary item(s)")
        return success
    except Exception as e:
        print_test("Get Admin Commentary", False)
        print(f"   Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*50)
    print("🏏 IPL 2026 Backend API Test Suite")
    print("="*50 + "\n")
    
    # Check if server is running
    print("📡 Testing Server Connection...")
    if not test_health():
        print("\n❌ Server is not running!")
        print("   Start the server with: python app.py")
        print("   Or use: ./run.sh")
        return
    
    print("\n👤 Testing User Endpoints...")
    user_token = test_user_registration()
    
    if user_token:
        test_post_comment(user_token)
    
    test_get_comments()
    
    print("\n🔐 Testing Admin Endpoints...")
    admin_token = test_admin_login()
    
    if admin_token:
        test_get_users(admin_token)
        test_post_admin_commentary(admin_token)
    
    test_get_admin_commentary()
    
    print("\n" + "="*50)
    print("✅ All tests completed!")
    print("="*50 + "\n")
    
    print("💡 Next steps:")
    print("   1. Check database: sqlite3 ipl_data.db")
    print("   2. View all users: SELECT * FROM users;")
    print("   3. View comments: SELECT * FROM comments;")
    print("   4. Integrate with frontend using api-client.js")
    print()

if __name__ == '__main__':
    main()
