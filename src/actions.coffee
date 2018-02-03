import Discord from 'discord.js'
import * as files from './files'

export initAPI = -> (dispatch) ->
	dispatch type: 'fetch API'

	try
		client = new Discord.Client

		dispatch {
			type: 'inject API'
			client
		}
	catch error
		dispatch {
			type: 'fetching API failed'
			error
		}

export loadConfig = (fileName) -> (dispatch) ->
	dispatch type: 'fetch config'

	try
		file = await files.loadJSON fileName

		dispatch {
			type: 'inject config'
			payload: file
		}
	catch error
		dispatch {
			type: 'fetching config failed'
			error
		}
