"use strict";
// for cross browser
const ctx = new (window.AudioContext || window.webkitAudioContext)();

function Oscillator (frequency, detune) {
  this.osc = ctx.createOscillator();
  this.osc.type = 'sawtooth';
  this.osc.frequency.value = frequency;
  this.osc.detune.value = detune;
  this.osc.connect(ctx.destination);
  this.osc.start(0);
  this.osc.stop(3);
}

const osc1 = new Oscillator(440, 0);
const osc2 = new Oscillator(440, 10);
const osc3 = new Oscillator(440, 15);

// const osc = ctx.createOscillator();

// osc.connect(ctx.destination);

// osc.frequency.value = 200;

// osc.start(0);
// osc.stop(1);

// const frequencyRange = document.querySelector("input");

// frequencyRange.addEventListener("input", (event) => {
//   console.log(event);
//   console.log(event.target);
//   console.log("event.target.value:" + event.target.value);
//   osc.frequency.value = event.target.value;
// }
// )

document.getElementById("play-button").addEventListener("click", function () {
  
  if (ctx.state !== "running") {
    // console.log("it's not running well");
    // oscState = true;
    ctx.resume();
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  } else {
    // console.log("it's running");
    // oscState = false;
    ctx.suspend();
    // console.log(audioCtx.state);
    // audioCtx.onstatechange = () => console.log(audioCtx.state);
  }
});
