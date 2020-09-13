const NODE = 0;
const EDGE = 1;
const ARROW_TYPE_NONE = 0;
const ARROW_TYPE_DST = 1;
const ARROW_TYPE_BIDIR = 2;
const ARROW_TYPE_TWO = 3;
const ARROW_LEN = 10;
const LINE_NODE_SPACING = 2;

// strategies for random grid
const STRATEGY_GRID = 0;
const STRATEGY_RING = 1;
const STRATEGY_TREE = 2;

const MODE_PLACE = 0;
const MODE_MOVE = 1;
const MODE_LABEL = 2;

const LABEL_MODE_NONE = 0;
const LABEL_MODE_QUICK = 1;
const LABEL_MODE_CUSTOM = 2;

const QUICK_LABEL_NUMBER = 0;
const QUICK_LABEL_CHAR = 1;


function calcDist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
} 

function ptDist(pt1, pt2) {
    return Math.abs(Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2)));
}

function Queue() { 
    this.q = [];
}

Queue.prototype.push = function(x) {
    this.q.push(x);
}

Queue.prototype.pop = function() {
    if(this.q.length > 0) {
        x = this.q[0];
        for(var i=0; i<this.q.length-1; i++)
            this.q[i] = this.q[i+1];
        this.q.pop(); // remove last element
        return x;
    }
    else return null;
}

Queue.prototype.remove = function(idx) {
    if(idx < this.q.length) {
        for(var i=idx; i<this.q.length-1; i++)
            this.q[i] = this.q[i+1];
        this.q.pop(); // remove last element
        return x;
    }
    else return null;
}

Queue.prototype.removeRandom = function() {
    var idx = Math.floor(Math.random() * this.q.length);
    return this.remove(idx);
}

Queue.prototype.empty = function() {
    return (this.q.length == 0);
}


function Graph() {
    this.showWeights = true; 
    this.allNodes = [];
    this.allEdges = [];
    this.nextNodeNum = 0;
    this.nextEdgeNum = 0;

    this.objSel = null;
    this.labelObj = null;
    this.adjMat = [];
    this.imageURL = "";
    this.enableImgOverlay = true;
    this.imgOverlayShrinkToFit = true;
    this.imgOverlayMaintainAspect = true;
    this.overlayImg = null;
}

Graph.prototype.redraw = function(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(this.enableImgOverlay && this.overlayImg !== null) {
        var dx = 0;
        var dy = 0;
        var img_w = this.overlayImg.width;
        var img_h = this.overlayImg.height;
        var cw = canvas.width;
        var ch = canvas.height;
        if(this.imgOverlayShrinkToFit) {
            // console.log("img_w= " + img_w + " + img_h= " + img_h + " cw= " + cw + " ch= " + ch);
            w = cw;
            h = ch;
            if(this.imgOverlayMaintainAspect) {
                if(cw/img_w > ch/img_h) { 
                    dx = Math.abs(cw - img_w)/2;
                    w = img_w*ch/img_h;
                    h = ch;
                }
                else {
                    dy = Math.abs(ch - img_h)/2;
                    h = img_h*cw/img_w;
                    w = cw;
                }
                //  console.log("dx= " + dx + " dy= " + dy + " w= " + w + " + h= " + h);
            }
        }
        ctx.drawImage(this.overlayImg, dx, dy, w, h);
    }

    this.allNodes.forEach(node => { 
        /* console.log(obj); */ 
        if(node != null) {
            node.draw(ctx); 
        }
    });

    this.allEdges.forEach(edge => { 
        /* console.log(obj); */ 
        if(edge != null) {
            edge.draw(ctx); 
        }
    });
}

Graph.prototype.setImageURL = function(url) {
    this.imageURL = url;    
    this.overlayImg = new Image();
    this.overlayImg.src = url;
}

Graph.prototype.HitTestAllObjs = function(mousePos)  {
    var objHit = null;
    var i;

    for(i = 0; i<this.allNodes.length; i++) {
        var node = this.allNodes[i];
        if(node != null) {
            var isHit = node.hitTest(mousePos);
            // console.log('mousePos= ', mousePos, ' obj= ', obj, ' isHit= ', isHit);
            if(isHit) {
                objHit = node; 
                break;
            }
        }
    }

    if(objHit != null)
        return objHit;

    for(i = 0; i<this.allEdges.length; i++) {
    var edge = this.allEdges[i];
        if(edge != null) {
        var isHit = edge.hitTest(mousePos);
        // console.log('mousePos= ', mousePos, ' obj= ', obj, ' isHit= ', isHit);
        if(isHit) {
            objHit = edge; 
            break;
        }
        }
    }

    return objHit;
}


