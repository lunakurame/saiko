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
fileBase64 = 'ewoJImtleTEiOiAidmFsdWUxIiwKCSJrZXkyIjogMCwKCSJrZXkzIjogbnVsbCw' +
'KCSJrZXk1IjogWzAsIDEsIDJdLAoJImtleTYiOiB7CgkJInN1YmtleTEiOiAxLAoJCSJzdWJrZXk' +
'yIjogMgoJfSwKCSJrZXk3IjogMAp9Cg=='
fileJSON = JSON.parse fileData

deepFreeze file, dir, wrong, fileData, fileJSON

# TODO could use some better tests but git doesn't accept chmod 000'd files
# TODO test the rest of the functions

test 'checkFileAccess', ->
	expect.assertions 3
	await (expect (files.checkFileAccess fs.constants.F_OK) file).resolves.toBeUndefined()
	await (expect (files.checkFileAccess fs.constants.F_OK) dir).resolves.toBeUndefined()
	await (expect (files.checkFileAccess fs.constants.F_OK) wrong).rejects.toThrow /no such file/

test 'checkFileExists', ->
	expect.assertions 3
	await (expect files.checkFileExists file).resolves.toBeUndefined()
	await (expect files.checkFileExists dir).resolves.toBeUndefined()
	await (expect files.checkFileExists wrong).rejects.toThrow /no such file/

test 'checkFileReadable', ->
	expect.assertions 3
	await (expect files.checkFileReadable file).resolves.toBeUndefined()
	await (expect files.checkFileReadable dir).resolves.toBeUndefined()
	await (expect files.checkFileReadable wrong).rejects.toThrow /no such file/

test 'checkFileWritable', ->
	expect.assertions 3
	await (expect files.checkFileWritable file).resolves.toBeUndefined()
	await (expect files.checkFileWritable dir).resolves.toBeUndefined()
	await (expect files.checkFileWritable wrong).rejects.toThrow /no such file/

test 'checkFileExecutable', ->
	expect.assertions 3
	await (expect files.checkFileExecutable file).rejects.toThrow /permission denied/
	await (expect files.checkFileExecutable dir).resolves.toBeUndefined()
	await (expect files.checkFileExecutable wrong).rejects.toThrow /no such file/

test 'loadFile', ->
	expect.assertions 4
	await (expect (files.loadFile 'utf8') file).resolves.toEqual fileData
	await (expect (files.loadFile 'base64') file).resolves.toEqual fileBase64
	await (expect (files.loadFile 'utf8') dir).rejects.toThrow /illegal operation on a directory/
	await (expect (files.loadFile 'utf8') wrong).rejects.toThrow /no such file/

test 'loadUTF8File', ->
	expect.assertions 3
	await (expect files.loadUTF8File file).resolves.toEqual fileData
	await (expect files.loadUTF8File dir).rejects.toThrow /illegal operation on a directory/
	await (expect files.loadUTF8File wrong).rejects.toThrow /no such file/

test 'loadJSON', ->
	expect.assertions 3
	await (expect files.loadJSON file).resolves.toEqual fileJSON
	await (expect files.loadJSON dir).rejects.toThrow /illegal operation on a directory/
	await (expect files.loadJSON wrong).rejects.toThrow /no such file/
