/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [
    { "number": 24, "operation": 'i' },
    { "number": 16, "operation": 'i' },
    { "number": 57, "operation": 'i' },
    { "number": 32, "operation": 'i' },
    { "number": 15, "operation": 'i' },
    { "number": 57, "operation": 'd' },
    { "number": 21, "operation": 'i' },
    { "number": 2, "operation": 's' },
    { "number": 2, "operation": 'i' },
    { "number": 2, "operation": 'i' },
    { "number": 21, "operation": 's' },
    { "number": 35, "operation": 'i' },
    { "number": 15, "operation": 'd' },
    { "number": 35, "operation": 'i' },
];
let taskTable;
const m = 11;
let hashTable;
let queue;
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    taskTable = document.querySelector("#taskTable2 > tbody");
    createTaskTable();
} else {
    taskTable = document.querySelector("#taskTable > tbody");
    createTaskTable();
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { linearProbing(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { linearProbing(numbers); } startNewAnimation = true; flag = true; });
linearProbing(numbers);


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
            taskTable = document.querySelector("#taskTable2 > tbody");
            clearTaskTable();
            createTaskTable();
        } else {
            taskTable = document.querySelector("#taskTable > tbody");
            clearTaskTable();
            createTaskTable();
        }

        // restart animation
        if (!isAnimationRunning) {
            linearProbing(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * Clear whole table.
 */
function clearTaskTable() {
    taskTable.innerHTML = "";
}


/**
 * Create task table.
 */
function createTaskTable() {
    const headers = ["Művelet", "kulcs", "$h_{1}(k)$", "próbasorozat", "siker?"];

    let tableId;
    if (prevWindowWidth < 768) {
        tableId = "taskTable2";
    } else {
        tableId = "taskTable";
    }

    // first row
    let tr = document.createElement("tr");
    tr.style.backgroundColor = "yellow";
    for (let i = 0; i < headers.length; i++) {
        let td = document.createElement("td");
        td.innerText = headers[i];
        tr.appendChild(td);
    }

    for (let i = 0; i < m; i++) {
        let td = document.createElement("td");
        td.innerText = "$" + i + "$";
        tr.appendChild(td);
    }
    taskTable.appendChild(tr);

    // other rows
    for (let i = 0; i < numbers.length; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < m + 5; j++) {
            let td = document.createElement("td");

            if (j === 0) {
                td.innerText = "$" + numbers[i].operation + "$";
            } else if (j === 1) {
                td.innerText = "$" + numbers[i].number + "$";
            } else if (j === 2) {
                td.setAttribute("id", tableId + "h" + i);
            } else if (j === 3) {
                td.setAttribute("id", tableId + "tries" + i);
            } else if (j === 4) {
                td.setAttribute("id", tableId + "success" + i);
            } else {
                td.setAttribute("id", tableId + "num" + i + "_" + (j - 5));
            }

            tr.appendChild(td);
        }
        taskTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}


/**
 * The algorithm.
 * @param {Array} numbers inputs array.
 */
function linearProbing(numbers) {
    clearTaskTable();
    createTaskTable();

    queue = [];
    hashTable = new Array(m).fill('E');
    for (let k = 0; k < numbers.length; k++) {
        queue.push({ "code": "var k = " + k + ";" });
        switch (numbers[k].operation) {
            case 'i':
                linearProbingInsert(numbers[k].number);
                break;
            case 's':
                linearProbingSearch(numbers[k].number);
                break;
            case 'd':
                linearProbingDelete(numbers[k].number);
                break;
        }
        queue.push({ "code": "delete k;" });
    }

    // reset hash table for animation
    hashTable = new Array(m).fill('E');
    linearProbingAnimation(queue);
}


/**
 * Insert function of linear probe.
 * @param {number} x number that hopefully will be inserted into hash table.
 * @returns 
 */
function linearProbingInsert(x) {
    let j = hashFunction(x);
    let i = 0;
    let ide = -1;
    let tries = [];

    queue.push({ "code": "var x = " + x + ";" });
    queue.push({ "code": "var tries = [];" });
    queue.push({ "code": "var j = hashFunction(x);" });
    queue.push({ "code": "tries.push(j);", "animation": 1 });
    queue.push({ "code": "var i = 0;", "animation": 2 });
    queue.push({ "code": "var ide = -1;" });
    tries.push(j);

    while (i < m && hashTable[j] !== 'E' && hashTable[j] !== 'D') {
        queue.push({ "code": "", "animation": 3 });
        queue.push({ "code": "", "animation": 4 });
        if (hashTable[j] === x) {
            queue.push({ "code": "", "animation": 5 });
            return false;
        } else {
            i++;
            j = (j + 1) % m;
            tries.push(j);

            queue.push({ "code": "i++;", "animation": 6 });
            queue.push({ "code": "j = (j + 1) % m;" });
            queue.push({ "code": "tries.push(j);", "animation": 7 });
        }
    }

    queue.push({ "code": "", "animation": 8 });
    if (i < m) {
        ide = j;
        queue.push({ "code": "ide = j;", "animation": 9 });
    } else {
        queue.push({ "code": "", "animation": 10 });
        return false;
    }

    while (i < m && hashTable[j] !== 'E') {
        queue.push({ "code": "", "animation": 11 });
        queue.push({ "code": "", "animation": 12 });
        if (hashTable[j] === x) {
            queue.push({ "code": "", "animation": 13 });
            return false;
        } else {
            i++;
            j = (j + 1) % m;
            tries.push(j);

            queue.push({ "code": "i++;", "animation": 14 });
            queue.push({ "code": "j = (j + 1) % m;" });
            queue.push({ "code": "tries.push(j);", "animation": 15 });
        }
    }

    hashTable[ide] = x;
    queue.push({ "code": "hashTable[ide] = x;", "animation": 16 });
    queue.push({ "code": "", "animation": 17 });

    queue.push({ "code": "delete x;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete ide;" });
    queue.push({ "code": "delete tries;" });
    return true;
}


/**
 * Insert function of linear probe.
 * @param {number} x number that hopefully will be found in the hash table.
 * @returns 
 */
function linearProbingSearch(x) {
    let j = hashFunction(x);
    let i = 0;
    let tries = [];

    queue.push({ "code": "var x = " + x + ";" });
    queue.push({ "code": "var tries = [];" });
    queue.push({ "code": "var j = hashFunction(x);" });
    queue.push({ "code": "tries.push(j);", "animation": 18 });
    queue.push({ "code": "var i = 0;", "animation": 19 });

    tries.push(j);
    while (i < m && hashTable[j] !== 'E') {
        queue.push({ "code": "", "animation": 20 });
        queue.push({ "code": "", "animation": 21 });
        if (hashTable[j] === x) {
            queue.push({ "code": "", "animation": 22 });
            return j;
        } else {
            i++;
            j = (j + 1) % m;
            tries.push(j);

            queue.push({ "code": "i++;", "animation": 23 });
            queue.push({ "code": "j = (j + 1) % m;" });
            queue.push({ "code": "tries.push(j);", "animation": 24 });
        }
    }

    queue.push({ "code": "", "animation": 25 });

    queue.push({ "code": "delete x;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete tries;" });
    return -1;
}


/**
 * Insert function of linear probe.
 * @param {number} x number that hopefully will be removed from hash table.
 * @returns 
 */
function linearProbingDelete(x) {
    let j = hashFunction(x);
    let i = 0;
    let tries = [];

    queue.push({ "code": "var x = " + x + ";" });
    queue.push({ "code": "var tries = [];" });
    queue.push({ "code": "var j = hashFunction(x);" });
    queue.push({ "code": "tries.push(j);", "animation": 26 });
    queue.push({ "code": "var i = 0;", "animation": 27 });

    tries.push(j);
    while (i < m && hashTable[j] !== 'E') {
        queue.push({ "code": "", "animation": 28 });
        queue.push({ "code": "", "animation": 29 });
        if (hashTable[j] === x) {
            queue.push({ "code": "hashTable[j] = 'D';", "animation": 30 });
            queue.push({ "code": "", "animation": 32 });
            hashTable[j] = 'D';
            return j;
        } else {
            i++;
            j = (j + 1) % m;
            tries.push(j);

            queue.push({ "code": "i++;", "animation": 31 });
            queue.push({ "code": "j = (j + 1) % m;" });
            queue.push({ "code": "tries.push(j);", "animation": 33 });
        }
    }

    queue.push({ "code": "delete x;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete tries;" });
    return -1;
}


/**
 * Hash function of linear probe.
 * @param {number} k input number that will be tested.
 * @returns 
 */
function hashFunction(k) {
    return k % m;
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function linearProbingAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            linearProbing(numbers);
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
            case 1:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "h" + k).innerText = "$" + j + "$";
                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                document.querySelector("#" + tableId + "success" + k).innerText = "❌";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "red";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < m) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 7:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 10:
                document.querySelector("#" + tableId + "success" + k).innerText = "❌";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "red";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 13:
                document.querySelector("#" + tableId + "success" + k).innerText = "❌";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "red";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 15:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 16:
                document.querySelector("#" + tableId + "num" + k + "_" + ide).innerText = "$" + x + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 17:
                document.querySelector("#" + tableId + "success" + k).innerText = "✔";
                document.querySelector("#" + tableId + "num" + k + "_" + ide).style.backgroundColor = "green";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + ide).style.backgroundColor = "white";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                MathJax.typeset();
                break;
            case 18:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "h" + k).innerText = "$" + j + "$";
                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 22:
                document.querySelector("#" + tableId + "success" + k).innerText = "✔";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "green";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 24:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 25:
                document.querySelector("#" + tableId + "success" + k).innerText = "❌";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "red";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 26:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "h" + k).innerText = "$" + j + "$";
                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 30:
                document.querySelector("#" + tableId + "num" + k + "_" + j).innerText = "$" + hashTable[j] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 32:
                document.querySelector("#" + tableId + "success" + k).innerText = "✔";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "green";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            case 33:
                for (let h = 0; h < m; h++) {
                    document.querySelector("#" + tableId + "num" + k + "_" + h).style.backgroundColor = "white";
                }
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "yellow";

                document.querySelector("#" + tableId + "tries" + k).innerText = "$" + tries + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 34:
                document.querySelector("#" + tableId + "success" + k).innerText = "❌";
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "red";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#" + tableId + "num" + k + "_" + j).style.backgroundColor = "white";
                for (let h = 0; h < hashTable.length; h++) {
                    if (hashTable[h] !== 'E') {
                        if ((k + 1) < numbers.length) {
                            document.querySelector("#" + tableId + "num" + (k + 1) + "_" + h).innerText = "$" + hashTable[h] + "$";
                        }
                    }
                }
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 34) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }

    isAnimationRunning = false;
}