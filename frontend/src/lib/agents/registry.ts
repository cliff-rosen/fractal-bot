import { AgentType } from '@/components/fractal-bot/types/state';
import { AgentExecutor, AgentRegistry } from './types';

class AgentRegistryImpl implements AgentRegistry {
    private executors: Map<AgentType, AgentExecutor> = new Map();

    registerExecutor(executor: AgentExecutor): void {
        if (this.executors.has(executor.type)) {
            console.warn(`Executor for agent type ${executor.type} already exists. Overwriting...`);
        }
        this.executors.set(executor.type, executor);
    }

    getExecutor(type: AgentType): AgentExecutor | undefined {
        return this.executors.get(type);
    }

    listRegisteredTypes(): AgentType[] {
        return Array.from(this.executors.keys());
    }
}

// Create a singleton instance
export const agentRegistry = new AgentRegistryImpl(); 