const parser = new DOMParser();
const tasksDiv = document.querySelector("#generatedTasks");


/**
 * Read tasks from a json file, then generate them.
 * @param {string} filename path of the file.
 */
function readTasks(filename) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", filename, false); // false for synchronous request
    xmlHttp.send(null);
    let tasksJson = JSON.parse(xmlHttp.responseText);

    // generate tasks
    for (let i = 0; i < tasksJson.tasks.length; i++) {
        let taskText = tasksJson.tasks[i]['task']['text'];
        let taskImg = tasksJson.tasks[i]['task']['img'];
        switch (tasksJson.tasks[i]['type']) {
            case "basicTask":
                generateBasicTask(i, taskText, taskImg, tasksJson.tasks[i]['solution']['text'], tasksJson.tasks[i]['solution']['img']);
                break;
            case "taskRadio":
                generateComplicatedRadioTask(i, taskText, taskImg, tasksJson.tasks[i]['task']['options']);
                break;
            case "taskCheckbox":
                generateComplicatedCheckboxTask(i, taskText, taskImg, tasksJson.tasks[i]['task']['options']);
                break;
            case "taskInput":
                generateComplicatedInputTask(i, taskText, taskImg);
                break;
        }

        if (i < tasksJson.tasks.length - 1) {
            generateHrBetweenTasks();
        }
    }

    // check answers
    document.querySelectorAll(".checkTaskButton").forEach(button => {
        button.addEventListener("click", () => {
            let index = parseInt(button.getAttribute("index"));
            switch (tasksJson.tasks[index]['type']) {
                case "taskRadio":
                    let radioButton = document.querySelector(`#radio` + index + `_` + tasksJson.tasks[index]['solution']);
                    if (radioButton.checked) {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helyes";
                    } else {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helytelen";
                    }
                    break;
                case "taskCheckbox":
                    let checkedItems = [];
                    for (let j = 0; j < tasksJson.tasks[index]['task']["options"].length; j++) {
                        let checkbox = document.querySelector(`#checkbox` + index + `_` + tasksJson.tasks[index]["task"]['options'][j]["id"]);
                        if (checkbox.checked) {
                            checkedItems.push(tasksJson.tasks[index]["task"]['options'][j]["id"]);
                        }
                    }

                    if (arraysEqual(checkedItems, tasksJson.tasks[index]["solution"])) {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helyes";
                    } else {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helytelen";
                    }
                    break;
                case "taskInput":
                    let input = document.querySelector(`#input` + index);
                    if (input.value === tasksJson.tasks[index]["solution"]) {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helyes";
                    } else {
                        document.querySelector(`#correctAnswer` + index).innerText = "Helytelen";
                    }
                    break;
            }
        });
    });

    // show solution
    document.querySelectorAll(".showSolution").forEach(button => {
        button.addEventListener("click", () => {
            let index = parseInt(button.getAttribute("index"));
            document.querySelector(`#correctAnswer` + index).innerText = tasksJson.tasks[index]["solution"];
        });
    });
}


/**
 * Generate task dynamically. These tasks' solution is usually an image with a description.
 * @param {number} id index of the task.
 * @param {string} taskText text of the task.
 * @param {string} taskImg path of the image.
 * @param {string} solutionText description of the solution.
 * @param {string} solutionImg path of the image.
 */
function generateBasicTask(id, taskText, taskImg, solutionText, solutionImg) {
    const htmlString = `<div class="mb-1">
        <h5 class="mt-2">` + (id + 1) + `. feladat:</h5>` +
        (taskText !== "" ? `<p class="mb-1">` + taskText + `</p>` : ``) +
        (taskImg !== "" ? `<img class="mb-1 w-75 mx-auto d-block" src="` + taskImg + `" alt="" style="max-width: 650px;">` : ``) +
        `<div class="accordion accordion-flush mb-1" id="accordionFlushId` + id + `">
            <div class="accordion-item">
                <h5 class="accordion-header" id="flushHeading` + id + `">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#flushCollapse` + id + `" aria-expanded="false"
                        aria-controls="flushCollapse` + id + `">
                        Megoldás:
                    </button>
                </h5>
                <div id="flushCollapse` + id + `" class="accordion-collapse collapse my-2 mx-4"
                    aria-labelledby="flushHeading` + id + `" data-bs-parent="#accordionFlushId` + id + `">` +
        (solutionText !== "" ? `<p class="mb-1">` + solutionText + `</p>` : ``) +
        (solutionImg !== "" ? `<img class="w-75 mx-auto d-block" src="` + solutionImg + `" alt="" style="max-width: 650px;">` : ``) +
        `<br>
                </div>
            </div>
        </div>
    </div>`;
    const div = parser.parseFromString(htmlString, "text/html");
    tasksDiv.appendChild(div['body'].children[0]);
}


