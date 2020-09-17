/*
This current experiment is a classic visuomotor rotation reaching experiment, but can easily be adapted into variations of different reaching experiments depending on the target file.
Currently supported experiments include:
- VMR
- Clamp
- Target-jump experiments
Remember to update necessary fields before starting the game. All fields that require change will be marked by a "**TODO**" comment.
*/

// Notes: might like to break out the timers into different variable names so that things don't get mixed up in case Javascript executes in an unexpected order?

// Object used to track reaching data (updated every reach and uploaded to database)
var subjTrials = {
  id: null,
  name: null,
  trialNum: null,
  currentDate: null,
  target_angle: null,
  trial_type: null,
  rotation: null,
  hand_fb_angle: null,
  rt: null,
  mt: null,
  search_time: null,
  reach_feedback: null,
  group_type: null,
  posx: null,
  posy: null,
  postm: null
}


// Variables used throughout the experiment
var fileName;
var svgContainer;
var subject_ID;
var target_dist;
var trial_type;
var start_x;
var start_y;
var start_radius;
var start_color;
var target_x;
var target_y;
var target_radius;
var target_color;
var hand_x;
var hand_y;
var hand_fb_x;
var hand_fb_y;
var r;
var cursor_x;
var cursor_y;
var cursor_radius;
var cursor_color;
var search_color;
var messages;
var line_size;
var message_size;
var counter;            // current reach count (starts at 1)
var target_file_data;
var rotation;
var target_angle;
var online_fb;
var endpt_fb;
var clamped_fb;
var between_blocks;
var trial;              // trial count (starts at 0)
var num_trials;
var search_tolerance;
var hand_angle;
var hand_fb_angle;
var rt;
var mt;
var search_time;
var feedback_time;
var feedback_time_slow;
var if_slow;
var hold_time;
var hold_timer;
var fb_timer;
var begin; 
var timing;
var SEARCHING;
var HOLDING;
var SHOW_TARGETS;
var MOVING;
var FEEDBACK;
var BETWEEN_BLOCKS;
var END_GAME;
var game_phase = BETWEEN_BLOCKS;
var reach_feedback;
var bb_counter;
var target_invisible;
var cursor_show;
var mousepos_x;
var mousepos_y;
var mousetm;
var elapsedTime;
var curTime;
var showCursor;
var searchRad;
var itiTimeoutTimer;
var instrucTimeoutTimer;
var instrucTimeLimit;
var ititimelimit;
var positer;
var loopiter;
var toSave_x;
var toSave_y;
var toSave_tm;
var angleadd;
var tempiter;
var grp;
var gameTimer;
var gameRefreshed = false;
var prevTrials = 0;


// specify at the top here whether mouse pointer will be shown or not
//var showPointer = 0;

// Function used to start running the game
// **TODO** Update the 'fileName' to path to targetfile
function startGame() {
  // Implement following commented code for uniform random selection of target files
   d = Math.floor(Math.random() * 4);
   if (d == 0) {
     fileName = "tgt_files/KimEtAl2019Rep_hit_20200917.json";
     grp = 'h_CCW';
   } else if (d == 1) {
     fileName = "tgt_files/KimEtAl2019Rep_straddle_20200917.json"; 
     grp = 's_CCW';
   } else if (d == 2) {
     fileName = "tgt_files/KimEtAl2019Rep_hitCW_20200917.json";
     grp = 'h_CW'; 
   } else {
     fileName = "tgt_files/KimEtAl2019Rep_straddleCW_20200917.json";
     grp = 's_CW';
   }

  // Implement following commented code to select a single target file
  //fileName = "tgt_files/KimEtAl2019Rep_hitCW.json"

  subject.tgt_file = fileName;
  subjTrials.group_type = grp; // **TODO** update group_type to manage the groups
  $.getJSON(fileName, function(json){
      target_file_data = json;
      gameSetup(target_file_data);
    });
}


