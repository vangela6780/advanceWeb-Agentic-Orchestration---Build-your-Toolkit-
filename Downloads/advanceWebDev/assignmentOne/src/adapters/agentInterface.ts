import { CommandResult, CLIContext } from '../domain/types';

/**
 * Agent-specific interfaces for AI tool integration
 * These allow AI agents to interact with the CLI programmatically
 */

/**
 * Tool definition that agents can use
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute(params: Record<string, any>): Promise<ToolResult>;
}

/**
 * Parameter definition for a tool
 */
export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  enum?: string[] | number[];
  schema?: any;
}

/**
 * Result returned by a tool
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Agent interface for programmatic CLI interaction
 */
export interface CLIAgent {
  /**
   * Execute a command programmatically
   */
  execute(commandName: string, args: Record<string, any>): Promise<ToolResult>;

  /**
   * Get available tools
   */
  getTools(): AgentTool[];

  /**
   * Get tool information
   */
  getTool(toolName: string): AgentTool | null;

  /**
   * Process a natural language request (for future AI integration)
   */
  processRequest(request: string): Promise<ToolResult>;
}

/**
 * Concrete implementation of CLIAgent for programmatic access
 */
export class ProgrammaticCLIAgent implements CLIAgent {
  private tools: Map<string, AgentTool> = new Map();

  constructor(
    private cliEngine: any, // CLIEngine type
    private commandRegistry: any // CommandRegistry type
  ) {
    this.buildToolsFromCommands();
  }

  private buildToolsFromCommands(): void {
    const commands = this.commandRegistry.getAll();

    for (const command of commands) {
      const tool: AgentTool = {
        name: command.name,
        description: command.description,
        parameters: this.parseUsageToParameters(command.usage),
        execute: async (params: Record<string, any>) => {
          const context: CLIContext = {
            arguments: Object.values(params).filter((v) => v) as string[],
            options: params,
            outputFormat: 'json',
            verbose: params.verbose === true,
          };

          const result = await this.cliEngine.executeCommand(command.name, context);
          return {
            success: result.success,
            data: result.data,
            error: result.error,
            message: result.message,
          };
        },
      };

      this.tools.set(command.name, tool);
    }
  }

  private parseUsageToParameters(usage: string): ToolParameter[] {
    // Parse usage string like "add <num1> <num2>" to extract parameters
    const parts = usage.split(/\s+/).slice(1); // Skip command name
    return parts
      .filter((part) => part.startsWith('<') && part.endsWith('>'))
      .map((part) => {
        const paramName = part.replace(/[<>]/g, '');
        return {
          name: paramName,
          type: 'string',
          description: `Parameter: ${paramName}`,
          required: true,
        };
      });
  }

  async execute(commandName: string, args: Record<string, any>): Promise<ToolResult> {
    const tool = this.tools.get(commandName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${commandName}' not found`,
      };
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  getTools(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  getTool(toolName: string): AgentTool | null {
    return this.tools.get(toolName) || null;
  }

  async processRequest(request: string): Promise<ToolResult> {
    // This would be implemented with NLP/AI integration in the future
    // For now, return a placeholder
    return {
      success: false,
      error: 'Natural language processing not yet implemented',
    };
  }
}

/**
 * Builder for creating custom agent tools
 */
export class CustomToolBuilder {
  private parameters: ToolParameter[] = [];
  private name!: string;
  private description!: string;
  private executeFunc!: (params: Record<string, any>) => Promise<ToolResult>;

  setName(name: string): CustomToolBuilder {
    this.name = name;
    return this;
  }

  setDescription(description: string): CustomToolBuilder {
    this.description = description;
    return this;
  }

  addParameter(param: ToolParameter): CustomToolBuilder {
    this.parameters.push(param);
    return this;
  }

  setExecutor(fn: (params: Record<string, any>) => Promise<ToolResult>): CustomToolBuilder {
    this.executeFunc = fn;
    return this;
  }

  build(): AgentTool {
    if (!this.name || !this.description || !this.executeFunc) {
      throw new Error('Tool name, description, and executor are required');
    }

    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      execute: this.executeFunc,
    };
  }
}
