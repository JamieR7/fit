// Excel Online API Module - Microsoft Graph Integration
// ======================================================

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

// Get or create workbook
async function getOrCreateWorkbook() {
    try {
        const token = await getAccessToken();

        // Try to get existing workbook
        const workbookPath = excelConfig.workbookPath;
        const encodedPath = encodeURIComponent(workbookPath);

        let response = await fetch(`${GRAPH_ENDPOINT}/me/drive/root:${workbookPath}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const workbook = await response.json();
            excelConfig.workbookId = workbook.id;
            console.log('Found existing workbook:', workbook.id);
            return workbook;
        }

        // If workbook doesn't exist, create it
        console.log('Workbook not found, creating new one...');
        return await createWorkbook(token);
    } catch (error) {
        console.error('Error getting/creating workbook:', error);
        throw error;
    }
}

// Create new workbook with structure
async function createWorkbook(token) {
    try {
        // Create workbook file
        const createResponse = await fetch(`${GRAPH_ENDPOINT}/me/drive/root:/FitnessChallenge/submissions.xlsx:/content`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            body: new Blob()
        });

        if (!createResponse.ok) {
            throw new Error('Failed to create workbook');
        }

        const workbook = await createResponse.json();
        excelConfig.workbookId = workbook.id;

        // Initialize sheets
        await initializeWorkbookSheets(token, workbook.id);

        return workbook;
    } catch (error) {
        console.error('Error creating workbook:', error);
        throw error;
    }
}

// Initialize workbook sheets with headers
async function initializeWorkbookSheets(token, workbookId) {
    try {
        // Create Submissions sheet with headers
        const submissionsHeaders = [
            ['SubmissionID', 'Timestamp', 'AcademicYear', 'StudentName', 'StudentEmail',
                'GradeLevel', 'Gender', 'Challenge', 'Result', 'Unit', 'BuddyName', 'BuddyEmail',
                'VerificationStatus', 'VerifiedBy', 'VerifiedTimestamp', 'SubmittedBy', 'Points']
        ];

        // Add headers to first sheet (Sheet1, which we'll rename to Submissions)
        await fetch(`${GRAPH_ENDPOINT}/me/drive/items/${workbookId}/workbook/worksheets/Sheet1/range(address='A1:Q1')`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: submissionsHeaders
            })
        });

        // Rename Sheet1 to Submissions
        await fetch(`${GRAPH_ENDPOINT}/me/drive/items/${workbookId}/workbook/worksheets/Sheet1`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Submissions'
            })
        });

        console.log('Workbook initialized with headers');
    } catch (error) {
        console.error('Error initializing sheets:', error);
    }
}

// Add submission to Excel
async function addSubmission(submissionData) {
    try {
        showLoading(true);

        const token = await getAccessToken();
        const workbook = await getOrCreateWorkbook();

        // Generate submission ID
        const submissionId = `SUB-${Date.now()}`;
        const timestamp = new Date().toISOString();

        // Calculate points based on result
        const percentileData = calculatePercentile(submissionData.challenge, submissionData.result);
        const points = percentileData.points;

        // Determine academic year (Sept-Aug)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        const academicYear = currentMonth >= 8 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

        // Prepare row data
        const rowData = [[
            submissionId,
            timestamp,
            academicYear,
            submissionData.studentName,
            submissionData.studentEmail,
            submissionData.gradeLevel || '',
            submissionData.gender || '',
            submissionData.challenge,
            submissionData.result,
            submissionData.unit,
            submissionData.buddyName || '',
            submissionData.buddyEmail || '',
            submissionData.verificationStatus || 'Pending',
            submissionData.verifiedBy || '',
            submissionData.verifiedTimestamp || '',
            submissionData.submittedBy || 'Student',
            points // Auto-calculated points
        ]];

        // Add row to Submissions sheet
        const response = await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/tables/add`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: 'A1:N1',
                    hasHeaders: true
                })
            }
        );

        // If table doesn't exist, create it first
        // Then add the row
        const addRowResponse = await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/range(address='A1')/insert`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shift: 'Down'
                })
            }
        );

        // Simpler approach: Get used range and append
        const usedRangeResponse = await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/usedRange`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const usedRange = await usedRangeResponse.json();
        const nextRow = usedRange.rowCount + 1;

        // Add data to next row
        await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/range(address='A${nextRow}:Q${nextRow}')`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: rowData
                })
            }
        );

        showLoading(false);
        return { submissionId, success: true };
    } catch (error) {
        showLoading(false);
        console.error('Error adding submission:', error);
        throw error;
    }
}

// Get all submissions
async function getAllSubmissions() {
    // Demo mode: return fake data
    if (sessionStorage.getItem('demoMode') === 'true') {
        const demoSubmissions = generateDemoSubmissions();
        // Also include any submissions from sessionStorage
        const storedSubmissions = sessionStorage.getItem('demoSubmissions');
        if (storedSubmissions) {
            const additional = JSON.parse(storedSubmissions);
            return [...demoSubmissions, ...additional];
        }
        return demoSubmissions;
    }

    try {
        const token = await getAccessToken();
        const workbook = await getOrCreateWorkbook();

        const response = await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/usedRange`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const rows = data.values;

        if (!rows || rows.length <= 1) {
            return [];
        }

        // Convert to objects (skip header row)
        const headers = rows[0];
        const submissions = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        return submissions;
    } catch (error) {
        console.error('Error getting submissions:', error);
        return [];
    }
}

