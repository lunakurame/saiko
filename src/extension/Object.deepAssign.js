/** Works like Object.assign, but recursevely merges objects, so child objects
 *  are merged too instead of replaced (it copies them without modifying them).
 *  This function doesn't conform to the Object.assign specs.
 * @method Object.deepAssign
 * @param target - anything but undefined and null
 * @param sources - anything
 * @returns {object} - returns target  */
if (typeof Object.deepAssign !== 'function')
	Object.defineProperty(Object, 'deepAssign', {
		value: function deepAssign(target, ...sources) {
			const isDefined = value => typeof value !== 'undefined' && value !== null;

			if (!isDefined(target))
				throw new TypeError('Cannot convert undefined or null to object');

			const result = Object(target);

			sources.forEach(source => {
				if (!isDefined(source))
					return;

				for (const key in source) {
					if (!Object.prototype.hasOwnProperty.call(source, key))
						continue;

					if (typeof result[key] === 'object' ||
					    typeof source[key] === 'object')
						result[key] = Object.deepAssign({}, result[key], source[key]);
					else
						result[key] = source[key];
				}
			});

			return result;
		},
		writable: true,
		enumerable: false,
		configurable: true
	});
