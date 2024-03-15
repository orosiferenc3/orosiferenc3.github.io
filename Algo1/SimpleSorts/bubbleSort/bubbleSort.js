/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [34, 32, 25, 18, 43, 38, "32'"];
document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { bubbleSort(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { bubbleSort(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "helyén van", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált elemek", "color": "var(--animationColor2)" }]);

let positionsArray;
bubbleSort(numbers);


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
            bubbleSort(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * The algorithm.
 * @param {Array} numbers numbers array
 */
function bubbleSort(numbers) {
    let numbersCopy = structuredClone(numbers);
    draw(...numbersCopy);
    positionsArray = Array(numbersCopy.length).fill(0);

    let queue = [];
    queue.push({ "code": "var i;" });
    queue.push({ "code": "var j;" });
    for (let i = numbersCopy.length - 1; i > 0; i--) {
        queue.push({ "code": "i = " + i + ";", "animation": 1 });

        for (let j = 0; j < i; j++) {
            queue.push({ "code": "j = " + j + ";", "animation": 2 });
            queue.push({ "code": "", "animation": 3 });
            if (parseInt(numbersCopy[j]) > parseInt(numbersCopy[j + 1])) {
                let tmp = numbersCopy[j];
                numbersCopy[j] = numbersCopy[j + 1];
                numbersCopy[j + 1] = tmp;

                queue.push({
                    "code": `
                        var tmpDiv = divs[j];
                        divs[j] = divs[j + 1];
                        divs[j + 1] = tmpDiv;
                        delete tmpDiv;
                        var tmpPos = positionsArray[j];
                        positionsArray[j] = positionsArray[j + 1];
                        positionsArray[j + 1] = tmpPos;
                        delete tmpPos;`,
                    "animation": 4
                });
            } else {
                queue.push({ "code": "", "animation": 5 });
            }
        }
    }

    bubbleSortAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function bubbleSortAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            bubbleSort(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 3:
                divs[j].style.backgroundColor = "var(--animationColor2)";
                divs[j + 1].style.backgroundColor = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                swapAnimation(divs, divs[j + 1], divs.indexOf(divs[j + 1]), divs[j], divs.indexOf(divs[j]));
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                divs[j].style.backgroundColor = "var(--background)";
                if (j + 1 === i) {
                    divs[j + 1].style.backgroundColor = "var(--animationColor1)";
                } else {
                    divs[j + 1].style.backgroundColor = "var(--background)";
                }
                break;
            case 5:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                divs[j].style.backgroundColor = "var(--background)";
                if (j + 1 === i) {
                    divs[j + 1].style.backgroundColor = "var(--animationColor1)";
                } else {
                    divs[j + 1].style.backgroundColor = "var(--background)";
                }
                break;
            default:
                if (codeLine.animation >= 1 && codeLine.animation <= 5) {
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