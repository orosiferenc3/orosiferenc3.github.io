/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const string = "(a+b*c/2)+(e*f^2^3-1)";
let stackDiv = document.querySelector("#stack");
let maxStackSize = 0;

if (prevWindowWidth < 768) {
    stackDiv = document.querySelector("#stack2");
} else {
    stackDiv = document.querySelector("#stack");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { postfixExpression(string); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { postfixExpression(string); } startNewAnimation = true; flag = true; });
postfixExpression(string);


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
            stackDiv = document.querySelector("#stack2");
            draw(string);
            clearStack();
            drawStack(maxStackSize);
        } else {
            squares = document.querySelector("#squares");
            stackDiv = document.querySelector("#stack");
            draw(string);
            clearStack();
            drawStack(maxStackSize);
        }

        // restart animation
        if (!isAnimationRunning) {
            postfixExpression(string);
        }
        startNewAnimation = true;
    }
});


/**
 * Draw characters.
 * @param {string} string string.
 */
function draw(string) {
    squares.innerHTML = "";
    Array.from(string).forEach(n => {
        let square = document.createElement("div");
        square.setAttribute("class", "square");
        square.setAttribute("style", "background-color: transparent; box-shadow: none;")
        square.innerText = n;
        squares.append(square);
    });
}


/**
 * Clear stack div before draw the stack.
 */
function clearStack() {
    stackDiv.innerHTML = "";
}


/**
 * Draw stack.
 * @param {number} k number of items to be placed in the stack.
 */
function drawStack(k) {
    let div = document.createElement("div");
    div.style.height = (k * squares.children[0].clientHeight) + "px";
    div.style.width = (squares.children[0].clientWidth * 2) + "px";
    div.style.borderBottom = "1px white solid";
    div.style.borderLeft = "1px white solid";
    div.style.borderRight = "1px white solid";
    div.style.margin = "auto";
    stackDiv.appendChild(div);

    // blank div
    document.querySelectorAll(".blankDiv").forEach(y => y.style.height = (squares.children[0].clientHeight + 10) + "px");
}


/**
 * The algorithm.
 * @param {string} string string.
 */
function postfixExpression(string) {
    let stringCopy = structuredClone(string);
    draw(stringCopy);

    let queue = [];

    queue.push({ "code": "var output = '';" });
    queue.push({ "code": "var stack = [];", "animation": 1 });
    queue.push({ "code": "var outputPos = 0;" });

    queue.push({ "code": "var divs = [];" });
    for (let i = 0; i < squares.children.length; i++) {
        queue.push({ "code": "divs.push({ div : squares.children[" + i + "]" + ", pos : " + i + "});" });
    }

    let output = "";
    let stack = [];
    while (stringCopy.length !== 0) {
        queue.push({ "code": "var x = divs.shift();", "animation": 2 });
        let x = stringCopy.substr(0, 1);
        stringCopy = stringCopy.substr(1);

        if (x === '(') {
            queue.push({ "code": "", "animation": 4 });
            queue.push({ "code": "stack.push(x);", "animation": 8 });
            stack.push(x);

            if (stack.length > maxStackSize) {
                maxStackSize = stack.length;
            }
        } else if (x === ')') {
            queue.push({ "code": "", "animation": 5 });

            while (stack[stack.length - 1] !== '(') {
                queue.push({ "code": "", "animation": 9 });
                queue.push({ "code": "", "animation": 11 });
                queue.push({ "code": "output += stack.pop();" });
                queue.push({ "code": "outputPos++;" });
                output += stack.pop();
            }
            queue.push({ "code": "", "animation": 14 });
            queue.push({ "code": "stack.pop();" });
            stack.pop();
        } else if (isOperator(x)) {
            queue.push({ "code": "", "animation": 6 });
            queue.push({ "code": "", "animation": 10 });
            if (isLeftRightOperator(x)) {
                while (stack.length !== 0 && stack[stack.length - 1] !== '(' && priority(stack[stack.length - 1]) >= priority(x)) {
                    queue.push({ "code": "", "animation": 12 });
                    queue.push({ "code": "", "animation": 15 });
                    queue.push({ "code": "output += stack.pop();" });
                    queue.push({ "code": "outputPos++;" });
                    output += stack.pop();
                }
                queue.push({ "code": "stack.push(x);", "animation": 17 });
                stack.push(x);

                if (stack.length > maxStackSize) {
                    maxStackSize = stack.length;
                }
            } else {
                while (stack.length !== 0 && stack[stack.length - 1] !== '(' && priority(stack[stack.length - 1]) > priority(x)) {
                    queue.push({ "code": "", "animation": 13 });
                    queue.push({ "code": "", "animation": 16 });
                    queue.push({ "code": "output += stack.pop();" });
                    queue.push({ "code": "outputPos++;" });
                    output += stack.pop();
                }
                queue.push({ "code": "stack.push(x);", "animation": 18 });
                stack.push(x);

                if (stack.length > maxStackSize) {
                    maxStackSize = stack.length;
                }
            }
        } else {
            queue.push({ "code": "", "animation": 3 });
            queue.push({ "code": "output += x;", "animation": 7 });
            queue.push({ "code": "outputPos++;" });
            output += x;
        }
    }

    while (stack.length !== 0) {
        queue.push({ "code": "", "animation": 19 });
        queue.push({ "code": "", "animation": 20 });
        queue.push({ "code": "output += stack.pop();" });
        queue.push({ "code": "outputPos++;" });
        output += stack.pop();
    }

    queue.push({ "code": "delete outputPos;" });
    queue.push({ "code": "delete output;" });
    queue.push({ "code": "delete stack;" });
    queue.push({ "code": "delete divs;" });

    clearStack();
    drawStack(maxStackSize);
    postfixExpressionAnimation(queue);
}


