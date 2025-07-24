// ========== DOM ELEMENT REFERENCES ==========
const startButton = document.querySelector("#start_button");
const pauseButton = document.querySelector("#pause_button");
const resetButton = document.querySelector("#reset_button");
const timerDisplay = document.querySelector(".timer");
const timeInput = document.querySelector("#time_input");
const workoutSelect = document.querySelector("#workout_type");

// ========== GLOBAL VARIABLES ==========
let seconds = 0; // Current time in seconds
let lastKnownTime = 0; // Starting time for AMRAP workouts (for reset)
let isRunning = false; // Track if timer is currently active
let timerInterval; // Store interval ID for clearing

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
  clearInterval(timerInterval);
  isRunning = false;

  const workoutType = workoutSelect.value;
  if (workoutType === "amrap") {
    seconds = lastKnownTime; // Reset to original AMRAP time
  } else if (workoutType === "for_time") {
    seconds = 0; // Reset FOR TIME back to 00:00
  }

  updateDisplay();
});

// ========== INITIALIZATION ==========
// Set initial display
updateDisplay();
