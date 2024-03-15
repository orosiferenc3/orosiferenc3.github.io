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
    graphDrawer.reset();
    graphDrawer.draw();
    structogramHighlight();
    createTaskTable();
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
    [{weight: 1}, null, null, null, null, null],
    [null, null, null, null, null, null],
    [{weight: 3}, null, null, null, null, null],
    [{weight: 3}, {weight: 1}, null, {weight: 0}, null, null],
    [null, {weight: 3}, null, null, {weight: 2}, null]
];
const graph = new Graph(vertices, edges, false)

const positions = [
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50]
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true);


document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { Dijkstra(graph, vertices[0]); } startNewAnimation = true; flag = true; graphDrawer.reset();; graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { Dijkstra(graph, vertices[0]); } startNewAnimation = true; flag = true; graphDrawer.reset();; graphDrawer.draw(); });
createLegend([ { description: "feldolgozott csúcs", color: "var(--animationColor1)" }, { description: "kiterjesztett csúcs", color: "var(--animationColor2)" }, { description: "kiterjesztett csúcs szomszédos, start csúcsból új legrövidebb úton elérhető csúcsa", color: "var(--animationColor3)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
Dijkstra(graph, vertices[0]);


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
            Dijkstra(graph, vertices[0]);
        }
        startNewAnimation = true;
    }
});


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

function createTaskTable() {
    taskTable.innerHTML = "";

    const headers = [
        {text: "$\\text{nyílt csúcsok } d \\text{ értékei}$", colspan: graph.vertices.length},
        {text: "$\\text{kiterjesztett csúcs: } d$", rowspan: 3}, 
        {text: "$\\pi \\text{ címkék változásai}$", colspan: graph.vertices.length}
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
            td.innerText = "\$\\text{eredmény}\$";
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



function Dijkstra(graph, s){
    let rowCount = 0;
    queue = [];
    taskTableNeededRows = 0;
    graphDrawer.colorVertex(null, null, true);
    graphDrawer.colorEdge(null, null, true);
    graph.vertices.forEach((v) => {
        queue.push(() => 260);
        v.d = Number.MAX_VALUE;
        v.pi = null;
        queue.push(() => {setTableVertexRow(v.text, "d", Number.MAX_VALUE, null); return 261});
        queue.push(() => {setTableVertexRow(v.text, "pi", null, null); ; return 262});
    })

    queue.push(() => {setTableVertexRow(s.text, "d", 0, null); ; return 263});
    s.d = 0;

    queue.push(() => 264);
    const q = graph.vertices.filter(v => v !== s);

    let u = s;
    queue.push(() => 265);

    while(u.d < Number.MAX_VALUE && q.length > 0){
        queue.push(() => 266);
        const edges = graph.getEdge(u, true).filter((edge) => edge.to.d > edge.from.d + edge.weight);
        const currentRow = rowCount
        let [uText, uD, vertex, finishedVertices] = [u.text, u.d, u, graph.vertices.filter((v) => q.find(qd => qd === v) === undefined)];
        queue.push(() => {setTableQueueRow(uText, uD, currentRow); graphDrawer.colorVertex(vertex, "--animationColor2");});
        edges.forEach((edge) => {   
            const v = edge.to;
            let [vText, vD, vertex, edgeCp] = [v.text, cp(u.d + edge.weight), v, edge];
            queue.push(() => {graphDrawer.colorVertex(vertex, "--animationColor3"); graphDrawer.colorEdge(edgeCp, "--animationColor3"); return 267});
            queue.push(() => {setTableVertexRow(vText, "pi", uText, currentRow); return 268; })
            v.pi = u;

            queue.push(() => {setTableVertexRow(vText, "d", vD, currentRow); return 269; })
            v.d = u.d + edge.weight;

            queue.push(() => 270);
        })
        const qCp = cp(q);
        queue.push(() => {
            qCp.forEach((vertex) => {
                const [vText, vD] = [vertex.text, vertex.d]
                setTableVertexRow(vText, "d", vD, currentRow)
                graphDrawer.colorVertex(null, null, true)
                finishedVertices.forEach((v) => graphDrawer.colorVertex(v, "--animationColor1"))
                graphDrawer.colorEdge(null, null, true)
            })
        })
        rowCount++;
        taskTableNeededRows++;
        u = remMin(q, (e1, e2) => e1.d < e2.d)
        queue.push(() => 271);
    }
    queue.push(() => {graphDrawer.colorEdge(null, null, true); setTableResultRow(graph.vertices)})
    createTaskTable();

    animationController.setQueue(queue);
    dijkstraAnimation();
}

async function dijkstraAnimation() {
    isAnimationRunning = true;

    while (!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            Dijkstra(graph, vertices[0]);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }

    isAnimationRunning = false;
}