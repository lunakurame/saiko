import Discord from 'discord.js'
import * as files from './functions/files'
import * as logs from './functions/logs'
import * as objects from './functions/objects'
import * as strings from './functions/strings'

export initAPI = -> (dispatch) ->
	dispatch type: 'fetch API'

	try
		client = new Discord.Client

		dispatch {type: 'inject API', client}
	catch error
		dispatch {type: 'fetching API failed', error}

export loadConfig = (fileName) -> (dispatch) ->
	dispatch type: 'fetch config'

	try
		await files.checkFileExists fileName
	catch
		logs.warn title: "Loading config", text: "Missing configuration file"

		iface = logs.createInterface()
		ask = logs.ask iface

		answer = await ask "Looks like the #{fileName} file is missing.
		You can answer a few questions to generate it now.
		\nDo you want to generate it now? [Y/n] "

		if (strings.lower answer) in ['', 'y', 'yes', 'yep', 'yeah']
			data =
				name: strings.upperFirstChar process.env.npm_package_name
				version: process.env.npm_package_version
				token: ''

			questions =
				name: "Your bot's name: (#{data.name}) "
				version: "Your bot's version: (#{data.version}) "
				token: "Your bot's token: "

			for key of data
				answer = await ask questions[key]
				if answer isnt ''
					data[key] = answer

			iface.write '\nSaving...'

			dir = strings.dirName fileName

			try
				files.checkFileWritable dir
			catch
				(files.createDirectory 0o750) dir

			await (files.saveCSON data) fileName

			iface.write '\nConfig saved.\n'
			iface.close()
		else
			iface.write '\n'
			iface.close()
			logs.error title: "Loading config", text: "Cannot continue without the config file"

			error = new Error 'Missing configuration file'
			dispatch {type: 'fetching config failed', error}

			return

	try
		file = await files.loadCSON fileName

		logs.info title: "Loading config", text: "Config loaded"
		dispatch type: 'inject config', payload: file
	catch error
		dispatch {type: 'fetching config failed', error}

export logIn = (state) -> (dispatch) ->
	client = state.api.client
	token = state.config.token

	try
		# TODO remove that workaround when upgrading discord.js
		# https://github.com/discordjs/discord.js/issues/2011
		if token is '' then throw Error "An invalid token was provided."
		await client.login token
		userTag = client.user.tag

		logs.info title: "Logging in", text: "Logged in as #{userTag}"
		dispatch {type: 'log in', userTag}
	catch error
		logs.error title: "Logging in", text: "Logging in failed: #{error.message}"
		dispatch {type: 'logging in failed', error}

export bindAPIEvent = ({client}, eventName, func) -> (dispatch) ->
	try
		client.on eventName, func

		dispatch {type: 'bind API event', eventName}
	catch error
		dispatch {type: 'binding API event failed', eventName, error}
