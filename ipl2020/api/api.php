<?php
/**
 * IPL Cricket Hub - PHP API Backend
 * Provides REST API endpoints for live scores, points table, and match data
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class IPLDataAPI {
    private $teams;
    private $liveMatches;
    private $pointsTable;
    private $upcomingMatches;
    
    public function __construct() {
        $this->initializeData();
    }
    
    private function initializeData() {
        // Teams data
        $this->teams = [
            ["id" => "csk", "name" => "Chennai Super Kings", "short" => "CSK", "color" => "#FDB913"],
            ["id" => "mi", "name" => "Mumbai Indians", "short" => "MI", "color" => "#004BA0"],
            ["id" => "rcb", "name" => "Royal Challengers Bangalore", "short" => "RCB", "color" => "#EC1C24"],
            ["id" => "kkr", "name" => "Kolkata Knight Riders", "short" => "KKR", "color" => "#3A225D"],
            ["id" => "dc", "name" => "Delhi Capitals", "short" => "DC", "color" => "#004C93"],
            ["id" => "srh", "name" => "Sunrisers Hyderabad", "short" => "SRH", "color" => "#FF822A"],
            ["id" => "rr", "name" => "Rajasthan Royals", "short" => "RR", "color" => "#254AA5"],
            ["id" => "pbks", "name" => "Punjab Kings", "short" => "PBKS", "color" => "#DD1F2D"],
            ["id" => "gt", "name" => "Gujarat Titans", "short" => "GT", "color" => "#1C2F52"],
            ["id" => "lsg", "name" => "Lucknow Super Giants", "short" => "LSG", "color" => "#0093D2"]
        ];
        
        // Live matches data
        $this->liveMatches = [
            [
                "id" => 1,
                "team1" => "CSK",
                "team2" => "MI",
                "team1_score" => "195/6",
                "team2_score" => "188/8",
                "overs1" => "20.0",
                "overs2" => "20.0",
                "status" => "CSK won by 7 runs",
                "venue" => "MA Chidambaram Stadium, Chennai",
                "live" => false,
                "date" => date('Y-m-d'),
                "time" => "7:30 PM"
            ],
            [
                "id" => 2,
                "team1" => "RCB",
                "team2" => "KKR",
                "team1_score" => "165/8",
                "team2_score" => "142/5",
                "overs1" => "20.0",
                "overs2" => "17.3",
                "status" => "Live - KKR need 24 runs from 15 balls",
                "venue" => "M Chinnaswamy Stadium, Bangalore",
                "live" => true,
                "date" => date('Y-m-d'),
                "time" => "3:30 PM"
            ]
        ];
        
        // Points table data
        $this->pointsTable = [
            ["position" => 1, "team" => "GT", "played" => 14, "won" => 10, "lost" => 4, "nrr" => "+0.809", "points" => 20],
            ["position" => 2, "team" => "RR", "played" => 14, "won" => 9, "lost" => 5, "nrr" => "+0.298", "points" => 18],
            ["position" => 3, "team" => "LSG", "played" => 14, "won" => 9, "lost" => 5, "nrr" => "+0.251", "points" => 18],
            ["position" => 4, "team" => "RCB", "played" => 14, "won" => 8, "lost" => 6, "nrr" => "-0.253", "points" => 16],
            ["position" => 5, "team" => "DC", "played" => 14, "won" => 7, "lost" => 7, "nrr" => "+0.204", "points" => 14],
            ["position" => 6, "team" => "PBKS", "played" => 14, "won" => 7, "lost" => 7, "nrr" => "+0.126", "points" => 14],
            ["position" => 7, "team" => "KKR", "played" => 14, "won" => 6, "lost" => 8, "nrr" => "+0.146", "points" => 12],
            ["position" => 8, "team" => "SRH", "played" => 14, "won" => 6, "lost" => 8, "nrr" => "-0.379", "points" => 12],
            ["position" => 9, "team" => "CSK", "played" => 14, "won" => 4, "lost" => 10, "nrr" => "-0.203", "points" => 8],
            ["position" => 10, "team" => "MI", "played" => 14, "won" => 4, "lost" => 10, "nrr" => "-0.506", "points" => 8]
        ];
        
        // Upcoming matches
        $this->upcomingMatches = [
            [
                "id" => 3,
                "date" => date('Y-m-d', strtotime('+1 day')),
                "team1" => "CSK",
                "team2" => "MI",
                "venue" => "Wankhede Stadium, Mumbai",
                "time" => "7:30 PM"
            ],
            [
                "id" => 4,
                "date" => date('Y-m-d', strtotime('+2 days')),
                "team1" => "RCB",
                "team2" => "KKR",
                "venue" => "M Chinnaswamy Stadium, Bangalore",
                "time" => "3:30 PM"
            ],
            [
                "id" => 5,
                "date" => date('Y-m-d', strtotime('+2 days')),
                "team1" => "GT",
                "team2" => "LSG",
                "venue" => "Narendra Modi Stadium, Ahmedabad",
                "time" => "7:30 PM"
            ]
        ];
    }
    
    public function handleRequest() {
        $path = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
        
        switch ($path) {
            case 'live-scores':
                return $this->getLiveScores();
            case 'points-table':
                return $this->getPointsTable();
            case 'upcoming-matches':
                return $this->getUpcomingMatches();
            case 'teams':
                return $this->getTeams();
            case 'stats':
                return $this->getStats();
            default:
                return $this->getIndex();
        }
    }
    
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit();
    }
    
    private function getIndex() {
        return $this->sendResponse([
            "message" => "IPL Cricket Hub PHP API",
            "version" => "1.0.0",
            "endpoints" => [
                "live_scores" => "?endpoint=live-scores",
                "points_table" => "?endpoint=points-table",
                "upcoming_matches" => "?endpoint=upcoming-matches",
                "teams" => "?endpoint=teams",
                "stats" => "?endpoint=stats"
            ]
        ]);
    }
    
    private function getLiveScores() {
        return $this->sendResponse([
            "success" => true,
            "data" => $this->liveMatches,
            "timestamp" => date('c')
        ]);
    }
    
    private function getPointsTable() {
        return $this->sendResponse([
            "success" => true,
            "data" => $this->pointsTable,
            "timestamp" => date('c')
        ]);
    }
    
    private function getUpcomingMatches() {
        return $this->sendResponse([
            "success" => true,
            "data" => $this->upcomingMatches,
            "timestamp" => date('c')
        ]);
    }
    
    private function getTeams() {
        return $this->sendResponse([
            "success" => true,
            "data" => $this->teams,
            "timestamp" => date('c')
        ]);
    }
    
    private function getStats() {
        $liveCount = count(array_filter($this->liveMatches, function($m) {
            return $m['live'];
        }));
        
        return $this->sendResponse([
            "success" => true,
            "data" => [
                "total_matches" => 74,
                "completed_matches" => count($this->liveMatches) - $liveCount,
                "live_matches" => $liveCount,
                "total_teams" => count($this->teams),
                "highest_score" => "263/5",
                "lowest_score" => "49/10"
            ],
            "timestamp" => date('c')
        ]);
    }
}

// Initialize and handle request
$api = new IPLDataAPI();
$api->handleRequest();
?>
