The Gathering Artificial Intelligence 2014
======
####Team (need to find a teamname)'s bot for The Gathering 2014 AI Programming compo   

Will probably be written in js and run in browser. This makes it able to run extensive and intuitive debugging. JS should be the language wich is the most common when comparing our experience in programming. This is of course open for discussion.

---

We can use EmberJS to connect to a template and update it in real time.   

Debugging:
- Status-display
- Map
 - Path
 - Other Players
 - Powerups
- Actionlog
- Ability to pause bot(?)

---

####Behaviour

1. Handle bombs diagonally
2. Do not kill real humans
3. Random like a boss?
4. Evasive Behaviour - Stay away from other bots if there are > 2 other bots on the map, to prevent lockins.

---

#### Requirement specs on tactics

**Defencive mode**   
The bots defaultmode.

It tries to stay away from other players, while trying to get powerups (whenever those are implemented). 



**Offencive mode**   
*Triggered if*   

1. There's only two players left on the map
2. Another player comes too close
 - In this case, it'll be checked if there's an escaperoute one can use whilst dropping a bomb.
