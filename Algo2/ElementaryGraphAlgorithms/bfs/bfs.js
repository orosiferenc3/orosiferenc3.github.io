/**
 * Read tasks.
 */
readTasks("tasks.json");

function evalQueueState(x){
    eval(x.code);

    if (!x.hasOwnProperty("animation") && !x.hasOwnProperty("tableAnimation")) {
        return;
    }

    switch (x.tableAnimation) {
        case 0:
            document.querySelector("#queue0").innerText = "$<" + startNode + ">$";
            MathJax.typeset();
            break;
        case 1:
            document.querySelector("#initRowD" + node).innerText = "$\\infty$";
            MathJax.typeset();
            break;
        case 2:
            document.querySelector("#initRowPi" + node).innerText = "$\\emptyset$";
            MathJax.typeset();
            break;
        case 3:
            document.querySelector("#initRowD" + startNode).innerText = "$0$";
            MathJax.typeset();
            break;
        case 4:
            document.querySelector("#extended" + taskTableCurrentRow).innerText = "$" + u + ":" + dAndPi[u][0] + "$";
            MathJax.typeset();
            break;
        case 5:
            document.querySelector("#row" + taskTableCurrentRow + "D" + v).innerText = "$" + (dAndPi[u][0] + 1) + "$";
            MathJax.typeset();
            break;
        case 6:
            document.querySelector("#row" + taskTableCurrentRow + "Pi" + v).innerText = "$" + u + "$";
            MathJax.typeset();
            break;
        case 7:
            document.querySelector("#queue" + (taskTableCurrentRow + 1)).innerText = "$<" + q + ">$";
            MathJax.typeset();
            break;
        case 8:
            for (let i = 0; i < graph.vertices.length; i++) {
                document.querySelector("#summaryRowD" + graph.vertices[i].text).innerText = "$" + (dAndPi[graph.vertices[i].text][0] === Number.MAX_VALUE ? "\\infty" : dAndPi[graph.vertices[i].text][0]) + "$";
                MathJax.typeset();
                document.querySelector("#summaryRowPi" + graph.vertices[i].text).innerText = "$" + (dAndPi[graph.vertices[i].text][1] === null ? "\\emptyset" : dAndPi[graph.vertices[i].text][1]) + "$";
                MathJax.typeset();
            }
            break;
    }

    switch (x.animation) {
        case 4:
            graphDrawer.vertices.find(x => x.text === node).setColor("--white");
            graphDrawer.draw();
            structogramHighlight(4);
            break;
        case 6:
            graphDrawer.vertices.find(x => x.text === startNode).setColor("gray");
            graphDrawer.draw();
            structogramHighlight(6);
            break;
        case 11:
            graphDrawer.edges[index][j].color = "gray";
            graphDrawer.draw();
            structogramHighlight(11);
            break;
        case 16:
            graphDrawer.vertices.find(x => x.text === v).setColor("gray");
            graphDrawer.draw();
            structogramHighlight(16);
            break;
        case 18:
            graphDrawer.vertices.find(x => x.text === u).setColor("black");
            graphDrawer.draw();
            structogramHighlight(18);
            break;
        default:
            if (x.animation > 0 && x.animation < 19) {
                structogramHighlight(x.animation);
            }
            break;
    }
}

let animationController = new AnimationControllerEval(() => {
    graphDrawer.setCanvas(canvas);
    graphDrawer.reset();
    graphDrawer.draw();
    createTaskTable();
    structogramHighlight();
}, evalQueueState, ["animation", "tableAnimation"])

steppable(animationController);

/**
 * Variables.
 */
let taskTable;
let canvas;
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

const vertices = [{text: "a"}, {text: "b"}, {text: "c"}, {text: "d"}, {text: "e"}, {text: "f"}];
const edges = [
    [null, {weight: 1}, null, null, null, null],
    [null, null, {weight: 1}, null, {weight: 1}, null],
    [null, null, null, null, {weight: 1}, null],
    [{weight: 1}, null, null, null, null, null],
    [null, null, null, {weight: 1}, null, null],
    [null, null, {weight: 1}, null, {weight: 1}, null],
];
const graph = new Graph(vertices, edges, true)

const positions = [
    [(canvas) => (canvas.width / 6) * 0 + (canvas.width / 12), (canvas) => 150.0],
    [(canvas) => (canvas.width / 6) * 1.5 + (canvas.width / 12), (canvas) => 40.0],
    [(canvas) => (canvas.width / 6) * 1.5 + (canvas.width / 12), (canvas) => 260.0],
    [(canvas) => (canvas.width / 6) * 3.5 + (canvas.width / 12), (canvas) => 260.0],
    [(canvas) => (canvas.width / 6) * 3.5 + (canvas.width / 12), (canvas) => 40.0],
    [(canvas) => (canvas.width / 6) * 5 + (canvas.width / 12), (canvas) => 150.0]
]

const graphDrawer = new GraphDrawer(canvas, new Graph(vertices, edges, true), positions, false);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { breadthFirstSearch(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { breadthFirstSearch(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ "description": "még felfedezetlen csúcs", "color": "var(--white)" }, { "description": "feldolgozás alatt álló csúcs", "color": "gray" }, { "description": "feldolgozott csúcs", "color": "black" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
breadthFirstSearch(graph);


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
            breadthFirstSearch(graph);
        }
        startNewAnimation = true;
    }
});


