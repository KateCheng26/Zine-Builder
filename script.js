// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getCountFromServer} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

export const logout = function (){
  signOut(auth)
  .then(() => {
    window.location.href = "index.html"
  }).catch((error) => {
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

function constructForm1(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-1-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-1-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-1-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")


  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
}

function constructForm2(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-2-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-2-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-2-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")

  const div4 = document.createElement("div");
  div4.className = "cell-2-4";
  div4.setAttribute("contenteditable", "true")
  div4.setAttribute("placeholder","Add Text...")

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);
}

function constructForm3(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-3-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-3-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-3-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")

  const div4 = document.createElement("div");
  div4.className = "cell-3-4";
  div4.setAttribute("contenteditable", "true")
  div4.setAttribute("placeholder","Add Text...")

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);
}

function constructForm4(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-4-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-4-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-4-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")

  const div4 = document.createElement("div");
  div4.className = "cell-4-4";
  div4.setAttribute("contenteditable", "true")
  div4.setAttribute("placeholder","Add Text...")

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);
}

function constructForm5(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-5-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-5-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-5-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")

  const div4 = document.createElement("div");
  div4.className = "cell-5-4";
  div4.setAttribute("contenteditable", "true")
  div4.setAttribute("placeholder","Add Text...")

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
  page.appendChild(div4);
}

