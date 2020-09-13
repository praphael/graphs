const NODE_FILL_COLOR = "#FFECA6";
const NODE_SELECT_FILL_COLOR = "#A69556";
const NODE_OUTLINE_COLOR = "#000000";
const NODE_SELECT_OUTLINE_COLOR = "#000000";

const HIT_TOL = 10;

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('');

const numToHex = (num) => {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   {number}  h       The hue
* @param   {number}  s       The saturation
* @param   {number}  l       The lightness
* @return  {Array}           The RGB representation
*/
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function Node(ctr, radius, nodeNum) {
    // console.log('Circle center= ', center);
    this.ctr = ctr;
    this.rad = radius;
    this.nodeNum = nodeNum;
    this.isSel = false;
    this.label = null;
    this.weight = 0;
    this.color = "#F0F0FFFF";
    this.opacity = 255;
    this.origcolor = "#F0F0FFFF";
    this.inDeg = 0;
    this.outDeg = 0;
}

Node.prototype.objType = function() {
    return NODE;
}

Node.prototype.draw = function(ctx) {
    if(this.isSel) {
        var clr = hexToRgb(this.color);
        console.log('clr (pre)= ', clr);
        hsl = rgbToHsl(clr[0], clr[1], clr[2]);
        console.log('hsl= ', hsl);
        if(hsl[2] < 0.5) hsl[2] = 0.8;
        else hsl[2] = 0.2; 
        rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        console.log('rgb= ', rgb);
        clr = rgbToHex(rgb[0], rgb[1], rgb[2]);
        console.log('clr (post)= ', clr);

        ctx.fillStyle = clr;

        ctx.strokeStyle = NODE_SELECT_OUTLINE_COLOR;
    }
    else {
        ctx.fillStyle = this.color;//  + numToHex(this.opacity);
        ctx.globalAlpha = this.opacity/100.0;
        ctx.strokeStyle = NODE_OUTLINE_COLOR;
    }

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.ctr.x, this.ctr.y, this.rad, 0,2*Math.PI);

    ctx.fill();
    
    ctx.stroke();
    
    ctx.globalAlpha = 1.0;

    if(this.label != null) {
        // invert colors for text when selected
        ctx.fillStyle = NODE_OUTLINE_COLOR;
        if(this.isSel)
            ctx.fillStyle = NODE_SELECT_OUTLINE_COLOR;
        ctx.font = "12px Arial";
        // console.log('label= ', this.label);
        ctx.textAlign = "center";
        texMetrics = ctx.measureText(this.label);
        var fontHeight = Math.abs(texMetrics.actualBoundingBoxAscent - texMetrics.actualBoundingBoxDescent);
        ctx.fillText(this.label, this.ctr.x, this.ctr.y + fontHeight / 2);
    }
}


Node.prototype.hitTest = function(pt) {
    var relX = pt.x - this.ctr.x;
    var relY = pt.y - this.ctr.y;

    // if (dist < (this.rad*this.rad + HIT_TOL)) {
    r = this.rad + HIT_TOL;
    if((Math.abs(relX) < r) && (Math.abs(relY) < r)) {
        return true;
    }

    return false;
}

Node.prototype.toggleSel = function() { 
    this.isSel = ! this.isSel;
}