import type Token from './token';

export abstract class ASTNode {
  constructor() {}
}

export class Program extends ASTNode {
  constructor(public readonly body: ASTNode[]) {
    super();
  }
}

type LiteralType = string | number | boolean;

export class Literal extends ASTNode {
  constructor(public readonly token: Token, public readonly value: LiteralType) {
    super();
  }
}

export class BinaryExpression extends ASTNode {
  constructor(
    public readonly token: Token,
    public readonly left: ASTNode,
    public readonly right: ASTNode
  ) {
    super();
  }
}

export class UnaryExpression extends ASTNode {
  constructor(public readonly token: Token, public readonly node: ASTNode) {
    super();
  }
}
