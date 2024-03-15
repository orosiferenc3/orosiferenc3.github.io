/**
 * Read tasks.
 */
readTasks("tasks.json");


/**
 * Variables.
 */
const thetaFunctions = '#thetaC2g, #thetaF, #thetaC1g';
const thetaTexts = '#thetaC2gText, #thetaC1gText, #thetaFText, #thetaN0Text, #thetaN0';

const ordoFunctions = '#ordoCg, #ordoF';
const ordoTexts = '#ordoCgText, #ordoFText, #ordoN0Text, #ordoN0';

const omegaFunctions = '#omagaCg, #omagaF';
const omegaTexts = '#omagaCgText, #omagaFText, #omagaN0Text, #omagaN0';


/**
 * Show graph with animation.
 * @param {string} type type of the graph
 */
function showGraph(type) {
    let functions, texts;
    switch (type) {
        case 'theta':
            functions = thetaFunctions;
            texts = thetaTexts;
            break;
        case 'ordo':
            functions = ordoFunctions;
            texts = ordoTexts;
            break;
        case 'omega':
            functions = omegaFunctions;
            texts = omegaTexts;
            break;
    }

    anime({
        targets: functions,
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 2000,
        delay: function (el, i) { return i * 250 },
        direction: 'alternate',
        loop: false
    });

    anime({
        targets: texts,
        opacity: ['0%', '100%'],
        delay: 2000,
        easing: 'easeInOutQuad'
    });
}


/**
 * Show set with animation.
 */
function showSet() {
    anime({
        targets: '#bigCircle1, #bigCircle2, #innerCircle1, #innerCircle2',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 2000,
        delay: function (el, i) { return i * 250 },
        direction: 'alternate',
        loop: false
    });
    
    anime({
        targets: '#Omega, #kisOmega, #Theta, #Ordo, #kisOrdo',
        opacity: ['0%', '100%'],
        delay: 2000,
        easing: 'easeInOutQuad'
    });
}