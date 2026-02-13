/**
 * Example: Using the CLI with an AI Agent
 * This demonstrates how to integrate the CLI with AI systems
 */

import { CLIBootstrap } from '../src/application/bootstrap';
import { ProgrammaticCLIAgent } from '../src/adapters/agentInterface';
import { CalculatorPlugin } from '../src/plugins/calculatorPlugin';

async function exampleAgentUsage(): Promise<void> {
  console.log('=== AI CLI Agent Example ===\n');

  try {
    // 1. Bootstrap the CLI
    const { engine, registry, container, pluginManager } = await CLIBootstrap.create();

    // 2. Load plugins (e.g., Calculator)
    const calculatorPlugin = new CalculatorPlugin();
    await pluginManager.loadPlugin('calculator', calculatorPlugin);
    console.log('✓ Calculator plugin loaded\n');

    // 3. Create agent interface for programmatic access
    const agent = new ProgrammaticCLIAgent(engine, registry);

    // 4. Get available tools
    console.log('Available tools:');
    const tools = agent.getTools();
    tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // 5. Execute commands programmatically
    console.log('Executing tools as an agent would:\n');

    // Execute add command
    const addResult = await agent.execute('add', {
      arguments: ['10', '5'],
      '0': '10',
      '1': '5',
    });
    console.log('add 10 5 =>', addResult);
    console.log();

    // Execute multiply command
    const multiplyResult = await agent.execute('multiply', {
      arguments: ['4', '3'],
      '0': '4',
      '1': '3',
    });
    console.log('multiply 4 3 =>', multiplyResult);
    console.log();

    // Execute help command
    const helpResult = await agent.execute('help', {
      arguments: [],
    });
    console.log('help =>', helpResult);
    console.log();

    // 6. Get specific tool information
    console.log('Tool Information:');
    const addTool = agent.getTool('add');
    if (addTool) {
      console.log(`Tool: ${addTool.name}`);
      console.log(`Description: ${addTool.description}`);
      console.log(`Parameters:`, addTool.parameters);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
exampleAgentUsage();
