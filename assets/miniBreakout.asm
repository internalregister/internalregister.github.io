ORG 2100h

OUT_RS232: EQU $00
OUT_RS232_BYTE: EQU $01
OUT_NAME: EQU $0A
IN_SD_INIT: EQU $0A
IN_SD_OPEN_DIR: EQU $0B
IN_SD_READ_CONTENTS: EQU $10
IN_SD_READ_CONTENT_NAME: EQU $11
IN_SD_READ_CONTENT_ATTRIBUTES: EQU $12
IN_SD_GOTO_CONTENT: EQU $15
IN_SD_OPEN_CONTENT_FILE: EQU $20
IN_SD_CLOSE_FILE: EQU $21
IN_SD_END_OF_FILE: EQU $22
IN_SD_READ_FILE: EQU $23

IN_RS232: EQU $00
IN_PS2: EQU $01
IN_JOY1_SEL0: EQU $02
IN_JOY1_SEL1: EQU $03
IN_JOY2_SEL0: EQU $04
IN_JOY2_SEL1: EQU $05


PPU_SCROLL_X: EQU $1001
PPU_SCROLL_Y: EQU $1002
PPU_SCROLL_PAGES: EQU $1003

PPU_SPRITES: EQU $1004

PPU_NAME_TABLE_1: EQU $1144
PPU_NAME_TABLE_2: EQU $13E4
PPU_NAME_TABLE_3: EQU $1684
PPU_NAME_TABLE_4: EQU $1924

PPU_TILE_TABLE_1: EQU $1BC4
PPU_TILE_TABLE_2: EQU $1C6C
PPU_TILE_TABLE_3: EQU $1D14
PPU_TILE_TABLE_4: EQU $1DBC

PPU_OVERLAY: EQU $1E64


; *** Game Specific Constants ***
BALL_SPRITE: EQU PPU_SPRITES
PAD_SPRITE: EQU PPU_SPRITES + 5

BALL_SPRITE_NUM: EQU 75
PAD_SPRITE_NUM: EQU 76

PAD_POSITION_Y: EQU 196

PAD_MIN_X: EQU 39
PAD_MAX_X: EQU 223

jp main

DS $2166-$
programNMI:

;	Init

	ld hl, initialized
	ld a, (hl)
	cp 0
	jr nz, programNMINotInit

	call initNameTables
	call initSprites

	ld hl, initialized
	ld a, 1
	ld (hl), a

programNMINotInit:


	call getJoyInfo

	call checkPause

	ld a, (paused)
	cp 1
	jr z, programNMIPaused

	call movePadBall

	call handleTimeCount

programNMIPaused:

	call setSprites

	ret

;----------------------------------
;   initNameTables
;----------------------------------


initNameTables:

	ld hl, PPU_NAME_TABLE_1
	ld (currentNameTablePos), hl
	
	ld hl, nameTable1
	ld (currentNameTableSourcePos), hl

	ld a, 0
	ld hl, currentTileX
	ld (hl), a

initNameTablesLoop0:

	ld a, 0
	ld hl, currentTileY
	ld (hl), a

initNameTablesLoop1:

	ld hl, (currentNameTableSourcePos)
	ld a, (hl)
	ld bc, (currentNameTablePos)
	out (c), a

	ld hl, (currentNameTableSourcePos)
	inc hl
	ld (currentNameTableSourcePos), hl
	
	ld hl, (currentNameTablePos)
	inc hl
	ld (currentNameTablePos), hl

	ld hl, currentTileY
	ld a, (hl)
	inc a
	ld (hl), a
	cp 28
	jr nz, initNameTablesLoop1

	ld hl, currentTileX
	ld a, (hl)
	inc a
	ld (hl), a
	cp 24
	jr nz, initNameTablesLoop0

	ret

;----------------------------------
;----------------------------------

initSprites:

	ld hl, currentSprite
	ld a, 0
	ld (hl), a

	ld bc, PPU_SPRITES
