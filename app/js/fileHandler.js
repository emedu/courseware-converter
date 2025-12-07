// 檔案處理模組
class FileHandler {
    constructor() {
        this.currentFile = null;
        this.images = {};
    }

    /**
     * 處理 Word 檔案
     */
    async handleWordFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();

            // 使用 Mammoth.js 解析 Word
            const result = await mammoth.convertToHtml(
                { arrayBuffer: arrayBuffer },
                {
                    convertImage: mammoth.images.imgElement((image) => {
                        return image.read("base64").then((imageBuffer) => {
                            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            this.images[imageId] = `data:${image.contentType};base64,${imageBuffer}`;
                            return { src: `[IMAGE:${imageId}]` };
                        });
                    })
                }
            );

            // 將 HTML 轉換為 Markdown
            const markdown = this.htmlToMarkdown(result.value);

            return {
                success: true,
                content: markdown,
                images: this.images,
                messages: result.messages
            };
        } catch (error) {
            console.error('Word 檔案處理錯誤:', error);
            return {
                success: false,
                error: '無法讀取 Word 檔案，請確認檔案格式正確'
            };
        }
    }

    /**
     * 處理 PDF 檔案
     */
    async handlePDFFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();

            // 設定 PDF.js worker
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            // 載入 PDF
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            // 提取每一頁的文字和圖片
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);

                // 提取文字
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';

                // 提取圖片
                const operatorList = await page.getOperatorList();
                for (let i = 0; i < operatorList.fnArray.length; i++) {
                    if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                        try {
                            const imageName = operatorList.argsArray[i][0];
                            const image = await page.objs.get(imageName);

                            if (image) {
                                const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                canvas.width = image.width;
                                canvas.height = image.height;

                                const imageData = ctx.createImageData(image.width, image.height);
                                imageData.data.set(image.data);
                                ctx.putImageData(imageData, 0, 0);

                                this.images[imageId] = canvas.toDataURL();
                                fullText += `\n[IMAGE:${imageId}]\n`;
                            }
                        } catch (imgError) {
                            console.warn('圖片提取失敗:', imgError);
                        }
                    }
                }
            }

            return {
                success: true,
                content: fullText.trim(),
                images: this.images
            };
        } catch (error) {
            console.error('PDF 檔案處理錯誤:', error);
            return {
                success: false,
                error: '無法讀取 PDF 檔案，請確認檔案格式正確'
            };
        }
    }

    /**
     * 簡易 HTML 轉 Markdown
     */
    htmlToMarkdown(html) {
        let markdown = html;

        // 標題
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

        // 粗體和斜體
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

        // 段落
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

        // 列表
        markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        markdown = markdown.replace(/<\/?[ou]l[^>]*>/gi, '\n');

        // 移除其他 HTML 標籤
        markdown = markdown.replace(/<[^>]+>/g, '');

        // 清理多餘空行
        markdown = markdown.replace(/\n{3,}/g, '\n\n');

        return markdown.trim();
    }

    /**
     * 驗證檔案
     */
    validateFile(file) {
        // 檢查檔案大小
        if (file.size > CONFIG.FILE_SETTINGS.MAX_SIZE) {
            return {
                valid: false,
                error: `檔案太大！最大支援 ${CONFIG.FILE_SETTINGS.MAX_SIZE / 1024 / 1024}MB`
            };
        }

        // 檢查檔案類型
        if (!CONFIG.FILE_SETTINGS.ALLOWED_TYPES[file.type]) {
            return {
                valid: false,
                error: '不支援的檔案格式！請上傳 .docx 或 .pdf 檔案'
            };
        }

        return { valid: true };
    }

    /**
     * 處理檔案（統一入口）
     */
    async processFile(file) {
        // 驗證檔案
        const validation = this.validateFile(file);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }

        // 重置圖片庫
        this.images = {};
        this.currentFile = file;

        // 根據檔案類型處理
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return await this.handleWordFile(file);
        } else if (file.type === 'application/pdf') {
            return await this.handlePDFFile(file);
        }

        return {
            success: false,
            error: '未知的檔案格式'
        };
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
}
