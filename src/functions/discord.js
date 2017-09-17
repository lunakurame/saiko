/** Functions using discord.js.
 * @module functions/discord */

import Discord from 'discord.js';

/** A place.
 * @typedef Place
 * @type {Discord.Channel|Discord.Guild|Discord.Client} */

/** Returns a place's type.
 * @param {Place} place
 * @returns {?string} - the place type */
export const getPlaceType = place =>
	place instanceof Discord.TextChannel    ? 'text'   :
	place instanceof Discord.DMChannel      ? 'dm'     :
	place instanceof Discord.GroupDMChannel ? 'group'  :
	place instanceof Discord.VoiceChannel   ? 'voice'  :
	place instanceof Discord.Guild          ? 'guild'  :
	place instanceof Discord.Client         ? 'client' : null;

/** Returns a Discord.Collection with all members or users from a given place.
 * @param {Place} place
 * @returns {Discord.Collection<Discord.User|Discord.GuildMember>} - a collection */
export const getMemberCollection = place => {
	switch (getPlaceType(place)) {
	case 'text':
	case 'voice':
	case 'guild':
		return place.members;
	case 'dm':
		return new Discord.Collection([
			[place.client.user.id, place.client.user],
			[place.recipient.id, place.recipient]
		]);
	case 'group':
		return place.recipients;
	case 'client':
		return place.users;
	}

	return new Discord.Collection;
};

/** Returns a user for a giver user ID.
 * @param {Place} place - scope, in which the user should be found
 * @param {!string} userID - user's ID (aka snowflake)
 * @returns {?Discord.User} - the user or null */
export const getUserById = place => userID =>
	[getMemberCollection(place).get(userID)]
		.map(item =>
			item instanceof Discord.User        ? item      :
			item instanceof Discord.GuildMember ? item.user : null
		)[0] || null;

/** Finds members in a given Collection of members using a specified condition.
 * @param {Discord.Collection} members
 * @param {function} condition
 * @returns {array} - an array of members who meet the given condition */
const findMember = members => condition =>
	Array.from(members
		.filter(member => condition({
			nickname: member.nickname ? member.nickname.toLowerCase() : null,
			username: (member.username || member.user.username).toLowerCase()
		}))
		.values()
	);

/** Tries to find a user which has a nickname or a username somewhat close to the given string.
 * @param {Place} place - a scope to limit the search
 * @param {string} clue - a string similar to the user's nick/username
 * @returns {?Discord.User} - the user or null */
export const guessUser = place => clue => {
	const find =
		findMember(getMemberCollection(place));

	const clueLC = clue.toLowerCase();
	const conditions = [
		name => name === clueLC,
		name => name.startsWith(`${clueLC} `),
		name => name.startsWith(clueLC) && /^[^a-z]/.test(name.slice(clueLC.length)),
		name => name.split(' ').some(word => word === clueLC),
		name => name.split(' ').some(word => word.startsWith(clueLC) && /^[^a-z]/.test(word.slice(clueLC.length)))
	];
	const matches = [
		...conditions.map(condition => find(({nickname}) => nickname && condition(nickname))),
		...conditions.map(condition => find(({username}) => condition(username)))
	];

	for (const match of matches)
		if (match.length === 1)
			return match[0].user || match[0];

	return null;
};

/** Tries to find a user using his ID first and if that fails, then tries to
 *  find a user with a similar name.
 * @param {Place} place
 * @param {string} clue
 * @returns {?Discord.User} - the user or null */
export const getUser = place => clue => {
	if (typeof clue !== 'string')
		return null;

	const [userID] = clue.match(/[\d]+/) || [];

	if (userID) {
		const user = getUserById(place)(userID);

		if (user)
			return user;
	}

	return guessUser(place)(clue);
};
