// Node.js 18+ has native fetch support
const fetchApi = global.fetch;

async function testServer() {
    const baseUrl = 'http://localhost:3000';
    console.log(`🔍 開始測試伺服器: ${baseUrl}`);

    try {
        // 1. 測試健康檢查
        console.log('1️⃣  測試 /health...');
        const healthRes = await fetchApi(`${baseUrl}/health`);
        if (healthRes.ok) {
            const healthData = await healthRes.json();
            console.log('   ✅ 健康檢查成功:', healthData);
        } else {
            console.error('   ❌ 健康檢查失敗:', healthRes.status);
            process.exit(1);
        }

        // 2. 測試 API 狀態
        console.log('2️⃣  測試 /api/status...');
        const statusRes = await fetchApi(`${baseUrl}/api/status`);
        if (statusRes.ok) {
            const statusData = await statusRes.json();
            console.log('   ✅ API 狀態檢查成功:', statusData);
            if (!statusData.apiConfigured) {
                console.warn('   ⚠️ 警告: Gemini API Key 尚未設定');
            }
        } else {
            console.error('   ❌ API 狀態檢查失敗:', statusRes.status);
            process.exit(1);
        }

        console.log('\n🎉 所有基礎測試通過！伺服器運作正常。');

    } catch (error) {
        console.error('\n❌ 測試過程發生錯誤 (伺服器可能未啟動):', error.message);
        process.exit(1);
    }
}

testServer();
