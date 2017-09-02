import Plugin from '../plugin.js';
import * as discordTools from '../lib/discord-tools.js';

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
					const user = discordTools.getUser(message.channel.guild || message.channel, params[1]);

					return user ?
						this.getEmbed({
							author: {
								name: user.username,
								icon: user.displayAvatarURL
							}
						}) :
						this.getEmbed({
							title: 'Find user',
							description: `Can't find a user "${params[1]}"`
						});
				}
			}
		];
	}

	/** Runs matching commands.
	 * @listens Discord.Client#message
	 * @param {Discord.Message} message - new message
	 * @returns {void} */
	onMessage(message) {
		this.runMatchingCommand(message);
	}
}
