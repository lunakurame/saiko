import colors from 'colors/safe'
import readline from 'readline'

handleMessage = (output) -> (type) -> ({title, text}) ->
	typeDecorator = type.decorator ? colors.bgWhite.black
	titleDecorator = colors.bgBlack.white

	output '\n' + (typeDecorator " #{type.text} ") + (titleDecorator " #{title} ") + " #{text}"

export custom =
	handleMessage console.log

export debug =
	(handleMessage console.log)
		text: 'Debug'
		decorator: colors.bgCyan.black

export info =
	(handleMessage console.log)
		text: 'Info'
		decorator: colors.bgWhite.black

export warn =
	(handleMessage console.warn)
		text: 'Warning'
		decorator: colors.bgYellow.black

export error =
	(handleMessage console.error)
		text: 'Error'
		decorator: colors.bgRed.white

export ask = (iface) -> (question) ->
	await new Promise (resolve) ->
		iface.question question, (answer) -> resolve answer

export createInterface = ->
	readline.createInterface input: process.stdin, output: process.stdout
