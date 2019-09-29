(function (name, factory) {
    if( typeof window === "object" ) {
        window[name] = factory();
     }
})("CHRRam", function() {
    var Factory = function(targetElement, options) {
        this._targetElement = targetElement;
        this._options = options;

        if (!this._options) {
            this._options = {};
        }

        this._CHR_ZOOM = 16;

        this._canvas = document.createElement("canvas");        
        this._canvas.width = 128*4;
        this._canvas.height = 128*2;
        this._canvas.style = "order: 0";
        this._targetElement.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d");
        this._image = this._ctx.createImageData(128 * 4, 128 * 2);

        var divChrInfo = document.createElement("div");
        divChrInfo.style = "order: 1; margin-left: 20px";

        this._chrInfo = document.createElement("div");
        this._chrInfo.id = "charRamchrInfo";
        this._chrInfo.style = "margin-bottom: 35px";
        divChrInfo.appendChild(this._chrInfo);

        this._chrCanvas = document.createElement("canvas");
        this._chrCanvas.style = "margin-bottom: 10px";
        this._chrCanvas.width = 8*this._CHR_ZOOM;
        this._chrCanvas.height = 8*this._CHR_ZOOM;        
        divChrInfo.appendChild(this._chrCanvas);
        this._chrCtx = this._chrCanvas.getContext("2d");
        this._chrImage = this._chrCtx.createImageData(8 * this._CHR_ZOOM, 8 * this._CHR_ZOOM);

        this._targetElement.appendChild(divChrInfo);

        this._chrTable = document.createElement("table");
        this._chrTable.id = "chrTable";
        this._chrTable.style = "order: 2";
        var tempStr = "";
        for (var j = 0; j < 8; j++) {
            tempStr += "<tr>";
            for (var i = 0; i < 8; i++) {
                tempStr += '<td id="chrCell' + (j*8+i) + '"></td>';
            }
            tempStr += "</tr>";
        }
        this._chrTable.innerHTML = tempStr;
        this._targetElement.appendChild(this._chrTable);

        this._coverDiv = document.createElement("div");
        this._coverDiv.style = "display:none";
        this._coverDiv.setAttribute("class", "cover-div");
        this._targetElement.appendChild(this._coverDiv);

        this._loadChrs = document.createElement("div");
        this._loadChrs.id = "chrRamLoad";
        this._loadChrs.setAttribute("class", "chr-ram-load-chrs");
        this._loadChrs.style = "display:none";
        tempStr = '<div style="margin-bottom: 10px">Load Image files as characters</div>';
        tempStr += '<div><div><span>Type: </span><select id="chrRamLoadTileType" value="0"><option>Tile</option><option value="0">Sprite</option></select></div>';
        tempStr += '<div><span>Page: </span><select id="chrRamLoadPage"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>';
        tempStr += '<div><span>Character: </span><select id="chrRamLoadChar"></select></div>';
        tempStr += '<div><input id="chrRamLoadFile" type="file"></input></div></div>';
        tempStr += '<div style="width: 100%; text-align: center; margin-top: 10px"><button id="chrRamLoad" style="margin-right: 5px">Load</button><button id="chrRamLoadCancel">Cancel</button></div>'
        this._loadChrs.innerHTML = tempStr;
        var chrRamLoadChar = this._loadChrs.querySelector("#chrRamLoadChar");
        var tempElement;
        for(var i = 0; i < 256; i++) {
            tempElement = document.createElement("option");
            tempElement.innerText = i;
            tempElement.value = i;
            chrRamLoadChar.appendChild(tempElement);
        }
        this._loadChrs.querySelector("#chrRamLoad").onclick = (function(chrRam) {
            return function() {
                if (chrRam._ppu) {
                    var chrRamFile = chrRam._loadChrs.querySelector("#chrRamLoadFile");
                    if (!chrRamFile.files || chrRamFile.files.length === 0) {
                        alert("You need to select file.");
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        var img = new Image();
                        img.onload = function(){
                            console.log("image loaded", img);                        
                            if (img.width % 8 !== 0 || img.height % 8 !== 0) {
                                alert("Image file needs to have its width and height be a multiple of 8.");                            
                                return;
                            }
                            var tempCanvas = document.createElement("canvas");
                            var context = tempCanvas.getContext("2d");
                            tempCanvas.width = img.width;
                            tempCanvas.height = img.height;
                            context.drawImage(img, 0, 0);
                            var imgData = context.getImageData(0, 0, img.width, img.height);

                            var tileType = parseInt(chrRam._loadChrs.querySelector("#chrRamLoadTileType").selectedIndex);
                            var page = parseInt(chrRam._loadChrs.querySelector("#chrRamLoadPage").selectedIndex);
                            var character = parseInt(chrRam._loadChrs.querySelector("#chrRamLoadChar").selectedIndex);

                            chrRam._ppu.loadChrRam(imgData, tileType * 65536 + page * 16384 + character * 64);

                            chrRam.hideLoadChrs();
                        }
                        img.onerror = function(ev) {
                            alert("Error loading image file.");
                        }
                        img.src = ev.target.result;
                    };
                    reader.readAsDataURL(chrRamFile.files[0]);
                }
            };
        })(this);
        this._loadChrs.querySelector("#chrRamLoadCancel").onclick = (function(chrRam) {
            return function() {
                chrRam.hideLoadChrs();
            }
        })(this);
        this._targetElement.appendChild(this._loadChrs);

        this._findPos = function(obj) {
            var curleft = 0, curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return { x: curleft, y: curtop };
            }
            return undefined;
        }

        this._selectedCharacter = -1;

        this._canvas.onmousemove = (function(chrRam){
            return function(e) {
                var pos = chrRam._findPos(this);
                var x = e.pageX - pos.x;
                var y = e.pageY - pos.y;

                if (y > 0 && y < 128*2 &&
                    x > 0 && x < 128*4) {
                    var tableType = Math.floor(y / 128);
                    var pageNumber = Math.floor(x / 128);
                    var characterNumber = Math.floor((y % 128) / 8) * 16 + Math.floor((x % 128) / 8);
                    var selectedCharacter = tableType * 256 * 4 + pageNumber * 256 + characterNumber;
                    var chrRamAddress = selectedCharacter * 64;
                    if (chrRam._selectedCharacter != selectedCharacter) {
                        var text = (tableType ? "Sprite" : "Tile") + " page " + (pageNumber) + "\n";
                        text += "Character #" + characterNumber;
                        chrRam._chrInfo.innerText = text;


                        chrRam._selectedCharacter = tableType * 256 * 4 + pageNumber * 256 + characterNumber;
                        var xStart = Math.floor(x / 8) * 8;
                        var yStart = Math.floor(y / 8) * 8;
                        var chrAddress = 0;
                        var srcX, srcY, srcAddress;
                        var chrCell = null;
                        for(var y = 0; y < 8*chrRam._CHR_ZOOM; y++) {
                            for(var x = 0; x < 8*chrRam._CHR_ZOOM; x++) {
                                srcX = Math.floor(x / chrRam._CHR_ZOOM) + xStart;
                                srcY = Math.floor(y / chrRam._CHR_ZOOM) + yStart;
                                srcAddress = srcY * 128 * 4 + srcX;
                                chrRam._chrImage.data[chrAddress++] = chrRam._image.data[srcAddress*4+0];
                                chrRam._chrImage.data[chrAddress++] = chrRam._image.data[srcAddress*4+1];
                                chrRam._chrImage.data[chrAddress++] = chrRam._image.data[srcAddress*4+2];
                                chrRam._chrImage.data[chrAddress++] = 255;                                
                            }
                        }
                        chrAddress = 0;
                        var color = [];
                        for(var y = 0; y < 8; y++) {
                            for (var x = 0; x < 8; x++) {
                                console.log("#chrCell" + Math.floor((chrAddress - 4) / 4));
                                chrCell = chrRam._chrTable.querySelector("#chrCell" + (chrAddress++));
                                chrCell.innerText = chrRam._chrRamData[chrRamAddress];
                                color = chrRam._colors[chrRam._chrRamData[chrRamAddress++]];
                                chrCell.style = "background-color: rgb("+color[0]+","+color[1]+","+color[2]+"); color: rgb("+(255-color[0])+","+(255-color[1])+","+(255-color[2])+")";
                            }
                        }
                        chrRam._chrCtx.putImageData(chrRam._chrImage, 0, 0);
                    }
                }
            }
        })(this);
    }

    Factory.prototype = {
        constructor: Factory,

        _colors: [[0,0,0],[36,0,0],[72,0,0],[109,0,0],[145,0,0],[182,0,0],[218,0,0],[255,0,0],[0,36,0],[36,36,0],[72,36,0],[109,36,0],[145,36,0],[182,36,0],[218,36,0],[255,36,0],[0,72,0],[36,72,0],[72,72,0],[109,72,0],[145,72,0],[182,72,0],[218,72,0],[255,72,0],[0,109,0],[36,109,0],[72,109,0],[109,109,0],[145,109,0],[182,109,0],[218,109,0],[255,109,0],[0,145,0],[36,145,0],[72,145,0],[109,145,0],[145,145,0],[182,145,0],[218,145,0],[255,145,0],[0,182,0],[36,182,0],[72,182,0],[109,182,0],[145,182,0],[182,182,0],[218,182,0],[255,182,0],[0,218,0],[36,218,0],[72,218,0],[109,218,0],[145,218,0],[182,218,0],[218,218,0],[255,218,0],[0,255,0],[36,255,0],[72,255,0],[109,255,0],[145,255,0],[182,255,0],[218,255,0],[255,255,0],[0,0,85],[36,0,85],[72,0,85],[109,0,85],[145,0,85],[182,0,85],[218,0,85],[255,0,85],[0,36,85],[36,36,85],[72,36,85],[109,36,85],[145,36,85],[182,36,85],[218,36,85],[255,36,85],[0,72,85],[36,72,85],[72,72,85],[109,72,85],[145,72,85],[182,72,85],[218,72,85],[255,72,85],[0,109,85],[36,109,85],[72,109,85],[109,109,85],[145,109,85],[182,109,85],[218,109,85],[255,109,85],[0,145,85],[36,145,85],[72,145,85],[109,145,85],[145,145,85],[182,145,85],[218,145,85],[255,145,85],[0,182,85],[36,182,85],[72,182,85],[109,182,85],[145,182,85],[182,182,85],[218,182,85],[255,182,85],[0,218,85],[36,218,85],[72,218,85],[109,218,85],[145,218,85],[182,218,85],[218,218,85],[255,218,85],[0,255,85],[36,255,85],[72,255,85],[109,255,85],[145,255,85],[182,255,85],[218,255,85],[255,255,85],[0,0,170],[36,0,170],[72,0,170],[109,0,170],[145,0,170],[182,0,170],[218,0,170],[255,0,170],[0,36,170],[36,36,170],[72,36,170],[109,36,170],[145,36,170],[182,36,170],[218,36,170],[255,36,170],[0,72,170],[36,72,170],[72,72,170],[109,72,170],[145,72,170],[182,72,170],[218,72,170],[255,72,170],[0,109,170],[36,109,170],[72,109,170],[109,109,170],[145,109,170],[182,109,170],[218,109,170],[255,109,170],[0,145,170],[36,145,170],[72,145,170],[109,145,170],[145,145,170],[182,145,170],[218,145,170],[255,145,170],[0,182,170],[36,182,170],[72,182,170],[109,182,170],[145,182,170],[182,182,170],[218,182,170],[255,182,170],[0,218,170],[36,218,170],[72,218,170],[109,218,170],[145,218,170],[182,218,170],[218,218,170],[255,218,170],[0,255,170],[36,255,170],[72,255,170],[109,255,170],[145,255,170],[182,255,170],[218,255,170],[255,255,170],[0,0,255],[36,0,255],[72,0,255],[109,0,255],[145,0,255],[182,0,255],[218,0,255],[255,0,255],[0,36,255],[36,36,255],[72,36,255],[109,36,255],[145,36,255],[182,36,255],[218,36,255],[255,36,255],[0,72,255],[36,72,255],[72,72,255],[109,72,255],[145,72,255],[182,72,255],[218,72,255],[255,72,255],[0,109,255],[36,109,255],[72,109,255],[109,109,255],[145,109,255],[182,109,255],[218,109,255],[255,109,255],[0,145,255],[36,145,255],[72,145,255],[109,145,255],[145,145,255],[182,145,255],[218,145,255],[255,145,255],[0,182,255],[36,182,255],[72,182,255],[109,182,255],[145,182,255],[182,182,255],[218,182,255],[255,182,255],[0,218,255],[36,218,255],[72,218,255],[109,218,255],[145,218,255],[182,218,255],[218,218,255],[255,218,255],[0,255,255],[36,255,255],[72,255,255],[109,255,255],[145,255,255],[182,255,255],[218,255,255],[255,255,255]],

        setChrRam: function(chrRam) {
            var address = 0;
            var dstX = 0, dstY = 0;
            var dstAddress = 0;
            var color;
            for (var py = 0; py < 2; py++) {
                for (var px = 0; px < 4; px++) {
                    for (var ty = 0; ty < 16; ty++) {
                        for (var tx = 0; tx < 16; tx++) {
                            for (var y = 0; y < 8; y++) {
                                for (var x = 0; x < 8; x++) {
                                    color = this._colors[chrRam[address++]];
                                    dstX = px * 128 + tx * 8 + x;
                                    dstY = py * 128 + ty * 8 + y;
                                    dstAddress = dstY * (128*4) + dstX;
                                    this._image.data[dstAddress*4+0] = color[0];
                                    this._image.data[dstAddress*4+1] = color[1];
                                    this._image.data[dstAddress*4+2] = color[2];
                                    this._image.data[dstAddress*4+3] = 255;
                                }
                            }
                        }
                    }
                }
            }
            this._ctx.putImageData(this._image, 0, 0);
            
            this._chrRamData = chrRam;
        },

        setPPU: function(ppu) {
            this._ppu = ppu;
        },
        
        showLoadChrs: function() {
            this._loadChrs.style = "";
            this._coverDiv.style = "";
        },

        hideLoadChrs: function() {
            this._loadChrs.style = "display:none";
            this._coverDiv.style = "display:none";
        }
    }

    return Factory
})