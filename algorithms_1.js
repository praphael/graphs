
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function TransposeAlg() {
    this.description = "Graph transpose.\nA simple graph algorithm which mnerely swaps the direction of all edges.\n " +
        "Only meaningful for directed graph.";
}

TransposeAlg.prototype.run = function(graph, show, canvas, logText, resultsText) {
    // clear text area
    logText.innerText = "";

    var sLog = "";
    var sleepTime = 0;
    var sleepTimeInc= 100;
    var ctx = canvas.getContext("2d");

    function Transpose(edge) {
        var nd1 = edge.nodes[0];
        var nd1_lbl = graph.allNodes[nd1].label;
        var nd2 = edge.nodes[1];
        var nd2_lbl = graph.allNodes[nd2].label;
        sLog += + "edge [" + nd1_lbl + ", " + nd2_lbl + "] -> [" + nd2_lbl  + ", " + nd1_lbl + "]\n";

        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            var ed = edge;
            sleep(sTime).then(() => {
                ed.isSel = true;
                // edge.draw(ctx);
                graph.transpose(edge);
                graph.redraw(canvas);
                //nd.isSel = true;
                //nd.draw(ctx);
                logText.innerText = sLog;
            });
        } else {
            logText.innerText = sLog;
            graph.transpose(edge);
        }


        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            var ed = edge;
            sleep(sTime).then(() => {
                ed.isSel = false;
                // edge.draw(ctx);
                graph.redraw(canvas);
                //nd.isSel = true;
                //nd.draw(ctx);
            });
        }

    }

    graph.allEdges.forEach(edge => { 
        /* console.log(obj); */ 
        if(edge != null) {
            // edge.draw(ctx); 
            Transpose(edge);
        }
    });

    if(show) {
        sleepTime += sleepTimeInc;
        var sTime = sleepTime;
        sleep(sTime).then(() => {
              //nd.isSel = true;
            //nd.draw(ctx);
            resultsText.innerText = "Transpose done";
            graph.redraw(canvas);
        });
    }
    else {
        resultsText.innerText = "Transpose done";
        graph.redraw(canvas);
    }
    
}

function DFSAlg() {
    this.description = "Depth first search (DFS).\nFrom start node, recursively attempt to reach all nodes in the graph.\n " + 
        "Exhaustively search nodes in 'depth', before attempting to search next node.\n" +
        "Ah analogy would be single person going for a walk, then retracing their steps when they get to a dead end.\n" +
        "This is a basic stragey is used in many graph algorithms\n" +
        "If no node is selected, it will run with the first node.";
}



