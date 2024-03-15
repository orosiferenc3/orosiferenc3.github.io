/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let taskTableD, taskTablePi;
let canvas;
let Pis = [];

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    taskTableD = document.querySelector("#taskTableD2 > tbody");
    taskTablePi = document.querySelector("#taskTablePi2 > tbody");
    squares = document.querySelector("#squares2");
    canvas = squares.children[0];
} else {
    taskTableD = document.querySelector("#taskTableD > tbody");
    taskTablePi = document.querySelector("#taskTablePi > tbody");
    squares = document.querySelector("#squares");
    canvas = squares.children[0];
}

const vertices = [{text: "1"}, {text: "2"}, {text: "3"}, {text: "4"}];
const edges = [
    [{weight: null}, {weight: 1}, {weight: Number.MAX_VALUE}, {weight: 3}],
    [{weight: Number.MAX_VALUE}, {weight: null}, {weight: Number.MAX_VALUE}, {weight: 1}],
    [{weight: 1}, {weight: 2}, {weight: null}, {weight: Number.MAX_VALUE}],
    [{weight: Number.MAX_VALUE}, {weight: Number.MAX_VALUE}, {weight: 2}, {weight: null}],
];
const graph = new Graph(vertices, edges, true)

const positions = [
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 40.0],
    [(canvas) => (canvas.width / 4) * 1, (canvas) => 260.0],
    [(canvas) => (canvas.width / 4) * 3, (canvas) => 260.0]
]

const graphDrawer = new GraphDrawer(canvas, graph, positions, true);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { floydWarshall(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { floydWarshall(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ "description": "új legjobb útvonal", "color": "var(--animationColor1)" }, { "description": "jelenlegi legjobb út", "color": "var(--animationColor2)" }, { "description": "nem találtunk utat a csúcsok között", "color": "var(--animationColor3)" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
floydWarshall(graph);


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
            taskTableD = document.querySelector("#taskTableD2 > tbody");
            taskTablePi = document.querySelector("#taskTablePi2 > tbody");
            squares = document.querySelector("#squares2");
            canvas = squares.children[0];
        } else {
            taskTableD = document.querySelector("#taskTableD > tbody");
            taskTablePi = document.querySelector("#taskTablePi > tbody");
            squares = document.querySelector("#squares");
            canvas = squares.children[0];
        }
        graphDrawer.setCanvas(canvas);
        reset();
        graphDrawer.draw();
        createTaskTable();

        // restart animation
        if (!isAnimationRunning) {
            floydWarshall(graph);
        }
        startNewAnimation = true;
    }
});


function reset() {
    document.querySelector("#taskTableD2 > tbody").innerHTML = "";
    document.querySelector("#taskTablePi2 > tbody").innerHTML = "";
    document.querySelector("#taskTableD > tbody").innerHTML = "";
    document.querySelector("#taskTablePi > tbody").innerHTML = "";
    graphDrawer.reset();
}


function createTaskTable() {
    taskTableD.innerHTML = "";
    taskTablePi.innerHTML = "";

    // D table
    let ids = 0;
    for (let i = 0; i < graph.edges.length + 1; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < graph.edges.length + 1; j++) {
            let td = document.createElement("td");
            if (i === 0 && j === 0) {
                td.innerText = "$D^{(" + i + ")}$";
                td.setAttribute("id", "D");
            } else if (i === 0) {
                td.innerText = "$" + j + "$";
            } else if (j === 0) {
                td.innerText = "$" + i + "$";
            } else {
                td.setAttribute("id", "D" + ids++);
            }
            tr.appendChild(td);
        }
        taskTableD.appendChild(tr);
    }

    // Pi table
    ids = 0;
    for (let i = 0; i < graph.edges.length + 1; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < graph.edges.length + 1; j++) {
            let td = document.createElement("td");
            if (i === 0 && j === 0) {
                td.innerText = "$\\pi^{(" + i + ")}$";
                td.setAttribute("id", "Pi");
            } else if (i === 0) {
                td.innerText = "$" + j + "$";
            } else if (j === 0) {
                td.innerText = "$" + i + "$";
            } else {
                td.setAttribute("id", "Pi" + ids++);
            }
            tr.appendChild(td);
        }
        taskTablePi.appendChild(tr);
    }
    MathJax.typeset();
}


