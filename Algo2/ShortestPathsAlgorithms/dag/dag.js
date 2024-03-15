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
    createTaskTableAndQueue();
    structogramHighlight();
}, evalQueueState)

steppable(animationController);

/**
 * Variables.
 */
let canvas;
let queue = [];
let taskTable;
let taskQueue;
let taskTableNeededRows = 0;

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    taskTable = document.querySelector("#taskTable2 > tbody");
    taskQueue = document.querySelector("#taskQueue2");
    squares = document.querySelector("#squares2");
    canvas = squares.children[0];
} else {
    taskTable = document.querySelector("#taskTable > tbody");
    taskQueue = document.querySelector("#taskQueue");
    squares = document.querySelector("#squares");
    canvas = squares.children[0];
}

const vertices = [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }, { text: "e" }, { text: "f" }];
const edges = [
    [null, {weight: 1}, null, {weight: 3}, {weight: 3}, null],
    [null, null, null, null, {weight: 1}, {weight: 3}],
    [null, {weight: 1}, null, null, null, {weight: 3}],
    [null, null, null, null, null, null],
    [null, null, null, {weight: 0}, null, {weight: 2}],
    [null, null, null, null, null, null]
];
const graph = new Graph(vertices, edges, true)
const start = vertices[0];

const positions = [
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50]
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true);


