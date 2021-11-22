"use strict";
// for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let osc_1;
let osc_2;
let filter;
let oscState = false;
console.log(oscState);

// begin custom sound
function customSound(filterVal) {
  osc_1 = audioCtx.createOscillator();
  osc_2 = audioCtx.createOscillator();
  filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  osc_1.type = "sawtooth";
  osc_1.frequency.value = 30;
  osc_2.type = "sawtooth";
  osc_2.frequency.value = 40;
  filter.frequency.value = filterVal || filter.frequency.valu;
  osc_1.connect(filter);
  osc_2.connect(filter);
  filter.connect(audioCtx.destination);
  osc_1.start(audioCtx.currentTime);
  osc_2.start(audioCtx.currentTime);
  console.log(oscState);
}

// square wave
// function square(filterVal) {
//   let osc = audioCtx.createOscillator();
//   let filter = audioCtx.createBiquadFilter();
//   filter.type = "lowpass";
//   osc.type = "square";
//   osc.frequency.value = 400;
//   filter.frequency.value = filterVal || filter.getFrequencyResponse.value;
//   osc.connect(filter);
//   filter.connect(audioCtx.destination);
//   osc.start(audioCtx.currentTime);
// }

function effectsBox(sourceInput, filterParam) {
  sourceInput(filterParam);
}

effectsBox(customSound, 130);
console.log(audioCtx.state);

document.getElementById("play-button").addEventListener("click", function () {
  
  if (audioCtx.state !== "running") {
    console.log("it's not running well");
    // osc_1.connect(filter);
    // osc_2.connect(filter);
    oscState = true;
    audioCtx.resume();
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  } else {
    console.log("it's running");
    // osc_1.disconnect();
    // osc_2.disconnect();
    oscState = false;
    audioCtx.suspend();
    console.log(audioCtx.state);
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  }
});

// function touchStarted() {
//   console.log(audioCtx.state);
//   if (audioCtx.state !== "running") {
//     audioCtx.resume();
//   }
// }