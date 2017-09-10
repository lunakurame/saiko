/** @module plug/log */

import 'colors';
import Plugin from '../plugin.js';

/** A plugin to log discord messages. */
export default class LogPlugin extends Plugin {
	/** Creates a new LogPlugin object.
	 * @param {Saiko} saiko - a Saiko object, which is gonna use that plugin
	 * @returns {LogPlugin} - a LogPlugin object */
	constructor(saiko) {
		super(saiko);

		this.name = 'log';
		this.description = 'Logs messages.';
	}

	/** Returns the message's source in a human-readable format.
	 * @param {Discord.Message} message - a message to check
	 * @returns {string} - message's source */
	static formatMessageSource(message) {
		switch (message.channel.type) {
		case 'text':
			return `${message.guild.name}${'#'.cyan}${message.channel.name}`;
		case 'dm':
			return `${message.channel.recipient.username} #${message.channel.recipient.discriminator}`;
		case 'group':
			return message.channel.name ?
				`Group: ${message.channel.name}` :
				`Unnamed group (ID: ${message.channel.id})`;
		case 'voice':
		default:
			return 'Unknown source';
		}
	}

	/** Returns the message's author in a human-readable format.
	 * @param {Discord.Message} message - a message to check
	 * @returns {string} - message's author */
	static formatMessageAuthor(message) {
		switch (message.channel.type) {
		case 'text':
			return message.member.displayName === message.author.username ?
				`${message.author.username} #${message.author.discriminator}` :
				`${message.member.nickname} (${message.author.username} #${message.author.discriminator})`;
		case 'dm':
		case 'group':
			return `${message.author.username} #${message.author.discriminator}`;
		case 'voice':
		default:
			return 'Unknown author';
		}
	}

	/** Logs new messages.
	 * @listens Discord.Client#message
	 * @param {Discord.Message} message - new message
	 * @returns {void} */
	onMessage(message) {
		this.saiko.logger.log(
			' New message '.bgGreen.black,
			LogPlugin.formatMessageSource(message),
			LogPlugin.formatMessageAuthor(message),
			message.content
		);
	}

	/** Logs deleted messages.
	 * @listens Discord.Client#messageDelete
	 * @param {Discord.Message} message - deleted message
	 * @returns {void} */
	onMessageDelete(message) {
		this.saiko.logger.log(
			' Deleted message '.bgRed.white,
			LogPlugin.formatMessageSource(message),
			LogPlugin.formatMessageAuthor(message),
			message.content
		);
	}

	/** Logs updated messages.
	 * @listens Discord.Client#messageUpdate
	 * @param {Discord.Message} oldMessage - message before the update
	 * @param {Discord.Message} newMessage - message after the update
	 * @returns {void} */
	onMessageUpdate(oldMessage, newMessage) {
		this.saiko.logger.log(
			' Updated message (old) '.bgYellow.black,
			LogPlugin.formatMessageSource(oldMessage),
			LogPlugin.formatMessageAuthor(oldMessage),
			oldMessage.content
		);
		this.saiko.logger.log(
			' Updated message (new) '.bgYellow.black,
			LogPlugin.formatMessageSource(newMessage),
			LogPlugin.formatMessageAuthor(newMessage),
			newMessage.content
		);
	}
}
