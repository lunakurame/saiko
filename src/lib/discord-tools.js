import Discord from 'discord.js';

/** A place.
 * @typedef Place
 * @type {Discord.Channel|Discord.Guild|Discord.Client} */

/** Returns a place's type.
 * @param {Place} place
 * @returns {?string} - the place type */
export function getPlaceType(place) {
	return (
		place instanceof Discord.TextChannel    ? 'text'   :
		place instanceof Discord.DMChannel      ? 'dm'     :
		place instanceof Discord.GroupDMChannel ? 'group'  :
		place instanceof Discord.Guild          ? 'guild'  :
		place instanceof Discord.Client         ? 'client' : null
	);
}

/** Returns a Discord.Collection with all members or users from a given place.
 * @param {Place} place
 * @returns {Discord.Collection<Discord.User|Discord.GuildMember>} - a collection */
export function getMemberCollection(place) {
	switch (getPlaceType(place)) {
	case 'text':
	case 'guild':
		return place.members;
	case 'dm':
		const collection = new Discord.Collection();
		collection.set(place.client.user.id, place.client.user);
		collection.set(place.recipient.id, place.recipient);
		return collection;
	case 'group':
		return place.recipients;
	case 'client':
		return place.users;
	}

	return null;
}

/** Returns a user for a giver user ID.
 * @param {Place} place - scope, in which the user should be found
 * @param {!string} userID - user's ID (aka snowflake)
 * @returns {?Discord.User} - the user or null */
export function getUserById(place, userID) {
	const collection = getMemberCollection(place);

	if (!collection)
		return null;

	const user = collection.find('id', userID);

	return (
		user instanceof Discord.User        ? user      :
		user instanceof Discord.GuildMember ? user.user : null
	);
}

/** Tries to find a user which has a nickname or a username somewhat close to the given string.
 * @param {Place} place - a scope to limit the search
 * @param {string} clue - a string similar to the user's nick/username
 * @returns {?Discord.User} - the user or null */
export function guessUser(place, clue) {
	const collection = getMemberCollection(place);

	if (!collection)
		return null;

	/** Finds members in a given Collection of members using a specified condition.
	 * @param {Discord.Collection} members
	 * @param {function} condition
	 * @returns {array} - an array of members who meet the given condition */
	const findMember = (members, condition) => Array.from(members
		.filter(member => condition({
			nickname: member.nickname ? member.nickname.toLowerCase() : null,
			username: (member.username || member.user.username).toLowerCase()
		}))
		.values());

	const clueLC = clue.toLowerCase();
	const conditions = [
		name => name === clueLC,
		name => name.startsWith(`${clueLC} `),
		name => name.startsWith(clueLC) && /^[^a-z]/.test(name.slice(clueLC.length)),
		name => name.split(' ').some(word => word === clueLC),
		name => name.split(' ').some(word => word.startsWith(clueLC) && /^[^a-z]/.test(word.slice(clueLC.length)))
	];
	const matches = [
		...conditions.map(condition => findMember(
			collection,
			({nickname}) => nickname && condition(nickname)
		)),
		...conditions.map(condition => findMember(
			collection,
			({username}) => condition(username)
		))
	];

	for (const key in matches)
		if (matches[key].length === 1)
			return matches[key][0].user || matches[key][0];

	return null;
}

/** Tries to find a user using his ID first and if that fails, then tries to
 *  find a user with a similar name.
 * @param {Place} place
 * @param {string} clue
 * @returns {?Discord.User} - the user or null */
export function getUser(place, clue) {
	if (typeof clue !== 'string')
		return null;

	const [userID] = clue.match(/[\d]+/) || [];

	if (userID) {
		const user = getUserById(place, userID);

		if (user)
			return user;
	}

	return guessUser(place, clue);
}
