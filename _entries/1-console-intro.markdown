---
layout: default
title:  "Introduction to a Homebrew Video Game Console"
date:   2019-02-02
categories: jekyll update
---

This serves as an introduction to a homebrew video game console made from scratch, using a lot of inspiration from retro consoles and modern projects but with a unique architecture.  
A lot of friends of mine have told me not to keep this project to myself and to put this information online, so here it goes.

## The dream

I've always been nostalgic towards retro-gaming.  
So a few years ago I've decided to learn more about electronics and try to build my own homebrew video game console.  
I wanted to build a console that would fit somewhere between the 3rd and 4th generation of video game consoles,
so I studied some of the video game console designs from that time, the 80s and early 90s.  
These video game consoles basically had a CPU, a custom video chip and an audio chip, either integrated or seperate.  


**The initial plan was to build a console with the following characteristics:**

- No emulation
- With a dedicated "retro" CPU chip
- With TV output (analog signal)
- Able to produce sound
- With support for 2 controllers
- Scrolling background and moving sprites
- Able to support Mario-style platform games (and of course other types of games as well)
- Games/Programs available in SD Card

## Making it come true

The first thing I worked on was the video generation.  
Video game consoles of the era I was aiming for had proprietary graphics chips which made them all ahve different characteristcs.

I started by using an Atmega644 microcontroller running at 20Mhz to send a PAL video signal to a TV:


Because I wanted to reserve a microcontroller to drive the TV signal (I call it the VPU, Video Processing Unit), I decided to use a double-buffer technique.
I had a second micontroller (PPU, Picture Processing Unit, which is an Atmega1284 also at 20Mhz) generate an image to a RAM (VRAM) chip while the first one would dump the contents of another RAM (VRAM) chip to the TV.
After one frame (2 frames in PAL), the VPU switches the RAMs, and dumps the image generated into VRAM1 while the PPU generates an image to VRAM2.  
The video board turned out quite complex as I had to use some external hardware to allow for the two microcontrollers to access the the same RAM chips and also to speed up these accesses, so I added some 74 series chips such as counters, line selectors, transceivers, etc.

![Video Board 1](/assets/videoBoard2.jpg)
![Video Board 2](/assets/videoBoard3.jpg)

After having a functional video board, I started working with the CPU I chose, the Zilog Z80. One of the reasons I chose the Z80 (other than it just being a cool retro CPU) was because the Z80 has access to a 16bit memory space and a 16bit IO space, something that other CPUs do not, such as the 6502.  
I started by connecting the CPU to an EEPROM with some test code and also connecting it via the IO space to a microcontroller I had set up that to communicate with a PC via RS232 in order to check if the CPU was functioning well as well as all the connections I was making. This microcontroller (an Atmega324 operating at 20Mhz) was to become the IO MCU (or IO microcontroller unit), responsible of managing acces to the controllers, SD Card, PS/2 Keyboard and the RS232 communication.  

![CPU Board 1](/assets/cpuBoard1.jpg)

The CPU was then connected to a 128KB RAM Chip, from which 56KB was accessible (this seems like a waste but I could only get 128KB or 32KB RAM chips). This way the CPUs memory space is composed of 8KB of ROM and 56KB of RAM.

The next thing I implemented was the interaction between the CPU and the PPU.  
For this a found "an easy solution" which was to get dual-port RAM (a RAM chip that can be simultaneously connected by two different buses), it spares me having to place more ICs like line selectors and such and also it makes the accesses to the RAM between both chips virtually simultaneous.  

About this time I also added support for controllers, I originally wanted to use Super Nintendo controllers, but the socket for this type of controller is proprietary and was hard to come by, therefore I went with the Mega Drive/Genesis compatible 6-button controllers, they use standard DB-9 sockets that are widely available.  

![Joint Board 1](/assets/jointBoard1.jpg)

At this point I had a CPU with controller support that could control the PPU and could load programs from an SD Card, so...time to make a game in Z80 assembly of course, it took me a few days of my free time to make this:  

<iframe width="930" height="523" src="https://www.youtube.com/embed/2Pcrg1fesBk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

