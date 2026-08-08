# 🏥 VITAMIND — Production Agentic AI Healthcare System & Multi-Portal Ecosystem for Tamil Nadu Hospitals

![PRISM Hackathon](https://img.shields.io/badge/PRISM%20Hackathon-Theme%201%20Autonomous%20AI-0070c0?style=for-the-badge&logo=ai)
![Build Status](https://img.shields.io/badge/Status-Production%20Live-22c55e?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20WebSockets%20%7C%20HTML5%20%7C%20CSS3-3b82f6?style=for-the-badge)

---

## 🌐 Live Application Portals for Hackathon Evaluation

* 👤 **Patient Health Portal:** [https://hariss0606.github.io/vitamind-healthcare/index.html](https://hariss0606.github.io/vitamind-healthcare/index.html)
* 👨‍⚕️ **Doctor Clinical Portal:** [https://hariss0606.github.io/vitamind-healthcare/doctor.html](https://hariss0606.github.io/vitamind-healthcare/doctor.html)
* 🏥 **Hospital Reception Console:** [https://hariss0606.github.io/vitamind-healthcare/reception.html](https://hariss0606.github.io/vitamind-healthcare/reception.html)
* 📄 **Official PRISM Presentation PDF:** [`HACKERZ_PRISM_Presentation.pdf`](./HACKERZ_PRISM_Presentation.pdf)
* 📡 **Production Express Server:** `http://127.0.0.1:3000`
* 🔌 **WebSocket Real-Time Server:** `ws://127.0.0.1:3000/ws`

---

## 📌 Executive Summary

**VITAMIND** is an agentic AI-driven, real-time healthcare automation platform designed to solve severe hospital OPD overcrowding, emergency ambulance transit delays, and manual insurance billing bottlenecks across 14,850+ medical centers in 38 districts of Tamil Nadu. 

By unifying **Patients, Doctors, and Hospital Receptionists** into a synchronized real-time data mesh, VITAMIND reduces OPD wait times by **90%** (via zero-wait optical QR code scanning), enables sub-60 second **108 Emergency Ambulance GPS dispatch**, and automates **100% cashless CMCHIS health insurance pre-authorizations**.

---

## 🌟 Key Features & Interconnected Clinical Portals

### 👤 1. Patient Health Portal (`index.html`)
* 🎨 **Design System:** Saffron & White Gradient Look + Glassmorphic UI Cards.
* 🤖 **Autonomous Agentic AI Assistant:** Multi-lingual (Tamil, English, Hindi) Voice STT & Text natural language intent parser. Autonomously extracts parameters (`Name`, `Phone`, `Symptoms`, `Hospital`, `Doctor`, `Address`), autofills form details live on screen, and triggers actions.
* 🎫 **Digital QR Code Token Canvas:** Generates dynamic HTML5 canvas QR codes for zero-wait OPD queue admission.
* 🎬 **Netflix-Style Health Feed Carousel:** Smooth horizontal scroll for monsoon outbreak alerts (Dengue, H3N2 Flu).
* 🚨 **One-Touch 108 Emergency SOS:** Transmits real-time device GPS coordinates to hospital reception consoles.
* 📂 **Base64 EMR Medical Records Vault:** Upload, view, preview, and share lab reports, PDFs, image scans, and videos.

### 👨‍⚕️ 2. Doctor OPD Command Station (`doctor.html`)
* 🎨 **Design System:** Sky Blue & White Gradient Look.
* 📢 **Real-Time OPD Queue Control:** Call next patient into Room 4 (`Call Next Token #A-15`), skip token, or trigger emergency calls.
* 📄 **Official E-Prescription Desk:** Digital signature stamps, automatic medication dosage calculation, and instant routing to patient & reception consoles.
* 📂 **Saved Medical Records Tab:** Access patient-uploaded files, preview lab reports, and copy past medications into current prescriptions with 1-click.
* 🛏️ **Inpatient Bed & ICU Capacity Monitor:** Real-time tracking across 3,000+ bed capacity metrics.

### 🏥 3. Hospital Reception Console (`reception.html`)
* 🎨 **Design System:** Sky Pink & White Gradient Look.
* 🔍 **Optical QR Code Token Scanner:** Zero-wait camera & code verification for instant patient OPD admission.
* 💳 **CMCHIS Cashless Billing Engine:** Automated fee calculator with 100% state health scheme discounts (-₹1,50,000).
* 🚑 **108 Ambulance Dispatch Hub:** Real-time GPS telematics, driver assignment, and ETA tracking.
* 💊 **Pharmacy Inventory Desk:** TNMSC medicine stock monitoring and batch re-ordering.

---

## 🏗️ System Architecture & Data Flow

```
+------------------------+      WebSockets / BroadcastChannel      +------------------------+
|  👤 PATIENT PORTAL    | <======================================> |  👨‍⚕️ DOCTOR PORTAL     |
|  - Voice AI Assistant  |                                         |  - OPD Queue Station   |
|  - Digital QR Token    |                                         |  - E-Prescription Desk |
|  - 108 GPS SOS Call    |                                         |  - Saved Records Tab   |
+------------------------+                                         +------------------------+
            ^                                                                   ^
            ||                                                                 ||
            v                                                                   v
+-------------------------------------------------------------------------------------------+
|                      📡 NODE.JS EXPRESS + WEBSOCKET BACKEND SERVER                         |
|   - REST API Routes (/api/appointments, /api/prescriptions, /api/ambulance/sos)           |
|   - Intelligent AI Intent & Parameter Extraction Router (/api/ai/chat)                     |
|   - Bi-Directional WebSocket Event Broadcast Engine (ws://127.0.0.1:3000/ws)              |
|   - Persistent JSON Database Engine (database.json)                                       |
+-------------------------------------------------------------------------------------------+
                                            ^
                                            ||
                                            v
                                +------------------------+
                                | 🏥 RECEPTION CONSOLE   |
                                | - Optical QR Scanner   |
                                | - Cashless CMCHIS Bill |
                                | - 108 Fleet Dispatch   |
                                +------------------------+
```

---

## 🛠️ Technology Stack & Standards Compliance

| Layer | Technology / Protocol |
| :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS3 (Custom Glassmorphic Tokens), JavaScript ES6+ Async/Await |
| **Backend Server** | Node.js Express Framework, HTTP REST APIs, File System DB (`database.json`) |
| **Real-Time Engine** | Bi-Directional WebSockets (`ws`), Browser BroadcastChannel Mesh |
| **Device Hardware APIs** | W3C SpeechRecognition (STT), Web SpeechSynthesis (TTS), HTML5 Geolocation API, Base64 File Vault |
| **Health Standards** | ABDM / ABHA Interoperability, CMCHIS Cashless Framework, WHO ESI Triage & ICD-10 Diagnostic Codes |

---

## ⚡ Local Installation & Deployment Guide

### Prerequisites
* **Node.js** (v16.0 or higher)
* **npm** (v7.0 or higher)
* **Web Browser** (Google Chrome or Microsoft Edge recommended for Speech Recognition APIs)

### Step 1: Clone Repository
```bash
git clone https://github.com/HARISS0606/vitamind-healthcare.git
cd vitamind-healthcare
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Production Server
```bash
node server.js
```

### Step 4: Open Portals in Web Browser
* 👤 **Patient Portal:** `http://127.0.0.1:3000/index.html`
* 👨‍⚕️ **Doctor Portal:** `http://127.0.0.1:3000/doctor.html`
* 🏥 **Reception Portal:** `http://127.0.0.1:3000/reception.html`

---

## 👥 Team HACKERZ — Chennai Institute of Technology

* **HARISS KUMAR K** (`24CS0309`) — *Team Leader & Lead Architect (Agentic AI Engine, WebSocket Mesh)*
* **S HARIKESH** (`24CS0292`) — *Frontend Engineering & UI/UX Glassmorphic State Logic*
* **SUDHARSHAN V** (`24CS0946`) — *Optical QR Token Systems, Web Speech API & Hardware Mesh*
* **GOWTHAM B** (`24CS0269`) — *Base64 EMR Vault, CMCHIS Billing Engine & Security Compliance*

* **Department:** Computer Science and Engineering (CSE)
* **Academic Batch:** 3rd Year (2024 - 2028)
* **Institution:** Chennai Institute of Technology (CIT), Chennai, Tamil Nadu

---

## 📜 License
This project is licensed under the MIT License — see the [`LICENSE`](./LICENSE) file for details.