// Get pending verifications for a user
async function getPendingVerifications(userEmail) {
    try {
        const allSubmissions = await getAllSubmissions();

        return allSubmissions.filter(sub =>
            sub.BuddyEmail === userEmail &&
            sub.VerificationStatus === 'Pending'
        );
    } catch (error) {
        console.error('Error getting pending verifications:', error);
        return [];
    }
}

// Get user's submissions
async function getUserSubmissions(userEmail) {
    try {
        const allSubmissions = await getAllSubmissions();

        return allSubmissions.filter(sub => sub.StudentEmail === userEmail);
    } catch (error) {
        console.error('Error getting user submissions:', error);
        return [];
    }
}

// Update verification status
async function updateVerificationStatus(submissionId, status, verifierEmail) {
    try {
        showLoading(true);

        const token = await getAccessToken();
        const allSubmissions = await getAllSubmissions();

        // Find the row index for this submission
        const rowIndex = allSubmissions.findIndex(sub => sub.SubmissionID === submissionId);

        if (rowIndex === -1) {
            throw new Error('Submission not found');
        }

        const actualRowIndex = rowIndex + 2; // +1 for header, +1 for 1-based indexing
        const timestamp = new Date().toISOString();

        // Update verification status, verifier, and timestamp
        await fetch(
            `${GRAPH_ENDPOINT}/me/drive/items/${excelConfig.workbookId}/workbook/worksheets/${excelConfig.sheetsConfig.submissions}/range(address='J${actualRowIndex}:L${actualRowIndex}')`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [[status, verifierEmail, timestamp]]
                })
            }
        );

        showLoading(false);
        return { success: true };
    } catch (error) {
        showLoading(false);
        console.error('Error updating verification:', error);
        throw error;
    }
}

