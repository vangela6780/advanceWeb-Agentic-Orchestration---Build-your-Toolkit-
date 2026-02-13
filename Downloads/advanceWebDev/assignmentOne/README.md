# AI CLI Engine - SOLID Architecture

A professional, extensible CLI tool built with **SOLID principles** by Uncle Bob Martin. Designed for AI agent integration, with a clean architecture that separates concerns and enables easy extension.

## Architecture Overview

### SOLID Principles Applied

1. **Single Responsibility (S)**: Each class has one reason to change
   - `CLIEngine`: Only orchestrates command execution
   - `CommandRegistry`: Only manages command registration
   - `Logger`: Only handles logging
   - `ConfigManager`: Only manages configuration

2. **Open/Closed (O)**: Open for extension, closed for modification
   - New commands can be added without modifying existing code
   - Plugin system allows extending functionality
   - Custom tools can be created through builders

3. **Liskov Substitution (L)**: Derived classes substitute base classes
   - All commands inherit from `Command` abstract class
   - All plugins implement `Plugin` interface
   - Implementations are swappable (e.g., MockIOHandler for testing)

4. **Interface Segregation (I)**: Clients depend on specific interfaces
   - Separate `Logger`, `ErrorHandler`, `ConfigManager` interfaces
   - Commands don't depend on classes, only interfaces
   - Agent interface is separate from CLI engine

5. **Dependency Inversion (D)**: Depend on abstractions, not concretions
   - CLI engine depends on service interfaces, not implementations
   - Commands receive dependencies through constructor
   - Service container handles dependency injection

## Project Structure

```
src/
├── domain/
│   └── types.ts              # Core interfaces and abstract classes
├── infrastructure/
│   ├── logger.ts             # Logger implementation
│   ├── errorHandler.ts       # Error handling
│   ├── configManager.ts      # Configuration management
│   ├── ioHandler.ts          # Input/Output handling
│   ├── commandRegistry.ts    # Command registry
│   ├── diContainer.ts        # Dependency injection container
│   ├── validators.ts         # Input validation & output formatting
│   └── eventEmitter.ts       # Event system
├── application/
│   ├── bootstrap.ts          # CLI initialization
│   ├── cliEngine.ts          # Main CLI orchestrator
│   ├── builtinCommands.ts    # help, version, status, echo
│   └── pluginManager.ts      # Plugin loading/management
├── adapters/
│   └── agentInterface.ts     # AI agent integration
├── plugins/
│   └── calculatorPlugin.ts   # Example plugin
└── index.ts                  # Entry point
```

## Key Components

### Domain Layer (types.ts)
Defines all interfaces and abstract classes - no implementation details.

```typescript
- Command              # Abstract base for all commands
- CLIContext           # Execution context
- CommandResult        # Execution result
- Logger               # Logging interface
- ErrorHandler         # Error handling interface
- ConfigManager        # Configuration interface
- CLIEngine            # Main engine interface
- Plugin               # Plugin interface
- ServiceContainer     # DI container interface
```

### Infrastructure Layer
Concrete implementations of domain interfaces.

- **Logger**: File and console logging
- **ErrorHandler**: Error handling with custom error types
- **ConfigManager**: .env file management
- **IOHandler**: Stdin/stdout/stderr handling
- **DIContainer**: Service registration and retrieval

### Application Layer
Business logic and orchestration.

- **CLIEngine**: Coordinates command execution
- **Bootstrap**: Initializes and configures the entire system
- **BuiltinCommands**: help, version, status, echo
- **PluginManager**: Manages plugin lifecycle

### Adapters
External system integration.

- **AgentInterface**: Programmatic CLI access for AI agents
- **CustomToolBuilder**: Build custom tools for agents

## Getting Started

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Development

```bash
npm run dev
```

### Usage

```bash
# Show help
node dist/index.js help

# Show version
node dist/index.js version

# Show status
node dist/index.js status

# Echo message
node dist/index.js echo "Hello, World!"

# Output as JSON
node dist/index.js help --json

# Verbose output
node dist/index.js -v help
```

## Creating Custom Commands

Extend the `Command` class:

```typescript
import { Command, CLIContext, CommandResult } from '../domain/types';

export class MyCommand extends Command {
  readonly name = 'mycommand';
  readonly description = 'Description of my command';
  readonly usage = 'mycommand <arg1> <arg2>';

  validate(context: CLIContext): { valid: boolean; errors: string[] } {
    if (context.arguments.length < 2) {
      return { valid: false, errors: ['Two arguments required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const arg1 = context.arguments[0];
    const arg2 = context.arguments[1];

    // Process your command
    const result = `Processed: ${arg1}, ${arg2}`;

    return {
      success: true,
      data: { result },
      message: 'Command executed successfully',
      timestamp: new Date(),
      executionTimeMs: Date.now() - startTime,
    };
  }
}
```

## Creating Plugins

Extend `BasePlugin`:

