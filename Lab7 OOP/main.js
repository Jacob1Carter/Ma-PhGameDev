
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

class Student {
    constructor(name, course) {
        this.name = name;
        this.id = randInt(10000000, 99999999).toString();
        this.course = course;
        this.markA = 0;
        this.markB = 0;
        this.markC = 0;
        this.markD = 0;
    }

    addMarks(arr) {
        if (arr.length != 4) {
            console.error("addMarks() only accepts arays with a length of 4");
        }
        this.markA = arr[0];
        this.markB = arr[1];
        this.markC = arr[2];
        this.markD = arr[3];
    }

    calculateAvg() {
        return (this.markA+this.markB+this.markC+this.markD)/4
    }

    getClassification(mark) {
        if (70 <= mark && mark <= 100) {
            return "First class";
        }
        else if (60 <= mark && mark < 70) {
            return "Upper-second class";
        }
        else if (50 <= mark && mark < 59) {
            return "Lower-second class";
        }
        else if (40 <= mark && mark < 49) {
            return "Third class";
        }
        else if (0 <= mark && mark < 40) {
            return "Fail";
        }
        else {
            return "unknown";
        }
    }

    print() {
        console.log("\nStudent details\n-------------")
        console.log("Name: " + this.name);
        console.log("ID: " + this.id);
        console.log("Course: " + this.course);
        console.log("Average mark: " + this.calculateAvg());
        console.log("Degree classification: " + this.getClassification(this.calculateAvg()));
        console.log("\n")
    }
}

const newStudent = new Student("Farida Anes")

const students = [
    new Student("Farida Anes", "Course1"),
    new Student("Ganesha Madhavi", "Course4"),
    new Student("Gusti Sante", "Course2"),
]

for (i=0; i<students.length; i++){
    students[i].addMarks([randInt(0, 100, true), randInt(0, 100, true), randInt(0, 100, true), randInt(0, 100, true)])
    students[i].print();
}
