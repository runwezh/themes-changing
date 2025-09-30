# 更新日志 / Changelog

## [0.2.2] - 2025-09-30

### 🧹 重构 / Refactoring

- **移除 BMad 集成**: 完全移除了 BMad 项目管理功能，让插件专注于核心的主题切换功能
  - 删除了所有 BMad 相关的命令和代码
  - 移除了 `.bmad-core` 目录及其所有内容
  - 卸载了 `js-yaml` 和 `@types/js-yaml` 依赖
  - 简化了插件描述和关键词
  - 减小了插件体积，提升了启动速度
- **Removed BMad Integration**: Completely removed BMad project management features to focus on core theme switching functionality
  - Removed all BMad-related commands and code
  - Deleted `.bmad-core` directory and all its contents
  - Uninstalled `js-yaml` and `@types/js-yaml` dependencies
  - Simplified extension description and keywords
  - Reduced extension size and improved startup speed

### 🐛 Bug 修复 / Bug Fixes

- **修复插件激活问题**: 修复了插件显示"一直在激活中"的问题
  - 移除了可能阻塞激活的 BMad 初始化代码
  - 简化了 `activate` 函数，确保快速激活
- **Fixed activation issue**: Fixed the issue where extension showed "activating" indefinitely
  - Removed BMad initialization code that could block activation
  - Simplified `activate` function to ensure fast activation

---

## [0.2.1] - 2025-09-30

### 🐛 Bug 修复 / Bug Fixes

- **修复命令未找到错误**: 修复了 `command 'themes-changing.openSettings' not found` 错误
  - 在 `activationEvents` 中添加了 `onCommand:themes-changing.openSettings` 和 `onCommand:themes-changing.toggleStatus`
  - 确保用户通过命令面板调用命令时插件能够正确激活
- **Fixed command not found error**: Fixed `command 'themes-changing.openSettings' not found` error
  - Added `onCommand:themes-changing.openSettings` and `onCommand:themes-changing.toggleStatus` to `activationEvents`
  - Ensures the extension activates correctly when users invoke commands from the command palette

### ✨ 改进 / Improvements

- **自动刷新设置页面**: 保存设置后自动刷新设置页面
  - 确保页面显示最新的配置信息，包括更新后的当前主题
  - 改善用户体验，让用户立即看到保存后的效果
- **Auto-refresh settings page**: Automatically refresh settings page after saving
  - Ensures the page displays the latest configuration, including the updated current theme
  - Improves user experience by showing immediate feedback after saving

### 📝 技术细节 / Technical Details

- 问题根源：在 2025-03-26 重命名插件时，遗漏了在激活事件中添加主要命令
- Root cause: When renaming the extension on 2025-03-26, main commands were missed in activation events

---

---

## [0.1.0] - 2025-07-23

### ✨ 新功能 / New Features

- **主题过滤和搜索**: 添加了主题列表过滤功能
  - 支持按"全部"、"已选"、"日间"、"夜间"筛选
  - 支持按名称搜索主题
- **Theme Filtering and Search**: Added theme list filtering functionality
  - Filter by "All", "Selected", "Day", "Night"
  - Search themes by name

### 🎨 改进 / Improvements

- 改进了主题分类逻辑，扩展了日间/夜间主题关键词
- 添加了当前主题显示功能
- Improved theme classification logic with extended day/night keywords
- Added current theme display feature

---

## [0.0.2] - 2025-03-31

### 🎨 改进 / Improvements

- 更新了发布者信息为 "AlfredZhao"
- 添加了插件图标
- 增强了 README 文档
- 添加了仓库链接和问题报告链接
- Updated publisher to "AlfredZhao"
- Added extension icon
- Enhanced README documentation
- Added repository and issue reporting links

---

## [0.0.1] - 2025-03-26

### 🎉 首次发布 / Initial Release

- **自动主题切换**: 支持基于时间间隔或特定时间点的主题切换
- **默认主题设置**: 可设置默认主题
- **主题管理**: 管理主题切换列表
- **暂停/恢复功能**: 可随时暂停或恢复主题切换
- **设置面板**: 提供友好的 WebView 设置界面
- **Automatic Theme Switching**: Support interval-based or time-based theme switching
- **Default Theme Setting**: Set a default theme
- **Theme Management**: Manage theme switching list
- **Pause/Resume**: Pause or resume theme switching anytime
- **Settings Panel**: Friendly WebView settings interface

