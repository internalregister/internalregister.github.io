(function (name, factory) {
    if( typeof window === "object" ) {
        window[name] = factory();
     }
})("PPURam", function() {
    var Factory = function(targetElement, options) {
        this._targetElement = targetElement;
        this._options = options;

        if (!this._options) {
            this._options = {};
        }

        this._memoryArea = [
            0,
            1,
            2,
            3,
            4,
            0x144,
            0x3e4,
            0x684,
            0x924,
            0xbc4,
            0xc6c,
            0xd14,
            0xdbc,
            0xe64,
            0xe68,
            0xe6c,
            0xe6d,
            0xe6e,
            0xe6f,
            0xf17,
            0xf18,
            0xfd8,
            0xff0,
            0x1000,
        ];

        this._memoryAreaNames = {
            PPU_STATUS: 0,
            SCROLL_X: 1,
            SCROLL_Y: 2,
            SCROLL_TABLES: 3,
            SPRITES: 4,
            NAMETABLE_0: 5,
            NAMETABLE_1: 6,
            NAMETABLE_2: 7,
            NAMETABLE_3: 8,
            ATTRTABLE_0: 9,
            ATTRTABLE_1: 10,
            ATTRTABLE_2: 11,
            ATTRTABLE_3: 12,
            ATTR_PAGE: 13,
            ATTR_INC: 14,
            OVERLAY_MISC: 15,
            OVERLAY_POSITION: 16,
            OVERLAY_COLOR_KEY: 17,
            OVERLAY_NAMETABLE: 18,
            CUSTOM_SCROLL_ACTIVE: 19,
            CUSTOM_SCROLL_X: 20,
            CUSTOM_SCROLL_Y: 21,
            UNUSED: 22
        };

        this._memoryAreaColors = [
            "#aaa",
            "#f78888", "#f78888", "#f78888",
            "#a7f98a",
            "#8adbf9", "#70d8ff", "#46cdff", "#009bd4",
            "#e7ceff", "#d6abff", "#c88fff", "#b86fff",
            "#abf8ff", "#46f0ff",
            "#fffa8b", "#fff750", "#fff409", "#ded400",
            "#ffce9d", "#ffa952", "#ff870e",
            "#777"
        ];

        this._getMemoryArea = function(address) {
            var c = 0;
            for(var i = 0; i < this._memoryArea.length; i++) {
                if (address < this._memoryArea[i]) {
                    return c - 1;
                }
                c++;
            }

            return c - 1;
        };

        this._getMemoryAreaColor = function(address) {
            return this._memoryAreaColors[this._getMemoryArea(address)];
        };

        this._getMemoryAreaText = function(address, value) {
            var text = "Address: 0x" + ("0000" + address.toString(16)).substr(-4).toUpperCase() + "\nValue: " + value + "\n\n";
            switch(this._getMemoryArea(address)) {
                case this._memoryAreaNames.PPU_STATUS:
                    text += "PPU Status byte";
                    break;
                case this._memoryAreaNames.SCROLL_X:
                    text += "Background horizontal scroll";
                    break;
                case this._memoryAreaNames.SCROLL_Y:
                    text += "Background vertical scroll";
                    break;
                case this._memoryAreaNames.SCROLL_TABLES:
                    text += "Background scroll tables\n";
                    text += "- horizontal displacement: " + (value & 1) + "\n";
                    text += "- vertical displacement: " + ((value >> 1) & 1);
                    break;
                case this._memoryAreaNames.SPRITES:
                    {                     
                        var spriteNum = Math.floor((address - this._memoryArea[this._memoryAreaNames.SPRITES]) / 5);
                        var spriteByte = (address - this._memoryArea[this._memoryAreaNames.SPRITES]) % 5;
                        text += "Sprite " + spriteNum + "\n";
                        switch (spriteByte) {
                            case 0:
                                text += "Misc Byte:\n";
                                text += ((value & 1) ? "V" : "X") + " Bit 0: " + ((value & 1) ? "Active" : "Not active") + "\n";
                                text += "- Bit 1,2: Character Page: " + ((value >> 1) & 3) + "\n";
                                text += ((value & 8) ? "V" : "X") + " Bit 3: " + ((value & 8) ? "Flipped" : "Not flipped") + " horizontally\n";
                                text += ((value & 16) ? "V" : "X") + " Bit 4: " + ((value & 16) ? "Flipped" : "Not flipped") + " vertically\n";
                                text += ((value & 32) ? "V" : "X") + " Bit 5: " + ((value & 32) ? "Above" : "Below") + " Overlay\n";
                                text += ((value & 64) ? "V" : "X") + " Bit 6: Width " + ((value & 64) ? "16" : "8") + " pixels\n";
                                text += ((value & 128) ? "V" : "X") + " Bit 7: Height " + ((value & 128) ? "16" : "8") + " pixels\n";
                                break;
                            case 1:
                                text += "Character byte";
                                break;
                            case 2:
                                text += "Colorkey byte";
                                break;
                            case 3:
                                text += "Horizontal position byte";                            
                                break;
                            case 4:
                                text += "Vertical position byte";
                                break;
                        }
                    }
                    break;
                case this._memoryAreaNames.NAMETABLE_0:
                    {
                        text += "Name Table 1\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.NAMETABLE_0]);
                        text += "- position: " + position + "\n";
                        text += "- x: " + Math.floor(position % 28) + "\n";
                        text += "- y: " + Math.floor(position / 28) + "\n";
                    }
                    break;
                case this._memoryAreaNames.NAMETABLE_1:
                    {
                        text += "Name Table 2\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.NAMETABLE_1]);
                        text += "- position: " + position + "\n";
                        text += "- x: " + Math.floor(position % 28) + "\n";
                        text += "- y: " + Math.floor(position / 28) + "\n";
                    }
                    break;
                case this._memoryAreaNames.NAMETABLE_2:
                    {
                        text += "Name Table 3\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.NAMETABLE_2]);
                        text += "- position: " + position + "\n";
                        text += "- x: " + Math.floor(position % 28) + "\n";
                        text += "- y: " + Math.floor(position / 28) + "\n";
                    }
                    break;
                case this._memoryAreaNames.NAMETABLE_3:
                    {
                        text += "Name Table 4\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.NAMETABLE_3]);
                        text += "- position: " + position + "\n";
                        text += "- x: " + Math.floor(position % 28) + "\n";
                        text += "- y: " + Math.floor(position / 28) + "\n";
                    }
                    break;
                case this._memoryAreaNames.ATTRTABLE_0:
                    {
                        text += "Attributes for Name Table 1\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.ATTRTABLE_0]) * 4;
                        var x = Math.floor(position % 28), y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + (value & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 2) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 4) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 6) & 3) + "\n";
                    }
                    break;
                case this._memoryAreaNames.ATTRTABLE_1:
                    {
                        text += "Attributes for Name Table 2\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.ATTRTABLE_1]) * 4;
                        var x = Math.floor(position % 28), y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + (value & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 2) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 4) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 6) & 3) + "\n";
                    }
                    break;
                case this._memoryAreaNames.ATTRTABLE_2:
                    {
                        text += "Attributes for Name Table 3\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.ATTRTABLE_2]) * 4;
                        var x = Math.floor(position % 28), y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + (value & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 2) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 4) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 6) & 3) + "\n";
                    }
                    break;
                case this._memoryAreaNames.ATTRTABLE_3:
                    {
                        text += "Attributes for Name Table 4\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.ATTRTABLE_3]) * 4;
                        var x = Math.floor(position % 28), y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + (value & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 2) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 4) & 3) + "\n";
                        x = Math.floor(position % 28); y = Math.floor(position / 28);
                        text += "- " + (position++) + " (x:"+x+";y:"+y+"): " + ((value >> 6) & 3) + "\n";
                    }
                    break;
                case this._memoryAreaNames.ATTR_PAGE:
                    text += "CHRRAM Page for Attribute " + (address - this._memoryArea[this._memoryAreaNames.ATTR_PAGE]) + ": " + (value & 0x3);
                    break;
                case this._memoryAreaNames.ATTR_INC:
                    text += "Character increment for Attribute " + (address - this._memoryArea[this._memoryAreaNames.ATTR_INC]) + ": " + value;
                    break;
                case this._memoryAreaNames.OVERLAY_MISC:
                    text += "Overlay Misc:\n";
                    text += ((value & 1) ? "V" : "X") + " Bit 0: " + ((value & 1) ? "Active" : "Inactive") + "\n";
                    text += ((value & 4) ? "V" : "X") + " Bit 2: " + ((value & 1) ? "Sprite Mode" : "Tile Mode") + "\n";
                    break;
                case this._memoryAreaNames.OVERLAY_POSITION:
                    text += "Overlay Position\n";
                    break;
                case this._memoryAreaNames.OVERLAY_COLOR_KEY:
                    text += "Overlay Colorkey\n";
                    break;
                case this._memoryAreaNames.OVERLAY_NAMETABLE:
                    {
                        text += "Overlay Nametable\n";
                        var position = (address - this._memoryArea[this._memoryAreaNames.OVERLAY_NAMETABLE]);
                        text += "- position: " + position + "\n";
                        text += "- x: " + Math.floor(position % 28) + "\n";
                        text += "- y: " + Math.floor(position / 28) + "\n";
                    }
                    break;
                case this._memoryAreaNames.CUSTOM_SCROLL_ACTIVE:
                    text += "Custom scrolling: " + ((value & 1) ? "Active" : "Inactive");
                    break;
                case this._memoryAreaNames.CUSTOM_SCROLL_X:
                    {
                        var position = (address - this._memoryArea[this._memoryAreaNames.CUSTOM_SCROLL_X]);
                        text += "Custom horizontal scrolling #" + Math.floor(position / 3) + "\n";
                        switch(position % 3) {
                            case 0:
                                text += "line: " + value;
                                break;
                            case 1:
                                text += "displacement: " + value;
                                break;
                            case 2:
                                text += "table displacement: " + (value & 1);
                                break;
                        }
                    }
                    break;
                case this._memoryAreaNames.CUSTOM_SCROLL_Y:
                    {
                        var position = (address - this._memoryArea[this._memoryAreaNames.CUSTOM_SCROLL_Y]);
                        text += "Custom vertical scrolling #" + Math.floor(position / 3) + "\n";
                        switch(position % 3) {
                            case 0:
                                text += "line: " + value;
                                break;
                            case 1:
                                text += "displacement: " + value;
                                break;
                            case 2:
                                text += "table displacement: " + (value & 1);
                                break;
                        }
                    }
                    break;
                default:
                    text += "Unused";
            };

            return text;
        }

        this._descriptionDiv = document.createElement("div");
        this._descriptionDiv.setAttribute("style", "display:none");
        this._descriptionDiv.setAttribute("class", "description-div");
        this._targetElement.appendChild(this._descriptionDiv);

        this._coverDiv = document.createElement("div");
        this._coverDiv.setAttribute("style", "display:none");
        this._coverDiv.setAttribute("class", "cover-div");
        this._targetElement.appendChild(this._coverDiv);

        this._containerDiv = document.createElement("div");
        this._containerDiv.setAttribute("class", "ppu-ram-container-div");

        this._setValueDiv = document.createElement("div");
        this._setValueDiv.setAttribute("class", "set-value-div");
        this._setValueDiv.setAttribute("style", "display:none");
        this._setValueDiv.innerHTML = '<div class="set-value-text-div"></div><div class="set-value-control-container"><input data-address="-1" id="setValueValue" type="text" /><button id="setValueOk">Ok</button><button id="setValueCancel">Cancel</button></div>';
        this._setValueDivText = this._setValueDiv.querySelector(".set-value-text-div");
        this._setValueDivValue = this._setValueDiv.querySelector("#setValueValue");
        this._setValueDivValue.oninput = (function(ppuRam) {
            return function() {
                var address = parseInt(ppuRam._setValueDivValue.getAttribute("data-address"));
                if (!isNaN(address)) {
                    ppuRam._setValueDivText.innerText = ppuRam._getMemoryAreaText(address, parseInt(ppuRam._setValueDivValue.value));
                    if (ppuRam._options.onChangeValue) {
                        ppuRam._options.onChangeValue(parseInt(ppuRam._setValueDivValue.getAttribute("data-address")), parseInt(ppuRam._setValueDivValue.value));
                    }
                }
            }
        })(this);
        this._setValueDivOk = this._setValueDiv.querySelector("#setValueOk");
        var onSetValueOkFunction = function(ppuRam) {
            return function() {
                if (isNaN(parseInt(ppuRam._setValueDivValue.value))) {
                    alert("Invalid value");
                    return;
                }
                var byteElem = document.getElementById("ppuRamByte"+ppuRam._setValueDivValue.getAttribute("data-address"));
                byteElem.setAttribute("data-value", ppuRam._setValueDivValue.value);
                byteElem.innerText = ppuRam._setValueDivValue.value;
                if (ppuRam._options.onChangeValue) {
                    ppuRam._options.onChangeValue(parseInt(ppuRam._setValueDivValue.getAttribute("data-address")), parseInt(ppuRam._setValueDivValue.value));
                }
                ppuRam._coverDiv.style = "display:none";
                ppuRam._setValueDiv.style = "display:none";
            }
        };
        this._setValueDivOk.onclick = onSetValueOkFunction(this);
        this._setValueDivValue.onkeyup = (function(ppuRam) {
            return function(ev) {
                if (ev.key === "Enter") {
                    (onSetValueOkFunction(ppuRam))();
                }
            };
        })(this);
        this._setValueDivCancel = this._setValueDiv.querySelector("#setValueCancel");
        this._setValueDivCancel.onclick = (function(ppuRam) {
            return function() {
                if (ppuRam._options.onChangeValue) {
                    ppuRam._options.onChangeValue(parseInt(ppuRam._setValueDivValue.getAttribute("data-address")), parseInt(ppuRam._setValueDivValue.getAttribute("data-last-value")));
                }
                ppuRam._coverDiv.style = "display:none";
                ppuRam._setValueDiv.style = "display:none";
            }
        })(this);
        this._targetElement.appendChild(this._setValueDiv);

        var ppuRamTable = document.createElement("table");
        var currentAddress = 0;
        for(var j = 0; j < 4096 / 16; j++) {
            var row = document.createElement("tr");
            var positionData = document.createElement("td");
            positionData.setAttribute("class", "ppu-ram-address");
            positionData.innerText = "0x" + ("0000" + (j * 16).toString(16)).substr(-4).toUpperCase();
            row.appendChild(positionData);

            for(var i = 0; i < 16; i++) {
                var data = document.createElement("td");
                data.setAttribute("id", "ppuRamByte" + currentAddress);
                data.setAttribute("class", "ppu-ram-byte");
                data.setAttribute("style", "background-color:" + this._getMemoryAreaColor(currentAddress)+";");
                data.setAttribute("data-value", 0);
                data.addEventListener("mouseenter", (function(ppuRam, byte){
                    return function(ev) {                        
                        ppuRam._descriptionDiv.innerText = ppuRam._getMemoryAreaText(byte, parseInt(ev.target.getAttribute("data-value")));
                        ppuRam._descriptionDiv.setAttribute("style", "display:block;top:5px;right:5px");
                        ppuRam._showingDescription = byte;
                    }
                })(this, currentAddress), false);
                data.addEventListener("click", (function(ppuRam, byte){
                    return function(ev) {
                        ppuRam._coverDiv.style = "display:block";
                        ppuRam._setValueDiv.style = "display:block";
                        ppuRam._setValueDivValue.setAttribute("data-address", byte);
                        ppuRam._setValueDivValue.value = ev.target.getAttribute("data-value");
                        ppuRam._setValueDivValue.setAttribute("data-last-value", ev.target.getAttribute("data-value"));
                        ppuRam._setValueDivText.innerText = ppuRam._getMemoryAreaText(byte, parseInt(ev.target.getAttribute("data-value")));
                        ppuRam._setValueDivValue.focus();
                        ppuRam._setValueDivValue.select();
                    }
                })(this, currentAddress), false);
                data.innerText = 0;
                row.appendChild(data);
                currentAddress++;
            }

            
            ppuRamTable.appendChild(row);
        }

        ppuRamTable.addEventListener("mouseleave", (function(ppuRam, byte){
            return function() {
                ppuRam._descriptionDiv.setAttribute("style", "display:none;");
                ppuRam._showingDescription = null;
            }
        })(this, currentAddress), false);

        this._containerDiv.appendChild(ppuRamTable);
        this._targetElement.appendChild(this._containerDiv);
    }

    Factory.prototype = {
        constructor: Factory,
        
        setOnChangeValue: function(onChangeValue) {
            this._options.onChangeValue = onChangeValue;
        },

        setValue: function(address, value) {
            var byteElem = document.getElementById("ppuRamByte"+address);
            byteElem.setAttribute("data-value", value);
            byteElem.innerText = value;
            if (this._showingDescription === address) {
                this._descriptionDiv.innerText = ppuRam._getMemoryAreaText(address, value);
            }
        }
    };

    return Factory;
});