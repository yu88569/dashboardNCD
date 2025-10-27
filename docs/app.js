/* ============================================
 Configuration & State
 ============================================ */
const API_URL = 'https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec';

const COL = {
  fname: "ชื่อ",
  lname: "นามสกุล",
  gender: "เพศ",
  village: "ชื่อหมู่บ้าน",
  house: "บ้านเลขที่",
  province: "จังหวัด",
  amphoe: "อำเภอ",
  tambon: "ตำบล",
  phone: "เบอร์โทรศัพท์",
  ncd: "ภาพรวมของการประเมินโรค NCDs",
  obesity: "โรคอ้วน",
  dm: "โรคเบาหวาน",
  htn: "โรคความดันโลหิต",
  mental: "สุขภาพจิต",
  smoke: "สูบบุหรี่",
  alcohol: "แอลกอฮอล์",
  status: "สถานะ",
  refer: "ส่งต่อหน่วยบริการ",
  referCode: "รหัสหน่วยบริการที่ส่งออก",
};

const state = {
  raw: [],
  filtered: [],
  options: { province: [], amphoe: [], tambon: [], status: [], gender: [] },
  filters: { province: "", amphoe: "", tambon: "", status: "", gender: "" },
};

const $ = (id) => document.getElementById(id);

/* ============================================
 Theme Management
 ============================================ */
function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  applyTheme(saved);

  const btn = $("theme-toggle");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
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

  // อัปเดตกราฟถ้ามี
  if (window.chTambon) updateChartsTheme();
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  applyTheme(isLight ? "dark" : "light");
}

function updateChartsTheme() {
  if (window.chTambon) {
    window.chFactors.dispose();
    window.chTambon.dispose();
    window.chSickStatus.dispose();
    window.chRiskStatus.dispose();
    window.chFactors = null;
    window.chTambon = null;
    window.chSickStatus = null;
    window.chRiskStatus = null;
    drawCharts();
  }
}

/* ============================================
 Data Management
 ============================================ */
async function loadData() {
  try {
    const response = await fetch(`${API_URL}?action=getData`);
    const result = await response.json();

    if (result.success && result.data) {
      state.raw = result.data.map((x) => normalize(x));
      computeOptions();
      applyFilters();
    } else {
      throw new Error(result.error || 'ไม่สามารถโหลดข้อมูลได้');
    }
  } catch (err) {
    console.error('Error loading data:', err);
    alert("โหลดข้อมูลไม่สำเร็จ: " + err.message);
  }
}

function normalize(x) {
  const t = (v) => (v == null ? "" : String(v).trim());
  return {
    ...x,
    [COL.province]: t(x[COL.province]),
    [COL.amphoe]: t(x[COL.amphoe]),
    [COL.tambon]: t(x[COL.tambon]),
    [COL.ncd]: t(x[COL.ncd]),
    [COL.status]: t(x[COL.status]),
    [COL.gender]: t(x[COL.gender]),
    [COL.phone]: t(x[COL.phone]).replace(/[^\d]/g, "").replace(/^0?/, "0"),
  };
}

function computeOptions() {
  const uniq = (arr) =>
    Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "th")
    );
  state.options.province = uniq(state.raw.map((r) => r[COL.province]));
  state.options.amphoe = uniq(state.raw.map((r) => r[COL.amphoe]));
  state.options.tambon = uniq(state.raw.map((r) => r[COL.tambon]));
  state.options.status = uniq(state.raw.map((r) => r[COL.status]));
  state.options.gender = uniq(state.raw.map((r) => r[COL.gender]));
  fillSelect("f-province", state.options.province);
  fillSelect("f-amphoe", state.options.amphoe);
  fillSelect("f-tambon", state.options.tambon);
  fillSelect("f-status", state.options.status);
  fillSelect("f-gender", state.options.gender);
}

function fillSelect(id, items) {
  const el = $(id);
  if (!el) return;

  el.innerHTML =
    `<option value="">ทั้งหมด</option>` +
    items.map((x) => `<option>${x}</option>`).join("");
  el.onchange = () => {
    state.filters[id.split("-")[1]] = el.value;
    applyFilters();
  };
}

