/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
let queue = [];
let text = "ABABBABABAB";
let patternMatchingTable;
let pattern = "BABA";
let rows = text.length - pattern.length + 1;
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
} else {
    patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { bruteForce(text, pattern); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { bruteForce(text, pattern); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "összehasonlítás", "color": "var(--animationColor1)" }]);
bruteForce(text, pattern);


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
            patternMatchingTable = document.querySelector("#patternMatchingTable2 > tbody");
            clear();
            generatePatternMatchingTable(text, pattern);
        } else {
            document.querySelector("#patternMatchingTable2 > tbody").innerHTML = "";
            patternMatchingTable = document.querySelector("#patternMatchingTable > tbody");
            clear();
            generatePatternMatchingTable(text, pattern);
        }

        // restart animation
        if (!isAnimationRunning) {
            bruteForce(text, pattern);
        }
        startNewAnimation = true;
    }
});


/**
 * Reset animation tables.
 */
function clear() {
    patternMatchingTable.innerHTML = "";
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
            td.innerText = "$ $";
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
 * The algorithm.
 * @param {string} text text where we search the pattern.
 * @param {string} pattern pattern that we want to find in the text.
 */
function bruteForce(text, pattern) {
    queue = [];
    let n = text.length;
    let m = pattern.length;
    let offsets = [];
    queue.push({ "code": "var s;" });
    queue.push({ "code": "var offsets = [];", "animation": 1 });
    for (let s = 0; s < n - m + 1; s++) {
        queue.push({ "code": "s = " + s + ";", "animation": 2 });
        queue.push({ "code": "", "animation": 3 });
        //if (text.substring(s + 0, s + m).toUpperCase() === pattern.substring(0, m).toUpperCase()) {
        if (compare(text.substring(s + 0, s + m).toUpperCase(), pattern.substring(0, m).toUpperCase())) {
            queue.push({ "code": "offsets.push(s);", "animation": 4 });
            offsets.push(s);
        } else {
            queue.push({ "code": "", "animation": 5 });
        }
    }

    queue.push({ "code": "delete s;" });
    queue.push({ "code": "delete offsets;" });
    clear();
    generatePatternMatchingTable(text, pattern);
    bruteForceAnimation(queue);
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
    queue.push({ "code": "var j = 0;", "animation": 6 });
    queue.push({ "code": "var equivalent = " + (text[j] === pattern[j]) + ";", "animation": 7 });
    while (j < m && text[j] === pattern[j]) {
        queue.push({ "code": "j++;", "animation": 8 });
        j++;
        if (j < m) {
            queue.push({ "code": "equivalent = " + (text[j] === pattern[j]) + ";", "animation": 7 });
        }
    }
    queue.push({ "code": "delete equivalent;" });
    queue.push({ "code": "delete j;" });
    queue.push({ "code": "", "animation": 9 });
    return j >= m;
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function bruteForceAnimation(queue) {
    isAnimationRunning = true;

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            bruteForce(text, pattern);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 2:
                for (let h = 0; h < pattern.length; h++) {
                    document.querySelector("#id" + s + "_" + (s + h)).innerText = "$" + pattern[h] + "$";
                }
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                document.querySelector("#id" + s + "_" + (-1)).innerText = "$s=" + s + "$";
                MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                if (equivalent) {
                    document.querySelector("#id" + s + "_" + (s + j)).innerText = "$\\underline{" + pattern[j] + "}$";
                } else {
                    document.querySelector("#id" + s + "_" + (s + j)).innerText = "$\\cancel{" + pattern[j] + "}$";
                }
                document.querySelector("#id" + s + "_" + (s + j)).style.backgroundColor = "var(--animationColor1)";
                document.querySelector("#id" + (-1) + "_" + (s + j)).style.backgroundColor = "var(--animationColor1)";
                MathJax.typesetPromise(); // due to \cancel latex code, this should be used
                //MathJax.typeset();
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                document.querySelector("#id" + s + "_" + (s + j)).style.backgroundColor = "var(--white)";
                document.querySelector("#id" + (-1) + "_" + (s + j)).style.backgroundColor = "var(--white)";
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