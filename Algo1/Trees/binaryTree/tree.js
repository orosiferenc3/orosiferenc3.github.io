/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const graphArrayRepresentation = document.querySelector("#arrayReprezentation > table > tbody > tr");
const numbers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

let queue = [];
let nextEmptyPlaceInArray = 0;
document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { graphTraversals(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { graphTraversals(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "feldolgozott elem", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált elem", "color": "var(--animationColor2)" }]);
drawTree(false, numbers);
graphTraversals(numbers);


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
            drawTree(false, numbers);
        } else {
            squares = document.querySelector("#squares");
            drawTree(false, numbers);
        }

        // restart animation
        if (!isAnimationRunning) {
            graphTraversals(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * Graph traversals.
 * @param {Array} numbers vertices
 */
function graphTraversals(numbers) {
    drawOrderOfTraversal(numbers);
    queue.push({ "code": "drawOrderOfTraversal(numbers); nextEmptyPlaceInArray = 0;" });
    queue.push({ "code": "document.querySelector('#preInPost').innerText = 'preorder';" });
    preorder(numbers[0], numbers);
    queue.push({ "code": "", "animation": 0 });

    queue.push({ "code": "drawOrderOfTraversal(numbers); nextEmptyPlaceInArray = 0;" });
    queue.push({ "code": "document.querySelector('#preInPost').innerText = 'inorder';" });
    inorder(numbers[0], numbers);
    queue.push({ "code": "", "animation": 0 });

    queue.push({ "code": "drawOrderOfTraversal(numbers); nextEmptyPlaceInArray = 0;" });
    queue.push({ "code": "document.querySelector('#preInPost').innerText = 'postorder';" });
    postorder(numbers[0], numbers);
    queue.push({ "code": "", "animation": 0 });

    queue.push({ "code": "document.querySelector('#preInPost').innerText = '';" });

    graphTraversalsAnimation(queue);
}


/**
 * Preorder traversal.
 * @param {HTMLElement} node node.
 * @param {Array} numbers vertices.
 */
function preorder(node, numbers) {
    queue.push({ "code": "var node = '" + node + "';", "animation": 1 });
    if (node !== undefined) {
        queue.push({ "code": "", "animation": 2 });

        queue.push({ "code": "node = '" + node + "';", "animation": 4 });
        preorder(numbers[numbers.indexOf(node) * 2 + 1], numbers);

        queue.push({ "code": "node = '" + node + "';", "animation": 5 });
        preorder(numbers[numbers.indexOf(node) * 2 + 2], numbers);
    } else {
        queue.push({ "code": "node = '" + node + "';", "animation": 3 });
    }
}


/**
 * Inorder traversal.
 * @param {HTMLElement} node node.
 * @param {Array} numbers vertices.
 */
function inorder(node, numbers) {
    queue.push({ "code": "var node = '" + node + "';", "animation": 6 });
    if (node !== undefined) {
        queue.push({ "code": "node = '" + node + "';", "animation": 7 });
        inorder(numbers[numbers.indexOf(node) * 2 + 1], numbers);

        queue.push({ "code": "node = '" + node + "';", "animation": 9 });

        queue.push({ "code": "node = '" + node + "';", "animation": 10 });
        inorder(numbers[numbers.indexOf(node) * 2 + 2], numbers);
    } else {
        queue.push({ "code": "", "animation": 8 });
    }
}


/**
 * Postorder traversal.
 * @param {HTMLElement} node node.
 * @param {Array} numbers vertices.
 */
function postorder(node, numbers) {
    queue.push({ "code": "var node = '" + node + "';", "animation": 11 });
    if (node !== undefined) {
        queue.push({ "code": "node = '" + node + "';", "animation": 12 });
        postorder(numbers[numbers.indexOf(node) * 2 + 1], numbers);

        queue.push({ "code": "node = '" + node + "';", "animation": 14 });
        postorder(numbers[numbers.indexOf(node) * 2 + 2], numbers);

        queue.push({ "code": "node = '" + node + "';", "animation": 15 });
    } else {
        queue.push({ "code": "", "animation": 13 });
    }
}


/**
 * Animation of the algorithms.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function graphTraversalsAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            for (let h = (numbers.length - 1); h < divs.length; h++) {
                divs[h].style.backgroundColor = "var(--background)";
                divs[h].style.border = "none";
            }
            graphTraversals(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation") && !codeLine.hasOwnProperty("tableAnimation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 0:
                for (let h = (numbers.length - 1); h < divs.length; h++) {
                    divs[h].style.backgroundColor = "var(--background)";
                    divs[h].style.border = "none";
                }
                await sleep(WAIT_TIME);
                break;
            case 1:
            case 5:
            case 6:
            case 10:
            case 11:
            case 14:
                if (numbers.indexOf(node) !== -1) {
                    for (let h = (numbers.length - 1); h < divs.length; h++) {
                        divs[h].style.border = "none";
                    }
                    divs[(numbers.length - 1) + numbers.indexOf(node)].style.border = "2px var(--animationColor2) solid";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 2:
            case 9:
            case 15:
                if (numbers.indexOf(node) !== -1) {
                    for (let h = (numbers.length - 1); h < divs.length; h++) {
                        divs[h].style.border = "none";
                    }
                    divs[(numbers.length - 1) + numbers.indexOf(node)].style.border = "2px var(--animationColor2) solid";
                    divs[(numbers.length - 1) + numbers.indexOf(node)].style.backgroundColor = "var(--animationColor1)";
                    graphArrayRepresentation.children[nextEmptyPlaceInArray++].innerText = node;
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
            case 7:
            case 12:
                if (numbers.indexOf(node) !== -1) {
                    divs[(numbers.length - 1) + numbers.indexOf(node)].style.border = "2px var(--animationColor2) solid";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
        }
    }

    for (let h = (numbers.length - 1); h < divs.length; h++) {
        divs[h].style.border = "none";
    }
    isAnimationRunning = false;
}


/**
 * Draw order of the current traversal.
 * @param {Array} numbers vertices.
 */
function drawOrderOfTraversal(numbers) {
    graphArrayRepresentation.innerHTML = "";
    numbers.forEach(num => {
        let td = document.createElement("td");
        td.setAttribute("style", "border: none; color: var(--white); background-color: transparent;");
        graphArrayRepresentation.appendChild(td);
    });
}


/**
 * Draw a single node at a given position.
 * @param {string} number text of the node.
 * @returns div
 */
function drawNode(number) {
    let square = document.createElement("div");
    square.setAttribute("class", "square");
    square.innerText = number;
    return square;
}