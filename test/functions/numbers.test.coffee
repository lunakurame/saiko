import deepFreeze from 'deepfreeze'
import * as numbers from './numbers'

test 'isFinite', ->
	(expect numbers.isFinite 5).toEqual yes
	(expect numbers.isFinite 3.14).toEqual yes
	(expect numbers.isFinite 0).toEqual yes
	(expect numbers.isFinite -8).toEqual yes
	(expect numbers.isFinite Number 0).toEqual yes
	(expect numbers.isFinite new Number 0).toEqual no
	(expect numbers.isFinite Infinity).toEqual no
	(expect numbers.isFinite NaN).toEqual no
	(expect numbers.isFinite undefined).toEqual no
	(expect numbers.isFinite null).toEqual no
	(expect numbers.isFinite 'string').toEqual no
	(expect numbers.isFinite '5').toEqual no
	(expect numbers.isFinite []).toEqual no
	(expect numbers.isFinite {}).toEqual no
