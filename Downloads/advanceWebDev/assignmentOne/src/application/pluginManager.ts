import { Plugin, ServiceContainer, CommandRegistry, EventEmitter } from '../domain/types';
import { CLILogger } from '../infrastructure/logger';

/**
 * Plugin manager for loading and managing plugins
 * (O - Open/Closed: open for extension through plugins)
 */
export class PluginManager {
  private loadedPlugins: Map<string, Plugin> = new Map();

  constructor(
    private container: ServiceContainer,
    private commandRegistry: CommandRegistry,
    private eventEmitter: EventEmitter
  ) {}

  async loadPlugin(name: string, plugin: Plugin): Promise<void> {
    const logger = this.container.get('logger') as CLILogger;

    try {
      logger.info(`Loading plugin: ${name}`);
      await plugin.initialize(this.container);
      this.loadedPlugins.set(name, plugin);
      logger.info(`Plugin loaded: ${name}`);
      this.eventEmitter.emit('plugin:loaded', { pluginName: name });
    } catch (error) {
      logger.error(`Failed to load plugin ${name}`, error);
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const logger = this.container.get('logger') as CLILogger;
    const plugin = this.loadedPlugins.get(name);

    if (!plugin) {
      logger.warn(`Plugin not found: ${name}`);
      return;
    }

    try {
      logger.info(`Unloading plugin: ${name}`);
      await plugin.shutdown();
      this.loadedPlugins.delete(name);
      logger.info(`Plugin unloaded: ${name}`);
      this.eventEmitter.emit('plugin:unloaded', { pluginName: name });
    } catch (error) {
      logger.error(`Failed to unload plugin ${name}`, error);
      throw error;
    }
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  isPluginLoaded(name: string): boolean {
    return this.loadedPlugins.has(name);
  }
}

/**
 * Base plugin class for creating custom plugins
 */
export abstract class BasePlugin implements Plugin {
  abstract initialize(container: ServiceContainer): Promise<void>;

  async shutdown(): Promise<void> {
    // Default implementation: do nothing
  }
}