function applyFilters() {
  const f = state.filters;
  state.filtered = state.raw.filter(
    (r) =>
      (!f.province || r[COL.province] === f.province) &&
      (!f.amphoe || r[COL.amphoe] === f.amphoe) &&
      (!f.tambon || r[COL.tambon] === f.tambon) &&
      (!f.status || r[COL.status] === f.status) &&
      (!f.gender || r[COL.gender] === f.gender)
  );

  renderKpis();
  drawCharts();
}

/* ============================================
 UI Rendering
 ============================================ */
function renderKpis() {
  const total = state.filtered.length;
  const ncdRisk = state.filtered.filter((r) =>
    includesThaiRisk(r[COL.ncd])
  ).length;
  const ncdOk = state.filtered.filter((r) => isThaiNormal(r[COL.ncd])).length;
  const finished = state.filtered.filter((r) =>
    (r[COL.status] || "").includes("เสร็จสิ้น")
  ).length;

  // Gender counts
  const male = state.filtered.filter((r) => r[COL.gender] === "ชาย").length;
  const female = state.filtered.filter(
    (r) => r[COL.gender] === "หญิง"
  ).length;
  const monk = state.filtered.filter(
    (r) => r[COL.gender] === "พระสงฆ์"
  ).length;

  if ($("kpi-total")) $("kpi-total").textContent = total;
  if ($("kpi-risk")) $("kpi-risk").textContent = ncdRisk;
  if ($("kpi-ok")) $("kpi-ok").textContent = ncdOk;
  if ($("kpi-finish")) $("kpi-finish").textContent = finished;

  // Update gender KPIs
  if ($("kpi-male")) $("kpi-male").textContent = male;
  if ($("kpi-female")) $("kpi-female").textContent = female;
  if ($("kpi-monk")) $("kpi-monk").textContent = monk;

  // ภาพรวมการประเมิน
  const normalCount = state.filtered.filter((r) =>
    isThaiNormal(r[COL.ncd])
  ).length;
  const riskCount = state.filtered.filter((r) =>
    includesThaiRisk(r[COL.ncd])
  ).length;
  const sickCount = total - normalCount - riskCount;

  if ($("overview-total")) $("overview-total").textContent = total;
  if ($("overview-normal")) $("overview-normal").textContent = normalCount;
  if ($("overview-risk")) $("overview-risk").textContent = riskCount;
  if ($("overview-sick")) $("overview-sick").textContent = sickCount;

  if ($("overview-normal-pct")) {
    $("overview-normal-pct").textContent = `(${(
      (normalCount / total) * 100 || 0
    ).toFixed(2)}%)`;
  }
  if ($("overview-risk-pct")) {
    $("overview-risk-pct").textContent = `(${(
      (riskCount / total) * 100 || 0
    ).toFixed(2)}%)`;
  }
  if ($("overview-sick-pct")) {
    $("overview-sick-pct").textContent = `(${(
      (sickCount / total) * 100 || 0
    ).toFixed(2)}%)`;
  }

  // ข้อมูลตามประเภท
  const smokeData = state.filtered.map((r) => norm(r[COL.smoke]));
  const smokeNormal = smokeData.filter(
    (s) => s.includes("ไม่สูบ") || s === "ไม่สูบ"
  ).length;
  const smokeRisk = smokeData.filter(
    (s) => s.includes("สูบ") && !s.includes("ไม่สูบ")
  ).length;

  const alcoholData = state.filtered.map((r) => norm(r[COL.alcohol]));
  const alcoholNormal = alcoholData.filter(
    (s) => s.includes("ไม่ดื่ม") || s === "ไม่ดื่ม"
  ).length;
  const alcoholRisk = alcoholData.filter(
    (s) => s.includes("ดื่ม") && !s.includes("ไม่ดื่ม")
  ).length;

  const mentalData = state.filtered.map((r) => norm(r[COL.mental]));
  const mentalNormal = mentalData.filter((s) => isThaiNormal(s)).length;
  const mentalRisk = mentalData.filter((s) => includesThaiRisk(s)).length;

  if ($("smoke-normal")) $("smoke-normal").textContent = smokeNormal;
  if ($("smoke-risk")) $("smoke-risk").textContent = smokeRisk;
  if ($("alcohol-normal")) $("alcohol-normal").textContent = alcoholNormal;
  if ($("alcohol-risk")) $("alcohol-risk").textContent = alcoholRisk;
  if ($("mental-normal")) $("mental-normal").textContent = mentalNormal;
  if ($("mental-risk")) $("mental-risk").textContent = mentalRisk;
}

