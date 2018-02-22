import deepFreeze from 'deepfreeze'
import * as generators from './generators'

test 'naturalNumbers', ->
	gen1 = generators.naturalNumbers()
	gen2 = generators.naturalNumbers 123
	(expect gen1.next().value).toEqual 0
	(expect gen1.next().value).toEqual 1
	(expect gen1.next().value).toEqual 2
	(expect gen2.next().value).toEqual 123
	(expect gen2.next().value).toEqual 124
	(expect gen2.next().value).toEqual 125

test 'take', ->
	generator = ->
		index = -1
		yield index-- while on
	(expect (generators.take generator()) 5).toEqual [-1, -2, -3, -4, -5]
	(expect (generators.take generator()) 1).toEqual [-1]
	(expect (generators.take generator()) 0).toEqual []
