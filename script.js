"use strict";
window.addEventListener("load", setup);

let students;
let families;
let filteredStudents;
let allStudents = [];
let expelledStudents = [];
let systemHasBeenHacked = false;

const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  bloodStatus: "",
  image: "",
  house: "",
  gender: "",
  bloodStatus: "",
  inquisitorial: false,
  hacker: false,
  id: 0,
  expelled: false,
  prefect: false,
};

const settings = {
  filter: "*",
  sortBy: "firstName",
  sortDir: "asc",
  direction: 1,
};

// ............................................. setup ..................................... //

function setup() {
  document.querySelector("#clear_btn").addEventListener("click", () => {
    document.querySelector("#search_input").value = "";
  });
  document.querySelector("#search_input").addEventListener("input", searchStudent);

  // Close pop up when X is clicked
  document.querySelector(".close").addEventListener("click", closePopUp);

  // Show dropdown content when dropdown is clicked
  document.querySelector(".dropdown_house").addEventListener("click", () => {
    document.querySelector(".dropdown-content").classList.toggle("flex");
  });
  // Show dropdown content when dropdown is clicked
  document.querySelector(".dropdown_status").addEventListener("click", () => {
    document.querySelector(".dropdown-content_status").classList.toggle("flex");
  });

  // Hide dropdown content if user clicks outside of it
  document.addEventListener("mouseup", function (e) {
    const container = document.querySelector(".dropdown-content");
    if (!container.contains(e.target)) {
      container.classList.remove("flex");
    }
  });

  // Hide dropdown content if user clicks outside of it
  document.addEventListener("mouseup", function (e) {
    const container_status = document.querySelector(".dropdown-content_status");
    if (!container_status.contains(e.target)) {
      container_status.classList.remove("flex");
    }
  });

  // Filter house  when button elements are clicked.
  let allHouseOptions = document.querySelectorAll(".filter_house");
  allHouseOptions.forEach((option) => {
    option.addEventListener("click", filterHouse);
  });
  // Filter status when button elements are clicked.
  let allStatusOptions = document.querySelectorAll(".filter_status");
  allStatusOptions.forEach((statusOption) => {
    statusOption.addEventListener("click", filterStatus);
  });

  // Sort when th elements are clicked.
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", sort));

  document.querySelector("h1").addEventListener("dblclick", hackTheSystem);

  getStudents();
}

// ............................................. Get JSON data ..................................... //
async function getStudents() {
  const url1 = "https://petlatkea.dk/2021/hogwarts/students.json";
  let data = await fetch(url1);
  students = await data.json();
  // console.log(students);
  updateObjects(students);
  getFamilies();
}

async function getFamilies() {
  const url2 = "https://petlatkea.dk/2021/hogwarts/families.json";
  let data = await fetch(url2);
  families = await data.json();
  getBloodStatus(families);
}

// ............................................. Get bloodStatus ..................................... //

function getBloodStatus(families) {
  allStudents.forEach((student, index) => {
    if (families.half.includes(student.lastName)) {
      student.bloodStatus = "half-blood";
    } else if (families.pure.includes(student.lastName)) {
      student.bloodStatus = "pure-blood";
    } else {
      student.bloodStatus = "muggle";
    }
  });
}

// ............................................. sorting function ..................................... //

function sort(event) {
  // console.log("-", event);
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  console.log(sortDir, "-", sortBy);

  // find "old" sortBy element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");
  // console.log(oldElement);
  // indicate active sort
  event.target.classList.add("sortby");
  settings.sortBy = sortBy;

  // console.log(event);

  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  if (sortDir === "desc") {
    settings.direction = -1;
  } else {
    settings.direction = 1;
  }

  filteredStudents.sort(sortByValue);

  // Campare values
  // a is the object and b is the index in the array
  function sortByValue(a, b) {
    // console.log(sortBy);
    if (a[sortBy] < b[sortBy]) {
      return -1 * settings.direction;
    } else {
      return 1 * settings.direction;
    }
  }

  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  displayList(filteredStudents);
}

// ............................................. filter functions ..................................... //

