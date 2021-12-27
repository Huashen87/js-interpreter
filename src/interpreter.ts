import type { BinOp, Num } from './ast';
import type Parser from './parser';
import { TT } from './token';
import NodeVisitor from './visitor';

class Interpreter extends NodeVisitor {
  constructor(private parser: Parser) {
    super();
  }

  private visitNum(node: Num) {
    return node.value;
  }

  private visitBinOp(node: BinOp) {
    const left = this.visit(node.left);
    const right = this.visit(node.right);

    if (node.token.type === TT.ADD) return left + right;
    if (node.token.type === TT.SUB) return left - right;
    if (node.token.type === TT.MUL) return left * right;
    if (node.token.type === TT.DIV) return left / right;
  }

  interprete() {
    const ast = this.parser.parse();
    const result = this.visit(ast);
    return result;
  }
}

export default Interpreter;
