# Wanderlust

# General
Wanderlust is a video game that uses NES-style pixel-art graphics and chiptune-style music and sound effects.

If the folder does not include a graphic asset, search the web for "[name of asset] pixel art", download what you find, and use that.

If the folder does not include a sound asset, search the web for "[name of sound effect] nintendo", download what you find, and use that.

This game is written in Vanilla JS and Canvas to run in a browser.

For debug purposes, a player may always type the ">" key to skip to the next section of the game.

If we have loaded a phase of the game via the query parameter without selecting a traveler, set the traveler to Peter by default.

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

Note that you should not combine multiple dialog prompts into a single dialog box; each new prompt should kick off a new dialog box, even if there are multiple dialog prompts from the same character.

"style" is an optional tag, and it can take the values "silhouette", "inverted", and "top".
"silhouette" means, instead of drawing the head shot, you draw a black silhouette of the head shot.
"inverted" means you use the appropriate head shot from /images/cast/inverted.
"top" means you draw the whole dialog display at the top of the screen and not the bottom.

In "silhouette" mode, the square behind the head shot is gray.  In all other modes (including default), it's black.

When a dialog box is visible, remove any "Press Enter to Continue" prompt from the screen until the dialog is done.



# Gameplay
The following subsections explain the phases of the video game in order.

## Intro Screen
Centered white text on a black background reads "Click to Start".
When the user clicks, proceed to the Title Screen.

## Title Screen
The title "WANDERLUST" has a faint drop shadow behind it.

This shows an animation loop of a station wagon driving along a highway at sunset with white fluffy clouds in the sky (use the 'cloud.png' file in the /images subdirectory for the clouds).  We see the car from a distance, driving left to right on the screen.  The car is centered in the screen; the road moves past it, as does the occasional tree on the far side of the road.  Do not use the anything in the images directory for the station wagon on this screen.

The background music for this phase is music/chicago.mp3.  Start the track at the twelve second mark.

