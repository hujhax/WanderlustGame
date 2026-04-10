# Wanderlust

# General
Wanderlust is a video game that uses NES-style pixel-art graphics and chiptune-style music and sound effects.

If the folder does not include a graphic asset, search the web for "[name of asset] pixel art", download what you find, and use that.

If the folder does not include a sound asset, search the web for "[name of sound effect] nintendo", download what you find, and use that.

This game is written in Vanilla JS and Canvas to run in a browser.

## Cast
This game has eight "cast members", and each has a "head shot" image in the /images/cast directory, and a folder of sprites in the /images/sprites/cast directory:
1. Claire: claire.png
1. Gilbert: gilbert.png
1. Jason: jason.png
1. Krystal: krystal.png
1. Patrice: patrice.png
1. Peter: peter.png
1. Sam: sam.png
1. Velvet: velvet.png

## Dialog
Throughout this game, to display a piece of dialog, show a wide black rectangle.  In the left part of the rectangle is a square that will show the cast member image.  Centered below that square is the character name, word-wrapped if necessary to avoid extending past the left and right edges of the square.  In the right side of the rectangle, show the dialog message.

Below the rectangle, show a "Press Enter to Continue" message.

If a piece of dialog is too long to display in the dialog rectangle, split it into multiple sections that do fit in the dialog rectangle.  The player can hit enter to proceed from one section to the next.

Dialog is written in this document like this:
[Character name] ([actor name]) {[style]}: text

So for this example:
Mr. Willis (Jason): Hello world!

You would display Jason's head shot in the square, label it "Mr. Willis", and set the dialog block to "Hello world!"

"style" is an optional tag, and it can take the values "silhouette" and "inverted".
"silhouette" means, instead of drawing the head shot, you draw a black silhouette of the head shot against a gray background.
"inverted" means you draw the head shot with the colors inverted, like a photographic negative.



# Gameplay
The following subsections explain the phases of the video game in order.

## Intro Screen
Centered white text on a black background reads "Click to Start".
When the user clicks, proceed to the Title Screen.

## Title Screen
The title "WANDERLUST" has a faint drop shadow behind it.

This shows an animation loop of a station wagon driving along a highway at sunset with white fluffy clouds in the sky (use the 'cloud.png' file in the /images subdirectory for the clouds).  We see the car from a distance, driving left to right on the screen.  The car is centered in the screen; the road moves past it, as does the occasional tree on the far side of the road.  Do not use the anything in the images directory for the station wagon on this screen.