function areObjEqual(obj1, obj2) {
    if(obj1.objType() == obj2.objType()) {
        if(obj1.objType() == NODE) {
            return obj1.nodeNum == obj2.nodeNum;
        }
        else if(obj1.objType() == EDGE) {
        return obj1.edgeNum == obj2.edgeNum;
        }
    }

    return false;
}

Graph.prototype.clearNodes = function(canvas) {
    this.allNodes = []
    this.allEdges = []
    this.nextNodeNum = 0;
    this.nextEdgeNum = 0;
    this.objSel = null;
    this.adjMat = [];

    this.redraw(canvas);  
}

Graph.prototype.connectNodes = function(nd1, nd2, arrowDir) {
    if(nd1 == null || nd2 == null)
        return;

    // already connected
    if(this.adjMat[nd1.nodeNum][nd2.nodeNum] >= 0) {

    }
    // connected in other direction, do not need to create new edge
    else if (this.adjMat[nd2.nodeNum][nd1.nodeNum] >= 0)  {
        // make connection in other direction
        edgeID = this.adjMat[nd2.nodeNum][nd1.nodeNum];
        this.adjMat[nd2.nodeNum][nd1.nodeNum] = edgeID;
        this.allEdges[edgeID].arrowDir = ARROW_TYPE_BIDIR;
        nd1.outDeg++;
        nd2.inDeg++;
    }
    else { // create new edge
        edgeNum = this.nextEdgeNum;
        this.nextEdgeNum++;
        // TODO: in case of SRC arrow dir, connect in reverse order
        var edge = new Edge(nd1.nodeNum, nd2.nodeNum, edgeNum, this.allNodes, arrowDir);
        
        if(this.allEdges.length < edgeNum) {
            console.log('handleObjClicked, edges.length is smaller than expected!');
            return false;
        }
        else if(this.allEdges.length == edgeNum)
            this.allEdges.push(null);

        nd1.outDeg++;
        nd2.inDeg++;
        this.allEdges[edgeNum] = edge;
        this.adjMat[nd1.nodeNum][nd2.nodeNum] = edgeNum;
        if(arrowDir != ARROW_TYPE_DST) {
            // connect bidirectional 
            this.adjMat[nd2.nodeNum][nd1.nodeNum] = edgeNum;
        }
    }
}

Graph.prototype.handleObjClicked = function(obj, arrowDir) {
    if(this.objSel != null) {
        console.log("obj.ID=", obj.ID, ' objSel.ID=', this.objSel.ID, ' arrowDir= ', arrowDir);
        if(!areObjEqual(obj, this.objSel)) {
            this.objSel.toggleSel();

            // if they are both nodes, connect by an edge
            if(this.objSel.objType() == NODE && obj.objType() == NODE) {
                this.connectNodes(this.objSel, obj, arrowDir);
            }
        }
    }

    // console.log("obj.isSel (pre)=", obj.isSel)
    obj.toggleSel();
    // console.log("obj.isSel (post)=", obj.isSel)
    if(obj.isSel) {
        this.objSel = obj;
    }
    else {
        this.objSel = null;
    }

}

function makeNodeQuickLabel(quickLabel, node) {
    var nodeNum = node.nodeNum;
    if(quickLabel == QUICK_LABEL_NUMBER) {
            node.label = (nodeNum+1).toString();
        } else if(quickLabel == QUICK_LABEL_CHAR) {
            var chCode = 'A'.charCodeAt(0);
        if(nodeNum < 26) {
            node.label = String.fromCharCode(chCode + nodeNum);
        }
        else {
            node.label = String.fromCharCode(chCode + Math.floor(nodeNum/26)) + String.fromCharCode(chCode + (nodeNum%26));
        }
    }
}

