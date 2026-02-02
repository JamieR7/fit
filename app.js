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

        // Show result input group
        document.getElementById('resultGroup').style.display = 'block';
        document.getElementById('unitLabel').textContent = selectedChallenge.unit;

        // Show buddy group and populate buddy list
        document.getElementById('buddyGroup').style.display = 'block';
        updateBuddyList();

        // Show warning threshold if applicable
        checkHighScore();
    } else {
        document.getElementById('resultGroup').style.display = 'none';
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
    const value = parseFloat(resultInput.value);
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
        document.getElementById('adminUnitLabel').textContent = challenge.unit;
    }
}

// Handle submission
async function handleSubmit(e) {
    e.preventDefault();

    const buddySelect = document.getElementById('buddySelect');
    const resultValue = parseFloat(document.getElementById('resultInput').value);

    const buddyOption = buddySelect.selectedOptions[0];
    const buddyEmail = buddySelect.value;
    const buddyName = buddyOption?.dataset.name || '';

    // Confirm submission
    const confirmed = await showConfirmModal(
        'Confirm Submission',
        `Submit ${resultValue} ${selectedChallenge.unit} for ${selectedChallenge.name}?\n\nYour buddy ${buddyName} will be notified to verify this.`
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
    const resultValue = parseFloat(document.getElementById('adminResultInput').value);

    const studentOption = studentSelect.selectedOptions[0];
    const challenge = challenges.find(c => c.id === challengeSelect.value);

    if (!challenge) return;

    try {
        const currentUser = getCurrentUser();

        const submissionData = {
            studentName: studentOption.dataset.name,
            studentEmail: studentSelect.value,
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

        // Reload admin verifications
        await loadAdminVerifications();
    } catch (error) {
        console.error('Error submitting admin data:', error);
        showToast('Failed to submit data', 'error');
    }
}

// Load user's results
async function loadMyResults() {
    try {
        const currentUser = getCurrentUser();
        const submissions = await getUserSubmissions(currentUser.email);

        const container = document.getElementById('myResultsContent');

        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No submissions yet</h3>
                    <p>Start by submitting your first challenge!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Challenge</th><th>Result</th><th>Points</th><th>Buddy</th><th>Status</th><th>Date</th></tr></thead><tbody></tbody></table>';

        const tbody = container.querySelector('tbody');

        submissions.forEach(sub => {
            const challenge = challenges.find(c => c.id === sub.Challenge);
            const date = new Date(sub.Timestamp).toLocaleDateString();

            let statusBadge = '';
            if (sub.VerificationStatus === 'Pending') {
                statusBadge = '<span class="badge badge-pending">⏳ Pending</span>';
            } else if (sub.VerificationStatus === 'Approved' || sub.SubmittedBy === 'Admin') {
                statusBadge = '<span class="badge badge-approved">✅ Approved</span>';
            } else if (sub.VerificationStatus === 'Rejected') {
                statusBadge = '<span class="badge badge-rejected">❌ Rejected</span>';
            }

            if (sub.SubmittedBy === 'Admin') {
                statusBadge += ' <span class="badge badge-admin">Admin Entry</span>';
            }

            // Calculate percentile for display
            const percentileData = calculatePercentile(sub.Challenge, parseFloat(sub.Result));
            const percentileDisplay = formatPercentileDisplay(percentileData);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${challenge?.icon || ''} ${challenge?.name || sub.Challenge}</td>
                <td><strong>${sub.Result} ${sub.Unit}</strong></td>
                <td>${percentileDisplay.html}</td>
                <td>${sub.BuddyName || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>${date}</td>
            `;
            tbody.appendChild(row);
        });
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
            card.innerHTML = `
                <div class="verification-info">
                    <h4>${challenge?.icon || ''} ${challenge?.name || sub.Challenge}</h4>
                    <p><strong>${sub.StudentName}</strong> achieved <strong class="verification-result">${sub.Result} ${sub.Unit}</strong></p>
                    <p style="font-size: 0.9rem; color: #999;">Submitted on ${date}</p>
                </div>
                <div class="verification-actions">
                    <button class="btn btn-success" onclick="verifySubmission('${sub.SubmissionID}', 'Approved')">
                        ✅ Approve
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
            card.innerHTML = `
                <div class="verification-info">
                    <h4>${challenge?.icon || ''} ${challenge?.name || sub.Challenge}</h4>
                    <p><strong>${sub.StudentName}</strong>${sub.GradeLevel ? ' (Grade ' + sub.GradeLevel + ')' : ''} achieved <strong class="verification-result">${sub.Result} ${sub.Unit}</strong></p>
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
            container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Total Points</th><th>Challenges</th></tr></thead><tbody></tbody></table>';
        } else {
            container.innerHTML = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Name</th><th>Result</th><th>Points</th><th>Date</th></tr></thead><tbody></tbody></table>';
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
                // Overall leaderboard row
                row.innerHTML = `
                    <td>${rankBadge}</td>
                    <td>${entry.name}${isCurrentUser ? ' <strong>(You)</strong>' : ''}</td>
                    <td><strong style="color: var(--primary-color); font-size: 1.1em;">${entry.totalPoints}</strong> pts</td>
                    <td>${entry.challengesCompleted} / 15</td>
                `;
            } else {
                // Individual challenge leaderboard row
                const date = new Date(entry.timestamp).toLocaleDateString();
                const percentileData = calculatePercentile(challengeId, entry.result);
                const percentileDisplay = formatPercentileDisplay(percentileData);

                row.innerHTML = `
                    <td>${rankBadge}</td>
                    <td>${entry.name}${isCurrentUser ? ' <strong>(You)</strong>' : ''}</td>
                    <td><strong>${entry.result} ${entry.unit}</strong></td>
                    <td>${percentileDisplay.html}</td>
                    <td>${date}</td>
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
