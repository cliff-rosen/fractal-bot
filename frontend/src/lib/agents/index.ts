import { agentRegistry } from './registry';
import { EmailAccessAgentExecutor } from './executors/emailAccessAgent';
import { EmailLabelsAgentExecutor } from './executors/emailLabelsAgent';

// Register all agent executors
export function registerAgentExecutors() {
    // Register email access agents
    agentRegistry.registerExecutor(new EmailAccessAgentExecutor(), 'email_access');
    agentRegistry.registerExecutor(new EmailLabelsAgentExecutor(), 'email_labels');

    // Add more agent registrations here as they are implemented
}

// Export the registry for use in other parts of the application
export { agentRegistry } from './registry';
export * from './types'; 