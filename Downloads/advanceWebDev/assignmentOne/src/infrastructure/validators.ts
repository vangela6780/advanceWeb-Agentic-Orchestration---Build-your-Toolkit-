import { InputValidator, OutputFormatter, CommandResult, CLIContext } from '../domain/types';
import { ValidationError } from './errorHandler';

/**
 * Input validator for CLI arguments
 * (I - Interface Segregation: focused only on validation)
 */
export class CLIInputValidator implements InputValidator {
  validate(input: string): { valid: boolean; errors: string[] } {
    if (!input || input.trim().length === 0) {
      return { valid: false, errors: ['Input cannot be empty'] };
    }
    return { valid: true, errors: [] };
  }

  parseArguments(args: string[]): CLIContext {
    const context: CLIContext = {
      arguments: [],
      options: {},
      outputFormat: 'text',
      verbose: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        // Long option: --name=value or --flag
        const parts = arg.substring(2).split('=');
        const key = parts[0];
        const value = parts.length > 1 ? parts[1] : true;

        if (key === 'output' || key === 'format') {
          context.outputFormat = value === 'json' ? 'json' : 'text';
        } else if (key === 'verbose') {
          context.verbose = true;
        } else {
          context.options[key] = value;
        }
      } else if (arg.startsWith('-')) {
        // Short option: -f -v
        const flags = arg.substring(1).split('');
        flags.forEach((flag) => {
          if (flag === 'j') context.outputFormat = 'json';
          if (flag === 'v') context.verbose = true;
          context.options[flag] = true;
        });
      } else {
        // Regular argument
        context.arguments.push(arg);
      }
    }

    return context;
  }
}

/**
 * Output formatter for CLI results
 * (I - Interface Segregation: focused only on formatting)
 */
export class CLIOutputFormatter implements OutputFormatter {
  format(result: CommandResult, format: 'text' | 'json'): string {
    if (format === 'json') {
      return JSON.stringify(
        {
          success: result.success,
          data: result.data,
          error: result.error,
          message: result.message,
          timestamp: result.timestamp.toISOString(),
          executionTimeMs: result.executionTimeMs,
        },
        null,
        2
      );
    }

    // Text format
    if (result.success) {
      let output = `✅ Success`;
      if (result.message) output += `: ${result.message}`;
      if (result.data) {
        output += '\n\nData:\n';
        if (typeof result.data === 'string') {
          output += result.data;
        } else {
          output += JSON.stringify(result.data, null, 2);
        }
      }
      output += `\n\nExecution time: ${result.executionTimeMs}ms`;
      return output;
    }

    let output = `❌ Error`;
    if (result.error) output += `: ${result.error}`;
    if (result.message) output += `\nMessage: ${result.message}`;
    return output;
  }
}
