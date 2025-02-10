// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getCountFromServer} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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


//login function for submit button
export const login = function (email, password){
  //call signInWithEmailAndPassword, firebase function
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
     
      sessionStorage.setItem('username', userCredential.user.email);
    //sucessful sign-in: update window
    window.location.href = "homepage.html";
  })
  .catch((error) => {
    //error catch log messages
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}

//logout function for logout button on homepage
export const logout = function (){
  //signOut function from Firebase
    signOut(auth)
    .then(() => {
  //successful sign-out, redirect to login page
      window.location.href = "index.html"
    }).catch((error) => {
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
          projectName: collectionName,
      });
      //adds 2 page documents
      await addDoc(collection(db, collectionName),{
          pageNumber: 1
      });
      await addDoc(collection(db, collectionName),{
          pageNumber: 2
      });
      //adds the name of the collection to a seperate collection of names in order to loop through it later
      await addDoc(collection(db, "collection-names"),{
        projectName: collectionName,
        userName: sessionStorage.getItem('username')
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
  const q = query(collection(db, "collection-names"), where("userName", "==", sessionStorage.getItem('username')));
  const allProjects = await getDocs(q);
  //shows the new project button
  displayNewProjectButton(); 
  //for each document in collection-names, create and append a div with text in it
  allProjects.forEach((project) =>{
    // console.log(project.data().projectName);
    var newProjectDiv = document.createElement("div");
    newProjectDiv.className = "projects";
    newProjectDiv.addEventListener("click", function(){
      sessionStorage.setItem('projectName',project.data().projectName);
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

export const checkLogin = async function(){
  //checking that the user is logged in
  auth.onAuthStateChanged((user) => {
    if (!user) {
      //user is not signed in, redirect to login page
      window.location.href = "index.html";
    }
  })
}

export const deleteProject = async function(){
  const projName = sessionStorage.getItem('projectName');
  const docsInCollection = await getDocs(collection(db, projName));
  for (const docSnapshot of docsInCollection.docs) {
    await deleteCollection(docSnapshot.id, projName); // Delete each document in the collection
  }
  const r = query(collection(db, "collection-names"), where("projectName", "==", projName));
  const querySnapshot = await getDocs(r);
  for (const document of querySnapshot.docs) {
    await deleteFromCollectionNames(document.id); // Delete the project entry in "collection-names"
  }
  window.location.href ="homepage.html"
  showProjects();
}

async function deleteCollection(docId, projName){
  try {
    // Delete the document from the specific project collection
    await deleteDoc(doc(db, projName, docId));
    // console.log(`Document with ID: ${docId} deleted from collection ${projName}`);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}

async function deleteFromCollectionNames(docId){
  try {
    // Delete the corresponding project entry from the "collection-names" collection
    await deleteDoc(doc(db, "collection-names", docId));
    // console.log(`Document with ID: ${docId} deleted from collection-names`);
  } catch (error) {
    console.error("Error deleting from collection-names:", error);
  }
}


export const loadProject =  async function(){
  //get the name of project user is currently loaded into. 
  //Set by the main menu
  var project = sessionStorage.getItem('projectName'); 
  
  //get all documents from project in firebase wiht "projectName"
  const phoogdocs = await getDocs(collection(db, project));

  //get a list of all elements whose class starts with "page-"
  //all page class names will be formatted as: page-format# (ex. page-1)
  const pages = document.querySelectorAll("[class^=page-]")

  //create an empty list
  //all documents in firebase that have an attr. of pagenumber will have that value added to this list
  const allPageNums = []
      //for each document in firebase associated with "project"
      phoogdocs.forEach((item) => {
          //if the document has an attr. page number
          if (item.data().pageNumber != undefined){
            //add that value to allPageNums
              allPageNums.push(String(item.data().pageNumber))
          }
      })

  //this loop will add the proper amount of pages
  //subtract the number of pages already existing from the number of pages exist only within firebase (by default, two pages are constructed)
  //divide by two because pages are added in pairs
  //call Add Pages x amount of times
  for (let i = 0; i < (allPageNums.length - pages.length)/2; i++) {
    addPages()
  }

  //for each document in firebase
  phoogdocs.forEach((item) => {
      //if the document has pageNumber attr.
    if (item.data().pageNumber != undefined) {
      

      //get page by page number of document (pageNumber = 1 pulls page.id => 1)
      var page = document.getElementById(item.data().pageNumber);
      //set page classname to the saved format in firebase (ex. format: "page-1")
      page.className = item.data().format

      //clear page
      page.innerHTML = ""
        
      
      //call constructForm# depending on what the pages current format is
      if(page.className == "page-1"){
        constructForm1(page)
      }else if(page.className == "page-2") {
        constructForm2(page)
      }else if(page.className == "page-3") {
        constructForm3(page)
      }else if(page.className == "page-4") {
        constructForm4(page)
      }else if(page.className == "page-5") {
        constructForm5(page)
      }else if(page.className == "page-6") {
        constructForm6(page)
      }

        //create list of all child elements of page (will consist of cell elements)
      var children = page.children;

        //get content saved to firebase
        //this is a list saved to firebase so var content is a list
      var content = item.data().content;
        //loop through items in content
      for (let i = 0; i < content.length; i++) {
          //set the innerHTML of the cell to item in content
        children[i].innerHTML = content[i];
      }
              
    }
  },
);

}

export const addPages = function(){
   
  //create elements

  //page-container
  const pagesContainer = document.createElement("div");
  pagesContainer.className = "pages-container";

  //editors
  const editor1 = document.createElement("div");
  editor1.className = "editor";

  const editor2 = document.createElement("div");
  editor2.className = "editor";

  //pages

    //amount of pages
  const pages = document.querySelectorAll("[class^=page-]")

  const page1 = document.createElement("div");
  page1.className = "page-0";
  page1.id = pages.length + 1;

  const page2 = document.createElement("div");
  page2.className = "page-0";
  page2.id = pages.length + 2;

  // tools

  const tools1 = document.createElement("div");
  tools1.className = "tools";

  const tools2 = document.createElement("div");
  tools2.className = "tools";

  //butons
  const button1 = document.createElement("button");
  button1.className = "format-button";
  button1.title = "Formats";
  button1.onclick = () => {
    chooseFormat(pages.length+1);
  };

  const button2 = document.createElement("button");
  button2.className = "format-button";
  button2.title = "Formats";
  button2.onclick = () => {
    chooseFormat(pages.length+2);
  };

  const span1 = document.createElement("span");
  span1.innerHTML = "dashboard"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "dashboard"
  span2.className = "material-symbols-outlined";
  //concat
      //spans to buttons
  button1.appendChild(span1);
  button2.appendChild(span2);

      //buttons to tools
  tools1.appendChild(button1);
  tools2.appendChild(button2);

      //pages and tools to editor
  editor1.appendChild(page1);
  editor1.appendChild(tools1);

  editor2.appendChild(page2);
  editor2.appendChild(tools2);

      //editors to pages-container
  pagesContainer.appendChild(editor1);
  pagesContainer.appendChild(editor2);

      //pages-container to container
  document.getElementById("container").appendChild(pagesContainer);


}

//save document
export const saveProject =  async function(){
  //get the name of project user is currently loaded into. 
  //Set by the main menu
  var project = sessionStorage.getItem('projectName'); 
  
  //get all documents in the project
  var phoogdocs = await getDocs(collection(db, project));
  
  //create an empty list
  //all documents in firebase that have an attr. of pagenumber will have that value added to this list
  const allPageNums = []
      //for each document in firebase associated with "project"
      phoogdocs.forEach((item) => {
          //if the document has an attr. page number
          if (item.data().pageNumber != undefined){
            //add that value to allPageNums
              allPageNums.push(String(item.data().pageNumber))
          }
      })

  
  //get a list of all elements whose class starts with "page-"
  //all page class names will be formatted as: page-format# (ex. page-1)
  const allPages = document.querySelectorAll("[class^=page-]")

  //for every page element in allPages
  for (let i = 0; i < allPages.length; i++) {
      //if allPageNums (a list of page numbers found in firebase) does not have a page with the page number, add a document to firebase
      //this adds all new pages that have been created to firebase
      if (!(allPageNums.includes(allPages[i].id))){
          //add document with the correct pagenumber 
          await addDoc(collection(db, project),{
              pageNumber: allPages[i].id
          });
      }
  }
  

  //get all documents in the project
  //(this must be called again because pages may have been added that did not exist when "phoogdocs" was originally declared
  phoogdocs = await getDocs(collection(db, project));
  
  //for each document in project
  phoogdocs.forEach((item) => {
      //if the document has pageNumber attr.
      if(item.data().pageNumber != null) {
        //pull page element with the same page number as doc
        var page = document.getElementById(item.data().pageNumber);
        // console.log(page.id)

        //define item to update
        const updateItem = doc(db, project, item.id);
        
        //get format (class name is format)
        var format_name = page.className;
        
        //update format
        updateDoc(updateItem, {
          format: format_name
        });

        // console.log(format_name)
        //make list of all child elements of page ^^^^
        var children = page.children;


        
        //list of all child element content
        var content = []

        //loop through children
        for(let i = 0; i < children.length; i++){
          //if innerhtml of given child element is not undefined add its content to content list
          if (children[i].innerHTML != undefined) {
            //add content to content list
            content.push(children[i].innerHTML);
          } else {
            //add empty string to content list if content is undefined
            content.push("");
          }
        }

        // console.log(content)
        //update content attr with content list
        updateDoc(updateItem, {
          content: content
        });
      }
  })

}
  
  //function choose format to bring up the popup format selector
  export const chooseFormat = function(pageNumber){
      //saving the requested page to change
    sessionStorage.setItem('pageNumber', pageNumber);
    var popup = document.getElementById("myPopup");
      //format picker popup shown
    popup.classList.add("show");
    var popup = document.getElementById("contentContainer");
    popup.classList.add("color");
  }
  //function to close the popup after the format is chosen
  export const closeFormatPopup = function(){
    var popup = document.getElementById("myPopup");
      //popup hidden
    popup.classList.remove("show");
    var popup = document.getElementById("contentContainer");
    popup.classList.remove("color");
  }


//scroll to the second to last page
export const scrollBottom = function() {
  //get pages
  const pages = document.getElementsByClassName("page-0");
  //log second to last page
  // console.log(pages[pages.length - 2].id)
  //scroll page into view
  pages[pages.length - 2].scrollIntoView();
  }

window.addEventListener('beforeunload',
  function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// all constructForm methods construct a format by clearing a page
// constructForm1 constucts format 1 and so on for formats 1-6
//each construct form method is essentially the same with the only differences being amount of content "cells" and class names designated to said cells
//constructForm# takes a parameter page being the page element in which the format will be constructed

//format for construct form remains mostly the same for each 
//resetting the given page
//making the required number of divs
//making the new text/image buttons and making sure the functions link
//append all the new stuff
function constructForm1(page){
  //create cell 1
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-1-1";
  //create cell 2
  const div2 = document.createElement("div");
  div2.className = "cell-1-2";
  //create cell 3
  const div3 = document.createElement("div");
  div3.className = "cell-1-3";

  //file picker 1, creates the input and then hides it
  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  //text button 1
  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  //img button 1
  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  //file picker 2
  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  //text button 2
  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  //image button 2
  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  //file picker 3
  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  //text button 3
  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  //img button 3
  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  //APPEND
  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);

  //linking img button to the hidden file pickers
  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }

  //if file picker inputs are clicked, then open up the file dialogue and add the image
  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
}

function constructForm2(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-2-1";

  const div2 = document.createElement("div");
  div2.className = "cell-2-2";

  const div3 = document.createElement("div");
  div3.className = "cell-2-3";

  const div4 = document.createElement("div");
  div4.className = "cell-2-4";

  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  const imginput4 = document.createElement("input");
  imginput4.type = "file";
  imginput4.style ="display: none;"
  imginput4.id = "image-input4";

  const button41 = document.createElement("button");
  button41.className = "text-button";
  button41.title = "Text";
  var setFunction = function(){
    const textBox = button41.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button41.onclick = setFunction;

  const button42 = document.createElement("button");
  button42.className = "img-button";
  button42.id = "img-button";
  button42.title = "Image";

  // span
  const span41 = document.createElement("span");
  span41.innerHTML = "text_fields"
  span41.className = "material-symbols-outlined";

  const span42 = document.createElement("span");
  span42.innerHTML = "image"
  span42.className = "material-symbols-outlined";


  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  button41.appendChild(span41);
  button42.appendChild(span42);
  div4.appendChild(imginput4);
  div4.appendChild(button41);
  div4.appendChild(button42);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);

  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }

  button42.onclick = function(){
    document.getElementById('image-input4').click();
  }

  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
  imginput4.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button42.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
}

function constructForm3(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-3-1";

  const div2 = document.createElement("div");
  div2.className = "cell-3-2";

  const div3 = document.createElement("div");
  div3.className = "cell-3-3";

  const div4 = document.createElement("div");
  div4.className = "cell-3-4";

  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  const imginput4 = document.createElement("input");
  imginput4.type = "file";
  imginput4.style ="display: none;"
  imginput4.id = "image-input4";

  const button41 = document.createElement("button");
  button41.className = "text-button";
  button41.title = "Text";
  var setFunction = function(){
    const textBox = button41.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button41.onclick = setFunction;

  const button42 = document.createElement("button");
  button42.className = "img-button";
  button42.id = "img-button";
  button42.title = "Image";

  // span
  const span41 = document.createElement("span");
  span41.innerHTML = "text_fields"
  span41.className = "material-symbols-outlined";

  const span42 = document.createElement("span");
  span42.innerHTML = "image"
  span42.className = "material-symbols-outlined";


  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  button41.appendChild(span41);
  button42.appendChild(span42);
  div4.appendChild(imginput4);
  div4.appendChild(button41);
  div4.appendChild(button42);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);

  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }

  button42.onclick = function(){
    document.getElementById('image-input4').click();
  }

  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
  imginput4.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button42.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
}

function constructForm4(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-4-1";

  const div2 = document.createElement("div");
  div2.className = "cell-4-2";

  const div3 = document.createElement("div");
  div3.className = "cell-4-3";

  const div4 = document.createElement("div");
  div4.className = "cell-4-4";

  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  const imginput4 = document.createElement("input");
  imginput4.type = "file";
  imginput4.style ="display: none;"
  imginput4.id = "image-input4";

  const button41 = document.createElement("button");
  button41.className = "text-button";
  button41.title = "Text";
  var setFunction = function(){
    const textBox = button41.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button41.onclick = setFunction;

  const button42 = document.createElement("button");
  button42.className = "img-button";
  button42.id = "img-button";
  button42.title = "Image";

  // span
  const span41 = document.createElement("span");
  span41.innerHTML = "text_fields"
  span41.className = "material-symbols-outlined";

  const span42 = document.createElement("span");
  span42.innerHTML = "image"
  span42.className = "material-symbols-outlined";


  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  button41.appendChild(span41);
  button42.appendChild(span42);
  div4.appendChild(imginput4);
  div4.appendChild(button41);
  div4.appendChild(button42);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);

  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }
  button42.onclick = function(){
    document.getElementById('image-input4').click();
  }

  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
  imginput4.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button42.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
}

function constructForm5(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-5-1";

  const div2 = document.createElement("div");
  div2.className = "cell-5-2";

  const div3 = document.createElement("div");
  div3.className = "cell-5-3";

  const div4 = document.createElement("div");
  div4.className = "cell-5-4";

  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  const imginput4 = document.createElement("input");
  imginput4.type = "file";
  imginput4.style ="display: none;"
  imginput4.id = "image-input4";

  const button41 = document.createElement("button");
  button41.className = "text-button";
  button41.title = "Text";
  var setFunction = function(){
    const textBox = button41.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button41.onclick = setFunction;

  const button42 = document.createElement("button");
  button42.className = "img-button";
  button42.id = "img-button";
  button42.title = "Image";

  // span
  const span41 = document.createElement("span");
  span41.innerHTML = "text_fields"
  span41.className = "material-symbols-outlined";

  const span42 = document.createElement("span");
  span42.innerHTML = "image"
  span42.className = "material-symbols-outlined";


  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  button41.appendChild(span41);
  button42.appendChild(span42);
  div4.appendChild(imginput4);
  div4.appendChild(button41);
  div4.appendChild(button42);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);

  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }
  button42.onclick = function(){
    document.getElementById('image-input4').click();
  }

  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
  imginput4.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button42.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

}

function constructForm6(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-6-1";

  const div2 = document.createElement("div");
  div2.className = "cell-6-2";

  const div3 = document.createElement("div");
  div3.className = "cell-6-3";

  const div4 = document.createElement("div");
  div4.className = "cell-6-4";

  const imginput = document.createElement("input");
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const button1 = document.createElement("button");
  button1.className = "text-button";
  button1.title = "Text";
  var setFunction = function(){
    const textBox = button1.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button1.onclick = setFunction;

  const button2 = document.createElement("button");
  button2.className = "img-button";
  button2.id = "img-button";
  button2.title = "Image";

  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const imginput2 = document.createElement("input");
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input2";

  const button21 = document.createElement("button");
  button21.className = "text-button";
  button21.title = "Text";
  var setFunction = function(){
    const textBox = button21.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button21.onclick = setFunction;

  const button22 = document.createElement("button");
  button22.className = "img-button";
  button22.id = "img-button";
  button22.title = "Image";

  // span
  const span21 = document.createElement("span");
  span21.innerHTML = "text_fields"
  span21.className = "material-symbols-outlined";

  const span22 = document.createElement("span");
  span22.innerHTML = "image"
  span22.className = "material-symbols-outlined";

  const imginput3 = document.createElement("input");
  imginput3.type = "file";
  imginput3.style ="display: none;"
  imginput3.id = "image-input3";

  const button31 = document.createElement("button");
  button31.className = "text-button";
  button31.title = "Text";
  var setFunction = function(){
    const textBox = button31.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button31.onclick = setFunction;

  const button32 = document.createElement("button");
  button32.className = "img-button";
  button32.id = "img-button";
  button32.title = "Image";

  // span
  const span31 = document.createElement("span");
  span31.innerHTML = "text_fields"
  span31.className = "material-symbols-outlined";

  const span32 = document.createElement("span");
  span32.innerHTML = "image"
  span32.className = "material-symbols-outlined";

  const imginput4 = document.createElement("input");
  imginput4.type = "file";
  imginput4.style ="display: none;"
  imginput4.id = "image-input4";

  const button41 = document.createElement("button");
  button41.className = "text-button";
  button41.title = "Text";
  var setFunction = function(){
    const textBox = button41.parentNode;
    textBox.setAttribute("contenteditable", "true");
    textBox.setAttribute("placeholder","Add Text...");
    textBox.className = "text-box"; 
    textBox.innerHTML = "";
  }
  button41.onclick = setFunction;

  const button42 = document.createElement("button");
  button42.className = "img-button";
  button42.id = "img-button";
  button42.title = "Image";

  // span
  const span41 = document.createElement("span");
  span41.innerHTML = "text_fields"
  span41.className = "material-symbols-outlined";

  const span42 = document.createElement("span");
  span42.innerHTML = "image"
  span42.className = "material-symbols-outlined";


  button1.appendChild(span1);
  button2.appendChild(span2);
  div1.appendChild(imginput);
  div1.appendChild(button1);
  div1.appendChild(button2);

  button21.appendChild(span21);
  button22.appendChild(span22);
  div2.appendChild(imginput2);
  div2.appendChild(button21);
  div2.appendChild(button22);

  button31.appendChild(span31);
  button32.appendChild(span32);
  div3.appendChild(imginput3);
  div3.appendChild(button31);
  div3.appendChild(button32);

  button41.appendChild(span41);
  button42.appendChild(span42);
  div4.appendChild(imginput4);
  div4.appendChild(button41);
  div4.appendChild(button42);

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);

  button2.onclick = function(){
    document.getElementById('image-input').click();
  }

  button22.onclick = function(){
    document.getElementById('image-input2').click();
  }

  button32.onclick = function(){
    document.getElementById('image-input3').click();
  }

  button42.onclick = function(){
    document.getElementById('image-input4').click();
  }

  imginput.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button2.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput2.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button22.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput3.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button32.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }

  imginput4.onchange = function(){
    var file = this.files[0]; // Get the selected file
    if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Create a new div and img element to display the uploaded image
            var imageContainer = button42.parentNode;
            // imageContainer.innerHTML = ''; // Clear any existing image
            var img = document.createElement('img');
            img.id = "image";
            img.src = event.target.result; // Set the image source to the uploaded file
            imageContainer.innerHTML = "";
            imageContainer.appendChild(img); // Append the image to the container
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        alert("Please select an image first.");
    }
  }
}


export const changeFormat = function(format){
  var pageNumber = sessionStorage.getItem('pageNumber'); 
  var page = document.getElementById(pageNumber);
  page.className = format;
  if(page.className == "page-1"){
    constructForm1(page)
  }else if(page.className == "page-2") {
    constructForm2(page)
  }else if(page.className == "page-3") {
    constructForm3(page)
  }else if(page.className == "page-4") {
    constructForm4(page)
  }else if(page.className == "page-5") {
    constructForm5(page)
  }else if(page.className == "page-6") {
    constructForm6(page)
  }
}

export const setProjectName = function(){
  var projectName = document.getElementById("project-title");
  console.log(projectName)
  let project = sessionStorage.getItem("projectName");

  projectName.innerHTML = project;
}
