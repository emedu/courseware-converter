// AI 服務模組
class AIService {
    constructor() {
        this.backendUrl = CONFIG.BACKEND_API_URL;
    }

    /**
     * 檢查後端 API 狀態
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/status`);
            const data = await response.json();
            return data.apiConfigured;
        } catch (error) {
            console.error('無法連接後端 API:', error);
            return false;
        }
    }

    /**
     * 呼叫後端 API
     */
    async callBackend(stage, content) {
        try {
            const response = await fetch(`${this.backendUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stage: stage,
                    content: content
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.message || errorData.error || 'API 呼叫失敗';

                // 檢查特定錯誤類型
                if (response.status === 429) {
                    throw new Error('請求太頻繁，請稍後再試。\n\n提示：系統有請求次數限制。');
                }

                if (response.status === 503) {
                    throw new Error('後端 API 尚未設定，請聯絡管理員。');
                }

                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'API 處理失敗');
            }

            return data.result;
        } catch (error) {
            console.error('後端 API 錯誤:', error);

            // 如果是網路錯誤
            if (error.message === 'Failed to fetch') {
                throw new Error('無法連接到後端伺服器，請確認伺服器是否正在運行。');
            }

            throw error;
        }
    }

    /**
     * 檢查是否為 Demo 模擬內容
     */
    checkDemoContent(content) {
        if (content.trim().startsWith('# 測試教材DEMO')) {
            return {
                isDemo: true,
                result: `# 測試教材DEMO (AI 分析模擬結果)

目錄
導論：思維與責任...................................................1
第一章：專業基礎理論...............................................3
第二章：核心技術操作...............................................8
第三章：進階應用...................................................14
第四章：技能檢定...................................................18
第五章：事業經營...................................................20

導論：成為頂尖粉刺管理師的思維與責任
1. 頂尖粉刺管理師的價值與定位
在美容產業中，粉刺管理師不僅僅是清潔皮膚的工匠，更是肌膚健康的守護者。一位頂尖的粉刺管理師，其價值建立在三個核心支柱上：專業的病理判斷、精準的無痛技術，以及完善的客戶衛教。

許多美容師誤以為「清得乾淨」就是好，但往往忽略了皮膚的耐受度與修復期。我們的目標不只是當下的乾淨，而是長期的肌膚穩定與健康。這就是為什麼我們強調「管理」而非單純的「清除」。
[建議：重點提示] 核心價值：技術只能解決當下的問題，觀念與管理才能帶來長久的改善。掌握這項技術，能為美容師創造穩定的收入與專業信任度。

2. 舊時代的痛點與新技術的優勢
傳統的美容手法常依賴強力的擠壓與針挑，這雖然能快速去除粉刺，但往往伴隨著劇烈的疼痛、嚴重的紅腫，甚至留下難以磨滅的凹洞與色素沈澱。這不僅讓客戶視清粉刺為畏途，也增加了店家的客訴風險。

「So Easy 粉刺清除技術」正是為了解決這些痛點而生。我們引入了醫療級的 ODT 軟化概念，配合特殊的力學引流手法，將傷口控制在最小範圍，大幅降低了疼痛感，實現「無痛、無痕、快速復原」的理想境界。

第一章：專業基礎理論與科學根基
一切的技術都必須建立在對皮膚生理學的深刻理解之上。身為粉刺管理師，我們必須精確知道工具操作的界線在哪裡，而這界線的根基就是對皮膚結構的認識。

1. 皮膚生理學基礎：清粉刺的操作目標區
皮膚由外而內分別為表皮層、真皮層與皮下組織。我們操作的「粉刺」，主要位於毛囊漏斗部，也就是表皮層與真皮層的交界處上方。嚴格來說，我們在操作時，絕對不能破壞到真皮層的網狀層，否則就會產生永久性的疤痕。
[建議：插入圖片：皮膚三層結構解剖圖，標示表皮、真皮、皮下組織]
[建議：警示] 重要觀念：只要看到出血，通常代表已經傷及真皮層的乳頭層。雖然微量出血有時難以避免，但必須將其視為操作過當的警訊。

2. 粉刺構造與病理判別：操作前的風險管理
粉刺是痤瘡的前身，主要由角質代謝異常與皮脂分泌旺盛所引起。依據其開口狀態，我們可以分為兩大類，這決定了我們採取的操作策略：
[建議：定義：開放性粉刺 (Blackheads)] 角質堆積混合皮脂，接觸空氣氧化變黑，位於毛孔表面。這類粉刺較好處理，通常不需要過度破口。
[建議：定義：閉鎖性粉刺 (Whiteheads)] 毛孔被異常角化的角質層完全覆蓋，外觀呈現白色突起或無明顯開口。這類粉刺位於皮下較深處，必須先建立精準的「微細開口」才能順利引流。

3. ODT技術的科學原理：源自醫療的應用
ODT (Occlusive Dressing Technique) 密封式傳輸技術，源自於皮膚科用藥概念。透過密封，我們可以創造一個高濕度、高溫及封閉的環境，強迫角質層水合化 (Hydration)。
[建議：重點提示] 科學原理：當角質層含水量增加，細胞間質會變得鬆散，大幅降低了對毛孔的束縛力。這就是為什麼使用 ODT 軟化後，粉刺可以像牙膏一樣輕易滑出，而不需要蠻力擠壓。

第二章：核心技術操作流程
理論結合實務，本章節將詳細解構標準化的操作流程。請學員務必反覆練習，將每一個步驟內化為肌肉記憶。

1. 核心工具與產品
工欲善其事，必先利其器。一套專業的粉刺管理工具箱應包含：五號直夾（用於夾取浮出粉刺）、專利粉刺引流棒（用於施壓引流）、以及醫療級拋棄式針頭（用於閉鎖性粉刺開口）。

2. So Easy 清粉刺標準操作流程 (SOP)
完整的「So Easy 粉刺清除技術」遵循一個系統化的六步驟流程，缺一不可：
[建議：重點提示] 標準流程：清潔→ODT 軟化→導出 (清除)→修復→保濕→防曬

3. 核心手技與口訣詳解
手技的核心在於「角度」與「力道」。青春棒應與皮膚呈現 45 度角，切勿垂直 90 度重壓，那樣會造成微血管破裂。

操作時，請遵循「順毛流」的原則。先利用圓頭端輕輕按壓毛孔周圍，觀察粉刺鬆動的方向，再順勢滑動約 0.1 至 0.2 公分。切記，若是按壓兩次仍無法產出，請立即停止，代表該粉刺尚未成熟或軟化不足，硬擠只會造成發炎。
[建議：插入圖片：手技操作示意圖，展示青春棒角度]

4. 清粉刺安全與禁忌對象
[建議：警示] 絕對禁忌：操作範圍嚴禁超過眼眶骨內側。發炎中的膿皰型痘痘、酒糟性皮膚、以及傷口癒合不良者（如糖尿病患），皆屬於暫緩操作對象。

第三章：進階應用與疑難排解
1. 不同膚質的應對策略
面對乾性肌膚，ODT 軟化時間不宜過長，以免過度水合導致屏障受損；面對油性肌膚，則需加強油脂調理與後續的收斂步驟。敏感性肌膚則建議分區操作，避免單次刺激過大。

2. 術後黃金 48 小時衛教
清完粉刺後的皮膚處於極度脆弱的狀態，這 48 小時是決定是否會反黑或發炎的關鍵期。
[建議：重點提示] 術後48小時內是關鍵。建議使用人工皮保護傷口，避免刺激源。請務必告知客戶：24小時內避免化妝與使用酸類保養品。

第四章：系統化練習與技能檢定
1. 練習標準
新手建議先在人工皮或豬皮上練習手感與力道控制，能夠穩定畫出直線且深度一致後，才可進行真人實操。

2. 考核要求
本課程結業考核包含學科與術科。術科要求：需在 90 分鐘內完成全臉清粉刺流程，術後紅腫需在 20 分鐘內消退，且客戶疼痛指數（1-10分）不得高於 3 分。
[建議：重點提示] 需完成真人模特兒操作，並繳交完整的操作影片與前後對比圖。

第五章：個人品牌與事業經營
1. 顧客資料管理
專業的差異往往體現在細節。建立詳盡的顧客皮膚資料卡，記錄生活習慣與保養建議，這才是專業服務的核心。

2. 從技術到事業
技術是門票，經營是旅程。當您的技術達到穩定水準後，如何透過口碑行銷、前後對比圖的呈現（需經客戶同意），將技術轉化為穩定的客源，是每一位粉刺管理師的必修課題。
[建議：重點提示] 技術的最終目標是實現事業的穩定獲利。

[DEMO_MARK]`
            };
        }
        return { isDemo: false };
    }

    /**
     * 本地離線排版引擎 (不使用 AI，保留完整內容)
     * 專門處理大長篇 (如 40 頁 Word) 的內容
     */
    parseContentLocally(content) {
        const lines = content.split('\n');
        const structured = {
            title: '未命名教材',
            content: [],
            toc: []
        };

        // 嘗試從第一行抓取標題
        if (lines.length > 0 && lines[0].trim().length > 0) {
            structured.title = lines[0].trim();
        }

        let currentChapter = null;
        let pageCounter = 1;
        let linesInPage = 0;
        const LINES_PER_PAGE = 30; // 估算分頁

        let inTocSection = false; // 標記是否在目錄區段

        // 圖片關鍵字規則（智能插入）
        const imageKeywords = {
            structure: ['結構', '構造', '組成', '層次', '部位', '解剖'],
            process: ['流程', '步驟', '過程', '操作', '程序', '方法'],
            diagram: ['示意圖', '解剖圖', '結構圖', '流程圖', '對比圖', '圖示'],
            comparison: ['比較', '對照', '差異', '區別', '對比'],
            example: ['範例', '案例', '實例', '樣本', '例子']
        };

        // 檢測段落是否包含圖片關鍵字
        const shouldInsertImage = (text) => {
            for (const [category, keywords] of Object.entries(imageKeywords)) {
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        return { category, keyword };
                    }
                }
            }
            return null;
        };

        // 清理 Markdown 符號函數（最終版）
        const cleanMarkdownSymbols = (text) => {
            // 移除 Markdown 標題符號 ##, ###, ####
            text = text.replace(/^#+\s+/, '');

            // 只移除粗體符號 **文字**（成對的雙星號）
            text = text.replace(/\*\*(.+?)\*\*/g, '$1');

            // 不移除單個 * （保留項目符號等）

            return text;
        };

        // 判斷是否為標題的 Regex (增強版 - 支援多層級)
        const patterns = {
            // 章節：第X章、Chapter X、PART X、壹、貳、參...
            chapter: /^(第[0-9一二三四五六七八九十]+[章節]|Chapter\s+\d+|PART\s+\d+|[壹貳參肆伍陸柒捌玖拾]+、)/i,
            // 三級小節：1.1.1、2.3.4 (必須在 subsection 之前檢查)
            subsubsection: /^(\d+\.\d+\.\d+)\s/,
            // 二級小節：1.1、2.3 (必須在 section 之前檢查)
            subsection: /^(\d+\.\d+)\s/,
            // 一級小節：1.、2.、A.、一、二、三...（排除括號編號）
            section: /^(第[0-9一二三四五六七八九十]+[節項]|\d+\.\s|[A-Z]\.\s|[一二三四五六七八九十]、)(?!\()/,
            // 列表項目（括號編號，不加入目錄）
            listItem: /^\(\d+\)|^[a-z]\)|^\d+\)|^[①②③④⑤⑥⑦⑧⑨⑩]/,
            keypoint: /^(重點|提示|注意|Keypoint|Note|Tip)[:：]/i,
            definition: /^(定義|名詞解釋|Definition)[:：]/i,
            // 目錄標題行
            tocHeader: /^(\*\*)?目[錄录](\*\*)?$/,
            // 目錄項目（文字 + 多個點或… + 數字）
            tocEntry: /^(.+?)[．.…]{3,}(\d+)$/
        };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // 處理分頁估算
            linesInPage++;
            if (linesInPage > LINES_PER_PAGE) {
                pageCounter++;
                linesInPage = 0;
            }

            // 0. 檢測目錄頁面開始
            if (patterns.tocHeader.test(line)) {
                inTocSection = true;
                continue;  // 跳過目錄標題
            }

            // 1. 在目錄區段內，跳過所有內容（直到遇到章節標題）
            if (inTocSection) {
                // 檢查是否遇到章節標題（目錄結束）
                if (patterns.chapter.test(line)) {
                    inTocSection = false;
                    // 不要 continue，讓下面的代碼處理這個章節標題
                } else {
                    // 還在目錄區段內，跳過這一行
                    continue;
                }
            }

            // 2. 章節 (Chapter)
            if (patterns.chapter.test(line) || line.startsWith('# ')) {
                let text = line.replace(/^#\s+/, '');
                text = cleanMarkdownSymbols(text);  // 清理 Markdown 符號
                structured.content.push({ type: 'chapter', text });
                // 如果 TOC 中還沒有這個章節（避免重複），才加入
                if (!structured.toc.some(item => item.text === text)) {
                    structured.toc.push({ level: 1, text, pageNumber: pageCounter });
                }
                currentChapter = text;
                continue;
            }

            // 3. 小節標題 (必須按照從最具體到最一般的順序檢查)

            // 3.1 三級小節 (1.1.1) - 不加入目錄（超過2層）
            if (patterns.subsubsection.test(line)) {
                let text = line.trim();
                text = cleanMarkdownSymbols(text);  // 清理 Markdown 符號
                structured.content.push({ type: 'subsubsection', text });
                // 三級標題不加入目錄（限制2層）
                continue;
            }

            // 3.2 二級小節 (1.1) - 不加入目錄（超過2層）
            if (patterns.subsection.test(line)) {
                let text = line.trim();
                text = cleanMarkdownSymbols(text);  // 清理 Markdown 符號
                structured.content.push({ type: 'subsection', text });
                // 二級小節不加入目錄（限制2層）
                continue;
            }

            // 3.3 檢查列表項目（括號編號）- 不加入目錄
            if (patterns.listItem.test(line)) {
                // 列表項目當成段落處理，不加入目錄
                const text = cleanMarkdownSymbols(line);
                structured.content.push({ type: 'paragraph', text });
                continue;
            }

            // 3.4 一級小節 (1.) - 加入目錄（level 2）
            const isShortLine = line.length < 30 && !/[。，？！]$/.test(line);
            if (patterns.section.test(line) || line.startsWith('## ') || (isShortLine && i > 0 && !lines[i - 1].trim())) {
                let text = line.replace(/^##\s+/, '');
                text = cleanMarkdownSymbols(text);  // 清理 Markdown 符號
                structured.content.push({ type: 'section', text });
                // 避免重複，只在 TOC 中沒有時才加入（level 2）
                if ((patterns.section.test(line) || line.startsWith('## ')) && !structured.toc.some(item => item.text === text)) {
                    structured.toc.push({ level: 2, text, pageNumber: pageCounter });
                }
                continue;
            }

            // 4. Tab 分隔表格檢測（改進版 - 允許空行）
            if (line.includes('\t')) {
                const tableLines = [line];
                let j = i + 1;

                // 收集所有包含 Tab 的連續行 (允許中間有空行)
                while (j < lines.length) {
                    const nextLine = lines[j].trim();

                    // 如果是空行,跳過但繼續檢查
                    if (!nextLine) {
                        j++;
                        continue;
                    }

                    // 如果包含 Tab,加入表格行
                    if (nextLine.includes('\t')) {
                        tableLines.push(nextLine);
                        j++;
                    } else {
                        // 遇到非 Tab 行,結束表格收集
                        break;
                    }
                }

                // 至少需要 2 行 (表頭 + 1 行資料)
                if (tableLines.length >= 2) {
                    const firstRow = tableLines[0].split('\t').map(h => h.trim()).filter(h => h);

                    // 智能判斷第一列是否為標題（改進版）
                    const isTableHeader = (headers) => {
                        // 檢查條件（放寬標準）：
                        // 1. 所有欄位都很短（< 15 字）
                        // 2. 或者包含常見的標題詞
                        // 3. 或者所有欄位都不包含句號、逗號等標點
                        const headerKeywords = [
                            '名稱', '項目', '說明', '內容', '類型', '用途', '價格', '數量',
                            '時間', '日期', '編號', '代碼', '工具', '產品', '方法', '步驟',
                            '材料', '設備', '器材', '規格', '型號', '品牌', '效果', '功能'
                        ];

                        const allShort = headers.every(h => h.length <= 15);
                        const hasKeyword = headers.some(h =>
                            headerKeywords.some(keyword => h.includes(keyword))
                        );
                        const noPunctuation = headers.every(h => !/[。，、；：]/.test(h));

                        // 如果符合任一條件，就認為是標題
                        return allShort && noPunctuation || hasKeyword;
                    };

                    let headers, rows, hasRealHeader;

                    if (isTableHeader(firstRow)) {
                        // 第一列是標題
                        headers = firstRow;
                        hasRealHeader = true;

                        // 其餘是資料行
                        rows = [];
                        for (let k = 1; k < tableLines.length; k++) {
                            const cells = tableLines[k].split('\t').map(c => c.trim());

                            // 補齊欄位數量 (避免欄位不對齊)
                            while (cells.length < headers.length) {
                                cells.push('');
                            }

                            // 只取前 N 個欄位 (N = headers.length)
                            const alignedCells = cells.slice(0, headers.length);

                            // 過濾掉全空的行
                            if (alignedCells.some(c => c)) {
                                rows.push(alignedCells);
                            }
                        }
                    } else {
                        // 第一列也是資料，所有行都是資料
                        headers = firstRow.map((_, i) => `欄位 ${i + 1}`);
                        hasRealHeader = false;

                        rows = [];
                        for (let k = 0; k < tableLines.length; k++) {  // 從 0 開始
                            const cells = tableLines[k].split('\t').map(c => c.trim());

                            while (cells.length < headers.length) {
                                cells.push('');
                            }

                            const alignedCells = cells.slice(0, headers.length);

                            if (alignedCells.some(c => c)) {
                                rows.push(alignedCells);
                            }
                        }
                    }

                    if (headers.length > 0 && rows.length > 0) {
                        structured.content.push({
                            type: 'table',
                            headers: headers,
                            rows: rows,
                            hasRealHeader: hasRealHeader  // 標記是否有真實標題
                        });
                        i = j - 1;
                        continue;
                    }
                }
            }

            // 5. 重點提示 (Keypoint)
            if (patterns.keypoint.test(line) || line.includes('💡')) {
                const text = line.replace(patterns.keypoint, '').replace('💡', '').trim();
                structured.content.push({ type: 'keypoint', text });
                continue;
            }

            // 6. 定義 (Definition)
            if (patterns.definition.test(line)) {
                const parts = line.split(/[:：]/);
                if (parts.length >= 2) {
                    structured.content.push({
                        type: 'definition',
                        term: parts[0].trim(),
                        definition: parts.slice(1).join('：').trim()
                    });
                    continue;
                }
            }

            // 7. Markdown 表格檢測 (| 格式)
            if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
                // 收集表格行
                const tableLines = [line];
                let j = i + 1;

                // 繼續收集後續的表格行 (包含 | 的行)
                while (j < lines.length && lines[j].trim().includes('|')) {
                    tableLines.push(lines[j].trim());
                    j++;
                }

                // 解析表格
                if (tableLines.length >= 2) {
                    const headers = tableLines[0]
                        .split('|')
                        .map(h => h.trim())
                        .filter(h => h.length > 0);

                    // 跳過分隔線
                    let dataStartIndex = 1;
                    if (tableLines[1].includes('---') || tableLines[1].includes('===')) {
                        dataStartIndex = 2;
                    }

                    const rows = [];
                    for (let k = dataStartIndex; k < tableLines.length; k++) {
                        const cells = tableLines[k]
                            .split('|')
                            .map(c => c.trim())
                            .filter(c => c.length > 0);

                        if (cells.length > 0) {
                            rows.push(cells);
                        }
                    }

                    if (headers.length > 0) {
                        structured.content.push({
                            type: 'table',
                            headers: headers,
                            rows: rows
                        });

                        // 跳過已處理的表格行
                        i = j - 1;
                        continue;
                    }
                }
            }

            // 8. 圖片標記
            if (line.includes('[IMAGE:') || line.includes('![圖片]') || line.includes('[建議：插入圖片')) {
                const desc = line.replace(/.*\[.*：/, '').replace(']', '');
                structured.content.push({
                    type: 'image',
                    description: desc || '教材圖片',
                    id: `img_${Date.now()}_${i}`
                });
                continue;
            }

            // 9. 處理列表項
            if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
                // 將列表項視為普通段落，但在前端可以透過 CSS 處理
                // 或者在這裡給它一個特殊的 type，目前先保持 paragraph 以免破壞現有結構
                structured.content.push({ type: 'paragraph', text: line });
                continue;
            }

            // 10. 一般段落 (Paragraph)
            const cleanedText = cleanMarkdownSymbols(line);  // 清理 Markdown 符號
            structured.content.push({ type: 'paragraph', text: cleanedText });

            // 智能圖片插入：檢測段落是否包含圖片關鍵字
            const imageMatch = shouldInsertImage(line);
            if (imageMatch) {
                // 檢查下一個元素是否已經是圖片（避免重複插入）
                const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
                const isNextLineImage = nextLine.includes('[IMAGE:') ||
                    nextLine.includes('![圖片]') ||
                    nextLine.includes('[建議：插入圖片');

                if (!isNextLineImage) {
                    structured.content.push({
                        type: 'image',
                        description: `建議插入${imageMatch.keyword}相關圖片`,
                        id: `img_auto_${Date.now()}_${i}`,
                        auto: true  // 標記為自動插入
                    });
                }
            }
        }

        return {
            success: true,
            structured: structured
        };
    }

    /**
     * 第一階段：AI 內容分析與建議
     */
    async analyzeContent(content) {
        try {
            // 檢查是否為 Demo 模式
            const demoCheck = this.checkDemoContent(content);
            if (demoCheck.isDemo) {
                return {
                    success: true,
                    suggestedContent: demoCheck.result,
                    isTruncated: false
                };
            }

            // ✨ 移除字數限制：所有內容都直接返回原文（第一階段不需要AI處理）
            // 第二階段會使用章節分段處理確保完整性
            return {
                success: true,
                suggestedContent: content,
                isTruncated: false
            };
        } catch (error) {
            console.error('分析內容錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 結構化內容（第二階段）
     * @param {string} content - 建議內容
     * @param {Function} onProgress - 進度回調函數 (message, progress)
     * @returns {Promise} - 結構化結果
     */
    async structureContent(content, onProgress = null) {
        try {
            // 檢查 Demo 標記
            if (content.includes('[DEMO_MARK]')) {
                return this.parseContentLocally(content);
            }

            // 速度優化：直接使用離線解析（後端已改為返回原文）
            if (onProgress) {
                onProgress('正在解析教材結構...', 70);
            }

            const result = await this.callBackend('structure', content);

            // 後端現在直接返回原文，我們在前端解析
            if (typeof result === 'string') {
                return this.parseContentLocally(result);
            }

            // 如果後端返回已結構化的物件（向後兼容）
            if (typeof result === 'object') {
                return { success: true, structured: result };
            }

        } catch (error) {
            console.error('結構化錯誤 (切換至離線模式):', error);
            return this.parseContentLocally(content);
        }
    }

    /**
     * 備用結構化方法
     */
    fallbackStructure(content) {
        return this.parseContentLocally(content);
    }

    /**
     * 完整的 AI 處理流程
     */
    async processContent(rawContent, onProgress) {
        try {
            if (onProgress) onProgress('正在分析內容...', 30);
            const analyzeResult = await this.analyzeContent(rawContent);

            if (!analyzeResult.success && !analyzeResult.suggestedContent) {
                throw new Error(analyzeResult.error);
            }

            if (onProgress) onProgress('正在生成結構化內容...', 70);
            // 注意：這裡我們確保將第一階段的內容 (可能是原始長文) 傳給第二階段
            const contentToStructure = analyzeResult.suggestedContent || rawContent;
            const structureResult = await this.structureContent(contentToStructure);

            if (!structureResult.success) {
                throw new Error(structureResult.error);
            }

            if (onProgress) onProgress('完成！', 100);

            return {
                success: true,
                suggestedContent: contentToStructure,
                structured: structureResult.structured
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
}
