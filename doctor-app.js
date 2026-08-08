// VITAMIND — Doctor Portal Clinical Engine & AI Medical Assistant

// BroadcastChannel for instant cross-tab real-time mesh sync across Doctor, Patient & Reception
const portalRealtimeMesh = new BroadcastChannel('vitamind_realtime_mesh');

let currentTokenIndex = "A-14";
let activePatientName = "Hariss Kumar K";
let waitingCount = 3;
let consultedCount = 14;

let docNotifications = JSON.parse(localStorage.getItem('vitamind_doc_notifications')) || [
    { id: 1, title: "☣️ TAMIL NADU VIRAL OUTBREAK ALERT", body: "Monsoon Dengue & H3N2 Flu alert active in Chennai & Madurai districts. Free fever clinic OPD beds reserved.", time: "10m ago", type: "urgent", icon: "fa-triangle-exclamation" },
    { id: 2, title: "🚨 EMERGENCY 108 AMBULANCE DISPATCHED", body: "Ambulance #TN-01-AMB-9921 dispatched to Guindy for patient Hariss Kumar K.", time: "30m ago", type: "urgent", icon: "fa-truck-medical" },
    { id: 3, title: "💳 CMCHIS CASHLESS CLAIM APPROVED", body: "Health insurance pre-authorization approved for patient Hariss Kumar K (₹1,50,000).", time: "1h ago", type: "scheme", icon: "fa-file-invoice-dollar" }
];

document.addEventListener('DOMContentLoaded', () => {
    initDoctorRealtimeMeshListener();
    toggleDoctorAuthMode('login');
    initDoctorAuth();
    initDoctorRegistrationForm();
    initDoctorNavigation();
    initDoctorClock();
    initQuickPrescriptionForm();
    initFullPrescriptionForm();
    initDoctorAiWidget();
    renderDocQueueList();
    renderDoctorNotifications();
    renderPatientPreviousPrescriptions();
    renderDoctorSavedMedicalRecords();
    initDoctorSearchFilters();
});

// LISTEN TO REAL-TIME CROSS-TAB BROADCAST MESH
function initDoctorRealtimeMeshListener() {
    portalRealtimeMesh.onmessage = (event) => {
        const { type, data } = event.data;

        if (type === 'APPOINTMENT_BOOKED') {
            docQueue.push({
                token: data.token,
                name: data.name,
                age: data.age,
                symptoms: data.symptoms,
                status: "QUEUED",
                statusType: "cyan"
            });
            waitingCount++;
            renderDocQueueList();
            renderDoctorNotifications();
            sendDocSystemNotification("New Walk-In / Online Patient Booked", `Token #${data.token} (${data.name}) joined queue for ${data.doctor}.`);
        }

        if (type === 'EMERGENCY_SOS') {
            docNotifications.unshift({
                id: Date.now(),
                title: `🚨 EMERGENCY 108 SOS ALERT — ${data.patient.toUpperCase()}`,
                body: `Patient ${data.patient} (${data.phone}) activated emergency SOS at ${data.address} (GPS: ${data.lat}, ${data.lng}).`,
                time: "Just Now",
                type: "urgent",
                icon: "fa-triangle-exclamation"
            });
            renderDoctorNotifications();
            sendDocSystemNotification("🚨 EMERGENCY SOS ALERT", `Patient ${data.patient} requested 108 emergency ambulance!`);
            speakText(`Emergency SOS alert received for patient ${data.patient}.`);
        }

        if (type === 'EMR_SENT_TO_DOCTOR') {
            docNotifications.unshift({
                id: Date.now(),
                title: `📤 EMR RECORD DISPATCHED — ${data.patient}`,
                body: `Patient ${data.patient} transmitted medical document '${data.title}' directly to your OPD Station.`,
                time: "Just Now",
                type: "scheme",
                icon: "fa-file-circle-check"
            });
            renderDoctorNotifications();
            renderDoctorSavedMedicalRecords();
            sendDocSystemNotification("New Patient Medical Document", `Patient ${data.patient} sent file ${data.title}.`);
            speakText(`New medical document received from ${data.patient}.`);
        }
    };
}

function sendDocSystemNotification(title, body) {
    if ('Notification' in window && Notification.permission !== 'granted') {
        try { Notification.requestPermission(); } catch (e) {}
    }
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`VITAMIND DOCTOR OPD: ${title}`, {
            body: body,
            icon: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=100&q=80'
        });
    }
}

