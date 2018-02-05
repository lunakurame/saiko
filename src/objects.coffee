import * as arrays from './arrays'
import * as functions from './functions'

export entries = (object) ->
	Object.entries object

export map = (func) -> (object) ->
	functions.compose(
		arrays.reduce (sum, item) -> {sum..., item...}
		arrays.map ([key, value]) -> func key, value
	) entries object
