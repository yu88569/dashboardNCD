/**
 * @OnlyCurrentDoc
 */

/** ====== CONFIG ====== **/
const SHEET_ID = "1m9zEncxi11CUx2PsNYVgVFd_3T6Vwu8qLbzCfn5X3cY";
const SHEET_NAME = "ncd_db_central";
const USER_SHEET_NAME = "user";
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
function doGet(e) {
  try {
    const page = e && e.parameter ? e.parameter.page : null;
    const action = e && e.parameter ? e.parameter.action : null;

    // API endpoint for SPA
    if (action === "getData") {
      return ContentService.createTextOutput(
        JSON.stringify(getDataObj())
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ถ้าเรียก admin panel ต้องเช็ค session
    if (page === "admin") {
      // อ่าน sessionId จาก UserProperties แล้วดึง session จริงจาก ScriptProperties
      const session = getSession();
      Logger.log("doGet admin check - Session: " + (session ? "exists" : "null"));

      if (!session) {
        Logger.log("No session, showing session expired page");
        return HtmlService.createTemplateFromFile("SessionExpired")
          .evaluate()
          .setTitle("Session Expired - NCDs Dashboard")
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      }

      Logger.log("Session found for user: " + session.username + ", amphoe: " + session.amphoe);
      return HtmlService.createTemplateFromFile("Admin")
        .evaluate()
        .setTitle("Admin Panel - NCDs Dashboard")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // หน้า login
    if (page === "login") {
      return HtmlService.createTemplateFromFile("Login")
        .evaluate()
        .setTitle("Login - NCDs Dashboard")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // หน้า dashboard ปกติ
    return HtmlService.createTemplateFromFile("index")
      .evaluate()
      .setTitle("NCDs Dashboard")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    // ถ้าเกิด error ให้ไปหน้า session expired
    return HtmlService.createTemplateFromFile("SessionExpired")
      .evaluate()
      .setTitle("Session Expired - NCDs Dashboard")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/** ====== POST ENTRYPOINT FOR SPA API ====== **/
function doPost(e) {
  try {
    const action = e.parameter.action;

    if (action === "login") {
      const username = e.parameter.username;
      const password = e.parameter.password;
      const result = login(username, password);

      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "logout") {
      const result = logout();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "checkSession") {
      const result = checkSession();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Invalid action" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/** ====== GET WEB APP URL ====== **/
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

/** ====== DEBUG: TEST SESSION ====== **/
function testSession() {
  const session = getSession();
  Logger.log("=== TEST SESSION ===");
  Logger.log("Session: " + JSON.stringify(session));

  if (session) {
    Logger.log("Username: " + session.username);
    Logger.log("Amphoe: " + session.amphoe);
    Logger.log("LoginTime: " + session.loginTime);
  } else {
    Logger.log("No session found");
  }

  const checkResult = checkSession();
  Logger.log("CheckSession result: " + JSON.stringify(checkResult));

  return checkResult;
}

/** ====== DEBUG: TEST USER SHEET ====== **/
function testUserSheet() {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(USER_SHEET_NAME);
    if (!sh) {
      return { success: false, message: "ไม่พบชีท user" };
    }

    const data = sh.getDataRange().getValues();
    const [headers, ...rows] = data;

    Logger.log("=== USER SHEET ===");
    Logger.log("Headers: " + JSON.stringify(headers));
    Logger.log("Total users: " + rows.length);

    // หา index ของคอลัมน์อำเภอ
    const amphoeIdx = headers.findIndex(h => String(h).trim() === "อำเภอ");
    Logger.log("Amphoe column index: " + amphoeIdx);

    // แสดงข้อมูล user 3 คนแรก
    rows.slice(0, 3).forEach((row, i) => {
      Logger.log("User " + (i+1) + ": " + JSON.stringify({
        username: row[0],
        amphoe: amphoeIdx !== -1 ? row[amphoeIdx] : "N/A"
      }));
    });

    return {
      success: true,
      headers: headers,
      totalUsers: rows.length,
      amphoeColumnIndex: amphoeIdx
    };
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return { success: false, message: error.toString() };
  }
}

/** ====== FORCE AUTHORIZATION ====== **/
function forceAuthorization() {
  // ฟังก์ชันนี้จะบังคับให้ user authorize สิทธิ์
  try {
    PropertiesService.getUserProperties().getProperty("test");
    SpreadsheetApp.openById(SHEET_ID);
    return { success: true, message: "Authorization successful" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/** ====== AUTHENTICATION ====== **/
function login(username, password) {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(USER_SHEET_NAME);
    if (!sh) {
      return { success: false, message: "ไม่พบตาราง user" };
    }

    const data = sh.getDataRange().getValues();
    if (data.length < 2) {
      return { success: false, message: "ไม่มีข้อมูล user" };
    }

    const [headers, ...rows] = data;
    const userIdx = headers.findIndex(h => String(h).trim().toLowerCase() === "username");
    const passIdx = headers.findIndex(h => String(h).trim().toLowerCase() === "password");
    const amphoeIdx = headers.findIndex(h => String(h).trim() === "อำเภอ");

    if (userIdx === -1 || passIdx === -1) {
      return { success: false, message: "โครงสร้างตารางไม่ถูกต้อง" };
    }

    const user = rows.find(row =>
      String(row[userIdx]).trim() === username &&
      String(row[passIdx]).trim() === password
    );

    if (user) {
      // สร้าง session และเก็บใน ScriptProperties โดยอ้างอิงจาก sessionId
      const sessionId = Utilities.getUuid();
      const amphoe = amphoeIdx !== -1 ? String(user[amphoeIdx]).trim() : "";

      Logger.log("Login successful - Username: " + username + ", Amphoe: " + amphoe + ", AmphoeIdx: " + amphoeIdx);

      const now = new Date().getTime();
      const sessionObj = {
        sessionId: sessionId,
        username: username,
        amphoe: amphoe,
        loginTime: now
      };
      putSession_(sessionObj);

      // เก็บ sessionId ใน UserProperties เพื่อให้ doGet อ่านได้
      const userProperties = PropertiesService.getUserProperties();
      userProperties.setProperty("sessionId", sessionId);
      Logger.log("Saved sessionId to UserProperties: " + sessionId);

      return {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        sessionId: sessionId,
        username: username,
        amphoe: amphoe,
        redirectUrl: ScriptApp.getService().getUrl() + "?page=admin"
      };
    } else {
      return { success: false, message: "username หรือ password ไม่ถูกต้อง" };
    }
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาด: " + error.toString() };
  }
}

function logout(sessionId) {
  try {
    // ลบ session จาก ScriptProperties ตาม sessionId (ถ้ามี)
    if (sessionId) {
      clearSessionById_(sessionId);
    }
    // ลบ sessionId จาก UserProperties ด้วย
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty("sessionId");

    return {
      success: true,
      message: "ออกจากระบบสำเร็จ",
      redirectUrl: ScriptApp.getService().getUrl()
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
      redirectUrl: ScriptApp.getService().getUrl()
    };
  }
}

function getSession() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const sessionId = userProperties.getProperty("sessionId");

    Logger.log("Getting session from UserProperties - SessionId: " + sessionId);

    if (!sessionId) {
      Logger.log("No sessionId found in UserProperties");
      return null;
    }

    // ใช้ sessionId ไปดึงข้อมูล session จริงจาก ScriptProperties
    const session = getSessionById_(sessionId);
    if (!session) {
      Logger.log("Session not found in ScriptProperties");
      return null;
    }

    Logger.log("Session found - Username: " + session.username + ", Amphoe: " + session.amphoe);

    // ตรวจสอบว่า session หมดอายุหรือไม่ (24 ชั่วโมง)
    if (session.loginTime) {
      const now = new Date().getTime();
      const login = parseInt(session.loginTime);

      if (!isNaN(login)) {
        const hoursPassed = (now - login) / (1000 * 60 * 60);

        if (hoursPassed > 24) {
          Logger.log("Session expired");
          clearSessionById_(sessionId);
          userProperties.deleteProperty("sessionId");
          return null;
        }
      }
    }

    return session;
  } catch (error) {
    Logger.log("Error in getSession: " + error.toString());
    return null;
  }
}

function checkSession(sessionId) {
  try {
    // รองรับตรวจสอบด้วย sessionId ที่รับมาจาก client
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (session) {
      return {
        success: true,
        username: session.username || "",
        amphoe: session.amphoe || "",
        loginTime: session.loginTime
      };
    }
    return {
      success: false,
      message: "ไม่พบ session"
    };
  } catch (error) {
    Logger.log("Error in checkSession: " + error.toString());
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString()
    };
  }
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

/** ====== SERVER: RETURN DATA FOR ADMIN (FILTERED BY AMPHOE) ====== **/
function getAdminDataObj(sessionId) {
  try {
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      Logger.log("No session found");
      return { data: [], updatedAt: new Date(), error: "ไม่ได้ล็อกอิน" };
    }

    const amphoe = session.amphoe;
    if (!amphoe) {
      Logger.log("No amphoe in session");
      return { data: [], updatedAt: new Date(), error: "ไม่ได้กำหนดอำเภอ" };
    }

    Logger.log("Loading data for amphoe: " + amphoe);

    const cache = CacheService.getScriptCache();
    const cacheKey = "admin_rows_" + amphoe;
    let json = cache.get(cacheKey);

    if (!json) {
      const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
      const values = sh.getDataRange().getValues();
      const trim = (x) => (x == null ? "" : String(x).trim());
      let data = [];

      if (values && values.length > 1) {
        const [header, ...rows] = values;
        const amphoeIdx = header.findIndex(h => trim(h) === "อำเภอ");

        Logger.log("Amphoe column index: " + amphoeIdx);
        Logger.log("Total rows: " + rows.length);

        data = rows
          .filter((r) => r.some((v) => String(v).trim() !== "")) // ข้ามแถวว่าง
          .filter((r) => amphoeIdx !== -1 && trim(r[amphoeIdx]) === amphoe) // กรองเฉพาะอำเภอของ admin
          .map((r) => Object.fromEntries(header.map((h, i) => [trim(h), r[i]])));

        Logger.log("Filtered data count: " + data.length);
      }

      json = JSON.stringify({ data, updatedAt: new Date(), amphoe: amphoe });
      cache.put(cacheKey, json, CACHE_TTL_SECONDS);
    }

    const result = JSON.parse(json);
    Logger.log("Returning data with " + result.data.length + " rows");
    return result;
  } catch (error) {
    Logger.log("Error in getAdminDataObj: " + error.toString());
    return { data: [], updatedAt: new Date(), error: error.toString() };
  }
}

/** ====== GET TEMPLATE HEADERS ====== **/
function getTemplateHeaders() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return headers.map((h) => String(h).trim());
}

/** ====== UTILITY: ENSURE UUID COLUMN EXISTS ====== **/
function ensureUuidColumn() {
  try {
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // เช็คว่ามีคอลัมน์ "id" หรือยัง
    const uuidIdx = headers.findIndex(h => String(h).trim().toLowerCase() === "id");

    if (uuidIdx === -1) {
      // ยังไม่มีคอลัมน์ id - เพิ่มเป็นคอลัมน์แรก
      sh.insertColumnBefore(1);
      sh.getRange(1, 1).setValue("id");

      // สร้าง UUID ให้กับข้อมูลเดิมทั้งหมด
      const lastRow = sh.getLastRow();
      if (lastRow > 1) {
        const uuids = [];
        for (let i = 2; i <= lastRow; i++) {
          uuids.push([Utilities.getUuid()]);
        }
        sh.getRange(2, 1, uuids.length, 1).setValues(uuids);
      }

      Logger.log("UUID column created and populated");
      return 0; // คอลัมน์แรก
    }

    return uuidIdx;
  } catch (error) {
    Logger.log("Error ensuring UUID column: " + error.toString());
    throw error;
  }
}

/** ====== UTILITY: GET UUID INDEX ====== **/
function getUuidColumnIndex(headers) {
  return headers.findIndex(h => String(h).trim().toLowerCase() === "id");
}

/** ====== DEPRECATED: CREATE UNIQUE KEY (kept for migration) ====== **/
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

/** ====== IMPORT DATA FROM CSV/EXCEL (WITH UUID SUPPORT) ====== **/
function importData(csvData, sessionId) {
  try {
    // เช็ค session และดึงอำเภอของ admin
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    if (!adminAmphoe) {
      return { success: false, message: "ไม่ได้กำหนดอำเภอสำหรับ admin นี้" };
    }

    // ตรวจสอบและสร้างคอลัมน์ UUID ถ้ายังไม่มี
    ensureUuidColumn();

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

    // หา index ของคอลัมน์สำคัญ
    const uuidIdx = getUuidColumnIndex(existingHeaders);
    const amphoeIdx = existingHeaders.findIndex(h => String(h).trim() === "อำเภอ");
    const fnameIdx = existingHeaders.findIndex(h => String(h).trim() === "ชื่อ");
    const lnameIdx = existingHeaders.findIndex(h => String(h).trim() === "นามสกุล");

    // ตรวจสอบว่า headers ตรงกันหรือไม่ (อนุญาตให้ไฟล์ไม่มี id ก็ได้)
    const importHasUuid = headers.some(h => String(h).trim().toLowerCase() === "id");
    const importUuidIdx = headers.findIndex(h => String(h).trim().toLowerCase() === "id");

    // อ่านข้อมูลที่มีอยู่ทั้งหมด (ไม่รวม header)
    const lastRow = sh.getLastRow();
    const existingData =
      lastRow > 1
        ? sh.getRange(2, 1, lastRow - 1, existingHeaders.length).getValues()
        : [];

    // สร้าง Map ของข้อมูลเดิม (UUID => row number)
    const existingMap = new Map();
    existingData.forEach((row, idx) => {
      const uuid = uuidIdx !== -1 ? String(row[uuidIdx]).trim() : "";
      if (uuid) {
        existingMap.set(uuid, { rowNum: idx + 2, data: row }); // +2 เพราะเริ่มแถวที่ 2 (ข้าม header)
      }
    });

    // ประมวลผลข้อมูลใหม่
    let addCount = 0;
    let updateCount = 0;
    const newRows = [];

    dataRows.forEach((row) => {
      // ปรับขนาด row ให้ตรงกับ existingHeaders
      const maskedRow = new Array(existingHeaders.length).fill("");

      // คัดลอกข้อมูลจาก import
      headers.forEach((header, i) => {
        const targetIdx = existingHeaders.findIndex(h => String(h).trim() === String(header).trim());
        if (targetIdx !== -1 && i < row.length) {
          maskedRow[targetIdx] = row[i];
        }
      });

      // ปกปิดชื่อและนามสกุล
      if (fnameIdx !== -1 && maskedRow[fnameIdx]) {
        maskedRow[fnameIdx] = maskName(String(maskedRow[fnameIdx]));
      }
      if (lnameIdx !== -1 && maskedRow[lnameIdx]) {
        maskedRow[lnameIdx] = maskName(String(maskedRow[lnameIdx]));
      }

      // เซตอำเภอตาม admin
      if (amphoeIdx !== -1) {
        maskedRow[amphoeIdx] = adminAmphoe;
      }

      // ดึง UUID จากไฟล์ import (ถ้ามี)
      let uuid = "";
      if (importHasUuid && importUuidIdx !== -1 && importUuidIdx < row.length) {
        uuid = String(row[importUuidIdx]).trim();
      }

      // ตรวจสอบว่ามี UUID และมีข้อมูลเดิมหรือไม่
      if (uuid && existingMap.has(uuid)) {
        // อัปเดตข้อมูลเดิมตาม UUID
        const existing = existingMap.get(uuid);
        maskedRow[uuidIdx] = uuid; // เก็บ UUID เดิม
        sh.getRange(existing.rowNum, 1, 1, maskedRow.length).setValues([maskedRow]);
        updateCount++;
      } else {
        // เพิ่มใหม่ - สร้าง UUID ใหม่
        if (uuidIdx !== -1) {
          maskedRow[uuidIdx] = Utilities.getUuid();
        }
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

    // ล้าง cache ทั้งหมด
    const cache = CacheService.getScriptCache();
    cache.remove("rows");
    cache.remove("admin_rows_" + adminAmphoe);

    return {
      success: true,
      message: `นำเข้าสำเร็จ - เพิ่มใหม่ ${addCount} รายการ, อัปเดต ${updateCount} รายการ (อำเภอ: ${adminAmphoe})`,
      count: dataRows.length,
      added: addCount,
      updated: updateCount,
      amphoe: adminAmphoe,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== ADD SINGLE RECORD (WITH UUID) ====== **/
function addSingleRecord(recordData, sessionId) {
  try {
    // เช็ค session และดึงอำเภอของ admin
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    if (!adminAmphoe) {
      return { success: false, message: "ไม่ได้กำหนดอำเภอสำหรับ admin นี้" };
    }

    // ตรวจสอบและสร้างคอลัมน์ UUID ถ้ายังไม่มี
    ensureUuidColumn();

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const uuidIdx = getUuidColumnIndex(headers);

    // สร้าง UUID ใหม่สำหรับรายการนี้
    const newUuid = Utilities.getUuid();

    // สร้าง array ของข้อมูลตามลำดับ headers
    const rowData = headers.map((header) => {
      const key = String(header).trim();

      // UUID - ใช้ค่าที่สร้างใหม่
      if (key.toLowerCase() === "id") {
        return newUuid;
      }

      let value = recordData[key] || "";

      // ปกปิดชื่อและนามสกุล
      if (key === "ชื่อ" || key === "นามสกุล") {
        value = maskName(String(value));
      }

      // เซตอำเภอตาม admin
      if (key === "อำเภอ") {
        value = adminAmphoe;
      }

      return value;
    });

    // เพิ่มแถวใหม่
    const newRow = sh.getLastRow() + 1;
    sh.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

    // ล้าง cache
    const cache = CacheService.getScriptCache();
    cache.remove("rows");
    cache.remove("admin_rows_" + adminAmphoe);

    return {
      success: true,
      message: "เพิ่มข้อมูลใหม่สำเร็จ",
      action: "add",
      row: newRow,
      uuid: newUuid,
      amphoe: adminAmphoe,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== UPDATE RECORD BY UUID ====== **/
function updateRecordByUuid(uuid, recordData, sessionId) {
  try {
    // เช็ค session และดึงอำเภอของ admin
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    if (!adminAmphoe) {
      return { success: false, message: "ไม่ได้กำหนดอำเภอสำหรับ admin นี้" };
    }

    ensureUuidColumn();

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const uuidIdx = getUuidColumnIndex(headers);

    if (uuidIdx === -1) {
      return { success: false, message: "ไม่พบคอลัมน์ id" };
    }

    // หาแถวที่มี UUID ตรงกัน
    const lastRow = sh.getLastRow();
    let targetRow = -1;

    for (let i = 2; i <= lastRow; i++) {
      const cellUuid = sh.getRange(i, uuidIdx + 1).getValue();
      if (String(cellUuid).trim() === String(uuid).trim()) {
        targetRow = i;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: "ไม่พบข้อมูลที่ต้องการแก้ไข" };
    }

    // ตรวจสอบว่าเป็นของอำเภอเดียวกันหรือไม่
    const amphoeIdx = headers.findIndex(h => String(h).trim() === "อำเภอ");
    if (amphoeIdx !== -1) {
      const currentAmphoe = sh.getRange(targetRow, amphoeIdx + 1).getValue();
      if (String(currentAmphoe).trim() !== adminAmphoe) {
        return { success: false, message: "ไม่สามารถแก้ไขข้อมูลของอำเภออื่นได้" };
      }
    }

    // สร้าง array ของข้อมูลตามลำดับ headers
    const rowData = headers.map((header) => {
      const key = String(header).trim();

      // เก็บ UUID เดิม
      if (key.toLowerCase() === "id") {
        return uuid;
      }

      let value = recordData[key] || "";

      // ปกปิดชื่อและนามสกุล
      if (key === "ชื่อ" || key === "นามสกุล") {
        value = maskName(String(value));
      }

      // บังคับอำเภอตาม admin
      if (key === "อำเภอ") {
        value = adminAmphoe;
      }

      return value;
    });

    // อัปเดตข้อมูล
    sh.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

    // ล้าง cache
    const cache = CacheService.getScriptCache();
    cache.remove("rows");
    cache.remove("admin_rows_" + adminAmphoe);

    return {
      success: true,
      message: "แก้ไขข้อมูลสำเร็จ",
      uuid: uuid,
      row: targetRow,
      amphoe: adminAmphoe,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== DEPRECATED: UPDATE RECORD BY ROW INDEX ====== **/
function updateRecord(rowIndex, recordData, sessionId) {
  // Kept for backward compatibility
  Logger.log("WARNING: updateRecord by rowIndex is deprecated. Use updateRecordByUuid instead.");

  try {
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const uuidIdx = getUuidColumnIndex(headers);

    if (uuidIdx !== -1 && rowIndex >= 2 && rowIndex <= sh.getLastRow()) {
      const uuid = sh.getRange(rowIndex, uuidIdx + 1).getValue();
      if (uuid) {
        return updateRecordByUuid(String(uuid), recordData, sessionId);
      }
    }

    return { success: false, message: "ไม่สามารถอัปเดตได้" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/** ====== DELETE RECORD BY UUID ====== **/
function deleteRecordByUuid(uuid, sessionId) {
  try {
    // เช็ค session และดึงอำเภอของ admin
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    if (!adminAmphoe) {
      return { success: false, message: "ไม่ได้กำหนดอำเภอสำหรับ admin นี้" };
    }

    ensureUuidColumn();

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const uuidIdx = getUuidColumnIndex(headers);

    if (uuidIdx === -1) {
      return { success: false, message: "ไม่พบคอลัมน์ id" };
    }

    // หาแถวที่มี UUID ตรงกัน
    const lastRow = sh.getLastRow();
    let targetRow = -1;

    for (let i = 2; i <= lastRow; i++) {
      const cellUuid = sh.getRange(i, uuidIdx + 1).getValue();
      if (String(cellUuid).trim() === String(uuid).trim()) {
        targetRow = i;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: "ไม่พบข้อมูลที่ต้องการลบ" };
    }

    // ตรวจสอบว่าเป็นของอำเภอเดียวกันหรือไม่
    const amphoeIdx = headers.findIndex(h => String(h).trim() === "อำเภอ");
    if (amphoeIdx !== -1) {
      const currentAmphoe = sh.getRange(targetRow, amphoeIdx + 1).getValue();
      if (String(currentAmphoe).trim() !== adminAmphoe) {
        return { success: false, message: "ไม่สามารถลบข้อมูลของอำเภออื่นได้" };
      }
    }

    // ลบแถว
    sh.deleteRow(targetRow);

    // ล้าง cache
    const cache = CacheService.getScriptCache();
    cache.remove("rows");
    cache.remove("admin_rows_" + adminAmphoe);

    return {
      success: true,
      message: "ลบข้อมูลสำเร็จ",
      uuid: uuid,
      amphoe: adminAmphoe,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== DEPRECATED: DELETE RECORD BY ROW INDEX ====== **/
function deleteRecord(rowIndex, sessionId) {
  // Kept for backward compatibility
  Logger.log("WARNING: deleteRecord by rowIndex is deprecated. Use deleteRecordByUuid instead.");

  try {
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const uuidIdx = getUuidColumnIndex(headers);

    if (uuidIdx !== -1 && rowIndex >= 2 && rowIndex <= sh.getLastRow()) {
      const uuid = sh.getRange(rowIndex, uuidIdx + 1).getValue();
      if (uuid) {
        return deleteRecordByUuid(String(uuid), sessionId);
      }
    }

    return { success: false, message: "ไม่สามารถลบได้" };
  } catch (error) {
    return { success: false, message: error.toString() };
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

/** ====== EXPORT DATA WITH UUID ====== **/
function exportDataWithUuid(sessionId) {
  try {
    // เช็ค session และดึงอำเภอของ admin
    const session = sessionId ? getSessionById_(sessionId) : getSession();
    if (!session) {
      return { success: false, message: "ไม่ได้ล็อกอิน" };
    }

    const adminAmphoe = session.amphoe;
    if (!adminAmphoe) {
      return { success: false, message: "ไม่ได้กำหนดอำเภอสำหรับ admin นี้" };
    }

    ensureUuidColumn();

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const amphoeIdx = headers.findIndex(h => String(h).trim() === "อำเภอ");

    // อ่านข้อมูลทั้งหมด
    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      return { success: false, message: "ไม่มีข้อมูลสำหรับส่งออก" };
    }

    const allData = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();

    // กรองเฉพาะข้อมูลของอำเภอนี้
    const filteredData = allData.filter(row => {
      if (amphoeIdx !== -1) {
        return String(row[amphoeIdx]).trim() === adminAmphoe;
      }
      return true;
    });

    if (filteredData.length === 0) {
      return { success: false, message: "ไม่มีข้อมูลสำหรับอำเภอ " + adminAmphoe };
    }

    // สร้าง spreadsheet ใหม่สำหรับ export
    const exportSS = SpreadsheetApp.create("NCDs_Export_" + adminAmphoe + "_" + new Date().toISOString().split('T')[0]);
    const exportSheet = exportSS.getSheets()[0];
    exportSheet.setName("ncd_data");

    // ใส่ headers
    exportSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    exportSheet
      .getRange(1, 1, 1, headers.length)
      .setBackground("#4c74ff")
      .setFontColor("#ffffff")
      .setFontWeight("bold");

    // ใส่ข้อมูล
    exportSheet.getRange(2, 1, filteredData.length, headers.length).setValues(filteredData);

    // ปรับความกว้างคอลัมน์
    for (let i = 1; i <= headers.length; i++) {
      exportSheet.autoResizeColumn(i);
    }

    const url = exportSS.getUrl();

    return {
      success: true,
      url: url,
      message: "ส่งออกข้อมูลสำเร็จ (" + filteredData.length + " รายการ)",
      count: filteredData.length,
      amphoe: adminAmphoe,
    };
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + error.toString(),
    };
  }
}

/** ====== SESSION STORE (SCRIPT PROPERTIES) ====== **/
function putSession_(sessionObj) {
  try {
    const sp = PropertiesService.getScriptProperties();
    const key = "session:" + sessionObj.sessionId;
    sp.setProperty(key, JSON.stringify(sessionObj));
  } catch (e) {
    Logger.log("putSession_ error: " + e.toString());
  }
}

function getSessionById_(sessionId) {
  try {
    if (!sessionId) return null;
    const sp = PropertiesService.getScriptProperties();
    const raw = sp.getProperty("session:" + sessionId);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // หมดอายุ 24 ชั่วโมงเหมือนเดิม
    const now = new Date().getTime();
    const login = parseInt(s.loginTime);
    if (!isNaN(login)) {
      const hoursPassed = (now - login) / (1000 * 60 * 60);
      if (hoursPassed > 24) {
        clearSessionById_(sessionId);
        return null;
      }
    }
    return s;
  } catch (e) {
    Logger.log("getSessionById_ error: " + e.toString());
    return null;
  }
}

function clearSessionById_(sessionId) {
  try {
    if (!sessionId) return;
    const sp = PropertiesService.getScriptProperties();
    sp.deleteProperty("session:" + sessionId);
  } catch (e) {
    Logger.log("clearSessionById_ error: " + e.toString());
  }
}
