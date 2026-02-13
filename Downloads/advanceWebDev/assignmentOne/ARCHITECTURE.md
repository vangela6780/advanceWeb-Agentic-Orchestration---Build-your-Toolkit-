# CLI Architecture Documentation

## Overview

This CLI engine is built using **SOLID principles** as defined by Uncle Bob Martin. It provides a clean, maintainable, and extensible foundation for building AI tools.

## SOLID Principles Breakdown

### 1. Single Responsibility Principle (SRP)

**Definition**: A class should have only one reason to change.

**Implementation in CLI**:

```
┌─────────────────────────────────────────┐
│ CLIEngine                               │
│ Responsibility: Orchestrate execution   │
└─────────────────────────────────────────┘
         ↓                ↓                ↓
    ┌────────┐    ┌──────────┐    ┌────────────┐
    │Logger  │    │Registry  │    │ErrorHandler│
    │        │    │           │    │            │
    │Single: │    │Single:    │    │Single:     │
    │Logging │    │Registration   │Error format│
    └────────┘    └──────────┘    └────────────┘
```

**Example Classes**:

- `CLIEngine`: Only orchestrates command execution
- `CommandRegistry`: Only manages command storage/retrieval
- `CLILogger`: Only handles logging
- `CLIErrorHandler`: Only formats errors
- `ConfigManager`: Only manages configuration

### 2. Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension, closed for modification.

**Implementation in CLI**:

```typescript
// BEFORE (Bad - violates OCP):
class CLIEngine {
  execute(command) {
    if (command === 'add') { /* ... */ }
    else if (command === 'subtract') { /* ... */ }
    else if (command === 'divide') { /* ... */ }
    // Need to modify this class for every new command!
  }
}

// AFTER (Good - follows OCP):
abstract class Command {
  abstract execute(): Promise<CommandResult>;
}

class CLIEngine {
  constructor(private registry: CommandRegistry) {}
  
  async execute(cmd: Command): Promise<CommandResult> {
    return await cmd.execute(); // Works with ANY command
  }
}

// Add new commands WITHOUT modifying CLIEngine
class MultiplyCommand extends Command {
  async execute() { /* ... */ }
}
```

**Plugin System Example**:

```typescript
// Extend functionality with plugins, not by modifying core
export class MyPlugin extends BasePlugin {
  async initialize(container: ServiceContainer) {
    const registry = container.get('commandRegistry');
    registry.register(new MyNewCommand());
  }
}
```

### 3. Liskov Substitution Principle (LSP)

**Definition**: Subtypes must be substitutable for their base types.

**Implementation in CLI**:

```typescript
// All Command implementations must be interchangeable
const commands: Command[] = [
  new HelpCommand(),
  new EchoCommand(),
  new AddCommand(),
  new MyCustomCommand(), // New command, same interface
];

// Execute ANY command the same way
for (const command of commands) {
  // Works with all, no special handling needed
  const result = await command.execute(context);
}

// Mock implementations for testing
class MockCommand extends Command {
  async execute() { 
    return { success: true, data: 'test' };
  }
}
```

### 4. Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they don't use.

**Implementation in CLI**:

Instead of one large interface:

```typescript
// BAD - forces clients to implement unused methods
interface Tool {
  execute();
  validate();
  format();
  serialize();
  authenticate();
  cache();
}
```

Use focused interfaces:

```typescript
// GOOD - clients only depend on what they need
interface Executable {
  execute(): Promise<CommandResult>;
}

interface Validatable {
  validate(): ValidationResult;
}

interface Formattable {
  format(): string;
}

// Command only needs these two
class MyCommand implements Executable, Validatable { }
```

**Examples in CLI**:

- `Logger` interface: only `info()`, `warn()`, `error()`, `debug()`
- `ErrorHandler` interface: only `handle()`, `format()`
- `ConfigManager` interface: only `get()`, `set()`, `load()`
- `IOHandler` interface: only `readInput()`, `writeOutput()`

### 5. Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Implementation in CLI**:

