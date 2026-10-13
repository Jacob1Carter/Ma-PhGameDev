function setupConsoleOutput(elementId) {
    const output = document.getElementById(elementId);

    function write(args) {
        const line = document.createElement("div");
        line.textContent = [...args].join(" ");
        output.appendChild(line);
    }
    console.log = (...args) => write(args);

}

function variables() {

    console.log("\nVariables\n-------------------");
    let score = 0;
    console.log("Score: " + score);
    score += 6;
    console.log("Score += 6: " + score);
    score += 9;
    console.log("Score += 9: " + score);
}

function loops() {

    let enemies = [
        "enemy1",
        "enemy2",
        "enemy3"
    ];

    // list every enemy in the array (list)
    for (let i = 0; i < enemies.length; i++) {
        console.log(enemies[i]);
    }

    console.log()

    // repeat until time become greater than 100
    let time = 0
    while (time < 100) {
        time += 6
        console.log("time: " + time)
    }
}

function functions() {
    const forceOfJump = 3;

    function jump(forceOfJump) {
        console.log(`Player jumps with a force of ${forceOfJump}`);
    }

    jump(forceOfJump);

}

function main() {
    setupConsoleOutput("console-output");
    console.log("Lab 2 - Inro to JavaScript\n-------------------");

    functions();
}

main();