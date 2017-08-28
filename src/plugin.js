import Discord from 'discord.js';
import * as tools from './lib/tools.js';

/** Defines an "interface" for plugins. All plugins should extend this class.
 * @abstract */
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
		 * @property {boolean} [operator=false]
		 * @property {string|function|RegExp} trigger
		 * @property {string|function} action
		 * @property {string|function} [help] */

		/** @type {Saiko} - a Saiko object, which is gonna use the plugin */
		this.saiko       = saiko;
		/** @type {string} - plugin's name */
		this.name        = this.constructor.name;
		/** @type {string} - plugin's description */
		this.description = `This plugin doesn't have a description.`;
		/** @type {string} - plugin's prefix */
		this.prefix      = '`';
		/** @type {string} - plugin's color used for RichEmbeds */
		this.color       = '#14908d';
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
	}

	/** Runs a specific command. If the answer returns a falsey value, a help message is used instead.
	 * @param {Discord.Message} message - the message which triggered that command
	 * @param {PluginCommand} command - the command to run
	 * @returns {void} */
	runCommand(message, {operator, action, help}) {
		const defaultHelp = this.getEmbed({
			title: `This command doesn't have a description.`
		});
		const expandFunction = (thing, ...parameters) =>
			typeof thing === 'function' ? thing(...parameters) : thing;
		const contentWithoutPrefix = message.content.startsWith(this.prefix) ?
			message.content.slice(this.prefix.length) :
			message.content;
		const commandParams = tools.parseCommandParameters(contentWithoutPrefix);
		const answer = operator && !Plugin.isOperator(message.member || message.author) ?
			this.noOperatorPerm() :
			expandFunction(action             , message, ...commandParams) ||
			expandFunction(help || defaultHelp, message, ...commandParams);

		message.channel.send(...Array.isArray(answer) ? answer : [answer]);
	}

	/** Checks if the message triggers any command and runs it.
	 * @param {Discord.Message} message - the message which might trigger a command
	 * @returns {boolean} - true if any command ran, false otherwise */
	runMatchingCommand(message) {
		if (!message.content.startsWith(this.prefix))
			return false;

		for (const command of this.commands)
			if (this.doesMessageTriggerCommand(message, command)) {
				this.runCommand(message, command);
				return true;
			}

		return false;
	}

	/** Creates a new object containing a Discord.RichEmbed object.
	 * @param {object} options - options for the RichEmbed
	 * @param {string} [options.color=this.color] - RichEmbed's color
	 * @param {string} [options.title] - RichEmbed's title
	 * @param {string} [options.description] - RichEmbed's description
	 * @param {array} [options.fields] - an array of RichEmbed's fields
	 * @param {string} options.fields[].name - the field's name (title)
	 * @param {string} options.fields[].value - the field's value (description)
	 * @param {boolean} [options.fields[].inline=false] - true if the field should be inlined
	 * @returns {object} - an object containing a RichEmbed object */
	getEmbed({color = this.color, title, description, fields}) {
		const embed = new Discord.RichEmbed()
			.setColor(color)
			.setTitle(title)
			.setDescription(description);

		if (Array.isArray(fields) && fields.length > 0)
			fields.forEach(field => embed.addField(field.name, field.value, field.inline || false));

		return {embed};
	}

	/** Checks if a user has operator permissions.
	 * @param {Discord.GuildMember|Discord.User} user
	 * @returns {boolean} - true if the user has the Administrator perm or
	 *  if the user isn't a guild member */
	static isOperator(user) {
		if (user instanceof Discord.User)
			return true;

		if (user instanceof Discord.GuildMember &&
		    user.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))
			return true;

		return false;
	}

	/** Returns a message saying that a command requires operator permissions.
	 * @returns {object} - the message */
	noOperatorPerm() {
		return this.getEmbed({
			title: 'Permission denied',
			description: 'That command requires operator permissions. ' +
				'Use the `operator` command to see who has them.'
		});
	}

	/** Handles the 'message' event.
	 * @listens Discord.Client#message
	 * @param {Discord.Message} message - new message
	 * @returns {void} */
	onMessage(message) {} // eslint-disable-line

	/** Handles the 'messageDelete' event.
	 * @listens Discord.Client#messageDelete
	 * @param {Discord.Message} message - deleted message
	 * @returns {void} */
	onMessageDelete(message) {} // eslint-disable-line
}
