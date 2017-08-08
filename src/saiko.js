import Discord from 'discord.js';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

export default class Saiko {
	/** Creates a new Saiko object.
	 * @param {string} dataPath - path to the data folder
	 * @param {Logger} logger - a Logger object used to log everything
	 * @returns {Saiko} - a Saiko object */
	constructor(dataPath, logger) {
		this.data    = {
			path: tools.addTrailingSlash(dataPath)
		};
		this.plugins = [];
		this.logger  = logger;
		this.client  = new Discord.Client();
	}

	/** Loads all data stored in JSON files.
	 * @returns {Promise<array|Error>} - a promise to an array with all the objects loaded from JSON files */
	loadData() {
		this.logger.debug('Saiko#loadData', 'Loading data...');

		const promises = [];
		const botPromise = loader.loadJSON(`${this.data.path}bot.json`);

		promises.push(botPromise);

		botPromise.then(botData => {
			const fallbackProperties = ['name', 'version'];
			const requiredProperties = ['token'];

			fallbackProperties
				.filter(property => botData[property] === undefined)
				.forEach(property => {
					const value = process.env[`npm_package_${property}`]; // eslint-disable-line no-process-env

					this.logger.warn('Saiko#loadData', `Undefined property: ${property}, using the default value '${value}' [bot.json]`);
					botData[property] = value;
				});

			requiredProperties
				.filter(property => botData[property] === undefined)
				.map(property => this.logger.panic('Saiko#loadData', `Undefined required property: ${property} [bot.json]`));

			this.data.bot = botData;
		}).catch(() => {
			this.logger.error('Saiko#loadData', 'Cannot load bot data');
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
					plugin[`on${tools.capitalizeFirstCharacter(eventName)}`](...parameters);
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
			this.client.login(this.data.bot.token).then(token => {
				this.logger.debug('Saiko#login', 'Logged in');
				resolve(token);
			}).catch(error => {
				this.logger.error('Saiko#login', 'Cannot log in');
				reject(error);
			});
		});
	}
}
