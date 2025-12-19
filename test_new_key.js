/**
 * 快速測試新的 API Key
 */

const NEW_API_KEY = 'AIzaSyB2piAgC_yOF65BOgjuYMijseJUsdwo-G0';

const MODELS_TO_TEST = [
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
];

async function testNewKey() {
    console.log('🔍 測試新的 API Key...\n');

    for (const model of MODELS_TO_TEST) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${NEW_API_KEY}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: '測試' }] }]
                })
            });

            if (response.ok || response.status === 429) {
                console.log(`✅ ${model} - 可以用！`);
            } else {
                console.log(`❌ ${model} - 無法使用 (HTTP ${response.status})`);
            }
        } catch (error) {
            console.log(`❌ ${model} - 錯誤: ${error.message}`);
        }

        // 等待 2 秒避免頻率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

testNewKey();
