const USERS = {
    "admin": { pass: "admin123", role: "Admin" },
    "driver": { pass: "driver123", role: "Driver" },
    "passenger": { pass: "pax123", role: "Passenger" },
    "hacker": { pass: "pentest", role: "Hacker" }
};

const MASTER_MFA_TOKEN = "888888"; // Fixed token for your demo
let pendingRole = "";

function handleLogin(event) {
    if (event) event.preventDefault();
    
    // Grab elements
    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');
    const roleEl = document.getElementById('role-select');
    
    const user = userEl.value.toLowerCase().trim();
    const pass = passEl.value;
    const selectedRole = roleEl.value;

    // Check credentials against the USERS object
    if (USERS[user] && USERS[user].pass === pass && USERS[user].role === selectedRole) {
        
        // --- ADMIN ONLY MFA LOGIC ---
        if (selectedRole === "Admin") {
            pendingRole = selectedRole;
            const mfaModal = document.getElementById('mfa-modal');
            if (mfaModal) {
                mfaModal.classList.remove('hidden');
                setTimeout(() => document.getElementById('mfa-pin').focus(), 100);
            }
        } 
        // --- DIRECT LOGIN FOR OTHER ROLES ---
        else {
            sessionStorage.setItem('userRole', selectedRole);
            sessionStorage.setItem('isAuthenticated', 'true');
            window.location.href = 'index.html';
        }

    } else {
        showError();
    }
}

function verifyMFA() {
    const mfaInput = document.getElementById('mfa-pin');
    const enteredPin = mfaInput.value.trim();
    
    if (enteredPin === MASTER_MFA_TOKEN) {
        // Set session data for Admin
        sessionStorage.setItem('userRole', "Admin");
        sessionStorage.setItem('isAuthenticated', 'true');
        
        // Redirect to dashboard
        window.location.href = 'index.html';
    } else {
        alert("Security Token Invalid. Please try again.");
        mfaInput.value = "";
        mfaInput.focus();
    }
}

function closeMFA() {
    document.getElementById('mfa-modal').classList.add('hidden');
    document.getElementById('mfa-pin').value = "";
    pendingRole = "";
}

function showError() {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) errorMsg.classList.remove('hidden');
    
    document.querySelectorAll('input, select').forEach(el => {
        el.style.borderColor = 'var(--danger)';
    });
}

// Reset styles when user interacts with ANY field
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', () => {
        const errorMsg = document.getElementById('error-message');
        if (errorMsg) errorMsg.classList.add('hidden');
        
        document.querySelectorAll('input, select').forEach(el => {
            el.style.borderColor = 'var(--border)';
        });
    });
});