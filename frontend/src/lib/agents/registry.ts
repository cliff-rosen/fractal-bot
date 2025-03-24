import { AgentExecutor, AgentRegistry } from './types';

class AgentRegistryImpl implements AgentRegistry {
    private executors: Map<string, AgentExecutor> = new Map();

    registerExecutor(executor: AgentExecutor, agentId: string): void {
        if (this.executors.has(agentId)) {
            console.warn(`Executor for agent ${agentId} already exists. Overwriting...`);
        }
        this.executors.set(agentId, executor);
    }

    getExecutor(agentId: string): AgentExecutor | undefined {
        return this.executors.get(agentId);
    }

    listRegisteredAgents(): string[] {
        return Array.from(this.executors.keys());
    }
}

// Create a singleton instance
export const agentRegistry = new AgentRegistryImpl(); 