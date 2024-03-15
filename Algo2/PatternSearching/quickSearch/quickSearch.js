/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let queue;
let text = "ADABABCADABCABADACADADA";
let patternMatchingTable, initShiftTable;
let pattern = "CADA";
let rows = 0;
let abc = "ABCD";
let characters;
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
    initShiftTable = document.querySelector("#initShiftTable2 > tbody");
} else {
    patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
    initShiftTable = document.querySelector("#initShiftTable > tbody");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { quickSearch(abc, text, pattern); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { quickSearch(abc, text, pattern); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "összehasonlítás", "color": "var(--animationColor1)" }, { "description": "shift mértéke", "color": "var(--animationColor2)" }]);
quickSearch(abc, text, pattern);


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
            document.querySelector("#initShiftTable > tbody").innerHTML = "";
            patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
            initShiftTable = document.querySelector("#initShiftTable2 > tbody");
            clear();
            generateInitShiftTable(abc, pattern);
            generatePatternMatchingTable(text, pattern);
        } else {
            document.querySelector("#patternMatchingTable2 > tbody").innerHTML = "";
            document.querySelector("#initShiftTable2 > tbody").innerHTML = "";
            patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
            initShiftTable = document.querySelector("#initShiftTable > tbody");
            clear();
            generateInitShiftTable(abc, pattern);
            generatePatternMatchingTable(text, pattern);
        }

        // restart animation
        if (!isAnimationRunning) {
            quickSearch(abc, text, pattern);
        }
        startNewAnimation = true;
    }
});



/**
 * Reset animation tables.
 */
function clear() {
    patternMatchingTable.innerHTML = "";
    initShiftTable.innerHTML = "";
}


/**
 * Generate main animation table.
 * @param {string} text text where we search the pattern.
 * @param {string} pattern pattern that we want to find in the text.
 */
function generatePatternMatchingTable(text, pattern) {
    for (let i = 0; i < rows + 2; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < text.length + 1; j++) {
            let td = document.createElement("td");
            td.style.height = "3em";
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
        patternMatchingTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}


/**
 * Generate secondary animation table.
 * @param {string} abc whole character that can we use.
 * @param {string} pattern pattern that we want to find in the text.
 */
function generateInitShiftTable(abc, pattern) {
    for (let i = 0; i < pattern.length + 3; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < abc.length + 1; j++) {
            let td = document.createElement("td");
            td.innerText = "$ $";
            if (i === 0 && j === 0) {
                td.innerText = "$\\sigma$";
            } else if (i === 1 && j === 0) {
                td.innerText = "$initial \\space shift(\\sigma)$";
            } else if (i === pattern.length + 2 && j === 0) {
                td.innerText = "$final \\space shift(\\sigma)$";
            } else if (i === 0 && j > 0) {
                td.innerText = "$" + abc[j - 1] + "$";
            } else if (i > 1 && i !== pattern.length + 2 && j === 0) {
                td.innerText = "$" + pattern[i - 2] + "$";
            } else {
                td.id = "initid" + (i - 1) + "_" + (j - 1);
            }
            tr.appendChild(td);
        }
        initShiftTable.appendChild(tr);
    }

    // refresh latex script
    MathJax.typeset();
}


/**
 * Initialize character shifts.
 * @param {string} pattern pattern that we want to find in the text.
 * @returns shift array.
 */
