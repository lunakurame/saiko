import * as arrays from './arrays'
import * as functions from './functions'

export entries = (object) ->
	Object.entries object

export json = (object) ->
	JSON.stringify object, null, '\t'

export map = (func) -> (object) ->
	functions.compose(
		arrays.reduce (sum, item) -> {sum..., item...}
		arrays.map ([key, value]) -> func key, value
	) entries object
