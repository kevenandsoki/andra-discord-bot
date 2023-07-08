import Team from 'Team';
import { battle } from 'Battle';
import send from 'send';

export const battles = [];

export default class Battle {
	static MAX_CHARACTER_COUNT = 50;

	teams = [];
	turnIndex = 0;

	constructor(channel, width, height, commandText) {
		this.channel = channel;
		this.width = width || 6;
		this.height = height || 1;
		this.commandText = commandText;

		battles.push(this);
	}

	static getBattleInChannel(channel) {
		const battle = battles.find(battle => battle.channel === channel);

		if (!battle) {
			throw new Error('There are no ongoing battles in this channel.');
		}

		return battle;
	}

	static fromJSON(channel, battleJSON) {
		const battle = new Battle(
			channel,
			battleJSON.width,
			battleJSON.height,
			battleJSON.commandText,
		);
		battle.turnIndex = battleJSON.turnIndex;

		for (const teamJSON of battleJSON.teams) {
			Team.fromJSON(battle, teamJSON);
		}

		return battle;
	}

	toJSON() {
		return {
			width: this.width,
			height: this.height,
			turnIndex: this.turnIndex,
			commandText: this.commandText,
			teams: this.teams.map(team => team.toJSON()),
		};
	}

	get characters() {
		return this.teams.flatMap(team => team.characters);
	}

	get turnCharacter() {
		return this.characters[this.turnIndex];
	}

	getCharactersByPos({ x, y }) {
		let characters = this.characters;

		if (x !== undefined) {
			characters = characters.filter(character => character.x === x);
		}
		if (y !== undefined) {
			characters = characters.filter(character => character.y === y);
		}

		return characters;
	}

	getCharactersByLetter(letter) {
		return this.characters.filter(characters => characters.letter === letter);
	}

	isOutOfBounds(x, y) {
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
		const losingTeam = this.teams.find(team => team.characters.length === 0);
		if (losingTeam) {
			await losingTeam.getOtherTeam().win();
			return;
		}

		this.turnIndex = (this.turnIndex + 1) % this.characters.length;
		await this.announceTurn();
	}

	async announceStart() {
		await send(this.channel, 'Battle start!\n' + this.getBoardString());
		await this.announceTurn();
	}

	async announceTurn() {
		const roleText = this.turnCharacter.role ? `${this.turnCharacter.role} ` : '';
		await this.channel.send(roleText + `${this.turnCharacter}'s turn!`);
	}

	atomically(callback) {
		const battleClone = deepCloneWithPrototypes(this);

		try {
			callback();
		} catch (error) {
			battles.splice(battles.indexOf(this), 1, battleClone);

			throw error;
		}
	}

	remove() {
		battles.splice(battles.indexOf(this), 1);
	}
}