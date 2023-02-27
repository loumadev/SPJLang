class Utils {
	static asString(value) {
		if(value === null) return "<null>";
		if(value === undefined) return "<undefined>";
		if(typeof value === "string") return value.indexOf('"') > -1 ?
			`'${value.replace(/'/g, "\\'")}'` :
			`"${value.replace(/"/g, '\\"')}"`;
		return value + "";
	}
}

module.exports = {Utils};