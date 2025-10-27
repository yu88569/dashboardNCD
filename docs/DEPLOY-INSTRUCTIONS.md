# 🚀 คำแนะนำการ Deploy หลังแก้ไข CORS

## ✅ ไฟล์ที่แก้ไขแล้ว

1. **`code.gs`** - เพิ่ม CORS headers ใน `doGet()` และ `doPost()`
2. **`docs/app.js`** - มี API URL ที่ถูกต้องแล้ว

---

## 📋 ขั้นตอนการ Deploy (สำคัญมาก!)

### ขั้นตอนที่ 1: Deploy Apps Script ใหม่ ⚠️

> **สำคัญ:** ต้อง Deploy ใหม่เพื่อให้ CORS headers มีผล

#### วิธีที่ 1: New Version (แนะนำ - URL ไม่เปลี่ยน)

1. เปิด Google Apps Script Editor
2. คลิก **Deploy** → **Manage deployments**
3. คลิก icon **✏️ (Edit)** ที่ deployment เดิม
4. เปลี่ยน **Version** เป็น **New version**
5. Description: `Add CORS headers for GitHub Pages`
6. คลิก **Deploy**
7. ✅ **เสร็จแล้ว!** URL ยังเหมือนเดิม

#### วิธีที่ 2: New Deployment (URL จะเปลี่ยน)

1. เปิด Google Apps Script Editor
2. คลิก **Deploy** → **New deployment**
3. เลือก type: **Web app**
4. ตั้งค่า:
   - **Description**: `NCDs Dashboard API with CORS`
   - **Execute as**: Me (YOUR_EMAIL@gmail.com)
   - **Who has access**: **Anyone**
5. คลิก **Deploy**
6. ⚠️ คัดลอก **Web app URL** ใหม่
7. อัปเดตใน `docs/app.js` บรรทัดที่ 4-5

---

### ขั้นตอนที่ 2: ทดสอบ API

เปิดเบราว์เซอร์ใหม่ แล้วไปที่:

```
https://script.google.com/macros/s/AKfycbyuGq-BKxBQWIklTP67oWb9um_fcAny-PpFqlaVWHM7vn_oX2MPdri-UdXML2idpyjn/exec?action=getData
```

**ควรเห็น:**
```json
{
  "success": true,
  "data": [...],
  "updatedAt": "2024-XX-XX..."
}
```

---

### ขั้นตอนที่ 3: Push Code ขึ้น GitHub

```bash
cd C:\Work-yu\dashboardNCD

# ดูไฟล์ที่เปลี่ยนแปลง
git status

# เพิ่มไฟล์ที่แก้ไข
git add code.gs
git add docs/app.js
git add DEPLOY-INSTRUCTIONS.md

# Commit
git commit -m "Fix CORS: Add headers to Apps Script API endpoints"

# Push
git push origin main
```

---

### ขั้นตอนที่ 4: รอ GitHub Pages Deploy

1. ไปที่ repository: https://github.com/yu88569/dashboardNCD
2. คลิกแท็บ **Actions** (ด้านบน)
3. ดู workflow ล่าสุด ควรเป็น **"Fix CORS..."**
4. รอให้ **status = ✅ Success** (ใช้เวลา 1-2 นาที)

---

### ขั้นตอนที่ 5: ทดสอบ GitHub Pages

1. เปิด: https://yu88569.github.io/dashboardNCD/
2. กด **F12** เปิด Developer Console
3. ดูที่ **Console tab**
4. ❌ **ถ้ายังมี CORS error** → ทำขั้นตอนที่ 6
5. ✅ **ถ้าไม่มี error และข้อมูลโหลดขึ้น** → **สำเร็จ!** 🎉

---

### ขั้นตอนที่ 6: Hard Refresh

ถ้ายังโหลดข้อมูลไม่ได้:

**Windows:**
```
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
```

หรือ:

1. กด **F12** → คลิกขวาที่ปุ่ม Reload
2. เลือก **"Empty Cache and Hard Reload"**

---

## 🧪 ทดสอบ CORS ใน Console

