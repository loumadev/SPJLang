
//@ts-check

const ModuleLoader = require("./ModuleLoader");
const {ASTNode, BinaryExpression, Literal, BlockStatement, ExpressionStatement, VariableDeclaration, Identifier, UnaryExpression, SequenceExpression, EmptyStatement, CallExpression, FunctionExpression, ClassExpression, AssignmentPattern, ReturnStatement, IfStatement, AssignmentExpression, WhileStatement, NewExpression, ThisExpression, MemberExpression, ForInStatement, ArgumentsExpression, ImportExpression, ExportExpression} = require("./Parser");
const {Utils} = require("./Utils");

class BlockScope {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of FunctionScope.
	 * @param {{parent?: (BlockScope | null), variables?: Map<string, Variable>}} [options]
	 * @memberof FunctionScope
	 */
	constructor(options = {}) {
		const {
			parent = null,
			variables = new Map()
		} = options;

		/** @type {BlockScope | null} */
		this.parent = parent;

		/** @type {Map<string, Variable>} */
		this.variables = variables;
	}
}

class Variable {
	constructor() {
		/** @type {number | string | boolean | undefined | null | Function | Map<any, Variable> | ClassExpression | FunctionExpression} */
		this.value = undefined;
	}

	toString() {
		return `<${this.value}>`;
	}
}

class LiteralValue extends Variable {
	/**
	 * Creates an instance of LiteralValue.
	 * @param {number | string | boolean | undefined | null} value
	 * @memberof LiteralValue
	 */
	constructor(value) {
		super();

		/**
		 * `null` value means invalid state.
		 * @type {number | string | boolean | undefined | null}
		 * */
		this.value = value;
	}

	toString() {
		if(this.value === undefined) return "nedefinovaná hodnota";
		else if(this.value === true) return "pravda";
		else if(this.value === false) return "nepravda";
		else if(typeof this.value === "string") return Utils.asString(this.value);
		else return this.value + "";
	}
}

class FunctionDefinition extends Variable {
	/**
	 * Creates an instance of FunctionDefinition.
	 * @param {FunctionExpression | null} value
	 * @param {(function(): (Variable | FailureResult)) | null} [native=null]
	 * @param {BlockScope | null} [scope=null]
	 * @memberof FunctionDefinition
	 */
	constructor(value, native = null, scope = null) {
		super();

		/** @type {FunctionExpression | null} */
		this.value = value;

		/** @type {(function(): (Variable | FailureResult)) | null} */
		this.native = native;

		/** @type {BlockScope | null} */
		this.scope = scope;

		/** @type {Variable | null} */
		this.returnValue = null;

		/** @type {ASTNode | null} */
		this.caller = null;
	}

	toString() {
		if(this.native) return "<natívna funkcia>";
		if(this.value) return this.value.toString();
		throw new Error("Invlaid state: FunctionDefinition.value and FunctionDefinition.native are both invalid.");
	}
}

class ClassDefinition extends Variable {
	/**
	 * Creates an instance of ClassDefinition.
	 * @param {ClassExpression} value
	 * @param {ClassDefinition | null} [parent=null]
	 * @memberof ClassDefinition
	 */
	constructor(value, parent = null) {
		super();

		/** @type {ClassExpression} */
		this.value = value;

		/** @type {ClassDefinition | null} */
		this.parent = parent;
	}

	toString() {
		return this.value.toString();
	}
}

class InstanceDefinition extends Variable {
	/**
	 * Creates an instance of InstanceDefinition.
	 * @param {Map<any, any>} [value]
	 * @param {ClassDefinition | null} [prototype=null]
	 * @memberof InstanceDefinition
	 */
	constructor(value = new Map(), prototype = null) {
		super();

		/** @type {Map<any, Variable>} */
		this.value = value;

		/** @type {ClassDefinition | null} */
		this.prototype = prototype;
	}

