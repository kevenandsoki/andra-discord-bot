import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from '../config.json';
import { handleCommand } from './commands';

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.MessageCreate, async message => {
	if (!message.content.startsWith('>>')) {
		return;
	}

	await handleCommand(message);
});

client.login(config.token);
