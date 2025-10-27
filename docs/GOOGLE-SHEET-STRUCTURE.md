# โครงสร้าง Google Sheet สำหรับ NCDs Dashboard

## 📊 ภาพรวม

Google Sheet ต้องมี **2 tabs** หลัก:
1. **ncd_db_central** - เก็บข้อมูล NCDs
2. **user** - เก็บข้อมูล Admin users

---

## 📋 Tab 1: ncd_db_central

### โครงสร้างคอลัมน์

| คอลัมน์ | ชื่อ (ไทย) | ประเภทข้อมูล | ตัวอย่าง | บังคับ | หมายเหตุ |
|---------|-----------|-------------|---------|--------|----------|
| A | id | Text | uuid-xxx-xxx | ✅ | สร้างอัตโนมัติ |
| B | ชื่อ | Text | สมชาย | ✅ | จะถูก mask เป็น "สxxx" |
| C | นามสกุล | Text | ใจดี | ✅ | จะถูก mask เป็น "ใxxx" |
| D | เพศ | Text | ชาย/หญิง/พระสงฆ์ | ✅ | |
| E | ชื่อหมู่บ้าน | Text | บ้านสวนดอก | | |
| F | บ้านเลขที่ | Text | 123/45 | | |
| G | จังหวัด | Text | เชียงใหม่ | ✅ | |
| H | อำเภอ | Text | เมือง | ✅ | ใช้กรอง Admin |
| I | ตำบล | Text | ช้างเผือก | ✅ | |
| J | เบอร์โทรศัพท์ | Text | 0812345678 | | |
| K | ภาพรวมของการประเมินโรค NCDs | Text | ปกติ/เสี่ยง | ✅ | |
| L | โรคอ้วน | Text | ปกติ/เสี่ยง/เสี่ยงสูง | | |
| M | โรคเบาหวาน | Text | ปกติ/เสี่ยง/เสี่ยงสูง | | |
| N | โรคความดันโลหิต | Text | ปกติ/เสี่ยง/เสี่ยงสูง | | |
| O | สุขภาพจิต | Text | ปกติ/เสี่ยง | | |
| P | สูบบุหรี่ | Text | สูบ/ไม่สูบ | | |
| Q | แอลกอฮอล์ | Text | ดื่ม/ไม่ดื่ม | | |
| R | สถานะ | Text | รอดำเนินการ/เสร็จสิ้น | | |
| S | ส่งต่อหน่วยบริการ | Text | ใช่/ไม่ใช่ | | |
| T | รหัสหน่วยบริการที่ส่งออก | Text | 12345 | | |

### ตัวอย่างข้อมูล

```csv
id,ชื่อ,นามสกุล,เพศ,ชื่อหมู่บ้าน,บ้านเลขที่,จังหวัด,อำเภอ,ตำบล,เบอร์โทรศัพท์,ภาพรวมของการประเมินโรค NCDs,โรคอ้วน,โรคเบาหวาน,โรคความดันโลหิต,สุขภาพจิต,สูบบุหรี่,แอลกอฮอล์,สถานะ,ส่งต่อหน่วยบริการ,รหัสหน่วยบริการที่ส่งออก
uuid-001,สมชาย,ใจดี,ชาย,บ้านสวนดอก,123/45,เชียงใหม่,เมือง,ช้างเผือก,0812345678,ปกติ,ปกติ,ปกติ,ปกติ,ปกติ,ไม่สูบ,ไม่ดื่ม,เสร็จสิ้น,ไม่ใช่,
uuid-002,สมหญิง,รักดี,หญิง,บ้านดอกไม้,67/8,เชียงใหม่,เมือง,สุเทพ,0823456789,เสี่ยง,เสี่ยง,ปกติ,เสี่ยง,ปกติ,ไม่สูบ,ดื่ม,รอดำเนินการ,ใช่,12345
uuid-003,พระมหา,ธรรมะ,พระสงฆ์,วัดพระธาตุ,1,เชียงใหม่,เมือง,พระสิงห์,0834567890,เสี่ยงสูง,เสี่ยงสูง,เสี่ยงสูง,ปกติ,เสี่ยง,สูบ,ไม่ดื่ม,เสร็จสิ้น,ใช่,12346
```

### ค่าที่ยอมรับในแต่ละฟิลด์

#### เพศ
- `ชาย`
- `หญิง`
- `พระสงฆ์`

#### ภาพรวม NCDs / โรคต่างๆ
- `ปกติ` - สุขภาพดี
- `เสี่ยง` - มีความเสี่ยง
- `เสี่ยงสูง` - เสี่ยงสูง/ป่วย

#### การสูบบุหรี่
- `สูบ`
- `ไม่สูบ`

#### แอลกอฮอล์
- `ดื่ม`
- `ไม่ดื่ม`

#### สถานะ
- `รอดำเนินการ`
- `กำลังดำเนินการ`
- `เสร็จสิ้น`

#### ส่งต่อหน่วยบริการ
- `ใช่`
- `ไม่ใช่`

---

## 👥 Tab 2: user

### โครงสร้างคอลัมน์

| คอลัมน์ | ชื่อ (อังกฤษ) | ประเภทข้อมูล | ตัวอย่าง | บังคับ | หมายเหตุ |
|---------|--------------|-------------|---------|--------|----------|
| A | username | Text | admin001 | ✅ | ไม่ซ้ำกัน |
| B | password | Text | password123 | ✅ | แนะนำใช้รหัสที่ปลอดภัย |
| C | อำเภอ | Text | เมือง | ✅ | admin จะเห็นเฉพาะข้อมูลอำเภอนี้ |
| D | ชื่อเต็ม | Text | นายสมชาย ใจดี | | (Optional) |
| E | เบอร์โทร | Text | 0812345678 | | (Optional) |

