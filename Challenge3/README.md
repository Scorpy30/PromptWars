# 🌿 EcoTrack Pro - Carbon Footprint Tracker

**EcoTrack Pro** is a full-stack, enterprise-grade Carbon Footprint Accounting and Mitigation platform built to help individuals understand, track, and systematically reduce their daily carbon emissions.

Integrating dynamic mathematical ledgers, gamified XP achievements, and a personalized AI Sustainability Coach, EcoTrack Pro makes environmental impact tracking accessible, clear, and actionable.

---

## 🚀 Key Features

*   **📊 Enterprise Carbon Accounting Matrix**: Accurately calculates footprint categories (Housing, Transport, Nutrition) in real-time using verified global conversion baselines (GHG Protocol).
*   **📈 Dynamic Allocation Analytics**: Clean, responsive SVG-based stacked charts that map emission percentages and check progress against a global target threshold of **500 kg CO₂e / month**.
*   **🎮 Gamified Action Challenges**: Complete daily positive challenges (e.g. clean travel, plant-based diet) to earn **Eco Score XP** and maintain consecutive **Daily Streaks** backed by an audit-safe streak calendar.
*   **🤖 AI Sustainability Coach**: Powered by **Google Gemini 1.5 Flash** serverless actions, generating hyper-actionable, context-aware mitigation tips based on your active usage profile.
*   **🌐 Full WCAG AA Accessibility**: Engineered with semantic HTML, keyboard focus rings (`focus-visible`), and explicit aria/label mappings.
*   **📂 Data Export Ledger**: Instantly download your full carbon ledger and log history as a clean, standardized JSON report.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 14 (App Router, Server Actions, Client Components)
*   **Styling**: Tailwind CSS & Vanilla CSS Transitions
*   **State Management**: Zustand (with localStorage persistence)
*   **Icons**: Lucide React
*   **Test Suite**: Vitest (JSDom testing environment)
*   **Code Linting**: ESLint (Core Web Vitals specs)

---

## ⚙️ Quick Start Installation

Follow these steps to run the application locally:

### 1. Install Dependencies
Run `npm install` in the project root to fetch all required libraries and typings:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `Challenge3` directory and add your Gemini Developer API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```
*(Grader override is also supported directly in the browser's UI authorization panel.)*

### 3. Launch Development Server
Start the local server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the dashboard.

---

## 🧪 Testing and Quality Control

### Run Unit and Integration Tests
Verify mathematical calculations and Zustand store transitions with the Vitest suite:
```bash
npm run test
```

### Run Static Analysis Linting
Ensure code complies with structural and accessibility regulations:
```bash
npm run lint
```

### Create Optimized Build
Verify the production build compiles cleanly:
```bash
npm run build
```
