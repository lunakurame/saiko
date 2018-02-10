import Discord from 'discord.js'
import * as files from './files'
import * as logs from './logs'
import * as objects from './objects'
import * as strings from './strings'

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

			await (files.serializeAndSaveJSON data) fileName

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
		file = await files.loadJSON fileName

		dispatch type: 'inject config', payload: file
	catch error
		dispatch {type: 'fetching config failed', error}