	toString() {
		if(!this.prototype) return "<null object>";
		if(!this.prototype.value.identifier) return "<anonymný objekt>";
		return `<objekt ${this.prototype.value.identifier.name}>`;
	}
}

const TAB_SIZE = 2;
const TAB = " ".repeat(TAB_SIZE);
const LOG = 0;
let g_arr = [];

class Runtime {
	constructor() {
		/** @type {BlockScope} */
		this._global = new BlockScope();

		/** @type {BlockScope} */
		this._local = this._global;

		/** @type {FunctionDefinition[]} */
		this._callStack = [];

		/** @type {Variable} */
		this.__thisValue = new LiteralValue(undefined);


		const that = this;

		/** @type {Map<string, Variable> | null} */
		this._exports = null;

		/** @type {Map<string, InstanceDefinition>} */
		this._modules = new Map();

		this._global.variables.set("pravda", new LiteralValue(true));
		this._global.variables.set("nepravda", new LiteralValue(false));

		this._global.variables.set("internals:this", new LiteralValue(undefined));
		this._global.variables.set("internals:print_stdout", new FunctionDefinition(null,
			function(/**@type {Variable}*/value) {
				try {
					const string = that.stringifyValue(value);
					console.log(string);
				} catch(err) {
					console.log("Chyba pri vypisovani hodnoty: " + err);
				}
				return value;
			})
		);
		this._global.variables.set("internals:string_concat", new FunctionDefinition(null,
			function(/**@type {Variable[]}*/...args) {
				const strings = args.map(arg => that.stringifyValue(arg));
				return new LiteralValue(strings.join(""));
			})
		);
	}

