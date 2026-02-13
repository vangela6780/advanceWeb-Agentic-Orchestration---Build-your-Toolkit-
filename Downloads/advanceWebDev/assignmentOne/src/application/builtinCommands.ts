import { Command, CLIContext, CommandResult, CommandRegistry } from '../domain/types';

/**
 * Help command - lists all available commands
 */
export class HelpCommand extends Command {
  readonly name = 'help';
  readonly description = 'Display help information for available commands';
  readonly usage = 'help [command-name]';

  constructor(private commandRegistry: CommandRegistry) {
    super();
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const specificCommand = context.arguments[0];

    if (specificCommand) {
      const command = this.commandRegistry.get(specificCommand);
      if (!command) {
        return {
          success: false,
          error: `Command not found: ${specificCommand}`,
          timestamp: new Date(),
          executionTimeMs: 0,
        };
      }
      return {
        success: true,
        data: {
          name: command.name,
          description: command.description,
          usage: command.usage,
        },
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    }

    // List all commands
    const commands = this.commandRegistry.getAll();
    const commandList = commands.map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      usage: cmd.usage,
    }));

    return {
      success: true,
      data: {
        totalCommands: commandList.length,
        commands: commandList,
      },
      message: `Found ${commandList.length} available commands`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * Version command - displays CLI version
 */
export class VersionCommand extends Command {
  readonly name = 'version';
  readonly description = 'Display CLI version';
  readonly usage = 'version';

  constructor(private version: string) {
    super();
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    return {
      success: true,
      data: { version: this.version },
      message: `AI CLI Engine v${this.version}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * Status command - displays CLI status
 */
export class StatusCommand extends Command {
  readonly name = 'status';
  readonly description = 'Display CLI status and loaded modules';
  readonly usage = 'status';

  constructor(private commandRegistry: CommandRegistry) {
    super();
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const commands = this.commandRegistry.getAll();

    return {
      success: true,
      data: {
        status: 'running',
        loadedCommands: commands.length,
        commands: commands.map((cmd) => cmd.name),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      message: 'CLI is operational',
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * Echo command - echoes back input (useful for testing)
 */
export class EchoCommand extends Command {
  readonly name = 'echo';
  readonly description = 'Echo back the provided input (useful for testing)';
  readonly usage = 'echo <message>';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length === 0) {
      return { valid: false, errors: ['Message is required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const message = context.arguments.join(' ');

    return {
      success: true,
      data: { message },
      message: 'Echo successful',
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}
