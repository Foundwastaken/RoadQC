<p align="center">
  <img src="public/grsa-logo.jpg" alt="GRSA Logo" width="100" style="border-radius: 50%;" />
</p>

<h1 align="center">Road Safety Audit System</h1>

<p align="center">
  <strong>Gujarat Road Safety Authority — Government of Gujarat</strong><br />
  <em>"Each Road, Safe Road"</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-12-orange?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-blue?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-green?logo=leaflet" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Twilio-SMS-red?logo=twilio" alt="Twilio" />
</p>

---

A full-stack **Road Safety Audit** web application that implements the complete audit lifecycle as defined by **IRC SP 88:2019** — the Indian Roads Congress guidelines for road safety auditing. Built for the Gujarat Road Safety Authority to digitize the end-to-end process of road safety evaluation.

<p align="center">
  <img src="public/hero-highway.png" alt="Highway Hero" width="700" style="border-radius: 12px;" />
</p>

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role System](#-role-system)
- [10-Stage Audit Workflow](#-10-stage-audit-workflow)
- [Key Modules](#-key-modules)
- [Cloud Functions (SMS)](#-cloud-functions-sms)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Demo Walkthrough](#-demo-walkthrough)

---

## Features

| Category | Feature | Details |
|----------|---------|---------|
| **Auth** | Email/Password Login | Firebase Authentication with role detection |
| **Roles** | 3-Role System | Admin, Auditor, Designer — each with dedicated portal |
| **Workflow** | 10-Stage Audit | Complete IRC SP 88 compliant workflow |
| **Inspection** | GPS Tracking | Real-time location tracking with Haversine distance |
| **Validation** | AI Image Check | Google Gemini Vision API validates road images |
| **Maps** | Interactive Maps | Leaflet + OpenStreetMap with route polylines |
| **Routes** | Google Directions | Fetch real driving routes between start/end points |
| **Reports** | PDF Generation | Full audit report with images via jsPDF |
| **SMS** | Twilio Notifications | Firebase Cloud Functions send SMS on audit events |
| **Phone** | Dynamic Numbers | Admin enters phone numbers, auditor can self-update |
| **UI** | Government Theme | Official GRSA branding, dark blue theme, responsive |
| **Mobile** | Fully Responsive | Touch-friendly, works on phones, tablets, desktops |

---

## Tech Stack

```
Frontend:    React 19 + Vite 7 + Tailwind CSS 4
Backend:     Firebase (Auth, Firestore, Cloud Functions)
Maps:        Leaflet + react-leaflet + OpenStreetMap
Routes:      Google Maps Directions API (JavaScript SDK)
AI:          Google Gemini 2.5 Flash Lite (image validation)
PDF:         jsPDF + jspdf-autotable
SMS:         Twilio (via Firebase Cloud Functions)
Hosting:     Vercel / Netlify
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Admin    │  │ Auditor  │  │    Designer       │  │
│  │  Portal   │  │ Portal   │  │    Portal         │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                  │            │
│  ┌────┴──────────────┴──────────────────┴────────┐  │
│  │              React Router (Protected)          │  │
│  └────────────────────┬──────────────────────────┘  │
│                       │                              │
│  ┌────────────────────┴──────────────────────────┐  │
│  │          Firebase SDK (Auth + Firestore)       │  │
│  └────────────────────┬──────────────────────────┘  │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│                  FIREBASE CLOUD                       │
│                       │                               │
│  ┌──────────┐  ┌──────┴─────┐  ┌──────────────────┐ │
│  │  Auth    │  │ Firestore  │  │ Cloud Functions   │ │
│  │ (Email)  │  │ (audits)   │  │ (Twilio SMS)     │ │
│  └──────────┘  └────────────┘  └──────────────────┘ │
└───────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│              EXTERNAL SERVICES                        │
│                       │                               │
│  ┌──────────┐  ┌──────┴─────┐  ┌──────────────────┐ │
│  │ Google   │  │  Google    │  │    Twilio         │ │
│  │ Gemini   │  │  Maps API  │  │    SMS API        │ │
│  │ (Vision) │  │ (Routing)  │  │                   │ │
│  └──────────┘  └────────────┘  └──────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- Firebase project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Pravi.git
cd Pravi

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env and fill in your Firebase + API keys (see section below)

# 4. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Create **Firestore Database** (start in test mode)
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the config values to your `.env` file

### Create Test Users

In Firebase Console → Authentication → Add User:

| Email | Password | Role |
|-------|----------|------|
| `admin@pravi.com` | `password123` | Admin (email contains "admin") |
| `auditor@pravi.com` | `password123` | Auditor (default role) |
| `designer@pravi.com` | `password123` | Designer (email contains "designer") |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Gemini API Key (for AI road image validation)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Google Maps API Keys (for driving route calculation)
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_GOOGLE_MAPS_API_KEY_2=your_backup_maps_api_key
```

### Where to get API keys:

| Key | Source |
|-----|--------|
| Firebase | [Firebase Console](https://console.firebase.google.com) → Project Settings |
| Gemini | [AI Studio](https://aistudio.google.com/app/apikey) (free) |
| Google Maps | [Cloud Console](https://console.cloud.google.com/apis) → Enable Directions API |

---

## Role System

Roles are **automatically detected** from the user's email address:

```
┌──────────────────────────────────────────────┐
│              ROLE DETECTION                   │
│                                               │
│  Email contains "admin"  →  Admin Portal      │
│  Email contains "designer" → Designer Portal  │
│  All other emails        →  Auditor Portal    │
└──────────────────────────────────────────────┘
```

### Admin Portal (`/admin`)

- View all audits across the system
- Create new audits with road name, location, length
- Assign auditors and designers (with phone numbers for SMS)
- Approve/reject submitted audit reports
- Override audit status at any stage
- Set road coordinates (start/end) with Google Directions routing
- Interactive map showing all audits with issue markers
- Download PDF reports for any audit

### Auditor Portal (`/dashboard`)

- View assigned audits only
- Work through the 10-stage audit workflow
- GPS-tracked site inspection with distance calculation
- Capture and upload road images (AI validated)
- Identify and document safety issues with severity levels
- Generate and submit audit reports
- Update personal contact number for SMS notifications

### Designer Portal (`/designer`)

- View all audits assigned as designer
- Respond to individual safety issues (Accept/Reject)
- Add implementation notes and status
- Track which issues are pending response
- Visual distinction between "Action Required" and "Waiting" audits

---

## 10-Stage Audit Workflow

Each audit follows the complete **IRC SP 88:2019** workflow:

```
 ①  Team Selection
    └→ Add team members with name, role, qualification

 ②  Background Data
    └→ Upload traffic data, accident history, road notes

 ③  Commencement Meeting
    └→ Record meeting date, agenda, and notes

 ④  Desk Study
    └→ Checklist: geometry, junctions, alignment, signage, drainage

 ⑤  Site Inspection  ⭐
    └→ GPS tracking (Haversine formula)
    └→ Real-time distance calculation
    └→ Coverage validation (80% = Valid)
    └→ Image capture with AI validation (Gemini)
    └→ Day/Night inspection mode

 ⑥  Safety Issues
    └→ Document issues with title, description, severity
    └→ Severity levels: Low / Medium / High

 ⑦  Audit Report  ⭐
    └→ Auto-generated PDF with all data + images
    └→ Includes inspection photos, issue summary, team info

 ⑧  Completion Meeting
    └→ Final review notes and sign-off

 ⑨  Designer Response
    └→ Designer accepts/rejects each issue
    └→ Provides justification and implementation plan

 ⑩  Implementation
    └→ Track fix status: Pending → In Progress → Completed
```

### Audit Lifecycle Status Flow

```
Created → Assigned → In Progress → Report Submitted → Under Review
                                                          │
                                              ┌───────────┴───────────┐
                                              ▼                       ▼
                                          Approved                Rejected
                                              │                       │
                                              ▼                       └→ In Progress (reopened)
                                        Implementation
                                              │
                                              ▼
                                           Closed
```

---

## Key Modules

### GPS Site Inspection

```
Uses: navigator.geolocation.watchPosition()
Distance: Haversine formula (great-circle distance)
Coverage: (distance tracked / road length) × 100
Valid if: coverage ≥ 80%
Images: Compressed to base64, stored in Firestore
Validation: Google Gemini Vision API checks if image is a road
```

### Interactive Maps

```
Library: Leaflet + react-leaflet
Tiles: OpenStreetMap
Features:
  - Road stretch polylines (start → end)
  - Google Directions API for real driving routes
  - Color-coded issue markers (Red=High, Amber=Medium, Green=Low)
  - Start (green) and End (red) point markers
  - Route distance and duration display
  - Auto-fit bounds to show entire route
```

### PDF Report Generation

```
Library: jsPDF + jspdf-autotable
Includes:
  - Cover page with audit details
  - Team member table
  - Background data summary
  - Desk study checklist results
  - Site inspection stats (distance, coverage, status)
  - Embedded inspection images (2-column grid)
  - Safety issues table with severity
  - Meeting notes
```

### AI Image Validation

```
API: Google Gemini 2.5 Flash Lite
Flow:
  1. User captures/uploads image
  2. Image compressed to base64 (300px max, 50% JPEG)
  3. Sent to Gemini with prompt: "Is this a road?"
  4. Response: valid/invalid with reason
  5. Invalid images show red overlay + remove button
Fallback: If API key missing, all images accepted
```

---

## Cloud Functions (SMS)

Located in `functions/` directory. Uses **Twilio** to send SMS notifications.

### Setup

```bash
# Install dependencies
cd functions
npm install
cd ..

# Set Twilio secrets
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER

# Deploy
firebase deploy --only functions
```

### Triggers

| Function | Trigger | Action |
|----------|---------|--------|
| `sendSmsOnAuditCreate` | New audit document created | SMS to auditor + designer phone |
| `sendSmsOnStatusChange` | Audit status field changed | SMS to all team members with new status |

### Phone Number Format

```
Format: +919876543210
Validation: /^\+\d{10,13}$/
Admin enters numbers when creating/assigning audits
Auditor can self-update from their dashboard
```

---

## Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git add -A && git commit -m "deploy" && git push

# 2. Import on vercel.com
# 3. Framework: Vite
# 4. Build command: npm run build
# 5. Output directory: dist
# 6. Add environment variables in project settings
```

### Netlify

The project includes `netlify.toml` for automatic configuration:

```bash
# Just push to GitHub and import on netlify.com
# Build command and redirects are pre-configured
```

### Firebase Functions

```bash
# Requires Firebase CLI
npm install -g firebase-tools
firebase login
firebase deploy --only functions
```

---

## Project Structure

```
Pravi/
├── public/
│   ├── hero-highway.png       # Hero background image
│   ├── grsa-logo.jpg          # Gujarat Road Safety Authority logo
│   ├── favicon.svg            # App favicon
│   └── icons.svg              # Icon sprites
│
├── src/
│   ├── components/
│   │   ├── AuditMap.jsx       # Leaflet map with routes + issue markers
│   │   ├── AuditStepper.jsx   # 10-step progress stepper UI
│   │   ├── Button.jsx         # Reusable button with loading state
│   │   ├── Card.jsx           # Reusable card container
│   │   ├── Navbar.jsx         # Role-aware navigation bar
│   │   ├── ProtectedRoute.jsx # Route guard (auth + role check)
│   │   └── StatusBadge.jsx    # Color-coded status pills
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx    # Firebase auth + role detection
│   │
│   ├── lib/
│   │   ├── auditSteps.js     # Step definitions + blank audit factory
│   │   ├── fetchRoute.js     # Google Directions API integration
│   │   ├── firebase.js       # Firebase app initialization
│   │   ├── generateAuditPDF.js # PDF report generator
│   │   └── validation.js     # Phone number validation
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx  # All audits + create + map
│   │   │   └── AdminAuditDetail.jsx # Single audit management
│   │   │
│   │   ├── audit-steps/
│   │   │   ├── TeamSelection.jsx
│   │   │   ├── BackgroundData.jsx
│   │   │   ├── CommencementMeeting.jsx
│   │   │   ├── DeskStudy.jsx
│   │   │   ├── SiteInspection.jsx    # GPS + camera + AI validation
│   │   │   ├── SafetyIssues.jsx
│   │   │   ├── AuditReport.jsx       # PDF generation
│   │   │   ├── CompletionMeeting.jsx
│   │   │   ├── DesignerResponse.jsx
│   │   │   └── ImplementationStatus.jsx
│   │   │
│   │   ├── AuditPage.jsx      # 10-step workflow orchestrator
│   │   ├── DashboardPage.jsx   # Auditor portal
│   │   ├── DesignerPortal.jsx  # Designer portal
│   │   ├── HistoryPage.jsx     # Audit history
│   │   └── LoginPage.jsx       # Government-styled login
│   │
│   ├── App.jsx                 # Routes + role-based navigation
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind + Leaflet CSS
│
├── functions/
│   ├── index.js               # Cloud Functions (Twilio SMS)
│   └── package.json           # Functions dependencies
│
├── .env                       # API keys (not committed in production)
├── firebase.json              # Firebase deployment config
├── .firebaserc                # Firebase project link
├── netlify.toml               # Netlify deployment config
├── package.json               # Frontend dependencies
└── vite.config.js             # Vite configuration
```

---

## Demo Walkthrough

### Step 1: Login

Open the app → You see the government-themed landing page with GRSA branding.

| Login As | Email | What You See |
|----------|-------|-------------|
| Admin | `admin@pravi.com` | Admin Dashboard with all audits |
| Auditor | `auditor@pravi.com` | Auditor Dashboard with assigned audits |
| Designer | `designer@pravi.com` | Designer Portal with issues to respond to |

### Step 2: Admin Creates an Audit

1. Login as **Admin**
2. Click **"New Audit"**
3. Fill in: Road Name, Location, Length (km)
4. Assign Auditor email + phone number
5. Assign Designer email + phone number
6. Click **"Create Audit"**
7. SMS notifications are sent (if Cloud Functions deployed)

### Step 3: Admin Sets Road Coordinates

1. Click on the audit card → Detail page
2. Scroll to **"Road Map & Coordinates"**
3. Enter start/end latitude and longitude
4. Click **"Save Coordinates"**
5. Google Directions API fetches the real driving route
6. Map shows the road stretch with start/end markers

### Step 4: Auditor Conducts Inspection

1. Login as **Auditor**
2. Click on the assigned audit
3. Work through steps 1–4 (Team, Background, Meeting, Desk Study)
4. **Step 5 — Site Inspection:**
   - Click "Start Tracking" → GPS tracks your movement
   - Take photos → AI validates they're road images
   - Walk/drive along the road
   - Click "Stop Tracking" → See distance and coverage %
5. **Step 6 — Safety Issues:**
   - Add issues with title, description, severity (High/Medium/Low)
6. **Step 7 — Generate Report:**
   - Click "Generate PDF" → Downloads full audit report
7. Click **"Submit Report"** → Status changes to "Report Submitted"

### Step 5: Admin Reviews

1. Login as **Admin**
2. See the audit with "Report Submitted" status
3. Click **"Approve Report"** or **"Reject Report"**
4. If approved → Can move to "Implementation"
5. View all issues with designer responses
6. Make admin decisions (Approve/Reject) on individual issues

### Step 6: Designer Responds

1. Login as **Designer**
2. See audits marked "Action Required"
3. Expand an audit → See all safety issues
4. For each issue:
   - Select response: Accepted / Rejected
   - Add response notes
   - Set implementation status
5. Save → When all issues responded, status moves to "Under Review"

### Step 7: View on Map

1. Login as **Admin**
2. Click **"View Map"** on the dashboard
3. See all audits plotted on the map
4. Road stretches shown as colored polylines
5. Issue markers: Red (High), Amber (Medium), Green (Low)
6. Click markers for issue details

---

## API Integrations

| Service | Purpose | API Used |
|---------|---------|----------|
| Firebase Auth | User login/signup | Email/Password provider |
| Firestore | Data storage | Collection: `audits` |
| Google Gemini | Image validation | `gemini-2.0-flash-lite` model |
| Google Maps | Driving routes | Directions JavaScript SDK |
| Twilio | SMS notifications | Messages API |
| Leaflet | Map rendering | OpenStreetMap tiles |

---

## Firestore Data Model

```javascript
audits/{auditId} {
  roadName: string,
  location: string,
  length: number,
  status: "Created" | "Assigned" | "In Progress" | ... | "Closed",

  // Team assignment
  assignedAuditor: string (email),
  assignedDesigner: string (email),
  auditorPhone: string (+919876543210),
  designerPhone: string (+919876543210),

  // Road coordinates
  roadStart: { lat: number, lng: number },
  roadEnd: { lat: number, lng: number },
  routePath: [{ lat, lng }, ...],     // Google Directions path
  routeDistanceKm: number,
  routeDurationMin: number,

  // 10 audit stages
  team: [{ name, role, qualification }],
  backgroundData: { trafficData, accidentData, notes },
  meetingNotes: { commencement: {...}, completion: {...} },
  deskStudy: { geometry, junctions, alignment, signage, drainage },
  inspection: { distance, coverage, status, imageUrls, path, dayNight },
  issues: [{ title, description, severity, designerResponse, ... }],
  report: {},
  responses: [],
  implementation: [],

  // Metadata
  currentStep: number,
  createdBy: string (email),
  timestamp: number
}
```

---

## License

This project is developed for the **Gujarat Road Safety Authority** under the **Roads & Buildings Department, Government of Gujarat**.

---

<p align="center">
  <strong>Built with React + Firebase + Tailwind CSS</strong><br />
  <em>Road Safety Audit System — Each Road, Safe Road</em>
</p>