DFSAlg.prototype.run = function(graph, show, canvas, logText, resultsText) {
    var nodesVisited = [];
    var ctx;
    var s = "";
    var s2 = "";
    var nodeOrder = [];
    var sleepTime = 0;
    var sleepTimeInc = 200;

    function updateNode(nodeHnd) {
        nodeHnd.origcolor = nodeHnd.color;
        nodeHnd.color = "#FA0000"; // color node red
        nodeHnd.draw(ctx);
    
        s2 = s2 + " -> " + nodeHnd.label;
        resultsText.innerText = s2; 
    }

    function DFS(node, recLevel) {
        var nd = graph.allNodes[node];
        
        var edgeList = graph.adjMat[node];
        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            sleep(sTime).then(() => {
                nd.isSel = true;
                updateNode(nd);
            });
        }
        else {
            updateNode(nd);
        }
        
        nodeOrder.push(nd);

        edgeList.forEach(edgeID => {
            s = s + " eID= " + edgeID;
            logText.innerText = s;
            if(edgeID >= 0) {
                var e = graph.allEdges[edgeID];
                if(e != null) {
                    var nextNode = e.nodes[1];
                    if(node == nextNode) {
                        if(e.isBiDir()) {
                            nextNode = e.nodes[0];
                        } else {
                            nextNode = -1;
                        }
                    }
                    
                    s = s + " nextNode(ID)= " + nextNode;
                    logText.innerText = s;

                    if(nextNode >= 0) {
                        if(!nodesVisited[nextNode]) {
                            if(show) {
                                sleepTime += sleepTimeInc;
                                var sTime = sleepTime;
                                sleep(sTime).then(() => {
                                    nd.isSel = false;
                                    e.isSel = true;
                                    e.draw(ctx);
                                    nd.draw(ctx);
                                });
                            }
                            // s2 = s2 + " ->" + nextNode;
                            //resultsText.innerText = s2; 

                            // recursively call DFS
                            nodesVisited[nextNode] = true;
                            DFS(nextNode, recLevel + 1);
                            if(show) {
                                sleepTime += sleepTimeInc;
                                var sTime = sleepTime;
                                sleep(sTime).then(() => {
                                    nd.isSel = true;
                                    e.isSel = false;
                                    /* 
                                    e.draw(ctx);
                                    nd.draw(ctx);
                                    */
                                    graph.redraw(canvas);
                                });
                            }
                            
                        }
                        
                    }
                }
            }
        });

        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            sleep(sTime).then(() => {
                nd.isSel = false;
                nd.draw(ctx);
            });
        }
        
    }

    logText.innerText = "";
    var ndNum = 0;
    var objSel = graph.objSel;
    if(objSel != null) {
        if(objSel.objType() == NODE)
            ndNum = objSel.nodeNum;
    }
    nodesVisited = [];
    for(var i=0; i<graph.allNodes.length; i++)
        nodesVisited.push(false);

    ctx = canvas.getContext("2d");
    nodesVisited[ndNum] = true;
    DFS(ndNum, 0);    

    /*
    nodeOrder.forEach => ( nd => {

    }
    ); */
}



function BFSAlg() {
    this.description = "Breadth first search (BFS).\n  From start node, attempt to reach all nodes in the graph.\n " + 
        "Unlike DFS, BFS will expand the frontier in breadth, before searching each node in 'depth'.\n" +
        "An analogy would be several people going for a walk at the same time\n" + 
        "This is a basic stragey is used in many graph algorithms\n" +
        "If no node is selected, it will run with the first node.";
}

