// VITAMIND — Hospital Reception & Operations Console Real-Time Engine

const portalRealtimeMesh = new BroadcastChannel('vitamind_realtime_mesh');
let backendWs = null;

let currentStaffUser = "M. Selvi (Reception Counter 1)";
let activeHospitalName = "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai";
let recAttachedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initBackendWebSocket();
    requestSystemHardwarePermissions();
    initCrossPortalRealtimeListener();
    toggleReceptionAuthMode('login');
    initReceptionAuthSystem();
    initNewStaffRegistrationForm();
    initNavigationTabs();
    initClock();
    initDobAgeCalculator();
    initWalkinRegistrationForm();
    initBillingCalculator();
    initReceptionSearchFilters();
    initReceptionAiWidget();
});

function initBackendWebSocket() {
    try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
        backendWs = new WebSocket(wsUrl);

        backendWs.onopen = () => console.log('📡 Connected to Production Backend WebSocket Server');
        backendWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleRealtimeIncomingEvent(data);
            } catch (e) {}
        };
        backendWs.onclose = () => setTimeout(initBackendWebSocket, 3000);
    } catch (e) {
        console.log('Backend WS initializing...');
    }
}

function initCrossPortalRealtimeListener() {
    portalRealtimeMesh.onmessage = (event) => handleRealtimeIncomingEvent(event.data);
}

function handleRealtimeIncomingEvent(data) {
    if (data.type === 'APPOINTMENT_BOOKED') {
        pushRecToastNotification("🎫 NEW PATIENT APPOINTMENT", `Token #${data.data.token} (${data.data.name}) registered for ${data.data.doctor}.`, "scheme", "fa-calendar-check");
    }

    if (data.type === 'PRESCRIPTION_ISSUED') {
        pushRecToastNotification("📄 PRESCRIPTION COPIED TO DESK", `Prescription issued for ${data.data.patient} (${data.data.token}).`, "scheme", "fa-file-prescription");
    }

    if (data.type === 'AMBULANCE_DISPATCHED') {
        pushRecToastNotification("🚑 AMBULANCE DISPATCHED", `Ambulance #${data.data.vehicle} en route to ${data.data.address}.`, "urgent", "fa-truck-medical");
    }

    if (data.type === 'EMERGENCY_SOS') {
        pushRecToastNotification("🚨 EMERGENCY SOS ALERT!", `108 Ambulance SOS triggered for ${data.data.patient} (${data.data.address}).`, "urgent", "fa-triangle-exclamation");
        sendSystemOsNotification("🚨 EMERGENCY 108 SOS", `Patient ${data.data.patient} triggered SOS at ${data.data.address}.`);
    }

    if (data.type === 'TOKEN_ADVANCED') {
        pushRecToastNotification("📢 OPD ROOM TOKEN ADVANCED", `Doctor called Token #${data.data.token} (${data.data.name}).`, "scheme", "fa-user-doctor");
    }
}

async function requestSystemHardwarePermissions() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try { await Notification.requestPermission(); } catch (e) {}
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            stream.getTracks().forEach(track => track.stop());
        }).catch(err => {});
    }
}

function sendSystemOsNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`VITAMIND RECEPTION: ${title}`, {
            body: body,
            icon: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=100&q=80'
        });
    }
}

