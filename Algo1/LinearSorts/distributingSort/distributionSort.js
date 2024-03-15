/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const r = 4;
const d = 3;
const numbers = ["103", "232", "111", "013", "211", "002", "012"];

let lists;
if (prevWindowWidth < 768) {
    lists = document.querySelector("#lists2");
} else {
    lists = document.querySelector("#lists");
}
document.querySelector("#lists").style.height = 70 * r + 20 + "px";
document.querySelector("#lists2").style.height = 70 * r + 20 + "px";

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { distributionSort(numbers, r, d); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { distributionSort(numbers, r, d); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "számjegy, ami szerint már rendezve vannak a számok", "color": "var(--animationColor1)" }, { "description": "számjegy, ami szerint vizsgáljuk a számokat", "color": "var(--animationColor2)" }]);
distributionSort(numbers, r, d);


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
            distributionSort(numbers, r, d);
        }
        startNewAnimation = true;
    }
});


/**
 * Draw circles.
 * @param {number} colorizeFrom colorize a part of the number from the given index.
 * @param {Array} numbers array of numbers.
 */
function draw(colorizeFrom, numbers) {
    squares.innerHTML = "";
    numbers.forEach(n => {
        let span1 = document.createElement("span");
        span1.setAttribute("style", "color : var(--animationColor2)");
        span1.innerText = n.slice(colorizeFrom, colorizeFrom + 1);
        
        let span2 = document.createElement("span");
        span2.setAttribute("style", "color : var(--animationColor1)");
        span2.innerText = n.slice(colorizeFrom + 1);

        let square = document.createElement("div");
        square.setAttribute("class", "square");
        square.append(n.slice(0, colorizeFrom));
        square.append(span1);
        square.append(span2);
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
    div.innerText = "$B_" + k + " = $";
    lists.appendChild(div);
}


/**
 * The algorithm.
 * @param {Array} numbers numbers.
 * @param {number} r amount of numbers that could be occur.
 * @param {number} d length of numbers.
 */
function distributionSort(numbers, r, d) {
    let numbersCopy = structuredClone(numbers);

    let queue = [];
    queue.push({ "code": "var numbersCopy = structuredClone(numbers);" });
    queue.push({ "code": "var i;" });
    queue.push({ "code": "var d = " + d + ";" });
    queue.push({ "code": "clearLists();" });

    for (let i = 1; i <= d; i++) {
        queue.push({ "code": "i = " + i + ";" });
        queue.push({ "code": "draw(d - i, numbersCopy);", "animation": 1 });

        queue.push({ "code": "var divs = Array.from(squares.children);" });
        queue.push({ "code": "var j = 0;", "animation": 2 });
        for (let j = 0; j < numbers.length; j++) {
            queue.push({ "code": "j = " + j + ";" });
            queue.push({ "code": 'divs[j] = { "div" : squares.children[j], "pos" : j };' });
        }
        queue.push({ "code": "delete j;" });


        let B = [];
        queue.push({ "code": "var Bdivs = [];", "animation": 3 });
        queue.push({ "code": "var k = 0;" });
        for (let k = 0; k < r; k++) {
            queue.push({ "code": "k = " + k + ";", "animation": 4 });
            B.push([]);
            queue.push({ "code": "drawList(" + k + "); MathJax.typeset();" });
            queue.push({ "code": "Bdivs.push([]);", "animation": 5 });
        }
        queue.push({ "code": "delete k;" });

        while (numbersCopy.length !== 0) {
            queue.push({ "code": "", "animation": 6 });
            queue.push({ "code": "var x = numbersCopy.shift();" });
            let x = numbersCopy.shift();
            B[phi(x, (d - i))].push(x);

            queue.push({ "code": "var xDiv = divs.shift();", "animation": 7 });
            queue.push({ "code": "Bdivs[phi(x, (d - i))].push(xDiv);", "animation": 8 });
            queue.push({ "code": "delete xDiv;" });
        }

        queue.push({ "code": "var divsCounter = numbers.length;" });
        queue.push({ "code": "var k = 0;" });
        for (let k = r - 1; k >= 0; k--) {
            queue.push({ "code": "k = " + k + ";", "animation": 9 });
            numbersCopy = B[k].concat(numbersCopy);
            queue.push({ "code": "divs = Bdivs[k].concat(divs);" });

            if (B[k].length !== 0) {
                queue.push({ "code": "divsCounter -= Bdivs[k].length;", "animation": 10 });
            }
        }
        numbersCopy.forEach(y => queue.push({ "code": "numbersCopy.push(\"" + y + "\");" }));
        queue.push({ "code": "clearLists();" });
        queue.push({ "code": "delete k;" });
        queue.push({ "code": "delete divsCounter;" });
        queue.push({ "code": "delete divs;" });
    }
    queue.push({ "code": "delete numbersCopy;" });

    distributionSortAnimation(queue);
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
async function distributionSortAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            distributionSort(numbers, 4, 3);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 8:
                putInListAnimation(xDiv.div, xDiv.pos, phi(x, (d - i)), Bdivs[phi(x, (d - i))].length - 1);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
                putBackAnimation(Bdivs[k], divsCounter);
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

    Array.from(squares.children).forEach(div => {
        div.innerText = div.children[0].innerText + div.children[1].innerText;
    });

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