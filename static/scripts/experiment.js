// Create the agent. Runs when the page opens.
function createAgent () {
  // Setup participant and get node id
  dallinger.createAgent()
  .done(function (resp) {
    my_node_id = resp.node.id;
    store.set("my_node_id", my_node_id);
    my_network_id = resp.node.network_id;
    dallinger.storage.set("my_network_id", my_network_id);
    numTransmissions = 0; // Set to 0. Once its 5, move on.
    Score = 0; // Updated throughout and saved as a cookie for later
    scoreShown = 0; // Determines whether advanceExperiment shows the score or advances at the end of the game
    advanceExperiment();
  })
  .fail(function (rejection) {
    dallinger.allowExit();
    dallinger.error(rejection);
  });
}

function Questionaire() {
  dallinger.allowExit();
  dallinger.goToPage('survey');
}

// Function for response submission. Works for both PGG and spite choices
function submitResponse(response, type) {
  myDonation = response;
  dallinger.createInfo(my_node_id, {
    contents: response,
    info_type: type
  }).done(function(resp) {
    if(type == "Donation"){
      hideExperiment();
      setTimeout(function(){
        checkTransmit();
      }, 2000); // Wait for the transmissions to all resolve and come through
    } else {
      dallinger.allowExit();
      dallinger.goToPage('debrief');
    }
  }).fail(function (rejection) {
    Questionaire();
  });
}

// Hide the experiment
function hideExperiment(){
  $("#headerone").hide();
  $("#Waiting").show();
  $("#PGGrow").hide();
  $("#Submitbutton").hide(); 
}

// Check for transmissions from the pog
function checkTransmit (){
  dallinger.getTransmissions(my_node_id, {
    status: "pending"
  }) 
  .done(function (resp){
    transmissions = resp.transmissions;
    if(transmissions.length > 0){
      processTransmit(transmissions);
    } else {
      setTimeout(function(){
        checkTransmit();
      }, 1000);
    }
  });
}

function processTransmit(transmissions){
  numTransmissions = numTransmissions + 1;
  summary_id = transmissions[0].info_id;
  dallinger.getInfo(my_node_id, summary_id)
  .done(function(resp) {
    summary = JSON.parse(resp.info.contents);
    pot = summary.total_earnings;
    donation = summary.pog_donation;
    totalScore = summary.score_in_pgg;
    showResults(pot, donation);
  });
}

function showResults(pot, donation){
  Score = Score + parseInt(pot); 
  $("#Waiting").hide();
  $("#you").html("You sent: " + myDonation);
  $("#you").show();
  $("#partner").html("The bot returned: " + donation);
  $("#partner").show();
  $("#earnings").html("You earned: " + pot);
  $("#earnings").show();
  $("#OK").show();
}

function advanceExperiment() {
  $("#partner").hide();
  $("#earnings").hide();
  $("#OK").hide();
  $("#you").hide();
  if(numTransmissions < 6){
    $("#headerone").show();
    $("#PGGrow").show();
    $("#Submitbutton").show(); 
  } else {
    if(scoreShown == 0){
      dallinger.storage.set("Score", Score);
      showScore();
    } else {
      dallinger.goToPage('instructions/Interim');
    }  
  }
}

function showScore(){
  $("#OK").show();
  $("#earnings").html("Your total score is: " + Score);
  $("#earnings").show();
  scoreShown = 1;
}

// Interim page code
function randomiseCondition() {
  my_node_id = dallinger.storage.get("my_node_id");
  conditions = new Array (
    "Asocial",
    "Ranspite",
    "Rancompassion",
    "Topspite",
    "Topcompassion"
  );
  selection = conditions[Math.floor(Math.random() * (4 - 0)) + 0];
  dallinger.createInfo(my_node_id, {
    contents: selection,
    info_type: 'Condition'
  });
  return selection;
}

function changePartners() {
    setTimeout(function(){
      $("#Partner").hide();
      $("#Instructions").show();
      $("#Next").show();
    }, 4000);
  }

// Spite page code
function randomiseScore(){
  num = Math.floor((Math.random() * 65) + 25);
  dallinger.createInfo(my_node_id, {
    contents: num,
    info_type: 'Condition'
  });
  return num;
}

function showReduce(){
  $("#Whatdo").html("Reduce their partners earnings");
  $("#Whatdo").show();
  $("#OK").show();
}

function showCompassion() {
  $("#Whatdo").html("Not reduce their partners earnings");
  $("#Whatdo").show();
  $("#OK").show();
}

function advanceSpite() {
  $("#Socialinfo").hide();
  $("#spitecont").show();
  $("#OK").hide();
  $("#Whatdo").hide();
}

function startSpite(condition) {
  my_node_id = dallinger.storage.get("my_node_id");
  $("#Score").html(randomiseScore());
  Score = parseInt($("#Score").html());
  $("#YourScore").html(dallinger.storage.get("Score"));
  yourScore = parseInt($("#YourScore").html());
  $("#partnerid").html("Your partner is Participant " + (parseInt(dallinger.identity.participantId) + 1));
  $("#partnerid").show();
  switch(condition) {
    case 'Asocial':
      $("#Socialinfo").hide();
      $("#spitecont").show();
      break;
    case 'Ranspite':
      $("#Socialinfo").html("Participant " + (parseInt(dallinger.identity.participantId) + 2) + " in your group decided to: ");
      showReduce();
      break;
    case 'Rancompassion':
      $("#Socialinfo").html("Participant " + (parseInt(dallinger.identity.participantId) + 2) + " in your group decided to: ");
      showCompassion();
      break;
    case 'Topspite':
      $("#Socialinfo").html("The highest scoring member of your group (Participant " + (parseInt(dallinger.identity.participantId) + 2) + ") decided to: ");
      showReduce();
      break;
    case 'Topcompassion':
      $("#Socialinfo").html("The highest scoring member of your group (Participant " + (parseInt(dallinger.identity.participantId) + 2) + ") decided to: ");
      showCompassion();
      break;
  }
}

function updatePoints(value) {
  // Code for slider to update points displayed
  value = parseInt(value);
  $("#Score").html(Score - (value * 3));
  $("#YourScore").html(yourScore - value);
}

function removeMe(){
  // Removes participants from the experiment
  allinger.createInfo(my_node_id, {
    contents: response,
    info_type: Drop
  }).done(function(resp){
    self.close();
  })
}