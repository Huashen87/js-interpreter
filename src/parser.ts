import type Lexer from './lexer';
import type Token from './token';
import {
  AssignmentExpression,
  ASTNode,
  BinaryExpression,
  Identifier,
  Kind,
  Literal,
  Program,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from './ast';
import { TT } from './token';

class Parser {
  private currToken: Token = this.lexer.next();

  constructor(private lexer: Lexer) {}

  private err(msg: string = '') {
    return new Error(`Parser error: ${msg}`);
  }

  private eat(type: TT) {
    if (this.currToken.type === type) this.currToken = this.lexer.next();
    else
      throw this.err(
        `Expected token [${TT[type]}], but got [${TT[this.currToken.type]}]`
      );
  }

  private factor(): ASTNode {
    if (this.currToken.type === TT.ID) {
      const token = this.currToken;
      this.eat(TT.ID);
      const id = new Identifier(token);
      const newToken = this.currToken;
      if (newToken.type !== TT.ASSIGN) return id;
      this.eat(TT.ASSIGN);
      return new AssignmentExpression(newToken, id, this.expr());
    }
    if ([TT.ADD, TT.SUB].includes(this.currToken.type)) {
      const token = this.currToken;
      this.eat(this.currToken.type);
      const node = new UnaryExpression(token, this.factor());
      return node;
    }
    if (this.currToken.type === TT.NUM) {
      const node = new Literal(this.currToken, Number(this.currToken.value));
      this.eat(TT.NUM);
      return node;
    }
    if (this.currToken.type === TT.LPAREN) {
      this.eat(TT.LPAREN);
      const node = this.expr();
      this.eat(TT.RPAREN);
      return node;
    }
    throw this.err('Invalid syntax');
  }

  private term(): ASTNode {
    let node = this.factor();
    while ([TT.MUL, TT.DIV].includes(this.currToken.type)) {
      const token = this.currToken;
      this.eat(token.type);
      node = new BinaryExpression(token, node, this.factor());
    }
    return node;
  }

  private expr(): ASTNode {
    let node = this.term();
    while ([TT.ADD, TT.SUB].includes(this.currToken.type)) {
      const token = this.currToken;
      this.eat(token.type);
      node = new BinaryExpression(token, node, this.term());
    }
    return node;
  }

  private varDeclarator(kind: Kind): VariableDeclarator {
    while (this.currToken.type === TT.NEWLINE) this.eat(TT.NEWLINE);
    const id = new Identifier(this.currToken);
    this.eat(TT.ID);

    if (this.currToken.type === TT.ASSIGN || kind === 'const') {
      this.eat(TT.ASSIGN);
      return new VariableDeclarator(id, this.expr());
    }
    return new VariableDeclarator(id);
  }

  private varDeclaration(): ASTNode {
    const kind = this.currToken.value as Kind;
    this.eat(this.currToken.type);
    const varDec = new VariableDeclaration(kind, []);

    varDec.declarations.push(this.varDeclarator(kind));
    while (this.currToken.type === TT.COMMA) {
      this.eat(TT.COMMA);
      varDec.declarations.push(this.varDeclarator(kind));
    }
    return varDec;
  }

  private program(): ASTNode {
    const program = new Program([]);
    while (this.currToken.type !== TT.EOF) {
      if ([TT.VAR, TT.LET, TT.CONST].includes(this.currToken.type)) {
        const varDec = this.varDeclaration();
        program.body.push(varDec);
      } else {
        const expr = this.expr();
        program.body.push(expr);
      }

      this.eat(TT.NEWLINE);
      while (this.currToken.type === TT.NEWLINE) this.eat(TT.NEWLINE);
    }
    return program;
  }

  parse() {
    const node = this.program();
    return node;
  }
}

export default Parser;
