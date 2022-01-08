import type Lexer from './lexer';
import type Token from './token';
import {
  AssignmentExpression,
  ASTNode,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  Kind,
  Literal,
  Program,
  ReturnStatement,
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

  private args(): Expression[] {
    const args: Expression[] = [];
    while (this.currToken.type !== TT.RPAREN) {
      args.push(this.expr());
      if (this.currToken.type !== TT.COMMA) return args;
      this.eat(TT.COMMA);
    }
    return args;
  }

  private factor(): ASTNode {
    if (this.currToken.type === TT.FUNCTION) {
      return this.funcExpression();
    }
    if (this.currToken.type === TT.ID) {
      const token = this.currToken;
      this.eat(TT.ID);
      let node: Expression = new Identifier(token);
      let currToken = this.currToken;
      if (currToken.type === TT.ASSIGN) {
        this.eat(TT.ASSIGN);
        node = new AssignmentExpression(currToken, node as Identifier, this.expr());
        return node;
      }
      while ([TT.LPAREN].includes(currToken.type)) {
        currToken = this.currToken;
        if (currToken.type === TT.LPAREN) {
          this.eat(TT.LPAREN);
          const args = this.args();
          this.eat(TT.RPAREN);
          node = new CallExpression(node, args);
        }
      }
      return node;
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
    const varDec = new VariableDeclaration(kind, [this.varDeclarator(kind)]);

    while (this.currToken.type === TT.COMMA) {
      this.eat(TT.COMMA);
      varDec.declarations.push(this.varDeclarator(kind));
    }
    return varDec;
  }

  private skipNewLine() {
    while (this.currToken.type === TT.NEWLINE) this.eat(TT.NEWLINE);
  }

  private funcDeclaration(): FunctionDeclaration {
    this.eat(TT.FUNCTION);

    const id = new Identifier(this.currToken);
    this.eat(TT.ID);

    this.eat(TT.LPAREN);
    const params = this.params();
    this.eat(TT.RPAREN);

    this.eat(TT.LBRACKET);
    const block = new BlockStatement([...this.body()]);
    this.eat(TT.RBRACKET);

    return new FunctionDeclaration(id, params, block);
  }

  private funcExpression(): FunctionExpression {
    this.eat(TT.FUNCTION);

    const id = this.currToken.type === TT.ID ? new Identifier(this.currToken) : null;
    if (!!id) this.eat(TT.ID);

    this.eat(TT.LPAREN);
    const params = this.params();
    this.eat(TT.RPAREN);

    this.eat(TT.LBRACKET);
    const block = new BlockStatement([...this.body()]);
    this.eat(TT.RBRACKET);

    return new FunctionExpression(id, params, block);
  }

  private params(): Identifier[] {
    if (this.currToken.type !== TT.ID) return [];
    const params: Identifier[] = [new Identifier(this.currToken)];
    this.eat(TT.ID);
    this.currToken = this.currToken;
    while (this.currToken.type === TT.COMMA) {
      this.eat(TT.COMMA);
      params.push(new Identifier(this.currToken));
      this.eat(TT.ID);
    }
    return params;
  }

  private body(): ASTNode[] {
    const body: ASTNode[] = [];
    this.skipNewLine();
    while (![TT.EOF, TT.RBRACKET].includes(this.currToken.type)) {
      if ([TT.VAR, TT.LET, TT.CONST].includes(this.currToken.type)) {
        body.push(this.varDeclaration());
        this.skipNewLine();
        continue;
      }
      if (this.currToken.type === TT.FUNCTION) {
        body.push(this.funcDeclaration());
        this.skipNewLine();
        continue;
      }
      if (this.currToken.type === TT.RETURN) {
        this.eat(TT.RETURN);
        this.currToken = this.currToken;
        const arg = this.currToken.type !== TT.NEWLINE ? this.expr() : null;
        body.push(new ReturnStatement(arg));
        this.skipNewLine();
        continue;
      }
      if (this.currToken.type === TT.LBRACKET) {
        this.eat(TT.LBRACKET);
        body.push(new BlockStatement([...this.body()]));
        this.eat(TT.RBRACKET);
        this.skipNewLine();
        continue;
      }
      body.push(this.expr());
      this.skipNewLine();
    }
    return body;
  }

  private program(): ASTNode {
    return new Program([...this.body()]);
  }

  parse() {
    return this.program();
  }
}

export default Parser;
