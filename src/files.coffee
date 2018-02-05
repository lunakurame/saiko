import fs from 'fs'
import {promisify} from 'util'

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

export loadFile = (encoding) -> (fileName) ->
	(promisify fs.readFile) fileName, encoding

export loadUTF8File =
	loadFile 'utf8'

export loadJSON = (fileName) ->
	JSON.parse await loadUTF8File fileName
