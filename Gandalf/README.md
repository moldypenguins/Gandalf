# Gandalf

## Table of Contents
* [Options](#options)
* [Spells (commands)](#spells)

## Options
| option         | description                  |
|----------------|------------------------------|
| --register, -r | register commands in discord |

## Spells
#### Legend
* `<>` Required Parameter
* `[]` Optional Parameter
* `=` Default Parameter Value
* `...` Multiple Parameters Allowed
* `|` OR
* `+` AND/OR


### Built-in
* `!help` Shows list of commands.
* `!links` Shows web links.

### Modules
#### Administration
* `!leavegroup [group_id]=current_group` Leaves a group, supergroup, or channel.
* `!listgroups` Lists groups bot is a member of.
* `!addmem` 
* `!addgalmate <@tg_user>` Adds a TG user as a GalMate.

#### Attacks
* `!claims [attack_number]` List your claims.

#### Calculations
* `!exile` Shows information regarding chances of landing in desired galaxies.
* `!bonusmining [tick]=NOW [bonus]=0` Calculates how many ticks you need to keep the bonus roids to be worth it vs accepting resources.
* `!bonus [tick=NOW] [bonus=0]` Calculates the bonus for a given tick. (bonus argument is provided by PA bonus screen 3% etc.)
* `!roidcost <roids> <value_cost> [mining_bonus]` Calculate how long it will take to repay a value loss capping roids.
* `!tick [tick]=NOW [timezone]=GMT` Calculate when a tick will occur.
* `!refsvsfcs <roids> <metal_refs> <crystal_refs> <eonium_refs> <finance_centers> <government> <mining_population> <cores>` Calculates if you should be building refs or fcs based on inputs

#### Communications
* `!call [@tg_user]` Calls a user via twilio

#### Growth
* `!epenis [@tg_user]`
* `!bigdicks`
* `!loosecunts`

#### Intelligence
* `!lookup [@tg_user|pa_nick|x.y.z]`
* `!intel <x:y|x:y:z> [alliance] [nick]` Displays or sets intel for given coords.
* `!spam <alliance>`
* `!spamset <alliance> <x:y:z>...` Set alliance for multiple coords at once.
* `!oomph <alliance> <ship_class>` List alliance ship counts versus given ship class.

#### Members
* `!contact <pa_nick>` Displays a users TG username.

#### Scans
* `!req <x:y:z> <p+d+n+j+a>` Request scan(s) for given coords.
* `!reqcancel <id>` Cancel a scan request.
* `!reqlinks` Shows a list of scan requests.
* `!findscan <x:y:z> <p+d+n+j+a>` Find scan(s) for given coords.

#### Ships
* `!eff <number> <ship>` Calculates the efficiency of the specified number of ships.
* `!stop <number> <ship>` Calculates the required defense to the specified number of ships.
* `!cost <number> <ship>` Calculates the cost of producing the specified number of ships.
* `!afford <x:y:z> <ship>` Calculates the number of a certain ship the planet can produce based on the most recent planet scan.
* `!ship <ship>` Displays the stats of the specified ship.
* `!launch <class|eta> <land_tick>` Calculates when ships should be launched to land at land tick.

#### Fun
* `!gief` Displays a random image/video.