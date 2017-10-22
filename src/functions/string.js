/** Functions to do operations on strings.
 * @module functions/string */

/** Adds a slash at the end of a string if it's not already there.
 * @param {string} text - text, to which the slash will be added
 * @returns {string} - text with a trailing slash */
export const addTrailingSlash = text =>
	text.endsWith('/') ? text : `${text}/`;

/** Inserts spaces before and after text to center it on the given text length.
 * @param {number} length - length of the new text
 * @param {string} text - text to be centered
 * @returns {string} - centered text */
export const centerText = length => text => {
	const margins = length - [...text].length;

	return (
		margins === 0 ? text :
		margins  <  0 ? [...text].slice(0, length) :
		' '.repeat(Math.floor(margins / 2)) + text +
		' '.repeat(Math.ceil(margins / 2))
	);
};

/** Returns a unicode character described by the name.
 * @param {string} name - emoji name
 * @returns {string} - a unicode character */
export const getEmoji = name =>
	({
		'check mark': '✅',
		'cross mark': '❌',
		human: '👱',
		bot: '🤖'
	})[name];

/** Converts a string of command parameters to an array. Parameters are expected
 *  to be separated by any number of whitespace characters. Double quotes are
 *  supported, as well as escaping them with a backslash.
 * @param {string} text - a string of command parameters
 * @returns {array} - an array of parsed command parameters */
export const parseCommandParameters = text =>
	text
		.match(/[^"\s]+|"([^\\"]|\\.)+"/g)
		.map(param => param.startsWith('"') && param.endsWith('"') ?
			param
				.slice(1, -1)
				.replace(/\\+/g, backslashes => backslashes.slice(1)) :
			param
		);

/** Removes a prefix from string.
 * @param {string} prefix
 * @param {string} text
 * @returns {string} - text without the prefix */
export const stripStart = prefix => text =>
	text.startsWith(prefix) ? text.slice(prefix.length) : text;

/** Capitalizes first character of a string.
 * @param {string} text - input text
 * @returns {string} - the same text, but with the first character capitalized */
export const toUpperCaseFirstChar = text =>
	[...text][0].toUpperCase() + [...text].slice(1).join('');
