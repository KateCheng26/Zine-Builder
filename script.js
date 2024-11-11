// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getCountFromServer} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDaacl1g-63bYmdKk0EzPHMLe5CZLU53Sk",
    authDomain: "zine-builder.firebaseapp.com",
    projectId: "zine-builder",
    storageBucket: "zine-builder.appspot.com",
    messagingSenderId: "1037717512420",
    appId: "1:1037717512420:web:51b5d77bec663069310cf1"
  };

//initialize Firbase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


var username;

//login function for submit button
export const login = function (email, password){
  //call signInWithEmailAndPassword, firebase function
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
      username = userCredential.user.uid;
      console.log(String(username));
    //sucessful sign-in: update window
    window.location.href = "homepage.html";
  })
  .catch((error) => {
    //error catch log messages
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}

//method that makes the Project Name input show up
export const displayInput = function(){
    document.getElementById('projectNamePicker').style.display='unset';
}
//method that makes the Project Name input disappear
export const hideInput = function(){
  document.getElementById('projectNamePicker').style.display='none';
}

export const displayNewProjectButton = function(){
  //create a div with the class projects and onclick event to show the input
  var div = document.createElement("div");
  div.className = "projects";
  div.addEventListener("click", displayInput);
  //create a plus sign and "new project" text
  var plusSign = document.createElement("p");
  plusSign.id = "plus";
  plusSign.innerHTML = "+";
  var para = document.createElement("p");
  para.id="projectText";
  para.innerHTML = "New Project";
  //add div to all projects div
  document.getElementById("allProjects").appendChild(div);
  //add plus sign and text to div
  div.appendChild(plusSign);
  div.appendChild(para);
}

export const newProject = async function(){
  try {
      //saves whatever the user inputs as the name of the collection
      var collectionName = document.getElementById('enterProjectName').value;
      //creates a new collection since it doesn't exist and makes a document called projectName
      await addDoc(collection(db, collectionName), {
          projectName: collectionName
      });
      //adds 2 page documents
      await addDoc(collection(db, collectionName),{
          pageNumber: 1
      });
      await addDoc(collection(db, collectionName),{
          pageNumber: 2
      });
      await addDoc(collection(db, collectionName),{
        userName: username
      });
      //adds the name of the collection to a seperate collection of names in order to loop through it later
      await addDoc(collection(db, "collection-names"),{
        projectName: collectionName
      });
      //displays all projects
      showProjects();
  }
  // Print error message if there are any errors
  catch (e) {
    console.error("Error adding item to database: ", e);
  } 
}

export const showProjects = async function(){
  //removes everything from the allProjects div
  document.getElementById("allProjects").innerHTML = "";
  //creates a query of all documents in collection-names
  const q = query(collection(db, "collection-names"));
  const allProjects = await getDocs(q);
  //shows the new project button
  displayNewProjectButton(); 
  //for each document in collection-names, create and append a div with text in it
  allProjects.forEach((project) =>{
    // console.log(project.data().projectName);
    var newProjectDiv = document.createElement("div");
    newProjectDiv.className = "projects";
    newProjectDiv.addEventListener("click", function(){
      window.location.href="editor.html";
    });
    document.getElementById("allProjects").appendChild(newProjectDiv);

    var stabImage = document.createElement("img");
    stabImage.src = "images/stab.png";
    stabImage.style.width = "13vw";
    newProjectDiv.appendChild(stabImage);

    var newProjectName = document.createElement("p");
    newProjectName.innerHTML = project.data().projectName;
    newProjectName.id = "projectText";
    newProjectDiv.appendChild(newProjectName);
  })
}

export const addTextBox = function(page) {

  const textBox = document.createElement("div")
  let num_children = document.getElementById(page).childElementCount;

  textBox.setAttribute("contenteditable", "true")
  textBox.className = "text-box"; 
  textBox.id = "c"+page; 
  

  if (num_children < 3) {
      document.getElementById(page).appendChild(textBox);
  }
}

export const checkLogin = async function(){
  //checking that the user is logged in
  auth.onAuthStateChanged((user) => {
    if (!user) {
      //user is not signed in, redirect to login page
      window.location.href = "login.html";
    }
  })
}