function constructForm6(page){
  page.innerHTML = ""
  const div1 = document.createElement("div");
  div1.className = "cell-6-1";
  div1.setAttribute("contenteditable", "true")
  div1.setAttribute("placeholder","Add Text...")

  const div2 = document.createElement("div");
  div2.className = "cell-6-2";
  div2.setAttribute("contenteditable", "true")
  div2.setAttribute("placeholder","Add Text...")

  const div3 = document.createElement("div");
  div3.className = "cell-6-3";
  div3.setAttribute("contenteditable", "true")
  div3.setAttribute("placeholder","Add Text...")

  page.appendChild(div1);
  page.appendChild(div2);
  page.appendChild(div3);
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

//load the projectt
export const loadProject =  async function(project){
    //get all documents
    const phoogdocs = await getDocs(collection(db, project));
    
    const pages = document.querySelectorAll("[class^=page-]")
    //create list of page numbers from firebase documents
    const allPageNums = []
        //for each doc
        phoogdocs.forEach((item) => {
            //if page number is not undefined
            if (item.data().pageNumber != undefined){
              //add num to list
                allPageNums.push(String(item.data().pageNumber))
            }
        })

    // //subtract two from the amount of pages and divide by 2
    // //this is the proper amount of times to call add page because add page adds 2 pages
    // //-2 because by default, there are 2 pages already created
    for (let i = 0; i < (allPageNums.length - pages.length)/2; i++) {
      addEmptyPages()
    }

    //for each doc
    phoogdocs.forEach((item) => {
      if (item.data().pageNumber != undefined) {
        

        //get page by page number of document pageNumber = 1 pulls page.id => 1
        var page = document.getElementById(item.data().pageNumber);
        page.className = item.data().format

        //clear page
        page.innerHTML = ""
        var children = page.children;

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
        
        
        var content = item.data().content;
        for (let i = 0; i < content.length; i++) {
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

  const textImgDiv = document.createElement("div");
  textImgDiv.id = "text_and_img"+(pages.length+2);

  const textImgDiv2 = document.createElement("div");
  textImgDiv.id = "text_and_img"+(pages.length+1);

  //butons
  const button1 = document.createElement("button");
  button1.className = "format-button";
  button1.title = "Formats";
  button1.onclick = () => {
    chooseFormat();
  };

  const imginput = document.createElement("input")
  imginput.type = "file";
  imginput.style ="display: none;"
  imginput.id = "image-input";

  
  const imginput2 = document.createElement("input")
  imginput2.type = "file";
  imginput2.style ="display: none;"
  imginput2.id = "image-input";

  const button2 = document.createElement("button");
  button2.className = "format-button";
  button2.title = "Formats";
  button2.onclick = () => {
    chooseFormat();
  };
  
  const button3 = document.createElement("button");
  button3.className = "text-button";
  button3.title = "Text";
  var setFunction = addTextBox.bind(this,pages.length + 1);
  button3.onclick = setFunction;

  const button4 = document.createElement("button");
  button4.className = "img-button";
  button4.title = "Image";
  var setFunction = triggerFileInput.bind(this,pages.length + 1);
  button4.onclick = setFunction;

  const button5 = document.createElement("button");
  button5.className = "text-button";
  button5.title = "Text";
  var setFunction = addTextBox.bind(this,pages.length + 2);
  button5.onclick = setFunction;

  const button6 = document.createElement("button");
  button6.className = "img-button";
  button6.title = "Image";
  var setFunction = triggerFileInput.bind(this,pages.length + 1);
  button6.onclick = setFunction;


  // span
  const span1 = document.createElement("span");
  span1.innerHTML = "dashboard"
  span1.className = "material-symbols-outlined";

  const span2 = document.createElement("span");
  span2.innerHTML = "dashboard"
  span2.className = "material-symbols-outlined";

  const span3 = document.createElement("span");
  span3.innerHTML = "text_fields"
  span3.className = "material-symbols-outlined";

  const span4 = document.createElement("span");
  span4.innerHTML = "image"
  span4.className = "material-symbols-outlined";

  const span5 = document.createElement("span");
  span5.innerHTML = "text_fields"
  span5.className = "material-symbols-outlined";

  const span6 = document.createElement("span");
  span6.innerHTML = "image"
  span6.className = "material-symbols-outlined";
  //concat
      //spans to buttons
  button1.appendChild(span1);
  button2.appendChild(span2);
  button3.appendChild(span3);
  button4.appendChild(span4);
  button5.appendChild(span5);
  button6.appendChild(span6);

      //buttons to tools
  tools1.appendChild(button1);
  tools2.appendChild(button2);
  textImgDiv.appendChild(button3);
  textImgDiv.appendChild(button4);
  textImgDiv2.appendChild(button5);
  textImgDiv2.appendChild(button6);

  textImgDiv.appendChild(imginput);
  textImgDiv2.appendChild(imginput2);

  page1.appendChild(textImgDiv);
  page2.appendChild(textImgDiv2);

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

//scroll to the second to last page
export const scrollBottom = function() {
  //get pages
  const pages = document.getElementsByClassName("page-0");
  //log second to last page
  console.log(pages[pages.length - 2].id)
  //scroll page into view
  pages[pages.length - 2].scrollIntoView();
  }



//save document
export const saveProject =  async function(project){
    //add all pages
    console.log("started process")
    
    //get all docs in the project
    var phoogdocs = await getDocs(collection(db, project));
    console.log("found docs\n")

    //Get all page numbers from all docs
    const allPageNums = []
    phoogdocs.forEach((item) => {
        if (item.data().pageNumber != undefined){
            allPageNums.push(String(item.data().pageNumber))
        }
    })
    console.log("Got page nums:")
    console.log(allPageNums)

    //get all pages

    const allPages = document.querySelectorAll("[class^=page-]")
    for (let i = 0; i < allPages.length; i++) {
      console.log(allPages[i].id)
    }


    for (let i = 0; i < allPages.length; i++) {
        if (!(allPageNums.includes(allPages[i].id))){
            await addDoc(collection(db, project),{
                pageNumber: allPages[i].id
            });
        }
    }
    

    phoogdocs = await getDocs(collection(db, project));
    
    //for each doc
    phoogdocs.forEach((item) => {
        //log id and page number (project name doc is undefined for page number)
        if(item.data().pageNumber != null) {
          //pull page element with the same page number as doc
          var page = document.getElementById(item.data().pageNumber);
          console.log(page.id)

          //define item to update
          const updateItem = doc(db, project, item.id);
          
          //get format (class name is format)
          var format_name = page.className;
          
          //update format
          updateDoc(updateItem, {
            format: format_name
          });

          console.log(format_name)
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

          console.log(content)
          //update content attr with content list
          updateDoc(updateItem, {
            content: content
          });
        }
    })

}

export const addTextBox = function(page) {
  const textBox = document.getElementById("text_and_img"+page);

  textBox.setAttribute("contenteditable", "true")
  textBox.setAttribute("placeholder","Add Text...")
  textBox.className = "text-box"; 
  
  textBox.innerHTML = "";
}

export const chooseFormat = function(pageNumber){
  sessionStorage.setItem('pageNumber', pageNumber);
  var popup = document.getElementById("content");
  popup.classList.add("show");
  var popup = document.getElementById("contentContainer");
  popup.classList.add("color");
}
export const closeFormatPopup = function(){
  var popup = document.getElementById("content");
  popup.classList.remove("show");
  var popup = document.getElementById("contentContainer");
  popup.classList.remove("color");
}
