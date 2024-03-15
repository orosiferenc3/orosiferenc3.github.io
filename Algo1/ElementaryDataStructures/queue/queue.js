/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [79, 13, 16, 20, 89, 21, 43];
let queueDiv;
const queueSize = 5;

if (prevWindowWidth < 768) {
    queueDiv = document.querySelector("#queue2");
} else {
    queueDiv = document.querySelector("#queue");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { queueAddAndRem(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { queueAddAndRem(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "aktuálisan vizsgált elem", "color": "var(--animationColor1)" }, { "description": "első elem a sorban", "color": "var(--animationColor2)" }]);
queueAddAndRem(numbers);


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
            queueDiv = document.querySelector("#queue2");
            draw(...numbers);
            drawQueue(queueSize);
        } else {
            squares = document.querySelector("#squares");
            queueDiv = document.querySelector("#queue");
            draw(...numbers);
            drawQueue(queueSize);
        }

        // restart animation
        if (!isAnimationRunning) {
            queueAddAndRem(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * Clear div which represents the queue.
 */
function clearQueue() {
    queueDiv.innerHTML = "";
}


/**
 * Draw div which represents the queue.
 * @param {number} k number of items that can be placed into the queue.
 */
function drawQueue(k) {
    clearQueue();
    let div = document.createElement("div");
    div.style.height = (squares.children[0].clientHeight * 2) + "px";
    div.style.width = (k * squares.children[0].clientWidth) + "px";
    div.style.borderBottom = "1px white solid";
    div.style.borderTop = "1px white solid";
    div.style.margin = "auto";
    queueDiv.appendChild(div);
}


/**
 * The algorithm.
 * @param {Array} numbers numbers.
 */
function queueAddAndRem(numbers) {
    let numbersCopy = structuredClone(numbers);
    draw(...numbersCopy);
    drawQueue(queueSize);

    let queue = [];
    queue.push({ "code": "var numbersCopy = [" + numbersCopy + "];" });

    let n = 0;
    let k = 0;
    let indexForAdd = 0;
    let indexForRem = 0;
    let q = new Array(queueSize).fill(null);

    queue.push({ "code": "var n = " + n + ";" });
    queue.push({ "code": "var k = " + k + ";" });
    queue.push({ "code": "var indexForAdd = " + indexForAdd + ";" });
    queue.push({ "code": "var indexForRem = " + indexForRem + ";" });
    queue.push({ "code": "var q = new Array(queueSize).fill(null);" });

    for (indexForAdd = 0; indexForAdd < q.length - 1; indexForAdd++) {
        queue.push({ "code": "", "animation": 1 });
        if (q.length > n) {
            queue.push({ "code": "q[(k + n) % q.length] = numbersCopy[indexForAdd];", "animation": 2 });
            queue.push({ "code": "n++;", "animation": 4 });
            q[(k + n) % q.length] = numbersCopy[indexForAdd];
            n++;
        } else {
            queue.push({ "code": "", "animation": 3 });
        }

        queue.push({ "code": "indexForAdd++;" });
    }

    for (indexForRem = 0; indexForRem < q.length - 2; indexForRem++) {
        queue.push({ "code": "", "animation": 5 });
        if (n > 0) {
            queue.push({ "code": "n--;", "animation": 6 });
            queue.push({ "code": "i = k;", "animation": 8 });
            queue.push({ "code": "k = (k+1) % q.length;", "animation": 9 });
            queue.push({ "code": "q[i] = null;", "animation": 10 });

            n--;
            i = k;
            k = (k + 1) % q.length;
            q[i] = null;
        } else {
            queue.push({ "code": "", "animation": 7 });
        }

        queue.push({ "code": "indexForRem++;" });
    }

    while (indexForAdd < numbersCopy.length) {
        queue.push({ "code": "", "animation": 1 });
        if (q.length > n) {
            queue.push({ "code": "q[(k + n) % q.length] = numbersCopy[indexForAdd];", "animation": 2 });
            queue.push({ "code": "n++;", "animation": 4 });
            q[(k + n) % q.length] = numbersCopy[indexForAdd];
            n++;
        } else {
            queue.push({ "code": "", "animation": 3 });
        }

        queue.push({ "code": "indexForAdd++;" });
        indexForAdd++;
    }

    while (indexForRem < numbersCopy.length) {
        queue.push({ "code": "", "animation": 5 });
        if (n > 0) {
            queue.push({ "code": "n--;", "animation": 6 });
            queue.push({ "code": "i = k;", "animation": 8 });
            queue.push({ "code": "k = (k+1) % q.length;", "animation": 9 });
            queue.push({ "code": "q[i] = null;", "animation": 10 });

            n--;
            i = k;
            k = (k + 1) % q.length;
            q[i] = null;
        } else {
            queue.push({ "code": "", "animation": 7 });
        }

        queue.push({ "code": "indexForRem++;" });
        indexForRem++;
    }

    queue.push({ "code": "delete n;" });
    queue.push({ "code": "delete k;" });
    queue.push({ "code": "delete indexForAdd;" });
    queue.push({ "code": "delete indexForRem;" });
    queue.push({ "code": "delete q;" });

    queueAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function queueAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            queueAddAndRem(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 1:
                for (let h = 0; h < divs.length; h++) {
                    if (h !== indexForRem) {
                        divs[h].style.backgroundColor = "var(--background)";
                    }
                }
                divs[indexForAdd].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                if (indexForAdd % queueSize === k) {
                    divs[indexForAdd % queueSize].style.backgroundColor = "var(--animationColor2)";
                }
                break;
            case 2:
                putInQueueAnimation(divs[indexForAdd], indexForAdd, ((k + n) % q.length));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                for (let h = 0; h < divs.length; h++) {
                    if (h !== indexForRem) {
                        divs[h].style.backgroundColor = "var(--background)";
                    }
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 6:
                divs[indexForRem].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
                if (indexForRem + 1 < divs.length) {
                    divs[indexForRem + 1].style.backgroundColor = "var(--animationColor2)";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
                putBackAnimation(divs[indexForRem], indexForRem, indexForRem);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 10) {
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
 * Put item into queue animation.
 * @param {HTMLElement} div item.
 * @param {number} originalPosition position of the item before the animation.
 * @param {number} positionInList item's position in queue.
 */
function putInQueueAnimation(div, originalPosition, positionInList) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + (numbers.length - 1) * (2 * marginSize + squareWidth) },
            { translateY: squares.children[0].clientHeight + queueDiv.clientHeight / 2 },
            { translateX: (queueDiv.clientWidth - (squares.children[0].clientWidth * queueSize)) / 2 + (-marginSize + originalPosition * -(2 * marginSize + squareWidth)) + (positionInList * squareWidth) },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}


/**
 * Remove item from queue animation.
 * @param {HTMLElement} div item.
 * @param {number} originalPosition position of the item before the animation.
 */
function putBackAnimation(div, originalPosition) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + 0 * (2 * marginSize + squareWidth) },
            { translateY: 0 },
            { translateX: 0 },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}