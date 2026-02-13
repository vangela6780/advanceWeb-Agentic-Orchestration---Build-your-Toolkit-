import { ConfigManager } from '../domain/types';
import * as fs from 'fs';
import * as path from 'path';
import { config as loadDotenv } from 'dotenv';
import { ConfigError } from './errorHandler';

/**
 * Concrete config manager implementation
 * Loads from .env files and provides key-value access
 * (D - Dependency Inversion: depends on ConfigManager interface)
 */
export class EnvConfigManager implements ConfigManager {
  private config: Map<string, string>;
  private readonly defaultPaths: string[] = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
  ];

  constructor() {
    this.config = new Map();
  }

  async load(filePath?: string): Promise<void> {
    const pathsToTry = filePath ? [filePath] : this.defaultPaths;

    for (const envPath of pathsToTry) {
      if (fs.existsSync(envPath)) {
        try {
          const envConfig = loadDotenv({ path: envPath });
          if (envConfig.parsed) {
            Object.entries(envConfig.parsed || {}).forEach(([key, value]) => {
              this.config.set(key, String(value));
            });
          }
          return;
        } catch (error) {
          throw new ConfigError(`Failed to load config from ${envPath}`, String(error));
        }
      }
    }

    // Also load from environment variables
    Object.entries(process.env).forEach(([key, value]: [string, string | undefined]) => {
      if (value) {
        this.config.set(key, value);
      }
    });
  }

  get(key: string): string | undefined {
    return this.config.get(key);
  }

  set(key: string, value: string): void {
    this.config.set(key, value);
  }

  getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    this.config.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