function isThaiNormal(s) {
  return ["ปกติ", "ปกติ ", " ปกติ"].includes((s || "").trim());
}

function includesThaiRisk(s) {
  return (s || "").includes("เสี่ยง") || (s || "").includes("สูง");
}

/* ============================================
 Charts
 ============================================ */
function drawCharts() {
  const el2 = document.getElementById("chart-factors");
  const el3 = document.getElementById("chart-tambon");

  if (!el2 || !el3) return;

  window.chFactors = window.chFactors || echarts.init(el2);
  window.chTambon = window.chTambon || echarts.init(el3);

  const isDark = !document.body.classList.contains("light-theme");
  const textColor = isDark ? "#e7e9ee" : "#1a1d2e";
  const axisLineColor = isDark ? "#1c2342" : "#d1d5db";

  // 1) ปัจจัยเสี่ยง
  const keys = [
    COL.obesity,
    COL.dm,
    COL.htn,
    COL.mental,
    COL.alcohol,
    COL.smoke,
  ];
  const labels = [
    "โรคอ้วน",
    "เบาหวาน",
    "ความดัน",
    "สุขภาพจิต",
    "แอลกอฮอล์",
    "สูบบุหรี่",
  ];
  const normal = [],
    risk = [],
    other = [];
  keys.forEach((k, i) => {
    const group = state.filtered.map((r) => norm(r[k]));
    normal.push(group.filter(isThaiNormal).length);
    risk.push(group.filter(includesThaiRisk).length);
    other.push(
      group.filter((s) => s && !isThaiNormal(s) && !includesThaiRisk(s))
        .length
    );
  });
  window.chFactors.setOption({
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: ["ปกติ", "เสี่ยง", "อื่น ๆ"],
      textStyle: { color: textColor },
    },
    textStyle: { color: textColor },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
      splitLine: { lineStyle: { color: axisLineColor } },
    },
    series: [
      { name: "ปกติ", type: "bar", stack: "total", data: normal },
      { name: "เสี่ยง", type: "bar", stack: "total", data: risk },
      { name: "อื่น ๆ", type: "bar", stack: "total", data: other },
    ],
  });

  // 2) Top ตำบล
  const tb = Object.entries(
    countBy(state.filtered, (r) => norm(r[COL.tambon]))
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  window.chTambon.setOption({
    tooltip: { trigger: "axis" },
    textStyle: { color: textColor },
    xAxis: {
      type: "value",
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
      splitLine: { lineStyle: { color: axisLineColor } },
    },
    yAxis: {
      type: "category",
      data: tb.map((x) => x[0]).reverse(),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: axisLineColor } },
    },
    series: [{ type: "bar", data: tb.map((x) => x[1]).reverse() }],
  });

  // 3) สถานะป่วยของผู้ประเมิน
  const el4 = document.getElementById("chart-sick-status");
  const el5 = document.getElementById("chart-risk-status");

  if (el4 && el5) {
    window.chSickStatus = window.chSickStatus || echarts.init(el4);
    window.chRiskStatus = window.chRiskStatus || echarts.init(el5);

    const obesitySick = state.filtered.filter((r) => {
      const val = norm(r[COL.obesity]);
      return val.includes("เสี่ยงสูง") || val.includes("ป่วย");
    }).length;

    const dmSick = state.filtered.filter((r) => {
      const val = norm(r[COL.dm]);
      return val.includes("เสี่ยงสูง") || val.includes("ป่วย");
    }).length;

    const htnSick = state.filtered.filter((r) => {
      const val = norm(r[COL.htn]);
      return val.includes("เสี่ยงสูง") || val.includes("ป่วย");
    }).length;

    window.chSickStatus.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} คน ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: 10,
        textStyle: { color: textColor },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: "{b}\n{c} คน",
            color: textColor,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          data: [
            {
              value: obesitySick,
              name: "โรคอ้วน",
              itemStyle: { color: "#ffd37a" },
            },
            { value: dmSick, name: "เบาหวาน", itemStyle: { color: "#ff8f8f" } },
            {
              value: htnSick,
              name: "ความดัน",
              itemStyle: { color: "#ffb3b3" },
            },
          ],
        },
      ],
    });

    // 4) สถานะเสี่ยงของผู้ประเมิน
    const obesityRisk = state.filtered.filter((r) => {
      const val = norm(r[COL.obesity]);
      return val.includes("เสี่ยง") && !val.includes("เสี่ยงสูง");
    }).length;

    const dmRisk = state.filtered.filter((r) => {
      const val = norm(r[COL.dm]);
      return val.includes("เสี่ยง") && !val.includes("เสี่ยงสูง");
    }).length;

    const htnRisk = state.filtered.filter((r) => {
      const val = norm(r[COL.htn]);
      return val.includes("เสี่ยง") && !val.includes("เสี่ยงสูง");
    }).length;

    window.chRiskStatus.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} คน",
      },
      legend: {
        orient: "horizontal",
        bottom: 10,
        textStyle: { color: textColor },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: "{b}\n{c} คน",
            color: textColor,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          data: [
            {
              value: obesityRisk,
              name: "โรคอ้วน",
              itemStyle: { color: "#ffd37a" },
            },
            { value: dmRisk, name: "เบาหวาน", itemStyle: { color: "#ff8f8f" } },
            {
              value: htnRisk,
              name: "ความดัน",
              itemStyle: { color: "#ffb3b3" },
            },
          ],
        },
      ],
    });
  }

  window.addEventListener("resize", () => {
    if (window.chFactors) window.chFactors.resize();
    if (window.chTambon) window.chTambon.resize();
    if (window.chSickStatus) window.chSickStatus.resize();
    if (window.chRiskStatus) window.chRiskStatus.resize();
  });
}