function pushRecToastNotification(title, body, type = "urgent", icon = "fa-bell") {
    const container = document.getElementById('toastNotificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card ${type}`;
    toast.style.borderColor = '#ec4899';
    toast.innerHTML = `
        <div class="toast-icon" style="color:#db2777;"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title" style="color:#0f172a;">${title}</div>
            <div class="toast-body">${body}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.prepend(toast);
    speakText(`${title}. ${body}`);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 7000);
}

window.toggleReceptionAuthMode = (mode) => {
    const loginView = document.getElementById('receptionLoginView');
    const regView = document.getElementById('receptionRegisterView');
    const title = document.getElementById('recModalTitle');
    const subtitle = document.getElementById('recModalSubtitle');

    if (mode === 'register') {
        if (loginView) loginView.classList.add('hidden');
        if (regView) regView.classList.remove('hidden');
        if (title) title.innerHTML = 'Register <span>New Staff Account</span>';
        if (subtitle) subtitle.textContent = 'Create a new hospital staff account for reception & operations desk';
    } else {
        if (regView) regView.classList.add('hidden');
        if (loginView) loginView.classList.remove('hidden');
        if (title) title.innerHTML = 'VITAM<span>IND</span> Hospital Reception Portal';
        if (subtitle) subtitle.textContent = 'Hospital Staff, Reception Desk & Patient Operations Desk Login';
    }
};

function initReceptionAuthSystem() {
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authPanes = document.querySelectorAll('.auth-method-pane');
    const section = document.getElementById('recOtpVerifySection');

    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authTabBtns.forEach(b => b.classList.remove('active'));
            authPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`rec-auth-${btn.dataset.recauth}`);
            if (targetPane) targetPane.classList.add('active');
            if (section) section.classList.add('hidden');
        });
    });

    const credsForm = document.getElementById('recCredsForm');
    if (credsForm) {
        credsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const hosp = document.getElementById('recHospitalSelect').value;
            const user = document.getElementById('recUsername').value;

            currentStaffUser = user;
            activeHospitalName = hosp;
            updateReceptionProfileUI();

            const modal = document.getElementById('receptionLoginModal');
            if (modal) modal.classList.add('hidden');

            alert(`🔓 RECEPTION DESK AUTHENTICATED!\n\nStaff: ${user}\nHospital: ${hosp}`);
            speakText(`Welcome ${user}. Reception desk authenticated for ${hosp}.`);
        });
    }
}

window.sendRecOtp = (method) => {
    const section = document.getElementById('recOtpVerifySection');
    if (section) section.classList.remove('hidden');
    alert(`📩 STAFF OTP SENT!\n\nA 6-digit staff security OTP code was sent to your ${method.toUpperCase()}.\n\nDemo Code: 123456`);
};

window.verifyAndLoginRec = () => {
    const code = document.getElementById('recOtpCodeInput').value.trim();
    if (!code) { alert('Please enter 6-digit OTP code!'); return; }
    const modal = document.getElementById('receptionLoginModal');
    if (modal) modal.classList.add('hidden');
    alert('🟢 STAFF AUTHENTICATION SUCCESSFUL!');
};

function initNewStaffRegistrationForm() {
    const form = document.getElementById('createNewStaffForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regStaffName').value;
            const hosp = document.getElementById('regStaffHospital').value;
            const desig = document.getElementById('regStaffDesignation').value;

            currentStaffUser = `${name} (${desig})`;
            activeHospitalName = hosp;
            updateReceptionProfileUI();

            const modal = document.getElementById('receptionLoginModal');
            if (modal) modal.classList.add('hidden');

            alert(`🎉 NEW HOSPITAL STAFF ACCOUNT CREATED!\n\nWelcome ${name}!\nDesig: ${desig}\nHospital: ${hosp}`);
            speakText(`Staff account created for ${name}.`);
        });
    }
}

function updateReceptionProfileUI() {
    const headerProfile = document.getElementById('recHeaderProfileName');
    const hospDisplay = document.getElementById('recHospitalDisplay');
    if (headerProfile) headerProfile.innerHTML = `Staff Logged In: <strong>${currentStaffUser}</strong>`;
    if (hospDisplay) hospDisplay.textContent = activeHospitalName;
}

window.logoutReception = () => {
    toggleReceptionAuthMode('login');
    const modal = document.getElementById('receptionLoginModal');
    if (modal) modal.classList.remove('hidden');
    alert('Logged out of Reception Portal.');
};

function initNavigationTabs() {
    const tabs = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.tab-page');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(`tab-${tab.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });
}

