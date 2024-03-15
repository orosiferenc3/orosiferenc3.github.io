/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [34, 32, 25, 18, 43, 38, "32'"];
let numbersCopy = structuredClone(numbers);
let queue = [];
document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { quickSortStart(0, numbers.length - 1); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { quickSortStart(0, numbers.length - 1); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "helyén van", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált elemek", "color": "var(--animationColor2)" }, { "description": "pivot elem", "color": "var(--animationColor3)" }, { "description": "i", "color": "var(--animationColor4)" }, { "description": "j", "color": "var(--animationColor5)" }]);

let positionsArray;
quickSortStart(0, numbers.length - 1);


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
            draw(...numbers);
        } else {
            squares = document.querySelector("#squares");
            draw(...numbers);
        }

        // restart animation
        if (!isAnimationRunning) {
            quickSortStart(0, numbers.length - 1);
        }
        startNewAnimation = true;
    }
});

/**
 * Start algorithm of quicksort.
 * @param {*} p start index.
 * @param {*} r end index.
 */
function quickSortStart(p, r) {
    queue = [];
    positionsArray = Array(numbersCopy.length).fill(0);
    draw(...numbersCopy);
    quickSort(p, r);

    numbersCopy = structuredClone(numbers);
    quickSortAnimation(queue);
}


/**
 * The algorithm.
 * @param {*} p start index.
 * @param {*} r end index.
 */
function quickSort(p, r) {
    queue.push({ "code": "var p = " + p });
    queue.push({ "code": "var r = " + r });
    queue.push({ "code": "", "animation": 1 });
    queue.push({ "code": "", "animation": 2 });
    if (p < r) {
        queue.push({ "code": "", "animation": 3 });
        let q = partition(p, r);

        queue.push({ "code": "", "animation": 5 });
        quickSort(p, (q - 1));

        queue.push({ "code": "", "animation": 6 });
        quickSort((q + 1), r);
    } else {
        queue.push({ "code": "", "animation": 4 });
    }
}


/**
 * Part of the algorithm.
 * @param {*} p start index.
 * @param {*} r end index.
 * @returns 
 */
function partition(p, r) {
    let i = Math.floor(Math.random() * (r - p + 1)) + p;
    queue.push({ "code": "var i = " + i + ";", "animation": 7 });

    let x = numbersCopy[i];
    queue.push({ "code": "var x = numbersCopy[i];" });

    numbersCopy[i] = numbersCopy[r];
    queue.push({ "code": "numbersCopy[i] = numbersCopy[r];", "animation": 9 });
    queue.push({
        "code": `let tmp = positionsArray[i];
                        positionsArray[i] = positionsArray[r];
                        positionsArray[r] = tmp;` });
    queue.push({
        "code": `let tmp = divs[i];
                        divs[i] = divs[r];
                        divs[r] = tmp;` });

    i = p;
    queue.push({ "code": "i = p;", "animation": 10 });

    while (i < r && parseInt(numbersCopy[i]) <= parseInt(x)) {
        i++;
        queue.push({ "code": "", "animation": 11 });
        queue.push({ "code": "i++;", "animation": 12 });
    }

    queue.push({ "code": "", "animation": 13 });
    if (i < r) {
        let j = i + 1;
        queue.push({ "code": "var j = i + 1;", "animation": 14 });
        while (j < r) {
            queue.push({ "code": "", "animation": 16 });
            queue.push({ "code": "", "animation": 17 });
            if (parseInt(numbersCopy[j]) < parseInt(x)) {
                let tmp = numbersCopy[i];
                numbersCopy[i] = numbersCopy[j];
                numbersCopy[j] = tmp;

                queue.push({
                    "code": `let tmp = numbersCopy[i];
                numbersCopy[i] = numbersCopy[j];
                numbersCopy[j] = tmp;`, "animation": 18
                });
                queue.push({
                    "code": `let tmp = positionsArray[i];
                positionsArray[i] = positionsArray[j];
                positionsArray[j] = tmp;` });
                queue.push({
                    "code": `let tmp = divs[i];
                divs[i] = divs[j];
                divs[j] = tmp;` });

                i++;
                queue.push({ "code": "i++;", "animation": 20 });
            } else {
                queue.push({ "code": "", "animation": 19 });
            }
            j++;
            queue.push({ "code": "j++;", "animation": 21 });
        }
        numbersCopy[r] = numbersCopy[i];
        numbersCopy[i] = x;
        queue.push({ "code": "numbersCopy[r] = numbersCopy[i];" });
        queue.push({ "code": "numbersCopy[i] = x;", "animation": 23 });
        queue.push({
            "code": `let tmp = positionsArray[i];
                        positionsArray[i] = positionsArray[r];
                        positionsArray[r] = tmp;` });
        queue.push({
            "code": `let tmp = divs[i];
                            divs[i] = divs[r];
                            divs[r] = tmp;` });
    } else {
        numbersCopy[r] = x;
        queue.push({ "code": "numbersCopy[r] = x;", "animation": 15 });
    }
    queue.push({ "code": "", "animation": 24 });
    return i;
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function quickSortAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            quickSortStart(0, numbers.length - 1);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 3:
                for (let h = p; h <= r; h++) {
                    divs[h].style.backgroundColor = "var(--animationColor2)";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 6:
                for (let h = p; h <= r; h++) {
                    divs[h].style.backgroundColor = "var(--animationColor1)";
                }
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                divs[i].style.border = "3px solid var(--animationColor3)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
                swapAnimation(divs, divs[i], i, divs[r], r);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
                divs[i].style.backgroundColor = "var(--animationColor4)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 12:
                if (i - 1 >= 0) {
                    divs[i - 1].style.backgroundColor = "var(--animationColor2)";
                }
                divs[i].style.backgroundColor = "var(--animationColor4)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 14:
                divs[j].style.backgroundColor = "var(--animationColor5)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 15:
                divs[r].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 18:
                swapAnimation(divs, divs[i], i, divs[j], j);
                divs[j].style.backgroundColor = "var(--animationColor4)";
                divs[i].style.backgroundColor = "var(--animationColor5)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 20:
                if (i - 1 >= 0) {
                    divs[i - 1].style.backgroundColor = "var(--animationColor2)";
                }
                divs[i].style.backgroundColor = "var(--animationColor4)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 21:
                if (j - 1 >= 0 && j - 1 !== i) {
                    divs[j - 1].style.backgroundColor = "var(--animationColor2)";
                }
                divs[j].style.backgroundColor = "var(--animationColor5)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 23:
                swapAnimation(divs, divs[i], i, divs[r], r);
                divs[r].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 24:
                for (let h = 0; h < divs.length; h++) {
                    if (divs[h].style.backgroundColor !== "var(--animationColor1)") {
                        divs[h].style.backgroundColor = "var(--background)";
                    }
                }
                divs[i].style.border = "none";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 24) {
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