/* ============================================
   Admin Panel Logic
   NCDs Dashboard - GitHub Pages Version
   ============================================ */

// DOM Elements
const $ = (id) => document.getElementById(id);
const loading = $("loading");
const dataContainer = $("data-container");
const tableBody = $("table-body");

// Modals
const recordModal = $("record-modal");
const importModal = $("import-modal");

// Stats
const totalRecords = $("total-records");
const totalRisk = $("total-risk");
const totalNormal = $("total-normal");
const totalFinished = $("total-finished");

// User info
const usernameEl = $("username");
const amphoeEl = $("amphoe");

// Data storage
let adminData = [];
let currentEditIndex = null;

// Pagination
let currentPage = 1;
let itemsPerPage = 20;
let totalPages = 1;

/* ============================================
   Initialization
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== Admin panel loading ===");
  console.log("Current URL:", window.location.href);
  console.log("localStorage keys:", Object.keys(localStorage));
  console.log("Auth object:", auth);

  // Check authentication
  console.log("Checking if user is logged in...");
  if (!auth.isLoggedIn()) {
    console.error("User is not logged in - no session found");
    alert("❌ กรุณา Login ก่อนเข้าใช้งาน");
    window.location.href = "index.html";
    return;
  }
  console.log("User is logged in, session found");

  // Initialize first (so user sees the interface)
  initTheme();
  loadUserInfo();
  setupEventListeners();

  // Verify session (with better error handling)
  try {
    console.log("Verifying session with API...");
    const sessionCheck = await auth.checkSession();
    console.log("Session check result:", sessionCheck);

    if (!sessionCheck.valid) {
      console.warn("Session check failed:", sessionCheck.message);
      alert("❌ Session หมดอายุ\nกรุณา Login ใหม่");
      auth.clearSession();
      window.location.href = "index.html";
      return;
    }

    console.log("Session is valid, loading data...");
    // Load data only after session is verified
    await loadData();
    console.log("=== Admin panel loaded successfully ===");
  } catch (error) {
    console.error("Session verification error:", error);
    // If API is unreachable, allow user to continue (they're already logged in)
    console.warn("Unable to verify session with server, proceeding anyway...");

    // Try to load data anyway
    try {
      console.log("Attempting to load data despite session check failure...");
      await loadData();
      console.log("Data loaded successfully despite session check failure");
    } catch (dataError) {
      console.error("Failed to load data:", dataError);
      alert("❌ ไม่สามารถโหลดข้อมูลได้\nกรุณาตรวจสอบการเชื่อมต่อ API");
    }
  }
});

/* ============================================
   Theme Management
   ============================================ */

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
    $("theme-toggle").textContent = "☀️";
  } else {
    document.body.classList.remove("light-theme");
    $("theme-toggle").textContent = "🌙";
  }
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
}

/* ============================================
   User Info
   ============================================ */

function loadUserInfo() {
  const userData = auth.getUserData();
  if (userData) {
    usernameEl.textContent = userData.username || "-";
    amphoeEl.textContent = `อำเภอ: ${userData.amphoe || "-"}`;
  }
}

/* ============================================
   Event Listeners
   ============================================ */

