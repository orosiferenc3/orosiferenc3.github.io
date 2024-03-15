/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [12, 13, 20, 6, 7, 4, 9];
let numbersCopy = structuredClone(numbers);

let queue = [];
let nodePositionsForHeap = [];
let level = getBaseLog(2, numbers.length);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { drawTreeForHeapSort(false, numbers); heapSort(); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { drawTreeForHeapSort(false, numbers); heapSort(); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "helyén van", "color": "var(--animationColor1)" }, { "description": "gyerek, akivel lehet, hogy megcseréljük a szülőt", "color": "var(--animationColor2)" }, { "description": "szülő, akit lesüllyesztünk", "color": "var(--animationColor3)" }]);
drawTreeForHeapSort(false, numbers);
heapSort();


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
            drawTreeForHeapSort(false, numbers);
        } else {
            squares = document.querySelector("#squares");
            drawTreeForHeapSort(false, numbers);
        }

        // restart animation
        if (!isAnimationRunning) {
            heapSort();
        }
        startNewAnimation = true;
    }
});


/**
 * Heap sort algorithm.
 */
function heapSort() {
    numbersCopy = structuredClone(numbers);
    queue = [];

    queue.push({ "code": "var numbersCopy = structuredClone(numbers);" });
    queue.push({ "code": "", "animation": 1 });
    queue.push({ "code": "var m = undefined;" });
    buildMaxHeap();

    let m = numbersCopy.length;
    queue.push({ "code": "m = numbersCopy.length;", "animation": 2 });
    while (m > 1) {
        queue.push({ "code": "", "animation": 3 });

        let tmp = numbersCopy[0];
        numbersCopy[0] = numbersCopy[m - 1];
        numbersCopy[m - 1] = tmp;
        
        queue.push({ "code": "m = m;", "animation": 4 });
        queue.push({ "code": "var tmp = numbersCopy[0];", "animation": 5 });
        queue.push({ "code": "numbersCopy[0] = numbersCopy[m - 1];" });
        queue.push({ "code": "numbersCopy[m - 1] = tmp;" });

        m--;
        queue.push({ "code": "m--;" });

        queue.push({ "code": "", "animation": 6 });
        sink(0, m);

        queue.push({ "code": "delete tmp;" });
    }

    queue.push({ "code": "delete m;" });

    heapSortAnimation(queue);
}


/**
 * Build a maximum heap from a binary tree.
 */
function buildMaxHeap() {
    for (let k = Math.floor((numbersCopy.length) / 2) - 1; k >= 0; k--) {
        queue.push({ "code": "var k = " + k + ";", "animation": 7 });
        queue.push({ "code": "", "animation": 8 });
        sink(k, numbersCopy.length);
        queue.push({ "code": "delete k;" });
    }
}


/**
 * Sink a node to the correct position.
 * @param {number} k parent node's index.
 * @param {number} n size of array vertices.
 */
function sink(k, n) {
    let i = k;
    let j = k * 2 + 1;
    let b = true;

    queue.push({ "code": "var n = " + n + ";"});
    queue.push({ "code": "var i = " + k + ";", "animation": 9 });
    queue.push({ "code": "var j = " + (k * 2 + 1) + ";", "animation": 10 });
    queue.push({ "code": "var b = true;", "animation": 11 });

    while ((j + 1) <= n && b) {
        queue.push({ "code": "", "animation": 12 });

        queue.push({ "code": "", "animation": 13 });
        if ((j + 1) < n && numbersCopy[j + 1] > numbersCopy[j]) {
            j++;
            queue.push({ "code": "j++;", "animation": 14 });
        } else {
            queue.push({ "code": "", "animation": 15 });
        }

        queue.push({ "code": "", "animation": 16 });
        if (numbersCopy[i] < numbersCopy[j]) {
            let tmp = numbersCopy[i];
            numbersCopy[i] = numbersCopy[j];
            numbersCopy[j] = tmp;

            queue.push({ "code": "var tmp = numbersCopy[i];", "animation": 17 });
            queue.push({ "code": "numbersCopy[i] = numbersCopy[j];" });
            queue.push({ "code": "numbersCopy[j] = tmp;" });

            i = j;
            j = j * 2 + 1;

            queue.push({ "code": "", "animation": 0 });

            queue.push({ "code": "i = j;", "animation": 19 });
            queue.push({ "code": "j = (j * 2 + 1);", "animation": 20 });

            queue.push({ "code": "delete tmp;" });
        } else {
            b = false;
            queue.push({ "code": "b = false;", "animation": 18 });
        }
    }

    queue.push({ "code": "delete i;", "animation": 0 });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete b;" });
}


