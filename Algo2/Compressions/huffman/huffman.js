/**
 * Read tasks.
 */
readTasks("tasks.json");

function evalQueueState(codeLine){
    eval(codeLine.code);

    if(codeLine.hasOwnProperty("animationEffect")){
        switch(codeLine.animationEffect){
            case 1:
                graphDrawer.colorEdge(null, null, true);
                graphDrawer.colorVertex(null, null, true);
                break;
            case 2:
                document.querySelector("#ct_char_" + charIndex).style.backgroundColor = "var(--white)";
                document.querySelector("#ct_code_" + charIndex).style.backgroundColor = "var(--white)";
                // reset colors of input text
                inputText.innerHTML = "";
                inputText.innerText = textToEncode;
                break;
            case 3:
                // reset colors of input text
                inputText.innerHTML = "";
                inputText.innerText = textToEncode;
                break;
        }
    }

    if (!codeLine.hasOwnProperty("animation")) {
        return;
    }

    switch (codeLine.animation) {
        case 1:
            let averticies = colorizeVerticiesAndEdges[lc][0];
            let aedges = colorizeVerticiesAndEdges[lc][1];
            averticies.forEach(x => graphDrawer.vertices[x].setColor("--animationColor1"));
            for (let h = 0; h < aedges.length; h += 2)
                graphDrawer.edges[aedges[h]][aedges[h + 1]].color = "--animationColor1";
            graphDrawer.draw();

            // insert text into the table
            document.querySelector("#ct_char_" + lc).innerText = arr[0];
            document.querySelector("#ct_code_" + lc).innerText = arr[1];
            if (arr[0] === "$ $") {
                document.querySelector("#ct_char_" + lc).innerText = "_";
            }
            MathJax.typeset();
            break;
        case 2:
            inputText.innerHTML = "";
            for (let h = 0; h < textToEncode.length; h++) {
                if (h === i)
                    inputText.innerHTML += "<span style='color: var(--animationColor1)'>" + textToEncode[h] + "</span>";
                else
                    inputText.innerHTML += textToEncode[h];
            }
            outputText.innerHTML = oText;
            outputText.innerHTML += "<span style='color: var(--animationColor1)'>" + dText + "</span>";
            document.querySelector("#ct_char_" + charIndex).style.backgroundColor = "var(--animationColor1)";
            document.querySelector("#ct_code_" + charIndex).style.backgroundColor = "var(--animationColor1)";                
            break;
        case 3:
            // colorize text
            inputText.innerHTML = "";
            for (let h = 0; h < textToEncode.length; h++) {
                if (textToEncode[h] === label)
                    inputText.innerHTML += "<span style='color: var(--animationColor1)'>" + textToEncode[h] + "</span>";
                else
                    inputText.innerHTML += textToEncode[h];
            }
            break;
        case 4:
            break;            
    }
}

let animationController = new AnimationControllerEval(() => {
    graphDrawer.setCanvas(canvas);
    reset();
    createTaskTable();
    graphDrawer.draw();
}, evalQueueState)

steppable(animationController);

/**
 * Variables.
 */
class MyNode {
    constructor(key, occurrence, left, right) {
        this.key = key;
        this.occurrence = occurrence;
        this.left = left;
        this.right = right;
    }
}

const textToEncode = "EMESE EL SEM EMELTE";
let decodedText = "";
let minPrQ = [];
let codeTable = [];
let root;
let leafsCounter = 0;
let vertexSize = 28.0;

let queue;
let canvas;
let cTable;
let inputText;
let outputText;
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    canvas = document.querySelector("#canvas2");
    cTable = document.querySelector("#codeTable2").children[0];
    inputText = document.querySelector("#inputText2");
    outputText = document.querySelector("#outputText2");
} else {
    canvas = document.querySelector("#canvas");
    cTable = document.querySelector("#codeTable").children[0];
    inputText = document.querySelector("#inputText");
    outputText = document.querySelector("#outputText");
}

