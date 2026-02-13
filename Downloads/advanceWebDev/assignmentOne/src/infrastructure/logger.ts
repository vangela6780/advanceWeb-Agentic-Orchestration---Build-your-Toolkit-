import { Logger } from '../domain/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Concrete logger implementation with file and console output
 * (D - Dependency Inversion: depends on Logger interface)
 */
export class CLILogger implements Logger {
  private logFile: string | null;
  private verbose: boolean;

  constructor(logFile?: string, verbose: boolean = false) {
    this.logFile = logFile || null;
    this.verbose = verbose;

    if (this.logFile) {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  private writeToFile(formatted: string): void {
    if (!this.logFile) return;
    try {
      fs.appendFileSync(this.logFile, formatted + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  info(message: string, data?: any): void {
    const formatted = this.formatMessage('INFO', message, data);
    console.log(formatted);
    this.writeToFile(formatted);
  }

  warn(message: string, data?: any): void {
    const formatted = this.formatMessage('WARN', message, data);
    console.warn(formatted);
    this.writeToFile(formatted);
  }

  error(message: string, error?: any): void {
    const formatted = this.formatMessage('ERROR', message, error ? error.stack || error : undefined);
    console.error(formatted);
    this.writeToFile(formatted);
  }

  debug(message: string, data?: any): void {
    if (!this.verbose) return;
    const formatted = this.formatMessage('DEBUG', message, data);
    console.log(formatted);
    this.writeToFile(formatted);
  }
}
