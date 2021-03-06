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
    this.reservedWord.set('true', TT.BOOL);
    this.reservedWord.set('false', TT.BOOL);
    this.reservedWord.set('undefined', TT.UNDEFINED);
    this.reservedWord.set('null', TT.NULL);
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
        if (hasDot) throw new SyntaxError('Unexpected number');
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

  private isNewLine(str: string): boolean {
    return str === '\n' || str === '\r';
  }

  private str(): string {
    const start = this.index;
    const quote = this.currChar;
    this.advance();
    while (this.currChar !== quote) {
      if (this.isNewLine(this.currChar))
        throw new SyntaxError('Unterminated string constant');
      this.advance();
    }
    return this.text.slice(start, this.index + 1);
  }

  private newLine() {
    while (this.isNewLine(this.currChar)) this.advance();
    return new Token(TT.NEWLINE);
  }

  private skipLineComment() {
    while (!this.isNewLine(this.currChar)) this.advance();
  }

  private skipBlockComment() {
    this.index += this.text.slice(this.index + 2).indexOf('*/') + 4;
    this.currChar = this.text[this.index];
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
        if (this.text[this.index + 1] === '/') {
          this.skipLineComment();
          continue;
        }
        if (this.text[this.index + 1] === '*') {
          this.skipBlockComment();
          continue;
        }
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
      if (this.currChar === '.') {
        const token = new Token(TT.DOT, this.currChar);
        this.advance();
        return token;
      }
      if (["'", '"'].includes(this.currChar)) {
        const token = new Token(TT.STR, this.str());
        this.advance();
        return token;
      }
      if (this.isNewLine(this.currChar)) {
        const token = this.newLine();
        return token;
      }
      if (this.currChar === ';') {
        const token = new Token(TT.SEMICOLON, this.currChar);
        this.advance();
        return token;
      }
      throw new SyntaxError('Invalid or unexpected token');
    }
    return new Token(TT.EOF);
  }
}

export default Lexer;
