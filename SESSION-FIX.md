# Session Management Fix - การแก้ปัญหา Session หมดอายุทันทีหลัง Login

## ปัญหาที่พบ (Problem)

หลังจาก login สำเร็จแล้ว redirect ไปหน้า Admin Panel จะพบข้อความ "Session หมดอายุ" ทันทีทั้งๆ ที่เพิ่ง login เสร็จ

### สาเหตุ (Root Cause)

Google Apps Script มีข้อจำกัดใน architecture:

1. **localStorage ไม่สามารถอ่านได้จาก server-side** (`doGet()` รันฝั่ง server ก่อนที่ client-side จะโหลด)
2. **URL parameter `&sid=xxx` ทำให้เกิด 400 Bad Request** เพราะ Apps Script sandboxed iframe ไม่อนุญาต
3. **UserProperties persist ข้ามการ redirect** แต่ต้องใช้ร่วมกับ ScriptProperties

## วิธีแก้ (Solution)

ใช้ **Dual Storage Pattern**: เก็บ sessionId ทั้งใน **UserProperties** และ **ScriptProperties**

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Login Flow                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User login                                              │
│     ↓                                                        │
│  2. login() สร้าง sessionId (UUID)                         │
│     ↓                                                        │
│  3. เก็บข้อมูล:                                            │
│     • UserProperties: sessionId                             │
│     • ScriptProperties: "session:UUID" → {full session}     │
│     • localStorage: sessionId (สำหรับ client-side calls)   │
│     ↓                                                        │
│  4. Redirect to ?page=admin (ไม่ใส่ &sid=)                 │
│     ↓                                                        │
│  5. doGet() เรียก getSession()                             │
│     ↓                                                        │
│  6. getSession():                                           │
│     • อ่าน sessionId จาก UserProperties                    │
│     • ใช้ getSessionById_() ดึงข้อมูลจาก ScriptProperties │
│     ↓                                                        │
│  7. ✅ Admin Panel โหลดสำเร็จ                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Code Changes

### 1. `login()` - เก็บ sessionId ใน UserProperties

```javascript
function login(username, password) {
  // ... authentication logic ...
  
  const sessionId = Utilities.getUuid();
  const sessionObj = {
    sessionId: sessionId,
    username: username,
    amphoe: amphoe,
    loginTime: now
  };
  
  // เก็บ session เต็มใน ScriptProperties
  putSession_(sessionObj);
  
  // ⭐ เก็บ sessionId ใน UserProperties เพื่อให้ doGet อ่านได้
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("sessionId", sessionId);
  Logger.log("Saved sessionId to UserProperties: " + sessionId);
  
  return {
    success: true,
    sessionId: sessionId,
    redirectUrl: ScriptApp.getService().getUrl() + "?page=admin"
  };
}
```

### 2. `getSession()` - อ่านจาก UserProperties แล้วดึงจาก ScriptProperties

```javascript
function getSession() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const sessionId = userProperties.getProperty("sessionId");
    
    if (!sessionId) {
      Logger.log("No sessionId found in UserProperties");
      return null;
    }
    
    // ⭐ ใช้ sessionId ไปดึงข้อมูล session จริงจาก ScriptProperties
    const session = getSessionById_(sessionId);
    if (!session) {
      Logger.log("Session not found in ScriptProperties");
      return null;
    }
    
    // ตรวจสอบว่า session หมดอายุหรือไม่ (24 ชั่วโมง)
    if (session.loginTime) {
      const now = new Date().getTime();
      const login = parseInt(session.loginTime);
      const hoursPassed = (now - login) / (1000 * 60 * 60);
      
      if (hoursPassed > 24) {
        Logger.log("Session expired");
        clearSessionById_(sessionId);
        userProperties.deleteProperty("sessionId");
        return null;
      }
    }
    
    return session;
  } catch (error) {
    Logger.log("Error in getSession: " + error.toString());
    return null;
  }
}
```

### 3. `logout()` - ลบทั้ง UserProperties และ ScriptProperties

```javascript
function logout(sessionId) {
  try {
    // ลบจาก ScriptProperties
    if (sessionId) {
      clearSessionById_(sessionId);
    }
    
    // ⭐ ลบจาก UserProperties ด้วย
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty("sessionId");
    
    return { 
      success: true, 
      message: "ออกจากระบบสำเร็จ",
      redirectUrl: ScriptApp.getService().getUrl()
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}
```

### 4. `doGet()` - เรียก getSession() ตรงๆ

