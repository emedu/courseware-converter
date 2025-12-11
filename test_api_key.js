// 簡單的 API Key 測試腳本
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const apiKey = process.env.GEMINI_API_KEY;
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

async function testApiKey() {
    console.log('🔍 開始測試 API Key...\n');

    const requestBody = {
        contents: [{
            parts: [{
                text: '請回答：1+1等於多少？'
            }]
        }]
    };

    try {
        console.log('📡 發送測試請求...');
        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`📊 HTTP 狀態碼: ${response.status}`);

        if (response.status === 429) {
            console.log('\n❌ 結果：API Key 被速率限制！');
            console.log('這表示：');
            console.log('  1. 您的 IP 可能在短時間內請求太多次');
            console.log('  2. 或者這個 API Key 在其他地方也在使用');
            console.log('  3. 建議等待 1-2 小時後再試，或申請新的 Key\n');
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('\n❌ 錯誤詳情:', JSON.stringify(errorData, null, 2));
            return;
        }

        const data = await response.json();
        console.log('\n✅ 成功！API Key 正常運作！');
        console.log('📝 AI 回應:', data.candidates[0].content.parts[0].text);

    } catch (error) {
        console.log('\n❌ 測試失敗:', error.message);
    }
}

testApiKey();
