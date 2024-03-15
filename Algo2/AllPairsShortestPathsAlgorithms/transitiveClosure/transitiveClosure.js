/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let taskTable;
let canvas;
let Pis = [];

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

const vertices = [{text: "1"}, {text: "2"}, {text: "3"}, {text: "4"}];
const edges = [
    [{weight: null}, {weight: 1}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: 1}],
    [{weight: null}, {weight: 1}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: 1}, {weight: null}],
];
const graph = new Graph(vertices, edges, true)

const positions = [
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 260.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 260.0]
]

const graphDrawer = new GraphDrawer(canvas, graph, positions, false);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { graphTransitiveClosure(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { graphTransitiveClosure(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ "description": "egyik lehetséges út a két csúcs között", "color": "var(--animationColor1)" }, { "description": "nem találtunk utat a csúcsok között", "color": "var(--animationColor2)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
graphTransitiveClosure(graph);


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
        graphDrawer.setCanvas(canvas);
        reset();
        graphDrawer.draw();
        createTaskTable();

        // restart animation
        if (!isAnimationRunning) {
            graphTransitiveClosure(graph);
        }
        startNewAnimation = true;
    }
});


function reset() {
    document.querySelector("#taskTable2 > tbody").innerHTML = "";
    document.querySelector("#taskTable > tbody").innerHTML = "";
    graphDrawer.reset();
}


function createTaskTable() {
    taskTable.innerHTML = "";
    let ids = 0;
    for (let i = 0; i < graph.edges.length + 1; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < graph.edges.length + 1; j++) {
            let td = document.createElement("td");
            if (i === 0 && j === 0) {
                td.innerText = "$T^{(" + i + ")}$";
                td.setAttribute("id", "T");
            } else if (i === 0) {
                td.innerText = "$" + j + "$";
            } else if (j === 0) {
                td.innerText = "$" + i + "$";
            } else {
                td.setAttribute("id", "T" + ids++);
            }
            tr.appendChild(td);
        }
        taskTable.appendChild(tr);
    }
    MathJax.typeset();
}


function graphTransitiveClosure(graph) {
    let queue = [];
    let Pi = new Array(graph.edges.length).fill().map(() => Array(graph.edges.length).fill());

    queue.push({ "code": "var T = new Array(graph.edges.length).fill().map(x => x = []);" });
    let T = new Array(graph.edges.length).fill().map(x => x = []);
    for (let i = 0; i < graph.edges.length; i++) {
        queue.push({ "code": "var i = " + i + ";", "animation": 1 });
        for (let j = 0; j < graph.edges.length; j++) {
            queue.push({ "code": "var j = " + j + ";", "animation": 2 });
            T[i][j] = graph.edges[i][j].weight === null ? 0 : graph.edges[i][j].weight;
            if (T[i][j] !== 0) {
                Pi[i][j] = i + 1;
            } else {
                Pi[i][j] = 0;
            }
            queue.push({ "code": "T[i][j] = graph.edges[i][j].weight === null ? 0 : graph.edges[i][j].weight;", "animation": 3 });
            queue.push({ "code": "delete j;" });
        }
        T[i][i] = 1;
        Pi[i][i] = i + 1;
        queue.push({ "code": "T[i][i] = 1;", "animation": 4 });
        queue.push({ "code": "delete i;" });
    }

    for (let k = 0; k < graph.edges.length; k++) {
        queue.push({ "code": "var k = " + k + ";", "animation": 5 });
        for (let i = 0; i < graph.edges.length; i++) {
            queue.push({ "code": "var i = " + i + ";", "animation": 6 });
            for (let j = 0; j < graph.edges.length; j++) {
                queue.push({ "code": "var j = " + j + ";", "animation": 7 });
                let prev = T[i][j];
                T[i][j] = T[i][j] | (T[i][k] & T[k][j]);
                if (prev === 0 && T[i][j] === 1 && i !== j) {
                    Pi[i][j] = Pi[k][j];
                }
                queue.push({ "code": "T[i][j] = T[i][j] | (T[i][k] & T[k][j]);", "animation": 8 });
                queue.push({ "code": "delete j;" });
            }
            queue.push({ "code": "delete i;" });
        }
        Pis.push(structuredClone(Pi));
        queue.push({ "code": "delete k;" });
    }
    queue.push({ "code": "delete T;" });

    createTaskTable();
    graphTransitiveClosureAnimation(queue);
}


