// src/LaunchGate.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Wraps <App /> in main.tsx.
// ✅ To change launch time or bypass → edit src/launchConfig.ts ONLY.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import ComingSoon from './components/ComingSoon/ComingSoon';
import { LAUNCH_DATE, BYPASS } from './launchConfig';

const LaunchGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ Re-check every second so the site auto-shows the moment time is up
  const [isLaunched, setIsLaunched] = useState(
    () => Date.now() >= LAUNCH_DATE.getTime()
  );

  useEffect(() => {
    if (BYPASS || isLaunched) return; // already live, no need to poll

    const id = setInterval(() => {
      if (Date.now() >= LAUNCH_DATE.getTime()) {
        setIsLaunched(true);
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  if (BYPASS || isLaunched) return <>{children}</>;
  return <ComingSoon />;
};

export default LaunchGate;