(function (name, factory) {
    if( typeof window === "object" ) {
        window[name] = factory();
     }
})("PPU", function() {
    var Factory = function(targetElement, options) {
        this._targetElement = targetElement;
        this._options = options;

        if (!this._options) {
            this._options = {
                zoom: 3
            };
        }

        if (this._options.zoom) {
            this._options.zoom = Math.max(1, Math.floor(this._options.zoom));
        }

        this._canvas = document.createElement("canvas");
        this._canvas.width = 224*this._options.zoom;
        this._canvas.height = 192*this._options.zoom;
        this._targetElement.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d");
        this._image = this._ctx.createImageData(224 * this._options.zoom, 192 * this._options.zoom);
        var data = this._image.data;
        
        for(var y = 0; y < 192 * this._options.zoom; y++) {
            for(var x = 0; x < 224 * this._options.zoom; x++) {
                data[y * (224 * this._options.zoom) * 4 + (x * 4 + 0)] = 0;
                data[y * (224 * this._options.zoom) * 4 + (x * 4 + 1)] = 0;
                data[y * (224 * this._options.zoom) * 4 + (x * 4 + 2)] = 0;
                data[y * (224 * this._options.zoom) * 4 + (x * 4 + 3)] = 255;
            }
        }
        this._ctx.putImageData(this._image, 0, 0);

        this._ppuRAM = new Array(4096);
        this._chrRAM = new Array(131072);
        for(var x = 0; x < 131072; x++) {
            this._chrRAM[x] = Math.floor(Math.random() * 256);
        }
        this._frameData = new Array(224*192);

        this._convertRGB = function(r, g, b) {
            return (Math.round(b / (255/3)) << 6) | (Math.round(g / (255/7)) << 3) | Math.round(r / (255/7));
        }

        this._loadImageDataToChrRam = function(imageData, adress) {
            var imgAddress = 0;
            var dstAddress = adress;
            for(var ty = 0; ty < Math.floor(imageData.height / 8); ty++) {
                for(var tx = 0; tx < Math.floor(imageData.width / 8); tx++) {
                    for(var y = 0; y < 8; y++) {
                        for(var x = 0; x < 8; x++) {
                            imgAddress = (ty*8+y) * imageData.width + (tx*8+x);
                            this._chrRAM[dstAddress] = this._convertRGB(
                                imageData.data[imgAddress*4],
                                imageData.data[imgAddress*4+1],
                                imageData.data[imgAddress*4+2]);
                            dstAddress++;
                        }
                    }
                }
            }

            if (this._options.onChrRamChange) {
                this._options.onChrRamChange(this._chrRAM);
            }
        }

        var img = document.createElement("img");
        img.onload = (function(ppu) { return function() {
            var tempCanvas = document.createElement("canvas");
            var context = tempCanvas.getContext("2d");
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            context.drawImage(img, 0, 0);
            var imgData = context.getImageData(0, 0, img.width, img.height);
            ppu._loadImageDataToChrRam(imgData, 0 * 16384);

            img.onload = (function(ppu) { return function() {
                var tempCanvas = document.createElement("canvas");
                var context = tempCanvas.getContext("2d");
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                context.drawImage(img, 0, 0);
                var imgData = context.getImageData(0, 0, img.width, img.height);
                ppu._loadImageDataToChrRam(imgData, 4 * 16384);
            }; })(ppu);
            img.src = "/assets/ppuSimSprites.png";

        }; })(this);
        img.src = "/assets/ppuSimTiles.png";
    }

    Factory.prototype = {
        constructor: Factory,

        SCROLL_X_ADDR:  0x001,
        SCROLL_Y_ADDR:  0x002,
        SCROLL_TABLES_ADDR:  0x003,
        SPRITES_ADDR: 0x004,
        NAMETABLE_0_ADDR: 0x144,
        NAMETABLE_1_ADDR: 0x3e4,
        NAMETABLE_2_ADDR: 0x684,
        NAMETABLE_3_ADDR: 0x924,
        ATTRTABLE_0_ADDR: 0xbc4,
        ATTRTABLE_1_ADDR: 0xc6c,
        ATTRTABLE_2_ADDR: 0xd14,
        ATTRTABLE_3_ADDR: 0xdbc,
        TILEPAGE_ADDR: 0xe64,
        TILEINC_ADDR: 0xe68,
        OVERLAY_MISC_ADDR: 0xe6c,
        OVERLAY_POSITION_ADDR: 0xe6d,
        OVERLAY_COLORKEY_ADDR: 0xe6e,
        OVERLAY_NAMETABLE_ADDR: 0xe6f,
        CUSTOM_SCROLL_ACTIVE_ADDR: 0xf17,
        CUSTOM_SCROLL_X_ADDR: 0xf18,
        CUSTOM_SCROLL_Y_ADDR: 0xfd8,

        _colors: [[0,0,0],[36,0,0],[72,0,0],[109,0,0],[145,0,0],[182,0,0],[218,0,0],[255,0,0],[0,36,0],[36,36,0],[72,36,0],[109,36,0],[145,36,0],[182,36,0],[218,36,0],[255,36,0],[0,72,0],[36,72,0],[72,72,0],[109,72,0],[145,72,0],[182,72,0],[218,72,0],[255,72,0],[0,109,0],[36,109,0],[72,109,0],[109,109,0],[145,109,0],[182,109,0],[218,109,0],[255,109,0],[0,145,0],[36,145,0],[72,145,0],[109,145,0],[145,145,0],[182,145,0],[218,145,0],[255,145,0],[0,182,0],[36,182,0],[72,182,0],[109,182,0],[145,182,0],[182,182,0],[218,182,0],[255,182,0],[0,218,0],[36,218,0],[72,218,0],[109,218,0],[145,218,0],[182,218,0],[218,218,0],[255,218,0],[0,255,0],[36,255,0],[72,255,0],[109,255,0],[145,255,0],[182,255,0],[218,255,0],[255,255,0],[0,0,85],[36,0,85],[72,0,85],[109,0,85],[145,0,85],[182,0,85],[218,0,85],[255,0,85],[0,36,85],[36,36,85],[72,36,85],[109,36,85],[145,36,85],[182,36,85],[218,36,85],[255,36,85],[0,72,85],[36,72,85],[72,72,85],[109,72,85],[145,72,85],[182,72,85],[218,72,85],[255,72,85],[0,109,85],[36,109,85],[72,109,85],[109,109,85],[145,109,85],[182,109,85],[218,109,85],[255,109,85],[0,145,85],[36,145,85],[72,145,85],[109,145,85],[145,145,85],[182,145,85],[218,145,85],[255,145,85],[0,182,85],[36,182,85],[72,182,85],[109,182,85],[145,182,85],[182,182,85],[218,182,85],[255,182,85],[0,218,85],[36,218,85],[72,218,85],[109,218,85],[145,218,85],[182,218,85],[218,218,85],[255,218,85],[0,255,85],[36,255,85],[72,255,85],[109,255,85],[145,255,85],[182,255,85],[218,255,85],[255,255,85],[0,0,170],[36,0,170],[72,0,170],[109,0,170],[145,0,170],[182,0,170],[218,0,170],[255,0,170],[0,36,170],[36,36,170],[72,36,170],[109,36,170],[145,36,170],[182,36,170],[218,36,170],[255,36,170],[0,72,170],[36,72,170],[72,72,170],[109,72,170],[145,72,170],[182,72,170],[218,72,170],[255,72,170],[0,109,170],[36,109,170],[72,109,170],[109,109,170],[145,109,170],[182,109,170],[218,109,170],[255,109,170],[0,145,170],[36,145,170],[72,145,170],[109,145,170],[145,145,170],[182,145,170],[218,145,170],[255,145,170],[0,182,170],[36,182,170],[72,182,170],[109,182,170],[145,182,170],[182,182,170],[218,182,170],[255,182,170],[0,218,170],[36,218,170],[72,218,170],[109,218,170],[145,218,170],[182,218,170],[218,218,170],[255,218,170],[0,255,170],[36,255,170],[72,255,170],[109,255,170],[145,255,170],[182,255,170],[218,255,170],[255,255,170],[0,0,255],[36,0,255],[72,0,255],[109,0,255],[145,0,255],[182,0,255],[218,0,255],[255,0,255],[0,36,255],[36,36,255],[72,36,255],[109,36,255],[145,36,255],[182,36,255],[218,36,255],[255,36,255],[0,72,255],[36,72,255],[72,72,255],[109,72,255],[145,72,255],[182,72,255],[218,72,255],[255,72,255],[0,109,255],[36,109,255],[72,109,255],[109,109,255],[145,109,255],[182,109,255],[218,109,255],[255,109,255],[0,145,255],[36,145,255],[72,145,255],[109,145,255],[145,145,255],[182,145,255],[218,145,255],[255,145,255],[0,182,255],[36,182,255],[72,182,255],[109,182,255],[145,182,255],[182,182,255],[218,182,255],[255,182,255],[0,218,255],[36,218,255],[72,218,255],[109,218,255],[145,218,255],[182,218,255],[218,218,255],[255,218,255],[0,255,255],[36,255,255],[72,255,255],[109,255,255],[145,255,255],[182,255,255],[218,255,255],[255,255,255]],

        _preCalcTiles1: new Array(28),
        _preCalcTiles2: new Array(28),
        _currentDrawTileVRAMAddress: 0,

        _drawTilesDrawLines: function(dst, yPage, tileY28, y8, xScroll, xPage) {
            var firstPreCalcTable = this._preCalcTiles1, secondPreCalcTable = this._preCalcTiles2;
            var firstPreCalcTableAddr = 0, secondPreCalcTableAddr = 0;

            if (xPage)
            {
                firstPreCalcTable = this._preCalcTiles2;
                secondPreCalcTable = this._preCalcTiles1;
            }

            var x1 = xScroll % 8;
            var xTiles2 = Math.floor(xScroll / 8);
            var xTiles1 = 28 - xTiles2;
            var i;
            var address;

            firstPreCalcTableAddr += (xTiles2);

            if (x1 > 0)
            {
                xTiles1--;
                address = firstPreCalcTable[firstPreCalcTableAddr++] + y8 + x1;
                for (var j = x1; j < 8; j++)
                {
                    dst[this._currentDrawTileVRAMAddress++] = this._colors[this._chrRAM[address++]];
                }
            }

            for (var i = 0; i < xTiles1; i++)
            {
                address = firstPreCalcTable[firstPreCalcTableAddr++] + y8;
                for (var j = 0; j < 8; j++)
                {
                    dst[this._currentDrawTileVRAMAddress++] = this._colors[this._chrRAM[address++]];
                }
            }

            for (var i = 0; i < xTiles2; i++)
            {
                address = secondPreCalcTable[secondPreCalcTableAddr++] + y8;
                for (var j = 0; j < 8; j++)
                {
                    dst[this._currentDrawTileVRAMAddress++] = this._colors[this._chrRAM[address++]];
                }
            }

            if (x1 > 0)
            {
                address = secondPreCalcTable[secondPreCalcTableAddr++] + y8;
                for (var j = 0; j < x1; j++)
                {
                    dst[this._currentDrawTileVRAMAddress++] = this._colors[this._chrRAM[address++]];
                }
            }
        },

        _drawTilesPreCalcTiles: function(yPage, y28) {
            var i, j;
            var firstPage = this.NAMETABLE_2_ADDR, secondPage = this.NAMETABLE_3_ADDR;
            var firstAttrPage = this.ATTRTABLE_2_ADDR, secondAttrPage = this.ATTRTABLE_3_ADDR;

            if (yPage === 1) {
                firstPage = this.NAMETABLE_0_ADDR; secondPage = this.NAMETABLE_1_ADDR;
                firstAttrPage = this.ATTRTABLE_0_ADDR; secondAttrPage = this.ATTRTABLE_1_ADDR;
            }

            firstPage += y28;
	        secondPage += y28;
	        firstAttrPage += Math.floor(y28 / 4);
            secondAttrPage += Math.floor(y28 / 4);
            
            var currentTile = 0, attr = 0;
            for (var i = 0; i < 7; i++)
            {
                attr = this._ppuRAM[firstAttrPage++];
                for (var j = 0; j < 4; j++)
                {
                    this._preCalcTiles1[currentTile] = (this._ppuRAM[this.TILEPAGE_ADDR + (attr & 0x3)] * 16384 + (this._ppuRAM[firstPage++] + this._ppuRAM[this.TILEINC_ADDR + (attr & 0x3)]) * 64) % 65536;
                    attr >>= 2;
                    currentTile++;
                }
            }

            currentTile = 0; attr = 0;
            for (var i = 0; i < 7; i++)
            {
                attr = this._ppuRAM[secondAttrPage++];
                for (var j = 0; j < 4; j++)
                {
                    this._preCalcTiles2[currentTile] = (this._ppuRAM[this.TILEPAGE_ADDR + (attr & 0x3)] * 16384 + (this._ppuRAM[secondPage++] + this._ppuRAM[this.TILEINC_ADDR + (attr & 0x3)]) * 64) % 65536;
                    attr >>= 2;
                    currentTile++;
                }
            }
        },

        _drawTiles: function(dst) {
            var current_line = 0;

            var y28 = (24 - (Math.floor(this._ppuRAM[this.SCROLL_Y_ADDR] / 8)) - 1) * 28;
            var curCharY = ((8 - this._ppuRAM[this.SCROLL_Y_ADDR] % 8) * 8);
            var scrollX = this._ppuRAM[this.SCROLL_X_ADDR], scrollY;
            var scrollXPage = this._ppuRAM[this.SCROLL_TABLES_ADDR] & 0x1;
            var yPage = (this._ppuRAM[this.SCROLL_TABLES_ADDR] >> 1) & 0x1;
            var customXScrollAddr = this.CUSTOM_SCROLL_X_ADDR;
            var customYScrollAddr = this.CUSTOM_SCROLL_Y_ADDR;
            var customXScrollCount = 0, customYScrollCount = 0;

            this._currentDrawTileVRAMAddress = 0;

            do
            {
                if ((this._ppuRAM[this.CUSTOM_SCROLL_ACTIVE_ADDR] === 1) && (customYScrollCount < 8) && (this._ppuRAM[customYScrollAddr] === current_line))
                {
                    // Custom Y scroll
                    scrollY = this._ppuRAM[++customYScrollAddr];
                    yPage = this._ppuRAM[++customYScrollAddr];
                    customYScrollAddr++;
                    curCharY = ((8 - (scrollY % 8)) * 8);
                    y28 = ((24 - (Math.floor(scrollY / 8))) - 1) * 28;

                    if (curCharY < 64)
                    {
                        this._drawTilesPreCalcTiles(yPage, y28);
                    }

                    customYScrollCount++;
                }

                if (curCharY == 64)
                {
                    y28 += 28;
                    curCharY = 0;

                    if (y28 == 672)
                    {
                        y28 = 0;
                        yPage ^= 0x1;
                    }
                    this._drawTilesPreCalcTiles(yPage, y28);
                }
                else if (current_line == 0)
                {
                    this._drawTilesPreCalcTiles(yPage, y28);
                }

                if ((this._ppuRAM[this.CUSTOM_SCROLL_ACTIVE_ADDR] === 1) && (customXScrollCount < 64) && (this._ppuRAM[customXScrollAddr] === current_line))
                {
                    // Custom X scroll
                    scrollX = this._ppuRAM[++customXScrollAddr];
                    scrollXPage = this._ppuRAM[++customXScrollAddr];
                    customXScrollAddr++;
                    customXScrollCount++;
                }

                this._drawTilesDrawLines(dst, yPage, y28, curCharY, scrollX, scrollXPage);
                curCharY += 8;
                current_line++;
            } while (current_line < 192);
        },

        _drawSprite: function(dst, spritenum, xImage, yImage, colorKey, flipX, flipY, charPage) {
            var x, y, xTile, yTile;
            for (y = yImage, yTile = 0; yTile < 8; y++, yTile++)
            {
                for (x = xImage, xTile = 0; xTile < 8; x++, xTile++)
                {
                    if (x >= 0 && y >= 0 &&
                        x < 224 && y < 192)
                    {
                        var color = 0;
                        if (flipX && flipY)
                        {
                            color = this._chrRAM[65536 + (16384*charPage) + (spritenum * 64 + ((7 - yTile) * 8) + (7 - xTile))];
                        }
                        else if (flipX)
                        {
                            color = this._chrRAM[65536 + (16384 * charPage) + (spritenum * 64 + (yTile * 8) + (7 - xTile))];
                        }
                        else if (flipY)
                        {
                            color = this._chrRAM[65536 + (16384 * charPage) + (spritenum * 64 + ((7 - yTile) * 8) + xTile)];
                        }
                        else
                        {
                            color = this._chrRAM[65536 + (16384 * charPage) + (spritenum * 64 + (yTile * 8) + xTile)];
                        }                        

                        if (color != colorKey)
                        {
                            dst[y * 224 + x] = this._colors[color];
                        }
                    }
                }
            }
        },

        _drawSprites: function(dst, aboveOverlay) {
            var i = 0, c = 0;
            for (i = 0; i < 64; i++)
            {
                if ((this._ppuRAM[this.SPRITES_ADDR+i*5] & 0x1) && 
                    ((aboveOverlay && (this._ppuRAM[this.SPRITES_ADDR+i*5] & 32)) ||
                    (!aboveOverlay && !(this._ppuRAM[this.SPRITES_ADDR+i*5] & 32))))
                {
                    c = 0;
                    var width16 = ((this._ppuRAM[this.SPRITES_ADDR+i*5] & 64) != 0);
                    var height16 = ((this._ppuRAM[this.SPRITES_ADDR+i*5] & 128) != 0);
                    var flipX = ((this._ppuRAM[this.SPRITES_ADDR+i*5] & 8) != 0);
                    var flipY = ((this._ppuRAM[this.SPRITES_ADDR+i*5] & 16) != 0);

                    for (var y = 0; y < (height16 ? 2 : 1); y++)
                    {
                        for (var x = 0; x < (width16 ? 2 : 1); x++)
                        {
                            var xImage = this._ppuRAM[this.SPRITES_ADDR+(i*5)+3] - 32 + (x * 8);
                            var yImage = this._ppuRAM[this.SPRITES_ADDR+(i*5)+4] - 32 + (y * 8);

                            if (width16 && flipX)
                            {
                                xImage = this._ppuRAM[this.SPRITES_ADDR+(i*5)+3] - 32 + (8 - (x * 8));
                            }

                            if (height16 && flipY)
                            {
                                yImage = this._ppuRAM[this.SPRITES_ADDR+(i*5)+4] - 32 + (8 - (y * 8));
                            }

                            this._drawSprite(dst, this._ppuRAM[this.SPRITES_ADDR+(i*5)+1] + c,  
                                xImage, yImage,
                                this._ppuRAM[this.SPRITES_ADDR+(i*5)+2],
                                flipX,
                                flipY,
                                (((this._ppuRAM[this.SPRITES_ADDR+(i*5)] & 2) >> 1) | ((this._ppuRAM[this.SPRITES_ADDR+(i*5)] & 4) >> 1)));
                            c++;
                        }
                    }
                }
            }
        },

        _drawTile: function(dst, tilenum, xImage, yImage) {
            var x, xTile, y, yTile;
            for (y = (yImage < 0 ? 0 : yImage), yTile = (yImage < 0 ? (-yImage) % 8 : 0); y < (yImage + 8 < 193 ? yImage + 8 : 192); y++, yTile++)
            {
                for (x = (xImage < 0 ? 0 : xImage), xTile = (xImage < 0 ? (-xImage) % 8 : 0); x < (xImage + 8 < 225 ? xImage + 8 : 224); x++, xTile++)
                {
                    dst[y * 224 + x] = this._colors[this._chrRAM[tilenum * 64 + (yTile * 8) + xTile]];
                }
            }
        },

        _drawOverlay: function(dst) {
            var x, y;
            if (this._ppuRAM[this.OVERLAY_MISC_ADDR] & 0x1)
            {
                for (x = 0; x < 28; x++)
                {
                    for (y = 0; y < 6; y++)
                    {
                        if (this._ppuRAM[this.OVERLAY_MISC_ADDR] & 0x4)
                        {
                            this._drawSprite(dst, this._ppuRAM[this.OVERLAY_NAMETABLE_ADDR + (y*28 + x)],
                                x * 8, y * 8 + this._ppuRAM[this.OVERLAY_POSITION_ADDR],
                                this._ppuRAM[this.OVERLAY_COLORKEY_ADDR], false, false, 0);
                        }
                        else
                        {
                            this._drawTile(dst, this._ppuRAM[this.OVERLAY_NAMETABLE_ADDR + (y*28 + x)], x * 8, y * 8 + this._ppuRAM[this.OVERLAY_POSITION_ADDR]);
                        }
                    }
                }
            }
        },

        renderFrame: function () {
            this._drawTiles(this._frameData);
            this._drawSprites(this._frameData, false);
            this._drawOverlay(this._frameData);
            this._drawSprites(this._frameData, true);
            var data = this._image.data;
            var frameAddress = 0, address = 0;
            for(var y = 0; y < 192*this._options.zoom; y++) {
                for(var x = 0; x < 224*this._options.zoom; x++) {
                    frameAddress = (Math.floor(y / this._options.zoom) * 224) + Math.floor(x / this._options.zoom);
                    data[address++] = this._frameData[frameAddress][0];
                    data[address++] = this._frameData[frameAddress][1];
                    data[address++] = this._frameData[frameAddress][2];
                    data[address++] = 255;
                }
            }
            this._ctx.putImageData(this._image, 0, 0);
        },

        reset: function() {
            this.resetPPURAM();
        },

        start: function() {
            this.stop();
            if (this._options.onInit) {
                this._options.onInit(this);
            }
            if (this._options.onFrame) {
                this._intervalHandler = setInterval((function(ppu) { return (function() {
                    ppu._options.onFrame(ppu);
                    ppu.renderFrame();
                });})(this), 40);
            } else {
                this.renderFrame();
            }
        },

        stop: function() {
            if (this._intervalHandler) {
                clearInterval(this._intervalHandler);
                this._intervalHandler = null;
            }
        },

        resetPPURAM: function() {
            for(var i = 0; i < 4096; i++) {
                this._ppuRAM[i] = (i === 0) ? 1 : 0;
                if (this._options.onSetPpuRamValue) {
                    this._options.onSetPpuRamValue(i, this._ppuRAM[i]);
                }
            }
        },

        getPPURAM: function(address) {
            return this._ppuRAM[address];
        },

        setPPURAM: function(address, value) {
            this._ppuRAM[address] = parseInt(value) % 256;
            if (this._options.onSetPpuRamValue) {
                this._options.onSetPpuRamValue(address, value);
            }
        },

        loadChrRam: function(imgData, address) {
            this._loadImageDataToChrRam(imgData, address);
        },


    }



    return Factory;
});
