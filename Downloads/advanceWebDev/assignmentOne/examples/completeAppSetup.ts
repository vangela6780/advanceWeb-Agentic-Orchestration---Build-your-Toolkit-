/// <reference types="node" />
/**
 * Example: Complete Application Setup
 * This shows how to create a full CLI application with plugins and custom tools
 */

import { CLIBootstrap } from '../src/application/bootstrap';
import { ProgrammaticCLIAgent } from '../src/adapters/agentInterface';
import { CalculatorPlugin } from '../src/plugins/calculatorPlugin';
import {
  FileToolsPlugin,
  WebToolsPlugin,
  DataToolsPlugin,
} from './toolPlugins';

/**
 * Create a complete CLI application with all features
 */
async function createCompleteApp() {
  console.log('╔════════════════════════════════════╗');
  console.log('║  AI CLI Application Setup          ║');
  console.log('╚════════════════════════════════════╝\n');

  try {
    // 1. Bootstrap the CLI engine
    console.log('📍 Bootstrapping CLI engine...');
    const { engine, container, registry, pluginManager } = await CLIBootstrap.create();
    console.log('✓ CLI engine ready\n');

    // 2. Load plugins
    console.log('📍 Loading plugins...');
    const plugins = [
      { name: 'calculator', instance: new CalculatorPlugin() },
      { name: 'filetools', instance: new FileToolsPlugin() },
      { name: 'webtools', instance: new WebToolsPlugin() },
      { name: 'datatools', instance: new DataToolsPlugin() },
    ];

    for (const { name, instance } of plugins) {
      await pluginManager.loadPlugin(name, instance);
      console.log(`✓ Plugin loaded: ${name}`);
    }
    console.log();

    // 3. Show available commands
    console.log('📍 Available commands:');
    const allCommands = registry.getAll();
    allCommands.forEach((cmd) => {
      console.log(`  • ${cmd.name.padEnd(15)} - ${cmd.description}`);
    });
    console.log();

    // 4. Create agent interface
    console.log('📍 Setting up agent interface...');
    const agent = new ProgrammaticCLIAgent(engine, registry);
    const tools = agent.getTools();
    console.log(`✓ ${tools.length} tools available for agents\n`);

    // 5. Display agent tools
    console.log('📍 Agent Tools:');
    tools.forEach((tool) => {
      console.log(
        `  • ${tool.name.padEnd(15)} [${tool.parameters.length} params] - ${tool.description}`
      );
    });
    console.log();

    // 6. Return the application instance
    return {
      engine,
      container,
      registry,
      pluginManager,
      agent,
      commands: allCommands,
      tools,
    };
  } catch (error) {
    console.error('❌ Failed to set up application:', error);
    throw error;
  }
}

/**
 * Example: Using the complete app
 */
export async function demonstrateApp() {
  console.log('\n╔════════════════════════════════════╗');
  console.log('║  Demonstration: Using the CLI      ║');
  console.log('╚════════════════════════════════════╝\n');

  const app = await createCompleteApp();

  // Example 1: Execute a command directly
  console.log('Example 1: Direct command execution');
  console.log('-----------------------------------');
  const result1 = await app.engine.executeCommand('echo', {
    arguments: ['Hello', 'from', 'CLI'],
    options: {},
    outputFormat: 'json',
    verbose: false,
  });
  console.log('Result:', result1.data);
  console.log();

  // Example 2: Use the agent to execute tools
  console.log('Example 2: Agent-based execution');
  console.log('--------------------------------');
  const result2 = await app.agent.execute('add', {
    arguments: ['100', '50'],
    '0': '100',
    '1': '50',
  });
  console.log('add 100 50 =>', result2);
  console.log();

  // Example 3: Get tool information for AI agents
  console.log('Example 3: Tool information (for AI agents)');
  console.log('------------------------------------------');
  const addTool = app.agent.getTool('add');
  if (addTool) {
    console.log('Tool Name:', addTool.name);
    console.log('Description:', addTool.description);
    console.log('Parameters:', addTool.parameters);
    console.log('Usage:', `${addTool.name} <${addTool.parameters.map((p) => p.name).join('> <')}>`);
  }
  console.log();

  // Example 4: Event handling
  console.log('Example 4: Event handling');
  console.log('------------------------');
  const eventEmitter = app.container.get('eventEmitter');
  eventEmitter.on('command:executed', ({ commandName, result }: any) => {
    console.log(`✓ Command '${commandName}' executed successfully`);
  });
  await app.engine.executeCommand('version', {
    arguments: [],
    options: {},
    outputFormat: 'text',
    verbose: false,
  });
  console.log();

  // Example 5: Get logger instance
  console.log('Example 5: Using the logger');
  console.log('---------------------------');
  const logger = app.container.get('logger');
  logger.info('Application running successfully', {
    commandCount: app.commands.length,
    toolCount: app.tools.length,
  });
  console.log();

  // Example 6: Get configuration
  console.log('Example 6: Configuration access');
  console.log('-------------------------------');
  const configManager = app.container.get('configManager');
  console.log('Configuration loaded');
  console.log('API Keys available:', {
    openai: configManager.get('OPENAI_API_KEY') ? '✓' : '✗',
    gemini: configManager.get('GEMINI_API_KEY') ? '✓' : '✗',
  });
  console.log();

  console.log('╔════════════════════════════════════╗');
  console.log('║  Application setup complete!       ║');
  console.log('╚════════════════════════════════════╝\n');
}

// Run demonstration
if ((require as any).main === module) {
  demonstrateApp().catch((error: any) => {
    console.error('Error:', error);
    (process as any).exit(1);
  });
}

export { createCompleteApp };
