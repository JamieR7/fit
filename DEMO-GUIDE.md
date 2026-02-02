# Demo Mode - Testing Guide

## Quick Start

Demo mode is **already enabled** by default for local testing!

1. **Start the server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open in browser:** `http://localhost:8000`

3. **You're automatically logged in as Alex Chen** (student)

## Test Accounts

### Students
- **Alex Chen** (default) - `alex_chen@school.edu`
- Sarah Martinez - `sarah_martinez@school.edu`
- David Lee - `david_lee@school.edu`
- Emma Wilson - `emma_wilson@school.edu`
- Michael Brown - `michael_brown@school.edu`
- Sophia Garcia - `sophia_garcia@school.edu`
- James Taylor - `james_taylor@school.edu`
- Olivia Anderson - `olivia_anderson@school.edu`

### Staff (Access to Admin Dashboard)
- **Coach Johnson** - `coach.johnson@school.edu`
- **Mr. Thompson** - `mr.thompson@school.edu`

## Switch Between Users

Open the browser console (F12) and type:

```javascript
// Switch to a different student
switchDemoUser('sarah_martinez@school.edu');
location.reload();

// Switch to a teacher
switchDemoUser('coach.johnson@school.edu');
location.reload();
```

## Pre-loaded Demo Data

The demo includes sample submissions so you can immediately see:
- ✅ **My Results** - Submissions with different verification statuses
- 🔔 **Verify Buddies** - Pending verifications (when logged in as Sarah or David)
- 🏆 **Leaderboard** - Rankings with points and percentiles
- ⚙️ **Admin Dashboard** - Full management interface (when logged in as staff)

## Test Different Scenarios

### As a Student (Alex Chen):
1. **Submit a new challenge** (Submit tab)
2. **View your results** (My Results tab)
3. **Verify buddy requests** (Verify tab - bell icon)
4. **Check leaderboard rankings** (Leaderboard tab)

### As a Teacher (Coach Johnson):
1. Switch user: `switchDemoUser('coach.johnson@school.edu')` + reload
2. **Manual data entry** (Admin tab → Enter Student Data)
3. **Override verifications** (Admin tab → Manage Verifications)
4. **View all submissions**

## Disable Demo Mode for Production

When ready to deploy with real Microsoft 365 authentication:

1. Open `demo-mode.js`
2. Change line 6:
   ```javascript
   enabled: false,  // Changed from true
   ```
3. Set up Azure AD (see README.md)

## Features You Can Test

- ✅ Challenge submission with buddy selection
- ✅ High score warnings
- ✅ Buddy verification approve/reject
- ✅ Points calculation (1-25 based on percentile)
- ✅ Color-coded badges (red/yellow/blue)
- ✅ Leaderboard with rankings
- ✅ Admin manual data entry
- ✅ Academic year tracking
- ✅ Responsive design

## Tips

- **Refresh the page** to see updated data after submissions
- **Open multiple browser windows** to test buddy verification flow
- **Use incognito/private windows** with different users
- **Check the console** for demo mode confirmation messages

Enjoy testing! 🏋️‍♂️