BFSAlg.prototype.run = function(graph, show, canvas, logText, resultsText, objSel) {

    var ctx = canvas.getContext('2d');
    var nodesVisited = [];
    var sLog = "";
    var sRes = "";

    function updateNode(nodeHnd) {
        nodeHnd.origcolor = nodeHnd.color;
        nodeHnd.color = "#FA0000"; // color node red
    
        /*
        s2 = s2 + " -> " + nodeHnd.label;
        resultsText.innerText = s2; 
        */
    }

    function BFS() {
        var ndNum = nodesToVisit.pop();
        var ndH = graph.allNodes[ndNum];
        var edgeList = graph.adjMat[ndNum];
        console.log("ndNum= " + ndNum + " edgeList= " + edgeList);

        sRes += " -> " + ndH.label + "(";
        sLog += "node " + ndH.label + " edges=";
        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            var ndHnd = graph.allNodes[ndNum];
            sleep(sTime).then(() => {
                ndHnd.isSel = true;
                ndHnd.draw(ctx);
                resultsText.innerText = sRes;
                logText.innerText = sLog;
            });
        } else {
            logText.innerText = sLog;
            resultsText.innerText = sRes;
        }
        
        var newNodes = [];

        edgeList.forEach(edgeID => {
            sLog += " " + edgeID;
            logText.innerText = sLog;
            if(edgeID >= 0) {
                var e = graph.allEdges[edgeID];
                if(e != null) {
                    var nextNode = e.nodes[1];
                    if(ndNum == nextNode) {
                        if(e.isBiDir()) {
                            nextNode = e.nodes[0];
                        } else {
                            nextNode = -1;
                        }
                    }
                    if(nextNode != -1) {
                        if(!nodesVisited[nextNode]) {
                            newNodes.push(nextNode);

                            var nxtNdHnd = graph.allNodes[nextNode];
                            sRes += " " + nxtNdHnd.label;

                            if(show) {
                                sleepTime += sleepTimeInc;
                                var sTime = sleepTime;
                                var edg = e;
                                sleep(sTime).then(() => {
                                    edg.isSel = true;
                                    edg.draw(ctx);
                                    resultsText.innerText = sRes;
                                });
                            }
                            else {
                                resultsText.innerText = sRes;
                            }

                            nodesVisited[nextNode] = true;
                            nodesToVisit.push(nextNode);
                        }
                    }
                }
            }
        });

        sRes += ") ";
        console.log("newNodes= " + newNodes);

        if(show) {
            sleepTime += sleepTimeInc;
            var sTime = sleepTime;
            var ndH = graph.allNodes[ndNum];
            var newNodesCpy = [...newNodes];
            var eList = [...edgeList];

            sleep(sTime).then(() => {
                resultsText.innerText = sRes;
                ndH.isSel = false;

                eList.forEach(edgeID => {
                    if(edgeID >= 0) {
                        var e = graph.allEdges[edgeID];
                        if(e != null) {
                            e.isSel = false;
                        }
                    }
                });

                console.log("newNodesCpy= ", newNodesCpy);
                newNodesCpy.forEach(ndNum => {
                    ndH = graph.allNodes[ndNum];
                    updateNode(ndH);
                });
                
                
                graph.redraw(canvas);
            });
        } else {
            resultsText.innerText = sRes;
        }
    } // end BFS

    resultsText.innerText = "";
    logText.innerText = "";
    var ndNum = 0;
    var objSel = graph.objSel;
    if(objSel != null) {
        if(objSel.objType() == NODE)
            ndNum = objSel.nodeNum;
    }
    
    for(var i=0; i<graph.allNodes.length; i++)
        nodesVisited.push(false);

    nodesVisited[ndNum] = true;
    
    // initialize nodes to visit
    var nodesToVisit = new Queue();
    nodesToVisit.push(ndNum);

    var sleepTime = 0;
    var sleepTimeInc = 200;

    var ndHnd = graph.allNodes[ndNum];
    updateNode(ndHnd);
    ndHnd.draw(ctx);

    while(!nodesToVisit.empty()) {
        BFS();
    }

    sRes += "BFS done";
    if(show) {
        sleepTime += sleepTimeInc;
        var sTime = sleepTime;
        sleep(sTime).then(() => {
            resultsText.innerText = sRes;
        });
    }  
    else {
        resultsText.innerText = sRes;
    }
}

function SCCAlg() {
    this.description = "Strongly connected components.\nThe strong connected components of a graph, divides the graph into sets of nodes.\n" + 
        "Each node in a given set, must be reachable from all other nodes in the set.\n" + 
        "Generally only makes sense for directed graphs, or bidirectional graphs which are disconnected.\n" +
        "for undirected graphs";
}

