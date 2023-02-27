//@ts-check

const EnumGenerator = require("./EnumGenerator.js");

const tokenType = new EnumGenerator();
const TOKEN_TYPE = {
	EOF: tokenType.next(0),
	L_PAREN: tokenType.next(),
	R_PAREN: tokenType.next(),
	PERIOD: tokenType.next(),
	COMMA: tokenType.next(),
	COLON: tokenType.next(),
	PLUS: tokenType.next(),
	MINUS: tokenType.next(),
	NUMBER: tokenType.next(),
	STRING: tokenType.next(),
	IDENTIFIER: tokenType.next(),
	ERROR_MARKER: tokenType.next(),
	WARN_MARKER: tokenType.next(),
	INFO_MARKER: tokenType.next(),
};

const IDENTIFIER_REGEX = /[\u0301\u0302\u0308\u030A\u030Ca-zA-Z_$]/;
const IDENTIFIER_REGEX_NUMBERS = /[\u0301\u0302\u0308\u030A\u030C\w$]/;

class Token {
	// eslint-disable-next-line valid-jsdoc
	/**
	 * Creates an instance of Token.
	 * @param {{type: number, value: string, raw?: string, index: number, line: number, column: number}} options
	 * @memberof Token
	 */
	constructor(options) {
		const {
			type,
			value,
			raw = value,
			index,
			line,
			column
		} = options;

		/** @type {number} */
		this.type = type;

		/** @type {string} */
		this.value = value;

		/** @type {string} */
		this.raw = raw;

		/** @type {number} */
		this.index = index;

		/** @type {number} */
		this.line = line;

		/** @type {number} */
		this.column = column;
	}
}

class Tokenizer {
	constructor(options) {
		const {source} = options;
		this.source = source;
		this.index = -1;
	}

	peek(offset = 1) {
		return this.source[this.index + offset] || "";
	}

	/**
	 *
	 * @return {SuccessTokenizeResult | FailureResult} 
	 * @memberof Tokenizer
	 */
	tokenize() {
		let source = this.source.normalize("NFD");
		let tokens = [];
		let char = "";
		let line = 0;
		let column = 0;

		while(char = source[++this.index]) {
			if(char === "\n") {
				line++;
				column = 0;
				continue;
			}

			if(char === " " || char === "\t") {
				column++;
				continue;
			}

			if(char === "(") {
				tokens.push(new Token({
					type: TOKEN_TYPE.L_PAREN,
					value: "(",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === ")") {
				tokens.push(new Token({
					type: TOKEN_TYPE.R_PAREN,
					value: ")",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === ".") {
				tokens.push(new Token({
					type: TOKEN_TYPE.PERIOD,
					value: ".",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === ",") {
				tokens.push(new Token({
					type: TOKEN_TYPE.COMMA,
					value: ",",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === ":") {
				tokens.push(new Token({
					type: TOKEN_TYPE.COLON,
					value: ":",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === "+") {
				tokens.push(new Token({
					type: TOKEN_TYPE.PLUS,
					value: "+",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char === "-") {
				tokens.push(new Token({
					type: TOKEN_TYPE.MINUS,
					value: "-",
					index: this.index, line, column
				}));
				column++;
				continue;
			}

			if(char.match(/[0-9]/)) {
				let buffer = char;
				while(
					(char = source[++this.index]) && (
						char.match(/[0-9]/) ||
						char === "." && this.peek().match(/[0-9]/) && buffer.indexOf(".") < 0
					)
				) {
					buffer += char;
				}
				this.index--;
				tokens.push(new Token({
					type: TOKEN_TYPE.NUMBER,
					value: buffer,
					index: this.index - buffer.length, line, column
				}));
				column += buffer.length;
				continue;
			}

			if(char === "'" || char === "\"") {
				const quote = char;
				const start = this.index;

				let lines = 0;
				let columns = 1;
				let buffer = "";

				while(
					(char = source[++this.index]) &&
					char !== quote
				) {
					if(char === "\n") {
						lines++;
						columns = 0;
					} else {
						columns++;
					}

					//Resolve escape sequences
					if(char === "\\") {
						char = source[++this.index];
						columns++;
					}

					buffer += char;
				}

				if(!char) {
					return new FailureResult({
						error: new Error("Unterminated string literal"),
						tokens: [new Token({
							type: TOKEN_TYPE.ERROR_MARKER,
							value: source.slice(start),
							column, line, index: start
						})]
					});
				}

				buffer = buffer.normalize("NFC");
				columns++;

				tokens.push(new Token({
					type: TOKEN_TYPE.STRING,
					value: buffer,
					raw: source.slice(start, this.index + 1),
					index: start, line, column
				}));

				line += lines;
				column += columns;

				continue;
			}

			if(char.match(IDENTIFIER_REGEX)) {
				//Catch the identifier
				let buffer = char;
				while((char = source[++this.index]) && char.match(IDENTIFIER_REGEX_NUMBERS)) {
					buffer += char;
				}
				this.index--;

				buffer = buffer.normalize("NFC");

				tokens.push(new Token({
					type: TOKEN_TYPE.IDENTIFIER,
					value: buffer,
					index: this.index - buffer.length, line, column
				}));
				column += buffer.length;
				continue;
			}

			return new FailureResult({
				error: new Error(`Unexpected token "${char}"`),
				tokens: [new Token({
					type: TOKEN_TYPE.ERROR_MARKER,
					value: char,
					column, line, index: this.index
				})]
			});
		}

		tokens.push(new Token({
			type: TOKEN_TYPE.EOF,
			value: "EOF",
			index: this.index, line, column
		}));

		return new SuccessTokenizeResult({tokens});
	}
}

module.exports = {
	Tokenizer,
	Token,
	TOKEN_TYPE
};

const {SuccessTokenizeResult, FailureResult} = require("./Result.js");