function reset() {
    document.querySelector("#taskTable > tbody").innerHTML = "";
    document.querySelector("#taskTable2 > tbody").innerHTML = "";
    graphDrawer.reset();
}

function createTaskTable() {
    taskTable.innerHTML = "";
    
    const headers = {
        0: { "text": "$d$ változásai", "colspan": graph.vertices.length, "rowspan": 1 }, 1: { "text": "kiterjesztett csúcs", "colspan": 1, "rowspan": 3 },
        2: { "text": "Queue", "colspan": 1, "rowspan": 2 }, 3: { "text": "$\\pi$ változásai", "colspan": graph.vertices.length, "rowspan": 1 }
    };
    let queueId = 0;
    let extendedId = 0;

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
        td.innerText = "$ $";
        if (graph.vertices.length === i) {
            td.id = "queue" + queueId++;
        } else if (graph.vertices.length < i) {
            td.id = "initRowPi" + graph.vertices[(i - 1) % graph.vertices.length].text;
        } else {
            td.id = "initRowD" + graph.vertices[i % graph.vertices.length].text;
        }
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    // needed rows for doing task
    for (let i = 0; i < taskTableNeededRows; i++) {
        tr = document.createElement("tr");
        for (let j = 0; j < graph.vertices.length * 2 + 2; j++) {
            let td = document.createElement("td");
            td.innerText = "$ $";
            if (graph.vertices.length === j) {
                td.id = "extended" + extendedId++;
            } else if ((graph.vertices.length + 1) === j) {
                td.id = "queue" + queueId++;
            } else if (graph.vertices.length < j) {
                td.id = "row" + i + "Pi" + graph.vertices[(j - 2) % graph.vertices.length].text;
            } else {
                td.id = "row" + i + "D" + graph.vertices[j % graph.vertices.length].text;
            }
            tr.appendChild(td);
        }
        taskTable.appendChild(tr);
    }

    // summary row
    tr = document.createElement("tr");
    for (let i = 0; i < graph.vertices.length * 2 + 1; i++) {
        let td = document.createElement("td");
        td.innerText = "$ $";
        if (graph.vertices.length === i) {
            td.innerText = "$d$ és $\\pi$ végső értékei";
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

let startNode
let dAndPi
let node
let q
let u
let index
let j
let v
let taskTableCurrentRow

function breadthFirstSearch(graph) {
    const startNode = graph.vertices[0];
    let queue = [];
    taskTableNeededRows = 0;
    queue.push({ "code": "startNode = \"" + startNode.text + "\";" });
    queue.push({ "code": "dAndPi = {};" });

    for (const node of graph.vertices) {
        queue.push({ "code": "node = \"" + node.text + "\";" });
        queue.push({ "code": "", "animation": 1 });
        queue.push({ "code": "", "animation": 2, "tableAnimation": 1 });
        queue.push({ "code": "dAndPi[\"" + node.text + "\"] = [Number.MAX_VALUE, null];", "animation": 3, "tableAnimation": 2 });
        queue.push({ "code": "", "animation": 4 });
        queue.push({ "code": "delete node;" });
        
        node.d = Number.MAX_VALUE;
        node.pi = null;
    }

    queue.push({ "code": "dAndPi[startNode] = [0, null];", "animation": 5, "tableAnimation": 3 });
    startNode.d = 0;

    queue.push({ "code": "", "animation": 6 });
    queue.push({ "code": "q = [];", "animation": 7 });
    let q = [];

    queue.push({ "code": "q.push(startNode);", "animation": 8, "tableAnimation": 0 });

    q.push(startNode);
    queue.push({ "code": "taskTableCurrentRow = 0;" });
    while (q.length !== 0) {
        queue.push({ "code": "", "animation": 9 });
        queue.push({ "code": "u = q.shift();", "animation": 10, "tableAnimation": 4 });
        let u = q.shift();

        let index = graph.vertices.indexOf(graph.vertices.find(x => x === u));
        queue.push({ "code": "index = " + index + ";" });
        for (let j = 0; j < graph.edges[index].length; j++) {
            queue.push({ "code": "j = " + j + ";" });
            const edge = graph.edges[index][j]
            if (edge !== null) {
                let v = graph.vertices[j];
                queue.push({ "code": "v = \"" + v.text + "\";", "animation": 11 });

                queue.push({ "code": "", "animation": 12 });
                if (v.d === Number.MAX_VALUE) {
                    queue.push({ "code": "dAndPi[v] = [dAndPi[u][0] + 1, u];", "animation": 13, "tableAnimation": 5 });
                    queue.push({ "code": "", "animation": 15, "tableAnimation": 6 });
                    queue.push({ "code": "", "animation": 16 });
                    v.d = u.d + 1
                    v.pi = u;
    
                    queue.push({ "code": "q.push(v);", "animation": 17 });
                    q.push(v);
                } else {
                    queue.push({ "code": "", "animation": 14 });
                }
    
            }
        }

        queue.push({ "code": "", "animation": 18, "tableAnimation": 7 });

        taskTableNeededRows++;
        queue.push({ "code": "taskTableCurrentRow++;" });
    }

    queue.push({ "tableAnimation": 8 });

    createTaskTable();
    animationController.setQueue(queue);
    breadthFirstSearchAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function breadthFirstSearchAnimation(queue) {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            breadthFirstSearch(graph);
            return;
        }

        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();

    isAnimationRunning = false;
}