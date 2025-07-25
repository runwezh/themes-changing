# Themes Changing

A auto VS Code/Cursor theme switching plugin, supporting scheduled and interval-based theme switches.

一个自动的 VS Code/Cursor 主题切换插件，支持定时切换和按时间间隔切换主题。

## Who Needs This Plugin?
Got a ton of theme plugins you'll never finish using? Tired of eye strain and boredom while coding?
Give it a try! Set it to switch themes every minute—doesn't that sound more fun?

## 谁需要使用这个插件？
如果你有一堆主题插件一辈子也用不完，如果你写代码觉得眼睛酸痛很无聊，
你可以试试这个插件，设置1分钟切换一次主题，
是不是开心很多？

## Quick Setup
1. Press Ctrl (Mac Command) + Shift + P, search for Themes Changing: Open Theme Settings
![1743392911050](image/README/1743392911050.png)
2. Check the themes you want to switch
3. Select interval time (e.g., 1 minute or any custom number)
4. Save the settings
![1743393223641](image/README/1743393223641.png)

## 快速使用
1. ctr(mac command)+shift+p 搜索Themes Changing:Open theme Settings
2. 勾选需要参与切换的主题
3. 选择按间隔时间，1分钟（或者任一数字）
4. 保存设置


## Features | 功能特点

1. **Visual Settings Interface**
   - Provides an intuitive settings page to configure all options in one place
   - Real-time preview and configuration saving
   - Settings take effect immediately, no restart required

   **可视化设置界面**
   - 提供一个直观的设置页面，所有配置项在一个界面完成
   - 实时预览和保存配置
   - 修改设置后立即生效，无需重启或等待

2. **Default Theme Configuration**
   - Select a default theme from your local theme list
   - Default theme won't appear in the theme switch list
   - Changes to default theme are applied immediately

   **Default Theme Settings | 默认主题设置**
   - Select a theme from your local theme list as default theme | 可以从本地主题列表中选择一个作为默认主题
   - Default theme won't appear in the theme switch list | 默认主题不会出现在待切换主题列表中
   - Changes to default theme are applied immediately | 修改默认主题后会立即应用到当前环境

3. **Automatic Theme Switching | 主题自动切换**
   - Plugin automatically switches between default and switch list themes | 插件会根据设置的模式自动在默认主题和待切换主题之间切换
   - In interval mode, switches occur at specified intervals | 间隔模式下，每隔设定的分钟数切换一次主题
   - In time point mode, switches occur at specified times | 时间点模式下，在指定的时间点切换主题

2. **Settings Persistence | 设置保存和恢复**
   - All configurations are saved to VS Code settings | 所有配置会自动保存到 VS Code 配置中
   - Plugin loads previous configuration after VS Code restart | 重启 VS Code 后，插件会自动加载上次的配置继续执行

3. **Theme Management | 主题管理**
   - Automatically detects all VS Code installed themes | 自动检测 VS Code 中安装的所有主题
   - Supports third-party theme plugins | 支持第三方主题插件
   - Theme list updates when themes are installed/uninstalled | 主题变更（安装/卸载）后会自动更新可选列表

3. **Theme Switch List Management**
   - Select multiple themes from all available local themes
   - Automatically excludes the default theme to avoid repetitive switching
   - Supports multi-selection for easy management

   **待切换主题管理**
   - 支持从本地所有可选主题中选择多个主题
   - 自动排除默认主题，避免重复切换
   - 支持多选操作，方便管理

4. **Theme Switching Modes**
   - By Time Interval: Set interval between 1-60 minutes
   - By Specific Time: Set specific time point (HH:mm:ss)
   - Modes are mutually exclusive, only one can be active

   **主题切换模式**
   - 按时间间隔切换：可设置 1-60 分钟的切换间隔
   - 按时间点切换：可设置具体的切换时间点（HH:mm:ss）
   - 两种模式互斥，只能选择其中一种生效

