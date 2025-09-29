# Document Project Task

## Description
Analyzes the current project structure and generates comprehensive documentation including architecture, features, and usage guides.

## Workflow

### Step 1: Project Analysis
- Scan project directory structure
- Identify key files and components
- Analyze package.json and configuration files
- Extract project metadata

### Step 2: Code Analysis
- Parse source files for:
  - Main entry points
  - Key functions and classes
  - Configuration options
  - Command definitions
  - API interfaces

### Step 3: Feature Documentation
```yaml
elicit: true
prompt: |
  Project analysis complete. Found the following features:
  {discovered_features}
  
  Please provide additional context for:
  1. Main use cases
  2. Target audience
  3. Key benefits
  4. Future roadmap items
```

### Step 4: Generate Documentation Sections
- **README.md**: Overview, installation, usage
- **ARCHITECTURE.md**: Technical architecture and design
- **API.md**: Command and configuration reference
- **CONTRIBUTING.md**: Development guidelines
- **CHANGELOG.md**: Version history and changes

### Step 5: Documentation Review
```yaml
elicit: true
prompt: |
  Documentation generated with the following sections:
  {doc_sections}
  
  Would you like to:
  1. Review and edit any section
  2. Add additional sections
  3. Finalize and save all documentation
  
  Please select an option:
```

### Step 6: Finalization
- Save all documentation files
- Update existing docs if they exist
- Create docs directory structure
- Generate table of contents

## Output Files
- `README.md` - Project overview and quick start
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/API.md` - Command and configuration reference
- `docs/CONTRIBUTING.md` - Development guidelines
- `docs/CHANGELOG.md` - Version history

## Dependencies
- Read access to project files
- Write access to docs directory
- Project configuration files

## Configuration
```yaml
output_directory: "./docs"
include_code_examples: true
generate_api_docs: true
include_screenshots: false
format: "markdown"
```
