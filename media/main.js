(() => {
    const vscode = acquireVsCodeApi();
    let allThemes = [];
    let currentStatus = 'not_set';

    function normalizeThemeId(themeName) {
        if (!themeName) {
            return '';
        }
        return themeName
            .replace(/["'`]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function findThemeByIdentifier(identifier) {
        const normalized = normalizeThemeId(identifier);
        if (!normalized) {
            return undefined;
        }
        return allThemes.find(theme => {
            return normalizeThemeId(theme.id) === normalized ||
                normalizeThemeId(theme.originalLabel) === normalized;
        });
    }
    
    // 初始化页面
    document.addEventListener('DOMContentLoaded', () => {
        // 通知 VS Code WebView 已准备好
        vscode.postMessage({
            command: 'webviewReady',
            timestamp: new Date().toISOString()
        });
        
        // 获取定时器状态
        vscode.postMessage({
            command: 'getTimerStatus'
        });
        
        // 设置事件监听器
        setupEventListeners();
        
        // 如果有初始配置，加载它
        if (window.initialConfig) {
            loadInitialConfig(window.initialConfig);
        }
    });
    
    // 加载初始配置
    function loadInitialConfig(config) {
        // 设置切换模式
        document.getElementById('switch-mode').value = config.switchMode || 'interval';
        toggleSwitchMode(config.switchMode || 'interval');
        
        // 设置时间间隔
        document.getElementById('switch-interval').value = config.switchInterval || 10;
        
        // 设置时间点
        setupTimeInputs(config.switchTimes || ['12:00']);
        
        // 设置状态
        currentStatus = config.status || 'not_set';
        updateStatusDisplay(currentStatus);
        
        // 更新当前主题显示
        updateCurrentThemeDisplay(window.initialConfig?.currentTheme || 'Unknown');
        
        // 请求主题列表
        vscode.postMessage({
            command: 'getThemes'
        });
    }
    
    // 切换模式显示
    function toggleSwitchMode(mode) {
        if (mode === 'interval') {
            document.getElementById('interval-section').style.display = 'block';
            document.getElementById('times-section').style.display = 'none';
        } else {
            document.getElementById('interval-section').style.display = 'none';
            document.getElementById('times-section').style.display = 'block';
        }
    }
    
    // 设置时间输入
    function setupTimeInputs(times) {
        const container = document.getElementById('time-inputs');
        // 清除现有的时间输入框，保留添加按钮
        const addButton = document.getElementById('add-time');
        container.innerHTML = '';
        container.appendChild(addButton);
        
        // 添加时间输入框
        for (const time of times) {
            addTimeInput(time);
        }
        
        // 如果没有时间，添加一个默认的
        if (times.length === 0) {
            addTimeInput('12:00');
        }
    }
    
    // 添加时间输入框
    function addTimeInput(time) {
        const container = document.getElementById('time-inputs');
        const addButton = document.getElementById('add-time');
        
        // 限制最多5个时间点
        const timeInputs = document.querySelectorAll('.switch-time');
        if (timeInputs.length >= 5) {
            return;
        }
            
        const div = document.createElement('div');
        div.className = 'time-input';
        
        const input = document.createElement('input');
        input.type = 'time';
        input.className = 'switch-time';
        if (time) {
            input.value = time;
        }
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'del';
        removeButton.addEventListener('click', () => {
            div.remove();
        });
        
        div.appendChild(input);
        div.appendChild(removeButton);
        
        // 插入到添加按钮之前
        container.insertBefore(div, addButton);
    }
    
    // 更新状态显示
    function updateStatusDisplay(status) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        const button = document.getElementById('toggle-status');
        
        // 移除所有状态类
        indicator.classList.remove('status-running', 'status-paused', 'status-not-set');
        
        switch(status) {
            case 'running':
                indicator.classList.add('status-running');
                text.textContent = 'Current Status: Running';
                button.textContent = 'Pause';
                button.disabled = false;
                break;
            case 'paused':
                indicator.classList.add('status-paused');
                text.textContent = 'Current Status: Paused';
                button.textContent = 'Start';
                button.disabled = false;
                break;
            default:
                indicator.classList.add('status-not-set');
                text.textContent = 'Current Status: Not Set';
                button.textContent = 'Start';
                button.disabled = true;
        }
    }
    
    // 更新当前主题显示
    function updateCurrentThemeDisplay(currentTheme) {
        const currentThemeName = document.getElementById('current-theme-name');
        if (currentThemeName) {
            const theme = findThemeByIdentifier(currentTheme);
            const displayName = theme ? theme.label : currentTheme || 'Unknown';
            currentThemeName.textContent = displayName;
        }
    }
    
    // 判断主题是白天还是夜晚
    function isDayTheme(themeLabel) {
        // 转换为小写以便比较
        const label = themeLabel.toLowerCase();
        
        // 常见的白天主题关键词
        const dayKeywords = ['light', 'day', 'white', 'bright', 'clear', 'sunny', 'light-colored', 'light-color', 'light-colour', 'light-coloured', '浅色', '白色', '明亮', '亮色', '亮色的', '浅色的'];
        
        // 常见的夜晚主题关键词
        const nightKeywords = ['dark', 'night', 'black', 'dim', 'deep', 'midnight', 'twilight', 'dark-colored', 'dark-color', 'dark-colour', 'dark-coloured', '深色', '黑色', '暗色', '暗色的', '深色的', '黑色的', 'dracula'];
        
        // 检查是否包含白天关键词
        for (const keyword of dayKeywords) {
            if (label.includes(keyword)) {
                return true;
            }
        }
        
        // 检查是否包含夜晚关键词
        for (const keyword of nightKeywords) {
            if (label.includes(keyword)) {
                return false;
            }
        }
        
        // 如果无法判断，按夜晚主题处理
        return false;
    }
    
    // 过滤主题
    function filterThemes(themes, selectedThemes, currentTheme, filterType, searchQuery) {
        const normalizedCurrent = normalizeThemeId(currentTheme);
        const selectedNormalized = new Set((selectedThemes || []).map(normalizeThemeId));
        const normalizedSearch = searchQuery ? searchQuery.toLowerCase() : '';

        return themes.filter(theme => {
            const themeIdNormalized = normalizeThemeId(theme.id);
            const themeLabelNormalized = normalizeThemeId(theme.originalLabel);
            switch (filterType) {
                case 'selected':
                    return selectedNormalized.has(themeIdNormalized) || selectedNormalized.has(themeLabelNormalized);
                case 'day':
                    return isDayTheme(theme.label);
                case 'night':
                    return !isDayTheme(theme.label);
                default:
                    return true;
            }
        }).filter(theme => {
            if (!normalizedSearch) {
                return true;
            }
            return theme.label.toLowerCase().includes(normalizedSearch);
        });
    }
    
    // 填充主题列表
    function populateThemes(themes, currentTheme, defaultTheme, selectedThemes) {
        const defaultThemeSelect = document.getElementById('default-theme');
        defaultThemeSelect.innerHTML = '';

        const normalizedDefault = normalizeThemeId(defaultTheme);
        const normalizedCurrent = normalizeThemeId(currentTheme);
        const selectedNormalized = new Set((selectedThemes || []).map(normalizeThemeId));

        for (const theme of themes) {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.label;
            option.dataset.originalLabel = theme.originalLabel;

            if (normalizedDefault && (normalizeThemeId(theme.id) === normalizedDefault || normalizeThemeId(theme.originalLabel) === normalizedDefault)) {
                option.selected = true;
            } else if (!normalizedDefault && normalizedCurrent && (normalizeThemeId(theme.id) === normalizedCurrent || normalizeThemeId(theme.originalLabel) === normalizedCurrent)) {
                option.selected = true;
            }

            defaultThemeSelect.appendChild(option);
        }

        const filterType = document.querySelector('input[name="themeFilter"]:checked')?.value || 'all';
        const searchQuery = document.getElementById('themeSearch')?.value || '';

        const filteredThemes = filterThemes(themes, selectedThemes, currentTheme, filterType, searchQuery);

        const themeList = document.getElementById('theme-list');
        themeList.innerHTML = '';

        for (const theme of filteredThemes) {
            const div = document.createElement('div');
            div.className = 'theme-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = theme.id;
            checkbox.id = `theme-${theme.id}`;
            checkbox.dataset.originalLabel = theme.originalLabel;

            const themeIdNormalized = normalizeThemeId(theme.id);
            const themeLabelNormalized = normalizeThemeId(theme.originalLabel);
            if (selectedNormalized.has(themeIdNormalized) || selectedNormalized.has(themeLabelNormalized)) {
                checkbox.checked = true;
            }

            // 添加复选框状态变化监听器
            checkbox.addEventListener('change', () => {
                // 实时更新配置中的选中主题列表
                const currentSelectedThemes = getCurrentSelectedThemes();
                if (window.initialConfig) {
                    window.initialConfig.switchThemes = currentSelectedThemes;
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `theme-${theme.id}`;
            label.textContent = theme.label;

            const isCurrentTheme = normalizedCurrent && (themeIdNormalized === normalizedCurrent || themeLabelNormalized === normalizedCurrent);
            if (isCurrentTheme) {
                div.classList.add('current-theme-item');
                checkbox.classList.add('current-theme-checkbox');
                label.classList.add('current-theme-label');
                label.title = 'Current Theme';
                const badge = document.createElement('span');
                badge.className = 'current-theme-badge';
                badge.textContent = ' (Current Theme)';
                label.appendChild(badge);
            }

            div.appendChild(checkbox);
            div.appendChild(label);
            themeList.appendChild(div);
        }
        
        // 显示设置容器，隐藏加载提示
        document.getElementById('loading').style.display = 'none';
        document.getElementById('settings-container').style.display = 'block';
        
        // 更新当前主题显示
        updateCurrentThemeDisplay(currentTheme);
    }
    
    // 获取当前选中的主题列表
    function getCurrentSelectedThemes() {
        const selectedThemes = [];

        // 获取当前过滤器设置
        const currentFilter = document.querySelector('input[name="themeFilter"]:checked')?.value || 'all';

        if (currentFilter === 'all') {
            // 如果当前是 "all" 视图，直接从当前显示的复选框获取
            const checkboxes = document.querySelectorAll('#theme-list input[type="checkbox"]:checked');
            for (const checkbox of checkboxes) {
                const originalLabel = checkbox.dataset?.originalLabel;
                const resolvedTheme = originalLabel || checkbox.value;
                const themeInfo = findThemeByIdentifier(resolvedTheme);
                const finalThemeName = themeInfo ? themeInfo.originalLabel : resolvedTheme;
                if (finalThemeName) {
                    selectedThemes.push(finalThemeName);
                }
            }
        } else {
            // 如果当前不是 "all" 视图，需要从所有主题中检查哪些被选中
            // 这种情况下，我们需要保持现有的选中状态，并加上当前视图中的更改
            const currentConfig = window.initialConfig?.switchThemes || [];
            const currentViewSelected = new Set();

            // 获取当前视图中选中的主题
            const checkboxes = document.querySelectorAll('#theme-list input[type="checkbox"]:checked');
            for (const checkbox of checkboxes) {
                const originalLabel = checkbox.dataset?.originalLabel;
                const resolvedTheme = originalLabel || checkbox.value;
                const themeInfo = findThemeByIdentifier(resolvedTheme);
                const finalThemeName = themeInfo ? themeInfo.originalLabel : resolvedTheme;
                if (finalThemeName) {
                    currentViewSelected.add(finalThemeName);
                }
            }

            // 获取当前视图中未选中的主题
            const currentViewUnselected = new Set();
            const allCheckboxes = document.querySelectorAll('#theme-list input[type="checkbox"]:not(:checked)');
            for (const checkbox of allCheckboxes) {
                const originalLabel = checkbox.dataset?.originalLabel;
                const resolvedTheme = originalLabel || checkbox.value;
                const themeInfo = findThemeByIdentifier(resolvedTheme);
                const finalThemeName = themeInfo ? themeInfo.originalLabel : resolvedTheme;
                if (finalThemeName) {
                    currentViewUnselected.add(finalThemeName);
                }
            }

            // 合并：保留原有选中的主题（除了当前视图中被取消选中的），加上当前视图中新选中的
            for (const theme of currentConfig) {
                if (!currentViewUnselected.has(theme)) {
                    selectedThemes.push(theme);
                }
            }

            // 添加当前视图中新选中的主题
            for (const theme of currentViewSelected) {
                if (!selectedThemes.includes(theme)) {
                    selectedThemes.push(theme);
                }
            }
        }

        return selectedThemes;
    }

    // 更新主题列表显示
    function updateThemeListDisplay() {
        if (window.initialConfig && allThemes.length > 0) {
            // 获取当前实际选中的主题（从DOM中读取）
            const currentSelectedThemes = getCurrentSelectedThemes();

            // 如果有选中的主题，更新配置
            if (currentSelectedThemes.length > 0) {
                window.initialConfig.switchThemes = currentSelectedThemes;
            }

            populateThemes(
                allThemes,
                window.initialConfig.currentTheme,
                window.initialConfig.defaultTheme,
                window.initialConfig.switchThemes || []
            );
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 切换模式
        document.getElementById('switch-mode').addEventListener('change', (event) => {
            toggleSwitchMode(event.target.value);
        });
        
        // 添加时间点
        document.getElementById('add-time').addEventListener('click', () => {
            addTimeInput();
        });
        
        // 保存设置
        document.getElementById('save-settings').addEventListener('click', () => {
            saveSettings();
        });
        
        // 切换状态
        document.getElementById('toggle-status').addEventListener('click', () => {
            toggleStatus();
            currentStatus = currentStatus === 'running' ? 'paused' : 'running';
            //更新显示状态
            updateStatusDisplay(currentStatus);
        });
        
        // 过滤条件变化
        const filterRadios = document.querySelectorAll('input[name="themeFilter"]');
        for (const radio of filterRadios) {
            radio.addEventListener('change', updateThemeListDisplay);
        }
        
        // 搜索输入变化
        document.getElementById('themeSearch').addEventListener('input', updateThemeListDisplay);
    }
    
    // 自定义通知系统
    function showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in forwards';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, duration);
        
        return notification;
    }
    
    // 保存设置
    function saveSettings() {
        const defaultThemeSelect = document.getElementById('default-theme');
        let defaultTheme = '';
        if (defaultThemeSelect && defaultThemeSelect.selectedIndex >= 0) {
            const selectedOption = defaultThemeSelect.options[defaultThemeSelect.selectedIndex];
            const originalLabel = selectedOption?.dataset?.originalLabel;
            defaultTheme = originalLabel || selectedOption?.value || '';
        }

        // 获取选中的主题
        const selectedThemeSet = new Set();
        for (const checkbox of document.querySelectorAll('#theme-list input[type="checkbox"]:checked')) {
            const datasetLabel = checkbox.dataset?.originalLabel;
            const resolvedTheme = datasetLabel || checkbox.value;
            const themeInfo = findThemeByIdentifier(resolvedTheme);
            const finalThemeName = themeInfo ? themeInfo.originalLabel : resolvedTheme;
            if (finalThemeName) {
                selectedThemeSet.add(finalThemeName);
            }
        }

        const selectedThemes = Array.from(selectedThemeSet);

        // 确保至少选择了一个主题
        if (selectedThemes.length === 0) {
            // 替换 alert 为 VS Code 消息
            vscode.postMessage({
                command: 'showMessage',
                type: 'warning',
                message: 'Please select at least one theme in the theme list'
            });
            return;
        }
        
        // 获取切换模式，将字符串转为枚举值
        const switchMode = document.getElementById('switch-mode').value === 'interval' ? 'interval' : 'time';

        // 获取时间间隔
        const intervalInput = document.getElementById('switch-interval');
        let switchInterval = Number.parseInt(intervalInput.value, 10);
        if (!Number.isFinite(switchInterval) || switchInterval <= 0) {
            const fallbackInterval = (window.initialConfig && Number.isFinite(window.initialConfig.switchInterval) && window.initialConfig.switchInterval > 0)
                ? window.initialConfig.switchInterval
                : 30;
            intervalInput.value = fallbackInterval.toString();
            vscode.postMessage({
                command: 'showMessage',
                type: 'warning',
                message: 'Please enter a switch interval greater than 0 minutes'
            });
            intervalInput.focus();
            return;
        }

        // 获取时间点
        const switchTimes = [];
        for (const input of document.querySelectorAll('.switch-time')) {
            if (input.value) {
                switchTimes.push(input.value);
            }
        }
        
        // 确保时间模式下至少有一个时间点
        if (switchMode === 'time' && switchTimes.length === 0) {
            // 替换 alert 为 VS Code 消息
            vscode.postMessage({
                command: 'showMessage',
                type: 'warning',
                message: 'Please set at least one time point for time-based theme switching'
            });
            return;
        }
        
        // 设置状态为运行中，将字符串转为枚举值
        const status = currentStatus === 'not_set' ? 'not_set' : currentStatus;
        
        if (!window.initialConfig) {
            window.initialConfig = {};
        }
        window.initialConfig.defaultTheme = defaultTheme;
        window.initialConfig.switchThemes = selectedThemes;
        window.initialConfig.switchInterval = switchInterval;
        window.initialConfig.switchTimes = switchTimes;
        window.initialConfig.switchMode = switchMode;
        window.initialConfig.status = status;

        // 发送保存请求
        vscode.postMessage({
            command: 'saveSettings',
            settings: {
                defaultTheme,
                switchThemes: selectedThemes,
                switchInterval,
                switchTimes,
                switchMode,
                status
            }
        });
        
        showNotification('Saving settings...', 'info', 2000);
    }
    
    // 切换状态
    function toggleStatus() {
        vscode.postMessage({
            command: 'toggleStatus'
        });
    }
    
    // 监听来自 VS Code 的消息
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'themeList':
                allThemes = message.themes;
                // 如果有保存的配置，使用它
                if (message.savedConfig) {
                    populateThemes(
                        allThemes, 
                        message.currentTheme || window.initialConfig?.currentTheme, 
                        message.savedConfig.defaultTheme, 
                        message.savedConfig.switchThemes || []
                    );
                } else if (window.initialConfig) {
                    populateThemes(
                        allThemes, 
                        window.initialConfig.currentTheme, 
                        window.initialConfig.defaultTheme, 
                        window.initialConfig.switchThemes || []
                    );
                }
                break;
                
            case 'configUpdate':
                // 更新配置
                if (message.config) {
                    loadInitialConfig(message.config);
                }
                break;
                
            case 'timerStatus':
                // 更新状态
                currentStatus = message.status;
                updateStatusDisplay(currentStatus);
                break;
                
            case 'saveSuccess':
                showNotification('Settings saved successfully!', 'info', 3000);
                break;
                
            case 'saveFailed':
                showNotification(`Failed to save settings: ${message.error}`, 'error', 5000);
                break;
                
            case 'notification':
                showNotification(message.text, message.notificationType || 'info', message.duration || 3000);
                break;
        }
    });
})();
