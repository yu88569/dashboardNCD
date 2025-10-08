/** ====== CONFIG ====== **/
const SHEET_ID = "1e7US3de5RqD75fsx-i6kLdebYHrClSC0lNZQmfYUEQk";
const SHEET_NAME = "ncd_db_central";
const CACHE_TTL_SECONDS = 300;

/** ====== UTILITY: MASK NAME FOR PRIVACY ====== **/
function maskName(name) {
  if (!name || typeof name !== "string") return name;
  const trimmed = name.trim();
  if (trimmed.length === 0) return trimmed;

  // ถ้ามีตัวอักษร 1-2 ตัว แสดงทั้งหมด + xxxx
  if (trimmed.length <= 2) {
    return trimmed + "xxxx";
  }

  // ถ้ามีมากกว่า 2 ตัว แสดง 1-2 ตัวแรก + xxxx
  // สำหรับภาษาไทย 1 ตัวพอ, ภาษาอังกฤษ 2 ตัว
  const isThaiChar = (char) =>
    char.charCodeAt(0) >= 0x0e00 && char.charCodeAt(0) <= 0x0e7f;
  const firstChar = trimmed.charAt(0);

  if (isThaiChar(firstChar)) {
    // ภาษาไทย: แสดง 1-2 ตัวแรก
    const visibleChars = Math.min(2, trimmed.length);
    return trimmed.substring(0, visibleChars) + "xxxx";
  } else {
    // ภาษาอังกฤษหรืออื่นๆ: แสดง 2 ตัวแรก
    const visibleChars = Math.min(2, trimmed.length);
    return trimmed.substring(0, visibleChars) + "xxxx";
  }
}

/** ====== ENTRYPOINT ====== **/
function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("NCDs Dashboard");
}

/** ====== SERVER: RETURN DATA OBJECT ====== **/
function getDataObj() {
  const cache = CacheService.getScriptCache();
  let json = cache.get("rows");
  if (!json) {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const values = sh.getDataRange().getValues();
    const trim = (x) => (x == null ? "" : String(x).trim());
    let data = [];
    if (values && values.length > 1) {
      const [header, ...rows] = values;
      data = rows
        .filter((r) => r.some((v) => String(v).trim() !== "")) // ข้ามแถวว่าง
        .map((r) => Object.fromEntries(header.map((h, i) => [trim(h), r[i]])));
    }
    json = JSON.stringify({ data, updatedAt: new Date() });
    cache.put("rows", json, CACHE_TTL_SECONDS);
  }
  return JSON.parse(json); // ส่งเป็น object ให้ client ตรงๆ
}

/** ====== GET TEMPLATE HEADERS ====== **/
function getTemplateHeaders() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return headers.map((h) => String(h).trim());
}

/** ====== UTILITY: CREATE UNIQUE KEY ====== **/
function createUniqueKey(row, headers) {
  const trim = (v) => String(v || "").trim();

  // หาตำแหน่งคอลัมน์
  const fnameIdx = headers.findIndex((h) => trim(h) === "ชื่อ");
  const lnameIdx = headers.findIndex((h) => trim(h) === "นามสกุล");
  const houseIdx = headers.findIndex((h) => trim(h) === "บ้านเลขที่");
  const tambonIdx = headers.findIndex((h) => trim(h) === "ตำบล");
  const amphoeIdx = headers.findIndex((h) => trim(h) === "อำเภอ");
  const phoneIdx = headers.findIndex((h) => trim(h) === "เบอร์โทรศัพท์");

  // ทำความสะอาดเบอร์โทรศัพท์ (เอาแค่ตัวเลข)
  const phone =
    phoneIdx !== -1 ? trim(row[phoneIdx]).replace(/[^\d]/g, "") : "";
  const fname = fnameIdx !== -1 ? trim(row[fnameIdx]) : "";
  const house = houseIdx !== -1 ? trim(row[houseIdx]) : "";

  // Priority 1: ถ้ามีเบอร์โทรครบ 10 หลัก ใช้ เบอร์โทร + บ้านเลขที่ + ชื่อ(แปลงแล้ว)
  if (phone && phone.length === 10) {
    return `PHONE:${phone}|HOUSE:${house}|NAME:${fname}`.toUpperCase();
  }

  // Priority 2: ถ้าไม่มีเบอร์โทรหรือไม่ครบ ใช้ Composite Key แบบเต็ม
  const lname = lnameIdx !== -1 ? trim(row[lnameIdx]) : "";
  const tambon = tambonIdx !== -1 ? trim(row[tambonIdx]) : "";
  const amphoe = amphoeIdx !== -1 ? trim(row[amphoeIdx]) : "";

  return `${fname}|${lname}|${house}|${tambon}|${amphoe}`.toUpperCase();
}

