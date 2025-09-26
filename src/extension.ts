import * as vscode from 'vscode';
import { SettingsPanel } from './settingsPanel';
import { SwitchStatus } from './types';

export interface ThemeConfig {
    defaultTheme: string;
    switchThemes: string[];
    switchInterval: number;
    switchTimes: string[];
    switchMode: 'interval' | 'time';
    status: SwitchStatus;
}
// 定时器有状态控制字段，
export class ThemeSwitcher {
    private config: ThemeConfig;
    private intervalTimer: NodeJS.Timer | undefined;
    private timeTimers: NodeJS.Timer[] = [];
    private themeMap: Map<string, string> | undefined;
    private themeIndex = -1;
    private lastAppliedTheme: string | undefined;

    constructor(private context: vscode.ExtensionContext) {
        this.config = this.loadConfig();
        if (this.config.status === SwitchStatus.Running) {
            this.startThemeSwitching();
        }
    }

    private normalizeThemeId(theme?: string): string {
        if (!theme) {
            return '';
        }
        return theme
            .replace(/["'`]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    private getThemeMap(): Map<string, string> {
        if (this.themeMap) {
            return this.themeMap;
        }

        const map = new Map<string, string>();

        const register = (key: string | undefined, label: string | undefined) => {
            if (!key || !label) {
                return;
            }
            map.set(this.normalizeThemeId(key), label);
        };

        const ensure = (label: string, id?: string) => {
            const finalLabel = label || id;
            if (!finalLabel) {
                return;
            }
            register(label, finalLabel);
            if (id) {
                register(id, finalLabel);
            }
        };

        for (const extension of vscode.extensions.all) {
            const contributes = extension.packageJSON?.contributes;
            const themes = contributes?.themes;
            if (!Array.isArray(themes)) {
                continue;
            }
            for (const theme of themes) {
                const label = typeof theme?.label === 'string' ? theme.label : undefined;
                const id = typeof theme?.id === 'string' ? theme.id : undefined;
                const fallbackLabel = label || id;
                if (!fallbackLabel) {
                    continue;
                }
                ensure(fallbackLabel, id);
            }
        }

        const builtIns = [
            'Default Dark+',
            'Default Light+',
            'Visual Studio Dark',
            'Visual Studio Light',
            'High Contrast',
            'Monokai',
            'Solarized Dark',
            'Solarized Light'
        ];

        for (const themeName of builtIns) {
            ensure(themeName, themeName);
        }

        this.themeMap = map;
        return map;
    }

    private resolveThemeName(theme: string | undefined): string {
        if (!theme) {
            return '';
        }
        const normalized = this.normalizeThemeId(theme);
        if (!normalized) {
            return theme;
        }
        const map = this.getThemeMap();
        return map.get(normalized) || theme;
    }

    private normalizeThemeList(themes: string[]): string[] {
        const resolvedThemes: string[] = [];
        const seen = new Set<string>();
        for (const theme of themes) {
            const resolved = this.resolveThemeName(theme);
            const key = this.normalizeThemeId(resolved);
            if (!key || seen.has(key)) {
                continue;
            }
            seen.add(key);
            resolvedThemes.push(resolved);
        }
        return resolvedThemes;
    }

    private findThemeIndex(themes: string[], themeName: string): number {
        const targetKey = this.normalizeThemeId(themeName);
        if (!targetKey) {
            return -1;
        }
        return themes.findIndex(candidate => this.normalizeThemeId(candidate) === targetKey);
    }

    private haveThemesChanged(existing: string[], normalized: string[]): boolean {
        if (existing.length !== normalized.length) {
            return true;
        }
        for (let i = 0; i < existing.length; i++) {
            if (this.normalizeThemeId(existing[i]) !== this.normalizeThemeId(normalized[i])) {
                return true;
            }
        }
        return false;
    }

    private loadConfig(): ThemeConfig {
        const config = vscode.workspace.getConfiguration('themesChanging');
        const storedDefaultTheme = config.get<string>('defaultTheme') || '';
        const defaultTheme = this.resolveThemeName(storedDefaultTheme);
        const storedSwitchThemes = config.get<string[]>('switchThemes') || [];
        const switchThemes = this.normalizeThemeList(storedSwitchThemes);
        const switchInterval = config.get<number>('switchInterval') || 30;
        
        // Get switch times array or convert legacy single time to array
        let switchTimes = config.get<string[]>('switchTimes');
        if (!switchTimes || switchTimes.length === 0) {
            // Check for legacy single time setting
            const legacySwitchTime = config.get<string>('switchTime');
            if (legacySwitchTime) {
                switchTimes = [legacySwitchTime];
                // Migrate legacy setting to new array setting
                config.update('switchTimes', switchTimes, true);
            } else {
                switchTimes = [];
            }
        }
        
        const switchMode = config.get<'interval' | 'time'>('switchMode') || 'interval';
        
        // Load status or set default
        let status = config.get<SwitchStatus>('status');
        
        // If no status or first time setup
        if (!status) {
            status = (defaultTheme && switchThemes.length > 0) ? 
                SwitchStatus.Running : SwitchStatus.NotSet;
            config.update('status', status, true);
        }

        if (storedDefaultTheme && this.normalizeThemeId(storedDefaultTheme) !== this.normalizeThemeId(defaultTheme)) {
            void config.update('defaultTheme', defaultTheme, true);
        }
        if (storedSwitchThemes.length !== switchThemes.length || storedSwitchThemes.some((theme, index) => this.normalizeThemeId(theme) !== this.normalizeThemeId(switchThemes[index]))) {
            void config.update('switchThemes', switchThemes, true);
        }

        const themeConfig: ThemeConfig = {
            defaultTheme,
            switchThemes,
            switchInterval,
            switchTimes,
            switchMode,
            status
        };

        this.themeIndex = -1;

        return themeConfig;
    }

    private async startThemeSwitching() {
        if (this.config.switchMode === 'interval') {
            this.startIntervalSwitching();
        } else {
            this.startTimeSwitching();
        }
    }

    private startIntervalSwitching() {
        this.clearTimeTimers();
        
        this.intervalTimer = setInterval(() => this.switchTheme(), this.config.switchInterval * 60 * 1000);
    }

    private startTimeSwitching() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = undefined;
        }
        
        this.scheduleAllTimeSwitches();
    }

