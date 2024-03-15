// Scroll animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.target.classList.contains('show') && entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

const observer2 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.target.classList.contains('showLineGraph') && entry.isIntersecting) {
            entry.target.classList.add('showLineGraph');
            showGraph(entry.target.id);
        }
    });
});

const observer3 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.target.classList.contains('showSet') && entry.isIntersecting) {
            entry.target.classList.add('showSet');
            showSet();
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach(x => observer.observe(x));

const hiddenElements2 = document.querySelectorAll('.hiddenLineGraph');
hiddenElements2.forEach(x => observer2.observe(x));

const hiddenElements3 = document.querySelectorAll('.hiddenSet');
hiddenElements3.forEach(x => observer3.observe(x));


// MathJax
MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};


// Often used codes
/**
 * Variables.
 */
const ORIGINAL_WAIT_TIME = 1000;
let WAIT_TIME = ORIGINAL_WAIT_TIME;
const DIFFERENCE = 150;
let squares = document.querySelector("#squares");
const legend = document.querySelectorAll(".legend");
let speed = document.querySelectorAll(".speed");
speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x");

let flag = false;
let startNewAnimation = false;
let isAnimationRunning = false;

const startButtonEvent = () => { flag = true; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); }
const pauseButtonEvent = () => { flag = false; }

if (document.querySelector("#forward") !== null) {
    document.querySelector("#forward").addEventListener("click", () => { if (WAIT_TIME - DIFFERENCE > 0) { WAIT_TIME -= DIFFERENCE; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); } });
    document.querySelector("#backward").addEventListener("click", () => { if (WAIT_TIME + DIFFERENCE < 2000) { WAIT_TIME += DIFFERENCE; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); } });
    document.querySelector("#play").addEventListener("click", startButtonEvent);
    document.querySelector("#pause").addEventListener("click", pauseButtonEvent);
    document.querySelector("#forward2").addEventListener("click", () => { if (WAIT_TIME - DIFFERENCE > 0) { WAIT_TIME -= DIFFERENCE; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); } });
    document.querySelector("#backward2").addEventListener("click", () => { if (WAIT_TIME + DIFFERENCE < 2000) { WAIT_TIME += DIFFERENCE; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); } });
    document.querySelector("#play2").addEventListener("click", () => { flag = true; speed.forEach(s => s.innerText = Math.round(ORIGINAL_WAIT_TIME / WAIT_TIME * 100) / 100 + "x"); });
    document.querySelector("#pause2").addEventListener("click", () => { flag = false; });
}

let prevWindowWidth = document.documentElement.clientWidth;
if (prevWindowWidth < 768) {
    squares = document.querySelector("#squares2");
} else {
    squares = document.querySelector("#squares");
}


/**
 * Draw circles.
 * @param  {...any} numbers 
 */
function draw(...numbers) {
    squares.innerHTML = "";
    numbers.forEach(n => {
        let square = document.createElement("div");
        square.setAttribute("class", "square");
        square.innerText = n;
        squares.append(square);
    });
}


/**
 * Create legend for animation.
 * @param {Array} colors object array, every object has two fields: color, description
 */
function createLegend(colors) {
    colors.forEach(x => {
        for (let h = 0; h < legend.length; h++) {
            let div = document.createElement("div");
            div.style.backgroundColor = x.color;
            div.setAttribute("class", "legendBox");
            legend[h].appendChild(div);

            let span = document.createElement("span");
            span.innerText = x.description;
            legend[h].appendChild(span);

            let br = document.createElement("br");
            legend[h].appendChild(br);
        }
    });
}


/**
 * Swap two divs. Use strict: first div is the left one and second div is the right one.
 * @param {Array} divs 
 * @param {HTMLElement} div1 
 * @param {number} pos1 
 * @param {HTMLElement} div2 
 * @param {number} pos2 
 */
