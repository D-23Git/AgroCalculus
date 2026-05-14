<div align="center">
  <img src="./screenshots/logo.png" alt="AgroCalculus Logo" width="150" height="150" />
  <h1>🌾 AgroCalculus</h1>
  <p><strong>A Next-Generation Digital Ecosystem for Modern Agriculture</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/MongoDB_Atlas-Multi--DB-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Node.js-Express-lightgrey?style=for-the-badge&logo=node.js" alt="Node" />
  </p>
</div>

---

## 🌟 Overview

**AgroCalculus** is a comprehensive, production-ready platform designed to empower farmers and agricultural officers. It bridges the gap between traditional farming and digital administration by providing a hyper-local, bilingual (English/Marathi) dashboard for market prices, government schemes, and community networking.

### 📸 Project Screenshots

<details open>
  <summary><b>1. Login & Authentication</b></summary>
  <br/>
  <img src="./screenshots/login.png" alt="Login Page" width="800" />
  <p><i>Secure OTP-based login system for Farmers and APMC Staff.</i></p>
</details>

<details open>
  <summary><b>2. Mandi Explorer (Market Page)</b></summary>
  <br/>
  <img src="./screenshots/market.png" alt="Market Dashboard" width="800" />
  <p><i>Live market prices powered by Gov.in API, alongside logistics and APMC staff controls.</i></p>
</details>

<details open>
  <summary><b>3. Government Schemes</b></summary>
  <br/>
  <img src="./screenshots/schemes.png" alt="Schemes Portal" width="800" />
  <p><i>Premium dark-glassmorphism portal for applying to and tracking official schemes.</i></p>
</details>

<details open>
  <summary><b>4. Village Connect</b></summary>
  <br/>
  <img src="./screenshots/village.png" alt="Village Connect" width="800" />
  <p><i>Community networking for localized problem solving and alerts.</i></p>
</details>

---

## 🚀 Key Features

*   **🌐 Real-Time Government APIs:** Integrated directly with `data.gov.in` to fetch and verify live APMC Mandi prices.
*   **🛡️ Multi-Database Architecture:** Utlizes a 5-way isolated MongoDB cluster (`AuthDB`, `LedgerDB`, `MarketDB`, `VillageDB`, `SchemesDB`) ensuring zero single-points-of-failure.
*   **🎭 Role-Based Access Control (RBAC):** Distinct, secure interfaces for Farmers and APMC Logistics Officers (Gate Pass management).
*   **💎 Premium UI/UX:** Built with modern CSS (Glassmorphism, Floating Action Pills, and dynamic micro-animations) to deliver an immersive 'Command Center' feel.
*   **🌍 Bilingual Localization:** Seamlessly switch between English and Marathi contextually.

---

## 🛠️ Tech Stack

### Frontend
*   **React 18:** Modern functional components with hooks.
*   **Vanilla CSS:** Zero dependencies, high-performance styling using CSS variables and flex/grid.
*   **Chart.js:** For visual data analytics.

### Backend
*   **Node.js / Express:** High-concurrency RESTful API.
*   **MongoDB Mongoose:** Complex multi-connection pooling for isolated architecture.
*   **15+ Data Models:** Comprehensive schemas covering everything from Grievances to Logistics.

---

## ⚙️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/D-23Git/AgroCalculus.git
cd AgroCalculus
```

### 2. Setup Frontend
```bash
npm install
npm start
```

### 3. Setup Backend
```bash
cd backend
npm install
# Create a .env file with your MONGO_URI
npm start
```

---
<div align="center">
  <i>Built for the Future of Indian Agriculture.</i>
</div>