/**
 * Decide if the given character is an operator.
 * @param {string} x a character.
 * @returns true if the character is an operator, otherwise false.
 */
function isOperator(x) {
    if (x === '+' || x === '-' || x === '*' || x === '/' || x === '^' || x === '=') {
        return true;
    }
    return false;
}


/**
 * Decide if the given operator is an left-right operator.
 * @param {string} x a operator.
 * @returns true if the operator is an left-right operator, otherwise false.
 */
function isLeftRightOperator(x) {
    if (x === '+' || x === '-' || x === '*' || x === '/') {
        return true;
    }
    return false;
}


/**
 * Decide the priority of the given operator.
 * @param {string} x an operator.
 * @returns priority of the given operator.
 */
function priority(x) {
    switch (x) {
        case '=':
            return 1;
        case '+':
            return 2;
        case '-':
            return 2;
        case '*':
            return 3;
        case '/':
            return 3;
        case '^':
            return 4;
    }
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function postfixExpressionAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            postfixExpression(string);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 5:
                x.div.style.visibility = "hidden";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                putBackAnimation(x.div, x.pos, outputPos);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 8:
                putInStackAnimation(x.div, x.pos, maxStackSize - (stack.length - 1), Math.floor(squares.children.length / 2));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 11:
                putBackAnimation(stack[stack.length - 1].div, stack[stack.length - 1].pos, outputPos);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 14:
                stack[stack.length - 1].div.style.visibility = "hidden";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 15:
                putBackAnimation(stack[stack.length - 1].div, stack[stack.length - 1].pos, outputPos);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 16:
                putBackAnimation(stack[stack.length - 1].div, stack[stack.length - 1].pos, outputPos);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 17:
                putInStackAnimation(x.div, x.pos, maxStackSize - (stack.length - 1), Math.floor(squares.children.length / 2));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 18:
                putInStackAnimation(x.div, x.pos, maxStackSize - (stack.length - 1), Math.floor(squares.children.length / 2));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 20:
                putBackAnimation(stack[stack.length - 1].div, stack[stack.length - 1].pos, outputPos);
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

    isAnimationRunning = false;
}


/**
 * Put item into stack animation.
 * @param {HTMLElement} div div that will be placed in the stack.
 * @param {number} originalPosition original position of div.
 * @param {number} whichList in which position the div will be.
 * @param {number} positionInList position in x axis.
 */
function putInStackAnimation(div, originalPosition, whichList, positionInList) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    // calculate size of a circle
    let squareHeight = window.getComputedStyle(div, null).getPropertyValue('height');
    squareHeight = parseFloat(squareHeight.toString().slice(0, squareHeight.length - 2));

    let blankDivHeight = (document.querySelectorAll(".blankDiv")[0].clientHeight === 0 ? document.querySelectorAll(".blankDiv")[1].clientHeight : document.querySelectorAll(".blankDiv")[0].clientHeight);

    anime({
        targets: div,
        keyframes: [
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + positionInList * (2 * marginSize + squareWidth) },
            { translateY: squareHeight * whichList + blankDivHeight },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}


/**
 * Take item out from stack animation.
 * @param {HTMLElement} div div that will be placed back.
 * @param {number} originalPosition original position of div.
 * @param {number} posInList position after take out from stack.
 */
function putBackAnimation(div, originalPosition, posInList) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateY: squares.children[0].clientHeight + (2 * marginSize) },
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + posInList * (2 * marginSize + squareWidth) },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}