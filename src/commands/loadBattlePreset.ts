import Battle from 'Battle';
import { requireGuildTo } from 'commands';
import { Message } from 'discord.js';
import { presetsByGuildID } from 'presets';
import send from 'send';

export default async function loadBattlePreset(message: Message) {
	requireGuildTo('use battle presets', message);

	const match = message.content.match(/^>> ?load battle preset "([\w-]+)"$/i);

	if (!match) {
		return send(
			message.channel,
			'To load a battle preset, follow this format:\n' +
			'```\n' +
			'>> load battle preset "name_here"\n' +
			'```'
		);
	}

	const presetName = match[1];
	const preset = presetsByGuildID[message.guild.id]?.get(presetName);

	if (!preset) {
		throw new Error(`There is no preset saved with the name "${presetName}" in this server.`);
	}

	const battle = Battle.fromJSON(message.channel, preset);

	await battle.announceStart();
}
