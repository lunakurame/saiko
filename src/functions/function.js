/** Functions to do operations on functions.
 * @module functions/function */

/** Composes any number of functions: (f∘g)(x) = f(g(x)).
 *  Functions are applied from right to left (the last parameter is invoked first).
 *  All functions should accept 1 parameter, except the rightmost one, which can
 *  have any number of parameters.
 *  If run without parameters, returns a function which returns the first parameter.
 * @param {...function} functions - the functions to compose
 * @returns {function} - the function composing all input functions */
export const compose = (...functions) =>
	functions.length === 0 ? param => param :
	functions.reduce((f, g) =>
		(...params) =>
			f(g(...params))
	);

/** The same as compose but applies parameter from left to right.
 * @param {...function} functions - the functions to compose
 * @returns {function} - the function composing all input functions */
export const sequence = (...functions) =>
	compose(...functions.reverse());
