/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let queue;
let text = "ABABABABBABABABBAB";
let patternMatchingTable;
let initTable;
let pattern = "BABABBAB";
let rows = 0;
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
    initTable = document.querySelector("#initTable2 > tbody");
} else {
    patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
    initTable = document.querySelector("#initTable > tbody");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { KMP(text, pattern); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { KMP(text, pattern); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "összehasonlítás", "color": "var(--animationColor1)" }, { "description": "$P[j]$", "color": "var(--animationColor2)" }, { "description": "$P[i]$", "color": "var(--animationColor3)" }]);
KMP(text, pattern);


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
            document.querySelector("#patternMatchingTable > tbody").innerHTML = "";
            document.querySelector("#initTable > tbody").innerHTML = "";
            patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
            initTable = document.querySelector("#initTable2 > tbody");
            clear();
            generatePatternMatchingTable(text, pattern);
            generateInitTable(pattern);
        } else {
            document.querySelector("#patternMatchingTable2 > tbody").innerHTML = "";
            document.querySelector("#initTable2 > tbody").innerHTML = "";
            patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
            initTable = document.querySelector("#initTable > tbody");
            clear();
            generatePatternMatchingTable(text, pattern);
            generateInitTable(pattern);
        }

        // restart animation
        if (!isAnimationRunning) {
            KMP(text, pattern);
        }
        startNewAnimation = true;
    }
});


function clear() {
    initTable.innerHTML = "";
    patternMatchingTable.innerHTML = "";
}

function generateInitTable(pattern) {
    for (let i = 0; i < 3; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < pattern.length + 1; j++) {
            let td = document.createElement("td");
            td.innerText = "$ $";
            if (i === 0 && j === 0) {
                td.innerText = "$P[j-1]=$";
            } else if (i === 1 && j === 0) {
                td.innerText = "$j=$";
            } else if (i === 2 && j === 0) {
                td.innerText = "$\\pi(j)=$";
            } else if (i === 0 && j > 0) {
                td.innerText = "$" + pattern.charAt(j - 1) + "$";
                td.id = "initid" + (i - 1) + "_" + (j - 1);
            } else {
                td.id = "initid" + (i - 1) + "_" + (j - 1);
            }
            tr.appendChild(td);
        }
        patternMatchingTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}

function generatePatternMatchingTable(text, pattern) {
    for (let i = 0; i < rows + 2; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < text.length + 1; j++) {
            let td = document.createElement("td");
            if (i === 0 && j === 0) {
                td.innerText = "$i=$";
            } else if (i === 1 && j === 0) {
                td.innerText = "$T[i]=$";
            } else if (i === 0 && j > 0) {
                td.innerText = "$" + (j-1) + "$";
            } else if (i === 1 && j > 0) {
                td.innerText = "$" + text.charAt(j - 1) + "$";
                td.id = "id" + (i - 2) + "_" + (j - 1);
            } else {
                td.id = "id" + (i - 2) + "_" + (j - 1);
            }
            tr.appendChild(td);
        }
        initTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}

function init(pattern) {
    let next = [];
    next[0] = 0;
    let i = 0;
    let j = 1;
    let m = pattern.length;
    queue.push({ "code": "var next = [];" });
    queue.push({ "code": "", "animation": 17 });
    queue.push({ "code": "var i = " + i + ";", "animation": 18 });
    queue.push({ "code": "var j = " + j + ";", "animation": 19 });
    while (j < m) {
        queue.push({ "code": "", "animation": 20 });
        queue.push({ "code": "", "animation": 21 });
        if (pattern[i].toUpperCase() == pattern[j].toUpperCase()) {
            i++;
            next[j] = i;
            j++;
            queue.push({ "code": "i++;", "animation": 22 });
            queue.push({ "code": "j++;", "animation": 24 });
            queue.push({ "code": "next[j] = i;", "animation": 27 });
        } else {
            queue.push({ "code": "", "animation": 23 });
            if (i === 0) {
                next[j] = 0;
                j++;
                queue.push({ "code": "j++;", "animation": 25 });
                queue.push({ "code": "next[j] = 0;", "animation": 28 });
            } else {
                i = next[--i];
                queue.push({ "code": "i = " + i + ";", "animation": 26 });
            }
        }
        queue.push({ "code": "", "animation": 29 });
    }
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete i;" });
    return next;
}

