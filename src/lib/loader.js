import fs from 'fs';

/** Loads a JSON file.
 * @param {string} fileName - the JSON file's name
 * @returns {Promise<object|Error>} - a promise, resolves to the loaded object */
export function loadJSON(fileName) {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (error, data) => {
			if (error)
				return reject(error);

			resolve(JSON.parse(data));
		});
	});
}

/** Saves an object to a JSON file.
 * @param {string} fileName - the JSON file's name
 * @param {object} data - the saved object
 * @param {function} [serialize] - a function used to serialize data before saving
 * @returns {Promise<undefined|Error>} - a promise, resolves to nothing */
export function saveJSON(fileName, data, serialize) {
	return new Promise((resolve, reject) => {
		const serializedData = serialize?
			serialize(data) : JSON.stringify(data, null, '\t');

		fs.writeFile(fileName, serializedData, (error, data) => {
			if (error)
				return reject(error);

			resolve();
		});
	});
}
