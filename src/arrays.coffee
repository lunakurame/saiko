export create = (number) ->
	[(new Array number)...]

export fill = (content) -> (array) ->
	(map -> content) array

export filter = (func) -> (array) ->
	array.filter func

export includes = (item) -> (array) ->
	item in array

export length = (array) ->
	array.length

export map = (func) -> (array) ->
	array.map func

export reduce = (func, initial) -> (array) ->
	clone = [array...]
	if initial?
		clone.reduce func, initial
	else
		clone.reduce func

export reverse = (array) ->
	[array...].reverse()