function filterStatus(statusOption) {
  let filterChoice = statusOption.target.getAttribute("data-filter");
  console.log(filterChoice);

  // Display filter option on buttton for user
  document.querySelector(".dropbtn_status").textContent = `Filter by: ${filterChoice}`;

  if (filterChoice === "Not expelled") {
    filteredStudents = allStudents;
    document.querySelector("#total_displaying").textContent = `Currently showing ${allStudents.length} student(s)`;
  } else if (filterChoice === "Expelled") {
    filteredStudents = expelledStudents;
    document.querySelector("#total_displaying").textContent = `Currently showing ${expelledStudents.length} student(s)`;
  } else if (filterChoice === "Inquisitorial") {
    filteredStudents = allStudents.filter((studentInfo) => studentInfo.inquisitorial);
    document.querySelector("#total_displaying").textContent = `Currently showing ${allStudents.filter((studentInfo) => studentInfo.inquisitorial).length} student(s)`;
  } else if (filterChoice === "Prefect") {
    filteredStudents = allStudents.filter((student) => student.prefect);
    document.querySelector("#total_displaying").textContent = `Currently showing ${allStudents.filter((student) => student.prefect).length} student(s)`;
  }

  displayList(filteredStudents);
  updateTableBody();

  function updateTableBody() {
    if (expelledStudents.length === 0 && filterChoice === "Expelled") {
      document.querySelector("#error_empty h2").innerHTML = "No students have been expelled yet";
    } else if (allStudents.filter((student) => student.prefect).length === 0 && filterChoice === "Prefect") {
      document.querySelector("#error_empty h2").innerHTML = "No students have been selected prefect yet";
    } else if (allStudents.filter((student) => student.inquisitorial).length === 0 && filterChoice === "Inquisitorial") {
      document.querySelector("#error_empty h2").innerHTML = "No students have been selected inquisitor yet";
    } else {
      document.querySelector("#error_empty").style.display = "none";
    }
  }
}

function filterHouse(option) {
  let filterChoice = option.target.getAttribute("data-filter");

  console.log(filterChoice);

  document.querySelector(".dropbtn_house").textContent = `Filter by: ${filterChoice}`;

  if (filterChoice != "All houses") {
    filteredStudents = allStudents.filter(studentHouse);
    document.querySelector("#total_displaying").textContent = `Currently showing ${filteredStudents.length} students`;
  } else {
    filteredStudents = allStudents;
  }

  function studentHouse(studentInfo) {
    if (studentInfo.house === filterChoice) {
      return true;
    } else {
      return false;
    }
  }

  displayList(filteredStudents);
}

// ............................................. display numbers and informations ..................................... //

function displayListInformation() {
  // Number of students per house:
  document.querySelector("#gryff_total").textContent = allStudents.filter((student) => student.house === "Gryffindor").length;
  document.querySelector("#slyth_total").textContent = allStudents.filter((student) => student.house === "Slytherin").length;
  document.querySelector("#huff_total").textContent = allStudents.filter((student) => student.house === "Hufflepuff").length;
  document.querySelector("#raven_total").textContent = allStudents.filter((student) => student.house === "Ravenclaw").length;

  // Number of expelled and not expelled students:
  document.querySelector("#total_expelled").textContent = `${expelledStudents.length} student(s) have been expelled`;
  document.querySelector("#total_not_expelled").textContent = `${allStudents.length} student(s) have not been expelled`;
}

// ............................................. Get name data from json ..................................... //

