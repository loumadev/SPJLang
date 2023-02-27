class EnumGenerator {
	constructor() {
		this.index = 0;
	}

	next(value = ++this.index) {
		return value;
	}
}

module.exports = EnumGenerator;