Graph.prototype.handleAddNode = function(mousePos, labelMode, quickLabel, rad, color, opacity=100) {
    // otherwise add a node
    var nodeNum = this.nextNodeNum;
    this.nextNodeNum++;
    var node = new Node(mousePos, rad, nodeNum);
    node.color = color;
    node.opacity = opacity;
    node.origcolor = color;

    if(this.allNodes.length < nodeNum) {
        console.log('handleAddNode, nodes.length is smaller than expected!');
        return false;
    }
    else if(this.allNodes.length == nodeNum) {
        this.allNodes.push(null);
    }
    this.allNodes[nodeNum] = node;
    
    //console.log("adjMat (pre)= ", this.adjMat);
    // add new row
    this.adjMat.push([]);
    // populate new row
    for (var i=0; i<this.nextNodeNum; i++) {
        this.adjMat[nodeNum].push(-1);
    }
    // add one column to previous nodes
    for (var i=0; i<this.nextNodeNum; i++) {
        this.adjMat[i].push(-1);
    }
    // console.log("adjMat (post)= ", this.adjMat);

    // handle labelling
    if(labelMode == LABEL_MODE_QUICK) {
        makeNodeQuickLabel(quickLabel, node);
    } 

    return node;
}

Graph.prototype.handleNodeMove = function(mousePos) {
    console.log('handleNodeMove objSel= ', this.aobjSel);

    if(this.objSel != null) {
        if(this.objSel.objType() == NODE) {
            var nodeNum = this.objSel.nodeNum;
            // find all edges connected to this node
            this.objSel.ctr = mousePos;

            for(var i=0; i<this.adjMat.length; i++) {
                edgeList = this.adjMat[i];
                // console.log('handleNodeMove edgeList= ', edgeList);
                edgeList.forEach(edgeNum => { 
                    if(edgeNum >= 0) {
                        var edge = this.allEdges[edgeNum];
                        var nd1 = -1;
                        var nd2 = -1;
                        if(edge != null) {
                            nd1 = edge.nodes[0];
                            nd2 = edge.nodes[1];
                        }
                        // console.log('handleNodeMove nd1= ', nd1, ' nd2= ', nd2);

                        if(nd1 == nodeNum || nd2 == nodeNum) {
                            // console.log('updating edge ', edgeNum);
                            edge.updatePoints(this.allNodes);
                        }
                    }
                });
            };
        }
    }
}

Graph.prototype.handleDeleteNode = function(node) {
    for(var i=0; i<this.adjMat.length; i++) {
        var edgeList = this.adjMat[i];
        for(var j=0; j<edgeList.length; j++) {
            // remove each edge
            edgeNum = this.adjMat[i][j];
            console.log('handleDeleteNode i= ', i, ' j= ', j, ' edgeNum= ', edgeNum);

            if(edgeNum >= 0) {
                console.log('handleDeleteNode edgeNum= ', edgeNum);
                var edge = this.allEdges[edgeNum];
                if(edge != null) {
                    var nd1 = edge.nodes[0];
                    var nd2 = edge.nodes[1];
                    console.log('handleDeleteNode nd1= ', nd1, ' nd2= ', nd2);
                    if(nd1 == node.nodeNum || nd2 == node.nodeNum) {
                        console.log('deleting edge (', nd1, ', ', nd2, ')');
                        this.adjMat[nd1][nd2] = -1;
                        this.adjMat[nd2][nd1] = -1;
                        this.allEdges[edgeNum] = null;
                    }
                }
            }
        }
    }

    this.allNodes[node.nodeNum] = null;

}

Graph.prototype.handleDeleteEdge = function(edge) {
    nd1 = edge.nodes[0];
    nd2 = edge.nodes[1];
    this.adjMat[nd1][nd2] = -1;
    this.adjMat[nd2][nd1] = -1;
    this.allEdges[edge.edgeNum] = null;
}

Graph.prototype.updateEdgePoints = function() {
    this.allEdges.forEach(e => { if(e != null) e.updatePoints(this.allNodes); });
}


// return a list of nodes, sorted by increasing distance from this node
Graph.prototype.makeSortedNodeDistList = function(node) {
    l = [];
    this.allNodes.forEach( nd => { 
        if(nd.nodeNum != node.nodeNum) {
            l.push({ ndNum : nd.nodeNum, dist : ptDist(nd.ctr, node.ctr) });
        }
    });

    // now sort the nodes
    l.sort((a, b) => { return (a.dist > b.dist ? 1 : -1) });;

    return l;
}

