# 🔧 Google Apps Script Backend

ไฟล์นี้เป็น **Backend** ของ NCDs Dashboard ที่ทำงานบน Google Apps Script

---

## 📁 ไฟล์ในโฟลเดอร์นี้

- `code.gs` - Server-side logic (Apps Script)

---

## 🚀 วิธี Deploy

### ขั้นตอนที่ 1: เตรียม Google Sheet

1. สร้าง Google Sheet ใหม่
2. สร้าง 2 tabs:
   - `ncd_db_central` - ข้อมูล NCDs
   - `user` - ข้อมูล Admin accounts

📖 ดูโครงสร้างข้อมูลที่: `../docs/GOOGLE-SHEET-STRUCTURE.md`

---

### ขั้นตอนที่ 2: สร้าง Apps Script Project

1. เปิด Google Sheet → **Extensions** → **Apps Script**
2. ลบโค้ดเริ่มต้นทิ้ง
3. คัดลอกโค้ดทั้งหมดจาก `code.gs` วางใน Editor
4. บันทึก (Ctrl + S)

---

### ขั้นตอนที่ 3: ตั้งค่า Configuration

แก้ไขค่าคงที่ในบรรทัดต้นๆ ของ `code.gs`:

```javascript
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID";      // ← ใส่ Sheet ID ของคุณ
const SHEET_NAME = "ncd_db_central";          // ← ชื่อ tab ข้อมูล NCDs
const USER_SHEET_NAME = "user";               // ← ชื่อ tab ข้อมูล users
const CACHE_TTL_SECONDS = 300;                // ← Cache 5 นาที
```

**หา Sheet ID:**
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
                                      ^^^^^^^^^^^^^^^^
```

---

### ขั้นตอนที่ 4: Deploy เป็น Web App

1. คลิก **Deploy** → **New deployment**
2. เลือก type: **Web app**
3. ตั้งค่า:
   - **Description**: `NCDs Dashboard API v1`
   - **Execute as**: **Me** (เจ้าของ script)
   - **Who has access**: **Anyone** (ใครก็เข้าได้)
4. คลิก **Deploy**
5. คัดลอก **Web app URL**

**ตัวอย่าง URL:**
```
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXX/exec
```

---

### ขั้นตอนที่ 5: อัปเดต Frontend Config

นำ Web app URL ไปใส่ใน `config.js` ของ Frontend:

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  // ...
};
```

---

## 🔄 การอัปเดต

เมื่อแก้ไข `code.gs`:

### วิธีที่ 1: New Version (แนะนำ)
1. แก้ไขโค้ดใน Apps Script Editor
2. บันทึก (Ctrl + S)
3. **Deploy** → **Manage deployments**
4. คลิกไอคอน ✏️ (Edit) ที่ deployment ปัจจุบัน
5. **Version**: เลือก **New version**
6. คลิก **Deploy**

✅ URL เดิมยังใช้ได้ (ไม่ต้องเปลี่ยน config)

### วิธีที่ 2: New Deployment
1. แก้ไขโค้ด
2. **Deploy** → **New deployment**
3. คัดลอก URL ใหม่
4. อัปเดต `config.js` ใน Frontend

⚠️ ต้องเปลี่ยน URL ใน Frontend ทุกครั้ง

---

## 📡 API Endpoints

### GET Requests

#### ดึงข้อมูล NCDs ทั้งหมด
```
GET ?action=getData
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### POST Requests

#### Login
```
POST action=login&username=admin&password=pass
```

**Response:**
```json
{
  "success": true,
  "sessionId": "xxx",
  "user": { "username": "admin", "amphoe": "เมือง" }
}
```

#### Check Session
```
POST action=checkSession&sessionId=xxx
```

#### Logout
```
POST action=logout&sessionId=xxx
```

---

## 🧪 Testing

### ทดสอบใน Apps Script Editor

```javascript
// ทดสอบดึงข้อมูล
function testGetData() {
  const result = getDataObj();
  Logger.log(result);
}

// ทดสอบ Session
function testSession() {
  const result = createSession("testuser", "เมือง");
  Logger.log(result);
}
```

รัน: **Run** → เลือก function → **Run**

### ทดสอบผ่าน Browser

```
https://script.google.com/macros/s/YOUR_ID/exec?action=getData
```

---

## 🔒 Security

### Session Management
- Session timeout: 24 ชั่วโมง
- เก็บใน Properties Service (server-side)
- Session ID: Random UUID

### Data Access Control
- Admin เห็นเฉพาะข้อมูลอำเภอของตนเอง
- ตรวจสอบ session ก่อนทุก admin request

### Data Masking
- ชื่อ-นามสกุล ปกปิดอัตโนมัติ (เช่น "สมชาย" → "สม***")
- เฉพาะ admin เห็นข้อมูลเต็ม

---

## 🐛 Troubleshooting

### ปัญหา: "Authorization required"
- ไปที่ Apps Script Editor
- รัน function ใดๆ
- อนุญาต permissions

### ปัญหา: "Exception: Service invoked too many times"
- เพิ่ม cache TTL ใน `CACHE_TTL_SECONDS`
- ลด API calls จาก Frontend

### ปัญหา: ข้อมูลไม่อัปเดต
- Clear cache: `CacheService.getScriptCache().removeAll()`
- หรือรอ cache หมดอายุ (5 นาที)

---

## ⚡ Performance

- **Cache**: 5 นาที (ปรับได้ที่ `CACHE_TTL_SECONDS`)
- **Response Time**: ~200-500ms
- **Quota**: 
  - URL Fetch: 20,000 calls/day
  - Script runtime: 6 min/execution

---

## 📚 เอกสารเพิ่มเติม

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)

---

## 🔗 Related Files

- `../config.js` - Frontend configuration
- `../docs/GOOGLE-SHEET-STRUCTURE.md` - Database schema
- `../docs/SETUP.md` - Full setup guide

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