const vertices = [{text: "8"}, {text: "2"}, {text: "3"}, {text: "3"}, {text: "1"}, {text: "2"}, {text: "3"}, {text: "5"}, {text: "6"}, {text: "11"}, {text: "19"}];
const edges = [
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: 0}, {weight: 1}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: 0}, {weight: 1}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: 0}, {weight: null}, {weight: null}, {weight: 1}, {weight: null}, {weight: null}, {weight: null}, {weight: null}],
    [{weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: 0}, {weight: 1}, {weight: null}, {weight: null}],
    [{weight: 0}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: null}, {weight: 1}, {weight: null}],
];
let graph = new Graph(vertices, edges, false);

const positions = [
    [(canvas) => (canvas.width / 7) * 1, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 7) * 2, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 7) * 3, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 7) * 4, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 7) * 5, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 7) * 6, (canvas) => 560.0, (x) => x, (y) => y + 50],
    [(canvas) => (canvas.width / 12) * 9.3, (canvas) => 420.0],
    [(canvas) => (canvas.width / 12) * 5.5, (canvas) => 300.0],
    [(canvas) => (canvas.width / 12) * 8.2, (canvas) => 300.0],
    [(canvas) => (canvas.width / 12) * 7, (canvas) => 170.0],
    [(canvas) => (canvas.width / 6) * 3, (canvas) => 40.0],
]

let graphDrawer = new GraphDrawer(canvas, graph, positions, true, vertexSize);
const labels = ["E", "L", "M", "_", "T", "S"];
const colorizeVerticiesAndEdges = [
    [[0, 10], [10, 0]],
    [[1, 7, 9, 10], [10, 9, 9, 7, 7, 1]],
    [[2, 7, 9, 10], [10, 9, 9, 7, 7, 2]],
    [[3, 8, 9, 10], [10, 9, 9, 8, 8, 3]],
    [[4, 6, 8, 9, 10], [10, 9, 9, 8, 8, 6, 6, 4]],
    [[5, 6, 8, 9, 10], [10, 9, 9, 8, 8, 6, 6, 5]],
]
vertices.forEach((v, i) => { if (labels[i] !== undefined) { graphDrawer.labelVertex(v, labels[i]); }});

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { huffmanCode(); } startNewAnimation = true; flag = true; reset(); graphDrawer.setCanvas(canvas); graphDrawer.draw(); createTaskTable(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { huffmanCode(); } startNewAnimation = true; flag = true; reset(); graphDrawer.setCanvas(canvas); graphDrawer.draw(); createTaskTable(); });

graphDrawer.setCanvas(canvas);
graphDrawer.draw();
reset();
huffmanCode();
createTaskTable();
inputText.innerText = textToEncode;


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
            canvas = document.querySelector("#canvas2");
            cTable = document.querySelector("#codeTable2").children[0];
            inputText = document.querySelector("#inputText2");
            outputText = document.querySelector("#outputText2");
        } else {
            canvas = document.querySelector("#canvas");
            cTable = document.querySelector("#codeTable").children[0];
            inputText = document.querySelector("#inputText");
            outputText = document.querySelector("#outputText");
        }
        animationController.reset();

        // restart animation
        if (!isAnimationRunning) {
            huffmanCode();
        }
        startNewAnimation = true;
    }
});

function reset() {
    inputText.innerText = textToEncode;
    outputText.innerText = "$ $";
    document.querySelector("#codeTable").children[0].innerHTML = "";
    document.querySelector("#codeTable2").children[0].innerHTML = "";
}


function createTaskTable() {
    const headers = ["Karakter", "Kód"];

    for (let i = 0; i < codeTable.length + 1; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < headers.length; j++) {
            let td = document.createElement("td");
            td.innerText = "$ $";
            if (i !== 0 && j === 0)
                td.id = "ct_char_" + (i-1);
            else if (i !== 0 && j === 1)
                td.id = "ct_code_" + (i-1);

            if (i === 0) {
                td.innerText = headers[j];
                td.style.fontWeight = "bold";
            }
            tr.appendChild(td);
        }
        cTable.appendChild(tr);
    }
    MathJax.typeset();
}