initSpritesLoop:

	ld a, 0
	out (c), a
	inc bc
	out (c), a
	inc bc
	out (c), a
	inc bc
	out (c), a
	inc bc
	out (c), a

	inc bc

	ld hl, currentSprite
	ld a, (hl)
	inc a
	ld (hl), a
	cp 64
	jr nz, initSpritesLoop
	
	
	ret

;----------------------------------
;----------------------------------

;----------------------------------
;  setSprites
;----------------------------------

setSprites:

	ld bc, BALL_SPRITE
	ld a, 1			 ; Misc
	out (c), a
	inc bc			 ; Sprite
	ld a, BALL_SPRITE_NUM	
	out (c), a
	inc bc			 ; ColorKey
	ld a, $1F
	out (c), a
	inc bc			 ; X
	ld hl, ballPosition
	ld a, (hl)
	out (c), a
	inc bc			 ; Y
	ld hl, ballPosition+1
	ld a, (hl)
	out (c), a

	inc bc
	ld a, 1			 ; Misc
	out (c), a
	inc bc			 ; Sprite
	ld a, PAD_SPRITE_NUM
	out (c), a
	inc bc			 ; ColorKey
	ld a, $1F
	out (c), a
	inc bc			 ; X
	ld hl, padPosition
	ld a, (hl)
	out (c), a
	inc bc			 ; Y
	ld a, PAD_POSITION_Y
	out (c), a

	inc bc
	ld a, 1			 ; Misc
	out (c), a
	inc bc			 ; Sprite
	ld a, PAD_SPRITE_NUM+1
	out (c), a
	inc bc			 ; ColorKey
	ld a, $1F
	out (c), a
	inc bc			 ; X
	ld hl, padPosition
	ld a, (hl)
	add 8
	out (c), a
	inc bc			 ; Y
	ld a, PAD_POSITION_Y
	out (c), a

	inc bc
	ld a, 1			 ; Misc
	out (c), a
	inc bc			 ; Sprite
	ld a, PAD_SPRITE_NUM+2
	out (c), a
	inc bc			 ; ColorKey
	ld a, $1F
	out (c), a
	inc bc			 ; X
	ld hl, padPosition
	ld a, (hl)
	add 16
	out (c), a
	inc bc			 ; Y
	ld a, PAD_POSITION_Y
	out (c), a

	ret

;----------------------------------
;----------------------------------


;----------------------------------
; getJoyInfo
;----------------------------------

getJoyInfo:

	ld bc, IN_JOY1_SEL0
	in a, (c)
	ld hl, joyInfo
	ld (hl), a

	ld bc, IN_JOY1_SEL1
	in a, (c)
	inc hl
	ld (hl), a

	ret


;----------------------------------
; checkPause
;----------------------------------

checkPause:

	ld a, (joyInfo)
	and 16 ; Start
	cp 16
	jr z, checkPauseOff

	ld a, (startOff)
	cp 1
	jr nz, checkPauseOff

	ld a, (paused)
	xor 1
	ld (paused), a

	cp 0
	jr nz, checkPause0
	ld a, (reset)
	cp 1
	jr nz, checkPause0

	ld a, 0
	ld (reset), a

	call fullReset
	jp checkPauseOff

checkPause0:
	call showPause

checkPauseOff:

	ld a, (joyInfo)
	and 16 ; Start
	cp 16
	jr z, checkPauseOff2

	ld a, 0
	ld (startOff), a

	jr checkPauseEnd

checkPauseOff2:

	ld a, 1
	ld (startOff), a

checkPauseEnd:
	ret


;----------------------------------
; showText
;			hl: text address
;----------------------------------

showText:
	ld bc, PPU_NAME_TABLE_1 + 288
	ld a, 0
	ld (loopTemp), a
showTextLoop1:

	ld a, (hl)
	out (c), a

	inc bc
	inc hl

	ld a, (loopTemp)
	inc a
	ld (loopTemp), a
	cp 11
	jr nz, showTextLoop1
	ret


;----------------------------------
; showPause
;----------------------------------

showPause:

	ld a, (paused)
	cp 1
	jr nz, showPauseUnpause

	ld hl, pausedText
	call showText

	jr showPauseEnd

