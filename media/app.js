let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "white";
ctx.strokeStyle = "gray";
ctx.font = "20px Arial";


const center = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

class Node{
    constructor(label, color){
        this.label = label;
        this.color = color;
        this.radius = 20;
        if(this.label.length > 1){
            this.radius += (this.label.length - 1) * 5;
        }
        this.x = 0;
        this.y = 0;
    }
    draw(){
        // The radius of the node should be depends on length of label
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "black";
        // Label should be in the middle of the node
        if(this.label.length > 1){
            ctx.fillText(this.label, this.x - (this.label.length * 5), this.y + 7);
        }else{
            ctx.fillText(this.label, this.x - 7, this.y + 7);
        }
    
    }
}

class Edge{
    constructor(source, target){
        this.source = source;
        this.target = target;
    }
    draw(){
        // Draw directed edge
        let angle = Math.atan2(this.target.y - this.source.y, this.target.x - this.source.x);
        let x1 = this.source.x + this.source.radius * Math.cos(angle);    
        let y1 = this.source.y + this.source.radius * Math.sin(angle);
        let x2 = this.target.x - this.target.radius * Math.cos(angle);
        let y2 = this.target.y - this.target.radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.closePath();
    }
}

class Graph{
    constructor(){
        this.nodes = [];
        this.edges = [];
    }
    addNode(node){
        // Check if node with same label already exists
        let exists = false;
        for(let n of this.nodes){
            if(n.label === node.label){
                exists = true;
                break;
            }
        }
        if(!exists){
            this.nodes.push(node);
        }
    }
    addEdge(edge){
        // Check if edge already exists
        let exists = false;
        for(let e of this.edges){
            if(e.source === edge.source && e.target === edge.target){
                exists = true;
                break;
            }
        }
        if(!exists){
            this.edges.push(edge);
        }
    }
    draw(){
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update nodes position
        let radius = Math.min(canvas.width, canvas.height) / 2 - 100;
        for(let node of this.nodes){
            let angle = Math.random() * 2 * Math.PI;
            if(node.x === 0 && node.y === 0){
                node.x = center.x + radius * Math.cos(angle);
                node.y = center.y + radius * Math.sin(angle);
            }
        }

        // Draw nodes
        for(let node of this.nodes){
            node.draw();
        }

        // Draw edges
        for(let edge of this.edges){
            edge.draw();
        }

        
    }

    inDegree(label){
        let inDegree = 0;
        for(let edge of this.edges){
            if(edge.target.label === label){
                inDegree++;
            }
        }
        return inDegree;
    }

    outDegree(label){
        let outDegree = 0;
        for(let edge of this.edges){
            if(edge.source.label === label){
                outDegree++;
            }
        }
        return outDegree;
    }

    degree(label){
        return this.inDegree(label) + this.outDegree(label);
    }

    neighbors(label){
        let neighbors = [];
        for(let edge of this.edges){
            if(edge.source.label === label){
                neighbors.push(edge.target);
            }
        }
        return neighbors;
    }

    removeNode(label){
        // Remove node
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].label === label){
                this.nodes.splice(i, 1);
                break;
            }
        }
        // Remove edges
        for(let i = 0; i < this.edges.length; i++){
            if(this.edges[i].source.label === label || this.edges[i].target.label === label){
                this.edges.splice(i, 1);
                i--;
            }
        }
    }

    removeEdge(source, target){
        for(let i = 0; i < this.edges.length; i++){
            if(this.edges[i].source.label === source && this.edges[i].target.label === target){
                this.edges.splice(i, 1);
                break;
            }
        }
    }

    getNodeAt(x, y){
        for(let node of this.nodes){
            if(Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2)) <= node.radius){
                return node;
            }
        }
        return null;
    }

}


let graph = new Graph();

// Buttons
let container = document.querySelector(".container");
let menuButton = document.getElementById("menu-btn");

// Adding node
let addNodeButton = document.getElementById("add-node-btn");
let addNodeLabel = document.getElementById("node-name");
let addNodeColor = document.getElementById("node-color");

// Adding edge
let addEdgeButton = document.getElementById("add-edge-btn");
let addEdgeSource = document.getElementById("edge-source");
let addEdgeTarget = document.getElementById("edge-target");

// Removing node
let removeNodeButton = document.getElementById("remove-node-btn");
let removeNodeLabel = document.getElementById("remove-node-name");

// Removing edge
let removeEdgeButton = document.getElementById("remove-edge-btn");
let removeEdgeSource = document.getElementById("remove-edge-source");
let removeEdgeTarget = document.getElementById("remove-edge-target");