At the bottom center are the words "Press Enter to Start", written in the [Nintendo Font](https://fontstruct.com/fontstructions/show/406653/nintendo_nes_font).  If the user presses enter, we go to the next phase.

## Choose Your Traveler
This shows a character-select screen.  The title of the screen says "CHOOSE YOUR TRAVELER" in the Nintendo font.  The screen shows 8 boxes, arranged four by two, each showing a cast member head shot, and each labeled with the cast member name.

The player uses arrow keys to select a box and presses the enter key to proceed to the next phase.

The player can also click a box to select it and proceed to the next phase.

Play a short, percussive sound effect when the player moves to a new box or selects a traveler.

The background music for this phase is music/best_friend.mp3.

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

The background music for this phase is music/zelda_victory.mp3.

When the player presses Enter on this screen, proceed to the Departure Cutscene, even if the background music has not finished playing yet.

## Departure Cutscene
The background image of this screen is images/departure_bg.jpg; scale it to the canvas.  

This screen shows a pixel-art animation of a station wagon leaving a house.

Show the station wagon leaving along the street, going left to right along the road depicted in the background image.; use the image from /images/station_wagon.png.

Show the sprites for the player and the companion sitting in the car (use the fourth row of sprites in the "sit.png" file for each) -- we should just see their heads, the top half of the sprites, in the front and rear windows.

Show the sprites for all the other cast members standing in front of the house (and not the tree to the left of the house).  (Use the third row of sprites in the "slash.png" file.) Their animation cycles should be randomly out of sync with each other.

The background music for this phase is music/chicago.mp3.  Start the track at the thirty second mark.

When this is done, automatically proceed to In the Car.

Also, the player may press enter at any time in this phase to proceed to In the Car.


## In the Car
Show the title screen without the "Wanderlust" text or the "Press Enter to Start" text.

Use this music for the background music: https://www.youtube.com/watch?v=FGoWAmAoDUg, starting at the 45-second mark.

Generate three lists of pieces of dialog; generate 50 separate lines of dialog for each list.  Whenever we use these one of these lists, we pick an item from it randomly, without any repeats throughout a run of the game.

"Insults" are one-sentence insults towards the person you're talking to.
"Blands" are one-sentence bland statements about things you might see on a long drive.
"Truths" are one-sentence fairly deep truths the character says about how they feel about themselves or how they view the world.

In this section, we repeat this cycle four times:
1. The companion says a line of dialog from the Blands.
2. The player is given three options for how to respond, arranged randomly: one of the Insults, one of the Blands, or one of the Truths. These three items are presented in random order. Selecting an Insult gives -100 points and results in a "sad trombone" sound; selecting a Bland gives 0 points; selecting a Truth gives +200 points and results in a "ta-da!" sound.

Whenever possible, put dialog boxes at the top of the screen so they don't block the car.

Make sure the full text of each choice is visible.  Above the three choices, show the text "How do you respond?"

After this cycle is done four times, automatically proceed to the first minigame.

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

Either way, the game then proceeds to the post-minigame screen, which shuts off any background music, and which includes:
1. A message to the player — "Great job!" if they won, "Too bad!" if they lost.
2. A piece of dialog from the character associated with winning or losing the minigame, as appropriate — these are different for each minigame.
3. The instructions "Press Enter to Continue".

If the player presses enter, they proceed either to (1) the next minigame (for the first two minigames) or (2) the The Confrontation phase (for the third minigame).

Note: for debugging purposes, each minigame has a "query string name".  If a game has a query string name of "foo", and the full game is started with the query parameter "minigame=foo", then the game will start directly with that minigame as if it's stop number 1, and after the post-minigame screen, we just restart that same minigame as stop number 1.  Otherwise, the game runs normally.

### Catch That Chicken
Query string name is "chicken".

This minigame's background music is music/chicken_bgm.mp3.

Introductory dialog:
Farmer Lucky (Jason): "Thanks for stopping at my farm — all my chickens are running loose! Can you help me catch them? Just don't hit any skulls — press the enter key to jump!"

The game screen represents the player as a running figure on the left side of the screen, staying in place.  The player runs along a dirt road.  Behind the player, occasional trees and move by slowly, in parallax.

Text at the bottom of the screen reads "Press Enter to Jump".

There are a hundred chickens along this road.  At most two are visible at the start of the game; the rest are somewhere down the road.  All the chickens are running to the right, but slightly slower than the player.

Occasionally there are cow skulls along the ground.  They don't move, so they appear to move left at the speed the player is running.

If the player presses Enter, the running figure jumps up high enough to easily clear a cow skull.

For the background, use image/farm_background.jpg -- scale it larger than the canvas and move it towards the left very slowly, in parallax; loop the image horizontally.
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

This minigame's background music is music/math_bgm.mp3

Introductory dialog:
Mr. Bergemot (Peter): Well if it isn't our favorite former mathlete! Welcome back to your old school — wanna see if you've still got what it takes?
 
The game screen shows Peter standing in front of a chalkboard.

Via dialog, Mr. Bergemot (Peter) asks the player an arithmetic question for which the answer is a nonnegative integer.  Put another way, no question should have an answer that is a negative number or a fraction.

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

This minigame's background music is music/karaoke_bgm.mp3.

Introductory dialog:
Lord Karaoke (Velvet): It's Karaoke Night at Tappers! Sure, you can come up and sing, just make sure you hit all the notes on-key!  Use the up and down buttons to adjust your pitch!

The game screen shows a single musical staff with a G-clef and five horizontal lines.  (Download the pixel-art G-clef from https://art.pixilart.com/2954095ce6859c5.png and display it in white, at the proper height on the music staff.) The player controls a gold diamond that sits on the left side of the staff, starting at G.

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

### Fromagerie Frenzy! (Formerly Supermarket Sweep)
You can reach this game directly with the query parameter `?minigame=cheese`.

The opening screen shows a market stall (use images/market_stall.png) on the left side of the screen, against a dark background.

For background music, download and use the music from https://www.youtube.com/watch?v=utAcawM33uk.

Opening Dialog:
Mme. Tremblay (Claire): Welcome to the fromagerie!
Mme. Tremblay (Claire): Alas, we have a bit of a crisis. As you know, tomorrow is Cheese Day...
Mme. Tremblay (Claire): ... and we have to prep all our at-least-three-cheese gift baskets today!
Mme. Tremblay (Claire): Can you help?
Mme. Tremblay (Claire): Just go to the cheese chutes and exchange pairs of cheeses to produce rows and columns of three identical cheeses.
Mme. Tremblay (Claire): If you get stuck, press the red button and you can eat one cheese — but I wouldn't recommend doing that more than twice!


This is a match-three game.  

The game screen shows these items from left-to-right: (1) a market stall (use images/market_stall.png); (2) a green, vertical progress bar; (3) an 8x8 play field.

In the eight by eight grid, each square has one of eight different types of cheese. 

Use the cheese pixel art from this page:
https://www.shutterstock.com/image-vector/cheese-assortment-pixel-art-set-round-2218999381

Standard match-three-game rules apply.  The player clicks pairs of horizontally- or verically-adjacent cheeses to exchange them.  If the player creates rows or columns of at least three identical cheeses, draw a little box around them, and quickly fade them to zero opacity (with a "chomp" sound).  Then, all the cheeses above them move down to replenish the empty spots, and new random cheeses fill in the top squares.

If an exchange would not create a scoring group of cheeses, the game rejects the exchange by switching the selected cheeses, then switching them back, and playing a short alarm sound.

When you switch two cheeses, animate switching their positions.

When a cheese moves down in the gameboard, animate it wobbling a bit as it falls, and then steadying itself when it lands into place.

Instructions say "Click two adjacent cheeses to exchange their positions.  Generate groups of three cheeses to win!"

A green vertical progress bar sits next to the play field.  The bar represents 500 "cheese points".  When the bar fills up, add one success, give the player 100 actual points, and reset the progress bar to zero.

Above the progress bar is a square, red "eat" button.  If the player presses the "eat" button, they collect one failure, and the next cheese they press disappears from the grid with a 'chomp' sound.  (And all the cheeses above move down.)

Cheese points are awarded as follows:
* 3 adjacent cheeses: 100
* 4 adjacent cheeses: 200
* any score involving > 4 cheeses: 400
* any chain reaction involving multiple scores: +100 her additional score

If the player gets four successes, they win.  The dialog when the player wins:
Mme. Tremblay (Claire): Hooray! The at-least-three-cheese gift baskets are saved!
Mme. Tremblay (Claire): It's a Cheese Day miracle!

If the player gets three failures, they lose. The dialog when the player loses:
Mme. Tremblay (Claire): Alas, you have succumbed to the Temptation of the Cheese.
Mme. Tremblay (Claire): Do not weep, weary traveler. It has claimed prouder souls than yours.


## The Confrontation
You can access this section directly by setting the query parameter "minigame=confrontation".

This section opens with a title card: "The Confrontation" and "Press Enter to Continue".

Use the music at music/fighting_theme.mp3 as background music, starting at the 30-second mark.

The player has a list of three "success responses", which the game will use in random order, and no repeats, on each playthrough:
1. So what?  I really like [minigame name].
2. I don't like it when people don't want me to be *good* at something.
3. Yeah, whatever, [Companion's First Name]. You're just jealous.

The player has a list of three "failure responses", which the game will use in random order, and no repeats, on each playthrough:
1. Seriously? I already feel so bad about this.
2. Maybe if you'd *helped*, I might have done better!
3. I'm not your employee, [Companion's First Name].

The companion has a list of three "success responses", which the game will use in random order, and no repeats, on each playthrough:
1. I resented how good you were at [minigame name]!
2. You just *had* to show off at [minigame name], didn't you?
3. What was up with [minigame name]? Why couldn't we stop to do something *I'd* be good at?

The companion has a list of three "failure responses", which the game will use in random order, and no repeats, on each playthrough:
1. How could you screw up [minigame name]!
2. [Player's First Name], I was counting on you to win at [minigame name]!
3. I was really disappointed in how you did at [minigame name].

Before play starts:
[Companion's First Name]([Companion's First Name]): I am so frustrated with this trip!
[Player's First Name]([Player's First Name]): Okay, fine. Here we go...

For each of the minigames the player played:
If the player won the minigame:
[Companion's First Name]([Companion's First Name]): [random success response]
[Player's First Name]([Player's First Name]): [random success response]

