// Fitness Challenge App - Configuration
// =====================================

// Azure AD Configuration
// IMPORTANT: You need to register an app in Azure Portal and add these values
// See README.md for detailed setup instructions
const msalConfig = {
    auth: {
        clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your Azure AD app client ID
        authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID_HERE', // Replace with your tenant ID
        redirectUri: window.location.origin // Will use the current page URL
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
    }
};

// Microsoft Graph API scopes required
const loginRequest = {
    scopes: [
        'User.Read',
        'Files.ReadWrite',
        'Sites.ReadWrite.All'
    ]
};

// Excel Workbook Configuration
// After creating the workbook in OneDrive, update these values
const excelConfig = {
    workbookPath: '/FitnessChallenge/submissions.xlsx', // Path in OneDrive
    workbookId: null, // Will be populated automatically when workbook is found
    sheetsConfig: {
        submissions: 'Submissions',
        users: 'Users',
        challenges: 'Challenges'
    }
};

// Challenge Definitions
const challenges = [
    {
        id: 'pushups',
        name: 'Push ups',
        unit: 'reps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 500,
        warningThreshold: 200,
        icon: '💪',
        fitnessComponent: 'Muscular Strength & Endurance',
        description: 'A classic upper body exercise that measures strength and endurance of the chest, shoulders, and triceps.'
    },
    {
        id: 'burpees',
        name: 'Burpees',
        unit: 'reps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 300,
        warningThreshold: 150,
        icon: '🏃',
        fitnessComponent: 'Cardiovascular Endurance & Power',
        description: 'A full-body explosive exercise combining a squat, plank, push-up, and jump. Tests cardiovascular endurance and total body power.'
    },
    {
        id: 'plank',
        name: 'Plank',
        unit: 'seconds',
        type: 'higher-better',
        minValue: 0,
        maxValue: 1800,
        warningThreshold: 600,
        icon: '🧘',
        fitnessComponent: 'Core Strength & Stability',
        description: 'An isometric core strength exercise that measures abdominal strength and overall body stability by holding a push-up position.'
    },
    {
        id: 'run1500m',
        name: '1500m run',
        unit: 'seconds',
        type: 'lower-better',
        minValue: 180,
        maxValue: 1200,
        warningThreshold: 240,
        icon: '🏃‍♂️',
        fitnessComponent: 'Cardiovascular Endurance',
        description: 'A middle-distance running test that measures aerobic capacity and cardiovascular endurance. Lower time is better.'
    },
    {
        id: 'beeptest',
        name: 'Beep test',
        unit: 'level',
        type: 'higher-better',
        minValue: 1,
        maxValue: 21,
        warningThreshold: 15,
        icon: '📢',
        fitnessComponent: 'Aerobic Capacity (VO2 max)',
        description: 'Also known as the multi-stage fitness test, it measures maximum aerobic capacity by running between markers at increasing speeds.'
    },
    {
        id: 'cdlmile',
        name: 'CdL Mile',
        unit: 'seconds',
        type: 'lower-better',
        minValue: 240,
        maxValue: 1200,
        warningThreshold: 300,
        icon: '🏃‍♀️',
        fitnessComponent: 'Cardiovascular Endurance',
        description: 'A one-mile running assessment testing aerobic endurance and pacing ability. Lower time indicates better performance.'
    },
    {
        id: 'sitreach',
        name: 'Sit & reach',
        unit: 'cm',
        type: 'higher-better',
        minValue: -20,
        maxValue: 50,
        warningThreshold: 40,
        icon: '🤸',
        fitnessComponent: 'Flexibility',
        description: 'A flexibility test measuring the range of motion in the lower back and hamstrings while seated with legs extended.'
    },
    {
        id: 'sallythunderstruck',
        name: 'Bring Sally Thunderstruck',
        unit: 'reps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 100,
        warningThreshold: 50,
        icon: '⚡',
        fitnessComponent: 'Muscular Endurance',
        description: 'A squat endurance challenge performed to the song "Flower" by Moby. Hold squat position on "bring sally down" and stand on "bring sally up".'
    },
    {
        id: 'crisscross',
        name: 'Criss cross',
        unit: 'reps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 300,
        warningThreshold: 150,
        icon: '➕',
        fitnessComponent: 'Core Strength & Coordination',
        description: 'An abdominal exercise involving alternating elbow-to-knee movements while lying on your back. Tests oblique strength and coordination.'
    },
    {
        id: 'longjump',
        name: 'Standing long jump',
        unit: 'cm',
        type: 'higher-better',
        minValue: 50,
        maxValue: 400,
        warningThreshold: 300,
        icon: '🦘',
        fitnessComponent: 'Explosive Power',
        description: 'A horizontal jump from a standing position that measures lower body power and explosive strength in the legs.'
    },
    {
        id: 'slackline',
        name: 'Slackline',
        unit: 'steps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 100,
        warningThreshold: 50,
        icon: '🎪',
        fitnessComponent: 'Balance & Coordination',
        description: 'Walking on a suspended line that tests balance, core stability, and overall body coordination. Measured in consecutive steps taken.'
    },
    {
        id: 'sprint60m',
        name: '60m sprint',
        unit: 'seconds',
        type: 'lower-better',
        minValue: 5,
        maxValue: 20,
        warningThreshold: 7,
        icon: '⚡',
        fitnessComponent: 'Speed & Acceleration',
        description: 'A short-distance sprint measuring maximum running speed and acceleration ability. Lower time indicates better performance.'
    },
    {
        id: 'sprint100m',
        name: '100m sprint',
        unit: 'seconds',
        type: 'lower-better',
        minValue: 8,
        maxValue: 30,
        warningThreshold: 11,
        icon: '💨',
        fitnessComponent: 'Speed & Power',
        description: 'A classic sprint distance testing maximum speed, power, and anaerobic capacity. Lower time indicates better performance.'
    },
    {
        id: 'skipping',
        name: 'Skipping',
        unit: 'reps',
        type: 'higher-better',
        minValue: 0,
        maxValue: 500,
        warningThreshold: 300,
        icon: '🪢',
        fitnessComponent: 'Coordination & Cardiovascular Endurance',
        description: 'Jump rope exercise testing cardiovascular endurance, coordination, and rhythmic timing. Count consecutive successful jumps.'
    },
    {
        id: 'griptest',
        name: 'Grip test',
        unit: 'kg',
        type: 'higher-better',
        minValue: 0,
        maxValue: 100,
        warningThreshold: 70,
        icon: '✊',
        fitnessComponent: 'Grip Strength',
        description: 'Using a hand dynamometer to measure maximum grip strength in kilograms, testing forearm and hand muscle strength.'
    }
];

// User Role Detection
const userRoles = {
    isStaff: (email) => {
        // Staff emails contain a dot (.), student emails contain underscore (_)
        return email.includes('.');
    },
    isStudent: (email) => {
        return email.includes('_');
    }
};

// App Settings
const appSettings = {
    appName: 'Fitness Challenge Tracker',
    leaderboardTopCount: 10,
    leaderboardContextCount: 5, // Show 5 above and below user
    toastDuration: 4000, // Toast notification duration in ms
    enableNotifications: true
};
