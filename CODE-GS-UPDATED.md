# ✅ code.gs อัปเดตเสร็จแล้ว!

## 📡 API Endpoints ที่เพิ่มเข้ามา

### GET Endpoints

```javascript
GET ?action=getData
```
- **คำอธิบาย**: ดึงข้อมูล NCDs ทั้งหมด (Public)
- **Response**: `{ success: true, data: [...], updatedAt: "..." }`
- **ใช้โดย**: หน้า Dashboard หลัก (index.html)

---

### POST Endpoints

#### 1. Login
```javascript
POST action=login
     &username=admin
     &password=pass
```
- **คำอธิบาย**: เข้าสู่ระบบ
- **Response**:
  ```json
  {
    "success": true,
    "sessionId": "xxx-xxx-xxx",
    "user": {
      "username": "admin",
      "amphoe": "เมือง"
    }
  }
  ```

#### 2. Check Session
```javascript
POST action=checkSession
     &sessionId=xxx
```
- **คำอธิบาย**: ตรวจสอบว่า session ยังใช้งานได้หรือไม่
- **Response**:
  ```json
  {
    "valid": true,
    "success": true,
    "username": "admin",
    "amphoe": "เมือง",
    "loginTime": 1234567890
  }
  ```

#### 3. Logout
```javascript
POST action=logout
```
- **คำอธิบาย**: ออกจากระบบ
- **Response**: `{ success: true, message: "..." }`

#### 4. Get Admin Data
```javascript
POST action=getAdminData
     &sessionId=xxx
```
- **คำอธิบาย**: ดึงข้อมูลที่ filter ตามอำเภอของ admin
- **Response**:
  ```json
  {
    "success": true,
    "data": [...],
    "updatedAt": "..."
  }
  ```

#### 5. Add Record
```javascript
POST action=addRecord
     &sessionId=xxx
     &data={"ชื่อ":"สมชาย","นามสกุล":"ใจดี",...}
```
- **คำอธิบาย**: เพิ่มรายการใหม่
- **Response**:
  ```json
  {
    "success": true,
    "message": "เพิ่มรายการสำเร็จ",
    "uuid": "xxx-xxx-xxx"
  }
  ```

#### 6. Update Record
```javascript
POST action=updateRecord
     &sessionId=xxx
     &rowIndex=5
     &data={"ชื่อ":"สมชาย","นามสกุล":"ใจดี",...}
```
- **คำอธิบาย**: แก้ไขรายการที่มีอยู่
- **Response**: `{ success: true, message: "..." }`

#### 7. Delete Record
```javascript
POST action=deleteRecord
     &sessionId=xxx
     &rowIndex=5
```
- **คำอธิบาย**: ลบรายการ
- **Response**: `{ success: true, message: "..." }`

#### 8. Import CSV
```javascript
POST action=importCSV
     &sessionId=xxx
     &csvData="ชื่อ,นามสกุล,เพศ\nสมชาย,ใจดี,ชาย"
```
- **คำอธิบาย**: นำเข้าข้อมูลจาก CSV
- **Response**:
  ```json
  {
    "success": true,
    "message": "นำเข้าสำเร็จ 10 รายการ",
    "count": 10,
    "errors": null
  }
  ```

#### 9. Export to Sheets
```javascript
POST action=exportToSheets
     &sessionId=xxx
```
- **คำอธิบาย**: ส่งออกข้อมูลเป็น Google Sheets ใหม่
- **Response**:
  ```json
  {
    "success": true,
    "message": "ส่งออกข้อมูลสำเร็จ",
    "url": "https://docs.google.com/spreadsheets/d/...",
    "count": 50
  }
  ```

---

## 🔧 ฟังก์ชันใหม่ที่เพิ่มเข้ามา

### 1. `checkSessionById(sessionId)`
- ตรวจสอบ session โดยใช้ sessionId
- ตรวจสอบว่า session หมดอายุหรือไม่ (24 ชั่วโมง)
- Return `{ valid: true/false, ... }`

### 2. `addRecord(recordData, sessionId)`
- เพิ่มรายการใหม่ลง Google Sheets
- ตรวจสอบว่า amphoe ตรงกับ admin หรือไม่
- สร้าง UUID อัตโนมัติ
- Clear cache หลังเพิ่มข้อมูล

