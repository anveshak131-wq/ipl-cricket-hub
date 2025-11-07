# IPL Cricket Hub - API Documentation

## Overview
The IPL Cricket Hub provides both Python (Flask) and PHP REST APIs for accessing live cricket scores, points table, and match data.

## Base URLs
- **Python API**: `http://localhost:5000`
- **PHP API**: `http://localhost/api/api.php`

## API Endpoints

### 1. Live Scores
Get current live match scores

**Endpoint**: `/api/live-scores` (Python) or `?endpoint=live-scores` (PHP)

**Method**: GET

**Response**:
```json
{
  "success": true,
  "data": [
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
      "live": false,
      "date": "2026-03-24",
      "time": "7:30 PM"
    }
  ],
  "timestamp": "2026-03-24T19:30:00"
}
```

### 2. Points Table
Get current IPL standings

**Endpoint**: `/api/points-table` (Python) or `?endpoint=points-table` (PHP)

**Method**: GET

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "team": "GT",
      "played": 14,
      "won": 10,
      "lost": 4,
      "nrr": "+0.809",
      "points": 20
    }
  ],
  "timestamp": "2026-03-24T19:30:00"
}
```

### 3. Upcoming Matches
Get scheduled upcoming matches

**Endpoint**: `/api/upcoming-matches` (Python) or `?endpoint=upcoming-matches` (PHP)

**Method**: GET

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "date": "2026-03-25",
      "team1": "CSK",
      "team2": "MI",
      "venue": "Wankhede Stadium, Mumbai",
      "time": "7:30 PM"
    }
  ],
  "timestamp": "2026-03-24T19:30:00"
}
```

### 4. Teams
Get all IPL teams information

**Endpoint**: `/api/teams` (Python) or `?endpoint=teams` (PHP)

**Method**: GET

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "csk",
      "name": "Chennai Super Kings",
      "short": "CSK",
      "color": "#FDB913"
    }
  ],
  "timestamp": "2026-03-24T19:30:00"
}
```

### 5. Statistics
Get IPL statistics

**Endpoint**: `/api/stats` (Python) or `?endpoint=stats` (PHP)

**Method**: GET

**Response**:
```json
{
  "success": true,
  "data": {
    "total_matches": 74,
    "completed_matches": 50,
    "live_matches": 1,
    "total_teams": 10,
    "highest_score": "263/5",
    "lowest_score": "49/10"
  },
  "timestamp": "2026-03-24T19:30:00"
}
```

## Running the APIs

### Python Flask API

1. Install dependencies:
```bash
cd api
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### PHP API

1. Place the `api` folder in your web server directory (e.g., `htdocs` for XAMPP)

2. Access the API at:
```
http://localhost/api/api.php
```

## CORS Support
Both APIs have CORS enabled, allowing requests from any origin. For production, configure specific origins in:
- Python: `CORS(app, origins=['https://yourdomain.com'])`
- PHP: Modify the `Access-Control-Allow-Origin` header

## Error Handling

All endpoints return a JSON response with a `success` field:
- `true`: Request successful
- `false`: Request failed with error message

Error Response Example:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

## Rate Limiting
Currently no rate limiting is implemented. For production:
- Implement rate limiting per IP
- Add authentication tokens
- Cache responses

## Future Enhancements
- WebSocket support for real-time updates
- Database integration (MySQL/MongoDB)
- User authentication
- Match prediction algorithms
- Player statistics
- Historical data analysis
