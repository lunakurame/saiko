/** Adds a slash at the end of a string if it's not already there.
 * @param {string} text - text, to which the slash will be added
 * @returns {string} - text with a trailing slash */
export function addTrailingSlash(text) {
	return text + (text.endsWith('/') ? '' : '/');
}

/** Capitalizes first character of a string.
 * @param {string} text - input text
 * @returns {string} - the same text, but with the first character capitalized */
export function capitalizeFirstCharacter(text) {
	return [...text][0].toUpperCase() +
	       [...text].slice(1).join('');
}

/** Inserts spaces before and after text to center it on the screen.
 *  The lenght of the resulting text matches the width of the screen.
 * @param {string} text - text to be centered
 * @returns {string} - centered text */
export function centerConsoleLine(text) {
	const paddingWidth = process.stdout.columns - [...text].length;

	return ' '.repeat(Math.floor(paddingWidth / 2)) + text +
	       ' '.repeat(Math.ceil(paddingWidth / 2));
}
