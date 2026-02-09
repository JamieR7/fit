// Main Application Logic
// =======================

// Global state
let selectedChallenge = null;
let allUsers = [];
let currentView = 'submit';

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeMSAL();

    // Set up event listeners
    document.getElementById('loginButton').addEventListener('click', signIn);
    document.getElementById('logoutButton').addEventListener('click', signOut);
    document.getElementById('submitForm').addEventListener('submit', handleSubmit);
    document.getElementById('adminSubmitForm').addEventListener('submit', handleAdminSubmit);
    document.getElementById('challengeSelect').addEventListener('change', handleChallengeSelection);
    document.getElementById('adminChallengeSelect').addEventListener('change', handleAdminChallengeSelection);
    document.getElementById('leaderboardChallengeSelect').addEventListener('change', handleLeaderboardFilter);
    document.getElementById('leaderboardGradeFilter').addEventListener('change', handleLeaderboardFilter);
    document.getElementById('leaderboardGenderFilter').addEventListener('change', handleLeaderboardFilter);
    document.getElementById('buddyGradeFilter').addEventListener('change', updateBuddyList);
    document.getElementById('buddyGenderFilter').addEventListener('change', updateBuddyList);
    document.getElementById('adminStudentGradeFilter').addEventListener('change', updateAdminStudentList);
    document.getElementById('adminStudentGenderFilter').addEventListener('change', updateAdminStudentList);
    document.getElementById('adminVerifyGradeFilter').addEventListener('change', loadAdminVerifications);
    document.getElementById('adminVerifyGenderFilter').addEventListener('change', loadAdminVerifications);
    document.getElementById('notificationBell').addEventListener('click', () => switchView('verify'));
    document.getElementById('downloadPdfBtn').addEventListener('click', generatePDFReport);
    document.getElementById('modalClose').addEventListener('click', hideModal);
    document.getElementById('modalCancel').addEventListener('click', hideModal);

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            if (view) switchView(view);
        });
    });

    // Check for existing session
    checkExistingSession();
});

// Initialize app after login
async function initializeApp() {
    try {
        showLoading(true);

        // Populate challenge dropdowns
        populateChallengeDropdowns();

        // Load users
        allUsers = await getAllUsers();
        populateUserDropdowns();

        // Load initial data
        await loadMyResults();
        await loadPendingVerifications();

        // Create challenge grid
        createChallengeGrid();

        showLoading(false);
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error loading app data', 'error');
        showLoading(false);
    }
}

// Populate challenge dropdowns
function populateChallengeDropdowns() {
    const selects = ['challengeSelect', 'leaderboardChallengeSelect', 'adminChallengeSelect'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);

        // Special handling for leaderboard - add Overall option
        if (selectId === 'leaderboardChallengeSelect') {
            select.innerHTML = '<option value="">-- Choose a challenge --</option>';
            select.innerHTML += '<option value="overall">🏆 Overall Leaderboard (Total Points)</option>';
        } else {
            select.innerHTML = '<option value="">-- Choose a challenge --</option>';
        }

        challenges.forEach(challenge => {
            const option = document.createElement('option');
            option.value = challenge.id;
            option.textContent = `${challenge.icon} ${challenge.name}`;
            select.appendChild(option);
        });
    });
}

// Populate user dropdowns (buddy and admin student selection)
function populateUserDropdowns() {
    const currentUser = getCurrentUser();

    // Buddy select (exclude current user)
    const buddySelect = document.getElementById('buddySelect');
    buddySelect.innerHTML = '<option value="">-- Choose a buddy --</option>';

    allUsers
        .filter(user => user.email !== currentUser.email)
        .forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.textContent = user.name;
            option.dataset.name = user.name;
            buddySelect.appendChild(option);
        });

    // Admin student select (only students)
    if (isCurrentUserStaff()) {
        const adminStudentSelect = document.getElementById('adminStudentSelect');
        adminStudentSelect.innerHTML = '<option value="">-- Choose a student --</option>';

        allUsers
            .filter(user => !user.isStaff)
            .forEach(user => {
                const option = document.createElement('option');
                option.value = user.email;
                option.textContent = user.name;
                option.dataset.name = user.name;
                adminStudentSelect.appendChild(option);
            });
    }
}

