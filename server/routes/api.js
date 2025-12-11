const express = require('express');
const router = express.Router();
const geminiService = require('../services/gemini');
const apiLimiter = require('../middleware/rateLimiter');

// 應用速率限制到所有 API 路由
router.use(apiLimiter);

/**
 * POST /api/analyze
 * 分析教材內容
 */
router.post('/analyze', async (req, res) => {
    try {
        const { content, stage } = req.body;

        // 驗證請求
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: '請提供有效的內容（content 欄位）'
            });
        }

        if (!stage || !['analyze', 'structure'].includes(stage)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'stage 必須是 "analyze" 或 "structure"'
            });
        }

        // 檢查 API 是否已配置
        if (!geminiService.isConfigured()) {
            return res.status(503).json({
                error: 'Service Unavailable',
                message: 'Gemini API 尚未設定，請聯絡管理員'
            });
        }

        console.log(`📝 收到 ${stage} 請求，內容長度: ${content.length} 字元`);

        let result;

        // 根據階段呼叫不同的服務方法
        if (stage === 'analyze') {
            result = await geminiService.analyzeContent(content);
            res.json({
                success: true,
                stage: 'analyze',
                result: result
            });
        } else if (stage === 'structure') {
            result = await geminiService.structureContent(content);
            res.json({
                success: true,
                stage: 'structure',
                result: result
            });
        }

        console.log(`✅ ${stage} 請求完成`);

    } catch (error) {
        console.error('API 錯誤:', error);

        // 根據錯誤類型返回適當的狀態碼
        if (error.message.includes('配額') || error.message.includes('quota')) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: error.message
            });
        }

        if (error.message.includes('無效') || error.message.includes('invalid')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'AI 分析過程發生錯誤'
        });
    }
});

/**
 * GET /api/status
 * 檢查 API 狀態
 */
router.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        apiConfigured: geminiService.isConfigured(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
