// const HIT_TOL = 10;

const EDGE_COLOR = "#000000";
const EDGE_SELECT_COLOR = "#A0A000";

function Edge(nd1, nd2, edgeNum, allNodes=null, arrowDir=ARROW_TYPE_NONE) {
    this.pt1 = { x : 0, y : 0 };
    this.pt2 = { x : 0, y : 0 };
    this.isSel = false;
    this.arrowDir = arrowDir;
    this.edgeNum = edgeNum;
    this.nodes = [nd1, nd2];
    this.weight = [0, 0];
    this.color = EDGE_COLOR;
    if(allNodes != null)
        this.updatePoints(allNodes);
}

Edge.prototype.draw = function (ctx, showWeights=false) {

    // console.log('Edge.draw edgeNum= ', this.edgeNum, ' nodes= ', this.nodes, ' arrowDir=', this.arrowDir);
    ctx.beginPath();

    
    
    var x1 = this.pt1.x;
    var y1 = this.pt1.y
    var x2 = this.pt2.x;
    var y2 = this.pt2.y;

    if(this.isSel) {
        clr = EDGE_SELECT_COLOR;
        ctx.fillStyle = clr;
        ctx.strokeStyle = clr;
    
        ctx.lineWidth = 4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    ctx.lineWidth = 1;
    clr = EDGE_COLOR;
    ctx.fillStyle = clr;
    ctx.strokeStyle = clr;

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();


    var ang = Math.atan((y2-y1)/(x2-x1));

    // correct for angles in negative X half
    if (x2 < x1) {  
        ang = ang + Math.PI;
    }

    if(this.arrowDir == ARROW_TYPE_TWO) {

    }
    else { 
        var angP45 = ang + Math.PI/4;
        var angN45 = ang - Math.PI/4;
        dxP = ARROW_LEN*Math.cos(angP45);
        dyP = ARROW_LEN*Math.sin(angP45);
        dxN = ARROW_LEN*Math.cos(angN45);
        dyN = ARROW_LEN*Math.sin(angN45);
        Math.cos(angN45);
        if(this.arrowDir == ARROW_TYPE_DST || this.arrowDir == ARROW_TYPE_BIDIR) {
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - dxP, y2 - dyP);
            ctx.lineTo(x2 - dxN, y2- dyN);
            ctx.fill();
        }

        // draw arrow at source
        if(this.arrowDir == ARROW_TYPE_BIDIR) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + dxP, y1 + dyP);
            ctx.lineTo(x1 + dxN, y1 + dyN);
            ctx.fill();
        }
    }

    // 
    if (showWeights) {
        ctx.font = "12px Arial";
        // console.log('label= ', this.label);
        ctx.textAlign = "center";
        var wgt = this.weight[0];
        var texMetrics = ctx.measureText(wgt);
        var fontHeight = Math.abs(texMetrics.actualBoundingBoxAscent - texMetrics.actualBoundingBoxDescent);
        
        var dx, dy;

        var ang = Math.atan((y2-y1)/(x2-x1));
        if (x2 < x1) {
        ang = ang + Math.PI;
        }
    
        ang = ang + Math.PI/2;  // rotate 90 degrees
        var d = 10;
        var dx = d * Math.cos(ang);
        var dy = d * Math.sin(ang);

        var x = x1 + (x2 - x1) / 2  + dx;
        var y = y1 + (y2 - y1) / 2  + dy;
        ctx.fillText(wgt, x, y);
    }
}

function pDistance(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
  
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

Edge.prototype.hitTest = function (pt) {
    var x1 = this.pt1.x;
    var y1 = this.pt1.y
    var x2 = this.pt2.x;
    var y2 = this.pt2.y;
    var x0 = pt.x;
    var y0 = pt.y;

    /*
    var a = (y2 - y1)*x0 - (x2 - x1)*y0 + x2*y1 - y2*x1;
    var b = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    var d = Math.abs(a / b);
    console.log('edge hitTest d= ', d);
*/

    d = pDistance(pt.x, pt.y, x1, y1, x2, y2);
    if (d < HIT_TOL) {
        return true;
    }

    return false;
}

// update the points for this edge
Edge.prototype.updatePoints = function(allNodes) {
    console.log('Edge.updatePoints() nodes= ', this.nodes);
    if(this.nodes[0] < 0 || this.nodes[1] < 0)
        return;

    var nd1 = allNodes[this.nodes[0]];
    var nd2 = allNodes[this.nodes[1]];
    console.log('Edge.updatePoints() nd1= ', nd1, ' nd2= ', nd2);

    if(nd1 == null || nd2 == null)
        return;

    var x1 = nd1.ctr.x;
    var y1 = nd1.ctr.y;
    var x2 = nd2.ctr.x;
    var y2 = nd2.ctr.y;
    var ang = Math.atan((y2-y1)/(x2-x1));

    // correct for angles in negative X half
    if (x2 < x1) {  
        ang = ang + Math.PI;
    }
    var cs = Math.cos(ang);
    var sn = Math.sin(ang);
    x1 += nd1.rad * cs;
    y1 += nd1.rad * sn;
    x2 -= nd2.rad * cs;
    y2 -= nd2.rad * sn;
    this.pt1.x = x1;
    this.pt1.y = y1;
    this.pt2.x = x2;
    this.pt2.y = y2;
    console.log('Edge.updatePoints() pt1= ', this.pt1, ' pt2= ', this.pt2);
}

Edge.prototype.toggleSel = function() { 
    this.isSel = !this.isSel;
}

Edge.prototype.objType = function() {
    return EDGE;
}

Edge.prototype.transpose = function() {
    tmp = this.pt1;
    this.pt1 = this.pt2;
    this.pt2 = tmp;
    tmp = this.nodes[0];
    this.nodes[0] = this.nodes[1];
    this.nodes[1] = tmp;
    tmp = this.weight[0];
    this.weight[0] = this.weight[1];
    this.weight[1] = tmp;
}

Edge.prototype.isBiDir = function() {
    if(this.arrowDir == ARROW_TYPE_NONE || this.arrowDir == ARROW_TYPE_BIDIR || this.arrowDir == ARROW_TYPE_TWO) {
        return true;
    }
    return false;
}