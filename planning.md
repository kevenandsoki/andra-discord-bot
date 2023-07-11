# what needs to happen

user has to tell andra for each characters in battle:
- a letter (so up to 26)
- a role (n/a is an option, in case you don't want to be @'d)
- max hp
- attack stat
- range
- speed stat

# to-do plan

~~- finish VERY primitive AI for grinding~~
- file-sharing

# command list

i love you andra :D
help
start battle
end battle
attack # (#)
move #
save battle preset
load battle preset
delete battle preset
list battle preset

# demo of conversation

user:
>> help

andra:
>> To start a battle, follow this format:
">> start battle
(letter), @Role, HP, MP, ATK, RNG, SPD
vs.
(letter), @Role, HP, MP, ATK, RNG, SPD
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

# LETS DO THIS!!!

~~a team can be set as CPU-controlled by putting 'CPU' as the role.~~
~~1.) when the turn is updated, the turnCharacter is checked to see if they are a CPU.~~
~~2.) if they are, it runs an operation that calculates their next move. it's as follows:~~
~~		if an enemy is within their attacking range, attack as many times as they can.~~
~~		if they're not in range, move forward one.~~
~~		this repeats until they are out of SPD.~~
~~3.) their move is executed, and andra posts the CPU's move as a command~~
~~		(note, user input for CPUs is not detected nor allowed)~~
~~4.) when their turn is over, the turn's updated as usual, and this repeats back to 1.)~~

~~- users shouldnt act as CPUs~~
~~- battle.turnCharacter is undefined when CPU defeats next character in attack (pinned)~~

# f*** typescript counter

||

# better than grant counter

|