/**
 * Read tasks.
 */
readTasks("tasks.json");

function evalQueueState(state){
    const structogram = state();
    structogramHighlight(structogram);
}

let animationController = new AnimationControllerLambda(() => {
    graphDrawer.setCanvas(canvas);
    reset();
    graphDrawer.draw();
    createTaskTable();
    structogramHighlight();
}, evalQueueState)

steppable(animationController);

/**
 * Variables.
 */
let canvas;
let queue = [];
let taskTable;
let taskTableNeededRows = 0;

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    taskTable = document.querySelector("#taskTable2 > tbody");
    squares = document.querySelector("#squares2");
    canvas = squares.children[0];
} else {
    taskTable = document.querySelector("#taskTable > tbody");
    squares = document.querySelector("#squares");
    canvas = squares.children[0];
}

const vertices = [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }, { text: "e" }, { text: "f" }];
const edges = [
    [null, null, null, null, null, null],
    [{weight: 0}, null, null, null, null, null],
    [null, {weight: 1}, null, null, null, null],
    [{weight: 2}, null, null, null, null, null],
    [{weight: 2}, {weight: 1}, null, {weight: 0}, null, null],
    [null, {weight: 2}, {weight: 3}, null, {weight: 2}, null]
];
const graph = new Graph(vertices, edges, false)
const start = vertices[3];

const positions = [
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50]
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true);


