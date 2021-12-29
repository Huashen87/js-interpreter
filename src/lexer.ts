import Token, { TT } from './token';

class Lexer {
  private index: number = 0;
  private currChar: string = this.text[0];

  constructor(private text: string) {}

  private err(msg: string = ''): Error {
    return new Error(`Lexer error: ${msg}`);
  }

  private advance() {
    this.currChar = this.text[++this.index];
  }

  private isNum(str: string): boolean {
    return /[0-9]/.test(str);
  }

  private number(): string {
    const start = this.index;
    let hasDot = false;
    while (this.isNum(this.currChar) || this.currChar === '.') {
      if (this.currChar === '.') {
        if (hasDot) throw this.err('Invalid number syntax');
        hasDot = true;
      }
      this.advance();
    }
    return this.text.slice(start, this.index);
  }

  private newLine() {
    while ([';', '\n', '\r'].includes(this.currChar)) this.advance();
    return new Token(TT.NEWLINE, this.currChar);
  }

  next(): Token {
    while (this.currChar !== undefined) {
      if (this.currChar === ' ') {
        this.advance();
        continue;
      }
      if (this.isNum(this.currChar)) {
        const token = new Token(TT.NUM, this.number());
        return token;
      }
      if (this.currChar === '+') {
        const token = new Token(TT.ADD, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '-') {
        const token = new Token(TT.SUB, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '*') {
        const token = new Token(TT.MUL, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '/') {
        const token = new Token(TT.DIV, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '(') {
        const token = new Token(TT.LPAREN, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === ')') {
        const token = new Token(TT.RPAREN, this.currChar);
        this.advance();
        return token;
      }
      if ([';', '\n', '\r'].includes(this.currChar)) {
        const token = this.newLine();
        return token;
      }
      throw this.err(`Invalid character, got ${this.currChar}`);
    }
    return new Token(TT.EOF);
  }
}

export default Lexer;
