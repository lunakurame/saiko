import Discord from 'discord.js';
import Plugin from '../plugin.js';
import * as tools from '../lib/tools.js';

export default class AdminPlugin extends Plugin {
	/** Creates a new AdminPlugin object.
	 * @param {Saiko} saiko - a Saiko object, which is gonna use that plugin
	 * @returns {AdminPlugin} - a AdminPlugin object */
	constructor(saiko) {
		super(saiko);

		this.name = 'admin';
		this.description = `Commands to administrate ${saiko.name}.`;
		this.commands = [
			{
				trigger: 'plugins',
				action: message => {
					const embed = new Discord.RichEmbed()
						.setColor('#14908d')
						.setTitle('Plugins');

					this.saiko.plugins.forEach(plugin => {
						const pluginEnabled = this.saiko.isPluginEnabled(plugin, message.channel);
						embed.addField(
							`${tools.getEmoji(pluginEnabled ? 'check mark' : 'cross mark')} ${plugin.name}`,
							plugin.description
						);
					});

					return {embed};
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