```typescript
import { BasePlugin } from '../application/pluginManager';
import { ServiceContainer } from '../domain/types';

export class MyPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Initializing MyPlugin');

    // Register your commands
    commandRegistry.register(new MyCommand());

    logger.info('MyPlugin initialized');
  }

  async shutdown(): Promise<void> {
    // Cleanup if needed
  }
}
```

### Loading Plugins

```typescript
const { engine, container, pluginManager } = await CLIBootstrap.create();

const myPlugin = new MyPlugin();
await pluginManager.loadPlugin('myplugin', myPlugin);
```

## AI Agent Integration

Use the CLI programmatically with agents:

```typescript
import { ProgrammaticCLIAgent } from './adapters/agentInterface';

const { engine, registry } = await CLIBootstrap.create();
const agent = new ProgrammaticCLIAgent(engine, registry);

// Get available tools
const tools = agent.getTools();
console.log(tools);

// Execute a tool
const result = await agent.execute('add', { arguments: ['5', '3'] });
console.log(result); // { success: true, data: { result: 8 }, ... }

// Get tool information
const addTool = agent.getTool('add');
console.log(addTool?.description); // 'Add two numbers'
```

### Creating Custom Tools

```typescript
import { CustomToolBuilder } from './adapters/agentInterface';

const myTool = new CustomToolBuilder()
  .setName('greet')
  .setDescription('Greet someone')
  .addParameter({
    name: 'name',
    type: 'string',
    description: 'Person to greet',
    required: true,
  })
  .setExecutor(async (params) => ({
    success: true,
    data: { greeting: `Hello, ${params.name}!` },
  }))
  .build();
```

## Event System

Listen to CLI lifecycle events:

```typescript
const { container } = await CLIBootstrap.create();
const eventEmitter = container.get('eventEmitter');

eventEmitter.on('command:executed', ({ commandName, result }) => {
  console.log(`Command '${commandName}' executed:`, result);
});

eventEmitter.on('command:failed', ({ commandName, error }) => {
  console.log(`Command '${commandName}' failed:`, error);
});

eventEmitter.on('plugin:loaded', ({ pluginName }) => {
  console.log(`Plugin '${pluginName}' loaded`);
});
```

## Testing

Use `MockIOHandler` for testing:

```typescript
import { MockIOHandler } from './infrastructure/ioHandler';

const mockIO = new MockIOHandler();
mockIO.enqueueInput('help');

// ... execute command ...

console.log(mockIO.outputs);  // Outputs written
console.log(mockIO.errors);   // Errors written
```

## Dependency Injection

Register and retrieve services:

```typescript
const { container } = await CLIBootstrap.create();

// Register a new service
container.registerSingleton('myService', new MyService());

// Retrieve a service
const myService = container.get('myService');

// Register a factory
container.registerFactory('myFactory', () => new MyService());
```

## Configuration

Configuration is loaded from environment variables and `.env` files:

```typescript
const { container } = await CLIBootstrap.create();
const configManager = container.get('configManager');

const apiKey = configManager.get('OPENAI_API_KEY');
configManager.set('CUSTOM_KEY', 'value');

const allConfig = configManager.getAll();
```

## Error Handling

Custom error types for better error handling:

```typescript
import {
  ValidationError,
  CommandNotFoundError,
  ConfigError,
  ToolError,
} from './infrastructure/errorHandler';

// These are automatically handled by the error handler
throw new ValidationError('Invalid input', ['error1', 'error2']);
throw new CommandNotFoundError('notfound');
throw new ConfigError('Config failed', 'Cause details');
throw new ToolError('Tool execution failed', { details: 'info' });
```

## Future Extensions

The architecture is designed to easily support:

- **Web Tools**: HTTP client/server integration
- **Screenshot Tools**: Image capture and processing
- **File Tools**: Advanced file manipulation
- **Data Analysis**: Data processing pipelines
- **API Integrations**: Third-party service connections
- **ML Models**: Machine learning integration
- **Real-time Updates**: WebSocket and streaming support

Each tool can be added as a plugin without modifying the core CLI code.

## Best Practices

1. **Keep Commands Simple**: Each command should do one thing
2. **Use Interfaces**: Depend on abstractions in your code
3. **Handle Errors Gracefully**: Return proper CommandResult objects
4. **Log Appropriately**: Use logger for debugging and monitoring
5. **Write Tests**: Use MockIOHandler and test fixtures
6. **Document Your Tools**: Clear descriptions and usage strings
7. **Validate Input**: Use the validate() method effectively
8. **Return Structured Data**: Always return CommandResult with proper structure

## Contributing

When adding new features:

1. Follow SOLID principles
2. Create interfaces in `domain/types.ts` for new abstractions
3. Implement in appropriate layer (infrastructure/application/adapters)
4. Add to tests
5. Update documentation
6. Consider plugin/extension capabilities

---

Built with SOLID principles and clean architecture for maintainability and extensibility.