// Function that sets up the game 
// All game functions are defined within this main function, treat as "main"
function gameSetup(data) {
  //console.log(subject);

  /*********************
  * Browser Settings  *
  *********************/

  // Initializations to make the screen full size and black background
  $('html').css('height', '98%');
  $('html').css('width', '100%');
  $('html').css('background-color', 'black')
  $('body').css('background-color', 'black')
  $('body').css('height', '98%');
  $('body').css('width', '100%');

  // UNCOMMENT HERE IF YOU WANT TO SHOW POINTER TO MAKE AN ILLUSTRATIVE VIDEO
  //if (showPointer == 0) {
    // Hide the mouse from view 
    $('html').css('cursor', 'none');
    $('body').css('cursor', 'none');
  //} else {
    // show mouse as pointer (for recording example trials)
  //  $('html').css('cursor', 'pointer');
  //  $('body').css('cursor', 'pointer');
  //}

  // SVG container from D3.js to hold drawn items
  svgContainer = d3.select("body").append("svg")
            .attr("width", "100%")
            .attr("height", "100%").attr('fill', 'black')
            .attr('id', 'stage')
            .attr('background-color', 'black');

  // Getting the screen resolution
  screen_height = window.screen.availHeight;
  screen_width = window.screen.availWidth;

  // Calling update_cursor() everytime the user moves the mouse
  $(document).on("mousemove", update_cursor);

  // Calling advance_block() everytime the user presses a key on the keyboard
  $(document).on("keydown", advance_block);

  // Experiment parameters, subject_ID is no obsolete
  subject_ID = Math.floor(Math.random() * 10000000000);

  /***************************
  * Drawn Element Properties *
  ***************************/

  // Setting the radius from center to target location 
  target_dist = screen_height/4;
  trial_type;


  // Setting parameters and drawing the center start circle
  start_x = screen_width/2;
  start_y = screen_height/2;
  start_radius = Math.round(target_dist * 4.5 / 80.0);
  start_color = 'lime';

  svgContainer.append('circle')
        .attr('cx', start_x)
        .attr('cy', start_y)
        .attr('r', start_radius)
        .attr('fill', 'none')
        .attr('stroke', start_color)
        .attr('stroke-width', 2)
        .attr('id', 'start')
        .attr('display', 'none');


  // Setting parameters and drawing the target 
  target_x = screen_width/2;
  target_y = Math.round(screen_height/10 * 2);
  target_radius = Math.round(target_dist * 4.5/80.0);
  target_color = 'magenta';

  svgContainer.append('circle')
        .attr('cx', target_x)
        .attr('cy', target_y)
        .attr('r', target_radius)
        .attr('fill', target_color)
        .attr('id', 'target')
        .attr('display', 'none');

    /* Initializing variables for:
      - Coordinates of the mouse 
      - Coordinates where the mouse crosses the target distance
      - Radius from center to hand coordinates
      - Coordinates of the displayed cursor (different from mouse if rotated)
      - Size of the displayed cursor
  */
  hand_x = 0;
  hand_y = 0;
  hand_fb_x = 0; 
  hand_fb_y = 0;
  r = 0; 
  cursor_x = 0;
  cursor_y = 0;
  cursor_radius = Math.round(target_dist * 1.75 * 1.5/80.0);
  cursor_color = 'lime';
  search_color = 'yellow';

  mousepos_x = new Array(200).fill(-1); // only take up to 1 s of data
  mousepos_y = new Array(200).fill(-1);
  mousepos_x[0] = [start_x];
  mousepos_y[0] = [start_y];
  mousetm = new Array(200).fill(-1);
  mousetm[0] = [0];
  positer = 1;
  elapsedTime = NaN; // initialize as NaN, but only update when checking the time in the "MOVING" phase
  curTime = NaN;

  instrucTimeLimit = 60000; // 1 min
  ititimelimit = 90000; // 1.5 mins
  //instrucTimeLimit = 30000; // 30 s for testing
  //ititimelimit = 30000; // 30 s for testing

  // Drawing the displayed cursor 
  svgContainer.append('circle')
        .attr('cx', hand_x)
        .attr('cy', hand_y)
        .attr('r', cursor_radius)
        .attr('fill', cursor_color)
        .attr('id', 'cursor')
        .attr('display', 'block');

  searchRad = screen_width/2;
  // Drawing the search ring that expands and contracts as users search for the start circle (currently unemployed)
  svgContainer.append('circle')
        .attr('cx', start_x)
        .attr('cy', start_y)
        .attr('r', searchRad)
        .attr('fill', 'none')
        .attr('stroke', 'search_color')
        .attr('stroke-width', 2)
        .attr('id', 'search_ring')
        .attr('display', 'none');

  // The between block messages that will be displayed
  // **TODO** Update messages depending on your experiment
  messages = [["Dummy Message Test"],
          ["The green dot will now be visible while you move towards the target.", // Message displayed when bb_mess == 1
          "Quickly move your green dot to the target.",
          "Press 'b' when you are ready to proceed."],
          ["This is an instruction understanding check, you may proceed ONLY if you choose the correct choice.", // Message displayed when bb_mess == 2
          "Choosing the wrong choice will result in early game termination and an incomplete HIT!",
          "Press 'a' if you should ignore the green dot and aim directly towards the target.",
          "Press 'b' if you should be aiming away from the target."],
          ["The green dot will now be hidden.",  // bb_mess == 3
          "Continue aiming DIRECTLY towards the target.",
          "Press SPACE BAR when you are ready to proceed."],
          ["This is an attention check.", // bb_mess == 4
          "Press the key 'e' on your keyboard to CONTINUE.",
          "Pressing any other key will result in a premature game termination and an incomplete HIT!"],
          ["This is an attention check.", // bb_mess == 5
          "Press the key 'a' on your keyboard to CONTINUE.",
          "Pressing any other key will result in a premature game termination and an incomplete HIT!"],
          ["The green dot will no longer be under your control while you move towards the target.", // bb_mess == 6
          "IGNORE the green dot as best as you can and continue aiming DIRECTLY towards the target.",
          "This will be a practice trial.",
          "Press SPACE BAR when you are ready to proceed."]];

  // Setting size of the displayed letters and sentences
  line_size = Math.round(screen_height/30)
  message_size = String(line_size).concat("px"); 

  // initialize a timer for starting the experiment
  instrucTimeoutTimer = setTimeout(instrucTimedOut, instrucTimeLimit); // kick subject if they take too long to read the instructions

  // Setting up first initial display once the game is launched 
  // **TODO** Update the '.text' sections to change initial displayed message
  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/2 - line_size)
        .attr('fill', 'white')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'message-line-1')
        .attr('display', 'block')
        .text('Move the green dot to the center.');

  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/2)
        .attr('fill', 'white')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'message-line-2')
        .attr('display', 'block')
        .text('The green dot will be visible during your reach.');

  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/2 + line_size)
        .attr('fill', 'white')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'message-line-3')
        .attr('display', 'block')
        .text('Quickly move your green dot to the target.');

  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/2 + line_size * 2)
        .attr('fill', 'white')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'message-line-4')
        .attr('display', 'block')
        .text('Press SPACE BAR when you are ready to proceed.');

  // Setting up parameters and display when reach is too slow
  too_slow_time = 300; // in milliseconds
  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/2)
        .attr('fill', 'orange')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'too_slow_message')
        .attr('display', 'none')
        .text('Too Slow'); 

  // Parameters and display for when users take too long to locate the center
  search_too_slow = 10000; // in milliseconds
  svgContainer.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', screen_width/2)
        .attr('y', screen_height/3 * 2)
        .attr('fill', 'white')
        .attr('font-family', 'Verdana')
        .attr('font-size', message_size)
        .attr('id', 'search_too_slow')
        .attr('display', 'none')
        .text('The yellow circle gets smaller as your cursor approaches the starting circle (green).');

  // Parameters and display for the reach counter located at the bottom right corner
  counter = 1;
  totalTrials = target_file_data.numtrials;
  svgContainer.append('text')
        .attr('text-anchor', 'end')
        .attr('x', screen_width/20 * 19)
        .attr('y', screen_height/20 * 19)
        .attr('fill', 'white')
        .attr('font-size', message_size)
        .attr('id', 'trialcount')
        .attr('display', 'none')
        .text('Reach Number: ' + counter + ' / ' + totalTrials); 
 
  /*****************
  * Task Variables *
  *****************/

  // Reading the json target file into the game
  target_file_data = data;
  rotation = target_file_data.rotation; // degrees
  target_angle = target_file_data.tgt_angle; //degrees
  online_fb = target_file_data.online_fb;
  endpt_fb = target_file_data.endpoint_feedback;
  clamped_fb = target_file_data.clamped_fb;
  between_blocks = target_file_data.between_blocks;
  target_jump = target_file_data.target_jump;
  num_trials = target_file_data.numtrials;
  target_size = target_file_data.tgt_size;

  // Initializing trial count
  trial = 0;

  // The distance from start at which they can see their cursor while searching in between trials
  search_tolerance = start_radius * 4 + cursor_radius * 4;

  // Calculated hand angles
  hand_angle = 0;
  hand_fb_angle = 0;

  // Timing Variables
  rt = 0; // reaction time
  mt = 0; // movement time
  search_time = 0; // time to reset trial (includes hold time)
  feedback_time = 50; // length of time feedback remains (ms)
  feedback_time_slow = 750; // length of "too slow" feedback
  hold_time = 500; // length of time users must hold in start before next trial (ms)
  
  // Initializing timer objects and variables
  hold_timer = null;
  fb_timer = null;

  // Variable to start clock for calculating time spent in states
  begin; 
  /* Flag variables for
      - Whether or not hand is within start circle
      - Whether or not previous reach was too slow
  */
  timing = true; 
  if_slow = false; 

  // Game Phase Flags
  SEARCHING = 0; // Looking for the center after a reach
  HOLDING = 1; // Holding at start to begin the next target
  SHOW_TARGETS = 2; // Displaying the target
  MOVING = 3; // The reaching motion 
  FEEDBACK = 4; // Displaying the feedback after reach
  BETWEEN_BLOCKS = 5; // Displaying break messages if necessary
  END_GAME = 1000; // I think this just needs to be defined
  game_phase = BETWEEN_BLOCKS;

  // Initializing between block parameters
  reach_feedback;
  bb_counter = 0;
  bb_mess = between_blocks[0];

  // Flags to determine whether we are showing the target and cursor (not mouse)
  target_invisible = true; // for clicking to see target
  cursor_show = false;

  //setTimeout(gameTimedOut, 30000); // 30s timeout for testing
  gameTimer = setTimeout(gameTimedOut, 3600000); // one hour timeout

  // have the targets centered about random locations
  angleadd = Math.floor(Math.random()*360)+1;

}

  /********************
  * Update Cursor Function*
  * This function gets called every time a participant moves their mouse.*
  * It does the following:
    * Tracks the mouse location (hand location) and calculates the radius
    from the start circle
    * Computes a rotation on the cursor if during appropriate game phase
    * Draws the cursor if in appropriate game phase
    * Triggers changes in game phase if appropriate conditions are met*
  ********************/
  function update_cursor(event) {
    var eventDoc, doc, body, pageX, pageY; // These variables are now bsolete

    // Record the current mouse location, and the current time
    event = event || window.event; 
    hand_x = event.pageX;
    hand_y = event.pageY;
    curTime = new Date();

    // Update radius between start and hand location
    r = Math.sqrt(Math.pow(start_x - hand_x, 2) + Math.pow(start_y - hand_y, 2));

    // Update hand angle
    hand_angle = Math.atan2(start_y - hand_y, hand_x - start_x) * 180 / Math.PI;

    // Calculations done in the MOVING phase
    if (game_phase == MOVING) {
      // console.log(target_jump[trial]); // Debugging message to check if there was supposed to be a target jump
      /*
        Jump target to clamp if target_jump[trial] == 1
        Jump target away from clamp by target_jump[trial] if value is neither 0 || 1
      */
      if (target_jump[trial] == 1) {
        target_x = start_x + target_dist * Math.cos((target_angle[trial] + angleadd + rotation[trial]) * Math.PI/180);
        target_y = start_y - target_dist * Math.sin((target_angle[trial] + angleadd  + rotation[trial]) * Math.PI/180);
        d3.select('#target').attr('cx', target_x).attr('cy', target_y).attr('display', 'block');
      } else if (target_jump[trial] != 0) {
        target_x = start_x + target_dist * Math.cos((target_angle[trial] + angleadd  + target_jump[trial]) * Math.PI/180);
        target_y = start_y - target_dist * Math.sin((target_angle[trial] + angleadd  + target_jump[trial]) * Math.PI/180);
        d3.select('#target').attr('cx', target_x).attr('cy', target_y).attr('display', 'block');
      }

      // Updating cursor locations depending on clamp, fb, no_fb
      if (clamped_fb[trial]) { // Clamped feedback
        cursor_x = start_x + r * Math.cos((target_angle[trial] + angleadd  + rotation[trial]) * Math.PI/180);
        cursor_y = start_y - r * Math.sin((target_angle[trial] + angleadd  + rotation[trial]) * Math.PI/180);
      } else if (online_fb[trial]) { // Rotated feedback (vmr)
        cursor_x = start_x + r * Math.cos((hand_angle + rotation[trial]) * Math.PI/180);
        cursor_y = start_y - r * Math.sin((hand_angle + rotation[trial]) * Math.PI/180);
      } else { // Veridical feedback
        cursor_x = hand_x;
        cursor_y = hand_y;
      }

      // Record cursor location whenever movement is detected, but only take up to 200 samples
      if (positer<=199) {
        elapsedTime = curTime.getTime() - begin.getTime();  // begin is a timestamp that gets reset once the cursor starts moving
        mousepos_x[positer]= hand_x;
        mousepos_y[positer]=hand_y;
        mousetm[positer]=elapsedTime;
        positer = positer + 1;
      }

    } else {
      cursor_x = hand_x;
      cursor_y = hand_y;
    }

    // Calculations done in the HOLDING phase
    if (game_phase == HOLDING) {
      if (r <= start_radius) { // Fill the center if within start radius
        d3.select('#cursor').attr('display', 'none'); 
        d3.select('#start').attr('fill', start_color);
        d3.select('#search_ring').attr('r',r).attr('display', 'none');
      } else {
        d3.select('#start').attr('fill', 'none');
        if (r <= target_dist/8) {
          cursor_show = true;
        //} else if (new Date() - begin > search_too_slow){
        //  cursor_show = true;
        //  d3.select('#search_ring').attr('stroke','LightGray');
        } else {
          cursor_show = false;
        }

        // Display the cursor if flag is on 
        if (cursor_show) {
          // UNCOMMENT HERE IF YOU WANT TO SHOW POINTER TO MAKE AN ILLUSTRATIVE VIDEO
          //if (showPointer == 1) { 
            ////show mouse as pointer (for recording example trials)
            //$('html').css('cursor', 'pointer');
            //$('body').css('cursor', 'pointer');
          //}
          d3.select('#cursor').attr('display', 'block'); // show cursor
          d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
          d3.select('#search_ring').attr('r',r);
        } else {
          // UNCOMMENT HERE IF YOU WANT TO SHOW POINTER TO MAKE AN ILLUSTRATIVE VIDEO
          //if (showPointer == 1) { 
            //// show mouse as pointer (for recording example trials)
            //$('html').css('cursor', 'pointer');
            //$('body').css('cursor', 'pointer');
          //}
          d3.select('#cursor').attr('display', 'none'); // hide the cursor
          d3.select('#search_ring').attr('stroke', search_color).attr('r',r).attr('display', 'block');
        }

        // Displaying searching too slow message if threshold is crossed
        if (new Date() - begin > search_too_slow) {
          d3.select('#search_too_slow').attr('display', 'block');
        }
      }

    // Calculations done in SHOW_TARGETS phase
    } else if (game_phase == SHOW_TARGETS) {
      d3.select('#cursor').attr('display', 'none');
      d3.select('#start').attr('fill', start_color);
      d3.select('#search_too_slow').attr('display', 'none'); // turn off too slow message if it's there

    // Flag cursor to display if within certain distance to center
    } else if (game_phase == SEARCHING) {

      // make sure the mouse pointer is off (if person leaves window the cursor can come back on)
      $('html').css('cursor', 'none');
      $('body').css('cursor', 'none');

      if (r <= target_dist/8) {
        cursor_show = true;
      //} else if (new Date() - begin > search_too_slow){
      //  cursor_show = true;
      //  d3.select('#search_ring').attr('stroke','LightGray');
      } else {
        cursor_show = false;
      }

      // Display the cursor if flag is on 
      if (cursor_show) {
        // UNCOMMENT HERE IF YOU WANT TO SHOW POINTER TO MAKE AN ILLUSTRATIVE VIDEO
        //if (showPointer == 1) { 
          ////show mouse as pointer (for recording example trials)
          //$('html').css('cursor', 'pointer');
          //$('body').css('cursor', 'pointer');
        //}
        d3.select('#cursor').attr('display', 'block'); // show cursor
        d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
        d3.select('#search_ring').attr('r',r);
      } else {
        // UNCOMMENT HERE IF YOU WANT TO SHOW POINTER TO MAKE AN ILLUSTRATIVE VIDEO
        //if (showPointer == 1) { 
          //// show mouse as pointer (for recording example trials)
          //$('html').css('cursor', 'pointer');
          //$('body').css('cursor', 'pointer');
        //}
        d3.select('#cursor').attr('display', 'none'); // hide the cursor
        d3.select('#search_ring').attr('stroke', search_color).attr('r',r).attr('display', 'block'); // show the search ring
      }

      // Displaying the start circle and trial count 
      // d3.select('#search_ring').attr('display', 'block').attr('r', r);
      d3.select('#start').attr('display', 'block');
      d3.select('#trialcount').attr('display', 'block');

      // Displaying searching too slow message if threshold is crossed
      if (new Date() - begin > search_too_slow) {
        d3.select('#search_too_slow').attr('display', 'block');
      }

    // Displaying the cursor during MOVING if targetfile indicates so for the reach
    } else if (game_phase == MOVING) {
      // d3.select('#search_ring').attr('display', 'none');
      if (online_fb[trial] || clamped_fb[trial]) {
        d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
      } else {
        d3.select('#cursor').attr('display', 'none'); // hide the cursor
      }
    }

    // Trigger Game Phase Changes that are Dependent on Cursor Movement

    // Move from search to hold phase if they move within search tolerance of the start circle 
    if (game_phase == SEARCHING && r <= search_tolerance && cursor_show) {
      d3.select('#search_too_slow').attr('display', 'none');
      // d3.select('#encouragement').attr('display', 'none');
      hold_phase();
      

    // Move from hold back to search phase if they move back beyond the search tolerance
    } else if (game_phase == HOLDING && r > search_tolerance) {
      search_phase();

    // Start the hold timer if they are within the start circle
    // Timing flag ensures the timer only gets started once
    } else if (game_phase == HOLDING && r <= start_radius && !timing) {
      timing = true;
      hold_timer = setTimeout(show_targets, hold_time);
    
    // Clear out timer if holding is completed
    } else if (game_phase == HOLDING && r > start_radius && timing) {
      timing = false;
      d3.select('#message-line-1').attr('display', 'none');
      clearTimeout(hold_timer);

    // Move from show targets to moving phase once user has begun their reach
    } else if (game_phase == SHOW_TARGETS && r > start_radius && !target_invisible) { // for clicking
      moving_phase();

    // Move from moving to feedback phase once their reach intersects the target ring
    } else if (game_phase == MOVING && r >= target_dist) {
      fb_phase();
    }
  }

  // Function called whenever a key is pressed
  // **TODO** Make sure the conditions match up to the messages displayed in "messages"
  function advance_block(event) {
    var SPACE_BAR = 32;
    var a = 65;
    var e = 69;
    var b = 66;
    var f = 70;
  // bb_mess 1 --> b, 2 or 5 --> a, 3 or 6 --> space, 4 --> e
    if ((game_phase == BETWEEN_BLOCKS && (bb_mess == 5 || bb_mess == 2) && event.keyCode == a) || bb_mess == 0) {
      clearTimeout(instrucTimeoutTimer);
      // Start a timer for kicking the subject if they take too long to complete a trial
      itiTimeoutTimer = setTimeout(itiTimedOut, ititimelimit); // kick subject if they take too long to finish this trial
      search_phase();
    } else if ((game_phase == BETWEEN_BLOCKS && bb_mess == 4 && event.keyCode == e)) {
      clearTimeout(instrucTimeoutTimer);
      // Start a timer for kicking the subject if they take too long to complete a trial
      itiTimeoutTimer = setTimeout(itiTimedOut, ititimelimit); // kick subject if they take too long to finish this trial
      search_phase();
    } else if (game_phase == BETWEEN_BLOCKS && bb_mess == 1 && event.keyCode == b) {
      clearTimeout(instrucTimeoutTimer);
      // Start a timer for kicking the subject if they take too long to complete a trial
      itiTimeoutTimer = setTimeout(itiTimedOut, ititimelimit); // kick subject if they take too long to finish this trial
     search_phase();
    } else if (game_phase == BETWEEN_BLOCKS && event.keyCode == SPACE_BAR && (bb_mess == 3 || bb_mess == 6)) {
      clearTimeout(instrucTimeoutTimer);
      // Start a timer for kicking the subject if they take too long to complete a trial
      itiTimeoutTimer = setTimeout(itiTimedOut, ititimelimit); // kick subject if they take too long to finish this trial
      search_phase();
    } else {
      console.log("premature end");
      console.log(bb_mess);
      badGame(); // Premature exit game if failed attention check
    }
  }
  
  /***********************
  * Game Phase Functions *
  * Mostly controls what is being displayed *
  ************************/

  // Phase when searching for the center start circle
  function search_phase() {
    game_phase = SEARCHING;

    // Start of timer for search time
    begin = new Date();

    // Start circle becomes visible, target, cursor invisible
    d3.select('#start').attr('display', 'block').attr('fill', 'none');
    d3.select('#target').attr('display', 'none').attr('fill', target_color);
    d3.select('#cursor').attr('display', 'none');
    // d3.select('#search_ring').attr('display', 'block').attr('r', r);
    d3.select('#message-line-1').attr('display', 'none');
    d3.select('#message-line-2').attr('display', 'none');
    d3.select('#message-line-3').attr('display', 'none');
    d3.select('#message-line-4').attr('display', 'none');
    d3.select('#too_slow_message').attr('display', 'none');
    d3.select('#trialcount').attr('display', 'block');
  }

  // Obsolete function
  function end_game() {
    game_phase = END_GAME;
  }
  
  // Phase when users hold their cursors within the start circle
  function hold_phase() {
    game_phase = HOLDING;
  }

  // Phase when users have held cursor in start circle long enough so target shows up 
  function show_targets() {
    game_phase = SHOW_TARGETS;
    
    // Record search time as the time elapsed from the start of the search phase to the start of this phase
    d3.select('#message-line-1').attr('display', 'none');
    search_time = new Date() - begin;

    // Start of timer for reaction time
    begin = new Date();

    // Target becomes visible
    target_x = start_x + target_dist * Math.cos((target_angle[trial] + angleadd)  * Math.PI/180);
    target_y = start_y - target_dist * Math.sin((target_angle[trial] + angleadd)  * Math.PI/180);
    tgt_rad = Math.round(target_dist * target_size[trial]/80.0);
    d3.select('#target').attr('display', 'block').attr('cx', target_x).attr('cy', target_y).attr('r', tgt_rad);
    target_invisible = false;

    d3.select('#search_too_slow').attr('display', 'none'); // get rid of too slow notification
  }
  
  // Phase when users are reaching to the target
  function moving_phase() {
    game_phase = MOVING;

    // Record reaction time as time spent with target visible before moving
    rt = new Date() - begin;

    // Start of timer for movement time
    begin = new Date();

    mousetm = new Array(200).fill(-1);
    mousetm[0] = [0];

    // Start circle disappears
    d3.select('#start').attr('display', 'none');

  }

  // Phase where users have finished their reach and receive feedback
  // should be triggered immediately upon crossing the ring that the targets are plotted
  function fb_phase() {
    game_phase = FEEDBACK;

    // debugging output
    //console.log(mousepos_x)
    //console.log(mousepos_y)
    //console.log(mousetm)

    // Record movement time as time spent reaching before intersecting target circle
    // Can choose to add audio in later if necessary
    mt = new Date() - begin;


    if (mt > too_slow_time) {
      // d3.select('#target').attr('fill', 'red');
      if_slow = true;
      d3.select('#cursor').attr('display', 'none');
      d3.select('#target').attr('display', 'none');
      d3.select('#too_slow_message').attr('display', 'block');
      reach_feedback = "too_slow";
    } else {
      // d3.select('#target').attr('fill', 'green');
      reach_feedback = "good_reach";
    }

    // Record the hand location immediately after crossing target ring
    // projected back onto target ring (since mouse doesn't sample fast enough)
    hand_fb_angle = Math.atan2(start_y - hand_y, hand_x - start_x) * 180 / Math.PI;
    if (hand_fb_angle < 0) {
      hand_fb_angle = 360 + hand_fb_angle; // Corrected so that it doesn't have negative angles
    }
    hand_fb_x = start_x + target_dist * Math.cos(hand_fb_angle * Math.PI/180);
    hand_fb_y = start_y - target_dist * Math.sin(hand_fb_angle * Math.PI/180);

    // Display Cursor Endpoint Feedback
    if (clamped_fb[trial]) { // Clamped feedback
      cursor_x = start_x + target_dist * Math.cos((target_angle[trial] + angleadd  + rotation[trial]) * Math.PI/180);
      cursor_y = start_y - target_dist * Math.sin((target_angle[trial] + angleadd  + rotation[trial]) * Math.PI/180);
      d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
      trial_type = "clamped_fb";
    } else if (endpt_fb[trial] || online_fb[trial]) { // Visible feedback (may be rotated depending on rotation)
      cursor_x = start_x + target_dist * Math.cos((hand_fb_angle + rotation[trial]) * Math.PI/180);
      cursor_y = start_y - target_dist * Math.sin((hand_fb_angle + rotation[trial]) * Math.PI/180);
      d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
      trial_type = "online_fb";
    } else { 
      d3.select('#cursor').attr('display', 'none');
      trial_type = "no_fb";
    }

    // Start next trial after feedback time has elapsed
    if (if_slow) {
      if_slow = false; // reset variable for next time
      fb_timer = setTimeout(targetAndCursorOff, feedback_time);
      fb_timer = setTimeout(next_trial, feedback_time_slow);      
    } else {
      fb_timer = setTimeout(next_trial, feedback_time);
    }
  }

  function targetAndCursorOff() {
    // Ensure target, cursor invisible
    d3.select('#target').attr('display', 'none');
    d3.select('#cursor').attr('display', 'none');
    target_invisible = true; // for clicking, currently not employed
    cursor_show = false;
  }
  

  // Function used to initiate the next trial after uploading reach data and subject data onto the database
  // Cleans up all the variables and displays to set up for the next reach
  function next_trial() {

    // Ensure target, cursor invisible
    d3.select('#target').attr('display', 'none');
    d3.select('#cursor').attr('display', 'none');
    target_invisible = true; // for clicking, currently not employed
    cursor_show = false;

    // make sure too slow message is off
    d3.select('#too_slow_message').attr('display', 'none');

    var d = new Date();
    var current_date = (parseInt(d.getMonth()) + 1).toString() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + "." + d.getMilliseconds();
    clearTimeout(itiTimeoutTimer);

    // pull the position and time values that should be saved (i.e., the non-negative, possible values that were sampled this trial)
    loopiter = 1;
    toSave_x = mousepos_x[0];
    toSave_y = mousepos_y[0];
    toSave_tm = mousetm[0];
    while (loopiter < positer) {
      toSave_x.push(mousepos_x[loopiter]);
      toSave_y.push(mousepos_y[loopiter]);
      toSave_tm.push(mousetm[loopiter]);
      loopiter = loopiter + 1;
    }

    // Uploading reach data for this reach onto the database
    //SubjTrials.group_type is defined in startGame
    subjTrials.id = subject.id.concat(counter.toString());
    subjTrials.name = subject.id;
    subjTrials.currentDate = current_date;
    subjTrials.trialNum = trial + 1;
    subjTrials.target_angle = target_angle[trial] + angleadd ;
    subjTrials.trial_type = trial_type;
    subjTrials.rotation = rotation[trial];
    subjTrials.hand_fb_angle = hand_fb_angle;
    subjTrials.rt = rt;
    subjTrials.mt = mt;
    subjTrials.search_time = search_time;
    subjTrials.reach_feedback = reach_feedback;
    subjTrials.posx = toSave_x;
    subjTrials.posy = toSave_y;
    subjTrials.postm = toSave_tm;
    recordTrialSubj(trialcollection, subjTrials);

    // reset starting mouse position and iterator
    mousepos_x = new Array(200).fill(-1);
    mousepos_y = new Array(200).fill(-1);
    mousepos_x[0] = [start_x];
    mousepos_y[0] = [start_y];
    positer = 1;

    // Updating subject data to display most recent reach on database
    subject.currTrial = trial + 1;
    createSubject(subjectcollection, subject); 

    // Reset timing variables
    rt = 0;
    mt = 0;
    search_time = 0;

    // Between Blocks Message Index
    bb_mess = between_blocks[trial];
  

    // Increment the trial count
    trial += 1;
    counter += 1;
    d3.select('#trialcount').text('Reach Number: ' + counter + ' / ' + totalTrials);
      
    // Checks whether the experiment is complete, if not continues to next trial
    if (trial == num_trials) {
      $(document).off("keydown");
      $(document).off("mousemove");
      endGame();
    } else if (bb_mess || counter == 1) {
      console.log(bb_mess);
      game_phase = BETWEEN_BLOCKS;
      //d3.select('#start').attr('display', 'none');    
      d3.select('#message-line-1').attr('display', 'block').text(messages[bb_mess][0]);
      d3.select('#message-line-2').attr('display', 'block').text(messages[bb_mess][1]);
      d3.select('#message-line-3').attr('display', 'block').text(messages[bb_mess][2]);
      d3.select('#message-line-4').attr('display', 'block').text(messages[bb_mess][3]);  
      d3.select('#too_slow_message').attr('display', 'none');
      d3.select('#trialcount').attr('display', 'block');
      //d3.select('#start').attr('display', 'block');    

      // initialize a timer for starting the experiment
      instrucTimeoutTimer = setTimeout(instrucTimedOut, instrucTimeLimit); // kick subject if they take too long to read the instructions

      bb_counter += 1;
    } else {
      // Start a timer for kicking the subject if they take too long to complete a trial
      itiTimeoutTimer = setTimeout(itiTimedOut, ititimelimit); // kick subject if they take too long to finish this trial
      console.log("started ITI timer")

      // Start next trial
      search_phase();
    }
  }