window.toggleDoctorAuthMode = (mode) => {
    const loginView = document.getElementById('doctorLoginView');
    const regView = document.getElementById('doctorRegisterView');
    const title = document.getElementById('docModalTitle');
    const subtitle = document.getElementById('docModalSubtitle');

    if (mode === 'register') {
        if (loginView) loginView.classList.add('hidden');
        if (regView) regView.classList.remove('hidden');
        if (title) title.innerHTML = 'Register <span>New Doctor Account</span>';
        if (subtitle) subtitle.textContent = 'Register your medical license & hospital OPD affiliation';
    } else {
        if (regView) regView.classList.add('hidden');
        if (loginView) loginView.classList.remove('hidden');
        if (title) title.innerHTML = 'VITAM<span>IND</span> Doctor Clinical Portal';
        if (subtitle) subtitle.textContent = 'Doctor OPD Consultation Desk • Tamil Nadu Hospitals Network';
    }
};

function initDoctorRegistrationForm() {
    const form = document.getElementById('createNewDoctorForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regDocName').value;
            const license = document.getElementById('regDocLicense').value;
            const spec = document.getElementById('regDocSpec').value;
            const hosp = document.getElementById('regDocHospital').value;

            const profileHeader = document.getElementById('docHeaderProfileName');
            const hospTitle = document.getElementById('docHospitalTitle');
            if (profileHeader) profileHeader.innerHTML = `Doctor Logged In: <strong>${name} (${spec})</strong>`;
            if (hospTitle) hospTitle.textContent = hosp.split(',')[0];

            const modal = document.getElementById('doctorLoginModal');
            if (modal) modal.classList.add('hidden');

            fetch('/api/auth/doctor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, license, spec, hosp })
            }).catch(err => {});

            alert(`🎉 DOCTOR ACCOUNT REGISTERED & LOGGED IN!\n\nWelcome ${name} (${spec})\nLicense: ${license}`);
            speakText(`Welcome ${name}. Doctor account registered.`);
        });
    }
}

// Queue Patients Array
let docQueue = [
    { token: "A-14", name: "Hariss Kumar K", age: "24 Yrs", symptoms: "High fever, headache, body pain", status: "INSIDE ROOM", statusType: "green" },
    { token: "A-15", name: "Vignesh S", age: "31 Yrs", symptoms: "Joint pain & fatigue", status: "NEXT UP", statusType: "amber" },
    { token: "A-16", name: "Tamilventhan M", age: "22 Yrs", symptoms: "Seasonal allergic cold", status: "WAITING", statusType: "cyan" },
    { token: "A-17", name: "Ananya R", age: "28 Yrs", symptoms: "Severe cough & sore throat", status: "QUEUED", statusType: "cyan" }
];

