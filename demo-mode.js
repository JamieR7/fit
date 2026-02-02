// Demo Mode Configuration
// ========================
// Enable this mode for local testing without Microsoft 365 authentication

const DEMO_MODE = {
    enabled: true, // Set to false when deploying to production

    // Fake student accounts for testing
    users: [
        { name: 'Alex Chen', email: 'alex_chen@school.edu', isStaff: false, gradeLevel: '10', gender: 'Male' },
        { name: 'Sarah Martinez', email: 'sarah_martinez@school.edu', isStaff: false, gradeLevel: '10', gender: 'Female' },
        { name: 'David Lee', email: 'david_lee@school.edu', isStaff: false, gradeLevel: '11', gender: 'Male' },
        { name: 'Emma Wilson', email: 'emma_wilson@school.edu', isStaff: false, gradeLevel: '9', gender: 'Female' },
        { name: 'Michael Brown', email: 'michael_brown@school.edu', isStaff: false, gradeLevel: '11', gender: 'Male' },
        { name: 'Sophia Garcia', email: 'sophia_garcia@school.edu', isStaff: false, gradeLevel: '9', gender: 'Female' },
        { name: 'James Taylor', email: 'james_taylor@school.edu', isStaff: false, gradeLevel: '10', gender: 'Male' },
        { name: 'Olivia Anderson', email: 'olivia_anderson@school.edu', isStaff: false, gradeLevel: '10', gender: 'Female' },
        { name: 'Coach Johnson', email: 'coach.johnson@school.edu', isStaff: true },
        { name: 'Mr. Thompson', email: 'mr.thompson@school.edu', isStaff: true }
    ],

    // Default logged-in user (change this to test different perspectives)
    defaultUser: 'coach.johnson@school.edu',  // Teacher account to view Admin tab

    // Sample submissions for testing (will be loaded in demo mode)
    sampleData: [
        {
            studentEmail: 'alex_chen@school.edu',
            challenge: 'pushups',
            result: 45,
            buddyEmail: 'sarah_martinez@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'alex_chen@school.edu',
            challenge: 'burpees',
            result: 8,  // Poor performance to test contextual leaderboard
            buddyEmail: 'sarah_martinez@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'alex_chen@school.edu',
            challenge: 'plank',
            result: 120,
            buddyEmail: 'david_lee@school.edu',
            status: 'Pending'
        },
        {
            studentEmail: 'sarah_martinez@school.edu',
            challenge: 'pushups',
            result: 52,
            buddyEmail: 'alex_chen@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'sarah_martinez@school.edu',
            challenge: 'burpees',
            result: 22,
            buddyEmail: 'alex_chen@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'david_lee@school.edu',
            challenge: 'pushups',
            result: 38,
            buddyEmail: 'emma_wilson@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'david_lee@school.edu',
            challenge: 'burpees',
            result: 28,
            buddyEmail: 'emma_wilson@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'emma_wilson@school.edu',
            challenge: 'pushups',
            result: 41,
            buddyEmail: 'michael_brown@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'emma_wilson@school.edu',
            challenge: 'burpees',
            result: 19,
            buddyEmail: 'michael_brown@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'michael_brown@school.edu',
            challenge: 'beeptest',
            result: 8.5,
            buddyEmail: 'james_taylor@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'michael_brown@school.edu',
            challenge: 'burpees',
            result: 25,
            buddyEmail: 'james_taylor@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'sophia_garcia@school.edu',
            challenge: 'sitreach',
            result: 35,
            buddyEmail: 'olivia_anderson@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'sophia_garcia@school.edu',
            challenge: 'burpees',
            result: 16,
            buddyEmail: 'olivia_anderson@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'james_taylor@school.edu',
            challenge: 'run1500m',
            result: 420, // 7 minutes in seconds
            buddyEmail: 'sophia_garcia@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'james_taylor@school.edu',
            challenge: 'burpees',
            result: 30,
            buddyEmail: 'sophia_garcia@school.edu',
            status: 'Approved'
        },
        {
            studentEmail: 'olivia_anderson@school.edu',
            challenge: 'burpees',
            result: 20,
            buddyEmail: 'alex_chen@school.edu',
            status: 'Approved'
        }
    ]
};

// Demo mode helper functions
function getDemoUser(email) {
    return DEMO_MODE.users.find(u => u.email === email);
}

function getCurrentDemoUser() {
    return getDemoUser(DEMO_MODE.defaultUser);
}

function getAllDemoUsers() {
    return DEMO_MODE.users;
}

// Generate demo submissions with proper structure
function generateDemoSubmissions() {
    const submissions = [];
    const now = new Date();

    DEMO_MODE.sampleData.forEach((sample, index) => {
        const user = getDemoUser(sample.studentEmail);
        const buddy = getDemoUser(sample.buddyEmail);
        const challenge = challenges.find(c => c.id === sample.challenge);

        if (!user || !buddy || !challenge) return;

        // Calculate points
        const percentileData = calculatePercentile(sample.challenge, sample.result);

        // Determine academic year
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const academicYear = currentMonth >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

        const timestamp = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)); // Spread over days

        submissions.push({
            SubmissionID: `DEMO-${1000 + index}`,
            Timestamp: timestamp.toISOString(),
            AcademicYear: academicYear,
            StudentName: user.name,
            StudentEmail: user.email,
            GradeLevel: user.gradeLevel || '',
            Gender: user.gender || '',
            Challenge: sample.challenge,
            Result: sample.result.toString(),
            Unit: challenge.unit,
            BuddyName: buddy.name,
            BuddyEmail: buddy.email,
            VerificationStatus: sample.status,
            VerifiedBy: sample.status === 'Approved' ? buddy.email : '',
            VerifiedTimestamp: sample.status === 'Approved' ? timestamp.toISOString() : '',
            SubmittedBy: 'Student',
            Points: percentileData.points.toString()
        });
    });

    return submissions;
}

// Switch demo user (useful for testing different perspectives)
function switchDemoUser(userEmail) {
    if (DEMO_MODE.enabled) {
        const user = getDemoUser(userEmail);
        if (user) {
            DEMO_MODE.defaultUser = userEmail;
            console.log(`Switched to demo user: ${user.name}`);
            return true;
        }
    }
    return false;
}

console.log('Demo mode loaded. Available test accounts:');
console.log('Students: alex_chen, sarah_martinez, david_lee, emma_wilson, michael_brown, sophia_garcia, james_taylor, olivia_anderson');
console.log('Staff: coach.johnson, mr.thompson');
console.log('To switch users: switchDemoUser("alex_chen@school.edu")');
