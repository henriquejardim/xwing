exportObj = exports ? this

exportObj.ships =
    "X-Wing":
        name: "X-Wing"
        faction: "Rebel Alliance"
        attack: 3
        agility: 2
        hull: 3
        shields: 2
        actions: [
            "Focus",
            "Target Lock",
        ]
    "Y-Wing":
        name: "Y-Wing"
        faction: "Rebel Alliance"
        attack: 2
        agility: 1
        hull: 5
        shields: 3
        actions: [
            "Focus",
            "Target Lock",
        ]
    "A-Wing":
        name: "A-Wing"
        faction: "Rebel Alliance"
        attack: 2
        agility: 3
        hull: 2
        shields: 2
        actions: [
            "Focus",
            "Target Lock",
            "Boost",
            "Evade",
        ]
    "YT-1300":
        name: "YT-1300"
        faction: "Rebel Alliance"
        attack: 2
        agility: 1
        hull: 6
        shields: 4
        actions: [
            "Focus",
            "Target Lock",
        ]
    "TIE Fighter":
        name: "TIE Fighter"
        faction: "Galactic Empire"
        attack: 2
        agility: 3
        hull: 3
        shields: 0
        actions: [
            "Focus",
            "Barrel Roll",
            "Evade",
        ]
    "TIE Advanced":
        name: "TIE Advanced"
        faction: "Galactic Empire"
        attack: 2
        agility: 3
        hull: 3
        shields: 2
        actions: [
            "Focus",
            "Target Lock",
            "Barrel Roll",
            "Evade",
        ]
    "TIE Interceptor":
        name: "TIE Interceptor"
        faction: "Galactic Empire"
        attack: 3
        agility: 3
        hull: 3
        shields: 0
        actions: [
            "Focus",
            "Barrel Roll",
            "Boost",
            "Evade",
        ]
    "Firespray-31":
        name: "Firespray-31"
        faction: "Galactic Empire"
        attack: 3
        agility: 2
        hull: 6
        shields: 4
        actions: [
            "Focus",
            "Target Lock",
            "Evade",
        ]

