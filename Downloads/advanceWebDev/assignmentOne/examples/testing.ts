/// <reference types="node" />
/**
 * Example: Testing the CLI
 * Shows how to test commands and the CLI engine
 */

import { CLIBootstrap } from '../src/application/bootstrap';
import { EchoCommand, HelpCommand } from '../src/application/builtinCommands';
import { MockIOHandler } from '../src/infrastructure/ioHandler';
import { DIContainer } from '../src/infrastructure/diContainer';
import { CommandRecordRegistry } from '../src/infrastructure/commandRegistry';
import { CLILogger } from '../src/infrastructure/logger';
import { CLIErrorHandler } from '../src/infrastructure/errorHandler';
import { CLIEventEmitter } from '../src/infrastructure/eventEmitter';
import { CLIInputValidator, CLIOutputFormatter } from '../src/infrastructure/validators';
import { StandardCLIEngine } from '../src/application/cliEngine';
import { CLIContext } from '../src/domain/types';

/**
 * Test helper: Create a test CLI engine with mock IO
 */
export async function createTestCLI() {
  const { engine, container, registry } = await CLIBootstrap.create();

  return {
    engine,
    container,
    registry,
    mockIO: new MockIOHandler(),
  };
}

/**
 * Test Example 1: Test Command Execution
 */
export async function testCommandExecution(): Promise<void> {
  console.log('=== Test 1: Command Execution ===\n');

  const { engine, registry } = await createTestCLI();

  const context: CLIContext = {
    arguments: ['Hello', 'CLI'],
    options: {},
    outputFormat: 'json',
    verbose: false,
  };

  const result = await engine.executeCommand('echo', context);

  console.log('Execute echo command:');
  console.log('Input:', 'Hello CLI');
  console.log('Result:', result);
  console.log('Success:', result.success);
  console.log();
}

/**
 * Test Example 2: Test Command Validation
 */
export async function testCommandValidation(): Promise<void> {
  console.log('=== Test 2: Command Validation ===\n');

  const { registry } = await createTestCLI();

  const echoCmd = registry.get('echo');

  if (echoCmd) {
    // Test invalid input
    const validation1 = echoCmd.validate({
      arguments: [],
      options: {},
      outputFormat: 'text',
      verbose: false,
    });
    console.log('Validation with no arguments:');
    console.log('Valid:', validation1.valid);
    console.log('Errors:', validation1.errors);
    console.log();

    // Test valid input
    const validation2 = echoCmd.validate({
      arguments: ['test'],
      options: {},
      outputFormat: 'text',
      verbose: false,
    });
    console.log('Validation with arguments:');
    console.log('Valid:', validation2.valid);
    console.log('Errors:', validation2.errors);
    console.log();
  }
}

/**
 * Test Example 3: Test Error Handling
 */
export async function testErrorHandling(): Promise<void> {
  console.log('=== Test 3: Error Handling ===\n');

  const { engine } = await createTestCLI();

  // Test non-existent command
  const result = await engine.execute(['nonexistent', 'command']);

  console.log('Execute non-existent command:');
  console.log('Success:', result.success);
  console.log('Error:', result.error);
  console.log();
}

/**
 * Test Example 4: Test Argument Parsing
 */
export async function testArgumentParsing(): Promise<void> {
  console.log('=== Test 4: Argument Parsing ===\n');

  const validator = new CLIInputValidator();

  // Test parsing various argument formats
  const tests = [
    ['help'],
    ['add', '5', '3'],
    ['help', '--verbose'],
    ['help', '--json'],
    ['echo', 'Hello', 'World', '--json'],
    ['echo', 'text', '-v'],
  ];

  tests.forEach((args) => {
    const context = validator.parseArguments(args);
    console.log(`Input: ${args.join(' ')}`);
    console.log(`  Arguments: ${JSON.stringify(context.arguments)}`);
    console.log(`  Options: ${JSON.stringify(context.options)}`);
    console.log(`  Format: ${context.outputFormat}`);
    console.log(`  Verbose: ${context.verbose}`);
    console.log();
  });
}

/**
 * Test Example 5: Test Output Formatting
 */
export async function testOutputFormatting(): Promise<void> {
  console.log('=== Test 5: Output Formatting ===\n');

  const formatter = new CLIOutputFormatter();

  // Test successful result
  const successResult = {
    success: true,
    data: { value: 42 },
    message: 'Operation successful',
    timestamp: new Date(),
    executionTimeMs: 123,
  };

  console.log('Success Result (Text Format):');
  console.log(formatter.format(successResult, 'text'));
  console.log();

  console.log('Success Result (JSON Format):');
  console.log(formatter.format(successResult, 'json'));
  console.log();

  // Test failure result
  const failureResult = {
    success: false,
    error: 'Something went wrong',
    timestamp: new Date(),
    executionTimeMs: 50,
  };

  console.log('Failure Result (Text Format):');
  console.log(formatter.format(failureResult, 'text'));
  console.log();
}

/**
 * Test Example 6: Test Event Emitter
 */
export async function testEventEmitter(): Promise<void> {
  console.log('=== Test 6: Event Emitter ===\n');

  const { container } = await createTestCLI();
  const eventEmitter = container.get('eventEmitter');

  let commandExecutedCount = 0;
  let commandFailedCount = 0;

  eventEmitter.on('command:executed', ({ commandName }: any) => {
    commandExecutedCount++;
    console.log(`Event: Command '${commandName}' executed`);
  });

  eventEmitter.on('command:failed', ({ commandName }: any) => {
    commandFailedCount++;
    console.log(`Event: Command '${commandName}' failed`);
  });

  // Emit test events
  eventEmitter.emit('command:executed', { commandName: 'test' });
  eventEmitter.emit('command:failed', { commandName: 'test' });

  console.log(`\nTotal executed events: ${commandExecutedCount}`);
  console.log(`Total failed events: ${commandFailedCount}`);
  console.log();
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('╔════════════════════════════════════╗');
  console.log('║  CLI Test Suite                    ║');
  console.log('╚════════════════════════════════════╝\n');

  try {
    await testCommandExecution();
    await testCommandValidation();
    await testErrorHandling();
    await testArgumentParsing();
    await testOutputFormatting();
    await testEventEmitter();

    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if ((require as any).main === module) {
  runAllTests();
}
