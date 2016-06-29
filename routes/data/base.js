var years = [2014, 2015, 2016],
	personNames = ["张三", "李四", "郭靖", "王岳伦", "海清", "唐国强", "崔健", "郜海秋", "丁翰采", "文世英"],
	coverages = ["企财险", "家财险", "车险", "人意险", "建工险"];
function randomBy(under, over) {
	switch (arguments.length) {
		case 1:
			return parseInt(Math.random() * under + 1);
		case 2:
			return parseInt(Math.random() * (over - under + 1) + under);
		default:
			return 0;
	}
}
module.exports = {
	makePersonName: function () {
		return personNames[randomBy(personNames.length) - 1]
	},
	makeDate: function (date, type) {
		var dataStr = years[randomBy(years.length) - 1] + "-" + randomBy(12) + "-" + randomBy(1, 27);
		date = date || new Date(dataStr);
		type = type || ">";
		var year = date.getFullYear(), month = date.getMonth() + 1;
		var result = "";

		dataStr = ( type === ">" ? (year + 1) : (year - 1) ) + "-" + month + "-" + (date.getDay() + 1);
		return new Date(dataStr);

	},
	makeAmount: function (under, over) {
		return randomBy(under, over)
	},
	makeCoverage: function () {
		return coverages[randomBy(coverages.length) - 1]
	}
};