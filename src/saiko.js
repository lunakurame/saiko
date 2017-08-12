import Discord from 'discord.js';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

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
	 * @returns {Promise<array|Error>} - a promise to an array with all the objects loaded from JSON files */
	loadData() {
		this.logger.debug('Saiko#loadData', 'Loading data...');

		const promises = [];
		const dataPromise = loader.loadJSON(`${this.dataPath}data.json`);

		promises.push(dataPromise);

		dataPromise.then(data => {
			const requiredProperties = ['token'];
			const arrayProperties    = [];
			const objectProperties   = ['guilds'];

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
				this.plugins.forEach(plugin => {
					plugin[`on${tools.toUpperCaseFirstChar(eventName)}`](...parameters);
				});
			});
		});

		this.logger.debug('Saiko#enablePlugins', 'Events binded to plugins');
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
