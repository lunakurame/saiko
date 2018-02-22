import * as arrays from './arrays'

export compose = (functions...) ->
	if (arrays.length functions) is 0
		(param) -> param
	else
		(arrays.reduce (f, g) -> (params...) -> f g params...) functions

export pipe = (functions...) ->
	compose (arrays.reverse functions)...
