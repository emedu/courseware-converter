/**
 * Google Gemini API 服務
 * 負責與 Google Gemini API 進行通訊
 */

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

        // 速率限制設定（可透過環境變數調整）
        this.requestDelay = parseInt(process.env.GEMINI_REQUEST_DELAY) || 4000; // 預設 4 秒
        this.lastRequestTime = 0; // 上次請求時間
        this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES) || 3; // 預設最多重試 3 次
        this.retryDelay = parseInt(process.env.GEMINI_RETRY_DELAY) || 10000; // 預設基礎延遲 10 秒（更保守）

        // ✨ 新增：Promise 佇列機制，確保請求序列化
        this.requestQueue = Promise.resolve(); // 初始化為已完成的 Promise
        this.isProcessing = false; // 追蹤是否正在處理請求

        if (!this.apiKey) {
            console.warn('⚠️  警告: GEMINI_API_KEY 環境變數未設定！');
        }

        console.log(`🔧 Gemini 服務初始化：請求延遲=${this.requestDelay}ms, 最大重試=${this.maxRetries}次`);
    }

    /**
     * 檢查 API Key 是否已設定
     */
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * 延遲函式（Sleep）
     * @param {number} ms - 延遲毫秒數
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 確保請求間隔足夠（節流）
     * ✨ 改進：使用更精確的時間檢查
     */
    async ensureRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.requestDelay) {
            const waitTime = this.requestDelay - timeSinceLastRequest;
            console.log(`⏱️  速率限制：等待 ${Math.ceil(waitTime / 1000)} 秒後繼續...`);
            await this.sleep(waitTime);
        }

        // ✨ 關鍵改進：在 sleep 之後立即更新時間戳，減少競態視窗
        this.lastRequestTime = Date.now();
    }

    /**
     * ✨ 新增：將請求加入佇列，確保序列執行
     * @param {Function} requestFn - 要執行的請求函式
     * @returns {Promise} - 請求結果
     */
    async queueRequest(requestFn) {
        // 將新請求加入佇列尾端
        const previousRequest = this.requestQueue;

        // 創建新的 Promise 來處理這個請求
        let resolveRequest, rejectRequest;
        const currentRequest = new Promise((resolve, reject) => {
            resolveRequest = resolve;
            rejectRequest = reject;
        });

        // 更新佇列指向當前請求
        this.requestQueue = currentRequest;

        // ✨ 重要：防止 Unhandled Promise Rejection 導致伺服器崩潰
        // 因為這個 Promise 主要是給下一個請求等待用的，錯誤已經透過 rejectRequest 傳遞給當前呼叫者
        this.requestQueue.catch(() => { });

        // 等待前一個請求完成
        await previousRequest.catch(() => { }); // 忽略前一個請求的錯誤

        // 標記正在處理
        this.isProcessing = true;
        console.log(`🔒 請求已進入佇列，開始處理...`);

        try {
            // 執行實際的請求
            const result = await requestFn();
            resolveRequest(result);
            this.isProcessing = false;
            console.log(`🔓 請求處理完成，釋放佇列鎖。`);
            return result;
        } catch (error) {
            rejectRequest(error);
            this.isProcessing = false;
            console.log(`🔓 請求失敗，釋放佇列鎖。`);
            throw error;
        }
    }

    /**
     * 呼叫 Gemini API（帶重試機制）
     * ✨ 改進：透過 queueRequest 包裝，確保序列執行
     * @param {string} prompt - 提示詞
     * @param {string} content - 要處理的內容
     * @param {number} retryCount - 當前重試次數
     * @returns {Promise<string>} - API 返回的文字
     */
    async callGemini(prompt, content, retryCount = 0) {
        // ✨ 使用佇列包裝，確保同一時間只有一個請求在執行
        return this.queueRequest(async () => {
            return await this._callGeminiInternal(prompt, content, retryCount);
        });
    }

    /**
     * ✨ 內部方法：實際執行 Gemini API 呼叫
     * @private
     */
    async _callGeminiInternal(prompt, content, retryCount = 0) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API Key 未設定，請在 .env 檔案中設定 GEMINI_API_KEY');
        }

        // 確保符合速率限制
        await this.ensureRateLimit();

        const requestBody = {
            contents: [{
                parts: [{
                    text: `${prompt}\n\n內容：\n${content}`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        };

        try {
            console.log(`📡 正在呼叫 Gemini API... (嘗試 ${retryCount + 1}/${this.maxRetries + 1})`);

            const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // 處理速率限制錯誤 (429)
            if (response.status === 429) {
                if (retryCount < this.maxRetries) {
                    // 指數退避：每次重試等待時間加倍
                    const backoffTime = this.retryDelay * Math.pow(2, retryCount);
                    console.warn(`⚠️  收到速率限制 (429)，將在 ${backoffTime / 1000} 秒後重試...`);
                    await this.sleep(backoffTime);
                    // ✨ 注意：遞迴呼叫 _callGeminiInternal 而非 callGemini，避免重複加入佇列
                    return this._callGeminiInternal(prompt, content, retryCount + 1);
                } else {
                    throw new Error('請求太頻繁，已達到最大重試次數。請稍後再試。\n\n💡 提示：Gemini 免費版每分鐘只能發送 15 次請求。');
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message ||
                    `Gemini API 錯誤: ${response.status} ${response.statusText}`;

                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Gemini API 未返回有效結果');
            }

            const result = data.candidates[0].content.parts[0].text;
            console.log('✅ Gemini API 呼叫成功');
            return result;

        } catch (error) {
            console.error('❌ Gemini API 呼叫失敗:', error.message);

            // 處理特定錯誤
            if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('API 配額已用盡。\n\n解決方案：\n1. 等待配額重置（通常在隔天）\n2. 升級到付費版以獲得更高配額\n3. 檢查 Google Cloud Console 的配額設定');
            }
            if (error.message.includes('invalid') || error.message.includes('401') || error.message.includes('API_KEY_INVALID')) {
                throw new Error('API Key 無效。\n\n請檢查：\n1. .env 中的 GEMINI_API_KEY 是否正確\n2. 該 API Key 是否已啟用 Gemini API\n3. 訪問 https://aistudio.google.com/ 重新生成 API Key');
            }
            if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                throw new Error('網路連線錯誤，請檢查網路連線後重試。');
            }

            throw error;
        }
    }

    /**
     * 分析教材內容（第一階段）
     * @param {string} content - 原始內容
     * @returns {Promise<string>} - 標記後的內容
     */
    async analyzeContent(content) {
        const prompt = `你是一個專業的教材編輯助手。請分析以下教材內容，並進行以下標記：

1. 重點提示：找出核心概念和重要資訊，標記為 [建議：重點提示]
2. 術語定義：找出專業術語，標記為 [建議：定義：術語名稱]
3. 圖片建議：在適合插入圖片的位置，標記為 [建議：插入圖片：圖片說明]

注意事項：
- 保持原始文字完整，不要修改內容
- 重點標記不要超過內容的 10%
- 術語定義要精確
- 圖片建議要合理且有助於理解

請直接返回標記後的內容，不要有其他說明。`;

        return await this.callGemini(prompt, content);
    }

    /**
     * 結構化教材內容（第二階段）
     * @param {string} suggestedContent - 已標記的內容
     * @returns {Promise<object>} - 結構化的 JSON 物件
     */
    async structureContent(suggestedContent) {
        const prompt = `請將以下已標記的教材內容轉換為結構化的 JSON 格式。

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
    {" level": 1, "text": "章節標題", "pageNumber": null}
  ]
}

請只返回 JSON，不要有其他文字。`;

        const jsonText = await this.callGemini(prompt, suggestedContent);

        // 嘗試解析 JSON
        try {
            // 清理可能的 markdown code block 標記
            const cleanJson = jsonText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('JSON 解析失敗:', error);
            throw new Error('AI 返回的內容無法解析為 JSON 格式');
        }
    }
}

module.exports = new GeminiService();
