import { Message } from 'discord.js';
import send from 'send';

const greet = async (message: Message) => {
	await send(message.channel, 'Hello!');
};

greet.unlisted = true;

export default greet;
