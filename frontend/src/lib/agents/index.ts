import { agentRegistry } from './registry';
import { EmailMessagesAgentExecutor } from './executors/emailMessagesAgent';
import { EmailLabelsAgentExecutor } from './executors/emailLabelsAgent';

// Register all agent executors
export function registerAgentExecutors() {
    // Register email access agents
    agentRegistry.registerExecutor(new EmailMessagesAgentExecutor());
    agentRegistry.registerExecutor(new EmailLabelsAgentExecutor());

    // Add more agent registrations here as they are implemented
}

// Export the registry for use in other parts of the application
export { agentRegistry } from './registry';
export * from './types'; 