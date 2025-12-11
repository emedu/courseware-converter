const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體設定
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS 設定
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // 允許沒有 origin 的請求（如 Postman）
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// 靜態檔案服務（提供前端應用程式）
app.use(express.static(path.join(__dirname, '../app')));

// API 路由
app.use('/api', apiRoutes);

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'AI Courseware Converter API'
    });
});

// 根路徑返回前端應用程式
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `路徑 ${req.url} 不存在`
    });
});

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
    console.error('伺服器錯誤:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 AI 教材轉換器伺服器已啟動`);
    console.log(`📍 本地訪問: http://localhost:${PORT}`);
    console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 API Key 狀態: ${process.env.GEMINI_API_KEY ? '✅ 已設定' : '❌ 未設定'}`);
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，正在關閉伺服器...');
    process.exit(0);
});

module.exports = app;
