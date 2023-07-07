'use strict';

import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import { handleCommand } from './commands/index.js';

const client = new Client({
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

export const deepCloneWithPrototypes = value => {
	if (typeof value === 'object' && value !== null) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(deepCloneWithPrototypes);
	}

	if (typeof value === 'function') {
		throw new TypeError('You can\'t deep-clone a function.');
	}

	// This creates an instance of `value`'s class without calling its constructor.
	const clone = Object.create(Object.getPrototypeOf(value));

	for (const [key, subvalue] of Object.entries(value)) {
		clone[key] = deepCloneWithPrototypes(subvalue);
	}

	return clone;
};

export const battles = [];

client.on(Events.MessageCreate, async message => {
	if (message.author.id === client.application.id) {
		return;
	}

	if (!message.content.startsWith('>>')) {
		return;
	}

	await handleCommand(message);
});

client.login(config.token);
