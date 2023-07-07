'use strict';

import { PermissionsBitField } from 'discord.js';
import send, { ERROR_COLOR } from '../send.js';
import help from './help.js';
import startBattle from './startBattle.js';
import endBattle from './endBattle.js';
import moveOrAttack from './moveOrAttack.js';
import saveBattlePreset from './saveBattlePreset.js';
import loadBattlePreset from './loadBattlePreset.js';
import deleteBattlePreset from './deleteBattlePreset.js';
import listBattlePresets from './listBattlePresets.js';
import viewBattlePreset from './viewBattlePreset.js';
import loveAndra from './loveAndra.js';
import dance from './dance.js';

export const UNKNOWN_COMMAND_TEXT = 'I do not recognize that command. For help with commands, type ">> help".';

export const requirePermissions = member => {
	if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		throw new Error("You must have \"Manage Messages\" permissions in this server to do that.");
	}
};

const commands = {
	'i love you andra :D': loveAndra,
	'dance': dance,
	'help': help,
	'start battle': startBattle,
	'end battle': endBattle,
	'move|attack': moveOrAttack,
	'save battle preset': saveBattlePreset,
	'load battle preset': loadBattlePreset,
	'delete battle preset': deleteBattlePreset,
	'list battle presets': listBattlePresets,
	'view battle preset': viewBattlePreset,
};

export default commands;

export const handleCommand = async message => {
	let runCommand;
	for (const [commandName, commandFunction] of Object.entries(commands)) {
		if (new RegExp(`^>> ?(?:${commandName})`).test(message.content)) {
			runCommand = commandFunction;
			break;
		}
	}

	if (!runCommand) {
		return send(message.channel, UNKNOWN_COMMAND_TEXT);
	}

	try {
		await runCommand(message);
	} catch (error) {
		await send(message.channel, error.toString(), ERROR_COLOR);

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
};
