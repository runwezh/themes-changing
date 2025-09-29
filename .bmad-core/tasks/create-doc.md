# Create Document Task

## Description
Creates a new document based on a specified template with user input and customization.

## Parameters
- `template`: Template name to use (required)
- `destination`: Output file path (optional, will prompt if not provided)

## Workflow

### Step 1: Template Selection
```yaml
elicit: true
prompt: |
  Available templates:
  1. PRD Template (prd-tmpl.yaml)
  2. Architecture Template (architecture-tmpl.yaml)
  3. Story Template (story-tmpl.yaml)
  4. Project Brief Template (project-brief-tmpl.yaml)
  5. Front-end Spec Template (front-end-spec-tmpl.yaml)
  
  Please select a template by number or name:
validation: "Must be a valid template number or name"
```

### Step 2: Load Template
- Load the selected template from `.bmad-core/templates/`
- Parse template structure and required fields

### Step 3: Gather Information
```yaml
elicit: true
prompt: |
  Template loaded: {template_name}
  
  Please provide the following information:
  {template_fields}
  
  Enter values for each field:
```

### Step 4: Generate Document
- Replace template placeholders with user input
- Apply formatting and structure
- Validate completeness

### Step 5: Save Document
```yaml
elicit: true
prompt: |
  Document generated successfully!
  
  Please specify the output file path (or press Enter for default):
  Default: ./docs/{template_name}_{timestamp}.md
```

### Step 6: Confirmation
- Save document to specified location
- Display success message with file path
- Offer to open the document for review

## Output
- Generated document file
- Success confirmation
- File path reference

## Dependencies
- Template files in `.bmad-core/templates/`
- Write access to output directory

## Error Handling
- Invalid template selection: Re-prompt for valid template
- Missing required fields: Prompt for missing information
- File write errors: Suggest alternative paths
- Template not found: List available templates
