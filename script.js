// ========== DOM ELEMENT REFERENCES ==========
const startButton = document.querySelector("#start_button");
const pauseButton = document.querySelector("#pause_button");
const resetButton = document.querySelector("#reset_button");
const timerDisplay = document.querySelector(".timer");
const timeInput = document.querySelector("#time_input");
const workoutSelect = document.querySelector("#workout_type");

// ========== GLOBAL VARIABLES ==========
let seconds = 600; // Current time in seconds
let lastKnownTime = 600; // Starting time for AMRAP workouts (for reset)
let isRunning = false; // Track if timer is currently active
let timerInterval; // Store interval ID for clearing
let currentRound = 1;
let maxRounds = 10;
let isWorkTime = true; //track if workinging (true) or resting (false)
let tabataRound = 1; //starting round 1

// ========== UTILITY FUNCTIONS ==========

/**
 * Updates the timer display with current seconds value
 * Formats time as MM:SS with proper zero padding
 */
function updateDisplay() {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Add leading zero to seconds if less than 10
  if (remainingSeconds < 10) {
    timerDisplay.textContent =
      minutes + ":" + remainingSeconds.toString().padStart(2, "0");
  } else {
    timerDisplay.textContent = minutes + ":" + remainingSeconds;
  }
}

function updateRoundDisplay() {
  const totalRounds = document.getElementById("emom_total_rounds").value;

  maxRounds = parseInt(totalRounds);

  document.getElementById("current_round").textContent = currentRound;
  document.getElementById("total_rounds").textContent = maxRounds;
}

function updateTabataDisplay() {
  document.getElementById("tabata_status").textContent = isWorkTime
    ? "WORK"
    : "REST";
  document.getElementById("tabata_round").textContent = tabataRound;
}

/**
 * Starts AMRAP countdown timer
 * Counts down from user-specified time to 00:00
 */
function startAmrapTimer() {
  timerInterval = setInterval(function () {
    seconds = seconds - 1;
    updateDisplay();

    // Stop when we reach zero
    if (seconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      alert("Time's up! Great workout!");
    }
  }, 1000);
}

/**
 * Starts FOR TIME stopwatch timer
 * Counts up from 00:00 until stopped
 */
function startForTimeTimer() {
  timerInterval = setInterval(function () {
    seconds = seconds + 1;
    updateDisplay();
  }, 1000);
}

/**
 * Starts EMOM stopwatch timer
 * Counts down from round length to 0 each time
 */
function startEMOMTimer(roundLength, totalRounds) {
  timerInterval = setInterval(function () {
    seconds = seconds - 1;
    updateDisplay();

    if (seconds <= 0) {
      currentRound++;
      updateRoundDisplay();
      if (currentRound > maxRounds) {
        //workout is finished
        clearInterval(timerInterval);
        isRunning = false;
        alert("EMOM Complete! ${maxRounds} rounds finished!");
      } else {
        //start next round - READ FRESH VALUE HERE
        const roundLength =
          parseInt(document.getElementById("emom_round_length").value) * 60;
        seconds = roundLength;
      }
    }
  }, 1000);
}

/**
 * Start Tabata stopwatch timer
 * Alternates between 20 seconds of work and 10 seconds of rest
 */
function startTabataTimer() {
  timerInterval = setInterval(function () {
    seconds = seconds - 1;
    updateDisplay();

    if (seconds <= 0) {
      if (isWorkTime) {
        // Work phase ended, start rest
        isWorkTime = false;
        seconds = 10; // Rest time
      } else {
        // Rest phase ended
        tabataRound++;
        if (tabataRound > 8) {
          // Workout complete
          clearInterval(timerInterval);
          isRunning = false;
          alert("Tabata Complete! Great workout!");
          return;
        } else {
          // Start next work phase
          isWorkTime = true;
          seconds = 20; // Work time
        }
      }
      updateTabataDisplay();
    }
  }, 1000);
}

/**
 * Reset the timer to the appropriate amount depending on the workout type
 */
