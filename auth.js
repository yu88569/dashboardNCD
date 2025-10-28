/* ============================================
   Authentication & Session Management
   NCDs Dashboard - GitHub Pages Version
   ============================================ */

class AuthManager {
  constructor() {
    this.sessionKey = "ncd_session_id";
    this.userKey = "ncd_user_data";
    this.apiUrl = window.APP_CONFIG?.API_URL || CONFIG?.API_URL;
  }

  /* ============================================
     Session Management
     ============================================ */

  /**
   * Get current session ID from localStorage
   */
  getSessionId() {
    try {
      const sessionId = localStorage.getItem(this.sessionKey);
      console.log("Getting session ID:", sessionId ? "Found" : "Not found");
      return sessionId;
    } catch (e) {
      console.error("Failed to get session ID:", e);
      return null;
    }
  }

  /**
   * Set session ID to localStorage
   */
  setSessionId(sessionId) {
    try {
      console.log("Setting session ID:", sessionId);
      localStorage.setItem(this.sessionKey, sessionId);
      console.log("Session ID saved successfully");
      return true;
    } catch (e) {
      console.error("Failed to set session ID:", e);
      return false;
    }
  }

  /**
   * Get user data from localStorage
   */
  getUserData() {
    try {
      const data = localStorage.getItem(this.userKey);
      const parsed = data ? JSON.parse(data) : null;
      console.log("Getting user data:", parsed);
      return parsed;
    } catch (e) {
      console.error("Failed to get user data:", e);
      return null;
    }
  }

  /**
   * Set user data to localStorage
   */
  setUserData(userData) {
    try {
      console.log("Setting user data:", userData);
      localStorage.setItem(this.userKey, JSON.stringify(userData));
      console.log("User data saved successfully");
      return true;
    } catch (e) {
      console.error("Failed to set user data:", e);
      return false;
    }
  }

  /**
   * Clear all session data
   */
  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey);
      localStorage.removeItem(this.userKey);
      return true;
    } catch (e) {
      console.error("Failed to clear session:", e);
      return false;
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const loggedIn = !!this.getSessionId();
    console.log("Is logged in:", loggedIn);
    return loggedIn;
  }

  /* ============================================
     API Calls
     ============================================ */

  /**
   * Login with username and password
   */
  async login(username, password) {
    try {
      const formData = new URLSearchParams();
      formData.append("action", "login");
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Login API response:", result);

      if (result.success) {
        // Save session
        console.log("Login successful, saving session...");
        this.setSessionId(result.sessionId);
        this.setUserData({
          username: result.user.username,
          amphoe: result.user.amphoe,
        });
        console.log("Session saved. Verifying...");
        console.log("Stored session ID:", this.getSessionId());
        console.log("Stored user data:", this.getUserData());
      } else {
        console.warn("Login failed:", result.message);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error.message,
      };
    }
  }

  /**
   * Logout (clear session)
   */
  async logout() {
    const sessionId = this.getSessionId();

    if (sessionId) {
      try {
        const formData = new URLSearchParams();
        formData.append("action", "logout");
        formData.append("sessionId", sessionId);

        await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Clear local session regardless of API result
    this.clearSession();

    return { success: true };
  }

  /**
   * Check if session is still valid
   */
  async checkSession() {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      return { valid: false, message: "No session found" };
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "checkSession");
      formData.append("sessionId", sessionId);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.valid) {
        // Session expired, clear local storage
        this.clearSession();
      }

      return result;
    } catch (error) {
      console.error("Check session error:", error);
      return {
        valid: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบ session: " + error.message,
      };
    }
  }

  /**
   * Get admin data (filtered by amphoe)
   */
  async getAdminData() {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "getAdminData");
      formData.append("sessionId", sessionId);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch admin data");
      }

      return result;
    } catch (error) {
      console.error("Get admin data error:", error);
      throw error;
    }
  }

  /**
   * Add new record
   */
  async addRecord(recordData) {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "addRecord");
      formData.append("sessionId", sessionId);
      formData.append("data", JSON.stringify(recordData));

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to add record");
      }

      return result;
    } catch (error) {
      console.error("Add record error:", error);
      throw error;
    }
  }

  /**
   * Update existing record
   */
  async updateRecord(rowIndex, recordData) {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "updateRecord");
      formData.append("sessionId", sessionId);
      formData.append("rowIndex", rowIndex);
      formData.append("data", JSON.stringify(recordData));

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update record");
      }

      return result;
    } catch (error) {
      console.error("Update record error:", error);
      throw error;
    }
  }

  /**
   * Delete record
   */
  async deleteRecord(rowIndex) {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "deleteRecord");
      formData.append("sessionId", sessionId);
      formData.append("rowIndex", rowIndex);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to delete record");
      }

      return result;
    } catch (error) {
      console.error("Delete record error:", error);
      throw error;
    }
  }

  /**
   * Import CSV data
   */
  async importCSV(csvData) {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "importCSV");
      formData.append("sessionId", sessionId);
      formData.append("csvData", csvData);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to import CSV");
      }

      return result;
    } catch (error) {
      console.error("Import CSV error:", error);
      throw error;
    }
  }

  /**
   * Export data to Google Sheets
   */
  async exportToSheets() {
    const sessionId = this.getSessionId();

    if (!sessionId) {
      throw new Error("No session found. Please login.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append("action", "exportToSheets");
      formData.append("sessionId", sessionId);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to export data");
      }

      return result;
    } catch (error) {
      console.error("Export to sheets error:", error);
      throw error;
    }
  }
}

// Create global instance
const auth = new AuthManager();

// Export for ES6 modules (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager;
}
