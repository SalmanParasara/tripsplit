# TripSplit
TripSplit is a Firebase-backed group trip planner with expense splitting, deposits, and deterministic settlements.

## Setup
Use Node 22+. Copy `.env.example` to `.env.local`, create a Firebase web app, and fill each `NEXT_PUBLIC_FIREBASE_*` value. In Firebase Authentication enable the Google provider and create a Firestore database. Deploy security rules and indexes with `firebase deploy --only firestore` after configuring the Firebase CLI.

Run `npm install`, `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

## Security and data
All trip reads and writes are enforced by `firestore.rules`; membership documents authorize access, and owners manage trip metadata and members. The app stores UIDs—not names—as references. `firestore.indexes.json` currently requires no composite indexes.

## Accounting
Money is stored as integer minor units. Vendor payments less expense shares determine settlement. Deposits are separate shared-pool contributions and never affect settlement net balances; remaining pool is deposits minus vendor payments. See `src/lib/calculations/README.md`.

## PWA and deployment
The manifest and service worker are in `public/`. Deploy to any HTTPS-compatible Next.js host. Android exposes the browser install experience; on iOS use Safari Share → Add to Home Screen.
