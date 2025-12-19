/**
 * 端對端整合測試 (End-to-End Test)
 * 模擬前端呼叫後端 API，驗證完整流程
 */

// Native fetch is available in Node.js 18+

async function testBackendAPI() {
    console.log('🚀 開始端對端測試 (Frontend -> Backend -> Gemini API)...\n');

    const content = '# AI 簡介\n人工智慧是電腦科學的一個領域。';

    try {
        console.log('1️⃣  發送請求到本地伺服器 (http://localhost:3000/api/analyze)...');
        const startTime = Date.now();

        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stage: 'analyze',
                content: content
            })
        });

        const endTime = Date.now();
        console.log(`   ⏱️  耗時: ${(endTime - startTime) / 1000} 秒`);

        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ 測試成功！(HTTP 200)');
            console.log('📄 回傳結果預覽：');
            console.log('---------------------------------------------------');
            console.log(data.result.substring(0, 150) + '...');
            console.log('---------------------------------------------------');
            return true;
        } else {
            console.log(`\n❌ 測試失敗 (HTTP ${response.status})`);
            const error = await response.text();
            console.log(`   錯誤訊息: ${error}`);

            if (response.status === 429) {
                console.log('   ⚠️  原因：頻率限制 (正常現象，請稍後再試)');
            }
            return false;
        }
    } catch (error) {
        console.log(`\n❌ 連線錯誤: ${error.message}`);
        console.log('   請確認伺服器是否已啟動 (npm start)');
        return false;
    }
}

// 執行測試
if (typeof fetch === 'undefined') {
    // 簡單的 polyfill 或警告，假設 Node 18+
    console.warn('⚠️  警告: Node.js 版本可能過舊，若執行失敗請升級');
}

testBackendAPI();
