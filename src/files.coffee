import fs from 'fs'
import {promisify} from 'util'

export loadJSON = (fileName) ->
	JSON.parse await (promisify fs.readFile) fileName
