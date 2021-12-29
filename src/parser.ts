import type Lexer from './lexer';
import type Token from './token';
import { ASTNode, BinaryExpression, Literal, Program, UnaryExpression } from './ast';
import { TT } from './token';

class Parser {
  private currToken: Token = this.lexer.next();

  constructor(private lexer: Lexer) {}

  private err(msg: string = '') {
    return new Error(`Parser error: ${msg}`);
  }

  private eat(type: TT) {
    if (this.currToken.type === type) this.currToken = this.lexer.next();
    else throw this.err(`Expected token [${TT[type]}], but got [${TT[type]}]`);
  }

  private factor(): ASTNode {
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

  private program(): ASTNode {
    const program = new Program([]);
    while (this.currToken.type !== TT.EOF) {
      const expr = this.expr();
      program.body.push(expr);
    }
    return program;
  }

  parse() {
    const node = this.program();
    return node;
  }
}

export default Parser;
