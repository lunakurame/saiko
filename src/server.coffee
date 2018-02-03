import * as redux from 'redux'
import thunkMiddleware from 'redux-thunk'
import {createLogger} from 'redux-logger'
import colors from 'colors/safe'
import Discord from 'discord.js'

import reducer from './reducers'
import * as actions from './actions'

getLogger = -> # TODO move this somewhere else?
	titleFormatter = (action, time, took) ->
		colors.cyan "\n[#{time}] Action \"#{action.type}\" took #{took} ms"

	transformer = (object) -> # TODO recursive object map?
		JSON.parse JSON.stringify object, ((key, value) ->
			if value instanceof Discord.Client
				'[Discord.Client]'
			else
				value
		), '\t'

	createLogger {
		colors: {}
		titleFormatter
		stateTransformer: transformer
		actionTransformer: transformer
	}

main = (configFileName) ->
	store = redux.createStore reducer, redux.applyMiddleware(
		thunkMiddleware
		getLogger()
	)

	await store.dispatch actions.initAPI()
	await store.dispatch actions.loadConfig configFileName

(main 'data/config.json').catch (error) ->
	console.error error
