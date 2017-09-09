/** @module saiko */

import './extension/Object.deepAssign.js';
import Discord from 'discord.js';
import * as discordTools from './lib/discord-tools.js';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

/** Saiko's main class. */
export default class Saiko {
	/** Creates a new Saiko object.
	 * @param {string} dataPath - path to the data folder
	 * @param {Logger} logger - a Logger object used to log everything
	 * @returns {Saiko} - a Saiko object */
	constructor(dataPath, logger) {
		this.dataPath   = tools.addTrailingSlash(dataPath);
		this.data       = {};
		this.plugins    = [];
		this.logger     = logger;
		this.client     = new Discord.Client;
		this.libName    = process.env.npm_package_name; // eslint-disable-line no-process-env
		this.libVersion = process.env.npm_package_version; // eslint-disable-line no-process-env
	}

	/** Returns bot's name. If it's not specified, returns the library's name instead.
	 * @returns {string} - bot's name */
	get name() {
		return this.data.name || this.libName;
	}

	/** Sets bot's name.
	 * @param {string} value - bot's new name
	 * @returns {void} */
	set name(value) {
		this.data.name = value;
	}

	/** Returns bot's version. If it's not specified, returns the library's version instead.
	 * @returns {string} - bot's version */
	get version() {
		return this.data.version || this.libVersion;
	}

	/** Sets bot's version.
	 * @param {string} value - bot's new version
	 * @returns {void} */
	set version(value) {
		this.data.version = value;
	}

	/** Loads the data.
	 * @returns {Promise<object|Error>} - a promise to the data object */
	async loadData() {
		this.logger.debug('Saiko#loadData', 'Loading data...');

		const data = await loader.loadJSON(`${this.dataPath}data.json`);

		const requiredProperties = ['token'];
		const arrayProperties    = [];
		const objectProperties   = ['defaults', 'guilds', 'channels'];

		const missingRequiredProperties = requiredProperties
			.filter(property => data[property] === undefined);

		for (const property of missingRequiredProperties)
			this.logger.error('Saiko#loadData', `Undefined required property: ${property}`);

		if (missingRequiredProperties.length > 0)
			this.logger.panic('Saiko#loadData', 'Some required properties are undefined');

		for (const property of arrayProperties)
			if (!Array.isArray(data[property]))
				data[property] = [];

		for (const property of objectProperties)
			if (typeof data[property] !== 'object' || Array.isArray(data[property]))
				data[property] = {};

		this.data = data;

		this.logger.debug('Saiko#loadData', 'Data loaded');
		return data;
	}

	/** Saves the data.
	 * @returns {Promise<object|Error>} - a promise to the serialized data */
	async saveData() {
		this.logger.debug('Saiko#saveData', 'Saving data...');

		this.clearData();
		this.updateGuildNames();
		this.updateChannelNames();

		const serializedData = await loader.saveJSON(`${this.dataPath}data.json`, this.data);

		this.logger.debug('Saiko#saveData', 'Data saved');
		return serializedData;
	}

	/** Clears the data object properies from empty objects.
	 * @returns {void} */
	clearData() {
		for (const property of Object.values(this.data))
			if (typeof property === 'object' && property !== null)
				tools.removeEmptyObjects(property);
	}

	/** Updates channels' name, type and, if the channel has a parent guild,
	 *  the guild's id and name in Saiko's data. If that metadata is the only
	 *  data specified in the channel's config, the config will be removed.
	 * @returns {void} */
	updateChannelNames() {
		for (const id of Object.keys(this.data.channels)) {
			const channel       = this.client.channels.get(id);
			const channelConfig = this.data.channels[id];

			const isConfigEmpty = config => Object.keys(config)
				.filter(key => !['name', 'type', 'guild'].includes(key))
				.length === 0;

			if (channel === null || isConfigEmpty(channelConfig)) {
				delete this.data.channels[id];
				continue;
			}

			channelConfig.name = channel.name;
			channelConfig.type = channel.type;

			if (channel.type === 'text')
				channelConfig.guild = {
					id: channel.guild.id,
					name: channel.guild.name
				};
		}
	}