// Function used to upload reach data in the database
function recordTrialSubj(collection, subjTrials) {
  if (noSave) {
    return null;
  }
  return collection.doc(subjTrials.id).set(subjTrials)
  .then(function() {
    return true;
  })
  .catch(function(err) {
    console.error(err);
    throw err;
  });
}


// Function that allows for the premature end of a game
function badGame() {
  closeFullScreen();
  $('html').css('cursor', 'auto');
  $('body').css('cursor', 'auto');
  $('body').css('background-color', 'white');
  $('html').css('background-color', 'white');

  d3.select('#start').attr('display', 'none');
  d3.select('#search_ring').attr('display', 'none');
  d3.select('#target').attr('display', 'none');
  d3.select('#cursor').attr('display', 'none');
  d3.select('#message-line-1').attr('display', 'none');
  d3.select('#message-line-2').attr('display', 'none');
  d3.select('#message-line-3').attr('display', 'none');
  d3.select('#message-line-4').attr('display', 'none');
  d3.select('#too_slow_message').attr('display', 'none');
  d3.select('#search_too_slow').attr('display', 'none');
  d3.select('#countdown').attr('display', 'none');
  d3.select('#trialcount').attr('display', 'none');

  show('container-failed', 'container-exp');
  
}

// Function that ends the game appropriately after the experiment has been completed
function endGame() {
  closeFullScreen();
  $('html').css('cursor', 'auto');
  $('body').css('cursor', 'auto');
  $('body').css('background-color', 'white');
  $('html').css('background-color', 'white');

  d3.select('#start').attr('display', 'none');
  d3.select('#search_ring').attr('display', 'none');
  d3.select('#target').attr('display', 'none');
  d3.select('#cursor').attr('display', 'none');
  d3.select('#message-line-1').attr('display', 'none');
  d3.select('#message-line-2').attr('display', 'none');
  d3.select('#message-line-3').attr('display', 'none');
  d3.select('#message-line-4').attr('display', 'none');
  d3.select('#too_slow_message').attr('display', 'none');
  d3.select('#search_too_slow').attr('display', 'none');
  // d3.select('#encouragement').attr('display', 'none');
  d3.select('#countdown').attr('display', 'none');
  d3.select('#trialcount').attr('display', 'none');

  show('container-not-an-ad', 'container-exp');
  
}

