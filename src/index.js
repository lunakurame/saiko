import Logger from './lib/logger.js';
import Saiko from './saiko.js';
import * as loader from './lib/loader.js';

const logger = new Logger({useConsole: true, showDebug: true});
const saiko  = new Saiko('./data', logger);

saiko.loadData().then(data => {
	saiko.login().then(token => {
		console.log('OK');
	}).catch(error => {
		logger.panic('Index', 'Cannot log in', error)
	});
}).catch(error => {
	logger.panic('Index', 'Cannot load data', error)
});
