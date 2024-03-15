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
let taskTableNeededRows = 5;

let animPiColor = "--animationColor4";
let animSafetyColor = "--animationColor1"
let animEdgeColor = "--animationColor3";
let animSpanningColor = "--animationColor2";

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

const positions = [
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 60.0, (x) => x, (y) => y - 50],
    [(canvas) => (canvas.width / 6) * 0.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 2.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 6) * 4.5 + (canvas.width / 12), (canvas) => 240.0, (x) => x, (y) => y + 50]
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true);


document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { Kruskal(graph, vertices[0]); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { Kruskal(graph, vertices[0]); } startNewAnimation = true; flag = true; reset(); graphDrawer.draw(); });
createLegend([ 
    { description: "kiválasztott él és csúcsai", color: `var(${animEdgeColor})` }, 
    { description: "biztonságos él", color: `var(${animSafetyColor})` }, 
    { description: "módosított $\\pi$ érték", color: `var(${animPiColor})` }, 
    { description: "minimális feszítőfa éle", color: `var(${animSpanningColor})` },
]);

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
createTaskTable();
Kruskal(graph, vertices[0]);


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
            Kruskal(graph, vertices[0]);
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

function createTaskTable() {
    taskTable.innerHTML = "";

    let tr, td

    //header
    tr = document.createElement("tr");
    const headers = [{text: "$\\text{komponensek}$", thick: true}];
    graph.vertices.forEach(v => headers.push({text: `\$\\text{${v.text}}\$`, thick: false}));
    headers[headers.length-1].thick = true;
    ["$u-v$", "$u\\pi^*s$", "$v\\pi^*s$", "$\\pm$"].forEach(e => headers.push({text: e, thick: false}));
    headers[headers.length-2].thick = true;
    headers.forEach(h => {
        td = document.createElement("td");
        td.innerText = h.text
        if(h.thick) td.style.borderRightWidth = "2px"
        tr.style.borderBottomWidth = "3px"
        tr.appendChild(td);
    })
    taskTable.appendChild(tr);

    for(let i = 0; i < taskTableNeededRows + 1; i++){
        tr = document.createElement("tr");

        //components
        td = document.createElement("td");
        td.id = `components${i}`
        td.innerText = "$ $"
        td.style.borderRightWidth = "2px"
        tr.appendChild(td);

        //main
        graph.vertices.forEach(v => {
            td = document.createElement("td");
            td.id = `main${v.text}${i}`
            tr.appendChild(td);
        })
        td.style.borderRightWidth = "2px"

        if(i === taskTableNeededRows){
            td = document.createElement("td");
            td.colSpan = 4;
            td.innerText = "$-$";
            tr.appendChild(td); 
        } else {
            //edge
            td = document.createElement("td");
            td.id = `edge${i}`
            tr.appendChild(td);

            //u vertex
            td = document.createElement("td");
            td.id = `uVertex${i}`
            tr.appendChild(td);

            //v vertex
            td = document.createElement("td");
            td.id = `vVertex${i}`
            tr.appendChild(td);
            td.style.borderRightWidth = "2px"

            //is safe
            td = document.createElement("td");
            td.id = `isSafe${i}`
            tr.appendChild(td);
        }

        taskTable.appendChild(tr);
    }

    MathJax.typeset();
}

function getEdgeText(edge){
    return `\\text{${edge.from.text}}\\stackrel{${edge.weight}}{-}\\text{${edge.to.text}}`
}

function getVertexDataText(vertexCp){
    let text = "";
    text += vertexCp.text;
    let pi = vertexCp.pi;
    if(pi.text !== vertexCp.text){
        text += pi.text;
    }
    while(pi.pi !== pi){
        pi = pi.pi;
        text += pi.text;
    }
    text += pi.s;
    return text;
}

function findPi(v){
    let pi = v.pi;
    while(pi.pi !== pi){
        pi = pi.pi
    }
    return pi;
}

function getComponentsText(vertices){
    const trees = [];
    vertices.forEach(root => {
        let treeText = ""      
        vertices.filter(v => findPi(v) === root).forEach(v => treeText += v.text)
        trees.push(treeText)
    });
    return trees.filter(t => t !== "").join(", ")
    
}

function setTableCellText(text, id, n, vertexText = null, asText = true){
    const selector = `${id}${vertexText === null ? "" : vertexText}${n}`
    const cell = taskTable.querySelector(`#${selector}`)
    const innerText = asText ? `\$\\text{${tableValue(text)}}\$` : `\$${tableValue(text)}\$`
    cell.innerText = innerText;
    MathJax.typeset();   
}

function union(x, y){
    if(x.s <= y.s){
        x.pi = y;
        y.s += x.s;
    } else {
        y.pi = x;
        x.s += y.s;
    }
}

function findSet(v){
    if(v.pi !== v){
        v.pi = findSet(v.pi)
    }
    return v.pi;
}

function makeSet(v){
    v.pi = v;
    v.s = 1;
}

