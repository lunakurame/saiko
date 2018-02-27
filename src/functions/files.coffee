import fs from 'fs'
import {promisify} from 'util'
import * as objects from './objects'

export checkFileAccess = (mode) -> (fileName) ->
	(promisify fs.access) fileName, mode

export checkFileExists =
	checkFileAccess fs.constants.F_OK

export checkFileReadable =
	checkFileAccess fs.constants.R_OK

export checkFileWritable =
	checkFileAccess fs.constants.W_OK

export checkFileExecutable =
	checkFileAccess fs.constants.X_OK

export createDirectory = (mode) -> (path) ->
	(promisify fs.mkdir) path, mode

export loadFile = (encoding) -> (fileName) ->
	(promisify fs.readFile) fileName, encoding

export loadUTF8File =
	loadFile 'utf8'

export loadAndParse = (parser) -> (fileName) ->
	parser await loadUTF8File fileName

export loadJSON =
	loadAndParse JSON.parse

export serializeAndSave = (serializer) -> (data) -> (fileName) ->
	serializedData = serializer data
	await (promisify fs.writeFile) fileName, serializedData
	serializedData

export saveJSON =
	serializeAndSave (data) -> "#{objects.json data}\n"
