//@ts-check

const fs = require("fs");
const {Parser} = require("./Parser");
const {Tokenizer} = require("./Tokenizer");
const Runtime = require("./Runtime");

const LOG = false;

class ModuleLoader {
	/**
	 * @static
	 * @param {string} filepath
	 * @param {Runtime.Runtime} runtime
	 * @return {Map<string, Runtime.Variable> | FailureResult} 
	 * @memberof ModuleLoader
	 */
	static loadModule(filepath, runtime) {
		const source = fs.readFileSync(filepath, "utf8");

		const ast = this.generateAST(source);
		if(ast instanceof FailureResult) {
			ast.__source = source;
			return ast;
		}

		const module = runtime.runModule(ast.node);

		return module;
	}

	/**
	 * @static
	 * @param {string} source
	 * @return {SuccessParseResult | FailureResult} 
	 * @memberof ModuleLoader
	 */
	static generateAST(source) {
		const tokenizer = new Tokenizer({source});
		const tokenizerResult = tokenizer.tokenize();

		LOG && console.log(tokenizerResult);
		if(tokenizerResult instanceof FailureResult) {
			if(!tokenizerResult.__source) tokenizerResult.__source = source;
			return tokenizerResult;
		}

		const parser = new Parser({tokens: tokenizerResult.tokens});
		const astResult = parser.parse();

		if(astResult instanceof FailureResult) {
			if(!astResult.__source) astResult.__source = source;

			LOG && console.dir(astResult, {depth: null});
			//LOG && console.log(astResult.toString());
		} else {
			LOG && console.dir(astResult, {depth: null});
			//LOG && console.log(astResult.toString());
		}

		return astResult;
	}
}

module.exports = ModuleLoader;

const {SuccessParseResult, FailureResult} = require("./Result");