showPauseUnpause:

	ld bc, PPU_NAME_TABLE_1 + 288
	ld d, 0
showPauseLoop2:

	ld a, $FE
	out (c), a

	inc bc
	inc d
	ld a, d
	cp 11
	jr nz, showPauseLoop2

showPauseEnd:
	ret

;----------------------------------
; movePadBall
;----------------------------------

movePadBall:

;	Read Input to Move

	ld hl, joyInfo
	ld a, (hl)
	and 1
	cp 1 ; Left
	jr z, movePadBall2

	ld hl, padPosition
	ld a, (hl)
	sub 5
	ld (hl), a
	cp PAD_MIN_X
	jp nc, movePadBall3

	ld (hl), PAD_MIN_X
	
	jp movePadBall3
movePadBall2:

	ld hl, joyInfo
	ld a, (hl)
	and 2
	cp 2 ; Right
	jr z, movePadBall3

	ld hl, padPosition
	ld a, (hl)
	add 5
	ld (hl), a
	cp PAD_MAX_X
	jp c, movePadBall3

	ld (hl), PAD_MAX_X

movePadBall3:

	; Move ball

	ld a, (ballVelocity)
	ld b, a
	ld a, (ballDirection)
	cp 0
	jr nz, movePadBallXDir1

	ld a, (ballPosition)
	add b
	ld (ballPosition), a
	jr movePadBallY

movePadBallXDir1:
	
	ld a, (ballPosition)
	sub b
	ld (ballPosition), a

movePadBallY:

	ld a, (ballVelocity+1)
	ld b, a
	ld a, (ballDirection+1)
	cp 0
	jr nz, movePadBallYDir1

	ld a, (ballPosition+1)
	add b
	ld (ballPosition+1), a
	jr movePadBallCheckCollision

movePadBallYDir1:
	
	ld a, (ballPosition+1)
	sub b
	ld (ballPosition+1), a

movePadBallCheckCollision:
	; Collision Walls

	ld a, (ballPosition)
	cp 39
	jr nc, movePadBallCheckXMax

	ld a, 39
	ld (ballPosition), a
	ld a, (ballDirection)
	xor 1
	ld (ballDirection), a

	jr movePadBallCheckY

movePadBallCheckXMax:

	ld a, (ballPosition)
	cp 242
	jr c, movePadBallCheckY

	ld a, 242
	ld (ballPosition), a
	ld a, (ballDirection)
	xor 1
	ld (ballDirection), a

movePadBallCheckY:

	ld a, (ballPosition+1)
	cp 47
	jr nc, movePadBallCheckYMax

	ld a, 47
	ld (ballPosition+1), a
	ld a, (ballDirection+1)
	xor 1
	ld (ballDirection+1), a

	jr movePadBallCheckCollisionPad

movePadBallCheckYMax:

	ld a, (ballPosition+1)
	cp 215
	jr c, movePadBallCheckCollisionPad

	call lifeLost
	jp movePadBallEnd

movePadBallCheckCollisionPad:
	; Collision Pad
	ld a, (ballDirection+1)
	cp 0
	jp nz, movePadBallCheckCollisionBricks

	ld a, (ballPosition+1)
	cp PAD_POSITION_Y-2
	jp c, movePadBallCheckCollisionBricks ; <

	ld a, (ballPosition+1)
	cp PAD_POSITION_Y+2
	jp nc, movePadBallCheckCollisionBricks ; >

	ld a, (ballPosition)
	ld b, a
	ld a, (padPosition)
	sub 4
	cp b
	jp nc, movePadBallCheckCollisionBricks ; >

	ld a, (ballPosition)
	ld b, a
	ld a, (padPosition)
	add 23
	cp b
	jp c, movePadBallCheckCollisionBricks ; <

	ld a, (ballDirection+1)
	xor 1
	ld (ballDirection+1), a
	ld a, PAD_POSITION_Y - 5
	ld (ballPosition+1), a

	call resetScoreMult

	; Check Bounce
	ld a, (ballPosition)
	ld b, a
	ld a, (padPosition)
	sub 4
	ld c, a
	ld a, b
	ld b, c
	sub b
	ld b, a
	cp 6
	jr nc, movPadBallColPad2

	ld a, 1
	ld (ballDirection), a
	ld a, 3
	ld (ballVelocity), a
	ld a, 3
	ld (ballVelocity+1), a

	jr movePadBallCheckCollisionBricks

