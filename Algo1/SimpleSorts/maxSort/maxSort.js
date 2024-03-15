/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [34, 32, 25, 18, 43, 38, "32'"];
document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { maxSort(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { maxSort(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "helyén van", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált elemek", "color": "var(--animationColor2)" }, { "description": "aktuális maximum", "color": "var(--animationColor3)" }]);

let positionsArray;
maxSort(numbers);


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
            maxSort(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * The algorithm.
 * @param {Array} numbers numbers array
 */
function maxSort(numbers) {
    let numbersCopy = structuredClone(numbers);
    draw(...numbersCopy);
    positionsArray = Array(numbersCopy.length).fill(0);

    let queue = [];
    queue.push({ "code": "var i;" });
    queue.push({ "code": "var ind;" });
    queue.push({ "code": "var j;" });

    for (let i = numbersCopy.length - 1; i >= 1; i--) {
        queue.push({ "code": "i = " + i + ";", "animation": 1 });

        let ind = 0;
        queue.push({ "code": "ind = 0;", "animation": 2 });

        for (var j = 1; j <= i; j++) {
            queue.push({ "code": "j = " + j + ";", "animation": 3 });
            queue.push({ "code": "", "animation": 4 });
            if (parseInt(numbersCopy[j]) > parseInt(numbersCopy[ind])) {
                ind = j;
                queue.push({ "code": "ind = j;", "animation": 5 });
            } else {
                queue.push({ "code": "", "animation": 6 });
            }
        }
        let tmp = numbersCopy[ind];
        numbersCopy[ind] = numbersCopy[i];
        numbersCopy[i] = tmp;
        queue.push({
            "code": `
            var tmpDiv = divs[ind];
            divs[ind] = divs[i];
            divs[i] = tmpDiv;
            delete tmpDiv;
            var tmpPos = positionsArray[ind];
            positionsArray[ind] = positionsArray[i];
            positionsArray[i] = tmpPos;
            delete tmpPos`,
            "animation": 7
        });
    }

    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete ind;" });
    queue.push({ "code": "delete j;" });

    maxSortAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function maxSortAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);


    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            maxSort(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 2:
                divs[ind].style.backgroundColor = "var(--animationColor3)";
                colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                divs[j].style.backgroundColor = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 5:
                colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                divs[ind].style.backgroundColor = "var(--animationColor3)";
                for (let k = 0; k < i; k++) {
                    if (k !== ind) {
                        divs[k].style.backgroundColor = "var(--background)";
                    }
                }
                break;
            case 6:
                colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                for (let k = 0; k < i; k++) {
                    if (k !== ind) {
                        divs[k].style.backgroundColor = "var(--background)";
                    }
                }
                break;
            case 7:
                colorize(document.querySelector("#id7"));
                await sleep(WAIT_TIME);
                swapAnimation(divs, divs[i], divs.indexOf(divs[i]), divs[ind], divs.indexOf(divs[ind]));
                divs[i].style.backgroundColor = "var(--animationColor1)";
                colorize(document.querySelector("#id7"));
                for (let k = 0; k < i; k++) {
                    divs[k].style.backgroundColor = "var(--background)";
                }
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 7) {
                    colorize(document.querySelector("#id" + codeLine.animation));
                    await sleep(WAIT_TIME);
                    colorize(document.querySelector("#id" + codeLine.animation));
                }
                break;
        }
    }
    divs[0].style.backgroundColor = "var(--animationColor1)";
    isAnimationRunning = false;
}