// Clearing graph
let clearGraphButton = document.getElementById("clear-graph-btn");

// Menu button
menuButton.addEventListener("click", () => {
    container.classList.toggle("active");
    if(container.classList.contains("active")){
        menuButton.innerHTML = "Close";
    }else{
        menuButton.innerHTML = "Menu";
    }
});

// Add node button
addNodeButton.addEventListener("click", () => {
    // First check if node with same label already exists
    let label = addNodeLabel.value.trim();
    let exists = false;
    for(let node of graph.nodes){
        if(node.label === label){
            exists = true;
            break;
        }
    }
    if(!exists){
        let color = addNodeColor.value;
        let node = new Node(label, color);
        graph.addNode(node);
        graph.draw();
    }
    else{
        alert("Node with same label already exists!");
    }   
    
    // clear input fields
    addNodeLabel.value = "";
    addNodeColor.value = "#ffffff";
});


// Add edge button
addEdgeButton.addEventListener("click", () => {
    let source = addEdgeSource.value.trim();
    let target = addEdgeTarget.value.trim();
    let sourceNode = null;
    let targetNode = null;
    for(let node of graph.nodes){
        if(node.label === source){
            sourceNode = node;
        }
        if(node.label === target){
            targetNode = node;
        }
    }
    if(sourceNode && targetNode){
        let edge = new Edge(sourceNode, targetNode);
        // check if edge already exists
        let exists = false;
        for(let e of graph.edges){
            if(e.source.label === source && e.target.label === target){
                exists = true;
                break;
            }
        }
        if(exists){
            alert("Edge already exists!");
            return;
        }
        graph.addEdge(edge);
        graph.draw();
    }
    else{
        alert("One or both nodes do not exist!");
    }

    // clear input fields
    addEdgeSource.value = "";
    addEdgeTarget.value = "";
    
});

// Remove node button
removeNodeButton.addEventListener("click", () => {
    let label = removeNodeLabel.value.trim();
    let index = -1;
    for(let i = 0; i < graph.nodes.length; i++){
        if(graph.nodes[i].label === label){
            index = i;
            break;
        }
    }
    if(index !== -1){
        graph.nodes.splice(index, 1);
        // Remove edges connected to this node
        for(let i = 0; i < graph.edges.length; i++){
            if(graph.edges[i].source.label === label || graph.edges[i].target.label === label){
                graph.edges.splice(i, 1);
                i--;
            }
        }
        graph.draw();
    }
    else{
        alert("Node with this label does not exist!");
    }

    // clear input fields
    removeNodeLabel.value = "";
});


// Remove edge button
removeEdgeButton.addEventListener("click", () => {
    let source = removeEdgeSource.value.trim();
    let target = removeEdgeTarget.value.trim();
    let index = -1;
    for(let i = 0; i < graph.edges.length; i++){
        if(graph.edges[i].source.label === source && graph.edges[i].target.label === target){
            index = i;
            break;
        }
    }
    if(index !== -1){
        graph.edges.splice(index, 1);
        graph.draw();
    }
    else{
        alert("Edge does not exist!");
    }

    // clear input fields
    removeEdgeSource.value = "";
    removeEdgeTarget.value = "";
});


// Clear graph button
clearGraphButton.addEventListener("click", () => {
    graph.nodes = [];
    graph.edges = [];
    
    // reload the graph
    window.location.reload();
});

// Save graph button
let saveGraphButton = document.getElementById("save-json-btn");

