# NCDs Dashboard - Google Apps Script Version

## 📁 โครงสร้างไฟล์สำหรับ Google Apps Script

```
Google Apps Script Project/
├── code.gs              # Backend (Server-side functions)
├── index.html           # ไฟล์หลัก (Entry point)
├── Styles.html          # CSS ทั้งหมด (รวมธีม, layout, responsive)
├── Scripts.html         # JavaScript ทั้งหมด (รวมทุก logic)
├── Header.html          # Header พร้อมปุ่มและ filters
├── Kpis.html            # KPI Cards (4 cards)
├── Charts.html          # Charts Section (3 charts)
├── Table.html           # Data Table
└── Modals.html          # Modals (Add Record + Import)
```

## 🎯 คำอธิบายไฟล์

### 1. **code.gs** (Backend)

ไฟล์ Google Apps Script ที่จัดการกับ Google Sheets

- `doGet()` - แสดงหน้าเว็บ
- `getDataObj()` - ดึงข้อมูลจาก Sheet พร้อม cache
- `addSingleRecord(record)` - เพิ่มรายการเดียว
- `importData(csvData)` - นำเข้าข้อมูลจาก CSV
- `getTemplateUrl()` - สร้าง Template Spreadsheet

### 2. **index.html** (Entry Point)

ไฟล์หลักที่ include ไฟล์อื่นๆ

```html
<?!= HtmlService.createHtmlOutputFromFile('Styles').getContent(); ?>
<?!= HtmlService.createHtmlOutputFromFile('Header').getContent(); ?>
...
```

### 3. **Styles.html** (All CSS)

รวม CSS ทั้งหมดใน `<style>` tag:

- CSS Variables สำหรับ Dark/Light theme
- Layout (header, grid, cards, table)
- Modal styles
- Form styles
- Button styles
- File upload styles
- Alert & Loading styles
- Responsive design

### 4. **Scripts.html** (All JavaScript)

รวม JavaScript ทั้งหมดใน `<script>` tag:

- **Config**: COL object, state management
- **Theme**: initTheme(), toggleTheme(), applyTheme()
- **Data**: load(), normalize(), applyFilters()
- **UI**: renderKpis(), renderTable()
- **Charts**: drawCharts() with ECharts
- **Add Record**: initAddRecordForm(), form submit
- **Import**: initImportData(), file upload, drag-drop
- **Init**: IIFE สำหรับเริ่มต้น app

### 5. **Header.html**

Header section พร้อม:

- ชื่อ Dashboard
- ปุ่ม "เพิ่มรายการ", "นำเข้าข้อมูล", "สลับธีม"
- Filter dropdowns (4 filters)

### 6. **Kpis.html**

KPI Cards แสดง:

- 📋 รวมทั้งหมด
- ⚠️ เสี่ยง
- ✅ ปกติ
- 🎯 เสร็จสิ้น

### 7. **Charts.html**

3 Charts containers:

- 📊 ภาพรวม NCDs
- 🔍 ปัจจัยเสี่ยง
- 🏘️ Top 10 ตำบล

### 8. **Table.html**

Data table แสดงข้อมูล 8 คอลัมน์:

- ชื่อ, นามสกุล, ตำบล, อำเภอ, จังหวัด, เบอร์โทร, NCDs, สถานะ

### 9. **Modals.html**

2 Modals:

- **Add Record Modal**: ฟอร์ม 18 ฟิลด์
- **Import Modal**: Upload file + Download template

## 🚀 วิธีใช้งาน

### การติดตั้งใน Google Apps Script:

1. **สร้างโปรเจค Apps Script**

   - ไปที่ https://script.google.com
   - คลิก "New project"

2. **เพิ่มไฟล์ทั้งหมด**

   - เพิ่มไฟล์ `.gs`: `code.gs`
   - เพิ่มไฟล์ `.html`: คลิก `+` → เลือก HTML
   - สร้างไฟล์ตามรายการด้านบน (9 ไฟล์)

