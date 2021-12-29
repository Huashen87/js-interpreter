import type { BinaryExpression, Literal, Program, UnaryExpression } from './ast';
import type Parser from './parser';
import { TT } from './token';
import NodeVisitor from './visitor';

class Interpreter extends NodeVisitor {
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

  private visitProgram(program: Program) {
    return program.body.map((node) => this.visit(node));
  }

  interprete(): any[] {
    const ast = this.parser.parse();
    const result = this.visit(ast);
    return result;
  }
}

export default Interpreter;
