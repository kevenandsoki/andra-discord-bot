import { Message } from 'discord.js';

const dance = async (message: Message) => {
	await message.channel.send('<a:DANCE:1126731825063141458>');
};

dance.unlisted = true;

export default dance;
