export default class Character {
	constructor(team, letter, roleID, hp, mp, atk, spd) {
		this.team = team;
		this.battle = this.team.battle;
		this.channel = this.battle.channel;

		this.letter = letter.toUpperCase();
		this.role = this.channel.guild.roles.resolve(roleID);
		this.hp = +hp;
		this.mp = +mp;
		this.atk = +atk;
		this.spd = +spd;

		if (this.team.isNth(0)) {
			this.x = 0;
		} else {
			this.x = this.battle.width - 1;
		}

		this.goToLeastCrowdedRow();

		this.team.characters.push(this);
	}

	goToLeastCrowdedRow() {
		const yValues = [...new Array(this.battle.height)].map((_, i) => i);

		const rowCharacterCounts = yValues.map(y => this.battle.getCharactersByPos({ x: this.x, y }).length);
		const leastRowCharacterCount = Math.min(...rowCharacterCounts);
		const leastCrowdedRows = yValues.filter(y => this.battle.getCharactersByPos({ x: this.x, y }).length === leastRowCharacterCount);

		this.y = leastCrowdedRows[Math.floor(Math.random() * leastCrowdedRows.length)];
	}

	move(distance, direction) {
		if (distance > this.spd) {
			throw new Error(`Character ${this.letter}'s SPD is ${this.spd}, so you cannot move that far.`);
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
			throw new Error(`You tried to move character ${this.letter} out of bounds.`);
		}

		this.x = x;
		this.y = y;
	}

	static fromString(team, string) {
		const match = string.match(/^([a-z]), (?:N\/A|<@&(\d+)>), (\d+), (\d+), (\d+), (\d+)/i);
		const [, letter, roleID, hp, mp, atk, spd] = match;

		return new Character(team, letter, roleID, hp, mp, atk, spd);
	}
}
