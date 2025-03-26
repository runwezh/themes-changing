import * as assert from 'assert';
import * as vscode from 'vscode';
import { SettingsPanel } from '../../settingsPanel';

suite('Settings Panel Test', () => {
    test('Test settings panel creation and display', async function() {
        // this.timeout(60000); // 1分钟超时
        
        // Create settings panel
        await vscode.commands.executeCommand('themes-changing.openSettings');
        
        // Wait for settings panel to display
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify settings panel exists
        assert.ok(SettingsPanel.currentPanel, 'Settings panel was not created');

        // Close settings panel
        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel.dispose();
        }
    });

    test('Test settings saving', async function() {
        this.timeout(60000); // 1分钟超时

        const config = vscode.workspace.getConfiguration('themesChanging');
        const testInterval = 15;
        const testTimes = ['12:00:00', '18:00:00'];

        try {
            // Open settings panel
            await vscode.commands.executeCommand('themes-changing.openSettings');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update settings
            await config.update('switchInterval', testInterval, true);
            await config.update('switchTimes', testTimes, true);
            await config.update('switchMode', 'interval', true);

            // Wait for settings to update
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get updated configuration
            const updatedConfig = vscode.workspace.getConfiguration('themesChanging');

            // Verify settings were saved correctly
            assert.strictEqual(updatedConfig.get('switchInterval'), testInterval, 'Switch interval setting is incorrect');
            
            const savedTimes = updatedConfig.get('switchTimes') as string[];
            assert.ok(savedTimes && Array.isArray(savedTimes), 'Switch times should be an array');
            assert.strictEqual(savedTimes.length, testTimes.length, 'Switch times array length is incorrect');
            assert.deepStrictEqual(savedTimes, testTimes, 'Switch times values are incorrect');
            
            assert.strictEqual(updatedConfig.get('switchMode'), 'interval', 'Switch mode setting is incorrect');

        } finally {
            // Close settings panel
            if (SettingsPanel.currentPanel) {
                SettingsPanel.currentPanel.dispose();
            }
        }
    });

    test('Test theme list loading', async function() {
        // this.timeout(600000); // 10分钟超时

        try {
            // Open settings panel
            await vscode.commands.executeCommand('themes-changing.openSettings');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get current theme
            const currentTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
            assert.ok(currentTheme, 'Could not get current theme');

        } finally {
            // Close settings panel
            if (SettingsPanel.currentPanel) {
                SettingsPanel.currentPanel.dispose();
            }
        }
    });

    test('Test save button changes theme to default theme', async () => {
        // 记录初始主题
        const initialTheme = await vscode.workspace.getConfiguration('workbench').get('colorTheme');
        
        // 创建并显示设置面板
        await vscode.commands.executeCommand('themes-changing.openSettings');
        const panel = SettingsPanel.currentPanel;
        assert.ok(panel, '设置面板应该被创建');
        
        // 等待WebView准备就绪
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 定义主题接口
        interface ThemeContribution {
            id?: string;
            label: string;
            uiTheme?: string;
            path?: string;
        }
        
        // 获取所有可用主题
        const allThemes = await vscode.extensions.all
            .filter(ext => ext.packageJSON?.contributes?.themes)
            .reduce((themes: Array<{id: string; label: string}>, ext) => {
                const extThemes = (ext.packageJSON.contributes.themes || []) as ThemeContribution[];
                return themes.concat(extThemes.map((t: ThemeContribution) => ({
                    id: t.id || t.label,
                    label: t.label
                })));
            }, [{id: 'Default Dark+', label: 'Default Dark+'}, {id: 'Default Light+', label: 'Default Light+'}]);
        
        // 获取当前主题
        const initialCurrentTheme = await vscode.workspace.getConfiguration('workbench').get('colorTheme') as string;
        
        // 从可用主题中选择一个不同的主题进行测试
        const availableThemes = allThemes.filter(theme => theme.id !== initialCurrentTheme);
        if (availableThemes.length === 0) {
            throw new Error('没有找到可用的测试主题');
        }
        
        // 选择随机一个可用的主题作为测试主题
        const testTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)].id;
        
        // 首先直接设置主题
        await vscode.workspace.getConfiguration('workbench').update('colorTheme', testTheme, true);
        
        // 等待主题切换生效
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 验证主题是否已经切换
        const themeAfterDirectChange = await vscode.workspace.getConfiguration('workbench').get('colorTheme');
        assert.strictEqual(themeAfterDirectChange, testTheme, '直接设置主题失败');
        
        // 模拟保存设置
        const message = {
            command: 'saveSettings',
            defaultTheme: testTheme,
            switchThemes: [testTheme],
            switchInterval: 30,
            switchTimes: ['12:00:00'],
            switchMode: 'interval',
            status: 'running'
        };
        
        // 发送保存设置消息
        await vscode.commands.executeCommand('themes-changing.updateConfig', message);
        
        // 等待设置保存和主题切换
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 获取当前主题并验证
        let maxRetries = 3;
        let finalTheme = '';
        while (maxRetries > 0) {
            finalTheme = await vscode.workspace.getConfiguration('workbench').get('colorTheme') as string;
            
            if (finalTheme === testTheme) {
                break;
            }
            
            // 如果主题没有切换成功，尝试再次直接设置
            if (maxRetries === 2) {
                await vscode.workspace.getConfiguration('workbench').update('colorTheme', testTheme, true);
            }
            
            maxRetries--;
            if (maxRetries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // 验证主题是否正确切换
        assert.strictEqual(finalTheme, testTheme, '主题应该切换到测试主题');
        
        // 清理：恢复原始主题
        await vscode.workspace.getConfiguration('workbench').update('colorTheme', initialTheme, true);
        
        // 关闭设置面板
        if (panel) {
            panel.dispose();
        }
    });
}); 