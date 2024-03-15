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

const vertices = [{text: "a"}, {text: "b"}, {text: "c"}, {text: "d"}];
const edges = [
    [null, {weight: 3}, {weight: 1}, null],
    [null, null, null, {weight: -2}],
    [null, {weight: -1}, null, null],
    [null, null, {weight: 3}, null],
];
const graph = new Graph(vertices, edges, true)
const start = vertices[0];

const positions = [
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 260.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 260.0]
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true);


document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { QueueBasedBellmanFord(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { QueueBasedBellmanFord(graph, start); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ description: "kiterjesztett csúcs", color: "var(--animationColor1)" }, { description: "kiterjesztett csúcs szomszédos, start csúcsból új legrövidebb úton elérhető csúcsa", color: "var(--animationColor2)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
QueueBasedBellmanFord(graph, start);


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
            squares = document.querySelector("#squares2");
            canvas = squares.children[0];
        } else {
            taskTable = document.querySelector("#taskTable > tbody");
            squares = document.querySelector("#squares");
            canvas = squares.children[0];
        }
        animationController.reset();
        // restart animation
        if (!isAnimationRunning) {
            QueueBasedBellmanFord(graph, start);
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

function setTableVertexRow(vertexText, label, value, n, e = null){
    const selector = `#row${n === null ? "" : n}${label}${vertexText}`
    const cell = taskTable.querySelector(selector)
    cell.innerText = `\$${tableValue(value) + (e === null ? "" : `; ${e}`)}\$`;
    MathJax.typeset();
}

function setTableQueueRow(queue, n, finished = true){
    const selector = `#queue${n === null ? "" : n}`
    const cell = taskTable.querySelector(selector)
    let text = "$\\langle ";
    for(let i = 0; i < queue.length; i++){
        text += ((i === 0 ? "" : ", ") + queue[i].text);
    }
    cell.innerText = text + (finished ? " \\rangle$" : "$")
    MathJax.typeset();
}

function setTableExtendedRow(vertexText, vertexD, e, n){
    const cell = taskTable.querySelector(`#extended${n}`)
    cell.innerText = `\$${vertexText} : ${vertexD}; ${e}\$`
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

function createTaskTable() {
    taskTable.innerHTML = "";
    
    const headers = {
        0: { "text": "$d; e$ változásai", "colspan": graph.vertices.length, "rowspan": 1 }, 1: { "text": "kiterjesztett csúcs: $d; e$", "colspan": 1, "rowspan": 3 },
        2: { "text": "$Q$: Queue", "colspan": 1, "rowspan": 2 }, 3: { "text": "$\\pi$ változásai", "colspan": graph.vertices.length, "rowspan": 1 }
    };

    // headers
    let tr = document.createElement("tr");
    for (let i = 0; i < Object.keys(headers).length; i++) {
        let td = document.createElement("td");
        td.innerText = headers[i].text;
        td.colSpan = headers[i].colspan;
        td.rowSpan = headers[i].rowspan;
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    // numbers' row
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2; i++) {
        let td = document.createElement("td");
        td.innerText = graph.vertices[i % graph.vertices.length].text;
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    // initialization
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2 + 1; i++) {
        let td = document.createElement("td");
        if (graph.vertices.length === i) {
            td.id = "queue";
        } else if (graph.vertices.length < i) {
            td.id = "rowPi" + graph.vertices[(i - 1) % graph.vertices.length].text;
        } else {
            td.id = "rowD" + graph.vertices[i % graph.vertices.length].text;
        }
        td.innerText = "$ $"
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    // needed rows for doing task
    for (let i = 0; i < taskTableNeededRows; i++) {
        tr = document.createElement("tr");
        for (let j = 0; j < graph.vertices.length * 2 + 2; j++) {
            let td = document.createElement("td");
            if (graph.vertices.length === j) {
                td.id = "extended" + i
            } else if ((graph.vertices.length + 1) === j) {
                td.id = "queue" + i
            } else if (graph.vertices.length < j) {
                td.id = "row" + i + "Pi" + graph.vertices[(j - 2) % graph.vertices.length].text;
            } else {
                td.id = "row" + i + "D" + graph.vertices[j % graph.vertices.length].text;
            }
            td.innerText = "$ $"
            tr.appendChild(td);
        }
        taskTable.appendChild(tr);
    }

    // summary row
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2 + 1; i++) {
        let td = document.createElement("td");
        if (graph.vertices.length === i) {
            td.innerText = "végső $d$ és $\\pi$ értékek";
            td.colSpan = 2;
            td.rowSpan = 1;
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

function QueueBasedBellmanFord(G, s){
    queue = [];
    taskTableNeededRows = 0;

    G.vertices.forEach(u => {
        queue.push(() => 457)

        let uText = u.text;

        queue.push(() => {setTableVertexRow(uText, "D", Number.MAX_VALUE, null); return 458})
        u.d = Number.MAX_VALUE;

        queue.push(() => {setTableVertexRow(uText, "Pi", null, null); return 459})
        u.pi = null;

        queue.push(() => {return 460})
        u.inQ = false;
    })

    queue.push(() => {setTableVertexRow(s.text, "D", 0, null, 0); return 461;})
    s.d = 0;
    s.e = 0;

    queue.push(() => 462)
    let q = [];

    q.push(s);
    let qCp = q.map(v => v)
    queue.push(() => {setTableQueueRow(qCp, null); return 463;})

    queue.push(() => 464)
    s.inQ = true;

    while(q.length > 0){
        queue.push(() => 465)   

        let u = q.shift();
        let [qCpBegin, currentRow, uText, uD, e, uCp] = [q.map(v => v), taskTableNeededRows, u.text, u.d, u.e, u];
        queue.push(() => {graphDrawer.colorVertex(uCp, "--animationColor1", true); graphDrawer.colorEdge(null, null, true); setTableExtendedRow(uText, uD, e, currentRow); setTableQueueRow(qCpBegin, currentRow, false); return 466;});

        queue.push(() => 467)
        u.inQ = false;
        G.getEdge(u, true).filter(edge => edge.to.d > edge.from.d + edge.weight).forEach(edge => {
            let v = edge.to;
            let [vCp, edgeCp] = [v, edge];
            queue.push(() => {graphDrawer.colorVertex(vCp, "--animationColor2"); graphDrawer.colorEdge(edgeCp, "--animationColor2"); return 468})

            let [vText, dValue, currentRow, uText, uE] = [v.text, u.d + edge.weight, taskTableNeededRows, u.text, u.e];
            queue.push(() => {setTableVertexRow(vText, "D", dValue, currentRow, uE+1); return 469;})
            v.d = dValue;
            v.e = u.e + 1;

            queue.push(() => {setTableVertexRow(vText, "Pi", uText, currentRow); return 470;})
            v.pi = u;


            queue.push(() => 471)
            if(!v.inQ){
                q.push(v);
                let qCpMid = q.map(v => v);
                queue.push(() => {setTableQueueRow(qCpMid, currentRow, false); return 472;})
                queue.push(() => 474);
                v.inQ = true;
            } else {
                queue.push(() => 473);
            }
        })
        let qCpEnd = q.map(v => v);
        queue.push(() => {setTableQueueRow(qCpEnd, currentRow);})
        taskTableNeededRows++;
    }
    const finalVertices = G.vertices.filter(v => v.pi !== undefined); finalVertices.push(s);
    const finalEdges = finalVertices.filter(v => v !== s).map(v => G.getEdge(v, false).filter(edge => edge.from === v.pi)[0]);
    queue.push(() => {graphDrawer.colorEdge(null, null, true), graphDrawer.colorVertex(null, null, true); finalVertices.forEach(v => graphDrawer.colorVertex(v, "--animationColor3")); finalEdges.forEach(e => graphDrawer.colorEdge(e, "--animationColor3")); setTableResultRow(G.vertices)})
    createTaskTable();
    animationController.setQueue(queue);
    QBFAnimation(queue);
}

async function QBFAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            QueueBasedBellmanFord(graph, vertices[0]);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();

    isAnimationRunning = false;
}