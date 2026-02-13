# Quick Start Guide

Get started with the AI CLI Engine in 5 minutes.

## Installation

```bash
npm install
npm run build
```

## Run CLI

### Basic Commands

```bash
# Show help
npm start help

# Show version
npm start version

# Show status
npm start status

# Echo text
npm start echo "Hello, World!"

# Output as JSON
npm start help --json

# Verbose mode
npm start -v help
```

## Create Your First Command

Create `src/commands/MyCommand.ts`:

```typescript
import { Command, CLIContext, CommandResult } from '../domain/types';

export class GreetCommand extends Command {
  readonly name = 'greet';
  readonly description = 'Greet someone';
  readonly usage = 'greet [--name John]';

  validate(context: CLIContext) {
    return { valid: true, errors: [] };
  }

  async execute(context: CLIContext): Promise<CommandResult> {
    const name = String(context.options.name || 'World');
    
    return {
      success: true,
      data: { greeting: `Hello, ${name}!` },
      message: `Greeted ${name}`,
      timestamp: new Date(),
      executionTimeMs: 0,
    };
  }
}
```

Register it in `src/application/bootstrap.ts`:

```typescript
import { GreetCommand } from '../commands/MyCommand';

// In CLIBootstrap.create():
commandRegistry.register(new GreetCommand());
```

Run it:

```bash
npm start greet --name Alice
```

## Create a Plugin

Create `src/plugins/MyPlugin.ts`:

```typescript
import { BasePlugin } from '../application/pluginManager';
import { ServiceContainer } from '../domain/types';
import { GreetCommand } from '../commands/MyCommand';

export class MyPlugin extends BasePlugin {
  async initialize(container: ServiceContainer): Promise<void> {
    const commandRegistry = container.get('commandRegistry');
    const logger = container.get('logger');

    logger.info('Loading MyPlugin');
    commandRegistry.register(new GreetCommand());
    logger.info('MyPlugin loaded');
  }
}
```

Load it in your code:

```typescript
import { CLIBootstrap } from './application/bootstrap';
import { MyPlugin } from './plugins/MyPlugin';

const { pluginManager } = await CLIBootstrap.create();
await pluginManager.loadPlugin('myplugin', new MyPlugin());
```

## Use as Agent

```typescript
import { CLIBootstrap } from './application/bootstrap';
import { ProgrammaticCLIAgent } from './adapters/agentInterface';

const { engine, registry } = await CLIBootstrap.create();
const agent = new ProgrammaticCLIAgent(engine, registry);

// Get available tools
const tools = agent.getTools();

// Execute a tool
const result = await agent.execute('greet', { name: 'Alice' });
console.log(result); // { success: true, data: { greeting: 'Hello, Alice!' } }
```

## Configuration

Create `.env`:

```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
LOG_FILE_PATH=./logs/cli.log
VERBOSE=true
```

Access in your code:

```typescript
const configManager = container.get('configManager');
const apiKey = configManager.get('OPENAI_API_KEY');
```

## Examples

All examples are in the `examples/` directory:

- `agentUsage.ts` - Using CLI with AI agents
- `advancedCommands.ts` - Complex command examples
- `testing.ts` - Testing the CLI
- `completeAppSetup.ts` - Full application setup
- `toolPlugins.ts` - File, Web, Data tool plugins

Run examples:

```bash
npm run dev examples/agentUsage.ts
npm run dev examples/testing.ts
npm run dev examples/completeAppSetup.ts
```

## Common Tasks

### Listen to Events

```typescript
const eventEmitter = container.get('eventEmitter');

eventEmitter.on('command:executed', (data) => {
  console.log('Command executed:', data);
});
```

### Log Messages

```typescript
const logger = container.get('logger');
logger.info('Info message', { data: 123 });
logger.error('Error occurred', error);
```

### Handle Errors

```typescript
import { ValidationError, ToolError } from './infrastructure/errorHandler';

try {
  throw new ValidationError('Invalid input', ['error1', 'error2']);
} catch (error) {
  const result = errorHandler.handle(error);
  // Returns: { success: false, error: '...', ...}
}
```

### Create Custom Tool

```typescript
import { CustomToolBuilder } from './adapters/agentInterface';

const myTool = new CustomToolBuilder()
  .setName('calc')
  .setDescription('Simple calculator')
  .addParameter({
    name: 'expression',
    type: 'string',
    description: 'Math expression',
    required: true,
  })
  .setExecutor(async (params) => {
    try {
      const result = eval(params.expression);
      return { success: true, data: { result } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  })
  .build();
```

## Next Steps

1. **Explore Examples**: Check out `examples/` directory for real-world usage
2. **Read Architecture**: See `ARCHITECTURE.md` for design deep-dive
3. **Read Docs**: Check `README.md` for complete documentation
4. **Build Tools**: Create plugins for web, file, data operations
5. **Integrate AI**: Use `ProgrammaticCLIAgent` with your AI system

## Troubleshooting

### Port already in use
- Change `LOG_FILE_PATH` in `.env`

### Build errors
```bash
npm run build -- --force
```

### Reset everything
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Project Structure

```
assignmentOne/
├── src/
│   ├── domain/          # Interfaces (contracts)
│   ├── infrastructure/  # Implementations
│   ├── application/     # Business logic
│   ├── adapters/        # External integration
│   ├── plugins/         # Example plugins
│   └── index.ts         # Entry point
├── examples/            # Usage examples
├── README.md            # Full documentation
├── ARCHITECTURE.md      # Design deep-dive
├── package.json
├── tsconfig.json
└── .env                 # Configuration
```

## Key Concepts

### Commands
Extend `Command` class to create new CLI commands.

```typescript
class MyCommand extends Command {
  readonly name = 'mycommand';
  async execute(context) { /* ... */ }
}
```

### Plugins
Extend `BasePlugin` to bundle related functionality.

```typescript
class MyPlugin extends BasePlugin {
  async initialize(container) { /* register commands */ }
}
```

### Tools
Programmatic interfaces for agents to use commands.

```typescript
const tools = agent.getTools(); // Get available tools
const result = await agent.execute('cmd', params); // Execute
```

### Services
Use dependency injection to access services.

```typescript
const logger = container.get('logger');
const config = container.get('configManager');
```

## Performance Tips

1. **Use JSON output** for large results: `--json`
2. **Enable verbose logging** only for debugging: `--verbose`
3. **Cache configuration** if accessing frequently
4. **Use plugins** to load features on-demand

## Security

1. Never commit `.env` with production keys
2. Use environment variables for sensitive data
3. Validate all user input in command `validate()` method
4. Escape output in unsafe contexts

## Contributing

To extend the CLI:

1. Follow SOLID principles
2. Add interfaces to `domain/types.ts`
3. Implement in appropriate layer
4. Add tests in `examples/testing.ts`
5. Update documentation

---

Happy CLI building! 🚀
