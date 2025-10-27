# NCDs Dashboard - GitHub Pages Deployment

## 📋 ภาพรวม

โปรเจคนี้เป็น Single-Page Application (SPA) ที่แยก Frontend ออกมาจาก Google Apps Script และ deploy บน GitHub Pages โดยเชื่อมต่อกับ Apps Script Backend ผ่าน API

## 🏗️ โครงสร้าง

```
docs/
├── index.html       # หน้าหลัก Dashboard
├── styles.css       # CSS styles
├── app.js           # JavaScript logic
└── README.md        # คู่มือนี้
```

## 🚀 วิธีการตั้งค่า GitHub Pages

### 1. Push โค้ดขึ้น GitHub

```bash
# สร้าง repository ใหม่บน GitHub
# จากนั้น push โค้ด

git init
git add .
git commit -m "Initial commit: NCDs Dashboard SPA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. เปิดใช้งาน GitHub Pages

1. ไปที่ repository บน GitHub
2. คลิก **Settings** (ด้านบน)
3. เลือก **Pages** จากเมนูด้านซ้าย
4. ที่ **Source** เลือก `Deploy from a branch`
5. ที่ **Branch** เลือก:
   - Branch: `main`
   - Folder: `/docs`
6. คลิก **Save**

รอสักครู่ จะมี URL ปรากฏขึ้น เช่น: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 3. ตั้งค่า Apps Script Backend

#### 3.1 Deploy Apps Script เป็น Web App

1. เปิด Google Apps Script project
2. ไปที่ **Deploy** > **New deployment**
3. เลือก **Web app**
4. ตั้งค่า:
   - **Description**: NCDs Dashboard API
   - **Execute as**: Me
   - **Who has access**: Anyone
5. คลิก **Deploy**
6. คัดลอก **Web app URL** (จะได้ URL ประมาณ `https://script.google.com/macros/s/...../exec`)

#### 3.2 เพิ่ม CORS Headers (ถ้าจำเป็น)

เพิ่มใน `code.gs`:

```javascript
function doGet(e) {
  const output = // ... your existing code
  return output
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
```

### 4. อัปเดต API URL ใน app.js

แก้ไขไฟล์ `docs/app.js` บรรทัดที่ 4:

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

เปลี่ยน `YOUR_DEPLOYMENT_ID` เป็น deployment ID ที่คัดลอกมาจากขั้นตอน 3.1

### 5. Push การเปลี่ยนแปลง

```bash
git add docs/app.js
git commit -m "Update API URL"
git push
```

รอสัก 1-2 นาที GitHub Pages จะ rebuild และ deploy อัตโนมัติ

## 🔧 การตั้งค่า Apps Script API Endpoints

ตรวจสอบว่า `code.gs` มี endpoints เหล่านี้:

### GET Endpoints

```javascript
// ดึงข้อมูล
?action=getData

// ตัวอย่าง Response:
{
  "success": true,
  "data": [...],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST Endpoints

```javascript
// Login
action=login&username=admin&password=1234

// Logout
action=logout

// Check Session
action=checkSession
```

## 📝 การใช้งาน

1. เปิด URL ของ GitHub Pages
2. Dashboard จะแสดงข้อมูล NCDs แบบ realtime
3. กดปุ่ม "Admin Login" เพื่อเข้าสู่ระบบจัดการ
4. เลือกกรองข้อมูลด้วย dropdown filters
5. สลับ Theme ได้ที่ปุ่มด้านขวาบน (🌙/☀️)

## 🎨 Features

- ✅ Single-Page Application (SPA)
- ✅ Dark/Light Theme
- ✅ Responsive Design
- ✅ Real-time Charts (ECharts)
- ✅ Data Filtering
- ✅ Secure Admin Login
- ✅ Fast Loading (CDN)

## 🔒 Security Notes

1. **API URL ไม่ควร hardcode ข้อมูลสำคัญ** - ใช้ environment หรือ config file
2. **Apps Script ต้องตั้ง permissions ให้ถูกต้อง** - "Anyone" สำหรับ public dashboard
3. **Session management** - Apps Script จัดการ session ผ่าน UserProperties และ ScriptProperties
4. **Data masking** - ชื่อ-นามสกุลถูก mask ก่อนส่งออกจาก API

## 🐛 Troubleshooting

### ปัญหา: ข้อมูลไม่โหลด

- ตรวจสอบ API_URL ใน `app.js` ว่าถูกต้อง
- เปิด Developer Console (F12) ดู error
- ตรวจสอบว่า Apps Script deployment status เป็น "Active"

### ปัญหา: CORS Error

- ตรวจสอบว่า Apps Script ตั้งค่า "Who has access" เป็น "Anyone"
- ลอง redeploy Apps Script ใหม่

### ปัญหา: Login ไม่ได้

- ตรวจสอบ username/password ใน Google Sheet (tab: user)
- ตรวจสอบ API endpoint ใน browser network tab

## 📚 เอกสารเพิ่มเติม

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [ECharts Documentation](https://echarts.apache.org/)

## 🔄 การอัปเดต

เมื่อต้องการอัปเดตโค้ด:

```bash
# แก้ไขไฟล์ใน docs/
git add .
git commit -m "Update: your changes"
git push
```

GitHub Pages จะ auto-deploy ภายใน 1-2 นาที

## 📧 ติดต่อ

หากมีปัญหาหรือข้อสงสัย กรุณาสร้าง Issue ใน repository นี้

---

**License**: MIT  
**Version**: 1.0.0  
**Last Updated**: 2024