```
Without DIP (Bad):
┌──────────────┐         depends on         ┌──────────────┐
│ CLIEngine    │────────────────────────────→│ CLILogger    │
│ (high-level) │                            │ (low-level)  │
└──────────────┘         depends on         └──────────────┘
                         ┌──────────────┐
                         │ConfigManager │
                         │ (low-level)  │
                         └──────────────┘

With DIP (Good):
┌──────────────┐
│ CLIEngine    │
│ (high-level) │
└────────┬─────┘
         │ depends on abstractions
    ┌────▼──────────────┬────────────────┬─────────────┐
    │                   │                │             │
┌───▼──────┐     ┌──────▼─────┐   ┌─────▼────┐  ┌────▼──────┐
│Logger*   │     │ConfigMgr*   │   │ErrorHdlr*│  │CommandReg*│
│interface │     │interface    │   │interface │  │interface  │
└───┬──────┘     └──────┬─────┘   └─────┬────┘  └────┬──────┘
    │                   │                │            │
┌───▼──────┐     ┌──────▼─────┐   ┌─────▼────┐  ┌────▼──────┐
│CLILogger │     │EnvConfigMgr│   │CLIError  │  │CommandRec  │
│ concrete │     │(concrete)  │   │Handler*  │  │Registry*   │
└──────────┘     └────────────┘   └──────────┘  └────────────┘
```

**Code Example**:

```typescript
// CLIEngine depends on abstractions, not concrete classes
constructor(
  private commandRegistry: CommandRegistry,  // Interface
  private logger: Logger,                    // Interface
  private errorHandler: ErrorHandler,        // Interface
  private eventEmitter: EventEmitter         // Interface
) {}

// Any implementation of these interfaces works
// No tight coupling to specific implementations
```

## Architecture Layers

### Layer 1: Domain (Core Business Logic)

```
src/domain/types.ts
├── Abstract Classes
│   └── Command (template for all commands)
├── Interfaces (no implementation)
│   ├── Logger
│   ├── ErrorHandler
│   ├── ConfigManager
│   ├── CLIEngine
│   ├── CommandRegistry
│   ├── EventEmitter
│   ├── ServiceContainer
│   └── Tool
└── Type Definitions
    ├── CLIContext
    ├── CommandResult
    └── ToolParameter
```

**Key Principle**: No implementation, only contracts.

### Layer 2: Infrastructure (Implementation)

```
src/infrastructure/
├── logger.ts          # Logger interface → CLILogger
├── errorHandler.ts    # ErrorHandler interface → CLIErrorHandler
├── configManager.ts   # ConfigManager interface → EnvConfigManager
├── ioHandler.ts       # IOHandler interface → CLIIOHandler
├── commandRegistry.ts # CommandRegistry interface → CommandRecordRegistry
├── diContainer.ts     # ServiceContainer interface → DIContainer
├── validators.ts      # InputValidator + OutputFormatter
└── eventEmitter.ts    # EventEmitter interface → CLIEventEmitter
```

**Key Principle**: Implement domain interfaces, handle frameworks and libraries here.

### Layer 3: Application (Business Operations)

```
src/application/
├── bootstrap.ts       # CLI initialization
├── cliEngine.ts       # CLIEngine implementation
├── builtinCommands.ts # help, version, status, echo
└── pluginManager.ts   # Plugin lifecycle management
```

**Key Principle**: Orchestrate domain and infrastructure, implement business logic.

### Layer 4: Adapters (External Integration)

```
src/adapters/
└── agentInterface.ts  # AI agent integration
```

**Key Principle**: Bridge between CLI and external systems (AI, APIs, etc.).

### Layer 5: Plugins (Extensions)

```
src/plugins/
└── calculatorPlugin.ts # Example plugin

examples/
├── toolPlugins.ts     # File, Web, Data tool plugins
├── advancedCommands.ts # Complex command examples
└── completeAppSetup.ts # Full application setup
```

**Key Principle**: Extend functionality without modifying core.

## Dependency Injection Container

The `DIContainer` implements the Service Locator pattern for managing dependencies:

```typescript
// Register services
container.registerSingleton('logger', new CLILogger());
container.registerFactory('command', () => new MyCommand());

// Retrieve services
const logger = container.get('logger'); // Gets singleton
const command = container.get('command'); // Creates new instance each time
```

**Flow**:

