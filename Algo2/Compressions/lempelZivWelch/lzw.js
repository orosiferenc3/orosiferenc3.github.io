/**
 * Read tasks.
 */
readTasks("tasks.json");

function evalQueueState(codeLine){
    eval(codeLine.code);

    if(codeLine.hasOwnProperty("animationEffect")){
        switch(codeLine.animationEffect){
            case 1:
                // reset colors of input text
                inputText.innerHTML = "";
                inputText.innerText = textToEncode;
                break;
            case 2:
                // fills code table
                document.querySelector("#ct_char_" + (arr[1] - 1)).innerText = "$" + arr[0] + "$";
                document.querySelector("#ct_num_" + (arr[1] - 1)).innerText = "$" + arr[1] + "$";
                MathJax.typeset();
                break;
            case 4:
                info1.innerText = "";
                info2.innerText = "";
                break;
            case 5:
                // reset colors of input text
                inputText.innerHTML = "";
                inputText.innerText = textToEncode;

                for (let h = 0; h < existedWordIndex.length; h++) {
                    if (existedWordIndex[h] >= 0) {
                        document.querySelector("#ct_char_" + existedWordIndex[h]).style.backgroundColor = "var(--white)";
                        document.querySelector("#ct_num_" + existedWordIndex[h]).style.backgroundColor = "var(--white)";
                    }
                }
                
                info3.innerText = "";
                break;
        }
    }

    if (!codeLine.hasOwnProperty("animation")) {
        return;
    }
    switch (codeLine.animation) {
        case 1:
            // colorize text
            inputText.innerHTML = "";
            for (let h = 0; h < textToEncode.length; h++) {
                if (textToEncode[h] === arr[0])
                    inputText.innerHTML += "<span style='color: var(--animationColor1)'>" + textToEncode[h] + "</span>";
                else
                    inputText.innerHTML += textToEncode[h];
            }

            // fills code table
            document.querySelector("#ct_char_" + (arr[1] - 1)).innerText = "$" + arr[0] + "$";
            document.querySelector("#ct_num_" + (arr[1] - 1)).innerText = "$" + arr[1] + "$";
            MathJax.typeset();
            break;
        case 2:
            break;
        case 3:
            // append decoded word to decoded text
            outputText.innerText = decodedText;
            break;
        case 4:
            // colorize text
            inputText.innerHTML = "";
            info1.innerText = "";
            info2.innerText = "";
            let lastChar = "";
            let currentText = "";
            for (let h = 0; h < textToEncode.length; h++) {
                if (is.includes(h)) {
                    lastChar = textToEncode[h];
                    inputText.innerHTML += "<span style='color: var(--animationColor1)'>" + textToEncode[h] + "</span>";
                    currentText += textToEncode[h];
                    info2.innerText += textToEncode[h];
                } else {
                    inputText.innerHTML += textToEncode[h];
                }
            }
            info1.innerText += lastChar;

            // colorize code table
            if (existedWordIndex[existedWordIndex.length - 1] >= 0) {
                document.querySelector("#ct_char_" + existedWordIndex[existedWordIndex.length - 1]).style.backgroundColor = "var(--animationColor1)";
                document.querySelector("#ct_num_" + existedWordIndex[existedWordIndex.length - 1]).style.backgroundColor = "var(--animationColor1)";
                info3.innerText = currentText;
            }
            break;
        case 5:
            break;
    }
}

let animationController = new AnimationControllerEval(() => {
    clear();
    createCodeTable();
}, evalQueueState)

steppable(animationController);

/**
 * Variables.
 */
let queue;
let cTable;
let inputText;
let outputText;
let info1;
let info2;
let info3;

const textToEncode = "ABABABAACAACCBBAAAAAAAAA";
let decodedText_ = "";
let codeTable = [];

let currentWindowWidth = document.documentElement.clientWidth;
if (currentWindowWidth < 768) {
    cTable = document.querySelector("#codeTable2").children[0];
    inputText = document.querySelector("#inputText2");
    outputText = document.querySelector("#outputText2");
    info1 = document.querySelector("#info21");
    info2 = document.querySelector("#info22");
    info3 = document.querySelector("#info23");
} else {
    cTable = document.querySelector("#codeTable").children[0];
    inputText = document.querySelector("#inputText");
    outputText = document.querySelector("#outputText");
    info1 = document.querySelector("#info1");
    info2 = document.querySelector("#info2");
    info3 = document.querySelector("#info3");
}