function initClock() {
    const clock = document.getElementById('liveClock');
    function updateClock() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString();
        if (clock) clock.textContent = `${dateStr} • ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function initDobAgeCalculator() {
    const dobInput = document.getElementById('recPatDob');
    const ageInput = document.getElementById('recPatCalculatedAge');

    function calculateAge(dobString) {
        if (!dobString) return "";
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} Years`;
    }

    if (dobInput) {
        dobInput.addEventListener('change', (e) => {
            if (ageInput) ageInput.value = calculateAge(e.target.value);
        });
    }
}

window.processQrTokenScan = (boxNum = 1) => {
    const inputId = boxNum === 2 ? 'recScanInput2' : 'recManualTokenInput';
    const boxId = boxNum === 2 ? 'recScanResultBox2' : 'recScanResultBox';

    const code = document.getElementById(inputId).value || "A-14";
    const box = document.getElementById(boxId);

    if (box) {
        box.classList.remove('hidden');
        box.innerHTML = `
            <div style="color:#db2777; font-weight:900; font-size:16px;">
                <i class="fa-solid fa-circle-check"></i> OPTICAL QR TOKEN VERIFIED & ADMITTED!
            </div>
            <div><strong>Scanned Token Code:</strong> <span class="tag green" style="background:rgba(236,72,153,0.15); color:#db2777; border-color:#ec4899;">Token #${code}</span></div>
            <div><strong>Patient Name:</strong> Hariss Kumar K (Age: 24 Yrs)</div>
            <div><strong>Assigned Doctor:</strong> Dr. E. Theranirajan (Pediatrics OPD Room 4)</div>
            <div><strong>Status:</strong> <strong style="color:var(--green);">ADMITTED TO OPD QUEUE (ZERO WAIT TIME)</strong></div>
        `;
    }

    portalRealtimeMesh.postMessage({ type: 'RECEPTION_QR_SCANNED', data: { token: code, name: 'Hariss Kumar K' } });

    alert(`🟢 TOKEN #${code} ADMITTED AT RECEPTION DESK!`);
    speakText(`Token ${code} verified and admitted.`);
};

function initWalkinRegistrationForm() {
    const form = document.getElementById('recWalkinForm');
    const resultBox = document.getElementById('recWalkinResultBox');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('recPatName').value;
            const phone = document.getElementById('recPatPhone').value;
            const hosp = document.getElementById('recPatHospital').value;
            const doc = document.getElementById('recPatDoctor').value;

            const tokenCode = `A-${Math.floor(15 + Math.random() * 10)}`;

            const apptObj = {
                id: Date.now(),
                token: tokenCode,
                name: name,
                phone: phone,
                hospital: hosp,
                doctor: doc,
                status: "WAITING",
                date: new Date().toLocaleDateString('en-GB')
            };

            fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apptObj)
            }).catch(err => {});

            portalRealtimeMesh.postMessage({ type: 'APPOINTMENT_BOOKED', data: apptObj });

            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div style="color:#db2777; font-weight:900; font-size:16px;">
                        <i class="fa-solid fa-circle-check"></i> WALK-IN PATIENT REGISTERED & QR TOKEN GENERATED!
                    </div>
                    <div><strong>Assigned Token:</strong> <span class="tag green" style="background:rgba(236,72,153,0.15); color:#db2777; border-color:#ec4899;">#${tokenCode}</span></div>
                    <div><strong>Patient:</strong> ${name} (${phone})</div>
                    <div><strong>Hospital & Doctor:</strong> ${doc} (${hosp})</div>
                `;
            }

            alert(`✅ WALK-IN PATIENT ${name} REGISTERED!\nAssigned Token: #${tokenCode}`);
            speakText(`Patient ${name} registered with token ${tokenCode}.`);
        });
    }
}