function initShift(pattern) {
    let m = pattern.length;
    let shift = [];
    queue.push({ "code": "var sigma;" });
    queue.push({ "code": "var m;" });
    queue.push({ "code": "var j;" });
    for (let sigma = 0; sigma < characters.length; sigma++) {
        queue.push({ "code": "sigma = " + sigma + ";" });
        queue.push({ "code": "m = " + m + ";" });
        queue.push({ "code": "", "animation": 11 });
        queue.push({ "code": "", "animation": 12 });
        shift[characters[sigma]] = m + 1;
    }

    for (let j = 0; j < m; j++) {
        queue.push({ "code": "j = " + j + ";" });
        queue.push({ "code": "", "animation": 13 });
        queue.push({ "code": "", "animation": 14 });
        shift[pattern[j]] = m - j;
    }
    queue.push({ "code": "var shift = [" + Object.values(shift).join(",") + "];", "animation": 15 });
    queue.push({ "code": "delete shift;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "delete m;" });
    queue.push({ "code": "delete sigma;" });
    return shift;
}


/**
 * The algorithm.
 * @param {string} abc whole character that can we use.
 * @param {string} text text where we search the pattern.
 * @param {string} pattern pattern that we want to find in the text.
 */
function quickSearch(abc, text, pattern) {
    characters = abc;
    queue = [];
    rows = 0;
    queue.push({ "code": "", "animation": 1 });
    let shift = initShift(pattern);
    let offsets = [];
    queue.push({ "code": "", "animation": 2 });
    let n = text.length;
    let m = pattern.length;
    let s = 0;
    queue.push({ "code": "", "animation": 3 });
    queue.push({ "code": "var s;" });
    queue.push({ "code": "var r;" });
    while (s + m <= n) {
        queue.push({ "code": "s = " + s + ";" });
        queue.push({ "code": "r = " + rows + ";" });
        queue.push({ "code": "", "animation": 4 });
        if (compare(text.substring(s + 0, s + m).toUpperCase(), pattern.substring(0, m).toUpperCase())) {
            queue.push({ "code": "", "animation": 6 });
            offsets.push(s);
        } else {
            queue.push({ "code": "", "animation": 7 });
        }

        queue.push({ "code": "", "animation": 8 });
        if (s + m < n) {
            queue.push({ "code": "", "animation": 9 });
            s += shift[text[s + m]];
        } else {
            s++;
            queue.push({ "code": "", "animation": 10 });
        }
        rows++;
    }

    queue.push({ "code": "delete s;" });
    queue.push({ "code": "delete r;" });
    queue.push({ "code": "delete equivalent;" });
    queue.push({ "code": "delete j;" });
    clear();
    generateInitShiftTable(abc, pattern);
    generatePatternMatchingTable(text, pattern);
    quickSearchAnimation(queue);
}


/**
 * Compare the pattern and part of the text.
 * @param {string} text text where we search the pattern.
 * @param {string} pattern pattern that we want to find in the text.
 * @returns true if the pattern matches with the part of the text.
 */
function compare(text, pattern) {
    let m = pattern.length;
    let j = 0;
    queue.push({ "code": "var j = 0;" });
    queue.push({ "code": "var equivalent = " + (text[j] === pattern[j]) + ";" });
    queue.push({ "code": "", "animation": 5 });
    while (j < m && text[j] === pattern[j]) {
        queue.push({ "code": "j++;" });
        j++;
        if (j < m) {
            queue.push({ "code": "equivalent = " + (text[j] === pattern[j]) + ";" });
            queue.push({ "code": "", "animation": 5 });
        }
    }
    return j >= m;
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function quickSearchAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            quickSearch(abc, text, pattern);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 4:
                for (let h = 0; h < pattern.length; h++) {
                    document.querySelector("#id" + r + "_" + (s + h)).innerText = "$" + pattern[h] + "$";
                }
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                if (equivalent) {
                    document.querySelector("#id" + r + "_" + (s + j)).innerText = "$\\underline{" + pattern[j] + "}$";
                } else {
                    document.querySelector("#id" + r + "_" + (s + j)).innerText = "$\\cancel{" + pattern[j] + "}$";
                }
                document.querySelector("#id" + r + "_" + (s + j)).style.backgroundColor = "var(--animationColor1)";
                document.querySelector("#id" + (-1) + "_" + (s + j)).style.backgroundColor = "var(--animationColor1)";
                MathJax.typesetPromise(); // due to \cancel latex code, this should be used
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#id" + r + "_" + (s + j)).style.backgroundColor = "var(--white)";
                document.querySelector("#id" + (-1) + "_" + (s + j)).style.backgroundColor = "var(--white)";
                break;
            case 6:
                document.querySelector("#id" + r + "_" + (-1)).innerText = "$s=" + s + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
                document.querySelector("#id" + (-1) + "_" + (s + pattern.length)).style.backgroundColor = "var(--animationColor2)";
                document.querySelector("#initid" + (pattern.length + 1) + "_" + (abc.indexOf(text[s + pattern.length]))).style.backgroundColor = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#id" + (-1) + "_" + (s + pattern.length)).style.backgroundColor = "var(--white)";
                document.querySelector("#initid" + (pattern.length + 1) + "_" + (abc.indexOf(text[s + pattern.length]))).style.backgroundColor = "var(--white)";
                break;
            case 12:
                document.querySelector("#initid0_" + sigma).innerText = "$" + (m + 1) + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 14:
                document.querySelector("#initid" + (j + 1) + "_" + abc.indexOf(pattern[j])).innerText = "$" + (m - j) + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 15:
                for (let h = 0; h < abc.length; h++) {
                    document.querySelector("#initid" + (pattern.length + 1) + "_" + h).innerText = "$" + shift[h] + "$";
                }
                MathJax.typeset();
                break;
            default:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
        }
    }

    isAnimationRunning = false;
}