	/**
	 * @param {ASTNode} ast
	 * @return {Variable | FailureResult} 
	 * @memberof Runtime
	 */
	evaluate(ast) {
		if(ast instanceof Literal) {
			return new LiteralValue(ast.value);
		} else if(ast instanceof Identifier) {
			return this.resolveValue(ast.name, ast);
		} else if(ast instanceof UnaryExpression) {
			const result = this.evaluate(ast.argument);
			if(result instanceof FailureResult) return result;

			const value = result.value;

			if(ast.operator === "!") return new LiteralValue(!value);
			else if(ast.operator === "typeof") return new LiteralValue(this.resolveType(result));

			if(value === undefined || value === null) return new FailureResult({
				error: new Error(`Cannot apply unary operator "${ast.operator}" to value type of "${this.resolveType(result)}"`),
				tokens: ast.tokens
			});

			if(ast.operator === "-") return new LiteralValue(-value);
			else if(ast.operator === "+") return new LiteralValue(+value);
			else throw new Error("Unknown unary operator: " + ast.operator);
		} else if(ast instanceof BinaryExpression) {
			const leftResult = this.evaluate(ast.left);
			if(leftResult instanceof FailureResult) return leftResult;

			const rightResult = this.evaluate(ast.right);
			if(rightResult instanceof FailureResult) return rightResult;

			const left = leftResult.value;
			const right = rightResult.value;

			LOG && console.log("BinaryExpression", ast.left, left, ast.operator, ast.right, right);

			if(ast.operator === "===") return new LiteralValue(left === right);

			if(left === undefined || left === null || right === undefined || right === null) return new FailureResult({
				error: new Error(`Cannot apply binary operator "${ast.operator}" to value type of "${this.resolveType(leftResult)}" and "${this.resolveType(rightResult)}"`),
				tokens: ast.tokens
			});

			if(ast.operator === "<") return new LiteralValue(left < right);
			else if(ast.operator === ">") return new LiteralValue(left > right);
			else if(ast.operator === "<=") return new LiteralValue(left <= right);
			else if(ast.operator === ">=") return new LiteralValue(left >= right);

			if(typeof left !== "number" || typeof right !== "number") return new FailureResult({
				error: new Error(`Cannot apply binary operator "${ast.operator}" to value type of "${this.resolveType(leftResult)}" and "${this.resolveType(rightResult)}"`),
				tokens: ast.tokens,
				stack: this._callStack
			});

			if(ast.operator === "+") return new LiteralValue(left + right);
			else if(ast.operator === "-") return new LiteralValue(left - right);
			else if(ast.operator === "*") return new LiteralValue(left * right);
			else if(ast.operator === "/") return new LiteralValue(left / right);
			else if(ast.operator === "**") return new LiteralValue(left ** right);
			else if(ast.operator === "//") return new LiteralValue(Math.pow(right, 1 / left));
			else throw new Error("Unknown binary operator: " + ast.operator);
		} else if(ast instanceof SequenceExpression) {
			const lastIndex = ast.expressions.length - 1;
			for(let i = 0; i < lastIndex; i++) {
				const result = this.evaluate(ast.expressions[i]);
				if(result instanceof FailureResult) return result;
			}

			return this.evaluate(ast.expressions[lastIndex]);
		} else if(ast instanceof FunctionExpression) {
			LOG && console.log("FunctionExpression, context:");
			//LOG && console.dir(this._local, {depth: null});
			const context = this._local;//.parent;
			//if(context.parent) context.parent.variables = new Map(context.parent.variables);
			//context.variables = new Map(context.variables);
			if(ast.params.length) LOG && console.log("defining", ast.params.toString(), context);
			if(ast.params.toString() === "y") {
				LOG && console.log("y, x:", this.resolveValue("x", ast));
			}

			//TODO: This might work only for closures with depth 1
			const scope = new BlockScope({
				parent: new BlockScope({
					parent: context.parent,
					variables: new Map(context.parent?.variables || [])
				}),
				variables: /*new Map(*/context.variables/*)*/
			});
			// const scope = context;
			return new FunctionDefinition(ast, null, new BlockScope({parent: scope}));
		} else if(ast instanceof AssignmentExpression) {
			const valueResult = this.evaluate(ast.right);
			if(valueResult instanceof FailureResult) return valueResult;

			LOG && console.log("AssignmentExpression", ast.left, valueResult);
			if(ast.left instanceof Identifier) {
				/** @type {BlockScope | null} */
				let scope = this._local;
				while(scope) {
					if(scope.variables.has(ast.left.name)) {
						scope.variables.set(ast.left.name, valueResult);
						return valueResult;
					}
					scope = scope.parent;
				}

				return new FailureResult({
					error: new Error(`Variable ${ast.left.name} is not defined`),
					tokens: ast.tokens,
					stack: this._callStack
				});
			} else if(ast.left instanceof MemberExpression) {
				const objectResult = this.evaluate(ast.left.object);
				if(objectResult instanceof FailureResult) return objectResult;

				const propertyResult = this.evaluate(ast.left.property);
				if(propertyResult instanceof FailureResult) return propertyResult;

				const object = objectResult/*.value*/;
				const property = propertyResult.value;

				if(!(object instanceof InstanceDefinition)) return new FailureResult({
					error: new Error("Cannot assign to non-instance object"),
					tokens: ast.right.tokens,
					stack: this._callStack
				});

				object.value.set(property, valueResult);
				return valueResult;
			}

			return new FailureResult({
				error: new Error("Cannot assign to non-variable"),
				// @ts-ignore
				tokens: ast.left.tokens,
				stack: this._callStack
			});

		} else if(ast instanceof ReturnStatement) {
			LOG && console.log("ReturnStatement", ast.argument);
			if(this._callStack.length === 0) return new FailureResult({
				error: new Error("Cannot return outside of function"),
				tokens: ast.tokens,
				stack: this._callStack
			});

			const returnResult = this.evaluate(ast.argument);
			if(returnResult instanceof FailureResult) return returnResult;

			return this._callStack[this._callStack.length - 1].returnValue = returnResult;
		} else if(ast instanceof IfStatement) {
			const testResult = this.evaluate(ast.test);
			if(testResult instanceof FailureResult) return testResult;

			LOG && console.log("evaludating if, ", testResult.value);
			if(testResult.value) {
				return this.evaluate(ast.consequent);
			} else if(ast.alternate) {
				return this.evaluate(ast.alternate);
			} else {
				return new LiteralValue(undefined);
			}
		} else if(ast instanceof WhileStatement) {
			while(true) {
				const testResult = this.evaluate(ast.test);
				if(testResult instanceof FailureResult) return testResult;
				if(!testResult.value) break;

				const result = this.evaluate(ast.body);
				if(result instanceof FailureResult) return result;
			}

			return new LiteralValue(undefined);
		} else if(ast instanceof ForInStatement) {
			const objectResult = this.evaluate(ast.right);
			if(objectResult instanceof FailureResult) return objectResult;

			if(!(objectResult instanceof InstanceDefinition)) {
				throw new Error("Cannot iterate over non-instance object");
			}

			const map = objectResult.value;
			const vars = ast.left;

			const iterator = map.get("iterátor");
			if(!iterator) {
				throw new Error("Cannot iterate over non-iterable object");
			}
			if(!(iterator instanceof FunctionDefinition)) {
				throw new Error("Object iterator is not a function");
			}

			const iteratorInstance = this.runInContext(iterator, iterator.scope, [], ast.right);
			if(!(iteratorInstance instanceof InstanceDefinition)) {
				throw new Error("Object iterator did not return an Iterator instance");
			}

			const next = iteratorInstance.value.get("ďalší");
			if(!next) {
				throw new Error("Iterator instance does not have a next method");
			}

			if(!(next instanceof FunctionDefinition)) {
				throw new Error("Iterator instance next method is not a function");
			}

			let current = null;

			while(current = this.runInContext(next, next.scope, [], null)) {
				if(current instanceof FailureResult) return current;
				if(current.value === undefined) break;

				if(!(current instanceof InstanceDefinition)) {
					throw new Error("Iterator instance next method did not return an instance");
				}

				for(let i = 0; i < vars.length; i++) {
					this._local.variables.set(vars[i].name, current.value.get(i) || new LiteralValue(undefined));
				}

				const result = this.evaluate(ast.body);
				if(result instanceof FailureResult) return result;
			}

			// for(const key of map.keys()) {
			// 	if(vars[0]) this._local.variables.set(vars[0].name, new LiteralValue(key));
			// 	if(vars[1]) this._local.variables.set(vars[1].name, new LiteralValue(map.get(key)));
			// 	this.evaluate(ast.body);
			// }
			return new LiteralValue(undefined);
		} else if(ast instanceof CallExpression) {
			const fnResult = this.evaluate(ast.callee);
			if(fnResult instanceof FailureResult) return fnResult;

			if(!(fnResult instanceof FunctionDefinition)) return new FailureResult({
				error: new Error("Cannot call non-function expression"),
				tokens: ast.callee.tokens,
				stack: this._callStack
			});

			const args = [];
			for(let i = 0; i < ast.args.length; i++) {
				const argResult = this.evaluate(ast.args[i]);
				if(argResult instanceof FailureResult) return argResult;
				args.push(argResult);
			}

			const context = fnResult.scope || new BlockScope({
				parent: this._local
			});

			//if(context.parent) context.parent.variables = new Map(context.parent.variables);
			//context.variables = new Map(context.variables);

			//g_arr.push(fnResult);
			//if(g_arr.length === 6) console.log(g_arr[2] === g_arr[4]);
			//console.log([...new Set(g_arr)].length);
			LOG && console.log("calling", "'" + ast.args[0].toString() + "'", "in", context);

			return this.runInContext(fnResult, context, args, ast);
		} else if(ast instanceof ExpressionStatement) {
			return this.evaluate(ast.expression);
		} else if(ast instanceof ImportExpression) {
			const sourceResult = this.evaluate(ast.module);
			if(sourceResult instanceof FailureResult) return sourceResult;

			const source = sourceResult.value;

			if(typeof source !== "string") return new FailureResult({
				error: new Error("Module name must be a string"),
				tokens: ast.module.tokens,
				stack: this._callStack
			});

			const cached = this._modules.get(source);
			if(cached) return cached;

			const moduleResult = ModuleLoader.loadModule(source, this);
			if(moduleResult instanceof FailureResult) return moduleResult;

			const variable = new InstanceDefinition(moduleResult, null);

			this._modules.set(source, variable);

			return variable;
		} else if(ast instanceof ExportExpression) {
			if(!this._exports) {
				return new FailureResult({
					error: new Error("Cannot export outside module"),
					tokens: ast.tokens,
					stack: this._callStack
				});
			}

			const valueResult = this.evaluate(ast.export);
			if(valueResult instanceof FailureResult) return valueResult;

			const nameResult = this.evaluate(ast.name);
			if(nameResult instanceof FailureResult) return nameResult;

			if(nameResult instanceof LiteralValue && typeof nameResult.value === "string") {
				this._exports.set(nameResult.value, valueResult);
			} else {
				return new FailureResult({
					error: new Error("Export name must be a string literal"),
					tokens: ast.name.tokens,
					stack: this._callStack
				});
			}

			return valueResult;
		} else if(ast instanceof ClassExpression) {
			const parentClass = ast.parent ? this.evaluate(ast.parent) : null;
			if(parentClass instanceof FailureResult) return parentClass;

			if(parentClass && !(parentClass instanceof ClassDefinition)) {
				return new FailureResult({
					error: new Error("Cannot extend a non-class expression"),
					tokens: ast.parent?.tokens || [],
					stack: this._callStack
				});
			}

			return new ClassDefinition(ast, parentClass);
		} else if(ast instanceof NewExpression) {
			const cls = this.evaluate(ast.callee);
			if(cls instanceof FailureResult) return cls;

			if(!(cls instanceof ClassDefinition)) {
				return new FailureResult({
					error: new Error("Cannot instantiate a non-class expression"),
					tokens: ast.callee.tokens,
					stack: this._callStack
				});
			}

			const args = [];
			for(const arg of ast.arguments) {
				const argResult = this.evaluate(arg);
				if(argResult instanceof FailureResult) return argResult;
				args.push(argResult);
			}

			return this.instantiateClass(cls, args, null, ast);
		} else if(ast instanceof ThisExpression) {
			const value = this.resolveValue("internals:this", ast);
			if(value instanceof FailureResult) return value;

			if(value.value === null) return new FailureResult({
				error: new Error("Must call superclass constructor before using \"this\""),
				tokens: ast.tokens,
				stack: this._callStack
			});

			return value;
		} else if(ast instanceof ArgumentsExpression) {
			return this.resolveValue("internals:arguments", ast);
		} else if(ast instanceof MemberExpression) {
			const objResult = this.evaluate(ast.object);
			if(objResult instanceof FailureResult) return objResult;

			const keyResult = this.evaluate(ast.property);
			if(keyResult instanceof FailureResult) return keyResult;

			if(typeof objResult.value === "string") {
				if(typeof keyResult.value !== "number") return new FailureResult({
					error: new Error("Cannot access string character with non-number index"),
					tokens: ast.property.tokens,
					stack: this._callStack
				});
				return new LiteralValue(objResult.value[keyResult.value]);
			}

			if(!(objResult instanceof InstanceDefinition)) {
				console.log(objResult, keyResult);
				return new FailureResult({
					error: new Error("Cannot access property of non-instance"),
					tokens: ast.object.tokens
				});
			}

			return objResult.value.get(keyResult.value) || new LiteralValue(undefined);
		} else if(ast instanceof VariableDeclaration) {
			for(const declaration of ast.declarations) {
				const valueResult = this.evaluate(declaration.init);
				if(valueResult instanceof FailureResult) return valueResult;

				this._local.variables.set(declaration.id.name, valueResult);
				//LOG && console.log("VariableDeclaration", declaration.id.name, value);
			}

			return new LiteralValue(undefined);
		} else if(ast instanceof BlockStatement) {
			this._local = new BlockScope({parent: this._local});
			const _local = this._local;

			for(const statement of ast.body) {
				// if(statement instanceof ReturnStatement) {
				// 	LOG && console.log("got return statement");
				// 	if(this._callStack.length === 0) throw new Error("Illegal return outside function");
				// 	const value = this.evaluate(statement);
				// 	LOG && console.log("returning", value);
				// 	return value;
				// }

				const result = this.evaluate(statement);
				if(result instanceof FailureResult) return result;

				if(this._callStack.length > 0) {
					const func = this._callStack[this._callStack.length - 1];
					const returnValue = func.returnValue;
					//LOG && console.log("return value", statement, returnValue);
					if(returnValue) {
						LOG && console.log("returning from function");
						if(func.value?.body === ast) return returnValue;

						break;
					}
				}
			}

			if(this._local !== _local) throw new Error("Block scope was not restored");
			if(!this._local.parent) throw new Error("Invalid state: this._local.parent is null");
			this._local = this._local.parent;

			return new LiteralValue(undefined);
		} else if(ast instanceof EmptyStatement) {
			return new LiteralValue(undefined);
		} else {
			throw new Error("Unknown ASTNode: " + ast.constructor.name);
		}

		throw new Error("Unhandled ASTNode: " + ast.constructor.name);
	}

