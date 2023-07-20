class Player {
  constructor({ name = "", playerNum = 0, score = 0, isComputer = false } = {}) {
    this.name = name;
    this.playerNum = playerNum;
    this.score = score;
    this.isComputer = isComputer;
  }
}
class PigGame{
  constructor(){
      this.winScore = 100;
      this.turnScore = 0;
      this.totalRollsThisGame = 0;
      this.diceRoll = 0;
      this.isGameComplete = false;
      this.currentPlayer = new Player();
      this.player1 = new Player();
      this.player2 = new Player();
  }
}

window.CurrentPigGame = new PigGame();
window.userChoseComputerPlay = true;
    
    
async function rollDice() {
  CurrentPigGame.totalRollsThisGame++;
  let diceRoll = Math.floor(Math.random() * 6) + 1;
  CurrentPigGame.diceRoll = diceRoll;
  await triggerRollAnimation();
  return new Promise((resolve) =>{
    let logMsg = CurrentPigGame.diceRoll !== 1 
          ? CurrentPigGame.currentPlayer.name + " rolled a " + CurrentPigGame.diceRoll 
          : CurrentPigGame.currentPlayer.name + " rolled a " + CurrentPigGame.diceRoll + " and pigged out!";
      addToLog(logMsg);
      if(!checkPigOut()){
        updatePlayerTurnScore();
      }
     
      resolve();
  });
}

function addToLog(text) {
  const logList = document.getElementById("logList");
  const newItem = document.createElement("li");
  newItem.textContent = text;
  logList.appendChild(newItem);
  logList.scrollTop = logList.scrollHeight;
}

function triggerRollAnimation(){
  toggleActionButtonsDisable(true);
  let currRollElement = document.getElementById("currRoll");
  let startTime = Date.now();
  //show random number like a dice rolling for 1 second
  //note this is just the animation - the actual dice roll is already set in the CurrentPigGame obj
  return new Promise((resolve) => {
  let interval = setInterval(() => {
    let diceRoll = Math.floor(Math.random() * 6) + 1;
    currRollElement.textContent = diceRoll;
     // Check if 1 second has passed
     if (Date.now() - startTime >= 1000) {
      currRollElement.textContent = CurrentPigGame.diceRoll;
      toggleActionButtonsDisable(false);
      clearInterval(interval); // Stop the interval updates 
      resolve();
    }
    }, 100); // 100 milliseconds = 0.1 seconds
  });
  
}
function triggerPigOutDialog(player) {
  var overlay = document.getElementById('pigout-overlay');
  var popup = document.getElementById('pigout');
  overlay.style.display = 'block';

  // Set initial size
  var currentSize = 200;
  popup.style.width = currentSize + 'px';
  popup.style.height = currentSize + 'px';

  // Define the growth rate
  var growthRate = 4;

  // Gradually grow for 1 second
  var growTimer = setInterval(function() {
    currentSize += growthRate;
    popup.style.width = currentSize + 'px';
    popup.style.height = currentSize + 'px';

    // Stop growing after 2 seconds
    if (currentSize >= 400) {
      clearInterval(growTimer);

      // Gradually shrink for 1 second
      var shrinkTimer = setInterval(function() {
        currentSize -= growthRate;
        popup.style.width = currentSize + 'px';
        popup.style.height = currentSize + 'px';

        // Hide popup after shrinking
        if (currentSize <= 200) {
          clearInterval(shrinkTimer);
          overlay.style.display = 'none';
        }
      }, 20);
    }
  }, 10);
}

