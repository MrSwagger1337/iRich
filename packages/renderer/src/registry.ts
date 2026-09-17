/**
 * @irich/renderer
 * Component registry for React renderers.
 */

import type { ComponentMap, ComponentRenderer } from './types';

export class RendererRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private components = new Map<string, ComponentRenderer<any>>();

  constructor(initialComponents: ComponentMap = {}) {
    for (const [type, component] of Object.entries(initialComponents)) {
      this.register(type, component);
    }
  }

  public register<Props = Record<string, unknown>>(
    type: string,
    component: ComponentRenderer<Props>,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.components.set(type, component as ComponentRenderer<any>);
  }

  public unregister(type: string): boolean {
    return this.components.delete(type);
  }

  public get<Props = Record<string, unknown>>(
    type: string,
  ): ComponentRenderer<Props> | undefined {
    return this.components.get(type) as ComponentRenderer<Props> | undefined;
  }

  public has(type: string): boolean {
    return this.components.has(type);
  }

  public getAll(): ComponentMap {
    return Object.fromEntries(this.components.entries());
  }

  public clear(): void {
    this.components.clear();
  }
}

/**
 * Creates a new instance of RendererRegistry.
 */
export function createRenderer(initialComponents?: ComponentMap): RendererRegistry {
  return new RendererRegistry(initialComponents);
}
