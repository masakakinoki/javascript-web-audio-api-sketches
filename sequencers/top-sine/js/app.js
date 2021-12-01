"use strict";

// for cross browser
const AudioContext = window.AudioContext || window.webkitaudioCtx;
const audioCtx = new AudioContext();

let futureTickTime = audioCtx.currentTime;
let counter = 1;
let tempo = 120;
let secondsPerBeat = 60 / tempo;
let counterTimeValue = (secondsPerBeat / 4); // 16th note
let osc = audioCtx.createOscillator();
let topSineVolume = audioCtx.createGain();
topSineVolume.gain.value = 0.1;

function playTopSine(time, playing) {
  if (playing) {
    osc = audioCtx.createOscillator();
    osc.connect(topSineVolume);
    topSineVolume.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.value = 4000;
    // if (counter === 1) {
    //     osc.frequency.value = 500;
    // } else {
    //     osc.frequency.value = 300;
    // }
    if (counter === 1) {
      osc.start(time);
      osc.stop(time + 0.1);
    }
  }
}

const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

function playTick() {
  console.log("This 16th note is: " + counter);
  console.log("16th is: " + counterTimeValue);
  console.log("futureTickTime: " + futureTickTime);
  console.log("Web Audio Time: " + audioCtx.currentTime);
  counter += 1;
  futureTickTime += counterTimeValue;
  console.log("futureTickTime: " + futureTickTime);

  if (counter > 16) {
    counter = 1;
  }
}

function scheduler() {
  // console.log("scheduler now!");
  while (futureTickTime < audioCtx.currentTime + scheduleAheadTime) {
    playTopSine(futureTickTime, true);
    playTick();
  }
  window.setTimeout(scheduler, lookahead);
}

scheduler();

document.getElementById("play-button").addEventListener("click", function () {

  if (audioCtx.state !== "running") {
    console.log("it's not running well");
    audioCtx.resume();
  } else {
    console.log("it's running");
    audioCtx.suspend();
    console.log(audioCtx.state);
  }
});