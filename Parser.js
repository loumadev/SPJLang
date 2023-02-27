//@ts-check

const {Utils} = require("./Utils.js");

const LOG = false;

/**
 * @typedef {Object} ASTNodeOptions
 * @prop {Token[]} tokens
 * @prop {any} [any]
 */

class ASTNode {
	/**
	 * Creates an instance of ASTNode.
	 * @param {ASTNodeOptions} options
	 * @memberof ASTNode
	 */
	constructor(options) {
		const {
			tokens = []
		} = options;

		/** @type {Token[]} */
		this.tokens = tokens;
	}
}

class Expression extends ASTNode {
	/**
	 * Creates an instance of Expression.
	 * @param {ASTNodeOptions} options
	 * @memberof Expression
	 */
	constructor(options) {
		const {
			any
		} = options || {};

		super(options);
	}
}

class Identifier extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of Identifier.
	 * @param {{name: string} & ASTNodeOptions} options
	 * @memberof Identifier
	 */
	constructor(options) {
		const {
			name = ""
		} = options;

		super(options);

		/** @type {string} */
		this.name = name;
	}

	toString() {
		return this.name;
	}
}

class UnaryExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of UnaryExpression.
	 * @param {{operator: string, argument: (Expression | Literal)} & ASTNodeOptions} options
	 * @memberof UnaryExpression
	 */
	constructor(options) {
		const {
			operator,
			argument
		} = options;

		super(options);

		/** @type {string} */
		this.operator = operator;

		/** @type {Expression | Literal} */
		this.argument = argument;
	}

	toString() {
		return `(${this.operator} ${this.argument})`;
	}
}

class BinaryExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of BinaryExpression.
	 * @param {{operator: string, left: (Expression | Literal), right: (Expression | Literal)} & ASTNodeOptions} options
	 * @memberof BinaryExpression
	 */
	constructor(options) {
		const {
			operator,
			left,
			right
		} = options;

		super(options);

		/** @type {string} */
		this.operator = operator;

		/** @type {Expression | Literal} */
		this.left = left;

		/** @type {Expression | Literal} */
		this.right = right;
	}

	toString() {
		return `(${this.left} ${this.operator} ${this.right})`;
	}
}

class AssignmentExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of AssignmentExpression.
	 * @param {{left: (Identifier | MemberExpression), right: (Expression | Literal)} & ASTNodeOptions} options
	 * @memberof AssignmentExpression
	 */
	constructor(options) {
		const {
			left,
			right
		} = options;

		super(options);

		/** @type {Identifier | MemberExpression} */
		this.left = left;

		/** @type {Expression | Literal} */
		this.right = right;
	}

	toString() {
		return `(${this.left} = ${this.right})`;
	}
}

class SequenceExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of SequenceExpression.
	 * @param {{expressions: Array<Expression | Literal>} & ASTNodeOptions} options
	 * @memberof SequenceExpression
	 */
	constructor(options) {
		const {
			expressions = []
		} = options;

		super(options);

		/** @type {Array<Expression | Literal>} */
		this.expressions = expressions;
	}

	toString() {
		return `(${this.expressions.join(", ")})`;
	}
}

class Literal extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of Literal.
	 * @param {{value: (string | undefined), type?: (number | undefined)} & ASTNodeOptions} options
	 * @memberof Literal
	 */
	constructor(options) {
		const {
			value = undefined,
			type = TOKEN_TYPE.IDENTIFIER
		} = options;

		super(options);

		/** @type {number | string | boolean | undefined} */
		this.value = Literal.parseValue(value, type);

		/** @type {number} */
		this.type = type;

		/** @type {string | undefined} */
		this.raw = value;
	}

	toString() {
		return Utils.asString(this.value);
	}

	/**
	 * @static
	 * @param {any} value
	 * @param {number} [type=TOKEN_TYPE.IDENTIFIER]
	 * @return {any} 
	 * @memberof Literal
	 */
	static parseValue(value, type = TOKEN_TYPE.IDENTIFIER) {
		if(type === TOKEN_TYPE.STRING) return String(value);
		if(type === TOKEN_TYPE.NUMBER) {
			if(isNaN(value)) return undefined;
			else return Number(value);
		}

		//Try to resolve without the specified type
		if(value === undefined) return undefined;
		if(typeof value === "string") return String(value);
		if(!isNaN(value)) return Number(value);
		return "<not resolved>";
	}
}

class Statement extends ASTNode {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of Statement.
	 * @param {{} & ASTNodeOptions} options
	 * @memberof Statement
	 */
	constructor(options) {
		const {
			any
		} = options || {};

		super(options);
	}
}

class VariableDeclaration extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of VariableDeclaration.
	 * @param {{declarations: VariableDeclarator[]} & ASTNodeOptions} options
	 * @memberof VariableDeclaration
	 */
	constructor(options) {
		const {
			declarations = []
		} = options;

		super(options);

		/** @type {VariableDeclarator[]} */
		this.declarations = declarations;
	}

	toString() {
		return `let ${this.declarations.map(e => e.toString()).join(", ")};`;
	}
}

class EmptyStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of EmptyStatement.
	 * @param {{} & ASTNodeOptions} options
	 * @memberof EmptyStatement
	 */
	constructor(options) {
		super(options);
	}

	toString() {
		return `;`;
	}
}

class ExpressionStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ExpressionStatement.
	 * @param {{expression: Expression} & ASTNodeOptions} options
	 * @memberof ExpressionStatement
	 */
	constructor(options) {
		const {
			expression
		} = options;

		super(options);

		/** @type {Expression} */
		this.expression = expression;
	}

	toString() {
		return `${this.expression.toString()};`;
	}
}

class ReturnStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ReturnStatement.
	 * @param {{argument: Expression} & ASTNodeOptions} options
	 * @memberof ReturnStatement
	 */
	constructor(options) {
		const {
			argument
		} = options;

		super(options);

		/** @type {Expression} */
		this.argument = argument;
	}

	toString() {
		return `return ${this.argument.toString()};`;
	}
}

class VariableDeclarator extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of VariableDeclarator.
	 * @param {{id: Identifier, init: (Expression | Literal)} & ASTNodeOptions} options
	 * @memberof VariableDeclarator
	 */
	constructor(options) {
		const {
			id,
			init
		} = options;

		super(options);

		/** @type {Identifier} */
		this.id = id;

		/** @type {Expression | Literal} */
		this.init = init;
	}

	toString() {
		return `${this.id.name} = ${this.init.toString()}`;
	}
}

class BlockStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of BlockStatement.
	 * @param {{body?: ASTNode[]} & ASTNodeOptions} options
	 * @memberof BlockStatement
	 */
	constructor(options) {
		const {
			body = []
		} = options;

		super(options);

		/** @type {ASTNode[]} */
		this.body = body;
	}

	toString() {
		return `{\n${this.body.map(node => "  " + node.toString().split("\n").join("\n  ")).join("\n")}\n}`;
	}
}

class FunctionExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of FunctionExpression.
	 * @param {{identifier?: (Identifier | null), params?: Array<(Identifier | AssignmentPattern)>, body?: BlockStatement} & ASTNodeOptions} options
	 * @memberof FunctionExpression
	 */
	constructor(options) {
		const {
			identifier = null,
			params = [],
			body = new BlockStatement({})
		} = options;

		super(options);

		/** @type {Identifier | null} */
		this.identifier = identifier;

		/** @type {(Identifier | AssignmentPattern)[]} */
		this.params = params;

		/** @type {BlockStatement} */
		this.body = body;
	}

	toString() {
		return `function${this.identifier ? ` ${this.identifier.name}` : ""}(${this.params.map(e => e.toString()).join(", ")}) ${this.body.toString()}`;
	}
}

class CallExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of CallExpression.
	 * @param {{callee: Expression, args: Array<Expression | Literal>} & ASTNodeOptions} options
	 * @memberof CallExpression
	 */
	constructor(options) {
		const {
			callee,
			args = []
		} = options;

		super(options);

		/** @type {Expression} */
		this.callee = callee;

		/** @type {Array<Expression | Literal>} */
		this.args = args;
	}

	toString() {
		return `(${this.callee.toString()})(${this.args.map(e => e.toString()).join(", ")})`;
	}
}

class Property {
	/**
	 * Creates an instance of Property.
	 * @param {{key: Identifier, value: (Expression | Literal)}} options
	 * @memberof Property
	 */
	constructor(options) {
		const {
			key,
			value
		} = options;

		/** @type {Identifier} */
		this.key = key;

		/** @type {Expression | Literal} */
		this.value = value;
	}

	toString() {
		return `"${this.key.toString()}": ${this.value}`;
	}
}

class ClassExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ClassExpression.
	 * @param {{identifier?: (Identifier | null), parent?: (Expression | null), properties?: Property[]} & ASTNodeOptions} options
	 * @memberof ClassExpression
	 */
	constructor(options) {
		const {
			identifier = null,
			parent = null,
			properties = []
		} = options;

		super(options);

		/** @type {Identifier | null} */
		this.identifier = identifier;

		/** @type {Expression | null} */
		this.parent = parent;

		/** @type {Property[]} */
		this.properties = properties;
	}

	toString() {
		return `class ${this.identifier ? this.identifier.name : "<anonymous>"}${this.parent ? ` extends (${this.parent.toString()})` : ""} {\n${this.properties.map(e => "  " + e.toString().split("\n").join("\n  ")).join("\n")}\n}`;
	}
}

class MemberExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of MemberExpression.
	 * @param {{object: Expression, property: Expression} & ASTNodeOptions} options
	 * @memberof MemberExpression
	 */
	constructor(options) {
		const {
			object,
			property
		} = options;

		super(options);

		/** @type {Expression} */
		this.object = object;

		/** @type {Expression} */
		this.property = property;
	}

	toString() {
		return `${this.object.toString()}[${this.property.toString()}]`;
	}
}

class NewExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of NewExpression.
	 * @param {{callee: Expression, args: Expression[]} & ASTNodeOptions} options
	 * @memberof NewExpression
	 */
	constructor(options) {
		const {
			callee,
			args = []
		} = options;

		super(options);

		/** @type {Expression} */
		this.callee = callee;

		/** @type {Expression[]} */
		this.arguments = args;
	}

	toString() {
		return `new (${this.callee.toString()})(${this.arguments.map(e => e.toString()).join(", ")})`;
	}
}

class ThisExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ThisExpression.
	 * @param {{} & ASTNodeOptions} options
	 * @memberof ThisExpression
	 */
	constructor(options) {
		super(options);
	}

	toString() {
		return "this";
	}
}

class ArgumentsExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ArgumentsExpression.
	 * @param {{} & ASTNodeOptions} options
	 * @memberof ArgumentsExpression
	 */
	constructor(options) {
		super(options);
	}

	toString() {
		return "arguments";
	}
}

class AssignmentPattern extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of AssignmentPattern.
	 * @param {{left: Identifier, right: Expression} & ASTNodeOptions} options
	 * @memberof AssignmentPattern
	 */
	constructor(options) {
		const {
			left,
			right
		} = options;

		super(options);

		/** @type {Identifier} */
		this.left = left;

		/** @type {Expression} */
		this.right = right;
	}

	toString() {
		return `${this.left.toString()} = ${this.right.toString()}`;
	}
}

class IfStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of IfStatement.
	 * @param {{test: Expression, consequent: Statement, alternate?: (Statement | null)} & ASTNodeOptions} options
	 * @memberof IfStatement
	 */
	constructor(options) {
		const {
			test,
			consequent,
			alternate = null
		} = options;

		super(options);

		/** @type {Expression} */
		this.test = test;

		/** @type {Statement} */
		this.consequent = consequent;

		/** @type {Statement | null} */
		this.alternate = alternate;
	}

	toString() {
		return `if(${this.test.toString()}) ${this.consequent.toString()}${this.alternate ? ` else ${this.alternate.toString()}` : ""}`;
	}
}

class WhileStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of WhileStatement.
	 * @param {{test: Expression, body: Statement} & ASTNodeOptions} options
	 * @memberof WhileStatement
	 */
	constructor(options) {
		const {
			test,
			body
		} = options;

		super(options);

		/** @type {Expression} */
		this.test = test;

		/** @type {Statement} */
		this.body = body;
	}

	toString() {
		return `while(${this.test.toString()}) ${this.body.toString()}`;
	}
}

class ForInStatement extends Statement {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ForInStatement.
	 * @param {{left: Identifier[], right: Expression, body: Statement} & ASTNodeOptions} options
	 * @memberof ForInStatement
	 */
	constructor(options) {
		const {
			left,
			right,
			body
		} = options;

		super(options);

		/** @type {Identifier[]} */
		this.left = left;

		/** @type {Expression} */
		this.right = right;

		/** @type {Statement} */
		this.body = body;
	}

