import { ServiceContainer } from '../domain/types';

/**
 * Concrete service container for dependency injection
 * (D - Dependency Inversion: enables loose coupling through DI)
 */
export class DIContainer implements ServiceContainer {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  register(key: string, service: any): void {
    this.services.set(key, service);
  }

  get(key: string): any {
    if (this.services.has(key)) {
      const service = this.services.get(key);
      // If it's a factory function, call it
      if (typeof service === 'function' && !this.singletons.has(key)) {
        const instance = service();
        this.singletons.set(key, instance);
        return instance;
      }
      return service;
    }
    throw new Error(`Service '${key}' not found in container`);
  }

  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Register a service as a singleton
   */
  registerSingleton(key: string, instance: any): void {
    this.services.set(key, instance);
    this.singletons.set(key, instance);
  }

  /**
   * Register a factory function
   */
  registerFactory(key: string, factory: () => any): void {
    this.services.set(key, factory);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}
