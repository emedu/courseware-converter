// 儲存管理模組
class StorageManager {
    constructor() {
        this.storageKeys = CONFIG.STORAGE_KEYS;
    }

    /**
     * 儲存專案
     */
    saveProject(project) {
        try {
            // 取得所有專案
            const projects = this.getAllProjects();

            // 更新或新增專案
            const index = projects.findIndex(p => p.id === project.id);
            if (index >= 0) {
                projects[index] = {
                    ...project,
                    updatedAt: new Date().toISOString()
                };
            } else {
                projects.push({
                    ...project,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            // 儲存到 LocalStorage
            localStorage.setItem(this.storageKeys.PROJECTS, JSON.stringify(projects));
            localStorage.setItem(this.storageKeys.CURRENT_PROJECT, project.id);

            return { success: true };
        } catch (error) {
            console.error('儲存專案失敗:', error);
            return {
                success: false,
                error: '儲存失敗，請檢查瀏覽器儲存空間'
            };
        }
    }

    /**
     * 載入專案
     */
    loadProject(projectId) {
        try {
            const projects = this.getAllProjects();
            const project = projects.find(p => p.id === projectId);

            if (project) {
                localStorage.setItem(this.storageKeys.CURRENT_PROJECT, projectId);
                return { success: true, project };
            }

            return {
                success: false,
                error: '找不到專案'
            };
        } catch (error) {
            console.error('載入專案失敗:', error);
            return {
                success: false,
                error: '載入失敗'
            };
        }
    }

    /**
     * 刪除專案
     */
    deleteProject(projectId) {
        try {
            let projects = this.getAllProjects();
            projects = projects.filter(p => p.id !== projectId);

            localStorage.setItem(this.storageKeys.PROJECTS, JSON.stringify(projects));

            // 如果刪除的是當前專案，清除當前專案標記
            const currentId = localStorage.getItem(this.storageKeys.CURRENT_PROJECT);
            if (currentId === projectId) {
                localStorage.removeItem(this.storageKeys.CURRENT_PROJECT);
            }

            return { success: true };
        } catch (error) {
            console.error('刪除專案失敗:', error);
            return {
                success: false,
                error: '刪除失敗'
            };
        }
    }

    /**
     * 取得所有專案
     */
    getAllProjects() {
        try {
            const projectsJson = localStorage.getItem(this.storageKeys.PROJECTS);
            return projectsJson ? JSON.parse(projectsJson) : [];
        } catch (error) {
            console.error('讀取專案列表失敗:', error);
            return [];
        }
    }

    /**
     * 取得當前專案 ID
     */
    getCurrentProjectId() {
        return localStorage.getItem(this.storageKeys.CURRENT_PROJECT);
    }

    /**
     * 儲存設定
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKeys.SETTINGS, JSON.stringify(settings));
            return { success: true };
        } catch (error) {
            console.error('儲存設定失敗:', error);
            return { success: false, error: '儲存設定失敗' };
        }
    }

    /**
     * 載入設定
     */
    loadSettings() {
        try {
            const settingsJson = localStorage.getItem(this.storageKeys.SETTINGS);
            return settingsJson ? JSON.parse(settingsJson) : CONFIG.DEFAULT_STYLES;
        } catch (error) {
            console.error('載入設定失敗:', error);
            return CONFIG.DEFAULT_STYLES;
        }
    }

    /**
     * 檢查是否已顯示過新手導覽
     */
    isTutorialShown() {
        return localStorage.getItem(this.storageKeys.TUTORIAL_SHOWN) === 'true';
    }

    /**
     * 標記新手導覽已顯示
     */
    markTutorialShown() {
        localStorage.setItem(this.storageKeys.TUTORIAL_SHOWN, 'true');
    }

    /**
     * 清除所有資料
     */
    clearAll() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
