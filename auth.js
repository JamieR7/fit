// Authentication Module - Microsoft 365 Login
// ===========================================

let msalInstance;
let currentUser = null;

// Initialize MSAL
function initializeMSAL() {
    try {
        msalInstance = new msal.PublicClientApplication(msalConfig);
        console.log('MSAL initialized successfully');
    } catch (error) {
        console.error('Error initializing MSAL:', error);
        showToast('Authentication setup error. Please check configuration.', 'error');
    }
}

// Sign in function
async function signIn() {
    // Demo mode: bypass Microsoft authentication
    if (typeof DEMO_MODE !== 'undefined' && DEMO_MODE.enabled) {
        const demoUser = getCurrentDemoUser();
        currentUser = {
            name: demoUser.name,
            email: demoUser.email,
            isStaff: demoUser.isStaff,
            account: null
        };

        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        sessionStorage.setItem('demoMode', 'true');

        console.log('Demo mode: Logged in as', currentUser);
        await onUserLoggedIn();
        return;
    }

    try {
        showLoading(true);

        const loginResponse = await msalInstance.loginPopup(loginRequest);

        if (loginResponse) {
            currentUser = {
                name: loginResponse.account.name,
                email: loginResponse.account.username,
                isStaff: userRoles.isStaff(loginResponse.account.username),
                account: loginResponse.account
            };

            console.log('User logged in:', currentUser);

            // Store user info
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Show main app
            await onUserLoggedIn();
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Sign out function
async function signOut() {
    try {
        const account = currentUser?.account;

        if (account) {
            await msalInstance.logoutPopup({
                account: account
            });
        }

        // Clear session
        sessionStorage.clear();
        currentUser = null;

        // Reset UI
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');

        showToast('Logged out successfully', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

// Get access token for Microsoft Graph API
async function getAccessToken() {
    // Demo mode: return fake token
    if (sessionStorage.getItem('demoMode') === 'true') {
        return 'DEMO_TOKEN';
    }

    try {
        const accounts = msalInstance.getAllAccounts();

        if (accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const request = {
            scopes: loginRequest.scopes,
            account: accounts[0]
        };

        // Try to acquire token silently first
        try {
            const response = await msalInstance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (silentError) {
            // If silent acquisition fails, use popup
            const response = await msalInstance.acquireTokenPopup(request);
            return response.accessToken;
        }
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Check if user is already logged in (on page load)
function checkExistingSession() {
    // Demo mode: auto-login with demo user
    if (typeof DEMO_MODE !== 'undefined' && DEMO_MODE.enabled) {
        const demoUser = getCurrentDemoUser();
        currentUser = {
            name: demoUser.name,
            email: demoUser.email,
            isStaff: demoUser.isStaff,
            account: null
        };
        sessionStorage.setItem('demoMode', 'true');
        onUserLoggedIn();
        return true;
    }

    const storedUser = sessionStorage.getItem('currentUser');

    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);

            // Verify the account still exists in MSAL
            const accounts = msalInstance.getAllAccounts();
            const account = accounts.find(acc => acc.username === currentUser.email);

            if (account) {
                currentUser.account = account;
                onUserLoggedIn();
                return true;
            }
        } catch (error) {
            console.error('Error restoring session:', error);
        }
    }

    return false;
}

// Handle user logged in state
async function onUserLoggedIn() {
    // Hide login page
    document.getElementById('loginPage').classList.add('hidden');

    // Show main app
    document.getElementById('mainApp').classList.remove('hidden');

    // Update user name in header
    document.getElementById('userName').textContent = currentUser.name;

    // Set UI state based on role
    if (currentUser.isStaff) {
        // Staff view
        document.getElementById('adminTab').classList.remove('hidden');
        document.querySelectorAll('.student-only').forEach(el => el.classList.add('hidden'));

        // Default teachers to leaderboard view
        if (typeof switchView === 'function') {
            switchView('leaderboard');
        }
    } else {
        // Student view
        document.getElementById('adminTab').classList.add('hidden');
        document.querySelectorAll('.student-only').forEach(el => el.classList.remove('hidden'));

        // Default students to submit view
        if (typeof switchView === 'function') {
            switchView('submit');
        }
    }

    // Initialize the app
    await initializeApp();
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if current user is staff
function isCurrentUserStaff() {
    return currentUser?.isStaff || false;
}
