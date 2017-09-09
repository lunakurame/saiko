/** Logging messages to the system console.
 * @module lib/logger */

import 'colors';

/** Logs all kinds of debug messages, errors, etc. */
export default class Logger {
	/** Creates a new Logger object.
	 * @param {object} options - logging options
	 * @param {boolean} [options.enabled=true] - enables logging
	 * @param {boolean} [options.showLog=true] - show log messages
	 * @param {boolean} [options.showDebug=false] - show debug messages
	 * @param {boolean} [options.showWarnings=true] - show warning messages
	 * @param {boolean} [options.showErrors=true] - show error messages
	 * @param {boolean} [options.showPanics=true] - show panic messages
	 * @returns {Logger} - a Logger object */
	constructor({enabled, showLog, showDebug, showWarnings, showErrors, showPanics}) {
		this.enabled      = enabled      !== false;
		this.showLog      = showLog      !== false;
		this.showDebug    = showDebug    === true;
		this.showWarnings = showWarnings !== false;
		this.showErrors   = showErrors   !== false;
		this.showPanics   = showPanics   !== false;
	}

	/** Enables logging.
	 * @returns {void} */
	enable() {
		this.debug('Logger', 'Logging enabled.');
		this.enabled = true;
	}

	/** Disables logging.
	 * @returns {void} */
	disable() {
		this.debug('Logger', 'Logging disabled');
		this.enabled = false;
	}

	/** Formats a place name used in the logging functions.
	 * @param {string} placeName - the place name to be formatted
	 * @returns {string} - formatted place name */
	static formatPlaceName(placeName) {
		return ` ${placeName} `.bgBlack.white;
	}

	/** Formats a module name used in the logging functions.
	 * @param {string} moduleName - the module name to be formatted
	 * @returns {string} - formatted module name */
	static formatModuleName(moduleName) {
		return Logger.formatPlaceName(moduleName).replace(/(#|\.)/g, '$&'.cyan);
	}

	/** Logs a log message.
	 * @param {string} status - message status
	 * @param {string} placeName - name of the place, which generated the message
	 * @param {string} text - text of the message
	 * @param {...string} messages - messages to be logged
	 * @returns {void} */
	log(status, placeName, text, ...messages) {
		if (!this.enabled || !this.showLog)
			return;

		const place = Logger.formatPlaceName(placeName);

		console.log(`${status}${place} ${text}`);
		for (const message of messages)
			console.log(message);
		console.log('');
	}

	/** Logs a debug message.
	 * @param {string} moduleName - name of the module, which generated the message
	 * @param {string} text - text of the message
	 * @returns {void} */
	debug(moduleName, text) {
		if (!this.enabled || !this.showDebug)
			return;

		const status = ' Debug '.bgCyan.black;
		const module = Logger.formatModuleName(moduleName);

		console.log(`${status}${module} ${text}\n`);
	}

	/** Logs a warning message.
	 * @param {string} moduleName - name of the module, which generated the message
	 * @param {string} text - text of the message
	 * @returns {void} */
	warn(moduleName, text) {
		if (!this.enabled || !this.showWarnings)
			return;

		const status = ' Warning '.bgYellow.black;
		const module = Logger.formatModuleName(moduleName);

		console.warn(`${status}${module} ${text}\n`);
	}

	/** Logs an error message.
	 * @param {string} moduleName - name of the module, which generated the message
	 * @param {string} text - text of the message
	 * @param {...Error} errors - errors to be logged
	 * @returns {void} */
	error(moduleName, text, ...errors) {
		if (!this.enabled || !this.showErrors)
			return;

		const status = ' Error '.bgRed.white;
		const module = Logger.formatModuleName(moduleName);

		console.error(`${status}${module} ${text}`);
		for (const error of errors)
			console.error(error);
		console.error('');
	}

	/** Logs a panic message.
	 * @param {string} moduleName - name of the module, which generated the message
	 * @param {string} text - text of the message
	 * @param {...Error} errors - errors to be logged
	 * @returns {void} */
	panic(moduleName, text, ...errors) {
		if (!this.enabled || !this.showPanics)
			return;

		const status = ' Panic '.bgRed.white;
		const module = Logger.formatModuleName(moduleName);

		console.error(`${status}${module} ${text}`);
		for (const error of errors)
			console.error(error);
		console.error('');
		process.exit(1); // eslint-disable-line no-process-exit
	}
}