/**
 * Generate task dynamically which contains radio buttons.
 * @param {number} id index of the task.
 * @param {string} taskText text of the task.
 * @param {string} taskImg path of the image.
 * @param {Array} taskOptions possible solutions for the task.
 */
function generateComplicatedRadioTask(id, taskText, taskImg, taskOptions) {
    let htmlString = `<div class="mb-1">
    <h5 class="my-2">` + (id + 1) + `. feladat:</h5>` +
        (taskText !== "" ? `<p class="mb-1">` + taskText + `</p>` : ``) +
        (taskImg !== "" ? `<img class="mb-1 w-75 mx-auto d-block" src="` + taskImg + `" alt="" style="max-width: 650px;">` : ``);
    for (let i = 0; i < taskOptions.length; i++) {
        htmlString += `<div class="form-check">
            <input id="radio` + id + `_` + taskOptions[i]['id'] + `" class="form-check-input" type="radio" name="flexRadioDefault">
            <label class="form-check-label" for="radio` + id + `_` + taskOptions[i]['id'] + `">` +
            taskOptions[i]['text'] +
            `</label>
        </div>`;
    }
    htmlString += `<div class="my-2"><button index="` + id + `" type="button" class="btn btn-primary checkTaskButton">Ellenőrzés</button>
    <span class="ms-3" id="correctAnswer` + id + `"></span></div></div>`;

    const div = parser.parseFromString(htmlString, "text/html");
    tasksDiv.appendChild(div['body'].children[0]);
}


/**
 * Generate task dynamically which contains checkbox tag.
 * @param {number} id index of the task.
 * @param {string} taskText text of the task.
 * @param {string} taskImg path of the image.
 * @param {Array} taskOptions possible solutions for the task.
 */
function generateComplicatedCheckboxTask(id, taskText, taskImg, taskOptions) {
    let htmlString = `<div class="mb-1">
    <h5 class="mt-2">` + (id + 1) + `. feladat:</h5>` +
        (taskText !== "" ? `<p class="mb-1">` + taskText + `</p>` : ``) +
        (taskImg !== "" ? `<img class="mb-1 w-75 mx-auto d-block" src="` + taskImg + `" alt="" style="max-width: 650px;">` : ``);
    for (let i = 0; i < taskOptions.length; i++) {
        htmlString += `<div class="form-check">
            <input id="checkbox` + id + `_` + taskOptions[i]['id'] + `" class="form-check-input" type="checkbox">
            <label class="form-check-label" for="checkbox` + id + `_` + taskOptions[i]['id'] + `">` +
            taskOptions[i]['text'] +
            `</label>
        </div>`;
    }
    htmlString += `<div class="my-2"><button index="` + id + `" type="button" class="btn btn-primary checkTaskButton">Ellenőrzés</button>
    <span class="ms-3" id="correctAnswer` + id + `"></span></div></div>`;

    const div = parser.parseFromString(htmlString, "text/html");
    tasksDiv.appendChild(div['body'].children[0]);
}


/**
 * Generate task dynamically which contains input tag.
 * @param {number} id index of the task.
 * @param {string} taskText text of the task.
 * @param {string} taskImg path of the image.
 */
function generateComplicatedInputTask(id, taskText, taskImg) {
    const htmlString = `<div class="mb-1">
    <h5 class="mt-2">` + (id + 1) + `. feladat:</h5>` +
        (taskText !== "" ? `<p class="mb-1">` + taskText + `</p>` : ``) +
        (taskImg !== "" ? `<img class="mb-1 w-75 mx-auto d-block" src="` + taskImg + `" alt="" style="max-width: 650px;">` : ``) +
        `<div class="input-group my-2">
        <input id="input` + id + `" type="text" class="form-control">
    </div>
    <div class="my-2"><button index="` + id + `" type="button" class="btn btn-primary checkTaskButton">Ellenőrzés</button>
    <button index="` + id + `Solution" type="button" class="btn btn-primary showSolution">Megoldás mutatása</button>
    <span class="ms-3" id="correctAnswer` + id + `"></span></div></div>`;

    const div = parser.parseFromString(htmlString, "text/html");
    tasksDiv.appendChild(div['body'].children[0]);

    // clear correct answer div's text
    document.querySelector("#input" + id).addEventListener("input", () => {
        document.querySelector("#correctAnswer" + id).innerText = "";
    });
}


/**
 * Create horizontal line between tasks.
 */
function generateHrBetweenTasks() {
    const htmlString = `<hr>`;
    const hr = parser.parseFromString(htmlString, "text/html");
    tasksDiv.appendChild(hr['body'].children[0]);
}


/**
 * Check if given arrays are equal.
 * @param {Array} array1 first array.
 * @param {Array} array2 second array.
 * @returns 
 */
function arraysEqual(array1, array2) {
    if (array1 === array2) return true;
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) return false;
    }
    return true;
}