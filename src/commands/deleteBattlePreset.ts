import send from 'send';
import { presetsByGuildID, savePresets } from 'presets';
import { requireGuildTo, requirePermissions } from '.';
import { Message } from 'discord.js';

export default async function deleteBattlePreset(message: Message) {
	requireGuildTo('use battle presets', message);
	requirePermissions(message.member);

	const match = message.content.match(/^>> ?delete battle preset "([\w-]+)"$/i);

	if (!match) {
		return send(
			message.channel,
			'To delete a battle preset, follow this format:\n' +
			'```\n' +
			'>> delete battle preset "name_here"\n' +
			'```'
		);
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
}