This was awesome, I now had a working video game console, but...it still wasn't enough, there was no way for a game to have custom graphics, it had to use the graphics stored in the PPU, so I tried to figure a way of adding a RAM chip with graphics (Character RAM) and somehow load it with information coming from the CPU and making it accessible to the PPU, all this with as little components I could.  
So I came up with a way: only the PPU would have access to this new RAM, the CPU would be able to load information into it through the PPU and while this transfer was happening, the RAM wouldn't be used for graphics, but only the internal graphics would be used.  
The CPU could then switch from internal graphics to Character RAM (CHR RAM) mode and the PPU would use these custom graphics, it's not the ideal solution, but it works. In the end the new RAM had 128KB and could store 1024 8x8 characters for background and 1024 characters for sprites.  

![Joint Board 2](/assets/jointBoard2.jpg) 

As for the sound, it was the last thing to be implemented. Originally I intended to give it similar capabilities as those seen in the <a href="http://uzebox.org" target="_blank">Uzebox</a>, to have a microcontroller generate PWM sound. But then I found out I could get vintage chips relatively easily, and I order a few YM3438, these sound chips are fully compatible with the YM2812 which was the music chip found in teh Mega Drive/Genesis. By integrating this chip, I could have Mega Drive quality music along sound effects produced by a microcontroller.  
The CPU controls the SPU (Sound Processor Unit, the name I gave to the microcontroller that controls the YM3438 and produces sound on its own) again through a dual-port RAM, this time only 2KB.  
Similarly to the graphics module, the sound module has 128KB for storing sound patches and PCM samples, this CPU can load this memory through the SPU. This way the CPU can either play sound stored in this RAM or update commands to the SPU every frame.  

![Sound Board 1](/assets/soundBoard1.jpg)

After all the modules were developed it was time to put them from breadboard to protoboards.  
For the CPU module I've managed to design and order a custom board, don't know if I'll do the same for the other modules.

## The result

This is the console now (at time of writing):


Only the sound module remains as a breadboard, for now.

***Architecture:***

This diagram helps illustrate how the modules interact with one another.

![Architecture](/assets/architecture.png)

- *CPU*: Zilog Z80
- *CPU-ROM*: 8KB EEPROM, holds the bootloader code
- *CPU-RAM*: 128KB RAM (56KB usable), holds the code and data of the programs/games
- *IO MCU*: Atmega324, serves as an interface between the CPU and the RS232, PS/2 Keyboard, Controllers and SD Card filesystem
- *PPU-RAM*: 4KB Dual-port RAM, it's the interface RAM between the CPU and the PPU
- *CHRRAM*: 128KB RAM, holds the custom background tiles and sprites graphics (in 8x8 pixel characters).
- *VRAM1, VRAM2*: 128KB RAM (43008 bytes used), they are used to store the framebuffer and are written to by the PPU and read by the VPU.
- *PPU (Picture Processing Unit)*: Atmega1284, draws the frame to the framebuffers.
- *VPU (Video Processing Unit)*: Atmega324, reads the framebuffers and generates an RGB and PAL Sync signal.
- *SPU-RAM*: 2KB Dual-port RAM, serves as an interface between the CPU and the SPU.
- *SNDRAM*: 128KB RAM, holds PWM Patchs, PCM samples and FM Synthesis instruction blocks.
- *YM3438*: YM3438, FM Synthesis chip.
- *SPU (Sound Processing Unit)*: Atmega644, generates PWM-based sound and controls the YM3438.

***The final Specs:***

**CPU:**
- 8-bit CPU Zilog Z80 operating at 10Mhz.
- 8KB of ROM for bootloader.
- 56KB of RAM.

**IO:**
- Reading data from FAT16/FAT32 SD Card.
- Reading/writing to RS232 port.
- 2 MegaDrive/Genesis-compatible controllers.
- PS2 Keyboard.

**Video:**
- 224x192 pixel resolution.
- 25 fps (half PAL fps).
- 256 Colors (RGB332).
- 2x2 virtual background space (448x384 pixels), with bi-directional per-pixel scrolling.
- 64 sprites with width and height 8 or 16 pixels with possibility of being flipped in X or Y axis.
- Background and sprites composed of 8x8 pixels characters.
- Character RAM with 1024 background characters and 1024 sprite characters.
- 64 independent background horizontal scrolling in custom lines.
- 8 independent background vertical scrolling in custom lines.
- Overlay plane with 224x48 pixels with or without colorkey transparency.
- Background attribute table (this one is hard to summarize).
- RGB or Composite output through SCART socket.

