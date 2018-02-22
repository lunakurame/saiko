import * as arrays from './arrays'
import * as numbers from './numbers'

export naturalNumbers = (start) ->
	index = if numbers.isFinite start then start else 0
	yield index++ while on

export take = (generator) -> (number) ->
	(arrays.map (item) -> generator.next().value) arrays.create number