	/**
	 * @param {FunctionDefinition} fn
	 * @param {BlockScope | null} [context]
	 * @param {Variable[]} [args=[]]
	 * @param {ASTNode | null} [ast=null]
	 * @returns {Variable | FailureResult}
	 * @memberof Runtime
	 */
	runInContext(fn, context = fn.scope, args = [], ast = null) {
		if(!(fn instanceof FunctionDefinition)) throw new Error("Not a function: " + fn);

		fn.returnValue = null;
		// const stackTop = this._callStack[this._callStack.length - 1];
		// if(stackTop) stackTop.caller = ast;
		fn.caller = ast;

		if(fn.native) {
			LOG && console.log("calling native function with args:", args);
			return /**@type {ReturnType<typeof fn.native>}*/(fn.native.apply(null, args));
		} else if(fn.value) {
			const _local = this._local;
			const scope = context || new BlockScope({parent: this._local});

			LOG && console.log("calling function in context:");
			//LOG && console.dir(scope, {depth: null});

			this._local = scope;

			//Evaluate function arguments
			for(let i = 0; i < fn.value.params.length; i++) {
				const param = fn.value.params[i];
				const arg = args[i];

				if(param instanceof Identifier) {
					scope.variables.set(param.name, arg);
				} else if(param instanceof AssignmentPattern) {
					const valueResult = arg === undefined ? this.evaluate(param.right) : arg;
					if(valueResult instanceof FailureResult) return valueResult;

					scope.variables.set(param.left.name, valueResult);
				}
			}

			//Create Arguments instance, add arguments to it and set it as a variable
			const argsInstance = this.createInternalInstance("Argumenty");
			if(argsInstance instanceof FailureResult) return argsInstance;

			argsInstance.value.set("dĺžka", new LiteralValue(args.length));
			for(let i = 0; i < args.length; i++) {
				argsInstance.value.set(i, args[i]);
			}
			scope.variables.set("internals:arguments", argsInstance);

			//Push function to call stack
			this._callStack.push(fn);
			LOG && console.log("calling function with args:", args, fn.value);
			const result = this.evaluate(fn.value.body);
			if(result instanceof FailureResult) return result;
			LOG && console.log("function returned:", result);
			this._callStack.pop();

			if(!scope.parent) throw new Error("Invalid state: scope.parent is null");
			// this._local = scope.parent;
			this._local = _local;

			return result;
		} else throw new Error("Invalid state: fn.value is null");

	}

