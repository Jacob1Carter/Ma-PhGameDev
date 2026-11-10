
function setupConsoleOutput(elementId) {
  const output = document.getElementById(elementId); 

  function write(args) {
    const line = document.createElement("div");
    line.textContent = [...args].join(" ");
    output.appendChild(line);
  }
  console.log = (...args) => write(args);
}

setupConsoleOutput("console-output");
console.log("Lab 7 - OOP \n----------------------------");

// classes
console.log("\nClasses\n-------")

class Racer {
    constructor(name, position) {
        this.name = name;
        this.speed = 0;
        this.position = position;
        this.powerUp = null;
    }

    accelerate() {
        this.speed += 5;
    }

    addPowerUp() {
        const powerUps = [
            "Mushroom",
            "Green Shell",
            "Red Shell",
            "Banana",
            "Star"
        ]

        const index = randInt(0, powerUps.length, false)
        this.powerUp = powerUps[index];
    }

    print() {
        console.log("\nRacer details\n-------------")
        console.log("Name: " + toad.name);
        console.log("Speed: " + toad.speed);
        console.log("Position: " + toad["position"]);
        console.log("Power up: " + toad["powerUp"]);
    }
}

const toad = new Racer("Toad", 3);

toad.print();
toad.accelerate();
toad.print();
toad.addPowerUp();
toad.print();


