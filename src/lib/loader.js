/** Functions to do operations on disk.
 * @module lib/loader */

import fs from 'fs';

/** Loads a JSON file.
 * @param {string} fileName - the JSON file's name
 * @returns {Promise<object|Error>} - a promise to the loaded object */
export function loadJSON(fileName) {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (error, data) => {
			if (error)
				return reject(error);

			return resolve(JSON.parse(data));
		});
	});
}

/** Saves an object to a JSON file.
 * @param {string} fileName - the JSON file's name
 * @param {object} data - the saved object
 * @param {function} [serialize] - a function used to serialize data before saving
 * @returns {Promise<string|Error>} - a promise to the serialized data */
export function saveJSON(fileName, data, serialize) {
	return new Promise((resolve, reject) => {
		const serializedData = serialize ?
			serialize(data) :
			`${JSON.stringify(data, null, '\t')}\n`;

		fs.writeFile(fileName, serializedData, error => {
			if (error)
				return reject(error);

			return resolve(serializedData);
		});
	});
}

/** Lists all files (including folders) in a directory.
 * @param {string} dirName - path to the listed directory
 * @returns {Promise<array|Error>} - a promise to an array of file names */
export function listDirectory(dirName) {
	return new Promise((resolve, reject) => {
		fs.readdir(dirName, (error, files) => {
			if (error)
				return reject(error);

			return resolve(files);
		});
	});
}
