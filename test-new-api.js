require('dotenv').config();

async function testNewApiKey() {
    console.log('🔍 測試新的 Gemini API Key...\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ 錯誤：找不到 GEMINI_API_KEY');
        process.exit(1);
    }

    console.log('✅ API Key 已載入');
    console.log('   長度：' + apiKey.length + ' 字符');
    console.log('   前綴：' + apiKey.substring(0, 10) + '...');
    console.log('   後綴：...' + apiKey.substring(apiKey.length - 5));
    console.log('');

    // 使用 fetch 進行測試 - 使用穩定版模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: "請回答：1+1等於多少？只需回答數字。"
            }]
        }]
    };

    console.log('🧪 正在發送測試請求...\n');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📡 HTTP 狀態碼：', response.status);

        const data = await response.json();

        if (response.ok) {
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '無回應';
            console.log('\n✅ API 測試成功！');
            console.log('📝 AI 回應：', aiResponse.trim());
            console.log('\n🎉 您的新 API Key 可以正常使用！');
            console.log('✅ 模型：gemini-2.5-flash (穩定版)');
            return true;
        } else {
            console.log('\n❌ API 調用失敗');
            console.log('錯誤詳情：', JSON.stringify(data, null, 2));

            if (data.error?.code === 429) {
                console.log('\n⚠️  速率限制錯誤（429）');
                console.log('這可能是因為：');
                console.log('1. 新 API Key 還在冷靜期（通常需要等待幾小時到24小時）');
                console.log('2. 請求過於頻繁');
                console.log('\n建議：請稍後再試（建議等待 1-2 小時）');
            } else if (data.error?.code === 400) {
                console.log('\n⚠️  請求格式錯誤（400）');
                console.log('API Key 本身可能沒問題，但請求格式有誤');
            } else if (data.error?.code === 403) {
                console.log('\n⚠️  權限錯誤（403）');
                console.log('請檢查：');
                console.log('1. API Key 是否已啟用');
                console.log('2. 是否有存取 Gemini API 的權限');
            }

            return false;
        }
    } catch (error) {
        console.error('\n❌ 網路請求失敗：', error.message);
        return false;
    }
}

testNewApiKey().then(success => {
    process.exit(success ? 0 : 1);
});
