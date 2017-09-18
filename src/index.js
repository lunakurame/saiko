/** @module index */

import Saiko from './saiko.js';
import readline from 'readline';
import * as filesystem from './functions/filesystem.js';
import * as log from './functions/log.js';
import * as string from './functions/string.js';

const dataPath = './data/';

/** Checks the bot's config and generates it if it's missing, and starts the bot.
 * @returns {Promise<void|Error>} - an empty promise, just to use the await operator */
async function main() {
	try {
		await filesystem.checkFileReadable(`${dataPath}data.json`);
	} catch (error) {
		log.warn({
			title: {module: 'index', function: 'main'},
			text: 'Missing configuration data'
		});

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
			name: string.toUpperCaseFirstChar(process.env.npm_package_name), // eslint-disable-line no-process-env
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
			await filesystem.checkFileWritable(dataPath);
		} catch (error) {
			await filesystem.createDirectory(0o750)(dataPath);
		}

		await filesystem.serializeAndSaveJSON(data)(`${dataPath}data.json`);
		cli.write('Data saved.\n\n');
		cli.close();
	}

	const saiko = new Saiko(dataPath);

	await saiko.loadData();
	await saiko.loadPlugins();
	saiko.enablePlugins();
	await saiko.login();
}

main().catch(error => {
	log.error({
		title: {module: 'index'},
		text: 'Unexpected error',
		messages: [error]
	});
	process.exit(1); // eslint-disable-line no-process-exit
});