// generate random modes based on a expanding ring
Graph.prototype.makeRandomNodesRing = function(numNodes, rad, quickLabelMode, canvasWidth, canvasHeight, nodeColor, nodeOpacity) {
    var ringRad = rad*4;
    var ctrX = canvasWidth / 2;
    var ctrY = canvasHeight / 2;
    var maxPtsPerRing = 6;
    var ptsPerRing = Math.ceil(maxPtsPerRing*0.6 + 0.4*maxPtsPerRing * Math.random());
    var ringPt = 0;
    var phi;

    for(var i=0; i < numNodes; i++) {
        var x1, y1;
        console.log('i= ', i, ' ringPt= ', ringPt, ' ringRad= ', ringRad);
        if(i == 0) {
            x1 = ctrX;
            y1 = ctrY;
        } else {
            if(ringPt == 0) {
                phi = 2 * Math.PI * Math.random();
            } else {
                var d = Math.min(numNodes - i + 1, ptsPerRing);
                phi += 2 * Math.PI / d;
            }
            var dx = (Math.random() * rad / 4) - (rad / 8);
            var dy = (Math.random() * rad / 4) - (rad / 8);
            x1 = ctrX + ringRad * Math.cos(phi) + dx;
            y1 = ctrY + ringRad * Math.sin(phi) + dy;
            ringPt++;
            if(ringPt >= ptsPerRing) {
                ringPt = 0;
                ringRad += rad*4;
                maxPtsPerRing = Math.floor(2 * Math.PI * ringRad / (6*rad))
                ptsPerRing = Math.ceil(maxPtsPerRing*0.6 + 0.4*maxPtsPerRing * Math.random());
                console.log('i= ', i, ' maxPtsPerRing= ', maxPtsPerRing, ' ptsPerRing= ', ptsPerRing);
            }
        }
        
        var ctr = { x : x1, y : y1 };
        var node = new Node(ctr, rad, i);
        node.color = nodeColor;
        node.opacity = nodeOpacity;
        makeNodeQuickLabel(quickLabelMode, node);
        this.allNodes.push(node)
    }
}

// generate random modes based on a grid strategy
Graph.prototype.makeRandomNodesGrid = function(numNodes, rad, quickLabelMode, canvasWidth, canvasHeight, nodeColor, nodeOpacity) {
    var gridDist = rad*4;
    var numGridX = Math.floor(canvasWidth / gridDist);
    var numGridY = Math.floor(canvasHeight / gridDist);
    var numGridPts = numGridX*numGridY;
    var gridPts = [];
    var i, j;

    console.log("numGridX= ", numGridX, "numGridY= ", numGridY, "numGridPts= ", numGridPts)
    for(i=0; i<numGridX; i++) {
        // console.log("i= ", i);
        for(j=0; j<numGridY; j++) {
            gridPts.push([i, j]);
        }
    }

    // randommize grid by randomly swapping ponits
    for(i=0; i<3; i++) {
        for(j=0; j<numGridPts; j++) {
            pt1 = gridPts[j];
            pt2_idx = Math.floor(numGridPts * Math.random());
            gridPts[j] = gridPts[pt2_idx];
            gridPts[pt2_idx] = pt1;
        }
    }

    for(i=0; i<numNodes; i++) {
        var pt = gridPts[i];
        var x1 = pt[0] * gridDist + (gridDist/2);
        x1 +=  Math.floor(Math.random()*gridDist/2) - gridDist/4;
        var y1 = pt[1] * gridDist + (gridDist/2);
        y1 +=  Math.floor(Math.random()*gridDist/2) - gridDist/4;
        var ctr = { x : x1, y : y1 };
        var node = new Node(ctr, rad, i);
        node.color = nodeColor;
        node.opacity = nodeOpacity;
        makeNodeQuickLabel(quickLabelMode, node);
        this.allNodes.push(node)
    }
}