function swapAnimation(divs, div1, pos1, div2, pos2) {
    // calculate size of margin
    let marginSize = window.getComputedStyle(div1, null).getPropertyValue('margin-left');
    marginSize = parseFloat(marginSize.toString().slice(0, marginSize.length - 2));

    // calculate size of a circle
    let squareWidth = window.getComputedStyle(div1, null).getPropertyValue('width');
    squareWidth = parseFloat(squareWidth.toString().slice(0, squareWidth.length - 2));

    // animation of div1
    anime({
        targets: div1,
        keyframes: [
            { translateY: -100 },
            { translateX: positionsArray[divs.indexOf(div1)] + Math.abs(pos2 - pos1) * (marginSize * 2 + squareWidth) },
            { translateY: 0 },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });

    // animation of div2
    anime({
        targets: div2,
        keyframes: [
            { translateY: 100 },
            { translateX: positionsArray[divs.indexOf(div2)] - Math.abs(pos2 - pos1) * (marginSize * 2 + squareWidth) },
            { translateY: 0 },
        ],
        duration: WAIT_TIME,
        easing: 'easeOutElastic(1, .8)',
        loop: false
    });

    // update divs' position in positionArray
    positionsArray[divs.indexOf(div1)] += Math.abs(pos2 - pos1) * (marginSize * 2 + squareWidth);
    positionsArray[divs.indexOf(div2)] -= Math.abs(pos2 - pos1) * (marginSize * 2 + squareWidth);
}


/**
 * Draw edge between two nodes.
 * @param {HTMLElement} div1 first div.
 * @param {HTMLElement} div2 second div.
 * @param {string} color color of the edge.
 * @param {number} thickness thickness of the edge.
 * @param {boolean} directed false if you don't want arrows at the end of the edges, otherwise true.
 */
function connect(id, div1, div2, color, thickness, directed, weight) {
    let x1 = div1.getBoundingClientRect().x - div1.parentNode.getBoundingClientRect().x + (div1.getBoundingClientRect().width / 2);
    let y1 = div1.getBoundingClientRect().y - div1.parentNode.getBoundingClientRect().y + (div1.getBoundingClientRect().height / 2);
    let x2 = div2.getBoundingClientRect().x - div2.parentNode.getBoundingClientRect().x + (div2.getBoundingClientRect().width / 2);
    let y2 = div2.getBoundingClientRect().y - div2.parentNode.getBoundingClientRect().y + (div2.getBoundingClientRect().height / 2);

    // distance
    var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);

    // angle
    var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);

    // hr
    let div = document.createElement("div");
    div.setAttribute("id", "hr" + id);
    div.setAttribute("style", "opacity: 0%; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg); position:absolute; left:" + cx + "px; top:" + cy + "px;");

    let hr = document.createElement("div");
    hr.setAttribute("style", "padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; width:" + length + "px;");
    div.appendChild(hr);

    if (directed) {
        let arrowDiv = document.createElement("div");
        arrowDiv.setAttribute("style", "z-index: 3;padding:0px; margin:0px; line-height:1px;position:relative;text-align:right;top:-7px;");
        div.appendChild(arrowDiv);

        let arrow = document.createElement("div");
        arrow.innerText = ">";
        arrow.setAttribute("style", "position: relative;left: -30px;color:" + color + ";font-size: 40px;");
        arrowDiv.appendChild(arrow);
    }

    // hr's text
    let span = document.createElement("span");

    // change divs if text is upside down
    if (x1 <= x2) {
        span.setAttribute("style", "position: absolute; top: -16px;z-index:4;rotate: 180deg;top: 16px;color:white;");
    } else {
        span.setAttribute("style", "position: absolute; top: -16px;z-index:4;color:white;");
    }

    span.innerText = weight;
    hr.appendChild(span);

    squares.insertBefore(div, squares.firstElementChild);
}


/**
 * Draw graph based on numbers given as a parameter.
 * @param {boolean} directed false if you don't want arrows at the end of the edges, otherwise true.
 * @param {Array} vertices vertices.
 */
