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
    structogramHighlight();
}, evalQueueState)

steppable(animationController);

/**
 * Consts.
 */
const treeEdgeColor = "--animationColor1"

/**
 * Variables.
 */
let canvas;
let queue = [];
let time;

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    squares = document.querySelector("#squares2");
    canvas = squares.children[0];
} else {
    squares = document.querySelector("#squares");
    canvas = squares.children[0];
}

const vertices = [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }, { text: "e" }, { text: "f" }];
const edges = [
    [null, { weight: 1 }, null, null, { weight: 1 }, null],
    [null, null, { weight: 1 }, null, { weight: 1 }, null],
    [null, null, null, null, null, null],
    [{ weight: 1 }, null, null, null, null, null],
    [null, null, { weight: 1 }, { weight: 1 }, null, null],
    [null, null, { weight: 1 }, null, { weight: 1 }, null],
];
const graph = new Graph(vertices, edges, true)

const positions = [
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50]
]

const graphDrawer = new GraphDrawer(canvas, graph, positions, false);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { DFS(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { DFS(graph); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ "description": "fa él", "color": `var(${treeEdgeColor})` }, { "description": "még felfedezetlen csúcs", "color": "white" }, { "description": "feldolgozás alatt álló csúcs", "color": "gray" }, { "description": "feldolgozott csúcs", "color": "black" }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
DFS(graph);


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
            DFS(graph);
        }
        startNewAnimation = true;
    }
});

function reset() {
    graphDrawer.reset();
}

function DFS(graph) {
    queue = [];
    graph.vertices.forEach((u) => {
        queue.push(() => { return 8; })
        queue.push(() => { graphDrawer.colorVertex(u, "--white"); return 9 })
        u.color = "white";
    });

    queue.push(() => 10)
    time = 0;

    graph.vertices.forEach((r) => {
        queue.push(() => 11)
        queue.push(() => 12)
        if (r.color === "white") {
            queue.push(() => 13)
            r.pi = null;

            queue.push(() => 15)
            DFvisit(graph, r);
        } else {
            queue.push(() => 14)
        }
    });
    animationController.setQueue(queue);
    depthFirstSearchAnimation(queue);
}


function DFvisit(graph, u) {
    u.d = ++time;
    queue.push(() => { graphDrawer.labelVertex(u, `${u.d}/`); return 42; })

    queue.push(() => { graphDrawer.colorVertex(u, "--gray"); return 43; })
    u.color = "grey";

    const uIdx = graph.vertices.indexOf(graph.vertices.find((x) => x === u));
    for (let j = 0; j < graph.edges[uIdx].length; j++) {
        const e = graph.edges[uIdx][j];
        if (e !== null) {
            queue.push(() => 44)
            const v = graph.vertices[j];

            queue.push(() => 45)
            if (v.color === "white") {

                queue.push(() => 46)
                v.pi = u;

                e.class = "tree"
                
                queue.push(() => { graphDrawer.colorEdge(e, treeEdgeColor); return 48; })
                DFvisit(graph, v);

            } else {
                queue.push(() => 47)
                if (v.color === "grey") {
                    queue.push(() => { graphDrawer.labelEdge(e, "V"); return 49; })
                    e.class = "back"
                }
                else {
                    if (v.color === "black") {
                        if (u.d < v.d) {
                            e.class = "forward"
                            queue.push(() => { graphDrawer.labelEdge(e, "E"); return 50; })
                        } else if (u.d > v.d) {
                            e.class = "cross"
                            queue.push(() => { graphDrawer.labelEdge(e, "K"); return 50; })
                        }
                    }
                }
            }
        }
    }

    u.f = ++time;
    queue.push(() => { graphDrawer.labelVertex(u, `${u.d}/${u.f}`); return 51; })


    queue.push(() => { graphDrawer.colorVertex(u, "black"); return 52; })
    u.color = "black";
}

async function depthFirstSearchAnimation(queue) {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            DFS(graph);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();

    isAnimationRunning = false;
}
