'use strict';

import send from '../send.js';
import { presetsByGuildID } from '../presets.js';
import { requirePermissions } from './index.js';

const listBattlePresets = async message => {
	requirePermissions(message.member);

	const presets = presetsByGuildID[message.guild.id];

	if (!presets) {
		return send(message.channel, 'There are no saved presets in this server.');
	}

	let listText = 'List of this server\'s battle presets:\n';
	listText += '```\n';

	for (const [presetName, preset] of presets) {
		listText += `${presetName} (${preset.width}x${preset.height})\n`;
		listText += '  ';

		listText += preset.teams.map(teamJSON => (
			teamJSON.characters
				.map(character => `[${character.letter}]`)
				.join('')
		)).join(' vs. ');

		listText += '\n';
	}

	listText += '```';

	await send(message.channel, listText);
};

export default listBattlePresets;
