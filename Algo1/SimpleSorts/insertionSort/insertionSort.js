/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const numbers = [34, 32, 25, 18, 43, 38, "32'"];
document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { insertionSort(numbers); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { insertionSort(numbers); } startNewAnimation = true; flag = true; });
createLegend([{ "description": "helyén van", "color": "var(--animationColor1)" }, { "description": "aktuálisan vizsgált elemek", "color": "var(--animationColor2)" }]);

let positionsArray;
insertionSort(numbers);


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
            insertionSort(numbers);
        }
        startNewAnimation = true;
    }
});


/**
 * The algorithm.
 * @param {Array} numbers numbers array
 */
function insertionSort(numbers) {
    let numbersCopy = structuredClone(numbers);
    draw(...numbersCopy);
    positionsArray = Array(numbersCopy.length).fill(0);

    let queue = [];
    queue.push({ "code": "var i;" });
    queue.push({ "code": "var x;" });
    queue.push({ "code": "var xCurrentPos;" });
    queue.push({ "code": "var xMovePos;" });
    queue.push({ "code": "var j;" });

    for (let i = 1; i < numbersCopy.length; i++) {
        queue.push({ "code": "i = " + i + ";", "animation": 1 });

        queue.push({ "code": "", "animation": 2 });
        if (parseInt(numbersCopy[i - 1]) > parseInt(numbersCopy[i])) {
            let x = numbersCopy[i];
            queue.push({ "code": "xCurrentPos = i;" });
            queue.push({ "code": "x = divs[i];", "animation": 3 });

            numbersCopy[i] = numbersCopy[i - 1];
            queue.push({ "code": "divs[i] = divs[i - 1];", "animation": 4 });

            j = i - 2;
            queue.push({ "code": "j = i - 2;", "animation": 5 });

            while (j > -1 && parseInt(numbersCopy[j]) > parseInt(x)) {
                queue.push({ "code": "", "animation": 6 });
                numbersCopy[j + 1] = numbersCopy[j];
                queue.push({ "code": "divs[j + 1] = divs[j];", "animation": 7 });

                j--;
                queue.push({ "code": "j--;", "animation": 8 });
            }

            numbersCopy[j + 1] = x;
            queue.push({ "code": "xMovePos = j + 1;" });
            queue.push({ "code": "divs[j + 1] = x;", "animation": 9 });
        } else {
            queue.push({ "code": "", "animation": 10 });
        }
    }

    queue.push({ "code": "delete i;" });
    queue.push({ "code": "delete x;" });
    queue.push({ "code": "delete xCurrentPos;" });
    queue.push({ "code": "delete xMovePos;" });
    queue.push({ "code": "delete j;" });

    insertionSortAnimation(queue);
}


/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function insertionSortAnimation(queue) {
    isAnimationRunning = true;
    let divs = Array.from(squares.children);

    for (const codeLine of queue) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            insertionSort(numbers);
            return;
        }

        eval(codeLine.code);

        if (!codeLine.hasOwnProperty("animation")) {
            continue;
        }

        switch (codeLine.animation) {
            case 1:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                divs[0].style.backgroundColor = "var(--animationColor1)";
                break;
            case 2:
                divs[i].style.backgroundColor = "var(--animationColor2)";
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 3:
                selectNumberAnimation(divs[i]);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 4:
                moveToNextPostionAnimation(divs[i - 1]);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 7:
                moveToNextPostionAnimation(divs[j]);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                break;
            case 9:
                putInPosition(x, xCurrentPos, xMovePos);
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                divs[j + 1].style.backgroundColor = "var(--animationColor1)";
                break;
            case 10:
                colorize(document.querySelector("#id" + codeLine.animation));
                await sleep(WAIT_TIME);
                colorize(document.querySelector("#id" + codeLine.animation));
                divs[i].style.backgroundColor = "var(--animationColor1)";
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
    isAnimationRunning = false;
}


/**
 * Animation that lifts up one of the circles.
 * @param {HTMLElement} div this is one of the circles.
 */
function selectNumberAnimation(div) {
    anime({
        targets: div,
        keyframes: [
            { translateY: -100 },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });
}


/**
 * Move to right, to the next position animation.
 * @param {HTMLElement} div div that wanted to move.
 */
function moveToNextPostionAnimation(div) {
    let originalDivsPosition = Array.from(squares.children);

    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateX: positionsArray[originalDivsPosition.indexOf(div)] + (marginSize * 2 + squareWidth) },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });

    positionsArray[originalDivsPosition.indexOf(div)] += (marginSize * 2 + squareWidth);
}


/**
 * Put in the right position animation.
 * @param {HTMLElement} div div that lifted up, so put it in the right place.
 * @param {number} currentPos original position before lift.
 * @param {number} movePos position where we moving this div.
 */
function putInPosition(div, currentPos, movePos) {
    let originalDivsPosition = Array.from(squares.children);

    let marginSize = window.getComputedStyle(div, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    let squareWidth = window.getComputedStyle(div, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    anime({
        targets: div,
        keyframes: [
            { translateX: positionsArray[originalDivsPosition.indexOf(div)] - Math.abs(currentPos - movePos) * (marginSize * 2 + squareWidth) },
            { translateY: 0 },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });

    positionsArray[originalDivsPosition.indexOf(div)] -= Math.abs(currentPos - movePos) * (marginSize * 2 + squareWidth);
}