    private scheduleAllTimeSwitches() {
        // Clear existing timers
        this.clearTimeTimers();
        
        // Check if we have any time points
        if (!this.config.switchTimes || this.config.switchTimes.length === 0) {
            return;
        }
        
        // Schedule each time point
        for (const timeString of this.config.switchTimes) {
            this.scheduleTimeSwitch(timeString);
        }
    }

    private scheduleTimeSwitch(timeString: string) {
        try {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            
            if (Number.isNaN(hours) || Number.isNaN(minutes) || (seconds !== undefined && Number.isNaN(seconds))) {
                return;
            }
            
            const now = new Date();
            const switchTime = new Date(now);
            
            // Set hours and minutes, and seconds if provided (otherwise 0)
            switchTime.setHours(hours, minutes, seconds || 0, 0);
            
            // If time is in the past, schedule for next day
            if (switchTime <= now) {
                switchTime.setDate(switchTime.getDate() + 1);
            }
            
            const delay = switchTime.getTime() - now.getTime();
            
            // Schedule the theme switch
            const timer = setTimeout(() => {
                // Switch theme
                this.switchTheme();
                
                // Reschedule for next day
                this.scheduleTimeSwitch(timeString);
            }, delay);
            
            // Store timer reference
            this.timeTimers.push(timer);
        } catch (error) {
            return;
        }
    }

