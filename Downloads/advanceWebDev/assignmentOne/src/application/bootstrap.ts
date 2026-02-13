import { DIContainer } from '../infrastructure/diContainer';
import { CLILogger } from '../infrastructure/logger';
import { CLIErrorHandler } from '../infrastructure/errorHandler';
import { EnvConfigManager } from '../infrastructure/configManager';
import { CLIIOHandler } from '../infrastructure/ioHandler';
import { CommandRecordRegistry } from '../infrastructure/commandRegistry';
import { CLIInputValidator, CLIOutputFormatter } from '../infrastructure/validators';
import { CLIEventEmitter } from '../infrastructure/eventEmitter';
import { StandardCLIEngine } from '../application/cliEngine';
import { PluginManager } from '../application/pluginManager';
import { HelpCommand, VersionCommand, StatusCommand, EchoCommand } from '../application/builtinCommands';
import { ServiceContainer, CLIEngine, CommandRegistry, Logger } from '../domain/types';

/**
 * Factory for bootstrapping the CLI application
 * Follows the Single Responsibility principle by only handling setup
 */
export class CLIBootstrap {
  static async create(): Promise<{
    engine: CLIEngine;
    container: ServiceContainer;
    registry: CommandRegistry;
    pluginManager: PluginManager;
  }> {
    // Initialize DI Container
    const container = new DIContainer();

    // Register infrastructure services
    const logger = new CLILogger(process.env.LOG_FILE_PATH || undefined, process.env.VERBOSE === 'true');
    const errorHandler = new CLIErrorHandler();
    const configManager = new EnvConfigManager();
    const ioHandler = new CLIIOHandler();
    const commandRegistry = new CommandRecordRegistry();
    const inputValidator = new CLIInputValidator();
    const outputFormatter = new CLIOutputFormatter();
    const eventEmitter = new CLIEventEmitter();

    // Load configuration
    await configManager.load();

    // Register services in container
    container.registerSingleton('logger', logger);
    container.registerSingleton('errorHandler', errorHandler);
    container.registerSingleton('configManager', configManager);
    container.registerSingleton('ioHandler', ioHandler);
    container.registerSingleton('commandRegistry', commandRegistry);
    container.registerSingleton('inputValidator', inputValidator);
    container.registerSingleton('outputFormatter', outputFormatter);
    container.registerSingleton('eventEmitter', eventEmitter);

    // Create CLI Engine
    const engine = new StandardCLIEngine(
      commandRegistry,
      logger,
      errorHandler,
      eventEmitter,
      inputValidator,
      outputFormatter
    );

    // Register built-in commands
    const helpCommand = new HelpCommand(commandRegistry);
    const versionCommand = new VersionCommand('1.0.0');
    const statusCommand = new StatusCommand(commandRegistry);
    const echoCommand = new EchoCommand();

    commandRegistry.register(helpCommand);
    commandRegistry.register(versionCommand);
    commandRegistry.register(statusCommand);
    commandRegistry.register(echoCommand);

    logger.info('Built-in commands registered', {
      commands: [
        helpCommand.name,
        versionCommand.name,
        statusCommand.name,
        echoCommand.name,
      ],
    });

    // Create plugin manager
    const pluginManager = new PluginManager(container, commandRegistry, eventEmitter);

    // Emit startup event
    eventEmitter.emit('startup', { timestamp: new Date() });

    logger.info('CLI Engine bootstrapped successfully');

    return { engine, container, registry: commandRegistry, pluginManager };
  }
}
