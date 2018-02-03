import deepFreeze from 'deepfreeze'
import fs from 'fs'
import * as files from './files'

file = './test/test files/object.json'
dir = './test/test files'
wrong = './test/test files/non-existent'
fileData = '''
{
	"key1": "value1",
	"key2": 0,
	"key3": null,
	"key5": [0, 1, 2],
	"key6": {
		"subkey1": 1,
		"subkey2": 2
	},
	"key7": 0
}

'''
fileJSON = JSON.parse fileData

deepFreeze file, dir, wrong, fileData, fileJSON

test 'loadJSON', ->
	expect.assertions 3
	await (expect files.loadJSON file).resolves.toEqual fileJSON
	await (expect files.loadJSON dir).rejects.toThrow /illegal operation on a directory/
	await (expect files.loadJSON wrong).rejects.toThrow /no such file/
