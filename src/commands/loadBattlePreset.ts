import Battle from 'Battle';
import { presetsByGuildID } from 'presets';
import send from 'send';

const loadBattlePreset = async message => {
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
};

export default loadBattlePreset;
