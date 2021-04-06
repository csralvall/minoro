const countdownTimer = (function() {
  // Initally, no time has passed
  let timeLimit = null
  let timeLeft = 0;
  // Interval ID of setInterval
  let timerInterval = null;
  let timePassed = 0;
  let status = 0; // status: 0 = idle, 1 = running, 2 = pause;

  const getTimeLeft = () => timeLeft;

  const getTimeLimit = () => timeLimit;

  const setTimer = (time) => {
    timeLimit = time * 60;
    timeLeft = timeLimit;
  }

  const stopTimer = () => {
    clearInterval(timerInterval);
    timePassed = 0;
    status = 0;
  }

  const pauseTimer = () => {
    clearInterval(timerInterval);
    status = 2;
  }

  const startTimer = (callback, ...args) => {
    if (status != 1) {
      status = 1;
      timerInterval = setInterval(() => {
        // The amount of time passed increments by one
        timePassed += 1;
        timeLeft = timeLimit - timePassed;

        // execute animation or whatever function
        callback(...args);

        if(timeLeft == 0) {
          stopTimer();
        }
      }, 1000);
    }
  }

  const formatTimer = (time) => {
    // The largest round integer less than or equal to time divided by 3600.
    let hours = Math.floor(time / 3600);

    // The largest round integer less than or equal to time divided by 60.
    let minutes = Math.floor((time - 3600*hours) / 60);

    // Seconds are the remainder of the time divided by 60.
    let seconds = time % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    hours = hours < 10 ? "0" + hours : hours;

    let displayedTime = `${minutes}:${seconds}`;
    displayedTime = +hours > 0 ? `${hours}:` + displayedTime : displayedTime;

    // The output in HH:MM:SS format if HH is present, MM:SS otherwise
    return displayedTime;
  }

  return {
    getTimeLimit,
    getTimeLeft,
    setTimer,
    stopTimer,
    pauseTimer,
    startTimer,
    formatTimer,
  }
})();

const roundTimer = (function() {
  // privates
  // Warning occurs at 10s
  const WARNING_THRESHOLD = 10;
  // Alert occurs at 5s
  const ALERT_THRESHOLD = 5;

  const COLOR_CODES = {
    info: {
      color: "green",
    },
    warning: {
      color: "orange",
      threshold: WARNING_THRESHOLD,
    },
    alert: {
      color: "red",
      threshold: ALERT_THRESHOLD,
    },
  };

  const timer = countdownTimer;

  function set(time) {
    timer.setTimer(time);
    const timeLeft = timer.getTimeLeft();
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    document
      .getElementById("base-timer-label")
      .innerHTML = timer.formatTimer(timeLeft);
  }

  function stop() {
    timer.stopTimer()
  }

  function pause() {
    timer.pauseTimer();
  }

  function start() {
    timer.startTimer(updateAnimation, timer.getTimeLeft);
  }

  function updateAnimation(timeSource) {
      // The time left label is updated
      document
        .getElementById("base-timer-label")
        .innerHTML = timer.formatTimer(timeSource());
      // Update circle dasharray
      setCircleDasharray();
      // Update circle color
      setRemainingPathColor(timeSource());
  }

  // Divides time left by the defined time limit.
  function calculateTimeFraction(timeLeft, timeLimit) {
    const rawTimeFraction = timeLeft / timeLimit;
    return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
  }

  // Update the dasharray value as time passes, starting with 283
  function setCircleDasharray() {
    const circleDasharray = `${(
      calculateTimeFraction(
        timer.getTimeLeft(), timer.getTimeLimit()
      ) * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
  }

  function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;

    // if remaining time is 0 => reset
    if (timeLeft == 0) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(alert.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(info.color);
    // if remaining time is less than or equal to 5 => ALERT
    } else if (timeLeft <= alert.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(warning.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(alert.color);
    // if remaining time is less than or equal to 10 => WARNING
    } else if (timeLeft <= warning.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(info.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(warning.color);
    }
  }

  return {
    set,
    start,
    stop,
    pause,
  }
})();

const FULL_DASH_ARRAY = 283;

let remainingPathColor = "green";

document.getElementById("countdown-container").innerHTML = `
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45, 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">
    00:00
  </span>
`

const timer = roundTimer;

const startButton = document.querySelector("#start-button"),
      resetButton = document.querySelector("#reset-button"),
      stopButton = document.querySelector("#stop-button");

timer.set(0.1);
startButton.addEventListener("click", (evt) => {
  timer.start();
});

// If the reset button is clicked, then render back to start and begin again
resetButton.addEventListener("click", (evt) => {
  timer.stop();
  timer.set(0.1);
  timer.start();
});

// If the cancel button is clicked, then render back to start
stopButton.addEventListener("click", (evt) => {
  timer.pause();
});