// Function that ends the game prematurely if the participant is taking >60 mins
function gameTimedOut() {
  game_phase = END_GAME;

  closeFullScreen();
  $('html').css('cursor', 'auto');
  $('body').css('cursor', 'auto');
  $('body').css('background-color', 'white');
  $('html').css('background-color', 'white');

  d3.select('#start').attr('display', 'none');
  d3.select('#search_ring').attr('display', 'none');
  d3.select('#target').attr('display', 'none');
  d3.select('#cursor').attr('display', 'none');
  d3.select('#message-line-1').attr('display', 'none');
  d3.select('#message-line-2').attr('display', 'none');
  d3.select('#message-line-3').attr('display', 'none');
  d3.select('#message-line-4').attr('display', 'none');
  d3.select('#too_slow_message').attr('display', 'none');
  d3.select('#search_too_slow').attr('display', 'none');
  // d3.select('#encouragement').attr('display', 'none');
  d3.select('#countdown').attr('display', 'none');
  d3.select('#trialcount').attr('display', 'none');

  refreshGameJs();
  refreshIndexJs();

  show('container-timeout', 'container-exp');
}

// Function that ends the game prematurely if the participant is taking >60 mins
function itiTimedOut() {
  game_phase = END_GAME;

  closeFullScreen();
  $('html').css('cursor', 'auto');
  $('body').css('cursor', 'auto');
  $('body').css('background-color', 'white');
  $('html').css('background-color', 'white');

  d3.select('#start').attr('display', 'none');
  d3.select('#search_ring').attr('display', 'none');
  d3.select('#target').attr('display', 'none');
  d3.select('#cursor').attr('display', 'none');
  d3.select('#message-line-1').attr('display', 'none');
  d3.select('#message-line-2').attr('display', 'none');
  d3.select('#message-line-3').attr('display', 'none');
  d3.select('#message-line-4').attr('display', 'none');
  d3.select('#too_slow_message').attr('display', 'none');
  d3.select('#search_too_slow').attr('display', 'none');
  // d3.select('#encouragement').attr('display', 'none');
  d3.select('#countdown').attr('display', 'none');
  d3.select('#trialcount').attr('display', 'none');

  refreshGameJs();
  refreshIndexJs();

  show('container-ititimeout', 'container-exp');
}