    private async switchTheme() {
        if (this.config.status !== SwitchStatus.Running) {
            return;
        }

        const normalizedThemes = this.normalizeThemeList(this.config.switchThemes);
        if (normalizedThemes.length === 0) {
            return;
        }
        if (this.haveThemesChanged(this.config.switchThemes, normalizedThemes)) {
            this.config.switchThemes = normalizedThemes;
            this.themeIndex = -1;
        }

        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const currentThemeSetting = workbenchConfig.get<string>('colorTheme') || '';
        const currentTheme = this.resolveThemeName(currentThemeSetting);
        const currentKey = this.normalizeThemeId(currentTheme);

        let nextTheme: string | undefined;

        if (normalizedThemes.length === 1) {
            const targetTheme = normalizedThemes[0];
            const targetKey = this.normalizeThemeId(targetTheme);
            const defaultTheme = this.resolveThemeName(this.config.defaultTheme);
            const defaultKey = this.normalizeThemeId(defaultTheme);

            if (defaultKey && defaultKey !== targetKey) {
                nextTheme = currentKey === defaultKey ? targetTheme : defaultTheme;
            } else if (!currentKey || currentKey !== targetKey) {
                nextTheme = targetTheme;
            }

            if (nextTheme) {
                this.themeIndex = this.findThemeIndex(normalizedThemes, nextTheme);
            }
        } else {
            if (this.themeIndex < 0 || this.themeIndex >= normalizedThemes.length) {
                let alignedIndex = this.findThemeIndex(normalizedThemes, this.lastAppliedTheme || '');
                if (alignedIndex === -1) {
                    alignedIndex = this.findThemeIndex(normalizedThemes, currentTheme);
                }
                this.themeIndex = alignedIndex;
            }

            const baseIndex = this.themeIndex >= 0 ? this.themeIndex : -1;
            const nextIndex = (baseIndex + 1) % normalizedThemes.length;
            const candidateTheme = normalizedThemes[nextIndex];

            if (this.normalizeThemeId(candidateTheme) === currentKey) {
                const fallbackIndex = (nextIndex + 1) % normalizedThemes.length;
                this.themeIndex = fallbackIndex;
                nextTheme = normalizedThemes[fallbackIndex];
            } else {
                this.themeIndex = nextIndex;
                nextTheme = candidateTheme;
            }
        }

        if (nextTheme) {
            await this.applyTheme(nextTheme);
        }
    }

    private async applyTheme(theme: string) {
        try {
            const resolvedTheme = this.resolveThemeName(theme);
            await vscode.workspace.getConfiguration('workbench').update('colorTheme', resolvedTheme, true);
            this.lastAppliedTheme = resolvedTheme;
        } catch (error) {
            this.handleThemeError(theme);
        }
    }