Graph.prototype.makeRandomNodesTree = function(numNodes, rad, quickLabelMode, numChildrenMin, numChildrenMax, canvasWidth, canvasHeight, nodeColor, nodeOpacity) {
    var numChildrenRng =  numChildrenMax - numChildrenMin;
    var ctrRoot = { x : canvasWidth/2, y : 2*rad };
    var rootNode = new Node(ctrRoot, rad, 0);
    rootNode.color = nodeColor;
    rootNode.opacity = nodeOpacity;
    rootNode.lvl = 0;
    makeNodeQuickLabel(quickLabelMode, rootNode);
    this.allNodes.push(rootNode)

    var nodeQ = new Queue();
    nodeQ.push(rootNode);
    numNodes--;
    var nodesNxtLvl = [];
    var nodesCurLvl = [rootNode];
    var lvlCur = 0;
    this.nextNodeNum = 1;
    // var maxLvl = Math.ceil(Math.pow(Math.log(numNodes)/Math.log(numChildrenMax), 2));
    // console.log("maxLvl = ", maxLvl);
    var pickRandom = false;

    while(numNodes > 0) {      
        var node;
        /*  
        if(nodeQ.empty()) {  // pick random node from current level, with no chidlren
            idx = Math.floor(nodesCurLvl.length * Math.random());
            node = nodesCurLvl[idx];
            console.log("makeRandomNodesTree: nodeQ isEmpty node = ", maxLvl);
            while(node.numChildren != 0) {
                idx = Math.floor(nodesCurLvl.length  * Math.random());
                node = nodesCurLvl[idx];
            }
        }
        else {
            */
            if(nodeQ.empty()) break;
            node = nodeQ.pop();
            
        // }
        
        // set x position of previous nodes
        if(node.lvl != lvlCur) {
            console.log("makeRandomNodesTree: setting x positions nodesNxtLvl.length= " + nodesNxtLvl.length + " x1= ");
            var dx = canvasWidth/nodesNxtLvl.length;
            var j = 0;
            var s = "";
            nodesNxtLvl.forEach(nd => {
                var x1 = j * dx + (dx / 2);
                s += x1 + " ";
                nd.ctr.x = x1;
                j++;
            });
            console.log(s);
            lvlCur = node.lvl;
            // number of nodes expected at this level
            var numNodesExpected = (numChildrenMin + numChildrenRng/2) * nodesCurLvl.length;
            var numNodesExpected_nxtLvl = (numChildrenMin + numChildrenRng/2) * numNodesExpected;
            console.log("makeRandomNodesTree: numNodesExpected= ", numNodesExpected_nxtLvl, " numNodes= ", numNodes);
            if(numNodes < numNodesExpected_nxtLvl) {
                pickRandom = true;
            }

            nodesCurLvl = [... nodesNxtLvl];  // copy nodes
            nodesNxtLvl = [];
        }

        if(pickRandom) {
            nodeQ.push(node);
            node = nodeQ.removeRandom();
        }

        // adjust random number by raising to negative power to favor more children higher in tree
        var rnd_adj = 1; // lvl - maxLvl/2;
        if(lvlCur == 0) rnd_adj = 1/3;
        if(lvlCur == 1) rnd_adj = 1/2;
        // else if(lvlCur == 2) rnd_adj = 1/2;

        var numC = numChildrenMin + Math.round(numChildrenRng * Math.pow(Math.random(), rnd_adj));
        if(this.nextNodeNum == 1) { // root must have at least two children
            numC = Math.max(numC, 2); 
        }
        numC = Math.min(numNodes, numC);
        console.log("makeRandomNodesTree: node= ", node, " numC= ", numC);
        node.numChildren = numC;

        // add child nodes
        for(var j=0; j<numC; j++) {
            var lvl = node.lvl + 1;
            var ctr = { x : canvasWidth/2, y : 0 };
            ctr.y = 3 * lvl * rad + 2*rad;
            var childNode = new Node(ctr, rad, this.nextNodeNum);
            childNode.color = nodeColor;
            childNode.opacity = nodeOpacity;
            childNode.lvl = lvl;
            makeNodeQuickLabel(quickLabelMode, childNode);
            this.allNodes.push(childNode)
            nodeQ.push(childNode);
            nodesNxtLvl.push(childNode);
            this.connectNodes(node, childNode, ARROW_TYPE_DST);
            numNodes--;
            this.nextNodeNum++;
            
        }
    }

    var dx = canvasWidth/nodesNxtLvl.length;
    var j = 0;
    nodesNxtLvl.forEach(nd => {
        var x1 = j * dx + (dx / 2);
        nd.ctr.x = x1;
        j++;
    });

    this.allEdges.forEach(e => { if(e != null) e.updatePoints(this.allNodes); });
}