เปิด Developer Console (F12) ใน GitHub Pages แล้วพิมพ์:

```javascript
fetch('https://script.google.com/macros/s/AKfycbyuGq-BKxBQWIklTP67oWb9um_fcAny-PpFqlaVWHM7vn_oX2MPdri-UdXML2idpyjn/exec?action=getData')
  .then(res => res.json())
  .then(data => {
    console.log('✅ API Works!', data);
    console.log('Total records:', data.data.length);
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
```

**ผลลัพธ์ที่ควรเห็น:**
```
✅ API Works! {success: true, data: Array(xxx), updatedAt: "..."}
Total records: xxx
```

---

## 🐛 Troubleshooting

### ปัญหา: ยังมี CORS Error

**ตรวจสอบ:**
1. ✅ Apps Script ถูก **Deploy ใหม่** แล้วหรือยัง? (Version: New version)
2. ✅ ทดสอบ API URL ตรงๆ ได้ JSON หรือไม่?
3. ✅ Hard Refresh (Ctrl+F5) แล้วหรือยัง?

**วิธีแก้:**
```bash
# ลบ cache browser
1. F12 → Application tab → Clear storage → Clear site data
2. ปิด browser ทั้งหมด
3. เปิดใหม่
```

---

### ปัญหา: แก้ไข code.gs แล้วแต่ยังไม่เห็นผล

**สาเหตุ:** ยังไม่ได้ Deploy ใหม่

**วิธีแก้:**
1. Deploy → Manage deployments
2. Edit (✏️) → Version: **New version**
3. Deploy

---

### ปัญหา: เห็น "Invalid action" error

**สาเหตุ:** API URL ผิด หรือ parameter ผิด

**ตรวจสอบ:**
```javascript
// docs/app.js บรรทัดที่ 4-5
const API_URL =
  "https://script.google.com/macros/s/AKfycbyuGq-BKxBQWIklTP67oWb9um_fcAny-PpFqlaVWHM7vn_oX2MPdri-UdXML2idpyjn/exec";
```

---

## ✅ Checklist สำหรับ Deploy สำเร็จ

- [ ] แก้ไข `code.gs` เพิ่ม CORS headers แล้ว
- [ ] Deploy Apps Script ใหม่ (New version) แล้ว
- [ ] ทดสอบ API URL ตรงๆ แล้วได้ JSON
- [ ] `docs/app.js` มี API_URL ที่ถูกต้อง
- [ ] Push code ขึ้น GitHub แล้ว
- [ ] GitHub Actions status = Success
- [ ] Hard Refresh browser แล้ว (Ctrl+F5)
- [ ] เปิด https://yu88569.github.io/dashboardNCD/ เห็นข้อมูล

---

## 📊 ผลลัพธ์ที่คาดหวัง

### GitHub Pages ควรแสดง:

✅ **KPI Cards** - รวมทั้งหมด, เสี่ยง, ปกติ, เสร็จสิ้น  
✅ **Gender Stats** - ชาย, หญิง, พระสงฆ์  
✅ **Charts** - ปัจจัยเสี่ยง, Top 10 ตำบล  
✅ **Filters** - จังหวัด, อำเภอ, ตำบล, เพศ, สถานะ  
✅ **Theme Toggle** - 🌙/☀️ ใช้งานได้  

### Developer Console (F12):

✅ **ไม่มี CORS error**  
✅ **ไม่มี fetch error**  
✅ **แสดง data loading success**  

---

## 🎯 สรุป

การแก้ปัญหา CORS ต้องทำ **2 สิ่งสำคัญ**:

1. ✅ **เพิ่ม CORS headers** ใน Apps Script (`code.gs`)
2. ✅ **Deploy ใหม่** (New version) เพื่อให้การเปลี่ยนแปลงมีผล

หลังจากนั้น GitHub Pages จะเรียก API ได้ปกติ! 🚀

---

## 📞 ติดปัญหา?

1. ดู Console error (F12)
2. ทดสอบ API URL ตรงๆ
3. ตรวจสอบ Apps Script deployment status
4. ลอง Hard Refresh

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: CORS Fixed ✅