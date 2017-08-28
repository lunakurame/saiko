import '../extension/Object.deepAssign.js';
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
				trigger: 'operators',
				action: message => message.channel.type === 'text' ?
					this.getEmbed({
						title: 'Operator',
						description:
							'**Usage:**\n' +
							'Operators can change the bot config. Currently there is ' +
							'no way to add operators other than granting them a role with ' +
							'the `Administrator` permission.\n' +
							'\n' +
							'**Operators:**',
						fields: Array.from(message.guild.members.values())
							.filter(member => Plugin.isOperator(member))
							.map(member => ({
								name: `${tools.getEmoji(member.user.bot ? 'bot' : 'human')} ${member.nickname || member.user.username}`,
								value: `${member.user.username}#${member.user.discriminator}`
							}))
					}) :
					this.getEmbed({
						title: 'Operator',
						description: 'Operator permissions apply to guild channels only.'
					})
			},
			{
				operator: true,
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
					    plugin === undefined)
						return this.getEmbed({
							title: 'Plugins',
							description:
								'**Usage:**\n' +
								'    plugins <action> <plugin name> [guild]\n' +
								'\n' +
								'Actions:\n' +
								'- enable - enable plugin,\n' +
								'- disable - disable plugin,\n' +
								'- default - reset plugin\'s status to the defaul value.\n' +
								'\n' +
								'If the plugin name contains spaces, use quote marks around the name.\n' +
								'If you add "guild" at the end, the changes will be applied to the guild\'s config ' +
								'instead of the channel\'s config (that option is ignored for DM and group DM channels).\n' +
								'\n' +
								'**Available plugins:**',
							fields: this.saiko.plugins.map(plugin => {
								const pluginEnabled = this.saiko.isPluginEnabled(plugin, message.channel);
								return {
									name: `${tools.getEmoji(pluginEnabled ? 'check mark' : 'cross mark')} ${plugin.name}`,
									value: plugin.description
								};
							})
						});

					// the state is already set to what the user wants
					if ((action === 'enable'  && pluginConfig.enabled === true) ||
					    (action === 'disable' && pluginConfig.enabled === false))
						return this.getEmbed({
							title: 'Plugins',
							description: `Plugin ${plugin.name} already is ${action}d on this ${guildMode ? 'guild' : 'channel'}.`
						});

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
					return this.getEmbed({
						title: 'Plugins',
						description: `Plugin ${plugin.name} ${actionDescription} on this ${guildMode ? 'guild' : 'channel'}.`
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
