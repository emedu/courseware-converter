require('dotenv').config();
const https = require('https');

async function testApiKey() {
    console.log('🔍 開始測試 Gemini API Key...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ 錯誤：在 .env 文件中找不到 GEMINI_API_KEY');
        process.exit(1);
    }

    console.log('✅ API Key 已載入');
    console.log('   長度：' + apiKey.length + ' 字符');
    console.log('   前綴：' + apiKey.substring(0, 7) + '...\n');

    console.log('🧪 測試 API 調用...');

    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: "API測試"
            }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('📡 HTTP 狀態碼：', res.statusCode, '\n');

                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(responseData);
                        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '無回應內容';

                        console.log('✅ API 調用成功！');
                        console.log('📝 AI 回應：', text);
                        console.log('\n🎉 測試完成！您的 API Key 可以正常使用。');
                        console.log('\n可用模型：gemini-2.0-flash-exp');
                        resolve();
                    } catch (error) {
                        console.error('❌ 解析回應時出錯：', error.message);
                        console.log('原始回應：', responseData);
                        reject(error);
                    }
                } else {
                    console.error('❌ API 調用失敗');
                    console.log('回應內容：', responseData);

                    try {
                        const errorData = JSON.parse(responseData);
                        const errorMessage = errorData.error?.message || '未知錯誤';
                        const errorStatus = errorData.error?.status || '未知狀態';

                        console.error('\n錯誤詳情：');
                        console.error('   狀態：', errorStatus);
                        console.error('   訊息：', errorMessage);

                        if (errorStatus === 'INVALID_ARGUMENT' || errorMessage.includes('API key')) {
                            console.error('\n💡 建議：您的 API Key 可能無效或格式不正確');
                            console.error('   請檢查：');
                            console.error('   1. API Key 是否正確複製（沒有多餘空格）');
                            console.error('   2. API Key 是否已啟用');
                            console.error('   3. 是否有存取 Gemini API 的權限');
                        } else if (res.statusCode === 429) {
                            console.error('\n💡 建議：請求頻率超出限制，請稍後再試');
                        }
                    } catch {
                        console.error('無法解析錯誤訊息');
                    }

                    reject(new Error('API調用失敗'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ 網路請求失敗：', error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

testApiKey().catch((error) => {
    console.error('\n測試失敗');
    process.exit(1);
});
