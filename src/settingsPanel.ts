import * as vscode from 'vscode';
import { SwitchMode, SwitchStatus } from './types';
import * as fs from 'fs';
import { ThemeSwitcher } from './extension';

// 添加配置数据接口
interface ConfigData {
    defaultTheme: string | undefined;
    switchThemes: string[];
    switchInterval: number;
    switchTimes: string[];
    switchMode: SwitchMode;
    status: SwitchStatus;
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
            vscode.window.showErrorMessage(`更新面板时出错: ${error}`);
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
            status: (config.get('status') as SwitchStatus) || SwitchStatus.NotSet
        };
    }

    private async _getWebviewContent(config: any) {
        const webview = this._panel.webview;
        // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        // const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
        
        // 读取 HTML 文件并注入配置
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'simpleWebview.html');
        let htmlContent = await fs.promises.readFile(htmlPath.fsPath, 'utf8');
        
        // 注入配置数据
        const configScript = `
            <script>
                window.initialConfig = ${JSON.stringify(config)};
            </script>
        `;
        
        // 将配置注入到 HTML 中的占位符位置
        htmlContent = htmlContent.replace('// CONFIGURATION_PLACEHOLDER', configScript);
        
        return htmlContent;
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
        } else if (status === SwitchStatus.Paused) {
            return 'Theme switching is currently paused. Press Resume to start again.';
        } else {
            if (mode === 'interval') {
                return `Switching themes every ${interval} minutes.`;
            } else {
                return `Switching themes daily at: ${times.join(', ')}.`;
            }
        }
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
            vscode.window.showErrorMessage(`获取主题列表失败: ${error}`);
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
        const [publisher, name] = extensionId.split('.');
        
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

    // 修改 _setWebviewMessageListener 方法
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (message: { 
                command: string; 
                settings?: ConfigData;  // 使用 ConfigData 接口替代内联类型定义
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
                            vscode.window.showErrorMessage(`获取主题列表失败: ${error}`);
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
                                vscode.window.showErrorMessage('保存设置失败：未提供有效的设置数据');
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(`保存配置时出错: ${error}`);
                        }
                        break;
                    case 'toggleStatus':
                        // 切换状态
                        try {
                            await vscode.commands.executeCommand('themes-changing.toggleStatus');
                        } catch (error) {
                            vscode.window.showErrorMessage(`切换状态时出错: ${error}`);
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

    // 修改 _validateSettings 方法
    private _validateSettings(config: ConfigData): string | null {
        if (!config.defaultTheme || config.defaultTheme.trim() === '') {
            return '默认主题不能为空！';
        }
        if (!Array.isArray(config.switchThemes)) {
            return '切换主题列表无效！';
        }
        // 需要知道当前配置是哪种切换模式，按时间间隔还是按时间点
        if (config.switchMode === SwitchMode.Time && config.switchTimes.length === 0) {
            return '切换时间列表不能为空！请至少设置一个切换时间！';
        }
        if (config.switchMode === SwitchMode.Interval && config.switchInterval <= 0) {
            return '切换间隔时间必须大于0！';
        }
        if (![SwitchMode.Interval, SwitchMode.Time].includes(config.switchMode)) {
            return '切换模式无效，只能为 "interval" 或 "time"！';
        }
        if (![SwitchStatus.NotSet, SwitchStatus.Running, SwitchStatus.Paused].includes(config.status)) {
            return '状态无效！';
        }
        return null;
    }

    // 修改 _handleSaveSettings 方法
    private async _handleSaveSettings(config: ConfigData) {
        try {
            // 进行数据校验，返回错误提示信息或 null
            const validationError = this._validateSettings(config);
            if (validationError) {
                vscode.window.showWarningMessage(`设置校验错误：${validationError}`);
                return;
            }

            const vsCodeConfig = vscode.workspace.getConfiguration('themesChanging');
            // 如果状态是not_set，则设置为running,并且让定时器开始跑起来
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
            
                    vscode.window.showInformationMessage('主题切换定时器已更新并已启动！');
                } else if (config.status === SwitchStatus.Paused) {
                    // 确保定时器已停止
                    await this._themeSwitcher.stopScheduler();
                    vscode.window.showInformationMessage('主题切换已暂停！');
                }
            } else {
                vscode.window.showWarningMessage('无法访问主题切换器，请重启 VS Code 以应用更改。');
            }
            
            vscode.window.showInformationMessage('设置已成功保存！');
            
        } catch (error) {
            vscode.window.showErrorMessage(`保存配置时出错: ${error}`);
        }
    }

    // 修改 _sendDefaultThemes 方法，添加保存的配置参数
    private async _sendDefaultThemes(webview: vscode.Webview, savedConfig?: any) {
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
                savedConfig: savedConfig || this._loadSavedConfig()
            });
        } catch (error) {
            vscode.window.showErrorMessage(`发送默认主题列表时出错: ${error}`);
        }
    }

    // 新增方法：校验设置数据，格式正确返回 null，否则返回错误提示信息
    // private _validateSettings(message: {
    //     defaultTheme: string;
    //     switchThemes: string[];
    //     switchInterval: number;
    //     switchTimes: string[];
    //     switchMode: string;
    //     status: string;
    // }): string | null {
    //     if (!message.defaultTheme || message.defaultTheme.trim() === '') {
    //         return '默认主题不能为空！';
    //     }
    //     if (!Array.isArray(message.switchThemes)) {
    //         return '切换主题列表无效！';
    //     }
    //     // 需要知道当前配置是哪种切换模式，按时间间隔还是按时间点，如果按时间间隔则校验间隔时间数值必须大于0，如果按时间点则必须要有至少1个时间点
    //     if (message.switchMode === 'time' && message.switchTimes.length === 0) {
    //         return '切换时间列表不能为空！请至少设置一个切换时间！';
    //     }
    //     if (message.switchMode === 'interval' && message.switchInterval <= 0) {
    //         return '切换间隔时间必须大于0！';
    //     }
    //     if (!['interval', 'time'].includes(message.switchMode)) {
    //         return '切换模式无效，只能为 "interval" 或 "time"！';
    //     }
    //     if (!message.status || !['not_set', 'Running', 'Paused'].includes(message.status)) {
    //         return '状态无效！';
    //     }
    //     return null;
    // }
    
    // 修改 _handleSaveSettings 方法，增加数据校验并给出友好提示
    // private async _handleSaveSettings(message: {
    //     defaultTheme: string;
    //     switchThemes: string[];
    //     switchInterval: number;
    //     switchTimes: string[];
    //     switchMode: string;
    //     status: string;
    // }) {
    //     try {
    //         // 进行数据校验，返回错误提示信息或 null
    //         const validationError = this._validateSettings(message);
    //         if (validationError) {
    //             vscode.window.showWarningMessage(`设置校验错误：${validationError}`);
    //             return;
    //         }
    
    //         const config = vscode.workspace.getConfiguration('themesChanging');
            
    //         // 保存每个配置项
    //         const updates = [
    //             config.update('defaultTheme', message.defaultTheme, vscode.ConfigurationTarget.Global),
    //             config.update('switchThemes', message.switchThemes, vscode.ConfigurationTarget.Global),
    //             config.update('switchInterval', message.switchInterval, vscode.ConfigurationTarget.Global),
    //             config.update('switchTimes', message.switchTimes, vscode.ConfigurationTarget.Global),
    //             config.update('switchMode', message.switchMode, vscode.ConfigurationTarget.Global),
    //             config.update('status', message.status, vscode.ConfigurationTarget.Global)
    //         ];
    
    //         // 等待所有配置更新完成
    //         await Promise.all(updates);
    //         // 如果默认主题已更改或者与当前主题不同 ，更新全局主题配置
    //         const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    //         if (message.defaultTheme !== config.get('defaultTheme') || currentTheme !== message.defaultTheme) {
    //             await vscode.workspace.getConfiguration('workbench').update('colorTheme', message.defaultTheme, vscode.ConfigurationTarget.Global);
    //         }
    //         vscode.window.showInformationMessage('设置已成功保存！');
    //     } catch (error) {
    //         vscode.window.showErrorMessage(`保存配置时出错: ${error}`);
    //     }
    // }

    // 辅助方法获取切换时间
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

    // 备用方法，返回原始的硬编码 HTML
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
        <h2>设置页面加载失败</h2>
        <p>无法加载完整的设置页面。请检查以下问题：</p>
        <ul>
            <li>确保扩展正确安装</li>
            <li>检查扩展ID是否正确</li>
            <li>查看开发者工具中的控制台输出</li>
        </ul>
    </div>
</body>
</html>`;
    }
}