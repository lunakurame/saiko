import Logger from './lib/logger.js';
import Saiko from './saiko.js';

const logger = new Logger({showDebug: true});
const saiko  = new Saiko('./data', logger);

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
