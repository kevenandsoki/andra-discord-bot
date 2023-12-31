import { Message } from 'discord.js';
import Battle, { battles } from '../Battle';
import Team from '../Team';
import send from '../send';

export default async function startBattle(message: Message) {
	const match = message.content.match(/^>> ?start battle(?: (\d+)x(\d+))? *((?:\n\*?[a-z], (?:N\/A|CPU|<@&\d+>), \d+, \d+, \d+, \d+ *)+)\nvs\. *((?:\n\*?[a-z], (?:N\/A|CPU|<@&\d+>), \d+, \d+, \d+, \d+ *)+)$/i);

	if (!match) {
		throw new Error(
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
	}

	const battle = new Battle(message.channel, +match[1], +match[2], message.content);
	Team.fromString(battle, match[3]);
	Team.fromString(battle, match[4]);

	if (battle.characters.length > Battle.MAX_CHARACTER_COUNT) {
		throw new Error(
			`You cannot make a battle with more than ${Battle.MAX_CHARACTER_COUNT} characters! (That would be a bit ridiculous...)`
		);
	}

	await battle.announceStart();
}
