import Battle from 'Battle';
import Team from 'Team';
import { TextBasedChannel, Role, ChannelType } from 'discord.js';

export type CharacterJSON = ReturnType<Character['toJSON']>;

export default class Character {
	static MAX_STAT_VALUE = 100_000_000;

	team: Team;
	battle: Battle;
	channel: TextBasedChannel;
	letter: string;
	role?: Role;

	hp: number;
	atk: number;
	rng: number;
	spd: number;

	maxHP: number;
	x: number;
	y: number;

	constructor(
		team: Team,
		letter: string,
		roleID: string | undefined,
		hp: number | string,
		atk: number | string,
		rng: number | string,
		spd: number | string,
	) {
		this.team = team;
		this.battle = this.team.battle;
		this.channel = this.battle.channel;

		this.letter = letter.toUpperCase();

		if (roleID !== undefined) {
			if (!('guild' in this.channel)) {
				throw new Error('Roles do not exist outside servers. Please use "N/A" for any roles in battles here.');
			}

			this.role = this.channel.guild.roles.resolve(roleID) ?? undefined;
		}

		this.hp = +hp;
		this.atk = +atk;
		this.rng = +rng;
		this.spd = +spd;

		const maxStatValue = Math.max(this.hp, this.atk, this.rng, this.spd);
		if (maxStatValue > Character.MAX_STAT_VALUE) {
			throw new Error(`You cannot make a character stat greater than ${Character.MAX_STAT_VALUE.toLocaleString()}!`);
		}

		this.maxHP = this.hp;

		if (this.team.isNth(0)) {
			this.x = 0;
		} else {
			this.x = this.battle.width - 1;
		}

		this.y = this.getLeastCrowdedY();

		this.team.characters.push(this);
	}

	static fromString(team: Team, string: string) {
		const match = string.match(/^(\*)?([a-z]), (?:N\/A|<@&(\d+)>), (\d+), (\d+), (\d+), (\d+)$/i);
		const [, hasFirstTurn, letter, roleID, hp, atk, rng, spd] = match!;

		const character = new Character(team, letter, roleID, hp, atk, rng, spd);

		if (hasFirstTurn) {
			character.battle.turnIndex = character.battle.characters.indexOf(character);
		}

		return character;
	}

	static fromJSON(team: Team, characterJSON: CharacterJSON) {
		return new Character(
			team,
			characterJSON.letter,
			characterJSON.roleID,
			characterJSON.hp,
			characterJSON.atk,
			characterJSON.rng,
			characterJSON.spd,
		);
	}

	toJSON() {
		return {
			letter: this.letter,
			roleID: this.role?.id,
			hp: this.maxHP,
			atk: this.atk,
			rng: this.rng,
			spd: this.spd,
		};
	}

	getLeastCrowdedY() {
		const yValues = [...new Array(this.battle.height)].map((_, i) => i);

		const rowCharacterCounts = yValues.map(y => this.battle.getCharactersByPos({ x: this.x, y }).length);
		const leastRowCharacterCount = Math.min(...rowCharacterCounts);
		const leastCrowdedRows = yValues.filter(y => this.battle.getCharactersByPos({ x: this.x, y }).length === leastRowCharacterCount);

		return leastCrowdedRows[Math.floor(Math.random() * leastCrowdedRows.length)];
	}

	distanceTo(character: Character) {
		const xDistance = Math.abs(this.x - character.x);
		const yDistance = Math.abs(this.y - character.y);
		return Math.max(xDistance, yDistance);
	}

	realDistanceTo(character: Character) {
		const xDistance = Math.abs(this.x - character.x);
		const yDistance = Math.abs(this.y - character.y);
		return Math.sqrt(xDistance ** 2 + yDistance ** 2);
	}

	move(distance: number, direction: string) {
		if (distance > this.spd) {
			throw new Error(`Character ${this}'s SPD is ${this.spd}, so you cannot move that far.`);
		}

		direction = direction?.toLowerCase();

		let { x, y } = this;

		if (direction === 'left') {
			x -= distance;
		} else if (direction === 'right') {
			x += distance;
		} else if (direction === 'up') {
			y -= distance;
		} else if (direction === 'down') {
			y += distance;
		} else if (/back(?:wards?)?/.test(direction)) {
			if (this.team.isNth(0)) {
				x -= distance;
			} else {
				x += distance;
			}
		} else {
			if (this.team.isNth(0)) {
				x += distance;
			} else {
				x -= distance;
			}
		}

		if (this.battle.isOutOfBounds(x, y)) {
			throw new Error(`You tried to move character ${this} out of bounds.`);
		}

		this.x = x;
		this.y = y;
	}

	attack(targetLetter: string, count: number) {
		if (count > this.spd) {
			throw new Error(`Character ${this}'s SPD is ${this.spd}, so you cannot attack that many times.`);
		}

		targetLetter = targetLetter?.toUpperCase();

		let potentialTargets = this.team.getOtherTeam().characters;

		if (targetLetter) {
			potentialTargets = potentialTargets.filter(character => character.letter === targetLetter);

			if (potentialTargets.length === 0) {
				throw new Error(`There is no enemy with the letter '${targetLetter}'.`);
			}
		}

		let target;
		for (const character of potentialTargets) {
			if (target === undefined || this.realDistanceTo(character) < this.realDistanceTo(target)) {
				target = character;
			}
		}

		// `target` is asserted as non-null because the above loop must run at least once.
		if (this.distanceTo(target!) > this.rng) {
			throw new Error(`Character ${target} is outside of character ${this}'s range.`);
		}

		const damage = this.atk * count;
		target!.damage(damage);

		return { damage, target: target! };
	}

	damage(damage: number) {
		this.hp = Math.max(0, this.hp - damage);

		if (this.hp === 0) {
			this.remove();
		}
	}

	remove() {
		this.team.characters.splice(this.team.characters.indexOf(this), 1);
	}

	toString() {
		return `[${this.letter}]`;
	}
}