// Create challenge grid display
function createChallengeGrid() {
    const grid = document.getElementById('challengeGrid');
    grid.innerHTML = '';

    challenges.forEach(challenge => {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.innerHTML = `
            <div class="challenge-icon">${challenge.icon}</div>
            <div class="challenge-info">
                <h3>${challenge.name}</h3>
                <p><strong>${challenge.fitnessComponent}</strong></p>
                <p style="font-size: 0.85rem; color: #666; margin: 0.5rem 0 0 0;">${challenge.description}</p>
                <p style="margin-top: 0.75rem; color: #004587; font-weight: 600;">Measured in ${challenge.unit}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Handle challenge selection
function handleChallengeSelection(e) {
    const challengeId = e.target.value;

    if (challengeId) {
        selectedChallenge = challenges.find(c => c.id === challengeId);

        // Show appropriate input group
        if (['run1500m', 'cdlmile', 'plank'].includes(selectedChallenge.id)) {
            document.getElementById('timeInputGroup').style.display = 'block';
            document.getElementById('resultGroup').style.display = 'none';
        } else {
            document.getElementById('timeInputGroup').style.display = 'none';
            document.getElementById('resultGroup').style.display = 'block';
            document.getElementById('unitLabel').textContent = selectedChallenge.unit;
        }

        // Show buddy group and populate buddy list
        document.getElementById('buddyGroup').style.display = 'block';
        updateBuddyList();

        // Show warning threshold if applicable
        checkHighScore();
    } else {
        document.getElementById('resultGroup').style.display = 'none';
        document.getElementById('timeInputGroup').style.display = 'none';
        document.getElementById('buddyGroup').style.display = 'none';
        document.getElementById('warningAlert').classList.add('hidden');
        selectedChallenge = null;
    }
}

// Update buddy list based on filters
async function updateBuddyList() {
    const buddySelect = document.getElementById('buddySelect');
    const gradeFilter = document.getElementById('buddyGradeFilter').value;
    const genderFilter = document.getElementById('buddyGenderFilter').value;
    const currentUser = getCurrentUser();

    try {
        // Get all users
        let users = await getAllUsers();

        // Remove current user from list
        users = users.filter(user => user.email !== currentUser.email);

        // Apply filters
        if (gradeFilter) {
            users = users.filter(user => user.gradeLevel === gradeFilter);
        }
        if (genderFilter) {
            users = users.filter(user => user.gender === genderFilter);
        }

        // Populate dropdown
        buddySelect.innerHTML = '<option value="">-- Choose a buddy --</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.dataset.name = user.name;
            option.textContent = `${user.name}${user.gradeLevel ? ' (Grade ' + user.gradeLevel + ')' : ''}`;
            buddySelect.appendChild(option);
        });

        // Show count
        const filterText = gradeFilter || genderFilter ? ' matching filters' : '';
        if (users.length === 0) {
            buddySelect.innerHTML = '<option value="">No buddies available' + filterText + '</option>';
        }

    } catch (error) {
        console.error('Error loading buddies:', error);
        buddySelect.innerHTML = '<option value="">Error loading buddies</option>';
    }
}

// Update admin student list based on filters
async function updateAdminStudentList() {
    const studentSelect = document.getElementById('adminStudentSelect');
    const gradeFilter = document.getElementById('adminStudentGradeFilter').value;
    const genderFilter = document.getElementById('adminStudentGenderFilter').value;

    try {
        let users = await getAllUsers();

        // Filter out staff and apply filters
        users = users.filter(user => !user.isStaff);

        if (gradeFilter) {
            users = users.filter(user => user.gradeLevel === gradeFilter);
        }
        if (genderFilter) {
            users = users.filter(user => user.gender === genderFilter);
        }

        // Populate dropdown
        studentSelect.innerHTML = '<option value="">-- Choose a student --</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.dataset.name = user.name;
            option.dataset.gradeLevel = user.gradeLevel || '';
            option.dataset.gender = user.gender || '';
            option.textContent = `${user.name}${user.gradeLevel ? ' (Grade ' + user.gradeLevel + ')' : ''}`;
            studentSelect.appendChild(option);
        });

        if (users.length === 0) {
            const filterText = gradeFilter || genderFilter ? ' matching filters' : '';
            studentSelect.innerHTML = '<option value="">No students available' + filterText + '</option>';
        }

    } catch (error) {
        console.error('Error loading students:', error);
        studentSelect.innerHTML = '<option value="">Error loading students</option>';
    }
}

// Check for high scores
function checkHighScore() {
    const resultInput = document.getElementById('resultInput');
    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');

    let value;
    if (['run1500m', 'cdlmile', 'plank'].includes(selectedChallenge?.id)) {
        const mins = parseFloat(minutesInput.value) || 0;
        const secs = parseFloat(secondsInput.value) || 0;
        value = mins * 60 + secs;
    } else {
        value = parseFloat(resultInput.value);
    }

    const warningAlert = document.getElementById('warningAlert');

    if (selectedChallenge && value) {
        const isHigh = selectedChallenge.type === 'higher-better'
            ? value > selectedChallenge.warningThreshold
            : value < selectedChallenge.warningThreshold;

        if (isHigh) {
            warningAlert.classList.remove('hidden');
        } else {
            warningAlert.classList.add('hidden');
        }
    }
}

// Handle admin challenge selection
function handleAdminChallengeSelection(e) {
    const challengeId = e.target.value;
    const challenge = challenges.find(c => c.id === challengeId);

    if (challenge) {
        if (['run1500m', 'cdlmile', 'plank'].includes(challenge.id)) {
            document.getElementById('adminTimeInputGroup').style.display = 'block';
            document.getElementById('adminResultGroup').style.display = 'none';
        } else {
            document.getElementById('adminTimeInputGroup').style.display = 'none';
            document.getElementById('adminResultGroup').style.display = 'block';
            document.getElementById('adminUnitLabel').textContent = challenge.unit;
        }
    }
}

// Handle submission
async function handleSubmit(e) {
    e.preventDefault();

    const buddySelect = document.getElementById('buddySelect');
    let resultValue;

    if (['run1500m', 'cdlmile', 'plank'].includes(selectedChallenge.id)) {
        const mins = parseFloat(document.getElementById('minutesInput').value) || 0;
        const secs = parseFloat(document.getElementById('secondsInput').value) || 0;
        resultValue = mins * 60 + secs;

        if (resultValue === 0) {
            showToast('Please enter a valid time', 'error');
            return;
        }
    } else {
        resultValue = parseFloat(document.getElementById('resultInput').value);
        if (isNaN(resultValue)) {
            showToast('Please enter a valid result', 'error');
            return;
        }
    }

    const buddyOption = buddySelect.selectedOptions[0];
    const buddyEmail = buddySelect.value;
    const buddyName = buddyOption?.dataset.name || '';

    // Confirm submission
    const isTimed = ['run1500m', 'cdlmile', 'plank'].includes(selectedChallenge.id);
    const displayResult = isTimed
        ? formatTime(resultValue)
        : `${resultValue} ${selectedChallenge.unit}`;

    const confirmed = await showConfirmModal(
        'Confirm Submission',
        `Submit ${displayResult} for ${selectedChallenge.name}?\n\nYour buddy ${buddyName} will be notified to verify this.`
    );

    if (!confirmed) return;

    try {
        const currentUser = getCurrentUser();

        const submissionData = {
            studentName: currentUser.name,
            studentEmail: currentUser.email,
            gradeLevel: currentUser.gradeLevel || '',  // From user profile
            gender: currentUser.gender || '',          // From user profile
            challenge: selectedChallenge.id,
            result: resultValue,
            unit: selectedChallenge.unit,
            buddyName: buddyName,
            buddyEmail: buddyEmail,
            verificationStatus: 'Pending',
            submittedBy: 'Student'
        };

        await addSubmission(submissionData);

        showToast('Challenge submitted successfully! Waiting for buddy verification.', 'success');

        // Reset form
        document.getElementById('submitForm').reset();
        document.getElementById('resultGroup').style.display = 'none';
        document.getElementById('timeInputGroup').style.display = 'none';
        document.getElementById('buddyGroup').style.display = 'none';
        document.getElementById('warningAlert').classList.add('hidden');
        selectedChallenge = null;

        // Reload data
        await loadMyResults();
    } catch (error) {
        console.error('Error submitting challenge:', error);
        showToast('Failed to submit challenge', 'error');
    }
}

// Handle admin submission
async function handleAdminSubmit(e) {
    e.preventDefault();

    const studentSelect = document.getElementById('adminStudentSelect');
    const challengeSelect = document.getElementById('adminChallengeSelect');
    const challengeId = challengeSelect.value;
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) return;

    let resultValue;
    if (['run1500m', 'cdlmile', 'plank'].includes(challenge.id)) {
        const mins = parseFloat(document.getElementById('adminMinutesInput').value) || 0;
        const secs = parseFloat(document.getElementById('adminSecondsInput').value) || 0;
        resultValue = mins * 60 + secs;
    } else {
        resultValue = parseFloat(document.getElementById('adminResultInput').value);
    }

    if (isNaN(resultValue) || resultValue <= 0) {
        showToast('Please enter a valid result', 'error');
        return;
    }

    const studentOption = studentSelect.selectedOptions[0];

    try {
        const currentUser = getCurrentUser();

        const submissionData = {
            studentName: studentOption.dataset.name,
            studentEmail: studentSelect.value,
            gradeLevel: studentOption.dataset.gradeLevel || '',
            gender: studentOption.dataset.gender || '',
            challenge: challenge.id,
            result: resultValue,
            unit: challenge.unit,
            verificationStatus: 'Approved',
            verifiedBy: currentUser.email,
            verifiedTimestamp: new Date().toISOString(),
            submittedBy: 'Admin'
        };

        await addSubmission(submissionData);

        showToast('Data entered successfully (auto-verified)', 'success');

        // Reset form
        document.getElementById('adminSubmitForm').reset();
        document.getElementById('adminUnitLabel').textContent = '-';
        document.getElementById('adminTimeInputGroup').style.display = 'none';
        document.getElementById('adminResultGroup').style.display = 'block';

        // Reload admin verifications
        await loadAdminVerifications();
    } catch (error) {
        console.error('Error submitting admin data:', error);
        showToast('Failed to submit data', 'error');
    }
}

// Get user's ranking label in a challenge (filtered by grade/gender)
async function getUserRankingInChallenge(challengeId, userEmail, userResult, userGrade, userGender) {
    try {
        // Get all approved submissions for this challenge
        const allSubmissions = await getAllSubmissions();
        let challengeSubmissions = allSubmissions.filter(sub =>
            sub.Challenge === challengeId &&
            sub.VerificationStatus === 'Approved'
        );

        // Filter by user's grade and gender to create their league
        if (userGrade) {
            challengeSubmissions = challengeSubmissions.filter(sub => sub.GradeLevel === userGrade);
        }
        if (userGender) {
            challengeSubmissions = challengeSubmissions.filter(sub => sub.Gender === userGender);
        }

        // If no league data (user is the only one), return "-"
        if (challengeSubmissions.length === 0) {
            return '-';
        }

        // Sort submissions by result (depends on challenge type)
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) return '-';

        challengeSubmissions.sort((a, b) => {
            const resultA = parseFloat(a.Result);
            const resultB = parseFloat(b.Result);
            return challenge.type === 'higher-better' ? resultB - resultA : resultA - resultB;
        });

        // Find user's rank
        const userRank = challengeSubmissions.findIndex(sub =>
            sub.StudentEmail === userEmail && parseFloat(sub.Result) === parseFloat(userResult)
        ) + 1;

        if (userRank === 0) return '-'; // User not found in rankings

        const totalInLeague = challengeSubmissions.length;
        const positionPercentile = (userRank / totalInLeague) * 100;

        // Determine label based on percentile position
        let rankingLabel;

        // For smaller groups (< 5), build categories from top down
        if (totalInLeague < 5) {
            if (userRank === 1) {
                rankingLabel = 'Superstar';
            } else if (userRank === 2) {
                rankingLabel = 'Amazing';
            } else if (userRank === 3) {
                rankingLabel = 'Average';
            } else {
                rankingLabel = 'Nearly there';
            }
        } else {
            // For larger groups, use percentile-based categories
            if (positionPercentile <= 20) {
                rankingLabel = 'Superstar';
            } else if (positionPercentile <= 40) {
                rankingLabel = 'Amazing';
            } else if (positionPercentile <= 60) {
                rankingLabel = 'Average';
            } else if (positionPercentile <= 80) {
                rankingLabel = 'Nearly there';
            } else {
                rankingLabel = 'Room for growth';
            }
        }

        return rankingLabel;
    } catch (error) {
        console.error('Error calculating user ranking:', error);
        return '-';
    }
}

// Load user's results - showing ALL challenges
async function loadMyResults() {
    try {
        const currentUser = getCurrentUser();
        const submissions = await getUserSubmissions(currentUser.email);

        const container = document.getElementById('myResultsContent');

        // Always show table with all challenges
        container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Challenge</th><th>Result</th><th>Points</th><th>Buddy</th><th>Status</th><th>Ranking</th></tr></thead><tbody></tbody></table>';

        const tbody = container.querySelector('tbody');

        // Loop through ALL challenges and display each one
        for (const challenge of challenges) {
            const row = document.createElement('tr');

            // Find if user has a submission for this challenge
            const userSubmission = submissions.find(sub => sub.Challenge === challenge.id);

            if (userSubmission) {
                // User has submitted this challenge
                let statusBadge = '';
                if (userSubmission.VerificationStatus === 'Pending') {
                    statusBadge = '<span class="badge badge-pending">⏳ Pending</span>';
                } else if (userSubmission.VerificationStatus === 'Approved' || userSubmission.SubmittedBy === 'Admin') {
                    statusBadge = '<span class="badge badge-approved">✅ Approved</span>';
                } else if (userSubmission.VerificationStatus === 'Rejected') {
                    statusBadge = '<span class="badge badge-rejected">❌ Rejected</span>';
                }

                if (userSubmission.SubmittedBy === 'Admin') {
                    statusBadge += ' <span class="badge badge-admin">Admin Entry</span>';
                }

                const isTimed = ['run1500m', 'cdlmile', 'plank'].includes(challenge.id);
                const displayResult = isTimed
                    ? formatTime(userSubmission.Result)
                    : `${userSubmission.Result} ${userSubmission.Unit}`;

                // Calculate ranking label (only for approved submissions)
                let rankingDisplay = '-';
                if (userSubmission.VerificationStatus === 'Approved' || userSubmission.SubmittedBy === 'Admin') {
                    rankingDisplay = await getUserRankingInChallenge(
                        challenge.id,
                        currentUser.email,
                        userSubmission.Result,
                        currentUser.gradeLevel,
                        currentUser.gender
                    );
                }

                row.innerHTML = `
                    <td>${challenge.icon} ${challenge.name}</td>
                    <td><strong>${displayResult}</strong></td>
                    <td><span class="badge badge-primary">${userSubmission.Points || 0} pts</span></td>
                    <td>${userSubmission.BuddyName || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>${rankingDisplay}</td>
                `;
            } else {
                // User has NOT submitted this challenge
                row.innerHTML = `
                    <td>${challenge.icon} ${challenge.name}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td><span class="badge badge-secondary">Not submitted</span></td>
                    <td>-</td>
                `;
            }

            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Load pending verifications
async function loadPendingVerifications() {
    try {
        const currentUser = getCurrentUser();
        const pending = await getPendingVerifications(currentUser.email);

        // Update notification badge
        const badge = document.getElementById('notificationCount');
        if (pending.length > 0) {
            badge.textContent = pending.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        const container = document.getElementById('verificationList');

        if (pending.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✨</div>
                    <h3>All caught up!</h3>
                    <p>No pending verifications at the moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        pending.forEach(sub => {
            const challenge = challenges.find(c => c.id === sub.Challenge);
            const date = new Date(sub.Timestamp).toLocaleDateString();

            const card = document.createElement('div');
            card.className = 'verification-card';

            const displayResult = ['run1500m', 'cdlmile', 'plank'].includes(sub.Challenge)
                ? formatTime(sub.Result)
                : `${sub.Result} ${sub.Unit}`;

            card.innerHTML = `
                <div class="verification-info">
                    <h4>${challenge?.icon || ''} ${challenge?.name || sub.Challenge}</h4>
                    <p><strong>${sub.StudentName}</strong> achieved <strong class="verification-result">${displayResult}</strong></p>
                    <p style="font-size: 0.9rem;">Submitted: ${date}</p>
                </div>
                <div class="verification-actions">
                    <button class="btn btn-success" onclick="verifySubmission('${sub.SubmissionID}', 'Approved')">
                        ✅ Verify
                    </button>
                    <button class="btn btn-danger" onclick="verifySubmission('${sub.SubmissionID}', 'Rejected')">
                        ❌ Reject
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading verifications:', error);
    }
}

// Verify submission
async function verifySubmission(submissionId, status) {
    try {
        const currentUser = getCurrentUser();

        await updateVerificationStatus(submissionId, status, currentUser.email);

        showToast(`Submission ${status.toLowerCase()}!`, 'success');

        // Reload verifications
        await loadPendingVerifications();
    } catch (error) {
        console.error('Error verifying submission:', error);
        showToast('Failed to verify submission', 'error');
    }
}

// Load admin verifications (all pending) with filtering
async function loadAdminVerifications() {
    try {
        const allSubmissions = await getAllSubmissions();
        let pending = allSubmissions.filter(sub => sub.VerificationStatus === 'Pending');

        // Apply filters
        const gradeFilter = document.getElementById('adminVerifyGradeFilter').value;
        const genderFilter = document.getElementById('adminVerifyGenderFilter').value;

        if (gradeFilter) {
            pending = pending.filter(sub => sub.GradeLevel === gradeFilter);
        }
        if (genderFilter) {
            pending = pending.filter(sub => sub.Gender === genderFilter);
        }

        const container = document.getElementById('adminVerificationList');

        if (pending.length === 0) {
            const filterText = gradeFilter || genderFilter ? ' matching your filters' : '';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✨</div>
                    <h3>No pending verifications${filterText}</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        pending.forEach(sub => {
            const challenge = challenges.find(c => c.id === sub.Challenge);
            const date = new Date(sub.Timestamp).toLocaleDateString();

            const card = document.createElement('div');
            card.className = 'verification-card';

            const displayResult = ['run1500m', 'cdlmile', 'plank'].includes(sub.Challenge)
                ? formatTime(sub.Result)
                : `${sub.Result} ${sub.Unit}`;

            card.innerHTML = `
                <div class="verification-info">
                    <h4>${challenge?.icon || ''} ${challenge?.name || sub.Challenge}</h4>
                    <p><strong>${sub.StudentName}</strong>${sub.GradeLevel ? ' (Grade ' + sub.GradeLevel + ')' : ''} achieved <strong class="verification-result">${displayResult}</strong></p>
                    <p style="font-size: 0.9rem;">Buddy: ${sub.BuddyName} | Submitted: ${date}</p>
                </div>
                <div class="verification-actions">
                    <button class="btn btn-success" onclick="adminVerifySubmission('${sub.SubmissionID}', 'Approved')">
                        ✅ Approve
                    </button>
                    <button class="btn btn-danger" onclick="adminVerifySubmission('${sub.SubmissionID}', 'Rejected')">
                        ❌ Reject
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading admin verifications:', error);
    }
}

// Admin verify submission
async function adminVerifySubmission(submissionId, status) {
    try {
        const currentUser = getCurrentUser();

        await updateVerificationStatus(submissionId, status, currentUser.email);

        showToast(`Submission ${status.toLowerCase()} by admin!`, 'success');

        // Reload admin verifications
        await loadAdminVerifications();
    } catch (error) {
        console.error('Error admin verifying submission:', error);
        showToast('Failed to verify submission', 'error');
    }
}

// Handle leaderboard filter
async function handleLeaderboardFilter(e) {
    const challengeId = document.getElementById('leaderboardChallengeSelect').value;
    const gradeFilter = document.getElementById('leaderboardGradeFilter').value;
    const genderFilter = document.getElementById('leaderboardGenderFilter').value;

    if (!challengeId) {
        document.getElementById('leaderboardContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <h3>Select a challenge</h3>
                <p>Choose a challenge above to view the leaderboard</p>
            </div>
        `;
        return;
    }

    try {
        showLoading(true);

        let leaderboard;
        let isOverall = (challengeId === 'overall');

        if (isOverall) {
            leaderboard = await getOverallLeaderboardData();
        } else {
            leaderboard = await getLeaderboardData(challengeId);
        }

        // Apply filters
        if (gradeFilter) {
            leaderboard = leaderboard.filter(entry => entry.gradeLevel === gradeFilter);
        }
        if (genderFilter) {
            leaderboard = leaderboard.filter(entry => entry.gender === genderFilter);
        }

        const challenge = challenges.find(c => c.id === challengeId);
        const currentUser = getCurrentUser();

        const container = document.getElementById('leaderboardContent');

        if (leaderboard.length === 0) {
            const filterText = gradeFilter || genderFilter ? ' matching your filters' : '';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>No data yet</h3>
                    <p>No submissions${filterText} for this challenge!</p>
                </div>
            `;
            showLoading(false);
            return;
        }

        // Find current user's rank
        const userRank = leaderboard.findIndex(entry => entry.email === currentUser.email);

        // Build contextual leaderboard: top 3 + 3 above/below user
        let displayLeaderboard = [];

        if (userRank === -1) {
            // User not in leaderboard, show top entries
            displayLeaderboard = leaderboard.slice(0, 10);
        } else {
            // Always show top 3
            const top3 = leaderboard.slice(0, 3);

            if (userRank < 3) {
                // User is in top 3, show top 10
                displayLeaderboard = leaderboard.slice(0, Math.min(10, leaderboard.length));
            } else {
                // Show top 3 + context around user (3 above + user + 3 below)
                const contextStart = Math.max(3, userRank - 3);
                const contextEnd = Math.min(leaderboard.length, userRank + 4);
                const contextEntries = leaderboard.slice(contextStart, contextEnd);

                displayLeaderboard = [...top3, ...contextEntries];
            }
        }

        // Build table based on type
        if (isOverall) {
            container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Total Points</th><th>Challenges Completed</th><th>Ranking</th></tr></thead><tbody></tbody></table>';
        } else {
            container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Result</th><th>Points</th><th>Ranking</th></tr></thead><tbody></tbody></table>';
        }

        const tbody = container.querySelector('tbody');

        displayLeaderboard.forEach((entry, displayIndex) => {
            // Find actual rank in full leaderboard
            const rank = leaderboard.findIndex(e => e.email === entry.email) + 1;
            const isCurrentUser = entry.email === currentUser.email;

            // Add separator row if jumping from top 3 to context
            if (displayIndex === 3 && rank > 4) {
                const separatorRow = document.createElement('tr');
                separatorRow.className = 'leaderboard-separator';
                separatorRow.innerHTML = `<td colspan="${isOverall ? 4 : 5}" style="text-align: center; padding: 0.5rem; color: #666; font-style: italic;">...</td>`;
                tbody.appendChild(separatorRow);
            }

            let rankBadge;
            if (rank === 1) {
                rankBadge = '<div class="rank-badge gold">🥇</div>';
            } else if (rank === 2) {
                rankBadge = '<div class="rank-badge silver">🥈</div>';
            } else if (rank === 3) {
                rankBadge = '<div class="rank-badge bronze">🥉</div>';
            } else {
                rankBadge = `<div class="rank-badge regular">${rank}</div>`;
            }

            const row = document.createElement('tr');
            if (isCurrentUser) {
                row.classList.add('current-user');
            }

            if (isOverall) {
                // Overall leaderboard row - use visual position bars like individual challenges
                const totalInLeague = leaderboard.length;
                const positionPercentile = (rank / totalInLeague) * 100;

                // Bar width represents actual percentile (inverted: 1st place = 100%, last = small)
                const barWidth = Math.max(10, 100 - positionPercentile);

                // Determine label and color based on percentile position
                let rankingLabel;
                let colorClass;

                // For smaller groups (< 5), build categories from top down
                if (totalInLeague < 5) {
                    if (rank === 1) {
                        rankingLabel = 'Superstar';
                        colorClass = 'top-25';
                    } else if (rank === 2) {
                        rankingLabel = 'Amazing';
                        colorClass = 'top-50';
                    } else if (rank === 3) {
                        rankingLabel = 'Average';
                        colorClass = 'top-75';
                    } else {
                        rankingLabel = 'Nearly there';
                        colorClass = 'bottom-25';
                    }
                } else {
                    // For larger groups, use percentile-based categories
                    if (positionPercentile <= 20) {
                        rankingLabel = 'Superstar';
                        colorClass = 'top-25';
                    } else if (positionPercentile <= 40) {
                        rankingLabel = 'Amazing';
                        colorClass = 'top-50';
                    } else if (positionPercentile <= 60) {
                        rankingLabel = 'Average';
                        colorClass = 'top-75';
                    } else if (positionPercentile <= 80) {
                        rankingLabel = 'Nearly there';
                        colorClass = 'bottom-25';
                    } else {
                        rankingLabel = 'Room for growth';
                        colorClass = 'bottom-25';
                    }
                }

                row.innerHTML = `
                    <td>${rankBadge}</td>
                    <td>${entry.name}${isCurrentUser ? ' <strong>(You)</strong>' : ''}</td>
                    <td><strong style="color: var(--primary-color); font-size: 1.1em;">${entry.totalPoints}</strong> pts</td>
                    <td>${entry.challengesCompleted} / 15</td>
                    <td>
                        <div class="position-bar-container">
                            <div class="position-bar ${colorClass}" style="width: ${barWidth}%"></div>
                            <span class="position-text">${rankingLabel}</span>
                        </div>
                    </td>
                `;
            } else {
                // Individual challenge leaderboard row
                const percentileData = calculatePercentile(challengeId, entry.result);

                // Calculate position bar and label based on rank in current leaderboard
                const totalInLeague = leaderboard.length;
                const positionPercentile = (rank / totalInLeague) * 100;

                // Bar width represents actual percentile (inverted: 1st place = 100%, last = small)
                const barWidth = Math.max(10, 100 - positionPercentile);

                // Determine label and color based on percentile position
                let rankingLabel;
                let colorClass;

                // For smaller groups (< 5), build categories from top down
                if (totalInLeague < 5) {
                    if (rank === 1) {
                        rankingLabel = 'Superstar';
                        colorClass = 'top-25';
                    } else if (rank === 2) {
                        rankingLabel = 'Amazing';
                        colorClass = 'top-50';
                    } else if (rank === 3) {
                        rankingLabel = 'Average';
                        colorClass = 'top-75';
                    } else {
                        rankingLabel = 'Nearly there';
                        colorClass = 'bottom-25';
                    }
                } else {
                    // For larger groups, use percentile-based categories
                    if (positionPercentile <= 20) {
                        rankingLabel = 'Superstar';
                        colorClass = 'top-25';
                    } else if (positionPercentile <= 40) {
                        rankingLabel = 'Amazing';
                        colorClass = 'top-50';
                    } else if (positionPercentile <= 60) {
                        rankingLabel = 'Average';
                        colorClass = 'top-75';
                    } else if (positionPercentile <= 80) {
                        rankingLabel = 'Nearly there';
                        colorClass = 'bottom-25';
                    } else {
                        rankingLabel = 'Room for growth';
                        colorClass = 'bottom-25';
                    }
                }

                const isTimed = ['run1500m', 'cdlmile', 'plank'].includes(challengeId);
                const displayResult = isTimed
                    ? formatTime(entry.result)
                    : `${entry.result} ${entry.unit}`;

                row.innerHTML = `
                    <td>${rankBadge}</td>
                    <td>${entry.name}${isCurrentUser ? ' <strong>(You)</strong>' : ''}</td>
                    <td><strong>${displayResult}</strong></td>
                    <td>${percentileData.points} pts</td>
                    <td>
                        <div class="position-bar-container">
                            <div class="position-bar ${colorClass}" style="width: ${barWidth}%"></div>
                            <span class="position-text">${rankingLabel}</span>
                        </div>
                    </td>
                `;
            }

            tbody.appendChild(row);
        });

        showLoading(false);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showToast('Failed to load leaderboard', 'error');
        showLoading(false);
    }
}

// Switch view
function switchView(viewName) {
    // Security check: Only staff can access the admin view
    if (viewName === 'admin' && !isCurrentUserStaff()) {
        console.warn('Access denied: Admin view restricted to staff.');
        switchView('leaderboard');
        return;
    }

    currentView = viewName;

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.view === viewName) {
            tab.classList.add('active');
        }
    });

    // Update view sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(`${viewName}View`).classList.add('active');

    // Load data for the view
    if (viewName === 'myResults') {
        loadMyResults();
    } else if (viewName === 'verify') {
        loadPendingVerifications();
    } else if (viewName === 'admin') {
        loadAdminVerifications();
    }
}

// UI Helpers
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span style="font-size: 1.5rem;">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, appSettings.toastDuration);
}

function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

function hideModal() {
    document.getElementById('confirmModal').classList.add('hidden');
}

// Format seconds into MM:SS
function formatTime(seconds) {
    if (!seconds && seconds !== 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
