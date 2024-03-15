/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = ["11", "20", "10", "23", "21", "30"];
let taskTable;
if (prevWindowWidth < 768) {
    taskTable = document.querySelector("#taskTable2 > tbody");
} else {
    taskTable = document.querySelector("#taskTable > tbody");
}
const r = 4;
const d = 2;
let numbersCopy = structuredClone(numbers);

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { countingSort(numbers, r, d); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { countingSort(numbers, r, d); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "számjegy, amely szerint már rendezve van", "color": "var(--animationColor1)" }]);
countingSort(numbers, r, d);


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
        if (prevWindowWidth < 768) {
            squares = document.querySelector("#squares2");
            taskTable = document.querySelector("#taskTable2 > tbody");
            createTaskTable(numbers);
            draw(d, numbers);
        } else {
            squares = document.querySelector("#squares");
            taskTable = document.querySelector("#taskTable > tbody");
            createTaskTable(numbers);
            draw(d, numbers);
        }

        // restart animation
        if (!isAnimationRunning) {
            countingSort(numbers, r, d);
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
        let span = document.createElement("span");
        span.setAttribute("style", "color : var(--animationColor1)");
        span.innerText = n.slice(colorizeFrom);

        let square = document.createElement("div");
        square.setAttribute("class", "square");
        square.append(n.slice(0, colorizeFrom));
        square.append(span);
        squares.append(square);
    });
}


/**
 * Clear task table div.
 */
function clearTaskTable() {
    taskTable.innerHTML = "";
}


/**
 * Create tasks table with the given array.
 * @param {Array} numbers numbers array.
 */
