"use strict";
window.addEventListener("load", setup);

let students;
let filteredStudents;
let allStudents = [];
let expelledStudents = [];
let inquisitorialSquad = [];
// let prefects = [];

const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  image: "",
  house: "",
  gender: "",
  bloodStatus: "",
  inquisitorial: false,
  id: 0,
  expelled: false,
  prefect: false,
};

function setup() {
  // Search for student
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
  let allThElements = document.querySelectorAll("th");
  allThElements.forEach((ThElement) => {
    ThElement.addEventListener("click", sort);
  });

  getJson();
}

// Get JSON data
async function getJson() {
  const url = "https://petlatkea.dk/2021/hogwarts/students.json";
  let data = await fetch(url);
  students = await data.json();
  console.log(students);
  updateObjects(students);
}

function sort(ThElement) {
  let direction = 1;

  let sortBy = ThElement.target.dataset.sort;
  let orderBy = ThElement.target.getAttribute("data-sort-direction");

  if (orderBy === "asc") {
    ThElement.target.dataset.sortDirection = "desc";
  } else {
    ThElement.target.dataset.sortDirection = "asc";
  }

  if (orderBy === "asc") {
    direction = 1;
  } else {
    direction = -1;
  }

  console.log(sortBy);
  console.log(orderBy);

  filteredStudents.sort(compareProperty);
  displayList(filteredStudents);

  function compareProperty(a, b) {
    if (a[sortBy] < b[sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
}

function filterStatus(statusOption) {
  let filterChoice = statusOption.target.getAttribute("data-filter");

  if (expelledStudents.length === 0 && filterChoice === "Expelled") {
    document.querySelector("#error_empty h2").innerHTML = "No students have been expelled yet";
  } else {
    document.querySelector("#error_empty").style.display = "none";
  }

  if (filterChoice === "*") {
    filteredStudents = allStudents;
  } else if (filterChoice === "Expelled") {
    filteredStudents = expelledStudents;
  } else if (filterChoice === "Inquisitorial") {
    filteredStudents = inquisitors;
  }

  // else if (filterChoice === "Prefect") {
  //   filteredStudents = prefects;
  // }

  displayList(filteredStudents);
}

function filterHouse(option) {
  let filterChoice = option.target.getAttribute("data-filter");
  console.log(filterChoice);

  if (filterChoice != "*") {
    filteredStudents = allStudents.filter(studentHouse);
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

function updateObjects(students) {
  filteredStudents = allStudents;
  students.forEach((jsonObject, i) => {
    const studentInfo = Object.create(Student);
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
      studentInfo.nickName = "undefined";
    } else {
      studentInfo.nickName = "undefined";
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
  // console.table(allStudents);
}

function displayList(allStudents) {
  document.querySelector("#students_table tbody").innerHTML = "";

  allStudents.forEach(displayStudent);
}

function displayStudent(studentInfo) {
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
    clone.querySelector("[data-field=inquisitorial]").textContent = "🔴";
  } else {
    clone.querySelector("[data-field=inquisitorial]").textContent = "⚫️";
  }

  if (studentInfo.prefect) {
    clone.querySelector("[data-field=prefect]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "☆";
  }

  clone.querySelector("[data-field=inquisitorial]").addEventListener("click", () => assignAsInquisitorial(studentInfo));
  clone.querySelector("[data-field=prefect]").addEventListener("click", () => assignAsPrefect(studentInfo));

  // append clone to list
  document.querySelector("#students_table tbody").appendChild(clone);

  return studentInfo;
}

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
  const numberOfPrefects = prefects.length;
  const otherPrefect = prefects.filter((student) => student.house === selectedStudent.house);
  console.log("prefects", prefects);
  console.log("others", otherPrefect);

  if (otherPrefect.length >= 2) {
    alert("There can only be 2 prefects per house");
    prefects.shift();
  } else {
    selectedStudent.prefect = true;
  }
}

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
  const numberOfInquisitors = inquisitors.length;
  console.log(inquisitors);
  const other = inquisitors.filter((studentInfo) => studentInfo.house === selectedStudent.house);

  if (other !== undefined) {
    console.log("There can be only one winner of each house");
    removeOther(other);
  } else if (numberOfInquisitors >= 2) {
    console.log("There can only be two winners!");
    removeAOrB(inquisitors[0], inquisitors[1]);
  } else {
    makeWinner(selectedStudent);
  }

  // Testing:

  makeWinner(selectedStudent);

  function removeOther(other) {
    removeWinner(other);
    makeWinner(selectedStudent);
  }

  function removeAOrB(inquisitorA, inquisitorB) {
    removeWinner(inquisitorA);
    makeWinner(selectedStudent);

    removeWinner(inquisitorB);
    makeWinner(selectedStudent);
  }

  function removeWinner(studentInfo) {
    studentInfo.inquisitorial = false;
  }

  function makeWinner(studentInfo) {
    studentInfo.inquisitorial = true;
  }
}

function closePopUp(expelledStudents) {
  document.querySelector(".pop_up").style.display = "none";
}

function displayMessage(details) {
  const message = document.querySelector("#messeage_board");
  message.className = "cta show";
  document.querySelector("#messeage").textContent = `${details.firstName} ${details.lastName} has been succesfully expelled!`;

  setTimeout(removeMessage, 3000);

  function removeMessage() {
    message.className = "cta hide";
  }
}

function showDetails(details) {
  //console.log("showDetails", details);
  document.querySelector(".pop_up").style.display = "block";
  window.scrollTo(0, 0);

  document.querySelector(".pop_up").querySelector("#fullname").textContent = details.firstName + " " + details.middleName + " " + details.lastName;
  document.querySelector(".pop_up").querySelector("#house").textContent = details.house;
  document.querySelector(".pop_up").querySelector("img").src = details.image;

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
    displayMessage(details);
    const studentToBeExpelled = (element) => element.id === details.id;

    const indexOfStudentToExpel = allStudents.findIndex(studentToBeExpelled);

    expelledStudents.push(allStudents[indexOfStudentToExpel]);

    allStudents.splice(indexOfStudentToExpel, 1);

    console.log("expelledStudents", expelledStudents);
    console.log("object:", details);
    displayList(allStudents);
    closePopUp(expelledStudents);
  }

  checkStatus(details);

  return details;
}

function checkStatus(selectedStudent) {
  // let studentDetails = showDetails(info);
  console.log("Student Details:", selectedStudent);

  // Check status of selected student
  if (expelledStudents.includes(selectedStudent)) {
    document.querySelector("#expel_stat").style.color = "red";
  } else if (inquisitorialSquad.includes(selectedStudent)) {
    document.querySelector("#squad_stat").style.color = "red";
  } else if (prefects.includes(selectedStudent)) {
    document.querySelector("#prefect_stat").style.color = "red";
  }
}

function searchStudent(evt) {
  console.log("searchStudent");

  const inputVal = document.querySelector("#search_input").value;

  // write to the list with only those elemnts in the allAnimals array that has properties containing the search frase
  displayList(
    allStudents.filter((elm) => {
      // comparing in uppercase so that m is the same as M
      return elm.firstName.toUpperCase().includes(evt.target.value.toUpperCase()) || elm.lastName.toUpperCase().includes(evt.target.value.toUpperCase()) || elm.house.toUpperCase().includes(evt.target.value.toUpperCase());
    })
  );
}
