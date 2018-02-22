import deepFreeze from 'deepfreeze'
import * as functions from './functions'

inc = (n) -> n + 1
dec = (n) -> n - 1
double = (n) -> n * 2
params = [inc, double, dec]

deepFreeze inc, dec, double, params

test 'compose', ->
	(expect typeof (functions.compose inc, double, dec)).toEqual 'function'
	(expect (functions.compose inc, double, dec) 5).toEqual 9
	(expect (functions.compose params...) 5).toEqual 9
	(expect (functions.compose inc) 5).toEqual 6
	(expect functions.compose() 5).toEqual 5

test 'pipe', ->
	(expect typeof (functions.pipe inc, double, dec)).toEqual 'function'
	(expect (functions.pipe inc, double, dec) 5).toEqual 11
	(expect (functions.pipe params...) 5).toEqual 11
	(expect (functions.pipe inc) 5).toEqual 6
	(expect functions.pipe() 5).toEqual 5
