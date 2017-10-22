/** Functions to do operations on objects.
 * @module functions/object */

import * as array from './array.js';
import * as func from './function.js';

/** Clone a value by converting it to JSON and back to whatever type it was before.
 * @param {*} value - a value to be cloned
 * @return {*} - cloned value */
export const cloneJSON =
	func.compose(JSON.parse, JSON.stringify);

/** Checks if a value is an object and not a null.
 * @param {object} object - the object to check
 * @returns {boolean} - true if the value is an object and isn't a null */
export const isNonNullObject = object =>
	typeof object === 'object' && object !== null;

/** Recursively removes properties which value is an empty object.
 * @param {object} object - the input object
 * @returns {object} - a new object without the removed properties */
export const removeEmptyObjects = object =>
	array.entriesToObject(Object.entries(object)
		.map(entry =>
			isNonNullObject(entry[1]) ?
				[entry[0], removeEmptyObjects(entry[1])] :
				entry
		).filter(entry =>
			!(isNonNullObject(entry[1]) && Object.keys(entry[1]).length === 0)
		)
	);

/** Copies an object ignoring specified properties.
 * @param {array} keys - an array of keys to ignore
 * @param {object} object - the object to copy
 * @returns {object} - a copy of the object without the specified keys */
export const removeSomeProperties = keys => object =>
	array.entriesToObject(Object.entries(object)
		.filter(([key]) => !keys.includes(key))
	);

/** Stringifies a valid JSON object.
 * @param {object} object
 * @returns {string} - JSON */
export const stringify = object =>
	JSON.stringify(object, null, '\t');
