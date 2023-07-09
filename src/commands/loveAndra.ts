import { Message } from 'discord.js';
import send from '../send';

export default async function loveAndra(message: Message) {
	await send(message.channel, 'Andra loves you too.');
}

loveAndra.unlisted = true;
