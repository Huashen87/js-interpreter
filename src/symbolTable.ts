import { Kind } from './ast';

export type ScopeType = 'global' | 'block' | 'function';

export interface Variable {
  kind: Kind;
  value: any;
}

class SymbolTable {
  private table: Map<string, Variable> = new Map<string, Variable>();

  constructor(
    public readonly prev: SymbolTable | null,
    private readonly type: ScopeType = 'block'
  ) {}

  get(name: string): any {
    if (this.table.has(name)) return this.table.get(name)!.value;
    if (!!this.prev) return this.prev.get(name);
    throw new ReferenceError(`${name} is not defined`);
  }

  set(name: string, value: any): any {
    if (!this.table.has(name)) {
      if (!!this.prev) return this.prev.set(name, value);
      return this.declare(name, value, 'var');
    }
    const kind = this.table.get(name)!.kind;
    if (kind === 'const') throw new TypeError(`Assignment to constant variable.`);
    this.table.set(name, { kind, value });
  }

  declare(name: string, value: any, kind: Kind): any {
    if (kind === 'var' && this.type !== 'function' && this.type !== 'global')
      if (!!this.prev) return this.prev.declare(name, value, kind);
    if (!this.table.has(name)) return this.table.set(name, { kind, value });
    if (this.table.get(name)!.kind === 'var' && kind === 'var')
      return this.table.set(name, { kind, value });
    throw new SyntaxError(`Identifier '${name}' has already been declared`);
  }
}

export default SymbolTable;
