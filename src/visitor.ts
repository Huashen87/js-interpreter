import type { ASTNode } from './ast';

abstract class NodeVisitor {
  protected visit(node: ASTNode): number {
    const name = `this.visit${node.constructor.name}`;
    return eval(`typeof ${name} === 'function' ? ${name}(node) : this.err(name)`);
  }

  protected err(name: string) {
    throw new Error(`Visitor error: Function ${name.split('.')[1]} doesn't exists`);
  }
}

export default NodeVisitor;