exportObj.pilots =
    "Wedge Antilles":
        name: "Wedge Antilles"
        id: 0
        unique: true
        ship: "X-Wing"
        skill: 9
        points: 29
        slots: [
            "Elite",
            "Torpedo",
            "Astromech",
        ],
        text: """When attacking, reduce the defender's agility value by 1 (to a minimum of "0")."""
    "Garven Dreis":
        name: "Garven Dreis"
        id: 1
        unique: true
        ship: "X-Wing"
        skill: 6
        points: 26
        slots: [
            "Torpedo",
            "Astromech",
        ]
        text: """After spending a focus token, you may place that token on any other friendly ship at Range 1-2 (instead of discarding it)."""
    "Red Squadron Pilot":
        name: "Red Squadron Pilot"
        id: 2
        ship: "X-Wing"
        skill: 4
        points: 23
        slots: [
            "Torpedo",
            "Astromech",
        ]
    "Rookie Pilot":
        name: "Rookie Pilot"
        id: 3
        ship: "X-Wing"
        skill: 2
        points: 21
        slots: [
            "Torpedo",
            "Astromech",
        ]
    "Biggs Darklighter":
        name: "Biggs Darklighter"
        id: 4
        unique: true
        ship: "X-Wing"
        skill: 5
        points: 25
        slots: [
            "Torpedo",
            "Astromech",
        ]
        text: """Other friendly ships at Range 1 cannot be targeted by attacks if the attacker could target you instead."""
    "Luke Skywalker":
        name: "Luke Skywalker"
        id: 5
        unique: true
        ship: "X-Wing"
        skill: 8
        points: 28
        slots: [
            "Elite",
            "Torpedo",
            "Astromech",
        ]
        text: """When defending, you may change 1 of your %FOCUS% results to a %EVADE% result."""
    "Gray Squadron Pilot":
        name: "Gray Squadron Pilot"
        id: 6
        ship: "Y-Wing"
        skill: 4
        points: 20
        slots: [
            "Turret",
            "Torpedo",
            "Torpedo",
            "Astromech",
        ]
    '"Dutch" Vander':
        name: '"Dutch" Vander'
        id: 7
        unique: true
        ship: "Y-Wing"
        skill: 6
        points: 23
        slots: [
            "Turret",
            "Torpedo",
            "Torpedo",
            "Astromech",
        ]
        text: """After acquiring a target lock, choose another friendly ship at Range 1-2.  The chosen ship may immediately acquire a target lock."""
    "Horton Salm":
        name: "Horton Salm"
        id: 8
        unique: true
        ship: "Y-Wing"
        skill: 8
        points: 25
        slots: [
            "Turret",
            "Torpedo",
            "Torpedo",
            "Astromech",
        ]
        text: """When attacking at Range 2-3, you may reroll any of your blank results."""
    "Gold Squadron Pilot":
        name: "Gold Squadron Pilot"
        id: 9
        ship: "Y-Wing"
        skill: 2
        points: 18
        slots: [
            "Turret",
            "Torpedo",
            "Torpedo",
            "Astromech",
        ]
    "Academy Pilot":
        name: "Academy Pilot"
        id: 10
        ship: "TIE Fighter"
        skill: 1
        points: 12
        slots: []
    "Obsidian Squadron Pilot":
        name: "Obsidian Squadron Pilot"
        id: 11
        ship: "TIE Fighter"
        skill: 3
        points: 13
        slots: []
    "Black Squadron Pilot":
        name: "Black Squadron Pilot"
        id: 12
        ship: "TIE Fighter"
        skill: 4
        points: 14
        slots: [
            "Elite",
        ]
    '"Winged Gundark"':
        name: '"Winged Gundark"'
        id: 13
        unique: true
        ship: "TIE Fighter"
        skill: 5
        points: 15
        slots: [ ]
        text: """When attacking at Range 1, you may change 1 of your %HIT% results to a %CRIT% result."""
    '"Night Beast"':
        name: '"Night Beast"'
        id: 14
        unique: true
        ship: "TIE Fighter"
        skill: 5
        points: 15
        slots: [ ]
        text: """After executing a green maneuver, you may perform a free focus action."""
    '"Backstabber"':
        name: '"Backstabber"'
        id: 15
        unique: true
        ship: "TIE Fighter"
        skill: 6
        points: 16
        slots: [ ]
        text: """When attacking from outside the defender's firing arc, roll 1 additional attack die."""
    '"Dark Curse"':
        name: '"Dark Curse"'
        id: 16
        unique: true
        ship: "TIE Fighter"
        skill: 6
        points: 16
        slots: [ ]
        text: """When defending, ships attacking you cannot spend focus tokens or reroll attack dice."""
    '"Mauler Mithel"':
        name: '"Mauler Mithel"'
        id: 17
        unique: true
        ship: "TIE Fighter"
        skill: 7
        points: 17
        slots: [
            "Elite",
        ]
        text: """When attacking at Range 1, roll 1 additional attack die."""
    '"Howlrunner"':
        name: '"Howlrunner"'
        id: 18
        unique: true
        ship: "TIE Fighter"
        skill: 8
        points: 18
        slots: [
            "Elite",
        ]
        text: """When another friendly ship at Range 1 is attacking with its primary weapon, it may reroll 1 attack die."""
    "Maarek Stele":
        name: "Maarek Stele"
        id: 19
        unique: true
        ship: "TIE Advanced"
        skill: 7
        points: 27
        slots: [
            "Elite",
            "Missile",
        ]
        text: """When you attack deals a faceup Damage card to the defender, instead draw 3 Damage cards, choose 1 to deal, and discard the others."""
    "Tempest Squadron Pilot":
        name: "Tempest Squadron Pilot"
        id: 20
        ship: "TIE Advanced"
        skill: 2
        points: 21
        slots: [
            "Missile",
        ]
    "Storm Squadron Pilot":
        name: "Storm Squadron Pilot"
        id: 21
        ship: "TIE Advanced"
        skill: 4
        points: 23
        slots: [
            "Missile",
        ]
    "Darth Vader":
        name: "Darth Vader"
        id: 22
        unique: true
        ship: "TIE Advanced"
        skill: 9
        points: 29
        slots: [
            "Elite",
            "Missile",
        ]
        text: """During your "Perform Action" step, you may perform 2 actions."""
    "Alpha Squadron Pilot":
        name: "Alpha Squadron Pilot"
        id: 23
        ship: "TIE Interceptor"
        skill: 1
        points: 18
        slots: [ ]
    "Avenger Squadron Pilot":
        name: "Avenger Squadron Pilot"
        id: 24
        ship: "TIE Interceptor"
        skill: 3
        points: 20
        slots: [ ]
    "Saber Squadron Pilot":
        name: "Saber Squadron Pilot"
        id: 25
        ship: "TIE Interceptor"
        skill: 4
        points: 21
        slots: [
            "Elite",
        ]
    "\"Fel's Wrath\"":
        name: "\"Fel's Wrath\""
        id: 26
        unique: true
        ship: "TIE Interceptor"
        skill: 5
        points: 23
        slots: [ ]
        text: """When the number of Damage cards assigned to you equals or exceeds your hull value, you are not destroyed until the end of the Combat phase."""
    "Turr Phennir":
        name: "Turr Phennir"
        id: 27
        unique: true
        ship: "TIE Interceptor"
        skill: 7
        points: 25
        slots: [
            "Elite",
        ]
        text: """After you perform an attack, you may perform a free boost or barrel roll action."""
    "Soontir Fel":
        name: "Soontir Fel"
        id: 28
        unique: true
        ship: "TIE Interceptor"
        skill: 9
        points: 27
        slots: [
            "Elite",
        ]
        text: """When you receive a stress token, you may assign 1 focus token to your ship."""
    "Tycho Celchu":
        name: "Tycho Celchu"
        id: 29
        unique: true
        ship: "A-Wing"
        skill: 8
        points: 26
        slots: [
            "Elite",
            "Missile",
        ]
        text: """You may perform actions even while you have stress tokens."""
    "Arvel Crynyd":
        name: "Arvel Crynyd"
        id: 30
        unique: true
        ship: "A-Wing"
        skill: 6
        points: 23
        slots: [
            "Missile",
        ]
        text: """You may declare an enemy ship inside your firing arc that you are touching as the target of your attack."""
    "Green Squadron Pilot":
        name: "Green Squadron Pilot"
        id: 31
        ship: "A-Wing"
        skill: 3
        points: 19
        slots: [
            "Elite",
            "Missile",
        ]
    "Prototype Pilot":
        name: "Prototype Pilot"
        id: 32
        ship: "A-Wing"
        skill: 1
        points: 17
        slots: [
            "Missile",
        ]
    "Outer Rim Smuggler":
        name: "Outer Rim Smuggler"
        id: 33
        ship: "YT-1300"
        skill: 1
        points: 27
        slots: [
            "Crew",
            "Crew",
        ]
    "Chewbacca":
        name: "Chewbacca"
        id: 34
        unique: true
        ship: "YT-1300"
        skill: 5
        points: 42
        slots: [
            "Elite",
            "Missile",
            "Crew",
            "Crew",
        ]
        text: """When you are dealt a faceup Damage card, immediately flip it facedown (without resolving its ability)."""
        ship_override:
            attack: 3
            agility: 1
            hull: 8
            shields: 5
    "Lando Calrissian":
        name: "Lando Calrissian"
        id: 35
        unique: true
        ship: "YT-1300"
        skill: 7
        points: 44
        slots: [
            "Elite",
            "Missile",
            "Crew",
            "Crew",
        ]
        ship_override:
            attack: 3
            agility: 1
            hull: 8
            shields: 5
        text: """After you execute a green maneuver, choose 1 other friendly ship at Range 1.  That ship may perform 1 free action shown on its action bar."""
    "Han Solo":
        name: "Han Solo"
        id: 36
        unique: true
        ship: "YT-1300"
        skill: 9
        points: 46
        slots: [
            "Elite",
            "Missile",
            "Crew",
            "Crew",
        ]
        ship_override:
            attack: 3
            agility: 1
            hull: 8
            shields: 5
        text: """When attacking, you may reroll all of your dice.  If you choose to do so, you must reroll as many of your dice as possible."""
    "Kath Scarlet":
        name: "Kath Scarlet"
        id: 37
        unique: true
        ship: "Firespray-31"
        skill: 7
        points: 38
        slots: [
            "Elite",
            "Cannon",
            "Bomb",
            "Crew",
            "Missile",
        ]
        text: """When attacking, the defender receives 1 stress token if he cancels at least 1 %CRIT% result."""
    "Boba Fett":
        name: "Boba Fett"
        id: 38
        unique: true
        ship: "Firespray-31"
        skill: 8
        points: 39
        slots: [
            "Elite",
            "Cannon",
            "Bomb",
            "Crew",
            "Missile",
        ]
        text: """When you reveal a bank maneuver (%EASYLEFT% or %EASYRIGHT%), you may rotate your dial to the other bank maneuver of the same speed."""
    "Krassis Trelix":
        name: "Krassis Trelix"
        id: 39
        unique: true
        ship: "Firespray-31"
        skill: 5
        points: 36
        slots: [
            "Cannon",
            "Bomb",
            "Crew",
            "Missile",
        ]
        text: """When attacking with a secondary weapon, you may reroll 1 attack die."""
    "Bounty Hunter":
        name: "Bounty Hunter"
        id: 40
        ship: "Firespray-31"
        skill: 3
        points: 33
        slots: [
            "Cannon",
            "Bomb",
            "Crew",
            "Missile",
        ]