function Kruskal(graph, s){
    queue = [];
    taskTableNeededRows = 0;
    const components = {text: ""}
    graph.vertices.forEach(v => {
        queue.push(() => {graphDrawer.colorVertex(null, null, true); return 100;})
        queue.push(() => {
            graphDrawer.colorVertex(v, animPiColor);
            setTableCellText(`${v.text}1`, "main", 0, v.text); 
            return 101;
        })
        makeSet(v);
    })
    components.text = getComponentsText(graph.vertices)
    
    queue.push(() => {
        graphDrawer.colorVertex(null, null, true); 
        setTableCellText(components.text, "components", 0); 
        return 102;
    })
    let A = [];

    queue.push(() => 103)
    let k = graph.vertices.length;

    queue.push(() => 104)
    let Q = graph.getEdges();

    while(k > 1 && Q.length > 0){
        queue.push(() => 105)
        let currentRow = taskTableNeededRows;

        queue.push(() => 106)

        let e = remMin(Q, (e1, e2) => e1.weight < e2.weight)        
        let uText = getVertexDataText(e.from);
        let vText = getVertexDataText(e.to);
        let spanningVertices = [];
        A.forEach(e => {
            spanningVertices.push(e.from);
            spanningVertices.push(e.to);
        })
        queue.push(() => {
            graphDrawer.colorVertex(e.from, animEdgeColor, true);
            graphDrawer.colorVertex(e.to, animEdgeColor);
            graphDrawer.colorEdge(e, animEdgeColor, true, (e) => e.color !== animSpanningColor);
            setTableCellText(getEdgeText(e), "edge", currentRow, null, false);
            setTableCellText(uText, "uVertex", currentRow);
            setTableCellText(vText, "vVertex", currentRow);
            return 107;
        })

        let [oldFromPi, oldToPi] = [e.from.pi, e.to.pi];
        let x = findSet(e.from);
        if(oldFromPi !== x){
            let [xCp, fromText] = [x, e.from.text]
            queue.push(() => {
                graphDrawer.colorVertex(e.from, animPiColor);
                setTableCellText(xCp.text, "main", currentRow+1, fromText);
                return 108;
            })
        } else {
            queue.push(() => 108)
        }

        let y = findSet(e.to);
        if(oldToPi !== y){
            let [yCp, toText] = [y, e.to.text]
            queue.push(() => {
                graphDrawer.colorVertex(e.to, animPiColor);
                setTableCellText(yCp.text, "main", currentRow+1, toText);
                return 109;
            })
        } else {
            queue.push(() => 109);
        }
        queue.push(() => {
            graphDrawer.colorVertex(e.from, animEdgeColor);
            graphDrawer.colorVertex(e.to, animEdgeColor);
            return 110;
        })
        if(x !== y){
            queue.push(() => {
                setTableCellText("+", "isSafe", currentRow, null, false);
                graphDrawer.colorVertex(e.from, animSafetyColor)
                graphDrawer.colorVertex(e.to, animSafetyColor)
                graphDrawer.colorEdge(e, animSafetyColor)
            })
            queue.push(() => {
                graphDrawer.colorVertex(e.from, animEdgeColor)
                graphDrawer.colorVertex(e.to, animEdgeColor)
                graphDrawer.colorEdge(e, animEdgeColor)
            })
            queue.push(() => {
                graphDrawer.colorEdge(e, animSpanningColor); 
                return 111;
            })
            A.push(e);


            let {from, to} = e;
            let [fromS, toS, oldXs, oldYs] = [from.s, to.s, x.s, y.s];
            union(x,y);
            let components = getComponentsText(graph.vertices);
            if(oldXs <= oldYs){
                queue.push(() => {
                    graphDrawer.colorVertex(e.from, animPiColor);
                    setTableCellText(to.text, "main", currentRow+1, from.text);
                    setTableCellText(`${to.text}${toS+fromS}`, "main", currentRow+1, to.text);
                    setTableCellText(components, "components", currentRow+1);
                    return 113;
                })
            } else {
                queue.push(() => {
                    graphDrawer.colorVertex(e.to, animPiColor);
                    setTableCellText(from.text, "main", currentRow+1, to.text);
                    setTableCellText(`${from.text}${fromS+toS}`, "main", currentRow+1, from.text);
                    setTableCellText(components, "components", currentRow+1);
                    return 113;
                })
            }

            queue.push(() => {
                graphDrawer.colorVertex(e.from, animEdgeColor)
                graphDrawer.colorVertex(e.to, animEdgeColor)
                return 114;
            })
            k--;
        } else {
            let components = getComponentsText(graph.vertices);
            queue.push(() => {
                setTableCellText("-", "isSafe", currentRow, null, false);
                setTableCellText(components, "components", currentRow+1)
                return 112;
            })
            
        }
        taskTableNeededRows++;
    }
    queue.push(() => {graphDrawer.colorVertex(null, null, true); return 115})
    createTaskTable();
    animationController.setQueue(queue);
    kruskalAnimation(queue);
    return k;
}

async function kruskalAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()){
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            Kruskal(graph, vertices[0]);
            return;
        }
        animationController.next();
        await sleep(WAIT_TIME);
    }
    structogramHighlight();

    isAnimationRunning = false;
}