saveGraphButton.addEventListener("click", () => {
    let nodes = [];
    let edges = [];
    for(let node of graph.nodes){
        nodes.push({
            label: node.label,
            color: node.color,
        });
    }
    for(let edge of graph.edges){
        edges.push({
            source: edge.source.label,
            target: edge.target.label
        });
    }
    let data = {
        nodes: nodes,
        edges: edges
    };
    let json = JSON.stringify(data);
    let blob = new Blob([json], {type: "application/json"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.download = "graph.json";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

// Save Image button
let saveImageButton = document.getElementById("save-png-btn");

saveImageButton.addEventListener("click", () => {
    let canvas = document.getElementById("canvas");
    let url = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    a.download = "graph.png";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

// Load graph button
let loadGraphButton = document.getElementById("load-json-btn");
let fileInput = document.getElementById("file-input");

loadGraphButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let data = JSON.parse(reader.result);
        graph.nodes = [];
        graph.edges = [];
        for(let node of data.nodes){
            let n = new Node(node.label, node.color);
            graph.addNode(n);
        }
        for(let edge of data.edges){
            let source = null;
            let target = null;
            for(let node of graph.nodes){
                if(node.label === edge.source){
                    source = node;
                }
                if(node.label === edge.target){
                    target = node;
                }
            }
            let e = new Edge(source, target);
            graph.addEdge(e);
        }
        graph.draw();
    };
    reader.readAsText(file);
}
);

let nodeCard = document.getElementById("node-card");
// When we click over a node, we want to show all its properties on a card on the right or left side of the screen according to the position of the node
canvas.addEventListener("mousemove", (e) => {
    let x = e.clientX;
    let y = e.clientY;
    let node = graph.getNodeAt(x, y);
    if(node){
        nodeCard.style.transform = "scale(1)";

        let nodeOutdegree = document.getElementById("node-outdegree");
        let nodeIndegree = document.getElementById("node-indegree");
        let nodeAdjacency = document.getElementById("node-adjacency");
        let nodeDegree = document.getElementById("node-degree");
        let nodeColor = document.getElementById("node-color");
        
        nodeIndegree.innerText = `Indegree: ${graph.inDegree(node.label)}`;
        nodeOutdegree.innerText = `Outdegree: ${graph.outDegree(node.label)}`;
        nodeDegree.innerText = `Degree: ${graph.degree(node.label)}`;
        nodeColor.innerText = `Color: ${node.color}`; 
        neigbours = graph.neighbors(node.label).map(n => n.label); 
        nodeAdjacency.innerText = `Neighbors: ${neigbours.join(", ")}`;
    }else{
        nodeCard.style.transform = "scale(0)";
    }
});

// Allow node dragging
let draggedNode = null;
canvas.addEventListener("mousedown", (e) => {
    let x = e.clientX;
    let y = e.clientY;
    draggedNode = graph.getNodeAt(x, y);
}
);

canvas.addEventListener("mousemove", (e) => {
    if(draggedNode){
        let x = e.clientX;
        let y = e.clientY;
        draggedNode.x = x;
        draggedNode.y = y;
        graph.draw();
    }
}
);

canvas.addEventListener("mouseup", (e) => {
    draggedNode = null;
}
);

// Save in graphviz format
let saveGraphvizButton = document.getElementById("save-graphviz-btn");

saveGraphvizButton.addEventListener("click", () => {
    let nodes = [];
    let edges = [];
    for(let node of graph.nodes){
        nodes.push(`${node.label} [color="${node.color}"]`);
    }
    for(let edge of graph.edges){
        edges.push(`${edge.source.label} -> ${edge.target.label}`);
    }
    let data = `digraph G {
    ${nodes.join(";\n")}
    ${edges.join(";\n")}
    }`;
    let blob = new Blob([data], {type: "text/plain"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.download = "graph.gv";
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
);

// Load graphviz format
let loadGraphvizButton = document.getElementById("load-graphviz-btn");

let fileInputGraphviz = document.getElementById("file-input-graphviz");

loadGraphvizButton.addEventListener("click", () => {
    fileInputGraphviz.click();
}
);

fileInputGraphviz.addEventListener("change", () => {
    let file = fileInputGraphviz.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let data = reader.result;
        let lines = data.split("\n");
        let nodes = [];
        let edges = [];
        for(let line of lines){
            // handle -- edge
            if(line.includes("--")){
                let source = line.split("--")[0].trim();
                let target = line.split("--")[1].trim();
                edges.push({
                    source: source,
                    target: target
                });
                edges.push({
                    source: target,
                    target: source
                });
                // Add both to nodes
                if(!nodes.includes(source)){
                    nodes.push(source);
                }
                if(!nodes.includes(target)){
                    nodes.push(target);
                }
            }
            else if(line.includes("->")){
                let source = line.split("->")[0].trim();
                let target = line.split("->")[1].trim();
                edges.push({
                    source: source,
                    target: target
                });
                // Add both to nodes
                if(!nodes.includes(source)){
                    nodes.push(source);
                }
                if(!nodes.includes(target)){
                    nodes.push(target);
                }
            }
        }
        graph.nodes = [];
        graph.edges = [];
        for(let node of nodes){
            let n = new Node(node, "#ffffff");
            graph.addNode(n);
        }
        for(let edge of edges){
            let source = null;
            let target = null;
            for(let node of graph.nodes){
                if(node.label === edge.source){
                    source = node;
                }
                if(node.label === edge.target){
                    target = node;
                }
            }
            let e = new Edge(source, target);
            graph.addEdge(e);
        }
        graph.draw();
    };
    reader.readAsText(file);
}
);
