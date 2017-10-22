/** Functions to do operations on the filesystem.
 * @module functions/filesystem */

import fs from 'fs';
import {promisify} from 'util';
import * as object from './object.js';

/** Checks if a file exists and has specified permissions (relative to the current process).
 * @param {number} mode - permissions
 * @param {string} fileName - the file's name
 * @returns {Promise<void|Error>} - a promise to the file name */
export const checkFileAccess = mode => fileName =>
	promisify(fs.access)(fileName, mode);

export const checkFileExists =
	checkFileAccess(fs.constants.F_OK);

export const checkFileReadable =
	checkFileAccess(fs.constants.R_OK);

export const checkFileWritable =
	checkFileAccess(fs.constants.W_OK);

export const checkFileExecutable =
	checkFileAccess(fs.constants.X_OK);

/** Creates a directory.
 * @param {number} mode - permissions
 * @param {string} path - the path of the new directory
 * @returns {Promise<void|Error>} - a promise */
export const createDirectory = mode => path =>
	promisify(fs.mkdir)(path, mode);

export const createDirectoryDefaultPerms =
	createDirectory(0o755);

/** Lists all files (including folders) in a directory.
 * @param {string} path - path to the listed directory
 * @returns {Promise<array|Error>} - a promise to an array of file names */
export const listDirectory = path =>
	promisify(fs.readdir)(path);

/** Loads a JSON file.
 * @param {string} fileName - the JSON file's name
 * @returns {Promise<object|Error>} - a promise to the loaded object */
export const loadJSON = async fileName =>
	JSON.parse(await promisify(fs.readFile)(fileName));

/** Saves an object to a JSON file.
 * @param {function} serializer - a function used to serialize data before saving
 * @param {object} data - the saved object
 * @param {string} fileName - the JSON file's name
 * @returns {Promise<string|Error>} - a promise to the serialized data */
export const saveJSON = serializer => data => async fileName => {
	const serializedData = serializer(data);

	await promisify(fs.writeFile)(fileName, serializedData);

	return serializedData;
};

export const serializeAndSaveJSON =
	saveJSON(data => `${object.stringify(data)}\n`);
