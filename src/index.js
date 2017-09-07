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

const dataFileAccess     = loader.isFileReadable(`${dataPath}data.json`);
const defaultsFileAccess = loader.isFileReadable(`${dataPath}defaults.json`);

Promise.all([dataFileAccess, defaultsFileAccess]).then(() => {
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

	const generateData = () => new Promise((resolve, reject) => {
		logger.warn('Index', 'Missing configuration data');

		cli.question(`Looks like the ${dataPath}data.json file is missing. ` +
		             `You can answer a few questions to generate it now.\n` +
		             `Do you want to generate it now? [Y/n] `, answer => {
			if (['', 'y', 'yes', 'yep', 'yeah'].includes(answer.toLowerCase())) {
				const data = {
					name: tools.toUpperCaseFirstChar(process.env.npm_package_name), // eslint-disable-line no-process-env
					version: process.env.npm_package_version, // eslint-disable-line no-process-env
					token: '',
					channels: {},
					guilds: {}
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
	});

	const generateDefaults = () => new Promise((resolve, reject) => {
		logger.warn('Index', 'Missing configuration data');

		cli.question(`Looks like the ${dataPath}defaults.json file is missing.\n` +
		             `Do you want to generate it now? [Y/n] `, answer => {
			if (['', 'y', 'yes', 'yep', 'yeah'].includes(answer.toLowerCase())) {
				const defaults = {
					channels: {
						'*': {
							plugins: {
								admin: {
									enabled: true
								}
							}
						}
					},
					guilds: {
						'*': {
							plugins: {
								admin: {
									enabled: true
								}
							}
						}
					}
				};

				cli.write('\nSaving defaults...\n');

				createDataDir().then(() => {
					loader.saveJSON(`${dataPath}defaults.json`, defaults).then(() => {
						cli.write('Defaults saved.\n\n');
						resolve(true);
					}).catch(() => {
						cli.write('\n');
						reject(new Error('Cannot save the defaults.json file'));
					});
				}).catch(error => {
					cli.write('\n');
					reject(error);
				});
			} else {
				cli.write('Aborting\n\n');
				reject(new Error('Cannot start without the defaults.json file'));
			}
		});
	});

	dataFileAccess.then(() => {
		// data is ok, defaults must be missing
		generateDefaults().then(() => {
			// defaults generated
			cli.close();
			loadSaiko();
		}).catch(error => {
			logger.panic('Index', error.message);
		});
	}).catch(() => {
		// data is missing
		generateData().then(() => {
			// data generated, are defaults missing too?
			defaultsFileAccess.then(() => {
				// defaults ok
				cli.close();
				loadSaiko();
			}).catch(() => {
				// defaults are missing
				generateDefaults().then(() => {
					// defaults generated
					cli.close();
					loadSaiko();
				}).catch(error => {
					logger.panic('Index', error.message);
				});
			});
		}).catch(error => {
			logger.panic('Index', error.message);
		});
	});
});
