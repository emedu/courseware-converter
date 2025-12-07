// Word 生成器
class WordGenerator {
    constructor() {
        this.structured = null;
        this.images = {};
        this.primaryColor = CONFIG.DEFAULT_STYLES.primaryColor;
    }

    /**
     * 設定資料
     */
    setData(structured, images, primaryColor) {
        this.structured = structured;
        this.images = images;
        this.primaryColor = primaryColor || CONFIG.DEFAULT_STYLES.primaryColor;
    }

    /**
     * 生成 Word 文件
     */
    async generateWord() {
        if (!this.structured) {
            throw new Error('未設定文件資料');
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } = docx;

        const children = [];

        // 標題
        if (this.structured.title) {
            children.push(
                new Paragraph({
                    text: this.structured.title,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                })
            );
        }

        // 目錄
        if (this.structured.toc && this.structured.toc.length > 0) {
            children.push(
                new Paragraph({
                    text: '目錄',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                })
            );

            this.structured.toc.forEach(item => {
                const indent = (item.level - 1) * 720; // 720 twips = 0.5 inch
                children.push(
                    new Paragraph({
                        text: `${item.text} ${item.pageNumber ? `...... ${item.pageNumber}` : ''}`,
                        spacing: { after: 100 },
                        indent: { left: indent }
                    })
                );
            });

            children.push(
                new Paragraph({
                    text: '',
                    spacing: { after: 400 }
                })
            );
        }

        // 內容
        for (const item of this.structured.content) {
            switch (item.type) {
                case 'chapter':
                    children.push(
                        new Paragraph({
                            text: item.text,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 400, after: 200 }
                        })
                    );
                    break;

                case 'section':
                    children.push(
                        new Paragraph({
                            text: item.text,
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 300, after: 150 }
                        })
                    );
                    break;

                case 'paragraph':
                    children.push(
                        new Paragraph({
                            text: item.text,
                            spacing: { after: 200 }
                        })
                    );
                    break;

                case 'keypoint':
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '💡 ' + item.text,
                                    bold: true,
                                    color: '2563EB'
                                })
                            ],
                            spacing: { before: 200, after: 200 },
                            shading: {
                                fill: 'EFF6FF'
                            }
                        })
                    );
                    break;

                case 'definition':
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: item.term + ': ',
                                    bold: true,
                                    color: '16A34A'
                                }),
                                new TextRun({
                                    text: item.definition
                                })
                            ],
                            spacing: { before: 200, after: 200 },
                            shading: {
                                fill: 'F0FDF4'
                            }
                        })
                    );
                    break;

                case 'warning':
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: '⚠️ ' + item.text,
                                    bold: true,
                                    color: 'DC2626'
                                })
                            ],
                            spacing: { before: 200, after: 200 },
                            shading: {
                                fill: 'FEF2F2'
                            }
                        })
                    );
                    break;

                case 'image':
                    if (this.images[item.id]) {
                        try {
                            // 將 base64 轉換為 buffer
                            const base64Data = this.images[item.id].split(',')[1];
                            const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                            children.push(
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: buffer,
                                            transformation: {
                                                width: 400,
                                                height: 300
                                            }
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 200, after: 200 }
                                })
                            );

                            if (item.description) {
                                children.push(
                                    new Paragraph({
                                        text: item.description,
                                        alignment: AlignmentType.CENTER,
                                        italics: true,
                                        spacing: { after: 200 }
                                    })
                                );
                            }
                        } catch (error) {
                            console.error('圖片處理錯誤:', error);
                            children.push(
                                new Paragraph({
                                    text: `[圖片: ${item.description || '無法載入'}]`,
                                    spacing: { after: 200 }
                                })
                            );
                        }
                    } else {
                        children.push(
                            new Paragraph({
                                text: `[圖片佔位符: ${item.description || ''}]`,
                                spacing: { after: 200 }
                            })
                        );
                    }
                    break;

                case 'table':
                    if (item.headers && item.rows) {
                        const tableRows = [];

                        // 表頭
                        tableRows.push(
                            new TableRow({
                                children: item.headers.map(header =>
                                    new TableCell({
                                        children: [new Paragraph({ text: header, bold: true })],
                                        shading: { fill: 'F8FAFC' }
                                    })
                                )
                            })
                        );

                        // 表格內容
                        item.rows.forEach(row => {
                            tableRows.push(
                                new TableRow({
                                    children: row.map(cell =>
                                        new TableCell({
                                            children: [new Paragraph({ text: cell })]
                                        })
                                    )
                                })
                            );
                        });

                        children.push(
                            new Table({
                                rows: tableRows,
                                width: { size: 100, type: WidthType.PERCENTAGE }
                            })
                        );

                        children.push(
                            new Paragraph({
                                text: '',
                                spacing: { after: 200 }
                            })
                        );
                    }
                    break;
            }
        }

        // 建立文件
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        size: {
                            width: 11906, // A4 width in twips
                            height: 16838 // A4 height in twips
                        }
                    }
                },
                children: children
            }]
        });

        // 生成並下載
        const blob = await Packer.toBlob(doc);
        this.downloadBlob(blob, `${this.structured.title || '教材'}.docx`);
    }

    /**
     * 下載 Blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordGenerator;
}