If the player lost the minigame:
[Companion's First Name]([Companion's First Name]): [random failure response]
[Player's First Name]([Player's First Name]): [random failure response]

After covering the three minigames:
[Companion's First Name]([Companion's First Name]): Well, maybe we shouldn't be friends any more!
[Player's First Name]([Player's First Name]): Maybe we shouldn't!
[Companion's First Name]([Companion's First Name]): I grow tired of using words to handle this.
[Player's First Name]([Player's First Name]): TO THE BATTLEDOME!

When play starts:
This section is a single-player 2D fighting game.

It includes a player character (represented using the selected cast member's sprites) and an AI enemy (represnted using the companion's sprites).

The player character moves left and right by pressing or holding down the left and right keys -- use the second and fourth rows of the walk.png sprites for this.

The player character punches with the "a" key; use the appropriate row of sprites in 1h_halfslash.png to depict this.

The player character kicks with the "s" key; use the appropriate row of sprites in 1h_backslash.png to depict this.

Both attacks are implemented with hitboxes.  Use standard 8-bit sound effects for punching and kicking.

A punch or kick is always aimed in the direction the character is currently facing.

An onscreen instruction should say "Use the 'a' and 's' keys to attack!"

Use the combat.png sprites when a character is standing still.

Both characters have health bars.