function drawTree(directed, vertices) {
    squares.innerHTML = "";
    let level = getBaseLog(2, vertices.length);
    squares.setAttribute("style", "height: " + (level + 1) * 120 + "px !important; display: block !important;"); // because of proper tree drawing

    let divsArray = [];
    let nodePositions = [];

    // create nodes
    for (let i = 0; i < vertices.length; i++) {
        let node = drawNode(vertices[i]);
        squares.append(node);
        divsArray.push(node);
    }

    // determine node positions
    let nodesUntilLeafLevel = 0;
    for (let i = 0; i <= level; i++) {
        if (i !== level) {
            nodesUntilLeafLevel += Math.pow(2, i);
        }

        for (let j = 1; j <= Math.pow(2, i); j++) {
            let x = (squares.clientWidth / (Math.pow(2, i) + 1)) * j - (squares.clientWidth / 2);
            let y = (squares.clientHeight / (level + 1)) * (i + 1) - ((Math.pow(2, i) + j) * divsArray[0].clientHeight) + (divsArray[0].clientHeight / 2);
            nodePositions.push([x, y]);
        }
    }

    for (let i = 0; i < divsArray.length; i++) {
        divsArray[i].setAttribute("style", "left:" + nodePositions[i][0] + "px; top:" + nodePositions[i][1] + "px;");
    }

    // create lines
    for (let i = 0; i < nodesUntilLeafLevel; i++) {
        let divParent, divLeft, divRight;
        divParent = divsArray[i];
        if ((i * 2 + 1) < vertices.length) {
            divLeft = divsArray[i * 2 + 1];
            connect((i * 2), divParent, divLeft, "var(--main)", 3, directed, ''); // use this invertedly due to directed graph arrows
        }

        if ((i * 2 + 2) < vertices.length) {
            divRight = divsArray[i * 2 + 2];
            connect((i * 2 + 1), divParent, divRight, "var(--main)", 3, directed, ''); // use this invertedly due to directed graph arrows
        }
    }

    // lines' animation
    for (let i = 0; i < (nodesUntilLeafLevel * 2); i++) {
        fadeIn("#hr" + i);
        //await sleep(100);
    }
}


/**
 * Wait function which waits until the conditionFunction is not true.
 * @param {Function} conditionFunction 
 * @returns 
 */
function waitFor(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) {
            resolve();
        }
        else {
            setTimeout(_ => poll(resolve), 400);
        }
    }
    return new Promise(poll);
}


/**
 * Sleep function waits until given time passes.
 * @param {number} ms milliseconds
 * @returns 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Make a fade in animation for the given hr.
 * @param {string} hr hr's id
 */
function fadeIn(hr) {
    anime({
        targets: hr,
        opacity: ['0%', '100%'],
        easing: 'easeInOutQuad',
        duration: (WAIT_TIME * 1.5)
    });
}


/**
 * This function colorize struktogramm cells.
 * @param {HTMLElement} td table cell
 */
function colorize(td) {
    if (td.getAttribute("forLoop") !== null) {
        let forLoopId = td.getAttribute("forLoop");
        document.querySelectorAll("td").forEach(x => {
            if (x.getAttribute("forLoop") === forLoopId) {
                if (x.style.backgroundColor === "var(--stukiHighlight)") {
                    x.style.backgroundColor = "var(--white)";
                } else {
                    x.style.backgroundColor = "var(--stukiHighlight)";
                }

                if (x.classList.contains("loopUpperPart")) {
                    if (x.style.borderLeftColor === "var(--stukiHighlight)") {
                        x.style.borderLeftColor = "var(--white)";
                    } else {
                        x.style.borderLeftColor = "var(--stukiHighlight)";
                    }
                }
            }
        });
    } else {
        if (td.style.backgroundColor === "var(--stukiHighlight)") {
            td.style.backgroundColor = "var(--white)";
        } else {
            td.style.backgroundColor = "var(--stukiHighlight)";
        }
    }
}

