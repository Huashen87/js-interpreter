import type Token from './token';

export abstract class ASTNode {
  constructor(public readonly token: Token) {}
}

export class Num extends ASTNode {
  constructor(token: Token, public readonly value: number) {
    super(token);
  }
}

export class BinOp extends ASTNode {
  constructor(
    token: Token,
    public readonly left: ASTNode,
    public readonly right: ASTNode
  ) {
    super(token);
  }
}

export class Unary extends ASTNode {
  constructor(token: Token, public readonly node: ASTNode) {
    super(token);
  }
}
