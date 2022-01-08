import type {
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  Kind,
  Literal,
  MemberExpression,
  Program,
  ReturnStatement,
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
    this.symbolTable.declare('console', console, 'var');
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
    const result = this.iterateBlock(block);
    this.symbolTable = this.symbolTable.prev!;
    return result;
  }

  private visitFunctionDeclaration(func: FunctionDeclaration) {
    const fn = this.visitFunctionExpression(func);
    this.symbolTable.declare(func.id.token.value, fn, 'var');
  }

  private visitFunctionExpression(func: FunctionExpression) {
    const symbolTable = new SymbolTable(this.symbolTable, 'function');
    return (...args: any[]) => {
      this.symbolTable = symbolTable;
      func.params.forEach((param, i) =>
        this.symbolTable.declare(param.token.value, args[i], 'var')
      );
      const result = this.iterateBlock(func.body);
      this.symbolTable = this.symbolTable.prev!;
      return result?.value;
    };
  }

  private iterateBlock(block: BlockStatement) {
    for (const node of block.body) {
      const value = this.visit(node);
      if (value?.return) return value;
    }
  }

  private visitReturnStatement(ret: ReturnStatement) {
    return {
      return: true,
      value: ret.argument ? this.visit(ret.argument) : undefined,
    };
  }

  private visitCallExpression(node: CallExpression) {
    const callee = this.visit(node.callee);
    if (typeof callee !== 'function')
      throw new TypeError(`${callee} is not a function`);
    return callee(...node.args.map((arg) => this.visit(arg)));
  }

  private visitMemberExpression(node: MemberExpression) {
    const object = this.visit(node.object);
    const property = this.visit(node.property);
    if (!!object) return object[property];
    throw new TypeError(`Cannot read properties of ${object} (reading '${property}')`);
  }

  interpret(): any[] {
    const ast = this.parser.parse();
    const result = this.visit(ast);
    return result;
  }
}

export default Interpreter;
