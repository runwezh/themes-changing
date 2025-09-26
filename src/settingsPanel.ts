import * as vscode from 'vscode';
import { SwitchMode, SwitchStatus } from './types';
import * as fs from 'node:fs';
import type { ThemeSwitcher } from './extension';

// 添加配置数据接口
interface ConfigData {
    defaultTheme: string | undefined;
    switchThemes: string[];
    switchInterval: number;
    switchTimes: string[];
    switchMode: SwitchMode;
    status: SwitchStatus;
    currentTheme: string;
}

interface ThemeInfo {
    id: string;
    label: string;
    description?: string;
    extension: string;
    originalLabel: string;
}

export class SettingsPanel {
    private static readonly viewType = 'themesChanging.settingsPanel';
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _themeSwitcher: ThemeSwitcher;
    private _disposables: vscode.Disposable[] = [];

    public static async createOrShow(extensionUri: vscode.Uri, themeSwitcher: ThemeSwitcher) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            SettingsPanel.viewType,
            '主题切换设置',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri, themeSwitcher);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, themeSwitcher: ThemeSwitcher) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._themeSwitcher = themeSwitcher;

        this._update();
        
        this._setWebviewMessageListener(this._panel.webview);
        
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    private async _update() {
        try {
            const config = await this._loadSavedConfig();
            const webview = this._panel.webview;
            webview.html = await this._getWebviewContent(config);
        } catch (error) {
            vscode.window.showErrorMessage(`Error updating panel: ${error}`);
        }
    }

    private async _loadSavedConfig(): Promise<ConfigData> {
        const config = vscode.workspace.getConfiguration('themesChanging');
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const currentTheme = workbenchConfig.get('colorTheme') as string;
                    
        return {
            defaultTheme: config.get('defaultTheme') || currentTheme,
            switchThemes: config.get('switchThemes') || [],
            switchInterval: config.get('switchInterval') || 30,
            switchTimes: config.get('switchTimes') || ['12:00:00'],
            switchMode: (config.get('switchMode') as SwitchMode) || SwitchMode.Interval,
            status: (config.get('status') as SwitchStatus) || SwitchStatus.NotSet,
            currentTheme: currentTheme
        };
    }

    private async _getWebviewContent(config: ConfigData) {
        const webview = this._panel.webview;
        
        // 创建安全的资源 URI
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const nonce = this._getNonce();
        const cspMeta = `    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; media-src ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource} http://localhost:8097; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; connect-src ${webview.cspSource} https: http://localhost:8097;">`;
        
        // 读取 HTML 文件
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'simpleWebview.html');
        let htmlContent = await fs.promises.readFile(htmlPath.fsPath, 'utf8');
        
        // 注入配置数据
        const configScript = `
            <script nonce="${nonce}">
                window.initialConfig = ${JSON.stringify(config)};
            </script>
        `;
        
        // 将配置注入到 HTML 中的占位符位置
        htmlContent = htmlContent.replace('// CONFIGURATION_PLACEHOLDER', configScript);

        // 插入 CSP Meta 标签
        htmlContent = htmlContent.replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${cspMeta}`);

        // 替换 main.js 的相对路径为安全的 WebView URI
        htmlContent = htmlContent.replace('src="main.js"', `nonce="${nonce}" src="${scriptUri}"`);

        return htmlContent;
    }

    private _getNonce(): string {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getStatusText(status: SwitchStatus): string {
        switch(status) {
            case SwitchStatus.NotSet: return 'Not Set';
            case SwitchStatus.Running: return 'Running';
            case SwitchStatus.Paused: return 'Paused';
            default: return 'Unknown';
        }
    }

    private _getStatusDetails(status: SwitchStatus, mode: string, interval: number, times: string[]): string {
        if (status === SwitchStatus.NotSet) {
            return 'Theme switching has not been configured yet.';
        } 
        if (status === SwitchStatus.Paused) {
            return 'Theme switching is currently paused. Press Resume to start again.';
        }
        
        if (mode === 'interval') {
            return `Switching themes every ${interval} minutes.`;
        }
        return `Switching themes daily at: ${times.join(', ')}.`;
    }

    private async _getAllThemes(): Promise<ThemeInfo[]> {
        try {
            const themes: ThemeInfo[] = [];
            
            // 添加内置主题
            themes.push(
                { 
                    id: 'Default Dark+', 
                    label: 'Default Dark+', 
                    description: 'Built-in Dark Theme',
                    extension: 'vscode.built-in',
                    originalLabel: 'Default Dark+'
                },
                { 
                    id: 'Default Light+', 
                    label: 'Default Light+', 
                    description: 'Built-in Light Theme',
                    extension: 'vscode.built-in',
                    originalLabel: 'Default Light+'
                }
            );
            
            // 从扩展中获取主题
            for (const extension of vscode.extensions.all) {
                const contributes = extension.packageJSON?.contributes;
                if (!contributes?.themes) {
                    continue;
                }
                
                for (const theme of contributes.themes) {
                    // 保存原始标签
                    const originalLabel = theme.label;
                    
                    // 处理主题ID和标签
                    const themeId = this._sanitizeThemeId(theme.id || theme.label);
                    const displayLabel = this._getDisplayLabel(theme.label, extension.id);
                    
                    themes.push({
                        id: themeId,
                        label: displayLabel,
                        description: theme.description,
                        extension: extension.id,
                        originalLabel: originalLabel
                    });
                }
            }
            
            // 去重并排序
            const uniqueThemes = this._removeDuplicateThemes(themes);
            return uniqueThemes;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get theme list: ${error}`);
            return [];
        }
    }

    private _sanitizeThemeId(id: string): string {
        if (!id) {
            return '';
        }
        
        // 处理特殊字符，但保留中文字符
        return id
            .replace(/['"`]/g, '') // 移除引号
            .replace(/\s+/g, ' ')  // 规范化空格
            .trim();
    }

    private _getDisplayLabel(label: string, extensionId: string): string {
        // 如果标签已经包含括号中的说明，则直接返回
        if (label.includes('(') && label.includes(')')) {
            return label;
        }
        
        // 从扩展ID中提取发布者和扩展名
        const [, name] = extensionId.split('.');
        
        // 对于特殊情况的处理
        if (extensionId.startsWith('vscode.')) {
            // VS Code 内置主题不需要额外标记
            return label;
        }
        
        // 为第三方主题添加扩展信息
        return `${label} (${name})`;
    }

    private _removeDuplicateThemes(themes: ThemeInfo[]): ThemeInfo[] {
        const themeMap = new Map<string, ThemeInfo>();
        
        for (const theme of themes) {
            const key = theme.id.toLowerCase(); // 使用小写ID作为键以避免大小写导致的重复
            
            // 如果已存在相同ID的主题，优先保留内置主题
            if (!themeMap.has(key) || 
                (theme.extension.startsWith('vscode.') && !themeMap.get(key)?.extension.startsWith('vscode.'))) {
                themeMap.set(key, theme);
            }
        }
        
        // 按照特定规则排序
        return Array.from(themeMap.values())
            .sort((a, b) => {
                // 内置主题优先
                if (a.extension.startsWith('vscode.') !== b.extension.startsWith('vscode.')) {
                    return a.extension.startsWith('vscode.') ? -1 : 1;
                }
                
                // 中文主题排在最后
                const aIsChinese = /[\u4e00-\u9fa5]/.test(a.label);
                const bIsChinese = /[\u4e00-\u9fa5]/.test(b.label);
                if (aIsChinese !== bIsChinese) {
                    return aIsChinese ? 1 : -1;
                }
                
                // 其他情况按字母顺序排序
                return a.label.localeCompare(b.label);
            });
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (message: { 
                command: string; 
                settings?: ConfigData;
                timestamp?: string;
                type?: string;
                message?: string;
            }) => {
                // 处理来自WebView的消息
                if (!message || !message.command) {
                    return;
                }

                switch (message.command) {
                    case 'ready':
                        // WebView准备就绪
                        break;
                    case 'getThemes':
                        // WebView请求获取主题列表
                        try {
                            const themes = await this._getAllThemes();
                            webview.postMessage({ 
                                type: 'themeList', 
                                themes 
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to get theme list: ${error}`);
                        }
                        break;
                    case 'saveSettings':
                        // 保存设置
                        try {
                            if (message.settings) {
                                // 在接收 WebView 消息时进行转换
                                const switchModeStr = message.settings.switchMode as string;
                                const switchMode = switchModeStr === 'interval' ? SwitchMode.Interval : SwitchMode.Time;

                                const statusStr = message.settings.status as string;
                                let status: SwitchStatus;
                                switch(statusStr) {
                                    case 'running': status = SwitchStatus.Running; break;
                                    case 'paused': status = SwitchStatus.Paused; break;
                                    default: status = SwitchStatus.NotSet;
                                }

                                await this._handleSaveSettings({
                                    ...message.settings,
                                    switchMode,
                                    status
                                });
                            } else {
                                vscode.window.showErrorMessage('Failed to save settings: No valid settings data provided');
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error while saving configuration: ${error}`);
                        }
                        break;
                    case 'toggleStatus':
                        // 切换状态
                        try {
                            await vscode.commands.executeCommand('themes-changing.toggleStatus');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error while toggling status: ${error}`);
                        }
                        break;
                    case 'showMessage':
                        // 处理消息显示请求
                        if (message.type === 'warning') {
                            vscode.window.showWarningMessage(message.message || '');
                        } else if (message.type === 'error') {
                            vscode.window.showErrorMessage(message.message || '');
                        } else {
                            vscode.window.showInformationMessage(message.message || '');
                        }
                        break;
                    case 'debug':
                        // 调试消息，仅在开发时使用
                        break;
                    default:
                        // 未知命令
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private _validateSettings(config: ConfigData): string | null {
        if (!config.defaultTheme || config.defaultTheme.trim() === '') {
            return 'Default theme cannot be empty!';
        }
        if (!Array.isArray(config.switchThemes)) {
            return 'Theme switch list is invalid!';
        }
        // 需要知道当前配置是哪种切换模式，按时间间隔还是按时间点
        if (config.switchMode === SwitchMode.Time && config.switchTimes.length === 0) {
            return 'Switch time list cannot be empty! Please set at least one switch time!';
        }
        if (config.switchMode === SwitchMode.Interval) {
            if (!Number.isFinite(config.switchInterval) || config.switchInterval <= 0) {
                return 'Switch interval must be greater than 0!';
            }
        }
        if (![SwitchMode.Interval, SwitchMode.Time].includes(config.switchMode)) {
            return 'Switch mode is invalid, must be "interval" or "time"!';
        }
        if (![SwitchStatus.NotSet, SwitchStatus.Running, SwitchStatus.Paused].includes(config.status)) {
            return 'Status is invalid!';
        }
        return null;
    }

    private async _handleSaveSettings(config: ConfigData) {
        try {
            // 数据校验
            const validationError = this._validateSettings(config);
            if (validationError) {
                vscode.window.showWarningMessage(`Settings validation error: ${validationError}`);
                return;
            }

            const vsCodeConfig = vscode.workspace.getConfiguration('themesChanging');
            if (config.status === SwitchStatus.NotSet) {
                config.status = SwitchStatus.Running;
            }

            // 保存每个配置项
            const updates = [
                vsCodeConfig.update('defaultTheme', config.defaultTheme, vscode.ConfigurationTarget.Global),
                vsCodeConfig.update('switchThemes', config.switchThemes, vscode.ConfigurationTarget.Global),
                vsCodeConfig.update('switchInterval', config.switchInterval, vscode.ConfigurationTarget.Global),
                vsCodeConfig.update('switchTimes', config.switchTimes, vscode.ConfigurationTarget.Global),
                vsCodeConfig.update('switchMode', config.switchMode, vscode.ConfigurationTarget.Global),
                vsCodeConfig.update('status', config.status, vscode.ConfigurationTarget.Global)
            ];

            // 等待所有配置更新完成
            await Promise.all(updates);
            
            // 如果默认主题已更改或者与当前主题不同，更新全局主题配置
            const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
            if (config.defaultTheme !== vsCodeConfig.get('defaultTheme') || currentTheme !== config.defaultTheme) {
                await vscode.workspace.getConfiguration('workbench').update('colorTheme', config.defaultTheme, vscode.ConfigurationTarget.Global);
            }
            
            // 重要：通知 ThemeSwitcher 更新定时器
            if (this._themeSwitcher) {
                // 根据状态和模式重启定时器
                if (config.status === SwitchStatus.Running) {
                    // 停止现有定时器
                    await this._themeSwitcher.stopScheduler();
                    
                    // 使用新配置重启定时器
                    if (config.switchMode === SwitchMode.Interval) {
                        await this._themeSwitcher.startIntervalScheduler(config.switchInterval, config.switchThemes);
                    } else if (config.switchMode === SwitchMode.Time) {
                        await this._themeSwitcher.startTimeScheduler(config.switchTimes, config.switchThemes);
                    }
                    // 确保定时器当前状态为running
                    this._themeSwitcher.setStatus(config.status);
                    // 发送当前状态到WebView
                    this._panel.webview.postMessage({ type: 'timerStatus', status: config.status });
            
                    vscode.window.showInformationMessage('Theme switching timer has been updated and started!');
                } else if (config.status === SwitchStatus.Paused) {
                    // 确保定时器已停止
                    await this._themeSwitcher.stopScheduler();
                    vscode.window.showInformationMessage('Theme switching has been paused!');
                }
            } else {
                vscode.window.showWarningMessage('Unable to access theme switcher, please restart VS Code to apply changes.');
            }
            
            vscode.window.showInformationMessage('Settings have been saved successfully!');
            
        } catch (error) {
            vscode.window.showErrorMessage(`Error saving configuration: ${error}`);
        }
    }

    private async _sendDefaultThemes(webview: vscode.Webview, savedConfig?: ConfigData) {
        try {
        // 默认主题列表
        const defaultThemes = [
            { id: 'Default Dark+', label: 'Default Dark+', description: 'VS Code Built-in Theme' },
            { id: 'Default Light+', label: 'Default Light+', description: 'VS Code Built-in Theme' },
            { id: 'Visual Studio Dark', label: 'Visual Studio Dark', description: 'VS Code Built-in Theme' },
            { id: 'Visual Studio Light', label: 'Visual Studio Light', description: 'VS Code Built-in Theme' },
            { id: 'High Contrast', label: 'High Contrast', description: 'VS Code Built-in Theme' },
            { id: 'Monokai', label: 'Monokai', description: 'VS Code Built-in Theme' },
            { id: 'Solarized Dark', label: 'Solarized Dark', description: 'VS Code Built-in Theme' },
            { id: 'Solarized Light', label: 'Solarized Light', description: 'VS Code Built-in Theme' },
        ];
        
            // 发送主题列表到WebView
            webview.postMessage({ 
                type: 'themeList', 
                themes: defaultThemes,
                savedConfig: savedConfig || await this._loadSavedConfig()
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error sending default theme list: ${error}`);
        }
    }

    private _getSwitchTimes(config: vscode.WorkspaceConfiguration): string[] {
        let switchTimes = config.get<string[]>('switchTimes') || [];
        
        // 支持旧版单一时间格式
        if (switchTimes.length === 0) {
            const legacyTime = config.get<string>('switchTime');
            if (legacyTime) {
                switchTimes = [legacyTime];
            }
        }
        
        // 确保至少有一个时间点
        if (switchTimes.length === 0) {
            switchTimes = ['12:00:00'];
        }
        
        return switchTimes;
    }

    private _getDefaultSimpleWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Switcher Settings</title>
    <style>
        body { 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .error-message {
            color: var(--vscode-errorForeground);
            padding: 20px;
            text-align: center;
            border: 1px solid var(--vscode-errorForeground);
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="error-message">
        <h2>Settings Page Failed to Load</h2>
        <p>Unable to load the complete settings page. Please check the following issues:</p>
        <ul>
            <li>Ensure the extension is installed correctly</li>
            <li>Check if the extension ID is correct</li>
            <li>View the console output in the developer tools</li>
        </ul>
    </div>
</body>
</html>`;
    }
}
