/** Logging messages to the system console.
 * @module functions/log */

import colors from 'colors/safe';

/** Logs a message.
 * @param {function} output - console.log|console.warn|console.error
 * @param {object} type - message type
 * @param {string} type.text - type's text
 * @param {function} [type.decorator] - function used to transform the text
 * @param {object} options - message's options
 * @param {object} [options.title] - describes message's title
 * @param {string} [options.title.module] - module which reports this message
 * @param {string} [options.title.separator] - separator between the module and function
 * @param {string} [options.title.function] - function which reports this message
 * @param {string} [options.text] - text displayed next to the title
 * @param {array} [options.messages] - an array of messages printed to the console
 * @returns {void} */
const handleMessage = output => type => ({title, text, messages}) => {
	output(
		(type.decorator || colors.bgWhite.black)(` ${type.text} `) +
		(title.decorator || colors.bgBlack.white)(` ${title.module || ''}`) +
		colors.bgBlack.cyan(title.module && title.function ? title.separator || '~' : '') +
		(title.decorator || colors.bgBlack.white)(`${title.function || ''} `) +
		(text ? ` ${text}` : '')
	);

	if (Array.isArray(messages))
		for (const message of messages)
			output(message);

	output('');
};

export const custom =
	handleMessage(console.log);

export const debug =
	handleMessage(console.log)({
		text: 'Debug',
		decorator: colors.bgCyan.black
	});

export const warn =
	handleMessage(console.warn)({
		text: 'Warning',
		decorator: colors.bgYellow.black
	});

export const error =
	handleMessage(console.error)({
		text: 'Error',
		decorator: colors.bgRed.white
	});