	/**
	 * @param {string} identifierName
	 * @return {InstanceDefinition | FailureResult} 
	 * @memberof Runtime
	 */
	createInternalInstance(identifierName) {
		const targetClass = this._global.variables.get(identifierName);
		if(!(targetClass instanceof ClassDefinition))
			throw new Error(`Class '${identifierName}' is not defined`);
		return this.instantiateClass(targetClass);
	}

	/**
	 * @param {ClassDefinition | Variable} cls
	 * @param {Variable[]} [args=[]]
	 * @param {InstanceDefinition | null} [child=null]
	 * @param {ASTNode | null} [ast=null]
	 * @returns {InstanceDefinition | FailureResult}
	 * @memberof Runtime
	 */
	instantiateClass(cls, args = [], child = null, ast = null) {
		if(!(cls instanceof ClassDefinition)) {
			throw new Error("Cannot instantiate a non-class expression");
		}

		const instance = child || new InstanceDefinition(new Map(), cls);
		const props = instance.value;

		const constrExpr = cls.value.properties.find(prop => prop.key.name === "konštruktor");
		const constr = constrExpr && this.evaluate(constrExpr.value);
		if(constr instanceof FailureResult) return constr;

		if(constr && !(constr instanceof FunctionDefinition)) {
			return new FailureResult({
				error: new Error("Class constructor is not a function"),
				tokens: constrExpr.value?.tokens || [],
				stack: this._callStack
			});
		}

		const context = constr && new BlockScope({
			parent: this._local,
			variables: new Map([
				["internals:this", !cls.parent ? instance : new LiteralValue(null)]
			])
		});


		if(!cls.parent) {
			for(const prop of cls.value.properties) {
				//if(props.has(prop.key.name)) continue;
				const valueResult = this.evaluate(prop.value);
				if(valueResult instanceof FailureResult) return valueResult;
				if(valueResult instanceof FunctionDefinition) valueResult.scope?.variables.set("internals:this", instance);
				props.set(prop.key.name, valueResult);
			}

			const constrResult = context && this.runInContext(constr, context, args, ast);
			if(constrResult instanceof FailureResult) return constrResult;

			//console.log("+++++++++++", props);
		} else {

			let wasSuperCalled = false;

			const superFunction = (...parentArgs) => {
				//TODO: create a new instance of NewInstace including args from native function
				//TODO: somehow force to call the evalutaion of NewInstace
				//TODO: that should return new instance of the parent class
				//TODO: so we can return it from super function

				LOG && console.log("Class, super called, instantiating parent class", cls.parent, parentArgs);

				if(!cls.parent) throw new Error("Invalid state: cls.parent is null");
				const parentInstance = this.instantiateClass(cls.parent, parentArgs, instance);
				if(parentInstance instanceof FailureResult) return parentInstance;

				LOG && console.log("Class, super called, parent instance", parentInstance);

				LOG && console.log("Class, super called, parent class is not base, coping props from parent instance");
				//console.log("======>");
				for(const prop of cls.value.properties) {
					const valueResult = this.evaluate(prop.value);
					if(valueResult instanceof FailureResult) return valueResult;
					if(valueResult instanceof FunctionDefinition) valueResult.scope?.variables.set("internals:this", instance);
					props.set(prop.key.name, valueResult);
				}
				//console.log("<======");

				context && context.variables.set("internals:this", instance);
				wasSuperCalled = true;

				LOG && console.log("Class, super called, returning parent instance", parentInstance);

				return parentInstance;
			};


			if(context) {
				context.variables.set("nadtrieda", cls.parent ? new FunctionDefinition(null, superFunction) : new LiteralValue(undefined));
				props.set("konštruktor", constr);

				const constResult = this.runInContext(constr, context, args, ast);
				if(constResult instanceof FailureResult) return constResult;

				if(!wasSuperCalled) return new FailureResult({
					error: new Error("Must call super constructor in derived class before returning from derived constructor"),
					tokens: constrExpr.value?.tokens || [],
					stack: this._callStack
				});
			} else {
				// console.log("Class has no constructor");
				// for(const prop of cls.value.properties) {
				// 	const value = this.evaluate(prop.value);
				// 	if(value instanceof FunctionDefinition) value.scope?.variables.set("internals:this", instance);
				// 	props.set(prop.key.name, value);
				// }
				// console.log("Class, props", props, cls);
				superFunction();
			}
		}

		LOG && console.log("NewExpression, props", props);


		//TODO: add "nadtrieda"
		//TODO: somehow copy the props from parents to the current class
		//TODO: call constructor with nadtrieda as this
		//TODO: nadtrieda might be a separate class witch would copy non existing props from the parent class and call the parent constructor

		if(cls.parent) {

		}

		//const constr = props.get("konštruktor");

		//console.log(instance.prototype?.value.identifier?.name, instance.value);


		return instance;
	}

