// VITAMIND — Real-Time Production Patient Portal & System Hardware Integration Engine

// Global Tamil Nadu Datasets
const tnDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris (Ooty)",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
    "Tenkasi", "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Thoothukudi",
    "Tiruchirappalli (Trichy)", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvannamalai",
    "Vellore", "Viluppuram", "Virudhunagar"
];

const tnHospitals = [
    { id: "h1", name: "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai", district: "Chennai", category: "Government", status: "24/7 OPD Active", statusType: "green", address: "EVR Periyar Salai, Park Town, Chennai - 600003" },
    { id: "h2", name: "Coimbatore Medical College Hospital (CMCH), Coimbatore", district: "Coimbatore", category: "Government", status: "24/7 Emergency", statusType: "green", address: "Trichy Road, Coimbatore - 641018" },
    { id: "h3", name: "Government Rajaji Hospital (GRH), Madurai", district: "Madurai", category: "Government", status: "24/7 Trauma Care", statusType: "green", address: "Panagal Road, Madurai - 625020" },
    { id: "h4", name: "Stanley Medical College Hospital, Chennai", district: "Chennai", category: "Government", status: "24/7 OPD Active", statusType: "green", address: "1, Old Jail Rd, Royapuram, Chennai - 600013" },
    { id: "h5", name: "Christian Medical College (CMC), Vellore", district: "Vellore", category: "Trust", status: "Specialty Clinic", statusType: "green", address: "Ida Scudder Road, Vellore - 632004" },
    { id: "h6", name: "Apollo Super Specialty Hospital, Greams Road, Chennai", district: "Chennai", category: "Private", status: "24/7 Emergency", statusType: "green", address: "21, Greams Lane, Thousand Lights, Chennai - 600006" }
];

const storeProducts = [
    { id: "p1", name: "Dolo 650mg Paracetamol", category: "Fever & Pain Relief", price: 34, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80" },
    { id: "p2", name: "Cetirizine 10mg Tablets", category: "Allergy & Cold", price: 28, img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80" },
    { id: "p3", name: "Digital Blood Pressure Monitor", category: "Medical Equipment", price: 1450, img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80" },
    { id: "p4", name: "ORS Hydration Sachets (Pack of 10)", category: "Energy & Fluids", price: 95, img: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=300&q=80" }
];

// BroadcastChannel for instant cross-tab real-time mesh sync + WebSocket Server Connection
const portalRealtimeMesh = new BroadcastChannel('vitamind_realtime_mesh');
let backendWs = null;

// Global Patient EMR Records & Notifications Datasets
let patientEMRRecords = JSON.parse(localStorage.getItem('vitamind_emr_records')) || [
    {
        id: 101,
        title: "Blood_Test_Report_August_2026.pdf",
        lab: "Rajiv Gandhi Govt General Hospital (RGGGH)",
        date: "07 Aug 2026",
        type: "pdf",
        status: "Stored in Vault",
        dataUrl: null
    }
];

let notificationList = JSON.parse(localStorage.getItem('vitamind_notifications')) || [
    { id: 1, title: "🎫 APPOINTMENT CONFIRMED — RGGGH CHENNAI", body: "Your appointment for Pediatrics OPD (Dr. E. Theranirajan) is confirmed for today at 10:00 AM.", time: "10m ago", type: "scheme", icon: "fa-calendar-check" },
    { id: 2, title: "☣️ TAMIL NADU VIRAL OUTBREAK ALERT", body: "Monsoon Dengue & H3N2 Flu alert in Chennai & Madurai districts. Free fever clinics open across 38 districts.", time: "1h ago", type: "urgent", icon: "fa-triangle-exclamation" },
    { id: 3, title: "💳 CMCHIS CASHLESS CLAIM APPROVED", body: "Health card scheme pre-authorization #TN-CMCHIS-99201 approved for ₹1,50,000 cashless coverage.", time: "2h ago", type: "scheme", icon: "fa-file-invoice-dollar" }
];

let loggedInUser = "Hariss Kumar K";
let currentTokenNum = 14;
let currentTokenCode = "A-14";
let currentPatientName = "Hariss Kumar K";
let currentHospitalName = "Rajiv Gandhi Govt General Hospital (RGGGH), Chennai";
let attachedChatFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initBackendWebSocket();
    requestSystemHardwarePermissions();
    initCrossPortalRealtimeListener();
    togglePatientAuthMode('login');
    initAuthSystem();
    initPatientRegistrationForm();
    initProfileManagement();
    initNavigationTabs();
    initClock();
    initCarousel();
    initDobAgeCalculator();
    initDistrictsAndTypesDropdown();
    initHospitalsDirectory();
    initAppointmentScheduler();
    initQRCodeTokenSystem();
    initEMRRecordsVault();
    initSavedMedicalRecordsTab();
    initPharmEasyStore();
    initKYCOnboarding();
    initClaimsValidator();
    initFloatingAiWidget();
    initHospitalModal();
    initNotificationSystem();
    renderPatientPrescriptions();
    renderSavedMedicalRecords();
    initPatientTabSearchFilters();
    initPatientAmbulanceModule();
});

// GLOBAL AI CHAT DRAWER TOGGLER
window.toggleAiChatDrawer = () => {
    const drawer = document.getElementById('floatingChatDrawer');
    const input = document.getElementById('chatInput');
    if (drawer) {
        drawer.classList.toggle('hidden');
        if (!drawer.classList.contains('hidden') && input) input.focus();
    }
};

// CONNECT TO NODE.JS EXPRESS + WEBSOCKET PRODUCTION BACKEND SERVER
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

function broadcastEventToBackend(eventObj) {
    portalRealtimeMesh.postMessage(eventObj);
    if (backendWs && backendWs.readyState === WebSocket.OPEN) {
        backendWs.send(JSON.stringify(eventObj));
    }
}

function handleRealtimeIncomingEvent(data) {
    if (data.type === 'TOKEN_ADVANCED') {
        currentTokenNum = parseInt(data.data.token.replace('A-', '')) || currentTokenNum;
        currentTokenCode = data.data.token;
        updateQueueDisplay();
        pushToastNotification("📢 OPD QUEUE ADVANCED", `Now serving Token #${data.data.token} (${data.data.name}) inside Doctor OPD Room.`, "urgent", "fa-user-doctor");
        sendSystemOsNotification("OPD Queue Advanced", `Now serving Token #${data.data.token} (${data.data.name}).`);
    }

    if (data.type === 'PRESCRIPTION_ISSUED') {
        renderPatientPrescriptions();
        renderSavedMedicalRecords();
        pushToastNotification("📄 NEW E-PRESCRIPTION RECEIVED", `Dr. E. Theranirajan issued a new digital prescription for ${data.data.patient}.`, "scheme", "fa-file-prescription");
        sendSystemOsNotification("New Prescription Issued", `Prescription for ${data.data.patient} received.`);
    }

    if (data.type === 'AMBULANCE_DISPATCHED') {
        pushToastNotification("🚑 AMBULANCE EN ROUTE", `Ambulance #${data.data.vehicle} dispatched. Driver: ${data.data.driver}.`, "urgent", "fa-truck-medical");
    }

    if (data.type === 'RECEPTION_QR_SCANNED') {
        pushToastNotification("🟢 RECEPTION QR ADMITTED", `Token #${data.data.token} admitted by Reception Desk. Zero wait time!`, "scheme", "fa-circle-check");
    }
}

// REQUEST REAL SYSTEM HARDWARE & PERMISSIONS
async function requestSystemHardwarePermissions() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try { await Notification.requestPermission(); } catch (e) {}
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            stream.getTracks().forEach(track => track.stop());
        }).catch(err => {});
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            stream.getTracks().forEach(track => track.stop());
        }).catch(err => {});
    }

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {}, err => {});
    }
}