exportObj.pilotsById = {}
for pilot_name, pilot of exportObj.pilots
    exportObj.pilotsById[pilot.id] = pilot

exportObj.upgrades =
    "Ion Cannon Turret":
        name: "Ion Cannon Turret"
        id: 0
        slot: "Turret"
        points: 5
        attack: 3
        range: "1-2"
        text: """Attack: Attack 1 ship (even a ship outside your firing arc).

                 If this attack hits the target ship, the ship suffers 1 damage and receives 1 ion token.  Then cancel all dice results."""
    "Proton Torpedoes":
        name: "Proton Torpedoes"
        id: 1
        slot: "Torpedo"
        points: 4
        attack: 4
        range: "2-3"
        text: """Attack (target lock): Spend your target lock and discard this card to perform this attack.

                You may change 1 of your %FOCUS% results to a %CRIT% result."""
    "R2 Astromech":
        name: "R2 Astromech"
        id: 2
        slot: "Astromech"
        points: 1
        text: """You may treat all 1- and 2-speed maneuvers as green maneuvers."""
    "R2-D2":
        name: "R2-D2"
        id: 3
        unique: true
        slot: "Astromech"
        points: 4
        text: """After executing a green maneuver, you may recover 1 shield (up to your shield value)."""
    "R2-F2":
        name: "R2-F2"
        id: 4
        unique: true
        slot: "Astromech"
        points: 3
        text: """Action: Increase your agility value by 1 until the end of this game round."""
    "R5-D8":
        name: "R5-D8"
        id: 5
        unique: true
        slot: "Astromech"
        points: 3
        text: """Action: Roll 1 defense die.

                 On a %EVADE% or %FOCUS% result, discard 1 of your facedown Damage cards."""
    "R5-K6":
        name: "R5-K6"
        id: 6
        unique: true
        slot: "Astromech"
        points: 2
        text: """After spending your target lock, roll 1 defense die.

                 On a %EVADE% result, immediately acquire a target lock on that same ship.  You cannot spend this target lock during this attack."""
    "R5 Astromech":
        name: "R5 Astromech"
        id: 7
        slot: "Astromech"
        points: 1
        text: """During the End phase, you may choose 1 of your faceup Damage cards with the Ship trait and flip it facedown."""
    "Determination":
        name: "Determination"
        id: 8
        slot: "Elite"
        points: 1
        text: """When you are dealt a faceup Damage card with the Pilot trait, discard it immediately without resolving its effect."""
    "Swarm Tactics":
        name: "Swarm Tactics"
        id: 9
        slot: "Elite"
        points: 2
        text: """At the start of the Combat phase, choose 1 friendly ship at Range 1.

                 Until the end of this phase, treat the chosen ship as it its pilot skill were equal to your pilot skill."""
    "Squad Leader":
        name: "Squad Leader"
        id: 10
        unique: true
        slot: "Elite"
        points: 2
        text: """Action: Choose 1 ship at Range 1-2 that has a lower pilot skill than you.

                 The chosen ship my immediately perform 1 free action."""
    "Expert Handling":
        name: "Expert Handling"
        id: 11
        slot: "Elite"
        points: 2
        text: """Action: Perform a barrel roll.  If you do not have the %BARREL_ROLL% action icon, receive 1 stress token.

                 You may then remove 1 enemy target lock from your ship."""
    "Marksmanship":
        name: "Marksmanship"
        id: 12
        slot: "Elite"
        points: 3
        text: """Action: When attacking this round, you may change 1 of your %FOCUS% results to a %CRIT% result and all of your other %FOCUS% results to %HIT% results."""
    "Concussion Missiles":
        name: "Concussion Missiles"
        id: 13
        slot: "Missile"
        points: 4
        attack: 4
        range: "2-3"
        text: """Attack (target lock):  Spend your target lock and discard this card to perform this attack.

                 You may change 1 of your blank results to a %HIT% result."""
    "Cluster Missiles":
        name: "Cluster Missiles"
        id: 14
        slot: "Missile"
        points: 4
        attack: 3
        range: "1-2"
        text: """Attack (target lock): Spend your target lock and discard this card to perform this attack twice."""
    "Daredevil":
        name: "Daredevil"
        id: 15
        slot: "Elite"
        points: 3
        text: """Action: Execute a red (%HARDLEFT% 1) or (%HARDRIGHT% 1) maneuver.

                 Then, if you do not have the %BOOST% action icon, roll 2 attack dice.  Suffer any damage (%HIT%) and any critical damage (%CRIT%) rolled."""
    "Elusiveness":
        name: "Elusiveness"
        id: 16
        slot: "Elite"
        points: 2
        text: """When defending, you may receive 1 stress token to choose 1 attack die.  The attacker must reroll that die.

                 If you have at least 1 stress token, you cannot use this ability."""
    "Homing Missiles":
        name: "Homing Missiles"
        id: 17
        slot: "Missile"
        attack: 4
        range: "2-3"
        points: 5
        text: """Attack (target lock): Discard this card to perform this attack.

                 The defender cannot spend evade tokens during this attack."""
    "Push the Limit":
        name: "Push the Limit"
        id: 18
        slot: "Elite"
        points: 3
        text: """Once per round, after you perform and action, you may perform 1 free action shown in your action bar.

                 Then receive 1 stress token."""
    "Deadeye":
        name: "Deadeye"
        id: 19
        slot: "Elite"
        points: 1
        text: """You may treat the 'Attack (target lock):' header as 'Attack (focus):'.

                 When an attack instructs you to spend a target lock, you may spend a focus token instead."""
    "Expose":
        name: "Expose"
        id: 20
        slot: "Elite"
        points: 4
        text: """Action: Until the end of the round, increase your primary weapon value by 1 and decrease your agility value by 1."""
    "Gunner":
        name: "Gunner"
        id: 21
        slot: "Crew"
        points: 5
        text: """After you perform an attack that does not hit, immediately perform a primary weapon attack.  You cannot perform another attack this round."""
    "Ion Cannon":
        name: "Ion Cannon"
        id: 22
        slot: "Cannon"
        points: 3
        attack: 3
        range: "1-3"
        text: """Attack: Attack 1 ship.

                 If this attack hits, the defender suffers 1 damage and receives 1 ion token.  Then cancel all dice results."""
    "Heavy Laser Cannon":
        name: "Heavy Laser Cannon"
        id: 23
        slot: "Cannon"
        points: 7
        attack: 4
        range: "2-3"
        text: """Attack: Attack 1 ship.

                 Immediately after rolling your attack dice, you must change all of your %CRIT% results to %HIT% results."""
    "Seismic Charges":
        name: "Seismic Charges"
        id: 24
        slot: "Bomb"
        points: 2
        text: """When you reveal your maneuver dial, you may discard this card to drop 1 seismic charge token.

                 This token detonates at the end of the Activation phase."""
    "Mercenary Copilot":
        name: "Mercenary Copilot"
        id: 25
        slot: "Crew"
        points: 2
        text: """When attacking at Range 3, you may change 1 of your %HIT% results to a %CRIT% result."""
    "Assault Missiles":
        name: "Assault Missiles"
        id: 26
        slot: "Missile"
        points: 5
        attack: 4
        range: "2-3"
        text: """Attack (target lock): Spend your target lock and discard this card to perform this attack.

                 If this attack hits, each other ship at Range 1 of the defender suffers 1 damage."""
    "Veteran Instincts":
        name: "Veteran Instincts"
        id: 27
        slot: "Elite"
        points: 1
        text: """Increase your pilot skill value by 2."""
    "Proximity Mines":
        name: "Proximity Mines"
        id: 28
        slot: "Bomb"
        points: 3
        text: """Action: Discard this card to drop 1 proximity mine token.

                 When a ship executes a maneuver, if its base or maneuver template overlaps this token, this token detonates."""
    "Weapons Engineer":
        name: "Weapons Engineer"
        id: 29
        slot: "Crew"
        points: 3
        text: """You may maintain 2 target locks (only 1 per enemy ship).

                 When you acquire a target lock, you may lock onto 2 different ships."""
    "Draw Their Fire":
        name: "Draw Their Fire"
        id: 30
        slot: "Elite"
        points: 1
        text: """When a friendly ship at Range 1 is hit by an attack, you may suffer 1 of the uncanceled %CRIT% results instead of the target ship."""
    "Luke Skywalker":
        name: "Luke Skywalker"
        id: 31
        unique: true
        faction: "Rebel Alliance"
        slot: "Crew"
        points: 7
        text: """After you perform an attack that does not hit, immediately perform a primary weapon attack.  You may change 1 %FOCUS% result to a %HIT% result.  You cannot perform another attack this round."""
    "Nien Nunb":
        name: "Nien Nunb"
        id: 32
        unique: true
        faction: "Rebel Alliance"
        slot: "Crew"
        points: 1
        text: """You may treat all %STRAIGHT% maneuvers as green maneuvers."""
    "Chewbacca":
        name: "Chewbacca"
        id: 33
        unique: true
        faction: "Rebel Alliance"
        slot: "Crew"
        points: 4
        text: """When you are dealt a Damage card, you may immediately discard that card and recover 1 shield.

                 Then, discard this Upgrade card."""

