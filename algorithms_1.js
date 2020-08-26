function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function TransposeAlg() {
    this.description = "Graph transpose.\nA simple graph algorithm which mnerely swaps the direction of all edges.\n " +
        "Only meaningful for directed graph.";
}

TransposeAlg.prototype.run = function(graph, show, canvas, logText, resultsText, objSel) {
    // clear text area
    logText.innerText = "";

    var s = "";
    graph.allEdges.forEach(edge => { 
        /* console.log(obj); */ 
        if(edge != null) {
            // edge.draw(ctx); 
            if(show) {
                var nd1 = edge.nodes[0];
                var nd1_lbl = graph.allNodes[nd1].label;
                var nd2 = edge.nodes[1];
                var nd2_lbl = graph.allNodes[nd2].label;
                s = s + "edge [" + nd1_lbl + ", " + nd2_lbl + "] -> [" + nd2_lbl  + ", " + nd1_lbl + "]\n";
                logText.innerText = s;
            }
            graph.transpose(edge);
        }
    });

    resultsText.innerText = "Transpose done";

    graph.redraw(canvas);
}

function DFSAlg() {
    this.description = "Depth first search (DFS).\nFrom start node, recursively attempt to reach all nodes in the graph.\n " + 
        "Exhaustively search nodes in 'depth', before attempting to search next node.\n" +
        "Ah analogy would be single person going for a walk, then retracing their steps when they get to a dead end.\n" +
        "This is a basic stragey is used in many graph algorithms\n" +
        "If no node is selected, it will run with the first node.";
}



DFSAlg.prototype.run = function(graph, show, canvas, logText, resultsText, objSel) {
    var nodesVisited = [];
    var ctx;
    var s = "";
    var s2 = "";
    var nodeOrder = [];
    var sleepTime = 0;

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
            var sTime = sleepTime;
            sleep(sTime).then(() => {
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
                            sleepTime += 1000;
                            // s2 = s2 + " ->" + nextNode;
                            //resultsText.innerText = s2; 

                            // recursively call DFS
                            nodesVisited[nextNode] = true;
                            DFS(nextNode, recLevel + 1);
                        }
                        
                    }
                }
            }
        });
        
    }

    logText.innerText = "";
    var ndNum = 0;
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
        "Unlike DFS, BFS will expand the 'frontier', before searching each node in 'depth'.\n" +
        "An analogy would be several people going for a walk at the same time\n" + 
        "This is a basic stragey is used in many graph algorithms\n" +
        "If no node is selected, it will run with the first node.";
}

BFSAlg.prototype.run = function(graph, show, canvas, logText, resultsText, objSel) {
    
}

function SCCAlg() {
    this.description = "Strongly connected components.\nThe strong connected components of a graph, divides the graph into sets of nodes.\n" + 
        "Each node in a given set, must be reachable from all other nodes in the set.\n" + 
        "Generally only makes sense for directed graphs, or bidirectional graphs which are disconnected.\n" +
        "for undirected graphs";
}