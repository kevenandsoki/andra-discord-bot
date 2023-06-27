import { battles } from "./index.js";

export default class Battle {
	static MAX_CHARACTERS = 50;

	teams = [];
	turnIndex = -1;

	constructor(channel, width, height) {
		this.channel = channel;
		this.width = width || 6;
		this.height = height || 1;

		battles.push(this);
	}

	get characters() {
		return this.teams.flatMap(team => team.characters);
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

	updateTurn() {
		this.turnIndex = (this.turnIndex + 1) % this.characters.length;
		this.turnCharacter = this.characters[this.turnIndex];

		this.channel.send(`${this.turnCharacter.role ?? this.turnCharacter.letter}'s turn!`);
	}

	static getBattleByChannel(channel) {
		return battles.find(battle => battle.channel === channel);
	}
}
