# AI 教材轉換器

一個專為教育訓練人員設計的智慧教材製作工具，支援 Word/PDF 上傳、AI 智慧分析、自動排版，並可輸出專業的 PDF 和 Word 文件。

## ✨ 主要功能

- 📁 **檔案上傳**：支援 Word (.docx) 和 PDF 格式
- 🤖 **AI 智慧分析**：自動標記重點、定義術語、建議圖片位置
- 🎨 **樣式自訂**：18 種預設班級顏色 + 自訂顏色
- 📖 **即時預覽**：A4 格式即時預覽
- 📄 **PDF 輸出**：高品質 PDF 下載
- 📝 **Word 輸出**：可編輯的 Word 文件
- 💾 **專案管理**：儲存草稿、載入專案
- 🎓 **新手導覽**：首次使用引導

## 🏗️ 技術架構

### 前端
- 原生 JavaScript (ES6+)
- CSS3 + 響應式設計
- Mammoth.js (Word 解析)
- PDF.js (PDF 解析)
- docx.js (Word 生成)

### 後端
- Node.js + Express.js
- Google Gemini 2.0 Flash AI
- CORS 安全設定
- API 速率限制

## 🚀 快速開始

### 方式一：本地開發/使用

1. **安裝依賴**
```bash
npm install
```

2. **設定環境變數**
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

編輯 `.env` 檔案，設定您的 Gemini API Key：
```env
GEMINI_API_KEY=your_api_key_here
```

3. **啟動伺服器**
```bash
npm start
```

4. **訪問應用程式**
開啟瀏覽器訪問: `http://localhost:3000`

### 方式二：使用 Docker

```bash
# 使用 Docker Compose（推薦）
docker-compose up -d

# 或使用 Docker
docker build -t ai-courseware-converter .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key ai-courseware-converter
```

## 📋 系統需求

- **Node.js**: 18.0.0 或更高版本
- **瀏覽器**: Chrome 90+、Edge 90+、Firefox 88+
- **網路連線**: AI 分析功能需要連網
- **API Key**: Google Gemini API Key

## 🔑 取得 API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 登入 Google 帳號
3. 點選「Get API Key」
4. 創建並複製 API Key
5. 在專案根目錄的 `.env` 檔案中設定

## 📁 專案結構

```
教材轉換專案/
├── app/                    # 前端應用程式
│   ├── index.html
│   ├── css/
│   └── js/
├── server/                 # 後端服務
│   ├── index.js           # Express 主程式
│   ├── routes/            # API 路由
│   ├── services/          # Gemini API 服務
│   └── middleware/        # 中介軟體
├── docs/                  # 文件
│   ├── 部署指南.md
│   └── 開發指南.md
├── package.json
├── .env.example           # 環境變數範例
└── docker-compose.yml     # Docker 配置
```

## 📖 使用流程

```
上傳檔案 → AI 分析 → 選擇顏色 → 計算頁碼 → 下載教材
```

詳細說明請參閱 [使用說明](app/使用說明.md)

## 🌐 部署

本專案支援多種部署方式：
- 本地伺服器
- Docker / Docker Compose
- Vercel
- Heroku  
- Railway

詳細部署指南請參閱: [docs/部署指南.md](docs/部署指南.md)

## 🔒 安全性

- ✅ API Key 安全存放在後端環境變數中
- ✅ CORS 設定保護
- ✅ API 速率限制（預設每 15 分鐘 100 次請求）
- ✅ 請求驗證
- ✅ 資料隱私：檔案僅在本地處理，文字內容傳送給 Google AI 分析

## ⚠️ 重要提醒

### 下載 PDF 前必須執行「計算頁碼」
系統需要模擬分頁位置才能正確計算目錄頁碼。

### PDF 列印設定
- ✅ 目的地：另存為 PDF
- ✅ 紙張：A4
- ✅ **背景圖形：務必勾選**（否則顏色和圖片會消失）

## 📚 文件

- [使用說明](app/使用說明.md) - 使用者操作手冊
- [開發指南](docs/開發指南.md) - 開發者文件
- [部署指南](docs/部署指南.md) - 部署說明

## 🔄 版本資訊

**版本**：1.1.0  
**發布日期**：2025-12-07

### 新增功能
- ✅ 後端 API 服務（Express.js）
- ✅ API Key 安全性改善
- ✅ 速率限制保護
- ✅ Docker 部署支援
- ✅ 多平台部署配置

### 既有功能
- ✅ Word/PDF 檔案上傳
- ✅ 圖片自動提取與保留
- ✅ AI 智慧分析
- ✅ 自動目錄生成
- ✅ 頁碼計算
- ✅ 18 種班級主色調
- ✅ PDF 高品質輸出
- ✅ Word 可編輯輸出
- ✅ 專案儲存與載入
- ✅ 新手導覽

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

本專案僅供內部使用。

## 📞 技術支援

如有任何問題或建議，請聯絡系統管理員。

---

**開發者**：AI Assistant & 教材轉換專案團隊  
**最後更新**：2025-12-07