function updateObjects(students) {
  filteredStudents = allStudents;
  students.forEach((jsonObject, i) => {
    const studentInfo = Object.create(Student);
    studentInfo.inquisitorial = false;
    // console.log("studentInfo", studentInfo);
    // console.log("studentInfo", studentInfo.inquisitorial);
    studentInfo.id = i;
    // Get full name from json data:
    const getfullName = jsonObject.fullname.trim();

    // Get firstName, middleName and lastName from fullName:

    let checkName = getfullName.match(/\b\w+\b/g);
    const getFirstName = checkName[0];
    const getMiddleName = checkName[1];
    const getLastName = checkName[2];

    const firstName = getFirstName.charAt(0).toUpperCase() + getFirstName.substring(1).toLowerCase();

    studentInfo.firstName = firstName;

    if (checkName.length === 2) {
      studentInfo.lastName = checkName[1].charAt(0).toUpperCase() + checkName[1].slice(1).toLowerCase();
      studentInfo.middleName = "";
    } else if (checkName.length === 3) {
      studentInfo.lastName = checkName[2].charAt(0).toUpperCase() + checkName[2].slice(1).toLowerCase();

      studentInfo.middleName = getMiddleName.charAt(0).toUpperCase() + getMiddleName.slice(1);
    } else {
      studentInfo.lastName = "";
      studentInfo.middleName = "";
    }

    if (getfullName.includes('"')) {
      studentInfo.nickName = getfullName.substring(getfullName.indexOf('"') + 1, getfullName.lastIndexOf('"'));
    } else if (getfullName.includes("-")) {
      studentInfo.lastName = getfullName.substring(getfullName.indexOf("-") - 5);
      studentInfo.middleName = "";
      studentInfo.nickName = "none";
    } else {
      studentInfo.nickName = "none";
    }

    if (checkName.length === 1) {
      studentInfo.image = `images/${getFirstName.toLowerCase()}_${getFirstName.charAt(0).toLowerCase()}.png`;
    } else if (checkName.length === 2) {
      studentInfo.image = `images/${getMiddleName.toLowerCase()}_${getFirstName.charAt(0).toLowerCase()}.png`;
    } else {
      studentInfo.image = `images/${getLastName.toLowerCase()}_${getFirstName.charAt(0).toLowerCase()}.png`;
    }

    // Remove spaces from house names
    const houseRemoveSpace = jsonObject.house.replace(/ /g, "");

    const house = houseRemoveSpace.charAt(0).toUpperCase() + houseRemoveSpace.substring(1).toLowerCase();

    studentInfo.house = house;

    studentInfo.gender = jsonObject.gender;

    // console.log(studentInfo.house);

    allStudents.push(studentInfo);
  });

  displayList(allStudents);
}

// ............................................. Display list ..................................... //
function displayList(allStudents) {
  document.querySelector("#total_displaying").textContent = `Currently showing ${allStudents.length} student(s)`;

  if (allStudents.length === 0) {
    document.querySelector("#error_empty").style.display = "block";
    document.querySelector("#error_empty h2").innerHTML = "No students matched the search result";
  } else {
    document.querySelector("#error_empty").style.display = "none";
  }

  document.querySelector("#students_table tbody").innerHTML = "";

  allStudents.forEach(displayStudent);
  displayListInformation();
}

// ............................................. Display student ..................................... //
function displayStudent(studentInfo) {
  // console.log("displayStudent:", studentInfo);
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=firstname]").textContent = studentInfo.firstName;
  clone.querySelector("[data-field=lastname]").textContent = studentInfo.lastName;
  clone.querySelector("[data-field=house]").textContent = studentInfo.house;
  clone.querySelector("[data-field=gender]").textContent = studentInfo.gender;

  // Click for details
  clone.querySelector("[data-field=firstname]").addEventListener("click", () => showDetails(studentInfo));
  clone.querySelector("[data-field=lastname]").addEventListener("click", () => showDetails(studentInfo));

  if (studentInfo.inquisitorial) {
    clone.querySelector("[data-field=inquisitorial]").textContent = "????";
  } else {
    clone.querySelector("[data-field=inquisitorial]").textContent = "??????";
  }

  if (studentInfo.prefect) {
    clone.querySelector("[data-field=prefect]").textContent = "???";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "???";
  }

  clone.querySelector("[data-field=inquisitorial]").addEventListener("click", () => assignAsInquisitorial(studentInfo));
  clone.querySelector("[data-field=prefect]").addEventListener("click", () => assignAsPrefect(studentInfo));

  // append clone to list
  document.querySelector("#students_table tbody").appendChild(clone);
}

// ............................................. Prefects ..................................... //

function assignAsPrefect(studentInfo) {
  console.log(studentInfo);
  if (studentInfo.prefect) {
    studentInfo.prefect = false;
  } else {
    tryToMakeStudentPrefect(studentInfo);
  }

  displayList(filteredStudents);
}

function tryToMakeStudentPrefect(selectedStudent) {
  const prefects = allStudents.filter((student) => student.prefect);
  // const numberOfPrefects = prefects.length;
  const otherPrefect = prefects.filter((student) => student.house === selectedStudent.house);

  if (otherPrefect.length >= 2) {
    document.querySelector(".pop_up_pre").style.display = "block";
    document.querySelector(".close_pre").addEventListener("click", closePopUp);
    prefects.shift();
  } else {
    selectedStudent.prefect = true;
    prefects.push(selectedStudent);
  }
  console.log("prefects", prefects);
}

