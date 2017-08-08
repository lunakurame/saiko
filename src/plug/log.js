import 'colors';
import Discord from 'discord.js';
import Plugin from '../plugin.js';

export default class LogPlugin extends Plugin {
	/** Creates a new LogPlugin object.
	 * @param {Saiko} saiko - a Saiko object, which is gonna use that plugin
	 * @returns {LogPlugin} - a LogPlugin object */
	constructor(saiko) {
		super(saiko);

		this.name = 'log';
		this.description = 'Logs messages.';
	}

	formatMessageSource(message) {
		const rules = [
			{
				channelType: Discord.TextChannel,
				name: message => `${message.guild.name}${'#'.cyan}${message.channel.name}`
			},
			{
				channelType: Discord.DMChannel,
				name: message => `${message.channel.recipient.username} #${message.channel.recipient.discriminator}`
			},
			{
				channelType: Discord.GroupDMChannel,
				name: message => message.channel.name ?
					`Group: ${message.channel.name}` :
					`Unnamed group (ID: ${message.channel.id})`
			}
		];

		for (const rule of rules)
			if (message.channel instanceof rule.channelType)
				return rule.name(message);

		return 'Unknown source';
	}

	formatMessageAuthor(message) {
		const rules = [
			{
				channelType: Discord.TextChannel,
				name: message => message.member.displayName === message.author.username ?
					`${message.author.username} #${message.author.discriminator}` :
					`${message.member.nickname} (${message.author.username} #${message.author.discriminator})`
			},
			{
				channelType: Discord.DMChannel,
				name: message => `${message.author.username} #${message.author.discriminator}`
			},
			{
				channelType: Discord.GroupDMChannel,
				name: message => `${message.author.username} #${message.author.discriminator}`
			}
		];

		for (const rule of rules)
			if (message.channel instanceof rule.channelType)
				return rule.name(message);

		return 'Unknown author';
	}

	onMessage(message) {
		this.saiko.logger.log(
			' New message '.bgGreen.black,
			this.formatMessageSource(message),
			this.formatMessageAuthor(message),
			message.content
		);
	}

	onMessageDelete(message) {
		this.saiko.logger.log(
			' Deleted message '.bgRed.white,
			this.formatMessageSource(message),
			this.formatMessageAuthor(message),
			message.content
		);
	}
}
