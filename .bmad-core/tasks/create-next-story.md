# Create Next Story Task

## Description
Creates the next user story in a sequence, building upon previous stories and maintaining consistency with project goals.

## Workflow

### Step 1: Context Gathering
```yaml
elicit: true
prompt: |
  Creating next story in sequence.
  
  Please provide:
  1. Previous story reference (if any)
  2. Epic or feature area
  3. Priority level (High/Medium/Low)
  4. Target sprint/milestone
```

### Step 2: Story Definition
```yaml
elicit: true
prompt: |
  Story Details:
  
  As a [user type], I want [functionality] so that [benefit].
  
  Please provide:
  - User type/persona:
  - Desired functionality:
  - Expected benefit/value:
```

### Step 3: Acceptance Criteria
```yaml
elicit: true
prompt: |
  Define acceptance criteria for this story:
  
  Given [context]
  When [action]
  Then [expected result]
  
  Please provide multiple scenarios:
```

### Step 4: Technical Considerations
```yaml
elicit: true
prompt: |
  Technical aspects:
  
  1. Dependencies on other stories/features:
  2. Technical complexity (1-5 scale):
  3. Required components/files to modify:
  4. Testing requirements:
  5. Documentation needs:
```

### Step 5: Story Sizing
```yaml
elicit: true
prompt: |
  Story sizing and estimation:
  
  1. Story points (Fibonacci: 1,2,3,5,8,13):
  2. Estimated hours:
  3. Risk factors:
  4. Assumptions:
```

### Step 6: Generate Story Document
- Use story template
- Fill in all provided information
- Add story ID and metadata
- Include links to related stories

## Output
- Complete user story document
- Story ID assignment
- Integration with project backlog

## Dependencies
- Story template (story-tmpl.yaml)
- Project context from core-config.yaml
- Previous stories for reference