// Get leaderboard data for a challenge
async function getLeaderboardData(challengeId) {
    try {
        const allSubmissions = await getAllSubmissions();

        // Filter for this challenge and approved submissions only
        const challengeSubmissions = allSubmissions.filter(sub =>
            sub.Challenge === challengeId &&
            (sub.VerificationStatus === 'Approved' || sub.SubmittedBy === 'Admin')
        );

        // Group by student and get best result
        const studentBest = {};

        challengeSubmissions.forEach(sub => {
            const email = sub.StudentEmail;
            const result = parseFloat(sub.Result);

            if (!studentBest[email] || shouldReplaceBest(result, studentBest[email].result, sub.Challenge)) {
                studentBest[email] = {
                    name: sub.StudentName,
                    email: sub.StudentEmail,
                    result: result,
                    unit: sub.Unit,
                    timestamp: sub.Timestamp,
                    gradeLevel: sub.GradeLevel,
                    gender: sub.Gender
                };
            }
        });

        // Convert to array and sort
        const leaderboard = Object.values(studentBest);
        const challenge = challenges.find(c => c.id === challengeId);

        if (challenge) {
            leaderboard.sort((a, b) => {
                if (challenge.type === 'higher-better') {
                    return b.result - a.result;
                } else {
                    return a.result - b.result;
                }
            });
        }

        return leaderboard;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

// Get overall leaderboard data (total points across all challenges)
async function getOverallLeaderboardData() {
    try {
        const allSubmissions = await getAllSubmissions();

        // Filter for approved submissions only
        const approvedSubmissions = allSubmissions.filter(sub =>
            sub.VerificationStatus === 'Approved' || sub.SubmittedBy === 'Admin'
        );

        // Group by student  
        const studentData = {};

        approvedSubmissions.forEach(sub => {
            const email = sub.StudentEmail;

            if (!studentData[email]) {
                studentData[email] = {
                    name: sub.StudentName,
                    email: sub.StudentEmail,
                    gradeLevel: sub.GradeLevel,
                    gender: sub.Gender,
                    totalPoints: 0,
                    challengesCompleted: 0,
                    challenges: {}
                };
            }

            const challengeId = sub.Challenge;
            const result = parseFloat(sub.Result);
            const points = parseInt(sub.Points) || 0;

            // Keep best result per challenge
            if (!studentData[email].challenges[challengeId] ||
                shouldReplaceBest(result, studentData[email].challenges[challengeId].result, challengeId)) {

                // If replacing, subtract old points
                if (studentData[email].challenges[challengeId]) {
                    studentData[email].totalPoints -= studentData[email].challenges[challengeId].points;
                } else {
                    studentData[email].challengesCompleted++;
                }

                studentData[email].challenges[challengeId] = {
                    result: result,
                    points: points
                };
                studentData[email].totalPoints += points;
            }
        });

        // Convert to array and sort by total points
        const leaderboard = Object.values(studentData).map(student => ({
            name: student.name,
            email: student.email,
            gradeLevel: student.gradeLevel,
            gender: student.gender,
            totalPoints: student.totalPoints,
            challengesCompleted: student.challengesCompleted,
            timestamp: new Date().toISOString() //  Placeholder
        }));

        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints || b.challengesCompleted - a.challengesCompleted);

        return leaderboard;
    } catch (error) {
        console.error('Error getting overall leaderboard:', error);
        return [];
    }
}

// Helper function to determine if new result is better
function shouldReplaceBest(newResult, currentBest, challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) return false;

    if (challenge.type === 'higher-better') {
        return newResult > currentBest;
    } else {
        return newResult < currentBest;
    }
}

// Get all users (for buddy/admin selection)
async function getAllUsers() {
    // Demo mode: return fake users
    if (sessionStorage.getItem('demoMode') === 'true') {
        return getAllDemoUsers();
    }

    try {
        const allSubmissions = await getAllSubmissions();
        const token = await getAccessToken();

        // Get unique users from submissions
        const users = new Set();

        allSubmissions.forEach(sub => {
            if (sub.StudentEmail) {
                users.add(JSON.stringify({
                    name: sub.StudentName,
                    email: sub.StudentEmail,
                    isStaff: userRoles.isStaff(sub.StudentEmail)
                }));
            }
            if (sub.BuddyEmail) {
                users.add(JSON.stringify({
                    name: sub.BuddyName,
                    email: sub.BuddyEmail,
                    isStaff: userRoles.isStaff(sub.BuddyEmail)
                }));
            }
        });

        // Convert back to objects and add current user
        const currentUser = getCurrentUser();
        if (currentUser) {
            users.add(JSON.stringify({
                name: currentUser.name,
                email: currentUser.email,
                isStaff: currentUser.isStaff
            }));
        }

        return Array.from(users).map(u => JSON.parse(u));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}