movPadBallColPad2:

	ld a, b
	cp 11
	jr nc, movPadBallColPad3

	ld a, 1
	ld (ballDirection), a
	ld a, 2
	ld (ballVelocity), a
	ld a, 4
	ld (ballVelocity+1), a

	jr movePadBallCheckCollisionBricks

movPadBallColPad3:

	ld a, b
	cp 14
	jr nc, movPadBallColPad4

	ld a, 1
	ld (ballDirection), a
	ld a, 1
	ld (ballVelocity), a
	ld a, 4
	ld (ballVelocity+1), a

	jr movePadBallCheckCollisionBricks

movPadBallColPad4:

	ld a, b
	cp 17
	jr nc, movPadBallColPad5

	ld a, 0
	ld (ballDirection), a
	ld a, 1
	ld (ballVelocity), a
	ld a, 4
	ld (ballVelocity+1), a

	jr movePadBallCheckCollisionBricks

movPadBallColPad5:

	ld a, b
	cp 22
	jr nc, movPadBallColPad6

	ld a, 0
	ld (ballDirection), a
	ld a, 2
	ld (ballVelocity), a
	ld a, 4
	ld (ballVelocity+1), a

	jr movePadBallCheckCollisionBricks

movPadBallColPad6:

	ld a, 0
	ld (ballDirection), a
	ld a, 3
	ld (ballVelocity), a	
	ld a, 3
	ld (ballVelocity+1), a

movePadBallCheckCollisionBricks:
	; Collision Bricks

	ld a, (ballDirection)
	cp 0
	jr nz, movePadBallCheckCollisionBricks0
	ld a, (ballPosition)
	add 5
	jr movePadBallCheckCollisionBricks1
movePadBallCheckCollisionBricks0:
	ld a, (ballPosition)
movePadBallCheckCollisionBricks1:
	sub 31
	srl a
	srl a
	srl a ; / 8
	ld (tilePosition), a

	ld a, (ballDirection+1)
	cp 0
	jr nz, movePadBallCheckCollisionBricks2
	ld a, (ballPosition+1)
	add 5
	jr movePadBallCheckCollisionBricks3
movePadBallCheckCollisionBricks2:
	ld a, (ballPosition+1)
movePadBallCheckCollisionBricks3:
	sub 31
	srl a
	srl a
	srl a ; / 8
	ld (tilePosition+1), a

	ld a, (tilePosition+1)
	ld h, 0
	ld l, a
	add hl, hl
	add hl, hl
	add hl, hl
	add hl, hl ; * 16
	ld d, h
	ld e, l
	ld h, 0
	ld l, a
	add hl, hl
	add hl, hl
	add hl, hl ; * 8
	add hl, de ; y * 16 + y * 8
	ld d, h
	ld e, l
	ld h, 0
	ld l, a
	add hl, hl
	add hl, hl ; * 4
	add hl, de ; y * (16+8+4)
	ld a, (tilePosition)
	ld b, 0
	ld c, a
	add hl, bc ; y*28 + x

	ld bc, PPU_NAME_TABLE_1
	add hl, bc ; NAME_TABLE1 + desl
	ld b, h
	ld c, l
	in a, (c)
	ld l, a
	cp $FA
	jr nz, movePadBallCheckRightBrick

	ld a, 1
	ld (ballDirection), a
	ld a, (ballDirection+1)
	xor 1
	ld (ballDirection+1), a

	ld a, $FE
	out (c), a
	inc bc
	out (c), a

	call addScore
	
	jr movePadBallEnd