document.querySelector("#replay").addEventListener("click", () => { if (!isAnimationRunning) { LZW(); } startNewAnimation = true; flag = true; clear(); createCodeTable(); });
document.querySelector("#replay2").addEventListener("click", () => { if (!isAnimationRunning) { LZW(); } startNewAnimation = true; flag = true; clear(); createCodeTable(); });
LZW();
clear();
createCodeTable();


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
            cTable = document.querySelector("#codeTable2").children[0];
            inputText = document.querySelector("#inputText2");
            outputText = document.querySelector("#outputText2");
            info1 = document.querySelector("#info21");
            info2 = document.querySelector("#info22");
            info3 = document.querySelector("#info23");
        } else {
            cTable = document.querySelector("#codeTable").children[0];
            inputText = document.querySelector("#inputText");
            outputText = document.querySelector("#outputText");
            info1 = document.querySelector("#info1");
            info2 = document.querySelector("#info2");
            info3 = document.querySelector("#info3");
        }

        animationController.reset();

        // restart animation
        if (!isAnimationRunning) {
            LZW();
        }
        startNewAnimation = true;
    }
});

function clear() {
    inputText.innerText = textToEncode;
    outputText.innerText = "$ $";
    document.querySelector("#codeTable").children[0].innerHTML = "";
    document.querySelector("#codeTable2").children[0].innerHTML = "";
    info1.innerText = "";
    info2.innerText = "";
    info3.innerText = "";
    MathJax.typeset();
}

function createCodeTable() {
    for (let i = 0; i < 2; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < codeTable.length; j++) {
            let td = document.createElement("td");
            if (i === 0)
                td.id = "ct_num_" + j;
            else if (i === 1)
                td.id = "ct_char_" + j;
            td.innerText = "$ $";
            td.style.width = "4em";
            tr.appendChild(td);
        }
        cTable.appendChild(tr);
    }
    MathJax.typeset();
}

let arr
let is
let existedWordIndex
let decodedText

function startCodeTable() {
    for (let i = 0; i < textToEncode.length; i++) {
        if (codeTable.find(x => x[0] === textToEncode[i]) === undefined) {
            let arr = [];
            arr.push(textToEncode[i]);
            arr.push(codeTable.length + 1);
            queue.push({ "code": "arr = ['" + textToEncode[i] + "', " + (codeTable.length + 1) + "];", "animation": 1 });
            queue.push({ "animationEffect": 1 })
            queue.push({ "code": "delete arr;" });
            codeTable.push(arr);            
        }
    }
}

function LZW() {
    queue = [];
    codeTable = [];
    decodedText_ = "";

    // create start code table
    startCodeTable();

    let word = "";
    let i = 0;
    queue.push({ "code": "is = [];" });
    queue.push({ "code": "existedWordIndex = [];" });
    while (i < textToEncode.length) {
        // read while not reach new word
        word += textToEncode[i];
        queue.push({ "code": "existedWordIndex.push(" + codeTable.indexOf(codeTable.find(x => x[0] === word)) + "); is.push(" + i + ");", "animation": 4 });
        queue.push({ "animationEffect": 4 })
        while (i < (textToEncode.length - 1) && codeTable.find(x => x[0] === word) !== undefined) {
            i++;
            word += textToEncode[i];
            queue.push({ "code": "existedWordIndex.push(" + codeTable.indexOf(codeTable.find(x => x[0] === word)) + "); is.push(" + i + ");", "animation": 4 });
            queue.push({ "animationEffect": 4 })
        }
        queue.push({ "code": "", "animationEffect": 5 });

        if (i < (textToEncode.length - 1) || (i === (textToEncode.length - 1) && codeTable.find(x => x[0] === word) === undefined)) {
            // add new word to code table
            let arr = [];
            arr.push(word);
            arr.push(codeTable.length + 1);
            queue.push({ "code": "arr = ['" + word + "', " + (codeTable.length + 1) + "];", "animationEffect": 2 });
            codeTable.push(arr);

            // encode text
            decodedText_ += (word.length === 1 ? codeTable.find(x => x[0] === word)[1] + " " : codeTable.find(x => x[0] === word.substring(0, word.length - 1))[1] + " ");
            queue.push({ "code": "decodedText = \"" + decodedText_ + "\";", "animation": 3 });
            
            word = word.charAt(word.length - 1);
            queue.push({ "code": "existedWordIndex = [" + codeTable.indexOf(codeTable.find(x => x[0] === word)) + "]; is = [" + i + "];", "animation": 4 });
            queue.push({ "animationEffect": 4 })
        }

        i++;
    }
    

    // encode last word
    decodedText_ += codeTable.find(x => x[0] === word)[1];
    queue.push({ "code": "decodedText = \"" + decodedText_ + "\";", "animation": 3 });
    animationController.setQueue(queue);
    LZWAnimation(queue);
}

/**
 * Animation of the algorithm.
 * @param {Array} queue an array with codes, that will be executed during the animation.
 * @returns 
 */
async function LZWAnimation() {
    isAnimationRunning = true;

    while(!animationController.ended()) {
        if (flag === false) {
            console.log("Pause!");
            await waitFor(_ => flag === true);
        }

        if (startNewAnimation) {
            startNewAnimation = false;
            LZW();
            return;
        }

        animationController.next();
        await sleep(WAIT_TIME)
    }

    isAnimationRunning = false;
}