### 3. `importCSV(csvData, sessionId)`
- แปลง CSV เป็น array of objects
- ตรวจสอบ amphoe ของแต่ละ row
- เพิ่มข้อมูลทีละ row
- Return จำนวนที่นำเข้าสำเร็จและ errors (ถ้ามี)

### 4. `exportToSheets(sessionId)`
- Filter ข้อมูลตาม amphoe ของ admin
- สร้าง Spreadsheet ใหม่
- คัดลอกข้อมูลที่ filter แล้ว
- Return URL ของ Spreadsheet

---

## ⚙️ การปรับปรุง

### 1. Login Response Format
```javascript
// เดิม
{
  success: true,
  sessionId: "xxx",
  username: "admin",
  amphoe: "เมือง"
}

// ใหม่ (ตรงกับ Frontend)
{
  success: true,
  sessionId: "xxx",
  user: {
    username: "admin",
    amphoe: "เมือง"
  }
}
```

### 2. Session Validation
- ทุก admin endpoint ตรวจสอบ sessionId ก่อน
- Session หมดอายุหลัง 24 ชั่วโมง
- Return `{ valid: false }` ถ้า session หมดอายุ

### 3. Amphoe-based Access Control
- Admin เห็นเฉพาะข้อมูลอำเภอของตน
- ไม่สามารถเพิ่ม/แก้ไข/ลบ ข้อมูลอำเภออื่น
- Auto-fill อำเภอเมื่อเพิ่มรายการใหม่

### 4. Error Handling
- ทุก endpoint มี try-catch
- Return error message ที่ชัดเจน
- Log errors ใน Logger

### 5. Cache Management
- Clear cache หลังจาก add/update/delete
- ใช้ cache สำหรับ getData (5 นาที)

---

## 🚀 การ Deploy

### 1. คัดลอก code.gs ไปยัง Apps Script Editor

```bash
# เปิด Google Sheet
# Extensions → Apps Script
# คัดลอกทั้งไฟล์ apps-script/code.gs
# วาง ใน code.gs ใน Apps Script Editor
```

### 2. อัปเดต Configuration

แก้ไขค่าคงที่ในบรรทัดต้นๆ:

```javascript
const SHEET_ID = "YOUR_SHEET_ID";
const SHEET_NAME = "ncd_db_central";
const USER_SHEET_NAME = "user";
const CACHE_TTL_SECONDS = 300;
```

### 3. Deploy เป็น Web App

```
1. Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy
6. คัดลอก Web app URL
```

### 4. อัปเดต Frontend

ใส่ URL ใน `config.js`:

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/YOUR_ID/exec"
};
```

---

## ✅ Checklist

- [x] doGet() - รองรับ ?action=getData
- [x] doPost() - รองรับ 9 endpoints
- [x] login() - return user object
- [x] checkSessionById() - validate session
- [x] getAdminDataObj() - filter by amphoe
- [x] addRecord() - insert with UUID
- [x] updateRecord() - modify existing
- [x] deleteRecord() - remove row
- [x] importCSV() - bulk import
- [x] exportToSheets() - create export
- [x] CORS headers - allow GitHub Pages
- [x] Error handling - try-catch everywhere
- [x] Session validation - 24h timeout
- [x] Amphoe access control

---

## 🧪 การทดสอบ

### Test ใน Apps Script Editor

```javascript
// Test session
function test() {
  const result = testSession();
  Logger.log(result);
}

// Test add record
function testAdd() {
  const sessionId = "YOUR_SESSION_ID";
  const data = {
    "ชื่อ": "ทดสอบ",
    "นามสกุล": "ระบบ",
    "เพศ": "ชาย"
  };
  const result = addRecord(data, sessionId);
  Logger.log(result);
}
```

### Test API ผ่าน Browser

```
https://script.google.com/macros/s/YOUR_ID/exec?action=getData
```

### Test ผ่าน Frontend

```
https://yu88569.github.io/dashboardNCD/admin.html
```

---

**ทุกอย่างพร้อมแล้ว!** 🎉

คุณสามารถ:
1. Deploy code.gs ใหม่
2. ทดสอบ API endpoints
3. ใช้งาน Admin Panel ได้เลย!
