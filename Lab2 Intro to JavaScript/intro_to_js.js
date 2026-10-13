function setupConsoleOutput(elementId) {
    const output = document.getElementById(elementId);

    function write(args) {
        const line = document.createElement("div");
        line.textContent = [...args].join(" ");
        output.appendChild(line);
    }
    console.log = (...args) => write(args);

}

setupConsoleOutput("cnsole-output")
console.log("Lab 2 - Inro to JavaScript\n-------------------")