/** ====== IMPORT DATA FROM CSV/EXCEL (WITH UPDATE SUPPORT) ====== **/
function importData(csvData) {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const existingHeaders = sh
      .getRange(1, 1, 1, sh.getLastColumn())
      .getValues()[0];

    // แปลง CSV เป็น array
    const rows = csvData
      .split("\n")
      .map((row) => {
        // จัดการ CSV ที่มี comma ในเครื่องหมาย quotes
        const regex = /("([^"]*)"|[^,]+)/g;
        const values = [];
        let match;
        while ((match = regex.exec(row)) !== null) {
          values.push(match[2] !== undefined ? match[2] : match[1]);
        }
        return values;
      })
      .filter(
        (row) =>
          row.length > 0 && row.some((cell) => cell && cell.trim() !== "")
      );

    if (rows.length < 2) {
      return { success: false, message: "ไฟล์ไม่มีข้อมูล" };
    }

    const [headers, ...dataRows] = rows;

    // ตรวจสอบว่า headers ตรงกันหรือไม่
    const headerMatch = headers.every(
      (h, i) => String(h).trim() === String(existingHeaders[i]).trim()
    );

    if (!headerMatch) {
      return {
        success: false,
        message: "หัวตารางไม่ตรงกับ template กรุณาใช้ template ที่ถูกต้อง",
      };
    }

    // อ่านข้อมูลที่มีอยู่ทั้งหมด (ไม่รวม header)
    const lastRow = sh.getLastRow();
    const existingData =
      lastRow > 1
        ? sh.getRange(2, 1, lastRow - 1, existingHeaders.length).getValues()
        : [];

    // สร้าง Map ของข้อมูลเดิม (key => row number)
    const existingMap = new Map();
    existingData.forEach((row, idx) => {
      const key = createUniqueKey(row, existingHeaders);
      existingMap.set(key, { rowNum: idx + 2, data: row }); // +2 เพราะเริ่มแถวที่ 2 (ข้าม header)
    });

    // ประมวลผลข้อมูลใหม่
    let addCount = 0;
    let updateCount = 0;
    const newRows = [];

    dataRows.forEach((row) => {
      // ปกปิดชื่อและนามสกุลก่อน
      const maskedRow = [...row];
      const fnameIdx = existingHeaders.findIndex(
        (h) => String(h).trim() === "ชื่อ"
      );
      const lnameIdx = existingHeaders.findIndex(
        (h) => String(h).trim() === "นามสกุล"
      );

      if (fnameIdx !== -1 && maskedRow[fnameIdx]) {
        maskedRow[fnameIdx] = maskName(String(maskedRow[fnameIdx]));
      }
      if (lnameIdx !== -1 && maskedRow[lnameIdx]) {
        maskedRow[lnameIdx] = maskName(String(maskedRow[lnameIdx]));
      }

      // สร้าง key จากข้อมูลที่ปกปิดแล้ว
      const key = createUniqueKey(maskedRow, existingHeaders);

      // ตรวจสอบว่ามีข้อมูลเดิมหรือไม่
      if (existingMap.has(key)) {
        // อัปเดตข้อมูลเดิม
        const existing = existingMap.get(key);
        sh.getRange(existing.rowNum, 1, 1, maskedRow.length).setValues([
          maskedRow,
        ]);
        updateCount++;
      } else {
        // เก็บไว้เพิ่มใหม่ทีหลัง
        newRows.push(maskedRow);
        addCount++;
      }
    });

    // เพิ่มข้อมูลใหม่ที่ไม่ซ้ำ
    if (newRows.length > 0) {
      const nextRow = sh.getLastRow() + 1;
      sh.getRange(nextRow, 1, newRows.length, newRows[0].length).setValues(
        newRows
      );
    }

    // ล้าง cache
    CacheService.getScriptCache().remove("rows");

    return {
      success: true,
      message: `นำเข้าสำเร็จ - เพิ่มใหม่ ${addCount} รายการ, อัปเดต ${updateCount} รายการ`,
      count: dataRows.length,
      added: addCount,
      updated: updateCount,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== ADD/UPDATE SINGLE RECORD ====== **/
function addSingleRecord(recordData) {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // สร้าง array ของข้อมูลตามลำดับ headers และปกปิดชื่อ-นามสกุล
    const rowData = headers.map((header) => {
      const key = String(header).trim();
      let value = recordData[key] || "";

      // ปกปิดชื่อและนามสกุล
      if (key === "ชื่อ" || key === "นามสกุล") {
        value = maskName(String(value));
      }

      return value;
    });

    // อ่านข้อมูลที่มีอยู่เพื่อตรวจสอบการซ้ำ
    const lastRow = sh.getLastRow();
    const existingData =
      lastRow > 1
        ? sh.getRange(2, 1, lastRow - 1, headers.length).getValues()
        : [];

    // สร้าง key จากข้อมูลใหม่
    const newKey = createUniqueKey(rowData, headers);

    // หาว่ามีข้อมูลซ้ำหรือไม่
    let foundRow = -1;
    for (let i = 0; i < existingData.length; i++) {
      const existingKey = createUniqueKey(existingData[i], headers);
      if (existingKey === newKey) {
        foundRow = i + 2; // +2 เพราะเริ่มแถวที่ 2 (ข้าม header)
        break;
      }
    }

    if (foundRow > 0) {
      // อัปเดตข้อมูลเดิม
      sh.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);

      // ล้าง cache
      CacheService.getScriptCache().remove("rows");

      return {
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
        action: "update",
        row: foundRow,
      };
    } else {
      // เพิ่มแถวใหม่
      const newRow = sh.getLastRow() + 1;
      sh.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

      // ล้าง cache
      CacheService.getScriptCache().remove("rows");

      return {
        success: true,
        message: "เพิ่มข้อมูลใหม่สำเร็จ",
        action: "add",
        row: newRow,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== GENERATE TEMPLATE FILE ====== **/
function getTemplateUrl() {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // สร้าง spreadsheet ใหม่สำหรับ template
    const templateSS = SpreadsheetApp.create("NCDs_Template");
    const templateSheet = templateSS.getSheets()[0];
    templateSheet.setName("ncd_template");

    // ใส่ headers
    templateSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    templateSheet
      .getRange(1, 1, 1, headers.length)
      .setBackground("#4c74ff")
      .setFontColor("#ffffff")
      .setFontWeight("bold");

    // ใส่ตัวอย่างข้อมูล 2 แถว
    const exampleData = [
      [
        "สมชาย",
        "ใจดี",
        "หมู่บ้านสุขใจ",
        "123/45",
        "เชียงใหม่",
        "เมืองเชียงใหม่",
        "ช้างเผือก",
        "0812345678",
        "ปกติ",
        "ปกติ",
        "ปกติ",
        "ปกติ",
        "ปกติ",
        "ไม่สูบ",
        "ไม่ดื่ม",
        "กำลังดำเนินการ",
        "",
        "",
      ],
      [
        "สมหญิง",
        "รักสุข",
        "หมู่บ้านสันติสุข",
        "67/89",
        "เชียงใหม่",
        "เมืองเชียงใหม่",
        "ช้างคลาน",
        "0823456789",
        "เสี่ยง",
        "เสี่ยง",
        "ปกติ",
        "ปกติ",
        "ปกติ",
        "ไม่สูบ",
        "ไม่ดื่ม",
        "เสร็จสิ้น",
        "รพ.ส่งเสริมสุขภาพตำบล",
        "HC001",
      ],
    ];

    if (exampleData[0].length <= headers.length) {
      templateSheet
        .getRange(2, 1, exampleData.length, exampleData[0].length)
        .setValues(exampleData);
      templateSheet
        .getRange(2, 1, exampleData.length, exampleData[0].length)
        .setBackground("#f0f0f0");
    }

    // ปรับความกว้างคอลัมน์
    for (let i = 1; i <= headers.length; i++) {
      templateSheet.setColumnWidth(i, 150);
    }

    const url = templateSS.getUrl();

    return {
      success: true,
      url: url,
      message: "สร้าง template สำเร็จ",
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง template: " + error.toString(),
    };
  }
}
