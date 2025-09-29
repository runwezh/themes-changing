import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface BMadConfig {
    project: {
        name: string;
        type: string;
        description: string;
        version: string;
    };
    bmad: {
        version: string;
        agent: string;
    };
    paths: {
        [key: string]: string;
    };
}

export interface TaskDefinition {
    name: string;
    description: string;
    workflow: Record<string, unknown>;
}

export interface TemplateField {
    type: string;
    required?: boolean;
    description?: string;
    options?: string[];
}

export interface TemplateDefinition {
    template: {
        name: string;
        version: string;
        description: string;
    };
    structure: Record<string, unknown>;
    fields: Record<string, TemplateField>;
}

export class BMadManager {
    private config: BMadConfig | undefined;
    private bmadPath: string;
    private outputChannel: vscode.OutputChannel;

    constructor(private context: vscode.ExtensionContext) {
        this.bmadPath = path.join(vscode.workspace.rootPath || '', '.bmad-core');
        this.outputChannel = vscode.window.createOutputChannel('BMad Master');
    }

    public async initialize(): Promise<boolean> {
        try {
            await this.loadConfig();
            this.outputChannel.appendLine('BMad Master initialized successfully');
            return true;
        } catch (error) {
            this.outputChannel.appendLine(`BMad initialization failed: ${error}`);
            return false;
        }
    }

    private async loadConfig(): Promise<void> {
        const configPath = path.join(this.bmadPath, 'core-config.yaml');
        
        if (!fs.existsSync(configPath)) {
            throw new Error('BMad core configuration not found. Please run BMad setup first.');
        }

        const configContent = fs.readFileSync(configPath, 'utf8');
        this.config = yaml.load(configContent) as BMadConfig;
    }

    public async executeCommand(command: string, args?: string[]): Promise<void> {
        this.outputChannel.show();
        this.outputChannel.appendLine(`\n🧙 BMad Master - Executing: *${command}`);

        switch (command) {
            case 'help':
                await this.showHelp();
                break;
            case 'task':
                await this.executeTask(args?.[0]);
                break;
            case 'create-doc':
                await this.createDocument(args?.[0]);
                break;
            case 'execute-checklist':
                await this.executeChecklist(args?.[0]);
                break;
            case 'document-project':
                await this.documentProject();
                break;
            case 'kb':
                await this.toggleKnowledgeBase();
                break;
            default:
                this.outputChannel.appendLine(`❌ Unknown command: ${command}`);
                await this.showHelp();
        }
    }

    private async showHelp(): Promise<void> {
        const helpText = `
📋 BMad Master Commands:

1. *help - Show this help message
2. *task {task} - Execute task or list available tasks
3. *create-doc {template} - Create document from template
4. *execute-checklist {checklist} - Run interactive checklist
5. *document-project - Generate project documentation
6. *kb - Toggle knowledge base mode
7. *exit - Exit BMad mode

Available Tasks:
${await this.listTasks()}

Available Templates:
${await this.listTemplates()}

Available Checklists:
${await this.listChecklists()}
        `;
        
        this.outputChannel.appendLine(helpText);
    }

    private async listTasks(): Promise<string> {
        const tasksPath = path.join(this.bmadPath, 'tasks');
        if (!fs.existsSync(tasksPath)) {
            return '  No tasks available';
        }

        const files = fs.readdirSync(tasksPath).filter(f => f.endsWith('.md'));
        return files.map((f, i) => `  ${i + 1}. ${f.replace('.md', '')}`).join('\n');
    }

    private async listTemplates(): Promise<string> {
        const templatesPath = path.join(this.bmadPath, 'templates');
        if (!fs.existsSync(templatesPath)) {
            return '  No templates available';
        }

        const files = fs.readdirSync(templatesPath).filter(f => f.endsWith('.yaml'));
        return files.map((f, i) => `  ${i + 1}. ${f.replace('-tmpl.yaml', '')}`).join('\n');
    }

    private async listChecklists(): Promise<string> {
        const checklistsPath = path.join(this.bmadPath, 'checklists');
        if (!fs.existsSync(checklistsPath)) {
            return '  No checklists available';
        }

        const files = fs.readdirSync(checklistsPath).filter(f => f.endsWith('.md'));
        return files.map((f, i) => `  ${i + 1}. ${f.replace('-checklist.md', '')}`).join('\n');
    }

    private async executeTask(taskName?: string): Promise<void> {
        if (!taskName) {
            this.outputChannel.appendLine('\n📋 Available Tasks:');
            this.outputChannel.appendLine(await this.listTasks());
            return;
        }

        const taskPath = path.join(this.bmadPath, 'tasks', `${taskName}.md`);
        if (!fs.existsSync(taskPath)) {
            this.outputChannel.appendLine(`❌ Task not found: ${taskName}`);
            return;
        }

        this.outputChannel.appendLine(`\n🚀 Executing task: ${taskName}`);
        
        // For now, just show the task content
        const taskContent = fs.readFileSync(taskPath, 'utf8');
        this.outputChannel.appendLine('\n📄 Task Definition:');
        this.outputChannel.appendLine(taskContent);
        
        // In a full implementation, this would parse and execute the task workflow
        vscode.window.showInformationMessage(`Task "${taskName}" loaded. Check BMad Master output for details.`);
    }

