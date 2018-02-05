import deepFreeze from 'deepfreeze'
import * as arrays from './arrays'

test 'create', ->
	(expect arrays.create 0).toEqual []
	(expect arrays.create 1).toEqual [undefined]
	(expect arrays.create 2).toEqual [undefined, undefined]
	(expect arrays.create 3).toEqual [undefined, undefined, undefined]
	(expect 0 of [,]).toEqual no
	(expect 0 of [undefined]).toEqual yes
	(expect 0 of arrays.create 1).toEqual yes
	(expect 3 of arrays.create 4).toEqual yes
	(expect 4 of arrays.create 4).toEqual no

test 'fill', ->
	array = [0, 1, 2, 3]
	deepFreeze array
	(expect (arrays.fill 0) array).toEqual [0, 0, 0, 0]

test 'filter', ->
	array = [0, 1, 2, 3, 4, 5]
	deepFreeze array
	(expect (arrays.filter (n) -> n % 2 is 0) array).toEqual [0, 2, 4]
	(expect (arrays.filter (n) -> n % 2 isnt 0) array).toEqual [1, 3, 5]
	(expect (arrays.filter -> yes) array).toEqual array
	(expect (arrays.filter -> yes) array).not.toBe array
	(expect (arrays.filter -> no) array).toEqual []

test 'includes', ->
	array = [0, 1, 2, 3]
	deepFreeze array
	(expect (arrays.includes 3) array).toEqual yes
	(expect (arrays.includes 4) array).toEqual no
	(expect (arrays.includes undefined) []).toEqual no
	(expect (arrays.includes undefined) [undefined]).toEqual yes
	(expect (arrays.includes undefined) array).toEqual no
	(expect (arrays.includes null) []).toEqual no
	(expect (arrays.includes null) [null]).toEqual yes
	(expect (arrays.includes null) array).toEqual no

test 'length', ->
	array = [0, 1, 2, 3]
	deepFreeze array
	(expect arrays.length array).toEqual 4
	(expect arrays.length []).toEqual 0
	(expect arrays.length [,,,]).toEqual 3

test 'map', ->
	array = [0, 1, 2, 3]
	deepFreeze array
	(expect (arrays.map (n) -> n * 2) array).toEqual [0, 2, 4, 6]
	(expect (arrays.map (n) -> n) array).toEqual array
	(expect (arrays.map -> yes) array).toEqual [yes, yes, yes, yes]
	(expect (arrays.map -> no) array).toEqual [no, no, no, no]

test 'reduce', ->
	array = [1, 2, 3]
	deepFreeze array
	# first element
	(expect (arrays.reduce (accu) -> accu) array).toEqual 1
	# last element
	(expect (arrays.reduce (accu, value) -> value) array).toEqual 3
	# last index
	(expect (arrays.reduce (accu, value, index) -> index) array).toEqual 2
	# passed array
	(expect (arrays.reduce (accu, value, index, array) -> array) array).toEqual array
	# initial element
	(expect (arrays.reduce ((accu) -> accu), 8) array).toEqual 8
	# sum
	(expect (arrays.reduce (accu, value) -> accu + value) array).toEqual 6
	# constant + immutable array
	(expect (arrays.reduce (accu, value, index, array) -> array[index] = 7) array).toEqual 7
	# sum + initial value
	(expect (arrays.reduce ((accu, value) -> accu + value), 3) array).toEqual 9

test 'reverse', ->
	array = [0, 1, 2, 3]
	deepFreeze array
	(expect arrays.reverse array).toEqual [3, 2, 1, 0]
	(expect arrays.reverse [4]).toEqual [4]
	(expect arrays.reverse []).toEqual []
