# what needs to happen

user has to tell andra for each characters in battle:
- a letter (so up to 26)
- a role (n/a is an option, in case you don't want to be @'d)
- max hp
- current mp
- attack stat
- speed stat

# to-do plan

- implement battles
	- users can create battles with up to 25 characters
	- the bot posts a battle screen
	- users can 'Attack' and 'Move'
	- characters lose HP until they die
		- when all characters on one side have 0 HP, the game is over and the other side wins.
	- import and export battles

# command list

help,
start battle
attack # (#)
move #
special "name of move"

# demo of conversation

user:
>> help

andra:
>> To start a battle, follow this format:
">> start battle
(letter), @Role, HP, MP, ATK, SPD
vs.
(letter), @Role, HP, MP, ATK, SPD
>> You can add more characters to either side, by making a new line.
>> You can also have duplicate letters, such as multiple Enemies (E).

user:
>> start battle
B, @Blue, 25, 14, 6, 6
P, @Purple, 20, 30, 3, 8
vs.
E, @Enemy, 25, 14, 6, 6
E, @Enemy, 25, 14, 6, 6

andra:
>> Battle start!
```js
B - - - - E
P - - - - E
```