import * as vscode from 'vscode';
import { SwitchStatus } from './types';
import * as fs from 'fs';
import { ThemeSwitcher } from './extension';

// 添加配置数据接口
interface ConfigData {
    defaultTheme: string | undefined;
    switchThemes: string[];
    switchInterval: number;
    switchTimes: string[];
    switchMode: string;
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
    private static readonly viewType = 'alfredChanging.settingsPanel';
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _themeSwitcher: ThemeSwitcher;
    private _disposables: vscode.Disposable[] = [];

    public static async createOrShow(extensionUri: vscode.Uri) {
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

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._themeSwitcher = undefined as any;

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

    private async _loadSavedConfig() {
        const config = vscode.workspace.getConfiguration('alfredChanging');
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const currentTheme = workbenchConfig.get('colorTheme') as string;
                    
                    return {
            defaultTheme: config.get('defaultTheme') || currentTheme,
            switchThemes: config.get('switchThemes') || [],
            switchInterval: config.get('switchInterval') || 30,
            switchTimes: config.get('switchTimes') || ['12:00:00'],
            switchMode: config.get('switchMode') || 'interval',
            status: config.get('status') || 'not_set'
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

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            async (message: { 
                command: string; 
                settings?: {
                    defaultTheme: string;
                    switchThemes: string[];
                    switchInterval: number;
                    switchTimes: string[];
                    switchMode: string;
                    status: string;
                }; 
                timestamp?: string 
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
                                await this._handleSaveSettings(message.settings);
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
                            await vscode.commands.executeCommand('alfred-changing.toggleStatus');
                        } catch (error) {
                            vscode.window.showErrorMessage(`切换状态时出错: ${error}`);
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

    // 保存配置
    private async _handleSaveSettings(message: {
        defaultTheme: string;
        switchThemes: string[];
        switchInterval: number;
        switchTimes: string[];
        switchMode: string;
        status: string;
    }) {
        try {
        const config = vscode.workspace.getConfiguration('alfredChanging');
            
            // 验证配置数据
            if (!message || typeof message !== 'object') {
                throw new Error('无效的配置数据');
            }

            // 保存每个配置项
            const updates = [
                config.update('defaultTheme', message.defaultTheme, vscode.ConfigurationTarget.Global),
                config.update('switchThemes', message.switchThemes, vscode.ConfigurationTarget.Global),
                config.update('switchInterval', message.switchInterval, vscode.ConfigurationTarget.Global),
                config.update('switchTimes', message.switchTimes, vscode.ConfigurationTarget.Global),
                config.update('switchMode', message.switchMode, vscode.ConfigurationTarget.Global),
                config.update('status', message.status, vscode.ConfigurationTarget.Global)
            ];

            // 等待所有配置更新完成
            await Promise.all(updates);
            // 如果默认主题已更改或者与当前主题不同 ，更新全局配置
            const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
            if (message.defaultTheme !== config.get('defaultTheme')|| currentTheme !== message.defaultTheme) {
                await vscode.workspace.getConfiguration('workbench').update('colorTheme', message.defaultTheme, vscode.ConfigurationTarget.Global);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`保存配置时出错: ${error}`);
        }
    }

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