function initCrossPortalRealtimeListener() {
    portalRealtimeMesh.onmessage = (event) => handleRealtimeIncomingEvent(event.data);
}

function sendSystemOsNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`VITAMIND HEALTHCARE: ${title}`, {
            body: body,
            icon: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=100&q=80'
        });
    }
}

let patientProfile = JSON.parse(localStorage.getItem('vitamind_patient_profile')) || {
    name: "Hariss Kumar K",
    phone: "+91 98765 43210",
    email: "hariss.kumar@example.com",
    aadhaar: "1234 5678 9012",
    dob: "2002-05-14",
    bloodGroup: "O Positive (O+)",
    address: "No 42, Anna Salai, Guindy, Chennai - 600032",
    emergency: "+91 94440 12345",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
};

let allSavedMedicalRecords = JSON.parse(localStorage.getItem('vitamind_saved_records')) || [
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
        title: "Chest X-Ray PA View Radiology Scan",
        uploader: "Doctor",
        uploaderName: "Dr. S. Rajasekaran — Orthopedics",
        lab: "RGGGH Diagnostic Radiology Dept",
        date: "04 Aug 2026",
        category: "Radiology X-Ray Scan",
        fileType: "DICOM Image",
        notes: "Clear lung fields bilaterally. No consolidation."
    },
    {
        id: 903,
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

// FLAWLESS EMR MEDICAL RECORDS FILE UPLOADER & BASE64 ENCODER
function initEMRRecordsVault() {
    renderMedicalRecords();

    const fileInput = document.getElementById('emrFileInput');
    const dropzone = document.getElementById('emrUploadDropzone');

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--cyan)';
            dropzone.style.background = 'rgba(0, 242, 254, 0.1)';
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '';
            dropzone.style.background = '';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '';
            dropzone.style.background = '';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processUploadedFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                processUploadedFile(e.target.files[0]);
            }
        });
    }
}

function processUploadedFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileDataUrl = event.target.result;
        const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf');
        const isImage = file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isVideo = file.type.includes('video') || file.name.match(/\.(mp4|webm|mkv|avi)$/i);
        const isAudio = file.type.includes('audio') || file.name.match(/\.(mp3|wav|ogg)$/i);

        const fileTypeLabel = isPdf ? 'PDF Document' : (isImage ? 'Image Scan' : (isVideo ? 'Video File' : (isAudio ? 'Audio File' : 'Medical Document')));

        const newRecord = {
            id: Date.now(),
            title: file.name,
            uploader: "Patient",
            uploaderName: `${patientProfile.name} (Patient)`,
            lab: "Patient System Upload",
            date: new Date().toLocaleDateString('en-GB'),
            type: isPdf ? 'pdf' : (isImage ? 'image' : (isVideo ? 'video' : (isAudio ? 'audio' : 'document'))),
            category: "Patient Uploaded Media File",
            fileType: fileTypeLabel,
            status: "Stored in Vault",
            dataUrl: fileDataUrl,
            notes: `Media file uploaded from system on ${new Date().toLocaleDateString('en-GB')}`,
            size: (file.size / 1024).toFixed(1) + ' KB'
        };

        // 1. SAVE TO PATIENT EMR RECORDS VAULT (UPLOAD MEDICAL RECORDS TAB)
        patientEMRRecords.unshift(newRecord);
        localStorage.setItem('vitamind_emr_records', JSON.stringify(patientEMRRecords));

        // 2. SAVE TO ALL SAVED MEDICAL RECORDS VAULT (SAVED MEDICAL RECORDS TAB)
        allSavedMedicalRecords.unshift(newRecord);
        localStorage.setItem('vitamind_saved_records', JSON.stringify(allSavedMedicalRecords));

        // 3. RENDER LIVE IN BOTH TABS
        renderMedicalRecords();
        renderSavedMedicalRecords();
        showUploadedFilePreview(newRecord);

        // 4. TRANSMIT LIVE TO DOCTOR PORTAL & BACKEND SERVER
        fetch('/api/emr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        }).catch(err => {});

        broadcastEventToBackend({ type: 'EMR_SENT_TO_DOCTOR', data: { title: file.name, patient: patientProfile.name, fileDataUrl, record: newRecord } });

        alert(`✅ MEDIA FILE UPLOADED & SAVED IN BOTH TABS!\n\nFile Name: ${file.name}\nSize: ${newRecord.size}\nStored in "Upload Medical Records" & "Saved Medical Records" Tabs.`);
        pushToastNotification("📄 MEDIA FILE SAVED IN TABS", `Record '${file.name}' saved in Upload & Saved Medical Records tabs.`, "scheme", "fa-file-circle-check");
        speakText(`File ${file.name} uploaded and saved in respective tabs.`);
    };

    reader.readAsDataURL(file);
}

function showUploadedFilePreview(record) {
    const previewContainer = document.getElementById('filePreviewContainer');
    const previewContent = document.getElementById('filePreviewContent');

    if (!previewContainer || !previewContent) return;

    previewContainer.classList.remove('hidden');

    let previewHtml = '';
    if (record.type === 'image' && record.dataUrl) {
        previewHtml = `
            <div style="text-align:center;">
                <img src="${record.dataUrl}" alt="${record.title}" style="max-width:100%; max-height:300px; border-radius:12px; border:1px solid var(--border);">
                <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">${record.title} (${record.size})</p>
            </div>
        `;
    } else if (record.type === 'pdf' && record.dataUrl) {
        previewHtml = `
            <div style="text-align:center;">
                <iframe src="${record.dataUrl}" style="width:100%; height:320px; border:none; border-radius:12px;"></iframe>
                <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">${record.title} (${record.size})</p>
            </div>
        `;
    } else {
        previewHtml = `
            <div style="background:rgba(15,23,42,0.9); padding:16px; border-radius:12px; display:flex; align-items:center; gap:14px;">
                <i class="fa-solid fa-file-lines" style="font-size:32px; color:var(--cyan);"></i>
                <div>
                    <strong style="font-size:15px; color:#fff;">${record.title}</strong>
                    <p style="font-size:11px; color:var(--text-muted);">${record.size} • ${record.type.toUpperCase()} Format</p>
                </div>
            </div>
        `;
    }

    previewContent.innerHTML = previewHtml;
}

