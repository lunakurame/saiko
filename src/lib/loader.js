/** Functions to do operations on disk.
 * @module lib/loader */

import fs from 'fs';
import {promisify} from 'util';

/** Creates a directory.
 * @param {string} path - the path of the new directory
 * @param {integer} [mode=0o755] - permissions
 * @returns {Promise<string|Error>} - a promise to the directory path */
export async function createDirectory(path, mode = 0o755) {
	const mkDir = promisify(fs.mkdir);

	await mkDir(path, mode);

	return path;
}

/** Checks if a file exists and is readable (has read permissions).
 * @param {string} fileName - the file's name
 * @returns {Promise<string|Error>} - a promise to the file name */
export async function isFileReadable(fileName) {
	const access = promisify(fs.access);

	await access(fileName, fs.constants.R_OK);

	return fileName;
}

/** Checks if a file exists and is writable (has write permissions).
 * @param {string} fileName - the file's name
 * @returns {Promise<string|Error>} - a promise to the file name */
export async function isFileWritable(fileName) {
	const access = promisify(fs.access);

	await access(fileName, fs.constants.W_OK);

	return fileName;
}

/** Loads a JSON file.
 * @param {string} fileName - the JSON file's name
 * @returns {Promise<object|Error>} - a promise to the loaded object */
export async function loadJSON(fileName) {
	const readFile = promisify(fs.readFile);
	const data = await readFile(fileName);

	return JSON.parse(data);
}

/** Saves an object to a JSON file.
 * @param {string} fileName - the JSON file's name
 * @param {object} data - the saved object
 * @param {function} [serialize] - a function used to serialize data before saving
 * @returns {Promise<string|Error>} - a promise to the serialized data */
export async function saveJSON(fileName, data, serialize) {
	const writeFile = promisify(fs.writeFile);
	const serializedData = serialize ?
		serialize(data) :
		`${JSON.stringify(data, null, '\t')}\n`;

	await writeFile(fileName, serializedData);

	return serializedData;
}

/** Lists all files (including folders) in a directory.
 * @param {string} dirName - path to the listed directory
 * @returns {Promise<array|Error>} - a promise to an array of file names */
export async function listDirectory(dirName) {
	const readDir = promisify(fs.readdir);
	const files = await readDir(dirName);

	return files;
}
