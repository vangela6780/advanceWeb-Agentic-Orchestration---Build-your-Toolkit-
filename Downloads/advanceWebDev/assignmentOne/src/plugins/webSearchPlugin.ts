import { Command, CLIContext, CommandResult, ServiceContainer } from '../domain/types';
import { BasePlugin } from '../application/pluginManager';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Web Search Plugin - Uses OpenAI's search capabilities for online research
 * Allows AI to conduct up-to-date research and create documents
 */
export class WebSearchPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');
    const configManager = container.get('configManager');

    logger.info('Initializing Web Search Plugin');

    const apiKey = configManager.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in configuration');
    }

    // Register search command
    commandRegistry.register(new WebSearchCommand(apiKey, logger));

    logger.info('Web Search plugin initialized');
  }
}

/**
 * Web Search Command - Conducts online research using OpenAI
 */
class WebSearchCommand extends Command {
  readonly name = 'search';
  readonly description = 'Conduct online research using AI web search';
  readonly usage = 'search <query> [--output <filename>]';

  private openai: OpenAI;
  private logger: any;

  constructor(apiKey: string, logger: any) {
    super();
    this.openai = new OpenAI({ apiKey });
    this.logger = logger;
  }

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 1) {
      return { valid: false, errors: ['Search query required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      // Parse arguments
      const args = context.arguments;
      let query = '';
      let outputFile = null;

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output' && i + 1 < args.length) {
          outputFile = args[i + 1];
          i++;
        } else {
          query += (query ? ' ' : '') + args[i];
        }
      }

      this.logger.info(`Searching for: ${query}`);

      // Use OpenAI's GPT-4 with web search capability
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',  // Latest model with browsing
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide comprehensive, up-to-date information on the topic requested. Include sources and citations when possible.'
          },
          {
            role: 'user',
            content: `Research the following topic and provide detailed, current information: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = response.choices[0].message.content || 'No results found';

      // Save to file if output specified
      if (outputFile) {
        const outputDir = path.join(process.cwd(), 'research');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, outputFile.endsWith('.md') ? outputFile : `${outputFile}.md`);
        const content = `# Research: ${query}\n\n**Generated:** ${new Date().toISOString()}\n\n---\n\n${result}\n`;
        
        fs.writeFileSync(filePath, content);
        this.logger.info(`Research saved to: ${filePath}`);

        return {
          success: true,
          message: `Research completed and saved to: ${filePath}`,
          data: { filePath, result },
          timestamp: new Date(),
          executionTimeMs: Date.now() - startTime,
        };
      }

      return {
        success: true,
        message: 'Research completed',
        data: { result },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };

    } catch (error: any) {
      this.logger.error(`Search failed: ${error.message}`);
      return {
        success: false,
        error: `Search failed: ${error.message}`,
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
