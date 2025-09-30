# Themes Changing v0.2.1 发布说明

## 🐛 紧急 Bug 修复版本

本版本修复了一个严重的命令未找到错误，强烈建议所有用户更新。

---

## 修复的问题

### ❌ 问题描述
用户在使用命令面板调用 `Themes Changing: Open Theme Settings` 时，会遇到以下错误：

```
command 'themes-changing.openSettings' not found
```

### ✅ 问题原因
在 2025-03-26 的插件重命名过程中（从 `alfred-changing` 改为 `themes-changing`），虽然更新了所有命令名称，但在 `package.json` 的 `activationEvents` 配置中遗漏了主要命令的激活事件。

这导致当用户直接通过命令面板调用命令时，如果插件还未被 `onStartupFinished` 激活，VS Code 就无法找到该命令。

### 🔧 修复内容
在 `package.json` 的 `activationEvents` 中添加了缺失的命令激活事件：

```json
"activationEvents": [
  "onStartupFinished",
  "onCommand:themes-changing.openSettings",   // ✅ 新增
  "onCommand:themes-changing.toggleStatus",    // ✅ 新增
  "onCommand:themes-changing.updateConfig"
]
```

现在，当用户执行以下命令时，VS Code 会自动激活插件：
- ✅ `Themes Changing: Open Theme Settings`
- ✅ `Themes Changing: Toggle Theme Switching (Pause/Resume)`
- ✅ `Themes Changing: Update Config`

---

## 📦 安装方式

### 方式 1: 从 VS Code 市场安装（推荐）
1. 打开 VS Code
2. 按 `Cmd+Shift+X` (macOS) 或 `Ctrl+Shift+X` (Windows/Linux) 打开扩展面板
3. 搜索 "Themes Changing"
4. 点击"更新"按钮

### 方式 2: 手动安装 VSIX 文件
1. 下载 `themes-changing-0.2.1.vsix` 文件
2. 打开 VS Code
3. 按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux) 打开命令面板
4. 输入 "Install from VSIX"
5. 选择下载的 `.vsix` 文件

---

## 🧪 测试验证

修复后，以下操作应该正常工作：

1. **打开设置面板**
   - 按 `Cmd+Shift+P` / `Ctrl+Shift+P` 打开命令面板
   - 输入 "Themes Changing: Open Theme Settings"
   - ✅ 应该成功打开设置面板

2. **切换状态**
   - 按 `Cmd+Shift+P` / `Ctrl+Shift+P` 打开命令面板
   - 输入 "Themes Changing: Toggle Theme Switching"
   - ✅ 应该成功暂停/恢复主题切换

---

## 📊 版本信息

- **版本号**: 0.2.1
- **发布日期**: 2025-09-30
- **包大小**: 194 KB
- **文件数**: 28 个文件
- **发布者**: AlfredZhao

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/runwezh/themes-changing
- **问题反馈**: https://github.com/runwezh/themes-changing/issues
- **完整更新日志**: 查看 [CHANGELOG.md](./CHANGELOG.md)

---

## 💬 反馈与支持

如果您在使用过程中遇到任何问题，请：
1. 在 GitHub 上提交 Issue
2. 提供详细的错误信息和复现步骤
3. 附上您的 VS Code 版本和操作系统信息

感谢您的使用和支持！🙏

