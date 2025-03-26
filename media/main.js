(function() {
    const vscode = acquireVsCodeApi();
    
    // 获取初始配置
    const config = window.initialConfig || {};
    console.log('初始配置:', config);

    // 页面加载完成时应用配置
    document.addEventListener('DOMContentLoaded', () => {
        applyConfig(config);
    });

    function applyConfig(config) {
        console.log('应用配置:', config);
        
        // 设置默认主题
        const defaultTheme = document.getElementById('defaultTheme');
        if (defaultTheme && config.defaultTheme) {
            defaultTheme.value = config.defaultTheme;
        }

        // 设置切换主题列表
        const switchThemes = document.getElementById('switchThemes');
        if (switchThemes && config.switchThemes) {
            Array.from(switchThemes.options).forEach(option => {
                option.selected = config.switchThemes.includes(option.value);
            });
        }

        // 设置切换模式
        const switchMode = document.getElementById('switchMode');
        if (switchMode && config.switchMode) {
            switchMode.value = config.switchMode;
            switchMode.dispatchEvent(new Event('change'));
        }

        // 设置切换间隔
        const switchInterval = document.getElementById('switchInterval');
        if (switchInterval && config.switchInterval) {
            switchInterval.value = config.switchInterval;
        }

        // 设置时间点
        if (config.switchTimes && config.switchTimes.length > 0) {
            const timesList = document.getElementById('switchTimes');
            if (timesList) {
                timesList.innerHTML = '';
                config.switchTimes.forEach(time => {
                    const li = document.createElement('li');
                    li.textContent = time;
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '删除';
                    deleteBtn.onclick = () => li.remove();
                    li.appendChild(deleteBtn);
                    timesList.appendChild(li);
                });
            }
        }

        // 更新状态
        updateStatus(config.status);
    }
}); 