function norm(s) {
  return (s || "").toString().trim();
}

function countBy(arr, by) {
  return arr.reduce((acc, x) => {
    const k = by(x) || "-";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

/* ============================================
 Modal Management
 ============================================ */
function initModals() {
  const loginModal = $("login-modal");
  const adminLoginBtn = $("admin-login-btn");
  const closeLogin = $("close-login");
  const loginForm = $("login-form");

  if (adminLoginBtn) {
    adminLoginBtn.onclick = () => {
      loginModal.style.display = "flex";
    };
  }

  if (closeLogin) {
    closeLogin.onclick = () => {
      loginModal.style.display = "none";
    };
  }

  if (loginModal) {
    window.onclick = (event) => {
      if (event.target === loginModal) {
        loginModal.style.display = "none";
      }
    };
  }

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = $("username").value;
      const password = $("password").value;

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            action: 'login',
            username: username,
            password: password
          })
        });

        const result = await response.json();

        if (result.success) {
          alert("✅ เข้าสู่ระบบสำเร็จ!");
          loginModal.style.display = "none";
          // Redirect to admin page or update UI
          window.location.href = result.redirectUrl || 'admin.html';
        } else {
          alert("❌ เข้าสู่ระบบไม่สำเร็จ: " + (result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'));
        }
      } catch (err) {
        console.error('Login error:', err);
        alert("❌ เกิดข้อผิดพลาด: " + err.message);
      }
    };
  }
}

/* ============================================
 Application Initialization
 ============================================ */
(function () {
  initTheme();
  initModals();
  loadData();
})();
