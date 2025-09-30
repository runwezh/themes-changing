# 快速发布指南 / Quick Publish Guide

## 🚀 准备就绪！Ready to Publish!

版本 **v0.2.2** 已经打包完成，可以发布了！

---

## 📦 打包信息 / Package Info

- **文件名**: `themes-changing-0.2.2.vsix`
- **大小**: 160 KB
- **版本**: 0.2.2
- **状态**: ✅ 已测试，准备发布

---

## 🎯 发布选项 / Publishing Options

### 选项 1：VS Code Marketplace（推荐）

#### 通过网页发布：
1. 访问：https://marketplace.visualstudio.com/manage
2. 登录你的 Microsoft 账号
3. 找到 "AlfredZhao" 发布者
4. 点击 "Update" 或 "New Extension"
5. 上传 `themes-changing-0.2.2.vsix`
6. 点击 "Upload" 完成

#### 通过命令行发布：
```bash
# 首次需要登录（如果还没登录）
vsce login AlfredZhao

# 发布
vsce publish

# 或者指定 VSIX 文件
vsce publish --packagePath themes-changing-0.2.2.vsix
```

---

### 选项 2：本地测试安装

在发布到 Marketplace 之前，你可以先本地测试：

```bash
# 方法 1：命令行安装
code --install-extension themes-changing-0.2.2.vsix

# 方法 2：通过 VS Code UI
# 1. 打开 VS Code
# 2. 进入扩展面板 (Cmd/Ctrl + Shift + X)
# 3. 点击 "..." 菜单
# 4. 选择 "Install from VSIX..."
# 5. 选择 themes-changing-0.2.2.vsix
```

测试要点：
- ✅ 插件能正常激活
- ✅ 打开设置界面（Cmd+Shift+P -> "Themes Changing: Open Theme Settings"）
- ✅ 选择主题并保存
- ✅ 主题自动切换功能正常
- ✅ 暂停/恢复功能正常

---

### 选项 3：GitHub Release

1. **提交代码到 Git**
```bash
git add .
git commit -m "chore: release v0.2.2 - remove BMad integration, focus on core features"
git tag v0.2.2
git push origin main
git push origin v0.2.2
```

2. **创建 GitHub Release**
   - 访问：https://github.com/runwezh/themes-changing/releases/new
   - Tag: `v0.2.2`
   - Title: `v0.2.2 - Focus on Core Theme Switching`
   - Description:
   ```markdown
   ## 🧹 重构 / Refactoring
   
   - **移除 BMad 集成**: 完全移除了 BMad 项目管理功能，让插件专注于核心的主题切换功能
     - 删除了所有 BMad 相关的命令和代码
     - 移除了 `.bmad-core` 目录及其所有内容
     - 卸载了 `js-yaml` 和 `@types/js-yaml` 依赖
     - 简化了插件描述和关键词
     - 减小了插件体积（从 200KB 到 160KB），提升了启动速度
   
   ## 🐛 Bug 修复 / Bug Fixes
   
   - **修复插件激活问题**: 修复了插件显示"一直在激活中"的问题
     - 移除了可能阻塞激活的 BMad 初始化代码
     - 简化了 `activate` 函数，确保快速激活
   
   ## 📊 改进 / Improvements
   
   - 插件体积减小 20%
   - 启动速度提升
   - 功能更专注于主题切换
   - 代码更简洁易维护
   ```
   - 附加文件：上传 `themes-changing-0.2.2.vsix`

---

## 📋 发布后检查清单 / Post-Publish Checklist

发布后请验证：

- [ ] 在 Marketplace 上能找到扩展
- [ ] 版本号显示为 0.2.2
- [ ] 描述和截图正确显示
- [ ] 可以通过 VS Code 搜索并安装
- [ ] 安装后功能正常工作
- [ ] 更新日志正确显示

---

## 🎉 发布完成后

1. **通知用户**（可选）
   - 在 GitHub 上发布 Release 说明
   - 在社交媒体分享更新
   - 更新项目文档

2. **监控反馈**
   - 关注 GitHub Issues
   - 查看 Marketplace 评论
   - 收集用户反馈

3. **规划下一版本**
   - 根据用户反馈改进
   - 修复发现的 bug
   - 添加新功能

---

## 💡 提示 / Tips

### 如果发布失败：

1. **检查 vsce 登录状态**
   ```bash
   vsce logout
   vsce login AlfredZhao
   ```

2. **验证 package.json**
   - publisher 字段必须是 "AlfredZhao"
   - repository URL 必须正确
   - 所有必需字段都已填写

3. **检查网络连接**
   - 确保能访问 marketplace.visualstudio.com
   - 尝试使用 VPN（如果在中国）

### 版本号规则：

- **补丁版本** (0.2.x): Bug 修复
- **次要版本** (0.x.0): 新功能
- **主要版本** (x.0.0): 重大变更

当前是 **0.2.2**，下一个版本建议：
- Bug 修复 → 0.2.3
- 新功能 → 0.3.0
- 重大变更 → 1.0.0

---

## 📞 需要帮助？/ Need Help?

- VS Code 扩展发布文档：https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- vsce 工具文档：https://github.com/microsoft/vscode-vsce
- Marketplace 管理：https://marketplace.visualstudio.com/manage

---

## ✅ 准备发布！/ Ready to Publish!

一切准备就绪！选择上面的一个发布选项开始吧！

**推荐流程：**
1. 先本地测试安装（选项 2）
2. 确认无误后发布到 Marketplace（选项 1）
3. 最后创建 GitHub Release（选项 3）

祝发布顺利！🚀

