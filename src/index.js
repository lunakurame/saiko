import Logger from './lib/logger.js';
import Saiko from './saiko.js';
import readline from 'readline';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

const dataPath = './data/';
const logger = new Logger({showDebug: true});

/** Loads Saiko when all the config files are in place.
 * @returns {void} */
function loadSaiko() {
	const saiko  = new Saiko(dataPath, logger);

	saiko.loadData().then(() => {
		saiko.loadPlugins().then(() => {
			saiko.enablePlugins();

			saiko.login().then(() => {
				// logged in
			}).catch(error => {
				logger.panic('Index', 'Cannot log in', error);
			});
		}).catch(error => {
			logger.panic('Index', 'Cannot load plugins', error);
		});
	}).catch(error => {
		logger.panic('Index', 'Cannot load data', error);
	});
}

loader.isFileReadable(`${dataPath}data.json`).then(() => {
	loadSaiko();
}).catch(() => {
	const cli = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const createDataDir = () => new Promise((resolve, reject) => {
		loader.isFileWritable(`${dataPath}`).then(() => {
			resolve(true);
		}).catch(() => {
			loader.createDirectory(dataPath, 0o750).then(() => {
				resolve(true);
			}).catch(error => {
				reject(new Error('Index', `Cannot create a new directory "${dataPath}"`, error));
			});
		});
	});

	new Promise((resolve, reject) => {
		logger.warn('Index', 'Missing configuration data');

		cli.question(`Looks like the ${dataPath}data.json file is missing. ` +
		             `You can answer a few questions to generate it now.\n` +
		             `Do you want to generate it now? [Y/n] `, answer => {
			if (['', 'y', 'yes', 'yep', 'yeah'].includes(answer.toLowerCase())) {
				const data = {
					dataVersion: '0.1.0',
					name: tools.toUpperCaseFirstChar(process.env.npm_package_name), // eslint-disable-line no-process-env
					version: process.env.npm_package_version, // eslint-disable-line no-process-env
					token: '',
					defaults: {
						plugins: {
							admin: {
								enabled: true
							}
						}
					},
					guilds: {},
					channels: {}
				};

				cli.question(`Your bot's name: (${data.name}) `, answer => {
					if (answer !== '')
						data.name = answer;

					cli.question(`Your bot's version: (${data.version}) `, answer => {
						if (answer !== '')
							data.version = answer;

						cli.question(`Your bot's token: `, answer => {
							if (answer !== '')
								data.token = answer;

							cli.write('\nSaving data...\n');

							createDataDir().then(() => {
								loader.saveJSON(`${dataPath}data.json`, data).then(() => {
									cli.write('Data saved.\n\n');
									resolve(true);
								}).catch(() => {
									cli.write('\n');
									reject(new Error('Cannot save the data.json file'));
								});
							}).catch(error => {
								cli.write('\n');
								reject(error);
							});
						});
					});
				});
			} else {
				cli.write('Aborting\n\n');
				reject(new Error('Cannot start without the data.json file'));
			}
		});
	}).then(() => {
		cli.close();
		loadSaiko();
	}).catch(error => {
		logger.panic('Index', error.message);
	});
});
