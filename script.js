const userRole = sessionStorage.getItem('userRole');
const isAuthenticated = sessionStorage.getItem('isAuthenticated');

if (isAuthenticated !== 'true' || !userRole) {
    window.location.href = 'login.html';
}

let fareData = { 
    base: 15.00, 
    perKm: 2.00,
    extraPax: 5.00 
};

const ADMIN_PIN = "123456";
let loginAttempts = 0;
let map, routingControl;

window.onload = function() {
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    applyRBAC(userRole);
    initMap();
    addLog(`SESSION RESTORED: Authenticated as ${userRole}`);
};

// --- CRYPTOGRAPHIC KEY MANAGEMENT ---

function rotateKeys() {
    const keyIdEl = document.getElementById('key-id');
    const keyDateEl = document.getElementById('key-date');

    if (!confirm("CRITICAL: Rotating the Master Key will trigger a full database re-encryption. Proceed?")) {
        addLog("ADMIN: Key rotation cancelled by user.");
        return;
    }

    addLog("CRYPTO: Initiating Master Key Rotation...", false);
    
    setTimeout(() => {
        addLog("CRYPTO: Re-encrypting sensitive tables (users, fares, audit_logs)...");
        const newId = "K-AES-" + Math.floor(1000 + Math.random() * 8999) + "-R";
        if(keyIdEl) keyIdEl.innerText = newId;
    }, 2000);

    setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        if(keyDateEl) keyDateEl.innerText = today;
        addLog("SUCCESS: Database re-encrypted. Integrity Verified.");
        alert("Key Rotation Successful.");
    }, 3500);
}

// --- SESSION MONITORING & REVOCATION ---

function simulateSessionBreach() {
    addLog("NETWORK: Scanning active session tokens...");
    
    setTimeout(() => {
        const sessionList = document.getElementById('session-list');
        const rogueSessionHTML = `
            <div id="rogue-session" class="session-row" style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #ef4444; display: flex; justify-content: space-between; align-items: center; animation: pulse-red 2s infinite;">
                <div>
                    <div style="font-size: 0.75rem; color: #fff;">User: Unknown_Guest</div>
                    <div style="font-size: 0.65rem; color: #f87171;">IP: 45.128.22.12</div>
                </div>
                <button onclick="revokeSession()" style="background: #ef4444; border: none; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.6rem; cursor: pointer;">REVOKE</button>
            </div>
        `;
        if (sessionList) {
            sessionList.insertAdjacentHTML('beforeend', rogueSessionHTML);
            addLog("SECURITY ALERT: Suspicious session detected from IP 45.128.22.12", true);
        }
    }, 1500);
}

function revokeSession() {
    if(!confirm("Terminate this session and blacklist the IP?")) return;
    const rogue = document.getElementById('rogue-session');
    if(rogue) {
        rogue.style.opacity = '0.5';
        rogue.innerHTML = "<small style='color: #ef4444'>SESSION TERMINATED - IP BLACKLISTED</small>";
        addLog("WAF: IP 45.128.22.12 added to blocklist.");
        setTimeout(() => { rogue.remove(); }, 2000);
    }
}

// --- SECURITY TEST LAB FUNCTIONS (HACKER ROLE ONLY) ---

function triggerScrape() {
    addLog("ATTACK: Initiating Database Scraping...", true);
    const loader = document.getElementById('scrape-loader');
    const bar = document.getElementById('scrape-bar');
    if(loader) loader.classList.remove('hidden');
    if(bar) setTimeout(() => { bar.style.width = '100%'; }, 100);
    setTimeout(() => { window.location.href = 'vault.html'; }, 2100);
}

function accessDatabase() {
    addLog("SYSTEM: Authenticating Admin credentials for Vault access...");
    setTimeout(() => {
        addLog("ACCESS GRANTED: Redirecting to Secure Vault.");
        window.location.href = 'vault.html?mode=admin'; 
    }, 800);
}