function structogramHighlight(n){
    document.querySelectorAll("#struktogram *[style*='background-color: var(--stukiHighlight)']").forEach(div => div.removeAttribute("style"));
    if(n !== undefined){
        colorize(document.querySelector(`#struktogramm #id${n}`))
    }
}

const cp = (v) => JSON.parse(JSON.stringify(v))

/**
 * Logarithm function.
 * @param {number} base base of logarithm.
 * @param {number} num number.
 * @returns 
 */
function getBaseLog(base, num) {
    return Math.floor(Math.log(num) / Math.log(base));
}

class AnimationControllerLambda {
    constructor(resetter, evalQueueState){
        this.resetter = resetter;
        this.current = -1;
        this.evalQueueState = evalQueueState;
    }

    next(){
        if(this.current + 1 >= this.queue.length) return;
        this.current++;
        this.evalQueueState(this.queue[this.current]);
    }

    prev(){
        if(this.current <= 0) return;
        this.current--;

        this.resetter();
        for(let i = 0; i <= this.current; i++){
            this.evalQueueState(this.queue[i]);
        }
    }

    ended(){
        return this.current + 1 >= this.queue.length;
    }

    reset(){
        this.resetter();
        this.current = -1;
    }

    setQueue(queue){
        this.queue = queue;
        this.current = -1;
    }
}


class AnimationControllerEval {
    constructor(resetter, evalQueueState, breakPoints = ["animation"]){
        this.resetter = resetter;
        this.current = -1;
        this.evalQueueState = evalQueueState;
        this.breakPoints = breakPoints;
    }

    next(){
        if(this.current + 1 >= this.queue.length) return;
        let animationFlag = true;
        while(this.current + 1 < this.queue.length && animationFlag){
            this.current++;
            this.evalQueueState(this.queue[this.current]);
            animationFlag = !this.breakPoints.reduce((p, c) => p || this.queue[this.current].hasOwnProperty(c), false);
        }
    }

    prev(){
        if(this.current <= 0) return;
        let animationFlag = true;
        while(this.current > 0 && animationFlag){
            this.current--;
            animationFlag = !this.breakPoints.reduce((p, c) => p || this.queue[this.current].hasOwnProperty(c), false);
        }

        this.resetter();
        for(let i = 0; i <= this.current; i++){
            this.evalQueueState(this.queue[i]);
        }
    }
    
    ended(){
        return this.current + 1 >= this.queue.length;
    }

    reset(){
        this.resetter();
        this.current = -1;
    }

    setQueue(queue){
        this.queue = queue;
        this.current = -1;
    }
}

function steppable(animationController){
    const prevStep = document.createElement("button")
    const nextStep = document.createElement("button")
    const prevStepMobile = document.createElement("button")
    const nextStepMobile = document.createElement("button")

    const next = () => {
        //if(isAnimationRunning) return;
        animationController.next();
    }

    const prev = () => {
        //if(isAnimationRunning) return;
        animationController.prev();
    }

    [prevStep, nextStep, prevStepMobile, nextStepMobile].forEach((btn, i) => {
        btn.setAttribute("class", "col-1 mx-2 navbar-toggler animationButtons")
        if(i % 2 === 0) {
            btn.addEventListener("click", prev);
            btn.innerHTML = `<i class="fa-solid fa-backward-step"></i>`
        }
        else {
            btn.addEventListener("click", next);
            btn.innerHTML = `<i class="fa-solid fa-forward-step"></i>`
        }
            
    })

    document.querySelector("#backward").parentElement.prepend(prevStep)
    document.querySelector("#backward2").parentElement.prepend(prevStepMobile)
    document.querySelector("#forward").parentElement.append(nextStep)
    document.querySelector("#forward2").parentElement.append(nextStepMobile)

    document.addEventListener("keydown", (e) => {
        if(e.key === "j") prev();
        else if(e.key === "l") next();
    })
}

document.addEventListener("keydown", (e) => {
    if(e.key === "k") {
        if(flag){
            pauseButtonEvent();
        } else {
            startButtonEvent();
        }
    }
})