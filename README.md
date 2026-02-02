# Fitness Challenge Tracker

A web application for students to submit fitness challenge results with buddy verification, Microsoft 365 authentication, and Excel Online data storage.

## Features

- 🔐 **Microsoft 365 Authentication** - Secure login with school accounts
- 💪 **15 Fitness Challenges** - Push-ups, burpees, plank, runs, and more
- ✅ **Buddy Verification System** - Peer validation of results
- 🏆 **Leaderboard** - Track rankings and compete with classmates
- 📊 **Personal Dashboard** - View your submissions and progress
- ⚙️ **Admin Interface** - Teachers can manually enter data and manage verifications
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Scoring System

The app uses a **percentile-based scoring system** (1-25 points) based on your established fitness testing standards:

- **Color-Coded Performance**:
  - 🔴 **Red** (Ranks 1-8): Needs Improvement / Below Average
  - 🟡 **Yellow** (Ranks 9-17): Average / Good
  - 🔵 **Blue** (Ranks 18-25): Very Good / Excellent

- **Automatic Calculation**: Points are calculated automatically when students submit results
- **Visual Feedback**: Each submission shows a color-coded badge indicating performance level
- **Track Your Strengths**: Easily see which challenges you excel at and which ones need work

> *"Remember, the only person you need to be better than is the person you were yesterday!"*

## Year-Over-Year Tracking

The app automatically tracks the **Academic Year** (September-August) for each submission:
- View your improvement from previous years
- Compare current performance to last year's results
- Perfect for tracking long-term fitness progress

## Setup Instructions

### 1. Azure AD App Registration

You need to register an application in Azure Active Directory to enable Microsoft 365 authentication:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Fitness Challenge Tracker
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web platform, `http://localhost:8000` (for local testing) or your GitHub Pages URL
5. Click **Register**
6. Note down the **Application (client) ID** and **Directory (tenant) ID**

### 2. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `Files.ReadWrite`
   - `Sites.ReadWrite.All`
6. Click **Add permissions**
7. Click **Grant admin consent** (requires admin privileges)

### 3. Update Configuration

Open [`config.js`](file:///Users/jamie.robertson/Library/CloudStorage/OneDrive-NordAngliaEducation/NAE%20-%20Files/Desktop/GitHub/fit/config.js) and update these values:

```javascript
const msalConfig = {
    auth: {
        clientId: 'YOUR_CLIENT_ID_HERE', // From step 1
        authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE', // From step 1
        redirectUri: window.location.origin
    },
    ...
};
```

### 4. Excel Online Setup

The app will automatically create an Excel workbook in your OneDrive at `/FitnessChallenge/submissions.xlsx` when the first user logs in.

The workbook contains a **Submissions** sheet with these columns:
- SubmissionID
- Timestamp
- **AcademicYear** (e.g., "2025-2026") - Automatically tracks Sept-Aug academic years
- StudentName
- StudentEmail
- Challenge
- Result
- Unit
- BuddyName
- BuddyEmail
- VerificationStatus
- VerifiedBy
- VerifiedTimestamp
- SubmittedBy
- **Points** (1-25) - Automatically calculated based on percentile ranking

You can add your own scoring formulas in the Points column later.

### 5. Local Testing

To test the app locally:

```bash
# Navigate to the project directory
cd /path/to/fit

# Start a local server (Python 3)
python3 -m http.server 8000

# Or use Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

**Important**: Make sure to add `http://localhost:8000` as a redirect URI in your Azure AD app registration.

### 6. Deploy to GitHub Pages

1. Push the code to your GitHub repository
2. Go to **Settings** > **Pages**
3. Select the branch to deploy (e.g., `main`)
4. Select the root folder (`/root`)
5. Click **Save**
6. Your app will be available at `https://yourusername.github.io/fit/`
7. **Important**: Add this URL as a redirect URI in your Azure AD app registration

## User Guide

### For Students

1. **Log in** with your school Microsoft 365 account
2. **Submit a Challenge**:
   - Select a challenge from the dropdown
   - Enter your result
   - Choose a buddy to verify
   - Submit
3. **View Your Results**: Check your submission history and status
4. **Verify Buddies**: When a friend selects you as their buddy, you'll get a notification - approve or reject their submission
5. **Check Leaderboard**: See how you rank compared to your classmates

### For Teachers/Admin

Teachers (emails containing `.`) have access to additional features:

1. **Admin Dashboard**: Accessible via the Admin tab
2. **Manual Data Entry**: Enter student results that are automatically verified
3. **Manage Verifications**: View and approve/reject all pending verifications
4. **Export Data**: Access the Excel workbook directly in OneDrive

## Challenges

The app includes 15 fitness challenges:

1. 💪 Push ups (reps)
2. 🏃 Burpees (reps)
3. 🧘 Plank (seconds)
4. 🏃‍♂️ 1500m run (time)
5. 📢 Beep test (level)
6. 🏃‍♀️ CdL Mile (time)
7. 🤸 Sit & reach (cm)
8. ⚡ Bring Sally Thunderstruck (reps)
9. ✂️ Criss cross (reps)
10. 🦘 Standing long jump (cm)
11. 🎪 Slackline (seconds)
12. ⚡ 60m sprint (seconds)
13. 💨 100m sprint (seconds)
14. 🪢 Skipping (reps)
15. ✊ Grip test (kg)

## Color Scheme

The app uses the same color scheme as your IB SEHS Study Guides:

- Primary Blue: `#004587`
- Dark Blue: `#002a52`
- Gold/Amber Accent: `#fbba07`
- White text on colored backgrounds
- Gradient backgrounds and glassmorphic effects

## Technical Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Authentication**: MSAL.js (Microsoft Authentication Library)
- **API**: Microsoft Graph API
- **Storage**: Excel Online (via OneDrive)
- **Hosting**: GitHub Pages

## Browser Support

- Chrome (recommended)
- Edge
- Firefox
- Safari

## Troubleshooting

### "Login failed" error
- Check that your Azure AD app registration is set up correctly
- Verify that the Client ID and Tenant ID in `config.js` are correct
- Ensure the redirect URI matches your current URL

### "Failed to create workbook" error
- Check that the user has OneDrive access
- Verify that the API permissions are granted in Azure AD
- Try creating the `/FitnessChallenge` folder manually in OneDrive

### Notifications not showing
- Make sure you're selected as a buddy for a submission
- Check that the submission is still in "Pending" status

## Future Enhancements

- Points calculation based on your Excel scoring system
- Progress tracking over time
- Team challenges
- Export individual student reports
- Mobile app version

## Support

For issues or questions, contact the app administrator.

## License

© 2026 Fitness Challenge Tracker - Built for educational purposes
