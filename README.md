# Road Safety Audit System

A modern full-stack web app that simulates the complete **Road Safety Audit** lifecycle — from team selection to implementation tracking.

Built with **React + Vite**, **Tailwind CSS**, and **Firebase** (Auth, Firestore, Storage).

## Quick Start

```bash
npm install
# Add your Firebase config to .env (see .env for placeholders)
npm run dev
```

## Features

### 10-Step Audit Workflow

| Step | Feature |
|------|---------|
| 1. Team Selection | Add audit team members with roles |
| 2. Background Data | Upload traffic data, accident data, notes |
| 3. Commencement Meeting | Record meeting date and notes |
| 4. Desk Study | Checklist review (geometry, junctions, alignment, signage, drainage) |
| 5. Site Inspection | GPS tracking, Haversine distance, coverage validation, image capture |
| 6. Safety Issues | Document issues with severity levels (Low/Medium/High) |
| 7. Audit Report | Auto-generated summary with metrics |
| 8. Completion Meeting | Final review notes and outcomes |
| 9. Designer Response | Accept/reject each issue with justification |
| 10. Implementation | Track resolution status (Pending/In Progress/Completed) |

### Core Features

- Firebase Email/Password authentication
- Interactive stepper UI showing audit progress
- GPS-based site inspection with real-time distance tracking
- Camera capture (mobile) + file upload (desktop)
- Firestore persistence for all audit data
- Firebase Storage for inspection images
- Responsive design with modern UI

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore Database**
4. Enable **Storage**
5. Copy your web app config into `.env`

### Firestore Indexes

The app queries audits by `createdBy` + `timestamp`. Firebase will prompt you to create a composite index — follow the link in the browser console on first load.

## Deployment

```bash
npm run build    # Build for production
npm run preview  # Preview locally
```

### Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `VITE_FIREBASE_*` env vars in project settings
4. Deploy

### Netlify

1. Push to GitHub
2. Import on [netlify.com](https://netlify.com)
3. Build command: `npm run build` | Publish: `dist`
4. Add `VITE_FIREBASE_*` env vars
5. Add `public/_redirects` with: `/* /index.html 200`

## Project Structure

```
src/
├── components/           Reusable UI (Navbar, Card, Button, AuditStepper, etc.)
├── contexts/             Auth context
├── lib/                  Firebase config, audit step definitions
├── pages/
│   ├── audit-steps/      10 step components (TeamSelection, DeskStudy, etc.)
│   ├── AuditPage.jsx     Main audit workflow page with stepper
│   ├── DashboardPage.jsx Audit creation + listing
│   ├── HistoryPage.jsx   Past audit records
│   └── LoginPage.jsx     Authentication
├── App.jsx               Routing
├── main.jsx              Entry point
└── index.css             Tailwind imports
```
