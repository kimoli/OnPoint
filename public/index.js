/*
This is all the non-game related content. E.g., collecting participant data, starting up the game, etc.
*/

// Set to 'true' if you wish to only test the front-end (will not access databases)
// **TODO** Make sure this is set to false before deploying!
const noSave = false;


// Variables used for setting up the game
var screen_height;
var screen_width;
var elem;
var ccds;
var ccdx;

// Possible completion codes
ccds = ['forum', 'aisle', 'stamp', 'patch', 'horse', 'angle', 'light', 'onion', 'panel', 'marsh'];

/* TEMPORARY USE OF ORIGINAL CODE TO TEST THINGS OUT */
try {
  let app = firebase.app();
} catch (e) {
  console.error(e);
}

// Setting up firebase variables
const firestore = firebase.firestore();       // (a.k.a.) db
const firebasestorage = firebase.storage();
const subjectcollection = firestore.collection("Subjects");
const trialcollection = firestore.collection("Trials");

// Function to switch between HTML pages
function show(shown, hidden) {
  document.getElementById(shown).style.display='block';
  document.getElementById(hidden).style.display='none';
  return false;
}

// Close window (function no longer in use for this version)
function onexit() {
  window.close(); 
}

// Function used to enter full screen mode
function openFullScreen() {
  elem = document.getElementById('container-info'); 
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
    console.log("enter1")
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
    console.log("enter2")
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
    console.log("enter3")
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
    console.log("enter4")
  }
}

// Function used to exit full screen mode
function closeFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// Object used track subject data (uploaded to database)
var subject = {
  id: null, 
  age: null,
  sex: null,
  handedness: null,
  mousetype: null,
  returner: null,
  currTrial: 0,
  tgt_file: null,
  ethnicity: null,
  race: null,
  clampQ: null,
  pointerQ: null,
  comments: null
}

// Function used to check if all questions were filled in info form, if so, starts the experiment 
function checkInfo(){
  var actualCode = "rain"; // **TODO: Update depending on the "code" set in index.html
  var values = $("#infoform").serializeArray();
  // ADD SUBJECT ID HERE
  randomval = Math.floor(Math.random() * 999999999);
  exptstring = "OKTTT_";
  exptstring = exptstring.concat(randomval.toString())
  subject.id = exptstring.concat('_');
  console.log(subject.id);
  subject.age = values[0].value;
  subject.sex = values[1].value;
  subject.handedness = values[2].value;
  subject.mousetype = values[3].value;
  subject.returner = values[4].value;
  var code = values[5].value;
  subject.ethnicity = values[6].value;
  subject.race = values[7].value;
  ccdx = Math.floor(Math.random()*10)-1;
  document.getElementById("ccd").innerHTML = ccds[ccdx];

  console.log(subject.handedness);
  console.log(values)
  if (!subject.age || !subject.sex || !subject.handedness || !subject.mousetype) {
    alert("Please fill out your basic information");
    return;
  } else if (actualCode.localeCompare(code) != 0) {
    alert("Make sure to find the code from the last page before proceeding")
    return;
  } else {
    show('container-exp', 'container-info');
    createSubject(subjectcollection, subject);
    openFullScreen();
    startGame();
  }

}

// Function used to create/update subject data in the database
function createSubject(collection, subject) {
  if (noSave) {
    return null;
  }
  return collection.doc(subject.id).set(subject)
  .then(function() {
    console.log(subject);
    return true; 
  })
  .catch(function(err) {
    console.error(err);
    throw err;
  });
}

// Function used to save the feedback from the final HTML page
function saveFeedback() {
  var values = $("#feedbackForm").serializeArray();
  subject.clampQ = values[0].value;
  subject.pointerQ = values[1].value;
  subject.comments = values[2].value;
  // Currently not employing the clampQ question, but can be used
  // if(!subject.clampQ) {
  //   alert("Please answer the first question! You can leave the second question blank.")
  //   return;
  // }
  createSubject(subjectcollection, subject);
  show('final-page', 'container-not-an-ad');
}

// not clear to me that this matters. Trying to solve number of trials not getting reset
function refreshIndexJs() {
  subject = {
      id: null, 
      age: null,
      sex: null,
      handedness: null,
      mousetype: null,
      returner: null,
      currTrial: 0,
      tgt_file: null,
      ethnicity: null,
      race: null,
      clampQ: null,
      pointerQ: null,
      comments: null
  }

  //console.log(subject);
}

document.addEventListener('DOMContentLoaded', function() {
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥


});