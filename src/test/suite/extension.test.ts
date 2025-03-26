import * as assert from 'assert';
import * as vscode from 'vscode';
import { SwitchStatus } from '../../types';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting tests for Themes Changing plugin.');

    // Helper function: Wait for configuration update
    async function waitForConfigUpdate(key: string, expectedValue: string | string[] | number, timeout = 1000): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('themesChanging');
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const currentValue = config.get(key);
            if (JSON.stringify(currentValue) === JSON.stringify(expectedValue)) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return false;
    }

    test('Theme switching configuration test', async function() {
        // this.timeout(60000);
        const config = vscode.workspace.getConfiguration('themesChanging');
        const originalConfig = {
            defaultTheme: config.get('defaultTheme'),
            switchThemes: config.get('switchThemes'),
            switchInterval: config.get('switchInterval'),
            switchTimes: config.get('switchTimes') || [],
            switchMode: config.get('switchMode'),
            status: config.get('status')
        };

        try {
            // Test default theme setting
            await config.update('defaultTheme', 'test-theme', true);
            assert.ok(await waitForConfigUpdate('defaultTheme', 'test-theme'),
                'Failed to set default theme');

            // Test switch theme list
            await config.update('switchThemes', ['theme1', 'theme2'], true);
            assert.ok(await waitForConfigUpdate('switchThemes', ['theme1', 'theme2']),
                'Failed to set switch theme list');

            // Test switch interval
            await config.update('switchInterval', 30, true);
            assert.ok(await waitForConfigUpdate('switchInterval', 30),
                'Failed to set switch interval');

            // Test switch times
            await config.update('switchTimes', ['14:30:00', '18:00:00'], true);
            assert.ok(await waitForConfigUpdate('switchTimes', ['14:30:00', '18:00:00']),
                'Failed to set switch times');

            // Test switch mode
            await config.update('switchMode', 'interval', true);
            assert.ok(await waitForConfigUpdate('switchMode', 'interval'),
                'Failed to set switch mode');
        } finally {
            // Restore original configuration
            await config.update('defaultTheme', originalConfig.defaultTheme, true);
            await config.update('switchThemes', originalConfig.switchThemes, true);
            await config.update('switchInterval', originalConfig.switchInterval, true);
            await config.update('switchTimes', originalConfig.switchTimes, true);
            await config.update('switchMode', originalConfig.switchMode, true);
            await config.update('status', originalConfig.status, true);
        }
    });

    test('Configuration validation test', async function() {
        // this.timeout(600000);
        const config = vscode.workspace.getConfiguration('themesChanging');

        // Test time interval range
        const interval = config.get('switchInterval') as number;
        assert.ok(interval >= 1 && interval <= 60,
            'Time interval setting is not within valid range');

        // Test time format
        const times = config.get('switchTimes') as string[];
        if (times && times.length > 0) {
            for (const time of times) {
                assert.ok(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time),
                    'Time format is incorrect: ' + time);
            }
        }

        // Test switch mode
        const mode = config.get('switchMode') as string;
        assert.ok(['interval', 'time'].includes(mode),
            'Switch mode setting is incorrect');
    });

    test('Toggle status functionality test', async function() {
        // this.timeout(600000);
        const config = vscode.workspace.getConfiguration('themesChanging');
        
        // Store original status
        const originalStatus = config.get('status') as SwitchStatus || SwitchStatus.NotSet;
        
        try {
            // First ensure we have a valid configuration
            await config.update('defaultTheme', 'Default Dark+', true);
            await config.update('switchThemes', ['Default Light+'], true);
            await config.update('switchInterval', 30, true);
            await config.update('switchTimes', ['12:00:00'], true);
            await config.update('switchMode', 'interval', true);
            
            // Test direct status changes rather than command execution
            // Set status to running
            await config.update('status', SwitchStatus.Running, true);
            assert.ok(await waitForConfigUpdate('status', SwitchStatus.Running),
                'Failed to set status to running');
            
            // Set status to paused
            await config.update('status', SwitchStatus.Paused, true);
            assert.ok(await waitForConfigUpdate('status', SwitchStatus.Paused),
                'Failed to set status to paused');
            
            // Set status back to running
            await config.update('status', SwitchStatus.Running, true);
            assert.ok(await waitForConfigUpdate('status', SwitchStatus.Running),
                'Failed to set status back to running');
            
        } finally {
            // Restore original status
            await config.update('status', originalStatus, true);
        }
    });
}); 