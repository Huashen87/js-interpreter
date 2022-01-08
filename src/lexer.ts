import Token, { TT } from './token';

class Lexer {
  private index: number = 0;
  private currChar: string = this.text[0];
  private reservedWord: Map<string, TT> = new Map<string, TT>();

  constructor(private text: string) {
    this.reservedWord.set('var', TT.VAR);
    this.reservedWord.set('let', TT.LET);
    this.reservedWord.set('const', TT.CONST);
    this.reservedWord.set('function', TT.FUNCTION);
    this.reservedWord.set('return', TT.RETURN);
  }

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

  private isAlpha(str: string): boolean {
    return /[a-zA-Z]/.test(str);
  }

  private id(): string {
    const start = this.index;
    this.advance();
    while (
      this.isAlpha(this.currChar) ||
      this.isNum(this.currChar) ||
      this.currChar === '_'
    )
      this.advance();

    return this.text.slice(start, this.index);
  }

  private newLine() {
    while ([';', '\n', '\r'].includes(this.currChar)) this.advance();
    return new Token(TT.NEWLINE);
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
      if (this.isAlpha(this.currChar) || this.currChar === '_') {
        const id = this.id();
        const reservedWord = this.reservedWord.get(id);
        if (reservedWord !== undefined) return new Token(reservedWord, id);
        const token = new Token(TT.ID, id);
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
      if (this.currChar === '{') {
        const token = new Token(TT.LBRACKET, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '}') {
        const token = new Token(TT.RBRACKET, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === '=') {
        const token = new Token(TT.ASSIGN, this.currChar);
        this.advance();
        return token;
      }
      if (this.currChar === ',') {
        const token = new Token(TT.COMMA, this.currChar);
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
