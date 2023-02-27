const {ClassExpression, Property} = require("../Parser");
const {ClassDefinition, FunctionDefinition} = require("../Runtime");

module.exports = new ClassDefinition(new ClassExpression({
	identifier: "Reťazec",
	properties: [
		new Property({
			key: "dlžka",
			value: 0
		}),
		new Property({
			key: "kód_znaku_na",
			value: new FunctionE
		})
	]
}));