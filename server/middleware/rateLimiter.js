const rateLimit = require('express-rate-limit');

// API 速率限制設定
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 預設 15 分鐘
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 預設最多 100 次請求
    message: {
        error: 'Too Many Requests',
        message: '請求次數過多，請稍後再試',
        retryAfter: '請在 15 分鐘後重試'
    },
    standardHeaders: true, // 返回 RateLimit-* headers
    legacyHeaders: false, // 停用 X-RateLimit-* headers
    skip: (req) => {
        // 健康檢查端點不受限制
        return req.path === '/health';
    }
});

module.exports = apiLimiter;
