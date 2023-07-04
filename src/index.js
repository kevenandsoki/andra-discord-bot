import fs from 'node:fs/promises';
import { Client, Events, GatewayIntentBits, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import Battle from './Battle.js';
import Team from './Team.js';

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

const DEFAULT_COLOR = 0xcad0d5;
const ERROR_COLOR = 0xffcc4d;

export const send = async (channel, content, color) => {
	await channel.send({
		embeds: [{
			description: content,
			color: color ?? DEFAULT_COLOR,
		}],
	});
};

const requirePermissions = member => {
	if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		throw new Error("You must have \"Manage Messages\" permissions in this server to do that.");
	}
};

const mapReviver = (_, value) => {
	if (Array.isArray(value) && value.every(Array.isArray)) {
		return new Map(value);
	}

	return value;
};

const mapReplacer = (_, value) => {
	if (value instanceof Map) {
		return Array.from(value);
	}

	return value;
};

let presetsByGuildID = {};

fs.readFile('data/presets.json', 'utf8').then(string => {
	presetsByGuildID = JSON.parse(string, mapReviver);
}).catch(() => {});

const savePresets = async () => {
	const presetData = JSON.stringify(presetsByGuildID, mapReplacer);

	await fs.writeFile('data/presets.json', presetData);
};

export const battles = [];

