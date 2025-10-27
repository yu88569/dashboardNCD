# คู่มือการตั้งค่า NCDs Dashboard บน GitHub Pages

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [เตรียมความพร้อม](#เตรียมความพร้อม)
3. [ขั้นตอนที่ 1: ตั้งค่า Apps Script Backend](#ขั้นตอนที่-1-ตั้งค่า-apps-script-backend)
4. [ขั้นตอนที่ 2: Deploy บน GitHub Pages](#ขั้นตอนที่-2-deploy-บน-github-pages)
5. [ขั้นตอนที่ 3: เชื่อมต่อ Frontend กับ Backend](#ขั้นตอนที่-3-เชื่อมต่อ-frontend-กับ-backend)
6. [การทดสอบ](#การทดสอบ)
7. [การแก้ปัญหา](#การแก้ปัญหา)

---

## ภาพรวมระบบ

ระบบ NCDs Dashboard ประกอบด้วย 2 ส่วนหลัก:

### 🎨 Frontend (GitHub Pages)
- **ที่อยู่**: `docs/` folder
- **ไฟล์สำคัญ**: 
  - `index.html` - หน้า Dashboard หลัก
  - `app.js` - Logic และการเชื่อมต่อ API
  - `styles.css` - ธีมและรูปแบบ
- **เทคโนโลยี**: HTML, CSS, JavaScript, ECharts
- **Host**: GitHub Pages (ฟรี)

### ⚙️ Backend (Google Apps Script)
- **ที่อยู่**: Google Apps Script Project
- **ไฟล์สำคัญ**: `code.gs`
- **ฐานข้อมูล**: Google Sheets
- **API Endpoints**: GET/POST สำหรับดึงข้อมูลและ Login

---

## เตรียมความพร้อม

### สิ่งที่ต้องมี

- [ ] บัญชี GitHub (สมัครฟรีที่ https://github.com)
- [ ] บัญชี Google (สำหรับ Apps Script)
- [ ] Git ติดตั้งในเครื่อง (ดาวน์โหลดที่ https://git-scm.com)
- [ ] Text Editor (แนะนำ VS Code)
- [ ] Google Sheet ที่มีข้อมูล NCDs

### ตรวจสอบ Git

```bash
git --version
# ควรแสดง: git version 2.x.x
```

---

## ขั้นตอนที่ 1: ตั้งค่า Apps Script Backend

### 1.1 เปิดโปรเจค Apps Script

1. เปิด Google Sheet ที่มีข้อมูล NCDs
2. ไปที่เมนู **Extensions** > **Apps Script**
3. จะเปิดหน้าต่างใหม่เป็น Apps Script Editor

### 1.2 อัปเดต code.gs

คัดลอกโค้ดจากไฟล์ `code.gs` ในโปรเจคนี้ และวางลงใน Apps Script Editor

**สิ่งสำคัญที่ต้องแก้:**

```javascript
// บรรทัดที่ 5-8 ใน code.gs
const SHEET_ID = "YOUR_SHEET_ID";  // ← เปลี่ยนเป็น ID ของ Google Sheet
const SHEET_NAME = "ncd_db_central";  // ← ชื่อ tab ข้อมูล
const USER_SHEET_NAME = "user";  // ← ชื่อ tab ผู้ใช้งาน
```

**วิธีหา Sheet ID:**
- URL ของ Google Sheet: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
- Sheet ID คือ: `ABC123XYZ`

### 1.3 Deploy เป็น Web App

1. คลิกปุ่ม **Deploy** (ด้านบนขวา) > **New deployment**
2. คลิก icon ⚙️ > เลือก **Web app**
3. ตั้งค่าดังนี้:

   | ตัวเลือก | ค่า |
   |---------|-----|
   | Description | NCDs Dashboard API v1 |
   | Execute as | Me (YOUR_EMAIL@gmail.com) |
   | Who has access | **Anyone** |

4. คลิก **Deploy**
5. อนุญาตสิทธิ์ (Authorize access) > เลือกบัญชี > **Allow**
6. **คัดลอก Web app URL** (สำคัญมาก!)

   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec
   ```

### 1.4 ทดสอบ API

เปิดเบราว์เซอร์ใหม่แล้วเข้า:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getData
```

ควรเห็น JSON response:

```json
{
  "success": true,
  "data": [...],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

✅ **ถ้าเห็น JSON แสดงว่า Backend พร้อมแล้ว!**

---

## ขั้นตอนที่ 2: Deploy บน GitHub Pages

### 2.1 สร้าง Repository

1. ไปที่ https://github.com/new
2. ตั้งชื่อ Repository: `ncd-dashboard` (หรือชื่ือที่ต้องการ)
3. เลือก **Public**
4. **อย่า** tick "Add a README file"
5. คลิก **Create repository**

### 2.2 Push โค้ดขึ้น GitHub

เปิด Terminal/Command Prompt ใน folder `dashboardNCD`:

```bash
# ไปที่ folder โปรเจค
cd C:\Work-yu\dashboardNCD

# Initial git
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit: NCDs Dashboard SPA"

# เปลี่ยน branch เป็น main
git branch -M main

# เชื่อม repository (เปลี่ยน YOUR_USERNAME และ YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push
git push -u origin main
```

**หมายเหตุ:** ถ้าเป็นครั้งแรกใช้ Git อาจต้องตั้งค่า:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.3 เปิดใช้งาน GitHub Pages

1. ไปที่ repository บน GitHub
2. คลิก **Settings** (แท็บด้านบน)
3. เลือก **Pages** จากเมนูซ้าย
4. ตั้งค่า:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /docs
5. คลิก **Save**

รอ 1-2 นาที แล้ว refresh หน้า จะเห็น URL:

```
🎉 Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO/
```

---

## ขั้นตอนที่ 3: เชื่อมต่อ Frontend กับ Backend

### 3.1 แก้ไข API URL

เปิดไฟล์ `docs/app.js` บรรทัดที่ 4:

**ก่อนแก้:**
```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec';
```

**หลังแก้:**
```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec';
```

(ใช้ URL ที่คัดลอกจากขั้นตอน 1.3)

### 3.2 Push การเปลี่ยนแปลง

```bash
git add docs/app.js
git commit -m "Update API URL"
git push
```

รอ 1-2 นาที GitHub Pages จะ rebuild อัตโนมัติ

### 3.3 ทดสอบ

เปิด URL ของ GitHub Pages:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

ควรเห็น:
- 📊 Dashboard แสดงข้อมูล
- KPI Cards แสดงตัวเลข
- กราฟแสดงผลถูกต้อง

---

## การทดสอบ

### ✅ Checklist

- [ ] เปิดหน้า Dashboard ได้
- [ ] แสดงข้อมูล KPI (รวมทั้งหมด, เสี่ยง, ปกติ)
- [ ] แสดงกราฟ (ปัจจัยเสี่ยง, Top 10 ตำบล)
- [ ] กรอง (Filter) ข้อมูลได้
- [ ] สลับ Theme (🌙/☀️) ได้
- [ ] กด Admin Login เปิด Modal ได้
- [ ] Responsive (ลองเปิดบนมือถือ)

### ทดสอบ Admin Login

1. คลิกปุ่ม **🔐 Admin Login**
2. กรอก username และ password (จาก Google Sheet > tab "user")
3. คลิก **Login**
4. ควรแสดง "✅ เข้าสู่ระบบสำเร็จ"

---

## การแก้ปัญหา

### ❌ ปัญหา: ข้อมูลไม่แสดง

**สาเหตุ:**
- API URL ไม่ถูกต้อง
- Apps Script ยังไม่ Deploy
- CORS Error

**วิธีแก้:**

1. เปิด Developer Console (กด F12)
2. ดูใน Console tab มี error อะไร
3. ถ้าเห็น CORS error:
   - ตรวจสอบ Apps Script deployment "Who has access" = Anyone
   - ลอง redeploy ใหม่

4. ถ้าเห็น 404 error:
   - ตรวจสอบ API_URL ใน app.js ว่าถูกต้อง

### ❌ ปัญหา: GitHub Pages ไม่อัปเดต

**วิธีแก้:**

1. ไปที่ repository > Actions tab
2. ดูว่า workflow run เสร็จหรือยัง
3. ลอง Hard Refresh: `Ctrl + F5` (Windows) หรือ `Cmd + Shift + R` (Mac)
4. ลบ cache เบราว์เซอร์

### ❌ ปัญหา: Login ไม่ได้

**ตรวจสอบ:**

1. Google Sheet > tab "user" มีข้อมูลหรือไม่
2. คอลัมน์ต้องมี: `username`, `password`, `อำเภอ`
3. ข้อมูลตรงกับที่กรอกหรือไม่ (case-sensitive)

**ทดสอบ API โดยตรง:**

เปิดเบราว์เซอร์:
```
https://script.google.com/macros/s/YOUR_ID/exec
```

Method: POST
Body:
```
action=login&username=admin&password=1234
```

### ❌ ปัญหา: กราฟไม่แสดง

**วิธีแก้:**

1. ตรวจสอบ ECharts CDN โหลดได้หรือไม่:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
   ```

2. เปิด Console ดู error
3. ลอง refresh หน้าใหม่

---

## 🎯 เสร็จสิ้น!

ตอนนี้คุณมี NCDs Dashboard SPA ที่:

✅ Deploy บน GitHub Pages (ฟรี)  
✅ เชื่อมต่อ Google Sheets ผ่าน Apps Script  
✅ Responsive และใช้งานได้บนมือถือ  
✅ มี Dark/Light Theme  
✅ มีระบบ Admin Login  

---

## 📚 เอกสารเพิ่มเติม

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Google Apps Script Guide](https://developers.google.com/apps-script)
- [ECharts Documentation](https://echarts.apache.org/)

---

## 🆘 ติดต่อ/ขอความช่วยเหลือ

หากมีปัญหาหรือข้อสงสัย:

1. สร้าง Issue ใน GitHub repository
2. ส่ง screenshot ของ error ใน Console
3. แนบ URL ของ GitHub Pages และ Apps Script deployment

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**License**: MIT