function showPartOfTree(numberOfVertex) {
    if (numberOfVertex > 11)
        numberOfVertex = 11;
    if (numberOfVertex < 0)
        numberOfVertex = 0;

    let newVertices = vertices.slice(0, numberOfVertex);
    let newEdges = [];
    for (let i = 0; i < numberOfVertex; i++) {
        newEdges.push(edges[i].slice(0, numberOfVertex));
    }
    let newPositions = positions.slice(0, numberOfVertex);

    graph = new Graph(newVertices, newEdges, false);
    graphDrawer = new GraphDrawer(canvas, graph, newPositions, true, vertexSize);
    newVertices.forEach((v, i) => { if (labels[i] !== undefined) { graphDrawer.labelVertex(v, labels[i]); }});

    graphDrawer.setCanvas(canvas);
    graphDrawer.draw();
}


function charactersOccurrence() {
    minPrQ = [];
    for (let i = 0; i < textToEncode.length; i++) {
        let j = 0;
        while (j < minPrQ.length && !(minPrQ[j].includes(textToEncode[i]))) {
            j++;
        }
        if (j >= minPrQ.length) {
            let arr = [];
            arr.push(textToEncode[i]);
            arr.push(1);
            minPrQ.push(arr);
        } else {
            minPrQ[j][1]++;
        }
    }
    prioritySort();
}

function prioritySort() {
    minPrQ = minPrQ.sort((a, b) => {return a[1] - b[1]});
}

function remove() {
    return minPrQ.shift();
}

function add(arr) {
    minPrQ.push(arr);
    prioritySort();
}

let label
let i
let oText
let charIndex
let dText
let lc
let arr

function huffmanCode() {
    queue = [];
    showPartOfTree(0);
    decodedText_ = "";
    minPrQ = [];
    codeTable = [];
    // define character occurrence
    charactersOccurrence();

    // create leafs
    let nodes = [];
    for (let i = 0; i < minPrQ.length; i++) {
        nodes.push(new MyNode(minPrQ[i][0], minPrQ[i][1], null, null));
        queue.push({ "code": "label = \"" + labels[i] + "\";" });
        queue.push({ "code": "showPartOfTree(" + (i + 1) + ");", "animation": 3 });
        queue.push({ "code": "", "animationEffect": 3 });
    }

    // build tree
    let partOfTree = minPrQ.length;
    while (minPrQ.length > 1) {
        let l = remove();
        let r = remove();
        let lNode = nodes.find(x => x.key === l[0]);
        let rNode = nodes.find(x => x.key === r[0]);

        let str = l[0] + r[0];
        let sum = l[1] + r[1];
        let arr = [];
        arr.push(str);
        arr.push(sum);
        add(arr);

        root = new MyNode(arr[0], arr[1], lNode, rNode);
        nodes.push(root);
        queue.push({ "code": "showPartOfTree(" + (partOfTree + 1) + ");", "animation": 4 });
        partOfTree++;
    }

    // create code table
    leafsCounter = 0;
    inorder(root, "");

    // encode text
    for (let i = 0; i < textToEncode.length; i++) {
        queue.push({ "code": "i = " + i + ";" });
        queue.push({ "code": "oText = \"" + decodedText_ + "\";" });
        let codeTableEntry = codeTable.find(x => x[0] === textToEncode[i]);
        decodedText_ += codeTableEntry[1];
        queue.push({ "code": "charIndex = " + codeTable.indexOf(codeTableEntry) + ";" });
        queue.push({ "code": "dText = \"" + codeTableEntry[1] + "\";", "animation": 2 });
        queue.push({ "code": "", "animationEffect": 2 });
    }
    console.log(textToEncode);
    console.log(codeTable);
    console.log(decodedText_);
    animationController.setQueue(queue);
    huffmanAnimation(queue);
}

function inorder(node, code) {
    if (node !== null && node.left === null && node.right === null) {
        let arr = [];
        arr.push(node.key);
        arr.push(code);
        codeTable.push(arr);
        queue.push({ "code": "lc = " + leafsCounter + ";" });
        queue.push({ "code": "arr = [\"$" + arr[0] + "$\", " + arr[1] + "];", "animation": 1 });
        queue.push({ "code": "", "animationEffect": 1 });
        leafsCounter++;
    } else if (node !== null) {
        inorder(node.left, code + "0");
        inorder(node.right, code + "1");
    }
}

/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function huffmanAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            huffmanCode();
            return;
        }

        animationController.next();
        await sleep(WAIT_TIME);
    }
    outputText.innerHTML = decodedText_;

    isAnimationRunning = false;
}