async function graphTransitiveClosureAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            graphTransitiveClosure(graph);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation") && !codeLine.hasOwnProperty("tableAnimation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 3:
                if (T[i][j] === null) {
                    document.querySelector("#T" + (i * T.length + j)).innerText = "$0$";
                } else {
                    document.querySelector("#T" + (i * T.length + j)).innerText = "$" + T[i][j] + "$";
                }
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                document.querySelector("#T" + (i * T.length + i)).innerText = "$" + T[i][i] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                // update T tables' top left cell
                document.querySelector("#T").innerText = "$T^{(" + (k + 1) + ")}$";
                MathJax.typeset();

                // reset all table cells' background color
                for (let g = 0; g < graph.edges.length + 1; g++)
                    for (let h = 0; h < graph.edges.length + 1; h++)
                        taskTable.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));

                // colorize tables' background to red
                taskTable.querySelector("tr:nth-child(" + (k + 2) + ")").childNodes.forEach(x => x.style.backgroundColor = "lightcoral");
                for (let h = 0; h < graph.edges.length + 1; h++)
                    taskTable.querySelector("tr:nth-child(" + (h + 1) + ") > td:nth-child(" + (k + 2) + ")").style.backgroundColor = "lightcoral";
                break;
            case 8:
                // colorize nodes and edges
                if (i !== j) {
                    if (Pis[k][i][j] === 0) {
                        graphDrawer.vertices[i].setColor("--animationColor2");
                        graphDrawer.vertices[j].setColor("--animationColor2");
                        graphDrawer.draw();
                    } else {
                        let tmp = parseInt(graphDrawer.vertices[j].text);
                        let nodesToColorize = [];
                        nodesToColorize.push(parseInt(graphDrawer.vertices[j].text));
                        while (Pis[k][i][tmp - 1] !== parseInt(graphDrawer.vertices[i].text)) {
                            tmp = Pis[k][i][tmp - 1];
                            nodesToColorize.push(tmp);
                        }
                        nodesToColorize.push(parseInt(graphDrawer.vertices[i].text));
                        for (let g = 0; g < nodesToColorize.length - 1; g++) {
                            let toIndex = graphDrawer.vertices.indexOf(graphDrawer.vertices.find(x => x.text === nodesToColorize[g].toString()));
                            let fromIndex = graphDrawer.vertices.indexOf(graphDrawer.vertices.find(x => x.text === nodesToColorize[g + 1].toString()));
                            graphDrawer.edges[fromIndex][toIndex].color = "--animationColor1";
                            graphDrawer.draw();
                        }
                        nodesToColorize.forEach(n => graphDrawer.vertices.find(x => x.text === n.toString()).setColor("--animationColor1"));
                        graphDrawer.draw();
                    }
                } else {
                    graphDrawer.vertices[i].setColor("--animationColor1");
                    graphDrawer.draw();
                }

                const tableCellJ = document.querySelector("#T" + (k * T.length + j));
                const tableCellI = document.querySelector("#T" + (i * T.length + k));
                const tableCellCenter = document.querySelector("#T" + (i * T.length + j));
                
                tableCellJ.style.backgroundColor = "lightsalmon";
                tableCellI.style.backgroundColor = "lightsalmon";
                if (k !== i && k !== j)
                    tableCellCenter.style.backgroundColor = "yellow";
                else
                    tableCellCenter.style.backgroundColor = "lightsalmon";
                
                tableCellCenter.innerText = "$" + T[i][j] + "$";
                MathJax.typeset();

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                
                // reset nodes background color to original
                for (let h = 0; h < graphDrawer.edges.length; h++) {
                    graphDrawer.vertices[h].setColor("--main");
                    graphDrawer.draw();
                }

                // reset lines background color to original
                for (let h = 0; h < graphDrawer.edges.length; h++) {
                    for (let g = 0; g < graphDrawer.edges.length; g++) {
                        graphDrawer.edges[h][g].color = "--main";
                        graphDrawer.draw();
                    }
                }

                // reset tables background color
                if (k !== i && k !== j)
                    tableCellCenter.style.backgroundColor = "white";
                else
                    tableCellCenter.style.backgroundColor = "lightcoral";
                tableCellJ.style.backgroundColor = "lightcoral";
                tableCellI.style.backgroundColor = "lightcoral";
                break;
            default:
                if (codeLine.animation > 0 && codeLine.animation < 17) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }

    // reset all table cells' background color
    for (let g = 0; g < graph.edges.length + 1; g++)
        for (let h = 0; h < graph.edges.length + 1; h++)
            taskTable.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";

    isAnimationRunning = false;
}