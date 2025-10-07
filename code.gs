/** ====== CONFIG ====== **/
const SHEET_ID = "1e7US3de5RqD75fsx-i6kLdebYHrClSC0lNZQmfYUEQk";
const SHEET_NAME = "ncd_db_central";
const CACHE_TTL_SECONDS = 300;

/** ====== ENTRYPOINT ====== **/
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("NCDs Dashboard")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
