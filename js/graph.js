class Edge {
    static mainColor = "--main";
    constructor(edge, color = "--main"){
        this.represents = edge;
        this.weight = edge === null ? null : edge.weight;
        this.color = color;
    }
}

class Vertex {
    static nodeSize = 33.0;
    static mainColor = "--main";
    constructor(vertex, position, canvas, color = "--main"){
        this.represents = vertex;
        this.text = vertex.text;
        this.color = color;
        this.x = position[0](canvas);
        this.y = position[1](canvas);
        this.labelX = position.length === 4 ? position[2](this.x) : this.x;
        this.labelY = position.length === 4 ? position[3](this.y) : this.y;
        this.label = null;
    }

    setColor(color){
        this.color = color;
    }
}

class Graph {
    constructor(vertices, edges, directed){
        this.vertices = vertices;
        this.edges = edges.map((row, i) => row.map((cell, j) => cell === null ? null : {from: this.vertices[i], to: this.vertices[j], ...cell}));
        this.directed = directed;
    }

    getEdge(u, first = null){
        if(this.directed){
            const condition = first === null ? (edge) => (edge.from === u || edge.to === u) : (first === true ? (edge) => (edge.from === u) : (edge) => (edge.to === u))
            return this.edges.reduce((r, row) => r.concat(row)).filter((edge) => edge !== null && condition(edge))
        } else {
            const transform = (edge) => {
                if(first === null) return edge;
                else if(first === true){
                    if(edge.from !== u) {
                        const to = edge.to;
                        edge.to = edge.from;
                        edge.from = to;
                    }
                    return edge;
                }
                else if(first === false){
                    if(edge.to === u){
                        const from = edge.from;
                        edge.from = edge.to;
                        edge.to = from;
                    }
                    return edge;
                }
            };
            return this.edges.reduce((r, row) => r.concat(row)).filter((edge) => edge !== null && (edge.from === u || edge.to === u)).map((edge) => transform(edge))
        }
    }

    getEdges(){
        if(this.directed){
            return this.edges.reduce((r, row) => r.concat(row)).filter((edge) => edge !== null)
        } else {
            const edges = [];
            for(let i = 0; i < graph.vertices.length; i++){
                for(let j = 0; j <= i; j++){
                    const edge = this.edges[i][j];
                    if(edge !== null){
                        if(edge.from.text > edge.to.text){
                            let cp = edge.to;
                            edge.to = edge.from;
                            edge.from = cp;
                        }
                        edges.push(edge);
                    }
                }
            }
            return edges;
        }
    }
}

class GraphDrawer {
    constructor(canvas, graph, positions, weighted, nodeSize = Vertex.nodeSize){
        const {edges, vertices, directed} = graph;
        this.canvas = canvas;
        this.defaultEdges = edges;
        this.defaultVertices = vertices;
        this.directed = directed;
        this.positions = positions;
        this.weighted = weighted;
        this.nodeSize = nodeSize;
        this.ctx = this.canvas.getContext("2d");
        const dpi = window.devicePixelRatio;
        this.ctx.scale(dpi, dpi);
        this.canvas.width = this.canvas.parentElement.clientWidth * window.devicePixelRatio || 1;
        this.canvas.height = this.canvas.parentElement.clientHeight * window.devicePixelRatio || 1;
        this.reset();
    }

    reset(){
        this.edges = this.defaultEdges.map((row) => row.map(e => new Edge(e)));
        this.vertices = this.defaultVertices.map((v, i) => new Vertex(v, this.positions[i], this.canvas));
        for (let i = 0; i < this.edges.length; i++)
            for (let j = 0; j < this.edges[i].length; j++)
                if (this.edges[i][j].weight !== null && this.edges[i][j].weight !== Number.MAX_VALUE){
                    this.edges[i][j].from = this.vertices[i];
                    this.edges[i][j].to = this.vertices[j];
                }
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvas.parentElement.clientWidth * window.devicePixelRatio || 1;
        this.canvas.height = this.canvas.parentElement.clientHeight * window.devicePixelRatio || 1;
    }

    draw(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.vertices.forEach(n => this.drawNode(n));
        this.edges.forEach((row) => {
            row.forEach((e) => {
                if(e !== null && e.weight !== null && e.weight !== Number.MAX_VALUE){
                    this.drawEdges(e)
                }
            })
        })
    }

    drawNode({text, x, y, color: backgroundColor, labelX, labelY, label }) {
        this.ctx.fillStyle = backgroundColor.startsWith("-") ? getComputedStyle(this.canvas).getPropertyValue(backgroundColor) : backgroundColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.nodeSize, 0, 2 * Math.PI);
        this.ctx.strokeStyle = backgroundColor.startsWith("-") ? getComputedStyle(this.canvas).getPropertyValue(backgroundColor) : backgroundColor;
        this.ctx.shadowColor = getComputedStyle(this.canvas).getPropertyValue("--navbarBackground");
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 5;
        this.ctx.fill();
    
        this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue((backgroundColor === "--white" || backgroundColor === "--gray" ? "--navbarBackground" : "--white"));
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "bold 1.3em system-ui";
        this.ctx.fillText(text, x, y);
        this.ctx.stroke();
        