function KMP(text, pattern) {
    queue = [];
    rows = 0;
    queue.push({ "code": "var r = " + rows + ";" });
    queue.push({ "code": "var s = 0;" });
    queue.push({ "code": "var equivalent;" });
    queue.push({ "code": "", "animation": 1 });
    queue.push({ "code": "", "animation": 2 });
    let next = init(pattern);
    let offsets = [];
    let n = text.length;
    let m = pattern.length;
    let i = 0;
    let j = 0;
    queue.push({ "code": "", "animation": 3 });
    queue.push({ "code": "var i = " + i + ";", "animation": 4 });
    queue.push({ "code": "var j = " + j + ";", "animation": 5 });
    while (i < n) {
        queue.push({ "code": "", "animation": 6 });
        queue.push({ "code": "equivalent = " + (text[i].toUpperCase() === pattern[j].toUpperCase()) + ";", "animation": 7 });
        if (text[i].toUpperCase() === pattern[j].toUpperCase()) {
            i++;
            j++;
            queue.push({ "code": "i++;", "animation": 8 });
            queue.push({ "code": "j++;", "animation": 10 });
            queue.push({ "code": "", "animation": 13 });
            if (j === m) {
                offsets.push(i - m);
                j = next[m - 1];
                queue.push({ "code": "s = " + (i - m) + ";", "animation": 14 });
                queue.push({ "code": "j = " + j + ";", "animation": 16 });
                rows++;
                queue.push({ "code": "r = " + rows + ";" });
            } else {
                queue.push({ "code": "", "animation": 15 });
            }
        } else {
            rows++;
            queue.push({ "code": "r = " + rows + ";" });
            queue.push({ "code": "", "animation": 9 });
            if (j === 0) {
                i++;
                queue.push({ "code": "i++;", "animation": 11 });
            } else {
                j = next[--j];
                queue.push({ "code": "j = " + j + ";", "animation": 12 });
            }
        }
    }
    console.log(rows);

    queue.push({ "code": "delete equivalent;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete next;" });
    queue.push({ "code": "delete r;" });
    clear();
    generatePatternMatchingTable(text, pattern);
    generateInitTable(pattern);
    KMPAnimation(queue);
}

/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function KMPAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            KMP(text, pattern);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 7:
                for (let h = 0; h <= j; h++) {
                    if (document.querySelector("#id" + r + "_" + (i - h)).innerText === "") {
                        document.querySelector("#id" + r + "_" + (i - h)).innerText = "$" + pattern[j - h] + "$";
                    }
                }
                if (equivalent) {
                    document.querySelector("#id" + r + "_" + i).innerText = "$\\underline{" + pattern[j] + "}$";
                } else {
                    document.querySelector("#id" + r + "_" + i).innerText = "$\\cancel{" + pattern[j] + "}$";
                }
                document.querySelector("#id" + r + "_" + i).style.background = "var(--animationColor1)";
                document.querySelector("#id-1_" + i).style.background = "var(--animationColor1)";
                MathJax.typesetPromise(); // due to \cancel latex code, this should be used
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#id" + r + "_" + i).style.background = "var(--white)";
                document.querySelector("#id-1_" + i).style.background = "var(--white)";
                break;
            case 14:
                document.querySelector("#id" + r + "_-1").innerText = "$s = " + s + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 17:
                document.querySelector("#initid1_0").innerText = "$0$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 19:
                document.querySelector("#initid0_0").innerText = "$" + j + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 21:
                document.querySelector("#initid-1_" + i).style.background = "var(--animationColor3)";
                document.querySelector("#initid-1_" + j).style.background = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 24:
            case 25:
                document.querySelector("#initid0_" + (j - 1)).innerText = "$" + j + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 27:
            case 28:
                document.querySelector("#initid1_" + (j - 1)).innerText = "$" + next[j] + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 29:
                for (let h = 0; h < pattern.length; h++) {
                    document.querySelector("#initid-1_" + h).style.background = "var(--white)";
                }
                break;
            default:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
        }
    }

    for (let h = 0; h < pattern.length; h++) {
        document.querySelector("#initid-1_" + h).style.background = "var(--white)";
    }
    isAnimationRunning = false;
}