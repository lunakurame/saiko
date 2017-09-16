/** @module plug/log */

import Plugin from '../plugin.js';
import colors from 'colors/safe';
import * as log from '../modules/log.js';

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

	/** Returns the message's source in a format expected by log~custom.
	 * @param {Discord.Message} message - a message
	 * @returns {object} - message's source */
	static getMessageSource(message) {
		switch (message.channel.type) {
		case 'text':
			return {
				module: message.guild.name,
				separator: '#',
				function: message.channel.name
			};
		case 'dm':
			return {
				module: `${message.channel.recipient.username} #${message.channel.recipient.discriminator}`
			};
		case 'group':
			return {
				module: message.channel.name ?
					`Group: ${message.channel.name}` :
					`Unnamed group (ID: ${message.channel.id})`
			};
		case 'voice':
		default:
			return {
				module: 'Unknown source'
			};
		}
	}

	/** Returns the message's author in a human-readable format.
	 * @param {Discord.Message} message - a message
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
	onMessage(message) { // eslint-disable-line class-methods-use-this
		log.custom({
			text: 'New message',
			decorator: colors.bgGreen.black
		})({
			title: LogPlugin.getMessageSource(message),
			text: LogPlugin.formatMessageAuthor(message),
			messages: [message.content]
		});
	}

	/** Logs deleted messages.
	 * @listens Discord.Client#messageDelete
	 * @param {Discord.Message} message - deleted message
	 * @returns {void} */
	onMessageDelete(message) { // eslint-disable-line class-methods-use-this
		log.custom({
			text: 'Deleted message',
			decorator: colors.bgRed.white
		})({
			title: LogPlugin.getMessageSource(message),
			text: LogPlugin.formatMessageAuthor(message),
			messages: [message.content]
		});
	}

	/** Logs updated messages.
	 * @listens Discord.Client#messageUpdate
	 * @param {Discord.Message} oldMessage - message before the update
	 * @param {Discord.Message} newMessage - message after the update
	 * @returns {void} */
	onMessageUpdate(oldMessage, newMessage) { // eslint-disable-line class-methods-use-this
		log.custom({
			text: 'Updated message (old)',
			decorator: colors.bgYellow.black
		})({
			title: LogPlugin.getMessageSource(oldMessage),
			text: LogPlugin.formatMessageAuthor(oldMessage),
			messages: [oldMessage.content]
		});
		log.custom({
			text: 'Updated message (new)',
			decorator: colors.bgYellow.black
		})({
			title: LogPlugin.getMessageSource(newMessage),
			text: LogPlugin.formatMessageAuthor(newMessage),
			messages: [newMessage.content]
		});
	}
}
