// PDF 生成器
class PDFGenerator {
    constructor() {
        this.previewContainer = null;
    }

    /**
     * 設定預覽容器
     */
    setPreviewContainer(container) {
        this.previewContainer = container;
    }

    /**
     * 計算頁碼 (改進版 - 使用內容高度估算)
     */
    calculatePageNumbers(structured) {
        if (!structured || !structured.content) {
            console.error('結構化內容不存在');
            return structured;
        }

        // A4 頁面參數 (mm)
        const A4_HEIGHT = 297;
        const MARGIN_TOP = 25;
        const MARGIN_BOTTOM = 25;
        const CONTENT_HEIGHT = A4_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM; // 247mm

        // 估算每種元素的高度 (mm)
        const ELEMENT_HEIGHTS = {
            title: 50,
            chapter: 40,
            section: 25,
            subsection: 20,
            subsubsection: 15,
            paragraph: 12,
            keypoint: 20,
            definition: 18,
            warning: 20,
            image: 70,
            table: 15, // 基礎高度,每行額外加 8mm
            list: 10
        };

        let currentPage = 1;
        let currentHeight = 0;

        // 遍歷所有內容項目,計算頁碼
        structured.content.forEach((item, index) => {
            // 估算當前元素的高度
            let itemHeight = ELEMENT_HEIGHTS[item.type] || 10;

            // 表格需要根據行數計算
            if (item.type === 'table' && item.rows) {
                itemHeight = ELEMENT_HEIGHTS.table + (item.rows.length * 8);
            }

            // 章節強制換頁
            if (item.type === 'chapter' && index > 0) {
                currentPage++;
                currentHeight = 0;
            }

            // 檢查是否超過頁面高度
            if (currentHeight + itemHeight > CONTENT_HEIGHT) {
                currentPage++;
                currentHeight = 0;
            }

            // 記錄當前元素的頁碼
            item.pageNumber = currentPage;
            currentHeight += itemHeight;
        });

        // 更新目錄頁碼
        if (structured.toc && structured.toc.length > 0) {
            structured.toc = structured.toc.map(tocItem => {
                // 在 content 中找到對應的項目
                const contentItem = structured.content.find(
                    c => c.text && c.text.trim() === tocItem.text.trim()
                );

                return {
                    ...tocItem,
                    pageNumber: contentItem ? contentItem.pageNumber : '?'
                };
            });
        }

        console.log(`頁碼計算完成: 共 ${currentPage} 頁`);
        return structured;
    }

    /**
     * 生成 PDF
     */
    async generatePDF() {
        if (!this.previewContainer) {
            throw new Error('預覽容器未設定');
        }

        // 建立一個新視窗用於列印
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            throw new Error('無法開啟列印視窗，請檢查瀏覽器設定');
        }

        // 取得預覽內容
        const content = this.previewContainer.innerHTML;

        // 取得樣式
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        // 建立列印頁面
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>教材</title>
                <style>
                    ${styles}
                    
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        
                        .preview-page {
                            page-break-after: always;
                            margin: 0;
                            box-shadow: none !important;
                        }
                        
                        .preview-page:last-child {
                            page-break-after: auto;
                        }
                        
                        .page-break {
                            display: none;
                        }
                        
                        /* 確保圖片和背景顏色都能列印 */
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                    
                    @page {
                        size: A4;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);

        printWindow.document.close();

        // 等待內容載入完成
        await new Promise(resolve => {
            printWindow.onload = resolve;
            setTimeout(resolve, 1000);
        });

        // 觸發列印
        printWindow.print();

        // 列印後關閉視窗
        setTimeout(() => {
            printWindow.close();
        }, 100);
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
