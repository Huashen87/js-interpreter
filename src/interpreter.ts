import type {
  BinaryExpression,
  Identifier,
  Literal,
  Program,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from './ast';
import type Parser from './parser';
import { TT } from './token';
import NodeVisitor from './visitor';

class Interpreter extends NodeVisitor {
  public readonly symbolTables: Map<string, any>[] = [new Map<string, any>()];

  constructor(private parser: Parser) {
    super();
  }

  private visitLiteral(node: Literal) {
    return node.value;
  }

  private visitBinaryExpression(node: BinaryExpression) {
    const left = this.visit(node.left);
    const right = this.visit(node.right);

    if (node.token.type === TT.ADD) return left + right;
    if (node.token.type === TT.SUB) return left - right;
    if (node.token.type === TT.MUL) return left * right;
    if (node.token.type === TT.DIV) return left / right;
  }

  private visitUnaryExpression(node: UnaryExpression) {
    const value = this.visit(node.node);

    if (node.token.type === TT.ADD) return +value;
    if (node.token.type === TT.SUB) return -value;
  }

  private last<T>(array: T[]): T {
    return array[array.length - 1];
  }

  private visitVariableDeclaration(node: VariableDeclaration) {
    node.declarations.forEach((dec) => this.visit(dec));
  }

  private visitVariableDeclarator(node: VariableDeclarator) {
    const id = node.id.token.value;
    if (!node.init) {
      this.last(this.symbolTables).set(id, undefined);
      return;
    }
    const value = this.visit(node.init);
    this.last(this.symbolTables).set(id, value);
  }

  private visitIdentifier(node: Identifier) {
    const name = node.token.value;
    for (let i = this.symbolTables.length - 1; i >= 0; i--)
      if (this.symbolTables[i].has(name)) return this.symbolTables[i].get(name);
    throw new ReferenceError(`${name} is not defined`);
  }

  private visitProgram(program: Program) {
    return program.body.map((node) => this.visit(node));
  }

  interpret(): any[] {
    const ast = this.parser.parse();
    const result = this.visit(ast);
    return result;
  }
}

export default Interpreter;
