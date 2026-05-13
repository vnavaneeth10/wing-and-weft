// src/launchConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ ONE PLACE to control the launch date & bypass.
//    Both LaunchGate.tsx and ComingSoon.tsx import from here.
//
//    To go live early:  set BYPASS = true
//    To change time:    edit LAUNCH_DATE below (format: YYYY-MM-DDTHH:MM:SS+05:30)
// ─────────────────────────────────────────────────────────────────────────────

export const LAUNCH_DATE = new Date('2026-05-13T14:00:00+05:30');
export const BYPASS      = false;
