import Logger from './lib/logger.js';
import Saiko from './saiko.js';
import readline from 'readline';
import * as loader from './lib/loader.js';
import * as tools from './lib/tools.js';

/** Checks the bot's config and generates it if it's missing, and starts the bot.
 * @returns {Promise<void|Error>} - an empty promise, just to use the await operator */
async function main() {
	const dataPath = './data/';
	const logger = new Logger({showDebug: true});

	try {
		await loader.isFileReadable(`${dataPath}data.json`);
	} catch (error) {
		logger.warn('Index', 'Missing configuration data');

		const cli = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		/** Asks the user a questions and waits for the answer.
		 * @param {string} question
		 * @returns {Promise<string>} - user's answer */
		async function ask(question) {
			const answer = await new Promise(resolve => {
				cli.question(question, answer => {
					resolve(answer);
				});
			});

			return answer;
		}

		try {
			const answer = await ask(
				`Looks like the ${dataPath}data.json file is missing. ` +
				`You can answer a few questions to generate it now.\n` +
				`Do you want to generate it now? [Y/n] `
			);

			if (!['', 'y', 'yes', 'yep', 'yeah'].includes(answer.toLowerCase())) {
				cli.write('Aborting\n\n');
				cli.close();
				throw new Error('Cannot start without the data.json file');
			}

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

			const questions = {
				name: `Your bot's name: (${data.name}) `,
				version: `Your bot's version: (${data.version}) `,
				token: `Your bot's token: `
			};

			for (const key of Object.keys(questions)) {
				const answer = await ask(questions[key]); // eslint-disable-line no-await-in-loop
				if (answer !== '')
					data[key] = answer;
			}

			cli.write('\nSaving data...\n');

			try {
				await loader.isFileWritable(dataPath);
			} catch (error) {
				await loader.createDirectory(dataPath, 0o750);
			}

			await loader.saveJSON(`${dataPath}data.json`, data);
			cli.write('Data saved.\n\n');
			cli.close();
		} catch (error) {
			logger.panic('Index', error.message);
		}
	}

	const saiko = new Saiko(dataPath, logger);

	try {
		await saiko.loadData();

		try {
			await saiko.loadPlugins();
			saiko.enablePlugins();

			try {
				await saiko.login();
			} catch (error) {
				logger.panic('Index', 'Cannot log in', error);
			}
		} catch (error) {
			logger.panic('Index', 'Cannot load plugins', error);
		}
	} catch (error) {
		logger.panic('Index', 'Cannot load data', error);
	}
}

main();
