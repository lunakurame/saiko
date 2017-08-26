import './extension/Object.deepAssign.js';
import Discord from 'discord.js';
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
		this.defaults   = {};
		this.data       = {};
		this.plugins    = [];
		this.logger     = logger;
		this.client     = new Discord.Client();
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

	/** Loads all data stored in JSON files.
	 * @returns {Promise<array|Error>} - a promise to an array of the objects loaded from JSON files */
	loadData() {
		this.logger.debug('Saiko#loadData', 'Loading data...');

		const promises = [];
		const defaultsPromise = loader.loadJSON(`${this.dataPath}defaults.json`);
		const dataPromise     = loader.loadJSON(`${this.dataPath}data.json`);

		promises.push(defaultsPromise);
		promises.push(dataPromise);

		defaultsPromise.then(defaults => {
			this.defaults = defaults;
		}).catch(() => {
			this.logger.error('Saiko#loadData', 'Cannot load defaults.json');
		});

		dataPromise.then(data => {
			const requiredProperties = ['token'];
			const arrayProperties    = [];
			const objectProperties   = ['channels', 'guilds'];

			requiredProperties
				.filter(property => data[property] === undefined)
				.forEach(property => {
					this.logger.panic('Saiko#loadData', `Undefined required property: ${property}`);
				});

			arrayProperties
				.forEach(property => {
					if (!Array.isArray(data[property]))
						data[property] = [];
				});

			objectProperties
				.forEach(property => {
					if (typeof data[property] !== 'object' || Array.isArray(data[property]))
						data[property] = {};
				});

			this.data = data;
		}).catch(() => {
			this.logger.error('Saiko#loadData', 'Cannot load data.json');
		});

		return new Promise((resolve, reject) => {
			Promise.all(promises).then(data => {
				this.logger.debug('Saiko#loadData', 'Data loaded');
				resolve(data);
			}).catch(error => {
				this.logger.error('Saiko#loadData', 'Cannot load data');
				reject(error);
			});
		});
	}

	/** Saves all data to JSON files.
	 * @returns {Promise<array|Error>} - a promise to an array of the serialized data saved to JSON files */
	saveData() {
		this.logger.debug('Saiko#saveData', 'Saving data...');

		const promises = [];
		const minimizedData = tools.removeEmptyObjects(tools.cloneJSON(this.data));
		const dataPromise = loader.saveJSON(`${this.dataPath}data.json`, minimizedData);

		promises.push(dataPromise);

		dataPromise.catch(() => {
			this.logger.error('Saiko#saveData', 'Cannot save data.json');
		});

		return new Promise((resolve, reject) => {
			Promise.all(promises).then(data => {
				this.logger.debug('Saiko#saveData', 'Data saved');
				resolve(data);
			}).catch(error => {
				this.logger.error('Saiko#saveData', 'Cannot save data');
				reject(error);
			});
		});
	}

	/** Returns a channel's config.
	 * @param {Discord.Channel} channel
	 * @returns {object} - channel's config */
	getChannelConfig(channel) {
		const noGuild = channel.type !== 'text';

		return Object.deepAssign({},
			noGuild || this.defaults.guilds['*'],
			noGuild || this.defaults.guilds[channel.guild.id],
			           this.defaults.channels['*'],
			           this.defaults.channels[channel.id],
			noGuild || this.data.guilds['*'],
			noGuild || this.data.guilds[channel.guild.id],
			           this.data.channels['*'],
			           this.data.channels[channel.id]
		);
	}

	/** Returns a guild's config.
	 * @param {Discord.Guild} guild
	 * @returns {object|boolean} - guild's config */
	getGuildConfig(guild) {
		return Object.deepAssign({},
			this.defaults.guilds['*'],
			this.defaults.guilds[guild.id],
			this.data.guilds['*'],
			this.data.guilds[guild.id]
		);
	}

	/** Returns a plugin's config for a given channel or a guild.
	 * @param {Plugin} plugin
	 * @param {Discord.Channel|Discord.Guild} place - the channel or guild which triggered that function
	 * @returns {object} - plugin's config */
	getPluginConfig(plugin, place) {
		const placeType =
			place instanceof Discord.Guild   ? 'guild'   :
			place instanceof Discord.Channel ? 'channel' : null;

		const placeConfig = this[`get${tools.toUpperCaseFirstChar(placeType)}Config`](place);

		return (placeConfig.plugins || {})[plugin.name] || {};
	}

	/** Loads all plugins from plug/*.js.
	 * @returns {Promise<array|Error>} - a promise to an array of loaded plugins */
	loadPlugins() {
		this.logger.debug('Saiko#loadPlugins', 'Loading plugins...');

		const pluginsDirName = 'plug';

		return new Promise((resolve, reject) => {
			loader.listDirectory(`./build/${pluginsDirName}`).then(fileNames => {
				this.plugins = fileNames
					.filter(fileName => fileName.endsWith('.js'))
					.reduce((plugins, fileName) => {
						const pluginName   = [...fileName].slice(0, -3).join('');
						const fullFileName = `./${pluginsDirName}/${fileName}`;

						this.logger.debug('Saiko#loadPlugins', `Loading plugin '${pluginName}'...`);

						try {
							const PluginClass = require(fullFileName).default; // eslint-disable-line global-require

							plugins.push(new PluginClass(this));
						} catch (error) {
							this.logger.error('Saiko#loadPlugins', `Cannot load plugin '${pluginName}'`);
							reject(error);
						}

						return plugins;
					}, []);

				this.logger.debug('Saiko#loadPlugins', 'Plugins loaded');
				resolve(this.plugins);
			}).catch(error => {
				this.logger.error('Saiko#loadPlugins', 'Cannot get the list of plugins');
				reject(error);
			});
		});
	}

	/** Enables all loaded plugins (binds all the Discord.js events).
	 * @returns {void} */
	enablePlugins() {
		this.logger.debug('Saiko#enablePlugins', 'Binding events to plugins...');

		const eventNames = ['message', 'messageDelete'];

		eventNames.forEach(eventName => {
			this.client.on(eventName, (...parameters) => {
				const [{channel}] = parameters;

				this.plugins.forEach(plugin => {
					if (this.isPluginEnabled(plugin, channel))
						plugin[`on${tools.toUpperCaseFirstChar(eventName)}`](...parameters);
				});
			});
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
	login() {
		this.logger.debug('Saiko#login', 'Logging in...');
		return new Promise((resolve, reject) => {
			this.client.login(this.data.token).then(token => {
				this.logger.debug('Saiko#login', 'Logged in');
				resolve(token);
			}).catch(error => {
				this.logger.error('Saiko#login', 'Cannot log in');
				reject(error);
			});
		});
	}
}