// ............................................. Inquisitorial ..................................... //

function assignAsInquisitorial(studentInfo) {
  if (studentInfo.inquisitorial) {
    studentInfo.inquisitorial = false;
  } else {
    tryToMakeStudentInquisitorial(studentInfo);
    // inquisitorialSquad.push(studentInfo);
  }

  displayList(filteredStudents);
}

function tryToMakeStudentInquisitorial(selectedStudent) {
  const inquisitors = allStudents.filter((studentInfo) => studentInfo.inquisitorial);

  if (selectedStudent.bloodStatus != "pure-blood" && selectedStudent.house != "Slytherin") {
    console.log("Only pure-blooded students from house Slytherin can be added!");
    document.querySelector(".pop_up_ins").style.display = "block";
    document.querySelector(".close_ins").addEventListener("click", closePopUp);
    inquisitors.shift();
  } else {
    selectedStudent.inquisitorial = true;
    inquisitors.push(selectedStudent);
  }
  console.log(inquisitors);
}

// ............................................. Popups ..................................... //

function closePopUp() {
  document.querySelector(".pop_up").style.display = "none";
  document.querySelector(".pop_up_ins").style.display = "none";
  document.querySelector(".pop_up_pre").style.display = "none";

  displayListInformation();
}

// ............................................. user feedback ..................................... //

function displayMessage(details) {
  const message = document.querySelector("#messeage_board");
  message.className = "cta show";
  document.querySelector("#messeage").textContent = `${details.firstName} ${details.lastName} has been succesfully expelled!`;

  setTimeout(removeMessage, 3000);

  function removeMessage() {
    message.className = "cta hide";
  }
}

// ............................................. Detailed student popup ..................................... //

function showDetails(details) {
  console.log(expelledStudents);
  document.querySelector(".pop_up").style.display = "block";
  window.scrollTo(0, 0);

  document.querySelector(".pop_up").querySelector("#firstname").textContent = details.firstName;
  document.querySelector(".pop_up").querySelector("#middlename").textContent = details.middleName;
  document.querySelector(".pop_up").querySelector("#nickname").textContent = details.nickName;
  document.querySelector(".pop_up").querySelector("#lastname").textContent = details.lastName;
  document.querySelector(".pop_up").querySelector("#house").textContent = details.house;
  document.querySelector(".pop_up").querySelector("#blood").textContent = details.bloodStatus;
  document.querySelector(".pop_up").querySelector("img").src = details.image;

  if (details.house === "Gryffindor") {
    document.querySelector("#house_crest").src = "images/assets/gryffindor_emblem.png";
    document.querySelector(".popup_content").style.border = "7px solid #71130B";
  } else if (details.house === "Slytherin") {
    document.querySelector("#house_crest").src = "images/assets/slytherin_emblem.png";
    document.querySelector(".popup_content").style.border = "7px solid #1E4B17";
  } else if (details.house === "Hufflepuff") {
    document.querySelector("#house_crest").src = "images/assets/hufflepuff_emblem.png";
    document.querySelector(".popup_content").style.border = "7px solid #FAE24D";
  } else {
    document.querySelector("#house_crest").src = "images/assets/ravenclaw_emblem.png";
    document.querySelector(".popup_content").style.border = "7px solid #0E2B75";
  }

  document
    .querySelector(".pop_up")
    .querySelector("img")
    .addEventListener("error", function handleError() {
      const defaultImage = "images/assets/default.png";

      document.querySelector(".pop_up").querySelector("img").src = defaultImage;
      document.querySelector(".pop_up").querySelector("img").alt = "default";
    });

  // Hide dropdown content if user clicks outside of it
  document.addEventListener("mouseup", function (e) {
    const popUpContainer = document.querySelector(".popup_content");
    if (!popUpContainer.contains(e.target)) {
      closePopUp();
    }
  });

  document.querySelector("#expel_btn").addEventListener("click", expelStudent);

  function expelStudent() {
    document.querySelector("#expel_btn").removeEventListener("click", expelStudent);

    const studentToBeExpelled = (element) => element.id === details.id;

    const indexOfStudentToExpel = allStudents.findIndex(studentToBeExpelled);

    if (details.hacker !== true) {
      expelledStudents.push(allStudents[indexOfStudentToExpel]);
      allStudents.splice(indexOfStudentToExpel, 1);
      displayList(allStudents);
      displayMessage(details);
    } else {
      console.log("can't expel this student");
      document.querySelector(".pop_up_expel").style.display = "block";
      document.querySelector(".close_expel").addEventListener("click", () => {
        document.querySelector(".pop_up_expel").style.display = "none";
      });
    }
    closePopUp(expelledStudents);
  }

  checkStatus(details);
}

