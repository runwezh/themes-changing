# Shard Document Task

## Description
Breaks down a large document into smaller, manageable sections or "shards" for easier editing, review, and maintenance.

## Parameters
- `document`: Source document to shard (required)
- `destination`: Output directory for shards (required)

## Workflow

### Step 1: Document Analysis
- Load and parse the source document
- Identify natural break points (headers, sections, chapters)
- Analyze document structure and hierarchy
- Estimate optimal shard sizes

### Step 2: Sharding Strategy
```yaml
elicit: true
prompt: |
  Document analysis complete:
  
  Document: {document_name}
  Total size: {document_size}
  Sections found: {section_count}
  
  Sharding options:
  1. By main headers (H1) - {h1_count} shards
  2. By sub-headers (H2) - {h2_count} shards
  3. By page/size limit - {size_based_count} shards
  4. Custom breakpoints
  
  Please select sharding strategy:
```

### Step 3: Shard Configuration
```yaml
elicit: true
prompt: |
  Shard configuration:
  
  1. Naming convention:
     - Sequential: doc-001.md, doc-002.md
     - Descriptive: intro.md, features.md, api.md
     - Custom pattern
  
  2. Include cross-references: Yes/No
  3. Generate index file: Yes/No
  4. Preserve metadata: Yes/No
  
  Please specify preferences:
```

### Step 4: Execute Sharding
- Split document according to strategy
- Create individual shard files
- Maintain formatting and structure
- Generate navigation links

### Step 5: Post-Processing
- Create index/table of contents
- Add navigation between shards
- Validate all links and references
- Generate assembly instructions

### Step 6: Verification
```yaml
elicit: true
prompt: |
  Sharding complete!
  
  Generated {shard_count} shards in {destination}:
  {shard_list}
  
  Additional files created:
  - index.md (navigation)
  - assembly.md (reconstruction guide)
  
  Would you like to:
  1. Review shard contents
  2. Modify shard boundaries
  3. Regenerate with different settings
  4. Finalize and complete
```

## Output
- Multiple shard files
- Index/navigation file
- Assembly instructions
- Cross-reference mapping

## Dependencies
- Read access to source document
- Write access to destination directory
- Markdown parsing capabilities
