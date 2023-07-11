import { TextBasedChannel, User } from 'discord.js';
import Team from './Team';
import send from './send';
import { restoreProperties, saveProperties } from './rollbacks';
import Character from './Character';
import { client } from '.';

export const battles: Battle[] = [];

export type BattleJSON = ReturnType<Battle['toJSON']>;

export default class Battle {
	static readonly MAX_CHARACTER_COUNT = 50;

	loading?: Promise<void>;
	teams: Team[] = [];
	#turnCharacter: Character | undefined;

	channel: TextBasedChannel;
	width: number;
	height: number;
	commandText: string;

	constructor(
		channel: TextBasedChannel,
		width: number,
		height: number,
		commandText: string,
	) {
		if (battles.some(battle => battle.channel === channel)) {
			throw new Error('There is already an ongoing battle in this channel.');
		}

		this.channel = channel;
		this.width = width || 6;
		this.height = height || 1;
		this.commandText = commandText;

		battles.push(this);
	}

	static getBattleInChannel(channel: TextBasedChannel) {
		const battle = battles.find(battle => battle.channel === channel);

		if (!battle) {
			throw new Error('There are no ongoing battles in this channel.');
		}

		return battle;
	}

	static fromJSON(channel: TextBasedChannel, battleJSON: BattleJSON) {
		const battle = new Battle(
			channel,
			battleJSON.width,
			battleJSON.height,
			battleJSON.commandText,
		);

		for (const teamJSON of battleJSON.teams) {
			Team.fromJSON(battle, teamJSON);
		}

		battle.turnCharacter = battle.characters[battleJSON.turnIndex];

		return battle;
	}

	toJSON() {
		return {
			width: this.width,
			height: this.height,
			turnIndex: this.characters.indexOf(this.turnCharacter),
			commandText: this.commandText,
			teams: this.teams.map(team => team.toJSON()),
		};
	}

	get turnCharacter() {
		if (this.#turnCharacter === undefined) {
			throw new TypeError('You cannot access a battle\'s `turnCharacter` property before any characters have been created.');
		}

		return this.#turnCharacter;
	}

	set turnCharacter(value) {
		this.#turnCharacter = value;
	}

	get characters() {
		return this.teams.flatMap(team => team.characters);
	}

	getCharactersByPos({ x, y }: { x: number, y: number }) {
		let characters = this.characters;

		if (x !== undefined) {
			characters = characters.filter(character => character.x === x);
		}
		if (y !== undefined) {
			characters = characters.filter(character => character.y === y);
		}

		return characters;
	}

	getCharactersByLetter(letter: string) {
		return this.characters.filter(characters => characters.letter === letter);
	}

	isOutOfBounds(x: number, y: number) {
		return (
			x < 0 || x >= this.width ||
			y < 0 || y >= this.height
		);
	}

	getBoardString() {
		const board = [...new Array(this.height)].map(() => (
			new Array(this.width).fill('')
		));

		for (const character of this.characters) {
			board[character.y][character.x] += character.letter;
		}

		const rowStrings = board.map(row => (
			row.map(cell => cell || '-').join(' ')
		));

		return '```\n' + rowStrings.join('\n') + '\n```';
	}

	async updateTurn() {
		for (const character of this.characters) {
			character.resetSPD();
		}

		const losingTeam = this.teams.find(team => team.characters.length === 0);
		if (losingTeam) {
			await losingTeam.getOtherTeam().win();
			return;
		}

		let turnIndex = this.characters.indexOf(this.turnCharacter);
		turnIndex = (turnIndex + 1) % this.characters.length;
		this.turnCharacter = this.characters[turnIndex];

		await this.announceTurn();
	}

	async announceStart() {
		await send(this.channel, 'Battle start!\n' + this.getBoardString());
		await this.announceTurn();
	}

	async announceTurn() {
		let roleText = '';

		if (this.turnCharacter.isCPU) {
			roleText = 'CPU ';
		} else if (this.turnCharacter.role) {
			roleText = `${this.turnCharacter.role} `;
		}

		roleText += `${this.turnCharacter}'s turn!`;

		if (this.turnCharacter.isCPU) {
			roleText += ' _(Processing...)_';
		}

		await this.channel.send(roleText);

		if (this.turnCharacter.isCPU) {
			// Don't await this because it isn't part of this turn.
			this.turnCharacter.sendCPUCommand();
		}
	}

	/** Runs the callback atomically and updates the turn if there were no errors. */
	async doTurn(
		user: User,
		callback: () => void | Promise<void>,
	) {
		while (this.loading) {
			await this.loading;
		}

		if (!battles.includes(this)) {
			throw new Error('The battle has already concluded.');
		}

		if (this.turnCharacter.isCPU && user.id !== client.user!.id) {
			throw new Error('Please wait your turn.');
		}

		this.loading = new Promise(async (resolve, reject) => {
			const savedProperties = saveProperties(this);

			try {
				await callback();

				await this.updateTurn();
			} catch (error) {
				restoreProperties(savedProperties);

				reject(error);
				return;
			} finally {
				this.loading = undefined;
			}

			resolve();
		});

		await this.loading;
	}

	remove() {
		battles.splice(battles.indexOf(this), 1);
	}
}