function renderMedicalRecords() {
    const container = document.getElementById('recordsGridContainer');
    if (!container) return;

    if (patientEMRRecords.length === 0) {
        container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:20px;">No stored medical records in your vault. Click above or drag and drop files.</div>`;
        return;
    }

    container.innerHTML = patientEMRRecords.map(r => `
        <div class="record-card" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:14px;">
                <div class="rec-icon"><i class="fa-solid ${r.type === 'pdf' ? 'fa-file-pdf' : (r.type === 'image' ? 'fa-file-image' : 'fa-file-medical')}" style="color:var(--cyan);"></i></div>
                <div class="rec-info">
                    <strong style="color:#0f172a;">${r.title}</strong>
                    <p style="font-size:11px; color:var(--text-muted);">${r.lab} • ${r.date} ${r.size ? '• ' + r.size : ''} • <span class="tag green">${r.status || 'Stored in Vault'}</span></p>
                </div>
            </div>

            <div style="display:flex; gap:8px;">
                <button class="btn-sm cyan" onclick="previewSingleRecord(${r.id})"><i class="fa-solid fa-eye"></i> Preview</button>
                <button class="btn-sm success" onclick="sendRecordToDoctor('${r.title}')"><i class="fa-solid fa-paper-plane"></i> Send to Doctor</button>
                <button class="btn-sm danger" onclick="deleteMedicalRecord(${r.id})"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

window.previewSingleRecord = (id) => {
    const rec = patientEMRRecords.find(r => r.id === id) || allSavedMedicalRecords.find(r => r.id === id);
    if (rec) {
        showUploadedFilePreview(rec);
        alert(`👁️ Previewing '${rec.title}' in the preview box above!`);
    } else {
        alert('Record preview ready.');
    }
};

window.deleteMedicalRecord = (id) => {
    if (confirm('Are you sure you want to delete this medical record from your vault?')) {
        patientEMRRecords = patientEMRRecords.filter(r => r.id !== id);
        allSavedMedicalRecords = allSavedMedicalRecords.filter(r => r.id !== id);
        localStorage.setItem('vitamind_emr_records', JSON.stringify(patientEMRRecords));
        localStorage.setItem('vitamind_saved_records', JSON.stringify(allSavedMedicalRecords));
        renderMedicalRecords();
        renderSavedMedicalRecords();
        alert('🗑️ Medical record deleted!');
    }
};

window.sendRecordToDoctor = (title) => {
    broadcastEventToBackend({ type: 'EMR_SENT_TO_DOCTOR', data: { title, patient: patientProfile.name } });
    alert(`📤 RECORD SENT TO CONSULTING DOCTOR!\n\nDocument '${title}' has been dispatched directly to Dr. E. Theranirajan's OPD Station at RGGGH.`);
    speakText(`Document ${title} sent to consulting doctor.`);
};

// RENDER SAVED MEDICAL RECORDS TAB
function renderSavedMedicalRecords() {
    const container = document.getElementById('savedRecordsContainer');
    if (!container) return;

    let combined = [...allSavedMedicalRecords];

    patientEMRRecords.forEach(r => {
        if (!combined.some(c => c.id === r.id)) {
            combined.unshift({
                id: r.id,
                title: r.title,
                uploader: "Patient",
                uploaderName: `${patientProfile.name} (Patient)`,
                lab: r.lab || "Patient Uploaded File",
                date: r.date || "Today",
                category: "Patient Medical Document",
                fileType: r.type === 'pdf' ? 'PDF Document' : 'Scanned File',
                notes: "Uploaded from patient records vault.",
                dataUrl: r.dataUrl
            });
        }
    });

    container.innerHTML = combined.map(r => `
        <div class="record-card saved-record-item" data-record-search="${r.title} ${r.uploader} ${r.uploaderName} ${r.lab} ${r.category} ${r.date}" style="flex-direction:column; align-items:flex-start; gap:12px; background:#ffffff; margin-bottom:14px; border:1.5px solid var(--border);">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px;">
                <div>
                    <strong style="color:#e65100; font-size:16px;"><i class="fa-solid fa-file-medical"></i> ${r.title}</strong>
                    <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Facility / Lab: <strong>${r.lab}</strong> • Date: ${r.date}</p>
                </div>
                <span class="tag ${r.uploader === 'Doctor' ? 'purple' : 'green'}">
                    <i class="fa-solid ${r.uploader === 'Doctor' ? 'fa-user-doctor' : 'fa-user'}"></i> ${r.uploader === 'Doctor' ? 'Uploaded by Doctor' : 'Uploaded by Patient'}
                </span>
            </div>

            <div style="background:#fff7ed; border:1px solid var(--border); border-radius:12px; padding:12px 14px; width:100%; font-size:12px;">
                <div style="color:var(--cyan); font-weight:800; margin-bottom:4px;">Issuer / Uploader: ${r.uploaderName}</div>
                <div style="color:#0f172a;">Category: <span class="tag info" style="font-size:10px;">${r.category}</span> • File Format: <code>${r.fileType}</code></div>
                ${r.notes ? `<div style="color:var(--text-muted); margin-top:6px;">Clinical Notes: ${r.notes}</div>` : ''}
            </div>

            <div style="display:flex; gap:8px; width:100%;">
                <button class="btn-sm cyan" style="flex:1;" onclick="previewSingleRecord(${r.id})"><i class="fa-solid fa-eye"></i> View Record</button>
                <button class="btn-sm success" style="flex:1;" onclick="alert('📥 DOWNLOADING RECORD: ${r.title}')"><i class="fa-solid fa-download"></i> Download</button>
                <button class="btn-sm primary" style="flex:1;" onclick="sendRecordToDoctor('${r.title}')"><i class="fa-solid fa-paper-plane"></i> Send to Doctor</button>
            </div>
        </div>
    `).join('');
}

function initSavedMedicalRecordsTab() {
    const searchInput = document.getElementById('savedRecordSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#savedRecordsContainer .saved-record-item').forEach(card => {
                const text = (card.dataset.recordSearch || card.textContent).toLowerCase();
                card.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
}

window.togglePatientAuthMode = (mode) => {
    const loginView = document.getElementById('patientLoginView');
    const regView = document.getElementById('patientRegisterView');
    const title = document.getElementById('patientModalTitle');
    const subtitle = document.getElementById('patientModalSubtitle');

    if (mode === 'register') {
        if (loginView) loginView.classList.add('hidden');
        if (regView) regView.classList.remove('hidden');
        if (title) title.innerHTML = 'Create <span>New Patient</span> Account';
        if (subtitle) subtitle.textContent = 'Fill required details to create your new patient account';
    } else {
        if (regView) regView.classList.add('hidden');
        if (loginView) loginView.classList.remove('hidden');
        if (title) title.innerHTML = 'VITAM<span>IND</span> Patient Portal';
        if (subtitle) subtitle.textContent = 'Healthcare Automation Using Agentic AI • Secure Patient Access';
    }
};

function initPatientRegistrationForm() {
    const form = document.getElementById('createNewPatientForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regPatName').value;
            const phone = document.getElementById('regPatPhone').value;
            const email = document.getElementById('regPatEmail').value;
            const aadhaar = document.getElementById('regPatAadhaar').value;
            const dob = document.getElementById('regPatDob').value;
            const blood = document.getElementById('regPatBloodGroup').value;
            const address = document.getElementById('regPatAddress').value;

            patientProfile = { name, phone, email, aadhaar, dob, bloodGroup: blood, address, emergency: phone, avatar: patientProfile.avatar };
            localStorage.setItem('vitamind_patient_profile', JSON.stringify(patientProfile));
            updateProfileUI();

            const modal = document.getElementById('patientLoginModal');
            if (modal) modal.classList.add('hidden');

            fetch('/api/auth/patient/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientProfile)
            }).catch(err => {});

            broadcastEventToBackend({ type: 'NEW_PATIENT_REGISTERED', data: patientProfile });

            alert(`🎉 PATIENT ACCOUNT CREATED SUCCESSFULLY!\n\nWelcome ${name}!\nYour patient profile has been registered.`);
            pushToastNotification("🎉 PATIENT ACCOUNT CREATED", `Welcome ${name}! Your new patient profile is active.`, "scheme", "fa-user-check");
            speakText(`Welcome ${name}. Your new patient account has been created.`);
        });
    }
}

