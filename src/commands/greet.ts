import { Message } from 'discord.js';
import send from 'send';

export default async function greet(message: Message) {
	await send(message.channel, 'Hello!');
}

greet.unlisted = true;
