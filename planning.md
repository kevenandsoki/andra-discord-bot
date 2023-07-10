# what needs to happen

user has to tell andra for each characters in battle:
- a letter (so up to 26)
- a role (n/a is an option, in case you don't want to be @'d)
- max hp
- attack stat
- range
- speed stat

# to-do plan

~~- atomic operations~~
- VERY primitive AI for grinding
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

# pain and suffering

~~- SPD usage should be cumulative between subcommands~~
~~- it sent the board and updated the turn even though the atomic operation failed~~
~~- one subcommand's success persisted even though the second one failed~~

~~idea: just copy the properties that are not deep of the battle (e.g. turnCharacter, hp), and array mutations such as character removal must also be reverted~~

# f*** typescript counter

||