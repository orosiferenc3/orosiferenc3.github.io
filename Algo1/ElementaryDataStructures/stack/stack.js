/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [79, 13, 16, 20, 89, 21, 43];
let stackDiv;
const stackSize = 5;

if (prevWindowWidth < 768) {
    stackDiv = document.querySelector("#stack2");
} else {
    stackDiv = document.querySelector("#stack");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { stackPushAndPop(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { stackPushAndPop(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "aktuálisan vizsgált elem", "color": "var(--animationColor1)" }]);
stackPushAndPop(numbers);


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
            draw(...numbers);
            drawStack(stackSize);
        } else {
            squares = document.querySelector("#squares");
            stackDiv = document.querySelector("#stack");
            draw(...numbers);
            drawStack(stackSize);
        }

        // restart animation
        if (!isAnimationRunning) {
            stackPushAndPop(numbers);
        }
        startNewAnimation = true;
    }
});


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
    clearStack();
    let div = document.createElement("div");
    div.style.height = (k * squares.children[0].clientHeight) + "px";
    div.style.width = (squares.children[0].clientWidth * 2) + "px";
    div.style.borderBottom = "1px white solid";
    div.style.borderLeft = "1px white solid";
    div.style.borderRight = "1px white solid";
    div.style.margin = "auto";
    stackDiv.appendChild(div);
}


/**
 * The algorithm.
 * @param {Array} numbers numbers.
 */
function stackPushAndPop(numbers) {
    let numbersCopy = structuredClone(numbers);
    draw(...numbersCopy);
    drawStack(stackSize);

    let queue = [];
    queue.push({ "code": "var numbersCopy = [" + numbersCopy + "];" });

    let n = -1;
    let stack = new Array(stackSize);
    queue.push({ "code": "var n = -1;" });
    queue.push({ "code": "var stack = new Array(stackSize);" });

    for (let i = 0; i < numbersCopy.length; i++) {
        queue.push({ "code": "var i = " + i + ";" });
        queue.push({ "code": "", "animation": 1 });
        if (stack.length > (n + 1)) {
            queue.push({ "code": "n++;", "animation": 4 });
            queue.push({ "code": "stack[n] = divs[i];", "animation": 2 });
            n++;
            stack[n] = numbersCopy[i];
        } else {
            queue.push({ "code": "", "animation": 3 });
        }
        queue.push({ "code": "delete i;" });
    }

    queue.push({ "code": "var i = 0;", "animation": 0 });
    while (stack.length !== 0) {
        queue.push({ "code": "", "animation": 5 });
        if (n > -1) {
            queue.push({ "code": "n--;", "animation": 6 });
            queue.push({ "code": "", "animation": 8 });
            n--;
            stack.pop();
        } else {
            queue.push({ "code": "", "animation": 7 });
        }
        queue.push({ "code": "i++;" });
    }
    queue.push({ "code": "delete i;" });

    queue.push({ "code": "delete n;" });
    queue.push({ "code": "delete stack;" });
    queue.push({ "code": "delete numbersCopy;" });

    stackAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function stackAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            stackPushAndPop(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 0:
                for (let h = 0; h < divs.length; h++) {
                    divs[h].style.backgroundColor = "var(--background)";
                }
                break;
            case 1:
                for (let h = 0; h < divs.length; h++) {
                    divs[h].style.backgroundColor = "var(--background)";
                }
                divs[i].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                putInStackAnimation(divs[i], i, stack.length - i, Math.floor(divs.length / 2));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 6:
                for (let h = 0; h < divs.length; h++) {
                    divs[h].style.backgroundColor = "var(--background)";
                }
                divs[stack.length - i - 1].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 8:
                putBackAnimation(stack[n + 1], (stack.length - i - 1), i);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 8) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }

    for (let h = 0; h < divs.length; h++) {
        divs[h].style.backgroundColor = "var(--background)";
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

    anime({
        targets: div,
        keyframes: [
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + positionInList * (2 * marginSize + squareWidth) },
            { translateY: squareWidth * whichList + (squareWidth / 2) },
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
            { translateY: 0 },
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + posInList * (2 * marginSize + squareWidth) },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}