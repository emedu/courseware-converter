/**
 * 📝 Gemini API 模型測試工具
 * 用途：檢查您的 API Key 能否使用 Gemini 2.5 Flash/Pro
 * 
 * 使用方法：在專案根目錄執行 node test_gemini_model.js
 */

// 載入環境變數（從 .env 檔案）
require('dotenv').config();

/**
 * 要測試的模型清單
 * ✅ = 可以用
 * ❌ = 不能用
 */
const MODELS_TO_TEST = [
    'gemini-1.5-flash',      // 舊版本（目前使用中）
    'gemini-1.5-pro',        // 舊版本
    'gemini-2.0-flash-exp',  // 實驗版（可能已下架）
    'gemini-2.5-flash',      // 🎯 新版本！速度快
    'gemini-2.5-pro'         // 🎯 新版本！品質高
];

/**
 * 測試單個模型
 */
async function testModel(modelName, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        console.log(`\n🧪 正在測試: ${modelName}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: '測試' }]
                }]
            })
        });

        // ✅ 成功或 429（頻率限制）都代表模型存在
        if (response.ok) {
            console.log(`✅ ${modelName} - 可以用！（HTTP 200 成功）`);
            return { model: modelName, available: true, status: response.status };
        } else if (response.status === 429) {
            console.log(`✅ ${modelName} - 可以用！（HTTP 429 頻率限制，但模型存在）`);
            return { model: modelName, available: true, status: 429 };
        } else if (response.status === 404) {
            console.log(`❌ ${modelName} - 不存在或已下架（HTTP 404）`);
            return { model: modelName, available: false, status: 404 };
        } else {
            const errorText = await response.text().catch(() => '無法讀取錯誤訊息');
            console.log(`❌ ${modelName} - 錯誤 ${response.status}: ${errorText.substring(0, 100)}`);
            return { model: modelName, available: false, status: response.status };
        }

    } catch (error) {
        console.log(`❌ ${modelName} - 測試失敗: ${error.message}`);
        return { model: modelName, available: false, error: error.message };
    }
}

/**
 * 主程式：執行所有測試
 */
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔍 Gemini API 模型可用性測試工具');
    console.log('═══════════════════════════════════════════════════');

    // 1️⃣ 檢查 API Key 是否存在
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('\n❌ 錯誤：找不到 GEMINI_API_KEY！');
        console.error('請確認 .env 檔案中有設定：');
        console.error('   GEMINI_API_KEY=你的API金鑰\n');
        process.exit(1);
    }

    console.log(`\n✅ API Key 已載入：${apiKey.substring(0, 10)}...${apiKey.slice(-5)}`);
    console.log(`\n開始測試 ${MODELS_TO_TEST.length} 個模型...\n`);

    // 2️⃣ 逐一測試每個模型（避免並發導致 429 錯誤）
    const results = [];
    for (const modelName of MODELS_TO_TEST) {
        const result = await testModel(modelName, apiKey);
        results.push(result);

        // 避免請求太頻繁，每個測試間隔 2 秒
        if (MODELS_TO_TEST.indexOf(modelName) < MODELS_TO_TEST.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // 3️⃣ 顯示測試總結
    console.log('\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 測試結果總結');
    console.log('═══════════════════════════════════════════════════');

    const available = results.filter(r => r.available);
    const unavailable = results.filter(r => !r.available);

    console.log('\n✅ 可用的模型：');
    if (available.length > 0) {
        available.forEach(r => {
            const badge = r.model.includes('2.5') ? '🎯 推薦！' : '';
            console.log(`   - ${r.model} ${badge}`);
        });
    } else {
        console.log('   (無)');
    }

    console.log('\n❌ 不可用的模型：');
    if (unavailable.length > 0) {
        unavailable.forEach(r => {
            console.log(`   - ${r.model} (HTTP ${r.status || '錯誤'})`);
        });
    } else {
        console.log('   (無)');
    }

    // 4️⃣ 給出建議
    console.log('\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('💡 建議');
    console.log('═══════════════════════════════════════════════════');

    if (available.some(r => r.model === 'gemini-2.5-flash')) {
        console.log('✅ 太好了！您可以使用 Gemini 2.5 Flash（速度快、成本低）');
        console.log('   建議您升級程式，將模型改為 gemini-2.5-flash');
    } else if (available.some(r => r.model === 'gemini-1.5-flash')) {
        console.log('⚠️  目前只能使用 Gemini 1.5 Flash');
        console.log('   您的 API Key 可能還沒有 2.5 版本的權限');
        console.log('   建議先繼續使用 1.5 版本');
    } else {
        console.log('⚠️  沒有找到可用的模型');
        console.log('   請檢查您的 API Key 是否正確');
    }

    console.log('\n');
}

// 執行測試
main().catch(error => {
    console.error('\n❌ 程式執行錯誤:', error);
    process.exit(1);
});
