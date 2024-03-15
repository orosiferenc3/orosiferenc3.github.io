/**
 * Read tasks.
 */
readTasks("tasks.json");

function evalQueueState(codeLine){
    eval(codeLine.code);

    if (!codeLine.hasOwnProperty("animation")) {
        return;
    }

    switch (codeLine.animation) {
        case 1:
            codeTable.children[i].children[0].innerText = chars;
            MathJax.typeset();
            break;
        case 2:
            codeTable.children[i].children[1].innerText = codes;
            MathJax.typeset();
            break;
        case 3:
            let tmp = "";
            for (let h = 0; h < i; h++) {
                tmp += text[h];
            }
            tmp += "<span style='color: var(--animationColor1)'>" + text[i] + "</span>";
            for (let h = i + 1; h < text.length; h++) {
                tmp += text[h];
            }
            textToEncode.innerHTML = tmp;

            for (let h = 0; h < codeTable.children.length; h++) {
                codeTable.children[h].style.backgroundColor = "white";
            }
            codeTable.children[index + 1].style.backgroundColor = "var(--animationColor1)";
            
            decodedText.innerHTML = "";
            for (let h = 0; h < decText.length; h++) {
                decodedText.innerHTML += decText[h];
            }
            decText += bitCodes[index];
            decodedText.innerHTML += "<span style='color: var(--animationColor1)'>" + bitCodes[index] + "</span>";
            
            MathJax.typeset();
            break;
    }
}

let animationController = new AnimationControllerEval(() => {
    clear();
    printTextToEncode();
    generateCodeTable();
}, evalQueueState)

steppable(animationController);

/**
 * Variables.
 */
let text = "ABRAKADABRA";
let queue;
let codeTable;
let textToEncode;
let decodedText;
let decText = "";
let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    codeTable = document.querySelector("#codeTable2 > tbody");
    textToEncode = document.querySelector("#inputText2");
    decodedText = document.querySelector("#outputText2");
    animationController.reset()
} else {
    codeTable = document.querySelector("#codeTable > tbody");
    textToEncode = document.querySelector("#inputText");
    decodedText = document.querySelector("#outputText");
    animationController.reset()
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { naiveMethod(); } startNewAnimation = true; flag = true; });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { naiveMethod(); } startNewAnimation = true; flag = true; });
naiveMethod();


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
            codeTable = document.querySelector("#codeTable2 > tbody");
            textToEncode = document.querySelector("#inputText2");
            decodedText = document.querySelector("#outputText2");
        } else {
            codeTable = document.querySelector("#codeTable > tbody");
            textToEncode = document.querySelector("#inputText");
            decodedText = document.querySelector("#outputText");
        }

        animationController.reset();

        // restart animation
        if (!isAnimationRunning) {
            naiveMethod();
        }
        startNewAnimation = true;
    }
});


function printTextToEncode() {
    textToEncode.innerText = text;

    // refresh latex script
    MathJax.typeset();
}

function clear() {
    decText = "";
    codeTable.innerHTML = "";
    textToEncode.innerText = "";
    decodedText.innerText = "$ $";
}

function generateCodeTable() {
    const headers = ["Karakter", "Kód"];

    for (let i = 0; i < uniqueCharacters().length + 1; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < headers.length; j++) {
            let td = document.createElement("td");
            td.innerText = "$ $";
            if (i === 0) {
                td.innerText = headers[j];
                td.style.fontWeight = "bold";
            }
            tr.appendChild(td);
        }
        codeTable.appendChild(tr);
    }
    MathJax.typeset();
}

let i 
let uniq
let chars
let codes
let index
let bitCodes

function naiveMethod() {
    clear();
    printTextToEncode();
    generateCodeTable();

    queue = [];
    let uniq = uniqueCharacters();
    queue.push({ "code": "uniq = \"" + uniq + "\";" });
    queue.push({ "code": "chars = \"\";" });
    queue.push({ "code": "i = 1;" });
    for (let i = 1; i < uniq.length + 1; i++) {
        queue.push({ "code": "i = " + i + ";" });
        queue.push({ "code": "chars = '$' + uniq.charAt(i - 1) + '$';", "animation": 1 });
    }

    let bitCodes = generateBitCodes(uniq);
    queue.push({ "code": "bitCodes = [" + bitCodes + "];" });
    queue.push({ "code": "codes = 1;" });
    queue.push({ "code": "i = 1;" });
    for (let i = 1; i < uniq.length + 1; i++) {
        queue.push({ "code": "i = " + i + ";" });
        queue.push({ "code": "codes = '$' + bitCodes[i - 1] + '$';", "animation": 2 });
    }

    queue.push({ "code": "i = 1;" });
    queue.push({ "code": "var index;" });
    for (let i = 0; i < text.length; i++) {
        queue.push({ "code": "i = " + i + ";" });
        queue.push({ "code": "index = uniq.indexOf(text[i]);", "animation" : 3 });
    }

    queue.push({ "code": "i = 0;" });
    queue.push({ "code": "uniq = 0;" });
    queue.push({ "code": "chars = 0;" });
    queue.push({ "code": "codes = 0;" });
    queue.push({ "code": "index = 0;" });
    queue.push({ "code": "bitCodes = 0;" });
    animationController.setQueue(queue);
    naiveMethodAnimation(queue);
}

/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function naiveMethodAnimation(queue) {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            naiveMethod();
            return;
        }

        animationController.next();
        await sleep(WAIT_TIME);
    }
    decodedText.innerHTML = "";
    for (let h = 0; h < decText.length; h++) {
        decodedText.innerHTML += decText[h];
    }
    for (let h = 0; h < codeTable.children.length; h++) {
        codeTable.children[h].style.backgroundColor = "white";
    }
    textToEncode.innerText = text;
    isAnimationRunning = false;
}

function generateBitCodes(uniqChars) {
    let codes = [];
    for (let i = 0; i < uniqChars.length; i++) {
        let len = Math.ceil(Math.log2(uniqChars.length));
        codes.push(dec2bin(i, len));
    }
    return codes;
}

function dec2bin(dec, length) {
    return "\"" + (dec >>> 0).toString(2).padStart(length, '0') + "\"";
}

function uniqueCharacters() {
    let uniq = "";
    for (let i = 0; i < text.length; i++) {
        if (uniq.includes(text[i]) === false) {
            uniq += text[i];
        }
    }
    return uniq;
}