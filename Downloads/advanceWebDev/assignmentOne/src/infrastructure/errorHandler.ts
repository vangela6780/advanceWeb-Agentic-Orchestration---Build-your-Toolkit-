import { ErrorHandler, CommandResult, CLIContext } from '../domain/types';

/**
 * Concrete implementation of error handler
 * (D - Dependency Inversion: CLI depends on ErrorHandler interface, not this class)
 */
export class CLIErrorHandler implements ErrorHandler {
  handle(error: Error, context?: CLIContext): CommandResult {
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }

  format(error: Error): string {
    if (error instanceof ValidationError) {
      return `Validation Error: ${error.message}\nDetails: ${error.details.join('\n  - ')}`;
    }

    if (error instanceof CommandNotFoundError) {
      return `Command Error: ${error.message}\nRun 'help' to see available commands.`;
    }

    if (error instanceof ConfigError) {
      return `Configuration Error: ${error.message}\nDetails: ${error.cause}`;
    }

    return `Error: ${error.message}`;
  }
}

/**
 * Custom error types for type safety
 */
export class ValidationError extends Error {
  constructor(message: string, public details: string[] = []) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CommandNotFoundError extends Error {
  constructor(commandName: string) {
    super(`Command not found: '${commandName}'`);
    this.name = 'CommandNotFoundError';
  }
}

export class ConfigError extends Error {
  constructor(message: string, public cause: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ToolError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ToolError';
  }
}