**Sound:**
- PWM generated 8-bit 4 channel sound, with pre-defined waveforms (square, sine, sawtooth, noise, etc.).
- 8-bit 8Khz PCM samples in one of PWM channels.
- YM3438 FM synthesis chip updated with instructions at 50Hz.


## Developing for the Console

**CPU Mapping**

The CPU accesses its bootloader ROM and RAM through the memory space.  
CPU memory space mapping:  
![Memory Mapping](/assets/memoryMapping.png)  

It accesses the PPU-RAM, SPU-RAM and the IO MCU through IO space.  
CPU IO Space mapping:  
![IO Mapping](/assets/ioMapping.png)  

**Using Assembly to code**

It's possible to develop games for the console using assembly language and knowing the Z80 IO space and memory space mapping for the console.

This is a sample code of a sprite moving and bumping into the corners of the screen:

{% highlight asm %}
ORG 2100h

PPU_SPRITES: EQU $1004
SPRITE_CHR: EQU 72
SPRITE_COLORKEY: EQU $1F
SPRITE_INIT_POS_X: EQU 140
SPRITE_INIT_POS_Y: EQU 124

jp main

DS $2166-$
nmi:
    ld bc, PPU_SPRITES + 3
    ld a, (sprite_dir)
    and a, 1
    jr z, subX
    in a, (c) ; increment X
    inc a
    out (c), a
    cp 248
    jr nz, updateY
    ld a, (sprite_dir)
    xor a, 1
    ld (sprite_dir), a
    jp updateY
subX:
    in a, (c) ; decrement X
    dec a
    out (c), a
    cp 32
    jr nz, updateY    
    ld a, (sprite_dir)
    xor a, 1
    ld (sprite_dir), a
updateY:
    inc bc
    ld a, (sprite_dir)
    and a, 2
    jr z, subY
    in a, (c) ; increment Y
    inc a
    out (c), a
    cp 216
    jr nz, moveEnd
    ld a, (sprite_dir)
    xor a, 2
    ld (sprite_dir), a
    jp moveEnd
subY:
    in a, (c) ; decrement Y
    dec a
    out (c), a
    cp 32
    jr nz, moveEnd
    ld a, (sprite_dir)
    xor a, 2
    ld (sprite_dir), a
moveEnd:
    ret

main:
    ld bc, PPU_SPRITES
    ld a, 1
    out (c), a  ; Set Sprite 0 as active
    inc bc
    ld a, SPRITE_CHR
    out (c), a  ; Set Sprite 0 character
    inc bc
    ld a, SPRITE_COLORKEY
    out (c), a  ; Set Sprite 0 colorkey
    inc bc
    ld a, SPRITE_INIT_POS_X
    out (c), a  ; Set Sprite 0 position X
    inc bc
    ld a, SPRITE_INIT_POS_Y
    out (c), a  ; Set Sprite 0 position Y
mainLoop:    
    jp mainLoop

sprite_dir:     DB 0

{% endhighlight %}


**Using a C toolchain**

It's also possible to develop games and/or programs using the <a href="http://sdcc.sourceforge.net/" target="_blank">SDCC</a> compiler and a customized toolchain to use C language.  
This makes development quicker, although it could lead to less performant code.

Example sample code with an equivalent example to the above assembly code:

{% highlight c %}
#include <console.h>

#define SPRITE_CHR 72
#define SPRITE_COLORKEY 0x1F
#define SPRITE_INIT_POS_X 140
#define SPRITE_INIT_POS_Y 124

struct s_sprite sprite = { 1, SPRITE_CHR, SPRITE_COLORKEY, SPRITE_INIT_POS_X, SPRITE_INIT_POS_Y };
uint8_t sprite_dir = 0;

