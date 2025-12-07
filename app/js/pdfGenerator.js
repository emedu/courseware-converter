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
     * 計算頁碼
     */
    calculatePageNumbers(structured) {
        if (!this.previewContainer) {
            console.error('預覽容器未設定');
            return structured;
        }

        const pages = this.previewContainer.querySelectorAll('.preview-page');
        const headings = this.previewContainer.querySelectorAll('h2, h3');

        // 建立標題到頁碼的映射
        const headingPageMap = new Map();

        headings.forEach(heading => {
            let currentPage = 1;
            let offsetTop = heading.offsetTop;

            // 找出標題所在的頁面
            pages.forEach((page, index) => {
                if (offsetTop >= page.offsetTop) {
                    currentPage = index + 1;
                }
            });

            headingPageMap.set(heading.textContent.trim(), currentPage);
        });

        // 更新目錄頁碼
        if (structured.toc) {
            structured.toc = structured.toc.map(item => ({
                ...item,
                pageNumber: headingPageMap.get(item.text) || null
            }));
        }

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