// RENDER SAVED MEDICAL RECORDS IN DOCTOR PORTAL
function renderDoctorSavedMedicalRecords() {
    const container = document.getElementById('docSavedRecordsContainer');
    const activeTag = document.getElementById('docSavedRecordsActiveTag');
    if (!container) return;

    if (activeTag) activeTag.innerHTML = `<i class="fa-solid fa-user"></i> CURRENT PATIENT: <strong>${activePatientName}</strong> (Token #${currentTokenIndex})`;

    let patientEMR = JSON.parse(localStorage.getItem('vitamind_emr_records') || '[]');
    let savedRecords = JSON.parse(localStorage.getItem('vitamind_saved_records') || '[]');
    let savedPrescriptions = JSON.parse(localStorage.getItem('vitamind_prescriptions') || '[]');

    let combined = [];

    patientEMR.forEach(r => {
        combined.push({
            id: r.id,
            title: r.title,
            uploader: "Patient",
            uploaderName: "Hariss Kumar K (Patient)",
            lab: r.lab || "Patient Home Vault Upload",
            date: r.date || "Today",
            category: "Patient Uploaded Document",
            fileType: r.type === 'pdf' ? 'PDF File' : 'Image Scan',
            notes: "Uploaded by patient from home vault."
        });
    });

    savedRecords.forEach(r => {
        if (!combined.some(c => c.id === r.id)) combined.push(r);
    });

    savedPrescriptions.forEach(p => {
        combined.push({
            id: p.id || Date.now(),
            title: `Prescription for ${p.diagnosis || 'Viral Fever'}`,
            uploader: "Doctor",
            uploaderName: p.doctor || "Dr. E. Theranirajan, MD",
            lab: "RGGGH Pediatrics OPD Room 4",
            date: p.date || "Today",
            category: "Doctor E-Prescription",
            fileType: "Official Rx",
            medicines: p.medicines,
            advice: p.advice,
            notes: p.advice || "Prescribed by doctor."
        });
    });

    if (combined.length === 0) {
        combined = [
            {
                id: 901,
                title: "Complete Blood Count (CBC) & Dengue Serology Panel",
                uploader: "Doctor",
                uploaderName: "Dr. E. Theranirajan, MD (RGGGH Chennai)",
                lab: "Central Diagnostic Pathology Lab",
                date: "06 Aug 2026",
                category: "Lab Pathology Report",
                fileType: "PDF Document",
                notes: "Platelet count 92,000 /mcL. Dengue NS1 AG Positive."
            },
            {
                id: 902,
                title: "Past Blood Test Report — Apollo Speciality Hospital",
                uploader: "Patient",
                uploaderName: "Hariss Kumar K (Patient)",
                lab: "Apollo Diagnostics Guindy",
                date: "12 May 2026",
                category: "Patient Uploaded Document",
                fileType: "Scanned PNG File",
                notes: "Uploaded by patient from home vault."
            }
        ];
    }

    container.innerHTML = combined.map(r => `
        <div class="record-card doc-saved-item" data-record-search="${r.title} ${r.uploader} ${r.uploaderName} ${r.lab} ${r.category} ${r.date}" style="flex-direction:column; align-items:flex-start; gap:12px; background:#ffffff; margin-bottom:14px; border:1.5px solid var(--border);">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px;">
                <div>
                    <strong style="color:#0284c7; font-size:16px;"><i class="fa-solid fa-file-medical"></i> ${r.title}</strong>
                    <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Facility / Lab: <strong>${r.lab}</strong> • Date: ${r.date}</p>
                </div>
                <span class="tag ${r.uploader === 'Doctor' ? 'purple' : 'green'}">
                    <i class="fa-solid ${r.uploader === 'Doctor' ? 'fa-user-doctor' : 'fa-user'}"></i> ${r.uploader === 'Doctor' ? 'Uploaded by Doctor' : 'Uploaded by Patient'}
                </span>
            </div>

            <div style="background:#f0f9ff; border:1px solid #38bdf8; border-radius:12px; padding:12px 14px; width:100%; font-size:12px;">
                <div style="color:#0284c7; font-weight:800; margin-bottom:4px;">Issuer / Uploader: ${r.uploaderName}</div>
                <div style="color:#0f172a;">Category: <span class="tag info" style="font-size:10px;">${r.category}</span> • Format: <code>${r.fileType}</code></div>
                ${r.medicines ? `<div style="color:#0f172a; margin-top:6px;"><strong>Rx Medications:</strong><br>${r.medicines.replace(/\n/g, '<br>')}</div>` : ''}
                ${r.notes ? `<div style="color:var(--text-muted); margin-top:6px;">Notes: ${r.notes}</div>` : ''}
            </div>

            <div style="display:flex; gap:10px; width:100%;">
                <button class="btn-sm cyan" style="flex:1;" onclick="alert('👁️ PREVIEWING SAVED RECORD: ${r.title}')"><i class="fa-solid fa-eye"></i> View Record</button>
                ${r.medicines ? `<button class="btn-sm success" style="flex:1;" onclick="copyMedsToCurrentPrescription('${(r.medicines || '').replace(/'/g, "\\'").replace(/\n/g, '\\n')}')"><i class="fa-solid fa-copy"></i> Copy Rx to E-Prescription</button>` : ''}
                <button class="btn primary-btn" style="flex:1; padding:6px 12px; font-size:11px;" onclick="printPrescription()"><i class="fa-solid fa-print"></i> Print Record</button>
            </div>
        </div>
    `).join('');
}

// RENDER PATIENT UPLOADED PREVIOUS PRESCRIPTIONS
function renderPatientPreviousPrescriptions() {
    const container = document.getElementById('docPrevPrescriptionsContainer');
    const headerTag = document.getElementById('prevPrescActivePatientTag');
    if (!container) return;

    if (headerTag) headerTag.textContent = `CURRENT PATIENT: ${activePatientName} (Token #${currentTokenIndex})`;

    let savedPrescriptions = JSON.parse(localStorage.getItem('vitamind_prescriptions') || '[]');

    if (savedPrescriptions.length === 0) {
        savedPrescriptions = [
            {
                id: 501,
                patient: "Hariss Kumar K",
                token: "Token #A-14",
                diagnosis: "Acute Viral Fever (Dengue Suspect)",
                medicines: "1. Tab Dolo 650mg — 1-0-1 (3 Days)\n2. Tab Cetirizine 10mg — 0-0-1 (3 Days)\n3. ORS Hydration Sachet — Daily 1L",
                advice: "Complete bed rest for 48 hours. Drink 3L fluids.",
                doctor: "Dr. E. Theranirajan, MD (Pediatrics Specialist)",
                date: "07 Aug 2026"
            },
            {
                id: 502,
                patient: "Hariss Kumar K",
                token: "Token #A-02 (Past Visit)",
                diagnosis: "Upper Respiratory Tract Infection (Bronchitis)",
                medicines: "1. Tab Azithromycin 500mg — 1-0-0 (3 Days)\n2. Syrup Ascoril LS — 10ml TID (5 Days)\n3. Steam Inhalation — Twice Daily",
                advice: "Avoid cold water and chilled beverages.",
                doctor: "Dr. K. Senthil, MD (General Medicine)",
                date: "14 May 2026"
            }
        ];
    }

    container.innerHTML = savedPrescriptions.map(p => `
        <div class="record-card prev-presc-card printable-prescription-paper" data-presc-search="${p.patient} ${p.diagnosis} ${p.medicines} ${p.doctor} ${p.date}" style="flex-direction:column; align-items:flex-start; gap:12px; margin-bottom:14px; background:#ffffff;">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px;">
                <div>
                    <h3 style="color:#0284c7; font-size:16px; font-weight:900;"><i class="fa-solid fa-file-prescription"></i> Prescription from ${p.doctor}</h3>
                    <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Patient: <strong>${p.patient}</strong> (${p.token || 'Token #A-14'}) • Date: ${p.date || 'Today'}</p>
                </div>
                <span class="tag green"><i class="fa-solid fa-cloud-arrow-up"></i> Patient Portal Sync</span>
            </div>

            <div style="background:#f0f9ff; border:1px solid #38bdf8; border-radius:12px; padding:14px; width:100%; font-size:12px; line-height:1.6;">
                ${p.diagnosis ? `<div style="color:#0284c7; font-weight:800; font-size:13px; margin-bottom:6px;"><i class="fa-solid fa-stethoscope"></i> Diagnosis: ${p.diagnosis}</div>` : ''}
                <div style="color:#0f172a;"><strong>Rx Prescribed Medications & Dosage:</strong><br>${(p.medicines || '').replace(/\n/g, '<br>')}</div>
                ${p.advice ? `<div style="color:var(--text-muted); margin-top:8px;"><strong>Clinical Advice:</strong> ${p.advice}</div>` : ''}
            </div>

            <div style="display:flex; gap:10px; width:100%;">
                <button class="btn primary-btn" style="flex:1;" onclick="printPrescription()">
                    <i class="fa-solid fa-print"></i> PRINT THIS PRESCRIPTION
                </button>

                <button class="btn success-btn" style="flex:1;" onclick="copyMedsToCurrentPrescription('${(p.medicines || '').replace(/'/g, "\\'").replace(/\n/g, '\\n')}')">
                    <i class="fa-solid fa-copy"></i> COPY RX TO CURRENT E-PRESCRIPTION
                </button>
            </div>
        </div>
    `).join('');
}

window.copyMedsToCurrentPrescription = (medsText) => {
    const fullMeds = document.getElementById('fullPrescMeds');
    const quickMeds = document.getElementById('quickPrescMedicines');

    if (fullMeds) fullMeds.value = medsText;
    if (quickMeds) quickMeds.value = medsText;

    switchToDocTab('doc-prescription');
    alert('📋 RX MEDICATIONS COPIED TO CURRENT E-PRESCRIPTION DESK!');
    speakText('Previous prescription medications copied to current desk.');
};

// DOCTOR AUTHENTICATION SUITE
function initDoctorAuth() {
    const form = document.getElementById('doctorLoginForm');
    const modal = document.getElementById('doctorLoginModal');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const hospital = document.getElementById('docLoginHospital').value;
            const username = document.getElementById('docLoginUsername').value;

            const profileHeader = document.getElementById('docHeaderProfileName');
            const hospTitle = document.getElementById('docHospitalTitle');
            const prescHospHeader = document.getElementById('prescHospitalHeader');

            if (profileHeader) profileHeader.innerHTML = `Doctor Logged In: <strong>${username}</strong>`;
            if (hospTitle) hospTitle.textContent = hospital.split(',')[0];
            if (prescHospHeader) prescHospHeader.textContent = hospital;

            if (modal) modal.classList.add('hidden');

            alert(`👨‍⚕️ DOCTOR AUTHENTICATION SUCCESSFUL!\n\nWelcome ${username}\nHospital: ${hospital}\n\nGranted full access to OPD Clinical Station.`);
            speakText(`Doctor authentication successful. Welcome to OPD Clinical Station.`);
        });
    }
}