function floydWarshall(graph) {
    let D = new Array(graph.edges.length).fill().map(() => Array(graph.edges.length).fill());
    let Pi = new Array(graph.edges.length).fill().map(() => Array(graph.edges.length).fill());

    let queue = [];
    queue.push({ "code": "var D = new Array(graph.edges.length).fill().map(() => Array(graph.edges.length).fill());" });
    queue.push({ "code": "var Pi = new Array(graph.edges.length).fill().map(() => Array(graph.edges.length).fill());" });

    for (let i = 0; i < graph.edges.length; i++) {
        queue.push({ "code": "var i = " + i + ";", "animation": 1 });
        for (let j = 0; j < graph.edges.length; j++) {
            queue.push({ "code": "var j = " + j + ";", "animation": 2 });

            D[i][j] = graph.edges[i][j].weight;
            queue.push({ "code": "D[i][j] = " + graph.edges[i][j].weight + ";", "animation": 3 });

            queue.push({ "code": "", "animation": 4 });
            if (i !== j && D[i][j] < Number.MAX_VALUE) {
                queue.push({ "code": "Pi[i][j] = i + 1;", "animation": 5 });
                Pi[i][j] = i + 1;
            } else {
                queue.push({ "code": "Pi[i][j] = 0;", "animation": 6 });
                Pi[i][j] = 0;
            }
            queue.push({ "code": "delete j;" });
        }
        queue.push({ "code": "delete i;" });
    }

    for (let k = 0; k < graph.edges.length; k++) {
        queue.push({ "code": "var k = " + k + ";", "animation": 7 });
        for (let i = 0; i < graph.edges.length; i++) {
            queue.push({ "code": "var i = " + i + ";", "animation": 8 });
            for (let j = 0; j < graph.edges.length; j++) {
                queue.push({ "code": "var j = " + j + ";", "animation": 9 });

                queue.push({ "code": "", "animation": 10 });
                if (D[i][j] > (D[i][k] + D[k][j])) {
                    queue.push({ "code": "D[i][j] = D[i][k] + D[k][j];", "animation": 11 });
                    queue.push({ "code": "Pi[i][j] = Pi[k][j];", "animation": 13 });

                    D[i][j] = D[i][k] + D[k][j];
                    Pi[i][j] = Pi[k][j];

                    queue.push({ "code": "", "animation": 14 });
                    if (i === j && D[i][i] < 0) {
                        queue.push({ "code": "return i;", "animation": 15 });
                        return i;
                    } else {
                        queue.push({ "code": "", "animation": 16 });
                    }
                } else {
                    queue.push({ "code": "", "animation": 12 });
                }
                queue.push({ "code": "delete j;" });
            }
            queue.push({ "code": "delete i;" });
        }
        Pis.push(structuredClone(Pi));
        queue.push({ "code": "delete k;" });
    }

    queue.push({ "code": "delete D;" });
    queue.push({ "code": "delete Pi;", "animation": 17 });

    createTaskTable();
    floydWarshallAnimation(queue);
}