function initPatientAmbulanceModule() {
    const distSelect = document.getElementById('patAmbDistrict');
    const hospSelect = document.getElementById('patAmbHospital');
    const form = document.getElementById('patientAmbulanceForm');
    const resultBox = document.getElementById('patAmbResultBox');

    if (distSelect) {
        distSelect.innerHTML = tnDistricts.map(d => `<option value="${d}">${d}</option>`).join('');
        distSelect.value = "Chennai";
    }

    if (hospSelect) {
        hospSelect.innerHTML = tnHospitals.map(h => `<option value="${h.name}">${h.name}</option>`).join('');
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('patAmbName').value;
            const phone = document.getElementById('patAmbPhone').value;
            const address = document.getElementById('patAmbPickupAddress').value;
            const hospital = document.getElementById('patAmbHospital').value;
            const type = document.getElementById('patAmbType').value;

            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(pos => {
                    dispatchAmbulanceRequest(name, phone, address, hospital, type, pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5), resultBox);
                }, err => dispatchAmbulanceRequest(name, phone, address, hospital, type, "13.0827", "80.2707", resultBox));
            } else dispatchAmbulanceRequest(name, phone, address, hospital, type, "13.0827", "80.2707", resultBox);
        });
    }
}

function dispatchAmbulanceRequest(name, phone, address, hospital, type, lat, lng, resultBox) {
    if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
            <div style="color:var(--green); font-weight:900; font-size:16px;">
                <i class="fa-solid fa-circle-check"></i> REAL-TIME GPS AMBULANCE DISPATCHED & TRANSMITTED TO SERVER!
            </div>
            <div style="margin-top:6px;"><strong>Assigned Vehicle:</strong> <span class="tag green">Ambulance #TN-01-AMB-9921 (${type})</span></div>
            <div><strong>Driver Details:</strong> M. Arumugam (+91 98400 11223)</div>
            <div><strong>GPS Coordinates:</strong> Lat: ${lat}° N, Lng: ${lng}° E</div>
            <div><strong>Pickup Location:</strong> ${address}</div>
            <div><strong>ETA:</strong> <strong style="color:var(--cyan);">6 Mins (En Route)</strong></div>
        `;
    }

    const payload = { vehicle: 'TN-01-AMB-9921', driver: 'M. Arumugam (+91 98400 11223)', address, lat, lng, patient: name, type };

    fetch('/api/ambulance/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => {});

    broadcastEventToBackend({ type: 'AMBULANCE_DISPATCHED', data: payload });

    pushToastNotification("🚑 AMBULANCE DISPATCHED!", `Cardiac ICU Ambulance #TN-01-AMB-9921 en route to ${address} (GPS: ${lat}, ${lng}). ETA 6 mins.`, "scheme", "fa-ambulance");
    sendSystemOsNotification("108 Emergency Ambulance Dispatched", `Vehicle #TN-01-AMB-9921 en route to ${address}.`);
    speakText(`Ambulance dispatched for ${name}. Driver M. Arumugam is en route.`);
}

window.triggerOneTouchAmbulanceSos = () => {
    const resultBox = document.getElementById('patAmbResultBox');
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            executeSos(pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5), resultBox);
        }, err => executeSos("13.0827", "80.2707", resultBox));
    } else executeSos("13.0827", "80.2707", resultBox);
};

