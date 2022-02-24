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
  document.querySelector(".close").addEventListener("click", closePopUp);

  // Sort when th elements are clicked.
  let allThElements = document.querySelectorAll("th");
  allThElements.forEach((ThElement) => {
    ThElement.addEventListener("click", sort);
  });

  // Show dropdown content when dropdown is clicked
  document.querySelector(".dropdown_menu").addEventListener("click", () => {
    document.querySelector(".dropdown-content").classList.toggle("flex");
  });

  // Hide dropdown content if user clicks outside of it
  document.addEventListener("mouseup", function (e) {
    const container = document.querySelector(".dropdown-content");
    if (!container.contains(e.target)) {
      document.querySelector(".dropdown-content").classList.remove("flex");
    }
  });
  // Filter when button elements are clicked.
  let allHouseOptions = document.querySelectorAll(".filterHouse");
  allHouseOptions.forEach((option) => {
    option.addEventListener("click", filter);
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
  console.log("SORT", ThElement.target);
  let sortBy;
  let orderBy;
  let direction = 1;

  sortBy = ThElement.target.dataset.sort;
  console.log("SORT", sortBy);
  orderBy = ThElement.target.getAttribute("data-sort-direction");

  this.classList.toggle("sortby");

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

function filter(option) {
  let filterChoice = option.target.getAttribute("data-filter");
  console.log(filterChoice);

  if (filterChoice != "*") {
    filteredStudents = allStudents.filter(StudentHouse);
  } else {
    filteredStudents = allStudents;
  }

  function StudentHouse(studentInfo) {
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
