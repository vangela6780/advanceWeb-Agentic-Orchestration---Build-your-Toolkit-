import { IOHandler } from '../domain/types';
import * as readline from 'readline';

/**
 * Concrete IO handler for CLI
 * Handles reading from stdin and writing to stdout/stderr
 * (D - Dependency Inversion: depends on IOHandler interface)
 */
export class CLIIOHandler implements IOHandler {
  private rl: readline.Interface | null = null;

  async readInput(): Promise<string> {
    return new Promise((resolve) => {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      this.rl.question('> ', (answer: string) => {
        this.rl?.close();
        this.rl = null;
        resolve(answer);
      });
    });
  }

  writeOutput(data: any, format: 'text' | 'json'): void {
    if (format === 'json') {
      console.log(JSON.stringify(data, null, 2));
    } else {
      if (typeof data === 'string') {
        console.log(data);
      } else if (data && typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data);
      }
    }
  }

  writeError(error: string | Error): void {
    const message = error instanceof Error ? error.message : error;
    console.error(`❌ ${message}`);
  }
}

/**
 * Mock IO handler for testing
 */
export class MockIOHandler implements IOHandler {
  private inputQueue: string[] = [];
  public outputs: string[] = [];
  public errors: string[] = [];

  enqueueInput(input: string): void {
    this.inputQueue.push(input);
  }

  async readInput(): Promise<string> {
    return this.inputQueue.shift() || '';
  }

  writeOutput(data: any, format: 'text' | 'json'): void {
    const output = format === 'json' ? JSON.stringify(data, null, 2) : String(data);
    this.outputs.push(output);
  }

  writeError(error: string | Error): void {
    const message = error instanceof Error ? error.message : error;
    this.errors.push(message);
  }
}
