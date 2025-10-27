/**
 * Configuration Example for NCDs Dashboard
 *
 * คัดลอกไฟล์นี้เป็น config.js และแก้ไขค่าต่างๆ ตามที่ต้องการ
 *
 * สำคัญ: อย่าลืมเพิ่ม config.js ใน .gitignore เพื่อไม่ให้ commit ขึ้น GitHub
 */

const CONFIG = {
  /**
   * Google Apps Script Web App URL
   *
   * วิธีหา:
   * 1. เปิด Google Apps Script Project
   * 2. Deploy > New deployment > Web app
   * 3. คัดลอก Web app URL
   *
   * ตัวอย่าง: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec'
   */
  API_URL:
    "https://script.google.com/macros/s/AKfycbzL-GA4g93TClmSOwuW2zO5f2eGjqmOGMNGe476GgobHCE4tn14r46u4Ts8-yJSktdS/exec",

  /**
   * ชื่อแอปพลิเคชัน
   */
  APP_NAME: "NCDs Dashboard",

  /**
   * เวอร์ชัน
   */
  VERSION: "1.0.0",

  /**
   * การตั้งค่า Cache
   */
  CACHE: {
    // เวลา cache ในหน่วยวินาที (300 = 5 นาที)
    TTL_SECONDS: 300,

    // เปิด/ปิดการใช้งาน cache
    ENABLED: true,
  },

  /**
   * การตั้งค่า Theme
   */
  THEME: {
    // Theme เริ่มต้น: 'dark' หรือ 'light'
    DEFAULT: "dark",

    // บันทึก theme preference ใน localStorage
    SAVE_PREFERENCE: true,
  },

  /**
   * การตั้งค่าตาราง
   */
  TABLE: {
    // จำนวนแถวสูงสุดที่แสดงในตาราง
    MAX_ROWS: 200,

    // เปิด/ปิดการแสดงตาราง
    SHOW_TABLE: false,
  },

  /**
   * การตั้งค่ากราฟ
   */
  CHARTS: {
    // จำนวนตำบลที่แสดงใน Top N chart
    TOP_TAMBON_LIMIT: 10,

    // ความสูงของกราฟ (pixels)
    DEFAULT_HEIGHT: 320,

    // Animation duration (milliseconds)
    ANIMATION_DURATION: 750,
  },

  /**
   * การตั้งค่า API
   */
  API: {
    // Timeout สำหรับ API request (milliseconds)
    TIMEOUT: 30000,

    // Retry count เมื่อ API fail
    RETRY_COUNT: 3,

    // Retry delay (milliseconds)
    RETRY_DELAY: 1000,
  },

  /**
   * การตั้งค่า Debug
   */
  DEBUG: {
    // เปิด/ปิด console.log
    ENABLED: false,

    // แสดง API response ใน console
    LOG_API_RESPONSE: false,

    // แสดง error stack trace
    LOG_ERRORS: true,
  },

  /**
   * คอลัมน์ข้อมูล (ต้องตรงกับ Google Sheet)
   */
  COLUMNS: {
    FNAME: "ชื่อ",
    LNAME: "นามสกุล",
    GENDER: "เพศ",
    VILLAGE: "ชื่อหมู่บ้าน",
    HOUSE: "บ้านเลขที่",
    PROVINCE: "จังหวัด",
    AMPHOE: "อำเภอ",
    TAMBON: "ตำบล",
    PHONE: "เบอร์โทรศัพท์",
    NCD: "ภาพรวมของการประเมินโรค NCDs",
    OBESITY: "โรคอ้วน",
    DM: "โรคเบาหวาน",
    HTN: "โรคความดันโลหิต",
    MENTAL: "สุขภาพจิต",
    SMOKE: "สูบบุหรี่",
    ALCOHOL: "แอลกอฮอล์",
    STATUS: "สถานะ",
    REFER: "ส่งต่อหน่วยบริการ",
    REFER_CODE: "รหัสหน่วยบริการที่ส่งออก",
  },

  /**
   * ข้อความและ Labels
   */
  LABELS: {
    TOTAL: "รวมทั้งหมด",
    RISK: "เสี่ยง",
    NORMAL: "ปกติ",
    FINISHED: "เสร็จสิ้น",
    MALE: "ชาย",
    FEMALE: "หญิง",
    MONK: "พระสงฆ์",
    ALL: "ทั้งหมด",
  },

  /**
   * สีสำหรับกราฟและ UI
   */
  COLORS: {
    NORMAL: "#79f2c0",
    RISK: "#ffd37a",
    DANGER: "#ff8f8f",
    MALE: "#89cff0",
    FEMALE: "#ffb6c1",
    MONK: "#ffd700",
    PRIMARY: "#4c74ff",
  },
};

// Export configuration (ถ้าใช้ modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}

// Make available globally
if (typeof window !== "undefined") {
  window.APP_CONFIG = CONFIG;
}
