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

/* ============================================
   Initialization
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Admin panel loaded");

  // Check authentication
  if (!auth.isLoggedIn()) {
    alert("❌ กรุณา Login ก่อนเข้าใช้งาน");
    window.location.href = "index.html";
    return;
  }

  // Verify session
  const sessionCheck = await auth.checkSession();
  if (!sessionCheck.valid) {
    alert("❌ Session หมดอายุ\nกรุณา Login ใหม่");
    auth.clearSession();
    window.location.href = "index.html";
    return;
  }

  // Initialize
  initTheme();
  loadUserInfo();
  setupEventListeners();
  await loadData();
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

    const result = await auth.getAdminData();

    if (result.success) {
      adminData = result.data || [];
      renderTable();
      updateStats();
      dataContainer.style.display = "block";
    } else {
      throw new Error(result.message || "Failed to load data");
    }
  } catch (error) {
    console.error("Load data error:", error);
    alert("❌ เกิดข้อผิดพลาดในการโหลดข้อมูล\n" + error.message);

    // Check if session expired
    if (error.message.includes("session") || error.message.includes("login")) {
      auth.clearSession();
      window.location.href = "index.html";
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
   Table Rendering
   ============================================ */

function renderTable() {
  tableBody.innerHTML = "";

  if (adminData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            📭 ไม่มีข้อมูล
          </p>
        </td>
      </tr>
    `;
    return;
  }

  adminData.forEach((record, index) => {
    const row = document.createElement("tr");

    // Status color
    let statusColor = "#95a5a6";
    const ncd = (record["ภาพรวมของการประเมินโรค NCDs"] || "").toLowerCase();
    if (ncd.includes("เสี่ยง")) statusColor = "#f39c12";
    if (ncd.includes("ป่วย")) statusColor = "#e74c3c";
    if (ncd.includes("ปกติ")) statusColor = "#2ecc71";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record["ชื่อ"] || "-"}</td>
      <td>${record["นามสกุล"] || "-"}</td>
      <td>${record["เพศ"] || "-"}</td>
      <td>${record["ตำบล"] || "-"}</td>
      <td>
        <span style="
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          background: ${statusColor}22;
          color: ${statusColor};
          font-weight: 500;
          font-size: 0.85rem;
        ">
          ${record["ภาพรวมของการประเมินโรค NCDs"] || "-"}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="openRecordModal(${index})">
            ✏️ แก้ไข
          </button>
          <button class="btn-delete" onclick="handleDelete(${index})">
            🗑️ ลบ
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
    $("status").value = record["สถานะ"] || "";
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
    สถานะ: $("status").value,
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
  if (!confirm("❓ ต้องการส่งออกข้อมูลเป็น Google Sheets หรือไม่?")) {
    return;
  }

  try {
    showLoading(true);

    const result = await auth.exportToSheets();

    if (result.success && result.url) {
      alert("✅ ส่งออกข้อมูลสำเร็จ!\n\nกำลังเปิด Google Sheets...");
      window.open(result.url, "_blank");
    } else {
      throw new Error(result.message || "Failed to export data");
    }
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
