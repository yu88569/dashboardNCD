# 📊 NCDs Dashboard

> ระบบติดตามและประเมินโรคไม่ติดต่อเรื้อรัง (Non-Communicable Diseases)

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success)](https://yu88569.github.io/dashboardNCD/)
[![Apps Script](https://img.shields.io/badge/Backend-Google%20Apps%20Script-green)](https://developers.google.com/apps-script)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 ภาพรวม

NCDs Dashboard เป็นระบบ Web Application สำหรับติดตามและวิเคราะห์ข้อมูลโรคไม่ติดต่อเรื้อรัง โดยแบ่งเป็น:

- **Frontend**: Single Page Application (SPA) - Deploy บน GitHub Pages
- **Backend**: REST API - ทำงานบน Google Apps Script
- **Database**: Google Sheets - เก็บข้อมูล NCDs และ user accounts

---

## ✨ Features

### 📈 Public Dashboard
- ✅ KPI Cards - สถิติรวม, เสี่ยง, ปกติ, เสร็จสิ้น
- ✅ Gender Statistics - แยกตามเพศ (ชาย, หญิง, พระสงฆ์)
- ✅ Interactive Charts - ปัจจัยเสี่ยง, Top 10 ตำบล, สถานะป่วย/เสี่ยง
- ✅ Data Filtering - กรองตามจังหวัด, อำเภอ, ตำบล, เพศ, สถานะ
- ✅ Dark/Light Theme Toggle
- ✅ Responsive Design

### 🔐 Admin Panel
- ✅ Secure Login - Authentication ผ่าน Google Sheets
- ✅ Session Management (24 ชั่วโมง)
- ✅ District-based Access Control
- ✅ Add/Edit/Delete Records
- ✅ CSV Import/Export
- ✅ Privacy Protection (Data Masking)

---

## 🚀 Quick Start

### 1️⃣ Setup Backend (Apps Script)

```bash
# 1. สร้าง Google Sheet พร้อม 2 tabs: ncd_db_central, user
# 2. เปิด Extensions → Apps Script
# 3. คัดลอกโค้ดจาก apps-script/code.gs
# 4. Deploy → New deployment → Web app
# 5. คัดลอก Web app URL
```

📖 **คู่มือละเอียด**: [apps-script/README.md](apps-script/README.md)

---

### 2️⃣ Setup Frontend (GitHub Pages)

```bash
# Clone repository
git clone https://github.com/yu88569/dashboardNCD.git
cd dashboardNCD

# แก้ไข config.js
# ใส่ Apps Script URL ที่ได้จากขั้นตอนที่ 1

# Push to GitHub
git add .
git commit -m "Update API URL"
git push
```

📖 **คู่มือละเอียด**: [docs/SETUP-GITHUB-PAGES.md](docs/SETUP-GITHUB-PAGES.md)

---

## 📂 โครงสร้างโปรเจค

```
dashboardNCD/
│
├── 🌐 Frontend (GitHub Pages)
│   ├── index.html          # หน้า Dashboard
│   ├── app.js              # JavaScript logic
│   ├── config.js           # API configuration
│   └── styles.css          # CSS styles
│
├── 🔧 Backend (Apps Script)
│   ├── code.gs             # Server-side logic
│   └── README.md           # Deploy instructions
│
├── 📚 Documentation
│   ├── GOOGLE-SHEET-STRUCTURE.md
│   ├── SETUP-GITHUB-PAGES.md
│   ├── QUICKSTART.md
│   └── DEPLOY-INSTRUCTIONS.md
│
└── 📁 Archive
    └── (ไฟล์เวอร์ชันเก่า)
```

---

## 🔧 Configuration

### Frontend Config (`config.js`)

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/YOUR_ID/exec",
  APP_NAME: "NCDs Dashboard",
  CACHE: {
    TTL_SECONDS: 300,  // 5 นาที
    ENABLED: true
  },
  THEME: {
    DEFAULT: "dark"
  }
};
```

### Backend Config (`apps-script/code.gs`)

```javascript
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID";
const SHEET_NAME = "ncd_db_central";
const USER_SHEET_NAME = "user";
const CACHE_TTL_SECONDS = 300;
```

---

## 🌐 Demo & URLs

- **Live Dashboard**: https://yu88569.github.io/dashboardNCD/
- **GitHub Repo**: https://github.com/yu88569/dashboardNCD
- **Documentation**: [docs/](docs/)

---

## 📊 Database Structure

### Tab: `ncd_db_central`
```
id | ชื่อ | นามสกุล | เพศ | จังหวัด | อำเภอ | ตำบล | ...
```

### Tab: `user`
```
username | password | อำเภอ
admin001 | pass1234 | เมือง
```

📖 **รายละเอียด**: [docs/GOOGLE-SHEET-STRUCTURE.md](docs/GOOGLE-SHEET-STRUCTURE.md)

---

## 🎨 Technology Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- ECharts 5 (Data Visualization)
- No framework needed

### Backend
- Google Apps Script (JavaScript)
- Google Sheets API

### Hosting
- GitHub Pages (Frontend - Free)
- Google Cloud (Backend - Free tier)

---

## 🔒 Security

- ✅ Session-based Authentication (24h)
- ✅ District-level Access Control
- ✅ Data Masking (ชื่อ-นามสกุล)
- ✅ HTTPS Only
- ✅ Server-side Session Storage

---

## 🐛 Troubleshooting

### ปัญหา: Dashboard ไม่โหลดข้อมูล

1. เปิด Developer Console (F12)
2. ตรวจสอบ error messages
3. ตรวจสอบ `config.js` → `API_URL` ถูกต้องหรือไม่
4. ทดสอบ API โดยตรง: `YOUR_API_URL?action=getData`

### ปัญหา: Login ไม่ได้

1. ตรวจสอบ username/password ใน Google Sheet (tab: `user`)
2. ตรวจสอบ Apps Script deployment status
3. ลองกด Deploy → New version

### ปัญหา: GitHub Pages แสดง 404

1. ไปที่ Settings → Pages
2. ตรวจสอบ Source: `Deploy from branch`
3. Branch: `main`, Folder: `/ (root)`
4. รอ 1-2 นาที แล้ว refresh

---

## 📚 เอกสารเพิ่มเติม

| เอกสาร | รายละเอียด |
|--------|-----------|
| [apps-script/README.md](apps-script/README.md) | Backend deployment guide |
| [docs/SETUP-GITHUB-PAGES.md](docs/SETUP-GITHUB-PAGES.md) | Frontend deployment guide |
| [docs/GOOGLE-SHEET-STRUCTURE.md](docs/GOOGLE-SHEET-STRUCTURE.md) | Database schema |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | เริ่มต้นใน 5 นาที |

---

## 🔄 การอัปเดต

### Frontend
```bash
# แก้ไขไฟล์ index.html, app.js, styles.css, config.js
git add .
git commit -m "Update: description"
git push

# GitHub Pages จะ deploy อัตโนมัติใน 1-2 นาที
```

### Backend
```
1. แก้ไข apps-script/code.gs ใน Apps Script Editor
2. Deploy → Manage deployments → Edit
3. Version: New version → Deploy
```

---

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. เปิด Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- Google Apps Script Team
- GitHub Pages
- ECharts Contributors
- Thai NCDs Healthcare Community

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/yu88569/dashboardNCD/issues)
- 💬 [Discussions](https://github.com/yu88569/dashboardNCD/discussions)

---

## 🗺️ Roadmap

- [ ] OAuth 2.0 Integration
- [ ] Multi-language Support (EN/TH)
- [ ] PDF Export
- [ ] Progressive Web App (PWA)
- [ ] Real-time Data Sync
- [ ] Advanced Analytics & Reports

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

---

**Made with ❤️ for Thai Healthcare Community**