// ............................................. Get student status ..................................... //
function checkStatus(selectedStudent) {
  console.log("Student Details:", selectedStudent);

  // Check status of selected student
  if (expelledStudents.includes(selectedStudent)) {
    document.querySelector("#expel_stat").style.display = "block";
    document.querySelector("#prefect_stat").style.display = "none";
    document.querySelector("#squad_stat").style.display = "none";
  } else {
    console.log("not expelled");
  }

  if (allStudents.filter((selectedStudent) => selectedStudent.prefect).includes(selectedStudent)) {
    document.querySelector("#prefect_stat").style.display = "block";
  } else {
    document.querySelector("#prefect_stat").style.display = "none";
  }

  if (allStudents.filter((selectedStudent) => selectedStudent.inquisitorial).includes(selectedStudent)) {
    document.querySelector("#squad_stat").style.display = "block";
  } else {
    document.querySelector("#squad_stat").style.display = "none";
  }
}

// ............................................. Search function ..................................... //

function searchStudent(evt) {
  // write to the list with only those elemnts in the filteredStudents array that has properties containing the search frase
  displayList(
    filteredStudents.filter((elm) => {
      // comparing in uppercase so that m is the same as M

      if (evt.target.value.includes(" ")) {
        let searchName = evt.target.value.split(" ");
        let firstName = searchName[0];
        let lastName = searchName[1] || "";

        if (searchName.length < 3) {
          return (
            (elm.firstName.toUpperCase().includes(firstName.toUpperCase()) && elm.lastName.toUpperCase().includes(lastName.toUpperCase())) ||
            (elm.firstName.toUpperCase().includes(lastName.toUpperCase()) && elm.lastName.toUpperCase().includes(firstName.toUpperCase()))
          );
        } else {
          return;
        }
      } else {
        return elm.firstName.toUpperCase().includes(evt.target.value.toUpperCase()) || elm.lastName.toUpperCase().includes(evt.target.value.toUpperCase());
      }
    })
  );
}

// ............................................. Danger zone (hack the system) ..................................... //

function hackTheSystem() {
  console.log("system is hacked");

  const me = {
    firstName: "Anders",
    lastName: "Iversen",
    middleName: "Trapman",
    nickName: "Trap",
    bloodStatus: "aryan",
    image: "",
    house: "Dumbledore",
    gender: "boy",
    inquisitorial: false,
    id: 0,
    expelled: false,
    prefect: false,
    hacker: true,
  };

  if (systemHasBeenHacked === true) {
    console.log("System can't be hacked multiple times!");
  } else {
    systemHasBeenHacked = true;
    allStudents.push(me);
    setTimeout(removeInquisitors, 3000);
    messUpBloodStatus();
  }

  function messUpBloodStatus() {
    allStudents.forEach((student) => {
      const bloodStatuses = ["pure-blood", "half-blood", "muggle"];
      let random = Math.floor(Math.random() * 3);
      if (student.bloodStatus === "muggle" || student.bloodStatus === "half-blood") {
        student.bloodStatus = "pure-blood";
      } else {
        student.bloodStatus = bloodStatuses[random];
      }
    });
  }

  function removeInquisitors() {
    console.log("removeInquisitors");

    allStudents.forEach((student) => {
      student.inquisitorial = false;
    });

    displayList(allStudents);
    errorBlood();
  }
}

function errorBlood() {
  console.log("errorBlood");
  const message = document.querySelector("#messeage_board");
  message.className = "cta show";
  document.querySelector("#messeage").textContent = `Error - inquisitors have lost their assigned status`;

  setTimeout(removeMessage, 3000);

  function removeMessage() {
    message.className = "cta hide";
  }
}