void nmi() {
    if (sprite_dir & 1)
    {
        sprite.x++;
        if (sprite.x == 248)
        {
            sprite_dir ^= 1;
        }
    }
    else
    {
        sprite.x--;
        if (sprite.x == 32)
        {
            sprite_dir ^= 1;
        }
    }

    if (sprite_dir & 2)
    {
        sprite.y++;
        if (sprite.y == 216)
        {
            sprite_dir ^= 2;
        }
    }
    else
    {
        sprite.y--;
        if (sprite.x == 32)
        {
            sprite_dir ^= 2;
        }
    }

    set_sprite(0, sprite);
}

void main() {
	while(1) {
	}
}
{% endhighlight %}

**Custom Graphics**

The console has graphics read-only graphics stored in the PPU firmware, however it is possible to use custom graphics for the program.  
Custom graphics are composed of 4 pages of 256 8x8 characters for background and 4 pages of 256 8x8 characters for sprites.  
I use a PNG file for every page, such as this one:

![Sample character sheet](/assets/tetrisTilesSheet.png)

And then use a homebrew converter to convert it to an RGB332 binary file.

![Graphics command line](/assets/graphicsCmd.png)

**Sound**

Wave samples can be converted to 8-bit 8Khz PCM samples.  
Patches for PWM SFX/music can be composed using pre-defined instructions (more on that later).  
And as for Yamaha YM3438 FM Synthesis chip, I found that the application called <a href="http://deflemask.com" target="_blank">DefleMask</a> can be used to produce a PAL clocked music targeting the Genesis sound-chip YM2612 (which is compatible with the YM3438).  
DeffleMask will export to VGM and then I can use another homebrew converter to convert VGM to a homebrew sound binary.  
All the binaries from all types of sound are combined into a single binary file.  

**Putting it all together**

The program's binary, the graphics and the sound are combined into a PRG file.  
A PRG file has a header indicating if the program has custom graphics and/or sound and what's the size for each as well as all the corresponding binary information.  
This file can then be put into and SD Card and the Console bootloader program will read it and load it into all the specific RAMs (CPU RAM, Character RAM and Sound RAM) and run the program.  

![PRG command line](/assets/prgCmd.png)

**Using the emulator**

I've also developed an emulator to help with development before testing it in real hardware.  

![Emulator Demo](/assets/emulatorDemo.gif)

## Showcase

BASIC implementation running on the console, in this video, after the first program, I write directly into PPU-RAM through IO space to configure a sprite and move it:  

<iframe width="909" height="511" src="https://www.youtube.com/embed/2UNjKx4uZGY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Graphics demo, this video shows a program that bounces 64 16x16 sprites, over a background with custom scrolling and with the overlay plane enabled and moving up and down above or behind sprites:  

Sound demo:  

Tetris implementation:  

## In conclusion

This project was truly a dream come true, I have worked on it for some years now on and off during my free time, I never thought I would reached this far into building my own retro-style video game console. It certainly is not perfect, it has way too many components and undoubtedly could be made better and more efficient. However, I learned a lot about electronics, game console and computer design, assembly language and other interesting topics, and above all it gives me great satisfaction to play a game I made on hardware I've made and designed myself.  

I have plans to build other consoles/computers. In fact I have another project, almost complete, which is a simplified retro-style console based in a cheap FPGA board ($10 to $15) and a few extra components (not as many as in this project, obviously), designed to be a lot cheaper and replicable.

If you've read this far, thank you. :)
Depending on the feedback I might write other articles focusing on the different modules of the console with more detail or talking about other projects.

**Projects/Websites/Youtube channels that helped me for inspiration and technical knowledge:**

- <a href="http://uzebox.org/" target="_blank">Uzebox</a>
- <a href="http://benryves.com/" target="_blank">Ben Ryves</a>
- <a href="http://blog.retroleum.co.uk/" target="_blank">Retroleum</a>
- <a href="http://www.z80.info/" target="_blank">Z80.info</a>
- <a href="https://www.youtube.com/channel/UC2DjFE7Xf11URZqWBigcVOQ" target="_blank">EEVBlog</a>
- <a href="https://www.youtube.com/channel/UCwRqWnW5ZkVaP_lZF7caZ-g" target="_blank">Retro Game Mechanics</a>

If you wish to contact me about this or other projects, you can do so at internalregister (at) gmail (dot) com
