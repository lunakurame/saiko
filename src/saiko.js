/** @module saiko */

import './extension/Object.deepAssign.js';
import Discord from 'discord.js';
import * as discordTools from './lib/discord-tools.js';
import * as loader from './lib/loader.js';
import * as log from './modules/log.js';
import * as tools from './lib/tools.js';

/** Saiko's main class. */
export default class Saiko {
	/** Creates a new Saiko object.
	 * @param {string} dataPath - path to the data folder
	 * @returns {Saiko} - a Saiko object */
	constructor(dataPath) {
		this.libName    = process.env.npm_package_name; // eslint-disable-line no-process-env
		this.libVersion = process.env.npm_package_version; // eslint-disable-line no-process-env
		this.dataPath   = tools.addTrailingSlash(dataPath);
		this.client     = new Discord.Client;
		this.responses  = new Discord.Collection;
		this.data       = {};
		this.plugins    = [];
	}

	/** Returns bot's name. If it's not specified, returns the library's name instead.
	 * @returns {string} - bot's name */
	get name() {
		return this.data.name || this.libName;
	}

	/** Sets bot's name.
	 * @param {string} value - bot's new name
	 * @returns {void} */
	set name(value) {
		this.data.name = value;
	}

	/** Returns bot's version. If it's not specified, returns the library's version instead.
	 * @returns {string} - bot's version */
	get version() {
		return this.data.version || this.libVersion;
	}

	/** Sets bot's version.
	 * @param {string} value - bot's new version
	 * @returns {void} */
	set version(value) {
		this.data.version = value;
	}

