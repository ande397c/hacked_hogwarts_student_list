"use strict";
window.addEventListener("load", setup);

let students;
let filteredStudents;

let allStudents = [];

const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  image: "",
  house: "",
  gender: "",
};

function setup() {
  const popUp = document.querySelector(".pop_up");
  popUp.style.display = "none";
  document.querySelector(".close").addEventListener("click", closePopUp);

  let allThElements = document.querySelectorAll("th");

  let allOptions = document.querySelectorAll("#houses option");

  allThElements.forEach((ThElement) => {
    ThElement.addEventListener("click", sort);
  });

  allOptions.forEach((option) => {
    option.addEventListener("click", filter);
  });

  // document.querySelector("#filter_btn").addEventListener("click", filter);

  getJson();
}

async function getJson() {
  const url = "https://petlatkea.dk/2021/hogwarts/students.json";
  let data = await fetch(url);
  students = await data.json();
  console.log(students);
  updateObjects(students);
}

function filter(option) {
  console.log("filter");

  let houseVal = option.target.getAttribute("data-filter");

  if (houseVal === "hufflepuff") {
    filteredStudents = allStudents.filter(filterHuff);
  } else if (houseVal === "ravenclaw") {
    filteredStudents = allStudents.filter(filterRaven);
  }

  let huffStudents = allStudents.filter(filterHuff);
  let ravenStudents = allStudents.filter(filterRaven);
  console.log("huffstudents:", huffStudents);
  console.log("ravenstudents:", ravenStudents);
  displayList(filteredStudents);
}

function sort(ThElement, sortData) {
  this.classList.toggle("sortby");

  sortData = ThElement.target.getAttribute("data-sort");
  console.log(sortData);
  let directionWay = this.dataset.sortDirection;

  let directionControl = () => {
    if (directionWay === "asc") {
      return "decs";
    } else {
      return "asc";
    }
  };

  console.log(directionControl());

  if (sortData === "firstname") {
    filteredStudents.sort(compareFirstName);
  } else if (sortData === "lastname") {
    filteredStudents.sort(compareLastName);
  } else if (sortData === "house") {
    filteredStudents.sort(compareHouse);
  }
  displayList(filteredStudents);
  // console.log(filteredStudents);
}

function updateObjects(students) {
  filteredStudents = allStudents;
  students.forEach((jsonObject) => {
    const studentInfo = Object.create(Student);

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
  displayList();
  // console.table(allStudents);
}

function displayList() {
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
  clone.querySelector("tr").addEventListener("click", () => showDetails(studentInfo));
  // clone.querySelector("[data-field=lastname]").addEventListener("click", () => showDetails(studentInfo));

  // append clone to list
  document.querySelector("#students_table tbody").appendChild(clone);
}

function closePopUp() {
  document.querySelector(".pop_up").style.display = "none";
}

function showDetails(details) {
  document.querySelector(".pop_up").style.display = "block";
  window.scrollTo(0, 0);

  document.querySelector(".pop_up").querySelector("#fullname").textContent = details.firstName + " " + details.middleName + " " + details.lastName;
  document.querySelector(".pop_up").querySelector("#house").textContent = details.house;
  document.querySelector(".pop_up").querySelector("img").src = details.image;
}

// ....... Compare functions ..........

function compareFirstName(a, b) {
  if (a.firstname < b.firstname) {
    return -1;
  } else {
    return 1;
  }
}

function compareLastName(a, b) {
  if (a.lastname < b.lastname) {
    return -1;
  } else {
    return 1;
  }
}

function compareHouse(a, b) {
  if (a.house < b.house) {
    return -1;
  } else {
    return 1;
  }
}

// ....... Filter functions ..........

function filterHuff(studentInfo) {
  console.log("filterHuff");
  if (studentInfo.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}

function filterRaven(studentInfo) {
  console.log("filterRaven");
  if (studentInfo.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}
