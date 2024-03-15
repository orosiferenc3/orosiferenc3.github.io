/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let canvas;
let processedVerticies = [];
let queue = [];

class GenericTreeNode {
    constructor(key, child1, sibling) {
        this.child1 = child1;
        this.sibling = sibling;
        this.key = key;
    }
}

const tree = new GenericTreeNode(1, 
    new GenericTreeNode(2, 
        new GenericTreeNode(5, null, null), 
        new GenericTreeNode(3, null, 
            new GenericTreeNode(4, 
                new GenericTreeNode(6, null,
                    new GenericTreeNode(7, null, null)), 
            null))), 
    null);

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    squares = document.querySelector("#squares2");
    canvas = squares.children[0];
} else {
    squares = document.querySelector("#squares");
    canvas = squares.children[0];
}

const vertices = [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }, { text: "6" }, { text: "7" }];
const edges = [
    [null, { weight: 1 }, { weight: 1 }, { weight: 1 }, null, null, null],
    [null, null, null, null, { weight: 1 }, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, { weight: 1 }, { weight: 1 }],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
];
const graph = new Graph(vertices, edges, true)

const positions = [
    [(canvas) => (canvas.width / 6) * 2.5, (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5, (canvas) => 150.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5, (canvas) => 150.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5, (canvas) => 150.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 0.5, (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 3.5, (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 5.5, (canvas) => 240.0, (x) => x, (y) => y + 50]
]

const graphDrawer = new GraphDrawer(canvas, graph, positions, false);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { TreeTraversal(tree); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { TreeTraversal(tree); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([{ "description": "feldolgozott csúcs", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált csúcs", "color": `var(--animationColor2)` }]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
TreeTraversal(tree);


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
        graphDrawer.setCanvas(canvas);
        reset();
        graphDrawer.draw();

        // restart animation
        if (!isAnimationRunning) {
            TreeTraversal(tree);
        }
        startNewAnimation = true;
    }
});

function reset() {
    document.querySelector("#preInPost").innerText = "preorder";
    graphDrawer.reset();
}

function TreeTraversal(tree) {
    queue = [];
    processedVerticies = [];
    queue.push(() => { document.querySelector("#preInPost").innerText = "preorder"; });
    preorder(tree);

    queue.push(() => { graphDrawer.colorVertex(null, null, true); });
    
    queue.push(() => { processedVerticies = []; });
    queue.push(() => { document.querySelector("#preInPost").innerText = "postorder"; });
    postorder(tree);
    TreeTraversalAnimation(queue);
}

function preorder(tree) {
    while (tree !== null) {
        queue.push(() => { graphDrawer.colorVertex(v, "--animationColor2"); return 1; });
        const v = vertices[parseInt(tree.key) - 1];
        queue.push(() => { graphDrawer.colorVertex(v, "--animationColor1"); return 2; });
        
        queue.push(() => 3);
        preorder(tree.child1);

        queue.push(() => 4);
        tree = tree.sibling;
    }
}

function postorder(tree) {
    if (tree !== null)
        queue.push(() => { graphDrawer.colorVertex(null, null, true); processedVerticies.forEach(n => graphDrawer.colorVertex(n, "--animationColor1")) });

    while (tree !== null) {
        queue.push(() => { graphDrawer.colorVertex(v, "--animationColor2"); return 5; });
        queue.push(() => 6);
        postorder(tree.child1);

        const v = vertices[parseInt(tree.key) - 1];
        if (tree.child1 !== null)
            queue.push(() => { graphDrawer.colorVertex(v, "--animationColor2"); });
        queue.push(() => { graphDrawer.colorVertex(v, "--animationColor1"); processedVerticies.push(v); return 7; });

        queue.push(() => 8);
        tree = tree.sibling;
    }
}

async function TreeTraversalAnimation(queue) {
    isAnimationRunning = true;

    for (const f of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            TreeTraversal(tree);
            return;
        }
        const stuctogram = f();
        structogramHighlight(stuctogram);
        await sleep(WAIT_TIME);
        structogramHighlight(stuctogram);
    }

    isAnimationRunning = false;
}