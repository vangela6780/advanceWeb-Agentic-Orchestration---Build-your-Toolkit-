/**
 * Example: Building Tool-Specific Plugins
 * This shows how to create plugins that provide specific functionality
 * These can be extended later for web tools, screenshots, etc.
 */

import { Command, CLIContext, CommandResult, ServiceContainer } from '../src/domain/types';
import { BasePlugin } from '../src/application/pluginManager';

/**
 * FILE TOOLS PLUGIN EXAMPLE
 * Future plugin for file operations (read, write, list, etc.)
 */
export class FileToolsPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Initializing File Tools Plugin');

    commandRegistry.register(new ListFilesCommand());
    commandRegistry.register(new ReadFileCommand());
    commandRegistry.register(new WriteFileCommand());

    logger.info('File Tools Plugin initialized');
  }
}

class ListFilesCommand extends Command {
  readonly name = 'ls';
  readonly description = 'List files in a directory';
  readonly usage = 'ls [--path ./] [--recursive]';

  async execute(context: CLIContext): Promise<CommandResult> {
    const path = String(context.options.path || context.options.p || './');
    const recursive = context.options.recursive === true || context.options.r === true;

    // TODO: Implement actual file listing
    return {
      success: true,
      data: {
        path,
        recursive,
        files: ['file1.ts', 'file2.ts', 'file3.ts'],
      },
      message: `Listed files in ${path}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class ReadFileCommand extends Command {
  readonly name = 'read';
  readonly description = 'Read file contents';
  readonly usage = 'read [--file path]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (!context.options.file && !context.options.f) {
      return { valid: false, errors: ['File path is required (--file or -f)'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const filePath = String(context.options.file || context.options.f);

    // TODO: Implement actual file reading
    return {
      success: true,
      data: {
        filePath,
        content: 'File contents here...',
        size: 1024,
      },
      message: `Read file: ${filePath}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class WriteFileCommand extends Command {
  readonly name = 'write';
  readonly description = 'Write content to a file';
  readonly usage = 'write [--file path] [--content text]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!context.options.file && !context.options.f) {
      errors.push('File path is required (--file or -f)');
    }
    if (!context.options.content && !context.options.c) {
      errors.push('Content is required (--content or -c)');
    }
    return { valid: errors.length === 0, errors };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const filePath = String(context.options.file || context.options.f);
    const content = String(context.options.content || context.options.c);

    // TODO: Implement actual file writing
    return {
      success: true,
      data: {
        filePath,
        bytesWritten: content.length,
      },
      message: `Wrote ${content.length} bytes to ${filePath}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * WEB TOOLS PLUGIN EXAMPLE
 * Future plugin for HTTP requests, web scraping, etc.
 */
export class WebToolsPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Initializing Web Tools Plugin');

    commandRegistry.register(new HttpGetCommand());
    commandRegistry.register(new HttpPostCommand());
    commandRegistry.register(new ParseHTMLCommand());

    logger.info('Web Tools Plugin initialized');
  }
}

class HttpGetCommand extends Command {
  readonly name = 'wget';
  readonly description = 'Fetch content from a URL (HTTP GET)';
  readonly usage = 'wget [--url https://...] [--timeout 5000]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (!context.options.url && !context.options.u) {
      return { valid: false, errors: ['URL is required (--url or -u)'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const url = String(context.options.url || context.options.u);
    const timeout = Number(context.options.timeout || 5000);

    // TODO: Implement actual HTTP GET request
    return {
      success: true,
      data: {
        url,
        statusCode: 200,
        contentLength: 5000,
        responseTime: 150,
      },
      message: `Fetched ${url}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class HttpPostCommand extends Command {
  readonly name = 'post';
  readonly description = 'Send HTTP POST request';
  readonly usage = 'post [--url https://...] [--data json]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!context.options.url && !context.options.u) {
      errors.push('URL is required (--url or -u)');
    }
    return { valid: errors.length === 0, errors };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const url = String(context.options.url || context.options.u);
    const data = context.options.data || context.options.d || {};

    // TODO: Implement actual HTTP POST request
    return {
      success: true,
      data: {
        url,
        statusCode: 201,
        responseBody: { success: true },
      },
      message: `Posted to ${url}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class ParseHTMLCommand extends Command {
  readonly name = 'parsehtml';
  readonly description = 'Parse and extract data from HTML';
  readonly usage = 'parsehtml [--url https://...] [--selector css-selector]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!context.options.url && !context.options.u) {
      errors.push('URL is required (--url or -u)');
    }
    return { valid: errors.length === 0, errors };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const url = String(context.options.url || context.options.u);
    const selector = String(context.options.selector || context.options.s || '*');

    // TODO: Implement actual HTML parsing
    return {
      success: true,
      data: {
        url,
        selector,
        results: [
          { tag: 'h1', text: 'Example' },
          { tag: 'p', text: 'Parsed content...' },
        ],
      },
      message: `Parsed HTML from ${url}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * DATA TOOLS PLUGIN EXAMPLE
 * Future plugin for data transformation, validation, analysis
 */
export class DataToolsPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Initializing Data Tools Plugin');

    commandRegistry.register(new ValidateJSONCommand());
    commandRegistry.register(new ConvertFormatCommand());
    commandRegistry.register(new AggregateDataCommand());

    logger.info('Data Tools Plugin initialized');
  }
}

class ValidateJSONCommand extends Command {
  readonly name = 'validate-json';
  readonly description = 'Validate JSON data against a schema';
  readonly usage = 'validate-json [--data json] [--schema json-schema]';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (!context.options.data && !context.options.d) {
      return { valid: false, errors: ['Data is required (--data or -d)'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const data = String(context.options.data || context.options.d);

    // TODO: Implement actual JSON validation with schema
    return {
      success: true,
      data: {
        valid: true,
        errors: [],
      },
      message: 'JSON validation passed',
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class ConvertFormatCommand extends Command {
  readonly name = 'convert';
  readonly description = 'Convert between data formats (JSON, CSV, YAML, etc.)';
  readonly usage = 'convert [--from json] [--to csv] [--data content]';

  async execute(context: CLIContext): Promise<CommandResult> {
    const from = String(context.options.from || 'json');
    const to = String(context.options.to || 'csv');
    const data = String(context.options.data || context.options.d || '{}');

    // TODO: Implement actual format conversion
    return {
      success: true,
      data: {
        from,
        to,
        converted: 'Converted data...',
      },
      message: `Converted from ${from} to ${to}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

class AggregateDataCommand extends Command {
  readonly name = 'aggregate';
  readonly description = 'Aggregate data (sum, avg, count, etc.)';
  readonly usage = 'aggregate [--operation sum|avg|count] [--data array]';

  async execute(context: CLIContext): Promise<CommandResult> {
    const operation = String(context.options.operation || context.options.o || 'sum');
    const data = String(context.options.data || context.options.d || '[]');

    // TODO: Implement actual data aggregation
    return {
      success: true,
      data: {
        operation,
        result: 0,
      },
      message: `Aggregated data using ${operation}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}

/**
 * Export all plugin examples
 */
