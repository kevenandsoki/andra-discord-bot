import Battle from './Battle';
import Team from './Team';
import { TextBasedChannel, Role } from 'discord.js';
import timeOut from './timeOut';
import { handleCommand } from './commands';

export type CharacterJSON = ReturnType<Character['toJSON']>;

export default class Character {
	static readonly MAX_STAT_VALUE = 100_000_000;
	static readonly CPU_COMMAND_DELAY = 1000;

	team: Team;
	battle: Battle;
	channel: TextBasedChannel;
	letter: string;
	isCPU: boolean;
	role?: Role;

	hp: number;
	atk: number;
	rng: number;
	spd: number;

	maxHP: number;
	maxSPD: number;
	x: number;
	y: number;

	constructor(
		team: Team,
		letter: string,
		isCPU: boolean,
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
		this.isCPU = isCPU;

		if (roleID !== undefined && 'guild' in this.channel) {
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
		this.maxSPD = this.spd;

		if (this.team.isNth(0)) {
			this.x = 0;
		} else {
			this.x = this.battle.width - 1;
		}

		this.y = this.getLeastCrowdedY();

		this.team.characters.push(this);

		if (this === this.battle.characters[0]) {
			this.battle.turnCharacter = this;
		}
	}

	static fromString(team: Team, string: string) {
		const match = string.match(/^(\*)?([a-z]), (?:N\/A|(CPU)|<@&(\d+)>), (\d+), (\d+), (\d+), (\d+)$/i);
		const [, hasFirstTurn, letter, cpuString, roleID, hp, atk, rng, spd] = match!;

		const character = new Character(team, letter, !!cpuString, roleID, hp, atk, rng, spd);

		if (hasFirstTurn) {
			character.battle.turnCharacter = character;
		}

		return character;
	}

	static fromJSON(team: Team, characterJSON: CharacterJSON) {
		return new Character(
			team,
			characterJSON.letter,
			characterJSON.isCPU,
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
			isCPU: this.isCPU,
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
			throw new Error(`Character ${this} only has ${this.spd}/${this.maxSPD} SPD, so you do not have enough SPD to move a distance of ${distance}.`);
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

		this.spd -= distance;
	}

	attack(count: number, targetLetter: string) {
		if (count > this.spd) {
			throw new Error(`Character ${this} only has ${this.spd}/${this.maxSPD} SPD, so you do not have enough SPD to attack${count === 1 ? '' : ` ${count} times`}.`);
		}

		targetLetter = targetLetter?.toUpperCase();

		let potentialTargets = this.team.getOtherTeam().characters;

		if (targetLetter) {
			potentialTargets = potentialTargets.filter(character => character.letter === targetLetter);

			if (potentialTargets.length === 0) {
				throw new Error(`There is no enemy with the letter '${targetLetter}'.`);
			}
		}

		const target = this.getNearestOf(potentialTargets);

		// `target` is asserted as non-null because the above loop must run at least once.
		if (this.distanceTo(target) > this.rng) {
			throw new Error(`Character ${target} is outside of character ${this}'s range.`);
		}

		const damage = this.atk * count;
		target.damage(damage);

		this.spd -= count;

		return { damage, target };
	}

	getNearestOf(characters: Character[]): Character {
		if (characters.length === 0) {
			throw new TypeError('You cannot get the nearest character of an empty array.');
		}

		let nearestCharacter;

		for (const character of characters) {
			if (nearestCharacter === undefined || this.realDistanceTo(character) < this.realDistanceTo(nearestCharacter)) {
				nearestCharacter = character;
			}
		}

		return nearestCharacter!;
	}

	damage(damage: number) {
		this.hp = Math.max(0, this.hp - damage);

		if (this.hp === 0) {
			this.remove();
		}
	}

	async sendCPUCommand() {
		await timeOut(Character.CPU_COMMAND_DELAY);

		const subcommands: string[] = [];

		const target = this.getNearestOf(this.team.getOtherTeam().characters);

		let spdLeft = this.spd;

		const xDistance = Math.abs(this.x - target.x);
		const yDistance = Math.abs(this.y - target.y);

		if (xDistance > this.rng) {
			const moveDistance = Math.min(xDistance - this.rng, spdLeft);
			const moveDirection = target.x < this.x ? 'left' : 'right';

			subcommands.push(`move ${moveDistance} ${moveDirection}`);

			spdLeft -= moveDistance;
		}

		if (yDistance > this.rng) {
			const moveDistance = Math.min(yDistance - this.rng, spdLeft);
			const moveDirection = target.y < this.y ? 'down' : 'up';

			subcommands.push(`move ${moveDistance} ${moveDirection}`);

			spdLeft -= moveDistance;
		}

		if (spdLeft !== 0) {
			subcommands.push(`attack ${spdLeft} ${target.letter}`);
		}

		const message = await this.battle.channel.send(`>> ${subcommands.join(', ')}`);

		// We can't just let the message event listener handle this because, from our testing, it doesn't always detect it.
		await handleCommand(message);
	}

	resetSPD() {
		this.spd = this.maxSPD;
	}

	remove() {
		this.team.characters.splice(this.team.characters.indexOf(this), 1);
	}

	toString() {
		return `[${this.letter}]`;
	}
}
