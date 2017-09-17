/** @module plug/utils */

import Plugin from '../plugin.js';
import * as discord from '../functions/discord.js';
import * as tools from '../lib/tools.js';

/** A plugin to manage other plugins. */
export default class UtilsPlugin extends Plugin {
	/** Creates a new UtilsPlugin object.
	 * @param {Saiko} saiko - a Saiko object, which is gonna use that plugin
	 * @returns {UtilsPlugin} - a UtilsPlugin object */
	constructor(saiko) {
		super(saiko);

		this.name = 'utils';
		this.description = `Random useful commands.`;
		this.commands = [
			{
				trigger: 'user',
				action: (message, ...params) => {
					if (params.length < 2)
						return this.getEmbed({
							title: 'User',
							description: 'Who do you want me to find?'
						});

					const [, ...users] = params;

					return users
						.map(user => discord.getUser(message.channel.guild || message.channel)(user) || user)
						.map(user => typeof user === 'string' ?
							this.getEmbed({
								title: 'User',
								description: `Can't find user "${user}".`
							}) :
							this.getEmbed({
								author: {
									name: user.tag,
									icon: user.displayAvatarURL
								},
								description: `${tools.getEmoji(user.bot ? 'bot' : 'human')} <@!${user.id}>`
							})
						)
						.map(user => [user]);
				}
			}
		];
	}

	/** Runs matching commands.
	 * @listens Discord.Client#message
	 * @param {Discord.Message} message - new message
	 * @returns {?MessageResponse} - a response to send */
	onMessage(message) {
		return this.runMatchingCommand(message);
	}

	/** Runs matching commands (edits existing responses).
	 * @listens Discord.Client#messageUpdate
	 * @param {Discord.Message} oldMessage - message before the update
	 * @param {Discord.Message} newMessage - message after the update
	 * @returns {?MessageResponse} - a response to send */
	onMessageUpdate(oldMessage, newMessage) {
		return this.runMatchingCommand(newMessage, true);
	}
}