	/**
	 * @param {ASTNode} ast
	 * @return {Map<string, Variable> | FailureResult} 
	 * @memberof Runtime
	 */
	runModule(ast) {
		const exports = new Map();

		this._exports = exports;
		const result = this.evaluate(ast);
		if(result instanceof FailureResult) return result;
		this._exports = null;

		return exports;
	}

	/**
	 * @param {string} name
	 * @param {ASTNode} ast
	 * @return {Variable | FailureResult} 
	 * @memberof Runtime
	 */
	resolveValue(name, ast) {
		/** @type {BlockScope | null} */
		let scope = this._local;

		while(scope) {
			const value = scope.variables.get(name);
			if(value) return value;

			scope = scope.parent;
		}

		// console.dir(this._local, {depth: 4});
		//throw new Error("Variable not found: " + name);
		return new FailureResult({
			error: new Error(`Variable "${name}" is not declared`),
			tokens: ast.tokens,
			stack: this._callStack
		});
	}

	/**
	 * @param {Variable} variable
	 * @return {string} 
	 * @memberof Runtime
	 */
	resolveType(variable) {
		if(variable instanceof FunctionDefinition) return "funkcia";
		if(variable instanceof ClassDefinition) return "trieda";
		if(variable instanceof InstanceDefinition) return "inštancia";
		if(typeof variable.value === "number") return "číslo";
		if(typeof variable.value === "string") return "reťazec";
		if(typeof variable.value === "boolean") return "tvrdenie";
		if(typeof variable.value === "undefined") return "nedefinovaná hodnota";
		throw new Error("Unknown value: " + variable.value);
	}