function injectSQL() {
    const terminalHTML = `
        <div id="sql-modal" class="modal-overlay">
            <div class="terminal-box">
                <div class="terminal-header">SQL_INJECTION_CONSOLE.exe</div>
                <div class="terminal-body" id="terminal-content"><p>> Initializing malicious payload...</p></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', terminalHTML);

    const content = document.getElementById('terminal-content');
    setTimeout(() => { content.innerHTML += `<p class="danger-line">> [WAF ALERT]: Malicious pattern detected!</p>`; }, 1000);
    setTimeout(() => { document.getElementById('sql-modal').remove(); calculateFare(); }, 3000);
}

function simulateBruteForce() {
    loginAttempts++;
    addLog(`ATTACK: Dictionary attack on 'admin_user'...`, true);
    
    if (loginAttempts >= 3) {
        addLog("WAF: IP Blacklisted due to brute force pattern.", true);
        alert("SECURITY LOCKOUT: Multiple failed attempts.");
        loginAttempts = 0;
    }
}

function bypassMFA() {
    addLog("ATTACK: Attempting MFA token cracking...", true);

    const mfaHTML = `
        <div id="mfa-crack-modal" class="modal-overlay">
            <div class="terminal-box">
                <div class="terminal-header">MFA_BYPASS_TOOL.sh</div>
                <div class="terminal-body" id="mfa-crack-content">
                    <p>> Intercepting Verification Packet...</p>
                    <p>> Testing token: 492${Math.floor(Math.random()*999)}</p>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', mfaHTML);

    const content = document.getElementById('mfa-crack-content');

    setTimeout(() => {
        content.innerHTML += `<p class="danger-line">> [ERR]: HMAC-SHA256 signature mismatch.</p>`;
        content.innerHTML += `<p class="danger-line">> Bypass Failed: Secure Handshake required.</p>`;
        addLog("FAILURE: MFA Integrity Check prevented bypass.", true);
    }, 1500);

    setTimeout(() => {
        const modal = document.getElementById('mfa-crack-modal');
        if(modal) modal.remove();
        alert("Security Alert: MFA bypass unsuccessful.");
    }, 3500);
}

function forceChangeFare() {
    addLog("ATTACK: Intercepting outbound HTTP POST request...", true);

    const tamperHTML = `
        <div id="tamper-modal" class="modal-overlay">
            <div class="terminal-box" style="border-color: #f59e0b;">
                <div class="terminal-header" style="color: #f59e0b;">PACKET_INTERCEPTOR_v4.2</div>
                <div class="terminal-body" id="tamper-content">
                    <p>> Intercepting: POST /api/v1/update-fare</p>
                    <p style="color: #f59e0b;">> Tampering parameters in transit...</p>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', tamperHTML);

    const content = document.getElementById('tamper-content');

    setTimeout(() => {
        content.innerHTML += `<p>> Modified Data: {"base_fare": 1.00}</p>`;
    }, 1200);

    setTimeout(() => {
        content.innerHTML += `<p class="danger-line">> [AUTH_ERROR]: 403 Forbidden - Hash Mismatch.</p>`;
        addLog("FAILURE: Direct database write blocked by Integrity Check.", true);
    }, 2500);

    setTimeout(() => {
        const modal = document.getElementById('tamper-modal');
        if(modal) modal.remove();
        alert("Security Alert: Unauthorized parameter tampering detected.");
    }, 4500);
}

function spoofGPS() {
    addLog("ATTACK: Injecting mock GPS NMEA sentences...", true);

    const gpsHTML = `
        <div id="gps-spoof-modal" class="modal-overlay">
            <div class="terminal-box" style="border-color: #3b82f6;">
                <div class="terminal-header" style="color: #3b82f6;">GPS_SIGNAL_GEN.exe</div>
                <div class="terminal-body" id="gps-spoof-content">
                    <p>> Overriding Satellite Ephemeris...</p>
                    <p>> Injecting $GPRMC sentences...</p>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', gpsHTML);

    const gpsStatus = document.getElementById('gps-status');

    setTimeout(() => {
        if(gpsStatus) {
            gpsStatus.innerText = "GPS: SPOOFED";
            gpsStatus.className = "status-blocked";
        }
        addLog("SECURITY ALERT: Mock location provider detected.", true);
    }, 1800);

    setTimeout(() => {
        const modal = document.getElementById('gps-spoof-modal');
        if(modal) modal.remove();
        alert("GPS Integrity Violation: Mock locations are strictly prohibited.");
    }, 4000);
}

