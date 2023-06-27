import { Client, Events, GatewayIntentBits } from 'discord.js';
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

const send = (channel, content) => {
	channel.send({
		embeds: [{
			description: content,
			color: 0xcad0d5,
		}],
	});
};

export const battles = [];

const commands = {
	'start battle': message => {
		// TODO: add turn order start
		const match = message.content.match(/^>> ?start battle(?: (\d+)x(\d+))? *((?:\n[a-z], (?:N\/A|<@&\d+>), \d+, \d+, \d+, \d+ *)+)\nvs\. *((?:\n[a-z], (?:N\/A|<@&\d+>), \d+, \d+, \d+, \d+ *)+)$/i);

		if (!match) {
			send(
				message.channel,
				'To start a battle, follow this format:\n' +
				'```\n' +
				'>> start battle [W]x[H]\n' +
				'[letter], [@Role], [HP], [MP], [ATK], [SPD]\n' +
				'vs.\n' +
				'[letter], [@Role], [HP], [MP], [ATK], [SPD]\n' +
				'```\n' +
				'You can add more characters to either side, by making a new line.\n' +
				'You may also have duplicate letters, such as multiple Enemies (E).'
			);
			return;
		}

		const battle = new Battle(message.channel, +match[1], +match[2]);
		Team.fromString(battle, match[3]);
		Team.fromString(battle, match[4]);

		if (battle.characters.length > Battle.MAX_CHARACTERS) {
			throw new Error(
				`You cannot make a battle with more than ${Battle.MAX_CHARACTERS} characters! (That would be a bit ridiculous...)`
			);
		}

		// turn order is determined by the array of battle.characters, which is just
		// an array of all characters in the order they were written in the start command
		// it loops through the array
		// anybody can move for someone

		send(message.channel, 'Battle start!\n' + battle.getBoardString());
		battle.updateTurn();
	},
	'move': message => {
		const match = message.content.match(/^>> ?move (\d+)(?: (up|down|left|right|back(?:wards?)?|forwards?))?$/i);

		if (!match) {
			send(
				message.channel,
				'To use the "Move" command, follow this format:\n' +
				'```\n' +
				'>> move [number] [direction]\n' +
				'```\n' +
				'The directions available are: "up", "down", "left", "right", "forward", and "back".\n' +
				'If you do not specify a direction, it will default to "forward", which is based on the side you started on.'
			);
			return;
		}

		const battle = Battle.getBattleByChannel(message.channel);

		battle.turnCharacter.move(+match[1], match[2]);
		send(message.channel, battle.getBoardString());
		battle.updateTurn();
	},
};

client.on(Events.MessageCreate, message => {
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
		send(message.channel, 'I do not recognize that command. For help with commands, type ">> help".');
		return;
	}

	try {
		runCommand(message);
	} catch (error) {
		send(message.channel, error.toString());

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
});

client.login(config.token);
