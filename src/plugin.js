import Discord from 'discord.js';
import * as tools from './lib/tools.js';

/** @abstract */
export default class Plugin {
	/** Creates a new Plugin object.
	 * @param {Saiko} saiko - a Saiko object, which is gonna use that plugin
	 * @returns {Plugin} - a Plugin object */
	constructor(saiko) {
		if (new.target === Plugin)
			throw new TypeError('Cannot construct Plugin instances directly');

		/** Plugin's command.
		 * @typedef PluginCommand
		 * @type {object}
		 * @property {string|function|RegExp} trigger
		 * @property {string|function} action
		 * @property {string|function} [help] */

		/** @type {Saiko} - a Saiko object, which is gonna use the plugin */
		this.saiko       = saiko;
		/** @type {string} - plugin's prefix */
		this.prefix      = '`';
		/** @type {string} - plugin's description */
		this.description = `This plugin doesn't have a description.`;
		/** @type {array<PluginCommand>} - plugin's commands */
		this.commands    = [];
	}

	/** Checks if a user should be ignored.
	 * @param {Discord.User} user - the user which will be checked
	 * @returns {boolean} - true if the user should be ignored */
	shouldBeIgnored(user) {
		return user.bot || user.id === this.saiko.client.user.id;
	}

	/** Checks if the message triggers the command. The trigger will match one of the following values:
	 *  - a string - if the message content starts with the prefix followed by that string (case insensitive),
	 *  - a function - if it returns a truthy value,
	 *  - a RegExp - if it matches the message content.
	 * @param {Discord.Message} message - the message which triggered that command
	 * @param {PluginCommand} command - the command to check
	 * @returns {boolean} - true if the trigger matches the message */
	doesMessageTriggerCommand(message, {trigger}) {
		return [
			typeof trigger === 'string' && message.content.toLowerCase().startsWith(`${this.prefix}${trigger}`),
			typeof trigger === 'function' && trigger(message),
			trigger instanceof RegExp && message.content.match(trigger)
		].some(condition => condition);
	};

	/** Runs a specific command. If the answer returns a falsey value, a help message is used instead.
	 * @param {Discord.Message} message - the message which triggered that command
	 * @param {PluginCommand} command - the command to run
	 * @returns {void} */
	runCommand(message, {action, help}) {
		const defaultHelp =  {
			embed: new Discord.RichEmbed()
				.setColor('#14908d')
				.setTitle(`This command doesn't have a description.`)
		};
		const expandFunction = (thing, ...parameters) =>
			typeof thing === 'function' ? thing(...parameters) : thing;
		const commandParams = tools.parseCommandParameters(message.content);
		const answer = expandFunction(action             , message, ...commandParams) ||
		               expandFunction(help || defaultHelp, message, ...commandParams);

		message.channel.send(...(Array.isArray(answer) ? answer : [answer]));
	};

	/** Checks if the message triggers any command and runs it.
	 * @param {Discord.Message} message - the message which might trigger a command
	 * @returns {boolean} - true if any command ran, false otherwise */
	runMatchingCommand(message) {
		if (!message.content.startsWith(this.prefix))
			return false;

		for (let command of this.commands)
			if (this.doesMessageTriggerCommand(message, command)) {
				this.runCommand(message, command);
				return true;
			}

		return false;
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
