# BMad Integration for Themes Changing Extension

## 概述

您的 VS Code 主题切换插件现在已经成功集成了 BMad (Business Method and Development) 功能！BMad 是一个综合性的项目管理和文档生成方法论，提供结构化的模板、任务和工作流程。

## 🚀 功能特性

### BMad Master 代理
- **通用任务执行器**：可以直接运行任何 BMad 资源
- **运行时资源加载**：按需加载模板、任务和检查清单
- **专家知识库**：涵盖所有 BMad 功能的知识库
- **编号列表选择**：用户友好的选择界面

### 核心功能
1. **任务执行** - 运行预定义的工作流程
2. **文档生成** - 基于模板创建结构化文档
3. **检查清单** - 交互式质量保证清单
4. **项目文档化** - 自动分析和文档化项目结构
5. **知识库** - 访问 BMad 方法论知识库

## 📋 可用命令

在 VS Code 命令面板中（Ctrl+Shift+P / Cmd+Shift+P），您可以使用以下 BMad 命令：

### 基础命令
- **BMad: Help** - 显示帮助信息和可用命令
- **BMad: Knowledge Base** - 访问 BMad 知识库

### 任务管理
- **BMad: Execute Task** - 执行特定任务或列出所有可用任务
- **BMad: Document Project** - 生成项目文档

### 文档创建
- **BMad: Create Document** - 基于模板创建文档
- **BMad: Execute Checklist** - 运行交互式检查清单

## 📁 目录结构

BMad 集成在您的项目中创建了以下目录结构：

```
.bmad-core/
├── core-config.yaml          # 项目配置文件
├── tasks/                    # 任务定义
│   ├── create-doc.md
│   ├── document-project.md
│   ├── execute-checklist.md
│   ├── create-next-story.md
│   ├── shard-doc.md
│   └── advanced-elicitation.md
├── templates/                # 文档模板
│   ├── prd-tmpl.yaml        # 产品需求文档
│   ├── story-tmpl.yaml      # 用户故事
│   ├── architecture-tmpl.yaml # 架构文档
│   └── project-brief-tmpl.yaml # 项目简介
├── checklists/              # 检查清单
│   ├── architect-checklist.md
│   ├── story-dod-checklist.md
│   ├── pm-checklist.md
│   └── change-checklist.md
├── data/                    # 数据文件
│   └── bmad-kb.md          # 知识库
└── workflows/               # 工作流程
    ├── greenfield-fullstack.md
    └── brownfield-service.md
```

## 🎯 使用示例

### 1. 查看帮助
1. 打开命令面板（Ctrl+Shift+P）
2. 输入 "BMad: Help"
3. 查看 BMad Master 输出面板获取详细信息

### 2. 创建产品需求文档
1. 运行 "BMad: Create Document"
2. 输入 "prd"（或留空查看所有模板）
3. 查看输出面板了解模板字段要求

### 3. 执行架构检查清单
1. 运行 "BMad: Execute Checklist"
2. 输入 "architect"（或留空查看所有检查清单）
3. 按照输出面板的指导进行检查

### 4. 生成项目文档
1. 运行 "BMad: Document Project"
2. 查看输出面板的项目分析结果

## 🔧 自定义配置

### 项目配置
编辑 `.bmad-core/core-config.yaml` 来自定义：
- 项目元数据
- 技术栈信息
- 路径配置
- 集成设置

### 添加自定义模板
1. 在 `.bmad-core/templates/` 中创建新的 YAML 文件
2. 定义模板结构和字段
3. 添加验证规则

### 创建自定义任务
1. 在 `.bmad-core/tasks/` 中创建新的 Markdown 文件
2. 定义工作流程步骤
3. 添加用户交互提示

## 📊 输出和日志

所有 BMad 操作的输出都显示在 "BMad Master" 输出面板中：
1. 打开 VS Code 输出面板（View > Output）
2. 从下拉菜单中选择 "BMad Master"
3. 查看详细的执行日志和结果

## 🚀 下一步

1. **探索模板**：尝试不同的文档模板
2. **运行检查清单**：使用质量保证检查清单
3. **自定义工作流**：根据项目需求调整任务和模板
4. **团队协作**：与团队分享 BMad 配置和最佳实践

## 🔗 集成优势

BMad 与您的主题切换插件完美集成：
- **统一界面**：通过 VS Code 命令面板访问所有功能
- **项目感知**：自动识别项目类型和结构
- **无缝工作流**：在开发环境中直接使用项目管理工具
- **可扩展性**：轻松添加新的模板、任务和工作流

享受使用 BMad 增强的开发体验！🎉