	toString() {
		return `for(let [${this.left.map(e => e.toString()).join(", ")}] in ${this.right.toString()}) ${this.body.toString()}`;
	}
}

class ImportExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ImportExpression.
	 * @param {{module: Expression} & ASTNodeOptions} options
	 * @memberof ImportExpression
	 */
	constructor(options) {
		const {
			module
		} = options;

		super(options);

		/** @type {Expression} */
		this.module = module;
	}

	toString() {
		return `import (${this.module.toString()})`;
	}
}

class ExportExpression extends Expression {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of ExportExpression.
	 * @param {{export: Expression, name: Expression} & ASTNodeOptions} options
	 * @memberof ExportExpression
	 */
	constructor(options) {
		const {
			export: _export,
			name
		} = options;

		super(options);

		/** @type {Expression} */
		this.export = _export;

		/** @type {Expression} */
		this.name = name;
	}

	toString() {
		return `export (${this.export.toString()}) as (${this.name.toString()})`;
	}
}

class Parser {
	constructor(options = {}) {
		const {tokens} = options;

		/** @type {Token[]} */
		this.tokens = tokens;

		/** @type {number} */
		this.index = -1;
	}

	/**
	 * @return {boolean} 
	 * @memberof Parser
	 */
	isAtEnd() {
		return this.index >= this.tokens.length || this.peek().type === TOKEN_TYPE.EOF;
	}

	/**
	 * @param {number} [offset=1]
	 * @return {Token} 
	 * @memberof Parser
	 */
	peek(offset = 1) {
		return this.tokens[this.index + offset];
	}

	/**
	 * @return {Token} 
	 * @memberof Parser
	 */
	advance() {
		return this.tokens[++this.index];
	}

	/**
	 * @param {number} from
	 * @return {Token[]} 
	 * @memberof Parser
	 */
	getTokenSequence(from) {
		return this.tokens.slice(from + 1, this.index + 1);
	}

	/**
	 * @return {SuccessParseResult<Statement> | FailureResult} 
	 * @memberof Parser
	 */
	statement() {
		/** @type {Statement | null} */
		let statement = null;

		if(this.peek().value === "Nech") {
			const _startPos = this.index;
			this.advance();

			const identifierResult = this.identifier();
			if(identifierResult instanceof FailureResult) return identifierResult;

			if(this.peek().value !== "je") return new FailureResult({
				error: new Error(`Expected "je", but got '${this.peek().value}'`),
				tokens: [this.peek()]
			});
			this.advance();

			const expressionResult = this.nthExpression();
			if(expressionResult instanceof FailureResult) return expressionResult;

			statement = new VariableDeclaration({
				declarations: [
					new VariableDeclarator({
						id: identifierResult.node,
						init: expressionResult.node,
						tokens: this.tokens.slice(_startPos + 1, this.index)
					})
				],
				tokens: this.getTokenSequence(_startPos)
			});
		} else if(this.peek().value === "Vráť") {
			const _startPos = this.index;
			this.advance();

			let argument = null;

			//Empty return statement
			if(this.peek().type === TOKEN_TYPE.PERIOD) {
				argument = new Literal({
					value: undefined,
					tokens: [this.peek()]
				});
			} else {
				//Look for an expression
				const expressionResult = this.nthExpression();
				if(expressionResult instanceof FailureResult) {
					return expressionResult;
					// if(this.peek().type === TOKEN_TYPE.PERIOD) {
					// 	argument = new Literal({
					// 		value: undefined
					// 	});
					// } else {
					// 	return expressionResult.comapre(new FailureResult({
					// 		error: new Error(`Expected expression or ".", but got "${this.peek().value}"`),
					// 		tokens: [this.peek()]
					// 	}));
					// }
				} else {
					argument = expressionResult.node;
				}
			}

			statement = new ReturnStatement({
				argument: argument,
				tokens: this.getTokenSequence(_startPos)
			});
		} else if(this.peek().value === "Pokiaľ") {
			const whileResult = this.while_statement();
			if(whileResult instanceof FailureResult) return whileResult;

			statement = whileResult.node;
		} else if(this.peek().value === "Pre") {
			const forResult = this.for_in_statement();
			if(forResult instanceof FailureResult) return forResult;

			statement = forResult.node;
		} else if(this.peek().type === TOKEN_TYPE.PERIOD) {
			statement = new EmptyStatement({
				tokens: [this.peek()]
			});
			// this.advance();
		} else {
			const _startPos = this.index;
			const expressionResult = this.expression2();
			if(expressionResult instanceof FailureResult) return expressionResult;

			statement = new ExpressionStatement({
				expression: expressionResult.node,
				tokens: this.getTokenSequence(_startPos)
			});
		}

		const isBlock = statement instanceof BlockStatement;

		// if(statement instanceof ExpressionStatement && !statement.expression) {
		// 	statement = new EmptyStatement();
		// }
		// LOG && console.log({isBlock, peek: this.peek(), statement}, -123333);
		if(isBlock) {
			return new SuccessParseResult({
				node: statement
			});
		}

		if(this.peek().type === TOKEN_TYPE.PERIOD) {
			this.advance();
			return new SuccessParseResult({
				node: statement
			});
		} else {
			LOG && console.log({statement}, -2222);
			return new FailureResult({
				error: new Error(`Expected "." at the end of the expression in the statement, but got "${this.peek().value}"`),
				tokens: [this.peek()],
				markers: [new Token({
					type: TOKEN_TYPE.ERROR_MARKER,
					value: "^",
					index: this.peek().index,
					line: this.peek(0).line,
					column: this.peek(0).column + this.peek(0).raw.length
				})]
			});
		}
	}

