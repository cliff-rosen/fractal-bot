# Input/Output Tracking and Schema Enforcement Specification

## Current State Analysis

### 1. Input/Output Tracking
- Currently, inputs and outputs are tracked separately from assets
- Workflow variables are stored in `WorkflowVariable` model with `io_type` field
- Basic validation exists for workflow inputs through `validateWorkflowInputs`
- Assets are tracked separately with their own status and lifecycle
- No clear connection between assets and workflow inputs/outputs

### 2. Schema Enforcement
- Basic schema validation exists through `validateSchemaValue`
- Tool inputs/outputs have schema definitions but enforcement is incomplete
- `SchemaType` interface exists but lacks comprehensive validation
- No strict type checking between tool schemas and step inputs/outputs
- Limited support for complex nested schemas

## Key Issues

1. **Disconnected Tracking Systems**
   - Assets and inputs/outputs are tracked separately
   - No clear mapping between assets and workflow variables
   - Difficulty in tracing data flow through the system

2. **Incomplete Schema Validation**
   - Tool schemas don't strictly enforce type compatibility
   - Step inputs/outputs don't validate against tool schemas
   - Limited support for complex data structures

3. **Missing Data Flow Tracking**
   - No clear way to track data transformations
   - Difficulty in ensuring data integrity through workflow
   - No validation of data dependencies between steps

## Recommendations

### 1. Unified Asset and Variable System

```typescript
interface UnifiedVariable {
    id: string;
    name: string;
    type: 'asset' | 'input' | 'output';
    schema: Schema;
    value?: SchemaValueType;
    status: VariableStatus;
    dependencies?: string[];  // References to other variables this depends on
    transformations?: {
        tool_id: string;
        step_id: string;
        timestamp: string;
    }[];
}
```

### 2. Enhanced Schema System

```typescript
interface EnhancedSchema extends Schema {
    // Add validation rules
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: string;
        custom?: (value: any) => boolean;
    };
    // Add metadata for tracking
    metadata?: {
        source?: string;  // Where this schema came from
        version?: string;
        deprecated?: boolean;
    };
}

// Schema compatibility checking
function isSchemaCompatible(source: EnhancedSchema, target: EnhancedSchema): boolean {
    // Implement comprehensive schema compatibility checking
    // This would check type compatibility, array status, nested fields, etc.
}
```

### 3. Data Flow Tracking

```typescript
interface DataFlowNode {
    id: string;
    type: 'mission' | 'workflow' | 'stage' | 'step' | 'tool';
    inputs: UnifiedVariable[];
    outputs: UnifiedVariable[];
    dependencies: string[];  // References to other nodes
    transformations: {
        from: string;  // Source variable ID
        to: string;    // Target variable ID
        tool_id: string;
        step_id: string;
        timestamp: string;
    }[];
}

interface DataFlowGraph {
    nodes: Record<string, DataFlowNode>;
    edges: {
        from: string;  // Source node ID
        to: string;    // Target node ID
        variables: string[];  // Variables flowing between nodes
    }[];
}
```

### 4. Tool Integration

```typescript
interface ToolIntegration {
    tool_id: string;
    input_mappings: {
        tool_param: string;
        variable_id: string;
        schema_compatibility: boolean;
    }[];
    output_mappings: {
        tool_output: string;
        variable_id: string;
        schema_compatibility: boolean;
    }[];
    validation_status: 'valid' | 'invalid' | 'warning';
    validation_errors?: string[];
}
```

## Implementation Plan

### Phase 1: Schema Enhancement
1. Extend `Schema` interface with validation rules
2. Implement comprehensive schema compatibility checking
3. Add schema versioning and metadata support

### Phase 2: Unified Variable System
1. Create new `UnifiedVariable` type
2. Implement migration from current asset and variable systems
3. Add data transformation tracking

### Phase 3: Data Flow Tracking
1. Implement `DataFlowNode` and `DataFlowGraph`
2. Create visualization tools for data flow
3. Add validation for data dependencies

### Phase 4: Tool Integration
1. Enhance tool schema validation
2. Implement input/output mapping validation
3. Add compatibility checking between tool and step schemas

## Benefits

1. **Improved Data Integrity**
   - Strict schema validation throughout the system
   - Clear tracking of data transformations
   - Validation of data dependencies

2. **Better Debugging**
   - Clear data flow visualization
   - Easy identification of schema mismatches
   - Tracking of data transformations

3. **Enhanced Tool Integration**
   - Strict validation of tool inputs/outputs
   - Clear mapping between tool and step schemas
   - Better error reporting for schema mismatches

## Migration Strategy

1. **Backward Compatibility**
   - Maintain support for existing schemas
   - Provide migration tools for old data
   - Support both old and new validation systems during transition

2. **Gradual Rollout**
   - Start with new features in new workflows
   - Gradually migrate existing workflows
   - Provide clear documentation and support

3. **Validation Tools**
   - Create tools to validate existing data
   - Provide recommendations for fixing issues
   - Support automated migration where possible 