The AI should move towards the player and attack randomly.

Use images/battledome.webp for the background.

When the player wins or loses, play the "ta-da!" sound or the "sad trombone" sound and show "Press Enter to Continue".

At that point, when the player presses enter, continue to Separate Ways.

## Separate Ways
You can access this section directly by setting the query parameter "minigame=separate".

The background music of this section is available in music/karaoke_bgm.mp3.

A title card reads "The next day..." before we go to the Companion Sits screen.  This screen should force loading the companion_alone.mp3 and player_alone.mp4 backgrounds if they're not yet loaded.

Alternate between Companion Sits and Player Sits (defined below), spending five seconds on each.

Tile the background horizontally; each tile should be the horizontal mirror of its neighbor.

We should never see above or below the background.

The first time we see each screen, display it without panning and zoomed just enough to make the background fill the screen.  The background should be centered on the canvas this time.  The sprite draws at 200% size, at coordinates specified below.

The second time we see each screen, zoom in 50%, centered on the sprite.  The sprite draws at 300% size.

The third time we see each screen, zoom in another 80%, centered on the sprite.  The sprite draws at 540% size.


After showing each screen three times, go to a black screen and the text "Press Enter to Continue".

At any point the user may press Enter to stop the music, clear the screen, and move on to the dialog in On Your Own?

### Companion Sits
The background image is images/companion_alone.gif, sized so it will fill the whole canvas during the initial viewing.

Place the player's companion sitting on the rocks at the bottom of the image.  Use the leftmost sprite in the fourth row of sit.png -- (x,y) should be (253, 477).

The second and third times we see this screen, we pan very, very slowly to the right (the camera pans left, so the background pans right).

Even though the zoom is centered on the sprite, the sprite should stay towards the lower left corner of the screen on the second and third iterations.


## Player Sits
The same as screen 1, except:
1. Use images/player_alone.gif as the background, sized so it will fill the whole canvas during the initial viewing.
2. Use the player sprite, placed among bushes at the bottom right of the screen -- use the leftmost sprite in the *second* row of sit.png -- (x,y) should be (371, 230)