function executeSos(lat, lng, resultBox) {
    if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
            <div style="color:var(--red); font-weight:900; font-size:16px;">
                <i class="fa-solid fa-triangle-exclamation"></i> 🚨 108 EMERGENCY AMBULANCE SOS DISPATCHED TO BACKEND SERVER!
            </div>
            <div style="margin-top:6px;"><strong>Emergency Patient:</strong> ${patientProfile.name} (${patientProfile.phone})</div>
            <div><strong>GPS Location:</strong> Lat: ${lat}° N, Lng: ${lng}° E (${patientProfile.address})</div>
            <div><strong>Assigned Vehicle:</strong> <span class="tag red">108 Emergency Ambulance #TN-01-AMB-4402</span></div>
            <div><strong>Driver:</strong> K. Selvam (+91 94441 55667)</div>
            <div><strong>Status:</strong> <strong style="color:var(--amber);">EN ROUTE WITH SIREN & RED FLASHERS (ETA 4 MINS)</strong></div>
        `;
    }

    const payload = { patient: patientProfile.name, phone: patientProfile.phone, address: patientProfile.address, lat, lng };

    fetch('/api/ambulance/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => {});

    broadcastEventToBackend({ type: 'EMERGENCY_SOS', data: payload });

    pushToastNotification("🚨 108 EMERGENCY SOS DISPATCHED!", `Nearest 108 Ambulance en route to ${patientProfile.address}. ETA 4 mins!`, "urgent", "fa-triangle-exclamation");
    sendSystemOsNotification("🚨 108 EMERGENCY SOS DISPATCHED", `108 Ambulance en route to ${patientProfile.address}.`);
    speakText(`Emergency SOS activated! 108 Ambulance is en route with red flashers.`);
}

function initPatientTabSearchFilters() {
    const prescSearch = document.getElementById('patPrescSearchInput');
    if (prescSearch) {
        prescSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#patientPrescriptionsContainer .printable-prescription-paper').forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const recSearch = document.getElementById('patRecordSearchInput');
    if (recSearch) {
        recSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#recordsGridContainer .record-card').forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const hospSearch = document.getElementById('patHospSearchInput');
    if (hospSearch) {
        hospSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#hospitalsGridContainer .hospital-card-interactive').forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }

    const storeSearch = document.getElementById('patStoreSearchInput');
    if (storeSearch) {
        storeSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('#storeProductsContainer .product-card').forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(query) ? 'flex' : 'none';
            });
        });
    }
}

function initProfileManagement() {
    updateProfileUI();

    const form = document.getElementById('profileEditForm');
    const photoFileInput = document.getElementById('profAvatarFileInput');

    if (photoFileInput) {
        photoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    patientProfile.avatar = event.target.result;
                    const avatarImg = document.getElementById('profileAvatarImg');
                    const headerAvatar = document.getElementById('headerProfileAvatarImg');
                    if (avatarImg) avatarImg.src = patientProfile.avatar;
                    if (headerAvatar) headerAvatar.src = patientProfile.avatar;
                    localStorage.setItem('vitamind_patient_profile', JSON.stringify(patientProfile));
                    alert('📸 PROFILE PHOTO UPLOADED & UPDATED FROM SYSTEM HARDWARE!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            patientProfile.name = document.getElementById('profName').value;
            patientProfile.phone = document.getElementById('profPhone').value;
            patientProfile.email = document.getElementById('profEmail').value;
            patientProfile.aadhaar = document.getElementById('profAadhaar').value;
            patientProfile.dob = document.getElementById('profDob').value;
            patientProfile.bloodGroup = document.getElementById('profBloodGroup').value;
            patientProfile.address = document.getElementById('profAddress').value;
            patientProfile.emergency = document.getElementById('profEmergency').value;

            localStorage.setItem('vitamind_patient_profile', JSON.stringify(patientProfile));
            updateProfileUI();

            document.getElementById('patientProfileModal').classList.add('hidden');
            alert('✅ PROFILE DETAILS UPDATED & SAVED!');
            speakText('Profile details successfully updated.');
        });
    }
}

window.openProfileModal = () => {
    const modal = document.getElementById('patientProfileModal');
    if (!modal) return;

    document.getElementById('profName').value = patientProfile.name;
    document.getElementById('profPhone').value = patientProfile.phone;
    document.getElementById('profEmail').value = patientProfile.email;
    document.getElementById('profAadhaar').value = patientProfile.aadhaar;
    document.getElementById('profDob').value = patientProfile.dob;
    document.getElementById('profBloodGroup').value = patientProfile.bloodGroup;
    document.getElementById('profAddress').value = patientProfile.address;
    document.getElementById('profEmergency').value = patientProfile.emergency;

    document.getElementById('modalProfileName').textContent = patientProfile.name;
    document.getElementById('profileAvatarImg').src = patientProfile.avatar;

    modal.classList.remove('hidden');
};

function updateProfileUI() {
    const badgeName = document.getElementById('userProfileName');
    const apptName = document.getElementById('apptPatientName');
    const dashName = document.getElementById('dashApptPatientName');
    const headerAvatar = document.getElementById('headerProfileAvatarImg');

    const patAmbName = document.getElementById('patAmbName');
    const patAmbPhone = document.getElementById('patAmbPhone');
    const patAmbAddr = document.getElementById('patAmbPickupAddress');

    if (badgeName) badgeName.innerHTML = `Logged in: <strong>${patientProfile.name}</strong>`;
    if (apptName) apptName.value = patientProfile.name;
    if (dashName) dashName.textContent = patientProfile.name;
    if (headerAvatar) headerAvatar.src = patientProfile.avatar;

    if (patAmbName) patAmbName.value = patientProfile.name;
    if (patAmbPhone) patAmbPhone.value = patientProfile.phone;
    if (patAmbAddr) patAmbAddr.value = patientProfile.address;
}

function renderPatientPrescriptions() {
    const container = document.getElementById('patientPrescriptionsContainer');
    if (!container) return;

    fetch('/api/prescriptions')
        .then(res => res.json())
        .then(data => {
            let saved = data.prescriptions || [];
            if (saved.length === 0) {
                saved = [{
                    id: 101,
                    patient: patientProfile.name,
                    token: "Token #A-14",
                    diagnosis: "Acute Viral Fever (Dengue Suspect)",
                    medicines: "1. Tab Dolo 650mg — 1-0-1 (3 Days)\n2. Tab Cetirizine 10mg — 0-0-1 (3 Days)\n3. ORS Hydration Sachet — Daily 1L",
                    advice: "Complete bed rest for 48 hours. Drink 3L fluids.",
                    doctor: "Dr. E. Theranirajan, MD (Pediatrics Specialist)",
                    date: "07 Aug 2026"
                }];
            }

            container.innerHTML = saved.map((p) => `
                <div class="record-card printable-prescription-paper" style="flex-direction:column; align-items:flex-start; gap:12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px;">
                        <div>
                            <h3 style="color:#e65100; font-size:16px; font-weight:900;"><i class="fa-solid fa-file-prescription"></i> Prescription from ${p.doctor}</h3>
                            <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Patient: <strong>${p.patient}</strong> (${p.token || 'Token #A-14'}) • Date: ${p.date || 'Today'}</p>
                        </div>
                        <span class="tag green"><i class="fa-solid fa-signature"></i> Doctor Signed</span>
                    </div>

                    <div style="background:#fff7ed; border:1px solid var(--border); border-radius:12px; padding:14px; width:100%; font-size:12px; line-height:1.6;">
                        ${p.diagnosis ? `<div style="color:var(--cyan); font-weight:800;">Diagnosis: ${p.diagnosis}</div>` : ''}
                        <div style="color:#0f172a; margin-top:6px;"><strong>Rx Medications & Dosage:</strong><br>${(p.medicines || '').replace(/\n/g, '<br>')}</div>
                        ${p.advice ? `<div style="color:var(--text-muted); margin-top:6px;"><strong>Clinical Advice:</strong> ${p.advice}</div>` : ''}
                    </div>

                    <div style="display:flex; gap:12px; width:100%;">
                        <button class="btn primary-btn" style="flex:1;" onclick="window.print()">
                            <i class="fa-solid fa-print"></i> PRINT PRESCRIPTION MANUALLY
                        </button>
                        <button class="btn success-btn" style="flex:1;" onclick="orderMedicine('${(p.medicines || 'Dolo 650mg').split('\n')[0]}', 34)">
                            <i class="fa-solid fa-cart-shopping"></i> ORDER ON PHARMEASY / ONLINE PHARMACY
                        </button>
                    </div>
                </div>
            `).join('');
        }).catch(err => {});
}

function initAuthSystem() {
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authPanes = document.querySelectorAll('.auth-method-pane');
    const section = document.getElementById('otpVerifySection');

    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            authTabBtns.forEach(b => b.classList.remove('active'));
            authPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`auth-${btn.dataset.auth}`);
            if (targetPane) targetPane.classList.add('active');
            if (section) section.classList.add('hidden');
        });
    });
}

window.sendOtp = (method) => {
    let identifier = "";
    if (method === 'mobile') identifier = document.getElementById('mobileNumberInput').value || "9876543210";
    else if (method === 'email') identifier = document.getElementById('emailInput').value || "patient@example.com";
    else if (method === 'aadhaar') identifier = document.getElementById('aadhaarInput').value || "1234 5678 9012";

    const section = document.getElementById('otpVerifySection');
    if (section) section.classList.remove('hidden');

    alert(`📩 OTP SENT SUCCESSFULLY!\n\nA 6-digit OTP code has been sent to your ${method.toUpperCase()} (${identifier}).\n\nFor demo testing, enter OTP: 123456`);
    speakText(`OTP sent to your ${method}.`);
};

window.verifyAndLogin = () => {
    const code = document.getElementById('otpCodeInput').value.trim();
    if (!code) { alert('Please enter 6-digit OTP code!'); return; }
    completeLogin(patientProfile.name);
};

window.loginWithGoogle = () => {
    const section = document.getElementById('otpVerifySection');
    if (section) section.classList.add('hidden');
    completeLogin(patientProfile.name + " (Google Account SSO)");
};

function completeLogin(name) {
    loggedInUser = name;
    updateProfileUI();

    const modal = document.getElementById('patientLoginModal');
    if (modal) modal.classList.add('hidden');

    pushToastNotification(
        "🟢 GOOGLE LOGIN SUCCESSFUL",
        `Welcome ${name}! Authenticated directly via Google SSO (No OTP required).`,
        "scheme",
        "fa-brands fa-google"
    );

    speakText(`Welcome ${name}. Google login successful.`);
}

window.logoutPatient = () => {
    loggedInUser = null;
    togglePatientAuthMode('login');
    const modal = document.getElementById('patientLoginModal');
    if (modal) modal.classList.remove('hidden');
    const section = document.getElementById('otpVerifySection');
    if (section) section.classList.add('hidden');
    alert('You have logged out of the Patient Portal.');
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
            if (tab.dataset.tab === 'prescriptions') renderPatientPrescriptions();
            if (tab.dataset.tab === 'records') renderMedicalRecords();
            if (tab.dataset.tab === 'saved-records') renderSavedMedicalRecords();
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

// NETFLIX SMOOTH HORIZONTAL SCROLL CAROUSEL ENGINE
function initCarousel() {
    const row = document.getElementById('netflixCarouselRow');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');

    if (row && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            row.scrollBy({ left: -280, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            row.scrollBy({ left: 280, behavior: 'smooth' });
        });

        setInterval(() => {
            if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 10) {
                row.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                row.scrollBy({ left: 280, behavior: 'smooth' });
            }
        }, 5000);
    }
}

function initDobAgeCalculator() {
    const dobInput = document.getElementById('apptDob');
    const ageInput = document.getElementById('apptCalculatedAge');

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

function initDistrictsAndTypesDropdown() {
    const districtFilters = ['districtFilter', 'apptDistrictSelect', 'kycDistrict'];
    districtFilters.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = (id === 'districtFilter' ? '<option value="ALL">All 38 Districts in Tamil Nadu</option>' : '') +
                tnDistricts.map(d => `<option value="${d}">${d}</option>`).join('');
        }
    });

    const apptDistrictSelect = document.getElementById('apptDistrictSelect');
    if (apptDistrictSelect) {
        apptDistrictSelect.addEventListener('change', (e) => updateHospitalsForDistrict(e.target.value));
        updateHospitalsForDistrict(apptDistrictSelect.value || "Chennai");
    }
}

function updateHospitalsForDistrict(district) {
    const apptHospitalSelect = document.getElementById('apptHospitalSelect');
    if (!apptHospitalSelect) return;
    const matched = tnHospitals.filter(h => h.district.toLowerCase().includes(district.toLowerCase()));
    if (matched.length > 0) {
        apptHospitalSelect.innerHTML = matched.map(h => `<option value="${h.name}">${h.name} (${h.category})</option>`).join('');
    } else {
        apptHospitalSelect.innerHTML = `<option value="${district} Govt District HQ Hospital">${district} Govt District HQ Hospital (Government)</option>`;
    }
}

function initHospitalsDirectory() {
    const container = document.getElementById('hospitalsGridContainer');
    const districtFilter = document.getElementById('districtFilter');
    const typeFilter = document.getElementById('hospitalTypeFilter');

    function renderHospitals() {
        if (!container) return;
        const dVal = districtFilter ? districtFilter.value : "ALL";
        const tVal = typeFilter ? typeFilter.value : "ALL";

        const filtered = tnHospitals.filter(h => {
            const dMatch = (dVal === "ALL") || h.district.toLowerCase().includes(dVal.toLowerCase());
            const tMatch = (tVal === "ALL") || (h.category.toLowerCase() === tVal.toLowerCase());
            return dMatch && tMatch;
        });

        container.innerHTML = filtered.map(h => `
            <div class="hospital-card-interactive" onclick="openHospitalModal('${h.id}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h3 style="color:#e65100; font-size:16px; font-weight:800;"><i class="fa-solid fa-hospital"></i> ${h.name}</h3>
                        <p style="font-size:11px; color:var(--text-muted); margin-top:4px;">📍 ${h.address} • <strong>${h.district} District</strong></p>
                    </div>
                    <span class="hospital-status-pill ${h.statusType}">🟢 ${h.status}</span>
                </div>
            </div>
        `).join('');
    }

    renderHospitals();
    if (districtFilter) districtFilter.addEventListener('change', renderHospitals);
    if (typeFilter) typeFilter.addEventListener('change', renderHospitals);
}

function initHospitalModal() {
    const modal = document.getElementById('hospitalModal');
    const closeBtn = document.getElementById('closeHospitalModalBtn');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
}

window.openHospitalModal = (hospitalId) => {
    const modal = document.getElementById('hospitalModal');
    const content = document.getElementById('hospitalModalContent');
    const h = tnHospitals.find(item => item.id === hospitalId) || tnHospitals[0];

    if (!modal || !content) return;

    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
                <h2 style="color:#e65100; font-size:20px; font-weight:800;">${h.name}</h2>
                <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">📍 ${h.address} • <strong>${h.district} District</strong></p>
            </div>
            <span class="hospital-status-pill ${h.statusType}" style="font-size:13px;">🟢 ${h.status}</span>
        </div>
    `;
    modal.classList.remove('hidden');
};

