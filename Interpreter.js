//@ts-check

const {Runtime, Variable} = require("./Runtime");
const ModuleLoader = require("./ModuleLoader");
const fs = require("fs");

const LOG = false;

class Interpreter {
	constructor(options) {
		const {source} = options;
		this.source = source.replace(/\t/g, "  ");
	}

	/**
	 * @return {Variable | FailureResult} 
	 * @memberof Interpreter
	 */
	interpret() {
		const ast = ModuleLoader.generateAST(this.source);
		if(ast instanceof FailureResult) return ast;

		//Look for built-in modules
		const builtInModules = fs.readdirSync("./builtins")
			.filter(filename => filename.endsWith(".spj"));

		const runtime = new Runtime();

		//Load all the built-in modules
		for(const filename of builtInModules) {
			LOG && console.log(`Loading built-in module '${filename}'...`);
			const module = ModuleLoader.loadModule(`./builtins/${filename}`, runtime);
			if(module instanceof FailureResult) return module;

			for(const [name, value] of module) {
				runtime._global.variables.set(name, value);
			}

			LOG && console.log(`Loaded built-in module '${filename}'!`);
		}

		const result = runtime.evaluate(ast.node);

		if(result instanceof FailureResult) {
			result.__source = this.source;
		}

		//LOG && console.dir(ast, {depth: null});
		//console.log(ast.toString());

		return result;
	}
}

module.exports = {Interpreter};

const {FailureResult} = require("./Result");


(async function() {
	if(require.main === module) {
		const file = process.argv[2];
		if(!file) {
			console.error("No file specified!");
			process.exit(1);
		}

		fs.promises.readFile(file, "utf8").then(source => {
			const interpreter = new Interpreter({source});
			const result = interpreter.interpret();

			if(result instanceof FailureResult) {
				console.error(result.toString());
				process.exit(1);
			}

			//console.log(result.toString());
			process.exit(0);
		}).catch(err => {
			console.error(`Error reading file '${file}': ${err.message}`);
			process.exit(1);
		});
	}
})();