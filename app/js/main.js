// 主程式
class CoursewareApp {
    constructor() {
        // 初始化模組
        this.fileHandler = new FileHandler();
        this.aiService = new AIService();
        this.pdfGenerator = new PDFGenerator();
        this.wordGenerator = new WordGenerator();
        this.storage = new StorageManager();

        // 當前專案資料
        this.currentProject = {
            id: this.generateId(),
            name: '未命名專案',
            rawContent: '',
            suggestedContent: '',
            structured: null,
            images: {},
            primaryColor: CONFIG.DEFAULT_STYLES.primaryColor
        };

        // UI 元素
        this.elements = {};

        // 初始化
        this.init();
    }

    /**
     * 初始化應用程式
     */
    init() {
        // 綁定 UI 元素
        this.bindElements();

        // 綁定事件
        this.bindEvents();

        // 設定 PDF 生成器的預覽容器
        this.pdfGenerator.setPreviewContainer(this.elements.previewContainer);

        // 檢查是否顯示新手導覽
        if (!this.storage.isTutorialShown()) {
            this.showTutorial();
        }

        console.log('AI 教材轉換器已啟動');
    }

    /**
     * 綁定 UI 元素
     */
    bindElements() {
        this.elements = {
            // 上傳相關
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            fileInfo: document.getElementById('file-info'),
            fileName: document.getElementById('file-name'),
            removeFile: document.getElementById('remove-file'),

            // AI 分析
            aiAnalyzeBtn: document.getElementById('ai-analyze-btn'),
            aiProgress: document.getElementById('ai-progress'),

            // 樣式設定
            colorPresets: document.querySelectorAll('.color-preset'),
            customColor: document.getElementById('custom-color'),

            // 下載
            calculatePagesBtn: document.getElementById('calculate-pages-btn'),
            downloadPdfBtn: document.getElementById('download-pdf-btn'),
            downloadWordBtn: document.getElementById('download-word-btn'),

            // 專案管理
            saveProjectBtn: document.getElementById('save-project-btn'),
            loadProjectBtn: document.getElementById('load-project-btn'),

            // 預覽
            previewContainer: document.getElementById('preview-container'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            zoomLevel: document.getElementById('zoom-level'),

            // API 設定
            changeApiBtn: document.getElementById('change-api-btn'),
            apiModal: document.getElementById('api-modal'),
            apiKeyInput: document.getElementById('api-key-input'),
            apiSaveBtn: document.getElementById('api-save-btn'),
            apiCancelBtn: document.getElementById('api-cancel-btn'),

            // 專案列表
            projectsModal: document.getElementById('projects-modal'),
            projectsList: document.getElementById('projects-list'),
            projectsCloseBtn: document.getElementById('projects-close-btn'),

            // 新手導覽
            tutorialOverlay: document.getElementById('tutorial-overlay'),
            tutorialPrev: document.getElementById('tutorial-prev'),
            tutorialNext: document.getElementById('tutorial-next'),
            tutorialSkip: document.getElementById('tutorial-skip'),

            // 說明按鈕
            helpBtn: document.getElementById('help-btn')
        };
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 檔案上傳
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // 拖放上傳
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');

            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        this.elements.removeFile.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetFile();
        });

        // AI 分析
        this.elements.aiAnalyzeBtn.addEventListener('click', () => {
            this.handleAIAnalysis();
        });

