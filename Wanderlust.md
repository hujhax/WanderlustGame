# Wanderlust

# About
Wanderlust is a video game that uses NES-style 8-bit graphics and chiptune-style music and sound effects.

It is written in Vanilla JS and Canvas to run in a browser.

# Gameplay
The following subsections explain the phases of the video game in order.


## Intro Screen
Centered white text on a black background reads "Click to Start".
When the user clicks, proceed to the Title Screen.

## Title Screen
This shows an animation loop of a station wagon driving along a highway on a bright sunny day with white fluffy clouds in the sky.  We see the car from a distance, driving left to right on the screen.  The car is centered in the screen; the road moves past it, as does the occasional tree on the far side of the road.

The background music for this phase is a chiptune version of "Chicago" by Sufjan Stevens, available [here](https://www.youtube.com/watch?v=xHGH2iiaPcQ).  Download it as a media file and play it in the game.  Start the track at the twelve second mark.

At the bottom center are the words "Press Enter to Start", written in the [Nintendo Font](https://fontstruct.com/fontstructions/show/406653/nintendo_nes_font).  If the user presses enter, we got the next phase.

## Choose Your Traveler
This shows a character-select screen.  The title of the screen says "CHOOSE YOUR TRAVELER" in the Nintendo font.  The screen shows 8 boxes, arranged roughly in a circle, each showing a face drawn in 8-bit style, and each labeled with a name.  The player uses arrow keys to select a box and presses the enter key to proceed to the next phase.

The background music for this phase is the Mortal Kombat II selection music, available [here](https://www.youtube.com/watch?v=ZUbW_7PTJdE). Download it as a media file and play it in the game.

The 8 boxes should depict these people -- download the linked images and depict them, 8-bit-style, in their respective boxes:
1. [Krystal](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/50659d37-e915-4319-b86b-92f3ac66de0a-2tcBk1eT8taKFmUchAZnoxOzNKqswFF3necvzUVFyU1wsXmpwhjQ4fIQALonExM8yizuZIaUEIXHh2GIXKt3r4k4QxtJwE2mLIk/Krystal-2.jpg)
1. [Patrice](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/b8c4cf93-4857-4998-a2a8-c0fc166ec1ea-RPOZKQKxsQeBm7iu6zncYF5ktjanuVAWKWnoVGCCXHtplDyTQRKh5lxxvXGLpObraZXaW2yalGts8ubU2dqCTEjQ8Y4LtR0k964/Patrice-Headshot.jpg)
1. [Peter](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/ccb285c2-b1ca-45f9-81f8-99bec43b845d-KXSk9KUBGLODbn6L6wgrEZvvOuOYUsZChS5SkjNLDNHTxlB2e3GiJVaSkCv8WzDA9GOtAioQ6hCNAnJDx2IUvSNuKZGidDvnc01/BWFaceLarge.png)
1. [Velvet](https://static.wixstatic.com/media/744f75_02ea7e5ccce840ffb48d654e87779080~mv2.jpg/v1/fill/w_403,h_334,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Sibsons_edited.jpg)
1. [Jason](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-16fHRFUwM8us/3320f931-2dfe-4f85-b7de-beeb89e5bde7-EcRUBBMCAaZGomuBGU7Uj6YTMY9l73dCnKRbzjPFsW7DKv36sUmpHiXwfoOllVtYilk2gC3LlhVRwUyoJwg4fAtt3OpxZ8fnUSh/238976175_10166407083535377_7441513184742427674_n-(3).jpg)
1. [Sam](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/e3293e7e-d576-44db-9112-e1592375529d-R91jWpkoRBJyVGbwm7WTvkJ1C165EafurydDegiQUTrt93Wq5YBCNMwTOteuGlxhVUIh22K2HlWYcfadyo2g9hzi0WRZ8tYAsvf/Samantha-Adams---Headshot.jpg)
1. [Claire](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/c8824cbe-0b6c-433a-bec5-d11dce209148-g9ihJq04m8t0wcVx95RfPGDwcn707ScFEpiWUHagTCIgGMOmm8ijnoIq0PLdoSy8zxjuzBD3pxpmkodou99A1xEffXDaIQ9r0m3/DSCF0245-Curtis-Perry.jpg)
1. [Gilbert](https://prod-fillout-oregon-s3.s3.us-west-2.amazonaws.com/orgid-146333/flowpublicid-e1hPYx2JfPus/fb46909c-e3b4-45ed-8bc9-958b01e149ae-p8OzM9tMRy8KTF4XDUVM21QMENF0IxSbPSrbh1GuhoIGRVSye8yGMojqlCaAMdDcgMaphXuensMAEjv5jUcLDvhHXZbbwoaoRen/20260113_125217.jpg)

Do not scale the height and width of the images unevenly; instead, shrink the whole image and crop it such that the head fits neatly in the square frame.


## Partner Announcement
This screen tells the player who their traveling companion is.

This is based on who they chose in Choose Your Traveler. There are four pairs:
1. Jason and Peter
2. Patrice and Gilbert
3. Velvet and Claire
4. Sam and Krystal

Onscreen text says "Your traveling companion is... " and then the name of their character's partner in the pair, and then an exclamation point.

A large box onscreen shows the partner's head shot.

Text at the bottom of this screen says "Press Enter to Continue".

The background music for this phase is the victory Zelda music, available [here](https://www.youtube.com/watch?v=uinctpSn9_w).  Download it as a media file and play it in the game.

When the player presses Enter on this screen, proceed to the Departure Cutscene, even if the background music has not finished playing yet.

## Departure Cutscene
The screen shows a car leaving a waving group of people in front of a suburban house.

The background music for this phase is a chiptune version of "Chicago" by Sufjan Stevens, available [here](https://www.youtube.com/watch?v=xHGH2iiaPcQ).  Download it as a media file and play it in the game.  Start the track at the thirty second mark.

When this is done, automatically proceed to the Closing Credits.



## Closing Credits
This section should scroll credits fairly quickly, in white Nintendo font against a black background.

This is the text it should depict:
Wanderlust

Director & Tech
Lindsey McGowen

Assistant Director & Understudy
Leichelle Little

Cast
Claire
Gilbert
Jason
Krystal
Patrice
Peter
Sam
Velvet

Presented By
Wayward Improvised Theatre & Videogaming Concern

The background music should be the DuckTales "Moon" theme, available [here](https://www.youtube.com/watch?v=KF32DRg9opA). Download it as a media file and play it in the game.

In this section, the player can click "Enter" to return to the title screen.

After the credits finish rolling, the text "Click Enter to Replay" appears centered on the screen.