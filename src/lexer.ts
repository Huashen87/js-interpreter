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
      throw this.err('Invalid character');
    }
    return new Token(TT.EOF);
  }
}

export default Lexer;