```
┌──────────────────────┐
│ DIContainer          │
│ (holds all services) │
└──────────┬───────────┘
           │
    ┌──────▼──────┬──────────┬──────────┬──────────┐
    │  Logger     │ Registry │ Config   │ EventEmm │
    │  singleton  │ singleton│ singleton│ singleton│
    └─────────────┴──────────┴──────────┴──────────┘
           │           │          │          │
    ┌──────▼─────┬─────▼──────┬──▼──────┬───▼──────┐
    │ app        │ app        │ app    │ app       │
    │ requests   │ requests   │ request│ requests  │
    │ logger     │ registry   │ config │ events    │
    └────────────┴────────────┴────────┴───────────┘
```

## Command Execution Flow

```
1. User Input
   └─→ args: ['add', '5', '3']
       
2. Parse Arguments
   └─→ CLIInputValidator.parseArguments()
       └─→ CLIContext { arguments: ['5', '3'], ... }
       
3. Find Command
   └─→ CommandRegistry.get('add')
       └─→ Command instance or null
       
4. Validate Input
   └─→ Command.validate(context)
       └─→ { valid: boolean, errors: string[] }
       
5. Execute Command
   └─→ Command.execute(context)
       └─→ CommandResult { success, data, error, ... }
       
6. Format Output
   └─→ OutputFormatter.format(result)
       └─→ String (text or JSON)
       
7. Write Output
   └─→ IOHandler.writeOutput(formatted)
       └─→ stdout or file
       
8. Emit Events
   └─→ EventEmitter.emit('command:executed', data)
```

## Command Lifecycle

```
Command
  │
  ├─→ instantiate()
  │   └─→ set name, description, usage
  │
  ├─→ register()
  │   └─→ CommandRegistry.register(command)
  │
  ├─→ validate(context)
  │   ├─→ check input is valid
  │   └─→ return validation result
  │
  ├─→ execute(context)
  │   ├─→ process arguments
  │   ├─→ perform business logic
  │   ├─→ handle errors
  │   └─→ return CommandResult
  │
  └─→ cleanup()
      └─→ optional resource cleanup
```

## Plugin System Architecture

```
┌─────────────────────────┐
│ Plugin System           │
└────────┬────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ PluginManager                    │
    │ ├─ loadPlugin(name, plugin)      │
    │ ├─ unloadPlugin(name)            │
    │ ├─ getLoadedPlugins()            │
    │ └─ isPluginLoaded(name)          │
    └────┬──────────────────────────────┘
         │ manages
    ┌────▼──────────────────────────────┐
    │ Plugin (Abstract)                  │
    │ ├─ initialize(container)           │
    │ └─ shutdown()                      │
    └────┬──────────────────────────────┘
         │ implements via
    ┌────▼──────────────────────────────┐
    │ Concrete Plugins                   │
    │ ├─ CalculatorPlugin                │
    │ ├─ FileToolsPlugin                 │
    │ ├─ WebToolsPlugin                  │
    │ └─ DataToolsPlugin                 │
    └────────────────────────────────────┘
```

**Plugin Initialization Flow**:

```
1. PluginManager.loadPlugin('name', pluginInstance)
   │
2. pluginInstance.initialize(container)
   ├─→ Register commands to CommandRegistry
   ├─→ Register utilities to DIContainer
   ├─→ Set up event listeners
   └─→ Initialize resources
   
3. Plugin is now active
   └─→ Commands available
   └─→ Services accessible
   └─→ Events being listened
   
4. (Later) PluginManager.unloadPlugin('name')
   │
5. pluginInstance.shutdown()
   └─→ Clean up resources
   └─→ Remove event listeners
   └─→ Close connections
```

## Event System

Events allow decoupling of components:

```
┌──────────────────┐
│ EventEmitter     │
│ (publish/subscribe)
└────┬────────────┘
     │
  ┌──▼─────────────────────────────────┐
  │ CLI Lifecycle Events                │
  │                                     │
  │ ├─ startup                          │
  │ ├─ command:registered               │
  │ ├─ command:executed                 │
  │ ├─ command:failed                   │
  │ ├─ plugin:loaded                    │
  │ ├─ plugin:unloaded                  │
  │ ├─ error                            │
  │ └─ shutdown                         │
  └─────────────────────────────────────┘
```

