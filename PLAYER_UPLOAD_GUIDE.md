# Player Upload Guide

## How Player Upload Works

### For Admins (Uploading):
1. Go to **admin-upload.html**
2. Select the team (e.g., RCB)
3. Upload a CSV file with player data
4. Players are parsed and stored in browser's localStorage
5. Foreign players are automatically detected and marked

### For End Users (Viewing):
1. Navigate to team's player page (e.g., rcb_players_modern.html)
2. Page automatically loads uploaded players from localStorage
3. Foreign players show an orange "Overseas Player" badge
4. All player details are displayed from the uploaded CSV

## CSV Format for Players

Your CSV file must have these columns:

```csv
Name,Role,Age,Nationality,Batting Style,Bowling Style,Image
Virat Kohli,Batsman,35,Indian,Right-handed,Right-arm medium,virat_kohli.png
AB de Villiers,Wicket-keeper,39,South African,Right-handed,Right-arm medium,abde.png
```

### Column Details:

1. **Name** - Player's full name
2. **Role** - One of: Batsman, Bowler, All-rounder, Wicket-keeper
3. **Age** - Player's age (numeric)
4. **Nationality** - Country name
   - Use "Indian" or "India" for Indian players
   - Use country name for foreign players (e.g., "South African", "Australian")
   - Foreign players will automatically get an orange badge
5. **Batting Style** - Right-handed or Left-handed
6. **Bowling Style** - Describe bowling style or use "-" if not applicable
7. **Image** - Filename of player image (must be in the team's players folder)

### Example with Foreign Players:

```csv
Name,Role,Age,Nationality,Batting Style,Bowling Style,Image
Virat Kohli,Batsman,35,Indian,Right-handed,Right-arm medium,virat_kohli.png
AB de Villiers,Wicket-keeper,39,South African,Right-handed,Right-arm medium,abde.png
Moeen Ali,All-rounder,36,English,Left-handed,Right-arm off-break,Moeen.png
```

**Result:**
- Virat Kohli: No badge (Indian)
- AB de Villiers: Orange "Overseas Player" badge
- Moeen Ali: Orange "Overseas Player" badge

## Steps to Upload RCB Players:

1. Create a CSV file with RCB players using the format above
2. Save it as `rcb_players.csv`
3. Go to **admin-upload.html**
4. Select "Royal Challengers Bangalore (RCB)" from dropdown
5. Click "Choose File" and select your CSV
6. Click "Upload Players"
7. You'll see: "Players for RCB uploaded successfully! (X players loaded)"
8. Navigate to **rcb_players/rcb_players_modern.html** to see your uploaded players!

## Important Notes:

- **Data Storage**: Players are stored in browser's localStorage (temporary)
- **Image Files**: Make sure player images exist in the `rcb_players/` folder
- **CSV Format**: Must use commas as delimiters
- **Nationality**: Case-insensitive, but use proper country names
- **Foreign Detection**: Any nationality other than "Indian" or "India" will show the overseas badge

## Sample CSV File:

Use `sample-players.csv` in the project root as a template. It includes:
- Correct column headers
- Indian players (no badge)
- Foreign players (will show orange badge)
- Proper image filenames
- All required fields

## Foreign Player Badge Features:

- **Color**: Orange (#FF6B35)
- **Icon**: Globe icon (🌍)
- **Text**: "Overseas Player"
- **Animation**: Subtle pulse effect to draw attention
- **Automatic**: No manual tagging needed

## Troubleshooting:

**Q: Uploaded players not showing?**
A: Check browser console for errors. Make sure you're viewing the modern players page (rcb_players_modern.html, not rcb_players.html)

**Q: Foreign badge not appearing?**
A: Check that nationality is spelled correctly and is not "Indian" or "India"

**Q: Images not loading?**
A: Ensure image files are in the team's players folder and filenames match exactly

## For Production:

In production, you would:
1. Use a backend database instead of localStorage
2. Store uploaded files on the server
3. Load player data from an API
4. This is currently implemented using localStorage for demo purposes

