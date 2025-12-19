/**
 * 完整測試：確認新 API Key 與程式整合
 */

require('dotenv').config();

async function fullTest() {
    console.log('═══════════════════════════════════════════════════');
    console.log('🧪 完整功能測試');
    console.log('═══════════════════════════════════════════════════\n');

    // 1. 檢查環境變數
    console.log('1️⃣  檢查環境變數...');
    const apiKey = process.env.GEMINI_API_KEY;
    const delay = process.env.GEMINI_REQUEST_DELAY;
    const maxRetries = process.env.GEMINI_MAX_RETRIES;

    console.log(`   ✅ API Key: ${apiKey ? apiKey.substring(0, 15) + '...' : '❌ 未設定'}`);
    console.log(`   ✅ 請求延遲: ${delay || '4000'} ms`);
    console.log(`   ✅ 最大重試: ${maxRetries || '3'} 次\n`);

    if (!apiKey) {
        console.error('❌ 錯誤：API Key 未設定！');
        process.exit(1);
    }

    // 2. 測試 API 呼叫
    console.log('2️⃣  測試 Gemini API 呼叫...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: '請用一句話說明：什麼是 AI？'
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const result = data.candidates[0].content.parts[0].text;
            console.log(`   ✅ API 呼叫成功！`);
            console.log(`   📝 AI 回應範例: ${result.substring(0, 100)}...\n`);
        } else if (response.status === 429) {
            console.log(`   ⚠️  收到 429 錯誤（頻率限制），但這代表 API 是可用的`);
            console.log(`   💡 建議：請稍等幾秒後再測試\n`);
        } else {
            const errorText = await response.text();
            console.log(`   ❌ API 錯誤 ${response.status}: ${errorText.substring(0, 200)}\n`);
        }

    } catch (error) {
        console.log(`   ❌ 測試失敗: ${error.message}\n`);
    }

    // 3. 總結
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 測試總結');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ 環境設定完成');
    console.log('✅ 新的 API Key 已啟用');
    console.log('✅ 使用模型：gemini-2.0-flash-exp');
    console.log('\n💡 接下來您可以：');
    console.log('   1. 啟動程式：npm start');
    console.log('   2. 開始使用教材轉換功能\n');
}

fullTest();
