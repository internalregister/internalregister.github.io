(function (name, factory) {
    if( typeof window === "object" ) {
        window[name] = factory();
     }
})("ScriptExamples", function() {
    var Factory = function(targetElement, onInitEdit, onFrameEdit) {
		this._targetElement = targetElement;
		this._onInitEdit = onInitEdit;
		this._onFrameEdit = onFrameEdit;
		
		this._scriptExamples = [
			{
				name: "Scrolling Example",
				onInit: "ppu.resetPPURAM();\n\
for (var i = 0; i < 28*24; i++) {\n\
	ppu.setPPURAM(ppu.NAMETABLE_0_ADDR + i, 255);\n\
	ppu.setPPURAM(ppu.NAMETABLE_1_ADDR + i, 250);\n\
	ppu.setPPURAM(ppu.NAMETABLE_2_ADDR + i, 253);\n\
	ppu.setPPURAM(ppu.NAMETABLE_3_ADDR + i, 254);\n\
}\n\
\n\
var writeString = function(addr, str) {\n\
    for(var i = 0; i < str.length; i++) {\n\
        ppu.setPPURAM(addr++, str.charCodeAt(i));\n\
    }\n\
};\n\
\n\
writeString(ppu.NAMETABLE_0_ADDR + 28*12+8, \"Nametable 0\");\n\
writeString(ppu.NAMETABLE_1_ADDR + 28*12+8, \"Nametable 1\");\n\
writeString(ppu.NAMETABLE_2_ADDR + 28*12+8, \"Nametable 2\");\n\
writeString(ppu.NAMETABLE_3_ADDR + 28*12+8, \"Nametable 3\");",
				onFrame: "var pages = ppu.getPPURAM(3);\n\
ppu.setPPURAM(1, (ppu.getPPURAM(1) + 1) % 224);\n\
ppu.setPPURAM(2, (ppu.getPPURAM(2) + 1) % 192);\n\
if (ppu.getPPURAM(1) === 0) {\n\
	pages ^= 1;\n\
}\n\
if (ppu.getPPURAM(2) === 0) {\n\
	pages ^= 2;\n\
}\n\
ppu.setPPURAM(3, pages);"
			},
			{
				name: "Sprites Example",
				onInit: "ppu.resetPPURAM();\n\
\n\
for (var i = 0; i < 28*24; i++) {\n\
	ppu.setPPURAM(ppu.NAMETABLE_0_ADDR + i, 255);\n\
}\n\
\n\
window.programState = {\n\
	frame: 0,\n\
	spriteInfo: []\n\
};\n\
\n\
for(var i = 0; i < 20; i++) {\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 0, 0xC1);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 1, 56);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 2, 103);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 3, Math.floor(Math.random()*208) + 32);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 4, Math.floor(Math.random()*176) + 32);\n\
\n\
	window.programState.spriteInfo.push({\n\
		dirX: Math.floor(Math.random()*2)*2-1,\n\
		dirY: Math.floor(Math.random()*2)*2-1,\n\
	});\n\
}",
				onFrame: "for(var i = 0; i < 20; i++) {\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 0, 0xC1);\n\
\n\
	var character = ppu.getPPURAM(ppu.SPRITES_ADDR + (i*5) + 1);\n\
	if (window.programState.frame % 2 === 0) {\n\
		character += 4;\n\
		if (character > 68) {\n\
			character = 56;\n\
		}\n\
	}\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 1, character);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 2, 103);\n\
\n\
	var x = ppu.getPPURAM(ppu.SPRITES_ADDR + (i*5) + 3);\n\
	var y = ppu.getPPURAM(ppu.SPRITES_ADDR + (i*5) + 4);\n\
\n\
	x += window.programState.spriteInfo[i].dirX;\n\
	y += window.programState.spriteInfo[i].dirY;\n\
\n\
	if (x <= 32 || x >= 240) {\n\
		window.programState.spriteInfo[i].dirX *= -1;\n\
	}\n\
	if (y <= 32 || y >= 208) {\n\
		window.programState.spriteInfo[i].dirY *= -1;\n\
	}\n\
\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 3, x);\n\
	ppu.setPPURAM(ppu.SPRITES_ADDR + (i*5) + 4, y);\n\
}\n\
\n\
window.programState.frame++;"
			},
			{
				name: "Custom Scrolling Example",
				onInit: "ppu.resetPPURAM();\n\
for (var i = 0; i < 28*24; i++) {\n\
	ppu.setPPURAM(ppu.NAMETABLE_0_ADDR + i, 255);\n\
	ppu.setPPURAM(ppu.NAMETABLE_1_ADDR + i, 250);\n\
	ppu.setPPURAM(ppu.NAMETABLE_2_ADDR + i, 253);\n\
	ppu.setPPURAM(ppu.NAMETABLE_3_ADDR + i, 254);\n\
}\n\
\n\
// Activate Custom scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_ACTIVE_ADDR, 1);\n\
\n\
// Set line 25 for horizontal scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR + 3*0 + 0, 25);\n\
// Set line 75 for horizontal scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR + 3*1 + 0, 75);\n\
// Set line 150 for horizontal scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR + 3*2 + 0, 150);\n\
\n\
// Set line 25 for vertical scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR + 3*0 + 0, 25);\n\
// Set line 150 for vertical scrolling\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR + 3*1 + 0, 150);",
				onFrame: "// Update scroll from line 0 (normal scroll)\n\
var pages = ppu.getPPURAM(3);\n\
ppu.setPPURAM(1, (ppu.getPPURAM(1) + 1) % 224);\n\
ppu.setPPURAM(2, (ppu.getPPURAM(2) + 1) % 192);\n\
if (ppu.getPPURAM(1) === 0) {\n\
	pages ^= 1;\n\
}\n\
if (ppu.getPPURAM(2) === 0) {\n\
	pages ^= 2;\n\
}\n\
ppu.setPPURAM(3, pages);\n\
\n\
// Increment horizontal scroll from line 25\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*0+1,\n\
	(ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*0+1) + 2) % 224);\n\
if (ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*0+1) === 0) {\n\
	ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*0+2,\n\
		ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*0+2)^1);\n\
}\n\
\n\
// Increment horizontal scroll from line 75\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*1+1,\n\
	(ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*1+1) + 4) % 224);\n\
if (ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*1+1) === 0) {\n\
	ppu.setPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*1+2,\n\
		ppu.getPPURAM(ppu.CUSTOM_SCROLL_X_ADDR+3*1+2)^1);\n\
}\n\
\n\
// Increment vertical scroll from line 150\n\
ppu.setPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR+3*1+1,\n\
	(ppu.getPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR+3*1+1) + 1) % 192);\n\
if (ppu.getPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR+3*1+1) === 0) {\n\
	ppu.setPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR+3*1+2,\n\
		ppu.getPPURAM(ppu.CUSTOM_SCROLL_Y_ADDR+3*1+2)^1);\n\
}"
			},
			{
				name: "Overlay Example",
				onInit: "ppu.resetPPURAM();\n\
for (var i = 0; i < 28*24; i++) {\n\
	ppu.setPPURAM(ppu.NAMETABLE_0_ADDR + i, 254);\n\
}\n\
\n\
// Activate Overlay\n\
ppu.setPPURAM(ppu.OVERLAY_MISC_ADDR, 1);\n\
\n\
// Initialize the overlay nametable\n\
for (var i = 0; i < 28*6; i++) {\n\
	ppu.setPPURAM(ppu.OVERLAY_NAMETABLE_ADDR + i, 248);\n\
}\n\
\n\
var writeString = function(addr, str) {\n\
	for(var i = 0; i < str.length; i++) {\n\
		ppu.setPPURAM(addr++, str.charCodeAt(i));\n\
	}\n\
};\n\
\n\
writeString(ppu.OVERLAY_NAMETABLE_ADDR + 2 * 28 + 11,\n\
	\"Overlay\");\n\
\n\
window.programState = {\n\
	dir: 1\n\
};",
				onFrame: "var y = ppu.getPPURAM(ppu.OVERLAY_POSITION_ADDR);\n\
y += window.programState.dir;\n\
if (y === 0 || y === 144) {\n\
	window.programState.dir *= -1;\n\
}\n\
ppu.setPPURAM(ppu.OVERLAY_POSITION_ADDR, y);"
			},
			{
				name: "Empty",
				onInit: "ppu.resetPPURAM();",
				onFrame: ""
			},
		];
		
		for (var i = 0; i < this._scriptExamples.length; i++) {
			var optionElement = document.createElement("option");
			optionElement.innerText = this._scriptExamples[i].name;
			optionElement.value = i;
			this._targetElement.appendChild(optionElement);
		}

		this._targetElement.onchange = (function(instance) { return function(ev) {
			instance._onInitEdit.setValue(instance._scriptExamples[parseInt(ev.target.value)].onInit);
			instance._onInitEdit.clearSelection();
			instance._onFrameEdit.setValue(instance._scriptExamples[parseInt(ev.target.value)].onFrame);
			instance._onFrameEdit.clearSelection();
		};})(this);

		this._onInitEdit.setValue(this._scriptExamples[0].onInit);
		this._onInitEdit.clearSelection();
		this._onFrameEdit.setValue(this._scriptExamples[0].onFrame);
		this._onFrameEdit.clearSelection();
	}

	return Factory;
});
 