SCCAlg.prototype.run = function(graph, show, canvas, logText, resultsText, objSel) {

    
    var N = graph.allNodes.length;
    var visited = new Array(N);
    visited.fill(false);
    var comp = new Array(N);
    comp.fill(-1);

    // create transpose of orinal graph
    var adjMatTrns = [];
    for(var i=0; i<N; i++) {
        var row = new Array(N);
        row.fill(-1);
        adjMatTrns.push(row);
    }
        

    console.log(adjMatTrns);
    graph.allEdges.forEach(edge => {
        if(edge != null) {
            console.log('edge ' + edge.edgeNum + ' nodes=' + edge.nodes);
            nd1 = edge.nodes[0];
            nd2 = edge.nodes[1];
            adjMatTrns[nd2][nd1] = edge.edgeNum;
            if(edge.arrowDir != ARROW_TYPE_DST) { // bidirectional
                adjMatTrns[nd1][nd2] = edge.edgeNum;
            }
        }
    });

    console.log('adjMatTrns=');
    for(var i=0; i<N; i++)
        console.log(adjMatTrns[i]);

    function DFS(nodeNum, lst) {
        console.log('SCC.DFS() nodeNum= ' + nodeNum + ' lst= ' + lst);
        if(nodeNum < 0)
            return;

        if(!visited[nodeNum]) {
            visited[nodeNum] = true;
            adj = graph.adjMat[nodeNum];
            adj.forEach(edgeNum => {
                edge = graph.allEdges[edgeNum];
                if(edge != null) {
                    nd_adj = edge.nodes[1];
                    if((edge.arrowDir != ARROW_TYPE_DST) && (nd_adj == nodeNum))
                        nd_adj = edge.nodes[0];
                    console.log('nodeNum= ' + nodeNum + ' nd_adj= ' + nd_adj);
                    DFS(nd_adj, lst);
                }
            });

            lst.unshift(nodeNum)
        }
    }

    function Assign(nodeNum, root) {
        console.log('SCC.Assign() nodeNum= ' + nodeNum + ' root= ' + root);
        if (nodeNum < 0) 
            return;

        var nd = graph.allNodes[nodeNum];
        if(nd == null)
            return;

        if(comp[nodeNum] < 0) {
            comp[nodeNum] = root;
            nd.color = graph.allNodes[root].color;
        } 
        else return;  // we have already assigned component

        eLst = adjMatTrns[nodeNum];
        console.log('eLst= ' + eLst);
        eLst.forEach(edgeNum => {
            edge = graph.allEdges[edgeNum];
            if(edge != null) {
                nd_adj = edge.nodes[0]; // since this is tranpose, the adjacent edge should be the first 
                if((edge.arrowDir != ARROW_TYPE_DST) && (nd_adj == nodeNum))
                    nd_adj = edge.nodes[1];
                // console.log('nodeNum= ' + nodeNum + ' edge.nodes= ' + edge.nodes + ' nd_adj= ' + nd_adj);

                Assign(nd_adj, root);
            }
        });
    }
    
    // Koseraju's algorithm - first construct a list of nodes by DFS'ing all nodes, prepending each node to list as it is discovered
    var lst = []
    graph.allNodes.forEach(nd => {
        if (nd != null) {
            var ndNum = nd.nodeNum;
            console.log('ndNum= ' + ndNum + ' lst= ' + lst);
            
            if(!visited[ndNum]) {
                // depth first search to visit all nodes connected to this node
                DFS(ndNum, lst);
            }
        }
    });

     var clrNum = 0;
     // assign SCC based on transpose
     const hue = [0.0, 0.083, 0.167, 0.319, 0.5, 0.658, 0.764, 0.847];
     const lgt = [0.5, 0.25, 0.75];
     const sat = [1.0, 0.75, 0.5, 0.25];
     
     lst.forEach(ndNum => {
        
        if(comp[ndNum] < 0) {
            var nd = graph.allNodes[ndNum];

            // create new color
            var h = hue[clrNum % hue.length];
            var idx = Math.floor(clrNum / hue.length)  % lgt.length;
            var l = lgt[idx];
            idx = Math.floor(clrNum / (hue.length * lgt.length)) % sat.length;
            var s = sat[idx];
            var clr = hslToRgb(h, s, l);
            var clr_hx = rgbToHex(... clr);
            nd.origcolor = nd.color;
            console.log('clr= ' + clr + ' clr_hx= ' + clr_hx);
            nd.color = clr_hx;

            Assign(ndNum, ndNum);
            
            // increemnt color
            clrNum++;
        }
    });
}

function TopoSortAlg() {
    this.description = "Topological sort.\nOrder the graph by performing a DFS.  When exhausted, nodes not discovered are pre-pended to the order." +
        "Topological sort may not be unique, results may depend on order in which nodes are searched. ONly meaningful for directed graphs.";
    ;
}