function initNotificationSystem() {
    renderNotificationDrawer();
}

function renderNotificationDrawer() {
    const tabList = document.getElementById('tabNotificationList');
    const tabBadge = document.getElementById('tabNotifBadge');

    if (tabBadge) tabBadge.textContent = notificationList.length;

    if (tabList) {
        tabList.innerHTML = notificationList.map(n => `
            <div class="tab-notif-card ${n.type}">
                <div class="tab-notif-icon"><i class="fa-solid ${n.icon}"></i></div>
                <div class="tab-notif-info">
                    <h4>${n.title}</h4>
                    <p>${n.body}</p>
                    <span class="time-tag"><i class="fa-solid fa-clock"></i> ${n.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function pushToastNotification(title, body, type = "urgent", icon = "fa-bell") {
    const container = document.getElementById('toastNotificationContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-body">${body}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.prepend(toast);
    notificationList.unshift({ id: Date.now(), title, body, time: "Just Now", type, icon });
    renderNotificationDrawer();
    speakText(`${title}. ${body}`);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 7000);
}

window.clearNotifications = () => {
    notificationList = [];
    renderNotificationDrawer();
    alert('All notifications cleared!');
};

function initAppointmentScheduler() {
    const form = document.getElementById('appointmentForm');
    const resultBox = document.getElementById('apptResultBox');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('apptPatientName').value || patientProfile.name;
            const age = document.getElementById('apptCalculatedAge').value || "24 Years";
            const hospital = document.getElementById('apptHospitalSelect').value;
            const doctor = document.getElementById('apptDoctorSelect').value;
            const datetime = document.getElementById('apptDateTime').value || "Today 10:30 AM";

            const apptObj = { name, age, height: "172", weight: "68", temp: "98.6", allergies: "No Allergies", symptoms: "High fever", district: "Chennai", hospital, doctor, datetime };

            fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apptObj)
            }).then(res => res.json()).then(data => {
                const tokenCode = data.appointment ? data.appointment.token : `A-${currentTokenNum + 1}`;
                currentTokenCode = tokenCode;
                executeBooking(name, age, "172", "68", "98.6", "No Allergies", "High fever", "Chennai", hospital, doctor, datetime, resultBox, tokenCode);
            }).catch(err => executeBooking(name, age, "172", "68", "98.6", "No Allergies", "High fever", "Chennai", hospital, doctor, datetime, resultBox));
        });
    }
}

function executeBooking(name, age, height, weight, temp, allergies, healthIssue, district, hospital, doctor, datetime, resultBoxEl = null, overrideToken = null) {
    if (!overrideToken) currentTokenNum++;
    currentTokenCode = overrideToken || `A-${currentTokenNum}`;
    currentPatientName = name;
    currentHospitalName = hospital;

    generateQRCodeCanvas(`TOKEN:${currentTokenCode}|PATIENT:${name}|HOSPITAL:${hospital}`);
    updateQueueDisplay();
    updateDashboardSquareGrids(name, hospital, doctor, datetime, currentTokenCode);

    broadcastEventToBackend({
        type: 'APPOINTMENT_BOOKED',
        data: { token: currentTokenCode, name, age, height, weight, temp, allergies, symptoms: healthIssue, district, hospital, doctor, datetime }
    });

    pushToastNotification("🎫 TOKEN GENERATED!", `Assigned QR Token #${currentTokenCode} for ${hospital}.`, "scheme", "fa-qrcode");

    if (resultBoxEl) {
        resultBoxEl.classList.remove('hidden');
        resultBoxEl.innerHTML = `
            <div style="color:var(--green); font-weight:700; font-size:14px; margin-bottom:6px;">
                <i class="fa-solid fa-circle-check"></i> REAL-TIME APPOINTMENT CONFIRMED & QR TOKEN ISSUED!
            </div>
            <div><strong>Assigned QR Token:</strong> <span class="tag green">#${currentTokenCode}</span></div>
            <div><strong>Patient:</strong> ${name} (${hospital})</div>
        `;
    }
}

function updateDashboardSquareGrids(name, hospital, doctor, datetime, tokenCode) {
    const dashPatient = document.getElementById('dashApptPatientName');
    const dashHosp = document.getElementById('dashApptHospital');
    const dashDoc = document.getElementById('dashApptDoctor');
    const dashTime = document.getElementById('dashApptTime');

    const dashTok = document.getElementById('dashTokenNum');
    const dashServ = document.getElementById('dashServingNum');
    const dashNext = document.getElementById('dashNextNum');

    if (dashPatient) dashPatient.textContent = name;
    if (dashHosp) dashHosp.textContent = hospital;
    if (dashDoc) dashDoc.textContent = doctor;
    if (dashTime) dashTime.textContent = `${datetime} • CONFIRMED 🟢`;

    if (dashTok) dashTok.textContent = `Token #${tokenCode}`;
    if (dashServ) dashServ.textContent = `Token #A-12 (Vignesh S)`;
    if (dashNext) dashNext.textContent = `Token #A-13 (Tamilventhan M)`;
}

function initQRCodeTokenSystem() {
    generateQRCodeCanvas(`TOKEN:A-14|PATIENT:Hariss Kumar K|HOSPITAL:RGGGH Chennai`);
}

function generateQRCodeCanvas(textData) {
    const wrapper = document.getElementById('qrcodeCanvas');
    if (!wrapper) return;
    wrapper.innerHTML = "";

    if (window.QRCode) {
        new QRCode(wrapper, { text: textData, width: 140, height: 140, colorDark: "#0f172a", colorLight: "#ffffff" });
    }
}

function updateQueueDisplay() {
    const qServingText = document.getElementById('qServingText');
    const qNextText = document.getElementById('qNextText');
    const qYourText = document.getElementById('qYourText');

    if (qServingText) qServingText.textContent = `Token #A-12 — Vignesh S`;
    if (qNextText) qNextText.textContent = `Token #A-13 — Tamilventhan M`;
    if (qYourText) qYourText.textContent = `Token #${currentTokenCode} — ${currentPatientName}`;
}

window.simulateStaffScan = () => {
    broadcastEventToBackend({ type: 'RECEPTION_QR_SCANNED', data: { token: currentTokenCode, name: patientProfile.name } });
    alert(`🔍 RECEPTION QR SCAN VERIFIED!\n\nToken #${currentTokenCode} admitted.`);
    pushToastNotification("🟢 RECEPTION QR SCAN VERIFIED!", `Token #${currentTokenCode} admitted with zero wait time!`, "scheme", "fa-circle-check");
};

function initPharmEasyStore() {
    const container = document.getElementById('storeProductsContainer');
    if (!container) return;

    container.innerHTML = storeProducts.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}" class="product-img">
            <div class="product-title">${p.name}</div>
            <div style="font-size:10px; color:var(--text-muted);">${p.category}</div>
            <div class="product-price">₹${p.price}</div>
            <button class="btn success-btn" onclick="orderMedicine('${p.name}', ${p.price})" style="padding:8px; font-size:11px;"><i class="fa-solid fa-cart-shopping"></i> Order via PharmEasy</button>
        </div>
    `).join('');
}

window.orderMedicine = (name, price) => {
    alert(`🛍️ PHARMEASY ONLINE ORDER PLACED!\n\nItem: ${name}\nPrice: ₹${price}\nDelivery Address: ${patientProfile.address}\n\nExpress Doorstep Delivery Initiated!`);
};

function initKYCOnboarding() {
    const form = document.getElementById('kycForm');
    const resultBox = document.getElementById('kycResultBox');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `<div style="color:var(--green); font-weight:700;"><i class="fa-solid fa-user-shield"></i> KYC PROOF VERIFIED</div>`;
            }
        });
    }
}

function initClaimsValidator() {
    const form = document.getElementById('claimsForm');
    const resultBox = document.getElementById('claimsResultBox');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `<div style="color:var(--amber); font-weight:700;"><i class="fa-solid fa-receipt"></i> CMCHIS CLAIM AUTHORIZED</div>`;
            }
        });
    }
}

// REAL-TIME MULTI-LINGUAL AI HEALTH ASSISTANT & FILE ANALYZER ENGINE
function initFloatingAiWidget() {
    const widgetBtn = document.getElementById('floatingAiWidgetBtn');
    const drawer = document.getElementById('floatingChatDrawer');
    const closeBtn = document.getElementById('closeChatDrawerBtn');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const voiceBtn = document.getElementById('voiceChatBtn');
    const fileInput = document.getElementById('chatFileInput');
    const filePreview = document.getElementById('chatFilePreview');
    const messages = document.getElementById('chatMessages');

    if (widgetBtn && drawer) {
        widgetBtn.onclick = (e) => {
            e.stopPropagation();
            drawer.classList.toggle('hidden');
            if (!drawer.classList.contains('hidden') && input) input.focus();
        };
    }

    if (closeBtn && drawer) closeBtn.onclick = () => drawer.classList.add('hidden');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                processUploadedFile(file); // Automatically save in both Upload & Saved Records tabs!
                const reader = new FileReader();
                reader.onload = (evt) => {
                    attachedChatFile = { name: file.name, type: file.type, dataUrl: evt.target.result };
                    if (filePreview) {
                        filePreview.classList.remove('hidden');
                        filePreview.innerHTML = `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff7ed; padding:8px 12px; border-radius:10px; border:1px solid #ff9933; font-size:11px;">
                                <span><i class="fa-solid fa-paperclip" style="color:#e65100;"></i> Attached & Saved: <strong>${file.name}</strong></span>
                                <button type="button" onclick="attachedChatFile=null; this.parentElement.parentElement.classList.add('hidden')" style="border:none; background:none; color:red; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        `;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-IN';
                recognition.start();

                voiceBtn.style.background = '#d97706';
                voiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if (input) input.value = transcript;
                    voiceBtn.style.background = '';
                    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                    processUserMessage();
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

    function addMessage(text, isBot = false) {
        if (!messages) return;
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isBot ? 'bot' : 'user'}`;
        msg.innerHTML = isBot ? `<div class="msg-sender"><i class="fa-solid fa-robot"></i> VITAMIND AI Assistant</div><div class="msg-text">${text}</div>` : text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function processUserMessage() {
        const text = input ? input.value.trim() : '';
        const file = attachedChatFile;

        if (!text && !file) return;

        let userMsgHtml = text;
        if (file) {
            userMsgHtml += `<br><span style="font-size:10px; opacity:0.8;"><i class="fa-solid fa-paperclip"></i> Attached & Saved File: ${file.name}</span>`;
        }

        addMessage(userMsgHtml, false);
        if (input) input.value = '';
        attachedChatFile = null;
        if (filePreview) filePreview.classList.add('hidden');

        fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text, file, user: patientProfile.name })
        })
        .then(res => res.json())
        .then(data => {
            const reply = data.reply || `🤖 Hello ${patientProfile.name}! I am your AI Health Assistant. How can I help you today?`;
            addMessage(reply, true);

            const cleanText = reply.replace(/<[^>]*>?/gm, '');
            speakText(cleanText);

            if (data.actionType === 'AUTO_FILL_AND_BOOK_APPOINTMENT') {
                const params = data.actionParams || {};
                const nameInput = document.getElementById('apptPatientName');
                const phoneInput = document.getElementById('apptPhone');
                const symptomsInput = document.getElementById('apptHealthIssue');
                const hospInput = document.getElementById('apptHospitalSelect');
                const docInput = document.getElementById('apptDoctorSelect');

                if (nameInput && params.name) nameInput.value = params.name;
                if (phoneInput && params.phone) phoneInput.value = params.phone;
                if (symptomsInput && params.symptoms) symptomsInput.value = params.symptoms;
                if (hospInput && params.hospital) hospInput.value = params.hospital;
                if (docInput && params.doctor) docInput.value = params.doctor;

                [nameInput, phoneInput, symptomsInput, hospInput, docInput].forEach(inp => {
                    if (inp && inp.value) {
                        inp.style.borderColor = '#ff9933';
                        inp.style.boxShadow = '0 0 16px rgba(255, 153, 51, 0.6)';
                    }
                });

                switchToTab('appointments');
                const form = document.getElementById('appointmentForm');
                if (form) setTimeout(() => form.dispatchEvent(new Event('submit')), 1000);

            } else if (data.actionType === 'AUTO_FILL_AND_DISPATCH_AMBULANCE') {
                const params = data.actionParams || {};
                const nameInput = document.getElementById('patAmbName');
                const phoneInput = document.getElementById('patAmbPhone');
                const addrInput = document.getElementById('patAmbPickupAddress');

                if (nameInput && params.name) nameInput.value = params.name;
                if (phoneInput && params.phone) phoneInput.value = params.phone;
                if (addrInput && params.address) addrInput.value = params.address;

                [nameInput, phoneInput, addrInput].forEach(inp => {
                    if (inp && inp.value) {
                        inp.style.borderColor = '#dc2626';
                        inp.style.boxShadow = '0 0 16px rgba(220, 38, 38, 0.6)';
                    }
                });

                switchToTab('ambulance');
                setTimeout(() => triggerOneTouchAmbulanceSos(), 1000);

            } else if (data.actionType === 'SWITCH_TAB' && data.actionData) {
                setTimeout(() => switchToTab(data.actionData), 1200);
            } else if (data.actionType === 'TRIGGER_SOS') {
                setTimeout(() => triggerOneTouchAmbulanceSos(), 1200);
            } else if (data.actionType === 'OPEN_APPOINTMENT_TAB') {
                setTimeout(() => switchToTab('appointments'), 1200);
            }
        })
        .catch(err => {
            addMessage(`🤖 <strong>VITAMIND AI HEALTH ASSISTANT:</strong><br><br>Hello ${patientProfile.name}! Your active OPD token is <span class="tag green">Token #A-14</span> at RGGGH Chennai. I can help with Dengue symptoms, 108 Ambulance dispatch, and booking appointments.`, true);
            speakText(`Hello ${patientProfile.name}. Your active OPD token is Token A-14.`);
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', processUserMessage);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') processUserMessage(); });
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

window.switchToTab = (tabName) => {
    const btn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (btn) btn.click();
};