	/** Loads the data.
	 * @returns {Promise<object|Error>} - a promise to the data object */
	async loadData() {
		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'loadData'},
			text: 'Loading data...'
		});

		const data = await loader.loadJSON(`${this.dataPath}data.json`);

		const requiredProperties = ['token'];
		const arrayProperties    = [];
		const objectProperties   = ['defaults', 'guilds', 'channels'];

		const missingRequiredProperties = requiredProperties
			.filter(property => data[property] === undefined);

		for (const property of missingRequiredProperties)
			log.error({
				title: {module: 'Saiko', separator: '#', function: 'loadData'},
				text: `Undefined required property: ${property}`
			});

		if (missingRequiredProperties.length > 0)
			throw new Error('Some required properties are undefined');

		for (const property of arrayProperties)
			if (!Array.isArray(data[property]))
				data[property] = [];

		for (const property of objectProperties)
			if (typeof data[property] !== 'object' || Array.isArray(data[property]))
				data[property] = {};

		this.data = data;

		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'loadData'},
			text: 'Data loaded'
		});
		return data;
	}

	/** Saves the data.
	 * @returns {Promise<object|Error>} - a promise to the serialized data */
	async saveData() {
		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'saveData'},
			text: 'Saving data...'
		});

		this.clearData();
		this.updateGuildNames();
		this.updateChannelNames();

		const serializedData = await loader.saveJSON(`${this.dataPath}data.json`, this.data);

		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'saveData'},
			text: 'Data saved'
		});
		return serializedData;
	}

	/** Clears the data object properies from empty objects.
	 * @returns {void} */
	clearData() {
		for (const property of Object.values(this.data))
			if (typeof property === 'object' && property !== null)
				tools.removeEmptyObjects(property);
	}

	/** Updates channels' name, type and, if the channel has a parent guild,
	 *  the guild's id and name in Saiko's data. If that metadata is the only
	 *  data specified in the channel's config, the config will be removed.
	 * @returns {void} */
	updateChannelNames() {
		for (const id of Object.keys(this.data.channels)) {
			const channel       = this.client.channels.get(id);
			const channelConfig = this.data.channels[id];

			const isConfigEmpty = config => Object.keys(config)
				.filter(key => !['name', 'type', 'guild'].includes(key))
				.length === 0;

			if (channel === null || isConfigEmpty(channelConfig)) {
				delete this.data.channels[id];
				continue;
			}

			channelConfig.name = channel.name;
			channelConfig.type = channel.type;

			if (channel.type === 'text')
				channelConfig.guild = {
					id: channel.guild.id,
					name: channel.guild.name
				};
		}
	}

	/** Updates guilds' name in Saiko's data. If that metadata is the only
	 *  data specified in the guild's config, the config will be removed.
	 * @returns {void} */
	updateGuildNames() {
		for (const id of Object.keys(this.data.guilds)) {
			const guild       = this.client.guilds.get(id);
			const guildConfig = this.data.guilds[id];

			const isConfigEmpty = config => Object.keys(config)
				.filter(key => key !== 'name')
				.length === 0;

			if (guild === null || isConfigEmpty(guildConfig)) {
				delete this.data.guilds[id];
				continue;
			}

			guildConfig.name = guild.name;
		}
	}

	/** Returns a channel's config.
	 * @param {Discord.Channel} channel
	 * @returns {object} - channel's config */
	getChannelConfig(channel) {
		const noGuild = channel.type !== 'text';

		return Object.deepAssign({},
			           this.data.defaults,
			noGuild || this.data.guilds[channel.guild.id],
			           this.data.channels[channel.id]
		);
	}

	/** Returns a guild's config.
	 * @param {Discord.Guild} guild
	 * @returns {object|boolean} - guild's config */
	getGuildConfig(guild) {
		return Object.deepAssign({},
			this.data.defaults,
			this.data.guilds[guild.id]
		);
	}

	/** Returns a plugin's config for a given channel or a guild.
	 * @param {Plugin} plugin
	 * @param {Place} place - the place which triggered that function
	 * @returns {object} - plugin's config */
	getPluginConfig(plugin, place) {
		const placeType = discordTools.getPlaceType(place);

		const placeConfig =
			placeType === 'guild'                                ? this.getGuildConfig(place)   :
			['text', 'dm', 'group', 'voice'].includes(placeType) ? this.getChannelConfig(place) : {};

		return (placeConfig.plugins || {})[plugin.name] || {};
	}

	/** Loads all plugins from plug/*.js.
	 * @returns {Promise<array|Error>} - a promise to an array of loaded plugins */
	async loadPlugins() {
		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'loadPlugins'},
			text: 'Loading plugins...'
		});

		const pluginsDirName = 'plug';
		const directory = await loader.listDirectory(`./build/${pluginsDirName}`);
		const fileNames = directory.filter(fileName => fileName.endsWith('.js'));
		const plugins = [];

		for (const fileName of fileNames) {
			const pluginName   = [...fileName].slice(0, -3).join('');
			const fullFileName = `./${pluginsDirName}/${fileName}`;

			log.debug({
				title: {module: 'Saiko', separator: '#', function: 'loadPlugins'},
				text: `Loading plugin "${pluginName}"...`
			});

			try {
				const PluginClass = require(fullFileName).default; // eslint-disable-line global-require

				plugins.push(new PluginClass(this));
			} catch (error) {
				log.error({
					title: {module: 'Saiko', separator: '#', function: 'loadPlugins'},
					text: `Cannot load plugin "${pluginName}"`
				});
				throw error;
			}
		}

		this.plugins = plugins;

		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'loadPlugins'},
			text: 'Plugins loaded'
		});
		return plugins;
	}

	/** Enables all loaded plugins (binds all the Discord.js events).
	 * @returns {void} */
	enablePlugins() {
		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
			text: 'Binding events to plugins...'
		});

		const handleEvent = async (eventName, ...parameters) => {
			const [message] = parameters;
			const {channel} = message;
			let response = null;

			for (const plugin of this.plugins)
				if (this.isPluginEnabled(plugin, channel)) {
					const pluginResponse = plugin[`on${tools.toUpperCaseFirstChar(eventName)}`](...parameters);

					if (!response && pluginResponse)
						response = pluginResponse;
				}

			/* eslint-disable no-await-in-loop */
			const sentMessages = this.responses.get(message.id) || [];

			// if the original trigger post got removed and Saiko doesn't wanna edit her response,
			// or if it got edited and it doesn't trigger any response now,
			// remove her old response
			if ((eventName === 'messageDelete' && !(response || {}).edits) ||
			    (eventName === 'messageUpdate' && !response))
				try {
					while (sentMessages.length > 0) {
						await sentMessages[0].delete();
						sentMessages.shift();
					}
				} catch (error) {
					log.error({
						title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
						text: 'Cannot delete a message',
						messages: [error]
					});
				}

			const doesPostHaveFiles = post => post.some(param =>
				typeof param === 'object' &&
				param &&
				((Array.isArray(param.files) && param.files.length > 0) || param.file)
			);
			const doesMessageHaveFiles = message => message.attachments.size > 0;

			if (response) {
				// process edits (this might involve editing, deleting and sending new posts)
				if (response.edits.length > 0)
					// if the number of edits is greater than the number of already sent posts,
					// wipe everything and post the edits as new posts coz there is no way to
					// edit the old ones anyway
					// also remove and resend if there are some files sent / about to be send
					// because discord doesn't allow editing attachments
					if (response.edits.length > sentMessages.length ||
					    sentMessages.some(doesMessageHaveFiles) ||
					    response.edits.some(doesPostHaveFiles)) {
						try {
							while (sentMessages.length > 0) {
								await sentMessages[0].delete();
								sentMessages.shift();
							}
						} catch (error) {
							log.error({
								title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
								text: 'Cannot delete a message',
								messages: [error]
							});
						}

						for (const post of response.edits)
							response.posts.push(post);
					// remove extra posts if there are any and edit the remaining ones
					} else {
						try {
							while (sentMessages.length > response.edits.length) {
								await sentMessages[sentMessages.length - 1].delete();
								sentMessages.pop();
							}
						} catch (error) {
							log.error({
								title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
								text: 'Cannot delete a message',
								messages: [error]
							});
						}

						// remove old embeds
						for (const post of response.edits)
							if (post.length === 1 && typeof post[0] === 'string')
								post.push({
									embed: null
								});

						try {
							for (const [index, post] of response.edits.entries()) {
								const sentMessage = await sentMessages[index].edit(...post);
								sentMessages[index] = sentMessage;
							}
						} catch (error) {
							log.error({
								title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
								text: 'Cannot edit a message',
								messages: [error]
							});
						}
					}

				// send posts
				for (const post of response.posts)
					try {
						const sentMessage = await channel.send(...post);
						sentMessages.push(sentMessage);
					} catch (error) {
						log.error({
							title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
							text: 'Cannot send a message',
							messages: [error]
						});
					}

				this.responses.set(message.id, sentMessages);
			}
			/* eslint-enable no-await-in-loop */
		};

		const eventNames = ['message', 'messageDelete', 'messageUpdate'];

		for (const eventName of eventNames)
			this.client.on(eventName, (...paramaters) => handleEvent(eventName, ...paramaters));

		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'enablePlugins'},
			text: 'Events binded to plugins'
		});
	}

	/** Checks if a plugin is enabled on a given channel or a guild.
	 * @param {Plugin} plugin
	 * @param {Discord.Channel|Discord.Guild} place - the channel or guild which triggered that function
	 * @returns {boolean} - true if the plugin is enabled, false otherwise */
	isPluginEnabled(plugin, place) {
		const pluginConfig = this.getPluginConfig(plugin, place);

		return pluginConfig.enabled === true;
	}

	/** Logs in using the token loaded from the bot's data file.
	 * @returns {Promise<string|Error>} - a promise to the login token */
	async login() {
		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'login'},
			text: 'Logging in...'
		});

		if (this.data.token === '')
			throw new Error('Token is not defined');

		const token = await this.client.login(this.data.token);

		log.debug({
			title: {module: 'Saiko', separator: '#', function: 'login'},
			text: 'Logged in'
		});
		return token;
	}
}