3. **แก้ไข code.gs**

   ```javascript
   function doGet() {
     return HtmlService.createTemplateFromFile("MainIndex")
       .evaluate()
       .setTitle("NCDs Dashboard")
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
   }
   ```

4. **Deploy**
   - คลิก "Deploy" → "New deployment"
   - เลือก "Web app"
   - Execute as: "Me"
   - Who has access: ตามต้องการ
   - คลิก "Deploy"

### การอัปเดตข้อมูล:

แก้ไข `SHEET_ID` ใน `code.gs`:

```javascript
const SHEET_ID = "your-sheet-id-here";
const SHEET_NAME = "ncd_db_central";
```

## ✨ Features

### 🎨 Theme System

- Dark Theme (default)
- Light Theme
- บันทึกใน localStorage
- กราฟเปลี่ยนสีตามธีม

### 📊 Data Visualization

- ECharts v5
- 3 กราฟแบบ interactive
- อัปเดตแบบ real-time

### 📥 Import System

- รองรับ CSV, Excel (.xlsx, .xls)
- Drag & Drop upload
- Download Template
- Validation headers

### ➕ Add Record

- ฟอร์ม 18 ฟิลด์
- Required field validation
- Success/Error alerts

### 🔍 Filter System

- Filter 4 ระดับ: จังหวัด, อำเภอ, ตำบล, สถานะ
- อัปเดต real-time

## 📝 หมายเหตุ

### ข้อจำกัดของ Google Apps Script:

- ✅ รองรับเฉพาะไฟล์ `.gs` และ `.html`
- ✅ ไม่สามารถสร้างโฟลเดอร์ได้
- ✅ ต้องใช้ `HtmlService.createHtmlOutputFromFile()` สำหรับ include
- ✅ JavaScript ต้องอยู่ใน `<script>` tag
- ✅ CSS ต้องอยู่ใน `<style>` tag

### ข้อดีของโครงสร้างนี้:

- ✅ แยกไฟล์ตามหน้าที่ชัดเจน
- ✅ ง่ายต่อการดูแลและแก้ไข
- ✅ แต่ละไฟล์ไม่ยาวเกินไป
- ✅ สามารถทำงานร่วมกันเป็นทีมได้
- ✅ เพิ่ม feature ใหม่ง่าย

## 🔧 การแก้ไขและเพิ่มฟีเจอร์

### เพิ่มฟิลด์ในฟอร์ม:

แก้ไข `Modals.html` → เพิ่มใน `<div class="form-grid">`

### เพิ่มกราฟใหม่:

1. เพิ่ม container ใน `Charts.html`
2. เพิ่ม logic ใน `Scripts.html` → function `drawCharts()`

### เปลี่ยนสีธีม:

แก้ไข `Styles.html` → CSS Variables ใน `:root` และ `body.light-theme`

### เพิ่ม Filter:

1. เพิ่ม dropdown ใน `Header.html`
2. เพิ่ม logic ใน `Scripts.html` → function `applyFilters()`

## 🎓 เทคโนโลยีที่ใช้

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: ECharts v5
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Cache**: CacheService (300 seconds TTL)

## 📞 การใช้งาน Backend Functions

```javascript
// Load data
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(errorCallback)
  .getDataObj();

// Add record
google.script.run.withSuccessHandler(callback).addSingleRecord(recordObject);

// Import CSV
google.script.run.withSuccessHandler(callback).importData(csvString);

// Get template
google.script.run.withSuccessHandler(callback).getTemplateUrl();
```

## 🎉 สรุป

โครงสร้างนี้เหมาะกับ Google Apps Script โดยเฉพาะ:

- แยกไฟล์ชัดเจน แต่ไม่ซับซ้อน
- รวม CSS/JS ในไฟล์ HTML
- ใช้งานง่าย แก้ไขสะดวก
- พร้อม deploy ได้ทันที

---

**สร้างโดย**: GitHub Copilot  
**วันที่**: October 8, 2025  
**เวอร์ชัน**: 2.0 (Google Apps Script Optimized)