        if(label !== null){
            this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue("--white");
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.font = "1.1em system-ui";
            this.ctx.fillText(label, labelX, labelY);
        }
    }

    drawEdges(edge) {
        const { x: x1, y: y1 } = edge.from;
        const { x: x2, y: y2 } = edge.to;
        const { weight, color } = edge;

        this.ctx.beginPath();
        let fromx, fromy, tox, toy, angleOfLine;
    
        // draw line
        if (x2 < x1) {
            angleOfLine = Math.atan2((y2 - y1), (x1 - x2));
            fromx = x1 - Math.cos(angleOfLine) * this.nodeSize;
            fromy = y1 + Math.sin(angleOfLine) * this.nodeSize;
            tox = x2 + Math.cos(angleOfLine) * this.nodeSize;
            toy = y2 - Math.sin(angleOfLine) * this.nodeSize;
            this.ctx.moveTo(fromx, fromy);
            this.ctx.lineTo(tox, toy);
        } else {
            angleOfLine = Math.atan2((y1 - y2), (x2 - x1));
            fromx = x1 + Math.cos(angleOfLine) * this.nodeSize;
            fromy = y1 - Math.sin(angleOfLine) * this.nodeSize;
            tox = x2 - Math.cos(angleOfLine) * this.nodeSize;
            toy = y2 + Math.sin(angleOfLine) * this.nodeSize;
            this.ctx.moveTo(fromx, fromy);
            this.ctx.lineTo(tox, toy);
        }
    
        // draw arrow
        if (this.directed) {
            let headlen = 10;
            let angle = Math.atan2(y2 - y1, x2 - x1);
            this.ctx.moveTo(tox, toy);
            this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
            this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));
            this.ctx.lineTo(tox, toy);
            this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
        }
    
        this.ctx.strokeStyle = color.startsWith("-") ? getComputedStyle(this.canvas).getPropertyValue(color) : color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // line weigth
        if (this.weighted){
            edge.label = weight
        }
        const placementRatio = 5.0;
        if(edge.label !== null && edge.label !== undefined){
            if (x2 < x1) {
                this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue("--navbarBackground");
                this.ctx.fillRect((fromx - tox) / 2.0 + (tox - (fromx - tox) / placementRatio) - 20.0, (toy - fromy) / 2.0 + (fromy + (toy - fromy) / placementRatio) - 20.0, 40, 40);
                this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue((color === "--white" ? "--navbarBackground" : "--white"));
                this.ctx.font = " bold 1em system-ui";
                this.ctx.fillText(edge.label, (fromx - tox) / 2.0 + (tox - (fromx - tox) / placementRatio), (toy - fromy) / 2.0 + (fromy + (toy - fromy) / placementRatio));
            } else {
                this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue("--navbarBackground");
                this.ctx.fillRect((tox - fromx) / 2.0 + (fromx + (tox - fromx) / placementRatio) - 20.0, (fromy - toy) / 2.0 + (toy - (fromy - toy) / placementRatio) - 20.0, 40, 40);
                this.ctx.fillStyle = getComputedStyle(this.canvas).getPropertyValue((color === "--white" ? "--navbarBackground" : "--white"));
                this.ctx.font = " bold 1em system-ui";
                this.ctx.fillText(edge.label, (tox - fromx) / 2.0 + (fromx + (tox - fromx) / placementRatio), (fromy - toy) / 2.0 + (toy - (fromy - toy) / placementRatio));
            }
        }
    }

    //---------------------------------------

    colorVertex(vertex, color, resetAll = false, resetFilter = null){
        if(resetAll){
            if(resetFilter !== null){
                this.vertices.filter((vertex) => resetFilter(vertex)).forEach((vertex) => vertex.color = Vertex.mainColor)
            } else {
                this.vertices.forEach((vertex) => vertex.color = Vertex.mainColor)
            }
        }
        if(vertex !== null){
            this.vertices.find(v => v.represents === vertex).color = color;
        }
        this.draw();
    }

    labelVertex(vertex, text){
        this.vertices.find(v => v.represents === vertex).label = text;
        this.draw();
    }

    colorEdge(edge, color, resetAll = false, resetFilter = null){
        if(resetAll){
            if(resetFilter !== null){
                this.edges.forEach(row => row.filter((vertex) => resetFilter(vertex)).forEach((edge) => edge.color = Edge.mainColor))
            } else {
                this.edges.forEach(row => row.forEach((edge) => edge.color = Edge.mainColor))
            }
        }
        if(edge !== null){
        let represents
        for(let i = 0; i < this.edges.length; i++)
            for(let j = 0; j < this.edges[i].length; j++)
                if(this.edges[i][j].represents === edge){
                    represents = this.edges[i][j];
                    break;
                }
        represents.color = color;
        }
        this.draw();
    }

    labelEdge(edge, text){
        let represents
        for(let i = 0; i < this.edges.length; i++)
            for(let j = 0; j < this.edges[i].length; j++)
                if(this.edges[i][j].represents === edge){
                    represents = this.edges[i][j];
                    break;
                }
        represents.label = text;
        this.draw();
    }
}