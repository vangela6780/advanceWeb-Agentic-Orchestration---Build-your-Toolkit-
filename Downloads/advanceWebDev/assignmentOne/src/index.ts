import { CLIBootstrap } from './application/bootstrap';
import { CLIOutputFormatter } from './infrastructure/validators';
import { IOHandler, Logger } from './domain/types';

/**
 * Main entry point for the CLI application
 */
async function main(): Promise<void> {
  try {
    // Bootstrap the CLI application
    const { engine, container, pluginManager } = await CLIBootstrap.create();

    const logger = container.get('logger') as Logger;
    const ioHandler = container.get('ioHandler') as IOHandler;
    const outputFormatter = new CLIOutputFormatter();

    // Get command-line arguments (skip node and script path)
    const args = process.argv.slice(2);

    // Display help if no arguments provided
    if (args.length === 0) {
      const result = await engine.executeCommand('help', {
        arguments: [],
        options: {},
        outputFormat: 'text',
        verbose: false,
      });

      const formattedOutput = outputFormatter.format(result, 'text');
      ioHandler.writeOutput(formattedOutput, 'text');
      process.exit(0);
    }

    // Execute the command
    const result = await engine.execute(args);

    // Format and output the result
    const outputFormat = args.includes('--json') || args.includes('-j') ? 'json' : 'text';
    const formattedOutput = outputFormatter.format(result, outputFormat);

    if (result.success) {
      ioHandler.writeOutput(formattedOutput, 'text');
    } else {
      ioHandler.writeError(formattedOutput);
      process.exit(1);
    }

    // Shutdown gracefully
    // Shutdown complete
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
}

export { CLIBootstrap };
