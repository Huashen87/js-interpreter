import type {
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  Identifier,
  Kind,
  Literal,
  Program,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from './ast';
import type Parser from './parser';
import SymbolTable from './symbolTable';
import { TT } from './token';
import NodeVisitor from './visitor';

class Interpreter extends NodeVisitor {
  private symbolTable: SymbolTable = new SymbolTable(null, 'global');

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

  private visitVariableDeclaration(node: VariableDeclaration) {
    node.declarations.forEach((dec) => this.visitVariableDeclarator(dec, node.kind));
  }

  private visitVariableDeclarator(node: VariableDeclarator, kind: Kind) {
    const id = node.id.token.value;
    const value = node.init ? this.visit(node.init) : undefined;
    this.symbolTable.declare(id, value, kind);
  }

  private visitIdentifier(node: Identifier) {
    const name = node.token.value;
    return this.symbolTable.get(name);
  }

  private visitAssignmentExpression(node: AssignmentExpression) {
    const name = node.left.token.value;
    const value = this.visit(node.right);
    this.symbolTable.set(name, value);
    return value;
  }

  private visitProgram(program: Program) {
    return program.body.map((node) => this.visit(node));
  }

  private visitBlockStatement(block: BlockStatement) {
    this.symbolTable = new SymbolTable(this.symbolTable);
    const results = block.body.map((node) => this.visit(node));
    this.symbolTable = this.symbolTable.prev!;
    return results;
  }

  interpret(): any[] {
    const ast = this.parser.parse();
    const result = this.visit(ast);
    return result;
  }
}

export default Interpreter;
