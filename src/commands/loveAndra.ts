import { Message } from 'discord.js';
import send from 'send';

const loveAndra = async (message: Message) => {
	await send(message.channel, 'Andra loves you too.');
};

loveAndra.unlisted = true;

export default loveAndra;