### ตัวอย่างข้อมูล

```csv
username,password,อำเภอ,ชื่อเต็ม,เบอร์โทร
admin001,pass1234,เมือง,นายสมชาย ใจดี,0812345678
admin002,pass5678,สันทราย,นางสมหญิง รักดี,0823456789
admin003,pass9012,หางดง,นายสมศักดิ์ มีใจดี,0834567890
```

### หมายเหตุสำคัญ

1. **username ต้องไม่ซ้ำกัน** - ใช้สำหรับ login
2. **password** - แนะนำไม่ควรเก็บแบบ plain text ในการใช้งานจริง
3. **อำเภอ** - ต้องตรงกับอำเภอใน tab `ncd_db_central` ทุกตัวอักษร
4. Admin แต่ละคนจะเห็นเฉพาะข้อมูลของอำเภอที่ตนเองรับผิดชอบ

---

## 🔧 การตั้งค่า Permissions

### สิทธิ์การเข้าถึง Google Sheet

1. **Apps Script Service Account**
   - ให้สิทธิ์ "Editor" กับ Apps Script

2. **Admin Users**
   - ไม่จำเป็นต้องให้สิทธิ์เข้าถึง Sheet โดยตรง
   - เข้าผ่านระบบ Admin Panel เท่านั้น

3. **Public Dashboard**
   - ไม่ต้องแชร์ Sheet ให้ public
   - ข้อมูลจะผ่าน Apps Script API เท่านั้น

---

## 📝 Tips & Best Practices

### 1. การจัดการข้อมูล

- **อย่าลบ header row (แถวที่ 1)** - จำเป็นสำหรับระบบ
- **ใช้ Data Validation** สำหรับ dropdown (เพศ, สถานะ, ฯลฯ)
- **Format เบอร์โทร** ให้เป็น Text เพื่อรักษา leading zero
- **ใช้ Filter Views** แทนการลบข้อมูล

### 2. การสำรองข้อมูล

```
File > Make a copy
```

หรือใช้ Google Apps Script:

```javascript
function backupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const copy = ss.copy('NCDs_Backup_' + new Date().toISOString());
  Logger.log('Backup created: ' + copy.getUrl());
}
```

### 3. Data Validation ตัวอย่าง

สำหรับคอลัมน์ "เพศ":

1. เลือกคอลัมน์ D (ทั้งหมด)
2. Data > Data validation
3. Criteria: List of items
4. Items: `ชาย,หญิง,พระสงฆ์`
5. ✅ Show dropdown list in cell
6. ✅ Reject input

### 4. การ Import ข้อมูล CSV

```
File > Import > Upload > Replace data at selected cell
```

**สำคัญ:** ตรวจสอบ encoding เป็น UTF-8 เพื่อรองรับภาษาไทย

---

## 🚨 ข้อควรระวัง

### 1. ความปลอดภัย
- ⚠️ อย่าแชร์ Sheet แบบ "Anyone with the link"
- ⚠️ เปลี่ยน password ของ admin เป็นประจำ
- ⚠️ จำกัดสิทธิ์การแก้ไข Sheet ให้เฉพาะผู้จัดการระบบ

### 2. ข้อมูลส่วนบุคคล (PDPA)
- ✅ ชื่อ-นามสกุล จะถูก mask อัตโนมัติ ("สมชาย" → "สxxxx")
- ✅ ข้อมูลจะถูกกรองตามอำเภอของ admin
- ✅ เก็บ log การเข้าถึงข้อมูล

### 3. Performance
- ถ้าข้อมูลเกิน 10,000 rows ควรใช้ BigQuery แทน
- ใช้ Cache ใน Apps Script เพื่อลด API calls
- Limit การ query ข้อมูลครั้งละไม่เกิน 5,000 rows

---

## 📊 Sample Google Sheet Template

คัดลอก template นี้:

**[NCDs Dashboard Template](https://docs.google.com/spreadsheets/d/TEMPLATE_ID/copy)**

หรือสร้างใหม่ตาม structure ด้านบน

---

## 🔄 Migration จากระบบเก่า

หากมีข้อมูลเดิมอยู่แล้ว:

### ขั้นตอนการย้ายข้อมูล

1. **Export ข้อมูลเดิม** เป็น CSV
2. **Map columns** ให้ตรงกับ structure ใหม่
3. **Clean data**:
   - ลบแถวว่าง
   - แก้ไขค่าที่ไม่ตรง format
   - เปลี่ยน encoding เป็น UTF-8
4. **Import** เข้า Google Sheet
5. **Validate** ตรวจสอบข้อมูล
6. **Test** ทดสอบกับ Apps Script

### Google Apps Script สำหรับ Data Cleaning

```javascript
function cleanData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Remove empty rows
  const cleaned = data.filter(row => 
    row.some(cell => cell !== "")
  );
  
  // Clear and rewrite
  sheet.clearContents();
  sheet.getRange(1, 1, cleaned.length, cleaned[0].length)
    .setValues(cleaned);
}
```

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัยเกี่ยวกับโครงสร้างข้อมูล:

1. ตรวจสอบ error logs ใน Apps Script
2. ใช้ Apps Script function `testUserSheet()` เพื่อ debug
3. ดู console logs: View > Logs

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Compatibility**: Google Sheets, Google Apps Script