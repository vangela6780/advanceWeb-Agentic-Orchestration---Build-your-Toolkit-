import { EventEmitter } from '../domain/types';

/**
 * Event emitter implementation for CLI lifecycle events
 * (O - Open/Closed: open for extension through event listeners)
 */
export class CLIEventEmitter implements EventEmitter {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.delete(callback);
  }
}

/**
 * Standard CLI events
 */
export const CLIEvents = {
  COMMAND_REGISTERED: 'command:registered',
  COMMAND_EXECUTED: 'command:executed',
  COMMAND_FAILED: 'command:failed',
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  ERROR: 'error',
  STARTUP: 'startup',
  SHUTDOWN: 'shutdown',
} as const;
