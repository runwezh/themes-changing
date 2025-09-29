# BMad Knowledge Base

## Overview
BMad (Business Method and Development) is a comprehensive methodology for managing software development projects, documentation, and business processes through structured templates, tasks, and workflows.

## Core Concepts

### BMad Master Agent
The BMad Master is a universal task executor that can run any BMad resource without persona transformation. It provides:
- Direct execution of tasks, templates, and checklists
- Runtime resource loading
- Expert knowledge across all BMad capabilities
- Numbered list presentations for user choices

### Resource Types

#### Tasks (.bmad-core/tasks/)
Executable workflows that guide users through specific processes:
- **create-doc**: Generate documents from templates
- **document-project**: Analyze and document project structure
- **execute-checklist**: Run interactive checklists
- **create-next-story**: Create user stories in sequence
- **shard-doc**: Break large documents into manageable pieces
- **advanced-elicitation**: Sophisticated information gathering

#### Templates (.bmad-core/templates/)
Structured document templates with fields and validation:
- **prd-tmpl.yaml**: Product Requirements Document
- **story-tmpl.yaml**: User Story template
- **architecture-tmpl.yaml**: Software Architecture Document
- **project-brief-tmpl.yaml**: Project overview and planning

#### Checklists (.bmad-core/checklists/)
Interactive verification lists for quality assurance:
- **architect-checklist.md**: Architecture review checklist
- **story-dod-checklist.md**: Story Definition of Done
- **pm-checklist.md**: Project management checklist
- **change-checklist.md**: Change management checklist

#### Workflows (.bmad-core/workflows/)
End-to-end process guides for complex scenarios:
- **greenfield-fullstack.md**: New full-stack project setup
- **brownfield-service.md**: Adding services to existing systems
- **brownfield-ui.md**: UI enhancement workflows

## Command Reference

### Core Commands
- `*help`: Display available commands
- `*task {task}`: Execute specific task or list available tasks
- `*create-doc {template}`: Create document from template
- `*execute-checklist {checklist}`: Run interactive checklist
- `*document-project`: Generate project documentation
- `*kb`: Toggle knowledge base mode
- `*exit`: Exit BMad mode

### Command Syntax
- All commands require `*` prefix
- Parameters in `{braces}` are required
- Optional parameters shown in `[brackets]`
- Commands without parameters show available options

## Best Practices

### Task Execution
1. Always read task instructions completely
2. Follow elicitation prompts exactly as specified
3. Provide complete information when prompted
4. Use numbered selections when presented with options
5. Save progress regularly during long tasks

### Template Usage
1. Select appropriate template for document type
2. Gather all required information before starting
3. Provide meaningful content for all fields
4. Review generated document before finalizing
5. Customize templates for specific project needs

### Checklist Management
1. Execute checklists systematically
2. Document any deviations or exceptions
3. Add notes for complex items
4. Track completion progress
5. Use checklists for quality gates

## Integration Guidelines

### VS Code Extension Integration
BMad can be integrated into VS Code extensions to provide:
- Command palette integration
- Webview-based interfaces
- File system integration
- Project context awareness
- Settings synchronization

### Project Configuration
The `core-config.yaml` file defines:
- Project metadata and context
- Technology stack information
- Path configurations
- Integration settings
- Custom field definitions

## Troubleshooting

### Common Issues
1. **Command not recognized**: Ensure `*` prefix is used
2. **Template not found**: Check template exists in `.bmad-core/templates/`
3. **Task execution fails**: Verify all required parameters provided
4. **File access errors**: Check file permissions and paths
5. **Elicitation timeout**: Provide input within reasonable time

### Error Recovery
1. Use `*help` to verify available commands
2. Check file system permissions
3. Validate configuration files
4. Restart BMad session if needed
5. Review error messages for specific guidance

## Customization

### Adding Custom Templates
1. Create YAML file in `.bmad-core/templates/`
2. Define template structure and fields
3. Add validation rules
4. Update command references
5. Test template generation

### Creating Custom Tasks
1. Create markdown file in `.bmad-core/tasks/`
2. Define workflow steps
3. Add elicitation prompts
4. Specify dependencies
5. Document expected outputs

### Extending Checklists
1. Create markdown file in `.bmad-core/checklists/`
2. Organize items by category
3. Add descriptions and guidance
4. Define completion criteria
5. Test interactive execution
