# Advanced Elicitation Task

## Description
Conducts sophisticated information gathering using multiple elicitation techniques to extract detailed requirements and insights.

## Workflow

### Step 1: Elicitation Method Selection
```yaml
elicit: true
prompt: |
  Advanced Elicitation Session
  
  Available techniques:
  1. Structured Interview
  2. Use Case Analysis
  3. Scenario Planning
  4. Stakeholder Mapping
  5. Problem Tree Analysis
  6. Solution Brainstorming
  
  Please select technique(s) to use:
```

### Step 2: Context Setting
```yaml
elicit: true
prompt: |
  Session Context:
  
  1. What is the main objective/problem to explore?
  2. Who are the key stakeholders involved?
  3. What constraints or limitations exist?
  4. What is the desired outcome of this session?
```

### Step 3: Technique Execution
Based on selected method, execute appropriate elicitation:

#### Structured Interview
```yaml
elicit: true
prompt: |
  Structured Interview Questions:
  
  Background:
  1. Describe the current situation
  2. What challenges are you facing?
  3. What has been tried before?
  
  Requirements:
  4. What would an ideal solution look like?
  5. What are the must-have features?
  6. What are nice-to-have features?
  
  Constraints:
  7. What are the technical limitations?
  8. What are the budget/time constraints?
  9. What are the organizational constraints?
```

#### Use Case Analysis
```yaml
elicit: true
prompt: |
  Use Case Analysis:
  
  For each use case, please provide:
  1. Actor (who performs the action)
  2. Goal (what they want to achieve)
  3. Preconditions (what must be true before)
  4. Main flow (step-by-step process)
  5. Alternative flows (what could go differently)
  6. Postconditions (what is true after)
```

### Step 4: Information Synthesis
- Analyze gathered information
- Identify patterns and themes
- Highlight conflicts or gaps
- Prioritize findings

### Step 5: Validation
```yaml
elicit: true
prompt: |
  Information Summary:
  {synthesized_findings}
  
  Please review and confirm:
  1. Are these findings accurate?
  2. Is anything missing or unclear?
  3. What are the next steps?
```

## Output
- Detailed elicitation report
- Structured findings
- Recommendations
- Follow-up actions
