//@ts-check

/**
 * @typedef {import("./Runtime").FunctionDefinition} FunctionDefinition 
 */

const TAB = "    ";

class Result {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of Result.
	 * @param {Object<string, any>} options
	 * @memberof Result
	 */
	constructor(options) {
		if(this.constructor === Result) throw new Error("Result cannot be instantiated");
		if(!options) throw new Error("Invalid options provided");
	}
}

/**
 * @template T
 * @template U
 * @template {U & {data?: T}} V
 */
class SuccessResult extends Result {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of SuccessResult.
	 * @param {V} options
	 * @memberof SuccessResult
	 */
	constructor(options) {
		super(options);

		if(this.constructor === SuccessResult) throw new Error("SuccessResult cannot be instantiated");

		/** @type {U} */
		// @ts-ignore
		this.data = options.data || {};
	}
}

/**
 * @template {ASTNode} T
 * @template U
 * @template {U & {node: T}} V
 */
class SuccessParseResult extends SuccessResult {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of SuccessParseResult.
	 * @param {V} options
	 * @memberof SuccessParseResult
	 */
	constructor(options) {
		super(options);

		/** @type {T} */
		this.node = options.node;
	}

	/**
	 * @return {string} 
	 * @memberof SuccessParseResult
	 */
	toString() {
		return this.node.toString();
	}
}

/**
 * @template {Token[]} T
 * @template U
 * @template {U & {tokens: T}} V
 */
class SuccessTokenizeResult extends SuccessResult {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of SuccessParseResult.
	 * @param {V} options
	 * @memberof SuccessParseResult
	 */
	constructor(options) {
		super(options);

		/** @type {T} */
		this.tokens = options.tokens;
	}

	/**
	 * @return {string} 
	 * @memberof SuccessParseResult
	 */
	toString() {
		return this.tokens.map(token => token.toString()).join(" ");
	}
}

class FailureResult extends Result {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of FailureResult.
	 * @param {{error: Error, tokens: Token[], markers?: Token[], stack?: FunctionDefinition[]}} options
	 * @memberof FailureResult
	 */
	constructor(options) {
		super(options);

		/** @type {Error} */
		this.error = options.error;

		/** @type {Token[]} */
		this.tokens = options.tokens.sort((a, b) => a.index - b.index);

		/** @type {Token[]} */
		this.markers = (options.markers || []).sort((a, b) => a.index - b.index);

		/** @type {FunctionDefinition[]} */
		this.stack = options.stack || [];

		/** @type {string | undefined} */
		this.__source = undefined;
	}

	/**
	 * @param {FailureResult} other
	 * @return {FailureResult}
	 * @memberof FailureResult
	 */
	comapre(other) {
		const thisLast = this.getLastToken();
		const otherLast = other.getLastToken();

		if(otherLast.index + otherLast.raw.length > thisLast.index + thisLast.raw.length)
			return other;
		else
			return this;
	}

	/**
	 * @return {Token}
	 * @memberof FailureResult
	 */
	getFirstToken() {
		return this.tokens[0];
	}

	/**
	 * @return {Token} 
	 * @memberof FailureResult
	 */
	getLastToken() {
		return this.tokens[this.tokens.length - 1];
	}

	/**
	 * @param {string} [source]
	 * @param {boolean} [colors=true]
	 * @return {string} 
	 * @memberof FailureResult
	 */
	toString(source = this.__source, colors = true) {
		const firstToken = this.getFirstToken();
		if(!firstToken) console.warn("No tokens found in failure result (there should always be at least one)!");

		const stack = this.stack
			.slice();

		// @ts-ignore
		const top = {
			identifier: stack[stack.length + 1]?.value?.identifier || null,
			caller: {
				tokens: [firstToken]
			}
		};
		// @ts-ignore
		stack.push(top);

		const errorMessage = `§c${this.error.name}§r: §f${this.error.message}§r\n`
			+ FailureResult.renderStackTrace(stack);
		if(!source) return errorMessage;

		const lines = source.split("\n");
		const errorMarkers = this.tokens.map(token => new Token({
			type: TOKEN_TYPE.ERROR_MARKER,
			value: "~".repeat((token.raw || " ").length),
			index: token.index,
			line: token.line,
			column: token.column
		}));

		const markings = [...errorMarkers, ...this.markers];

		return FailureResult.formatString(
			`${errorMessage}:\n` +
			FailureResult.renderLines(markings, lines, {prependSeparator: true})
		);
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * @static
	 * @param {Token[]} tokens
	 * @param {string[]} lines
	 * @param {{prependSeparator?: boolean, markersAsWarn?: boolean}} [options={}]
	 * @return {string} 
	 * @memberof FailureResult
	 */
	static renderLines(tokens, lines, options = {}) {
		const {
			prependSeparator = true,
			markersAsWarn = false
		} = options;

		tokens = tokens.sort((a, b) => a.line - b.line || a.column - b.column);

		//group markings by line
		/** @type {Token[][]} */
		const grouped = Object.values(
			tokens.reduce((obj, token) => (obj[token.line] = [...(obj[token.line] || []), token], obj), {})
		);

		const renderedLines = grouped.map((tokens, i) => {
			const lineIndex = tokens[0].line;
			const line = lines[lineIndex];

			const lineSeparator = "| ";
			const lineNumber = ` ${lineIndex + 1} ${lineSeparator}`;
			const linePadding = " ".repeat(lineNumber.length - lineSeparator.length) + lineSeparator;

			let index = 0;

			const marking = tokens.map(token => {
				const codePadding = " ".repeat(Math.max(0, token.column - index));

				index = token.column + (token.raw || " ").length;

				const markerColor = token.type === TOKEN_TYPE.ERROR_MARKER ? "§c" :
					token.type === TOKEN_TYPE.WARN_MARKER ? "§6" :
						token.type === TOKEN_TYPE.INFO_MARKER ? "§b" :
							markersAsWarn ? "§e" : "§b";

				return codePadding + markerColor + token.raw;
			}).join("");

			return (prependSeparator && !i ? `§3${linePadding}§r\n` : "") +
				"§3" + lineNumber + "§r" + line + "\n" +
				"§3" + linePadding + "§r" + marking + "§r";
		});

		return renderedLines.join("\n");
	}

	/**
	 * @static
	 * @param {FunctionDefinition[]} stack
	 * @return {string} 
	 * @memberof FailureResult
	 */
	static renderStackTrace(stack) {
		return stack
			.slice()
			.reverse()
			.map((func, i, stack) => {
				const name = stack[i + 1]?.value?.identifier?.name || "<anonymous>";
				const line = func?.caller?.tokens[0] ? func.caller.tokens[0].line + 1 : "??";
				const column = func?.caller?.tokens[0] ? func.caller.tokens[0].column : "??";
				return `${TAB}at ${name}:${line}:${column}`;
			})
			.join("\n");
	}

	static formatString(msg) {
		const codes = ["30", "34", "32", "36", "31", "35", "33", "37", "90", "94", "92", "96", "91", "95", "93", "97"];

		return (msg + "§r§7")
			.replace(/(?<!§)§([0-9a-fr])/gi, (m, c) =>
				c === "r" ? "\x1b[0m" : `\x1b[${codes[parseInt(c, 16)]}m`
			)
			.replace(/§§/g, "§");
	}

	static escapeString(msg) {
		return msg.replace(/§/g, "§§");
	}
}



module.exports = {
	Result,
	SuccessResult,
	SuccessParseResult,
	SuccessTokenizeResult,
	FailureResult
};

const {Token, TOKEN_TYPE} = require("./Tokenizer");
const {ASTNode} = require("./Parser");
