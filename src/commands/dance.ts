import { Message } from 'discord.js';

export default async function dance(message: Message) {
	await message.channel.send('<a:DANCE:1126731825063141458>');
}

dance.unlisted = true;