        // 顏色選擇
        this.elements.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.changeColor(color);
                this.updateColorPresetActive(preset);
            });
        });

        this.elements.customColor.addEventListener('change', (e) => {
            this.changeColor(e.target.value);
            this.updateColorPresetActive(null);
        });

        // 計算頁碼
        this.elements.calculatePagesBtn.addEventListener('click', () => {
            this.calculatePageNumbers();
        });

        // 下載
        this.elements.downloadPdfBtn.addEventListener('click', () => {
            this.downloadPDF();
        });

        this.elements.downloadWordBtn.addEventListener('click', () => {
            this.downloadWord();
        });

        // 專案管理
        this.elements.saveProjectBtn.addEventListener('click', () => {
            this.saveProject();
        });

        this.elements.loadProjectBtn.addEventListener('click', () => {
            this.showProjectsList();
        });

        // 縮放
        this.elements.zoomIn.addEventListener('click', () => {
            this.zoom(1.1);
        });

        this.elements.zoomOut.addEventListener('click', () => {
            this.zoom(0.9);
        });

        // API 設定
        this.elements.changeApiBtn.addEventListener('click', () => {
            this.showApiModal();
        });

        this.elements.apiSaveBtn.addEventListener('click', () => {
            this.saveApiKey();
        });

        this.elements.apiCancelBtn.addEventListener('click', () => {
            this.hideApiModal();
        });

        // 專案列表
        this.elements.projectsCloseBtn.addEventListener('click', () => {
            this.hideProjectsList();
        });

        // 新手導覽
        this.elements.tutorialNext.addEventListener('click', () => {
            this.nextTutorialStep();
        });

        this.elements.tutorialPrev.addEventListener('click', () => {
            this.prevTutorialStep();
        });

        this.elements.tutorialSkip.addEventListener('click', () => {
            this.closeTutorial();
        });

        // 說明按鈕
        this.elements.helpBtn.addEventListener('click', () => {
            this.showTutorial();
        });
    }

    /**
     * 處理檔案上傳
     */
    async handleFileUpload(file) {
        this.showLoading('正在讀取檔案...');

        const result = await this.fileHandler.processFile(file);

        this.hideLoading();

        if (result.success) {
            this.currentProject.rawContent = result.content;
            this.currentProject.images = result.images || {};
            this.currentProject.name = file.name.replace(/\.(docx|pdf)$/, '');

            // 更新 UI
            this.elements.uploadArea.classList.add('hidden');
            this.elements.fileInfo.classList.remove('hidden');
            this.elements.fileName.textContent = file.name;
            this.elements.aiAnalyzeBtn.disabled = false;

            this.showSuccess('檔案讀取成功！');
        } else {
            this.showError(result.error);
        }
    }

    /**
     * 重置檔案
     */
    resetFile() {
        this.elements.uploadArea.classList.remove('hidden');
        this.elements.fileInfo.classList.add('hidden');
        this.elements.fileInput.value = '';
        this.elements.aiAnalyzeBtn.disabled = true;

        this.currentProject.rawContent = '';
        this.currentProject.images = {};
    }

    /**
     * 處理 AI 分析
     */
    async handleAIAnalysis() {
        if (!this.currentProject.rawContent) {
            this.showError('請先上傳檔案');
            return;
        }

        // 顯示進度
        this.elements.aiAnalyzeBtn.disabled = true;
        this.elements.aiProgress.classList.remove('hidden');

        const result = await this.aiService.processContent(
            this.currentProject.rawContent,
            (message, progress) => {
                this.updateProgress(message, progress);
            }
        );

        this.elements.aiProgress.classList.add('hidden');

        if (result.success) {
            this.currentProject.suggestedContent = result.suggestedContent;
            this.currentProject.structured = result.structured;

            // 渲染預覽
            this.renderPreview();

            // 啟用後續按鈕
            this.elements.calculatePagesBtn.disabled = false;
            this.elements.saveProjectBtn.disabled = false;

            this.showSuccess('AI 分析完成！');
        } else {
            this.elements.aiAnalyzeBtn.disabled = false;
            this.showError(result.error);
        }
    }

    /**
     * 渲染預覽
     */
    renderPreview() {
        if (!this.currentProject.structured) {
            return;
        }

        const { structured, images, primaryColor } = this.currentProject;
        let html = '<div class="preview-page">';

        // 標題
        if (structured.title) {
            html += `<h1 class="content-title" style="color: ${primaryColor}">${this.escapeHtml(structured.title)}</h1>`;
        }

        // 目錄
        if (structured.toc && structured.toc.length > 0) {
            html += '<div class="content-toc">';
            html += '<h2 class="content-chapter" style="border-color: ${primaryColor}">目錄</h2>';
            structured.toc.forEach(item => {
                const indent = (item.level - 1) * 20;
                const pageNum = item.pageNumber || '⇲';
                html += `<p style="margin-left: ${indent}px">${this.escapeHtml(item.text)} ...... ${pageNum}</p>`;
            });
            html += '</div>';
            html += '<div class="page-break"></div>';
        }

        // 內容
        structured.content.forEach((item, index) => {
            switch (item.type) {
                case 'chapter':
                    html += `<h2 class="content-chapter" style="border-color: ${primaryColor}">${this.escapeHtml(item.text)}</h2>`;
                    break;

                case 'section':
                    html += `<h3 class="content-section">${this.escapeHtml(item.text)}</h3>`;
                    break;

                case 'paragraph':
                    html += `<p class="content-paragraph">${this.escapeHtml(item.text)}</p>`;
                    break;

                case 'keypoint':
                    html += `<div class="content-keypoint" style="border-color: ${primaryColor}">💡 ${this.escapeHtml(item.text)}</div>`;
                    break;

                case 'definition':
                    html += `<div class="content-definition"><strong>${this.escapeHtml(item.term)}:</strong> ${this.escapeHtml(item.definition)}</div>`;
                    break;

                case 'warning':
                    html += `<div class="content-warning">⚠️ ${this.escapeHtml(item.text)}</div>`;
                    break;

                case 'image':
                    if (images[item.id]) {
                        html += `<figure class="content-image">`;
                        html += `<img src="${images[item.id]}" alt="${this.escapeHtml(item.description || '圖片')}">`;
                        if (item.description) {
                            html += `<figcaption>${this.escapeHtml(item.description)}</figcaption>`;
                        }
                        html += `</figure>`;
                    } else {
                        html += `<div class="content-image" style="background: #f1f5f9; padding: 48px; text-align: center; border-radius: 8px;">`;
                        html += `<p>📷 ${this.escapeHtml(item.description || '圖片佔位符')}</p>`;
                        html += `</div>`;
                    }
                    break;

                case 'table':
                    if (item.headers && item.rows) {
                        html += '<table class="content-table">';
                        html += '<thead><tr>';
                        item.headers.forEach(header => {
                            html += `<th>${this.escapeHtml(header)}</th>`;
                        });
                        html += '</tr></thead>';
                        html += '<tbody>';
                        item.rows.forEach(row => {
                            html += '<tr>';
                            row.forEach(cell => {
                                html += `<td>${this.escapeHtml(cell)}</td>`;
                            });
                            html += '</tr>';
                        });
                        html += '</tbody></table>';
                    }
                    break;
            }
        });

        html += '</div>';

        this.elements.previewContainer.innerHTML = html;
    }

    /**
     * 計算頁碼
     */
    calculatePageNumbers() {
        if (!this.currentProject.structured) {
            this.showError('請先進行 AI 分析');
            return;
        }

        this.currentProject.structured = this.pdfGenerator.calculatePageNumbers(
            this.currentProject.structured
        );

        // 重新渲染預覽
        this.renderPreview();

        // 啟用下載按鈕
        this.elements.downloadPdfBtn.disabled = false;
        this.elements.downloadWordBtn.disabled = false;

        this.showSuccess('頁碼計算完成！');
    }

    /**
     * 下載 PDF
     */
    async downloadPDF() {
        try {
            this.showLoading('正在生成 PDF...');
            await this.pdfGenerator.generatePDF();
            this.hideLoading();
            this.showSuccess('PDF 已開啟列印視窗');
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    /**
     * 下載 Word
     */
    async downloadWord() {
        try {
            this.showLoading('正在生成 Word 文件...');

            this.wordGenerator.setData(
                this.currentProject.structured,
                this.currentProject.images,
                this.currentProject.primaryColor
            );

            await this.wordGenerator.generateWord();

            this.hideLoading();
            this.showSuccess('Word 文件已下載');
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    /**
     * 儲存專案
     */
    saveProject() {
        const result = this.storage.saveProject(this.currentProject);

        if (result.success) {
            this.showSuccess('專案已儲存');
        } else {
            this.showError(result.error);
        }
    }

    /**
     * 顯示專案列表
     */
    showProjectsList() {
        const projects = this.storage.getAllProjects();

        if (projects.length === 0) {
            this.elements.projectsList.innerHTML = '<p style="text-align: center; color: #64748b;">尚無儲存的專案</p>';
        } else {
            this.elements.projectsList.innerHTML = projects.map(project => `
                <div class="project-item" data-id="${project.id}">
                    <div class="project-info">
                        <h4>${this.escapeHtml(project.name)}</h4>
                        <p>更新時間：${new Date(project.updatedAt).toLocaleString('zh-TW')}</p>
                    </div>
                    <div class="project-actions">
                        <button class="btn-icon load-project" data-id="${project.id}">📂</button>
                        <button class="btn-icon delete-project" data-id="${project.id}">🗑️</button>
                    </div>
                </div>
            `).join('');

            // 綁定載入和刪除事件
            this.elements.projectsList.querySelectorAll('.load-project').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.loadProject(btn.dataset.id);
                });
            });

            this.elements.projectsList.querySelectorAll('.delete-project').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('確定要刪除這個專案嗎？')) {
                        this.deleteProject(btn.dataset.id);
                    }
                });
            });
        }

        this.elements.projectsModal.classList.remove('hidden');
    }

    /**
     * 隱藏專案列表
     */
    hideProjectsList() {
        this.elements.projectsModal.classList.add('hidden');
    }

    /**
     * 載入專案
     */
    loadProject(projectId) {
        const result = this.storage.loadProject(projectId);

        if (result.success) {
            this.currentProject = result.project;

            // 更新 UI
            if (this.currentProject.rawContent) {
                this.elements.uploadArea.classList.add('hidden');
                this.elements.fileInfo.classList.remove('hidden');
                this.elements.fileName.textContent = this.currentProject.name;
                this.elements.aiAnalyzeBtn.disabled = false;
            }

            if (this.currentProject.structured) {
                this.renderPreview();
                this.elements.calculatePagesBtn.disabled = false;
                this.elements.saveProjectBtn.disabled = false;
            }

            if (this.currentProject.primaryColor) {
                this.changeColor(this.currentProject.primaryColor);
            }

            this.hideProjectsList();
            this.showSuccess('專案已載入');
        } else {
            this.showError(result.error);
        }
    }

    /**
     * 刪除專案
     */
    deleteProject(projectId) {
        const result = this.storage.deleteProject(projectId);

        if (result.success) {
            this.showProjectsList(); // 重新整理列表
            this.showSuccess('專案已刪除');
        } else {
            this.showError(result.error);
        }
    }

    /**
     * 更改主色調
     */
    changeColor(color) {
        this.currentProject.primaryColor = color;
        this.elements.customColor.value = color;
        document.documentElement.style.setProperty('--primary-color', color);

        // 如果已有預覽，重新渲染
        if (this.currentProject.structured) {
            this.renderPreview();
        }
    }

    /**
     * 更新顏色預設按鈕的啟用狀態
     */
    updateColorPresetActive(activePreset) {
        this.elements.colorPresets.forEach(preset => {
            preset.classList.remove('active');
        });

        if (activePreset) {
            activePreset.classList.add('active');
        }
    }

    /**
     * 縮放
     */
    zoom(factor) {
        const currentZoom = parseFloat(this.elements.previewContainer.style.zoom || 1);
        const newZoom = Math.max(0.5, Math.min(2, currentZoom * factor));

        this.elements.previewContainer.style.zoom = newZoom;
        this.elements.zoomLevel.textContent = `${Math.round(newZoom * 100)}%`;
    }

    /**
     * 顯示 API 設定對話框
     */
    showApiModal() {
        this.elements.apiKeyInput.value = this.aiService.getApiKey();
        this.elements.apiModal.classList.remove('hidden');
    }

    /**
     * 隱藏 API 設定對話框
     */
    hideApiModal() {
        this.elements.apiModal.classList.add('hidden');
    }

    /**
     * 儲存 API Key
     */
    saveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('請輸入 API Key');
            return;
        }

        this.aiService.setApiKey(apiKey);
        this.hideApiModal();
        this.showSuccess('API Key 已儲存');
    }

    /**
     * 顯示新手導覽
     */
    showTutorial() {
        this.tutorialStep = 1;
        this.updateTutorialStep();
        this.elements.tutorialOverlay.classList.remove('hidden');
    }

    /**
     * 關閉新手導覽
     */
    closeTutorial() {
        this.elements.tutorialOverlay.classList.add('hidden');
        this.storage.markTutorialShown();
    }

    /**
     * 下一步導覽
     */
    nextTutorialStep() {
        if (this.tutorialStep < 4) {
            this.tutorialStep++;
            this.updateTutorialStep();
        } else {
            this.closeTutorial();
        }
    }

    /**
     * 上一步導覽
     */
    prevTutorialStep() {
        if (this.tutorialStep > 1) {
            this.tutorialStep--;
            this.updateTutorialStep();
        }
    }

    /**
     * 更新導覽步驟
     */
    updateTutorialStep() {
        document.querySelectorAll('.tutorial-step').forEach((step, index) => {
            if (index + 1 === this.tutorialStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        this.elements.tutorialPrev.disabled = this.tutorialStep === 1;
        this.elements.tutorialNext.textContent = this.tutorialStep === 4 ? '開始使用' : '下一步';
    }

    /**
     * 更新進度
     */
    updateProgress(message, progress) {
        const progressFill = this.elements.aiProgress.querySelector('.progress-fill');
        const progressText = this.elements.aiProgress.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = message;
        }
    }

    /**
     * 顯示載入中
     */
    showLoading(message) {
        // 簡易實作：可以改用更好的 loading UI
        console.log('Loading:', message);
    }

    /**
     * 隱藏載入中
     */
    hideLoading() {
        console.log('Loading complete');
    }

    /**
     * 顯示成功訊息
     */
    showSuccess(message) {
        alert('✅ ' + message);
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        alert('❌ ' + message);
    }

    /**
     * HTML 跳脫
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 生成 ID
     */
    generateId() {
        return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// 啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CoursewareApp();
});