function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  const workoutType = workoutSelect.value;
  if (workoutType == "amrap") {
    seconds = lastKnownTime;
  } else if (workoutType == "for_time") {
    seconds = 0;
  } else if (workoutType == "emom") {
    // Get current round length from input
    const roundLength =
      parseInt(document.getElementById("emom_round_length").value) * 60;
    seconds = roundLength;
    currentRound = 1;
    updateRoundDisplay(); // This will update maxRounds from input
  } else if (workoutType == "tabata") {
    seconds = 20;
    isWorkTime = true;
    tabataRound = 1;
    if (document.getElementById("tabata_status")) {
      updateTabataDisplay();
    }
  }

  updateDisplay();
}

// ========== EVENT LISTENERS ==========

/**
 * Start button handler
 * Determines workout type and starts appropriate timer
 */
startButton.addEventListener("click", function () {
  const inputValue = timeInput.value;
  const workoutType = workoutSelect.value;

  if (workoutType === "amrap") {
    // Only set new time if starting fresh (not resuming from pause)
    if (!isRunning && seconds === lastKnownTime) {
      // Use input value or default to 10 minutes
      let minutes =
        inputValue.trim() === "" || inputValue <= 0 ? 10 : inputValue;

      // Convert to seconds and save for reset functionality
      seconds = minutes * 60;
      lastKnownTime = seconds;
    }

    isRunning = true;
    clearInterval(timerInterval); // Clear any existing timer
    startAmrapTimer();
  } else if (workoutType === "for_time") {
    // Only reset to 0 if starting fresh (not resuming from pause)
    if (!isRunning && seconds === 0) {
      seconds = 0;
    }

    isRunning = true;
    clearInterval(timerInterval); // Clear any existing timer
    startForTimeTimer();
  } else if (workoutType == "emom") {
    const roundLength =
      parseInt(document.getElementById("emom_round_length").value) * 60;
    const totalRounds = parseInt(
      document.getElementById("emom_total_rounds").value
    );

    //set initial state
    if (!isRunning) {
      seconds = roundLength;
      currentRound = 1;
      maxRounds = totalRounds;
    }

    isRunning = true;
    clearInterval(timerInterval);
    startEMOMTimer();
  } else if (workoutType === "tabata") {
    if (!isRunning) {
      seconds = 20;
      isWorkTime = true;
      tabataRound = 1;
      updateTabataDisplay();
    }

    isRunning = true;
    clearInterval(timerInterval);
    startTabataTimer();
  }
});

/**
 * Pause button handler
 * Stops the timer but preserves current time
 */
pauseButton.addEventListener("click", function () {
  clearInterval(timerInterval);
  isRunning = false;
});

/**
 * Reset button handler
 * Stops timer and returns to starting time based on workout type
 */
resetButton.addEventListener("click", function () {
  resetTimer();
});

/**
 * Hide input features based on the type of workout selected
 */
workoutSelect.addEventListener("change", function () {
  resetTimer();
  const workoutType = workoutSelect.value;

  //grab elements to hide
  const amrapInput = document.querySelector("#amrap_input");
  const emomInput = document.querySelector("#emom_input");
  const tabataInput = document.querySelector("#tabata_input");

  //start with clean slate by hiding all inputs
  amrapInput.classList.add("hidden");
  emomInput.classList.add("hidden");
  tabataInput.classList.add("hidden");

  //add in correct inputs based on selected workout type
  if (workoutType == "amrap") {
    amrapInput.classList.remove("hidden");
  } else if (workoutType == "emom") {
    emomInput.classList.remove("hidden");
    currentRound = 1; //reset to round 1
    updateRoundDisplay();
  } else if (workoutType == "tabata") {
    tabataInput.classList.remove("hidden");
  }
});

/**
 * updating round length and total rounds when user provides new input
 */
document
  .getElementById("emom_round_length")
  .addEventListener("change", function () {
    updateRoundDisplay();

    // If timer is not running, update the timer display too
    if (!isRunning) {
      const roundLength = parseInt(this.value) * 60;
      seconds = roundLength;
      updateDisplay();
    }
  });

document
  .getElementById("emom_total_rounds")
  .addEventListener("change", function () {
    updateRoundDisplay();
  });

// ========== INITIALIZATION ==========
// Set initial display
updateDisplay();
