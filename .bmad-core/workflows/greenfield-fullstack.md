# Greenfield Full-Stack Development Workflow

## Overview
Complete workflow for starting a new full-stack application from scratch, including architecture planning, technology selection, and initial implementation.

## Prerequisites
- [ ] Project requirements gathered
- [ ] Stakeholders identified
- [ ] Budget and timeline approved
- [ ] Development team assembled

## Phase 1: Project Planning

### Step 1: Create Project Brief
```
Execute: *create-doc project-brief-tmpl
```
- Define project scope and objectives
- Identify key stakeholders
- Establish timeline and milestones
- Document resource requirements

### Step 2: Requirements Analysis
```
Execute: *task advanced-elicitation
```
- Conduct stakeholder interviews
- Gather functional requirements
- Identify non-functional requirements
- Document user personas and use cases

### Step 3: Technology Stack Selection
Consider factors:
- Project requirements and constraints
- Team expertise and preferences
- Scalability and performance needs
- Maintenance and support requirements
- Budget and licensing considerations

## Phase 2: Architecture Design

### Step 4: System Architecture
```
Execute: *create-doc architecture-tmpl
```
- Design high-level system architecture
- Define component interactions
- Plan data flow and storage
- Address security and performance requirements

### Step 5: Architecture Review
```
Execute: *execute-checklist architect-checklist
```
- Validate architecture decisions
- Review scalability and performance
- Ensure security requirements are met
- Confirm technology choices

## Phase 3: Project Setup

### Step 6: Development Environment
- [ ] Set up version control repository
- [ ] Configure development environments
- [ ] Establish CI/CD pipeline
- [ ] Set up project management tools
- [ ] Configure monitoring and logging

### Step 7: Project Structure
- [ ] Create project directory structure
- [ ] Set up frontend application
- [ ] Set up backend services
- [ ] Configure database schemas
- [ ] Establish coding standards

### Step 8: Initial Configuration
- [ ] Configure build systems
- [ ] Set up testing frameworks
- [ ] Configure linting and formatting
- [ ] Set up documentation generation
- [ ] Configure security scanning

## Phase 4: Core Development

### Step 9: Backend Development
- [ ] Implement core API endpoints
- [ ] Set up authentication and authorization
- [ ] Implement data access layer
- [ ] Add input validation and error handling
- [ ] Implement business logic

### Step 10: Frontend Development
- [ ] Set up routing and navigation
- [ ] Implement core UI components
- [ ] Integrate with backend APIs
- [ ] Add state management
- [ ] Implement user authentication

### Step 11: Database Implementation
- [ ] Create database schemas
- [ ] Implement data migrations
- [ ] Set up data seeding
- [ ] Configure backup strategies
- [ ] Optimize database performance

## Phase 5: Integration & Testing

### Step 12: Integration Testing
- [ ] Test API integrations
- [ ] Validate data flow
- [ ] Test authentication flows
- [ ] Verify error handling
- [ ] Test performance under load

### Step 13: User Acceptance Testing
- [ ] Prepare test scenarios
- [ ] Conduct user testing sessions
- [ ] Gather feedback and iterate
- [ ] Validate business requirements
- [ ] Document test results

## Phase 6: Deployment Preparation

### Step 14: Production Environment
- [ ] Set up production infrastructure
- [ ] Configure deployment pipelines
- [ ] Set up monitoring and alerting
- [ ] Configure backup and recovery
- [ ] Implement security measures

### Step 15: Documentation
```
Execute: *task document-project
```
- Create user documentation
- Document API specifications
- Write deployment guides
- Create troubleshooting guides
- Document maintenance procedures

## Phase 7: Launch & Monitoring

### Step 16: Production Deployment
- [ ] Deploy to production environment
- [ ] Verify all systems operational
- [ ] Monitor performance metrics
- [ ] Validate security measures
- [ ] Confirm backup procedures

### Step 17: Post-Launch Support
- [ ] Monitor system performance
- [ ] Address any issues promptly
- [ ] Gather user feedback
- [ ] Plan future enhancements
- [ ] Document lessons learned

## Quality Gates

### Architecture Review Gate
```
Execute: *execute-checklist architect-checklist
```
Must pass before proceeding to implementation.

### Code Quality Gate
- [ ] Code review completed
- [ ] Unit tests passing (>80% coverage)
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Deployment Readiness Gate
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance testing passed
- [ ] Documentation complete
- [ ] Monitoring configured

## Success Criteria
- [ ] All functional requirements implemented
- [ ] Non-functional requirements met
- [ ] User acceptance criteria satisfied
- [ ] Production deployment successful
- [ ] Team knowledge transfer completed

## Deliverables
- Project brief and requirements
- System architecture documentation
- Source code and documentation
- Test results and reports
- Deployment and operations guides
- User training materials
