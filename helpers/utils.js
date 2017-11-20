/**
 * 一些常用方法集合
 */

var utils = {
	/**
	 * generate UUID like 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'
	 * @returns {string}
	 */
	generateUUID: function() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
};

module.exports = utils;