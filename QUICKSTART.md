# 🚀 Quick Start Guide - NCDs Dashboard

## เริ่มต้นใช้งานใน 5 นาที!

### ✅ สิ่งที่ต้องมี

- [ ] บัญชี GitHub
- [ ] บัญชี Google (สำหรับ Apps Script)
- [ ] Google Sheet ที่มีข้อมูล NCDs

---

## 📝 ขั้นตอนสั้นๆ

### 1️⃣ Setup Apps Script (2 นาที)

```bash
1. เปิด Google Sheet → Extensions → Apps Script
2. คัดลอกโค้ดจาก code.gs วางใน Apps Script Editor
3. แก้ไข SHEET_ID, SHEET_NAME, USER_SHEET_NAME
4. Deploy → New deployment → Web app
5. Execute as: Me, Who has access: Anyone
6. คัดลอก Web app URL
```

**Web app URL ตัวอย่าง:**
```
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec
```

---

### 2️⃣ Deploy GitHub Pages (2 นาที)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 2. Enable GitHub Pages
Settings → Pages → Source: main, Folder: /docs → Save
```

**รอ 1-2 นาที แล้วได้ URL:**
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

---

### 3️⃣ เชื่อมต่อ API (1 นาที)

แก้ไขไฟล์ `docs/app.js` บรรทัดที่ 4:

```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycbxXXXXX/exec';
//                                                    ↑
//                            วาง Web app URL ที่คัดลอกมา
```

Push อัปเดต:

```bash
git add docs/app.js
git commit -m "Update API URL"
git push
```

---

## 🎉 เสร็จแล้ว!

เปิดเบราว์เซอร์:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

ควรเห็น Dashboard พร้อมข้อมูล! 🎊

---

## 🔍 ตรวจสอบว่าทำงานหรือไม่

### ✅ Checklist

- [ ] เปิดหน้า Dashboard ได้
- [ ] แสดงตัวเลข KPI
- [ ] แสดงกราฟ
- [ ] Filter ทำงาน
- [ ] สลับ Theme ได้

### ❌ ถ้าไม่ทำงาน

1. กด `F12` เปิด Developer Console
2. ดูใน Console tab มี error อะไร
3. ตรวจสอบ API_URL ถูกต้อง
4. ทดสอบ API โดยตรง:
   ```
   https://script.google.com/macros/s/YOUR_ID/exec?action=getData
   ```
   ควรเห็น JSON response

---

## 📚 อ่านเพิ่มเติม

- **รายละเอียดเต็ม**: `SETUP-GITHUB-PAGES.md`
- **โครงสร้างข้อมูล**: `GOOGLE-SHEET-STRUCTURE.md`
- **การแก้ปัญหา**: ดูใน `SETUP-GITHUB-PAGES.md` หัวข้อ "การแก้ปัญหา"

---

## 🆘 ติดปัญหา?

1. ตรวจสอบ Console error (F12)
2. ทดสอบ API ทำงานหรือไม่
3. ตรวจสอบ GitHub Pages status ใน Actions tab
4. สร้าง Issue ใน GitHub repository

---

**Happy Coding! 🎯**