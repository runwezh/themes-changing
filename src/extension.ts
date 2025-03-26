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

export class ThemeSwitcher {
    private config: ThemeConfig;
    private intervalTimer: NodeJS.Timer | undefined;
    private timeTimers: NodeJS.Timer[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.config = this.loadConfig();
        if (this.config.status === SwitchStatus.Running) {
            this.startThemeSwitching();
        }
    }

    private loadConfig(): ThemeConfig {
        const config = vscode.workspace.getConfiguration('alfredChanging');
        const defaultTheme = config.get<string>('defaultTheme') || '';
        const switchThemes = config.get<string[]>('switchThemes') || [];
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

        return {
            defaultTheme,
            switchThemes,
            switchInterval,
            switchTimes,
            switchMode,
            status
        };
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
        this.config.switchTimes.forEach(timeString => {
            this.scheduleTimeSwitch(timeString);
        });
    }

    private scheduleTimeSwitch(timeString: string) {
        try {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            
            if (isNaN(hours) || isNaN(minutes) || (seconds !== undefined && isNaN(seconds))) {
                console.error(`Invalid time format: ${timeString}`);
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
            console.error(`Error scheduling time switch for ${timeString}:`, error);
        }
    }

    private async switchTheme() {
        if (this.config.switchThemes.length === 0 || this.config.status !== SwitchStatus.Running) {
            return;
        }

        const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
        
        if (this.config.switchThemes.length === 1) {
            // If there's only one theme in the switch list, alternate between default theme and the single theme
            const newTheme = currentTheme === this.config.defaultTheme ? 
                this.config.switchThemes[0] : 
                this.config.defaultTheme;
            await this.applyTheme(newTheme);
        } else {
            // Randomly select a theme
            const availableThemes = this.config.switchThemes.filter(theme => theme !== currentTheme);
            if (availableThemes.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableThemes.length);
                await this.applyTheme(availableThemes[randomIndex]);
            }
        }
    }

    private async applyTheme(theme: string) {
        try {
            await vscode.workspace.getConfiguration('workbench').update('colorTheme', theme, true);
        } catch (error) {
            this.handleThemeError(theme);
        }
    }

    private handleThemeError(theme: string) {
        vscode.window.showErrorMessage(`Theme "${theme}" switching failed, please reconfigure`, 'Open Settings')
            .then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('alfred-changing.openSettings');
                }
            });
    }

    public async updateConfig(newConfig: Partial<ThemeConfig>) {
        // Save the old config to check for changes
        const oldConfig = { ...this.config };
        
        // Update the config with new values
        this.config = { ...this.config, ...newConfig };
        
        // Save the configuration to workspace settings
        const config = vscode.workspace.getConfiguration('alfredChanging');
        
        // Update each property if it has changed
        if (newConfig.defaultTheme !== undefined) {
            await config.update('defaultTheme', newConfig.defaultTheme, true);
            
            // Apply the default theme immediately if it has changed
            if (newConfig.defaultTheme !== oldConfig.defaultTheme) {
                await this.applyTheme(newConfig.defaultTheme);
            }
        }
        
        if (newConfig.switchThemes !== undefined) {
            await config.update('switchThemes', newConfig.switchThemes, true);
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
        vscode.workspace.getConfiguration('alfredChanging').update('status', newStatus, true)
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
        this.timeTimers.forEach(timer => {
            clearTimeout(timer);
        });
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
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "Alfred Changing" is now active!');

    // Show notification to ensure users know the extension is activated
    vscode.window.showInformationMessage('Theme switching extension is now active. Use "Alfred Changing: Open Theme Settings" from the command palette to configure');

    const themeSwitcher = new ThemeSwitcher(context);
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('alfred-changing.toggleStatus', () => {
            themeSwitcher.toggleStatus();
        }),
        
        vscode.commands.registerCommand('alfred-changing.openSettings', () => {
            SettingsPanel.createOrShow(context.extensionUri);
        }),
        
        // Register command to update configuration from settings panel
        vscode.commands.registerCommand('alfred-changing.updateConfig', (newConfig: Partial<ThemeConfig>) => {
            themeSwitcher.updateConfig(newConfig);
        }),
        
        // 添加命令用于测试：应用默认主题
        vscode.commands.registerCommand('alfred-changing.applyDefaultTheme', async () => {
            const config = vscode.workspace.getConfiguration('alfredChanging');
            const defaultTheme = config.get('defaultTheme') as string;
            
            if (defaultTheme) {
                console.log('应用默认主题命令：', defaultTheme);
                await vscode.workspace.getConfiguration('workbench').update('colorTheme', defaultTheme, true);
                vscode.window.showInformationMessage(`主题已切换为默认主题: ${defaultTheme}`);
            } else {
                console.log('未设置默认主题');
                vscode.window.showWarningMessage('未设置默认主题');
            }
        })
    );

    context.subscriptions.push(themeSwitcher);
}

export function deactivate() {} 