The second and third times we see this screen, we pan very, very slowly to the left (the camera pans right, so the background pans left).

Even though the zoom is centered on the sprite, the sprite should stay towards the lower right corner of the screen on the second and third iterations.



## On Your Own?
You can access this section directly by setting the query parameter "minigame=alone".

This is the same as The Confrontation, except:
1. There is different opening dialog.
2. The opponent AI does not use the companion's sprites, but rather, color-inverted versions of the player's sprites.
3. You can reach this screen directly with "minigame=own"ss
4. After this screen, you proceed to the Together Again.
5. Use the images/on_your_own_bg.jpg for the background.


When the introductory dialog starts, stop the background music.

Here is the introductory dialog for this section (note that the player is talking to a version of themselves):

[?????]([Player's First Name]){silhouette}: Hehehehhe.  Hee hee hee.
[?????]([Player's First Name]){silhouette}: Now you are finally on your own.
[?????]([Player's First Name]){silhouette}: And I will tell you what I really think of you.
[Player's First Name]([Player's First Name]): Who... who is that?
[?????]([Player's First Name]){silhouette}: Don't you recognize me?
[?????]([Player's First Name]){silhouette}: Don't you recognize the wrenching inner conflicts you feel in the dead of night?
[?????]([Player's First Name]){silhouette}: The nagging doubts that creep around your every act?
[?????]([Player's First Name]){silhouette}: I have been here the whole time, [Player's First Name].  It is I...
[SHADOW]([Player's First Name]){inverted}: YOUR SHADOW!!!

## Together Again
You can access this section directly by setting the query parameter "minigame=reunited". (If this happens, default the traveler to Peter.)

This screen has this background music: https://www.youtube.com/watch?v=xM83zj395tQ

Display the Companion Sits screen, without panning.  The companion should again be at (x,y) = (253, 430).

Have the player walk onscreen (use the fourth row of sprites in walk.png) and sit next to the companion (use the first sprite in the fourth row of sit.png) at (x,y) = (230, 453).

Both sprites should draw onscreen at 2x size.

[Player's First Name]([Player's First Name]){top}: I'm sorry I fought with you.
[Companion's First Name]([Companion's First Name]){top}: I'm sorry too.
[Player's First Name]([Player's First Name]){top}: Can we be friends again?
[Companion's First Name]([Companion's First Name]){top}: Yes we can!
[Player's First Name]([Player's First Name]){top}: YAY!

## Closing Interview
This screen has this background music: music/closing_interview.mp3, at the 39-second mark.

Show the title screen again, without the "Wanderlust" title.

[Player's First Name]([Player's First Name]){top}: We had a meaningful trip.
[Companion's First Name]([Companion's First Name]){top}: It challenged our friendship.
[Player's First Name]([Player's First Name]){top}: It was a crazy time.
[Companion's First Name]([Companion's First Name]){top}: But we learned a lot about ourselves.
[Player's First Name]([Player's First Name]){top}: I gained [score] points worth of self-knowledge!

## Closing Credits
First, show a blank screen.  Then add five random screen captures from this run through the game, one by one, presented like they're polaroid pictures scattered randomly on the screen, but each "photo" should remain mostly visible.  The photos should not overlap.  If there are not five screen captures available, repeats are okay.  If no screen captures are available, skip directly to scrolling the credits.

When all photos appear, begin scrolling.  The credits should appear below the collection of photos.

This section should scroll credits fairly quickly, in white Nintendo font against a black background, with a faint drop shadow.

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

Special Thanks to
Annika Bolden (pinkies up!)

Presented By
Wayward Improvised Theatre
& Videogaming Concern


The background music should be music/moon.mp3.

In this section, the player can click "Enter" to return to the title screen.

After the credits finish rolling, the text "Click Enter to Replay" appears centered on the screen.
