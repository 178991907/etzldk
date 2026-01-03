# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-04

### 🚀 New Features
- **Frontend Logo Separation**: 
  - Implemented strictly separate logo management for the Dashboard (Frontend) and System Sidebar.
  - Added "Frontend Page Logo" setting in `Settings > Appearance`.
- **Adaptive Pet Sizing**: 
  - Dashboard pet viewer now scales to **100%** of its container for an immersive experience.
  - System settings pet preview remains compact for easier management.
- **Dynamic Favicon**: 
  - The browser tab icon (favicon) now automatically updates to match your custom App Logo.

### 🐛 Bug Fixes
- **Data Persistence**: Fixed issues where client-side changes weren't strictly persisting to LocalStorage in dev mode.
- **Localization**: Corrected missing translation keys for `frontendLogo` in both English and Chinese.
- **UI Adjustments**: Removed legacy "Edit Layout" buttons and fixed container responsiveness.

### 🛠 Tech Stack
- **Next.js 15**: Production-ready build configuration.
- **Storage**: Hybrid support (LocalStorage default for easy start, ready for PostgreSQL).
