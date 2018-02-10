import {reverse as esrever} from 'esrever'
import * as arrays from './arrays'

export chars = (text) ->
	[text...]

export dirName = (fileName) ->
	steps = (split '/') (replace /\/$/, '') fileName

	if (arrays.length steps) < 3
		if steps[0] is ''
			'/'
		else
			'.'
	else
		(arrays.join '/') steps[...-1]

export graphemes = (text) ->
	normal = chars text
	reversed = arrays.reverse chars reverse text
	array = []
	firstCompositionChar = null
	index = 0

	for char in normal
		if firstCompositionChar?
			array.push array.pop() + char
			if reversed[index] is firstCompositionChar
				firstCompositionChar = null
		else
			array.push char
			if reversed[index] isnt char
				firstCompositionChar = char
		++index
	array

export count = (text) ->
	arrays.length graphemes text

export lower = (text) ->
	text.toLowerCase()

export replace = (pattern, replacement) -> (text) ->
	text.replace pattern, replacement

export reverse = (text) ->
	esrever text

export length = (text) ->
	arrays.length chars text

export size = (text) ->
	text.length

export split = (separator, limit) -> (text) ->
	if separator is ''
		(graphemes text)[...limit]
	else
		text.split separator, limit

export upper = (text) ->
	text.toUpperCase()

export upperFirstChar = (text) ->
	(upper [text...][0] ? '') + ((arrays.join '') [text...][1...])