document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { Prim(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { Prim(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([ { description: "minimális feszítőfa csúcsa / éle", color: "var(--animationColor1)" }, { description: "minimális feszítőfához legutóbb hozzávett csúcs: $u$", color: "var(--animationColor2)" }, { description: "$u$ csúcsból $c(v)$-nél kisebb költségű $e$ éllel közvetlenül elérhető, a sorban szereplő (feszítőfához még hozzá nem vett) $v$ csúcs és az $e$ él", color: "var(--animationColor3)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
Prim(graph, start);


/**
 * Restart animation, when someone change the size of the window.
 * This is needed because if you change the size of the window, the animation slips.
 */
window.addEventListener('resize', () => {
    // prevent animation restart when window height changes on a mobil phone or a table
    let currentWindowWidth = document.documentElement.clientWidth;
    if (currentWindowWidth !== prevWindowWidth) {
        prevWindowWidth = currentWindowWidth;
        // on small devices #square2 is used for animation, otherwise #squares
        if (currentWindowWidth < 768) {
            squares = document.querySelector("#squares2");
            canvas = squares.children[0];
        } else {
            squares = document.querySelector("#squares");
            canvas = squares.children[0];
        }
        animationController.reset();

        // restart animation
        if (!isAnimationRunning) {
            Prim(graph, start);
        }
        startNewAnimation = true;
    }
});

function reset() {
    graphDrawer.reset();
}

function remMin(q, comp){
    let minIdx = 0;
    for(let i = 1; i < q.length; i++){
        if(comp(q[i], q[minIdx])){
            minIdx = i;
        }
    }
    const element = q[minIdx];
    q.splice(minIdx, 1);
    return element; 
}

function tableValue(value){
    switch(value){
        case Number.MAX_VALUE: return "\\infty";
        case null: return "\\emptyset";
        default: return value;
    }
}

function setTableVertexRow(vertexText, label, value, n){
    const selector = `#row${n === null ? "" : n}${label}${vertexText}`
    const cell = document.querySelector(selector)
    cell.innerText = `\$${tableValue(value)}\$`;
    MathJax.typeset();
}

function setTableQueueRow(vertexText, n){
    const cell = document.querySelector(`#queue${n}`)
    cell.innerText = `\$${vertexText}\$`;
    MathJax.typeset();
}

function setTableResultRow(vertices){
    vertices.forEach((vertex) => {
        const [cellC, cellP] = [document.querySelector(`#summaryRowC${vertex.text}`),document.querySelector(`#summaryRowP${vertex.text}`)];
        cellC.innerText = `\$${tableValue(vertex.c)}\$`;
        cellP.innerText = `\$${tableValue(vertex.p === null ? null : vertex.p.text)}\$`;
    })
    MathJax.typeset();
}

function createTaskTable() {
    taskTable.innerHTML = "";

    const headers = [
        {text: "$c$ értékek $Q$-ban", colspan: graph.vertices.length},
        {text: "minimális feszítő- fába", rowspan: 3}, 
        {text: "$p$ címkék változásai", colspan: graph.vertices.length}
    ]
    let queueId = 0;
    let extendedId = 0;

    //headers
    let tr = document.createElement("tr");
    for (let i = 0; i < headers.length; i++) {
        let td = document.createElement("td");
        td.innerText = headers[i].text;
        td.colSpan = headers[i].colspan ?? 1;
        td.rowSpan = headers[i].rowspan ?? 1;
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    //vertex texts
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2; i++) {
        let td = document.createElement("td");
        td.innerText = `${graph.vertices[i % graph.vertices.length].text}`;
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    //init
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2; i++) {
        let td = document.createElement("td");
        if (graph.vertices.length < i+1) {
            td.id = "rowp" + graph.vertices[i % graph.vertices.length].text;
        } else {
            td.id = "rowc" + graph.vertices[i % graph.vertices.length].text;
        }
        td.innerText = "$ $"
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    //task
    for (let i = 0; i < taskTableNeededRows; i++) {
        tr = document.createElement("tr");
        for (let j = 0; j < graph.vertices.length * 2 + 1; j++) {
            let td = document.createElement("td");
            if (graph.vertices.length === j) {
                td.id = "queue" + queueId++;
            } else if (graph.vertices.length < j + 1) {
                td.id = "row" + i + "p" + graph.vertices[(j-1)% graph.vertices.length].text;
            } else {
                td.id = "row" + i + "c" + graph.vertices[j % graph.vertices.length].text;
            }
            td.innerText = "$ $"
            tr.appendChild(td);
        }
        taskTable.appendChild(tr);
    }

    //summary
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2 + 1; i++) {
        let td = document.createElement("td");
        if (graph.vertices.length === i) {
            td.innerText = "eredmény";
        } else if (graph.vertices.length < i) {
            td.id = "summaryRowP" + graph.vertices[(i - 1) % graph.vertices.length].text;
        } else {
            td.id = "summaryRowC" + graph.vertices[i % graph.vertices.length].text;
        }
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);
    MathJax.typeset();
}



function Prim(graph, r){
    let rowCount = 0;
    queue = [];
    taskTableNeededRows = graph.vertices.length;
    
    graph.vertices.forEach((v) => {
        queue.push(() => 152);

        queue.push(() => {setTableVertexRow(v.text, "c", Number.MAX_VALUE, null); return 153});
        v.c = Number.MAX_VALUE;

        queue.push(() => {setTableVertexRow(v.text, "p", null, null); return 154});
        v.p = null;

    })

    queue.push(() => {setTableVertexRow(r.text, "c", 0, null); return 155});
    r.c = 0;

    queue.push(() => 156);
    const q = graph.vertices.filter(v => v !== r);

    queue.push(() => {graphDrawer.colorVertex(r, "--animationColor2"), setTableQueueRow(r.text, 0); return 157});
    let u = r;
    let finishedEdges = [];
    while(q.length > 0){
        queue.push(() => 158);
        let currentRow = rowCount;
        const edges = graph.getEdge(u, true).filter((edge) => q.includes(edge.to) && edge.to.c > edge.weight);
        edges.forEach((edge) => {
            let v = edge.to;
            let edgeCp = edge;
            queue.push(() => {graphDrawer.colorVertex(v, "--animationColor3"); graphDrawer.colorEdge(edge, "--animationColor3"); return 159});
            
            v.p = u;
            v.c = edge.weight;

            let vCp = cp(v);
            queue.push(() => {setTableVertexRow(vCp.text, "p", vCp.p.text, currentRow); return 160});
            queue.push(() => {setTableVertexRow(vCp.text, "c", vCp.c, currentRow); return 161});
            queue.push(() => {setTableVertexRow(vCp.text, "c", vCp.c, currentRow); return 162});
        })
        let qCp = cp(q);
        queue.push(() => {
            qCp.forEach((v) => {
                setTableVertexRow(v.text, "c", v.c, currentRow)
            })
        })
        
        let prevU = u
        rowCount++;
        u = remMin(q, (e1, e2) => e1.c < e2.c)
        let uCp = u;
        finishedEdges.push(graph.getEdge(uCp, true).find((e) => e.to === uCp.p))
        let finishedVertices = graph.vertices.filter((v) => q.find(qd => qd === v) === undefined)
        let finishedEdgesCp = finishedEdges.map(e => e);    
        let uText = u.text;
        queue.push(() => {graphDrawer.colorEdge(null, null, true); finishedEdgesCp.forEach((e) => graphDrawer.colorEdge(e, "--animationColor1")); graphDrawer.colorVertex(null, null, true); finishedVertices.forEach((v) => graphDrawer.colorVertex(v, "--animationColor1")); graphDrawer.colorVertex(uCp, "--animationColor2"), setTableQueueRow(uText, currentRow+1); return 163});
    }
    let finishedVertices = graph.vertices.filter((v) => q.find(qd => qd === v) === undefined)
    queue.push(() => {graphDrawer.colorEdge(null, null, true); finishedEdges.forEach((e) => graphDrawer.colorEdge(e, "--animationColor1")); finishedVertices.forEach((v) => graphDrawer.colorVertex(v, "--animationColor1")); setTableResultRow(graph.vertices)});
    createTaskTable();
    animationController.setQueue(queue);
    primAnimation(queue);
}

async function primAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            Prim(graph, start);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();

    isAnimationRunning = false;
}