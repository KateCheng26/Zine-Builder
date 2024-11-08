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

export const saveDoc = function(){
    var pages = document.getElementsByClassName("page");
    for (let i = 0; i < pages.length; i++) {
        var children = pages[i].children;
        for(let f = 0; f < children.length; f++){
            console.log(children[f].innerHTML)
        };
    };
};


     
   

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