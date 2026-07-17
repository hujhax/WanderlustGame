# General
When you fix a bit, update Wanderlust.md only if and only if the bugfix *contradicts* the descriptions in that file or *adds new functionality*.  If you do update Wanderlust.md, make the update as minimal as possible.

If a bug report is unclear, ask for clarification; otherwise, proceed as much as you can without interaction with me.

Produce a list of unused assets in the WanderlustGame directory.

Try to speed up asset loading across the board.

## Cast
No changes.

## Dialog
Expand the dialog box to include a black background behind the "Press Enter to Continue" message.  That message should always appear below the dialog, always within the dialog box, never in front of other game content.

Make sure the character name does not extend beyond the black background box (as it currently does for the text "Blair the Stylish Pirate" for the intro screen for the fishing minigame).

If you split one prompt into multiple sections to fit it in the dialog rectangle, add a little continuation indicator to each section but the last.

# Gameplay
The following subsections explain the phases of the video game in order.

## Intro Screen
No changes.

## Title Screen
No changes.

## Choose Your Traveler
No changes.

## Partner Announcement
No changes.

## Departure Cutscene
For each subdirectory in images/sprites/cast, create a standard/wave.png file.  This file should have a four-sprite series that depicts the character facing forward with their arm (either right or left, choose at random for the whole file) raised and waving.  So: their palm faces forward, their arm is raised, their arm moves from the left to the right.

In the departure cutscene, all the characters not in the car should be waving.  To depict this, ping-pong through the sprite images in the appropriate wave.png file.


## In the Car
Add a progress-bar indicator labeled "Depth and Intimacy of Conversation".  It is a vertical rectangle, and the fill has a gradient from blue (low) to red (high).  It starts halfway full.  Each Truth increases the fill by one eighth.  Each Insult reduces the fill by one eight.  (Each Bland has no effect.)  If the indicator gets at least ⅞ full it starts shooting yellow sparks from the top.

## Minigames
Many game titles include a parenthetical, for instance: "Fromagerie Frenzy! (Formerly Supermarket Sweep)".  In this case, display the parenthetical phrase below the main title on the minigame's opening screen in a slightly smaller font.

Only show "Press Enter to Continue" on the closing screen when the closing dialog is complete.


### Catch That Chicken
Make the skulls twice as large, and have them occasionally jump off the ground to half the height of the player.  Also make them 50% more common.

### Mathemagic!
Make the math questions slightly harder.

### Bumpertown! (Population Bump)
Improve the collision detection with the environment.  The cars should bounce off of (1) the straight border wall on the left (the rightmost part of the wall is a vertical beige line that can serve as the border for collision detection), (2) the zigzag white border on the top, (3) the zigzag green borders on the right and bottom

### Karaoke Night
No changes

### Fromagerie Frenzy! (Formerly Supermarket Sweep)
If the player performs a match that wins the minigame, show the full animation of the game-winning match before proceeding to the "Great Job!" screen.

### Obligatory Fishing Minigame
Change the name to "Lake Fish-a-Lot (AKA Obligatory Fishing Minigame)"

### Bob's Intense Mini-Golf
Make the max power for a golf swing slightly more powerful.

> "It [the power bar] should move faster at the 'full' end."
^^ This behavior is currently undetectable; make it slightly more pronounced.

Blank out the power indicator once the ball has come to a stop.

Put a faint drop shadow behind the green "SUCCESS!" text.

Create an equivalent "FAILURE!" message in red if the third stroke doesn't reach the hole.

Place the stroke indicator (e.g., "Stroke #1") on the top-right part of the screen, to the right of the success and failure indicators.

Horizontally center the hole title and the power-bar + title.

Make the ball speed up when it goes from a white region in the info file to a black region (instead of slowing down).

What follows are further bug fixes for individual holes:

#### The Bunny Slope
No changes.

#### Z-Time
Remove the three short horizontal barriers along the center of the Z.  This includes replacing the barriers with the green in greens/golf_2.png, and removing the equivalent green shapes from info/golf_2.png.

#### The D-D-D-DROP!
No fixes.

#### The Unholy Asterisk
Make the lump in the center of the asterisk an obstacle for the ball.  You can do this by creating an equivalent green shape in the info file. 

#### Do U Know the Shortcut?
Change this title to "O NOOOO".

The gray rock formation the southwest of the course should be an obstacle.  You can implement this by creating an equivalent green shape in the info file. 

#### O NOOOOO
Change this title to "Do U Know the Shortcut?".

### Canadian Jeopardy

#### Preparing the clues
I've made updates to clues.json.  Please update clues_data.js to reflect them.

#### The Game Itself

##### Intro and General Info
Update "Your knowledge of Canadian culture, history, and trivia will be tested by me, a Legitimate Canadian™" to "Your knowledge of Canadian culture, history, and trivia will be tested by me, Lindsey, a Legitimate Canadian™."


##### Gameplay
When you display a clue, make sure the dollar amount at the top of the screen is not overlapped by the failure indicators.  Basically shift everything down so it stays out of the success/failure indicators' way.  (Likewise when you present the multiple-choice options, shift everything down a tiny bit to visually give the success/failure indicators a little more breathing room.)



### Unpleasant Goose Game
[Major changes to this]

#### The Gameboards
Use [this image](https://static.vecteezy.com/system/resources/previews/059/379/694/non_2x/pixel-art-goose-illustration-retro-8-bit-style-digital-graphic-vector.jpg) for the goose.  Knock out the white background so it has a transparent background.  This shows the goose aimed East.  Rotate it it 90°, 180°, and 270° to show it facing South, West, or North.

Use [this image](https://www.shutterstock.com/image-/pixel-art-icon-stone-game-260nw-2512267523.jpg) for a boulder.  Note that the boulder is in the center of the image, and you can knock out the navy background.

Use `ocean.gif` from [this page](https://opengameart.org/content/animated-ocean-tile), scaled up to the appropriate size, for the water.

Use the appropriate tile from images/elements/goose_tilset.png (second from the top, second from the left), scaled to the appropriate size, for the grass image.


#### Goose Behavior
Define line of sight this way: if a line from the center of the goose square to the center of the player square does not pass through any square that blocks line of sight, the goose has line of sight to the player.

If the goose has line of sight to the player at the start of the turn, rotate the goose to track the player as both entitities take their moves.  If the goose loses line of slight during the player move, rotate the goose to whichever cardinal direction (NESW) it was closest to when the player "disappeared".

A goose always moves towards a player if it has line of sight on the player.  If it has line of sight, the goose will move one square closer to the player on its turn.  The goose can move diagonally under these circumstances.




## The Confrontation
Switch the "s" key to do a kick; use the appropriate sprites in `kick.png` to animate this, and set the hitboxes accordingly.

Update the instructions to "press 'a' to punch, 's' to kick".

## Separate Ways
No changes.

## On Your Own?
Switch the "s" key to do a kick; use the appropriate sprites in `kick.png` to animate this, and set the hitboxes accordingly.

Update the instructions to "press 'a' to punch, 's' to kick".


## Together Again
Translate both figures 20 pixels down, or whatever is the appropriate amount so that the seated figure seems to be seated on the ground.


## Closing Interview
No changes.


## Closing Credits
No changes.