    private async createDocument(templateName?: string): Promise<void> {
        if (!templateName) {
            this.outputChannel.appendLine('\n📋 Available Templates:');
            this.outputChannel.appendLine(await this.listTemplates());
            return;
        }

        const templatePath = path.join(this.bmadPath, 'templates', `${templateName}-tmpl.yaml`);
        if (!fs.existsSync(templatePath)) {
            this.outputChannel.appendLine(`❌ Template not found: ${templateName}`);
            return;
        }

        this.outputChannel.appendLine(`\n📝 Creating document from template: ${templateName}`);
        
        try {
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const template = yaml.load(templateContent) as TemplateDefinition;
            
            this.outputChannel.appendLine(`\n📋 Template: ${template.template.name}`);
            this.outputChannel.appendLine(`Description: ${template.template.description}`);
            
            // Show template fields
            if (template.fields) {
                this.outputChannel.appendLine('\n📝 Required Fields:');
                Object.entries(template.fields).forEach(([key, field]: [string, TemplateField]) => {
                    this.outputChannel.appendLine(`  • ${key}: ${field.description || 'No description'}`);
                });
            }
            
            vscode.window.showInformationMessage(`Template "${templateName}" loaded. Check BMad Master output for field requirements.`);
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error loading template: ${error}`);
        }
    }

    private async executeChecklist(checklistName?: string): Promise<void> {
        if (!checklistName) {
            this.outputChannel.appendLine('\n📋 Available Checklists:');
            this.outputChannel.appendLine(await this.listChecklists());
            return;
        }

        const checklistPath = path.join(this.bmadPath, 'checklists', `${checklistName}-checklist.md`);
        if (!fs.existsSync(checklistPath)) {
            this.outputChannel.appendLine(`❌ Checklist not found: ${checklistName}`);
            return;
        }

        this.outputChannel.appendLine(`\n✅ Executing checklist: ${checklistName}`);
        
        const checklistContent = fs.readFileSync(checklistPath, 'utf8');
        this.outputChannel.appendLine('\n📄 Checklist Content:');
        this.outputChannel.appendLine(checklistContent);
        
        vscode.window.showInformationMessage(`Checklist "${checklistName}" loaded. Check BMad Master output for details.`);
    }

    private async documentProject(): Promise<void> {
        this.outputChannel.appendLine('\n📚 Generating project documentation...');
        
        if (!this.config) {
            this.outputChannel.appendLine('❌ BMad configuration not loaded');
            return;
        }

        this.outputChannel.appendLine(`\n📋 Project: ${this.config.project.name}`);
        this.outputChannel.appendLine(`Type: ${this.config.project.type}`);
        this.outputChannel.appendLine(`Description: ${this.config.project.description}`);
        this.outputChannel.appendLine(`Version: ${this.config.project.version}`);
        
        // Analyze current project structure
        const workspaceRoot = vscode.workspace.rootPath;
        if (workspaceRoot) {
            this.outputChannel.appendLine('\n📁 Project Structure Analysis:');
            this.analyzeProjectStructure(workspaceRoot);
        }
        
        vscode.window.showInformationMessage('Project documentation analysis complete. Check BMad Master output.');
    }

    private analyzeProjectStructure(rootPath: string): void {
        try {
            const items = fs.readdirSync(rootPath);
            const directories = items.filter(item => {
                const itemPath = path.join(rootPath, item);
                return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
            });
            
            const files = items.filter(item => {
                const itemPath = path.join(rootPath, item);
                return fs.statSync(itemPath).isFile() && !item.startsWith('.');
            });
            
            this.outputChannel.appendLine(`  📁 Directories: ${directories.join(', ')}`);
            this.outputChannel.appendLine(`  📄 Files: ${files.join(', ')}`);
            
            // Check for common project files
            const commonFiles = ['package.json', 'tsconfig.json', 'README.md', 'LICENSE'];
            const foundFiles = commonFiles.filter(file => files.includes(file));
            if (foundFiles.length > 0) {
                this.outputChannel.appendLine(`  ✅ Found: ${foundFiles.join(', ')}`);
            }
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error analyzing structure: ${error}`);
        }
    }

    private async toggleKnowledgeBase(): Promise<void> {
        const kbPath = path.join(this.bmadPath, 'data', 'bmad-kb.md');
        
        if (!fs.existsSync(kbPath)) {
            this.outputChannel.appendLine('❌ Knowledge base not found');
            return;
        }

        this.outputChannel.appendLine('\n📚 BMad Knowledge Base:');
        const kbContent = fs.readFileSync(kbPath, 'utf8');
        this.outputChannel.appendLine(kbContent);
        
        vscode.window.showInformationMessage('Knowledge base loaded. Check BMad Master output.');
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}