	/** Updates guilds' name in Saiko's data. If that metadata is the only
	 *  data specified in the guild's config, the config will be removed.
	 * @returns {void} */
	updateGuildNames() {
		for (const id of Object.keys(this.data.guilds)) {
			const guild       = this.client.guilds.get(id);
			const guildConfig = this.data.guilds[id];

			const isConfigEmpty = config => Object.keys(config)
				.filter(key => key !== 'name')
				.length === 0;

			if (guild === null || isConfigEmpty(guildConfig)) {
				delete this.data.guilds[id];
				continue;
			}

			guildConfig.name = guild.name;
		}
	}

	/** Returns a channel's config.
	 * @param {Discord.Channel} channel
	 * @returns {object} - channel's config */
	getChannelConfig(channel) {
		const noGuild = channel.type !== 'text';

		return Object.deepAssign({},
			           this.data.defaults,
			noGuild || this.data.guilds[channel.guild.id],
			           this.data.channels[channel.id]
		);
	}

	/** Returns a guild's config.
	 * @param {Discord.Guild} guild
	 * @returns {object|boolean} - guild's config */
	getGuildConfig(guild) {
		return Object.deepAssign({},
			this.data.defaults,
			this.data.guilds[guild.id]
		);
	}

	/** Returns a plugin's config for a given channel or a guild.
	 * @param {Plugin} plugin
	 * @param {Place} place - the place which triggered that function
	 * @returns {object} - plugin's config */
	getPluginConfig(plugin, place) {
		const placeType = discordTools.getPlaceType(place);

		const placeConfig =
			placeType === 'guild'                                ? this.getGuildConfig(place)   :
			['text', 'dm', 'group', 'voice'].includes(placeType) ? this.getChannelConfig(place) : {};

		return (placeConfig.plugins || {})[plugin.name] || {};
	}

	/** Loads all plugins from plug/*.js.
	 * @returns {Promise<array|Error>} - a promise to an array of loaded plugins */
	async loadPlugins() {
		this.logger.debug('Saiko#loadPlugins', 'Loading plugins...');

		const pluginsDirName = 'plug';
		const directory = await loader.listDirectory(`./build/${pluginsDirName}`);
		const fileNames = directory.filter(fileName => fileName.endsWith('.js'));
		const plugins = [];

		for (const fileName of fileNames) {
			const pluginName   = [...fileName].slice(0, -3).join('');
			const fullFileName = `./${pluginsDirName}/${fileName}`;

			this.logger.debug('Saiko#loadPlugins', `Loading plugin "${pluginName}"...`);

			try {
				const PluginClass = require(fullFileName).default; // eslint-disable-line global-require

				plugins.push(new PluginClass(this));
			} catch (error) {
				this.logger.error('Saiko#loadPlugins', `Cannot load plugin "${pluginName}"`);
				throw error;
			}
		}

		this.plugins = plugins;

		this.logger.debug('Saiko#loadPlugins', 'Plugins loaded');
		return plugins;
	}

	/** Enables all loaded plugins (binds all the Discord.js events).
	 * @returns {void} */
	enablePlugins() {
		this.logger.debug('Saiko#enablePlugins', 'Binding events to plugins...');

		const eventNames = ['message', 'messageDelete'];

		for (const eventName of eventNames)
			this.client.on(eventName, (...parameters) => {
				const [{channel}] = parameters;

				for (const plugin of this.plugins)
					if (this.isPluginEnabled(plugin, channel))
						plugin[`on${tools.toUpperCaseFirstChar(eventName)}`](...parameters);
			});

		this.logger.debug('Saiko#enablePlugins', 'Events binded to plugins');
	}

	/** Checks if a plugin is enabled on a given channel or a guild.
	 * @param {Plugin} plugin
	 * @param {Discord.Channel|Discord.Guild} place - the channel or guild which triggered that function
	 * @returns {boolean} - true if the plugin is enabled, false otherwise */
	isPluginEnabled(plugin, place) {
		const pluginConfig = this.getPluginConfig(plugin, place);

		return pluginConfig.enabled === true;
	}

	/** Logs in using the token loaded from the bot's data file.
	 * @returns {Promise<string|Error>} - a promise to the login token */
	async login() {
		this.logger.debug('Saiko#login', 'Logging in...');

		const token = await this.client.login(this.data.token);

		this.logger.debug('Saiko#login', 'Logged in');
		return token;
	}
}
