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


export const loadProject =  async function(project){
    const phoogdocs = await getDocs(collection(db, project));
    
    const allPageNums = []
        phoogdocs.forEach((item) => {
            if (item.data().pageNumber != undefined){
                allPageNums.push(String(item.data().pageNumber))
            }
        })
    console.log(allPageNums)
    for (let i = 0; i < (allPageNums.length - 2)/2; i++) {
        addPage()
    }


    phoogdocs.forEach((item) => {

        var page = document.getElementById(item.data().pageNumber);

        // console.log(item.id + ", " + item.data().pageNumber);
        // console.log(content);
        // console.log();
        //Get all page numbers from all docs
        

        page.innerHTML = ""
        var children = page.children;

        if (item.data().c1 != null) {
            addTextBox(page.id)
        }
        if (item.data().c2 != null) {
            addTextBox(page.id)
        }
        if (!item.data().c3 != null) {
            addTextBox(page.id)
        }

        for (let i = 0; i < children.length; i++) {
            if (i==0){
                children[i].innerHTML = item.data().c1
            } else if (i==1){
                children[i].innerHTML = item.data().c2
            } else {
                children[i].innerHTML = item.data().c3
            }
            
        }

    });
}

export const addPage = function(){
    
  //create elements

  //page-container
  const pageContainer = document.createElement("div");
  pageContainer.className = "page-container";

  //editors
  const editor1 = document.createElement("div");
  editor1.className = "editor";

  const editor2 = document.createElement("div");
  editor2.className = "editor";

  //pages

      //amount of pages
  const pages = document.getElementsByClassName("page");

  const page1 = document.createElement("div");
  page1.className = "page";
  page1.id = pages.length + 1;

  const page2 = document.createElement("div");
  page2.className = "page";
  page2.id = pages.length + 2;

  // file input stuff

  const imgcontainer1 = document.createElement("div");
  imgcontainer1.className = "image-container1";
  const imgcontainer2 = document.createElement("div");
  imgcontainer2.className = "image-container2";

  const imginput = document.createElement("input")
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  const imginput2 = document.createElement("input")
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input";


  // tools

  const tools1 = document.createElement("div");
  tools1.className = "tools";

  const tools2 = document.createElement("div");
  tools2.className = "tools";


  const textholder1 = document.createElement("div");
  textholder1.className = "text_and_img";
  const textholder2 = document.createElement("div");
  textholder2.className = "text_and_img";

  //butons
  const button1 = document.createElement("button");
  var setFunction = addTextBox.bind(this,pages.length + 1);
  button1.onclick = setFunction;
  button1.className = "text-button";


  const button2 = document.createElement("button");
  var setFunction2 = triggerFileInput.bind(this,pages.length + 1);
  button2.onclick = setFunction2;
  button2.className = "img-button";

  // const freeDiv = document.createElement("div");
  // freeDiv.className = "free-div";

  // const button2 = document.createElement("button");
  // button2.innerHTML = "+"
  // const button1input = document.createElement("input");
  // var setFunction = triggerFileInput.bind(this,pages.length + 1);
  // button1input.onclick = setFunction;



  const button3 = document.createElement("button");
  var setFunction = addTextBox.bind(this,pages.length + 2);
  button3.onclick = setFunction;
  button3.className = "text-button";


  const button4 = document.createElement("button");
  var setFunction2 = triggerFileInput.bind(this,pages.length + 2);
  button4.onclick = setFunction2;
  button4.className = "img-button";


  const formatbutton = document.createElement("button");
  formatbutton.onclick = () => {
    window.location.href = 'format.html';
  };
  formatbutton.className = "format-button";
  formatbutton.title = "Choose Format";


  const formatbutton2 = document.createElement("button");
  formatbutton2.onclick = () => {
    window.location.href = 'format.html';
  };
  formatbutton2.className = "format-button";
  formatbutton2.title = "Choose Format";


  
  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "text_fields"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "image"
  span2.className = "material-symbols-outlined";

  const span3 = document.createElement("span");
  span3.innerHTML = "text_fields"
  span3.className = "material-symbols-outlined";

  const span4 = document.createElement("span");
  span4.innerHTML = "image"
  span4.className = "material-symbols-outlined";

  const formatspan1 = document.createElement("span");
  formatspan1.innerHTML = "dashboard"
  formatspan1.className = "material-symbols-outlined";

  const formatspan2 = document.createElement("span");
  formatspan2.innerHTML = "dashboard"
  formatspan2.className = "material-symbols-outlined";


  // concat
      //spans to buttons
  formatbutton.appendChild(formatspan1);
  formatbutton2.appendChild(formatspan2);
  button1.appendChild(span1);
  button2.appendChild(span2);
  button3.appendChild(span3);
  button4.appendChild(span4);

      //buttons to tools
  tools1.appendChild(formatbutton);
  tools2.appendChild(formatbutton2);
  textholder1.appendChild(button1);
  textholder1.appendChild(button2);
  textholder2.appendChild(button3);
  textholder2.appendChild(button4);
  textholder1.appendChild(imginput);
  textholder2.appendChild(imginput2);
  // tools2.appendChild(button3);
  // tools2.appendChild(button4);

      //pages and tools to editor
  page1.appendChild(imgcontainer1);
  page1.appendChild(textholder1);
  editor1.appendChild(page1);
  editor1.appendChild(tools1);
  // editor1.appendChild(tools1);

  page2.appendChild(imgcontainer2);
  page2.appendChild(textholder2);
  editor2.appendChild(page2);
  editor2.appendChild(tools2);

  // freeDiv.appendChild(button1);
  // freeDiv.appendChild(button2);

  // page1.appendChild(freeDiv);

      //editors to page-container
  pageContainer.appendChild(editor1);
  pageContainer.appendChild(editor2);

      //page-container to container
  document.getElementById("container").appendChild(pageContainer);


}

