/** Functions to do operations on arrays.
 * @module functions/array */

/** Converts an entry (an array with two elements) to an object. The first array
 *  item becomes the object's key and the second one its value.
 * @param {array} entry - an entry
 * @returns {object} - an object with a single property */
export const entryToObject = entry =>
	({[entry[0]]: entry[1]});

/** Converts an array of entries to an object.
 * @param {array} entries - an array of entries
 * @returns {object} - an object with properties definied by those entries */
export const entriesToObject = entries =>
	entries.reduce((object, entry) => ({...object, ...entryToObject(entry)}), {});
