import { Command, CommandRegistry } from '../domain/types';

/**
 * Concrete command registry implementation
 * (S - Single Responsibility: only manages command registration)
 * (O - Open/Closed: can register new commands without modifying existing code)
 */
export class CommandRecordRegistry implements CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name.toLowerCase(), command);
  }

  unregister(commandName: string): void {
    this.commands.delete(commandName.toLowerCase());
  }

  get(commandName: string): Command | null {
    return this.commands.get(commandName.toLowerCase()) || null;
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  exists(commandName: string): boolean {
    return this.commands.has(commandName.toLowerCase());
  }
}
