import type Lexer from './lexer';
import type Token from './token';
import { ASTNode, BinOp, Num } from './ast';
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
    if (this.currToken.type === TT.NUM) {
      const node = new Num(this.currToken, Number(this.currToken.value));
      this.eat(TT.NUM);
      return node;
    }
    throw this.err('Invalid syntax');
  }

  private term(): ASTNode {
    let node = this.factor();
    while ([TT.MUL, TT.DIV].includes(this.currToken.type)) {
      const token = this.currToken;
      this.eat(token.type);
      node = new BinOp(token, node, this.factor());
    }
    return node;
  }

  private expr(): ASTNode {
    let node = this.term();
    while ([TT.ADD, TT.SUB].includes(this.currToken.type)) {
      const token = this.currToken;
      this.eat(token.type);
      node = new BinOp(token, node, this.term());
    }
    return node;
  }

  parse() {
    const node = this.expr();
    if (this.currToken.type !== TT.EOF) throw this.err('Invalid syntax');
    return node;
  }
}

export default Parser;