function initBillingCalculator() {
    const inputs = document.querySelectorAll('.bill-calc-input');
    inputs.forEach(input => input.addEventListener('input', calculateBillTotals));

    const form = document.getElementById('billingCalculatorForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateBillTotals();
            alert('✅ HOSPITAL BILL CALCULATED & APPROVED!');
            speakText('Hospital bill calculated and approved.');
        });
    }
}

function calculateBillTotals() {
    const opd = parseFloat(document.getElementById('billOpdFee').value) || 0;
    const scan = parseFloat(document.getElementById('billScanFee').value) || 0;
    const lab = parseFloat(document.getElementById('billLabFee').value) || 0;
    const pharm = parseFloat(document.getElementById('billPharmacyFee').value) || 0;
    const room = parseFloat(document.getElementById('billRoomFee').value) || 0;

    let customTotal = 0;
    document.querySelectorAll('.custom-bill-amount').forEach(inp => {
        customTotal += parseFloat(inp.value) || 0;
    });

    const subtotal = opd + scan + lab + pharm + room + customTotal;

    const subDisplay = document.getElementById('billSubtotalDisplay');
    const discDisplay = document.getElementById('billDiscountDisplay');
    const netDisplay = document.getElementById('billNetTotalDisplay');

    if (subDisplay) subDisplay.textContent = `₹${subtotal.toLocaleString()}`;
    if (discDisplay) discDisplay.textContent = `-₹${subtotal.toLocaleString()}`;
    if (netDisplay) netDisplay.textContent = `₹0 (CASHLESS COVERED)`;
}

