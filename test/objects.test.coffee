import deepFreeze from 'deepfreeze'
import * as objects from './objects'

object =
	key1: 'value1'
	key2: 0
	key3: null
	key4: undefined
	key5: [0, 1, 2]
	key6:
		subkey1: 1
		subkey2: 2
	key7: 0
entries = [
	['key1', 'value1']
	['key2', 0]
	['key3', null]
	['key4', undefined]
	['key5', [0, 1, 2]]
	['key6',
		subkey1: 1
		subkey2: 2
	]
	['key7', 0]
]
json = '''
{
	"key1": "value1",
	"key2": 0,
	"key3": null,
	"key5": [
		0,
		1,
		2
	],
	"key6": {
		"subkey1": 1,
		"subkey2": 2
	},
	"key7": 0
}
'''

deepFreeze object, entries, json

test 'entries', ->
	(expect objects.entries object).toEqual entries
	(expect objects.entries {}).toEqual []

test 'map', ->
	(expect (objects.map (key, value) -> [key]: value) object).toEqual object
	(expect (objects.map (key, value) ->
		if key is 'key4'
			[key]: '[TEST]'
		else
			[key]: value
	) object).toEqual {object..., key4: '[TEST]'}
	(expect (objects.map (key, value) ->
		if value is 0
			[key]: 'zero'
		else
			[key]: value
	) object).toEqual {object..., key2: 'zero', key7: 'zero'}
	(expect (objects.map -> test: 0) object).toEqual test: 0
	(expect (objects.map -> test: undefined) object).toEqual test: undefined
	(expect (objects.map -> {}) object).toEqual {}

test 'stringify', ->
	(expect objects.stringify object).toEqual json
	(expect objects.stringify {}).toEqual '{}'
