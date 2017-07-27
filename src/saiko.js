import Discord from 'discord.js';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

export default class Saiko {
	/** Creates a new Saiko object.
	 * @param {string} dataPath - path to the data folder
	 * @param {function} [onPanic] - a function called then a fatal error occurs
	 * @returns {Saiko} - a Saiko object */
	constructor(dataPath, onPanic) {
		this.data = {
			path: tools.addTrailingSlash(dataPath)
		};
		this.onPanic = onPanic || ((...errors) => {
			errors.forEach(error => console.error(error));
			process.exit(1);
		});
		/** @readonly */
		this.client = new Discord.Client();
	}

	/** Loads all data stored in JSON files.
	 * @returns {Promise<array|Error>} - resolves to an array with all the objects loaded from JSON files */
	loadData() {
		const promises = [];

		const botPromise = loader.loadJSON(this.data.path + 'bot.json');

		promises.push(botPromise);
		botPromise.then(result => {
			const fallbackProperties = [
				'name',
				'version'
			];
			const requiredProperties = [
				'token'
			];

			this.data.bot = result;

			if (fallbackProperties.some(property => this.data.bot[property] === undefined)) {
				const packagePromise = loader.loadJSON('package.json');

				promises.push(packagePromise);
				packagePromise.then(result => {
					fallbackProperties
						.filter(property => this.data.bot[property] === undefined)
						.forEach(property => {
							console.warn('bot.json: ' + property +
							' is undefined, using the default value of "' +
							result[property] + '" instead.');

							this.data.bot[property] = result[property];
						});
				}).catch(this.onPanic);
			}

			const missingProperties = requiredProperties
				.filter(property => this.data.bot[property] === undefined)
				.map(property => new Error('bot.json: ' + property + ' is undefined, fix your bot.json file.'));

			if (missingProperties.length > 0)
				this.onPanic(...missingProperties);
		}).catch(this.onPanic);

		return Promise.all(promises);
	}

	/** Logs in using the token loaded from the bot's data file.
	 * @returns {Promise<string|Error>} - resolves to the login token */
	login() {
		return this.client.login(this.data.bot.token);
	}
}