5. **Smart Switching Logic**
   - With only one theme in the switch list: Alternates between default theme and the single theme
   - With multiple themes in the switch list: Randomly selects a theme
   - Automatically avoids switching to the current theme

   **智能切换逻辑**
   - 当待切换主题列表只有一个主题时：与默认主题互相切换
   - 当待切换主题列表有多个主题时：随机选择一个主题切换
   - 自动避免重复切换到当前主题

6. **Error Handling**
   - Alerts user when a configured theme has been uninstalled
   - Provides quick access to settings page
   - Automatically cleans invalid theme settings

   **错误处理**
   - 当设置的主题被卸载时，会提示用户
   - 提供快速跳转到设置页面的选项
   - 自动清理无效的主题设置

## Usage | 使用方法

### Installation | 安装

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile the project
4. Press F5 to start debugging
---
1. 克隆此仓库
2. 运行 `npm install` 安装依赖
3. 运行 `npm run compile` 编译项目
4. 按 F5 启动调试

### Configuration Steps | 配置步骤

1. **Open Settings Interface**
   - Use the command palette (Cmd+Shift+P or Ctrl+Shift+P)
   - Type "Themes Changing: Open Theme Settings"
   - Or click the button in the activation notification

   **打开设置界面**
   - 使用命令面板（Cmd+Shift+P 或 Ctrl+Shift+P）
   - 输入 "Themes Changing: Open Theme Settings"
   - 或在插件激活提示中点击按钮

2. **Configure Themes**
   - **Default Theme**: Select a theme from the dropdown as your default theme
   - **Theme Switch List**: Check the themes you want to switch between

   **配置主题**
   - **默认主题**：从下拉列表中选择一个主题作为默认主题
   - **待切换主题**：在主题列表中勾选需要切换的主题

3. **Set Switching Method**
   - **Switch Mode**: Choose "By Time Interval" or "By Specific Time"
   - **Interval**: If interval mode is selected, set a value between 1-60 minutes
   - **Switch Time**: If specific time mode is selected, set a specific time (HH:mm:ss)

   **设置切换方式**
   - **切换模式**：选择"按时间间隔"或"按时间点"
   - **时间间隔**：如选择间隔模式，设置1-60分钟之间的切换间隔
   - **切换时间**：如选择时间点模式，设置具体的时间点（HH:mm:ss）

4. **Save Settings**
   - Click "Save Settings" button to apply changes
   - All settings take effect immediately and are persisted
   - If default theme is changed, it will be applied immediately

   **保存设置**
   - 点击"保存设置"按钮应用更改
   - 所有设置会立即生效并持久化保存
   - 如修改了默认主题，会立即应用到当前环境

## Core Features | 核心功能说明

1. **Automatic Theme Switching**
   - The plugin automatically switches between default theme and themes in the switch list
   - In interval mode, theme switches occur at the specified minute interval
   - In time point mode, theme switches occur at the specified time

   **主题自动切换**
   - 插件会根据设置的模式自动在默认主题和待切换主题之间切换
   - 间隔模式下，每隔设定的分钟数切换一次主题
   - 时间点模式下，在指定的时间点切换主题

2. **Settings Persistence**
   - All configurations are automatically saved to VS Code settings
   - After restarting VS Code, plugin loads the previous configuration
   
   **设置保存和恢复**
   - 所有配置会自动保存到 VS Code 配置中
   - 重启 VS Code 后，插件会自动加载上次的配置继续执行

3. **Theme Management**
   - Automatically detects all themes installed in VS Code
   - Supports third-party theme plugins
   - Theme list is updated when themes are installed or uninstalled

   **主题管理**
   - 自动检测 VS Code 中安装的所有主题
   - 支持第三方主题插件
   - 主题变更（安装/卸载）后会自动更新可选列表

## Development | 开发