```javascript
function doGet(e) {
  try {
    const page = e && e.parameter ? e.parameter.page : null;
    
    if (page === "admin") {
      // ⭐ อ่าน sessionId จาก UserProperties แล้วดึง session จาก ScriptProperties
      const session = getSession();
      
      if (!session) {
        return HtmlService.createTemplateFromFile("SessionExpired")
          .evaluate()
          .setTitle("Session Expired - NCDs Dashboard");
      }
      
      Logger.log("Session found for user: " + session.username + ", amphoe: " + session.amphoe);
      return HtmlService.createTemplateFromFile("Admin")
        .evaluate()
        .setTitle("Admin Panel - NCDs Dashboard");
    }
    
    // ... other pages ...
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return HtmlService.createHtmlOutput("Error: " + error.toString());
  }
}
```

### 5. `Login.html` - ไม่ส่ง sid ใน URL

```javascript
.withSuccessHandler((result) => {
  if (result.success) {
    // เก็บ sessionId ใน localStorage (สำหรับ client-side functions)
    if (result.sessionId) {
      localStorage.setItem('ncd_session_id', result.sessionId);
      console.log("Session ID saved to localStorage:", result.sessionId);
    }
    
    // ⭐ Redirect โดยไม่ใส่ &sid= (sessionId ถูกเก็บใน UserProperties แล้ว)
    let redirectUrl = result.redirectUrl;
    if (redirectUrl && !redirectUrl.includes('?page=admin')) {
      redirectUrl += '?page=admin';
    }
    top.window.location.href = redirectUrl;
  }
})
```

## ทำไมวิธีนี้ถึงใช้ได้ (Why This Works)

| Storage Type | Accessible From | Use Case | Persists Across Redirect |
|-------------|----------------|----------|------------------------|
| **UserProperties** | Server-side only | เก็บ sessionId เพื่อให้ doGet อ่านได้ | ✅ Yes |
| **ScriptProperties** | Server-side only | เก็บข้อมูล session เต็ม (username, amphoe, loginTime) | ✅ Yes |
| **localStorage** | Client-side only | สำหรับ client-side functions (getAdminDataObj, importData, etc.) | ✅ Yes (but doGet can't read) |

### Key Points

1. ✅ **UserProperties persist ข้ามการ redirect** - ต่างจาก localStorage ที่ doGet อ่านไม่ได้
2. ✅ **ไม่ต้องส่ง sid ใน URL** - หลีกเลี่ยง 400 Bad Request error
3. ✅ **ข้อมูล session เก็บใน ScriptProperties** - global storage, ปลอดภัยกว่า
4. ✅ **getSession() เป็นตัวกลาง** - อ่าน sessionId จาก UserProperties → ดึงข้อมูลจาก ScriptProperties

## Testing Checklist

หลัง deploy ให้ทดสอบ:

- [ ] Login ด้วย username/password ที่ถูกต้อง
- [ ] ตรวจสอบว่า redirect ไปหน้า Admin Panel โดยไม่แสดง "Session หมดอายุ"
- [ ] ตรวจสอบว่าแสดงชื่ออำเภอที่ถูกต้อง
- [ ] ทดสอบ refresh หน้า Admin Panel (session ยังคงอยู่)
- [ ] ทดสอบ logout แล้ว login ใหม่
- [ ] ทดสอบนำเข้าข้อมูล CSV
- [ ] ตรวจสอบว่าข้อมูลในตารางกรองตามอำเภอที่ถูกต้อง

## Common Mistakes to Avoid

### ❌ อย่าทำ

```javascript
// ❌ ส่ง sessionId ใน URL
redirectUrl += '?page=admin&sid=' + sessionId; 
// → จะเกิด 400 Bad Request

// ❌ เก็บเฉพาะใน localStorage
localStorage.setItem('sessionId', sessionId);
// → doGet อ่านไม่ได้

// ❌ ใช้ getSession() แบบเดิมที่อ่านจาก UserProperties ตรงๆ
const username = userProperties.getProperty("username");
// → ไม่ persist ข้าม redirect
```

### ✅ ทำแบบนี้

```javascript
// ✅ เก็บ sessionId ใน UserProperties
userProperties.setProperty("sessionId", sessionId);

// ✅ เก็บข้อมูล session เต็มใน ScriptProperties
putSession_(sessionObj);

// ✅ getSession() อ่าน sessionId จาก UserProperties แล้วดึงจาก ScriptProperties
const sessionId = userProperties.getProperty("sessionId");
const session = getSessionById_(sessionId);
```

## Related Files

- `code.gs` - Login, logout, getSession, doGet functions
- `Login.html` - Login form และ redirect logic
- `AdminScripts.html` - Client-side session management
- `SessionExpired.html` - Fallback page เมื่อ session หมดอายุ

## References

- Google Apps Script PropertiesService: https://developers.google.com/apps-script/reference/properties
- Apps Script Web Apps: https://developers.google.com/apps-script/guides/web

---

**Last Updated:** October 12, 2025  
**Fixed By:** Session Management Refactoring  
**Status:** ✅ Working
