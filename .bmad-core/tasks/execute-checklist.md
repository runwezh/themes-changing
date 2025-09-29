# Execute Checklist Task

## Description
Runs through a specified checklist interactively, tracking completion status and gathering user input for each item.

## Parameters
- `checklist`: Checklist name to execute (required)

## Workflow

### Step 1: Checklist Selection
```yaml
elicit: true
prompt: |
  Available checklists:
  1. Architecture Checklist (architect-checklist.md)
  2. Change Checklist (change-checklist.md)
  3. PM Checklist (pm-checklist.md)
  4. PO Master Checklist (po-master-checklist.md)
  5. Story DoD Checklist (story-dod-checklist.md)
  6. Story Draft Checklist (story-draft-checklist.md)
  
  Please select a checklist by number or name:
validation: "Must be a valid checklist number or name"
```

### Step 2: Load Checklist
- Load the selected checklist from `.bmad-core/checklists/`
- Parse checklist items and categories
- Initialize tracking state

### Step 3: Execute Checklist Items
For each checklist item:
```yaml
elicit: true
prompt: |
  Checklist: {checklist_name}
  Progress: {completed_items}/{total_items}
  
  Current Item: {item_title}
  Description: {item_description}
  
  Status: [ ] Not completed / [x] Completed / [-] Not applicable
  
  Please enter:
  1. 'y' or 'yes' to mark as completed
  2. 'n' or 'no' to mark as not completed
  3. 'na' to mark as not applicable
  4. 'note: <text>' to add a note
  5. 'skip' to skip this item for now
```

### Step 4: Item Processing
- Update item status based on user input
- Capture notes and comments
- Track completion percentage
- Handle dependencies between items

### Step 5: Progress Review
```yaml
elicit: true
prompt: |
  Checklist Progress Summary:
  
  Completed: {completed_count}/{total_count} ({completion_percentage}%)
  Not Applicable: {na_count}
  Remaining: {remaining_count}
  
  Items with notes: {noted_items}
  
  Would you like to:
  1. Continue with remaining items
  2. Review completed items
  3. Export results
  4. Save and exit
```

### Step 6: Results Export
- Generate completion report
- Save checklist state
- Export to specified format (markdown, JSON, etc.)

## Output
- Completed checklist with status tracking
- Progress report
- Notes and comments
- Completion timestamp

## State Management
- Save progress after each item
- Allow resuming interrupted sessions
- Track completion history

## Dependencies
- Checklist files in `.bmad-core/checklists/`
- Write access for state saving