function setupEventListeners() {
  // Theme toggle
  $("theme-toggle").addEventListener("click", toggleTheme);

  // Logout
  $("logout-btn").addEventListener("click", handleLogout);

  // Actions
  $("add-record-btn").addEventListener("click", () => openRecordModal());
  $("import-csv-btn").addEventListener("click", () => openImportModal());
  $("export-btn").addEventListener("click", handleExport);
  $("refresh-btn").addEventListener("click", loadData);
  $("back-to-dashboard-btn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Pagination
  $("first-page-btn").addEventListener("click", () => goToPage(1));
  $("prev-page-btn").addEventListener("click", () => goToPage(currentPage - 1));
  $("next-page-btn").addEventListener("click", () => goToPage(currentPage + 1));
  $("last-page-btn").addEventListener("click", () => goToPage(totalPages));

  // Record Modal
  $("close-record-modal").addEventListener("click", closeRecordModal);
  $("cancel-btn").addEventListener("click", closeRecordModal);
  $("record-form").addEventListener("submit", handleSaveRecord);

  // Import Modal
  $("close-import-modal").addEventListener("click", closeImportModal);
  $("cancel-import-btn").addEventListener("click", closeImportModal);
  $("csv-file").addEventListener("change", handleFileSelect);
  $("confirm-import-btn").addEventListener("click", handleImportCSV);

  // Close modals on outside click
  window.addEventListener("click", (e) => {
    if (e.target === recordModal) closeRecordModal();
    if (e.target === importModal) closeImportModal();
  });
}

/* ============================================
   Data Loading
   ============================================ */

async function loadData() {
  try {
    showLoading(true);
    dataContainer.style.display = "none";

    console.log("Loading admin data...");
    const result = await auth.getAdminData();
    console.log("Admin data loaded:", result);

    if (result.success) {
      adminData = result.data || [];
      console.log("Data array length:", adminData.length);
      currentPage = 1; // Reset to first page
      calculatePagination();
      renderTable();
      updateStats();
      updatePaginationControls();
      dataContainer.style.display = "block";
    } else {
      throw new Error(result.message || "Failed to load data");
    }
  } catch (error) {
    console.error("Load data error:", error);

    // Show more detailed error message
    let errorMsg = "❌ เกิดข้อผิดพลาดในการโหลดข้อมูล\n\n";
    errorMsg += "รายละเอียด: " + error.message + "\n\n";

    // Check if session expired
    if (
      error.message.includes("session") ||
      error.message.includes("login") ||
      error.message.includes("ไม่ได้ล็อกอิน")
    ) {
      errorMsg += "กรุณา Login ใหม่";
      alert(errorMsg);
      auth.clearSession();
      window.location.href = "index.html";
    } else {
      errorMsg += "กรุณาตรวจสอบ:\n";
      errorMsg += "1. การเชื่อมต่ออินเทอร์เน็ต\n";
      errorMsg += "2. การตั้งค่า Google Apps Script\n";
      errorMsg += "3. สิทธิ์การเข้าถึง Google Sheets";
      alert(errorMsg);
    }
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  if (show) {
    loading.classList.add("active");
  } else {
    loading.classList.remove("active");
  }
}

/* ============================================
   Pagination
   ============================================ */

function calculatePagination() {
  totalPages = Math.ceil(adminData.length / itemsPerPage);
  if (totalPages === 0) totalPages = 1;
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  updatePaginationControls();
}

function updatePaginationControls() {
  $("current-page").textContent = currentPage;
  $("total-pages").textContent = totalPages;

  $("first-page-btn").disabled = currentPage === 1;
  $("prev-page-btn").disabled = currentPage === 1;
  $("next-page-btn").disabled = currentPage === totalPages;
  $("last-page-btn").disabled = currentPage === totalPages;
}

/* ============================================
   Table Rendering
   ============================================ */

function renderTable() {
  tableBody.innerHTML = "";

  if (adminData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="21" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            📭 ไม่มีข้อมูล
          </p>
        </td>
      </tr>
    `;
    return;
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, adminData.length);
  const pageData = adminData.slice(startIndex, endIndex);

  pageData.forEach((record, pageIndex) => {
    const actualIndex = startIndex + pageIndex;
    const row = document.createElement("tr");

    // Get status badge class
    const ncd = (record["ภาพรวมของการประเมินโรค NCDs"] || "").toLowerCase();
    let statusClass = "status-badge";
    if (ncd.includes("ปกติ")) statusClass += " status-normal";
    else if (ncd.includes("เสี่ยง")) statusClass += " status-risk";
    else if (ncd.includes("ป่วย")) statusClass += " status-sick";

    row.innerHTML = `
      <td>${actualIndex + 1}</td>
      <td>${record["ชื่อ"] || "-"}</td>
      <td>${record["นามสกุล"] || "-"}</td>
      <td>${record["เพศ"] || "-"}</td>
      <td>${record["ชื่อหมู่บ้าน"] || "-"}</td>
      <td>${record["บ้านเลขที่"] || "-"}</td>
      <td>${record["จังหวัด"] || "-"}</td>
      <td>${record["อำเภอ"] || "-"}</td>
      <td>${record["ตำบล"] || "-"}</td>
      <td>${record["เบอร์โทรศัพท์"] || "-"}</td>
      <td><span class="${statusClass}">${record["ภาพรวมของการประเมินโรค NCDs"] || "-"}</span></td>
      <td>${record["โรคอ้วน"] || "-"}</td>
      <td>${record["โรคเบาหวาน"] || "-"}</td>
      <td>${record["โรคความดันโลหิต"] || "-"}</td>
      <td>${record["สุขภาพจิต"] || "-"}</td>
      <td>${record["สูบบุหรี่"] || "-"}</td>
      <td>${record["แอลกอฮอล์"] || "-"}</td>
      <td>${record["สถานะ"] || "-"}</td>
      <td>${record["ส่งต่อหน่วยบริการ"] || "-"}</td>
      <td>${record["รหัสหน่วยบริการที่ส่งออก"] || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="openRecordModal(${actualIndex})">
            ✏️
          </button>
          <button class="btn-delete" onclick="handleDelete(${actualIndex})">
            🗑️
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

/* ============================================
   Statistics
   ============================================ */

function updateStats() {
  const total = adminData.length;
  let risk = 0;
  let normal = 0;
  let finished = 0;

  adminData.forEach((record) => {
    const ncd = (record["ภาพรวมของการประเมินโรค NCDs"] || "").toLowerCase();
    const status = (record["สถานะ"] || "").toLowerCase();

    if (ncd.includes("เสี่ยง") || ncd.includes("ป่วย")) risk++;
    if (ncd.includes("ปกติ")) normal++;
    if (status.includes("เสร็จสิ้น")) finished++;
  });

  totalRecords.textContent = total;
  totalRisk.textContent = risk;
  totalNormal.textContent = normal;
  totalFinished.textContent = finished;
}

/* ============================================
   Record Modal
   ============================================ */

function openRecordModal(index = null) {
  currentEditIndex = index;

  const form = $("record-form");
  form.reset();

  if (index !== null && adminData[index]) {
    // Edit mode
    $("modal-title").textContent = "แก้ไขรายการ";
    $("record-index").value = index;

    const record = adminData[index];
    $("fname").value = record["ชื่อ"] || "";
    $("lname").value = record["นามสกุล"] || "";
    $("gender").value = record["เพศ"] || "";
    $("village").value = record["ชื่อหมู่บ้าน"] || "";
    $("house").value = record["บ้านเลขที่"] || "";
    $("province").value = record["จังหวัด"] || "";
    $("amphoe-input").value = record["อำเภอ"] || "";
    $("tambon").value = record["ตำบล"] || "";
    $("phone").value = record["เบอร์โทรศัพท์"] || "";
    $("ncd").value = record["ภาพรวมของการประเมินโรค NCDs"] || "";
    $("obesity").value = record["โรคอ้วน"] || "";
    $("dm").value = record["โรคเบาหวาน"] || "";
    $("htn").value = record["โรคความดันโลหิต"] || "";
    $("mental").value = record["สุขภาพจิต"] || "";
    $("smoke").value = record["สูบบุหรี่"] || "";
    $("alcohol").value = record["แอลกอฮอล์"] || "";
    $("status").value = record["สถานะ"] || "";
    $("refer").value = record["ส่งต่อหน่วยบริการ"] || "";
    $("refer-code").value = record["รหัสหน่วยบริการที่ส่งออก"] || "";
  } else {
    // Add mode
    $("modal-title").textContent = "เพิ่มรายการใหม่";
    $("record-index").value = "";

    // Pre-fill user's amphoe
    const userData = auth.getUserData();
    if (userData && userData.amphoe) {
      $("amphoe-input").value = userData.amphoe;
    }
  }

  recordModal.style.display = "block";
}

function closeRecordModal() {
  recordModal.style.display = "none";
  currentEditIndex = null;
}

async function handleSaveRecord(e) {
  e.preventDefault();

  const formData = {
    ชื่อ: $("fname").value.trim(),
    นามสกุล: $("lname").value.trim(),
    เพศ: $("gender").value,
    ชื่อหมู่บ้าน: $("village").value.trim(),
    บ้านเลขที่: $("house").value.trim(),
    จังหวัด: $("province").value.trim(),
    อำเภอ: $("amphoe-input").value.trim(),
    ตำบล: $("tambon").value.trim(),
    เบอร์โทรศัพท์: $("phone").value.trim(),
    "ภาพรวมของการประเมินโรค NCDs": $("ncd").value,
    โรคอ้วน: $("obesity").value,
    โรคเบาหวาน: $("dm").value,
    โรคความดันโลหิต: $("htn").value,
    สุขภาพจิต: $("mental").value,
    สูบบุหรี่: $("smoke").value,
    แอลกอฮอล์: $("alcohol").value,
    สถานะ: $("status").value,
    ส่งต่อหน่วยบริการ: $("refer").value.trim(),
    รหัสหน่วยบริการที่ส่งออก: $("refer-code").value.trim(),
  };

  try {
    showLoading(true);

    let result;
    if (currentEditIndex !== null) {
      // Update existing record
      result = await auth.updateRecord(currentEditIndex, formData);
    } else {
      // Add new record
      result = await auth.addRecord(formData);
    }

    if (result.success) {
      alert("✅ บันทึกสำเร็จ!");
      closeRecordModal();
      await loadData();
    } else {
      throw new Error(result.message || "Failed to save record");
    }
  } catch (error) {
    console.error("Save record error:", error);
    alert("❌ เกิดข้อผิดพลาดในการบันทึก\n" + error.message);
  } finally {
    showLoading(false);
  }
}

/* ============================================
   Delete Record
   ============================================ */

async function handleDelete(index) {
  const record = adminData[index];
  const name = `${record["ชื่อ"] || ""} ${record["นามสกุล"] || ""}`.trim();

  if (!confirm(`❓ ต้องการลบรายการ "${name}" หรือไม่?`)) {
    return;
  }

  try {
    showLoading(true);

    const result = await auth.deleteRecord(index);

    if (result.success) {
      alert("✅ ลบรายการสำเร็จ!");
      await loadData();
    } else {
      throw new Error(result.message || "Failed to delete record");
    }
  } catch (error) {
    console.error("Delete record error:", error);
    alert("❌ เกิดข้อผิดพลาดในการลบ\n" + error.message);
  } finally {
    showLoading(false);
  }
}

/* ============================================
   CSV Import
   ============================================ */

let csvData = null;

function openImportModal() {
  $("csv-file").value = "";
  $("csv-preview").value = "";
  csvData = null;
  importModal.style.display = "block";
}

function closeImportModal() {
  importModal.style.display = "none";
  csvData = null;
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    csvData = event.target.result;

    // Show preview (first 5 lines)
    const lines = csvData.split("\n").slice(0, 5);
    $("csv-preview").value = lines.join("\n");
  };
  reader.readAsText(file, "UTF-8");
}

async function handleImportCSV() {
  if (!csvData) {
    alert("❌ กรุณาเลือกไฟล์ CSV ก่อน");
    return;
  }

  if (!confirm("❓ ต้องการนำเข้าข้อมูลหรือไม่?")) {
    return;
  }

  try {
    showLoading(true);
    closeImportModal();

    const result = await auth.importCSV(csvData);

    if (result.success) {
      alert(`✅ นำเข้าข้อมูลสำเร็จ!\n${result.count || 0} รายการ`);
      await loadData();
    } else {
      throw new Error(result.message || "Failed to import CSV");
    }
  } catch (error) {
    console.error("Import CSV error:", error);
    alert("❌ เกิดข้อผิดพลาดในการนำเข้า\n" + error.message);
  } finally {
    showLoading(false);
  }
}

/* ============================================
   Export Data
   ============================================ */

async function handleExport() {
  if (adminData.length === 0) {
    alert("❌ ไม่มีข้อมูลให้ส่งออก");
    return;
  }

  if (!confirm("❓ ต้องการส่งออกข้อมูลเป็นไฟล์ CSV หรือไม่?")) {
    return;
  }

  try {
    showLoading(true);

    // Define CSV headers
    const headers = [
      "ชื่อ",
      "นามสกุล",
      "เพศ",
      "ชื่อหมู่บ้าน",
      "บ้านเลขที่",
      "จังหวัด",
      "อำเภอ",
      "ตำบล",
      "เบอร์โทรศัพท์",
      "ภาพรวมของการประเมินโรค NCDs",
      "โรคอ้วน",
      "โรคเบาหวาน",
      "โรคความดันโลหิต",
      "สุขภาพจิต",
      "สูบบุหรี่",
      "แอลกอฮอล์",
      "สถานะ",
      "ส่งต่อหน่วยบริการ",
      "รหัสหน่วยบริการที่ส่งออก",
    ];

    // Create CSV content
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel
    csvContent += headers.join(",") + "\n";

    // Add data rows
    adminData.forEach((record) => {
      const row = headers.map((header) => {
        let value = record[header] || "";
        // Escape quotes and wrap in quotes if contains comma or quote
        value = value.toString().replace(/"/g, '""');
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          value = `"${value}"`;
        }
        return value;
      });
      csvContent += row.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, "");
    const filename = `NCDs_Dashboard_Export_${dateStr}_${timeStr}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ ส่งออกข้อมูลสำเร็จ!\n\nไฟล์: ${filename}\nจำนวน: ${adminData.length} รายการ`);
  } catch (error) {
    console.error("Export error:", error);
    alert("❌ เกิดข้อผิดพลาดในการส่งออก\n" + error.message);
  } finally {
    showLoading(false);
  }
}

/* ============================================
   Logout
   ============================================ */

async function handleLogout() {
  if (!confirm("❓ ต้องการออกจากระบบหรือไม่?")) {
    return;
  }

  try {
    showLoading(true);
    await auth.logout();
    alert("✅ ออกจากระบบสำเร็จ");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("❌ เกิดข้อผิดพลาดในการออกจากระบบ");
    // Still redirect even if API call fails
    window.location.href = "index.html";
  }
}

/* ============================================
   Global Functions (for inline onclick)
   ============================================ */

window.openRecordModal = openRecordModal;
window.handleDelete = handleDelete;
