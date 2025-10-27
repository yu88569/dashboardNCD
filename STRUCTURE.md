# 📂 Project Structure

โครงสร้างโปรเจค NCDs Dashboard

---

## 🌳 Directory Tree

\`\`\`
dashboardNCD/
│
├── 🌐 Frontend Files (GitHub Pages)
│   ├── index.html          # หน้า Dashboard หลัก
│   ├── app.js              # JavaScript logic
│   ├── config.js           # API configuration
│   └── styles.css          # CSS styles
│
├── 🔧 Backend Files (Google Apps Script)
│   └── apps-script/
│       ├── code.gs         # Server-side logic
│       └── README.md       # Deployment guide
│
├── 📚 Documentation
│   └── docs/
│       ├── README.md                    # Documentation index
│       ├── QUICKSTART.md                # Quick start guide
│       ├── SETUP-GITHUB-PAGES.md        # Frontend setup
│       ├── DEPLOY-INSTRUCTIONS.md       # Full deployment
│       ├── GOOGLE-SHEET-STRUCTURE.md    # Database schema
│       ├── README-AppsScript.md         # Backend guide
│       └── SESSION-FIX.md               # Troubleshooting
│
├── 📁 Archive (Old Files)
│   └── archive/
│       ├── Admin.html
│       ├── AdminScripts.html
│       ├── Charts.html
│       ├── Header.html
│       ├── Kpis.html
│       ├── Login.html
│       ├── Modals.html
│       ├── Scripts.html
│       ├── SessionExpired.html
│       ├── Styles.html
│       ├── Table.html
│       └── index-old.html
│
└── 📄 Config Files
    ├── .gitignore          # Git ignore rules
    ├── .gitattributes      # Git line ending config
    ├── README.md           # Main project README
    └── STRUCTURE.md        # This file
\`\`\`

---

## 📌 File Purposes

### Frontend (Deploy to GitHub Pages)

| File | Purpose |
|------|---------|
| \`index.html\` | หน้า Dashboard หลัก - UI structure |
| \`app.js\` | JavaScript logic - data fetching, charts, filters |
| \`config.js\` | Configuration - API URL, theme, cache settings |
| \`styles.css\` | CSS styles - layout, theme, responsive design |

### Backend (Deploy to Google Apps Script)

| File | Purpose |
|------|---------|
| \`apps-script/code.gs\` | Server-side logic - API endpoints, data access, authentication |
| \`apps-script/README.md\` | Deployment instructions for Apps Script |

### Documentation

| File | Purpose |
|------|---------|
| \`docs/README.md\` | Documentation index |
| \`docs/QUICKSTART.md\` | Quick start guide (5 min) |
| \`docs/SETUP-GITHUB-PAGES.md\` | Detailed frontend setup |
| \`docs/DEPLOY-INSTRUCTIONS.md\` | Full deployment guide |
| \`docs/GOOGLE-SHEET-STRUCTURE.md\` | Database schema & structure |
| \`docs/README-AppsScript.md\` | Backend deployment guide |
| \`docs/SESSION-FIX.md\` | Session troubleshooting |

---

## 🔄 Deployment Flow

\`\`\`
1. Google Sheets (Database)
   ↓
2. Google Apps Script (Backend API)
   - Deploy as Web App
   - Get API URL
   ↓
3. Update config.js with API URL
   ↓
4. GitHub Pages (Frontend)
   - Auto-deploy from main branch
   ↓
5. Live Dashboard
   https://yu88569.github.io/dashboardNCD/
\`\`\`

---

## 🎯 Quick Actions

### Update Frontend
\`\`\`bash
# Edit: index.html, app.js, styles.css, config.js
git add .
git commit -m "Update frontend"
git push
# GitHub Pages auto-deploys in 1-2 min
\`\`\`

### Update Backend
\`\`\`
1. Edit apps-script/code.gs in Apps Script Editor
2. Deploy → Manage deployments → Edit
3. Version: New version → Deploy
\`\`\`

### Update Documentation
\`\`\`bash
# Edit files in docs/
git add docs/
git commit -m "docs: Update documentation"
git push
\`\`\`

---

## 📊 File Dependencies

\`\`\`
index.html
├── app.js (loaded via <script>)
│   ├── config.js (imported)
│   └── ECharts (CDN)
└── styles.css (loaded via <link>)

apps-script/code.gs
└── Google Sheets
    ├── Tab: ncd_db_central (data)
    └── Tab: user (authentication)
\`\`\`

---

## 🔒 Sensitive Files

**ไฟล์ที่ไม่ควร commit:**
- \`config.local.js\` (ถ้ามี)
- \`.env\` files
- \`.clasp.json\` (Apps Script local dev)
- Backup files

**Already in .gitignore:**
- ✅ All sensitive files
- ✅ Editor configs
- ✅ OS-specific files
- ✅ Build artifacts

---

## 📝 Notes

- **Frontend** ทำงานแบบ Static Site (GitHub Pages)
- **Backend** ทำงานแบบ Serverless (Apps Script)
- **Database** ใช้ Google Sheets (No-code database)
- **Deployment** Auto-deploy จาก Git push
- **Cost** Free tier ทั้งหมด (GitHub Pages + Apps Script)

---

**Last Updated**: 2024  
**Total Files**: ~20 (excludingarchive)