	/**
	 * @return {SuccessParseResult<Statement> | FailureResult}
	 * @memberof Parser
	 */
	statement_without_period() {
		if(this.peek().value === "Ak") {
			LOG && console.log("doing if");
			const ifStatementResult = this.if_statement();
			return ifStatementResult;
			//if(ifStatementResult instanceof FailureResult) return ifStatementResult;

			//statement = ifStatementResult.node;
		} else if(this.peek().type === TOKEN_TYPE.L_PAREN) {
			const blockResult = this.block_statement();
			if(blockResult instanceof FailureResult) return blockResult;

			if(blockResult.data.is_expression || blockResult.data.is_statement) return new SuccessParseResult({
				node: blockResult.node.body[0]
			});

			return blockResult;
		} else {
			return this.statement();
		}
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * @return {SuccessParseResult<BlockStatement, {data?: {is_expression: boolean, is_statement: boolean}}> | FailureResult} 
	 * @memberof Parser
	 */
	block_statement() {
		let backtrackIndex = this.index;

		let data = {
			is_expression: false,
			is_statement: false
		};

		const expressionResult = this.nthExpression();
		const expressionPosition = this.index;

		const currentIndex = this.index;

		this.index = backtrackIndex;

		/** @type {SuccessParseResult<Statement> | FailureResult} */
		let statementResult = new FailureResult({
			error: new Error("Expected expression or statement"),
			tokens: [this.peek()]
		});
		let statementPosition = this.index;

		if(this.peek().type === TOKEN_TYPE.L_PAREN) {
			const currentIndex = this.index;
			// (statement_block) | (expression) => (Nech a je 1. Vráť a.) | (10 + 20)

			this.advance();

			const block = new BlockStatement({});

			while(!this.isAtEnd()) {
				statementResult = this.statement_without_period();
				statementPosition = this.index;
				if(statementResult instanceof FailureResult) {
					break;
					//return statementResult.comapre(expressionResult);
				}
				block.body.push(statementResult.node);

				if(this.peek().type === TOKEN_TYPE.R_PAREN) break;
			}

			if(statementResult instanceof SuccessParseResult) {
				this.advance();

				block.tokens = this.getTokenSequence(currentIndex);
				return new SuccessParseResult({
					node: block
				});
			}
		} else {
			// statement | expression => Vráť 1. | 10 + 20
			const currentIndex = this.index;

			statementResult = this.statement_without_period();
			statementPosition = this.index;

			if(statementResult instanceof SuccessParseResult) {
				data.is_statement = true;
				return new SuccessParseResult({
					node: new BlockStatement({
						body: [statementResult.node],
						tokens: this.getTokenSequence(currentIndex)
					}),
					data: data
				});
			}
		}

		if(expressionResult instanceof SuccessParseResult) {
			// if(statementPosition > expressionPosition) {
			// 	return statementResult;
			// }

			this.index = expressionPosition;
			data.is_expression = true;

			const tokens = this.getTokenSequence(currentIndex);

			return new SuccessParseResult({
				node: new BlockStatement({
					body: [
						new ExpressionStatement({
							expression: expressionResult.node,
							tokens: tokens
						})
					],
					tokens: tokens
				}),
				data: data
			});
		}

		LOG && console.log({expressionResult, statementResult});

		return expressionResult.comapre(statementResult);



		/*LOG && console.log("expression_or_statement, looking for statement");
		const statementResult = this.statement_without_period();
		LOG && console.log("expression_or_statement, statement resulted in", statementResult);

		let block = null;
		let data = {
			is_expression: false,
			is_statement: false
		};

		if(statementResult instanceof FailureResult) {
			const statementIndex = this.index;
			this.index = backtrackIndex;

			LOG && console.log("expression_or_statement, looking for expression");
			const expressionResult = this.expression();
			LOG && console.log("expression_or_statement, expression resulted in", statementResult);
			LOG && console.log("?????????????????", expressionResult, statementResult);
			//If the expression was successful, but the statement failed further in the program, return statement error
			if(statementIndex > this.index) return statementResult;
			if(expressionResult instanceof FailureResult) return expressionResult.comapre(statementResult);

			block = new BlockStatement({
				body: [new ExpressionStatement({
					expression: expressionResult.node
				})]
			});
			data.is_expression = true;
		} else {
			if(statementResult.node instanceof BlockStatement) block = statementResult.node;
			else {
				block = new BlockStatement({
					body: [statementResult.node]
				});
				data.is_statement = true;
			}
		}
		//TODO: do not return return statement

		return new SuccessParseResult({
			node: block,
			data: data
		});*/
	}

	if_statement() {
		const currentIndex = this.index;

		if(this.peek().value !== "Ak") return new FailureResult({
			error: new Error(`Expected "Ak", but got '${this.peek().value}'`),
			tokens: [this.peek()]
		});
		this.advance();

		const testResult = this.nthExpression();
		LOG && console.log("if_statement, testResult:", testResult);
		if(testResult instanceof FailureResult) return testResult;

		if(this.peek(1).type !== TOKEN_TYPE.COMMA || this.peek(2).value !== "tak") return new FailureResult({
			error: new Error(`Expected ", tak", but got "${this.peek(1).value} ${this.peek(2).value}"`),
			tokens: [this.peek(1), this.peek(2)]
		});
		this.advance();
		this.advance();

		LOG && console.log("if_statement, looking for consequent");
		const consequentResult = this.block_statement();
		LOG && console.log("if_statement, consequentResult:", consequentResult);
		if(consequentResult instanceof FailureResult) return consequentResult;

		let alternate = null;
		if(this.peek().type === TOKEN_TYPE.COMMA && this.peek(2).value === "inak") {
			this.advance();
			this.advance();

			//LOG && console.log("if_statement, looking for alternate");

			const alternateResult = this.block_statement();
			//LOG && console.log("if_statement, alternateResult:", alternateResult);
			if(alternateResult instanceof FailureResult) return alternateResult;

			alternate = alternateResult.node;

			if(alternateResult.data.is_statement) {
				alternate = alternate.body[0];
			}
		}

		return new SuccessParseResult({
			node: new IfStatement({
				test: testResult.node,
				consequent: consequentResult.node,
				alternate: alternate,
				tokens: this.getTokenSequence(currentIndex)
			})
		});
	}

	while_statement() {
		const currentIndex = this.index;

		if(this.peek().value !== "Pokiaľ") return new FailureResult({
			error: new Error(`Expected "Pokiaľ", but got "${this.peek().value}"`),
			tokens: [this.peek()]
		});
		this.advance();

		const testResult = this.nthExpression();
		if(testResult instanceof FailureResult) return testResult;

		if(this.peek(1).type !== TOKEN_TYPE.COMMA || this.peek(2).value !== "tak") return new FailureResult({
			error: new Error(`Expected ", tak", but got "${this.peek(1).value} ${this.peek(2).value}"`),
			tokens: [this.peek(1), this.peek(2)]
		});
		this.advance();
		this.advance();

		const bodyResult = this.block_statement();
		if(bodyResult instanceof FailureResult) return bodyResult;

		return new SuccessParseResult({
			node: new WhileStatement({
				test: testResult.node,
				body: bodyResult.node,
				tokens: this.getTokenSequence(currentIndex)
			})
		});
	}

	for_in_statement() {
		const currentIndex = this.index;

		if(this.peek(1).value !== "Pre" || this.peek(2).value !== "každé") return new FailureResult({
			error: new Error(`Expected "Pre každé", but got "${this.peek(1).value} ${this.peek(2).value}"`),
			tokens: [this.peek(1), this.peek(2)]
		});
		this.advance();
		this.advance();

		const identifiersResult = this.sequence(this.identifier);
		if(identifiersResult instanceof FailureResult) return identifiersResult;

		if(this.peek(1).value !== "v" || this.peek(2).value !== "objekte") return new FailureResult({
			error: new Error(`Expected "v objekte", but got "${this.peek(1).value} ${this.peek(2).value}"`),
			tokens: [this.peek(1), this.peek(1)]
		});
		this.advance();
		this.advance();

		const objectResult = this.nthExpression();
		if(objectResult instanceof FailureResult) return objectResult;

		const bodyResult = this.block_statement();
		if(bodyResult instanceof FailureResult) return bodyResult;

		return new SuccessParseResult({
			node: new ForInStatement({
				left: identifiersResult,
				right: objectResult.node,
				body: bodyResult.node,
				tokens: this.getTokenSequence(currentIndex)
			})
		});
	}

	/**
	 * @return {SuccessParseResult<Expression> | FailureResult} 
	 * @memberof Parser
	 */
	expression() {
		const currentIndex = this.index;

		LOG && console.log("doing expression", this.index, this.peek(0), this.peek());

		if(this.peek().value === "ku") {
			this.advance();

			//Get left expression
			const leftResult = this.nthExpression();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "pripočítaj") return new FailureResult({
				error: new Error(`Expected operator "pripočítaj", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "+",
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});

			//this.index = currentIndex;
		}

		if(this.peek().value === "od") {
			this.advance();

			//Get left expression
			const leftResult = this.nthExpression();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "odpočítaj") return new FailureResult({
				error: new Error(`Expected operator "odpočítaj", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "-",
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "vynásob") {
			this.advance();

			//Get left expression
			const leftResult = this.nthExpression();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "s") return new FailureResult({
				error: new Error(`Expected operator "s", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "*",
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "vydeľ") {
			this.advance();

			//Get left expression
			const leftResult = this.nthExpression();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "s") return new FailureResult({
				error: new Error(`Expected operator "s", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "/",
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "nie") {
			if(this.peek(2).value === "je") {
				this.advance();
				this.advance();

				if(
					this.peek(1).value !== "pravda" ||
					this.peek(2).value !== "," ||
					this.peek(3).value !== "že"
				) return new FailureResult({
					error: new Error(`Expected "pravda, že", but got "${this.peek(1).value} ${this.peek(2).value} ${this.peek(3).value}"`),
					tokens: [this.peek(1), this.peek(2), this.peek(3)]
				});

				this.advance();
				this.advance();
				this.advance();

				const expressionResult = this.expression();
				if(expressionResult instanceof FailureResult) return expressionResult;

				return new SuccessParseResult({
					node: new UnaryExpression({
						operator: "!",
						argument: expressionResult.node,
						tokens: this.getTokenSequence(currentIndex)
					})
				});
			}
		}

		if(this.peek().value === "nastav") {
			this.advance();

			//Get left expression
			LOG && console.log("!!!!!!!! set", this.peek());
			const leftResult = this.accessor();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "na") return new FailureResult({
				error: new Error(`Expected operator "na", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			LOG && console.log("!!!!!!!!!!! right side", rightResult);
			LOG && console.trace();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new AssignmentExpression({
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "umocni") {
			this.advance();

			//Get left expression
			const leftResult = this.nthExpression();
			if(leftResult instanceof FailureResult) return leftResult;

			//Get the operator
			const operator = this.advance().value;
			if(operator !== "na") return new FailureResult({
				error: new Error(`Expected operator "na", but got "${operator}"`),
				tokens: [this.peek(0)]
			});

			//Get right expression
			const rightResult = this.nthExpression();
			if(rightResult instanceof FailureResult) return rightResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "**",
					left: leftResult.node,
					right: rightResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "funkcia") {
			this.advance();
			LOG && console.log("doing function");

			let backtrackIndex = this.index;

			const functionExpr = new FunctionExpression({});

			LOG && console.log("function, looking for an identifier");
			const identifierResult = this.identifier();
			LOG && console.log("function, identifier resulted in", identifierResult);
			if(identifierResult instanceof FailureResult) {
				LOG && console.log("function, identifier failed, backing up");
				this.index = backtrackIndex;
			} else if(this.peek().type === TOKEN_TYPE.COLON) {
				LOG && console.log("function, identifier succeeded, setting name");
				this.advance();
				functionExpr.identifier = identifierResult.node;
			} else {
				LOG && console.log("function, identifier succeeded, but no colon, backing up");
				this.index = backtrackIndex;
			}

			backtrackIndex = this.index;

			LOG && console.log("function identifier", identifierResult);


			const statementResult = this.block_statement();
			if(statementResult instanceof FailureResult) return statementResult;

			functionExpr.body = statementResult.node;

			//In case of single expression being passed as a function body, add it to the return statement
			if(statementResult.data.is_expression) {
				functionExpr.body.body[0] = new ReturnStatement({
					argument: /**@type {ExpressionStatement}*/(functionExpr.body.body[0]).expression,
					tokens: functionExpr.body.body[0].tokens
				});
			}

			LOG && console.log("function body", functionExpr.body);

			LOG && console.log("function, looking for params");
			//throw new Error("Not implemented yet");
			if(
				this.peek().type === TOKEN_TYPE.COMMA &&
				this.peek(2).value === "definovaná" && this.peek(3).value === "pre"
			) {
				this.advance();
				this.advance();
				this.advance();

				LOG && console.log("function, params found");


				const list = this.parameter_list();
				if(list instanceof FailureResult) return list;

				functionExpr.params = list;

				LOG && console.log("function params", functionExpr.params);
			}

			LOG && console.log("function, returning", functionExpr);

			return new SuccessParseResult({
				node: functionExpr
			});
		}

		if(this.peek().value === "funkčná") {
			this.advance();

			LOG && console.log("got function call");

			if(this.peek(1).value !== "hodnota" || this.peek(2).value !== "funkcie")
				return new FailureResult({
					error: new Error(`Expected "hodnota funkcie", but got "${this.peek(1).value} ${this.peek(2).value}"`),
					tokens: [this.peek(1), this.peek(2)]
				});

			this.advance();
			this.advance();

			const functionResult = this.expression();
			if(functionResult instanceof FailureResult) return functionResult;

			let args = [];
			if(this.peek(1).type === TOKEN_TYPE.COMMA && this.peek(2).value === "pre") {
				this.advance();
				this.advance();

				const sequenceResult = this.sequence(this.expression);
				if(sequenceResult instanceof FailureResult) return sequenceResult;

				args = sequenceResult;
			}

			return new SuccessParseResult({
				node: new CallExpression({
					callee: functionResult.node,
					args: args,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "trieda") {
			const _startPos = this.index;
			this.advance();

			const _class = new ClassExpression({});

			const isNonBlank = this.peek(2).value === "rozširujúca" ||
				this.peek(2).value === "obsahujúca";

			const isKeywordName = this.peek(1).value === "rozširujúca" ||
				this.peek(1).value === "obsahujúca";

			if(this.peek().type === TOKEN_TYPE.IDENTIFIER) {
				if(isNonBlank || !isKeywordName) {
					const identifierResult = this.identifier();
					if(identifierResult instanceof FailureResult) return identifierResult;

					_class.identifier = identifierResult.node;
				}
			}

			// const hasIdentifier = this.peek(2).value === "rozširujúca" ||
			// 	this.peek(2).value === "obsahujúca" || this.peek(1).type === TOKEN_TYPE.IDENTIFIER;

			// if(hasIdentifier) {
			// 	const identifierResult = this.identifier();
			// 	if(identifierResult instanceof FailureResult) return identifierResult;

			// 	_class.identifier = identifierResult.node;
			// }

			//const isIdentifierKeyword = hasIdentifier && identifierResult.node.name === "obsahujúca";
			//if(hasIdentifier) _class.identifier = identifierResult.node;

			if(this.peek().value === "rozširujúca") {
				this.advance();

				if(this.peek().value !== "triedu") return new FailureResult({
					error: new Error(`Expected "triedu", but got "${this.peek().value}"`),
					tokens: [this.peek()]
				});
				this.advance();

				const parentResult = this.nthExpression();
				LOG && console.log("class, extending, parent expression resulted in", parentResult);
				if(parentResult instanceof FailureResult) return parentResult;

				_class.parent = parentResult.node;

				if(this.peek(1).value === "obsahujúca" || this.peek(1).type !== TOKEN_TYPE.COMMA && this.peek(2).value === "obsahujúca") return new FailureResult({
					error: new Error(`Expected ",", but got "${this.peek().value}"`),
					tokens: [this.peek()]
				});

				if(this.peek(1).type === TOKEN_TYPE.COMMA && this.peek(2).value === "obsahujúca") this.advance();
			}

			if(this.peek().value === "obsahujúca") {
				this.advance();

				const members = this.parameter_list();
				LOG && console.log({members});
				if(members instanceof FailureResult) return members;

				_class.properties = /**@type {AssignmentPattern[]}*/(members).map(member => new Property({
					key: member instanceof Identifier ? member : member.left,
					value: member instanceof Identifier ? new Literal({
						value: undefined,
						tokens: member.tokens
					}) : member.right
				}));

				LOG && console.trace();
			}

			_class.tokens = this.getTokenSequence(_startPos);
			return new SuccessParseResult({
				node: _class
			});
		}

		if(this.peek().value === "nová") {
			const _startPos = this.index;
			this.advance();

			if(this.peek().value !== "inštancia" || this.peek(2).value !== "triedy")
				return new FailureResult({
					error: new Error(`Expected "inštancia triedy", but got "${this.peek().value} ${this.peek(2).value}"`),
					tokens: [this.peek(1), this.peek(2)]
				});

			this.advance();
			this.advance();

			const classResult = this.expression();
			if(classResult instanceof FailureResult) return classResult;

			//TODO: arguments

			let args = [];
			if(this.peek(1).type === TOKEN_TYPE.COMMA && this.peek(2).value === "pre") {
				this.advance();
				this.advance();

				const sequenceResult = this.sequence(this.expression);
				if(sequenceResult instanceof FailureResult) return sequenceResult;

				args = sequenceResult;
			}

			return new SuccessParseResult({
				node: new NewExpression({
					callee: classResult.node,
					args: args,
					tokens: this.getTokenSequence(_startPos)
				})
			});
		}

		if(this.peek().value === "typ") {
			this.advance();

			const argumentResult = this.nthExpression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new UnaryExpression({
					operator: "typeof",
					argument: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});

			//this.index = currentIndex;
		}

		if(this.peek().value === "nedefinovaná") {
			this.advance();

			if(this.peek().value !== "hodnota") return new FailureResult({
				error: new Error(`Expected "hodnota", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			return new SuccessParseResult({
				node: new Literal({
					value: undefined,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "tento") {
			this.advance();

			if(this.peek().value !== "objekt") return new FailureResult({
				error: new Error(`Expected "objekt", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			return new SuccessParseResult({
				node: new ThisExpression({
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "argumenty") {
			this.advance();

			if(this.peek().value !== "funkcie") return new FailureResult({
				error: new Error(`Expected "funkcie", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			return new SuccessParseResult({
				node: new ArgumentsExpression({
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "importuj") {
			this.advance();

			if(this.peek().value !== "modul") return new FailureResult({
				error: new Error(`Expected "modul", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			const moduleResult = this.expression();
			if(moduleResult instanceof FailureResult) return moduleResult;

			return new SuccessParseResult({
				node: new ImportExpression({
					module: moduleResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "exportuj") {
			this.advance();

			const exportResult = this.expression();
			if(exportResult instanceof FailureResult) return exportResult;

			if(this.peek().value !== "ako") return new FailureResult({
				error: new Error(`Expected "ako", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});
			this.advance();

			const nameResult = this.expression();
			if(nameResult instanceof FailureResult) return nameResult;

			return new SuccessParseResult({
				node: new ExportExpression({
					export: exportResult.node,
					name: nameResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}


		//Internal mappings
		if(this.peek().value === "Vypíš") {
			LOG && console.log("internal mapping: Vypíš -> LOG && console.log");
			this.advance();

			const expressionResult = this.nthExpression();
			if(expressionResult instanceof FailureResult) return expressionResult;

			return new SuccessParseResult({
				node: new CallExpression({
					callee: new Identifier({
						name: "internals:print_stdout",
						tokens: []
					}),
					args: [expressionResult.node],
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().value === "spoj") {
			LOG && console.log("internal mapping: spoj -> concat");
			this.advance();

			const sequenceResult = this.sequence(this.expression);
			if(sequenceResult instanceof FailureResult) return sequenceResult;

			return new SuccessParseResult({
				node: new CallExpression({
					callee: new Identifier({
						name: "internals:string_concat",
						tokens: []
					}),
					args: sequenceResult,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}


		//idk what, control maybe
		if(this.peek().type === TOKEN_TYPE.PLUS) {
			this.advance();

			const argumentResult = this.nthExpression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new UnaryExpression({
					operator: "+",
					argument: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().type === TOKEN_TYPE.MINUS) {
			this.advance();

			const argumentResult = this.nthExpression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new UnaryExpression({
					operator: "-",
					argument: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		}

		if(this.peek().type === TOKEN_TYPE.NUMBER) {
			const number = this.advance();

			return new SuccessParseResult({
				node: new Literal({
					value: number.value,
					type: TOKEN_TYPE.NUMBER,
					tokens: [number]
				})
			});
		}

		if(this.peek().type === TOKEN_TYPE.STRING) {
			const string = this.advance();

			return new SuccessParseResult({
				node: new Literal({
					value: string.value,
					type: TOKEN_TYPE.STRING,
					tokens: [string]
				})
			});
		}

		if(this.peek().type === TOKEN_TYPE.IDENTIFIER) {
			return this.accessor();
		}

		if(this.peek().type === TOKEN_TYPE.L_PAREN) {
			this.advance();

			LOG && console.log("expression got '(' looking for another expression");
			const expressionResult = this.expression2();
			if(expressionResult instanceof FailureResult) return expressionResult;

			if(this.peek().type !== TOKEN_TYPE.R_PAREN) return new FailureResult({
				error: new Error(`Expected ")" at the end of the expression, but got "${this.peek().value}"`),
				tokens: [this.peek()],
				markers: [new Token({
					type: TOKEN_TYPE.ERROR_MARKER,
					value: "^",
					index: this.peek().index,
					line: this.peek(0).line,
					column: this.peek(0).column + this.peek(0).value.length
				})]
			});

			this.advance();

			return expressionResult;
		}

		return new FailureResult({
			error: new Error(`Expected expression, but got "${this.peek().value}"`),
			tokens: [this.peek()]
		});
	}

	/**
	 * @return {SuccessParseResult<Expression> | FailureResult} 
	 * @memberof Parser
	 */
	expression2() {
		const currentIndex = this.index;

		const expressions = this.sequence(this.nthExpression);
		LOG && console.log("got list of expressions", expressions);
		if(expressions instanceof FailureResult) return expressions;

		LOG && console.log("got some expressions", this.index, this.peek(0), this.peek(1));

		if(expressions.length === 1) return new SuccessParseResult({
			node: expressions[0]
		});

		return new SuccessParseResult({
			node: new SequenceExpression({
				expressions: expressions,
				tokens: this.getTokenSequence(currentIndex)
			})
		});
	}

	/**
	 * @return {SuccessParseResult<Expression> | FailureResult} 
	 * @memberof Parser
	 */
	nthExpression() {
		const currentIndex = this.index;

		const expressionResult = this.expression();
		if(expressionResult instanceof FailureResult) return expressionResult;

		if(
			this.peek(1).value === "-" && this.peek(2).type === TOKEN_TYPE.IDENTIFIER &&
			this.peek(3).value === "odmocnina" && this.peek(4).value === "z"
		) {

			//Find the literal number inside unary expression (e.g. '(-(2))')
			let literal = null;
			let queue = [expressionResult.node];
			while(queue.length > 0) {
				const current = queue.shift();

				if(current instanceof Literal) {
					literal = current;
					break;
				}

				if(current instanceof UnaryExpression) {
					queue.push(current.argument);
				}
			}

			if(literal instanceof Literal && typeof literal.value === "number") {
				const number = literal.value;
				const ordinal = this.peek(2).value;

				if(
					number === 1 && ordinal !== "vá" ||
					number === 2 && ordinal !== "há" ||
					number === 3 && ordinal !== "tia" ||
					number > 3 && ordinal !== "tá"
				)
					return new FailureResult({
						error: new Error(`Inccorrect ordinality "${ordinal}" of number ${number}`),
						tokens: [this.peek(2)]
					});
			}

			this.advance();
			this.advance();
			this.advance();
			this.advance();

			const argumentResult = this.expression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "//",
					left: expressionResult.node,
					right: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		} else if(this.peek(1).value === "sa") {
			if(this.peek(2).value !== "rovná") return new FailureResult({
				error: new Error(`Expected "rovná", but got "${this.peek(2).value}"`),
				tokens: [this.peek(2)]
			});

			this.advance();
			this.advance();

			const argumentResult = this.expression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: "===",
					left: expressionResult.node,
					right: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		} else if(this.peek().value === "je") {
			this.advance();

			const value = this.peek().value;
			const operator = (value === "viac" ? ">" : (value === "menej" ? "<" : null));

			if(!operator) return new FailureResult({
				error: new Error(`Expected "viac" or "menej", but got "${this.peek(2).value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			if(
				this.peek(1).value === "alebo" &&
				(this.peek(2).value !== "sa" || this.peek(3).value !== "rovná")
			) return new FailureResult({
				error: new Error(`Expected "sa rovná", but got "${this.peek(2).value} ${this.peek(3).value}"`),
				tokens: [this.peek(2)]
			});

			const hasEqual = this.peek(1).value === "alebo" &&
				this.peek(2).value === "sa" &&
				this.peek(3).value === "rovná";

			if(!hasEqual && this.peek(1).value !== "ako") return new FailureResult({
				error: new Error(`Expected "ako" or "alebo sa rovná", but got "${this.peek(1).value}"`),
				tokens: [this.peek(1)]
			});

			if(hasEqual) {
				this.advance();
				this.advance();
			}

			this.advance();

			const argumentResult = this.expression();
			if(argumentResult instanceof FailureResult) return argumentResult;

			return new SuccessParseResult({
				node: new BinaryExpression({
					operator: operator + (hasEqual ? "=" : ""),
					left: expressionResult.node,
					right: argumentResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});

		}

		return expressionResult;
	}

	/**
	 * @return {SuccessParseResult<Identifier> | FailureResult}
	 */
	identifier() {
		LOG && console.log("!!!!!!!!!!!!!", this.peek().type, TOKEN_TYPE.IDENTIFIER);
		if(this.peek().type !== TOKEN_TYPE.IDENTIFIER) return new FailureResult({
			error: new Error(`Expected identifier but got "${this.peek().value}"`),
			tokens: [this.peek()]
		});

		const identifier = this.advance();

		return new SuccessParseResult({
			node: new Identifier({
				name: identifier.value,
				tokens: [identifier]
			})
		});
	}

	/**
	 * @return {SuccessParseResult<MemberExpression | Identifier> | FailureResult} 
	 * @memberof Parser
	 */
	accessor() {
		const currentIndex = this.index;

		if(this.peek().value === "hodnota" && this.peek(2).value === "vlastnosti") {
			this.advance();
			this.advance();

			const propertyResult = this.expression();
			if(propertyResult instanceof FailureResult) return propertyResult;

			LOG && console.log("!!!!!!!!! acc", propertyResult);
			if(this.peek().value !== "objektu") return new FailureResult({
				error: new Error(`Expected keyword "objektu", but got "${this.peek().value}"`),
				tokens: [this.peek()]
			});

			this.advance();

			const objectResult = this.expression();
			if(objectResult instanceof FailureResult) return objectResult;

			return new SuccessParseResult({
				node: new MemberExpression({
					object: objectResult.node,
					property: propertyResult.node,
					tokens: this.getTokenSequence(currentIndex)
				})
			});
		} else {
			return this.identifier();
		}
	}

	parameter_list() {
		return this.sequence(this.parameter);
	}

	/**
	 * @return {SuccessParseResult<AssignmentPattern | Identifier> | FailureResult} 
	 * @memberof Parser
	 */
	parameter() {
		const currentIndex = this.index;

		const patternResult = this.assignment_pattern();
		LOG && console.log("9999999999999999999999999");
		LOG && console.log({pattern: patternResult, peek0: this.peek(0)});
		//If there is no error, we have a pattern. Otherwise look for an identifier.
		if(patternResult instanceof SuccessParseResult) return patternResult;
		//TODO: This might cause some problems in the future, but for now it's fine.
		//LOG && console.log(currentIndex, this.index, patternResult.token.index, this.index > currentIndex + 1);
		if(this.index > currentIndex + 1) return patternResult;
		// if(patternResult.token.index > currentIndex) return patternResult;

		this.index = currentIndex;
		return this.identifier();
	}

	/**
	 * @return {SuccessParseResult<AssignmentPattern> | FailureResult} 
	 * @memberof Parser
	 */
	assignment_pattern() {
		const currentIndex = this.index;

		const identifierResult = this.identifier();
		if(identifierResult instanceof FailureResult) return identifierResult;

		LOG && console.log("assignment_pattern, got identifier", identifierResult);

		if(this.peek().type !== TOKEN_TYPE.COMMA || this.peek(2).value !== "predvolene") return new FailureResult({
			error: new Error(`Expected keyword ", predvolene", but got "${this.peek().value} ${this.peek(2).value}"`),
			tokens: [this.peek()]
		});

		this.advance();
		this.advance();

		LOG && console.log("looking for an expression");
		const expressionResult = this.expression();
		LOG && console.log("got expression 111111111", expressionResult, this.index, this.peek(0), this.peek(1));
		if(expressionResult instanceof FailureResult) return expressionResult;

		return new SuccessParseResult({
			node: new AssignmentPattern({
				left: identifierResult.node,
				right: expressionResult.node,
				tokens: this.getTokenSequence(currentIndex)
			})
		});
	}

	/**
	 * @template {ASTNode} T
	 * @template {SuccessParseResult<T> | FailureResult} U
	 * @param {function(): SuccessParseResult<T> | FailureResult} memberLookupFunction
	 * @return {T[] | FailureResult} 
	 * @memberof Parser
	 */
	sequence(memberLookupFunction) {
		if(typeof memberLookupFunction !== "function") throw new Error("memberLookupFunction must be a function");

		/** @type {T[]} */
		const members = [];

		let isFirst = true;
		let isLast = false;
		let lastIndex = this.index;
		let lastResult = null;
		while(!this.isAtEnd()) {
			LOG && console.log("hhhh", lastIndex, this.peek());
			const memberResult = lastResult = /**@type {U}*/(memberLookupFunction.call(this));
			LOG && console.log("!!!!!!! got something idk", memberResult);
			if(memberResult instanceof FailureResult) {
				//Maybe you forgot a comma or "a"?
				return memberResult;
				LOG && console.log("!?!?!?!?!??!?!?!?!?!!?! got failure", memberResult);
				this.index = lastIndex;
				//return memberResult;
				//throw new Error(`Expected <member> but got "${this.peek().value}"`);
				break;
			}
			lastIndex = this.index;

			members.push(memberResult.node);

			if(isLast) break;

			if(this.peek().type === TOKEN_TYPE.COMMA) {
				this.advance();
			} else if(this.peek().value === "a") {
				this.advance();
				isLast = true;
			} else if(!isFirst) {
				return new FailureResult({
					error: new Error(`Expected "," or "a", but got "${this.peek().value}"`),
					tokens: [this.peek()]
				});
			} else {
				//There is no ',' or 'a' after the first member, so we're done.
				break;
			}

			isFirst = false;
		}

		if(members.length === 0)
			return lastResult instanceof FailureResult ? lastResult :
				new FailureResult({
					error: new Error(`Expected <member> but got "${this.peek().value}"`),
					tokens: [this.peek()]
				});

		LOG && console.log("!!!!!!!!! got members", members);

		return members;
	}

	/**
	 * @return {SuccessParseResult<Statement> | FailureResult} 
	 * @memberof Parser
	 */
	parse() {
		const ast = new BlockStatement({
			tokens: this.tokens
		});

		while(!this.isAtEnd()) {
			const statementResult = this.statement_without_period();
			if(statementResult instanceof FailureResult) return statementResult;

			ast.body.push(statementResult.node);
		}

		return new SuccessParseResult({
			node: ast
		});
	}
}

module.exports = {
	Parser,

	ASTNode,
	Expression,
	Statement,
	BlockStatement,
	ExpressionStatement,
	VariableDeclaration,
	VariableDeclarator,
	Literal,
	Identifier,
	BinaryExpression,
	UnaryExpression,
	MemberExpression,
	AssignmentPattern,
	AssignmentExpression,
	SequenceExpression,
	EmptyStatement,
	FunctionExpression,
	CallExpression,
	ReturnStatement,
	ClassExpression,
	IfStatement,
	WhileStatement,
	ForInStatement,
	NewExpression,
	ThisExpression,
	ArgumentsExpression,
	ImportExpression,
	ExportExpression,
	Property
};

const {SuccessParseResult, FailureResult} = require("./Result.js");
const {Token, TOKEN_TYPE} = require("./Tokenizer.js");