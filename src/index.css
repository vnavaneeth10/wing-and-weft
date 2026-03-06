@tailwind base;
@tailwind components;
@tailwind utilities;

/* ========== CSS Variables ========== */
:root {
  --cream: #e9e3cb;
  --red: #bc3d3e;
  --orange: #e69358;
  --gold: #b6893c;
  --dark-bg: #1a1410;
  --dark-card: #231d17;
  --transition: all 0.3s ease;
}

/* ========== Base ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Raleway", sans-serif;
  background-color: #faf8f2;
  color: #2a1f1a;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.dark body,
.dark {
  background-color: #1a1410;
  color: #f0e8d6;
}

/* ========== Scrollbar ========== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f0ebe0;
}
::-webkit-scrollbar-thumb {
  background: #bc3d3e;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9e3233;
}
.dark ::-webkit-scrollbar-track {
  background: #231d17;
}

/* ========== Selection ========== */
::selection {
  background: #bc3d3e;
  color: #fff;
}

/* ========== Typography ========== */
.font-display {
  font-family: "Cormorant Garamond", Georgia, serif;
}
.font-accent {
  font-family: "Playfair Display", serif;
}
.font-body {
  font-family: "Raleway", sans-serif;
}

/* ========== Focus Outline for Accessibility ========== */
:focus-visible {
  outline: 2px solid #bc3d3e;
  outline-offset: 2px;
}

/* ========== Shimmer Effect ========== */
.shimmer {
  background: linear-gradient(90deg, #f0ebe0 25%, #e5ddd0 50%, #f0ebe0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.dark .shimmer {
  background: linear-gradient(90deg, #231d17 25%, #2e2520 50%, #231d17 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ========== Horizontal auto-scroll ========== */
.auto-scroll-container {
  display: flex;
  width: max-content;
  animation: scrollLeft 35s linear infinite;
}
.auto-scroll-container:hover {
  animation-play-state: paused;
}

@keyframes scrollLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ========== Loading Screen ========== */
.loading-screen {
  position: fixed;
  inset: 0;
  background: #1a1410;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-motif {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.06;
}

.loading-motif-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e9e3cb, transparent);
  animation: motifSweep 3s ease-in-out infinite;
}

@keyframes motifSweep {
  0% {
    top: -5%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 105%;
    opacity: 0;
  }
}

.loader-ring {
  width: 70px;
  height: 70px;
  border: 3px solid rgba(233, 227, 203, 0.15);
  border-top-color: #bc3d3e;
  border-right-color: #b6893c;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== Banner ========== */
.banner-slide {
  animation: bannerScale 8s ease-in-out infinite alternate;
}

@keyframes bannerScale {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
}

/* ========== Ribbon ========== */
.ribbon-text {
  display: flex;
  white-space: nowrap;
  animation: ribbon 30s linear infinite;
}
.ribbon-text:hover {
  animation-play-state: paused;
}

@keyframes ribbon {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ========== Decorative ========== */
.saree-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #b6893c,
    #bc3d3e,
    #b6893c,
    transparent
  );
}

.section-ornament::before,
.section-ornament::after {
  content: "◆";
  color: #b6893c;
  font-size: 0.5rem;
  margin: 0 0.5rem;
}

/* ========== Card Hover ========== */
.product-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(188, 61, 62, 0.15);
}

/* ========== Accordion ========== */
.accordion-content {
  overflow: hidden;
  transition:
    max-height 0.4s ease,
    opacity 0.3s ease;
}

/* ========== WhatsApp Float ========== */
.whatsapp-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* ========== Glass morphism ========== */
.glass {
  background: rgba(233, 227, 203, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(233, 227, 203, 0.15);
}
.dark .glass {
  background: rgba(26, 20, 16, 0.7);
  border: 1px solid rgba(182, 137, 60, 0.2);
}

/* ========== Swipe hide scrollbar ========== */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* ========== Pattern overlay ========== */
.pattern-overlay {
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b6893c' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10S0 14.5 0 20s4.5 10 10 10 10-4.5 10-10zm10-10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}
.fade-in-up-delay-1 {
  animation-delay: 0.1s;
  opacity: 0;
}
.fade-in-up-delay-2 {
  animation-delay: 0.2s;
  opacity: 0;
}
.fade-in-up-delay-3 {
  animation-delay: 0.3s;
  opacity: 0;
}
.fade-in-up-delay-4 {
  animation-delay: 0.4s;
  opacity: 0;
}

/* Star rating */
.star-filled {
  color: #b6893c;
}
.star-empty {
  color: #d4cdb0;
}

/* Range slider */
input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: linear-gradient(
    to right,
    #bc3d3e var(--val, 50%),
    #d4cdb0 var(--val, 50%)
  );
  border-radius: 2px;
  outline: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #bc3d3e;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(188, 61, 62, 0.2);
}