movePadBallCheckRightBrick:
	ld a, l
	cp $FB
	jr nz, movePadBallEnd

	ld a, 0
	ld (ballDirection), a
	ld a, (ballDirection+1)
	xor 1
	ld (ballDirection+1), a

	ld a, $FE
	out (c), a
	dec bc
	out (c), a

	call addScore

movePadBallEnd:	

	ret

;----------------------------------
; resetScoreMult
;----------------------------------

resetScoreMult:
	ld a, 1
	ld (scoreMult), a
	ret

;----------------------------------
; addScore
;----------------------------------

addScore:
	ld a, (scoreMult)
	ld hl, (score)
	ld b, 0
	ld c, a
	add hl, bc
	ld (score), hl
	ld de, PPU_NAME_TABLE_1+11
	call writeNumScreenWithZeros
	ld a, (scoreMult)
	inc a
	ld (scoreMult), a
	ld a, (bricks)
	dec a
	ld (bricks), a
	cp 0
	jr nz, addScoreEnd
	call doWin
addScoreEnd:
	ret

;----------------------------------
; doWin
;----------------------------------

doWin:
	ld hl, winText
	call showText
	ld a, 1
	ld (paused), a
	ld (reset), a
	ret

;----------------------------------
; lifeLost
;----------------------------------

lifeLost:
	ld a, (lives)
	dec a
	ld (lives), a
	ld hl, PPU_NAME_TABLE_1
	ld b, 0
	ld c, a
	add hl, bc
	ld b, h
	ld c, l
	ld l, a
	ld a, 0
	out (c), a
	ld a, (lives)
	cp 0
	jr nz, lifeLost0
	call doLose
	jr lifeLostEnd
lifeLost0:
	ld hl, loseText
	call showText
	ld a, 1
	ld (paused), a
	call resetBallPad
lifeLostEnd:
	ret

;----------------------------------
; doLose
;----------------------------------

doLose:
	ld hl, lostText
	call showText
	ld a, 1
	ld (paused), a
	ld (reset), a
	ret

fullReset:
	call resetBallPad
	ld a, 0
	ld (initialized), a
	ld a, 3
	ld (lives), a
	ld a, 65
	ld (bricks), a
	ld hl, 0
	ld (score), hl
	ld a, 1
	ld (scoreMult), a
	ld hl, 0
	ld (time), hl
	ld a, 0
	ld (timeStep), a
	ld a, 1
	ld (paused), a
	ret

;----------------------------------
; resetBallPad
;----------------------------------

resetBallPad:
	ld a, 131
	ld (padPosition), a
	ld a, 141
	ld (ballPosition), a
	ld a, 125
	ld (ballPosition+1), a
	ld a, 2
	ld (ballVelocity), a
	ld a, 3
	ld (ballVelocity+1), a
	ld a, 0
	ld (ballDirection), a
	ld (ballDirection+1), a
	ret

;----------------------------------
; handleTimeCount
;----------------------------------

handleTimeCount:

	ld a, (timeStep)
	inc a
	ld (timeStep), a
	cp 25
	jr nz, handleTimeCountEnd

	ld a, 0
	ld (timeStep), a

	ld hl, (time)
	inc hl
	ld (time), hl

handleTimeCountEnd:

	ld hl, (time)
	ld de, PPU_NAME_TABLE_1 + 23
	call writeNumScreen

	ret

;----------------------------------
;  writeNumScreen
;		hl - Number
;		de - Destination Tile
;----------------------------------

writeNumScreen:

	ld a, 0
	ld (firstNonZero), a
	ld (multiPurposeTemp+1), a

	ld bc, -10000
	call writeNumScreen1
	ld bc, -1000
	call writeNumScreen1
	ld bc, -100
	call writeNumScreen1
	ld bc, -10
	call writeNumScreen1
	ld bc, -1
writeNumScreen1:
	ld a, 48 - 1 ; '0' - 1
writeNumScreen2:	
	inc a
	add hl, bc
	jr c, writeNumScreen2
	sbc hl, bc

	ld (multiPurposeTemp), a
	cp 48
	jr nz, writeNumScreen3

	ld a, (firstNonZero)
	cp 0
	jr nz, writeNumScreen3

	ld a, (multiPurposeTemp+1)
	cp 4
	jr z, writeNumScreen3

	jr writeNumScreen4