const commands = {
	'start battle': async message => {
		const match = message.content.match(/^>> ?start battle(?: (\d+)x(\d+))? *((?:\n\*?[a-z], (?:N\/A|<@&\d+>), \d+, \d+, \d+, \d+ *)+)\nvs\. *((?:\n\*?[a-z], (?:N\/A|<@&\d+>), \d+, \d+, \d+, \d+ *)+)$/i);

		if (!match) {
			await send(
				message.channel,
				'To start a battle, follow this format:\n' +
				'```\n' +
				'>> start battle [W]x[H]\n' +
				'[letter], [@Role], [HP], [ATK], [RNG], [SPD]\n' +
				'vs.\n' +
				'[letter], [@Role], [HP], [ATK], [RNG], [SPD]\n' +
				'```\n' +
				'You can add more characters to either side, by making a new line.\n' +
				'You may also have duplicate letters, such as multiple Enemies (E).'
			);
			return;
		}

		if (battles.some(battle => battle.channel === message.channel)) {
			throw new Error('There is already an ongoing battle in this channel.');
		}

		const battle = new Battle(message.channel, +match[1], +match[2]);
		Team.fromString(battle, match[3]);
		Team.fromString(battle, match[4]);

		if (battle.characters.length > Battle.MAX_CHARACTERS) {
			throw new Error(
				`You cannot make a battle with more than ${Battle.MAX_CHARACTERS} characters! (That would be a bit ridiculous...)`
			);
		}

		await battle.announceStart();
	},
	'end battle': async message => {
		const battle = Battle.getBattleInChannel(message.channel);

		battle.remove();
		await send(message.channel, 'The battle has concluded.');
	},
	'move': async message => {
		const match = message.content.match(/^>> ?move (\d+)(?: (up|down|left|right|back(?:wards?)?|forwards?))?$/i);

		if (!match) {
			await send(
				message.channel,
				'To use the "Move" command, follow this format:\n' +
				'```\n' +
				'>> move [distance] [direction]\n' +
				'```\n' +
				'The directions available are: "up", "down", "left", "right", "forward", and "back".\n' +
				'If you do not specify a direction, it will default to "forward", which is based on the side you started on.'
			);
			return;
		}

		const battle = Battle.getBattleInChannel(message.channel);

		battle.turnCharacter.move(+match[1], match[2]);

		await send(
			message.channel,
			battle.getBoardString(),
			battle.turnCharacter.role?.color,
		);
		await battle.updateTurn();
	},
	'attack': async message => {
		const match = message.content.match(/^>> ?attack(?: ([a-z]))? (\d+)$/i);

		if (!match) {
			await send(
				message.channel,
				'To use the "Attack" command, follow this format:\n' +
				'```\n' +
				'>> attack [target] [count]\n' +
				'```\n' +
				'Note that while "character to attack" is optional, your attack will default to the closest enemy (character on the opposing team).\n' +
				'If you are not in range of the character you chose or the closest enemy, then the command will fail and you will be asked to retry.'
			);
			return;
		}

		const battle = Battle.getBattleInChannel(message.channel);

		const { damage, target } = battle.turnCharacter.attack(match[1], +match[2]);

		let response = `${damage} DMG dealt to ${target}!\n`;
		response += `${target} HP: ${target.hp}/${target.maxHP}\n`;

		if (target.hp === 0) {
			response += `${target} was defeated!\n`;
		}

		response += battle.getBoardString();

		await send(
			message.channel,
			response,
			battle.turnCharacter.role?.color,
		);
		await battle.updateTurn();
	},
	'save battle preset': async message => {
		requirePermissions(message.member);

		const match = message.content.match(/^>> ?save battle preset "([\w-]+)"$/i);

		if (!match) {
			await send(
				message.channel,
				'To save the current battle as a preset, follow this format:\n' +
				'```\n' +
				'>> save battle preset "name_here"\n' +
				'```\n' +
				'You can then load, delete, or list all battle presets.\n' +
				'Note: Preset names can only have letters, numbers, underscores, or hyphens.'
			);
			return;
		}

		const battle = Battle.getBattleInChannel(message.channel);
		const presetName = match[1];

		presetsByGuildID[message.guild.id] ??= new Map();
		presetsByGuildID[message.guild.id].set(presetName, battle.toJSON());

		await savePresets();

		await send(message.channel, `Battle preset "${presetName}" saved!`);
	},
	'load battle preset': async message => {
		const match = message.content.match(/^>> ?load battle preset "([\w-]+)"$/i);

		if (!match) {
			await send(
				message.channel,
				'To load a battle preset, follow this format:\n' +
				'```\n' +
				'>> load battle preset "name_here"\n' +
				'```'
			);
			return;
		}

		const presetName = match[1];
		const preset = presetsByGuildID[message.guild.id]?.get(presetName);

		if (!preset) {
			throw new Error(`There is no preset saved with the name "${presetName}" in this server.`);
		}

		const battle = Battle.fromJSON(message.channel, preset);

		await battle.announceStart();
	},
	'delete battle preset': async message => {
		requirePermissions(message.member);

		const match = message.content.match(/^>> ?delete battle preset "([\w-]+)"$/i);

		if (!match) {
			await send(
				message.channel,
				'To delete a battle preset, follow this format:\n' +
				'```\n' +
				'>> delete battle preset "name_here"\n' +
				'```'
			);
			return;
		}

		const presetName = match[1];
		const presetDeleted = presetsByGuildID[message.guild.id]?.delete(presetName);

		if (!presetDeleted) {
			throw new Error(`There is no preset saved with the name "${presetName}" in this server.`);
		}

		if (presetsByGuildID[message.guild.id].size === 0) {
			delete presetsByGuildID[message.guild.id];
		}

		await savePresets();

		await send(message.channel, `Preset ${presetName} deleted.`);
	},
	'list battle presets': async message => {
		requirePermissions(message.member);
		await send(message.channel, 'Penguin yay 1');
	},
};

client.on(Events.MessageCreate, async message => {
	if (message.author.id === client.application.id) {
		return;
	}

	if (!message.content.startsWith('>>')) {
		return;
	}

	let runCommand;
	for (const [commandName, commandFunction] of Object.entries(commands)) {
		if (new RegExp(`>> ?${commandName}`).test(message.content)) {
			runCommand = commandFunction;
			break;
		}
	}

	if (!runCommand) {
		await send(message.channel, 'I do not recognize that command. For help with commands, type ">> help".');
		return;
	}

	try {
		await runCommand(message);
	} catch (error) {
		await send(message.channel, error.toString(), ERROR_COLOR);

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
});

client.login(config.token);