function checkPigOut()  {
  if(CurrentPigGame.diceRoll === 1){
    triggerPigOutDialog(CurrentPigGame.currentPlayer);
    resetTurn();
    passTurn();
    toggleActionButtonsDisable(false);
    return true;
  }
  return false;
}
function checkWinCondition(player){
  if(player.score >= CurrentPigGame.winScore){
    triggerWinOverlay(player);
    CurrentPigGame.isGameComplete = true; 
 }
}

  function increaseSize(element, duration, increment) {
    var initialWidth = element.offsetWidth;
    var initialHeight = element.offsetHeight;
    var startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = timestamp - startTime;
      var scaleFactor = progress / duration;
      var newWidth = initialWidth + initialWidth * scaleFactor;
      var newHeight = initialHeight + initialHeight * scaleFactor;

      element.style.width = newWidth + 'px';
      element.style.height = newHeight + 'px';

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

function updatePlayerTurnScore (){
  CurrentPigGame.turnScore +=  CurrentPigGame.diceRoll;

  document.getElementById("currTurn").textContent = CurrentPigGame.turnScore;
}


function passTurn() {
  if(CurrentPigGame.diceRoll !== 1){
    addToLog(CurrentPigGame.currentPlayer.name + " passed adding "+ CurrentPigGame.turnScore + " to their score");
  }
  updatePlayerScoreActivePlayer();
  resetTurn();
   if(CurrentPigGame.currentPlayer.isComputer === true){
        computerPlay();
   }
}

async function computerPlay(){
  await rollDice();
  if(CurrentPigGame.currentPlayer.isComputer && !CurrentPigGame.isGameComplete){
    let currentScore = CurrentPigGame.turnScore;
    switch(true){
      case currentScore > 10: 
        passTurn(); break;
      default:
        computerPlay(); break;
    }
  }
}

function updatePlayerScoreActivePlayer(){
   //switch games current player, player visual, and update score
   let currPlayer = CurrentPigGame.currentPlayer;
   switch (currPlayer.playerNum) {
     case 1:
       document.getElementById("player1").classList.remove("active-player");
       document.getElementById("player2").classList.add("active-player");
       CurrentPigGame.player1.score += CurrentPigGame.turnScore;
       checkWinCondition(CurrentPigGame.currentPlayer);
       document.getElementById("p1ScoreLabel").textContent = CurrentPigGame.player1.score;
       CurrentPigGame.currentPlayer = CurrentPigGame.player2;
       break;
     case 2:
       document.getElementById("player2").classList.remove("active-player");
       document.getElementById("player1").classList.add("active-player");
       CurrentPigGame.player2.score += CurrentPigGame.turnScore;
       checkWinCondition(CurrentPigGame.currentPlayer);
       document.getElementById("p2ScoreLabel").textContent = CurrentPigGame.player2.score;
       CurrentPigGame.currentPlayer = CurrentPigGame.player1;
       break;
     default:
       break;
   }
}

function resetTurn (){
  CurrentPigGame.turnScore = 0;
  document.getElementById("currTurn").textContent = 0;
  CurrentPigGame.diceRoll = 0;
  document.getElementById("currRoll").textContent = 0;
}

function startNewGame() {
  resetTurn();
  var computerGameCheckbox = document.getElementById('computer-game-checkbox');
  var isComputerGame = computerGameCheckbox.checked;

  var userEnterWinScore = document.getElementById("integerInput").value;
  var userEnterWinScoreInt = parseInt(userEnterWinScore, 10);
  if (isNaN(userEnterWinScore)) {
      // If the input value is not a number or cannot be parsed as an integer, set the default to 100
      userEnterWinScore = 100;
  }
  CurrentPigGame = new PigGame();
  CurrentPigGame.player1 = new Player({name: 'Player 1', playerNum: 1, score: 0, isComputer: false});
  CurrentPigGame.player2 = new Player({name: isComputerGame ? 'Computer' : 'Player 2', playerNum: 2, score: 0, isComputer: isComputerGame});
  CurrentPigGame.currentPlayer = CurrentPigGame.player1;
  CurrentPigGame.winScore = userEnterWinScore;
  document.getElementById("player1").classList.add("active-player");
  resetTurn();
  // close the popup after game starts
  var overlay = document.getElementById('newgame-overlay');
  overlay.style.display = 'none';
}

function toggleActionButtonsDisable(toggle){
  document.getElementById('passButton').disabled = toggle;
  document.getElementById('rollButton').disabled = toggle;
}



// Function to show the overlay gradually increasing in size
function triggerWinOverlay (player) {
  document.getElementById("winnerText").textContent = player.name + " won! " + "The dice was rolled " + CurrentPigGame.totalRollsThisGame + " times" ;

  const overlay = document.getElementById("winOverlay");
  overlay.style.display = "flex";
  let scale = 0;
  const increment = 0.1;

  const increaseSize = () => {
    scale += increment;
    overlay.style.transform = `translate(-50%, -50%) scale(${scale})`;

    if (scale < 1) {
      setTimeout(increaseSize, 100);
    }
  };

  increaseSize();
}

function configureNewGame(){
    document.getElementById("winOverlay").style.display = "none";
    document.getElementById("newgame-overlay").style.display = "flex";
}

function howToPlayOverlay(){
  document.getElementById("help-overlay").style.display = "flex";
}
function closeHelpOverlay(){
  document.getElementById("help-overlay").style.display = "none";

}