// src/LaunchGate.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop this wrapper around your <App /> in main.tsx.
// Before April 15 2026 12:00 AM IST → shows ComingSoon page
// On/after April 15 2026 12:00 AM IST → shows normal website
//
// TO DISABLE (when you're ready to go live early):
//   Change LAUNCH_DATE to a past date, OR
//   Set BYPASS to true
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ComingSoon from './components/ComingSoon/ComingSoon';

// ✅ Change this date to go live early, or set BYPASS = true
const LAUNCH_DATE = new Date('2026-04-15T00:00:00+05:30');
const BYPASS      = true; // set true to skip the countdown and always show the site

const LaunchGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (BYPASS) return <>{children}</>;
  const isLaunched = Date.now() >= LAUNCH_DATE.getTime();
  return isLaunched ? <>{children}</> : <ComingSoon />;
};

export default LaunchGate;