The background music for this phase is a chiptune version of "Chicago" by Sufjan Stevens, available [here](https://www.youtube.com/watch?v=xHGH2iiaPcQ).  Download it as a media file and play it in the game.  Start the track at the twelve second mark.

At the bottom center are the words "Press Enter to Start", written in the [Nintendo Font](https://fontstruct.com/fontstructions/show/406653/nintendo_nes_font).  If the user presses enter, we go to the next phase.

## Choose Your Traveler
This shows a character-select screen.  The title of the screen says "CHOOSE YOUR TRAVELER" in the Nintendo font.  The screen shows 8 boxes, arranged four by two, each showing a cast member head shot, and each labeled with the cast member name.

The player uses arrow keys to select a box and presses the enter key to proceed to the next phase.

The player can also click a box to select it and proceed to the next phase.

Play a short, percussive sound effect when the player moves to a new box or selects a traveler.

The background music for this phase is "Best Friend", available [here](http://youtu.be/42Yw2Llnwzw). Download it as a media file and play it in the game.


## Partner Announcement
This screen tells the player who their traveling companion is.

This is based on which cast member they chose in Choose Your Traveler.

There are four pairs:
1. Jason and Peter
2. Patrice and Gilbert
3. Velvet and Claire
4. Sam and Krystal

Onscreen text says "Your traveling companion is... " and then the first name of their character's partner in the pair, and then an exclamation point.

A large box onscreen shows the partner's head shot.

Text at the bottom of this screen says "Press Enter to Continue".

The background music for this phase is the victory Zelda music, available [here](https://www.youtube.com/watch?v=uinctpSn9_w).  Download it as a media file and play it in the game.

When the player presses Enter on this screen, proceed to the Departure Cutscene, even if the background music has not finished playing yet.

## Departure Cutscene
For the background image of this screen, pull the image from https://images.stockcake.com/public/1/3/3/1334aeeb-1ada-4302-a5b1-104d7330f413_large/cozy-pixel-cottage-stockcake.jpg and scale it to the canvas.  

This screen shows a pixel-art animation of a station wagon leaving a house.

Show the station wagon leaving along the street, going left to right along the road depicted in the background image.; use the image from /images/station_wagon.png.

Show the sprites for the player and the companion sitting in the car (use the fourth row of sprites in the "sit.png" file for each) -- we should just see their heads, the top half of the sprites, in the front and rear windows.

Show the sprites for all the other cast members standing in front of the house (and not the tree to the left of the house).  (Use the third row of sprites in the "slash.png" file.) Their animation cycles should be randomly out of sync with each other.

The background music for this phase is a chiptune version of "Chicago" by Sufjan Stevens, available [here](https://www.youtube.com/watch?v=xHGH2iiaPcQ).  Download it as a media file and play it in the game.  Start the track at the thirty second mark.

When this is done, automatically proceed to the first Minigame.

## Minigames
In the Minigames phase, we play three minigames, chosen from the subsections below, with no repeats.

The opening screen of each minigame shows:
1. A string that reads "Stop #" and then the number of this stop (1, 2, or 3 -- set the stop number to 1 when the player starts or restarts the game).
2. The title of the minigame
3. A pixel-art map of Canada (see "canada map.jpg"), with a bright orange dotted line, with a bit of outer glow, going from Ottawa to Vancouver.  Minigame #1 adds a red "x" to the map ¼ of the way along the route.  Minigame #2 instead adds a red "x" to the map ½ of the way along the route.  Minigame #3 instead adds a red "x" to the map ¾ of the way along the route.
4. The instructtions "Press Enter to Continue".

The opening screen has no background music.

When the user presses Enter, we proceed to the minigame.

At the start of each minigame, the game shows the minigame screen with a piece of introductory dialog.  This introductory dialog is different for each minigame.

Each minigame shows:
1. The player's current score
2. A counter for successes.  This starts as four empty green circles, which fill in as the player achieves successes in the minigame.
3. A counter for failures.  This starts as three empty red squares, which fill in as the player achieves failures in the minigame.

When the player achieves four successes, they win the minigame and receive a 1,000-point bonus.  The game plays a "ta-da!" sound.

When the player achieves three failures, they lose the minigame and receive no bonus.  The game plays a "sad trombone" sound.

Either way, the game then proceeds to the post-minigame screen, which includes:
1. A message to the player — "Great job!" if they won, "Too bad!" if they lost.
2. A piece of dialog from the character associated with winning or losing the minigame, as appropriate — these are different for each minigame.
3. The instructions "Press Enter to Continue".

If the player presses enter, they proceed either to (1) the next minigame (for the first two minigames) or (2) the The Confrontation phase (for the third minigame).

Note: for debugging purposes, each minigame has a "query string name".  If a game has a query string name of "foo", and the full game is started with the query parameter "minigame=foo", then the game will start directly with that minigame as if it's stop number 1, and after the post-minigame screen, we just restart that same minigame as stop number 1.  Otherwise, the game runs normally.

### Catch That Chicken
Query string name is "chicken".

This minigame's background music is "Bluegrass in the Year 20XX", available at https://www.youtube.com/watch?v=fTBnJ-LhDSA.

Introductory dialog:
Farmer Lucky (Jason): "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!"

The game screen represents the player as a running figure on the left side of the screen, staying in place.  The player runs along a dirt road.  Behind the player, occasional trees and move by slowly, in parallax.

Text at the bottom of the screen reads "Press Enter to Jump".

There are a hundred chickens along this road.  At most two are visible at the start of the game; the rest are somewhere down the road.  All the chickens are running to the right, but slightly slower than the player.

Occasionally there are cow skulls along the ground.  They don't move, so they appear to move left at the speed the player is running.

If the player presses Enter, the running figure jumps up high enough to easily clear a cow skull.

For the background, use the image at https://thumbs.dreamstime.com/b/pixelated-idyllic-farm-scene-red-barn-golden-field-charming-pixel-art-depiction-nestled-sun-drenched-under-bright-summer-359321595.jpg?w=992 -- scale it larger than the canvas and move it towards the left very slowly, in parallax; loop the image horizontally.
Use the sprites in /images/sprites/chicken.png -- specifically the first row -- to depict a running chicken.  That first row has sixteen images of the chicken, each one approximately square.  Shrink the chickens by 50%; onscreen they should appear as half the size of the sprites on file.
Use /images/cow-skull.png for the cow skulls.
To show the character running, use the sprites in row 4 of run.png (in the selected character sprite directory) that show the character running to the right.
To show the character jumping, use the sprites in row 4 of jump.png (in the selected character sprite directory) that show the character running to the right.
If there is no selected character (say, in debug mode), default to Peter.
Double the size of the player -- onscreen they should appear as double the size of the sprites on file.
For the dirt path that the character runs on, use imaes/country_road.png.
The screen below the dirt path image should be a similar green as the grass in the dirt path image.
Use /images/tree.png for the trees; scale them up by a random quantity between 80% and 120%, flip half of them left-to-right, and make sure the bottom of the tree sits behind the grass in the dirt path image.  Make sure all the trees draw behind the dirt path in z order.

Make sure the bottoms of the chicken spirtes, the bottoms of the cow skulls, and the bottom of the player sprites are all at the same height, and that height is at the middle of the dirt path.

If the player makes contact with a chicken, play a "success" sound, remove the contacted chicken from the game, give the player 100 points, and increase the success counter.

If the player makes contact with a cow skull, play a "failure" sound, remove the contacted cow skull from the game, and increase the failure counter.

Post-minigame dialog:
If the player won:
Farmer Lucky (Jason): Thanks for catching my chickens!
If the player lost:
Farmer Lucky (Jason): You have failed this farm. Never return here again.


### Mathemagic!
Query string name is "math".

This minigame's background music is "Big Giant Circles - The Glory Days: Houston'", available at https://www.youtube.com/watch?v=ALq1ENqfu8E.

Introductory dialog:
Mr. Bergemot (Peter): Well if it isn't our favorite former mathlete! Welcome back to your old school — wanna see if you've still got what it takes?
 
The game screen shows Peter standing in front of a chalkboard.

Via dialog, Mr. Bergemot (Peter) asks the player a simple arithmetic question for which the answer is a nonnegative number.

Then additional screen text reads "Type in your answer and press enter."

Then the game shows a ten-second counter, counting down.


If the answer is correct, it counts as a success.  The player gets 100 points.  The next question will be much, much more difficult.

If the answer is incorrect, or the timer runs down to zero, it counts as a failure.  The next question will be easier.

Mr. Bergemot (Peter) continues asking questions until the player has either four successes or three failures.

Post-minigame dialog:
If the player won:
Mr. Bergemot (Peter): Wow! You're still a top-tier mathlete!
If the player lost:
Mr. Bergemot (Peter): That's too bad.  *sigh*  Really I blame myself.


### Karaoke Night
Query string name is "karaoke".

This minigame's background music is "Total Eclipse of the Heart [8 Bit Tribute to Bonnie Tyler]", available at https://www.youtube.com/watch?v=YwjK3XrXIpY.

Introductory dialog:
Lord Karaoke (Velvet): It's Karaoke Night at Tappers! Sure, you can come up and sing, just make sure you hit all the notes on-key!  Use the up and down buttons to adjust your pitch!

The game screen shows a single musical staff with a G-clef five horizontal lines.  The player controls a gold diamond that sits on the left side of the staff, starting at G.

If they player hits the "up" key, the diamond goes up a note.
If they player hits the "down" key, the diamond goes up a note.

A note can sit either on a line, in the gap between two lines, on top of the top line, or below the bottom line.

The diamond cannot go up past the top note or down past the bottom one.

What follows is a rhythm game.  The game plays a monophonic musical melody.  As the notes in the melody sound, dots appear on the musical staff at the far right.  They are bright red when they first appear, then turn white and move steadily towards the left.

If the golden diamond touches a note as it passes, it counts as a success and the player gets 100 points.  If a note passes by the diamond without getting touched, it counts as a failure.

Post-minigame dialog:
If the player won:
Lord Karaoke (Velvet): Killer performance! Your next round of drinks is on me!
If the player lost:
Lord Karaoke (Velvet): You have failed karaoke night.  Leave here, and take your dishonor with you.

## The Confrontation
You can access this section directly by setting the query parameter "minigame=confrontation".

This section opens with a title card: "The Confrontation" and "Press Enter to Continue".

This section is a single-player 2D fighting game.

It includes a player character (represented using the selected cast member's sprites) and an AI enemy (represnted using the companion's sprites).

The player character moves left and right by pressing or holding down the left and right keys -- use the second and fourth rows of the walk.png sprites for this.

The player character punches with the "a" key; use the appropriate row of sprites in 1h_halfslash.png to depict this.

The player character kicks with the "s" key; use the appropriate row of sprites in 1h_backslash.png to depict this.

Both attacks are implemented with hitboxes.

A punch or kick is always aimed in the direction the character is currently facing.

Use the combat.png sprites when a character is standing still.

Both characters have health bars.

The AI should move towards the player and attack randomly.

Use images/gas_station.webp for the background.

When the player wins or loses, play the "ta-da!" sound or the "sad trombone" sound and show "Press Enter to Continue".

Before play starts:
[Companion's First Name]([Companion's First Name]): Well, maybe we shouldn't be friends any more!

In that dialog, the character name is the first name of the companion, not their full name.

At that point, when the player presses enter, continue to the closing credits.

## Closing Credits
This section should scroll credits fairly quickly, in white Nintendo font against a black background.

This is the text it should depict:
Wanderlust

Director & Tech
Lindsey McGowen

Assistant Director & Understudy
Leichelle Little

Cast
Claire Biddiscombe
Gilbert El-Dick
Jason Summers
Krystal Merrells
Patrice Forbes
Peter Rogers
Sam Allen
The Velvet Duke

Presented By
Wayward Improvised Theatre & Videogaming Concern

The background music should be the DuckTales "Moon" theme, available [here](https://www.youtube.com/watch?v=KF32DRg9opA). Download it as a media file and play it in the game.

In this section, the player can click "Enter" to return to the title screen.

After the credits finish rolling, the text "Click Enter to Replay" appears centered on the screen.