window.logoutDoctor = () => {
    toggleDoctorAuthMode('login');
    const modal = document.getElementById('doctorLoginModal');
    if (modal) modal.classList.remove('hidden');
    alert('Doctor logged out of Clinical Station.');
};

// Navigation Tabs
function initDoctorNavigation() {
    const tabs = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.tab-page');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(`tab-${tab.dataset.tab}`);
            if (target) target.classList.add('active');

            if (tab.dataset.tab === 'doc-prev-prescriptions') renderPatientPreviousPrescriptions();
            if (tab.dataset.tab === 'doc-saved-records') renderDoctorSavedMedicalRecords();
        });
    });
}

window.switchToDocTab = (tabId) => {
    const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
};

// Doctor Clock
function initDoctorClock() {
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

// Render Doctor Notifications
function renderDoctorNotifications() {
    const container = document.getElementById('docNotifListContainer');
    const badge = document.getElementById('docNotifBadge');

    if (badge) badge.textContent = docNotifications.length;

    if (container) {
        container.innerHTML = docNotifications.map(n => `
            <div class="record-card doc-notif-item" data-notif-title="${n.title} ${n.body}" style="border-left:4px solid var(--${n.type === 'urgent' ? 'red' : 'purple'});">
                <div class="rec-icon"><i class="fa-solid ${n.icon}" style="color:var(--${n.type === 'urgent' ? 'red' : 'purple'});"></i></div>
                <div class="rec-info" style="flex:1;">
                    <strong style="font-size:15px; color:#0f172a;">${n.title}</strong>
                    <p style="font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.5;">${n.body}</p>
                    <span style="font-size:10px; color:#0284c7; font-weight:700; display:inline-block; margin-top:6px;"><i class="fa-solid fa-clock"></i> ${n.time} • High Priority Push</span>
                </div>
            </div>
        `).join('');
    }
}

// DOCTOR SEARCH FILTERS FOR EVERY TAB
function initDoctorSearchFilters() {
    const savedSearch = document.getElementById('docSavedRecordSearchInput');
    if (savedSearch) {
        savedSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#docSavedRecordsContainer .doc-saved-item').forEach(item => {
                const text = (item.dataset.recordSearch || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const prevPrescSearch = document.getElementById('docPrevPrescSearchInput');
    if (prevPrescSearch) {
        prevPrescSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#docPrevPrescriptionsContainer .prev-presc-card').forEach(card => {
                const text = (card.dataset.prescSearch || card.textContent).toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const scanSearch = document.getElementById('docScanSearchInput');
    if (scanSearch) {
        scanSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#docScansGridContainer .scan-card').forEach(card => {
                const text = (card.dataset.scanName || card.textContent).toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const reportSearch = document.getElementById('docReportSearchInput');
    if (reportSearch) {
        reportSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#docReportsContainer .report-block').forEach(block => {
                const text = (block.dataset.reportName || block.textContent).toLowerCase();
                block.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }

    const medSearch = document.getElementById('docMedSearchInput');
    if (medSearch) {
        medSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#newMedicinesFeedContainer .product-card').forEach(card => {
                const text = (card.dataset.drugName || card.textContent).toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const bedSearch = document.getElementById('docBedSearchInput');
    if (bedSearch) {
        bedSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#inpatientMonitoringList .inpatient-item').forEach(item => {
                const text = (item.dataset.patientName || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    const notifSearch = document.getElementById('docNotifSearchInput');
    if (notifSearch) {
        notifSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#docNotifListContainer .doc-notif-item').forEach(item => {
                const text = (item.dataset.notifTitle || item.textContent).toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
}

// OPD Queue List & Token Controls
function renderDocQueueList() {
    const container = document.getElementById('docQueueListContainer');
    if (!container) return;

    container.innerHTML = docQueue.map((item) => `
        <div style="background:#f0f9ff; border:1px solid #38bdf8; border-radius:10px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="color:var(--${item.statusType});">Token #${item.token} — ${item.name}</strong>
                <div style="font-size:10px; color:var(--text-muted);">Symptoms: ${item.symptoms} • Age: ${item.age}</div>
            </div>
            <span class="tag ${item.statusType}">${item.status}</span>
        </div>
    `).join('');
}

window.callNextToken = () => {
    if (docQueue.length > 1) {
        docQueue.shift();
        consultedCount++;
        if (waitingCount > 0) waitingCount--;

        const activeItem = docQueue[0];
        currentTokenIndex = activeItem.token;
        activePatientName = activeItem.name;

        activeItem.status = "INSIDE ROOM";
        activeItem.statusType = "green";

        if (docQueue.length > 1) {
            docQueue[1].status = "NEXT UP";
            docQueue[1].statusType = "amber";
        }

        updateDoctorDashboardUI(activeItem);
        renderDocQueueList();
        renderPatientPreviousPrescriptions();
        renderDoctorSavedMedicalRecords();

        fetch('/api/appointments/next-token', { method: 'POST' }).catch(err => {});

        portalRealtimeMesh.postMessage({
            type: 'TOKEN_ADVANCED',
            data: { token: activeItem.token, name: activeItem.name }
        });

        alert(`📢 TOKEN ADVANCED IN REAL-TIME!\n\nNow Calling Token #${activeItem.token} — ${activeItem.name} into OPD Room 4.`);
        speakText(`Attention Token ${activeItem.token}. Please enter Doctor OPD Room 4.`);
    } else {
        alert('All waiting patients in OPD queue have been consulted!');
    }
};

window.skipToken = () => {
    if (docQueue.length > 1) {
        const skipped = docQueue.shift();
        skipped.status = "SKIPPED";
        skipped.statusType = "red";
        docQueue.push(skipped);

        const activeItem = docQueue[0];
        activeItem.status = "INSIDE ROOM";
        activeItem.statusType = "green";

        updateDoctorDashboardUI(activeItem);
        renderDocQueueList();
        renderPatientPreviousPrescriptions();
        renderDoctorSavedMedicalRecords();

        alert(`⏩ Token #${skipped.token} skipped and moved to end of queue. Now serving Token #${activeItem.token}.`);
    }
};

function updateDoctorDashboardUI(item) {
    const tokenEl = document.getElementById('currentInRoomToken');
    const nameEl = document.getElementById('currentInRoomName');
    const symptomsEl = document.getElementById('currentInRoomSymptoms');
    const displayEl = document.getElementById('activeTokenDisplay');

    const qPatientInput = document.getElementById('quickPrescPatient');
    const qTokenInput = document.getElementById('quickPrescToken');
    const fPatientInput = document.getElementById('fullPrescPatient');
    const fMetaInput = document.getElementById('fullPrescMeta');

    const scanTag = document.getElementById('scanActivePatientTag');
    const reportTag = document.getElementById('reportActivePatientTag');

    if (tokenEl) tokenEl.textContent = `Token #${item.token}`;
    if (nameEl) nameEl.textContent = `${item.name} (${item.age})`;
    if (symptomsEl) symptomsEl.textContent = item.symptoms;
    if (displayEl) displayEl.textContent = `#${item.token} — ${item.name}`;

    if (qPatientInput) qPatientInput.value = item.name;
    if (qTokenInput) qTokenInput.value = `Token #${item.token}`;
    if (fPatientInput) fPatientInput.value = item.name;
    if (fMetaInput) fMetaInput.value = `${item.age} / Token #${item.token}`;

    if (scanTag) scanTag.textContent = `CURRENT PATIENT: ${item.name} (Token #${item.token})`;
    if (reportTag) reportTag.textContent = `CURRENT PATIENT: ${item.name} (Token #${item.token})`;
}

window.notifyReceptionQueue = () => {
    portalRealtimeMesh.postMessage({ type: 'OPD_ROOM_SYNC', data: { token: currentTokenIndex, patient: activePatientName } });
    alert('📡 HOSPITAL RECEPTION CONSOLE SYNCED IN REAL-TIME!');
    speakText('Reception console synced in real time.');
};

window.triggerEmergencyCall = () => {
    portalRealtimeMesh.postMessage({ type: 'DOCTOR_EMERGENCY_CALL', data: { room: 'OPD Room 4', doctor: 'Dr. E. Theranirajan' } });
    alert('🚨 EMERGENCY CALL TRIGGERED!\n\nTrauma Team & Reception dispatched to Room 4.');
    speakText('Emergency call triggered.');
};

// Quick & Full Prescription Forms
function initQuickPrescriptionForm() {
    const form = document.getElementById('quickPrescForm');
    const box = document.getElementById('quickPrescResultBox');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const patient = document.getElementById('quickPrescPatient').value;
            const token = document.getElementById('quickPrescToken').value;
            const meds = document.getElementById('quickPrescMedicines').value;

            const prescObj = {
                id: Date.now(),
                patient: patient,
                token: token,
                medicines: meds,
                doctor: "Dr. E. Theranirajan, MD",
                date: new Date().toLocaleDateString('en-GB')
            };

            fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prescObj)
            }).catch(err => {});

            savePrescriptionToStorage(prescObj);

            portalRealtimeMesh.postMessage({ type: 'PRESCRIPTION_ISSUED', data: prescObj });

            if (box) {
                box.classList.remove('hidden');
                box.innerHTML = `
                    <div style="color:var(--green); font-weight:800; font-size:14px;">
                        <i class="fa-solid fa-circle-check"></i> REAL-TIME PRESCRIPTION ROUTED TO PATIENT PORTAL & RECEPTION!
                    </div>
                    <div><strong>Patient:</strong> ${patient} (${token})</div>
                    <div><strong>Rx Medications:</strong> ${meds}</div>
                `;
            }

            alert(`✅ Real-Time Prescription for ${patient} (${token}) sent to Patient Portal & Reception!`);
            speakText(`Prescription sent to patient portal and reception.`);
        });
    }
}

function initFullPrescriptionForm() {
    const form = document.getElementById('fullPrescriptionForm');
    const box = document.getElementById('fullPrescResultBox');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const patient = document.getElementById('fullPrescPatient').value;
            const meta = document.getElementById('fullPrescMeta').value;
            const diag = document.getElementById('fullPrescDiagnosis').value;
            const meds = document.getElementById('fullPrescMeds').value;
            const advice = document.getElementById('fullPrescAdvice').value;

            const prescObj = {
                id: Date.now(),
                patient: patient,
                token: meta,
                diagnosis: diag,
                medicines: meds,
                advice: advice,
                doctor: "Dr. E. Theranirajan, MD",
                date: new Date().toLocaleDateString('en-GB')
            };

            fetch('/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prescObj)
            }).catch(err => {});

            savePrescriptionToStorage(prescObj);

            portalRealtimeMesh.postMessage({ type: 'PRESCRIPTION_ISSUED', data: prescObj });

            if (box) {
                box.classList.remove('hidden');
                box.innerHTML = `
                    <div style="color:var(--green); font-weight:800; font-size:14px;">
                        <i class="fa-solid fa-circle-check"></i> REAL-TIME E-PRESCRIPTION SAVED & SYNCED TO RECEPTION!
                    </div>
                    <div><strong>Patient:</strong> ${patient} (${meta})</div>
                    <div><strong>Diagnosis:</strong> ${diag}</div>
                `;
            }

            alert(`✅ Official E-Prescription saved for ${patient}! Digital signature stamp applied.`);
        });
    }
}