writeNumScreen3:
	ld a, (multiPurposeTemp)
	ld (tempWriteNum), de
	ld bc, (tempWriteNum)
	out (c), a

writeNumScreen4:
	inc de

	ld a, (multiPurposeTemp+1)
	inc a
	ld (multiPurposeTemp+1), a

	ret

;----------------------------------
;  writeNumScreenWithZeros
;		hl - Number
;		de - Destination Tile
;----------------------------------

writeNumScreenWithZeros:

	ld bc, -10000
	call writeNumScreenWithZeros1
	ld bc, -1000
	call writeNumScreenWithZeros1
	ld bc, -100
	call writeNumScreenWithZeros1
	ld bc, -10
	call writeNumScreenWithZeros1
	ld bc, -1
writeNumScreenWithZeros1:
	ld a, 48 - 1 ; '0' - 1
writeNumScreenWithZeros2:	
	inc a
	add hl, bc
	jr c, writeNumScreenWithZeros2
	sbc hl, bc

	ld (tempWriteNum), de
	ld bc, (tempWriteNum)
	out (c), a

	inc de

	ret

;----------------------------------
;		writeText
;		hl - 0 terminated text address
;----------------------------------
writeText:

	ld a, (hl)
	ld bc, OUT_RS232
	out (c), a
	inc hl
	ld a, (hl)
	cp 0
	jr nz, writeText

	ret

main:
	ld hl, textInProgram
	call writeText	

;----------------------------------
;----------------------------------

loop:
	jp loop

;----------------------------------
;----------------------------------

textInProgram:
	DB "In Program...", 10, 13, 0
textBreak:
	DB 10, 13, 0
textSpace:
	DB '   ', 0
currentByte:
	DB 0
currentPos:
	DB 0, 0
currentTileX:
	DB 0
currentTileY:
	DB 0
currentNameTableSourcePos:
	DB 0, 0
currentNameTablePos:
	DB 0, 0
currentSprite:
	DB 0
currentMoveSprite:
	DB 0
currentMoveSpriteX:
	DB 100
currentMoveSpriteY:
	DB 100
currentMoveSprite2:
	DB 0
currentMoveSpriteX2:
	DB 150
currentMoveSpriteY2:
	DB 80

initialized:
	DB 0
joyInfo:
	DB 0, 0
padPosition:
	DB 131
ballPosition:
	DB 141, 125
tempWriteNum:
	DB 0, 0
time:
	DB 0, 0
timeStep:
	DB 0
paused:
	DB 1
startOff:
	DB 1
pausedText:
	DB $FE, $FE, $FE, 'PAUSE', $FE, $FE, $FE
LoseText:
	DB $FE, 'LIFE', $FE, 'LOST', $FE
WinText:
	DB $FE, 'YOU', $FE, $FE, 'WON!', $FE
LostText:
	DB $FE, $FE, 'YOU', $FE, 'LOST', $FE
loopTemp:
	DB 0
ballVelocity:
	DB 2, 3
ballDirection:
	DB 0, 0
tilePosition:
	DB 0, 0
score:
	DB 0, 0
scoreMult:
	DB 1
lives:
	DB 3
bricks:
	DB 65
reset:
	DB 0
firstNonZero:
	DB 0
debugTemp:
	DB 0, 0, 0, 0
multiPurposeTemp:
	DB 0, 0


nameTable1:
	DB $03, $03, $03, $00, $00, $53, $43, $4F, $52, $45, $00, $30, $30, $30, $30, $30, $00, $00, $00, $54, $49, $4D, $45, $00, $00, $00, $00, $30 
	DB $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FC 
	DB $FC, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FC 
	DB $FC, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FC 
	DB $FC, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FC 
	DB $FC, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FA, $FB, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $50, $52, $45, $53, $53, $FE, $53, $54, $41, $52, $54, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC 
	DB $FC, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FE, $FC