//save document
export const saveProject =  async function(project){
    //add all pages


    //get all docs in the project
    var phoogdocs = await getDocs(collection(db, project));

    //Get all page numbers from all docs
    const allPageNums = []
    phoogdocs.forEach((item) => {
        if (item.data().pageNumber != undefined){
            allPageNums.push(String(item.data().pageNumber))
        }
    })
    console.log(allPageNums)

    //get all pages
    const allPages = document.getElementsByClassName("page")


    for (let i = 0; i < allPages.length; i++) {
        if (!(allPageNums.includes(allPages[i].id))){
            console.log("page not exists")
            await addDoc(collection(db, project),{
                pageNumber: allPages[i].id
            });
        }
    }

    phoogdocs = await getDocs(collection(db, project));

    //for each doc
    phoogdocs.forEach((item) => {
        //log id and page number (project name doc is undefined for page number)
        console.log(item.id + ", " + item.data().pageNumber);

        //pull page element with the same page number as doc
        var page = document.getElementById(item.data().pageNumber);

        //make list of all child elements of page ^^^^
        var children = page.children;

        //loop through children
        for(let i = 0; i < children.length; i++){

            //on first loop update column 1
            if (i==0){

                //define item to update
                const updateItem = doc(db, project, item.id);

                //run updateDoc()
                updateDoc(updateItem, {
                    c1: children[i].innerHTML
                });
            
            //on second loop update column 2
            } else if (i==1) {

                //define item to update
                const updateItem = doc(db, project, item.id);

                //run updateDoc()
                updateDoc(updateItem, {
                    c2: children[i].innerHTML
                });
            
            //on third loop update column 3
            } else {

                //define item to update
                const updateItem = doc(db, project, item.id);

                //run updateDoc()
                updateDoc(updateItem, {
                    c3: children[i].innerHTML
                });
            }
        }
    })
}



export const addTextBox = function(page) {

  const textBox = document.createElement("div")
  let num_children = document.getElementById(page).childElementCount;

  textBox.setAttribute("contenteditable", "true")
  textBox.setAttribute("placeholder","Add Text...")
  textBox.className = "text-box"; 


  if (num_children < 3) {
    document.getElementById(page).appendChild(textBox);
  }
}

window.addEventListener('beforeunload',
  function (e) {
    e.preventDefault();
    e.returnValue = '';
});