// Function that ends the game prematurely if the participant is taking >60 mins
function instrucTimedOut() {
  game_phase = END_GAME;

  closeFullScreen();
  $('html').css('cursor', 'auto');
  $('body').css('cursor', 'auto');
  $('body').css('background-color', 'white');
  $('html').css('background-color', 'white');

  d3.select('#start').attr('display', 'none');
  d3.select('#search_ring').attr('display', 'none');
  d3.select('#target').attr('display', 'none');
  d3.select('#cursor').attr('display', 'none');
  d3.select('#message-line-1').attr('display', 'none');
  d3.select('#message-line-2').attr('display', 'none');
  d3.select('#message-line-3').attr('display', 'none');
  d3.select('#message-line-4').attr('display', 'none');
  d3.select('#too_slow_message').attr('display', 'none');
  d3.select('#search_too_slow').attr('display', 'none');
  // d3.select('#encouragement').attr('display', 'none');
  d3.select('#countdown').attr('display', 'none');
  d3.select('#trialcount').attr('display', 'none');

  refreshGameJs();
  refreshIndexJs();

  show('container-instructimeout', 'container-exp');
}

// it's not clear to me if this matters, trying to solve numtrials not getting reset problem
function refreshGameJs() {
  clearTimeout(itiTimeoutTimer);
  clearTimeout(gameTimer);
  clearTimeout(instrucTimeoutTimer);

  subjTrials = {
    id: null,
    name: null,
    trialNum: null,
    currentDate: null,
    target_angle: null,
    trial_type: null,
    rotation: null,
    hand_fb_angle: null,
    rt: null,
    mt: null,
    search_time: null,
    reach_feedback: null,
    group_type: null,
    posx: null,
    posy: null,
    postm: null
  }

  fileName = null;
  svgContainer = null;
  subject_ID = null;
  target_dist = null;
  trial_type = null;
  start_x = null;
  start_y = null;
  start_radius = null;
  start_color = null;
  target_x = null;
  target_y = null;
  target_radius = null;
  target_color = null;
  hand_x = null;
  hand_y = null;
  hand_fb_x = null;
  hand_fb_y = null;
  r = null;
  cursor_x = null;
  cursor_y = null;
  cursor_radius = null;
  cursor_color = null;
  search_color = null;
  messages = null;
  line_size = null;
  message_size = null;
  counter = null;
  target_file_data = null;
  rotation = null;
  target_angle = null;
  online_fb = null;
  endpt_fb = null;
  clamped_fb = null;
  between_blocks = null;
  trial = null;
  num_trials = null;
  search_tolerance = null;
  hand_angle = null;
  hand_fb_angle = null;
  rt = null;
  mt = null;
  search_time = null;
  feedback_time = null;
  feedback_time_slow = null;
  if_slow = null;
  hold_time = null;
  hold_timer = null;
  fb_timer = null;
  begin = null;
  timing = null;
  SEARCHING = null;
  HOLDING = null;
  SHOW_TARGETS = null;
  MOVING = null;
  FEEDBACK = null;
  BETWEEN_BLOCKS = null;
  game_phase = BETWEEN_BLOCKS;
  reach_feedback = null;
  bb_counter = null;
  target_invisible = null;
  mousepos_x = null;
  mousepos_y = null;
  mousetm = null;
  elapsedTime = null;
  curTime = null;
  showCursor = null;
  searchRad = null;
  itiTimeoutTimer = null;
  instrucTimeoutTimer = null;
  instrucTimeLimit = null;
  ititimelimit = null;
  positer = null;
  loopiter = null;
  toSave_x = null;
  toSave_y = null;
  toSave_tm = null;
  angleadd = null;
  tempiter = null;
  grp = null;
  gameTimer = null;
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