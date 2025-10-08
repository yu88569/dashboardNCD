# NCDs Dashboard - ระบบติดตามโรคไม่ติดต่อเรื้อรัง

## 🎉 ฟีเจอร์ใหม่: ระบบ Login และ Admin Panel

ระบบได้รับการอัปเดตให้มีความปลอดภัยมากขึ้นโดยแยกฟังก์ชันการจัดการข้อมูลออกเป็น Admin Panel ที่ต้อง login ก่อนใช้งาน

### 📋 การตั้งค่าเริ่มต้น

#### 1. สร้าง Sheet สำหรับเก็บข้อมูล User

ใน Google Sheets ให้สร้าง sheet ใหม่ชื่อ **`user`** พร้อมโครงสร้างดังนี้:

| username | password |
|----------|----------|
| admin    | admin123 |
| user1    | pass1234 |

**หมายเหตุ:** ควรเปลี่ยน username และ password เป็นของคุณเอง

#### 2. Deploy Web App

1. เปิด Google Apps Script Editor
2. คลิก **Deploy** > **New deployment**
3. เลือก type เป็น **Web app**
4. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone** (หรือตามความต้องการ)
5. คลิก **Deploy**

### 🔐 วิธีการใช้งาน

#### หน้า Dashboard (Public)
- **URL:** `https://script.google.com/...your-url...`
- ดูข้อมูลสถิติและกราฟ NCDs
- ไม่ต้อง login
- **ไม่สามารถ**เพิ่มรายการหรือนำเข้าข้อมูลได้
- มีปุ่ม **"🔐 Admin Login"** สำหรับไปหน้า admin

#### หน้า Admin Panel (Protected)
- **URL:** `https://script.google.com/...your-url...?page=admin`
- ต้อง login ด้วย username/password ที่ตั้งไว้ใน sheet `user`
- สามารถ:
  - ✅ เพิ่มรายการใหม่
  - ✅ นำเข้าข้อมูลจาก CSV/Excel
  - ✅ ดาวน์โหลด Template
  - 🚪 ออกจากระบบ (กลับไปหน้า Dashboard)

### 🛡️ ความปลอดภัย

- **Session Management:** ระบบจะจำ session เป็นเวลา 24 ชั่วโมง
- **Auto Logout:** หลังจาก 24 ชั่วโมงจะ logout อัตโนมัติ
- **Protected Routes:** หน้า admin จะ redirect ไปหน้า login ถ้ายังไม่ login

### 📂 โครงสร้างไฟล์

```
📦 dashboardNCD
├── 📄 code.gs              # Backend logic + Authentication
├── 📄 index.html           # Dashboard (Public)
├── 📄 Login.html           # Login page
├── 📄 Admin.html           # Admin panel
├── 📄 Header.html          # Dashboard header
├── 📄 Kpis.html            # KPI cards
├── 📄 Charts.html          # Charts section
├── 📄 Table.html           # Data table
├── 📄 Modals.html          # Form modals
├── 📄 Scripts.html         # Dashboard scripts
├── 📄 AdminScripts.html    # Admin panel scripts
└── 📄 Styles.html          # CSS styles
```

### 🔧 ฟังก์ชันใน code.gs

#### Authentication Functions
- `login(username, password)` - ตรวจสอบและสร้าง session
- `logout()` - ล้าง session
- `getSession()` - ดึงข้อมูล session ปัจจุบัน
- `checkSession()` - เช็คว่า login อยู่หรือไม่

#### Data Management Functions
- `getDataObj()` - ดึงข้อมูล NCDs
- `addSingleRecord(recordData)` - เพิ่ม/อัปเดตรายการเดียว
- `importData(csvData)` - นำเข้าข้อมูลจาก CSV
- `getTemplateUrl()` - สร้าง template file

### 🎨 Features

- **Dark/Light Theme:** สลับธีมได้ทั้งหน้า dashboard และ admin
- **Responsive Design:** ใช้งานได้บนมือถือและคอมพิวเตอร์
- **Data Caching:** แคชข้อมูลเพื่อความเร็ว (5 นาที)
- **Privacy Protection:** ปกปิดชื่อ-นามสกุลอัตโนมัติ

### 🚀 Quick Start

1. ตั้งค่า sheet `user` ตามด้านบน
2. Deploy web app (**สำคัญ: ต้อง deploy ใหม่ทุกครั้งที่แก้ code.gs**)
3. เข้าหน้า dashboard: `your-url`
4. คลิกปุ่ม **"🔐 Admin Login"** หรือเข้า `your-url?page=admin` โดยตรง
5. Login ด้วย username/password → ระบบจะพาเข้าหน้า Admin Panel อัตโนมัติ
6. เริ่มจัดการข้อมูล!
7. เสร็จแล้วคลิก **"🚪 ออกจากระบบ"** → กลับไปหน้า Dashboard อัตโนมัติ

### ⚠️ หมายเหตุสำคัญ

- **ต้อง Deploy ใหม่**: หลังแก้ไข `code.gs` ต้อง deploy เป็น **New deployment** หรือ **Manage deployments > Edit > Version: New version**
- **URL จะเปลี่ยน**: ถ้า deploy แบบ test จะได้ URL แบบ `/dev` ถ้า deploy แบบ production จะได้ URL แบบ `/exec`
- **Session timeout**: Session จะหมดอายุหลัง 24 ชั่วโมง

### 💡 Tips

- เปลี่ยน password ใน sheet `user` บ่อยๆ
- ใช้ username/password ที่รัดกุม
- ไม่แชร์ URL หน้า admin ให้คนที่ไม่จำเป็น
- backup ข้อมูลใน Google Sheets เป็นประจำ

---

**สร้างโดย:** GitHub Copilot
**อัปเดตล่าสุด:** October 2025