- `src/extension.ts` - Main source code for the plugin, contains theme switching logic
- `src/settingsPanel.ts` - Settings interface implementation, includes UI rendering and settings persistence logic
- `package.json` - Plugin configuration file, defines commands and settings
---
- `src/extension.ts` - 插件的主要源代码，包含主题切换逻辑
- `src/settingsPanel.ts` - 设置界面实现代码，包含UI渲染和设置保存逻辑
- `package.json` - 插件的配置文件，定义了命令和配置项

## Build | 构建

Run the following command to build the plugin:

运行以下命令来构建插件：

```bash
npm run compile
```

## Debugging | 调试

Press F5 in VS Code/Cursor to start a debugging session. You can:

1. View plugin output logs in the debug console
2. Set breakpoints for code debugging
3. Test plugin commands from the command palette

在 VS Code/Cursor 中按 F5 即可启动调试会话。您可以：

1. 在调试控制台查看插件输出日志
2. 设置断点进行代码调试
3. 在命令面板中测试插件命令

## Testing | 测试

### Running Tests | 运行测试

1. Install test dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

3. Run tests in watch mode:
```bash
npm run test:watch
```

1. 安装测试依赖：
```bash
npm install
```

2. 运行测试：
```bash
npm test
```

3. 以监视模式运行测试：
```bash
npm run test:watch
```

### Test Content | 测试内容

The test suite includes the following tests:

1. **Theme Switching Configuration Tests**
   - Tests for default theme setting
   - Tests for theme switch list setting
   - Tests for switch interval setting
   - Tests for switch time point setting
   - Tests for switch mode setting

2. **Configuration Validation Tests**
   - Tests for time interval range
   - Tests for time format
   - Tests for switch mode

3. **Settings Interface Tests**
   - Tests for settings page creation and display
   - Tests for settings saving and loading
   - Tests for theme list loading

测试套件包含以下测试：

1. **主题切换配置测试**
   - 测试默认主题设置
   - 测试待切换主题列表设置
   - 测试切换间隔设置
   - 测试切换时间点设置
   - 测试切换模式设置

2. **配置验证测试**
   - 测试时间间隔范围
   - 测试时间格式
   - 测试切换模式

3. **设置界面测试**
   - 测试设置页面的创建和显示
   - 测试设置的保存和加载
   - 测试主题列表加载

### Testing Notes | 测试注意事项

1. Tests automatically save and restore original configurations
2. Current theme may be temporarily changed during testing
3. Ensure all dependencies are installed before testing
4. If tests fail, check the console for detailed error messages
***
1. 测试会自动保存和恢复原始配置
2. 测试过程中可能会短暂改变当前主题
3. 确保测试前已安装所有依赖
4. 如果测试失败，检查控制台输出的详细错误信息

## Notes | 注意事项

1. Ensure at least one default theme is set
2. Theme switch list must contain at least one theme
3. In time point mode, each time point can only be set once
4. Only one theme switching mode (interval/time) can be active
5. Changes to default theme are applied immediately
6. After settings are changed, timer tasks automatically restart
---
1. 确保至少设置了一个默认主题
2. 待切换主题列表必须至少包含一个主题
3. 时间点切换模式下，同一个时间点只能设置一次
4. 主题切换模式（间隔/定时）只能选择一种生效
5. 修改默认主题后会立即应用到当前环境
6. 设置更改后，定时任务会自动重启

## Mathematical Formulas | 数学公式

Theme switching time calculation formulas:

主题切换时间间隔计算公式：

1. **Next Switch Time in Interval Mode | 时间间隔模式下的下次切换时间**：
   
   $t_{next} = t_{current} + interval_{minutes} \times 60$

   Where | 其中：
   - $t_{next}$ is the next switch time (in seconds) | 为下次切换时间（秒）
   - $t_{current}$ is the current time (in seconds) | 为当前时间（秒）
   - $interval_{minutes}$ is the set interval in minutes | 为设置的间隔分钟数

