import {combineReducers} from 'redux'

api = (state = {}, action) ->
	switch action.type
		when 'fetch API'
			{
				state...
				fetching: yes
			}
		when 'fetching API failed'
			{
				state...
				fetching: no
			}
		when 'inject API'
			{
				state...
				fetching: no
				client: action.client
			}
		else
			state

config = (state = {}, action) ->
	switch action.type
		when 'fetch config'
			{
				state...
				fetching: yes
			}
		when 'fetching config failed'
			{
				state...
				fetching: no
			}
		when 'inject config'
			{name, version, token} = action.payload
			{
				state...
				fetching: no
				name,
				version,
				token
			}
		else
			state

export default reducer = combineReducers {
	api
	config
}