function initMap() {
    const ppcCoords = [9.7392, 118.7353];
    map = L.map('map').setView(ppcCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    routingControl = L.Routing.control({
        waypoints: [L.latLng(9.7420, 118.7360), L.latLng(9.7480, 118.7300)],
        routeWhileDragging: true,
        show: false,
        addWaypoints: true
    }).on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        const distanceKm = (summary.totalDistance / 1000).toFixed(2);
        const distInput = document.getElementById('dist-input');
        if (distInput) distInput.value = distanceKm;
        
        const startInput = document.getElementById('start-input');
        const destInput = document.getElementById('dest-input');

        if (startInput) startInput.value = routes[0].name.split(' to ')[0] || "Rizal Avenue, PPC";
        if (destInput) destInput.value = routes[0].name.split(' to ')[1] || "Bancao-Bancao, PPC";

        calculateFare();
    }).addTo(map);
}

function applyRBAC(role) {
    const adminPanel = document.getElementById('admin-section');
    const hackerPanel = document.getElementById('hacker-panel');
    const adminVaultBtn = document.getElementById('admin-data-btn');

    adminPanel?.classList.add('hidden');
    hackerPanel?.classList.add('hidden');
    adminVaultBtn?.classList.add('hidden');

    if (role === 'Admin') {
        adminPanel?.classList.remove('hidden');
        adminVaultBtn?.classList.remove('hidden');
        addLog("ADMIN SESSION: Management & Vault access granted.");
    } else if (role === 'Hacker') {
        hackerPanel?.classList.remove('hidden');
        addLog("WARNING: Security Testing Environment Active.", true);
    } else {
        addLog("USER SESSION: Read-only calculator access.");
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function addLog(message, isAlert = false) {
    const log = document.getElementById('log-display');
    if (!log) return;
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `<span class="log-entry ${isAlert ? 'log-alert' : ''}">> [${time}] ${message}</span>`;
    log.scrollTop = log.scrollHeight;
}

function calculateFare() {
    const input = document.getElementById('dist-input').value;
    const resultDisplay = document.getElementById('fare-result');

    if (!checkWAF(input)) {
        resultDisplay.innerText = "P0.00";
        return;
    }

    let dist = parseFloat(input);
    let pax = parseInt(document.getElementById('pax-input').value) || 1;
    
    if (isNaN(dist) || dist <= 0) return;

    let total = fareData.base + (dist * fareData.perKm) + ((pax - 1) * fareData.extraPax);
    resultDisplay.innerText = "P" + total.toFixed(2);
    addLog(`FARE LOGIC: P${total.toFixed(2)} generated.`);
}

function checkWAF(input) {
    const maliciousPatterns = ["SELECT", "DROP", "--", "OR 1=1"];
    const found = maliciousPatterns.find(p => input.toString().toUpperCase().includes(p));
    if (found) {
        addLog(`WAF DETECTED: Malicious pattern "${found}" blocked.`, true);
        return false;
    }
    return true;
}

function triggerMFA() {
    if (!document.getElementById('new-base-input').value) return alert("Enter rate first.");
    document.getElementById('mfa-modal').classList.remove('hidden');
}

function verifyAndSave() {
    if (document.getElementById('mfa-pin').value === ADMIN_PIN) {
        fareData.base = parseFloat(document.getElementById('new-base-input').value);
        document.getElementById('current-base').innerText = fareData.base.toFixed(2);
        addLog("INTEGRITY: Fare Matrix updated.");
        closeMFA();
    } else {
        addLog("SECURITY BREACH: Unauthorized PIN attempt.", true);
    }
}

function closeMFA() {
    document.getElementById('mfa-modal').classList.add('hidden');
    document.getElementById('mfa-pin').value = "";
}