/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = ['0.79', '0.13', '0.16', '0.64', '0.39', '0.20', '0.89', '0.53', '0.72', '0.73'];
let lists;
if (prevWindowWidth < 768) {
    lists = document.querySelector("#lists2");
} else {
    lists = document.querySelector("#lists");
}
document.querySelector("#lists").style.height = 70 * numbers.length + 20 + "px";
document.querySelector("#lists2").style.height = 70 * numbers.length + 20 + "px";

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { bucketSort(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { bucketSort(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "az adott lista rendezés alatt áll", "color": "var(--animationColor1)" }, { "description": "helyén van a szám", "color": "var(--animationColor2)" }]);
bucketSort(numbers);


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
            lists = document.querySelector("#lists2");
        } else {
            squares = document.querySelector("#squares");
            lists = document.querySelector("#lists");
        }

        // restart animation
        if (!isAnimationRunning) {
            bucketSort(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * Draw circles.
 * @param {number} colorizeFrom colorize a part of the number from the given index.
 * @param {Array} numbers array of numbers.
 */
function draw(colorize, numbers) {
    squares.innerHTML = "";
    numbers.forEach(n => {
        let span = document.createElement("span");
        span.setAttribute("style", "color : yellow");
        span.innerText = n.slice(colorize, colorize + 1);

        let square = document.createElement("div");
        square.setAttribute("class", "square");
        square.append(n.slice(0, colorize));
        square.append(span);
        square.append(n.slice(colorize + 1, n.length));
        squares.append(square);
    });
}


/**
 * Clear lists div.
 */
function clearLists() {
    lists.innerHTML = "";
}


/**
 * Draw a list.
 * @param {number} k number that identify the list.
 */
function drawList(k) {
    let div = document.createElement("div");
    div.setAttribute("class", "list");
    div.innerText = "$B[" + k + "] = $";
    lists.appendChild(div);
}


/**
 * The algorithm.
 * @param {Array} numbers numbers array.
 */
function bucketSort(numbers) {
    let numbersCopy = structuredClone(numbers);
    let n = numbersCopy.length;
    let B = [];

    let queue = [];
    queue.push({ "code": "clearLists();" });
    queue.push({ "code": "var numbersCopy = structuredClone(numbers);" });
    queue.push({ "code": "draw(2, numbersCopy);" });
    queue.push({ "code": "var n = numbersCopy.length;", "animation": 1 });
    queue.push({ "code": "var B = [];", "animation": 2 });
    queue.push({ "code": "var Bdivs = [];" });
    queue.push({ "code": "var divs = Array.from(squares.children);" });
    for (let j = 0; j < numbersCopy.length; j++) {
        queue.push({ "code": "var j = " + j + ";" });
        queue.push({ "code": 'divs[j] = { "div" : squares.children[j], "pos" : j };' });
        queue.push({ "code": "delete j;" });
    }

    for (let j = 0; j < n; j++) {
        queue.push({ "code": "var j = " + j + ";", "animation": 3 });
        B[j] = [];
        queue.push({ "code": "B[j] = [];", "animation": 4 });
        queue.push({ "code": "Bdivs[j] = [];" });
        queue.push({ "code": "delete j;" });
    }

    while (numbersCopy.length !== 0) {
        queue.push({ "code": "", "animation": 5 });

        let firstElement = numbersCopy.shift();
        B[Math.floor(parseFloat(firstElement) * 10)].push(firstElement);

        queue.push({ "code": "var firstElement = numbersCopy.shift();", "animation": 6 });
        queue.push({ "code": "var firstElementDiv = divs.shift();" });
        queue.push({ "code": "B[Math.floor(parseFloat(firstElement) * 10)].push(firstElement);", "animation": 7 });
        queue.push({ "code": "Bdivs[Math.floor(parseFloat(firstElement) * 10)].push(firstElementDiv);" });
        queue.push({ "code": "delete firstElement;" });
    }

    for (let j = 0; j < (n - 1); j++) {
        queue.push({ "code": "var j = " + j + ";", "animation": 8 });
        if (B[j].length !== 0) {
            queue.push({ "code": "", "animation": 9 });
        }

        queue.push({ "code": "delete j;" });
    }

    queue.push({ "code": "var divsCounter = numbers.length;" });
    for (let j = (n - 1); j >= 0; j--) {
        queue.push({ "code": "var j = " + j + ";", "animation": 10 });
        numbersCopy = B[j].concat(numbersCopy);

        if (B[j].length !== 0) {
            queue.push({ "code": "divsCounter -= Bdivs[j].length;", "animation": 11 });
        }
        queue.push({ "code": "delete j;" });
    }

    queue.push({ "code": "delete n;" });
    queue.push({ "code": "delete B;" });
    queue.push({ "code": "delete Bdivs;" });
    queue.push({ "code": "delete divs;" });

    bucketSortAnimation(queue);
}


/**
 * Get indexed character of string.
 * @param {string} x string. 
 * @param {number} i index.
 * @returns indexed character of string.
 */
function phi(x, i) {
    return parseInt(x.charAt(i));
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function bucketSortAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            bucketSort(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 4:
                drawList(j);
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                putInListAnimation(firstElementDiv.div, firstElementDiv.pos, Math.floor(parseFloat(firstElement) * 10), Bdivs[Math.floor(parseFloat(firstElement) * 10)].length);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
                for (let h = 0; h < Bdivs[j].length; h++) {
                    Bdivs[j][h].div.style.backgroundColor = "var(--animationColor1)";
                }
                for (let g = B[j].length - 1; g >= 0; g--) {
                    for (let k = 0; k < g; k++) {
                        if (parseFloat(B[j][k]) > parseFloat(B[j][k + 1])) {
                            putInListAnimation(Bdivs[j][k].div, Bdivs[j][k].pos, Math.floor(parseFloat(B[j][k]) * 10), (k + 1));
                            putInListAnimation(Bdivs[j][k + 1].div, Bdivs[j][k + 1].pos, Math.floor(parseFloat(B[j][k + 1]) * 10), k);
                            let tmpDiv = Bdivs[j][k];
                            Bdivs[j][k] = Bdivs[j][k + 1];
                            Bdivs[j][k + 1] = tmpDiv;
                            let tmp = B[j][k];
                            B[j][k] = B[j][k + 1];
                            B[j][k + 1] = tmp;
                        }
                    }
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
                colorize(document.querySelector("#id10"));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id10"));
                break;
            case 11:
                for (let h = 0; h < Bdivs[j].length; h++) {
                    Bdivs[j][h].div.style.backgroundColor = "var(--animationColor2)";
                }
                putBackAnimation(Bdivs[j], divsCounter);
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 11) {
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
 * Put item into the correct list animation.
 * @param {HTMLElement} div div that will be placed in.
 * @param {number} originalPosition index of div before animation.
 * @param {number} whichList index of the list where div will be place.
 * @param {number} positionInList position of div in the list.
 */
function putInListAnimation(div, originalPosition, whichList, positionInList) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateX: originalPosition * -(2 * marginSize + squareWidth) + positionInList * (2 * marginSize + squareWidth) + lists.firstElementChild.clientWidth },
            { translateY: 105 + 70 * whichList },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}


/**
 * Take item back animation.
 * @param {HTMLElement} div div that will be placed back.
 * @param {number} posStartFrom from this postion, all divs will be placed back simultaneously.
 */
function putBackAnimation(divs, posStartFrom) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(divs[0].div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(divs[0].div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    let posInList = posStartFrom;
    for (let i = 0; i < divs.length; i++) {
        anime({
            targets: divs[i].div,
            keyframes: [
                { translateX: divs[i].pos * -(2 * marginSize + squareWidth) + posInList * (2 * marginSize + squareWidth) },
                { translateY: 0 },
            ],
            duration: WAIT_TIME,
            easing: 'easeOutElastic(1, .8)',
            loop: false
        });
        divs[i].pos = posInList++;
    }
}