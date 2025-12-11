// 配置檔案
const CONFIG = {
    // 後端 API 設定
    BACKEND_API_URL: window.location.origin + '/api', // 自動使用當前網址的後端 API

    // 備用：如果本地開發時後端在不同端口
    // BACKEND_API_URL: 'http://localhost:3000/api',

    // 應用程式設定
    APP_NAME: 'AI 教材轉換器',
    VERSION: '1.0.1',

    // LocalStorage 鍵值
    STORAGE_KEYS: {
        API_KEY: 'courseware_api_key',
        PROJECTS: 'courseware_projects',
        CURRENT_PROJECT: 'courseware_current_project',
        SETTINGS: 'courseware_settings',
        TUTORIAL_SHOWN: 'courseware_tutorial_shown'
    },

    // 預設樣式
    DEFAULT_STYLES: {
        primaryColor: '#2563eb',
        fontSize: {
            title: 32,
            chapter: 24,
            section: 20,
            paragraph: 14
        }
    },

    // 18 種班級顏色
    CLASS_COLORS: [
        { name: '藍色班級', color: '#2563eb' },
        { name: '紅色班級', color: '#dc2626' },
        { name: '綠色班級', color: '#16a34a' },
        { name: '紫色班級', color: '#9333ea' },
        { name: '橘色班級', color: '#ea580c' },
        { name: '青色班級', color: '#0891b2' },
        { name: '粉紅班級', color: '#ec4899' },
        { name: '黃色班級', color: '#eab308' },
        { name: '靛藍班級', color: '#4f46e5' },
        { name: '深綠班級', color: '#059669' },
        { name: '深紅班級', color: '#b91c1c' },
        { name: '深紫班級', color: '#7c3aed' },
        { name: '棕色班級', color: '#92400e' },
        { name: '灰色班級', color: '#475569' },
        { name: '玫瑰班級', color: '#f43f5e' },
        { name: '琥珀班級', color: '#f59e0b' },
        { name: '翠綠班級', color: '#10b981' },
        { name: '天藍班級', color: '#06b6d4' }
    ],

    // AI 提示詞
    PROMPTS: {
        ANALYZE: `你是一個專業的教材編輯助手。請分析以下教材內容，並進行以下標記：

1. 重點提示：找出核心概念和重要資訊，標記為 [建議：重點提示]
2. 術語定義：找出專業術語，標記為 [建議：定義：術語名稱]
3. 圖片建議：在適合插入圖片的位置，標記為 [建議：插入圖片：圖片說明]

注意事項：
- 保持原始文字完整，不要修改內容
- 重點標記不要超過內容的 10%
- 術語定義要精確
- 圖片建議要合理且有助於理解

請直接返回標記後的內容，不要有其他說明。`,

        STRUCTURE: `請將以下已標記的教材內容轉換為結構化的 JSON 格式。

要求：
1. 移除所有 [建議：...] 標籤
2. 根據標籤類型轉換為對應的 JSON 物件
3. 自動生成目錄（基於標題）
4. 確保 JSON 格式正確，字串內不可有換行

JSON 格式範例：
{
  "title": "教材標題",
  "content": [
    {"type": "chapter", "text": "章節標題"},
    {"type": "section", "text": "小節標題"},
    {"type": "paragraph", "text": "段落內容"},
    {"type": "keypoint", "text": "重點內容"},
    {"type": "definition", "term": "術語", "definition": "定義"},
    {"type": "image", "description": "圖片說明", "id": "img_1"},
    {"type": "table", "headers": ["欄1", "欄2"], "rows": [["值1", "值2"]]}
  ],
  "toc": [
    {"level": 1, "text": "章節標題", "pageNumber": null}
  ]
}

請只返回 JSON，不要有其他文字。`
    },

    // 檔案設定
    FILE_SETTINGS: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/pdf': '.pdf'
        }
    },

    // A4 尺寸設定（像素，96 DPI）
    A4_SIZE: {
        WIDTH: 794,  // 210mm
        HEIGHT: 1123 // 297mm
    }
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