/**
 * Animation of the algorithms.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function heapSortAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children).filter(x => x.hasAttribute("class"));

    for (const codeLine of queue) {

        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            drawTreeForHeapSort(false, numbers);
            heapSort();
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation") && !codeLine.hasOwnProperty("tableAnimation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 0:
                for (let h = 0; h < (m === undefined ? divs.length : m); h++) {
                    divs[h].style.backgroundColor = "var(--background)";
                }
                break;
            case 4:
                divs[0].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                swapNodeAndParentAnimation(divs, numbersCopy[0], 0, numbersCopy[m - 1], m - 1);
                let tmpDiv1 = divs[0];
                divs[0] = divs[m - 1];
                divs[m - 1] = tmpDiv1;

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
            case 19:
                divs[i].style.backgroundColor = "var(--animationColor3)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
            case 20:
                if ((j + 1) <= n) {
                    divs[j].style.backgroundColor = "var(--animationColor2)";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 14:
                divs[j - 1].style.backgroundColor = "var(--background)";
                divs[j].style.backgroundColor = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 17:
                swapNodeAndParentAnimation(divs, numbersCopy[i], i, numbersCopy[j], j);
                let tmpDiv2 = divs[i];
                divs[i] = divs[j];
                divs[j] = tmpDiv2;

                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 20) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }

    for (let h = 0; h < divs.length; h++) {
        divs[h].style.backgroundColor = "var(--animationColor1)";
    }

    isAnimationRunning = false;
}


/**
 * Draw a single node with the given text.
 * @param {number} number node's text.
 * @returns div
 */
function drawNode(number) {
    let square = document.createElement("div");
    square.setAttribute("class", "square");
    square.innerText = number;

    return square;
}


/**
 * Draw tree.
 * @param {boolean} directed if true, lines between vertices will have arrow.
 * @param {Array} vertices vertices.
 */
function drawTreeForHeapSort(directed, vertices) {
    squares.innerHTML = "";
    let level = getBaseLog(2, vertices.length);
    squares.setAttribute("style", "height: " + (level + 1) * 120 + "px !important; display: block !important;"); // because of proper tree drawing

    let divsArray = [];
    nodePositionsForHeap = [];

    // create nodes
    for (let i = 0; i < vertices.length; i++) {
        let node = drawNode(vertices[i]);
        squares.append(node);
        divsArray.push(node);
    }

    // determine node positions
    let nodesUntilLeafLevel = 0;
    for (let i = 0; i <= level; i++) {
        if (i !== level) {
            nodesUntilLeafLevel += Math.pow(2, i);
        }

        for (let j = 1; j <= Math.pow(2, i); j++) {
            let x = (squares.clientWidth / (Math.pow(2, i) + 1)) * j - (squares.clientWidth / 2);
            let y = (squares.clientHeight / (level + 1)) * (i + 1) - ((Math.pow(2, i) + j) * divsArray[0].clientHeight) + (divsArray[0].clientHeight / 2);
            nodePositionsForHeap.push([x, y]);
        }
    }

    for (let i = 0; i < squares.children.length; i++) {
        anime({
            targets: squares.children[i],
            keyframes: [
                { translateX: nodePositionsForHeap[i][0] },
                { translateY: nodePositionsForHeap[i][1] },
            ],
            duration: 0,
            easing: 'easeOutElastic(1, .8)',
            loop: false
        });
    }

    // create lines
    for (let i = 0; i < nodesUntilLeafLevel; i++) {
        let divParent, divLeft, divRight;
        divParent = divsArray[i];
        if ((i * 2 + 1) < vertices.length) {
            divLeft = divsArray[i * 2 + 1];
            connect((i * 2), divParent, divLeft, "var(--animationColor2)", 3, directed, ''); // use this invertedly due to directed graph arrows
        }

        if ((i * 2 + 2) < vertices.length) {
            divRight = divsArray[i * 2 + 2];
            connect((i * 2 + 1), divParent, divRight, "var(--animationColor2)", 3, directed, ''); // use this invertedly due to directed graph arrows
        }
    }

    // lines' animation
    for (let i = 0; i < (nodesUntilLeafLevel * 2); i++) {
        fadeIn("#hr" + i);
        //await sleep(100);
    }
}


/**
 * Swap vertices animation.
 * @param {Array} divs all vertices.
 * @param {number} num1 first node's text.
 * @param {number} index1 first node's index.
 * @param {number} num2 second node's text.
 * @param {number} index2 second node's index.
 */
function swapNodeAndParentAnimation(divs, num1, index1, num2, index2) {
    let div1 = divs[index1];
    let div2 = divs[index2];

    // calculate size of margin
    let marginSize = window.getComputedStyle(div1, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div1, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    // animation of div1
    anime({
        targets: div1,
        keyframes: [
            { translateX: nodePositionsForHeap[index2][0] },
            { translateY: squareWidth * (Math.abs(index2 - index1) - numbers.indexOf(num1)) + nodePositionsForHeap[index2][1] },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });

    // animation of div2
    anime({
        targets: div2,
        keyframes: [
            { translateX: nodePositionsForHeap[index1][0] },
            { translateY: squareWidth * (-Math.abs(numbers.indexOf(num2) - index1)) + nodePositionsForHeap[index1][1] },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}