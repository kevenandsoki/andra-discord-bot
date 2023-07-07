'use strict';

import Battle from '../Battle.js';
import { presetsByGuildID } from '../presets.js';
import send from '../send.js';

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
