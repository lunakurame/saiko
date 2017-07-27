import Saiko from './saiko.js';
import * as loader from './lib/loader.js';

const saiko = new Saiko('./data');

saiko.loadData().then(result => {
	saiko.login();
});
