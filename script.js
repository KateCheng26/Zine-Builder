// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

export const displayInput = function(){
    document.getElementById('projectNamePicker').style.display='unset';
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

export const newProject = async function(){
    try {
        var collectionName = document.getElementById('enterProjectName').value;
        // await setDoc(doc(db, collectionName, "project-name"), {
        //     projectName: collectionName
        // });
        // await addDoc(collection(db, collectionName),{
        //     pageNumber: 1
        // });

        var newProjectDiv = document.createElement("div");
        newProjectDiv.className = "projects";
        document.body.appendChild(newProjectDiv);

        var newProjectName = document.createElement("p");
        newProjectName.innerHTML = collectionName;
        newProjectName.id = "projectText";
        newProjectDiv.innerHTML=newProjectName;
    }
      // Print error message if there are any errors
    catch (e) {
      console.error("Error adding item to database: ", e);
    } 
    }
