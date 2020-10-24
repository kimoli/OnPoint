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


// available variables
ccds = ['spooky', 'scary', 'skeletons', 'pumpkins', 'witches', 'bats', 'candycorn', 'jackolantern', 'candyapple', 'blacklicorice', 'dentalfloss'];
exptstring = "OK002_";

/* TEMPORARY USE OF ORIGINAL CODE TO TEST THINGS OUT */
try {
  let app = firebase.app();
} catch (e) {
  console.error(e);
}

var redirURL = null;

// Setting up firebase variables
const firestore = firebase.firestore();       // (a.k.a.) db
const firebasestorage = firebase.storage();
const subjectcollection = firestore.collection("Subjects");
const trialcollection = firestore.collection("Trials");

// Function to switch between HTML pages
function show(shown, hidden) {
  document.getElementById(shown).style.display = 'block';
  document.getElementById(hidden).style.display = 'none';
  return false;
}

function fadeOut(elementToFade) {
  var element = document.getElementById(elementToFade);

  element.style.opacity -= 0.1;
  if (element.style.opacity < 0.0) {
    element.style.opacity = 0.0;
  } else {
    setTimeout("fadeOut(\"" + elementToFade + "\")", 200);
  }
}

function fadeIn(elementToFade) {
  console.log("and here");
  var element = document.getElementById(elementToFade);
  console.log("and here");
  console.log(element.style.opacity);
  element.style.opacity += 0.1;
  if (element.style.opacity > 1.0) {
    element.style.opacity = 1.0;
  } else {
    setTimeout("fadeIn(\"" + elementToFade + "\")", 200);
  }
}


// check that person was recruited to experiment and filled out consent form
function checkOrigin() {
  let url = new URL(window.location.href);
  //let url = new URL('https://javascriptjeep.com?mode=night&page=2'); // for testing
  let params = new URLSearchParams(url.search);
  let recsrc = params.get('recsrc');
  var entry = atob(decodeURIComponent(decodeURIComponent(params.get('recsrc'))));
  var cv = params.get('t');
  var outcode = decodeURIComponent(cv);
  $('#welcome').hide();
  var refreshed = checkForRefresh();
  if (refreshed == 1) {
    $('#no-refresh').show();
  } else if (recsrc == null) { // if not recruited through SONA or mTurk, will have null
    // switch to the commented-out strategy if you want to be able to get consent and use the participant
    //setTimeout(displayConsent, 250);

    // do not let person participate
    $('#no-entry').show();
  } else if (cv != null) {

    console.log(entry);
    console.log(outcode);
    console.log('checking');
    if (entry == 'gameT') {
      document.getElementById("Tccd").innerHTML = outcode;
      $('#container-timeout').show();
    } else if (entry == 'gamIT') {
      document.getElementById("ITccd").innerHTML = outcode;
      $('#container-instructimeout').show();
    } else if (entry == 'gaITI') {
      document.getElementById("ITIccd").innerHTML = outcode;
      $('#container-ititimeout').show();
    } else if (entry == 'gameF') {
      document.getElementById("Fccd").innerHTML = outcode;
      $('#container-failed').show();
    } else if (entry == 'gameE') {
      document.getElementById("Eccd").innerHTML = outcode;
      $('#container-escaped').show();
    } else {
      $('#no-entry').show();
    }

  } else if (entry == 'mTurk')  {
    $('#container-instructions1').show();
  } else {
    $('#no-entry').show();
  }
}

function checkForRefresh() {
  // Use getEntriesByType() to just get the "navigation" events
  var perfEntries = performance.getEntriesByType("navigation");
  var foundrefresh = 0;
  for (var i=0; i < perfEntries.length; i++) {
    var p = perfEntries[i];
    console.log(p.type);
    if (p.type == 'reload') {
      foundrefresh = 1;
    }
  }
  return(foundrefresh)
}


function displayConsent() {
  $('#container-consent').fadeIn();
  $('#container-getConsentCode').fadeIn();
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
  recruitment: null,
  currTrial: 0,
  tgt_file: null,
  ethnicity: null,
  race: null,
  pointerQ: null,
  startTm: null,
  endTm: null,
  comments: null,
  exit: null,
  code: null,
}

function checkConsent() {
  var getValues = $("#consentForm").serializeArray();
  var inputCode = getValues[0].value;
  var realCode = 'initGame';
  if (inputCode.localeCompare(realCode) == 0) {
    $('#container-consent').hide();
    $('#consentForm').hide();
    $('#container-getConsentCode').hide();
    $('#container-badConsentCode').hide();
    $('#container-instructions1').show();
  } else {
    $('#container-badConsentCode').show();
  }
}

// Function used to check if all questions were filled in info form, if so, starts the experiment 
function checkInfo() {
  var actualCode = "rain"; // **TODO: Update depending on the "code" set in index.html
  var values = $("#infoform").serializeArray();
  // ADD SUBJECT ID HERE
  randomval = Math.floor(Math.random() * 999999999);
  var exptsubj = exptstring.concat(randomval.toString());
  subject.id = exptsubj.concat('_');
  console.log(subject.id);
  subject.age = values[0].value;
  subject.sex = values[1].value;
  subject.handedness = values[2].value;
  subject.mousetype = values[3].value;
  subject.returner = values[4].value;
  var code = values[5].value;
  subject.ethnicity = values[6].value;
  subject.race = values[7].value;
  subject.startTm = new Date();
  
  let url = new URL(window.location.href);
  let params = new URLSearchParams(url.search);
  let recsrc = params.get('recsrc');
  subject.recruitment = atob(decodeURIComponent(recsrc));

  ccdx = Math.floor(Math.random() * 10)+1;

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
  .then(function () {
    console.log(subject);
    return true;
  })
  .catch(function (err) {
    console.error(err);
    throw err;
  });
}


// Function used to save the feedback from the final HTML page and get ready to send participant back to SONA
function saveFeedback() {
  var values = $("#feedbackForm").serializeArray();
  subject.pointerQ = values[0].value;
  subject.comments = values[1].value;
  // Currently not employing the clampQ question, but can be used
  // if(!subject.clampQ) {
  //   alert("Please answer the first question! You can leave the second question blank.")
  //   return;
  // }

  createSubject(subjectcollection, subject);

  checkExit();
}



// check which end of experiment page to show
function checkExit() {
  let url = new URL(window.location.href);
  console.log(window.location.href);
  //let url = new URL('https://javascriptjeep.com?mode=night&page=2'); // for testing
  let params = new URLSearchParams(url.search);
  var entry = atob(decodeURIComponent(decodeURIComponent(params.get('recsrc'))));
  console.log(entry)
  if (entry == "SONA") {
    params.append('credit_token', "abcd")
    params.delete('recsrc')
    var qparstr = params.toString();
    redirURL = 'https://princeton.sona-systems.com/webstudy_credit.aspx' + '?' + qparstr;
    $('#final-page-SONA').show();
  } else if (entry == "mTurk") {
    $('#final-page-mturk').show();
  } else { // if person did not come in from mTurk or SONA
    $('#final-page-other').show();
  }
  $('#container-not-an-ad').hide();
}

function redirectButton() {
  window.location.replace(redirURL);
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
    comments: null,
    sname: null
  }

  //console.log(subject);
}

document.addEventListener('DOMContentLoaded', function () {
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