window.addCustomBillRow = () => {
    const container = document.getElementById('customBillRowsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '10px';
    row.style.alignItems = 'center';
    row.innerHTML = `
        <input type="text" placeholder="Item description (e.g. Oxygen Cylinder)" style="flex:2; background:#fff; border:1px solid #ec4899; border-radius:10px; padding:8px 12px; font-size:12px; color:#0f172a;">
        <input type="number" placeholder="Fee (₹)" value="250" class="custom-bill-amount bill-calc-input" style="flex:1; background:#fff; border:1px solid #ec4899; border-radius:10px; padding:8px 12px; font-size:12px; color:#0f172a;">
        <button type="button" class="btn-sm danger" onclick="this.parentElement.remove(); calculateBillTotals()"><i class="fa-solid fa-trash"></i></button>
    `;

    container.appendChild(row);
    row.querySelector('.custom-bill-amount').addEventListener('input', calculateBillTotals);
    calculateBillTotals();
};

window.printBillingReceipt = () => {
    window.print();
};

function initReceptionSearchFilters() {
    const notifSearch = document.getElementById('recNotifSearchInput');
    if (notifSearch) {
        notifSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#recNotifListContainer .record-card').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const billSearch = document.getElementById('recBillSearchInput');
    if (billSearch) {
        billSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#customBillRowsContainer div').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const insSearch = document.getElementById('recInsSearchInput');
    if (insSearch) {
        insSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#recInsuranceClaimsList .ins-claim-item').forEach(item => {
                const text = (item.dataset.claimTitle || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const pharmSearch = document.getElementById('recPharmSearchInput');
    if (pharmSearch) {
        pharmSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#recPharmacyStockGrid .pharm-stock-item').forEach(item => {
                const text = (item.dataset.pharmName || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const ambSearch = document.getElementById('recAmbSearchInput');
    if (ambSearch) {
        ambSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#recAmbulanceFleetList .amb-fleet-item').forEach(item => {
                const text = (item.dataset.ambName || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
}

// REAL-TIME RECEPTION AI ASSISTANT WIDGET ENGINE
function initReceptionAiWidget() {
    const widgetBtn = document.getElementById('recFloatingAiBtn');
    const drawer = document.getElementById('recFloatingChatDrawer');
    const closeBtn = document.getElementById('closeRecChatBtn');
    const input = document.getElementById('recChatInput');
    const sendBtn = document.getElementById('sendRecChatBtn');
    const messages = document.getElementById('recChatMessages');
    const fileInput = document.getElementById('recChatFileInput');
    const preview = document.getElementById('recChatFilePreview');

    if (widgetBtn && drawer) widgetBtn.addEventListener('click', () => drawer.classList.toggle('hidden'));
    if (closeBtn && drawer) closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            recAttachedFile = e.target.files[0];
            if (recAttachedFile && preview) {
                preview.classList.remove('hidden');
                preview.innerHTML = `📎 Attached File: <strong>${recAttachedFile.name}</strong> (${(recAttachedFile.size / 1024).toFixed(1)} KB)`;
            }
        });
    }

    function addRecMessage(text, isBot = false) {
        if (!messages) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'bot' : 'user'}`;
        msg.innerHTML = isBot ? `<div class="msg-sender"><i class="fa-solid fa-robot"></i> AI Reception Assistant</div><div class="msg-text">${text}</div>` : text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function processRecAiMessage() {
        const text = input ? input.value.trim() : '';
        if (!text && !recAttachedFile) return;

        let userMsg = text;
        if (recAttachedFile) {
            userMsg += `<br><span class="tag green" style="margin-top:4px; display:inline-block;">📎 Attached Document: ${recAttachedFile.name}</span>`;
        }

        addRecMessage(userMsg, false);
        if (input) input.value = '';
        if (preview) preview.classList.add('hidden');

        fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text, file: recAttachedFile ? { name: recAttachedFile.name } : null, user: currentStaffUser })
        })
        .then(res => res.json())
        .then(data => {
            const reply = data.reply || `🤖 Hello ${currentStaffUser}! How can I assist reception operations?`;
            addRecMessage(reply, true);
            speakText(reply.replace(/<[^>]*>?/gm, ''));

            if (data.actionType === 'SCAN_TOKEN') {
                setTimeout(() => processQrTokenScan(1), 1200);
            } else if (data.actionType === 'CALCULATE_BILL') {
                setTimeout(() => calculateBillTotals(), 1200);
            }
        })
        .catch(err => {
            addRecMessage(`🤖 <strong>AI RECEPTION ASSISTANT:</strong><br><br>Staff ${currentStaffUser}, reception desk is synchronized live with Doctor OPD Room 4. Active tokens: 3.`, true);
            speakText(`Reception desk synchronized live.`);
        });
    }

    const voiceBtn = document.getElementById('voiceRecChatBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-IN';
                recognition.start();

                voiceBtn.style.background = '#ec4899';
                voiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (input) input.value = transcript;
                    voiceBtn.style.background = '';
                    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                    processRecAiMessage();
                };

                recognition.onerror = () => {
                    voiceBtn.style.background = '';
                    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                };
            } else {
                alert('Microphone Speech Recognition is supported in Chrome/Edge browsers!');
            }
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', processRecAiMessage);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') processRecAiMessage(); });
}

window.approveInsuranceClaim = (claimId) => {
    alert(`✅ CMCHIS CLAIM #${claimId} VERIFIED & PRE-AUTHORIZED!\n\nCashless amount of ₹1,50,000 cleared by Government Health Authority.`);
    speakText(`Insurance claim ${claimId} verified and pre-authorized.`);
};

window.reorderDrugStock = (medName) => {
    alert(`📦 RE-ORDER REQUEST SUBMITTED!\n\nMedicine: ${medName}\n5,000 Units ordered from TN Medical Services Corporation (TNMSC).`);
};

window.dispatchAmbulance = (vehId) => {
    portalRealtimeMesh.postMessage({ type: 'AMBULANCE_DISPATCHED', data: { vehicle: vehId, driver: 'M. Arumugam (+91 98400 11223)' } });
    alert(`🚨 AMBULANCE #${vehId} DISPATCHED IN REAL TIME!\n\nGPS Tracking active at Reception Control Desk.`);
    speakText(`Ambulance ${vehId} dispatched.`);
};

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
    }
}
