/**
 *TokenType
 */
export enum TT {
  NUM,
  ADD,
  SUB,
  MUL,
  DIV,
  LPAREN,
  RPAREN,
  LBRACKET,
  RBRACKET,
  VAR,
  LET,
  CONST,
  FUNCTION,
  RETURN,
  ID,
  ASSIGN,
  NEWLINE,
  COMMA,
  DOT,
  EOF,
}

class Token {
  constructor(public readonly type: TT, public readonly value: string = '') {}
}

export default Token;
