import Plugin from '../plugin.js';
import * as discordTools from '../lib/discord-tools.js';
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
						.map(user => discordTools.getUser(message.channel.guild || message.channel, user) || user)
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
	 * @returns {void} */
	onMessage(message) {
		this.runMatchingCommand(message);
	}
}