document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { DAGshortestPaths(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { DAGshortestPaths(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([ { description: "legrövidebb úttal már rendelkező csúcs", color: "var(--animationColor1)" }, { description: "kiterjesztett csúcs", color: "var(--animationColor2)" }, { description: "kiterjesztett csúcs szomszédos, start csúcsból új legrövidebb úton elérhető csúcsa", color: "var(--animationColor3)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
DAGshortestPaths(graph, start);


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
            taskTable = document.querySelector("#taskTable2 > tbody");
            taskQueue = document.querySelector("#taskQueue2");
            squares = document.querySelector("#squares2");
            canvas = squares.children[0];
        } else {
            taskTable = document.querySelector("#taskTable > tbody");
            taskQueue = document.querySelector("#taskQueue");
            squares = document.querySelector("#squares");
            canvas = squares.children[0];
        }
        animationController.reset();
        // restart animation
        if (!isAnimationRunning) {
            DAGshortestPaths(graph, start);
        }
        startNewAnimation = true;
    }
});

function reset() {
    graphDrawer.reset();
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
    const cell = taskTable.querySelector(selector)
    cell.innerText = `\$${tableValue(value)}\$`;
    MathJax.typeset();
}

function setTableQueueRow(vertexText, vertexD, n){
    const cell = taskTable.querySelector(`#queue${n}`)
    cell.innerText = `\$\\text{${vertexText} : }${tableValue(vertexD)}\$`;
    MathJax.typeset();
}

function setTableResultRow(vertices){
    vertices.forEach((vertex) => {
        const [cellD, cellPi] = [taskTable.querySelector(`#summaryRowD${vertex.text}`),taskTable.querySelector(`#summaryRowPi${vertex.text}`)];
        cellD.innerText = `\$${tableValue(vertex.d)}\$`;
        cellPi.innerText = `\$${tableValue(vertex.pi === null ? null : vertex.pi.text)}\$`;
    })
    MathJax.typeset();
}

function renderTaskQueueP(S, q){
    let html = `<p>${S} = &lt`;
    for(let i = q.length-1; i >= 0; i--){
        html += ((i === q.length-1 ? "" : ", ") + q[i])
    }
    html += "&gt</p>"
    taskQueue.innerHTML = html;    
}

function createTaskTableAndQueue() {

    renderTaskQueueP("S", []);

    taskTable.innerHTML = "";

    const headers = [
        {text: "$d$ értékek változásai", colspan: graph.vertices.length},
        {text: "kiterjesztett csúcs: $d$", rowspan: 3}, 
        {text: "$\\pi$ címkék változásai", colspan: graph.vertices.length}
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
        td.innerText = `$${graph.vertices[i % graph.vertices.length].text}$`;
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    //init
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2; i++) {
        let td = document.createElement("td");
        if (graph.vertices.length < i+1) {
            td.id = "rowpi" + graph.vertices[i % graph.vertices.length].text;
        } else {
            td.id = "rowd" + graph.vertices[i % graph.vertices.length].text;
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
                td.id = "row" + i + "pi" + graph.vertices[(j-1)% graph.vertices.length].text;
            } else {
                td.id = "row" + i + "d" + graph.vertices[j % graph.vertices.length].text;
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
            td.id = "summaryRowPi" + graph.vertices[(i - 1) % graph.vertices.length].text;
        } else {
            td.id = "summaryRowD" + graph.vertices[i % graph.vertices.length].text;
        }
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);
    MathJax.typeset();
}

function DAGshortestPaths(G, s) {
    queue = [];
    taskTableNeededRows = 0;

    queue.push(() => 295)
    let S = [];

    queue.push(() => 296)
    queue.push(() => 297)
    let dcg = null;

    queue.push(() => 298)
    topologicalSort(G, s, dcg, S);

    queue.push(() => 299)
    if(dcg === null){
        queue.push(() => 300)
        DAGshPs(G, S);
    }
    createTaskTableAndQueue();
    queue.push(() => 302)
    animationController.setQueue(queue);
    DAGshPsAnimation(queue);
    return dcg;
}

function topologicalSort(G, s, dcg, S) {
    G.vertices.forEach(u => {
        queue.push(() => 334)

        let uCp = u;
        queue.push(() => {graphDrawer.colorVertex(uCp, "--white"); return 335;})
        u.color = "white";

        queue.push(() => 336)
        u.pi = null;
    })
    queue.push(() => 338)
    DFvisit(G, s, dcg, S);
    queue.push(() => graphDrawer.colorVertex(null, null, true))
}

function DFvisit(G, u, dcg, S) {
    let uCp = u;
    queue.push(() => {graphDrawer.colorVertex(uCp, "--animationColor3"); return 43;})
    u.color = "grey";

    G.getEdge(u, true).map(edge => edge.to).forEach(v => {
        if(dcg !== null){
            return false;
        }
        queue.push(() => 44);

        let [vCp, uText] = [v, u.text]
        queue.push(() => 45);
        if(v.color === "white"){
            queue.push(() => {graphDrawer.labelVertex(vCp, `π: ${uText}`); return 46;});
            v.pi = u;
            
            queue.push(() => 48)
            DFvisit(G, v, dcg, S);
        } else {
            queue.push(() => 47)
            if(v.color === "grey"){
                queue.push(() => {graphDrawer.labelVertex(vCp, `π: ${uText}`); 49})
                v.pi = u;
                dcg = v;
            } else {
                queue.push(() => 50)
            }
        }
    })
    u.color = "black";
    queue.push(() => {graphDrawer.colorVertex(uCp2, "black"); return 52;})
    S.push(u);
    let uCp2 = u
    let currentS = S.map((v) => v.text)
    queue.push(() => {renderTaskQueueP("S", currentS); return 53})
}

function DAGshPs(G, S) {
    G.vertices.forEach(v => {
        queue.push(() => 360)
        let [vText, vCp] = [v.text, v]

        queue.push(() => {setTableVertexRow(vText, "d", Number.MAX_VALUE, null); return 361;})
        v.d = Number.MAX_VALUE;
        
        queue.push(() => {setTableVertexRow(vText, "pi", null, null); graphDrawer.labelVertex(vCp, "");  return 362;})
        v.pi = null;
    })

    queue.push(() => 363)
    let s = S.pop();

    queue.push(() => {setTableVertexRow(s.text, "d", 0, null); return 364;})
    s.d = 0;
    
    queue.push(() => 365)
    let u = s;
    let finishedVertices = []
    while(S.length > 0){
        let [uCp, uText, uD, currentRow] = [u, u.text, u.d, taskTableNeededRows];
        queue.push(() => {setTableQueueRow(uText, uD, currentRow), graphDrawer.colorVertex(uCp, "--animationColor2")})
        
        G.getEdge(u, true).filter(edge => edge.to.d > edge.from.d + edge.weight).forEach((edge) => {
            let v = edge.to
            let edgeCp = edge;
            queue.push(() => {graphDrawer.colorVertex(v, "--animationColor3"); graphDrawer.colorEdge(edgeCp, "--animationColor3"); return 367})
            let [uText, currentRow] = [u.text, taskTableNeededRows];
            queue.push(() => {setTableVertexRow(v.text, "pi", uText, currentRow); return 368;})
            v.pi = u;
            
            let dValue = u.d + edge.weight;
            queue.push(() => {setTableVertexRow(v.text, "d", dValue, currentRow); return 369;})
            v.d = dValue
        })
        finishedVertices.push(u);
        taskTableNeededRows++;
        u = S.pop();
        let finishedVerticesCp = finishedVertices.map(v => v);
        let finishedEdges = finishedVertices.map(v => graph.getEdge(v, false).find(edge => edge.from === v.pi)).filter(e => e !== undefined);
        queue.push(() => {graphDrawer.colorVertex(null, null, true); finishedVerticesCp.forEach(v => graphDrawer.colorVertex(v, "--animationColor1")); graphDrawer.colorEdge(null, null, true); finishedEdges.forEach(e => graphDrawer.colorEdge(e, "--animationColor1")); return 366;})
    }
    finishedVertices.push(u);
    let finishedVerticesCp = finishedVertices.map(v => v);
    let finishedEdges = finishedVertices.map(v => graph.getEdge(v, false).find(edge => edge.from === v.pi)).filter(e => e !== undefined);
    queue.push(() => {graphDrawer.colorVertex(null, null, true); finishedVerticesCp.forEach(v => graphDrawer.colorVertex(v, "--animationColor1")); graphDrawer.colorEdge(null, null, true); finishedEdges.forEach(e => graphDrawer.colorEdge(e, "--animationColor1")); setTableResultRow(graph.vertices); return 366;})
}

async function DAGshPsAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()){
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            DAGshortestPaths(graph, vertices[0]);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();
    isAnimationRunning = false;
}