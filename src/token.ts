/**
 *TokenType
 */
export enum TT {
  NUM,
  ADD,
  SUB,
  MUL,
  DIV,
  EOF,
}

class Token {
  constructor(public readonly type: TT, public readonly value: string = '') {}
}

export default Token;