    private handleThemeError(theme: string) {
        const resolvedTheme = this.resolveThemeName(theme);
        vscode.window.showErrorMessage(`Theme "${resolvedTheme}" switching failed, please reconfigure`, 'Open Settings')
            .then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('themes-changing.openSettings');
                }
            });
    }

    public async updateConfig(newConfig: Partial<ThemeConfig>) {
        // Save the old config to check for changes
        const oldConfig = { ...this.config };
        const updatedConfig: Partial<ThemeConfig> = { ...newConfig };

        if (updatedConfig.defaultTheme !== undefined) {
            updatedConfig.defaultTheme = this.resolveThemeName(updatedConfig.defaultTheme);
        }

        if (updatedConfig.switchThemes !== undefined) {
            updatedConfig.switchThemes = this.normalizeThemeList(updatedConfig.switchThemes);
        }

        // Update the config with new values
        this.config = { ...this.config, ...updatedConfig };

        // Save the configuration to workspace settings
        const config = vscode.workspace.getConfiguration('themesChanging');
        
        // Update each property if it has changed
        if (updatedConfig.defaultTheme !== undefined) {
            await config.update('defaultTheme', this.config.defaultTheme, true);
            
            // Apply the default theme immediately if it has changed
            if (this.normalizeThemeId(this.config.defaultTheme) !== this.normalizeThemeId(oldConfig.defaultTheme)) {
                await this.applyTheme(this.config.defaultTheme);
            }
        }
        
        if (updatedConfig.switchThemes !== undefined) {
            this.themeIndex = -1;
            await config.update('switchThemes', this.config.switchThemes, true);
        }
        
        if (newConfig.switchInterval !== undefined) {
            await config.update('switchInterval', newConfig.switchInterval, true);
        }
        
        if (newConfig.switchTimes !== undefined) {
            await config.update('switchTimes', newConfig.switchTimes, true);
        }
        
        if (newConfig.switchMode !== undefined) {
            await config.update('switchMode', newConfig.switchMode, true);
        }
        
        if (newConfig.status !== undefined) {
            await config.update('status', newConfig.status, true);
        }
        
        // Clear existing timers
        this.clearTimers();
        
        // Start theme switching if status is running
        if (this.config.status === SwitchStatus.Running) {
            this.startThemeSwitching();
        }
    }

    public toggleStatus() {
        // Toggle between running and paused
        const newStatus = this.config.status === SwitchStatus.Running ? 
            SwitchStatus.Paused : SwitchStatus.Running;
            
        // Update configuration
        vscode.workspace.getConfiguration('themesChanging').update('status', newStatus, true)
            .then(() => {
                this.config.status = newStatus;
                
                if (newStatus === SwitchStatus.Running) {
                    // Resume theme switching
                    this.startThemeSwitching();
                    vscode.window.showInformationMessage('Theme switching has been resumed');
                } else {
                    // Pause theme switching
                    this.clearTimers();
                    vscode.window.showInformationMessage('Theme switching has been paused');
                }
            });
    }
    
    private clearTimeTimers() {
        for (const timer of this.timeTimers) {
            clearTimeout(timer);
        }
        this.timeTimers = [];
    }
    
    private clearTimers() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = undefined;
        }
        this.clearTimeTimers();
    }

    public dispose() {
        this.clearTimers();
    }
    // 设置主题配置的状态
    public setStatus(status: SwitchStatus) {
        this.config.status = status;
        const config = vscode.workspace.getConfiguration('themesChanging');
        config.update('status', status, true);
    }

    // 在 ThemeSwitcher 类中实现以下方法
    public async stopScheduler(): Promise<void> {
        // 停止所有计时器
        this.clearTimers(); // 改为正确的方法名
    }

    public async startIntervalScheduler(intervalMinutes: number, themes: string[]): Promise<void> {
        // 先清除现有计时器
        this.clearTimers(); // 改为正确的方法名
        
        // 使用现有方法替代不存在的方法
        const normalizedThemes = this.normalizeThemeList(themes);
        this.config.switchInterval = intervalMinutes;
        this.config.switchThemes = normalizedThemes;
        this.config.switchMode = 'interval';
        this.themeIndex = -1;
        this.startIntervalSwitching(); // 使用已有的方法
    }

    public async startTimeScheduler(times: string[], themes: string[]): Promise<void> {
        // 先清除现有计时器
        this.clearTimers(); // 改为正确的方法名
        
        // 使用现有方法替代不存在的方法
        const normalizedThemes = this.normalizeThemeList(themes);
        this.config.switchTimes = times;
        this.config.switchThemes = normalizedThemes;
        this.config.switchMode = 'time';
        this.themeIndex = -1;
        this.startTimeSwitching(); // 使用已有的方法
    }
}

export function activate(context: vscode.ExtensionContext) {
    const themeSwitcher = new ThemeSwitcher(context);
    
    context.subscriptions.push(
        vscode.commands.registerCommand('themes-changing.toggleStatus', () => {
            themeSwitcher.toggleStatus();
        }),
        
        vscode.commands.registerCommand('themes-changing.openSettings', () => {
            SettingsPanel.createOrShow(context.extensionUri, themeSwitcher); // 添加缺少的参数
        }),
        
        vscode.commands.registerCommand('themes-changing.updateConfig', (newConfig: Partial<ThemeConfig>) => {
            themeSwitcher.updateConfig(newConfig);
        }),
        
        // 修改 theme-changing.applyDefaultTheme 命令的消息提示
        vscode.commands.registerCommand('themes-changing.applyDefaultTheme', async () => {
            const config = vscode.workspace.getConfiguration('themesChanging');
            const defaultTheme = config.get('defaultTheme') as string;
            
            if (defaultTheme) {
                await vscode.workspace.getConfiguration('workbench').update('colorTheme', defaultTheme, true);
                vscode.window.showInformationMessage(`Theme switched to default: ${defaultTheme}`);
            } else {
                vscode.window.showWarningMessage('No default theme set');
            }
        })
    );

    context.subscriptions.push(themeSwitcher);
}

export function deactivate() {}