	/**
	 * @param {Variable} value
	 * @return {string} 
	 * @memberof Runtime
	 */
	stringifyValue(value) {
		if(value instanceof LiteralValue) {
			if(value.value === undefined) return "nedefinovaná hodnota";
			else if(value.value === true) return "pravda";
			else if(value.value === false) return "nepravda";
			else return value.value + "";
		} else if(value instanceof FunctionDefinition) {
			if(value.value) return value.value.toString();
			else if(value.native) return "<natívna funkcia>";
			else throw new Error("Invalid state: FunctionDefinition with no value or native function");
		} else if(value instanceof ClassDefinition) {
			return value.value.toString();
		} else if(value instanceof InstanceDefinition) {
			const proto = value.prototype;
			const name = proto && proto.value.identifier ? proto.value.identifier.name : "";

			const body = Array
				.from(value.value, ([key, value]) => `${TAB}${key}: ${value.toString().replace(/\n/g, "\n" + TAB)}`)
				.join(",\n");

			return `${name ? name + " " : ""}{\n${body}\n}`;
		} else {
			return `Could not stringify value: ${value} (${typeof value})`;
		}
	}
}

module.exports = {
	Runtime,
	Variable,
	FunctionDefinition,
	ClassDefinition,
	InstanceDefinition,
	BlockScope,
	LiteralValue
};

const {FailureResult} = require("./Result");