/** Tools.
 * @module lib/tools */

/** Adds a slash at the end of a string if it's not already there.
 * @param {string} text - text, to which the slash will be added
 * @returns {string} - text with a trailing slash */
export function addTrailingSlash(text) {
	return text.endsWith('/') ? text : `${text}/`;
}

/** Clone a value by converting it to JSON and back to whatever type it was before.
 * @param {*} value - a value to be cloned
 * @return {*} - cloned value */
export function cloneJSON(value) {
	return JSON.parse(JSON.stringify(value));
}

/** Capitalizes first character of a string.
 * @param {string} text - input text
 * @returns {string} - the same text, but with the first character capitalized */
export function toUpperCaseFirstChar(text) {
	return [...text][0].toUpperCase() +
	       [...text].slice(1).join('');
}

/** Inserts spaces before and after text to center it on the screen.
 *  The length of the resulting text matches the width of the screen.
 * @param {string} text - text to be centered
 * @returns {string} - centered text */
export function centerConsoleLine(text) {
	const paddingWidth = process.stdout.columns - [...text].length;

	return ' '.repeat(Math.floor(paddingWidth / 2)) + text +
	       ' '.repeat(Math.ceil(paddingWidth / 2));
}

/** Returns a unicode character described by the name.
 * @param {string} name - emoji name
 * @returns {string} - a unicode character */
export function getEmoji(name) {
	const characters = {
		'check mark': '✅',
		'cross mark': '❌',
		human: '👱',
		bot: '🤖'
	};

	return characters[name];
}

/** Recursively removes properties which value is an empty object.
 * @param {object} object - the input object
 * @returns {object} - the same object after removing empty objects */
export function removeEmptyObjects(object) {
	for (const key of Object.keys(object))
		if (typeof object[key] === 'object' && object[key] !== null) {
			removeEmptyObjects(object[key]);

			if (Object.keys(object[key]).length === 0)
				delete object[key];
		}

	return object;
}

/** Converts a string of command parameters to an array. Parameters are expected
 *  to be separated by any number of whitespace characters. Double quotes are
 *  supported, as well as escaping them with a backslash.
 * @param {string} text - a string of command parameters
 * @returns {array} - an array of parsed command parameters */
export function parseCommandParameters(text) {
	return text
		.match(/[^"\s]+|"([^\\"]|\\.)+"/g)
		.map(param => param.startsWith('"') && param.endsWith('"') ?
			param
				.slice(1, -1)
				.replace(/[\\]+/g, backslashes => backslashes.slice(1)) :
			param
		);
}