Graph.prototype.generateRandomGraph = function(canvas, opts) {
    this.clearNodes(canvas);

    // initilaize adjacency matrix 
    for(var i=0; i < opts.numNodes; i++) {
        var eList = [];
        for(var j=0; j < opts.numNodes; j++) {
            eList.push(-1);
        }
        this.adjMat.push(eList);
    }
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    if(opts.strategy == STRATEGY_RING) {
        this.makeRandomNodesRing(opts.numNodes, opts.rad, opts.quickLabelMode, canvasWidth, canvasHeight, opts.nodeColor, opts.nodeOpacity);
    } else if(opts.strategy == STRATEGY_GRID) {
        this.makeRandomNodesGrid(opts.numNodes, opts.rad, opts.quickLabelMode, canvasWidth, canvasHeight, opts.nodeColor, opts.nodeOpacity);
    } else if(opts.strategy == STRATEGY_TREE) {
        this.makeRandomNodesTree(opts.numNodes, opts.rad, opts.quickLabelMode, opts.outDegMin, opts.outDegMax, canvasWidth, canvasHeight, opts.nodeColor, opts.nodeOpacity);
        return;
    } else {
        // bad strategy
        return;
    }
    
    this.nextNodeNum = opts.numNodes;

    // console.log('generateRandomGraph adjMat= ', adjMat);
    // console.log('generateRandomGraph allNodes= ', allNodes);

    // generate edges 
    for(var nd1=0; nd1 < opts.numNodes; nd1++) {
        var nodeList = this.makeSortedNodeDistList(this.allNodes[nd1]);
        //console.log('generateRandomGraph nodeList= ', nodeList);
        var numEdgesOut = opts.outDegMin + Math.floor(Math.random()*opts.outDegRng);
        var numEdgesIn = opts.inDegMin + Math.floor(Math.random()*opts.inDegRng);
        var eList = this.adjMat[nd1];
        //console.log('generateRandomGraph eList= ', eList);
        eList.forEach(e => { 
            if(e >= 0) numEdges--; 
        });
        var j = 0;
        // console.log('generateRandomGraph numEdges= ', eList);
        while(numEdgesOut > 0 && j < opts.numNodes) {
            // pick closest node
            //console.log('j= ', j);
            nd2 = nodeList[j].ndNum;
            //console.log('nd2= ', nd2);
            // already an edge incoming edge, turn into bidrectional
            if(this.adjMat[nd2][nd1] >= 0)  {
                var edge = this.allEdges[this.adjMat[nd2][nd1]];
                if(edge.arrowDir != ARROW_TYPE_NONE)
                    edge.arrowDir = ARROW_TYPE_BIDIR;
                this.adjMat[nd1][nd2] = this.adjMat[nd2][nd1];
            }
            else if(this.adjMat[nd1][nd2] < 0)  {
                var edge = new Edge(nd1, nd2, this.nextEdgeNum, this.allNodes);
                edge.arrowDir = opts.arrowDir;
                edge.weight[0] = opts.edgeWeightMin + Math.floor(opts.edgeWeightRng * Math.random());
                this.allEdges.push(edge);
                this.adjMat[nd1][nd2] = this.nextEdgeNum;
                if(arrowDir == ARROW_TYPE_NONE || arrowDir == ARROW_TYPE_BIDIR) {
                    this.adjMat[nd2][nd1] = this.nextEdgeNum;
                }
                this.nextEdgeNum++;
                numEdgesOut--;
            }
            j++;
        }
    }
}

Graph.prototype.transpose = function(edge) {
    nd1 = edge.nodes[0];
    nd2 = edge.nodes[1];
    edge.transpose();
    tmp = this.adjMat[nd1][nd2];
    this.adjMat[nd1][nd2] = this.adjMat[nd2][nd1]
    this.adjMat[nd2][nd1] = tmp;
}

Graph.prototype.loadGraph = function(gr) {
    Object.assign(this, gr);

    for(var i=0; i<this.allNodes.length; i++) {
        var nd = new Node();
        Object.assign(nd, gr.allNodes[i]);
        this.allNodes[i] = nd;
    }

    for(var i=0; i<this.allEdges.length; i++) {
        var e = new Edge()
        Object.assign(e, gr.allEdges[i]);
        e.updatePoints(this.allNodes);
        this.allEdges[i] = e;
    }    
}


    