async function floydWarshallAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            floydWarshall(graph);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation") && !codeLine.hasOwnProperty("tableAnimation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 3:
                if (D[i][j] === null || D[i][j] === Number.MAX_VALUE) {
                    if (i === j) {
                        document.querySelector("#D" + (i * D.length + j)).innerText = "$0$";
                    } else {
                        document.querySelector("#D" + (i * D.length + j)).innerText = "$\\infty$";
                    }
                } else {
                    document.querySelector("#D" + (i * D.length + j)).innerText = "$" + D[i][j] + "$";
                }
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
            case 6:
                document.querySelector("#Pi" + (i * D.length + j)).innerText = "$" + Pi[i][j] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                // reset all table cells' background color
                for (let g = 0; g < graph.edges.length + 1; g++) {
                    for (let h = 0; h < graph.edges.length + 1; h++) {
                        taskTableD.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";
                        taskTablePi.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";
                    }
                }

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));

                // colorize tables' background to red
                taskTableD.querySelector("tr:nth-child(" + (k + 2) + ")").childNodes.forEach(x => x.style.backgroundColor = "lightcoral");
                for (let h = 0; h < graph.edges.length + 1; h++) {
                    taskTableD.querySelector("tr:nth-child(" + (h + 1) + ") > td:nth-child(" + (k + 2) + ")").style.backgroundColor = "lightcoral";
                }
                taskTablePi.querySelector("tr:nth-child(" + (k + 2) + ")").childNodes.forEach(x => x.style.backgroundColor = "lightcoral");
                for (let h = 0; h < graph.edges.length + 1; h++) {
                    taskTablePi.querySelector("tr:nth-child(" + (h + 1) + ") > td:nth-child(" + (k + 2) + ")").style.backgroundColor = "lightcoral";
                }

                // update D and Pi tables' top left cell
                document.querySelector("#D").innerText = "$D^{(" + (k + 1) + ")}$";
                document.querySelector("#Pi").innerText = "$\\pi^{(" + (k + 1) + ")}$";
                MathJax.typeset();
                break;
            case 10:
                // colorize verticites' background color on that route
                if (i !== j) {
                    if (Pi[i][j] === 0) {
                        graphDrawer.vertices[i].setColor("--animationColor3");
                        graphDrawer.vertices[j].setColor("--animationColor3");
                        graphDrawer.draw();
                    } else {
                        let tmp = parseInt(graphDrawer.vertices[j].text);
                        let nodesToColorize = [];
                        nodesToColorize.push(parseInt(graphDrawer.vertices[j].text));
                        while (Pi[i][tmp - 1] !== parseInt(graphDrawer.vertices[i].text)) {
                            tmp = Pi[i][tmp - 1];
                            nodesToColorize.push(tmp);
                        }
                        nodesToColorize.push(parseInt(graphDrawer.vertices[i].text));
                        for (let g = 0; g < nodesToColorize.length - 1; g++) {
                            let toIndex = graphDrawer.vertices.indexOf(graphDrawer.vertices.find(x => x.text === nodesToColorize[g].toString()));
                            let fromIndex = graphDrawer.vertices.indexOf(graphDrawer.vertices.find(x => x.text === nodesToColorize[g + 1].toString()));
                            graphDrawer.edges[fromIndex][toIndex].color = "--animationColor2";
                            graphDrawer.draw();
                        }
                        nodesToColorize.forEach(n => graphDrawer.vertices.find(x => x.text === n.toString()).setColor("--animationColor2"));
                        graphDrawer.draw();
                    }
                }
                
                // reset tables background color based on if its red or white
                if (k !== i && k !== j) {
                    document.querySelector("#D" + (i * D.length + j)).style.backgroundColor = "yellow";
                    document.querySelector("#Pi" + (i * D.length + j)).style.backgroundColor = "yellow";
                } else {
                    document.querySelector("#D" + (i * D.length + j)).style.backgroundColor = "lightsalmon";
                    document.querySelector("#Pi" + (i * D.length + j)).style.backgroundColor = "lightsalmon";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 11:
                document.querySelector("#D" + (i * D.length + j)).innerText = "$" + D[i][j] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 12:
            case 15:
            case 16:
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

                // reset tables background color based on if its red or white
                if (k !== i && k !== j) {
                    document.querySelector("#D" + (i * D.length + j)).style.backgroundColor = "white";
                    document.querySelector("#Pi" + (i * D.length + j)).style.backgroundColor = "white";
                } else {
                    document.querySelector("#D" + (i * D.length + j)).style.backgroundColor = "lightcoral";
                    document.querySelector("#Pi" + (i * D.length + j)).style.backgroundColor = "lightcoral";
                }

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 13:
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

                // colorize verticites' background color on that route
                if (i !== j) {
                    if (Pis[k][i][j] === 0) {
                        graphDrawer.vertices[i].setColor("--animationColor3");
                        graphDrawer.vertices[j].setColor("--animationColor3");
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
                }

                document.querySelector("#Pi" + (i * D.length + j)).innerText = "$" + Pi[k][j] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 17:
                // reset all table cells' background color
                for (let g = 0; g < graphDrawer.edges.length + 1; g++) {
                    for (let h = 0; h < graphDrawer.edges.length + 1; h++) {
                        taskTableD.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";
                        taskTablePi.querySelector("tr:nth-child(" + (g + 1) + ") > td:nth-child(" + (h + 1) + ")").style.backgroundColor = "white";
                    }
                }
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

    isAnimationRunning = false;
}