exportObj.upgradesById = {}
for upgrade_name, upgrade of exportObj.upgrades
    exportObj.upgradesById[upgrade.id] = upgrade

exportObj.modifications =
    "Stealth Device":
        name: "Stealth Device"
        id: 1
        points: 3
        text: """Increase your agility value by 1.  If you are hit by an attack, discard this card."""
    "Shield Upgrade":
        name: "Shield Upgrade"
        id: 2
        points: 4
        text: """Increase your shield value by 1."""
    "Engine Upgrade":
        name: "Engine Upgrade"
        id: 3
        points: 4
        text: """Your action bar gains the %BOOST% action icon."""

exportObj.modificationsById = {}
for modification_name, modification of exportObj.modifications
    exportObj.modificationsById[modification.id] = modification

exportObj.titles =
    "Slave I":
        name: "Slave I"
        id: 1
        unique: true
        points: 0
        ship: "Firespray-31"
        slots: [
            "Torpedo",
        ]
        text: """Your upgrade bar gains the %TORPEDO% upgrade icon."""
    "Millennium Falcon":
        name: "Millennium Falcon"
        id: 2
        unique: true
        points: 1
        ship: "YT-1300"
        actions: "Evade"
        text: """Your action bar gains the %EVADE% action icon."""

exportObj.titlesById = {}
for title_name, title of exportObj.titles
    exportObj.titlesById[title.id] = title
