import { GuildMember, Message, PermissionsBitField } from 'discord.js';
import send, { ERROR_COLOR } from '../send';
import help from './help';
import startBattle from './startBattle';
import endBattle from './endBattle';
import moveOrAttack from './moveOrAttack';
import saveBattlePreset from './saveBattlePreset';
import loadBattlePreset from './loadBattlePreset';
import deleteBattlePreset from './deleteBattlePreset';
import listBattlePresets from './listBattlePresets';
import viewBattlePreset from './viewBattlePreset';
import loveAndra from './loveAndra';
import dance from './dance';
import greet from './greet';

export const UNKNOWN_COMMAND_TEXT = 'I do not recognize that command. For help with commands, type ">> help".';

export function requireGuildTo(
	actionText: string,
	message: Message,
): asserts message is Message<true> {
	if (!message.guild) {
		throw new Error(`Sorry, you cannot ${actionText} outside of servers.`);
	}
}

export function requirePermissions(member: GuildMember | null) {
	if (member === null) {
		// The member left the server between when the message was created and now.
		throw new Error("Goodbye!");
	}

	if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		throw new Error("You must have \"Manage Messages\" permissions in this server to do that.");
	}
}

type CommandFunction = (message: Message) => void | Promise<void>;

export type Command = CommandFunction & { unlisted?: boolean };

const commands: Record<string, Command> = {
	'hi': greet,
	'i love you andra :D': loveAndra,
	'dance': dance,
	'help': help,
	'start battle': startBattle,
	'end battle': endBattle,
	'move': moveOrAttack,
	'attack': moveOrAttack,
	'save battle preset': saveBattlePreset,
	'load battle preset': loadBattlePreset,
	'delete battle preset': deleteBattlePreset,
	'list battle presets': listBattlePresets,
	'view battle preset': viewBattlePreset,
};

export default commands;

export async function handleCommand(message: Message) {
	let runCommand;
	for (const [commandName, command] of Object.entries(commands)) {
		if (new RegExp(`^>> ?${commandName}`).test(message.content)) {
			runCommand = command;
			break;
		}
	}

	try {
		if (!runCommand) {
			throw new Error(UNKNOWN_COMMAND_TEXT);
		}

		await runCommand(message);
	} catch (error: any) {
		await send(message.channel, error.toString(), ERROR_COLOR);

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
}