**Usage Pattern**:

```typescript
// Listen to events
eventEmitter.on('command:executed', (data) => {
  console.log('Command executed:', data);
});

// Emit events (internal)
eventEmitter.emit('command:executed', { commandName: 'add' });

// Remove listener
eventEmitter.off('command:executed', callback);
```

## Error Handling Strategy

```
┌─────────────┐
│ Error       │
│ occurs      │
└────┬────────┘
     │
┌────▼──────────────────────────────────┐
│ Error Types                            │
│                                        │
│ ├─ ValidationError                     │
│ ├─ CommandNotFoundError                │
│ ├─ ConfigError                         │
│ ├─ ToolError                           │
│ └─ Generic Error                       │
└────┬──────────────────────────────────┘
     │
┌────▼──────────────────────────────────┐
│ CLIErrorHandler                        │
│ ├─ handle(error) → CommandResult       │
│ │  └─ Format into { success, error }  │
│ └─ format(error) → String              │
│    └─ User-friendly message            │
└────┬──────────────────────────────────┘
     │
  ┌──▼────────────────┐
  │ CommandResult      │
  │ { success: false,  │
  │   error: "...",    │
  │   message: "..." } │
  └────────────────────┘
```

## Testing Architecture

```
┌──────────────────────────────────────┐
│ Testing Components                   │
└──────────────────────────────────────┘
│
├─ MockIOHandler
│  └─ Simulates stdin/stdout
│
├─ Test Utilities
│  ├─ createTestCLI()
│  └─ Test helper functions
│
├─ Test Commands
│  └─ Mock command implementations
│
└─ Test Scenarios
   ├─ Command execution
   ├─ Argument parsing
   ├─ Error handling
   ├─ Output formatting
   └─ Event emission
```

## Agent Integration

For AI systems to use the CLI:

```
┌──────────────────────────┐
│ AI Agent                 │
└────────┬─────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │ ProgrammaticCLIAgent                 │
    │ ├─ execute(name, params)             │
    │ ├─ getTools()                        │
    │ ├─ getTool(name)                     │
    │ └─ processRequest(nlp)               │
    └────┬─────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ Tool Interface             │
    │ ├─ name                    │
    │ ├─ description             │
    │ ├─ parameters[]            │
    │ └─ execute()               │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────────┐
    │ CLI Engine                 │
    │ └─ executeCommand()        │
    └───────────────────────────┘
```

## Extensibility Points

### 1. Add Custom Commands

```typescript
// In your code or plugin
class MyCommand extends Command {
  // Implement abstract methods
}

// Register
commandRegistry.register(new MyCommand());
```

### 2. Create Plugins

```typescript
class MyPlugin extends BasePlugin {
  async initialize(container) {
    // Register commands, utilities, etc.
  }
}

await pluginManager.loadPlugin('myplugin', new MyPlugin());
```

### 3. Custom Tools

```typescript
const tool = new CustomToolBuilder()
  .setName('mytool')
  .setDescription('...')
  .addParameter(/* ... */)
  .setExecutor(async (params) => { /* ... */ })
  .build();
```

### 4. Replace Implementations

```typescript
// Use your own logger
class MyCustomLogger implements Logger { /* ... */ }
container.registerSingleton('logger', new MyCustomLogger());

// Use your own config manager
class MyConfigManager implements ConfigManager { /* ... */ }
container.registerSingleton('configManager', new MyConfigManager());
```

## Summary

This architecture provides:

✅ **Separation of Concerns** - Each component has one responsibility
✅ **Extensibility** - Add features without modifying existing code
✅ **Testability** - Mock implementations for testing
✅ **Maintainability** - Clear structure and interfaces
✅ **Scalability** - Plugin system for growth
✅ **AI Integration** - Agent-friendly programmatic access
✅ **Type Safety** - Full TypeScript support
✅ **Error Handling** - Comprehensive error management
✅ **Event-Driven** - Decoupled component communication
✅ **Dependency Injection** - Loose coupling and flexibility

This foundation is ready for building advanced AI tools like web scrapers, screenshot tools, data processors, and more.
