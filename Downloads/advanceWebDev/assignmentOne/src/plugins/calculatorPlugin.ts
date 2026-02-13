import { Command, CLIContext, CommandResult, ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';

/**
 * Example plugin for calculator functionality
 * Demonstrates how to extend the CLI with custom commands
 */
export class CalculatorPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Initializing Calculator Plugin');

    // Register calculator commands
    commandRegistry.register(new AddCommand());
    commandRegistry.register(new SubtractCommand());
    commandRegistry.register(new MultiplyCommand());

    logger.info('Calculator plugin initialized');
  }
}

/**
 * Addition command
 */
class AddCommand extends Command {
  readonly name = 'add';
  readonly description = 'Add two numbers';
  readonly usage = 'add <num1> <num2>';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 2) {
      return { valid: false, errors: ['Two numbers required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    try {
      const num1 = parseFloat(context.arguments[0]);
      const num2 = parseFloat(context.arguments[1]);

      if (isNaN(num1) || isNaN(num2)) {
        return {
          success: false,
          error: 'Invalid numbers provided',
          timestamp: new Date(),
          executionTimeMs: 0,
        };
      }

      const result = num1 + num2;

      return {
        success: true,
        data: { num1, num2, result },
        message: `${num1} + ${num2} = ${result}`,
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    }
  }
}

/**
 * Subtraction command
 */
class SubtractCommand extends Command {
  readonly name = 'subtract';
  readonly description = 'Subtract two numbers';
  readonly usage = 'subtract <num1> <num2>';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 2) {
      return { valid: false, errors: ['Two numbers required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    try {
      const num1 = parseFloat(context.arguments[0]);
      const num2 = parseFloat(context.arguments[1]);

      if (isNaN(num1) || isNaN(num2)) {
        return {
          success: false,
          error: 'Invalid numbers provided',
          timestamp: new Date(),
          executionTimeMs: 0,
        };
      }

      const result = num1 - num2;

      return {
        success: true,
        data: { num1, num2, result },
        message: `${num1} - ${num2} = ${result}`,
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    }
  }
}

/**
 * Multiplication command
 */
class MultiplyCommand extends Command {
  readonly name = 'multiply';
  readonly description = 'Multiply two numbers';
  readonly usage = 'multiply <num1> <num2>';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 2) {
      return { valid: false, errors: ['Two numbers required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    try {
      const num1 = parseFloat(context.arguments[0]);
      const num2 = parseFloat(context.arguments[1]);

      if (isNaN(num1) || isNaN(num2)) {
        return {
          success: false,
          error: 'Invalid numbers provided',
          timestamp: new Date(),
          executionTimeMs: 0,
        };
      }

      const result = num1 * num2;

      return {
        success: true,
        data: { num1, num2, result },
        message: `${num1} × ${num2} = ${result}`,
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        timestamp: new Date(),
        executionTimeMs: 0,
      };
    }
  }
}
