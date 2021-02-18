class TopoSortAlg {
    constructor() {
        this.description = "Topological sort.\nOrder the graph by performing a DFS.  When exhausted, nodes not discovered are pre-pended to the order." +
            "Topological sort may not be unique, results may depend on order in which nodes are searched. ONly meaningful for directed graphs.";
    }

    run(graph, show, canvas, logText, resultsText) {
        var DFS = new DFSAlg();

        if(graph.objSel != null)
            graph.objSel.isSel = false;

        this.sortOrder = [];
        graph.objSel = null;
        initAlg = true;
        graph.allNodes.forEach(nd => {
            if(nd != null) {
                graph.objSel = nd;
                DFS.discOrder = [];
                DFS.finishOrder = [];
                DFS.run(graph, show, canvas, logText, resultsText, initAlg);
                var joined = []
                joined.concat(this.discOrder, this.sortOrder);
                this.sortOrder = joined;
                graph.objSel = null;
                initAlg = false;
            }
        });

    }
}

// algorithm to compute minimum spanning tree - using Prim's algorithm
class MinSpanAlg {
    constructor() {
        this.description = "Minimum Spanning Tree.\nFind the set of edges, with minimal totla weight, that includes all vertices.  Usses Prim's algorithm." 
         "Only meaningful for undirected, connected graphs.";
    }

    run(graph, show, canvas, logText, resultsText) {        

    }
}