2. **Wait Time in Time Point Mode | 时间点模式下的等待时间**：
   
   $t_{wait} = \begin{cases} 
   t_{target} - t_{current}, & \text{if } t_{target} > t_{current} \\
   24 \times 3600 - (t_{current} - t_{target}), & \text{if } t_{target} \leq t_{current}
   \end{cases}$

   
   Where | 其中：
   - $t_{wait}$ is the time to wait (in seconds) | 为需要等待的时间（秒）
   - $t_{target}$ is the target switch time (in seconds) | 为目标切换时间点（秒）
   - $t_{current}$ is the current time (in seconds) | 为当前时间（秒）

   
 3. **Default Theme Settings | 默认主题设置**
   - Select a theme from your local theme list as default theme | 可以从本地主题列表中选择一个作为默认主题
   - Default theme won't appear in the theme switch list | 默认主题不会出现在待切换主题列表中
   - Changes to default theme are applied immediately | 修改默认主题后会立即应用到当前环境

4. **Automatic Theme Switching | 主题自动切换**
   - Plugin automatically switches between default and switch list themes | 插件会根据设置的模式自动在默认主题和待切换主题之间切换
   - In interval mode, switches occur at specified intervals | 间隔模式下，每隔设定的分钟数切换一次主题
   - In time point mode, switches occur at specified times | 时间点模式下，在指定的时间点切换主题

5. **Settings Persistence | 设置保存和恢复**
   - All configurations are saved to VS Code settings | 所有配置会自动保存到 VS Code 配置中
   - Plugin loads previous configuration after VS Code restart | 重启 VS Code 后，插件会自动加载上次的配置继续执行

6. **Theme Management | 主题管理**
   - Automatically detects all VS Code installed themes | 自动检测 VS Code 中安装的所有主题
   - Supports third-party theme plugins | 支持第三方主题插件
   - Theme list updates when themes are installed/uninstalled | 主题变更（安装/卸载）后会自动更新可选列表





## 更新日志 | Changelog

### v0.1.0 (2025-07-23)
- **新增主题列表过滤功能**
  - 在主题列表上方添加了过滤条件栏
  - 支持按"全部"、"已选"、"白天"、"夜晚"条件筛选主题
  - 支持通过名称进行模糊搜索
  - 过滤选项横向居中对齐，搜索框左对齐
  - 单选按钮与文字垂直居中对齐

- **改进主题分类逻辑**
  - 白天主题关键词扩展：light, day, white, bright, clear, sunny, light-colored, 浅色, 白色, 明亮, 亮色, 亮色的, 浅色的
  - 夜晚主题关键词扩展：dark, night, black, dim, deep, midnight, twilight, dark-colored, 深色, 黑色, 暗色, 暗色的, 深色的, 黑色的, dracula
  - 特殊主题如"Dracula"被正确识别为夜晚主题
  - 支持中英文混合关键词识别

- **UI优化**
  - 过滤容器样式优化，提升视觉一致性
  - 添加红色和蓝色边框辅助调试元素对齐
  - 使用transform微调单选按钮位置，确保视觉对齐

### English Version
- **Added theme list filtering feature**
  - Added filter bar above theme list
  - Support filtering by "All", "Selected", "Day", "Night" conditions
  - Support fuzzy search by theme name
  - Filter options horizontally centered, search box left-aligned
  - Radio buttons vertically centered with text

- **Improved theme classification logic**
  - Extended day theme keywords: light, day, white, bright, clear, sunny, light-colored, 浅色, 白色, 明亮, 亮色, 亮色的, 浅色的
  - Extended night theme keywords: dark, night, black, dim, deep, midnight, twilight, dark-colored, 深色, 黑色, 暗色, 暗色的, 深色的, 黑色的, dracula
  - Special themes like "Dracula" correctly identified as night themes
  - Support mixed Chinese-English keyword recognition

- **UI improvements**
  - Optimized filter container styling for better visual consistency
  - Added red and blue borders for debugging element alignment
  - Used transform to fine-tune radio button position for perfect visual alignment

## License | 许可证

This project is licensed under the [MIT License](LICENSE).



```
MIT License

Copyright (c) 2025 Themes Changing Project Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
