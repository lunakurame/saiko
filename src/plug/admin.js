import '../extension/Object.deepAssign.js';
import Discord from 'discord.js';
import Plugin from '../plugin.js';
import * as tools from '../lib/tools.js';

/** A plugin to manage other plugins. */
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
				action: (message, ...params) => {
					const [, action]   = params;
					const plugin       = this.saiko.plugins.find(plugin => plugin.name === params[2]);
					const guildMode    = params[3] === 'guild' && message.channel.type === 'text';
					const place        = guildMode ? message.channel.guild : message.channel;
					const config       = this.saiko.data[guildMode ? 'guilds' : 'channels'];

					if (!config[place.id])
						config[place.id] = {};

					const placeConfig  = config[place.id];
					const pluginConfig = plugin === undefined ? {} : (placeConfig.plugins || {})[plugin.name] || {};

					// invalid or no paramaters
					if (!['enable', 'disable', 'default'].includes(action) ||
					    plugin === undefined) {
						const embed = new Discord.RichEmbed()
							.setColor('#14908d')
							.setTitle('Plugins')
							.setDescription(
								'**Usage:**\n' +
								'    plugins enable "<plugin name>" [guild]\n' +
								'    plugins disable "<plugin name>" [guild]\n' +
								'    plugins default "<plugin name>" [guild]\n' +
								'\n' +
								'**Available plugins:**'
							);

						this.saiko.plugins.forEach(plugin => {
							const pluginEnabled = this.saiko.isPluginEnabled(plugin, message.channel);
							embed.addField(
								`${tools.getEmoji(pluginEnabled ? 'check mark' : 'cross mark')} ${plugin.name}`,
								plugin.description
							);
						});

						return {embed};
					}

					// the state is already set to what the user wants
					if ((action === 'enable'  && pluginConfig.enabled === true) ||
					    (action === 'disable' && pluginConfig.enabled === false)) {
						const embed = new Discord.RichEmbed()
							.setColor('#14908d')
							.setTitle('Plugins')
							.setDescription(`Plugin ${plugin.name} already is ${action}d on this ${guildMode ? 'guild' : 'channel'}.`);

						return {embed};
					}

					// change config
					Object.deepAssign(placeConfig, {
						plugins: {
							[plugin.name]: {
								enabled: action === 'enable'  ? true :
								         action === 'disable' ? false : undefined
							}
						}
					});

					if (action === 'default')
						delete placeConfig.plugins[plugin.name].enabled;

					this.saiko.saveData();

					const actionDescription =
						action === 'enable'  ? 'enabled' :
						action === 'disable' ? 'disabled' :
						action === 'default' ? 'reset to default state' : undefined;
					const embed = new Discord.RichEmbed()
						.setColor('#14908d')
						.setTitle('Plugins')
						.setDescription(`Plugin ${plugin.name} ${actionDescription} on this ${guildMode ? 'guild' : 'channel'}.`);

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
