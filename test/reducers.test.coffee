import deepFreeze from 'deepfreeze'
import reducer from './reducers'

test 'api', ->
	(expect (reducer {}, type: 'fetch API').api).toEqual fetching: yes
	(expect (reducer {}, type: 'fetching API failed').api).toEqual fetching: no
	(expect (reducer {},
		type: 'inject API'
		client: null
	).api).toEqual
		fetching: no
		client: null

test 'config', ->
	(expect (reducer {}, type: 'fetch config').config).toEqual fetching: yes
	(expect (reducer {}, type: 'fetching config failed').config).toEqual fetching: no
	(expect (reducer {},
		type: 'inject config'
		payload:
			name: 'Test'
			version: '0.0.0'
			token: 'TOKEN'
	).config).toEqual
		fetching: no
		name: 'Test'
		version: '0.0.0'
		token: 'TOKEN'
