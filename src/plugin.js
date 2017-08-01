/** @abstract */
export default class Plugin {
	/** Creates a new Plugin object.
	 * @param {Saiko} - a Saiko object, which is gonna use that plugin
	 * @returns {Plugin} - a Plugin object */
	constructor(saiko) {
		if (new.target === Plugin)
			throw new TypeError('Cannot construct Plugin instances directly');

		this.saiko  = saiko;
		this.logger = saiko.logger;
	}

	/** Handles the 'message' event.
	 * @param {Discord.Message} message - new message
	 * @returns {void} */
	onMessage(message) {}

	/** Handles the 'messageDelete' event.
	 * @param {Discord.Message} message - deleted message
	 * @returns {void} */
	onMessageDelete(message) {}
}
