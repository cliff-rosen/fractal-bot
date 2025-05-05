# Step Component Specification

## Layout Structure
- Grid layout with 6 columns:
  1. Status (100px fixed)
  2. Name (200px fixed)
  3. Action (200px fixed)
  4. Inputs (flexible, min 200px)
  5. Outputs (flexible, min 200px)
  6. Actions (100px fixed)
- Gap of 4 units between columns
- Consistent indentation for substeps (20px per level)

## Business Rules

### Step Types
1. Atomic Steps:
   - Must have a tool selected
   - Show inputs and outputs when tool is selected
   - Inputs can be mapped to available variables
   - Outputs are determined by the selected tool

2. Composite Steps:
   - Must have at least 2 substeps
   - Can contain both atomic and composite substeps
   - Don't show inputs/outputs directly
   - Show "Add Substep" button inline with name

### Status Progression
1. Status States:
   - `unresolved`: Initial state, needs configuration
   - `pending_inputs_ready`: Tool selected, waiting for inputs
   - `ready`: All required inputs mapped and ready
   - `in_progress`: Step is executing
   - `completed`: Step finished successfully
   - `failed`: Step execution failed

2. Status Dependencies:
   - Atomic steps depend on tool selection and input mapping
   - Composite steps depend on substep statuses
   - Parent steps reflect child step statuses

### Variable Mapping
1. Input Rules:
   - Only available for atomic steps with selected tools
   - Must match schema requirements of tool inputs
   - Can map to parent inputs or sibling outputs
   - Shows status of mapped variables

2. Output Rules:
   - Determined by selected tool
   - Available to child steps and siblings
   - Shows status of generated outputs

## UX Rules

### Visual Hierarchy
1. Status Display:
   - Color-coded badges (green=ready, red=failed, blue=in_progress, yellow=pending)
   - Icon + text combination
   - Consistent positioning in first column

2. Name and Actions:
   - Name truncates if too long
   - Action buttons (edit, AI, delete) in rightmost column
   - "Add Substep" button inline with name for composite steps
   - Proper indentation for substeps

### Interaction Patterns
1. Step Type Selection:
   - Dropdown in Action column
   - Immediate visual feedback on selection
   - Tool selector appears only for atomic steps

2. Tool Selection:
   - Dropdown below step type
   - Shows all available tools
   - Triggers input/output display

3. Variable Mapping:
   - Dropdown selectors for inputs
   - Shows available variables based on context
   - Visual feedback on mapping status

### Responsive Behavior
1. Column Sizing:
   - Fixed widths for status, name, action, and actions columns
   - Flexible widths for inputs/outputs
   - Minimum widths to prevent squishing

2. Content Overflow:
   - Names truncate with ellipsis
   - Inputs/outputs scroll vertically if needed
   - Maintains readability at all depths

### Accessibility
1. Interactive Elements:
   - Clear hover states
   - Consistent button sizes
   - Proper contrast ratios
   - Keyboard navigation support

2. Status Indicators:
   - Color + icon + text for redundancy
   - Clear error messaging
   - Consistent positioning

## State Management
1. Step State:
   - Maintains type (atomic/composite)
   - Tracks selected tool
   - Manages input/output mappings
   - Updates status based on dependencies

2. Parent-Child Relationships:
   - Proper indentation
   - Status propagation
   - Variable availability rules
   - Substeps management

## Implementation Notes

### Component Structure
```typescript
interface StepProps {
    step: Step;
    parentStep?: Step;
    onAddSubstep: (step: Step) => void;
    onEditStep?: (step: Step) => void;
    onDeleteStep?: (stepId: string) => void;
    onStepTypeChange?: (step: Step, type: 'atomic' | 'composite') => void;
    onToolSelect?: (step: Step, toolId: string) => void;
    onInputSelect?: (step: Step, input: WorkflowVariable) => void;
    onOutputSelect?: (step: Step, output: WorkflowVariable) => void;
    onUpdateStep: (step: Step) => void;
    availableTools?: Tool[];
    availableInputs?: WorkflowVariable[];
    depth?: number;
}
```

### Key Helper Components
1. `StepStatusDisplay`: Handles status visualization
2. `VariableStatusBadge`: Shows variable status
3. `VariableList`: Manages input/output variable display and selection

### State Management
- Uses React's `useMemo` for derived state
- Handles step type changes
- Manages tool selection
- Tracks variable mappings
- Updates step status

### Event Handling
- Click events for action buttons
- Change events for dropdowns
- Selection events for variables
- Proper event propagation control 