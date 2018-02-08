import * as strings from './strings'

test 'chars', ->
	(expect strings.chars '012').toEqual ['0', '1', '2']
	(expect strings.chars '💩𝌆💩').toEqual ['💩', '𝌆', '💩']
	(expect strings.chars '0').toEqual ['0']
	(expect strings.chars '').toEqual []
	(expect strings.chars 'rōmaji').toEqual ['r', 'o', '̄', 'm', 'a', 'j', 'i']
	(expect strings.chars 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual ["z", "a", "̄", "͒", "͝", "̺", "̱",
	"l", "͋", "̏", "͒", "̞", "̹", "͍", "g", "̎", "̎", "̅", "́", "o", "͇", "̟", "͉"]

test 'dirName', ->
	(expect strings.dirName '/dev/null').toEqual '/dev'
	(expect strings.dirName '/dev/').toEqual '/'
	(expect strings.dirName '/home/saiko/squirrel.nut').toEqual '/home/saiko'
	(expect strings.dirName '/').toEqual '/'
	(expect strings.dirName 'test').toEqual '.'

test 'graphemes', ->
	(expect strings.graphemes '012').toEqual ['0', '1', '2']
	(expect strings.graphemes '💩𝌆💩').toEqual ['💩', '𝌆', '💩']
	(expect strings.graphemes '0').toEqual ['0']
	(expect strings.graphemes '').toEqual []
	(expect strings.graphemes 'rōmaji').toEqual ['r', 'ō', 'm', 'a', 'j', 'i']
	(expect strings.graphemes 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual ['z', 'ā̺̱͒͝', 'l̞̹͍͋̏͒', 'g̎̎̅́', 'o͇̟͉']

test 'count', ->
	(expect strings.count 'text').toEqual 4
	(expect strings.count '💩 𝌆').toEqual 3
	(expect strings.count '').toEqual 0
	(expect strings.count 'rōmaji').toEqual 6
	(expect strings.count 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual 5

test 'lower', ->
	(expect strings.lower 'TexT').toEqual 'text'
	(expect strings.lower 'text').toEqual 'text'
	(expect strings.lower '').toEqual ''
	(expect strings.lower 'TEXT').toEqual 'text'

test 'replace', ->
	(expect (strings.replace 'x', 'v') 'xxvxa').toEqual 'vxvxa'
	(expect (strings.replace /x/, 'v') 'xxvxa').toEqual 'vxvxa'
	(expect (strings.replace /x/g, 'v') 'xxvxa').toEqual 'vvvva'
	(expect (strings.replace /^not /, '') 'not a test').toEqual 'a test'
	(expect (strings.replace "I'm", "I'm not") "I'm stupid").toEqual "I'm not stupid"
	# TODO add tests for when replace's second parameter is a function

test 'reverse', ->
	(expect strings.reverse '012').toEqual '210'
	(expect strings.reverse '').toEqual ''
	(expect strings.reverse '💩 𝌆').toEqual '𝌆 💩'
	(expect strings.reverse 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual 'o͇̟͉g̎̎̅́l̞̹͍͋̏͒ā̺̱͒͝z'

test 'length', ->
	(expect strings.length 'text').toEqual 4
	(expect strings.length '💩 𝌆').toEqual 3
	(expect strings.length '').toEqual 0
	(expect strings.length 'rōmaji').toEqual 7
	(expect strings.length 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual 23

test 'size', ->
	(expect strings.size 'text').toEqual 4
	(expect strings.size '💩 𝌆').toEqual 5
	(expect strings.size '').toEqual 0
	(expect strings.size 'rōmaji').toEqual 7
	(expect strings.size 'zā̺̱͒͝l̞̹͍͋̏͒g̎̎̅́o͇̟͉').toEqual 23

test 'split', ->
	(expect (strings.split ',') '0,1,2').toEqual ['0', '1', '2']
	(expect (strings.split ', ') '0, 1, 2').toEqual ['0', '1', '2']
	(expect (strings.split ',') 'test').toEqual ['test']
	(expect (strings.split ',') '').toEqual ['']
	(expect (strings.split ',', 0) '0,1,2').toEqual []
	(expect (strings.split ',', 1) '0,1,2').toEqual ['0']
	(expect (strings.split ',', 2) '0,1,2').toEqual ['0', '1']
	(expect (strings.split ',', 3) '0,1,2').toEqual ['0', '1', '2']
	(expect (strings.split ',', 4) '0,1,2').toEqual ['0', '1', '2']
	(expect (strings.split '') '012').toEqual ['0', '1', '2']
	(expect (strings.split '') '💩𝌆💩').toEqual ['💩', '𝌆', '💩']
	(expect (strings.split '', 1) '💩𝌆💩').toEqual ['💩']
	(expect (strings.split '', 5) '💩𝌆💩').toEqual ['💩', '𝌆', '💩']
	(expect (strings.split '') 'rōmaji').toEqual ['r', 'ō', 'm', 'a', 'j', 'i']

test 'upper', ->
	(expect strings.upper 'TexT').toEqual 'TEXT'
	(expect strings.upper 'TEXT').toEqual 'TEXT'
	(expect strings.upper '').toEqual ''
	(expect strings.upper 'text').toEqual 'TEXT'

test 'upperFirstChar', ->
	(expect strings.upperFirstChar 'TexT').toEqual 'TexT'
	(expect strings.upperFirstChar 'TEXT').toEqual 'TEXT'
	(expect strings.upperFirstChar '').toEqual ''
	(expect strings.upperFirstChar 't').toEqual 'T'
	(expect strings.upperFirstChar 'text').toEqual 'Text'
