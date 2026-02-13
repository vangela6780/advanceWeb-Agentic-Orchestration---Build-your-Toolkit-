/**
 * Example: Creating an Advanced Custom Command
 * Shows how to create a command with validation, error handling, and complex logic
 */

import { Command, CLIContext, CommandResult } from '../src/domain/types';

/**
 * Example: Data Transformer Command
 * Demonstrates a more complex command that processes data
 */
export class TransformDataCommand extends Command {
  readonly name = 'transform';
  readonly description = 'Transform data using various strategies';
  readonly usage = 'transform [--strategy uppercase|lowercase|reverse] [--input text]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const strategy = String(context.options.strategy || context.options.s);
    if (!strategy || !['uppercase', 'lowercase', 'reverse'].includes(strategy)) {
      errors.push('Strategy must be: uppercase, lowercase, or reverse');
    }

    const input = context.options.input || context.options.i;
    if (!input) {
      errors.push('Input text is required (--input or -i)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      const strategy = String(context.options.strategy || context.options.s);
      const input = String(context.options.input || context.options.i);

      let result: string;

      switch (strategy) {
        case 'uppercase':
          result = input.toUpperCase();
          break;
        case 'lowercase':
          result = input.toLowerCase();
          break;
        case 'reverse':
          result = input.split('').reverse().join('');
          break;
        default:
          throw new Error(`Unknown strategy: ${strategy}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          originalInput: input,
          strategy,
          result,
          lengthOriginal: input.length,
          lengthResult: result.length,
        },
        message: `Data transformed using ${strategy} strategy`,
        timestamp: new Date(),
        executionTimeMs: executionTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

/**
 * Example: JSON Processor Command
 * Demonstrates handling complex data types
 */
export class ProcessJSONCommand extends Command {
  readonly name = 'processjson';
  readonly description = 'Process and validate JSON data';
  readonly usage = 'processjson [--validate] [--pretty] [--input json-string]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const input = context.options.input || context.options.i;
    if (!input) {
      errors.push('JSON input is required (--input or -i)');
    } else {
      // Try to parse JSON
      try {
        JSON.parse(String(input));
      } catch {
        errors.push('Invalid JSON format');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      const input = String(context.options.input || context.options.i);
      const shouldValidate = context.options.validate === true || context.options.v === true;
      const shouldPretty = context.options.pretty === true || context.options.p === true;

      const parsed = JSON.parse(input);

      let result = parsed;
      if (shouldPretty) {
        result = JSON.parse(JSON.stringify(parsed, null, 2));
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          valid: true,
          parsed: result,
          stats: {
            length: input.length,
            keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0,
          },
        },
        message: 'JSON processed successfully',
        timestamp: new Date(),
        executionTimeMs: executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: { valid: false },
        timestamp: new Date(),
        executionTimeMs: executionTime,
      };
    }
  }
}

/**
 * Example: Retry Command Wrapper
 * Demonstrates handling retries and resilience
 */
export class RetryableCommand extends Command {
  readonly name = 'retryable';
  readonly description = 'Command that retries on failure (example)';
  readonly usage = 'retryable [--retries n] [--delay ms]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const retries = context.options.retries;
    if (retries && isNaN(Number(retries))) {
      return { valid: false, errors: ['Retries must be a number'] };
    }

    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const startTime = Date.now();
    const maxRetries = Number(context.options.retries || 3);
    const delayMs = Number(context.options.delay || 1000);

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        attempt++;

        // Simulate a command that might fail
        if (Math.random() > 0.7) {
          throw new Error('Random failure (simulated)');
        }

        return {
          success: true,
          data: { attempt, maxRetries },
          message: `Success on attempt ${attempt}`,
          timestamp: new Date(),
          executionTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError?.message}`,
      data: { attempt, maxRetries },
      timestamp: new Date(),
      executionTimeMs: Date.now() - startTime,
    };
  }
}