function createTaskTable(numbers) {
    clearTaskTable();

    let tableId;
    if (prevWindowWidth < 768) {
        tableId = "taskTable2";
    } else {
        tableId = "taskTable";
    }

    // first row
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    tr.appendChild(td);

    td = document.createElement("td");
    td.innerText = "$C$";
    tr.appendChild(td);

    for (let j = 0; j < numbers.length; j++) {
        let td = document.createElement("td");
        td.innerText = "$" + numbers[j] + "$";
        tr.appendChild(td);
    }

    td = document.createElement("td");
    td.innerText = "$C$";
    tr.appendChild(td);

    td = document.createElement("td");
    td.innerText = "$\\sum$";
    tr.appendChild(td);

    for (let j = (numbers.length - 1); j >= 0; j--) {
        let td = document.createElement("td");
        td.innerText = "$" + numbers[j] + "$";
        tr.appendChild(td);
    }

    taskTable.appendChild(tr);

    // other rows
    for (let i = 0; i < r; i++) {
        tr = document.createElement("tr");
        for (let j = 0; j < (numbers.length * 2 + 4); j++) {
            if (j === 0) {
                let td = document.createElement("td");
                td.innerText = "$" + i + "$";
                tr.appendChild(td);
            } else if (j === 1) {
                let td = document.createElement("td");
                td.id = tableId + "C_1_" + i;
                tr.appendChild(td);
            } else if (j === numbers.length + 2) {
                let td = document.createElement("td");
                td.id = tableId + "C_2_" + i;
                tr.appendChild(td);
            } else if (j === numbers.length + 3) {
                let td = document.createElement("td");
                td.id = tableId + "Sum" + i;
                tr.appendChild(td);
            } else {
                let td = document.createElement("td");
                td.id = tableId + "td" + i + "_" + j;
                tr.appendChild(td);
            }
        }
        taskTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}


/**
 * The algorithm.
 * @param {Array} numbers numbers array.
 * @param {number} r amount of numbers that could be occur.
 * @param {number} d length of numbers.
 */
function countingSort(numbers, r, d) {
    let numbersCopy = structuredClone(numbers);
    createTaskTable(numbersCopy);
    draw(d, numbersCopy);

    let queue = [];

    queue.push({ "code": "var numbersCopy = structuredClone(numbers);" });
    for (let i = 1; i <= d; i++) {
        queue.push({ "code": "var i = " + i + ";", "animation": 1 });
        queue.push({ "code": "createTaskTable(numbersCopy);", "animation": 2 });
        let B = [];
        let C = [];
        queue.push({ "code": "var C = [];", "animation": 3 });
        queue.push({ "code": "var B = [];" });
        for (let k = 0; k < r; k++) {
            queue.push({ "code": "var k = " + k + ";", "animation": 4 });
            C[k] = 0;
            queue.push({ "code": "C[k] = 0;", "animation": 5 });
            queue.push({ "code": "delete k;" });
        }

        for (let j = 0; j < numbersCopy.length; j++) {
            queue.push({ "code": "var j = " + j + ";", "animation": 6 });
            C[phi(numbersCopy[j], (d - i))]++;
            queue.push({ "code": "C[phi(numbersCopy[j], (" + (d - i) + "))]++;", "animation": 7 });
            queue.push({ "code": "delete j;" });
        }

        queue.push({ "code": "", "animation": 0 });
        for (let k = 1; k < r; k++) {
            queue.push({ "code": "var k = " + k + ";", "animation": 8 });
            C[k] += C[k - 1];
            queue.push({ "code": "C[k] += C[k - 1];", "animation": 9 });
            queue.push({ "code": "delete k;" });
        }

        for (let j = (numbersCopy.length - 1); j >= 0; j--) {
            queue.push({ "code": "var j = " + j + ";", "animation": 10 });

            k = phi(numbersCopy[j], (d - i));
            C[k]--;
            B[C[k]] = numbersCopy[j];

            queue.push({ "code": "var k = phi(numbersCopy[j], (d - i));", "animation": 11 });
            queue.push({ "code": "C[k]--;", "animation": 12 });
            queue.push({ "code": "B[C[k]] = numbersCopy[j];", "animation": 13 });
            queue.push({ "code": "delete k;" });
            queue.push({ "code": "delete j;" });
        }

        numbersCopy = structuredClone(B);
        queue.push({ "code": "numbersCopy = structuredClone(B);" });
        queue.push({ "code": "draw((d - i), numbersCopy);" });
        queue.push({ "code": "delete C;" });
        queue.push({ "code": "delete B;" });
        queue.push({ "code": "delete i;" });
    }
    queue.push({ "code": "delete numbersCopy;" });

    numbersCopy = structuredClone(numbers);
    countingSortAnimation(queue);
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
async function countingSortAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            countingSort(numbers, r, d);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        let tableId;
        if (prevWindowWidth < 768) {
            tableId = "taskTable2";
        } else {
            tableId = "taskTable";
        }

        switch (codeLine.animation) {
            case 0:
                for (let h = 0; h < r; h++) {
                    document.querySelector("#" + tableId + "C_2_" + h).innerText = "$" + C[h] + "$";
                }
                MathJax.typeset();
                break;
            case 5:
                document.querySelector("#" + tableId + "C_1_" + k).innerText = "$0$";
                MathJax.typeset();
                colorize(document.querySelector("#id5"));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id5"));
                break;
            case 7:
                document.querySelector("#" + tableId + "td" + phi(numbersCopy[j], (d - i)) + "_" + (j + 2)).innerText = "$" + C[phi(numbersCopy[j], (d - i))] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id7"));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id7"));
                break;
            case 9:
                document.querySelector("#" + tableId + "Sum0").innerText = "$" + C[0] + "$";
                document.querySelector("#" + tableId + "Sum" + k).innerText = "$" + C[k] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id9"));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id9"));
                break;
            case 12:
                document.querySelector("#" + tableId + "td" + phi(numbersCopy[j], (d - i)) + "_" + ((numbers.length - j - 1) + 4 + numbers.length)).innerText = "$" + C[k] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 13) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }

    isAnimationRunning = false;
}