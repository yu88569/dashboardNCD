# 📚 Documentation

คู่มือและเอกสารประกอบสำหรับ NCDs Dashboard

---

## 📖 เอกสารทั้งหมด

### 🚀 การเริ่มต้นใช้งาน

| เอกสาร | รายละเอียด |
|--------|-----------|
| [**QUICKSTART.md**](QUICKSTART.md) | เริ่มต้นใช้งานใน 5 นาที - คู่มือแบบย่อ |
| [**SETUP-GITHUB-PAGES.md**](SETUP-GITHUB-PAGES.md) | คู่มือตั้งค่า GitHub Pages แบบละเอียด |
| [**DEPLOY-INSTRUCTIONS.md**](DEPLOY-INSTRUCTIONS.md) | คู่มือการ deploy ทั้งระบบ |

---

### 🔧 Technical Documentation

| เอกสาร | รายละเอียด |
|--------|-----------|
| [**GOOGLE-SHEET-STRUCTURE.md**](GOOGLE-SHEET-STRUCTURE.md) | โครงสร้างฐานข้อมูล Google Sheets |
| [**README-AppsScript.md**](README-AppsScript.md) | คู่มือ Apps Script Backend |
| [**SESSION-FIX.md**](SESSION-FIX.md) | การแก้ไขปัญหา Session Management |

---

## 🎯 เริ่มต้นที่ไหนดี?

### 👋 ผู้ใช้งานทั่วไป
เริ่มที่: [QUICKSTART.md](QUICKSTART.md)

### 👨‍💻 นักพัฒนา (Developer)
1. อ่าน [SETUP-GITHUB-PAGES.md](SETUP-GITHUB-PAGES.md) - Setup Frontend
2. อ่าน [../apps-script/README.md](../apps-script/README.md) - Setup Backend
3. อ่าน [GOOGLE-SHEET-STRUCTURE.md](GOOGLE-SHEET-STRUCTURE.md) - เตรียมฐานข้อมูล

### 🔧 ผู้ดูแลระบบ (Admin)
1. อ่าน [DEPLOY-INSTRUCTIONS.md](DEPLOY-INSTRUCTIONS.md) - คู่มือ Deploy
2. อ่าน [SESSION-FIX.md](SESSION-FIX.md) - แก้ปัญหา Session

---

## 📂 โครงสร้างเอกสาร

```
docs/
├── README.md                      # เอกสารนี้ (สารบัญ)
│
├── 🚀 Getting Started
│   ├── QUICKSTART.md              # เริ่มต้นใน 5 นาที
│   ├── SETUP-GITHUB-PAGES.md      # Setup Frontend
│   └── DEPLOY-INSTRUCTIONS.md     # Deploy ทั้งระบบ
│
└── 🔧 Technical Guides
    ├── GOOGLE-SHEET-STRUCTURE.md  # Database Schema
    ├── README-AppsScript.md       # Backend Guide
    └── SESSION-FIX.md             # Troubleshooting
```

---

## 🔗 Related Files

- [`../README.md`](../README.md) - Project README (หน้าหลัก)
- [`../apps-script/README.md`](../apps-script/README.md) - Backend Deployment Guide
- [`../config.js`](../config.js) - Frontend Configuration
- [`../apps-script/code.gs`](../apps-script/code.gs) - Backend Source Code

---

## 💡 Quick Links

### Frontend (GitHub Pages)
- **Live Site**: https://yu88569.github.io/dashboardNCD/
- **Repository**: https://github.com/yu88569/dashboardNCD
- **Source Code**: `../index.html`, `../app.js`, `../styles.css`

### Backend (Apps Script)
- **Source Code**: `../apps-script/code.gs`
- **Deployment**: Google Apps Script Web App
- **Database**: Google Sheets

---

## 📝 การอัปเดตเอกสาร

หากต้องการแก้ไขหรือเพิ่มเติมเอกสาร:

1. แก้ไขไฟล์ `.md` ที่ต้องการ
2. Commit และ Push
   ```bash
   git add docs/
   git commit -m "docs: Update documentation"
   git push
   ```

---

## 🤝 Contributing

หากพบข้อผิดพลาดหรือต้องการเพิ่มเติมเอกสาร:
1. Fork repository
2. แก้ไขเอกสาร
3. สร้าง Pull Request

---

## 📞 ต้องการความช่วยเหลือ?

- 🐛 [Report Issues](https://github.com/yu88569/dashboardNCD/issues)
- 💬 [Discussions](https://github.com/yu88569/dashboardNCD/discussions)
- 📧 Contact: ผ่าน GitHub Issues

---

**Last Updated**: 2024  
**Status**: Complete ✅