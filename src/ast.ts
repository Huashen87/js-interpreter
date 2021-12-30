import type Token from './token';

export abstract class ASTNode {
  constructor() {}
}

export abstract class Expression extends ASTNode {
  constructor() {
    super();
  }
}

export class Program extends ASTNode {
  constructor(public readonly body: ASTNode[]) {
    super();
  }
}

type LiteralType = string | number | boolean;

export class Literal extends Expression {
  constructor(public readonly token: Token, public readonly value: LiteralType) {
    super();
  }
}

export class BinaryExpression extends Expression {
  constructor(
    public readonly token: Token,
    public readonly left: ASTNode,
    public readonly right: ASTNode
  ) {
    super();
  }
}

export class UnaryExpression extends Expression {
  constructor(public readonly token: Token, public readonly node: ASTNode) {
    super();
  }
}

export type Kind = 'var' | 'let' | 'const';

export class VariableDeclaration extends ASTNode {
  constructor(
    public readonly kind: Kind,
    public readonly declarations: VariableDeclarator[]
  ) {
    super();
  }
}

export class VariableDeclarator extends ASTNode {
  constructor(public readonly id: Identifier, public readonly init?: Expression) {
    super();
  }
}

export class Identifier extends Expression {
  constructor(public readonly token: Token) {
    super();
  }
}

export class AssignmentExpression extends Expression {
  constructor(
    public readonly token: Token,
    public readonly left: Identifier,
    public readonly right: Expression
  ) {
    super();
  }
}
