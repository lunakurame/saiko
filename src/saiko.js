import Discord from 'discord.js';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

export default class Saiko {
	/** Creates a new Saiko object.
	 * @param {string} dataPath - path to the data folder
	 * @param {Logger} logger - a Logger object used to log everything
	 * @returns {Saiko} - a Saiko object */
	constructor(dataPath, logger) {
		this.data = {
			path: tools.addTrailingSlash(dataPath)
		};
		this.logger = logger;
		this.client = new Discord.Client();
	}

	/** Loads all data stored in JSON files.
	 * @returns {Promise<array|Error>} - resolves to an array with all the objects loaded from JSON files */
	loadData() {
		this.logger.debug('Saiko#loadData', 'Loading data...');

		const promises = [];
		const botPromise = loader.loadJSON(this.data.path + 'bot.json');

		promises.push(botPromise);

		botPromise.then(botData => {
			const fallbackProperties = ['name', 'version'];
			const requiredProperties = ['token'];

			fallbackProperties
				.filter(property => botData[property] === undefined)
				.forEach(property => {
					const value = process.env[`npm_package_${property}`];

					this.logger.warn('Saiko#loadData', `Undefined property: ${property}, using the default value '${value}' [bot.json]`);
					botData[property] = value;
				});

			requiredProperties
				.filter(property => botData[property] === undefined)
				.map(property => this.logger.panic('Saiko#loadData', `Undefined required property: ${property} [bot.json]`));

			this.data.bot = botData;
		}).catch(error => {
			this.logger.error('Saiko#loadData', 'Cannot load bot data');
		});

		return new Promise((resolve, reject) => {
			Promise.all(promises).then(data => {
				this.logger.debug('Saiko#loadData', 'Loaded data');
				resolve(data);
			}).catch(error => {
				this.logger.error('Saiko#loadData', 'Cannot load data');
				reject(error);
			})
		});
	}

	/** Logs in using the token loaded from the bot's data file.
	 * @returns {Promise<string|Error>} - resolves to the login token */
	login() {
		this.logger.debug('Saiko#login', 'Logging in...');
		return new Promise((resolve, reject) => {
			this.client.login(this.data.bot.token).then(token => {
				this.logger.debug('Saiko#login', 'Logged in');
				resolve(token);
			}).catch(error => {
				this.logger.error('Saiko#login', 'Cannot log in');
				reject(error);
			})
		});
	}
}