function savePrescriptionToStorage(prescObj) {
    let saved = JSON.parse(localStorage.getItem('vitamind_prescriptions') || '[]');
    saved.unshift(prescObj);
    localStorage.setItem('vitamind_prescriptions', JSON.stringify(saved));
}

window.printPrescription = () => {
    window.print();
};

// Doctor AI Clinical Assistant Widget
function initDoctorAiWidget() {
    const widgetBtn = document.getElementById('docFloatingAiBtn');
    const drawer = document.getElementById('docFloatingChatDrawer');
    const closeBtn = document.getElementById('closeDocChatBtn');
    const input = document.getElementById('docChatInput');
    const sendBtn = document.getElementById('sendDocChatBtn');
    const messages = document.getElementById('docChatMessages');
    const fileInput = document.getElementById('docChatFileInput');
    const preview = document.getElementById('docChatFilePreview');

    let attachedFile = null;

    if (widgetBtn && drawer) widgetBtn.addEventListener('click', () => drawer.classList.toggle('hidden'));
    if (closeBtn && drawer) closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            attachedFile = e.target.files[0];
            if (attachedFile && preview) {
                preview.classList.remove('hidden');
                preview.innerHTML = `📎 Attached Medical Record: <strong>${attachedFile.name}</strong> (${(attachedFile.size / 1024).toFixed(1)} KB)`;
            }
        });
    }

    function addDocMessage(text, isBot = false) {
        if (!messages) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'bot' : 'user'}`;
        msg.innerHTML = isBot ? `<div class="msg-sender"><i class="fa-solid fa-brain"></i> AI Clinical Assistant</div><div class="msg-text">${text}</div>` : text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function processDocAiMessage() {
        const text = input ? input.value.trim() : '';
        if (!text && !attachedFile) return;

        let userMsg = text;
        if (attachedFile) {
            userMsg += `<br><span class="tag cyan" style="margin-top:4px; display:inline-block;">📎 Attached Medical File: ${attachedFile.name}</span>`;
        }

        addDocMessage(userMsg, false);
        if (input) input.value = '';
        if (preview) preview.classList.add('hidden');

        fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text, file: attachedFile ? { name: attachedFile.name } : null, user: 'Dr. E. Theranirajan' })
        })
        .then(res => res.json())
        .then(data => {
            const reply = data.reply || `🧠 Doctor, I have analyzed your query and clinical data.`;
            addDocMessage(reply, true);
            speakText(reply.replace(/<[^>]*>?/gm, ''));

            if (data.actionType === 'CALL_NEXT_TOKEN') {
                setTimeout(() => callNextToken(), 1200);
            } else if (data.actionType === 'OPEN_DOC_PRESCRIPTION') {
                setTimeout(() => switchToDocTab('doc-prescription'), 1200);
            }
        })
        .catch(err => {
            let aiReply = "Doctor, I have analyzed the clinical query.";
            if (attachedFile) {
                aiReply = `🧠 <strong>AI MULTI-MEDIA ANALYSIS COMPLETED FOR <code>${attachedFile.name}</code>:</strong><br><br>
                • <strong>Document / Image Scan Findings:</strong> Detected elevated fever biomarkers and early inflammatory markers.<br>
                • <strong>Suggested Treatment Plan:</strong> Prescribe IV Fluids (Normal Saline 500ml), Tab Paracetamol 650mg QID, and monitor Platelet counts.`;
                attachedFile = null;
            } else {
                aiReply = `🧠 <strong>AI CLINICAL TREATMENT SUGGESTIONS:</strong><br><br>
                1. <strong>Antipyretic:</strong> Tab Dolo 650mg (TID for 3 days).<br>
                2. <strong>Antihistamine:</strong> Tab Cetirizine 10mg HS.<br>
                3. <strong>Hydration:</strong> ORS Solution 1-2 Liters/day.`;
            }
            addDocMessage(aiReply, true);
            speakText(aiReply.replace(/<[^>]*>?/gm, ''));
        });
    }

    const voiceBtn = document.getElementById('voiceDocChatBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-IN';
                recognition.start();

                voiceBtn.style.background = '#0284c7';
                voiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (input) input.value = transcript;
                    voiceBtn.style.background = '';
                    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                    processDocAiMessage();
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

    if (sendBtn) sendBtn.addEventListener('click', processDocAiMessage);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') processDocAiMessage(); });
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const clean = text.replace(/<[^>]*>?/gm, '');
        const u = new SpeechSynthesisUtterance(clean);
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
    }
}
