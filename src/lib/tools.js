/** Adds a slash at the end of a string if it's not already there.
 * @param {string} text - text, to which the slash will be added
 * @returns {string} - text with a trailing slash */
export function addTrailingSlash(text) {
	return text + (text.endsWith('/') ? '' : '/');
}
